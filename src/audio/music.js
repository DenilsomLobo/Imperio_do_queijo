// Música ambiente sintetizada: um "boom-chick" de violão caipira com baixo e melodia.
// Sem arquivos de áudio. Alterna uma volta com melodia e outra só com acompanhamento,
// para não cansar em sessões longas. Usa o mesmo AudioContext dos efeitos.
const BPM = 100;
const BEAT = 60 / BPM, EIGHTH = BEAT / 2, BAR = BEAT * 4;
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

// Progressão em Sol maior: G C D G | Em C D G.
const CHORDS = [
  { bass: [43, 50], strum: [55, 59, 62, 67] },
  { bass: [48, 43], strum: [55, 60, 64, 67] },
  { bass: [50, 45], strum: [57, 62, 66, 69] },
  { bass: [43, 50], strum: [55, 59, 62, 67] },
  { bass: [40, 47], strum: [55, 59, 64, 67] },
  { bass: [48, 43], strum: [55, 60, 64, 67] },
  { bass: [50, 45], strum: [57, 62, 66, 69] },
  { bass: [43, 50], strum: [55, 59, 62, 67] },
];
// Melodia em colcheias (null = pausa, 0 = sustenta a nota anterior).
const MELODY = [
  [74, 0, 71, 0, 67, 69, 71, 0],
  [72, 0, 76, 0, 74, 72, 69, 0],
  [69, 0, 74, 0, 76, 74, 71, 0],
  [67, 0, 0, 0, 71, 0, 74, 0],
  [76, 0, 74, 71, 67, 0, 64, 0],
  [67, 69, 72, 0, 76, 0, 74, 0],
  [74, 0, 76, 74, 69, 0, 71, 69],
  [67, 0, 0, 0, null, null, null, null],
];
// Contracanto discreto da segunda volta.
const ECHO = [
  [null, null, null, null, 79, null, null, null],
  [null, null, null, null, 76, null, null, null],
  [null, null, null, null, 78, null, null, null],
  [null, null, null, null, 74, null, null, null],
  [null, null, null, null, 79, null, null, null],
  [null, null, null, null, 76, null, null, null],
  [null, null, null, null, 78, null, 74, null],
  [79, null, null, null, null, null, null, null],
];

export function createMusic(sfx) {
  let bus = null, timer = null, nextTime = 0, step = 0, playing = false, wanted = false;

  function ensureBus() {
    const ctx = sfx.context;
    if (!ctx || !sfx.output) return null;
    if (!bus) { bus = ctx.createGain(); bus.gain.value = 0; bus.connect(sfx.output); }
    return ctx;
  }
  function level() {
    const s = sfx.settings;
    return s.musicOn ? s.musicVolume * 0.32 : 0;
  }
  function note(ctx, freq, t, { dur, type, gain, cutoff }) {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    let node = osc;
    if (cutoff) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(cutoff, t);
      f.frequency.exponentialRampToValueAtTime(Math.max(300, cutoff / 4), t + dur);
      osc.connect(f); node = f;
    }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    node.connect(g).connect(bus);
    osc.start(t); osc.stop(t + dur + 0.05);
  }
  function hat(ctx, t) {
    const len = Math.floor(ctx.sampleRate * 0.04), buffer = ctx.createBuffer(1, len, ctx.sampleRate), data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = buffer; f.type = 'highpass'; f.frequency.value = 6000; g.gain.value = 0.05;
    src.connect(f).connect(g).connect(bus); src.start(t);
  }
  // Agenda uma colcheia: baixo nos tempos 1 e 3, batida do violão nos tempos 2 e 4.
  function schedule(ctx, i, t) {
    const bar = Math.floor(i / 8) % 8, e = i % 8, round = Math.floor(i / 64) % 2;
    const chord = CHORDS[bar];
    if (e === 0 || e === 4) note(ctx, hz(chord.bass[e === 0 ? 0 : 1]), t, { dur: BEAT * 0.9, type: 'triangle', gain: 0.32 });
    if (e === 2 || e === 6) chord.strum.forEach((m, k) => note(ctx, hz(m), t + k * 0.012, { dur: 0.32, type: 'sawtooth', gain: 0.045, cutoff: 2600 }));
    if (e % 2 === 1) hat(ctx, t);
    const line = round === 0 ? MELODY : ECHO;
    const m = line[bar][e];
    if (m) {
      let hold = 1;
      while (e + hold < 8 && line[bar][e + hold] === 0) hold++;
      note(ctx, hz(m), t, { dur: EIGHTH * hold * 0.95, type: 'triangle', gain: round === 0 ? 0.13 : 0.07 });
    }
  }
  function tick() {
    const ctx = sfx.context;
    if (!ctx || ctx.state !== 'running') return;
    while (nextTime < ctx.currentTime + 0.35) {
      schedule(ctx, step, nextTime);
      step = (step + 1) % 128;
      nextTime += EIGHTH;
    }
  }
  function start() {
    if (playing || !wanted || !sfx.settings.musicOn) return;
    const ctx = ensureBus();
    if (!ctx || ctx.state !== 'running') return;
    playing = true;
    nextTime = ctx.currentTime + 0.1;
    bus.gain.cancelScheduledValues(ctx.currentTime);
    bus.gain.setTargetAtTime(level(), ctx.currentTime, 0.8); // entrada suave
    timer = setInterval(tick, 90);
    tick();
  }
  function stop() {
    if (!playing) return;
    playing = false;
    clearInterval(timer);
    const ctx = sfx.context;
    if (bus && ctx) bus.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
  }
  sfx.onUnlock(() => start());
  sfx.onChange((s) => {
    if (!s.musicOn) stop();
    else if (!playing) start();
    else if (bus) bus.gain.setTargetAtTime(level(), sfx.context.currentTime, 0.1);
  });
  return {
    // Chamado quando a partida começa (a tela de entrada fica em silêncio).
    play() { wanted = true; start(); },
    pause() { wanted = false; stop(); },
    get playing() { return playing; },
  };
}
