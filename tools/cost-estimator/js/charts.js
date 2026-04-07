import { fmtCost, fmtMins, fmtTok, escHtml } from './formatters.js';

function setupCanvas(cv, h) {
  const dpr = devicePixelRatio || 1;
  const w = cv.parentElement.getBoundingClientRect().width;
  cv.width = w * dpr; cv.height = h * dpr;
  cv.style.height = h + 'px';
  const c = cv.getContext('2d'); c.scale(dpr, dpr);
  return { c, w, h };
}

function ceilNice(v) {
  if (v <= 0) return 1;
  const m = Math.pow(10, Math.floor(Math.log10(v))), n = v / m;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * m;
}

function drawHLine(c, y, x1, x2, color, label) {
  if (y < 5 || y > 400) return;
  c.strokeStyle = color; c.setLineDash([5, 4]); c.lineWidth = 1;
  c.beginPath(); c.moveTo(x1, y); c.lineTo(x2, y); c.stroke(); c.setLineDash([]);
  if (label) { c.fillStyle = color; c.textAlign = 'right'; c.font = '10px "Outfit"'; c.fillText(label, x2, y - 4); }
}

export function drawLine(cv, datasets, opts = {}) {
  const { c, w, h } = setupCanvas(cv, opts.height || 200);
  const P = { t: 16, r: 16, b: 32, l: 62 };
  const cw = w - P.l - P.r, ch = h - P.t - P.b;
  let minX = Number.POSITIVE_INFINITY;
  let mX = 0;
  let mY = 0;
  for (const ds of datasets) {
    for (const p of ds.data) {
      if (p.x < minX) minX = p.x;
      if (p.x > mX) mX = p.x;
      if (p.y > mY) mY = p.y;
    }
  }
  if (!Number.isFinite(minX)) minX = 0;
  if (mY === 0) mY = 1;
  if (opts.limitY) mY = Math.max(mY, opts.limitY * (opts.limitY < mY * 1.3 ? 1.1 : 0.4));
  const nM = ceilNice(mY);
  const tx = v => P.l + ((v - minX) / Math.max(mX - minX, 1)) * cw;
  const ty = v => P.t + ch - (v / nM) * ch;

  c.strokeStyle = 'rgba(255,255,255,0.04)'; c.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const yv = (nM / 5) * i, yp = ty(yv);
    c.beginPath(); c.moveTo(P.l, yp); c.lineTo(w - P.r, yp); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.font = '10px "JetBrains Mono"'; c.textAlign = 'right';
    c.fillText(opts.yFmt ? opts.yFmt(yv) : yv.toFixed(1), P.l - 8, yp + 3.5);
  }
  const xRange = Math.max(mX - minX, 1);
  const xSt = Math.max(1, Math.ceil(xRange / 8));
  c.fillStyle = 'rgba(255,255,255,0.25)'; c.textAlign = 'center'; c.font = '10px "JetBrains Mono"';
  for (let x = minX; x <= mX; x += xSt) c.fillText(x, tx(x), h - P.b + 18);

  if (opts.thresholdY) drawHLine(c, ty(opts.thresholdY), P.l, w - P.r, 'rgba(245,158,11,0.30)', opts.thresholdLabel);
  if (opts.limitY) drawHLine(c, ty(opts.limitY), P.l, w - P.r, 'rgba(248,113,113,0.35)', opts.limitLabel);

  for (const ds of datasets) {
    if (ds.data.length < 2) continue;
    c.beginPath(); c.moveTo(tx(ds.data[0].x), ty(ds.data[0].y));
    for (let i = 1; i < ds.data.length; i++) c.lineTo(tx(ds.data[i].x), ty(ds.data[i].y));
    c.lineTo(tx(ds.data[ds.data.length - 1].x), ty(0)); c.lineTo(tx(ds.data[0].x), ty(0)); c.closePath();
    const g = c.createLinearGradient(0, P.t, 0, P.t + ch);
    g.addColorStop(0, ds.color + '25'); g.addColorStop(1, ds.color + '02');
    c.fillStyle = g; c.fill();
    c.beginPath(); c.moveTo(tx(ds.data[0].x), ty(ds.data[0].y));
    for (let i = 1; i < ds.data.length; i++) c.lineTo(tx(ds.data[i].x), ty(ds.data[i].y));
    c.strokeStyle = ds.color; c.lineWidth = 2; c.stroke();
    for (const p of ds.data) {
      if (p.compaction) { c.fillStyle = '#f59e0b'; c.beginPath(); c.arc(tx(p.x), ty(p.y), 5, 0, Math.PI * 2); c.fill(); }
      if (p.cacheDrop) { c.fillStyle = '#f87171'; c.beginPath(); c.arc(tx(p.x), ty(p.y), 5, 0, Math.PI * 2); c.fill(); }
    }
  }

  // Smart annotations - label top 3 cost spikes
  if (opts.annotate && datasets[0]) {
    const data = datasets[0].data;
    const sorted = [...data].sort((a, b) => (b.spike || 0) - (a.spike || 0));
    const top = sorted.slice(0, 3).filter(d => (d.spike || 0) > 0);
    c.font = '600 9px "Outfit"'; c.textAlign = 'center';
    for (const d of top) {
      const px = tx(d.x), py = ty(d.y);
      const label = d.compaction ? 'COMPACT' : d.cacheDrop ? 'CACHE DROP' : 'SPIKE';
      const col = d.compaction ? '#f59e0b' : d.cacheDrop ? '#f87171' : '#a78bfa';
      c.fillStyle = col + 'cc';
      const tw = c.measureText(label).width;
      c.fillRect(px - tw / 2 - 4, py - 22, tw + 8, 14);
      c.fillStyle = '#fff'; c.fillText(label, px, py - 12);
    }
  }

  // Legend
  const markers = [];
  if (datasets[0]?.data.some(p => p.compaction)) markers.push({ c: '#f59e0b', l: 'Compaction' });
  if (datasets[0]?.data.some(p => p.cacheDrop)) markers.push({ c: '#f87171', l: 'Cache Drop' });
  let lx = P.l + 6;
  for (const mk of markers) {
    c.fillStyle = mk.c; c.beginPath(); c.arc(lx + 5, P.t + 9, 4, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.font = '10px "Outfit"'; c.textAlign = 'left';
    c.fillText(mk.l, lx + 13, P.t + 13); lx += c.measureText(mk.l).width + 28;
  }
}

export function drawStackedBars(cv, data, opts = {}) {
  const { c, w, h } = setupCanvas(cv, opts.height || 200);
  const P = { t: 16, r: 16, b: 32, l: 62 };
  const cw = w - P.l - P.r, ch = h - P.t - P.b;
  let mY = 0;
  for (const d of data) { let s = 0; for (const seg of d.segments) s += seg.value; if (s > mY) mY = s; }
  if (mY === 0) mY = 1;
  const nM = ceilNice(mY);
  const ty = v => P.t + ch - (v / nM) * ch;

  c.strokeStyle = 'rgba(255,255,255,0.04)'; c.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const yv = (nM / 4) * i, yp = ty(yv);
    c.beginPath(); c.moveTo(P.l, yp); c.lineTo(w - P.r, yp); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.font = '10px "JetBrains Mono"'; c.textAlign = 'right';
    c.fillText(opts.yFmt ? opts.yFmt(yv) : yv.toFixed(2), P.l - 8, yp + 3.5);
  }

  const gap = cw / data.length, bW = Math.max(2, Math.min(12, gap * 0.65));
  for (let i = 0; i < data.length; i++) {
    const d = data[i], cx = P.l + gap * i + gap / 2;
    let yBottom = P.t + ch;
    for (const seg of d.segments) {
      if (seg.value <= 0) continue;
      const segH = Math.max(1, (seg.value / nM) * ch);
      c.fillStyle = seg.color;
      c.fillRect(cx - bW / 2, yBottom - segH, bW, segH);
      yBottom -= segH;
    }
    if (d.compaction || d.cacheDrop) {
      const totalH = d.segments.reduce((s, seg) => s + (seg.value / nM) * ch, 0);
      c.strokeStyle = d.compaction ? '#f59e0b88' : '#f8717188';
      c.lineWidth = 1.5;
      c.strokeRect(cx - bW / 2 - 1, P.t + ch - totalH - 1, bW + 2, totalH + 2);
    }
  }

  const xSt = Math.max(1, Math.ceil(data.length / 10));
  c.fillStyle = 'rgba(255,255,255,0.25)'; c.textAlign = 'center'; c.font = '10px "JetBrains Mono"';
  for (let i = 0; i < data.length; i += xSt) c.fillText(data[i].x, P.l + gap * i + gap / 2, h - P.b + 16);

  // Legend
  const labels = [
    { c: '#34d399', l: 'Cache Read' }, { c: '#60a5fa', l: 'Cache Write' },
    { c: '#f59e0b', l: 'Uncached' }, { c: '#a78bfa', l: 'Output' }, { c: '#f472b6', l: 'Think' },
  ];
  let lx = P.l + 4;
  c.font = '9px "Outfit"';
  for (const lb of labels) {
    c.fillStyle = lb.c; c.fillRect(lx, P.t + 2, 7, 7);
    c.fillStyle = 'rgba(255,255,255,0.4)'; c.textAlign = 'left';
    c.fillText(lb.l, lx + 10, P.t + 9); lx += c.measureText(lb.l).width + 18;
  }
}

export function drawCacheStrip(cv, data) {
  const { c, w, h } = setupCanvas(cv, 28);
  const P = { l: 62, r: 16 };
  const cw = w - P.l - P.r;
  if (!data.length) return;
  const gap = cw / data.length, bW = Math.max(2, gap - 1);
  c.fillStyle = 'rgba(255,255,255,0.15)'; c.font = '9px "Outfit"'; c.textAlign = 'right';
  c.fillText('CACHE', P.l - 8, 18);
  for (let i = 0; i < data.length; i++) {
    const d = data[i], cx = P.l + gap * i;
    if (d.compaction) {
      c.fillStyle = '#f59e0b55'; c.fillRect(cx, 4, bW, 20);
    } else if (d.warmAtStart) {
      c.fillStyle = '#34d39944'; c.fillRect(cx, 4, bW, 20);
    } else {
      c.fillStyle = '#f8717144'; c.fillRect(cx, 4, bW, 20);
    }
  }
  const lx = P.l + cw - 120;
  c.font = '8px "Outfit"';
  [{ c: '#34d399', l: 'Warm' }, { c: '#f87171', l: 'Cold' }, { c: '#f59e0b', l: 'Compact' }].forEach((lb, i) => {
    const x = lx + i * 42;
    c.fillStyle = lb.c; c.fillRect(x, 1, 6, 6);
    c.fillStyle = 'rgba(255,255,255,0.4)'; c.textAlign = 'left'; c.fillText(lb.l, x + 8, 7);
  });
}

export function drawDonut(cv, segs) {
  const { c, w, h } = setupCanvas(cv, 160);
  const cx = w / 2, cy = h / 2, oR = Math.min(w, h) / 2 - 8, iR = oR * 0.62;
  const tot = segs.reduce((s, x) => s + x.value, 0);
  if (tot === 0) return;
  let a = -Math.PI / 2;
  for (const s of segs) {
    const sw = (s.value / tot) * Math.PI * 2;
    c.beginPath(); c.arc(cx, cy, oR, a, a + sw); c.arc(cx, cy, iR, a + sw, a, true); c.closePath();
    c.fillStyle = s.color; c.fill(); a += sw;
  }
  c.fillStyle = 'rgba(255,255,255,0.85)'; c.font = 'bold 15px "JetBrains Mono"';
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(fmtCost(tot), cx, cy - 5);
  c.font = '10px "Outfit"'; c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillText('total', cx, cy + 12);
}

export function buildModelBars(id, rows) {
  const el = document.getElementById(id);
  const bars = rows.slice(0, 6).map(row => ({
    label: row.model.shortName,
    value: row.costPerSuccessfulOutcome,
    raw: row.rawSession,
    time: row.timeToGoodOutcomeMins,
    color: row.model.color,
  }));
  const mx = Math.max(...bars.map(b => b.value), 0.01);
  el.innerHTML = '';
  for (const b of bars) {
    const it = document.createElement('div');
    it.className = 'bar-item';
    const pct = (b.value / mx) * 130;
    it.innerHTML = `<div class="bar-amount" style="color:${escHtml(b.color)}">${escHtml(fmtCost(b.value))}</div>
      <div class="bar-fill" style="height:${pct}px;background:${escHtml(b.color)}40;border:1.5px solid ${escHtml(b.color)}"></div>
      <div class="bar-label">${escHtml(b.label)}</div>
      <div class="bar-sub">${escHtml(fmtMins(b.time))}</div>`;
    el.appendChild(it);
  }
}
