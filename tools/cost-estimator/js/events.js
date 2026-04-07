import { MODEL_ORDER, PRESETS, PROVIDERS, SLIDER_KEYS } from './constants.js';
import { config, state } from './state.js';
import { SLIDER_FORMATTERS, fmtCost, fmtTok } from './formatters.js';
import { showAnatomy, closeAnatomy } from './anatomy.js';
import { applyModelConstraints, update, updatePricingBox, updateIdleLabel } from './ui.js';
import { shareURL } from './url-state.js';

function parseControlValue(key, rawValue) {
  const value = parseFloat(rawValue);
  if (['turns', 'sysPrompt', 'userMsg', 'responseTokens', 'thinkingTokens', 'toolRounds', 'toolResult', 'cacheDrops', 'compactions', 'webSearches', 'execSessions', 'hourlyRate', 'timeSavedMins', 'workdaysPerMonth', 'interruptions', 'retryRate', 'parallelAgents', 'mixQuickFix', 'mixFeature', 'mixReview', 'mixRefactor', 'mixExploration', 'mixVibe'].includes(key)) {
    return Math.round(value);
  }
  return value;
}

function setControlDisplay(key) {
  const el = document.getElementById(key);
  const display = document.getElementById(`v-${key}`);
  if (!el || !display || !SLIDER_FORMATTERS[key]) return;
  const formatted = SLIDER_FORMATTERS[key](config[key]);
  display.textContent = formatted;
  el.setAttribute('aria-valuetext', String(formatted));
}

function setProvider(providerId) {
  const provider = PROVIDERS[providerId];
  if (!provider) return;
  config.provider = providerId;
  const firstModel = MODEL_ORDER.find(id => id.startsWith(providerId === 'google' ? 'gemini' : providerId === 'openai' ? 'gpt' : 'claude'));
  if (firstModel) config.model = firstModel;
  config.backgroundCost = provider.defaultBackgroundCost;
  config.execSessions = 0;
  const bgInput = document.getElementById('backgroundCost');
  const execInput = document.getElementById('execSessions');
  if (bgInput) bgInput.value = config.backgroundCost;
  if (execInput) execInput.value = config.execSessions;
  setControlDisplay('backgroundCost');
  setControlDisplay('execSessions');
}

function mkTip(cvId, tipId, fmt) {
  const cv = document.getElementById(cvId);
  const tip = document.getElementById(tipId);
  cv.addEventListener('mousemove', e => {
    const r = cv.getBoundingClientRect();
    const x = e.clientX - r.left;
    const pad = 62;
    const cw = r.width - pad - 16;
    if (x < pad || x > pad + cw || !state.lastResult?.turns?.length) {
      tip.classList.remove('visible');
      return;
    }
    const idx = Math.min(Math.max(Math.floor(((x - pad) / cw) * state.lastResult.turns.length), 0), state.lastResult.turns.length - 1);
    const point = state.lastResult.turns[idx];
    if (!point) {
      tip.classList.remove('visible');
      return;
    }
    tip.innerHTML = fmt(point);
    tip.classList.add('visible');
    const tw = tip.offsetWidth;
    tip.style.left = `${(x + tw + 20 > r.width) ? x - tw - 12 : x + 12}px`;
    tip.style.top = `${e.clientY - r.top - 30}px`;
  });
  cv.addEventListener('mouseleave', () => tip.classList.remove('visible'));
}

export function bindEvents() {
  document.getElementById('shareBtn').addEventListener('click', shareURL);

  document.addEventListener('click', e => {
    const providerBtn = e.target.closest('.provider-btn');
    if (providerBtn) {
      setProvider(providerBtn.dataset.provider);
      updatePricingBox();
      updateIdleLabel();
      update();
      return;
    }

    const modelBtn = e.target.closest('.model-btn');
    if (modelBtn && modelBtn.dataset.model) {
      config.model = modelBtn.dataset.model;
      config.provider = MODEL_ORDER.find(id => id === config.model)?.startsWith('gpt') ? 'openai'
        : config.model.startsWith('gemini') ? 'google' : 'anthropic';
      applyModelConstraints();
      updatePricingBox();
      update();
      return;
    }

    const cacheBtn = e.target.closest('#tg-cache .toggle-btn');
    if (cacheBtn) {
      config.cacheTTL = cacheBtn.dataset.val;
      updatePricingBox();
      updateIdleLabel();
      update();
      return;
    }

    const ctxBtn = e.target.closest('#tg-ctx .toggle-btn');
    if (ctxBtn && !ctxBtn.disabled) {
      config.contextWindow = +ctxBtn.dataset.val;
      update();
      return;
    }

    const taskBtn = e.target.closest('#tg-task .toggle-btn');
    if (taskBtn) {
      config.taskProfile = taskBtn.dataset.val;
      update();
      return;
    }

    const effortBtn = e.target.closest('#tg-effort .toggle-btn');
    if (effortBtn) {
      config.effort = effortBtn.dataset.val;
      update();
      return;
    }

    const toolMixBtn = e.target.closest('#tg-toolmix .toggle-btn');
    if (toolMixBtn) {
      config.toolMix = toolMixBtn.dataset.val;
      update();
      return;
    }

    const uncertaintyBtn = e.target.closest('#tg-uncertainty .toggle-btn');
    if (uncertaintyBtn) {
      config.uncertainty = uncertaintyBtn.dataset.val;
      update();
      return;
    }

    const presetBtn = e.target.closest('.preset-card');
    if (presetBtn) {
      const presetKey = presetBtn.dataset.preset;
      const preset = PRESETS[presetKey];
      if (!preset) return;
      state.lastPreset = presetKey;
      config.taskProfile = presetKey;
      for (const [k, v] of Object.entries(preset)) {
        config[k] = v;
        const input = document.getElementById(k);
        if (input) input.value = v;
        setControlDisplay(k);
      }
      update();
      return;
    }
  });

  for (const key of SLIDER_KEYS) {
    const el = document.getElementById(key);
    if (!el) continue;
    el.addEventListener('input', () => {
      config[key] = parseControlValue(key, el.value);
      setControlDisplay(key);
      update();
    });
  }

  document.getElementById('sess-up').addEventListener('click', () => {
    config.sessPerDay = Math.min(30, (config.sessPerDay || 4) + 1);
    update();
  });
  document.getElementById('sess-down').addEventListener('click', () => {
    config.sessPerDay = Math.max(1, (config.sessPerDay || 4) - 1);
    update();
  });
  document.getElementById('budgetInput').addEventListener('input', e => {
    const raw = parseFloat(e.target.value);
    config.monthlyBudget = Number.isFinite(raw) ? raw : 0;
    update();
  });
  document.getElementById('autoCompact').addEventListener('change', e => {
    config.autoCompact = e.target.checked;
    update();
  });

  document.querySelectorAll('.section-header').forEach(header => {
    header.addEventListener('click', () => header.parentElement.classList.toggle('collapsed'));
  });

  let resizeTimer;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(update, 100);
  }).observe(document.querySelector('.main'));

  mkTip('chart-ctx', 'tip-ctx', point =>
    `Turn ${point.turn} | context: ${fmtTok(point.contextSize)} tokens${point.compaction ? ' [COMPACTED]' : ''}`);

  const ptCv = document.getElementById('chart-perturn');
  const ptTip = document.getElementById('tip-perturn');
  ptCv.addEventListener('mousemove', e => {
    if (!state.lastResult?.turns?.length) return;
    const r = ptCv.getBoundingClientRect();
    const x = e.clientX - r.left;
    const pad = 62;
    const cw = r.width - pad - 16;
    if (x < pad || x > pad + cw) {
      ptTip.classList.remove('visible');
      return;
    }
    const idx = Math.min(Math.max(Math.floor(((x - pad) / cw) * state.lastResult.turns.length), 0), state.lastResult.turns.length - 1);
    const point = state.lastResult.turns[idx];
    if (!point) {
      ptTip.classList.remove('visible');
      return;
    }
    ptTip.innerHTML = `Turn ${point.turn} | ${fmtCost(point.turnCost)}<br>`
      + `<span style="color:#34d399">CA:${fmtCost(point.crCost)}</span> `
      + `<span style="color:#60a5fa">SET:${fmtCost(point.cwCost)}</span> `
      + `<span style="color:#f59e0b">UN:${fmtCost(point.unCost)}</span> `
      + `<span style="color:#a78bfa">OUT:${fmtCost(point.outCost)}</span> `
      + `<span style="color:#f472b6">TH:${fmtCost(point.thCost)}</span>`
      + (point.compaction ? ' <span style="color:#f59e0b">[COMPACT]</span>' : '')
      + (point.cacheDrop ? ' <span style="color:#f87171">[DROP]</span>' : '')
      + '<br><span style="color:var(--text-muted)">Click for full anatomy</span>';
    ptTip.classList.add('visible');
    const tw = ptTip.offsetWidth;
    ptTip.style.left = `${(x + tw + 20 > r.width) ? x - tw - 12 : x + 12}px`;
    ptTip.style.top = `${e.clientY - r.top - 50}px`;
  });
  ptCv.addEventListener('mouseleave', () => ptTip.classList.remove('visible'));
  ptCv.addEventListener('click', e => {
    if (!state.lastResult?.turns?.length) return;
    const r = ptCv.getBoundingClientRect();
    const x = e.clientX - r.left;
    const pad = 62;
    const cw = r.width - pad - 16;
    if (x < pad || x > pad + cw) return;
    const idx = Math.min(Math.max(Math.floor(((x - pad) / cw) * state.lastResult.turns.length), 0), state.lastResult.turns.length - 1);
    if (state.lastResult.turns[idx]) showAnatomy(state.lastResult.turns[idx]);
  });
  ptCv.style.cursor = 'pointer';

  document.getElementById('anatomy-close-btn').addEventListener('click', closeAnatomy);
  document.getElementById('anatomy-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeAnatomy();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAnatomy();
  });
}
