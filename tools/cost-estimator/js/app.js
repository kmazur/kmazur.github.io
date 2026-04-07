import { config } from './state.js';
import { SLIDER_KEYS } from './constants.js';
import { SLIDER_FORMATTERS } from './formatters.js';
import { loadFromURL } from './url-state.js';
import { applyModelConstraints, update, updatePricingBox, updateIdleLabel } from './ui.js';
import { bindEvents } from './events.js';

function restoreUIFromConfig() {
  // Model
  document.querySelectorAll('.model-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.model === config.model);
  });
  // TTL
  document.querySelectorAll('#tg-cache .toggle-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.val === config.cacheTTL);
  });
  // Context window
  document.querySelectorAll('#tg-ctx .toggle-btn').forEach(b => {
    b.classList.toggle('active', +b.dataset.val === config.contextWindow);
  });
  document.querySelectorAll('#tg-toolmix .toggle-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.val === config.toolMix);
  });
  document.querySelectorAll('#tg-uncertainty .toggle-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.val === config.uncertainty);
  });
  // Sliders
  for (const key of SLIDER_KEYS) {
    const el = document.getElementById(key); if (!el) continue;
    el.value = config[key];
    const d = document.getElementById('v-' + key);
    if (d && SLIDER_FORMATTERS[key]) {
      const formatted = SLIDER_FORMATTERS[key](config[key]);
      d.textContent = formatted;
      el.setAttribute('aria-valuetext', String(formatted));
    }
  }
  document.getElementById('budgetInput').value = config.monthlyBudget;
  document.getElementById('sess-count').textContent = config.sessPerDay;
  document.getElementById('autoCompact').checked = config.autoCompact;
}

// Init in browser contexts only so modules remain importable in Node-based checks.
if (typeof document !== 'undefined') {
  const loaded = loadFromURL();
  applyModelConstraints();
  if (loaded) restoreUIFromConfig();
  bindEvents();
  updatePricingBox();
  updateIdleLabel();
  update();
}
