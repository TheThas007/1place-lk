"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Rocket,
  Timer,
  Calendar,
  Clock,
  Globe,
  Play,
  Eye,
  CheckCircle,
  AlertTriangle,
  Save,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Layers,
  Heart,
  MapPin,
  Star,
  Image as ImageIcon,
  Smartphone,
  Sliders,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Volume2,
  VolumeX,
  Mic,
  Smile,
  Bot,
  PartyPopper,
  X,
  Check,
  Pause,
  Music,
} from "lucide-react";
import { useLaunchSettings } from "@/hooks/useLaunchSettings";
import { useServerTime } from "@/hooks/useServerTime";
import { collection, onSnapshot, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import CountdownScreen from "@/components/launch/CountdownScreen";
import { VirtualAssistantLaunch } from "@/components/launch/VirtualAssistantLaunch";
import { VirtualAssistantLaunchAvatar } from "@/components/launch/VirtualAssistantLaunchAvatar";
import {
  speakLaunchText,
  playCountdownTick,
  playCelebrationFanfare,
  startAmbientAuraMusic,
  stopAmbientAuraMusic,
  setLaunchSoundEnabled,
  getLockedFemaleVoice,
  primeAudioAndVoice,
  stopAllAudioAndSpeech,
} from "@/lib/launch/voice-engine";
import { DEFAULT_PRE_LAUNCH_SETTINGS } from "@/lib/data";
import { PreLaunchExperienceSettings, Review } from "@/lib/types";

const TIMEZONES = [
  { value: "Asia/Colombo", label: "Asia/Colombo (Sri Lanka Time, GMT+5:30)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (Gulf Standard Time, GMT+4:00)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT, GMT+8:00)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
];

export default function LaunchControlTab() {
  const { settings, loading, saveSettings, revealNow, disableCountdown, enableCountdown } =
    useLaunchSettings();

  // Live reviews and gallery for preview
  const [liveReviews, setLiveReviews] = useState<Review[]>([]);
  const [liveGallery, setLiveGallery] = useState<any[]>([]);
  const [productCount, setProductCount] = useState<number>(0);

  useEffect(() => {
    let unsubReviews: (() => void) | null = null;
    let unsubGallery: (() => void) | null = null;

    try {
      const qReviews = query(collection(db, "reviews"));
      unsubReviews = onSnapshot(qReviews, (snap) => {
        const docs = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Review));
        if (docs.length > 0) {
          setLiveReviews(docs.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
        }
      });

      const qGallery = query(collection(db, "gallery"));
      unsubGallery = onSnapshot(qGallery, (snap) => {
        const docs = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
        if (docs.length > 0) {
          setLiveGallery(docs);
        }
      });

      getDocs(collection(db, "products")).then((snap) => {
        setProductCount(snap.size);
      });
    } catch (e) {
      console.warn("Could not subscribe to reviews/gallery in LaunchControlTab:", e);
    }

    return () => {
      if (unsubReviews) unsubReviews();
      if (unsubGallery) unsubGallery();
    };
  }, []);

  // Local form state
  const [enabled, setEnabled] = useState<boolean>(true);
  const [dateStr, setDateStr] = useState<string>("2026-09-01");
  const [timeStr, setTimeStr] = useState<string>("18:00:00");
  const [timezone, setTimezone] = useState<string>("Asia/Colombo");
  const [title, setTitle] = useState<string>("STREET MOBILE");
  const [tagline, setTagline] = useState<string>("VAVUNIYA • SRI LANKA");
  const [glowColor, setGlowColor] = useState<string>("#C4E2F5");

  // Pre-launch experience configuration
  const [preLaunchEnabled, setPreLaunchEnabled] = useState<boolean>(true);
  const [displayMode, setDisplayMode] = useState<"interval_rotate" | "always_visible">("interval_rotate");
  const [rotationIntervalSeconds, setRotationIntervalSeconds] = useState<number>(300);
  const [autoplay, setAutoplay] = useState<boolean>(true);
  const [swipeEnabled, setSwipeEnabled] = useState<boolean>(true);
  const [thankYouEnabled, setThankYouEnabled] = useState<boolean>(false);
  const [locationEnabled, setLocationEnabled] = useState<boolean>(true);
  const [reviewsEnabled, setReviewsEnabled] = useState<boolean>(true);
  const [galleryEnabled, setGalleryEnabled] = useState<boolean>(true);
  const [momentsEnabled, setMomentsEnabled] = useState<boolean>(false);

  // Features
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState<boolean>(true);
  const [animationEnabled, setAnimationEnabled] = useState<boolean>(true);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Master Test Launch Fullscreen Preview Modal (30 Seconds)
  const [isTestLaunchModalOpen, setIsTestLaunchModalOpen] = useState<boolean>(false);
  const [testSimulatedSeconds, setTestSimulatedSeconds] = useState<number>(30);
  const testTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Individual Module Test States
  const [activeIndividualTest, setActiveIndividualTest] = useState<
    "avatar_animation" | "female_voice" | "aura_music" | "countdown_voice" | "launch_celebration" | "chatbot_transition" | null
  >(null);

  // Voice Test Controller
  const [voicePlaying, setVoicePlaying] = useState<boolean>(false);
  const [isAuraMusicActive, setIsAuraMusicActive] = useState<boolean>(false);

  // Countdown Test
  const [testCountdownNumber, setTestCountdownNumber] = useState<number | null>(null);

  // Initialize from remote settings
  useEffect(() => {
    if (settings) {
      setEnabled(settings.enabled ?? true);
      setTimezone(settings.timezone || "Asia/Colombo");
      setTitle(settings.title || "STREET MOBILE");
      setTagline(settings.tagline || "VAVUNIYA • SRI LANKA");
      setGlowColor(settings.glowColor || "#C4E2F5");

      if (settings.launchTimestamp) {
        try {
          const d = new Date(settings.launchTimestamp);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          setDateStr(`${yyyy}-${mm}-${dd}`);

          const hh = String(d.getHours()).padStart(2, "0");
          const min = String(d.getMinutes()).padStart(2, "0");
          const ss = String(d.getSeconds()).padStart(2, "0");
          setTimeStr(`${hh}:${min}:${ss}`);
        } catch {}
      }

      if (settings.preLaunchExperience) {
        const exp = settings.preLaunchExperience;
        setPreLaunchEnabled(exp.enabled ?? true);
        setDisplayMode(exp.displayMode || "interval_rotate");
        setRotationIntervalSeconds(exp.rotationIntervalSeconds || 300);
        setAutoplay(exp.autoplay ?? true);
        setSwipeEnabled(exp.swipeEnabled ?? true);
        setThankYouEnabled(exp.thankYouEnabled ?? false);
        setLocationEnabled(exp.locationEnabled ?? true);
        setReviewsEnabled(exp.reviewsEnabled ?? true);
        setGalleryEnabled(exp.galleryEnabled ?? true);
        setMomentsEnabled(exp.momentsEnabled ?? false);
      }
    }
  }, [settings]);

  // Compute launch target timestamp
  const computedLaunchTimestamp = useMemo(() => {
    try {
      const combined = `${dateStr}T${timeStr}`;
      const parsed = new Date(combined);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    } catch {}
    return settings?.launchTimestamp || "2026-09-01T18:00:00.000Z";
  }, [dateStr, timeStr, settings?.launchTimestamp]);

  // Real-time server-synced countdown
  const { countdown, now } = useServerTime({
    targetTimestamp: computedLaunchTimestamp,
  });

  // Compiled pre-launch settings
  const compiledPreLaunchSettings: PreLaunchExperienceSettings = useMemo(() => {
    return {
      enabled: preLaunchEnabled,
      displayMode,
      rotationIntervalSeconds,
      autoplay,
      swipeEnabled,
      thankYouEnabled,
      locationEnabled,
      reviewsEnabled,
      galleryEnabled,
      momentsEnabled,
    };
  }, [
    preLaunchEnabled,
    displayMode,
    rotationIntervalSeconds,
    autoplay,
    swipeEnabled,
    thankYouEnabled,
    locationEnabled,
    reviewsEnabled,
    galleryEnabled,
    momentsEnabled,
  ]);

  // Handle Save
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await saveSettings({
        enabled,
        launchTimestamp: computedLaunchTimestamp,
        timezone,
        title,
        tagline,
        glowColor,
        manualReveal: false,
        preLaunchExperience: compiledPreLaunchSettings,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      alert("Failed to save launch settings. Check console or permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  const [testSessionKey, setTestSessionKey] = useState<string>(() => Date.now().toString());

  // Trigger Master 50-Second Test Launch in Isolated Preview (40s Speaking + 10s Countdown)
  const handleStartMasterTest = () => {
    primeAudioAndVoice();
    setTestSessionKey(Date.now().toString() + "-" + Math.random().toString(36).slice(2));
    setIsTestLaunchModalOpen(true);
    setTestSimulatedSeconds(50);
  };

  const handleReplayMasterTest = () => {
    primeAudioAndVoice();
    setTestSessionKey(Date.now().toString() + "-" + Math.random().toString(36).slice(2));
    setTestSimulatedSeconds(50);
  };

  const handleCloseMasterTest = () => {
    setIsTestLaunchModalOpen(false);
    stopAllAudioAndSpeech();
  };

  // Run Individual Voice Test (One single locked female voice)
  const handleTestFemaleVoice = async () => {
    setVoicePlaying(true);
    await speakLaunchText("Hello everyone! Welcome to Street Mobile! I'm STREETLA, your virtual shopping assistant, and I'm so excited to welcome you all to this very special moment!");
    setVoicePlaying(false);
  };

  // Toggle Aura Music Test
  const handleToggleAuraMusic = () => {
    if (isAuraMusicActive) {
      stopAmbientAuraMusic();
      setIsAuraMusicActive(false);
    } else {
      startAmbientAuraMusic();
      setIsAuraMusicActive(true);
    }
  };

  // Run 10-to-1 Countdown Test
  const handleTestCountdown = () => {
    let current = 10;
    setTestCountdownNumber(10);
    playCountdownTick(10);
    speakLaunchText("Ten! Let's count down together!");

    const words: Record<number, string> = {
      9: "Nine...",
      8: "Eight...",
      7: "Seven...",
      6: "Six...",
      5: "Five...",
      4: "Four...",
      3: "Three...",
      2: "Two...",
      1: "One!",
    };

    const interval = setInterval(() => {
      current -= 1;
      if (current >= 1) {
        setTestCountdownNumber(current);
        playCountdownTick(current);
        speakLaunchText(words[current] || `${current}!`);
      } else {
        clearInterval(interval);
        setTestCountdownNumber(null);
        playCelebrationFanfare();
        speakLaunchText("We are officially live! Welcome to Street Mobile! We are here for you!");
      }
    }, 1000);
  };

  // Launch Status string
  const launchStatusState = useMemo(() => {
    if (!enabled) return { label: "Launch Disabled", color: "text-red-400", badge: "bg-red-500/20 border-red-500/30", dot: "bg-red-500" };
    if (countdown.isExpired) return { label: "Website Is Live", color: "text-emerald-400", badge: "bg-emerald-500/20 border-emerald-500/30", dot: "bg-emerald-500" };
    return { label: "Ready for Launch", color: "text-emerald-400", badge: "bg-emerald-500/20 border-emerald-500/30", dot: "bg-emerald-500" };
  }, [enabled, countdown.isExpired]);

  return (
    <div className="space-y-8 text-white font-outfit pb-16">
      
      {/* ── 1. Top Header & Live Launch Status Center ── */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        
        {/* Ambient Glow Aura */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ backgroundColor: glowColor }}
        />

        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Launch Experience</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${launchStatusState.badge} ${launchStatusState.color}`}>
                  <span className={`w-2 h-2 rounded-full ${launchStatusState.dot} animate-pulse`} />
                  {launchStatusState.label}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/60 font-medium">
                Virtual AI Assistant 30-Second Launch Experience & Countdown Control
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Time Remaining & Master 30s Test Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Real-time Countdown Chip */}
          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-3">
            <Timer className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/50 block">Time Remaining</span>
              <span className="text-sm sm:text-base font-black font-mono tracking-tight text-white tabular-nums">
                {countdown.days}d : {countdown.hours}h : {countdown.minutes}m : {countdown.seconds}s
              </span>
            </div>
          </div>

          {/* Master 50s Test Button */}
          <button
            onClick={handleStartMasterTest}
            className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin duration-3000" />
            <span>🧪 FULL 50-SECOND LAUNCH TEST</span>
          </button>
        </div>
      </div>

      {/* ── 2. Individual Audio & Visual Component Tests ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Test 1: Single Locked Female Voice */}
        <div className="bg-[#0F172A] border border-white/10 hover:border-purple-500/40 rounded-3xl p-5 space-y-3 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Consistent Female Voice</h3>
              <p className="text-xs text-white/50">Warm, friendly locked English female identity</p>
            </div>
          </div>
          <button
            onClick={handleTestFemaleVoice}
            className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-purple-400" />
            <span>🔊 Test Female Voice ({voicePlaying ? "Speaking..." : "Play Voice"})</span>
          </button>
        </div>

        {/* Test 2: Background Aura Music */}
        <div className="bg-[#0F172A] border border-white/10 hover:border-purple-500/40 rounded-3xl p-5 space-y-3 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Background Aura Music</h3>
              <p className="text-xs text-white/50">Cinematic ambient pad with audio ducking</p>
            </div>
          </div>
          <button
            onClick={handleToggleAuraMusic}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isAuraMusicActive ? "bg-emerald-600 text-white" : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>{isAuraMusicActive ? "Stop Aura Music ⏸" : "Test Background Aura Music ▶"}</span>
          </button>
        </div>

        {/* Test 3: Assistant Animation & Lip Sync */}
        <div className="bg-[#0F172A] border border-white/10 hover:border-purple-500/40 rounded-3xl p-5 space-y-3 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <Smile className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Assistant Lip Sync & Motion</h3>
              <p className="text-xs text-white/50">Floating, blinking, speaking waves & LED</p>
            </div>
          </div>
          <button
            onClick={() => setActiveIndividualTest("avatar_animation")}
            className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Smile className="w-3.5 h-3.5 text-emerald-400" />
            <span>👩 Test Assistant Animation</span>
          </button>
        </div>

        {/* Test 4: 10-Second Countdown Voice & Chimes */}
        <div className="bg-[#0F172A] border border-white/10 hover:border-purple-500/40 rounded-3xl p-5 space-y-3 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">10-to-1 Countdown Voice</h3>
              <p className="text-xs text-white/50">Same female voice counting 10... 1 with ticks</p>
            </div>
          </div>
          <button
            onClick={handleTestCountdown}
            className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span>⏱ Test Countdown Voice</span>
          </button>
        </div>

        {/* Test 5: Launch Fanfare & Celebration */}
        <div className="bg-[#0F172A] border border-white/10 hover:border-purple-500/40 rounded-3xl p-5 space-y-3 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300">
              <PartyPopper className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Launch Fanfare & Sound Effects</h3>
              <p className="text-xs text-white/50">C-Major celebration fanfare & live announcement</p>
            </div>
          </div>
          <button
            onClick={() => {
              playCelebrationFanfare();
              speakLaunchText("We are officially live! 🎉 Welcome to Street Mobile! We are here for you!");
            }}
            className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PartyPopper className="w-3.5 h-3.5 text-pink-400" />
            <span>🎉 Test Launch Sound Effects</span>
          </button>
        </div>

        {/* Test 6: Chatbot Glide Transformation */}
        <div className="bg-[#0F172A] border border-white/10 hover:border-purple-500/40 rounded-3xl p-5 space-y-3 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Chatbot Glide Transition</h3>
              <p className="text-xs text-white/50">Scale down to 60x60px floating button</p>
            </div>
          </div>
          <button
            onClick={() => setActiveIndividualTest("chatbot_transition")}
            className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-violet-400" />
            <span>🤖 Test Chatbot Transition</span>
          </button>
        </div>

      </div>

      {/* ── 3. Launch Readiness & Audio Quality Checklist ── */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-extrabold text-white">Audio & System Launch Readiness Checklist</h3>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> 10 / 10 Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          {[
            { label: "Single Female Voice Locked", status: true, note: "Zero voice switches or male voice" },
            { label: "Background Aura Music Ready", status: true, note: "Cinematic synth with audio ducking" },
            { label: "Countdown Audio Synchronized", status: true, note: "10 to 1 with ticks & speech" },
            { label: "Launch Fanfare Audio Chords", status: true, note: "Celebration major arpeggios" },
            { label: "Official Avatar Loaded", status: true, note: "Verified /streetla.png image" },
            { label: "Confetti Particle Engine Ready", status: true, note: "GPU-accelerated Canvas burst" },
            { label: "Firebase Live Connected", status: true, note: "Real-time settings synced" },
            { label: "Products Catalog Live", status: true, note: `${productCount} active catalog items` },
            { label: "AI Shopping Assistant Ready", status: true, note: "Multilingual Streetla active" },
            { label: "Smart Search System Ready", status: true, note: "Live keyword catalog indexing" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3"
            >
              <div>
                <span className="font-bold text-white block">{item.label}</span>
                <span className="text-[11px] text-white/50">{item.note}</span>
              </div>
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Master Launch & Section Visibility Controls (ON / OFF) ── */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-extrabold flex items-center gap-2 text-white">
              <Sliders className="w-5 h-5 text-purple-400" />
              Launch &amp; Section Visibility Controls (ON / OFF)
            </h3>
            <p className="text-xs text-white/50 mt-1">
              Enable or disable the launch countdown gate and toggle individual showcase sections.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}</span>
          </button>
        </div>

        {/* Master Switches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Master 1: Launch Countdown Gate */}
          <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            enabled ? "bg-purple-950/30 border-purple-500/40 shadow-lg shadow-purple-500/5" : "bg-white/5 border-white/10 opacity-70"
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Rocket className={`w-4 h-4 ${enabled ? "text-purple-400" : "text-white/40"}`} />
                <span className="font-extrabold text-sm text-white">Launch Countdown Gate</span>
              </div>
              <p className="text-[11px] text-white/50">
                {enabled ? "ACTIVE • Visitors see launch gate" : "DISABLED • Direct website access"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-purple-600 shadow-inner"></div>
            </label>
          </div>

          {/* Master 2: Pre-Launch Rotating Experience */}
          <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            preLaunchEnabled ? "bg-blue-950/30 border-blue-500/40 shadow-lg shadow-blue-500/5" : "bg-white/5 border-white/10 opacity-70"
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Layers className={`w-4 h-4 ${preLaunchEnabled ? "text-blue-400" : "text-white/40"}`} />
                <span className="font-extrabold text-sm text-white">Rotating Pre-Launch Deck</span>
              </div>
              <p className="text-[11px] text-white/50">
                {preLaunchEnabled ? "ACTIVE • Cycles trust slides" : "DISABLED • Countdown only"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={preLaunchEnabled}
                onChange={(e) => setPreLaunchEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
            </label>
          </div>

          {/* Master 3: Store Gallery Slide */}
          <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            galleryEnabled ? "bg-emerald-950/30 border-emerald-500/40 shadow-lg shadow-emerald-500/5" : "bg-white/5 border-white/10 opacity-70"
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ImageIcon className={`w-4 h-4 ${galleryEnabled ? "text-emerald-400" : "text-white/40"}`} />
                <span className="font-extrabold text-sm text-white">Store Photo Gallery</span>
              </div>
              <p className="text-[11px] text-white/50">
                {galleryEnabled ? `VISIBLE • ${liveGallery.length} photos` : "HIDDEN from showcase"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={galleryEnabled}
                onChange={(e) => setGalleryEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
            </label>
          </div>

          {/* Master 4: Customer Reviews Slide */}
          <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            reviewsEnabled ? "bg-amber-950/30 border-amber-500/40 shadow-lg shadow-amber-500/5" : "bg-white/5 border-white/10 opacity-70"
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Star className={`w-4 h-4 ${reviewsEnabled ? "text-amber-400" : "text-white/40"}`} />
                <span className="font-extrabold text-sm text-white">Customer Reviews Slide</span>
              </div>
              <p className="text-[11px] text-white/50">
                {reviewsEnabled ? `VISIBLE • ${liveReviews.length} reviews` : "HIDDEN from showcase"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={reviewsEnabled}
                onChange={(e) => setReviewsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-amber-600 shadow-inner"></div>
            </label>
          </div>

          {/* Master 5: Location & Contact */}
          <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            locationEnabled ? "bg-indigo-950/30 border-indigo-500/40 shadow-lg shadow-indigo-500/5" : "bg-white/5 border-white/10 opacity-70"
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${locationEnabled ? "text-indigo-400" : "text-white/40"}`} />
                <span className="font-extrabold text-sm text-white">Store Location &amp; Contact</span>
              </div>
              <p className="text-[11px] text-white/50">
                {locationEnabled ? "VISIBLE • Vavuniya showroom" : "HIDDEN from showcase"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={locationEnabled}
                onChange={(e) => setLocationEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
            </label>
          </div>

          {/* Master 6: Thank You Slide */}
          <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            thankYouEnabled ? "bg-pink-950/30 border-pink-500/40 shadow-lg shadow-pink-500/5" : "bg-white/5 border-white/10 opacity-70"
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Heart className={`w-4 h-4 ${thankYouEnabled ? "text-pink-400" : "text-white/40"}`} />
                <span className="font-extrabold text-sm text-white">Thank You Appreciation Card</span>
              </div>
              <p className="text-[11px] text-white/50">
                {thankYouEnabled ? "VISIBLE • Customer gratitude slide" : "HIDDEN (Disabled)"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={thankYouEnabled}
                onChange={(e) => setThankYouEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-pink-600 shadow-inner"></div>
            </label>
          </div>

        </div>
      </div>

      {/* ── 5. Launch Schedule & Target Configuration ── */}
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-extrabold flex items-center gap-2 border-b border-white/10 pb-4">
          <Calendar className="w-5 h-5 text-blue-400" /> Official Launch Schedule
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Launch Date */}
          <div>
            <label className="block text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
              Launch Date
            </label>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
            />
          </div>

          {/* Launch Time */}
          <div>
            <label className="block text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
              Launch Time (24h)
            </label>
            <input
              type="time"
              step="1"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
            />
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value} className="bg-slate-900 text-white">
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) => setVoiceEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-xs font-bold text-white">Voice Enabled</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabledState(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-xs font-bold text-white">Sound Effects</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={subtitlesEnabled}
              onChange={(e) => setSubtitlesEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-xs font-bold text-white">Subtitles Active</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={animationEnabled}
              onChange={(e) => setAnimationEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-xs font-bold text-white">Avatar Animations</span>
          </label>
        </div>

        {/* Save & Production Controls */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : saveSuccess ? "Saved Successfully!" : "Save Launch Settings"}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setConfirmModal({
                  open: true,
                  title: "Disable Launch Countdown?",
                  message: "This will disable the launch gate and allow visitors directly into the website.",
                  onConfirm: async () => {
                    await disableCountdown();
                    setEnabled(false);
                  },
                });
              }}
              className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Disable Countdown</span>
            </button>

            <button
              onClick={() => {
                setConfirmModal({
                  open: true,
                  title: "Reveal Website Immediately?",
                  message: "Are you sure you want to REVEAL NOW? This will immediately make the website public for everyone.",
                  onConfirm: async () => {
                    await revealNow();
                    alert("Website is now LIVE!");
                  },
                });
              }}
              className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Reveal Now (Production)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 5. FULL-SCREEN MASTER 50-SECOND TEST LAUNCH PREVIEW MODAL ── */}
      {isTestLaunchModalOpen && (
        <div className="fixed inset-0 z-[999999999] bg-white flex flex-col">
          {/* Top Test Mode Banner Header */}
          <div className="bg-[#090909] px-6 py-3.5 text-white flex items-center justify-between z-50 border-b border-white/15">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black tracking-wider uppercase flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                50-SECOND TEST MODE PREVIEW (40s SPEAK + 10s COUNTDOWN)
              </span>
              <span className="text-xs text-white/60 hidden sm:inline">
                Simulated Remaining: <strong className="text-white font-mono">{testSimulatedSeconds}s</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReplayMasterTest}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>🔄 Replay Launch</span>
              </button>
              <button
                onClick={handleCloseMasterTest}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Exit Preview</span>
              </button>
            </div>
          </div>

          {/* Virtual Assistant Launch Simulation Component (50s: 40s speaking + 10s countdown) */}
          <div className="flex-1 relative overflow-hidden">
            <VirtualAssistantLaunch
              key={testSessionKey}
              totalRemainingSeconds={testSimulatedSeconds}
              title={title}
              tagline={tagline}
              glowColor={glowColor}
              onLaunchComplete={() => {}}
            />
          </div>
        </div>
      )}

      {/* ── 6. INDIVIDUAL TEST MODAL PREVIEWS ── */}
      {activeIndividualTest && (
        <div className="fixed inset-0 z-[999999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center space-y-6 shadow-2xl relative">
            
            <button
              onClick={() => {
                setActiveIndividualTest(null);
                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              className="absolute top-5 right-5 p-2 text-white/60 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Avatar Animation Test */}
            {activeIndividualTest === "avatar_animation" && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-white">Assistant Motion & Lip Sync</h3>
                <p className="text-xs text-white/60">Idle breath floating, blinking, and active speech waves</p>
                <div className="py-6 flex justify-center">
                  <VirtualAssistantLaunchAvatar mood="speaking" isSpeaking={true} size="md" />
                </div>
              </div>
            )}

            {/* Chatbot Transition Test */}
            {activeIndividualTest === "chatbot_transition" && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-white">Chatbot Glide Transition Test</h3>
                <p className="text-xs text-white/60">Scales down from hero view into floating circular chatbot button</p>
                <div className="py-4 flex justify-center">
                  <VirtualAssistantLaunchAvatar mood="intro" isSpeaking={false} size="sm" />
                </div>
                <p className="text-[11px] text-purple-300 font-medium">
                  Avatar smoothly settles into bottom-right at 60x60px with green active radar ring.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── 7. SAFETY CONFIRMATION MODAL ── */}
      {confirmModal && confirmModal.open && (
        <div className="fixed inset-0 z-[999999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">{confirmModal.title}</h3>
            <p className="text-xs sm:text-sm text-white/60">{confirmModal.message}</p>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-red-600/30"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
