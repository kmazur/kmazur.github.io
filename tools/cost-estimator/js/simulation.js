import {
  AUTO_COMPACT_THRESHOLD,
  EFFORT_LEVELS,
  INTEGER_SLIDER_KEYS,
  MODELS,
  MODEL_ORDER,
  PRESETS,
  PROVIDERS,
  SESSION_MIX,
  SLIDER_RANGES,
  TASK_PROFILES,
  TOOL_CALL_OVERHEAD,
  TOOL_MIX_OPTIONS,
  UNCERTAINTY_OPTIONS,
} from './constants.js';
import { config } from './state.js';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundInt(value, min = 0) {
  return Math.max(min, Math.round(value));
}

export function getModel(modelId = config.model) {
  return MODELS[modelId] || MODELS['claude-sonnet-4.6'];
}

export function getProvider(providerId) {
  return PROVIDERS[providerId] || PROVIDERS.anthropic;
}

export function getCacheTTLMinutes(ttl) {
  return ttl === '1h' ? 60 : 5;
}

function getCacheTTLHours(ttl) {
  return getCacheTTLMinutes(ttl) / 60;
}

function getEffortProfile(effort = 'deep') {
  return EFFORT_LEVELS[effort] || EFFORT_LEVELS.deep;
}

function getTaskPerformance(model, taskKey) {
  return model.performance?.[taskKey] || model.performance?.feature || {
    turns: 1,
    retry: 1,
    success: 0.95,
    timeSaved: 1,
    latency: 1,
    toolRounds: 1,
    thinking: 1,
    response: 1,
  };
}

function getMinCacheableTokens(model) {
  return Number.isFinite(model.minCacheable) ? model.minCacheable : 0;
}

function getReasoningSettings(model, effortKey, baseThinkingTokens) {
  const mode = model.reasoningMode;
  const profiles = {
    'anthropic-effort': {
      labels: { lean: 'low', balanced: 'medium', deep: 'high', max: 'max' },
      multipliers: { lean: 0.25, balanced: 0.6, deep: 1, max: 1.35 },
      floors: { lean: 0, balanced: 0, deep: 0, max: 0 },
    },
    'manual-thinking': {
      labels: { lean: 'disabled', balanced: 'manual budget', deep: 'manual budget', max: 'manual budget' },
      multipliers: { lean: 0, balanced: 0.55, deep: 1, max: 1.25 },
      floors: { lean: 0, balanced: 0, deep: 0, max: 0 },
    },
    'openai-effort': {
      labels: { lean: 'none', balanced: 'medium', deep: 'high', max: 'xhigh' },
      multipliers: { lean: 0, balanced: 0.65, deep: 1, max: 1.35 },
      floors: { lean: 0, balanced: 0, deep: 0, max: 0 },
    },
    'thinking-budget-required': {
      labels: { lean: 'low budget', balanced: 'dynamic', deep: 'high budget', max: 'max budget' },
      multipliers: { lean: 0.45, balanced: 0.75, deep: 1, max: 1.25 },
      floors: { lean: 512, balanced: 1024, deep: 1024, max: 2048 },
    },
    'thinking-budget': {
      labels: { lean: '0 budget', balanced: 'dynamic', deep: 'high budget', max: 'max budget' },
      multipliers: { lean: 0, balanced: 0.65, deep: 1, max: 1.2 },
      floors: { lean: 0, balanced: 0, deep: 512, max: 1024 },
    },
    'thinking-budget-optional': {
      labels: { lean: '0 budget', balanced: 'small budget', deep: 'high budget', max: 'dynamic' },
      multipliers: { lean: 0, balanced: 0.3, deep: 0.75, max: 1 },
      floors: { lean: 0, balanced: 512, deep: 1024, max: 0 },
    },
  };
  const profile = profiles[mode] || profiles['anthropic-effort'];
  const multiplier = profile.multipliers[effortKey] ?? profile.multipliers.deep ?? 1;
  const floor = profile.floors[effortKey] ?? 0;
  let tokens = roundInt((baseThinkingTokens || 0) * multiplier, 0);
  if (baseThinkingTokens > 0 && floor > 0 && tokens > 0) tokens = Math.max(tokens, floor);

  return {
    tokens,
    label: `${model.reasoningApiLabel}: ${profile.labels[effortKey] || model.effortApiDefault}`,
  };
}

function getCallPricing(model, cacheTTL, inputTokens) {
  const overLongContext = !!model.longContextThreshold && inputTokens > model.longContextThreshold;
  const inputMultiplier = overLongContext ? (model.longContextInputMultiplier || 1) : 1;
  const outputMultiplier = overLongContext ? (model.longContextOutputMultiplier || 1) : 1;
  const cacheMultiplier = overLongContext ? (model.longContextCacheMultiplier || inputMultiplier) : 1;
  const storageMultiplier = overLongContext ? (model.longContextStorageMultiplier || 1) : 1;

  return {
    inputPrice: model.input * inputMultiplier,
    outputPrice: model.output * outputMultiplier,
    cachedInputPrice: (model.cachedInput ?? model.input) * cacheMultiplier,
    cacheWritePrice: cacheTTL === '1h' ? (model.cache1h || model.input) * cacheMultiplier : (model.cache5m || model.input) * cacheMultiplier,
    cacheStoragePerHour: (model.cacheStoragePerHour || 0) * storageMultiplier,
  };
}

function buildThinkingPlan(totalThink, nCalls) {
  if (nCalls <= 1) return [totalThink];
  const perCall = Math.floor(totalThink / nCalls);
  const plan = Array(nCalls).fill(perCall);
  plan[nCalls - 1] += totalThink - (perCall * nCalls);
  return plan;
}

function costOneCall(inputTok, outputTok, thinkTok, cfg, model, warm, cachedPrefix, noCache) {
  const R = 1e6;
  const provider = getProvider(model.provider);
  const prices = getCallPricing(model, cfg.cacheTTL, inputTok);
  let cr = 0;
  let cw = 0;
  let un = 0;
  const minCacheable = getMinCacheableTokens(model);
  const cacheEligible = minCacheable <= 0 || inputTok >= minCacheable;

  if (noCache || !cacheEligible) {
    un = inputTok;
  } else if (provider.cacheStrategy === 'write-read') {
    if (warm && cachedPrefix > 0) {
      cr = Math.min(cachedPrefix, inputTok);
      cw = Math.max(0, inputTok - cachedPrefix);
    } else {
      cw = inputTok;
    }
  } else {
    if (warm && cachedPrefix > 0) {
      cr = Math.min(cachedPrefix, inputTok);
      un = Math.max(0, inputTok - cachedPrefix);
      if (provider.cacheStrategy === 'explicit-cache') {
        cw = Math.max(0, inputTok - cachedPrefix);
      }
    } else {
      un = inputTok;
      if (provider.cacheStrategy === 'explicit-cache') {
        cw = inputTok;
      }
    }
  }

  const storageCost = provider.cacheStrategy === 'explicit-cache' && cw > 0
    ? cw * prices.cacheStoragePerHour * getCacheTTLHours(cfg.cacheTTL) / R
    : 0;
  const cacheSetupCost = provider.cacheStrategy === 'explicit-cache'
    ? storageCost
    : cw * prices.cacheWritePrice / R + storageCost;

  return {
    cr,
    cw,
    un,
    out: outputTok,
    think: thinkTok,
    cacheEligible,
    crCost: cr * prices.cachedInputPrice / R,
    cwCost: cacheSetupCost,
    unCost: un * prices.inputPrice / R,
    outCost: outputTok * prices.outputPrice / R,
    thCost: thinkTok * prices.outputPrice / R,
    storageCost,
  };
}

function getInterruptedCfg(cfg) {
  const turns = Math.max(0, Math.round(cfg.turns || 0));
  const extraDrops = Math.min(Math.max(0, Math.round(cfg.interruptions || 0)), Math.max(turns - 1, 0));
  return {
    ...cfg,
    cacheDrops: Math.min(Math.max(turns - 1, 0), Math.round(cfg.cacheDrops || 0) + extraDrops),
  };
}

function getWorkflowMultiplier(cfg) {
  return (1 + (cfg.retryRate || 0) / 100) * (1 + (cfg.parallelAgents || 0) * (cfg.parallelAgentCostRatio || 0));
}

export function buildScenario(cfg, modelId = cfg.model, taskKey = cfg.taskProfile || 'feature') {
  const model = getModel(modelId);
  const provider = getProvider(model.provider);
  const sourceProvider = getProvider(cfg.provider || model.provider);
  const effortKey = cfg.effort || model.defaultEffort;
  const effort = getEffortProfile(effortKey);
  const taskPerf = getTaskPerformance(model, taskKey);
  const reasoning = getReasoningSettings(model, effortKey, (cfg.thinkingTokens || 0) * taskPerf.thinking);
  const backgroundUsesProviderDefault = !Number.isFinite(cfg.backgroundCost)
    || Math.abs((cfg.backgroundCost || 0) - sourceProvider.defaultBackgroundCost) < 1e-9;

  const adjustedCfg = {
    ...cfg,
    provider: model.provider,
    model: model.id,
    contextWindow: Math.min(cfg.contextWindow, model.maxContext),
    turns: roundInt((cfg.turns || 0) * taskPerf.turns, 1),
    responseTokens: roundInt((cfg.responseTokens || 0) * taskPerf.response * effort.responseMultiplier, 0),
    thinkingTokens: reasoning.tokens,
    toolRounds: roundInt((cfg.toolRounds || 0) * taskPerf.toolRounds * effort.toolMultiplier, 0),
    toolResult: roundInt(cfg.toolResult || 0, 0),
    autoCompact: !!cfg.autoCompact && !!model.autoCompact,
    backgroundCost: backgroundUsesProviderDefault ? provider.defaultBackgroundCost : cfg.backgroundCost,
    webSearches: model.searchSupported ? roundInt(cfg.webSearches || 0, 0) : 0,
    execSessions: model.execFeeSupported ? roundInt(cfg.execSessions || 0, 0) : 0,
    retryRate: Math.max(0, (cfg.retryRate || 0) * taskPerf.retry * effort.retryMultiplier),
    timeSavedMins: Math.max(0, (cfg.timeSavedMins || 0) * taskPerf.timeSaved * effort.timeSavedMultiplier),
    _scenarioApplied: true,
  };

  const baseDuration = adjustedCfg.turns * Math.max(0.1, cfg.timeBetween || 0);
  const timeToOutcomeMins = baseDuration * taskPerf.latency * effort.latencyMultiplier * (1 + adjustedCfg.retryRate / 100);
  const successRate = clamp(taskPerf.success * effort.successMultiplier, 0.55, 0.995);

  return {
    model,
    provider,
    effort,
    taskKey,
    adjustedCfg,
    successRate,
    timeToOutcomeMins,
    effortApiLabel: reasoning.label,
  };
}

function simulateAdjusted(cfg, model) {
  const ttlMin = getCacheTTLMinutes(cfg.cacheTTL);
  const ctxLimit = Math.min(cfg.contextWindow, model.maxContext);
  const noCache = !!cfg._noCache;

  const dropSet = new Set();
  if (!noCache && cfg.cacheDrops > 0 && cfg.turns > 1) {
    const spacing = cfg.turns / (cfg.cacheDrops + 1);
    for (let i = 1; i <= cfg.cacheDrops; i++) dropSet.add(Math.round(i * spacing));
  }
  const compSet = new Set();
  if (cfg.compactions > 0 && cfg.turns > 1) {
    const spacing = cfg.turns / (cfg.compactions + 1);
    for (let i = 1; i <= cfg.compactions; i++) compSet.add(Math.round(i * spacing));
  }

  let ctx = cfg.sysPrompt;
  let warm = false;
  let cached = 0;
  const T = {
    cost: 0,
    crCost: 0,
    cwCost: 0,
    unCost: 0,
    outCost: 0,
    thCost: 0,
    compCost: 0,
    backgroundCost: 0,
    webCost: 0,
    execCost: 0,
    crTok: 0,
    cwTok: 0,
    unTok: 0,
    outTok: 0,
    thTok: 0,
    apiCalls: 0,
  };
  const turns = [];

  for (let t = 0; t < cfg.turns; t++) {
    const isDrop = !noCache && (dropSet.has(t) || cfg.timeBetween >= ttlMin);
    const wasWarm = warm;
    if (isDrop) {
      warm = false;
      cached = 0;
    }

    const turnInput = ctx + cfg.userMsg;
    const needComp = compSet.has(t) || (cfg.autoCompact && turnInput >= ctxLimit * AUTO_COMPACT_THRESHOLD);
    let compCost = 0;
    let compDetail = null;
    if (needComp) {
      const summaryTokens = Math.floor(ctx * cfg.compactRatio);
      const c = costOneCall(ctx, summaryTokens, 0, cfg, model, warm, cached, noCache);
      compCost = c.crCost + c.cwCost + c.unCost + c.outCost;
      compDetail = { inputTokens: ctx, outputTokens: summaryTokens, ...c, totalCost: compCost };
      T.compCost += compCost;
      T.cost += compCost;
      T.apiCalls++;
      ctx = cfg.sysPrompt + summaryTokens;
      warm = false;
      cached = 0;
    }

    const nCalls = 1 + cfg.toolRounds;
    const thinkingPlan = buildThinkingPlan(cfg.thinkingTokens, nCalls);
    let curIn = ctx + cfg.userMsg;
    let tCR = 0;
    let tCW = 0;
    let tUN = 0;
    let tOut = 0;
    let tTh = 0;
    let tCRc = 0;
    let tCWc = 0;
    let tUNc = 0;
    let tOc = 0;
    let tThc = 0;
    const callDetails = [];

    for (let a = 0; a < nCalls; a++) {
      const last = a === nCalls - 1;
      const outTok = last ? cfg.responseTokens : TOOL_CALL_OVERHEAD;
      const thinkTok = thinkingPlan[a] || 0;
      const c = costOneCall(curIn, outTok, thinkTok, cfg, model, warm, cached, noCache);

      callDetails.push({
        callIndex: a,
        isLast: last,
        inputTokens: curIn,
        outputTokens: outTok,
        thinkingTokens: thinkTok,
        warm,
        cachedPrefix: cached,
        ...c,
        totalCost: c.crCost + c.cwCost + c.unCost + c.outCost + c.thCost,
      });

      tCR += c.cr;
      tCW += c.cw;
      tUN += c.un;
      tOut += outTok;
      tTh += thinkTok;
      tCRc += c.crCost;
      tCWc += c.cwCost;
      tUNc += c.unCost;
      tOc += c.outCost;
      tThc += c.thCost;

      if (!noCache && c.cacheEligible) {
        cached = curIn;
        warm = true;
      } else if (!noCache) {
        cached = 0;
        warm = false;
      }
      if (!last) curIn += outTok + thinkTok + cfg.toolResult;
    }

    T.apiCalls += nCalls;
    const turnApiCost = tCRc + tCWc + tUNc + tOc + tThc;
    T.crCost += tCRc;
    T.cwCost += tCWc;
    T.unCost += tUNc;
    T.outCost += tOc;
    T.thCost += tThc;
    T.cost += turnApiCost;
    T.crTok += tCR;
    T.cwTok += tCW;
    T.unTok += tUN;
    T.outTok += tOut;
    T.thTok += tTh;

    ctx += cfg.userMsg + cfg.toolRounds * (TOOL_CALL_OVERHEAD + cfg.toolResult) + cfg.responseTokens;

    turns.push({
      turn: t,
      contextSize: ctx,
      turnCost: turnApiCost + compCost,
      cumulativeCost: T.cost,
      compaction: needComp,
      cacheDrop: isDrop,
      warmAtStart: wasWarm && !isDrop,
      crCost: tCRc,
      cwCost: tCWc,
      unCost: tUNc,
      outCost: tOc,
      thCost: tThc,
      compCost,
      apiCalls: callDetails,
      compDetail,
      nCalls,
    });
  }

  const provider = getProvider(model.provider);
  T.backgroundCost = Math.max(0, Number(cfg.backgroundCost) || 0);
  T.webCost = model.searchSupported ? Math.max(0, Number(cfg.webSearches) || 0) * provider.webSearchCost : 0;
  T.execCost = model.execFeeSupported ? Math.max(0, Number(cfg.execSessions) || 0) * provider.execSessionCost : 0;
  T.cost += T.backgroundCost + T.webCost + T.execCost;

  return { T, turns };
}

export function simulate(cfg, modelId = cfg.model, taskKey = cfg.taskProfile || 'feature') {
  const scenario = cfg._scenarioApplied ? {
    model: getModel(modelId),
    adjustedCfg: cfg,
    successRate: 0.95,
    timeToOutcomeMins: cfg.turns * cfg.timeBetween,
    effortApiLabel: '',
  } : buildScenario(cfg, modelId, taskKey);
  const res = simulateAdjusted(scenario.adjustedCfg, scenario.model);
  return { ...res, scenario };
}

export function simulateNoCacheCost(cfg, modelId = cfg.model, taskKey = cfg.taskProfile || 'feature') {
  const scenario = buildScenario(cfg, modelId, taskKey);
  return simulateAdjusted({ ...scenario.adjustedCfg, _noCache: true }, scenario.model).T.cost;
}

function getRangeFactors(cfg) {
  const uncertainty = UNCERTAINTY_OPTIONS[cfg.uncertainty] || UNCERTAINTY_OPTIONS.med;
  const toolMix = TOOL_MIX_OPTIONS[cfg.toolMix] || TOOL_MIX_OPTIONS.balanced;
  const retryLift = Math.min(0.18, (cfg.retryRate || 0) / 250);
  const interruptionLift = Math.min(0.08, (cfg.interruptions || 0) * 0.0125);
  const helperLift = Math.min(0.12, (cfg.parallelAgents || 0) * 0.025);
  return {
    lean: uncertainty.rangeDown * toolMix.rangeDown,
    heavy: uncertainty.rangeUp * toolMix.rangeUp * (1 + retryLift + interruptionLift + helperLift),
    uncertainty,
    toolMix,
  };
}

function computePlanningForTask(cfg, modelId = cfg.model, taskKey = cfg.taskProfile || 'feature') {
  const scenario = buildScenario(cfg, modelId, taskKey);
  const baseRes = simulateAdjusted(scenario.adjustedCfg, scenario.model);
  const interruptedCfg = getInterruptedCfg(scenario.adjustedCfg);
  const interruptedRes = simulateAdjusted(interruptedCfg, scenario.model);

  const effectiveSession = interruptedRes.T.cost * getWorkflowMultiplier(interruptedCfg);
  const laborValue = (cfg.hourlyRate || 0) * ((scenario.adjustedCfg.timeSavedMins || 0) / 60) * scenario.successRate;
  const breakEvenMins = (cfg.hourlyRate || 0) > 0 ? (effectiveSession / cfg.hourlyRate) * 60 : 0;
  const timeToGoodOutcomeMins = scenario.timeToOutcomeMins / scenario.successRate;

  return {
    model: scenario.model,
    provider: scenario.provider,
    taskKey,
    adjustedCfg: scenario.adjustedCfg,
    baseSession: baseRes.T.cost,
    interruptedSession: interruptedRes.T.cost,
    effectiveSession,
    successRate: scenario.successRate,
    costPerSuccessfulOutcome: effectiveSession / scenario.successRate,
    perSessionLaborValue: laborValue,
    breakEvenMins,
    timeToOutcomeMins: scenario.timeToOutcomeMins,
    timeToGoodOutcomeMins,
    netValuePerSession: laborValue - effectiveSession,
    marginalTurnCost: scenario.adjustedCfg.turns < 200
      ? simulateAdjusted({ ...scenario.adjustedCfg, turns: Math.round(scenario.adjustedCfg.turns) + 1 }, scenario.model).T.cost - baseRes.T.cost
      : 0,
    cacheMissCost: scenario.adjustedCfg.turns > 1
      ? simulateAdjusted({
        ...scenario.adjustedCfg,
        cacheDrops: Math.min(Math.round(scenario.adjustedCfg.turns) - 1, Math.round(scenario.adjustedCfg.cacheDrops || 0) + 1),
      }, scenario.model).T.cost - baseRes.T.cost
      : 0,
    effortApiLabel: scenario.effortApiLabel,
    raw: baseRes,
    interrupted: interruptedRes,
  };
}

function getMixEntries(cfg, modelId = cfg.model) {
  return SESSION_MIX.map(meta => {
    const weight = Math.max(0, Math.round(cfg[meta.key] || 0));
    const planning = computePlanningForTask({ ...cfg, ...PRESETS[meta.preset] }, modelId, meta.preset);
    return {
      ...meta,
      weight,
      cost: planning.effectiveSession,
      successRate: planning.successRate,
      timeToGoodOutcomeMins: planning.timeToGoodOutcomeMins,
      planning,
    };
  });
}

export function computePlanning(cfg, modelId = cfg.model, taskKey = cfg.taskProfile || 'feature') {
  const current = computePlanningForTask(cfg, modelId, taskKey);
  const mixEntries = getMixEntries(cfg, modelId);
  const totalWeight = mixEntries.reduce((sum, entry) => sum + entry.weight, 0);
  const blendedSession = totalWeight > 0
    ? mixEntries.reduce((sum, entry) => sum + entry.cost * entry.weight, 0) / totalWeight
    : current.effectiveSession;
  const blendedSuccessRate = totalWeight > 0
    ? mixEntries.reduce((sum, entry) => sum + entry.successRate * entry.weight, 0) / totalWeight
    : current.successRate;
  const blendedTimeToGoodOutcomeMins = totalWeight > 0
    ? mixEntries.reduce((sum, entry) => sum + entry.timeToGoodOutcomeMins * entry.weight, 0) / totalWeight
    : current.timeToGoodOutcomeMins;
  const blendedLaborValue = totalWeight > 0
    ? mixEntries.reduce((sum, entry) => sum + entry.planning.perSessionLaborValue * entry.weight, 0) / totalWeight
    : current.perSessionLaborValue;

  const sessionsPerMonth = (cfg.sessPerDay || 0) * (cfg.workdaysPerMonth || 0);
  const monthlyCurrent = current.effectiveSession * sessionsPerMonth;
  const monthlyBlended = blendedSession * sessionsPerMonth;
  const monthlyLaborValue = blendedLaborValue * sessionsPerMonth;
  const monthlyNetValue = monthlyLaborValue - monthlyBlended;

  const rangeFactors = getRangeFactors(cfg);
  const monthlyLean = monthlyBlended * rangeFactors.lean;
  const monthlyHeavy = monthlyBlended * rangeFactors.heavy;

  const budget = cfg.monthlyBudget || 0;
  const safeSessionsPerDay = blendedSession > 0 && (cfg.workdaysPerMonth || 0) > 0
    ? budget / (blendedSession * cfg.workdaysPerMonth)
    : 0;
  const sessionsWithinBudget = blendedSession > 0 ? Math.floor(budget / blendedSession) : 0;

  const dominantMix = [...mixEntries].sort((a, b) => b.weight - a.weight)[0] || null;

  const allComparisons = MODEL_ORDER.map(otherModelId => {
    const other = computePlanningForTask(cfg, otherModelId, taskKey);
    return {
      modelId: otherModelId,
      provider: other.provider,
      model: other.model,
      effectiveSession: other.effectiveSession,
      rawSession: other.baseSession,
      costPerSuccessfulOutcome: other.costPerSuccessfulOutcome,
      successRate: other.successRate,
      timeToGoodOutcomeMins: other.timeToGoodOutcomeMins,
      perSessionLaborValue: other.perSessionLaborValue,
      netValuePerSession: other.netValuePerSession,
    };
  });

  const bestRaw = [...allComparisons].sort((a, b) => a.rawSession - b.rawSession)[0];
  const bestOutcome = [...allComparisons].sort((a, b) => a.costPerSuccessfulOutcome - b.costPerSuccessfulOutcome)[0];
  const bestValue = [...allComparisons].sort((a, b) => b.netValuePerSession - a.netValuePerSession)[0];
  const fastest = [...allComparisons].sort((a, b) => a.timeToGoodOutcomeMins - b.timeToGoodOutcomeMins)[0];

  return {
    ...current,
    blendedSession,
    blendedSuccessRate,
    blendedTimeToGoodOutcomeMins,
    sessionsPerMonth,
    monthlyCurrent,
    monthlyBlended,
    monthlyLaborValue,
    monthlyNetValue,
    monthlyLean,
    monthlyHeavy,
    safeSessionsPerDay,
    sessionsWithinBudget,
    budgetUtilization: budget > 0 ? monthlyBlended / budget : 0,
    costPctOfLabor: current.perSessionLaborValue > 0 ? (current.effectiveSession / current.perSessionLaborValue) * 100 : null,
    mixEntries,
    dominantMix,
    toolMix: rangeFactors.toolMix,
    uncertainty: rangeFactors.uncertainty,
    directWebSearchCost: current.model.searchSupported ? getProvider(current.model.provider).webSearchCost : 0,
    directExecSessionCost: current.model.execFeeSupported ? getProvider(current.model.provider).execSessionCost : 0,
    comparisonRows: allComparisons,
    bestRaw,
    bestOutcome,
    bestValue,
    fastest,
    presetBudgetView: SESSION_MIX.map(meta => {
      const monthly = computePlanningForTask({ ...cfg, ...PRESETS[meta.preset] }, modelId, meta.preset).effectiveSession * sessionsPerMonth;
      return { label: meta.label, monthly, fits: budget > 0 ? monthly <= budget : false };
    }).sort((a, b) => a.monthly - b.monthly),
  };
}

function normalizeSensitivityValue(key, value, range) {
  const bounded = Math.max(range.min, Math.min(range.max, value));
  return INTEGER_SLIDER_KEYS.has(key) ? Math.round(bounded) : bounded;
}

export function computeSensitivity() {
  const base = computePlanning(config).effectiveSession;
  if (base === 0) return {};
  const results = {};
  for (const [key, { min, max }] of Object.entries(SLIDER_RANGES)) {
    const delta = (max - min) * 0.1;
    const range = { min, max };
    const up = { ...config, [key]: normalizeSensitivityValue(key, config[key] + delta, range) };
    const dn = { ...config, [key]: normalizeSensitivityValue(key, config[key] - delta, range) };
    const costUp = computePlanning(up).effectiveSession;
    const costDn = computePlanning(dn).effectiveSession;
    results[key] = Math.abs(costUp - costDn) / base;
  }
  return results;
}
