let audioCtx: AudioContext | null = null;
let activeSource: any = null;
let pianoInterval: any = null;
let currentSoundName = "piano";

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playPomoAlert() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);

    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6 note
      gain2.gain.setValueAtTime(0, ctx.currentTime);
      gain2.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.8);
    }, 280);
  } catch (e) {
    console.error("playPomoAlert failed", e);
  }
}

export function setSelectedSound(sound: string) {
  currentSoundName = sound;
  if (pianoInterval || activeSource) {
    stopAmbientSound();
    playAmbientSound();
  }
}

export function playAmbientSound() {
  try {
    const ctx = getAudioContext();
    stopAmbientSound();

    if (currentSoundName === "rain") {
      // White noise synthesis for rain
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 450; // Muffly rain sound

      const gain = ctx.createGain();
      gain.gain.value = 0.22;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      activeSource = {
        stop: () => whiteNoise.stop(),
        disconnect: () => {
          whiteNoise.disconnect();
          filter.disconnect();
          gain.disconnect();
        }
      };
    } else if (currentSoundName === "waves") {
      // Binaural wave oscillators
      const oscL = ctx.createOscillator();
      oscL.frequency.value = 136.1; // Ohm frequency

      const oscR = ctx.createOscillator();
      oscR.frequency.value = 140.1; // 4Hz difference for Theta brainwave sync

      const gain = ctx.createGain();
      gain.gain.value = 0.15;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.1; // slow swells (10 seconds)
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.08;

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      oscL.connect(gain);
      oscR.connect(gain);
      gain.connect(ctx.destination);

      lfo.start();
      oscL.start();
      oscR.start();

      activeSource = {
        stop: () => {
          oscL.stop();
          oscR.stop();
          lfo.stop();
        },
        disconnect: () => {
          oscL.disconnect();
          oscR.disconnect();
          lfo.disconnect();
          lfoGain.disconnect();
          gain.disconnect();
        }
      };
    } else if (currentSoundName === "piano") {
      // Ambient randomized chord structure synth notes
      const playChime = () => {
        const chord = [130.81, 164.81, 196.0, 246.94, 293.66, 329.63, 392.0]; // Cmaj7 add9 voicing
        const freq = chord[Math.floor(Math.random() * chord.length)];

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const biquadFilter = ctx.createBiquadFilter();

        osc.connect(biquadFilter);
        biquadFilter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        biquadFilter.type = "lowpass";
        biquadFilter.frequency.value = 800;

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.0);

        osc.start();
        osc.stop(ctx.currentTime + 4.5);
      };

      playChime();
      pianoInterval = setInterval(playChime, 3800);
      activeSource = {
        stop: () => {},
        disconnect: () => {}
      };
    } else if (currentSoundName === "focus") {
      // Deep focus binaural base frequency hum (Brownian ocean)
      const osc1 = ctx.createOscillator();
      osc1.frequency.value = 90; 
      osc1.type = "triangle";

      const rFilter = ctx.createBiquadFilter();
      rFilter.type = "lowpass";
      rFilter.frequency.value = 180;

      const gain = ctx.createGain();
      gain.gain.value = 0.12;

      osc1.connect(rFilter);
      rFilter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      activeSource = {
        stop: () => osc1.stop(),
        disconnect: () => {
          osc1.disconnect();
          rFilter.disconnect();
          gain.disconnect();
        }
      };
    }
  } catch (err) {
    console.error("playAmbientSound failed", err);
  }
}

export function stopAmbientSound() {
  if (pianoInterval) {
    clearInterval(pianoInterval);
    pianoInterval = null;
  }
  if (activeSource) {
    try {
      activeSource.stop();
      activeSource.disconnect();
    } catch (e) {
      // ignore oscillator already stopped errors
    }
    activeSource = null;
  }
}
