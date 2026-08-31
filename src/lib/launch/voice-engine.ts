"use client";

/**
 * ─────────────────────────────────────────────────────────────
 * STREETLA CINEMATIC AUDIO & VOICE SYNTHESIS ENGINE (v3.3)
 * ─────────────────────────────────────────────────────────────
 * Ultra-Smooth & Luxury Sound Design:
 * • Smooth Warm Ethereal Ambient Pad (Pure sine F-Major 7th, 320Hz soft warm filter)
 * • Dual-Layer Glass Resonance Countdown Pings (10 -> 1)
 * • Cinematic Celebration Fanfare & Sub-Impact
 * • Multi-Sentence Sequential Speech Queue (Zero clipping on long dialogue)
 * • Chromium Speech Keep-Alive Heartbeat
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;
let ambientGainNode: GainNode | null = null;
let ambientOscillators: OscillatorNode[] = [];
let isAmbientPlaying = false;

// Cached single locked female voice
let lockedFemaleVoice: SpeechSynthesisVoice | null = null;
let isVoiceLocked = false;

// Retain reference to active utterance globally to prevent GC clipping
let currentActiveUtterance: SpeechSynthesisUtterance | null = null;
let speechHeartbeatTimer: NodeJS.Timeout | null = null;

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

  const priorityFemaleVoices = [
    // 1. Google / Android High Quality Neural voices
    "google uk english female",
    "google us english",
    "en-us-x-sfg#female",
    "en-us-x-tpd#female",
    "en-us-x-iob#female",
    "en-gb-x-rjs#female",
    "samsung english (united states)",
    "samsung english",
    // 2. Microsoft Natural Online voices
    "microsoft jenny online (natural)",
    "microsoft aria online (natural)",
    "microsoft sonia online (natural)",
    "microsoft ava online (natural)",
    "microsoft emma online (natural)",
    "microsoft ana online (natural)",
    "microsoft zira desktop",
    // 3. Apple / iOS / macOS Natural voices
    "samantha (enhanced)",
    "samantha",
    "victoria",
    "karen",
    "siri",
    "moira",
    "tessa",
    "fiona",
    // 4. General Natural Keywords
    "natural",
    "female",
    "jenny",
    "aria",
    "zira",
  ];

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
 * CINEMATIC ETHEREAL BREATHING AMBIENT PAD & AUDIO DUCKING
 * ─────────────────────────────────────────────────────────────
 */
let ambientLfo: OscillatorNode | null = null;
let ambientLfoGain: GainNode | null = null;

export function startAmbientAuraMusic() {
  if (!soundEnabled || isAmbientPlaying) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    stopAmbientAuraMusic();

    const now = ctx.currentTime;
    ambientGainNode = ctx.createGain();
    ambientGainNode.gain.setValueAtTime(0.0001, now);
    ambientGainNode.gain.exponentialRampToValueAtTime(0.024, now + 3.0);

    // Warm, silky lowpass filter (280Hz)
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(280, now);
    filter.Q.setValueAtTime(0.6, now);

    // Slow organic breathing LFO (0.12Hz)
    ambientLfo = ctx.createOscillator();
    ambientLfoGain = ctx.createGain();
    ambientLfo.frequency.setValueAtTime(0.12, now);
    ambientLfoGain.gain.setValueAtTime(40, now); // modulates filter cutoff by +/- 40Hz
    ambientLfo.connect(ambientLfoGain);
    ambientLfoGain.connect(filter.frequency);
    ambientLfo.start(now);

    // Cinematic Luxury Db-Major 9th Chord: Db3 (138.59Hz), Ab3 (207.65Hz), F4 (349.23Hz), C5 (523.25Hz)
    const chordFreqs = [138.59, 207.65, 349.23, 523.25];
    ambientOscillators = chordFreqs.map((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      const detune = idx % 2 === 0 ? 1.8 : -1.8;
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
 * Deep Audio Ducking: Dips music volume to 0.001 during speech so voice is 100% crystal clear
 */
export function duckAmbientMusic() {
  if (!ambientGainNode || !audioCtx || !isAmbientPlaying) return;
  try {
    const now = audioCtx.currentTime;
    ambientGainNode.gain.cancelScheduledValues(now);
    ambientGainNode.gain.setValueAtTime(ambientGainNode.gain.value, now);
    ambientGainNode.gain.linearRampToValueAtTime(0.001, now + 0.2);
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
    ambientGainNode.gain.linearRampToValueAtTime(0.024, now + 1.2);
  } catch (e) {}
}

export function stopAmbientAuraMusic() {
  isAmbientPlaying = false;
  if (ambientGainNode && audioCtx) {
    try {
      const now = audioCtx.currentTime;
      ambientGainNode.gain.cancelScheduledValues(now);
      ambientGainNode.gain.setValueAtTime(ambientGainNode.gain.value, now);
      ambientGainNode.gain.linearRampToValueAtTime(0.0001, now + 0.12);
    } catch (e) {}
  }
  if (ambientLfo) {
    try {
      ambientLfo.stop();
      ambientLfo.disconnect();
    } catch (e) {}
    ambientLfo = null;
    ambientLfoGain = null;
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
    }, 150);
  }
}

/**
 * ─────────────────────────────────────────────────────────────
 * LUXURY GLASS-BELL COUNTDOWN CHIMES (10 -> 1)
 * ─────────────────────────────────────────────────────────────
 */
export function playCountdownTick(number: number) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Harmonic pentatonic bell frequencies (ultra-warm and soothing)
    const baseFrequencies: Record<number, number> = {
      10: 523.25,  // C5
      9: 587.33,   // D5
      8: 659.25,   // E5
      7: 698.46,   // F5
      6: 783.99,   // G5
      5: 880.0,    // A5
      4: 987.77,   // B5
      3: 1046.5,   // C6
      2: 1174.66,  // D6
      1: 1318.51,  // E6
    };

    const freq = baseFrequencies[number] || 600;
    const now = ctx.currentTime;

    // Fundamental Warm Bell
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const filter1 = ctx.createBiquadFilter();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(freq, now);

    filter1.type = "lowpass";
    filter1.frequency.setValueAtTime(1400, now);

    const baseVol = number <= 3 ? 0.14 : 0.09;
    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.linearRampToValueAtTime(baseVol, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + (number <= 3 ? 0.38 : 0.28));

    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.4);

    // Subtle Glass Harmonic Overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 2.0, now);

    gain2.gain.setValueAtTime(0.0001, now);
    gain2.gain.linearRampToValueAtTime(baseVol * 0.25, now + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now);
    osc2.stop(now + 0.18);
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

    // 1. Cinematic Sub-Bass Swell
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(80, now);
    subOsc.frequency.exponentialRampToValueAtTime(42, now + 0.8);
    subGain.gain.setValueAtTime(0.24, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.4);

    // 2. Sparkling Ascending Celestial Harp Glissando
    const arpeggio = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5, 1318.51];

    arpeggio.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      const delay = idx * 0.06;
      gain.gain.setValueAtTime(0.12, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 1.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 1.6);
    });
  } catch (e) {
    console.warn("Celebration fanfare error:", e);
  }
}

/**
 * ─────────────────────────────────────────────────────────────
 * STREETLA SINGLE UTTERANCE NARRATOR
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

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate || 1.0;
      utterance.pitch = options?.pitch || 1.04;
      utterance.volume = 1.0;

      currentActiveUtterance = utterance;
      if (typeof window !== "undefined") {
        (window as any).__launchActiveUtterance = utterance;
      }

      const voice = getLockedFemaleVoice();
      if (voice) {
        utterance.voice = voice;
      }

      let hasResolved = false;
      const finish = () => {
        if (hasResolved) return;
        hasResolved = true;
        currentActiveUtterance = null;
        if (typeof window !== "undefined") {
          (window as any).__launchActiveUtterance = null;
        }
        restoreAmbientMusic();
        if (options?.onEnd) options.onEnd();
        resolve();
      };

      utterance.onstart = () => {
        if (options?.onStart) options.onStart();
      };

      utterance.onend = finish;
      utterance.onerror = () => {
        finish();
      };

      // Failsafe timer (maximum duration based on text length + 3s buffer)
      const maxDuration = Math.max(4000, text.length * 120);
      setTimeout(finish, maxDuration);

      setTimeout(() => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);
        }
      }, 50);
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
 * MULTI-SENTENCE SEQUENTIAL SPEECH (ZERO CUTTING ON OUTRO)
 * ─────────────────────────────────────────────────────────────
 */
export async function speakLaunchSequence(
  sentences: string[],
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
  }
): Promise<void> {
  if (options?.onStart) options.onStart();

  for (let i = 0; i < sentences.length; i++) {
    await speakLaunchText(sentences[i]);
    if (i < sentences.length - 1) {
      // Natural 250ms breathing space between sentences
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  if (options?.onEnd) options.onEnd();
}

/**
 * ─────────────────────────────────────────────────────────────
 * FULL CLEANUP CONTRACT
 * ─────────────────────────────────────────────────────────────
 */
export function stopAllAudioAndSpeech() {
  stopAmbientAuraMusic();
  if (speechHeartbeatTimer) {
    clearInterval(speechHeartbeatTimer);
    speechHeartbeatTimer = null;
  }
  currentActiveUtterance = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}
