import {
  AUTO_COMPACT_THRESHOLD,
  EFFORT_LEVELS,
  MODELS,
  MODEL_ORDER,
  PRESETS,
  PROVIDERS,
  SESSION_MIX,
  TASK_PROFILES,
  TOOL_CALL_OVERHEAD,
} from './constants.js';
import { config, state } from './state.js';
import {
  computePlanning,
  computeSensitivity,
  getCacheTTLMinutes,
  getExecSessionUnitCost,
  getModel,
  getProvider,
  getWebSearchUnitCost,
  simulate,
} from './simulation.js';
import { SLIDER_FORMATTERS, fmtCost, fmtMins, fmtPct, fmtTok, escHtml } from './formatters.js';
import { drawDonut, drawLine, drawStackedBars, buildModelBars } from './charts.js';
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

function syncControlValue(key) {
  const input = document.getElementById(key);
  const display = document.getElementById(`v-${key}`);
  if (input) input.value = config[key];
  if (display && SLIDER_FORMATTERS[key]) {
    const formatted = SLIDER_FORMATTERS[key](config[key]);
    display.textContent = formatted;
    if (input) input.setAttribute('aria-valuetext', String(formatted));
  }
}

function getVisibleModels(providerId = config.provider) {
  return MODEL_ORDER.map(id => MODELS[id]).filter(model => model?.provider === providerId);
}

function getCacheMinLabel(model) {
  if (model.cacheUnavailable) return 'No cache discount';
  if (Number.isFinite(model.minCacheable)) return `${fmtTok(model.minCacheable)} tokens`;
  if (Number.isFinite(model.cacheMinEstimate)) return `Not published; using ~${fmtTok(model.cacheMinEstimate)} token estimate`;
  return 'Not published';
}

function getCacheBadge(model) {
  if (model.cacheUnavailable) return 'cache n/a';
  if (Number.isFinite(model.minCacheable)) return `cache ${fmtTok(model.minCacheable)}+`;
  if (Number.isFinite(model.cacheMinEstimate)) return `cache ~${fmtTok(model.cacheMinEstimate)}+`;
  return 'cache varies';
}

function getReasoningBadge(model) {
  const labels = {
    'adaptive thinking + effort': 'adaptive',
    'manual thinking budget': 'manual budget',
    'reasoning.effort': 'effort',
    thinkingLevel: 'thinking level',
    thinkingBudget: 'budget',
  };
  return labels[model.reasoningApiLabel] || model.reasoningApiLabel;
}

function renderProviderSelectors() {
  const providerBox = document.getElementById('provider-selector');
  const modelBox = document.getElementById('model-selector');
  providerBox.innerHTML = Object.values(PROVIDERS).map(provider =>
    `<button class="provider-btn ${provider.id === config.provider ? 'active' : ''}" data-provider="${provider.id}" style="--provider-color:${provider.color}">
      <span class="provider-title">${escHtml(provider.name)}</span>
      <small>${escHtml(`${getVisibleModels(provider.id).length} current model${getVisibleModels(provider.id).length === 1 ? '' : 's'}`)}</small>
    </button>`).join('');

  const models = getVisibleModels(config.provider);
  modelBox.innerHTML = models.map(model =>
    `<button class="model-btn model-card ${model.id === config.model ? 'active' : ''}" data-model="${model.id}" style="--model-color:${model.color}">
      <div class="model-card-top">
        <div>
          <div class="model-card-name">${escHtml(model.shortName)}</div>
          <div class="model-card-sub">${escHtml(`${fmtCost(model.input)}/MTok in · ${fmtCost(model.output)}/MTok out`)}</div>
        </div>
        ${model.selectorBadge ? `<span class="model-badge ${escHtml(model.selectorTone || 'current')}">${escHtml(model.selectorBadge)}</span>` : ''}
      </div>
      <div class="model-card-blurb">${escHtml(model.selectorBlurb || model.name)}</div>
      <div class="model-card-meta">
        <span>${escHtml(fmtTok(model.maxContext))} ctx</span>
        ${model.maxOutputTokens ? `<span>${escHtml(fmtTok(model.maxOutputTokens))} out</span>` : ''}
        <span>${escHtml(getReasoningBadge(model))}</span>
        <span>${escHtml(getCacheBadge(model))}</span>
      </div>
      <div class="model-chip-row">
        ${(model.selectorFeatures || []).map(feature => `<span class="model-chip">${escHtml(feature)}</span>`).join('')}
      </div>
    </button>`).join('');
}

function renderTaskAndEffortToggles() {
  document.querySelectorAll('#tg-task .toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.val === config.taskProfile);
  });
  document.querySelectorAll('#tg-effort .toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.val === config.effort);
  });
}

export function applyModelConstraints() {
  const requestedModel = getModel(config.model);
  const providerChoices = getVisibleModels(requestedModel.provider);
  const providerDefaultModel = PROVIDERS[requestedModel.provider]?.defaultModel;
  const visibleModelId = providerChoices.some(model => model.id === requestedModel.id)
    ? requestedModel.id
    : (providerDefaultModel && providerChoices.some(model => model.id === providerDefaultModel)
      ? providerDefaultModel
      : providerChoices[0]?.id || MODEL_ORDER[0]);
  if (config.model !== visibleModelId) config.model = visibleModelId;

  const model = getModel(config.model);
  const provider = getProvider(model.provider);
  const contextChoices = [200000, 400000, 1000000].filter(value => value <= model.maxContext);
  const cacheMinLabel = getCacheMinLabel(model);
  const autoCompactAvailable = !!model.autoCompact;
  const searchUnitCost = getWebSearchUnitCost(model);
  const execUnitCost = getExecSessionUnitCost(model);

  config.provider = model.provider;
  if (config.contextWindow > model.maxContext) config.contextWindow = model.maxContext;
  if (!contextChoices.includes(config.contextWindow)) {
    config.contextWindow = contextChoices[contextChoices.length - 1] || Math.min(model.maxContext, 200000);
  }
  if (!autoCompactAvailable) config.autoCompact = false;
  if (!model.searchSupported) config.webSearches = 0;
  if (!model.execFeeSupported) config.execSessions = 0;

  renderProviderSelectors();
  renderTaskAndEffortToggles();

  document.querySelectorAll('#tg-ctx .toggle-btn').forEach(btn => {
    const val = +btn.dataset.val;
    btn.disabled = val > model.maxContext;
    btn.classList.toggle('active', val === config.contextWindow);
  });
  document.querySelectorAll('#tg-cache .toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.val === config.cacheTTL);
  });
  document.querySelectorAll('#tg-toolmix .toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.val === config.toolMix);
  });
  document.querySelectorAll('#tg-uncertainty .toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.val === config.uncertainty);
  });

  document.getElementById('cache-ttl-label').textContent = provider.cacheTTLNote;
  document.getElementById('extras-hint').textContent = provider.extraHint;
  document.getElementById('background-label').textContent = provider.id === 'anthropic' ? 'Agent overhead (est.)' : 'Agent overhead override';
  document.getElementById('websearch-label').textContent = model.searchSupported
    ? (provider.id === 'google' ? 'Grounded prompts / session' : 'Web searches / session')
    : (provider.id === 'google' ? 'Grounded prompts / session (N/A)' : 'Web searches / session (N/A)');
  document.getElementById('exec-label').textContent = model.execFeeSupported
    ? provider.execSessionLabel
    : `${provider.execSessionLabel} (N/A)`;
  document.getElementById('cache-hint').textContent =
    model.cacheUnavailable
      ? 'This model does not publish a discounted cache-input rate, so the estimator treats cache reuse as unavailable.'
      : provider.id === 'anthropic'
      ? 'Anthropic uses explicit prompt-caching TTLs. Prompts below the per-model minimum do not get cached.'
      : provider.id === 'openai'
        ? 'OpenAI cached input is automatic. This estimator treats TTL as an effective reuse window for interactive sessions.'
        : 'Gemini implicit cache hits are automatic but nondeterministic. This estimator uses published explicit-cache pricing so reuse and storage costs remain comparable.';

  const note = document.getElementById('model-cap-note');
  const longCtx = model.longContextThreshold
    ? `Long-context pricing changes after about ${fmtTok(model.longContextThreshold)} input tokens.`
      : model.maxContext >= 1000000
      ? 'No long-context surcharge is modeled for this selection.'
      : `Context is capped at ${fmtTok(model.maxContext)}.`;
  const supportBits = [
    autoCompactAvailable ? 'Provider auto-compaction supported.' : 'Provider auto-compaction unavailable; only manual compactions are modeled.',
    model.searchSupported ? `Search / grounding supported at ${fmtCost(searchUnitCost)} each.` : 'Search / grounding not supported on this model.',
    model.execFeeSupported ? `${provider.execSessionLabel} billed at ${fmtCost(execUnitCost)} each.` : `${provider.execSessionLabel} not supported or not separately billed.`,
  ];
  note.textContent = `${provider.name} • ${model.name}. ${longCtx} Cache minimum: ${cacheMinLabel}. Reasoning API: ${model.reasoningApiLabel} (provider default: ${model.effortApiDefault}). ${supportBits.join(' ')}`;

  const bgSlider = document.getElementById('backgroundCost');
  bgSlider.max = provider.id === 'anthropic' ? '0.04' : '0.10';
  document.getElementById('webSearches').disabled = !model.searchSupported;
  document.getElementById('execSessions').disabled = !model.execFeeSupported;
  syncControlValue('backgroundCost');
  syncControlValue('webSearches');
  syncControlValue('execSessions');

  const autoCompactInput = document.getElementById('autoCompact');
  autoCompactInput.disabled = !autoCompactAvailable;
  autoCompactInput.checked = !!config.autoCompact;
  const autoCompactLabel = document.getElementById('autoCompact-label');
  if (autoCompactLabel) {
    autoCompactLabel.textContent = autoCompactAvailable
      ? 'Auto-compact at ~95% context'
      : 'Auto-compact unavailable for this model';
  }
}

export function updateSensitivityBadges() {
  const sens = computeSensitivity();
  const vals = Object.values(sens).filter(v => v > 0);
  if (!vals.length) return;
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
    { label: 'Cached Input', value: T.crCost, color: '#34d399' },
    { label: 'Cache Setup', value: T.cwCost, color: '#60a5fa' },
    { label: 'Uncached Input', value: T.unCost, color: '#f59e0b' },
    { label: 'Output', value: T.outCost, color: '#a78bfa' },
    { label: 'Thinking', value: T.thCost, color: '#f472b6' },
    { label: 'Compaction', value: T.compCost, color: '#f87171' },
    { label: 'Agent Overhead', value: T.backgroundCost, color: '#22d3ee' },
    { label: 'Web / Grounding', value: T.webCost, color: '#facc15' },
    { label: 'Exec Sessions', value: T.execCost, color: '#38bdf8' },
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

  const maxCost = drivers[0]?.cost || 1;
  const total = drivers.reduce((sum, d) => sum + d.cost, 0);
  el.innerHTML = drivers.map(d => {
    const pct = (d.cost / total * 100).toFixed(0);
    const barW = (d.cost / maxCost * 100).toFixed(1);
    return `<div class="driver-row">
      <span class="driver-label">${escHtml(d.name)}</span>
      <div class="driver-bar-bg"><div class="driver-bar-fill" style="width:${barW}%;background:${escHtml(d.color)}"></div></div>
      <span class="driver-value" style="color:${escHtml(d.color)}">${escHtml(fmtCost(d.cost))}</span>
      <span class="driver-pct">${escHtml(pct)}%</span>
    </div>`;
  }).join('');
}

function updateContextProjection(turns, adjustedCfg) {
  const el = document.getElementById('ctx-projection');
  const limit = adjustedCfg.contextWindow;
  const threshold = limit * AUTO_COMPACT_THRESHOLD;
  const growthPerTurn = adjustedCfg.userMsg + adjustedCfg.toolRounds * (TOOL_CALL_OVERHEAD + adjustedCfg.toolResult) + adjustedCfg.responseTokens;
  const turnsToThreshold = Math.max(0, Math.ceil((threshold - adjustedCfg.sysPrompt) / Math.max(growthPerTurn, 1)));

  const firstComp = turns.find(t => t.compaction);
  const lastTurn = turns[turns.length - 1];

  let html = `<div style="margin-bottom:8px">Growth: <strong>${escHtml(fmtTok(growthPerTurn))}</strong> tokens/turn</div>`;
  if (firstComp) {
    html += `Compaction hits around <strong>turn ${escHtml(firstComp.turnNumber || firstComp.turn + 1)}</strong> near <span class="highlight">${escHtml(fmtTok(Math.round(threshold)))}</span>.`;
  } else if (turnsToThreshold <= adjustedCfg.turns * 1.5) {
    html += `At this pace, the 95% context threshold (<span class="highlight">${escHtml(fmtTok(Math.round(threshold)))}</span>) lands around <strong>turn ${escHtml(turnsToThreshold)}</strong>.`;
  } else {
    html += `Context stays within limits. Final size: <span class="highlight">${escHtml(fmtTok(lastTurn?.contextSize || 0))}</span> of ${escHtml(fmtTok(limit))}.`;
  }
  const usage = lastTurn ? (lastTurn.contextSize / limit * 100).toFixed(0) : 0;
  html += `<div style="margin-top:6px">Final context usage: <strong>${escHtml(usage)}%</strong></div>`;
  el.innerHTML = html;
}

function updateMixPlanner(planning) {
  const el = document.getElementById('mix-planner');
  const active = planning.mixEntries.filter(entry => entry.weight > 0).sort((a, b) => b.weight - a.weight);
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
    <div class="proj-detail">Blend: ${escHtml(fmtCost(planning.blendedSession))}/session. ${escHtml(fmtPct(planning.blendedSuccessRate * 100, 0))} expected good-result rate.</div>
  `;
}

function renderCompareTable(rows) {
  const el = document.getElementById('compare-table');
  const sorted = [...rows].sort((a, b) => a.costPerSuccessfulOutcome - b.costPerSuccessfulOutcome);
  const currentRow = sorted.find(row => row.modelId === config.model);
  const visible = sorted.slice(0, 6);
  if (currentRow && !visible.some(row => row.modelId === currentRow.modelId)) {
    visible[visible.length - 1] = currentRow;
  }
  el.innerHTML = `
    <div class="compare-head">
      <span>Model</span>
      <span>Raw</span>
      <span>Good</span>
      <span>Win</span>
      <span>Time</span>
    </div>
    ${visible.map(row => `
      <div class="compare-row ${row.modelId === config.model ? 'current' : ''}">
        <span class="compare-model"><span class="compare-dot" style="background:${escHtml(row.model.color)}"></span>${escHtml(row.model.shortName)}</span>
        <span>${escHtml(fmtCost(row.rawSession))}</span>
        <span>${escHtml(fmtCost(row.costPerSuccessfulOutcome))}</span>
        <span>${escHtml(fmtPct(row.successRate * 100, 0))}</span>
        <span>${escHtml(fmtMins(row.timeToGoodOutcomeMins))}</span>
      </div>`).join('')}
  `;
}

function updateProjections(planning) {
  animateEl('sum-monthly', planning.monthlyBlended, fmtCost);
  document.getElementById('sess-count').textContent = config.sessPerDay;
  document.getElementById('monthly-plan-detail').textContent =
    `${config.sessPerDay}/day x ${config.workdaysPerMonth} workdays = ${planning.sessionsPerMonth.toLocaleString()} sessions/mo. ${fmtPct(planning.blendedSuccessRate * 100, 0)} good-result rate.`;

  const budgetInput = document.getElementById('budgetInput');
  if (budgetInput && document.activeElement !== budgetInput) budgetInput.value = config.monthlyBudget;

  const budget = config.monthlyBudget || 0;
  if (budget > 0 && planning.blendedSession > 0) {
    const headroom = budget - planning.monthlyBlended;
    document.getElementById('proj-budget').textContent = `${formatCount(planning.safeSessionsPerDay)}/day safe`;
    document.getElementById('proj-budget-detail').textContent =
      `${planning.sessionsWithinBudget.toLocaleString()} sessions/mo within ${fmtCost(budget)}. Blend uses ${fmtPct(planning.budgetUtilization * 100, 0)}${headroom >= 0 ? ` with ${fmtCost(headroom)} headroom.` : ` and is ${fmtCost(Math.abs(headroom))} over.`}`;
  } else {
    document.getElementById('proj-budget').textContent = '\u2014';
    document.getElementById('proj-budget-detail').textContent = '';
  }

  if (planning.timeToGoodOutcomeMins > 0) {
    const costPerHour = planning.costPerSuccessfulOutcome / (planning.timeToGoodOutcomeMins / 60);
    document.getElementById('cost-per-hour').textContent = `${fmtCost(costPerHour)} / hr`;
    document.getElementById('cost-per-hour-detail').textContent =
      `${fmtMins(planning.timeToGoodOutcomeMins)} to a likely good result. Raw session is ${fmtCost(planning.baseSession)}; quality-adjusted cost is ${fmtCost(planning.costPerSuccessfulOutcome)}.`;
  } else {
    document.getElementById('cost-per-hour').textContent = '\u2014';
    document.getElementById('cost-per-hour-detail').textContent = '';
  }

  if (planning.perSessionLaborValue > 0 && config.hourlyRate > 0) {
    document.getElementById('proj-roi').textContent = fmtMins(planning.breakEvenMins);
    document.getElementById('proj-roi-detail').textContent =
      `${fmtCost(planning.perSessionLaborValue)} expected labor value/session. Net ${fmtSignedCost(planning.netValuePerSession)} per session and ${fmtSignedCost(planning.monthlyNetValue)} per month.`;
  } else {
    document.getElementById('proj-roi').textContent = '\u2014';
    document.getElementById('proj-roi-detail').textContent = 'Set hourly rate and time saved to estimate break-even and ROI.';
  }

  document.getElementById('proj-range').textContent = `${fmtCost(planning.monthlyLean)} - ${fmtCost(planning.monthlyHeavy)}`;
  document.getElementById('proj-range-detail').textContent =
    `${planning.toolMix.label} tool mix with ${planning.uncertainty.label.toUpperCase()} variance. Midpoint: ${fmtCost(planning.monthlyBlended)}/mo.`;

  document.getElementById('proj-marginal').textContent =
    planning.marginalTurnCost > 0 ? `+${fmtCost(planning.marginalTurnCost)} / turn` : '\u2014';
  const searchCostLabel = planning.directWebSearchCost > 0 ? fmtCost(planning.directWebSearchCost) : 'n/a';
  const execCostLabel = planning.directExecSessionCost > 0 ? fmtCost(planning.directExecSessionCost) : 'n/a';
  document.getElementById('proj-marginal-detail').textContent =
    `Extra cache miss: ${fmtSignedCost(planning.cacheMissCost)}. Search call: ${searchCostLabel}. Exec session: ${execCostLabel}.`;

  const best = planning.bestValue;
  const currentRow = planning.comparisonRows.find(row => row.modelId === config.model);
  const delta = currentRow ? best.netValuePerSession - currentRow.netValuePerSession : 0;
  document.getElementById('proj-model-switch').textContent =
    delta > 0.0001 ? `Gain ${fmtCost(delta)}` : 'Already best';
  document.getElementById('proj-model-switch-detail').textContent =
    `Best net value: ${best.model.shortName} at ${fmtSignedCost(best.netValuePerSession)} expected/session. Cheapest good-result cost: ${planning.bestOutcome.model.shortName} at ${fmtCost(planning.bestOutcome.costPerSuccessfulOutcome)}. Fastest: ${planning.fastest.model.shortName} in ${fmtMins(planning.fastest.timeToGoodOutcomeMins)}.`;
}

function updateSummarySentence(res, planning) {
  const model = getModel(config.model);
  const provider = getProvider(model.provider);
  const extras = res.T.backgroundCost + res.T.webCost + res.T.execCost;
  const extraBits = [];
  if (res.T.backgroundCost > 0) extraBits.push(`${fmtCost(res.T.backgroundCost)} overhead`);
  if (res.T.webCost > 0) extraBits.push(`${fmtCost(res.T.webCost)} search`);
  if (res.T.execCost > 0) extraBits.push(`${fmtCost(res.T.execCost)} exec`);

  let html = `<strong>${escHtml(provider.name)} / ${escHtml(model.name)}</strong> on <strong>${escHtml(TASK_PROFILES[config.taskProfile].label)}</strong> with <strong>${escHtml(EFFORT_LEVELS[config.effort].label)}</strong> effort. `;
  html += `Raw session cost: <span class="hl">${escHtml(fmtCost(res.T.cost))}</span>. `;
  html += `Expected good-result cost: <span class="hl">${escHtml(fmtCost(planning.costPerSuccessfulOutcome))}</span> at <span class="hl">${escHtml(fmtPct(planning.successRate * 100, 0))}</span> success odds and about <span class="hl">${escHtml(fmtMins(planning.timeToGoodOutcomeMins))}</span> to a good result. `;
  html += `Monthly blended spend is <span class="hl">${escHtml(fmtCost(planning.monthlyBlended))}</span>.`;
  html += ` Reasoning maps to <span class="hl">${escHtml(planning.effortApiLabel)}</span>.`;
  if (planning.perSessionLaborValue > 0 && config.hourlyRate > 0) {
    html += ` Break-even arrives at <span class="hl">${escHtml(fmtMins(planning.breakEvenMins))}</span> saved per session.`;
  }
  if (extras > 0) html += ` Extras modeled: ${escHtml(extraBits.join(' + '))}.`;
  document.getElementById('summary-sentence').innerHTML = html;
}

export function updatePresetCosts() {
  document.querySelectorAll('.preset-card').forEach(btn => {
    const presetKey = btn.dataset.preset;
    const p = PRESETS[presetKey];
    if (!p) return;
    const r = simulate({ ...config, ...p, taskProfile: presetKey }, config.model, presetKey);
    const el = btn.querySelector('[data-pcost]');
    if (el) el.textContent = '~' + fmtCost(r.T.cost);
  });
}

export function updatePricingBox() {
  const model = getModel(config.model);
  const provider = getProvider(model.provider);
  const cacheMinLabel = model.cacheUnavailable
    ? 'Unavailable'
    : Number.isFinite(model.minCacheable)
      ? fmtTok(model.minCacheable)
      : Number.isFinite(model.cacheMinEstimate)
        ? `~${fmtTok(model.cacheMinEstimate)} est.`
        : 'Not published';
  const cacheLineLabel = provider.cacheStrategy === 'write-read'
    ? 'Cache write'
    : provider.cacheStrategy === 'explicit-cache'
      ? 'Cached tokens'
      : 'Cached input';
  const cacheRate = model.cacheUnavailable
    ? null
    : config.cacheTTL === '1h'
      ? (model.cache1h ?? model.cachedInput)
      : (model.cache5m ?? model.cachedInput);
  const extraLines = [
    `<div class="price-item"><span class="pl">Provider</span><span class="pv">${escHtml(provider.name)}</span></div>`,
    `<div class="price-item"><span class="pl">Status</span><span class="pv">${escHtml(model.selectorBadge || 'Current')}</span></div>`,
    `<div class="price-item"><span class="pl">Input</span><span class="pv">$${escHtml(model.input)}/MTok</span></div>`,
    `<div class="price-item"><span class="pl">Output</span><span class="pv">$${escHtml(model.output)}/MTok</span></div>`,
    `<div class="price-item"><span class="pl">${escHtml(cacheLineLabel)}</span><span class="pv">${cacheRate == null ? 'n/a' : '$' + escHtml(cacheRate) + '/MTok'}</span></div>`,
    `<div class="price-item"><span class="pl">Search fee</span><span class="pv">${model.searchSupported ? escHtml(fmtCost(getWebSearchUnitCost(model))) + '/call' : 'n/a'}</span></div>`,
    `<div class="price-item"><span class="pl">Max context</span><span class="pv">${escHtml(fmtTok(model.maxContext))}</span></div>`,
    model.maxOutputTokens ? `<div class="price-item"><span class="pl">Max output</span><span class="pv">${escHtml(fmtTok(model.maxOutputTokens))}</span></div>` : '',
    `<div class="price-item"><span class="pl">Min cacheable</span><span class="pv">${escHtml(cacheMinLabel)}</span></div>`,
  ];
  if (model.cacheStoragePerHour) {
    extraLines.push(`<div class="price-item"><span class="pl">Cache storage</span><span class="pv">$${escHtml(model.cacheStoragePerHour)}/MTok-hr</span></div>`);
  }
  if (model.longContextThreshold) {
    extraLines.push(`<div class="price-item"><span class="pl">Long-context</span><span class="pv">&gt;${escHtml(fmtTok(model.longContextThreshold))}</span></div>`);
  }
  extraLines.push(`<div class="price-item"><span class="pl">Reasoning API</span><span class="pv">${escHtml(model.reasoningApiLabel)}</span></div>`);
  document.getElementById('pricing-box').innerHTML = extraLines.join('');
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
    if (pk === active) btn.classList.add('active-preset');
    else if (pk === state.lastPreset && active === null) btn.classList.add('modified');
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
  const res = simulate(config, config.model, config.taskProfile);
  const planning = computePlanning(config, config.model, config.taskProfile);
  const currentModel = getModel(config.model);
  state.lastResult = res;

  animateEl('sum-total', res.T.cost, fmtCost);
  animateEl('sum-input', res.T.crCost + res.T.cwCost + res.T.unCost, fmtCost);
  animateEl('sum-output', res.T.outCost + res.T.thCost, fmtCost);
  animateEl('sum-calls', res.T.apiCalls, v => Math.round(v).toLocaleString());

  const adjTurns = res.scenario.adjustedCfg.turns;
  const avgCost = adjTurns > 0 ? res.T.cost / adjTurns : 0;
  animateEl('sum-avg', avgCost, fmtCost);

  const half = Math.floor(res.turns.length / 2);
  if (half > 0 && res.turns.length > 2) {
    const firstHalf = res.turns.slice(0, half).reduce((s, d) => s + d.turnCost, 0) / half;
    const secondHalf = res.turns.slice(half).reduce((s, d) => s + d.turnCost, 0) / (res.turns.length - half);
    const ratio = secondHalf / Math.max(firstHalf, 0.001);
    const arrow = ratio > 1.15 ? '<span class="trend-arrow up">&#9650;</span> rising'
      : ratio < 0.85 ? '<span class="trend-arrow down">&#9660;</span> falling'
      : '<span class="trend-arrow flat">&#9654;</span> stable';
    document.getElementById('sum-avg-detail').innerHTML = arrow;
  } else {
    document.getElementById('sum-avg-detail').textContent = '\u2014';
  }

  const totalTok = res.T.crTok + res.T.cwTok + res.T.unTok + res.T.outTok + res.T.thTok;
  document.getElementById('sum-tokens').textContent = fmtTok(totalTok);
  const extrasCost = res.T.backgroundCost + res.T.webCost + res.T.execCost;
  document.getElementById('sum-extra-detail').textContent = extrasCost > 0 ? `+ ${fmtCost(extrasCost)} extras` : '';
  document.getElementById('sum-thinking-pct').textContent =
    (res.T.outCost + res.T.thCost) > 0 ? fmtPct((res.T.thCost / (res.T.outCost + res.T.thCost)) * 100, 0) : '0%';
  document.getElementById('sum-calls-detail').textContent =
    `${1 + res.scenario.adjustedCfg.toolRounds} calls/turn x ${res.scenario.adjustedCfg.turns} turns${res.T.apiCalls > res.scenario.adjustedCfg.turns * (1 + res.scenario.adjustedCfg.toolRounds) ? ' + compactions' : ''}`;

  const totalIn = res.T.crTok + res.T.cwTok + res.T.unTok;
  const cacheEff = totalIn > 0 ? (res.T.crTok / totalIn) * 100 : 0;
  document.getElementById('cache-eff-bar').style.width = `${cacheEff.toFixed(1)}%`;
  document.getElementById('cache-eff-pct').textContent = `${cacheEff.toFixed(0)}% cached`;
  document.getElementById('cache-eff-ratio').textContent = `${fmtTok(res.T.crTok)} / ${fmtTok(totalIn)} input`;

  const stackData = res.turns.map(turn => ({
    x: turn.turnNumber || turn.turn + 1,
    compaction: turn.compaction,
    cacheDrop: turn.cacheDrop,
    segments: [
      { value: turn.crCost, color: '#34d39988' },
      { value: turn.cwCost, color: '#60a5fa88' },
      { value: turn.unCost, color: '#f59e0b88' },
      { value: turn.outCost + turn.compCost, color: '#a78bfa88' },
      { value: turn.thCost, color: '#f472b688' },
    ],
  }));
  drawStackedBars(document.getElementById('chart-perturn'), stackData, { height: 200, yFmt: fmtCost });

  const ctxData = res.turns.map(turn => ({
    x: turn.turnNumber || turn.turn + 1,
    y: turn.contextSize,
    compaction: turn.compaction,
    cacheDrop: turn.cacheDrop,
  }));
  drawLine(document.getElementById('chart-ctx'), [{ data: ctxData, color: getModel(config.model).color }], {
    height: 200,
    yFmt: fmtTok,
    limitY: res.scenario.adjustedCfg.contextWindow,
    limitLabel: `${fmtTok(res.scenario.adjustedCfg.contextWindow)} limit`,
    thresholdY: res.scenario.adjustedCfg.contextWindow * AUTO_COMPACT_THRESHOLD,
    thresholdLabel: currentModel.autoCompact ? '95% compact' : '95% context',
  });

  const segments = getCostSegments(res.T).filter(segment => segment.value > 0.0001);
  drawDonut(document.getElementById('chart-donut'), segments);
  document.getElementById('donut-legend').innerHTML = segments.map(segment =>
    `<div class="legend-item"><div class="legend-dot" style="background:${escHtml(segment.color)}"></div>
      <span class="legend-label">${escHtml(segment.label)}</span>
      <span class="legend-value" style="color:${escHtml(segment.color)}">${escHtml(fmtCost(segment.value))}</span></div>`).join('');

  const compareRows = [...planning.comparisonRows].sort((a, b) => a.costPerSuccessfulOutcome - b.costPerSuccessfulOutcome);
  const currentCompareRow = compareRows.find(row => row.modelId === config.model);
  const visibleCompareRows = compareRows.slice(0, 6);
  if (currentCompareRow && !visibleCompareRows.some(row => row.modelId === currentCompareRow.modelId)) {
    visibleCompareRows[visibleCompareRows.length - 1] = currentCompareRow;
  }
  buildModelBars('bar-comparison', visibleCompareRows);
  renderCompareTable(compareRows);

  updateProjections(planning);
  updateSummarySentence(res, planning);
  updatePresetCosts();
  updateCostDrivers(res.T);
  updateContextProjection(res.turns, res.scenario.adjustedCfg);
  updateMixPlanner(planning);
  updatePresetHighlight();
  updateDangerZone();
  syncToURL();

  clearTimeout(update._sensTm);
  update._sensTm = setTimeout(updateSensitivityBadges, 300);
}
