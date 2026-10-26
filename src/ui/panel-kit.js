// Peças visuais dos painéis de gestão: barras, valores, selos e grupos de ações.
const safe = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const num = (n) => Number(n).toLocaleString('pt-BR', { maximumFractionDigits: 2 });

// Barra de capacidade: tom automático (cheio = atenção) ou definido pelo chamador.
export function meter({ label, value, max, unit = '', icon, tone, note = '', tip = '' }) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const auto = tone ?? (ratio >= 0.95 ? 'warn' : 'ok');
  return `<div class="meter-row tone-${auto}"${tip ? ` data-tip="${safe(tip)}"` : ''}>${icon ? `<img src="${icon}" alt="">` : ''}<div class="meter-main"><span class="meter-label"><span>${safe(label)}</span><b>${num(value)}${max != null ? ` / ${num(max)}` : ''}${unit ? ' ' + unit : ''}</b></span><i class="meter" role="progressbar" aria-label="${safe(label)}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}"><b style="width:${(ratio * 100).toFixed(1)}%"></b></i>${note ? `<small>${note}</small>` : ''}</div></div>`;
}

export function tile({ label, value, icon, tone = 'neutral', tip = '', note = '' }) {
  return `<div class="stat-tile tone-${tone}"${tip ? ` data-tip="${safe(tip)}"` : ''}>${icon ? `<img src="${icon}" alt="">` : ''}<span>${safe(label)}</span><strong>${value}</strong>${note ? `<small>${note}</small>` : ''}</div>`;
}

export const tiles = (items) => `<div class="stat-tiles">${items.join('')}</div>`;

export function chip(text, tone = 'neutral', tip = '') {
  return `<span class="chip tone-${tone}"${tip ? ` data-tip="${safe(tip)}"` : ''}>${text}</span>`;
}

export const chips = (items) => `<div class="chip-row">${items.filter(Boolean).join('')}</div>`;

export function group(title, body, { icon = '', tone = '' } = {}) {
  return `<section class="action-group${tone ? ' tone-' + tone : ''}"><h3>${icon ? `<img src="${icon}" alt="">` : ''}${title}</h3>${body}</section>`;
}

// Explicações longas ficam recolhidas: o essencial aparece em barras e números.
export function howItWorks(html, title = 'Como funciona') {
  return `<details class="how-it-works" data-keep="how"><summary>${title}</summary><div>${html}</div></details>`;
}

// Barra de um lote em produção.
export function batchBar({ icon, name, phase, progress, seconds }) {
  return `<div class="batch-row"><img src="${icon}" alt=""><div><span><b>${safe(name)}</b><small>${phase} · ${seconds} s</small></span><i class="meter is-animated"><b style="width:${(Math.min(1, Math.max(0, progress)) * 100).toFixed(1)}%"></b></i></div></div>`;
}
