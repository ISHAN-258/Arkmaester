import { useState, useRef, useCallback, useEffect } from "react";

// ── Ambient sound generator — pure Web Audio, zero files ─────────────────

function createRain(ac) {
  const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
  const d   = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.35;
  const src = ac.createBufferSource();
  src.buffer = buf; src.loop = true;

  const lp = ac.createBiquadFilter();
  lp.type = "lowpass"; lp.frequency.value = 800;

  const hp = ac.createBiquadFilter();
  hp.type = "highpass"; hp.frequency.value = 200;

  const g = ac.createGain(); g.gain.value = 0.55;
  src.connect(lp); lp.connect(hp); hp.connect(g); g.connect(ac.destination);
  src.start();
  return { src, g, stop: () => { try { src.stop(); } catch {} } };
}

function createWhiteNoise(ac) {
  const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
  const d   = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf; src.loop = true;

  const g = ac.createGain(); g.gain.value = 0.15;
  src.connect(g); g.connect(ac.destination);
  src.start();
  return { src, g, stop: () => { try { src.stop(); } catch {} } };
}

function createLofi(ac) {
  // Generates a soft chord drone + gentle rhythm
  const g = ac.createGain(); g.gain.value = 0;
  g.connect(ac.destination);

  const notes = [130.8, 164.8, 196, 246.9]; // C3 chord
  const oscs  = notes.map((f) => {
    const o  = ac.createOscillator();
    const og = ac.createGain(); og.gain.value = 0.04;
    o.type = "sine"; o.frequency.value = f;
    o.connect(og); og.connect(g);
    o.start(); return o;
  });

  // Very slow LFO tremolo
  const lfo = ac.createOscillator();
  const lfoG = ac.createGain(); lfoG.gain.value = 0.02;
  lfo.frequency.value = 0.12; lfo.type = "sine";
  lfo.connect(lfoG); lfoG.connect(g.gain);
  lfo.start();

  g.gain.setTargetAtTime(1, ac.currentTime, 1.5);

  return {
    g,
    stop: () => {
      g.gain.setTargetAtTime(0, ac.currentTime, 0.5);
      setTimeout(() => { oscs.forEach((o) => { try { o.stop(); } catch {} }); try { lfo.stop(); } catch {} }, 1500);
    },
  };
}

const SOUNDS = {
  rain:  { label: "🌧 Rain",       desc: "Soft rainfall noise"        },
  white: { label: "🌀 White Noise", desc: "Flat broadband noise"       },
  lofi:  { label: "🎵 Lo-Fi Drone", desc: "Ambient chord atmosphere"   },
  off:   { label: "🔇 Off",         desc: "No ambient sound"           },
};

export { SOUNDS };

export function useAmbientSound() {
  const [active, setActive]   = useState("off");
  const [volume, setVolumeState] = useState(0.5);
  const acRef    = useRef(null);
  const nodeRef  = useRef(null);
  const volRef   = useRef(0.5);

  const stop = useCallback(() => {
    nodeRef.current?.stop?.();
    nodeRef.current = null;
  }, []);

  const play = useCallback((type) => {
    stop();
    if (type === "off") { setActive("off"); return; }
    try {
      if (!acRef.current || acRef.current.state === "closed")
        acRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ac = acRef.current;
      if (ac.state === "suspended") ac.resume();

      if (type === "rain")  nodeRef.current = createRain(ac);
      if (type === "white") nodeRef.current = createWhiteNoise(ac);
      if (type === "lofi")  nodeRef.current = createLofi(ac);

      // Apply volume
      if (nodeRef.current?.g) nodeRef.current.g.gain.value *= volRef.current;
      setActive(type);
    } catch (e) { console.warn("Ambient sound failed:", e); }
  }, [stop]);

  const setVolume = useCallback((v) => {
    volRef.current = v;
    setVolumeState(v);
    if (nodeRef.current?.g) nodeRef.current.g.gain.value = v * 0.6;
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { active, volume, play, setVolume, SOUNDS };
}
