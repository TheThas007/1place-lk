"use client";

/**
 * ─────────────────────────────────────────────────────────────
 * STREETLA CINEMATIC AUDIO & VOICE SYNTHESIS ENGINE (v3.2)
 * ─────────────────────────────────────────────────────────────
 * Ultra-Modern Sound Design:
 * • Ethereal Dynamic Ambient Shimmer (Warm celestial pad with subtle breathing filter)
 * • Futuristic Glass Resonance Countdown Chimes (Dual-layer bell/ping harmonics)
 * • Cinematic Celebration Fanfare & Sub-Impact (Glissando arpeggio + golden chord)
 * • Single Locked Highest-Fidelity Female English Voice
 * • Zero-distortion native 1.0 pitch/rate with deep audio ducking
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;
let ambientGainNode: GainNode | null = null;
let ambientOscillators: OscillatorNode[] = [];
let ambientLfo: OscillatorNode | null = null;
let isAmbientPlaying = false;

// Cached single locked female voice
let lockedFemaleVoice: SpeechSynthesisVoice | null = null;
let isVoiceLocked = false;

// Retain reference to active utterance globally to prevent GC clipping
let currentActiveUtterance: SpeechSynthesisUtterance | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Discovers and permanently locks the HIGHEST FIDELITY English Female Voice.
 */
export function getLockedFemaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  if (lockedFemaleVoice && isVoiceLocked) return lockedFemaleVoice;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const maleKeywords = [
    "david", "mark", "george", "james", "richard", "guy", "stefan", "male",
    "paul", "ravi", "prakash", "daniel", "microsoft david", "microsoft mark",
    "microsoft george", "microsoft ravi"
  ];

  // Highest quality natural voices in order of fidelity
  const priorityFemaleVoices = [
    "microsoft jenny online (natural)",
    "microsoft aria online (natural)",
    "microsoft sonia online (natural)",
    "google uk english female",
    "google us english",
    "natural",
    "jenny",
    "aria",
    "samantha",
    "victoria",
    "karen",
    "zira",
    "female",
    "siri",
    "moira",
    "fiona",
    "tessa",
    "sonia",
    "hazel"
  ];

  // 1. First Pass: Match highest quality female keyword
  for (const keyword of priorityFemaleVoices) {
    const matched = voices.find((v) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      if (!lang.startsWith("en")) return false;
      const isMale = maleKeywords.some((m) => name.includes(m));
      if (isMale) return false;
      return name.includes(keyword);
    });

    if (matched) {
      lockedFemaleVoice = matched;
      isVoiceLocked = true;
      return lockedFemaleVoice;
    }
  }

  // 2. Second Pass: Any English voice that is NOT male
  const anyNonMaleEnglish = voices.find((v) => {
    const name = v.name.toLowerCase();
    const lang = v.lang.toLowerCase();
    if (!lang.startsWith("en")) return false;
    return !maleKeywords.some((m) => name.includes(m));
  });

  if (anyNonMaleEnglish) {
    lockedFemaleVoice = anyNonMaleEnglish;
    isVoiceLocked = true;
    return lockedFemaleVoice;
  }

  const fallback = voices.find((v) => v.lang.toLowerCase().startsWith("en")) || voices[0] || null;
  lockedFemaleVoice = fallback;
  isVoiceLocked = true;
  return lockedFemaleVoice;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    getLockedFemaleVoice();
  };
  getLockedFemaleVoice();
}

/**
 * Prime AudioContext and Speech Engine immediately inside user click handler
 */
export function primeAudioAndVoice() {
  if (typeof window === "undefined") return;
  getAudioContext();
  getLockedFemaleVoice();
  if ("speechSynthesis" in window) {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }
}

export function setLaunchSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  if (enabled) {
    getAudioContext();
  } else {
    stopAmbientAuraMusic();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export function isLaunchSoundEnabled(): boolean {
  return soundEnabled;
}

/**
 * ─────────────────────────────────────────────────────────────
 * CINEMATIC ETHEREAL AMBIENT PAD & AUDIO DUCKING
 * ─────────────────────────────────────────────────────────────
 */
export function startAmbientAuraMusic() {
  if (!soundEnabled || isAmbientPlaying) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    stopAmbientAuraMusic();

    const now = ctx.currentTime;
    ambientGainNode = ctx.createGain();
    ambientGainNode.gain.setValueAtTime(0.0001, now);
    ambientGainNode.gain.exponentialRampToValueAtTime(0.05, now + 2.0);

    // Warm Dynamic Filter
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(520, now);
    filter.Q.setValueAtTime(1.2, now);

    // Subtle LFO Breathing Sweep (0.12Hz)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.12, now);
    lfoGain.gain.setValueAtTime(180, now);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start(now);
    ambientLfo = lfo;

    // Modern D-Major 9th Floating Chord: D4 (293.66Hz), A4 (440Hz), F#5 (739.99Hz), C#6 (1108.73Hz)
    const chordFreqs = [293.66, 440.0, 739.99, 1108.73];
    ambientOscillators = chordFreqs.map((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      // Subtle micro-detune for lush stereo-like thickness
      const detune = idx % 2 === 0 ? 4 : -4;
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detune, now);
      osc.connect(filter);
      osc.start(now);
      return osc;
    });

    filter.connect(ambientGainNode);
    ambientGainNode.connect(ctx.destination);
    isAmbientPlaying = true;
  } catch (e) {
    console.warn("Ambient sound error:", e);
  }
}

/**
 * Deep Audio Ducking: Dips music volume to 0.003 during speech so voice is 100% pristine
 */
export function duckAmbientMusic() {
  if (!ambientGainNode || !audioCtx || !isAmbientPlaying) return;
  try {
    const now = audioCtx.currentTime;
    ambientGainNode.gain.cancelScheduledValues(now);
    ambientGainNode.gain.setValueAtTime(ambientGainNode.gain.value, now);
    ambientGainNode.gain.linearRampToValueAtTime(0.003, now + 0.18);
  } catch (e) {}
}

/**
 * Restore music smoothly after speech concludes
 */
export function restoreAmbientMusic() {
  if (!ambientGainNode || !audioCtx || !isAmbientPlaying) return;
  try {
    const now = audioCtx.currentTime;
    ambientGainNode.gain.cancelScheduledValues(now);
    ambientGainNode.gain.setValueAtTime(ambientGainNode.gain.value, now);
    ambientGainNode.gain.linearRampToValueAtTime(0.05, now + 0.6);
  } catch (e) {}
}

export function stopAmbientAuraMusic() {
  isAmbientPlaying = false;
  if (ambientGainNode && audioCtx) {
    try {
      const now = audioCtx.currentTime;
      ambientGainNode.gain.cancelScheduledValues(now);
      ambientGainNode.gain.setValueAtTime(ambientGainNode.gain.value, now);
      ambientGainNode.gain.linearRampToValueAtTime(0.0001, now + 0.08);
    } catch (e) {}
  }
  if (ambientLfo) {
    try {
      ambientLfo.stop();
      ambientLfo.disconnect();
    } catch (e) {}
    ambientLfo = null;
  }
  if (ambientOscillators.length > 0) {
    const oscs = [...ambientOscillators];
    ambientOscillators = [];
    setTimeout(() => {
      oscs.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {}
      });
    }, 100);
  }
}

/**
 * ─────────────────────────────────────────────────────────────
 * FUTURISTIC GLASS RESONANCE COUNTDOWN PINGS (10 -> 1)
 * ─────────────────────────────────────────────────────────────
 */
export function playCountdownTick(number: number) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const baseFrequencies: Record<number, number> = {
      10: 440.0,  // A4
      9: 493.88,  // B4
      8: 523.25,  // C5
      7: 587.33,  // D5
      6: 659.25,  // E5
      5: 698.46,  // F5
      4: 783.99,  // G5
      3: 880.0,   // A5
      2: 987.77,  // B5
      1: 1046.5,  // C6 (Triumphant High Ping)
    };

    const freq = baseFrequencies[number] || 600;
    const now = ctx.currentTime;

    // 1. Primary Pure Glass Tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(freq, now);

    const baseVol = number <= 3 ? 0.22 : 0.16;
    gain1.gain.setValueAtTime(baseVol, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + (number <= 3 ? 0.35 : 0.24));

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // 2. High-Tech Shimmer Overtone (Harmonic Fifth / Octave)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 1.5, now);

    gain2.gain.setValueAtTime(baseVol * 0.45, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.14);
  } catch (e) {
    console.warn("Countdown ping error:", e);
  }
}

/**
 * ─────────────────────────────────────────────────────────────
 * CINEMATIC CELEBRATION FANFARE & REVEAL CHORD (0s REVEAL)
 * ─────────────────────────────────────────────────────────────
 */
export function playCelebrationFanfare() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Cinematic Sub-Bass Impact (Warm Boomy Punch)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(95, now);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.6);
    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.2);

    // 2. Ascending Sparkling Glissando Arpeggio
    // C4 -> G4 -> C5 -> E5 -> G5 -> C6 -> E6 -> G6
    const arpeggio = [261.63, 392.0, 523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];

    arpeggio.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.055);

      const delay = idx * 0.055;
      gain.gain.setValueAtTime(0.20, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 1.8);
    });
  } catch (e) {
    console.warn("Celebration fanfare error:", e);
  }
}

/**
 * ─────────────────────────────────────────────────────────────
 * STREETLA SPEECH SYNTHESIS NARRATOR (SINGLE LOCKED FEMALE VOICE)
 * ─────────────────────────────────────────────────────────────
 */
export function speakLaunchText(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
  }
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !soundEnabled) {
      if (options?.onStart) options.onStart();
      setTimeout(() => {
        if (options?.onEnd) options.onEnd();
        resolve();
      }, 1200);
      return;
    }

    try {
      duckAmbientMusic();

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.rate = options?.rate || 1.0;
      utterance.pitch = options?.pitch || 1.0;

      currentActiveUtterance = utterance;

      const voice = getLockedFemaleVoice();
      if (voice) {
        utterance.voice = voice;
      }

      let hasResolved = false;
      const finish = () => {
        if (hasResolved) return;
        hasResolved = true;
        currentActiveUtterance = null;
        restoreAmbientMusic();
        if (options?.onEnd) options.onEnd();
        resolve();
      };

      utterance.onstart = () => {
        if (options?.onStart) options.onStart();
      };

      utterance.onend = finish;
      utterance.onerror = (e) => {
        finish();
      };

      const maxDuration = Math.max(2800, text.length * 100);
      setTimeout(finish, maxDuration);

      window.speechSynthesis.speak(utterance);

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {
      console.warn("Speech synthesis error:", e);
      restoreAmbientMusic();
      if (options?.onStart) options.onStart();
      if (options?.onEnd) options.onEnd();
      resolve();
    }
  });
}

/**
 * ─────────────────────────────────────────────────────────────
 * FULL CLEANUP CONTRACT
 * ─────────────────────────────────────────────────────────────
 */
export function stopAllAudioAndSpeech() {
  stopAmbientAuraMusic();
  currentActiveUtterance = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}
