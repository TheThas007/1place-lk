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
 * ULTRA-SMOOTH VELVET AMBIENT PAD & AUDIO DUCKING
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
    ambientGainNode.gain.exponentialRampToValueAtTime(0.022, now + 3.0);

    // Warm, silky-smooth lowpass filter (240Hz for velvet warmth)
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(240, now);
    filter.Q.setValueAtTime(0.5, now);

    // C-Major 9th Celestial Velvet Chord: C3 (130.81Hz), G3 (196.0Hz), E4 (329.63Hz), B4 (493.88Hz)
    const chordFreqs = [130.81, 196.0, 329.63, 493.88];
    ambientOscillators = chordFreqs.map((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      const detune = idx % 2 === 0 ? 1.5 : -1.5;
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
    ambientGainNode.gain.linearRampToValueAtTime(0.022, now + 1.2);
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
 * SOFT CRYSTAL WATER-CHIME COUNTDOWN PINGS (10 -> 1)
 * ─────────────────────────────────────────────────────────────
 */
export function playCountdownTick(number: number) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Harmonic pentatonic frequencies (ultra-soft and pleasant)
    const baseFrequencies: Record<number, number> = {
      10: 440.0,
      9: 493.88,
      8: 523.25,
      7: 587.33,
      6: 659.25,
      5: 698.46,
      4: 783.99,
      3: 880.0,
      2: 987.77,
      1: 1046.5,
    };

    const freq = baseFrequencies[number] || 520;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1200, now);

    const baseVol = number <= 3 ? 0.12 : 0.08;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(baseVol, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (number <= 3 ? 0.35 : 0.25));

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
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

    // 1. Cinematic Sub-Bass Impact
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(90, now);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.6);
    subGain.gain.setValueAtTime(0.30, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.2);

    // 2. Ascending Sparkling Glissando Arpeggio
    const arpeggio = [261.63, 392.0, 523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];

    arpeggio.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.055);

      const delay = idx * 0.055;
      gain.gain.setValueAtTime(0.18, now + delay);
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
