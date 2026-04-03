import { config } from './state.js';
import { SLIDER_FORMATTERS } from './formatters.js';
import { loadFromURL, shareURL } from './url-state.js';
import { update, updatePricingBox, updateIdleLabel } from './ui.js';
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
  // Sliders
  for (const key of ['turns', 'sysPrompt', 'userMsg', 'responseTokens', 'thinkingTokens',
    'toolRounds', 'toolResult', 'timeBetween', 'cacheDrops', 'compactions', 'compactRatio']) {
    const el = document.getElementById(key); if (!el) continue;
    el.value = config[key];
    const d = document.getElementById('v-' + key);
    if (d && SLIDER_FORMATTERS[key]) d.textContent = SLIDER_FORMATTERS[key](config[key]);
  }
  document.getElementById('autoCompact').checked = config.autoCompact;
}

// Expose shareURL globally for the onclick handler
window.shareURL = shareURL;

// Init
const loaded = loadFromURL();
if (loaded) restoreUIFromConfig();
bindEvents();
updatePricingBox();
updateIdleLabel();
update();
