import { config } from './state.js';

export function syncToURL() {
  const { model, cacheTTL, contextWindow, turns, sysPrompt, userMsg, responseTokens, thinkingTokens,
    toolRounds, toolResult, timeBetween, cacheDrops, compactions, compactRatio, autoCompact } = config;
  try {
    history.replaceState(null, '',
      '#' + btoa(JSON.stringify({
        model, cacheTTL, contextWindow, turns, sysPrompt, userMsg,
        responseTokens, thinkingTokens, toolRounds, toolResult, timeBetween, cacheDrops,
        compactions, compactRatio, autoCompact,
      })));
  } catch (e) { /* ignore */ }
}

export function loadFromURL() {
  if (!location.hash || location.hash.length < 3) return false;
  try {
    const s = JSON.parse(atob(location.hash.slice(1)));
    Object.assign(config, s);
    return true;
  } catch (e) { return false; }
}

export function shareURL() {
  syncToURL();
  navigator.clipboard.writeText(location.href).then(() => {
    const btn = document.getElementById('shareBtn');
    btn.textContent = 'Copied!'; btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Share'; btn.classList.remove('copied'); }, 1500);
  });
}
