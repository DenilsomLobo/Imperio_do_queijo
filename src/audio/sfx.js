// Efeitos sonoros sintetizados com Web Audio: sem arquivos, curtos e em estilo cartoon.
// O contexto só é criado/retomado após um gesto do jogador (exigência do Safari e do Chrome).
const STORAGE_KEY = 'imperio-audio';
const DEFAULTS = { volume: 0.6, muted: false, musicOn: true, musicVolume: 0.35 };

// Intervalo mínimo entre repetições do mesmo efeito, em ms, para não cansar o jogador.
const THROTTLE = { sale: 900, milk: 700, cheese: 600, coin: 160, tick: 60, alert: 2500, rare: 1500, error: 250, day: 4000 };

function readSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (saved && typeof saved === 'object') {
      return {
        volume: Number.isFinite(saved.volume) ? Math.min(1, Math.max(0, saved.volume)) : DEFAULTS.volume,
        muted: Boolean(saved.muted),
        musicOn: saved.musicOn ?? DEFAULTS.musicOn,
        musicVolume: Number.isFinite(saved.musicVolume) ? Math.min(1, Math.max(0, saved.musicVolume)) : DEFAULTS.musicVolume,
      };
    }
  } catch { /* armazenamento indisponível: usa o padrão */ }
  return { ...DEFAULTS };
}

export function createSfx() {
  const settings = readSettings();
  const listeners = new Set();
  const lastPlayed = new Map();
  let ctx = null, master = null, output = null, noiseBuffer = null;
  const unlockListeners = new Set();

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch { /* ignora */ }
    listeners.forEach((fn) => fn({ ...settings }));
  }
  function applyVolume() {
    if (master) master.gain.setTargetAtTime(settings.muted ? 0 : settings.volume * 0.55, ctx.currentTime, 0.02);
  }
  function ensureContext() {
    if (ctx) return ctx;
    const AudioCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioCtor) return null;
    try {
      ctx = new AudioCtor();
      master = ctx.createGain();
      output = ctx.createDynamicsCompressor();
      master.connect(output).connect(ctx.destination);
      applyVolume();
    } catch { ctx = null; }
    return ctx;
  }
  // Chamado em pointerdown/keydown: cria e destrava o áudio dentro do gesto.
  function unlock() {
    const c = ensureContext();
    if (!c) return;
    if (c.state === 'suspended') c.resume().then(() => unlockListeners.forEach((fn) => fn(c))).catch(() => {});
    else unlockListeners.forEach((fn) => fn(c));
    // iOS antigo: tocar um buffer silencioso libera a saída de áudio.
    try {
      const b = c.createBuffer(1, 1, 22050), s = c.createBufferSource();
      s.buffer = b; s.connect(c.destination); s.start(0);
    } catch { /* ignora */ }
  }
  for (const type of ['pointerdown', 'keydown', 'touchend']) window.addEventListener(type, unlock, { passive: true, capture: true });
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend().catch(() => {});
    else ctx.resume().catch(() => {});
  });

  function noise() {
    if (noiseBuffer) return noiseBuffer;
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return noiseBuffer;
  }
  // Nota com envelope curto. f pode ser [início, fim] para deslizar a frequência.
  function tone(f, { at = 0, dur = 0.12, type = 'sine', gain = 0.3, attack = 0.005, detune = 0 } = {}) {
    const t = ctx.currentTime + at;
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = type;
    osc.detune.value = detune;
    const [from, to] = Array.isArray(f) ? f : [f, f];
    osc.frequency.setValueAtTime(from, t);
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
  function hiss({ at = 0, dur = 0.2, gain = 0.15, from = 800, to = 3000, q = 1.2 } = {}) {
    const t = ctx.currentTime + at;
    const src = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noise();
    filter.type = 'bandpass'; filter.Q.value = q;
    filter.frequency.setValueAtTime(from, t);
    filter.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(g).connect(master);
    src.start(t); src.stop(t + dur + 0.02);
  }
  const N = { C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, G5: 784, A5: 880, B5: 987.8, C6: 1046.5, E6: 1318.5, G6: 1568, C7: 2093 };

  const sounds = {
    tick: () => tone([700, 950], { dur: 0.05, gain: 0.08, type: 'triangle' }),
    open: () => { tone([420, 640], { dur: 0.09, gain: 0.1, type: 'triangle' }); hiss({ dur: 0.08, gain: 0.03, from: 1200, to: 2600 }); },
    close: () => tone([600, 380], { dur: 0.08, gain: 0.08, type: 'triangle' }),
    coin: () => { tone(N.B5, { dur: 0.07, type: 'square', gain: 0.07 }); tone(N.E6, { at: 0.06, dur: 0.22, type: 'square', gain: 0.07 }); },
    sale: () => { tone(N.E6, { dur: 0.05, type: 'triangle', gain: 0.07 }); tone(N.G6, { at: 0.045, dur: 0.12, type: 'triangle', gain: 0.06 }); },
    milk: () => { tone([520, 260], { dur: 0.12, gain: 0.18 }); tone([640, 300], { at: 0.1, dur: 0.12, gain: 0.13 }); },
    cheese: () => [N.C5, N.E5, N.G5].forEach((f, i) => tone(f, { at: i * 0.06, dur: 0.18, type: 'triangle', gain: 0.14 })),
    rare: () => {
      [N.C6, N.E6, N.G6, N.C7].forEach((f, i) => tone(f, { at: i * 0.07, dur: 0.3, type: 'sine', gain: 0.12, detune: i % 2 ? 6 : -6 }));
      hiss({ at: 0.05, dur: 0.5, gain: 0.04, from: 4000, to: 9000, q: 4 });
    },
    purchase: () => { hiss({ dur: 0.07, gain: 0.08, from: 2500, to: 6000 }); tone(N.B5, { at: 0.04, dur: 0.07, type: 'square', gain: 0.06 }); tone(N.E6, { at: 0.1, dur: 0.25, type: 'square', gain: 0.06 }); },
    hire: () => { tone(N.G4, { dur: 0.16, type: 'triangle', gain: 0.16 }); tone(N.C5, { at: 0.13, dur: 0.28, type: 'triangle', gain: 0.16 }); },
    upgrade: () => { tone([300, 900], { dur: 0.22, type: 'sawtooth', gain: 0.04 }); [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => tone(f, { at: 0.12 + i * 0.05, dur: 0.22, type: 'triangle', gain: 0.1 })); },
    produce: () => { tone([220, 330], { dur: 0.1, type: 'square', gain: 0.05 }); tone([330, 440], { at: 0.09, dur: 0.1, type: 'square', gain: 0.05 }); },
    error: () => { tone([220, 180], { dur: 0.12, type: 'square', gain: 0.07 }); tone([170, 130], { at: 0.11, dur: 0.16, type: 'square', gain: 0.07 }); },
    alert: () => [0, 1, 2].forEach((i) => { tone(N.A5, { at: i * 0.26, dur: 0.12, type: 'triangle', gain: 0.13 }); tone(N.E5, { at: i * 0.26 + 0.13, dur: 0.12, type: 'triangle', gain: 0.13 }); }),
    attack: () => { hiss({ dur: 0.35, gain: 0.14, from: 300, to: 2400, q: 0.8 }); tone([160, 90], { at: 0.25, dur: 0.18, type: 'square', gain: 0.08 }); },
    conquest: () => {
      [N.C5, N.E5, N.G5].forEach((f, i) => tone(f, { at: i * 0.11, dur: 0.14, type: 'square', gain: 0.07 }));
      [N.C5, N.E5, N.G5, N.C6].forEach((f) => tone(f, { at: 0.36, dur: 0.55, type: 'triangle', gain: 0.09 }));
    },
    defeat: () => [N.G4, 370, N.F4, N.E4].forEach((f, i) => tone(i === 3 ? [f, f * 0.94] : f, { at: i * 0.22, dur: i === 3 ? 0.6 : 0.2, type: 'sawtooth', gain: 0.05 })),
    objective: () => { tone(N.E5, { dur: 0.12, type: 'sine', gain: 0.16 }); tone(N.B5, { at: 0.1, dur: 0.3, type: 'sine', gain: 0.14 }); },
    day: () => { tone(N.G5, { dur: 0.25, type: 'sine', gain: 0.06 }); tone(N.C6, { at: 0.12, dur: 0.35, type: 'sine', gain: 0.05 }); },
  };

  return {
    play(name) {
      if (settings.muted || settings.volume <= 0 || !sounds[name]) return;
      const now = performance.now(), wait = THROTTLE[name] ?? 120;
      if (now - (lastPlayed.get(name) ?? -Infinity) < wait) return;
      const c = ensureContext();
      if (!c || c.state === 'closed') return;
      lastPlayed.set(name, now);
      const run = () => { try { sounds[name](); } catch { /* falha de síntese não interrompe o jogo */ } };
      if (c.state === 'running') run();
      // Logo após o primeiro gesto o contexto ainda está retomando; toca se ficar pronto a tempo.
      else c.resume().then(() => { if (performance.now() - now < 400) run(); }).catch(() => {});
    },
    get settings() { return { ...settings }; },
    setVolume(v) { settings.volume = Math.min(1, Math.max(0, Number(v) || 0)); if (settings.volume > 0) settings.muted = false; applyVolume(); persist(); },
    setMuted(m) { settings.muted = Boolean(m); applyVolume(); persist(); },
    toggleMute() { this.setMuted(!settings.muted); return settings.muted; },
    setMusic(on) { settings.musicOn = Boolean(on); persist(); },
    setMusicVolume(v) { settings.musicVolume = Math.min(1, Math.max(0, Number(v) || 0)); if (settings.musicVolume > 0) settings.musicOn = true; persist(); },
    // Acesso para a música ambiente: mesmo contexto (já destravado) e mesma saída comprimida.
    get context() { return ctx; },
    get output() { return output; },
    onUnlock(fn) { unlockListeners.add(fn); if (ctx?.state === 'running') fn(ctx); return () => unlockListeners.delete(fn); },
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    names: Object.keys(sounds),
  };
}
