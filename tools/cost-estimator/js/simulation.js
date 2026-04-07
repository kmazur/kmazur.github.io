import {
  INTEGER_SLIDER_KEYS,
  MODELS,
  AUTO_COMPACT_THRESHOLD,
  PRESETS,
  SESSION_MIX,
  TOOL_CALL_OVERHEAD,
  TOOL_MIX_OPTIONS,
  UNCERTAINTY_OPTIONS,
  WEB_SEARCH_COST_PER_REQUEST,
  SLIDER_RANGES,
} from './constants.js';
import { config } from './state.js';

function getCacheWritePrice(m, ttl) {
  return ttl === '1h' ? m.cache1h : m.cache5m;
}

export function getCacheTTLMinutes(ttl) {
  return ttl === '1h' ? 60 : 5;
}

function buildThinkingPlan(totalThink, nCalls) {
  if (nCalls <= 1) return [totalThink];
  const perCall = Math.floor(totalThink / nCalls);
  const plan = Array(nCalls).fill(perCall);
  plan[nCalls - 1] += totalThink - (perCall * nCalls);
  return plan;
}

function costOneCall(inputTok, outputTok, thinkTok, model, cwPrice, warm, cachedPrefix, noCache) {
  const R = 1e6;
  let cr = 0, cw = 0, un = 0;
  const canCache = inputTok >= model.minCacheable;
  if (noCache) {
    // No caching at all: pay full base input rate
    un = inputTok;
  } else if (!canCache) {
    // Anthropic silently skips caching for prompts below the per-model minimum.
    un = inputTok;
  } else if (warm && cachedPrefix > 0) {
    // Cache hit: read cached prefix, write new tokens into cache
    cr = Math.min(cachedPrefix, inputTok);
    cw = Math.max(0, inputTok - cachedPrefix);
  } else {
    // Cold start: entire input written to cache for future reads
    cw = inputTok;
  }
  return {
    cr, cw, un, out: outputTok, think: thinkTok, cacheEligible: canCache,
    crCost: cr * model.cacheRead / R,
    cwCost: cw * cwPrice / R,
    unCost: un * model.input / R,
    // Thinking tokens are billed at the output rate per Anthropic pricing
    outCost: outputTok * model.output / R,
    thCost: thinkTok * model.output / R,
  };
}

export function simulate(cfg, modelOverride) {
  const m = MODELS[modelOverride || cfg.model];
  const cwPrice = getCacheWritePrice(m, cfg.cacheTTL);
  const ttlMin = getCacheTTLMinutes(cfg.cacheTTL);
  const ctxLimit = Math.min(cfg.contextWindow, m.maxContext);
  const noCache = !!cfg._noCache;

  const dropSet = new Set();
  if (!noCache && cfg.cacheDrops > 0 && cfg.turns > 1) {
    const sp = cfg.turns / (cfg.cacheDrops + 1);
    for (let i = 1; i <= cfg.cacheDrops; i++) dropSet.add(Math.round(i * sp));
  }
  const compSet = new Set();
  if (cfg.compactions > 0 && cfg.turns > 1) {
    const sp = cfg.turns / (cfg.compactions + 1);
    for (let i = 1; i <= cfg.compactions; i++) compSet.add(Math.round(i * sp));
  }

  let ctx = cfg.sysPrompt, warm = false, cached = 0;
  const T = {
    cost: 0, crCost: 0, cwCost: 0, unCost: 0, outCost: 0, thCost: 0, compCost: 0,
    backgroundCost: 0, webCost: 0,
    crTok: 0, cwTok: 0, unTok: 0, outTok: 0, thTok: 0, apiCalls: 0,
  };
  const turns = [];

  for (let t = 0; t < cfg.turns; t++) {
    const isDrop = !noCache && (dropSet.has(t) || cfg.timeBetween >= ttlMin);
    const wasWarm = warm;
    if (isDrop) { warm = false; cached = 0; }

    const turnInput = ctx + cfg.userMsg;
    const needComp = compSet.has(t) || (cfg.autoCompact && turnInput >= ctxLimit * AUTO_COMPACT_THRESHOLD);
    let compCost = 0, compDetail = null;
    if (needComp) {
      const summ = Math.floor(ctx * cfg.compactRatio);
      const c = costOneCall(ctx, summ, 0, m, cwPrice, warm, cached, noCache);
      compCost = c.crCost + c.cwCost + c.unCost + c.outCost;
      compDetail = { inputTokens: ctx, outputTokens: summ, ...c, totalCost: compCost };
      T.compCost += compCost; T.cost += compCost; T.apiCalls++;
      ctx = cfg.sysPrompt + summ;
      warm = false; cached = 0;
    }

    const nCalls = 1 + cfg.toolRounds;
    const thinkingPlan = buildThinkingPlan(cfg.thinkingTokens, nCalls);
    let curIn = ctx + cfg.userMsg;
    let tCR = 0, tCW = 0, tUN = 0, tOut = 0, tTh = 0;
    let tCRc = 0, tCWc = 0, tUNc = 0, tOc = 0, tThc = 0;
    const callDetails = [];

    for (let a = 0; a < nCalls; a++) {
      const last = a === nCalls - 1;
      const oTok = last ? cfg.responseTokens : TOOL_CALL_OVERHEAD;
      const thTok = thinkingPlan[a] || 0;
      const c = costOneCall(curIn, oTok, thTok, m, cwPrice, warm, cached, noCache);

      callDetails.push({
        callIndex: a, isLast: last, inputTokens: curIn,
        outputTokens: oTok, thinkingTokens: thTok,
        warm, cachedPrefix: cached,
        ...c, totalCost: c.crCost + c.cwCost + c.unCost + c.outCost + c.thCost,
      });

      tCR += c.cr; tCRc += c.crCost; tCW += c.cw; tCWc += c.cwCost;
      tUN += c.un; tUNc += c.unCost; tOut += oTok; tOc += c.outCost;
      tTh += thTok; tThc += c.thCost;
      if (!noCache && c.cacheEligible) { cached = curIn; warm = true; }
      else if (!noCache) { cached = 0; warm = false; }
      if (!last) curIn += oTok + thTok + cfg.toolResult;
    }

    T.apiCalls += nCalls;
    const turnAPI = tCRc + tCWc + tUNc + tOc + tThc;
    T.crCost += tCRc; T.cwCost += tCWc; T.unCost += tUNc;
    T.outCost += tOc; T.thCost += tThc; T.cost += turnAPI;
    T.crTok += tCR; T.cwTok += tCW; T.unTok += tUN; T.outTok += tOut; T.thTok += tTh;

    ctx += cfg.userMsg + cfg.toolRounds * (TOOL_CALL_OVERHEAD + cfg.toolResult) + cfg.responseTokens;

    turns.push({
      turn: t, contextSize: ctx,
      turnCost: turnAPI + compCost, cumulativeCost: T.cost,
      compaction: needComp, cacheDrop: isDrop, warmAtStart: wasWarm && !isDrop,
      crCost: tCRc, cwCost: tCWc, unCost: tUNc, outCost: tOc, thCost: tThc, compCost,
      apiCalls: callDetails, compDetail, nCalls,
    });
  }

  T.backgroundCost = Math.max(0, Number(cfg.backgroundCost) || 0);
  T.webCost = Math.max(0, Number(cfg.webSearches) || 0) * WEB_SEARCH_COST_PER_REQUEST;
  T.cost += T.backgroundCost + T.webCost;

  return { T, turns };
}

export function simulateNoCacheCost(cfg) {
  // Reuse simulate with caching fully disabled: every call pays base input rate
  return simulate({ ...cfg, _noCache: true }).T.cost;
}

function getWorkflowMultiplier(cfg) {
  return (1 + (cfg.retryRate || 0) / 100) * (1 + (cfg.parallelAgents || 0) * (cfg.parallelAgentCostRatio || 0));
}

function getInterruptedCfg(cfg) {
  const turns = Math.max(0, Math.round(cfg.turns || 0));
  const extraDrops = Math.min(Math.max(0, Math.round(cfg.interruptions || 0)), Math.max(turns - 1, 0));
  return {
    ...cfg,
    cacheDrops: Math.min(Math.max(turns - 1, 0), Math.round(cfg.cacheDrops || 0) + extraDrops),
  };
}

function getEffectiveSessionCost(cfg, modelOverride) {
  const interrupted = simulate(getInterruptedCfg(cfg), modelOverride).T.cost;
  return interrupted * getWorkflowMultiplier(cfg);
}

function getMixEntries(cfg) {
  return SESSION_MIX.map(meta => {
    const weight = Math.max(0, Math.round(cfg[meta.key] || 0));
    const sessionCfg = { ...cfg, ...PRESETS[meta.preset] };
    const cost = getEffectiveSessionCost(sessionCfg);
    return { ...meta, weight, cost };
  });
}

function getRangeFactors(cfg) {
  const uncertainty = UNCERTAINTY_OPTIONS[cfg.uncertainty] || UNCERTAINTY_OPTIONS.med;
  const toolMix = TOOL_MIX_OPTIONS[cfg.toolMix] || TOOL_MIX_OPTIONS.balanced;
  const retryLift = Math.min(0.18, (cfg.retryRate || 0) / 250);
  const interruptionLift = Math.min(0.08, (cfg.interruptions || 0) * 0.0125);
  const helperLift = Math.min(0.12, (cfg.parallelAgents || 0) * 0.025);
  const lean = uncertainty.rangeDown * toolMix.rangeDown;
  const heavy = uncertainty.rangeUp * toolMix.rangeUp * (1 + retryLift + interruptionLift + helperLift);
  return { lean, heavy, toolMix, uncertainty };
}

export function computePlanning(cfg) {
  const baseSession = simulate(cfg).T.cost;
  const interruptedSession = simulate(getInterruptedCfg(cfg)).T.cost;
  const effectiveSession = interruptedSession * getWorkflowMultiplier(cfg);
  const perSessionLaborValue = (cfg.hourlyRate || 0) * ((cfg.timeSavedMins || 0) / 60);
  const breakEvenMins = (cfg.hourlyRate || 0) > 0 ? (effectiveSession / cfg.hourlyRate) * 60 : 0;

  const mixEntries = getMixEntries(cfg);
  const totalWeight = mixEntries.reduce((sum, entry) => sum + entry.weight, 0);
  const blendedSession = totalWeight > 0
    ? mixEntries.reduce((sum, entry) => sum + entry.cost * entry.weight, 0) / totalWeight
    : effectiveSession;

  const sessionsPerMonth = (cfg.sessPerDay || 0) * (cfg.workdaysPerMonth || 0);
  const monthlyCurrent = effectiveSession * sessionsPerMonth;
  const monthlyBlended = blendedSession * sessionsPerMonth;
  const monthlyLaborValue = perSessionLaborValue * sessionsPerMonth;
  const monthlyNetValue = monthlyLaborValue - monthlyBlended;

  const marginalTurnCost = (cfg.turns || 0) < 200
    ? simulate({ ...cfg, turns: Math.round(cfg.turns) + 1 }).T.cost - baseSession
    : 0;
  const cacheMissCost = (cfg.turns || 0) > 1
    ? simulate({ ...cfg, cacheDrops: Math.min(Math.round(cfg.turns) - 1, Math.round(cfg.cacheDrops || 0) + 1) }).T.cost - baseSession
    : 0;

  const sonnetCost = getEffectiveSessionCost(cfg, 'sonnet-4.6');
  const opusCost = getEffectiveSessionCost(cfg, 'opus-4.6');
  const currentModelCost = getEffectiveSessionCost(cfg);

  const rangeFactors = getRangeFactors(cfg);
  const monthlyLean = monthlyBlended * rangeFactors.lean;
  const monthlyHeavy = monthlyBlended * rangeFactors.heavy;

  const budget = cfg.monthlyBudget || 0;
  const safeSessionsPerDay = blendedSession > 0 && (cfg.workdaysPerMonth || 0) > 0
    ? budget / (blendedSession * cfg.workdaysPerMonth)
    : 0;
  const sessionsWithinBudget = blendedSession > 0 ? Math.floor(budget / blendedSession) : 0;

  const presetBudgetView = SESSION_MIX.map(meta => {
    const monthly = getEffectiveSessionCost({ ...cfg, ...PRESETS[meta.preset] }) * sessionsPerMonth;
    return { label: meta.label, monthly, fits: budget > 0 ? monthly <= budget : false };
  }).sort((a, b) => a.monthly - b.monthly);

  const dominantMix = [...mixEntries].sort((a, b) => b.weight - a.weight)[0] || null;

  return {
    baseSession,
    interruptedSession,
    effectiveSession,
    blendedSession,
    perSessionLaborValue,
    breakEvenMins,
    costPctOfLabor: perSessionLaborValue > 0 ? (effectiveSession / perSessionLaborValue) * 100 : null,
    netValuePerSession: perSessionLaborValue - effectiveSession,
    sessionsPerMonth,
    monthlyCurrent,
    monthlyBlended,
    monthlyLaborValue,
    monthlyNetValue,
    marginalTurnCost,
    cacheMissCost,
    directWebSearchCost: WEB_SEARCH_COST_PER_REQUEST,
    currentModelCost,
    sonnetCost,
    opusCost,
    currentVsSonnet: currentModelCost - sonnetCost,
    currentVsOpus: currentModelCost - opusCost,
    monthlyLean,
    monthlyHeavy,
    safeSessionsPerDay,
    sessionsWithinBudget,
    budgetUtilization: budget > 0 ? monthlyBlended / budget : 0,
    mixEntries,
    dominantMix,
    presetBudgetView,
    toolMix: rangeFactors.toolMix,
    uncertainty: rangeFactors.uncertainty,
  };
}

function normalizeSensitivityValue(key, value, range) {
  const bounded = Math.max(range.min, Math.min(range.max, value));
  return INTEGER_SLIDER_KEYS.has(key) ? Math.round(bounded) : bounded;
}

export function computeSensitivity() {
  const base = simulate(config).T.cost;
  if (base === 0) return {};
  const results = {};
  for (const [key, { min, max }] of Object.entries(SLIDER_RANGES)) {
    const delta = (max - min) * 0.10;
    const range = { min, max };
    const up = { ...config, [key]: normalizeSensitivityValue(key, config[key] + delta, range) };
    const dn = { ...config, [key]: normalizeSensitivityValue(key, config[key] - delta, range) };
    const costUp = simulate(up).T.cost;
    const costDn = simulate(dn).T.cost;
    results[key] = Math.abs(costUp - costDn) / base;
  }
  return results;
}
