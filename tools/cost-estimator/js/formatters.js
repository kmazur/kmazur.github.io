export function fmtCost(v) {
  if (v >= 1000) return '$' + (v / 1000).toFixed(1) + 'K';
  if (v >= 100) return '$' + v.toFixed(0);
  if (v >= 10) return '$' + v.toFixed(1);
  if (v >= 1) return '$' + v.toFixed(2);
  if (v >= 0.01) return '$' + v.toFixed(3);
  return '$' + v.toFixed(4);
}

export function fmtTok(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return '' + n;
}

export function fmtComma(n) {
  return (+n).toLocaleString('en-US');
}

export function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const SLIDER_FORMATTERS = {
  turns: v => v,
  sysPrompt: v => fmtComma(+v),
  userMsg: v => fmtComma(+v),
  responseTokens: v => fmtComma(+v),
  thinkingTokens: v => fmtComma(+v),
  toolRounds: v => v,
  toolResult: v => fmtComma(+v),
  timeBetween: v => v + ' min',
  cacheDrops: v => v,
  compactions: v => v,
  compactRatio: v => Math.round(v * 100) + '%',
  backgroundCost: v => fmtCost(+v),
  webSearches: v => v,
  sessPerDay: v => v,
};
