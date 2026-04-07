import { config } from './state.js';
import { SLIDER_KEYS } from './constants.js';
import { SLIDER_FORMATTERS } from './formatters.js';
import { loadFromURL } from './url-state.js';
import { applyModelConstraints, update, updatePricingBox, updateIdleLabel } from './ui.js';
import { bindEvents } from './events.js';

function restoreUIFromConfig() {
  for (const key of SLIDER_KEYS) {
    const el = document.getElementById(key);
    if (!el) continue;
    el.value = config[key];
    const display = document.getElementById(`v-${key}`);
    if (display && SLIDER_FORMATTERS[key]) {
      const formatted = SLIDER_FORMATTERS[key](config[key]);
      display.textContent = formatted;
      el.setAttribute('aria-valuetext', String(formatted));
    }
  }
  document.getElementById('budgetInput').value = config.monthlyBudget;
  document.getElementById('sess-count').textContent = config.sessPerDay;
  document.getElementById('autoCompact').checked = config.autoCompact;
}

if (typeof document !== 'undefined') {
  const loaded = loadFromURL();
  if (loaded) restoreUIFromConfig();
  applyModelConstraints();
  restoreUIFromConfig();
  bindEvents();
  updatePricingBox();
  updateIdleLabel();
  update();
}
