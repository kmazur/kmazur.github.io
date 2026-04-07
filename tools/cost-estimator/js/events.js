import { INTEGER_SLIDER_KEYS, PRESETS, SLIDER_KEYS } from './constants.js';
import { config, state } from './state.js';
import { SLIDER_FORMATTERS, fmtCost, fmtTok } from './formatters.js';
import { showAnatomy, closeAnatomy } from './anatomy.js';
import { applyModelConstraints, update, updatePricingBox, updateIdleLabel } from './ui.js';
import { shareURL } from './url-state.js';

function parseControlValue(key, rawValue) {
  const value = parseFloat(rawValue);
  return INTEGER_SLIDER_KEYS.has(key) ? Math.round(value) : value;
}

function mkTip(cvId, tipId, fmt) {
  const cv = document.getElementById(cvId), tip = document.getElementById(tipId);
  cv.addEventListener('mousemove', e => {
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left;
    const pad = 62, cw = r.width - pad - 16;
    if (x < pad || x > pad + cw) { tip.classList.remove('visible'); return; }
    if (!state.lastResult) { tip.classList.remove('visible'); return; }
    const d = state.lastResult.turns; if (!d.length) { tip.classList.remove('visible'); return; }
    const idx = Math.min(Math.max(Math.floor(((x - pad) / cw) * d.length), 0), d.length - 1);
    const cl = d[idx];
    if (!cl) { tip.classList.remove('visible'); return; }
    tip.innerHTML = fmt(cl); tip.classList.add('visible');
    const tw = tip.offsetWidth;
    tip.style.left = ((x + tw + 20 > r.width) ? x - tw - 12 : x + 12) + 'px';
    tip.style.top = (e.clientY - r.top - 30) + 'px';
  });
  cv.addEventListener('mouseleave', () => tip.classList.remove('visible'));
}

export function bindEvents() {
  // Share button
  document.getElementById('shareBtn').addEventListener('click', shareURL);

  // Model buttons
  document.querySelectorAll('.model-btn').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); config.model = btn.dataset.model;
    applyModelConstraints();
    updatePricingBox(); update();
  }));

  // Toggle groups
  document.querySelectorAll('#tg-cache .toggle-btn').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('#tg-cache .toggle-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active'); config.cacheTTL = b.dataset.val;
    updatePricingBox(); updateIdleLabel(); update();
  }));
  document.querySelectorAll('#tg-ctx .toggle-btn').forEach(b => b.addEventListener('click', () => {
    if (b.disabled) return;
    document.querySelectorAll('#tg-ctx .toggle-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active'); config.contextWindow = +b.dataset.val; update();
  }));

  // Sliders
  for (const key of SLIDER_KEYS) {
    const el = document.getElementById(key); if (!el) continue;
    el.addEventListener('input', () => {
      config[key] = parseControlValue(key, el.value);
      const d = document.getElementById('v-' + key);
      if (d && SLIDER_FORMATTERS[key]) {
        const formatted = SLIDER_FORMATTERS[key](config[key]);
        d.textContent = formatted;
        el.setAttribute('aria-valuetext', String(formatted));
      }
      update();
    });
  }
  // Sessions/day stepper
  document.getElementById('sess-up').addEventListener('click', () => {
    state.sessPerDay = Math.min(30, (state.sessPerDay || 4) + 1); update();
  });
  document.getElementById('sess-down').addEventListener('click', () => {
    state.sessPerDay = Math.max(1, (state.sessPerDay || 4) - 1); update();
  });
  document.getElementById('budgetInput').addEventListener('input', () => update());
  document.getElementById('autoCompact').addEventListener('change', e => { config.autoCompact = e.target.checked; update(); });

  // Presets
  document.querySelectorAll('.preset-card').forEach(btn => btn.addEventListener('click', () => {
    const p = PRESETS[btn.dataset.preset]; if (!p) return;
    state.lastPreset = btn.dataset.preset;
    for (const [k, v] of Object.entries(p)) {
      config[k] = v;
      const el = document.getElementById(k);
      if (el) {
        el.value = v;
        const d = document.getElementById('v-' + k);
        if (d && SLIDER_FORMATTERS[k]) {
          const formatted = SLIDER_FORMATTERS[k](v);
          d.textContent = formatted;
          el.setAttribute('aria-valuetext', String(formatted));
        }
      }
    }
    update();
  }));

  // Collapse sections
  document.querySelectorAll('.section-header').forEach(h =>
    h.addEventListener('click', () => h.parentElement.classList.toggle('collapsed')));

  // Resize
  let rt; new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(update, 100); })
    .observe(document.querySelector('.main'));

  // Tooltips
  mkTip('chart-ctx', 'tip-ctx', d =>
    `Turn ${d.turn}  |  context: ${fmtTok(d.contextSize)} tokens`
    + (d.compaction ? ' [COMPACTED]' : ''));

  // Stacked bar tooltip + click
  const ptCv = document.getElementById('chart-perturn');
  const ptTip = document.getElementById('tip-perturn');
  ptCv.addEventListener('mousemove', e => {
    if (!state.lastResult) return;
    const r = ptCv.getBoundingClientRect(), x = e.clientX - r.left;
    const pad = 62, cw = r.width - pad - 16;
    if (x < pad || x > pad + cw) { ptTip.classList.remove('visible'); return; }
    const d = state.lastResult.turns; if (!d.length) { ptTip.classList.remove('visible'); return; }
    const idx = Math.min(Math.max(Math.floor(((x - pad) / cw) * d.length), 0), d.length - 1);
    const cl = d[idx]; if (!cl) { ptTip.classList.remove('visible'); return; }
    ptTip.innerHTML = `Turn ${cl.turn} | ${fmtCost(cl.turnCost)}<br>`
      + `<span style="color:#34d399">CR:${fmtCost(cl.crCost)}</span> `
      + `<span style="color:#60a5fa">CW:${fmtCost(cl.cwCost)}</span> `
      + `<span style="color:#f59e0b">UN:${fmtCost(cl.unCost)}</span> `
      + `<span style="color:#a78bfa">OUT:${fmtCost(cl.outCost)}</span> `
      + `<span style="color:#f472b6">TH:${fmtCost(cl.thCost)}</span>`
      + (cl.compaction ? ' <span style="color:#f59e0b">[COMPACT]</span>' : '')
      + (cl.cacheDrop ? ' <span style="color:#f87171">[DROP]</span>' : '')
      + '<br><span style="color:var(--text-muted)">Click for full anatomy</span>';
    ptTip.classList.add('visible');
    const tw = ptTip.offsetWidth;
    ptTip.style.left = ((x + tw + 20 > r.width) ? x - tw - 12 : x + 12) + 'px';
    ptTip.style.top = (e.clientY - r.top - 50) + 'px';
  });
  ptCv.addEventListener('mouseleave', () => ptTip.classList.remove('visible'));
  ptCv.addEventListener('click', e => {
    if (!state.lastResult) return;
    const r = ptCv.getBoundingClientRect(), x = e.clientX - r.left;
    const pad = 62, cw = r.width - pad - 16;
    if (x < pad || x > pad + cw) return;
    const d = state.lastResult.turns;
    const idx = Math.min(Math.max(Math.floor(((x - pad) / cw) * d.length), 0), d.length - 1);
    if (d[idx]) showAnatomy(d[idx]);
  });
  ptCv.style.cursor = 'pointer';

  // Close anatomy on overlay click or close button
  document.getElementById('anatomy-close-btn').addEventListener('click', closeAnatomy);
  document.getElementById('anatomy-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeAnatomy();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAnatomy(); });
}
