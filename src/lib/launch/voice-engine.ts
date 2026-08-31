"use client";

/**
 * ─────────────────────────────────────────────────────────────
 * STREETLA MASTER AUDIO & VOICE SYNTHESIS ENGINE (v3.1)
 * ─────────────────────────────────────────────────────────────
 * Ultra-Clear Voice & Audio Coordinator:
 * • Highest quality natural female voice matching (Microsoft Online Natural, Google UK Female, Samantha)
 * • Native 1.0 Pitch & 1.0 Rate (zero pitch-shifting artifacts / distortion)
 * • Deep Audio Ducking (music lowers to 0.005 during speech so voice is 100% crystal clear)
 * • Crystal Countdown Chimes (G4 392Hz -> C6 1046.5Hz)
 * • C-Major Fanfare (C5, E5, G5, C6, E6)
 * • Strict Garbage-Collection protection for active utterances
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
 * Discovers and locks the HIGHEST FIDELITY English Female Voice.
 * Prioritizes Neural/Online Natural voices, Samantha, Google UK English Female.
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

  // 1. First Pass: English voice matching highest quality female keyword
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

  // 3. Fallback to first English voice
  const fallback = voices.find((v) => v.lang.toLowerCase().startsWith("en")) || voices[0] || null;
  lockedFemaleVoice = fallback;
  isVoiceLocked = true;
  return lockedFemaleVoice;
}

// Auto-register voice changes listener
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
 * AMBIENT AURA BACKGROUND MUSIC & AUDIO DUCKING
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
    ambientGainNode.gain.setValueAtTime(0.001, now);
    ambientGainNode.gain.exponentialRampToValueAtTime(0.06, now + 1.8);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(460, now);

    // Warm Harmonic Pad Chord: F3 (174.61Hz), A3 (220Hz), C4 (261.63Hz), E4 (329.63Hz)
    const chordFreqs = [174.61, 220.0, 261.63, 329.63];
    ambientOscillators = chordFreqs.map((freq) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.connect(filter);
      osc.start(now);
      return osc;
    });

    filter.connect(ambientGainNode);
    ambientGainNode.connect(ctx.destination);
    isAmbientPlaying = true;
  } catch (e) {
    console.warn("Ambient aura error:", e);
  }
}

/**
 * Deep Audio Ducking: Dips music volume to 0.005 during speech so voice is 100% pristine
 */
export function duckAmbientMusic() {
  if (!ambientGainNode || !audioCtx || !isAmbientPlaying) return;
  try {
    const now = audioCtx.currentTime;
    ambientGainNode.gain.cancelScheduledValues(now);
    ambientGainNode.gain.setValueAtTime(ambientGainNode.gain.value, now);
    ambientGainNode.gain.linearRampToValueAtTime(0.005, now + 0.2); // ~92% reduction for absolute voice clarity
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
    ambientGainNode.gain.linearRampToValueAtTime(0.06, now + 0.5);
  } catch (e) {}
}

export function stopAmbientAuraMusic() {
  if (ambientOscillators.length > 0) {
    try {
      const now = audioCtx ? audioCtx.currentTime : 0;
      if (ambientGainNode && audioCtx) {
        ambientGainNode.gain.linearRampToValueAtTime(0.0001, now + 0.3);
      }
      setTimeout(() => {
        ambientOscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (e) {}
        });
        ambientOscillators = [];
        isAmbientPlaying = false;
      }, 350);
    } catch (e) {
      ambientOscillators = [];
      isAmbientPlaying = false;
    }
  }
}

/**
 * ─────────────────────────────────────────────────────────────
 * COUNTDOWN CRYSTAL CHIMES (G4 392Hz -> C6 1046.5Hz)
 * ─────────────────────────────────────────────────────────────
 */
export function playCountdownTick(number: number) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const frequencies: Record<number, number> = {
      10: 392.0, // G4
      9: 440.0,  // A4
      8: 493.88, // B4
      7: 523.25, // C5
      6: 587.33, // D5
      5: 659.25, // E5
      4: 698.46, // F5
      3: 783.99, // G5
      2: 880.0,  // A5
      1: 1046.5, // C6
    };

    const freq = frequencies[number] || 520;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = number <= 5 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.2, now + 0.1);

    const volume = number <= 5 ? 0.20 : 0.15;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);
  } catch (e) {
    console.warn("Audio tick chime error:", e);
  }
}

/**
 * ─────────────────────────────────────────────────────────────
 * CELEBRATION FANFARE (C5, E5, G5, C6, E6)
 * ─────────────────────────────────────────────────────────────
 */
export function playCelebrationFanfare() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // C Major Arpeggio: C5 -> E5 -> G5 -> C6 -> E6
    const chords = [523.25, 659.25, 783.99, 1046.5, 1318.51];

    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.24, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 1.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 1.4);
    });
  } catch (e) {
    console.warn("Fanfare error:", e);
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
      
      // Native 1.0 pitch & 1.0 rate for 100% natural, crisp, artifact-free speech
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

      // Failsafe timeout
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
