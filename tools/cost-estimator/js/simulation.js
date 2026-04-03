import { MODELS, COMPACT_THRESHOLD, TOOL_CALL_OVERHEAD } from './constants.js';
import { config } from './state.js';

function getCacheWritePrice(m, ttl) {
  return ttl === '1h' ? m.cache1h : m.cache5m;
}

export function getCacheTTLMinutes(ttl) {
  return ttl === '1h' ? 60 : 5;
}

function costOneCall(inputTok, outputTok, thinkTok, model, cwPrice, warm, cachedPrefix) {
  const R = 1e6;
  let cr = 0, cw = 0, un = 0;
  if (warm && cachedPrefix > 0) {
    cr = Math.min(cachedPrefix, inputTok);
    cw = Math.max(0, inputTok - cachedPrefix);
  } else {
    cw = inputTok;
  }
  return {
    cr, cw, un, out: outputTok, think: thinkTok,
    crCost: cr * model.cacheRead / R,
    cwCost: cw * cwPrice / R,
    unCost: un * model.input / R,
    outCost: outputTok * model.output / R,
    thCost: thinkTok * model.output / R,
  };
}

export function simulate(cfg, modelOverride) {
  const m = MODELS[modelOverride || cfg.model];
  const cwPrice = getCacheWritePrice(m, cfg.cacheTTL);
  const ttlMin = getCacheTTLMinutes(cfg.cacheTTL);
  const ctxLimit = cfg.contextWindow;

  const dropSet = new Set();
  if (cfg.cacheDrops > 0 && cfg.turns > 1) {
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
    crTok: 0, cwTok: 0, unTok: 0, outTok: 0, thTok: 0, apiCalls: 0,
  };
  const turns = [];

  for (let t = 0; t < cfg.turns; t++) {
    const isDrop = dropSet.has(t) || cfg.timeBetween >= ttlMin;
    const wasWarm = warm;
    if (isDrop) { warm = false; cached = 0; }

    const needComp = compSet.has(t) || (cfg.autoCompact && ctx >= ctxLimit * COMPACT_THRESHOLD);
    let compCost = 0, compDetail = null;
    if (needComp) {
      const summ = Math.floor(ctx * cfg.compactRatio);
      const c = costOneCall(ctx, summ, 0, m, cwPrice, warm, cached);
      compCost = c.crCost + c.cwCost + c.unCost + c.outCost;
      compDetail = { inputTokens: ctx, outputTokens: summ, ...c, totalCost: compCost };
      T.compCost += compCost; T.cost += compCost; T.apiCalls++;
      ctx = cfg.sysPrompt + summ;
      warm = false; cached = 0;
    }

    const nCalls = 1 + cfg.toolRounds;
    let curIn = ctx + cfg.userMsg;
    let tCR = 0, tCW = 0, tUN = 0, tOut = 0, tTh = 0;
    let tCRc = 0, tCWc = 0, tUNc = 0, tOc = 0, tThc = 0;
    const callDetails = [];

    for (let a = 0; a < nCalls; a++) {
      const last = a === nCalls - 1;
      const oTok = last ? cfg.responseTokens : TOOL_CALL_OVERHEAD;
      const thTok = last ? cfg.thinkingTokens : 0;
      const c = costOneCall(curIn, oTok, thTok, m, cwPrice, warm, cached);

      callDetails.push({
        callIndex: a, isLast: last, inputTokens: curIn,
        outputTokens: oTok, thinkingTokens: thTok,
        warm, cachedPrefix: cached,
        ...c, totalCost: c.crCost + c.cwCost + c.unCost + c.outCost + c.thCost,
      });

      tCR += c.cr; tCRc += c.crCost; tCW += c.cw; tCWc += c.cwCost;
      tUN += c.un; tUNc += c.unCost; tOut += oTok; tOc += c.outCost;
      tTh += thTok; tThc += c.thCost;
      cached = curIn; warm = true;
      if (!last) curIn += oTok + cfg.toolResult;
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
  return { T, turns };
}

export function simulateNoCacheCost(cfg) {
  const m = MODELS[cfg.model];
  const R = 1e6;
  const ctxLimit = cfg.contextWindow;
  let ctx = cfg.sysPrompt, total = 0;
  const compSet = new Set();
  if (cfg.compactions > 0 && cfg.turns > 1) {
    const sp = cfg.turns / (cfg.compactions + 1);
    for (let i = 1; i <= cfg.compactions; i++) compSet.add(Math.round(i * sp));
  }
  for (let t = 0; t < cfg.turns; t++) {
    if (compSet.has(t) || (cfg.autoCompact && ctx >= ctxLimit * COMPACT_THRESHOLD)) {
      const summ = Math.floor(ctx * cfg.compactRatio);
      total += ctx * m.input / R + summ * m.output / R;
      ctx = cfg.sysPrompt + summ;
    }
    const nC = 1 + cfg.toolRounds;
    let curIn = ctx + cfg.userMsg;
    for (let a = 0; a < nC; a++) {
      const last = a === nC - 1;
      const oT = last ? cfg.responseTokens : TOOL_CALL_OVERHEAD;
      const thT = last ? cfg.thinkingTokens : 0;
      total += curIn * m.input / R + oT * m.output / R + thT * m.output / R;
      if (!last) curIn += oT + cfg.toolResult;
    }
    ctx += cfg.userMsg + cfg.toolRounds * (TOOL_CALL_OVERHEAD + cfg.toolResult) + cfg.responseTokens;
  }
  return total;
}

export function computeSensitivity() {
  const base = simulate(config).T.cost;
  if (base === 0) return {};
  const keys = [
    'turns', 'sysPrompt', 'userMsg', 'responseTokens', 'thinkingTokens',
    'toolRounds', 'toolResult', 'timeBetween', 'cacheDrops', 'compactions', 'compactRatio',
  ];
  const results = {};
  for (const key of keys) {
    const el = document.getElementById(key);
    if (!el) continue;
    const range = +el.max - +el.min;
    const delta = range * 0.10;
    const up = { ...config, [key]: Math.min(+el.max, config[key] + delta) };
    const dn = { ...config, [key]: Math.max(+el.min, config[key] - delta) };
    const costUp = simulate(up).T.cost;
    const costDn = simulate(dn).T.cost;
    results[key] = Math.abs(costUp - costDn) / base;
  }
  return results;
}
