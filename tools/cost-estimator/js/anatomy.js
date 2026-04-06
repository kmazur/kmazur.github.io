import { fmtCost, fmtTok, escHtml } from './formatters.js';

export function showAnatomy(turnData) {
  const ov = document.getElementById('anatomy-overlay');
  ov.classList.add('open');
  const t = turnData;
  document.getElementById('anatomy-title').innerHTML =
    `Turn ${escHtml(t.turn)} Anatomy <span class="badge ${t.warmAtStart ? 'warm' : 'cold'}">${t.warmAtStart ? 'WARM' : 'COLD'} cache</span>`;
  document.getElementById('anatomy-meta').innerHTML =
    `Context: <span>${escHtml(fmtTok(t.contextSize))}</span> | API calls: <span>${escHtml(t.nCalls)}</span> | Turn cost: <span>${escHtml(fmtCost(t.turnCost))}</span>`
    + (t.compaction ? ' | <span style="color:#f59e0b">COMPACTION</span>' : '')
    + (t.cacheDrop ? ' | <span style="color:#f87171">CACHE DROP</span>' : '');

  let html = '<table class="anatomy-table"><thead><tr><th>Call</th><th>Input</th><th>Cache Read</th><th>Cache Write</th><th>Uncached</th><th>Output</th><th>Think</th><th>Total</th></tr></thead><tbody>';
  if (t.compDetail) {
    const d = t.compDetail;
    html += `<tr style="background:rgba(245,158,11,0.05)"><td>Compact</td><td>${fmtTok(d.inputTokens)}</td>
      <td class="cr">${fmtCost(d.crCost)}</td><td class="cw">${fmtCost(d.cwCost)}</td>
      <td class="un">${fmtCost(d.unCost)}</td><td class="out">${fmtCost(d.outCost)}</td>
      <td>&mdash;</td><td class="tot">${fmtCost(d.totalCost)}</td></tr>`;
  }
  for (const call of t.apiCalls) {
    const label = call.isLast ? `${call.callIndex + 1} (final)` : `${call.callIndex + 1} (tool)`;
    html += `<tr><td>${label}</td><td>${fmtTok(call.inputTokens)}</td>
      <td class="cr">${fmtCost(call.crCost)}</td><td class="cw">${fmtCost(call.cwCost)}</td>
      <td class="un">${fmtCost(call.unCost)}</td><td class="out">${fmtCost(call.outCost)}</td>
      <td class="th">${call.thinkingTokens > 0 ? fmtCost(call.thCost) : '&mdash;'}</td>
      <td class="tot">${fmtCost(call.totalCost)}</td></tr>`;
  }
  html += `<tr class="total-row"><td>TURN TOTAL</td><td>&mdash;</td>
    <td class="cr">${fmtCost(t.crCost)}</td><td class="cw">${fmtCost(t.cwCost)}</td>
    <td class="un">${fmtCost(t.unCost)}</td><td class="out">${fmtCost(t.outCost)}</td>
    <td class="th">${fmtCost(t.thCost)}</td><td class="tot">${fmtCost(t.turnCost)}</td></tr>`;
  html += '</tbody></table>';
  document.getElementById('anatomy-body').innerHTML = html;
}

export function closeAnatomy() {
  document.getElementById('anatomy-overlay').classList.remove('open');
}
