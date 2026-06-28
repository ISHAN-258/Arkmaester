// ── Web Audio API — zero external files ───────────────────────────────────

let _selectedSound = "piano";

export const getSelectedSound = () => _selectedSound;
export const setSelectedSound = (s) => { _selectedSound = s; };

function beep(freq = 880, dur = 0.3, vol = 0.2, type = "sine") {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.frequency.value = freq; o.type = type;
    g.gain.setValueAtTime(vol, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    o.start(); o.stop(ac.currentTime + dur + 0.05);
  } catch {}
}

export const sfxTick = () => beep(1100, 0.055, 0.07);
export const sfxWarn = () => beep(440, 0.12, 0.18, "square");

export function playSoundStyle(style) {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    if (style === "piano") {
      [262, 330, 392, 523].forEach((f, i) =>
        setTimeout(() => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.type = "sine"; o.frequency.value = f;
          g.gain.setValueAtTime(0, ac.currentTime);
          g.gain.linearRampToValueAtTime(0.22, ac.currentTime + 0.04);
          g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.55);
          o.connect(g); g.connect(ac.destination);
          o.start(); o.stop(ac.currentTime + 0.6);
        }, i * 200)
      );
    } else if (style === "bell") {
      [880, 1108, 1318, 1760].forEach((f, i) =>
        setTimeout(() => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.type = "triangle"; o.frequency.value = f;
          g.gain.setValueAtTime(0.18, ac.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 1.2);
          o.connect(g); g.connect(ac.destination);
          o.start(); o.stop(ac.currentTime + 1.3);
        }, i * 280)
      );
    } else {
      [440, 440, 660].forEach((f, i) =>
        setTimeout(() => beep(f, 0.08, 0.15, "square"), i * 160)
      );
    }
  } catch {}
}

export const sfxSessionEnd = () => playSoundStyle(_selectedSound);
export const sfxBreakEnd  = () => [880, 659, 440].forEach((f, i) => setTimeout(() => beep(f, 0.4), i * 210));
