window.PQS = window.PQS || {};

(function () {
  let ctx = null;
  let muted = false;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function beep(freq, dur, type, gain, delay) {
    const a = ac();
    if (!a || muted) return;
    const t0 = a.currentTime + (delay || 0);
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.08, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(a.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  function noise(dur, gain, delay, hp) {
    const a = ac();
    if (!a || muted) return;
    const t0 = a.currentTime + (delay || 0);
    const n = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
    const d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = a.createBufferSource();
    src.buffer = n;
    const f = a.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = hp || 1200;
    const g = a.createGain();
    g.gain.setValueAtTime(gain || 0.06, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(a.destination);
    src.start(t0);
    src.stop(t0 + dur);
  }

  const SFX = {
    click() { beep(420, 0.05, "square", 0.05); },
    spin() {
      noise(0.08, 0.04, 0, 800);
      beep(180, 0.12, "square", 0.05);
      beep(260, 0.08, "square", 0.04, 0.05);
    },
    tick() { beep(220 + Math.random() * 40, 0.03, "square", 0.03); },
    stop() { beep(140, 0.08, "square", 0.06); noise(0.05, 0.05, 0, 400); },
    win() {
      [523, 659, 784, 1046].forEach((f, i) => beep(f, 0.12, "square", 0.07, i * 0.08));
    },
    bigwin() {
      [392, 523, 659, 784, 1046, 1318].forEach((f, i) => beep(f, 0.14, "square", 0.08, i * 0.07));
    },
    hit() { beep(880, 0.06, "square", 0.06); beep(1320, 0.05, "square", 0.04, 0.04); },
    hurt() { beep(160, 0.18, "sawtooth", 0.07); noise(0.12, 0.05, 0, 300); },
    kill() { [330, 440, 550, 880].forEach((f, i) => beep(f, 0.1, "square", 0.07, i * 0.07)); },
    level() { [523, 659, 784, 659, 1046].forEach((f, i) => beep(f, 0.14, "square", 0.08, i * 0.09)); },
    lose() { beep(200, 0.15, "square", 0.05); beep(140, 0.22, "square", 0.05, 0.12); },
    drop() { beep(640, 0.06, "triangle", 0.05); beep(880, 0.08, "triangle", 0.05, 0.06); }
  };

  PQS.audio = {
    unlock() { ac(); },
    play(name) { const fn = SFX[name]; if (fn) fn(); },
    setMuted(v) { muted = !!v; },
    isMuted() { return muted; },
    toggle() {
      muted = !muted;
      if (!muted) SFX.click();
      return muted;
    }
  };
})();
