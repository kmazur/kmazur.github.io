import {
  MODELS,
  PRESETS,
  AUTO_COMPACT_THRESHOLD,
  TOOL_CALL_OVERHEAD,
  WEB_SEARCH_COST_PER_REQUEST,
} from './constants.js';
import { config, state } from './state.js';
import { simulate, computePlanning, computeSensitivity, getCacheTTLMinutes } from './simulation.js';
import { fmtCost, fmtMins, fmtPct, fmtTok, escHtml } from './formatters.js';
import { drawLine, drawStackedBars, drawDonut, buildModelBars } from './charts.js';
import { syncToURL } from './url-state.js';

function animateEl(id, target, formatter) {
  if (!state.animState[id]) state.animState[id] = { current: target };
  const s = state.animState[id];
  const from = s.current;
  if (Math.abs(from - target) < 0.0001) {
    s.current = target;
    document.getElementById(id).textContent = formatter(target);
    return;
  }
  s.target = target;
  if (s.raf) return;
  const start = performance.now();
  const dur = 280;
  function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    s.current = from + (s.target - from) * ease;
    document.getElementById(id).textContent = formatter(s.current);
    if (t < 1) {
      s.raf = requestAnimationFrame(tick);
    } else {
      s.raf = null;
      s.current = s.target;
      document.getElementById(id).textContent = formatter(s.target);
    }
  }
  s.raf = requestAnimationFrame(tick);
}

function fmtSignedCost(value) {
  if (value === 0) return fmtCost(0);
  return (value > 0 ? '+' : '-') + fmtCost(Math.abs(value));
}

function formatCount(value) {
  if (value >= 10) return value.toFixed(0);
  return value.toFixed(1);
}

export function applyModelConstraints() {
  const m = MODELS[config.model];
  if (!m) return;
  if (config.contextWindow > m.maxContext) config.contextWindow = m.maxContext;

  document.querySelectorAll('#tg-ctx .toggle-btn').forEach(btn => {
    const val = +btn.dataset.val;
    btn.disabled = val > m.maxContext;
    btn.classList.toggle('active', val === config.contextWindow);
  });

  const note = document.getElementById('model-cap-note');
  if (note) {
    const longCtx = m.maxContext >= 1000000
      ? 'Supports 1M context at standard pricing.'
      : 'Limited to 200K context for this model.';
    note.textContent =
      `${longCtx} Prompt caching starts at ${fmtTok(m.minCacheable)} input tokens. Claude Code auto-compaction is modeled at about 95% context usage.`;
  }
}

export function updateSensitivityBadges() {
  const sens = computeSensitivity();
  const vals = Object.values(sens).filter(v => v > 0);
  if (vals.length === 0) return;
  vals.sort((a, b) => b - a);
  const highThreshold = vals[Math.floor(vals.length * 0.33)] || 0;
  const medThreshold = vals[Math.floor(vals.length * 0.66)] || 0;
  for (const [key, val] of Object.entries(sens)) {
    const el = document.querySelector(`[data-sens="${key}"]`);
    if (!el) continue;
    if (val >= highThreshold) {
      el.className = 'sens-tag high';
      el.textContent = 'HIGH';
    } else if (val >= medThreshold) {
      el.className = 'sens-tag med';
      el.textContent = 'MED';
    } else {
      el.className = 'sens-tag low';
      el.textContent = 'LOW';
    }
  }
}

function getCostSegments(T) {
  return [
    { label: 'Cache Read', value: T.crCost, color: '#34d399' },
    { label: 'Cache Write', value: T.cwCost, color: '#60a5fa' },
    { label: 'Uncached Input', value: T.unCost, color: '#f59e0b' },
    { label: 'Output', value: T.outCost, color: '#a78bfa' },
    { label: 'Thinking', value: T.thCost, color: '#f472b6' },
    { label: 'Compaction', value: T.compCost, color: '#f87171' },
    { label: 'Background', value: T.backgroundCost, color: '#22d3ee' },
    { label: 'Web Search', value: T.webCost, color: '#facc15' },
  ];
}

function updateCostDrivers(T) {
  const drivers = getCostSegments(T)
    .map(seg => ({ name: seg.label, cost: seg.value, color: seg.color }))
    .filter(d => d.cost > 0.0001)
    .sort((a, b) => b.cost - a.cost);
  const el = document.getElementById('cost-drivers');
  if (!drivers.length) {
    el.textContent = 'No billable activity yet.';
    return;
  }

  const mx = drivers[0]?.cost || 1;
  const total = drivers.reduce((sum, d) => sum + d.cost, 0);
  el.innerHTML = drivers.map(d => {
    const pct = (d.cost / total * 100).toFixed(0);
    const barW = (d.cost / mx * 100).toFixed(1);
    return `<div class="driver-row">
      <span class="driver-label">${escHtml(d.name)}</span>
      <div class="driver-bar-bg"><div class="driver-bar-fill" style="width:${barW}%;background:${escHtml(d.color)}"></div></div>
      <span class="driver-value" style="color:${escHtml(d.color)}">${escHtml(fmtCost(d.cost))}</span>
      <span class="driver-pct">${escHtml(pct)}%</span>
    </div>`;
  }).join('');
}

function updateContextProjection(turns) {
  const el = document.getElementById('ctx-projection');
  const limit = config.contextWindow;
  const threshold = limit * AUTO_COMPACT_THRESHOLD;
  const growthPerTurn = config.userMsg + config.toolRounds * (TOOL_CALL_OVERHEAD + config.toolResult) + config.responseTokens;
  const turnsToThreshold = Math.max(0, Math.ceil((threshold - config.sysPrompt) / growthPerTurn));

  const firstComp = turns.find(t => t.compaction);
  const lastTurn = turns[turns.length - 1];

  let html = `<div style="margin-bottom:8px">Growth: <strong>${escHtml(fmtTok(growthPerTurn))}</strong> tokens/turn</div>`;

  if (firstComp) {
    html += `Auto-compact triggers around <strong>turn ${escHtml(firstComp.turn)}</strong> (about <span class="highlight">${escHtml(fmtTok(Math.round(threshold)))}</span>, or 95% of context)`;
  } else if (turnsToThreshold <= config.turns * 1.5) {
    html += `At current rate, the 95% threshold (<span class="highlight">${escHtml(fmtTok(Math.round(threshold)))}</span>) is reached around <strong>turn ${escHtml(turnsToThreshold)}</strong>`;
  } else {
    html += `Context stays well within limits. Final size: <span class="highlight">${escHtml(fmtTok(lastTurn?.contextSize || 0))}</span> of ${escHtml(fmtTok(limit))}`;
  }

  const compCount = turns.filter(t => t.compaction).length;
  if (compCount > 0) {
    html += `<div style="margin-top:6px">Total compactions in session: <strong>${escHtml(compCount)}</strong></div>`;
  }

  const usage = lastTurn ? (lastTurn.contextSize / limit * 100).toFixed(0) : 0;
  html += `<div style="margin-top:6px">Final context usage: <strong>${escHtml(usage)}%</strong></div>`;
  el.innerHTML = html;
}

function updateMixPlanner(planning) {
  const el = document.getElementById('mix-planner');
  const active = planning.mixEntries
    .filter(entry => entry.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  if (!active.length) {
    el.textContent = 'Add session weights to see a blended monthly plan.';
    return;
  }

  const totalWeight = active.reduce((sum, entry) => sum + entry.weight, 0);
  el.innerHTML = `
    <div class="mix-list">
      ${active.map(entry => {
        const share = totalWeight > 0 ? (entry.weight / totalWeight * 100) : 0;
        return `<div class="mix-row">
          <div class="mix-row-label">${escHtml(entry.label)}</div>
          <div class="mix-row-bar"><div class="mix-row-fill" style="width:${share.toFixed(1)}%"></div></div>
          <div class="mix-row-meta">${escHtml('x' + entry.weight)} · ${escHtml(fmtCost(entry.cost))}</div>
        </div>`;
      }).join('')}
    </div>
    <div class="proj-detail">Blend: ${escHtml(fmtCost(planning.blendedSession))}/session. Dominant mix: ${escHtml(planning.dominantMix?.label || 'n/a')}.</div>
  `;
}

function updateProjections(cost, planning) {
  animateEl('sum-monthly', planning.monthlyBlended, fmtCost);
  document.getElementById('sess-count').textContent = config.sessPerDay;
  document.getElementById('monthly-plan-detail').textContent =
    `${config.sessPerDay}/day x ${config.workdaysPerMonth} workdays = ${planning.sessionsPerMonth.toLocaleString()} sessions/mo. Blend ${fmtCost(planning.blendedSession)}/session.`;

  const budgetInput = document.getElementById('budgetInput');
  if (budgetInput && document.activeElement !== budgetInput) {
    budgetInput.value = config.monthlyBudget;
  }

  const budget = config.monthlyBudget || 0;
  if (budget > 0 && planning.blendedSession > 0) {
    const headroom = budget - planning.monthlyBlended;
    const fitting = planning.presetBudgetView.filter(entry => entry.fits).map(entry => entry.label).slice(0, 3);
    document.getElementById('proj-budget').textContent = `${formatCount(planning.safeSessionsPerDay)}/day safe`;
    document.getElementById('proj-budget-detail').textContent =
      `${planning.sessionsWithinBudget.toLocaleString()} sessions/mo within ${fmtCost(budget)}. Planned blend uses ${fmtPct(planning.budgetUtilization * 100, 0)}${headroom >= 0 ? ` with ${fmtCost(headroom)} headroom.` : ` and is ${fmtCost(Math.abs(headroom))} over.`} ${fitting.length ? `Fits: ${fitting.join(', ')}.` : 'No default preset comfortably fits at this pace.'}`;
  } else {
    document.getElementById('proj-budget').textContent = '\u2014';
    document.getElementById('proj-budget-detail').textContent = '';
  }

  const sessionMins = config.timeBetween * config.turns;
  if (planning.effectiveSession > 0 && sessionMins > 0) {
    const costPerHr = planning.effectiveSession / (sessionMins / 60);
    const sessionsPerEngineerHour = config.hourlyRate > 0 ? config.hourlyRate / planning.effectiveSession : 0;
    document.getElementById('cost-per-hour').textContent = `${fmtCost(costPerHr)} / hr`;
    document.getElementById('cost-per-hour-detail').textContent =
      planning.costPctOfLabor != null
        ? `${fmtPct(planning.costPctOfLabor, 0)} of ${fmtCost(config.hourlyRate)}/hr labor. One engineer hour costs about ${formatCount(sessionsPerEngineerHour)} sessions.`
        : `${config.turns} turns x ${config.timeBetween} min ~= ${Math.round(sessionMins)} min visible session.`;
  } else {
    document.getElementById('cost-per-hour').textContent = '\u2014';
    document.getElementById('cost-per-hour-detail').textContent = '';
  }

  if (planning.perSessionLaborValue > 0 && config.hourlyRate > 0) {
    document.getElementById('proj-roi').textContent = fmtMins(planning.breakEvenMins);
    document.getElementById('proj-roi-detail').textContent =
      `${fmtCost(planning.perSessionLaborValue)} labor recovered/session at ${fmtMins(config.timeSavedMins)} saved. Net ${fmtSignedCost(planning.netValuePerSession)} per session and ${fmtSignedCost(planning.monthlyNetValue)} per month.`;
  } else {
    document.getElementById('proj-roi').textContent = '\u2014';
    document.getElementById('proj-roi-detail').textContent = 'Set hourly rate and time saved to estimate break-even and ROI.';
  }

  document.getElementById('proj-range').textContent = `${fmtCost(planning.monthlyLean)} - ${fmtCost(planning.monthlyHeavy)}`;
  document.getElementById('proj-range-detail').textContent =
    `${planning.toolMix.label} tool mix with ${planning.uncertainty.label.toUpperCase()} variance. Midpoint: ${fmtCost(planning.monthlyBlended)}/mo.`;

  document.getElementById('proj-marginal').textContent =
    planning.marginalTurnCost > 0 ? `+${fmtCost(planning.marginalTurnCost)} / turn` : '\u2014';
  document.getElementById('proj-marginal-detail').textContent =
    `Cache miss: ${fmtSignedCost(planning.cacheMissCost)}. Web search fee: ${fmtCost(planning.directWebSearchCost)} before token costs.`;

  const currentName = MODELS[config.model]?.name || 'Current model';
  const preferredAlt = config.model === 'opus-4.6'
    ? { label: 'Sonnet 4.6', cost: planning.sonnetCost }
    : { label: 'Opus 4.6', cost: planning.opusCost };
  const altDelta = preferredAlt.cost - planning.currentModelCost;
  document.getElementById('proj-model-switch').textContent =
    altDelta === 0 ? 'No change' : `${altDelta < 0 ? 'Save' : 'Spend'} ${fmtCost(Math.abs(altDelta))}`;
  document.getElementById('proj-model-switch-detail').textContent =
    `${currentName}: ${fmtCost(planning.currentModelCost)}. Sonnet: ${fmtCost(planning.sonnetCost)} (${fmtSignedCost(planning.sonnetCost - planning.currentModelCost)}). Opus: ${fmtCost(planning.opusCost)} (${fmtSignedCost(planning.opusCost - planning.currentModelCost)}).`;
}

function updateSummarySentence(cost, T, planning) {
  const m = MODELS[config.model];
  const el = document.getElementById('summary-sentence');
  const extras = T.backgroundCost + T.webCost;
  const extraBits = [];
  if (T.backgroundCost > 0) extraBits.push(`${fmtCost(T.backgroundCost)} background`);
  if (T.webCost > 0) {
    extraBits.push(`${fmtCost(T.webCost)} web search (${config.webSearches} x ${fmtCost(WEB_SEARCH_COST_PER_REQUEST)})`);
  }

  let html = `Raw <strong>${escHtml(config.turns)}-turn ${escHtml(m.name)}</strong> session cost is <span class="hl">${escHtml(fmtCost(cost))}</span>. `;
  html += `Effective workflow cost after interruptions, retries, and helpers is <span class="hl">${escHtml(fmtCost(planning.effectiveSession))}</span>. `;
  html += `Your blended portfolio lands at <span class="hl">${escHtml(fmtCost(planning.monthlyBlended))}/mo</span> at ${escHtml(config.sessPerDay)} sessions/day across ${escHtml(config.workdaysPerMonth)} workdays.`;
  if (planning.perSessionLaborValue > 0 && config.hourlyRate > 0) {
    html += ` Break-even is <span class="hl">${escHtml(fmtMins(planning.breakEvenMins))}</span> saved per session against ${escHtml(fmtCost(config.hourlyRate))}/hr labor.`;
  }
  if (extras > 0) {
    html += ` Extras modeled: ${escHtml(extraBits.join(' + '))}.`;
  }
  el.innerHTML = html;
}

export function updatePresetCosts() {
  document.querySelectorAll('.preset-card').forEach(btn => {
    const p = PRESETS[btn.dataset.preset];
    if (!p) return;
    const r = simulate({ ...config, ...p });
    const el = btn.querySelector('[data-pcost]');
    if (el) el.textContent = '~' + fmtCost(r.T.cost);
  });
}

export function updatePricingBox() {
  const m = MODELS[config.model];
  const cw = config.cacheTTL === '1h' ? m.cache1h : m.cache5m;
  document.getElementById('pricing-box').innerHTML =
    `<div class="price-item"><span class="pl">Input</span><span class="pv">$${escHtml(m.input)}/MTok</span></div>
     <div class="price-item"><span class="pl">Output</span><span class="pv">$${escHtml(m.output)}/MTok</span></div>
     <div class="price-item"><span class="pl">Cache write</span><span class="pv">$${escHtml(cw)}/MTok</span></div>
     <div class="price-item"><span class="pl">Cache read</span><span class="pv">$${escHtml(m.cacheRead)}/MTok</span></div>
     <div class="price-item"><span class="pl">Max context</span><span class="pv">${escHtml(fmtTok(m.maxContext))}</span></div>
     <div class="price-item"><span class="pl">Min cacheable</span><span class="pv">${escHtml(fmtTok(m.minCacheable))}</span></div>`;
}

export function updateIdleLabel() {
  const ttl = config.cacheTTL === '1h' ? '1 hr' : '5 min';
  document.getElementById('lbl-cacheDrops').textContent = `Manual idle breaks (>${ttl} gaps)`;
}

export function detectActivePreset() {
  for (const key of Object.keys(PRESETS)) {
    const p = PRESETS[key];
    let match = true;
    for (const [k, v] of Object.entries(p)) {
      if (config[k] !== v) {
        match = false;
        break;
      }
    }
    if (match) return key;
  }
  return null;
}

export function updatePresetHighlight() {
  const active = detectActivePreset();
  document.querySelectorAll('.preset-card').forEach(btn => {
    const pk = btn.dataset.preset;
    btn.classList.remove('active-preset', 'modified');
    if (pk === active) {
      btn.classList.add('active-preset');
    } else if (pk === state.lastPreset && active === null) {
      btn.classList.add('modified');
    }
  });
}

export function updateDangerZone() {
  const el = document.getElementById('timeBetween');
  const ttlMin = getCacheTTLMinutes(config.cacheTTL);
  const max = +el.max;
  const safePct = Math.min(100, (ttlMin / max) * 100);
  el.style.setProperty('--safe-pct', safePct + '%');
}

export function update() {
  applyModelConstraints();
  const res = simulate(config);
  const planning = computePlanning(config);
  state.lastResult = res;
  const t = res.T;

  animateEl('sum-total', t.cost, fmtCost);
  animateEl('sum-input', t.crCost + t.cwCost + t.unCost, fmtCost);
  animateEl('sum-output', t.outCost + t.thCost, fmtCost);
  animateEl('sum-calls', t.apiCalls, v => Math.round(v).toLocaleString());

  const avgCost = config.turns > 0 ? t.cost / config.turns : 0;
  animateEl('sum-avg', avgCost, fmtCost);

  const half = Math.floor(res.turns.length / 2);
  if (half > 0 && res.turns.length > 2) {
    const first = res.turns.slice(0, half).reduce((sum, d) => sum + d.turnCost, 0) / half;
    const second = res.turns.slice(half).reduce((sum, d) => sum + d.turnCost, 0) / (res.turns.length - half);
    const ratio = second / Math.max(first, 0.001);
    const arrow = ratio > 1.15 ? '<span class="trend-arrow up">&#9650;</span> rising'
      : ratio < 0.85 ? '<span class="trend-arrow down">&#9660;</span> falling'
      : '<span class="trend-arrow flat">&#9654;</span> stable';
    document.getElementById('sum-avg-detail').innerHTML = arrow;
  }

  const totTok = t.crTok + t.cwTok + t.unTok + t.outTok + t.thTok;
  document.getElementById('sum-tokens').textContent = fmtTok(totTok);
  document.getElementById('sum-extra-detail').textContent =
    (t.backgroundCost + t.webCost) > 0 ? `+ ${fmtCost(t.backgroundCost + t.webCost)} extras` : '';
  document.getElementById('sum-thinking-pct').textContent =
    (t.outCost + t.thCost) > 0 ? ((t.thCost / (t.outCost + t.thCost)) * 100).toFixed(0) + '%' : '0%';
  document.getElementById('sum-calls-detail').textContent =
    (1 + config.toolRounds) + ' calls/turn x ' + config.turns + ' turns'
    + (t.apiCalls > config.turns * (1 + config.toolRounds) ? ' + compactions' : '');

  const totIn = t.crTok + t.cwTok + t.unTok;
  const eff = totIn > 0 ? (t.crTok / totIn) * 100 : 0;
  document.getElementById('cache-eff-bar').style.width = eff.toFixed(1) + '%';
  document.getElementById('cache-eff-pct').textContent = eff.toFixed(0) + '% cache hits';
  document.getElementById('cache-eff-ratio').textContent = fmtTok(t.crTok) + ' / ' + fmtTok(totIn) + ' input';

  const stackData = res.turns.map(d => ({
    x: d.turn,
    compaction: d.compaction,
    cacheDrop: d.cacheDrop,
    segments: [
      { value: d.crCost, color: '#34d39988' },
      { value: d.cwCost, color: '#60a5fa88' },
      { value: d.unCost, color: '#f59e0b88' },
      { value: d.outCost + d.compCost, color: '#a78bfa88' },
      { value: d.thCost, color: '#f472b688' },
    ],
  }));
  drawStackedBars(document.getElementById('chart-perturn'), stackData, { height: 200, yFmt: fmtCost });

  const ctxD = res.turns.map(d => ({ x: d.turn, y: d.contextSize, compaction: d.compaction, cacheDrop: d.cacheDrop }));
  drawLine(document.getElementById('chart-ctx'), [{ data: ctxD, color: '#60a5fa' }], {
    height: 200,
    yFmt: fmtTok,
    limitY: config.contextWindow,
    limitLabel: fmtTok(config.contextWindow) + ' limit',
    thresholdY: config.contextWindow * AUTO_COMPACT_THRESHOLD,
    thresholdLabel: '95% compact',
  });

  const segs = getCostSegments(t).filter(s => s.value > 0.0001);
  drawDonut(document.getElementById('chart-donut'), segs);
  document.getElementById('donut-legend').innerHTML = segs.map(s =>
    `<div class="legend-item"><div class="legend-dot" style="background:${escHtml(s.color)}"></div>
     <span class="legend-label">${escHtml(s.label)}</span>
     <span class="legend-value" style="color:${escHtml(s.color)}">${escHtml(fmtCost(s.value))}</span></div>`).join('');

  buildModelBars('bar-comparison', config);
  updateProjections(t.cost, planning);
  updateSummarySentence(t.cost, t, planning);
  updatePresetCosts();
  updateCostDrivers(t);
  updateContextProjection(res.turns);
  updateMixPlanner(planning);
  updatePresetHighlight();
  updateDangerZone();
  syncToURL();

  clearTimeout(update._sensTm);
  update._sensTm = setTimeout(updateSensitivityBadges, 300);
}
