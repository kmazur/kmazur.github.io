import { config } from './state.js';

const CONFIG_KEYS = ['model', 'cacheTTL', 'contextWindow', 'turns', 'sysPrompt', 'userMsg',
  'responseTokens', 'thinkingTokens', 'toolRounds', 'toolResult', 'timeBetween', 'cacheDrops',
  'compactions', 'compactRatio', 'autoCompact', 'backgroundCost', 'webSearches'];

export function syncToURL() {
  if (typeof history === 'undefined' || typeof location === 'undefined') return;
  try {
    const data = {};
    for (const k of CONFIG_KEYS) data[k] = config[k];
    history.replaceState(null, '', '#' + btoa(JSON.stringify(data)));
  } catch (e) { /* ignore */ }
}

export function loadFromURL() {
  if (typeof location === 'undefined') return false;
  if (!location.hash || location.hash.length < 3) return false;
  try {
    const s = JSON.parse(atob(location.hash.slice(1)));
    for (const k of CONFIG_KEYS) {
      if (k in s) config[k] = s[k];
    }
    return true;
  } catch (e) { return false; }
}

export function shareURL() {
  if (typeof navigator === 'undefined' || typeof location === 'undefined') return;
  syncToURL();
  navigator.clipboard.writeText(location.href).then(() => {
    const btn = document.getElementById('shareBtn');
    btn.textContent = 'Copied!'; btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Share'; btn.classList.remove('copied'); }, 1500);
  });
}
