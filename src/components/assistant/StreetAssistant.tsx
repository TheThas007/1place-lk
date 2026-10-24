"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  X,
  Minus,
  Send,
  Globe,
  MoreVertical,
  RotateCcw,
  Headphones,
  ShoppingBag,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { usePurchaseGuard } from "@/lib/use-purchase-guard";
import { useToast } from "@/components/ui/ToastProvider";
import { formatPrice } from "@/lib/utils";
import {
  AssistantMessage,
  AssistantLanguage,
  AssistantProductSummary,
} from "@/lib/types";
import {
  DEFAULT_ASSISTANT_SETTINGS,
  ASSISTANT_QUICK_ACTIONS,
} from "@/lib/assistant-knowledge";
import { siteSettings } from "@/lib/data";
import { BUSINESS_INFO } from "@/lib/business-info";
import { ChatMessageRenderer } from "./ChatMessageRenderer";

const STORAGE_SESSION_KEY = "oneplace_assistant_session_id";
const STORAGE_LANG_KEY = "oneplace_assistant_language";
const STORAGE_MSGS_KEY = "oneplace_assistant_messages_cache";
const SESSION_TOOLTIP_KEY = "oneplace_assistant_tooltip_shown";

export default function StreetAssistant() {
  const pathname = usePathname();
  const { addToCart } = useCart();
  const { handleAuthenticatedPurchase } = usePurchaseGuard();
  const { showToast } = useToast();

  // Hide on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const [language, setLanguage] = useState<AssistantLanguage>("en");
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("/icon.svg");
  const [assistantName, setAssistantName] = useState<string>("1PLACE AI");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect keyboard open on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        if (window.visualViewport && window.visualViewport.height < window.innerHeight * 0.75) {
          setIsKeyboardOpen(true);
        } else {
          setIsKeyboardOpen(false);
        }
      } else {
        setIsKeyboardOpen(false);
      }
    };
    
    window.visualViewport?.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);
    handleResize(); // Init
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fetch live assistant settings from Firestore
  useEffect(() => {
    async function loadSettings() {
      try {
        const { getDoc, doc } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase");
        const snap = await getDoc(doc(db, "settings", "assistant"));
        if (snap.exists()) {
          const data = snap.data();
          if (data.avatar_url) setAvatarUrl(data.avatar_url);
          if (data.assistant_name) setAssistantName(data.assistant_name);
        }
      } catch (e) {
        console.warn("Could not load assistant settings:", e);
      }
    }
    loadSettings();
  }, []);

  // Initialize Session ID & Messages
  useEffect(() => {
    let sId = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!sId) {
      sId = `streetla-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem(STORAGE_SESSION_KEY, sId);
    }
    setSessionId(sId);

    const savedLang = localStorage.getItem(STORAGE_LANG_KEY) as AssistantLanguage;
    if (savedLang && (savedLang === "en" || savedLang === "ta" || savedLang === "si")) {
      setLanguage(savedLang);
    }

    const cached = localStorage.getItem(STORAGE_MSGS_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch (e) {}
    }

    // Default welcome message for 1PLACE AI
    const welcomeMsg: AssistantMessage = {
      id: "welcome-1",
      sender: "assistant",
      text: DEFAULT_ASSISTANT_SETTINGS.welcome_message_en || "Hi! I’m 1Place AI 👋\nI can help you find the right device, compare products, check prices and stock, track orders, and answer warranty questions. How can I help you today?",
      timestamp: new Date().toISOString(),
      language: "en",
      type: "quick_actions",
    };
    setMessages([welcomeMsg]);
  }, []);

  // Listen for open-street-assistant custom event (triggered from bottom nav or buttons)
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener("open-street-assistant", handleOpen);
    return () => window.removeEventListener("open-street-assistant", handleOpen);
  }, []);

  // Show tooltip on customer's first visit per session, auto-hide after 5s
  useEffect(() => {
    const hasShown = sessionStorage.getItem(SESSION_TOOLTIP_KEY);
    if (!hasShown) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        sessionStorage.setItem(SESSION_TOOLTIP_KEY, "true");
        const hideTimer = setTimeout(() => {
          setShowTooltip(false);
        }, 5000);
        return () => clearTimeout(hideTimer);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Sync language selection
  const handleSelectLanguage = (newLang: AssistantLanguage) => {
    setLanguage(newLang);
    localStorage.setItem(STORAGE_LANG_KEY, newLang);
    setShowLangMenu(false);

    let welcomeText = DEFAULT_ASSISTANT_SETTINGS.welcome_message_en;
    if (newLang === "ta") welcomeText = DEFAULT_ASSISTANT_SETTINGS.welcome_message_ta;
    if (newLang === "si") welcomeText = DEFAULT_ASSISTANT_SETTINGS.welcome_message_si;

    const langAckMsg: AssistantMessage = {
      id: `lang-${Date.now()}`,
      sender: "assistant",
      text: welcomeText || "How can I help you?",
      timestamp: new Date().toISOString(),
      language: newLang,
      type: "quick_actions",
    };

    setMessages((prev) => {
      const next = [...prev, langAckMsg];
      localStorage.setItem(STORAGE_MSGS_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Clear Conversation
  const handleClearConversation = () => {
    let welcomeText = DEFAULT_ASSISTANT_SETTINGS.welcome_message_en;
    if (language === "ta") welcomeText = DEFAULT_ASSISTANT_SETTINGS.welcome_message_ta;
    if (language === "si") welcomeText = DEFAULT_ASSISTANT_SETTINGS.welcome_message_si;

    const resetMsg: AssistantMessage = {
      id: `welcome-${Date.now()}`,
      sender: "assistant",
      text: welcomeText || "How can I help you today?",
      timestamp: new Date().toISOString(),
      language,
      type: "quick_actions",
    };
    setMessages([resetMsg]);
    localStorage.removeItem(STORAGE_MSGS_KEY);
    setShowMenu(false);
    showToast("Conversation cleared", "info");
  };

  // Send Message Handler
  const handleSendMessage = async (textToSend?: string, actionName?: string, payloadData?: any) => {
    const rawText = textToSend !== undefined ? textToSend : inputVal;
    if (!rawText.trim() && !actionName) return;

    let userMsg: AssistantMessage | null = null;
    if (rawText.trim()) {
      userMsg = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: rawText.trim(),
        timestamp: new Date().toISOString(),
        language,
      };
      setMessages((prev) => [...prev, userMsg!]);
      setInputVal("");
    }

    const currentProductSlug =
      pathname?.startsWith("/products/") && pathname !== "/products"
        ? pathname.replace("/products/", "").split("/")[0]
        : undefined;

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: rawText,
          language,
          sessionId,
          action: actionName,
          payload: payloadData,
          currentProductSlug,
          history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await res.json();
      if (data.message) {
        setMessages((prev) => {
          const next = [...prev, data.message];
          localStorage.setItem(STORAGE_MSGS_KEY, JSON.stringify(next));
          return next;
        });

        // Sync to server conversation storage in background
        fetch("/api/assistant/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            language,
            messages: [...messages, ...(userMsg ? [userMsg] : []), data.message],
          }),
        }).catch(() => {});
      }
    } catch (err) {
      console.error("Assistant chat error:", err);
      const errMsg: AssistantMessage = {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: "I couldn't complete that request right now. Feel free to chat with our showroom team on WhatsApp or call our Colombo store directly.",
        timestamp: new Date().toISOString(),
        language,
        type: "human_handoff",
        actions: [{ label: "💬 Chat on WhatsApp", action: "open_whatsapp" }],
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Action Click Handler
  const handleActionClick = (action: string, payload?: any, label?: string) => {
    if (action === "open_whatsapp") {
      window.open(
        `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent("Hello 1PLACE.LK, I need assistance")}`,
        "_blank"
      );
      return;
    }
    if (action === "call_store") {
      window.location.href = `tel:${BUSINESS_INFO.phonePrimaryIntl}`;
      return;
    }
    if (action === "open_maps") {
      window.open(payload || BUSINESS_INFO.googleMapsUrl, "_blank");
      return;
    }
    if (action === "email_store") {
      window.location.href = `mailto:${BUSINESS_INFO.emailPrimary}`;
      return;
    }

    handleSendMessage(label || "", action, payload);
  };

  // Add Product to Cart from Assistant Card
  const handleAddProductToCart = (p: AssistantProductSummary) => {
    handleAuthenticatedPurchase({
      action: "add-to-cart",
      product: {
        id: p.id,
        name: p.name,
        price: p.price,
      },
      image: p.image,
      quantity: 1,
      color: p.color || "",
      storage: p.storage || "",
      warrantyTitle: p.warranty || "1 Year Genuine Warranty",
      onSuccess: () => {
        showToast(`Added ${p.name} to bag!`, "success");
      },
    });
  };

  const isDraggingRef = useRef(false);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const dx = Math.abs(e.clientX - dragStartPos.current.x);
    const dy = Math.abs(e.clientY - dragStartPos.current.y);
    if (dx > 6 || dy > 6) {
      isDraggingRef.current = true;
    }
  };

  const handleLauncherClick = () => {
    if (isDraggingRef.current) return;
    setIsOpen((prev) => !prev);
    setIsMinimized(false);
    setShowTooltip(false);
  };

  const quickActions = ASSISTANT_QUICK_ACTIONS[language] || ASSISTANT_QUICK_ACTIONS.en;

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          1. DRAGGABLE FLOATING ASSISTANT LAUNCHER WITH GLOW EFFECT
      ════════════════════════════════════════════════════════════════ */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.12}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className={`fixed z-40 flex items-center select-none cursor-grab active:cursor-grabbing touch-none ${
          isKeyboardOpen && !isOpen ? "opacity-0 translate-y-10 pointer-events-none" : "opacity-100 translate-y-0"
        } ${
          pathname?.startsWith("/products/") && pathname !== "/products"
            ? "bottom-[calc(92px+env(safe-area-inset-bottom,0px))] md:bottom-6 right-3.5 sm:right-4 md:right-6"
            : "bottom-[calc(76px+env(safe-area-inset-bottom,0px))] md:bottom-6 right-3.5 sm:right-4 md:right-6"
        }`}
      >
        {/* Welcome Tooltip */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 12, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="mr-3 bg-[#090909] text-white text-xs sm:text-sm font-bold px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-2xl border border-white/15 hidden sm:flex items-center gap-2.5 pointer-events-auto"
            >
              <span>Chat with AI Assistant 👋</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="text-white/60 hover:text-white p-0.5 cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Circular Floating Streetla Launcher Button with Glow Effect */}
        <div className="relative group">
          {/* Animated Ambient Multi-Color AI Glow Aura */}
          {!isOpen && (
            <>
              <span className="absolute -inset-2 rounded-full bg-gradient-to-tr from-purple-500/40 via-indigo-500/30 to-purple-600/40 blur-md opacity-80 group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />
              <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-purple-500 via-violet-400 to-indigo-500 opacity-70 group-hover:opacity-90 blur-xs transition-opacity pointer-events-none" />
            </>
          )}

          <motion.button
            type="button"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.2 }}
            onClick={handleLauncherClick}
            className="relative w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] rounded-full overflow-hidden bg-black p-0 border-2 border-purple-400/80 shadow-[0_0_24px_rgba(168,85,247,0.5)] transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/40 cursor-grab active:cursor-grabbing shrink-0"
            aria-label="Chat with AI Assistant"
            title="Chat with AI Assistant"
          >
            {isOpen ? (
              <div className="w-full h-full bg-black text-white flex items-center justify-center">
                <X className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={avatarUrl || "/streetla.png"}
                  alt="AI Shopping Assistant"
                  className="w-full h-full object-cover object-center pointer-events-none"
                  draggable={false}
                />
                {/* Small Green Online Status Indicator with Radar Pulse */}
                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#00E676] border-2 border-black flex items-center justify-center">
                  <span className="w-full h-full rounded-full bg-[#00E676] animate-ping opacity-75" />
                </span>
              </div>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════
          2. CHAT WINDOW (Desktop Box & Mobile Bottom Sheet)
      ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 right-0 sm:bottom-24 sm:right-6 z-[70] w-full sm:w-[410px] h-[92vh] sm:h-[640px] max-h-[680px] bg-white rounded-t-[24px] sm:rounded-[24px] shadow-2xl border border-neutral-200/90 flex flex-col overflow-hidden font-sans text-neutral-900"
          >
            {/* ── Chat Header ── */}
            <div className="bg-[#090909] px-4 sm:px-5 py-3.5 text-white flex items-center justify-between border-b border-white/10 shrink-0">
              
              {/* Left: AI Girl Avatar & Titles */}
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-purple-400/60 shrink-0 bg-neutral-900 shadow-md">
                  <img
                    src={avatarUrl || "/streetla.png"}
                    alt="AI Shopping Assistant"
                    className="w-full h-full object-cover object-center"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-none">
                      {assistantName || "1PLACE AI"}
                    </h3>
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold tracking-wider uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-medium leading-none block mt-1">
                    1PLACE.LK Virtual AI Assistant
                  </span>
                </div>
              </div>

              {/* Right: Controls (Language, Options, Close) */}
              <div className="flex items-center gap-1.5 relative">
                
                {/* Language Switcher Button */}
                <button
                  type="button"
                  onClick={() => setShowLangMenu((prev) => !prev)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 border border-white/10"
                  title="Switch Language"
                >
                  <Globe className="w-3.5 h-3.5 text-neutral-300" />
                  <span className="uppercase text-[11px]">{language}</span>
                </button>

                {/* Language Dropdown */}
                {showLangMenu && (
                  <div className="absolute top-11 right-14 w-32 bg-[#121212] border border-white/15 rounded-xl shadow-2xl p-1.5 z-30 space-y-1 text-xs">
                    <button
                      onClick={() => handleSelectLanguage("en")}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-bold flex items-center justify-between ${
                        language === "en" ? "bg-white text-black" : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <span>English</span>
                      {language === "en" && "✓"}
                    </button>
                    <button
                      onClick={() => handleSelectLanguage("ta")}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-bold flex items-center justify-between ${
                        language === "ta" ? "bg-white text-black" : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <span>தமிழ்</span>
                      {language === "ta" && "✓"}
                    </button>
                    <button
                      onClick={() => handleSelectLanguage("si")}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-bold flex items-center justify-between ${
                        language === "si" ? "bg-white text-black" : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <span>සිංහල</span>
                      {language === "si" && "✓"}
                    </button>
                  </div>
                )}

                {/* Options Menu Button */}
                <button
                  type="button"
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="p-2 text-white/70 hover:text-white transition-colors rounded-xl hover:bg-white/10"
                  title="Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Options Dropdown */}
                {showMenu && (
                  <div className="absolute top-11 right-8 w-48 bg-[#121212] border border-white/15 rounded-xl shadow-2xl p-1.5 z-30 space-y-1 text-xs">
                    <button
                      onClick={handleClearConversation}
                      className="w-full text-left px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 flex items-center gap-2 font-medium"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear Conversation</span>
                    </button>
                    <button
                      onClick={() => {
                        handleActionClick("open_whatsapp");
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-emerald-400 hover:bg-white/10 flex items-center gap-2 font-bold"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Support</span>
                    </button>
                    <Link
                      href="/privacy-policy"
                      onClick={() => setShowMenu(false)}
                      className="w-full text-left px-3 py-2 rounded-lg text-white/60 hover:bg-white/10 flex items-center gap-2 block font-medium"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Privacy Info</span>
                    </Link>
                  </div>
                )}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white/70 hover:text-white transition-colors rounded-xl hover:bg-white/10"
                  title="Close Streetla"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* ── Chat Messages Body ── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8F9FA]">
              
              {messages.map((msg, idx) => {
                const isAssistant = msg.sender === "assistant";
                const isFirstInSequence =
                  isAssistant && (idx === 0 || messages[idx - 1]?.sender !== "assistant");

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isAssistant ? "justify-start" : "justify-end"}`}
                  >
                    {/* Small Streetla Avatar beside Assistant Messages */}
                    {isAssistant && (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-neutral-300/80 shrink-0 bg-neutral-900 mt-0.5 shadow-xs">
                        {isFirstInSequence ? (
                          <img
                            src={avatarUrl || "/streetla.png"}
                            alt="Streetla"
                            className="w-full h-full object-cover object-center"
                          />
                        ) : (
                          <div className="w-full h-full bg-transparent" />
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[88%] sm:max-w-[85%] rounded-2xl px-3.5 sm:px-4 py-3 text-sm leading-relaxed ${
                        isAssistant
                          ? "bg-white border border-neutral-200/90 text-neutral-900 rounded-tl-xs shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)]"
                          : "bg-[#090909] text-white rounded-tr-xs font-medium border border-neutral-800 shadow-sm"
                      }`}
                    >
                      {/* Structured & Clean Markdown Renderer */}
                      <ChatMessageRenderer text={msg.text} isAssistant={isAssistant} />

                      {/* ── Rich UI: Dedicated Product Cards ── */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.products.map((p) => (
                            <div
                              key={p.id}
                              className="p-2.5 sm:p-3 bg-neutral-50/90 hover:bg-neutral-50 rounded-2xl border border-neutral-200/80 flex items-center gap-2.5 sm:gap-3 transition-colors shadow-2xs group"
                            >
                              <div className="w-14 h-14 bg-white rounded-xl p-1 border border-neutral-200/90 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-xs text-neutral-950 line-clamp-2 leading-tight">
                                  {p.name}
                                </h5>
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  <span className="text-xs font-extrabold text-neutral-900">
                                    {formatPrice(p.price)}
                                  </span>
                                  {p.old_price && p.old_price > p.price && (
                                    <span className="text-[10.5px] text-neutral-400 line-through">
                                      {formatPrice(p.old_price)}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-emerald-700 font-semibold block truncate mt-0.5">
                                  {p.warranty || "1 Year Genuine Warranty"}
                                </span>
                              </div>

                              <div className="flex flex-col gap-1.5 shrink-0">
                                <Link
                                  href={`/products/${p.slug}`}
                                  onClick={() => setIsOpen(false)}
                                  className="px-2.5 py-1 text-[10.5px] font-bold rounded-lg border border-neutral-300 text-neutral-800 hover:bg-neutral-200 transition-colors text-center"
                                >
                                  Specs
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleAddProductToCart(p)}
                                  className="px-2.5 py-1 text-[10.5px] font-bold rounded-lg bg-[#090909] hover:bg-[#ED0712] text-white transition-colors text-center flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                                >
                                  <ShoppingBag className="w-3 h-3" />
                                  <span>Bag</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ── Rich UI: Comparison Cards ── */}
                      {msg.comparisonProducts && msg.comparisonProducts.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          {msg.comparisonProducts.map((cp) => (
                            <div
                              key={cp.id}
                              className="p-2.5 sm:p-3 bg-neutral-50/90 rounded-2xl border border-neutral-200 text-center space-y-1.5 shadow-2xs"
                            >
                              <div className="w-12 h-12 bg-white rounded-xl p-1 border border-neutral-200/90 mx-auto flex items-center justify-center">
                                <img
                                  src={cp.image}
                                  alt={cp.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <h6 className="font-bold text-[11px] text-neutral-900 leading-tight line-clamp-2">
                                {cp.name}
                              </h6>
                              <div className="font-extrabold text-xs text-neutral-950">
                                {formatPrice(cp.price)}
                              </div>
                              <Link
                                href={`/products/${cp.slug}`}
                                onClick={() => setIsOpen(false)}
                                className="block w-full py-1.5 text-[10.5px] font-bold rounded-xl bg-[#090909] hover:bg-[#ED0712] text-white transition-colors"
                              >
                                View Specs
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ── Rich UI: Order Status Card ── */}
                      {msg.orderData && (
                        <div className="mt-3.5 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2 text-xs">
                          <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                            <span className="font-bold text-neutral-900">
                              Order #{msg.orderData.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                              {msg.orderData.orderStatus}
                            </span>
                          </div>
                          <div className="text-neutral-600 space-y-1">
                            <p><strong>Customer:</strong> {msg.orderData.customerName}</p>
                            <p><strong>Total:</strong> {formatPrice(msg.orderData.finalTotal)}</p>
                            <p><strong>Estimated Delivery:</strong> {msg.orderData.estimatedDelivery}</p>
                          </div>
                          <Link
                            href="/orders"
                            onClick={() => setIsOpen(false)}
                            className="block text-center w-full py-2 mt-1 text-xs font-bold rounded-xl bg-[#090909] hover:bg-neutral-800 text-white transition-colors"
                          >
                            Track on Full Page
                          </Link>
                        </div>
                      )}

                      {/* Action buttons inside message */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-3.5 pt-2.5 border-t border-neutral-100 flex flex-wrap gap-1.5">
                          {msg.actions.map((act) => (
                            <button
                              key={act.label}
                              type="button"
                              onClick={() => handleActionClick(act.action, act.payload, act.label)}
                              className="px-3 py-1.5 rounded-full text-xs font-bold bg-neutral-100 hover:bg-[#090909] hover:text-white text-neutral-800 border border-neutral-200/90 transition-all active:scale-95 cursor-pointer shadow-2xs"
                            >
                              {act.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator with Streetla Avatar */}
              {isLoading && (
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-neutral-300 shrink-0 bg-neutral-900">
                    <img
                      src={avatarUrl || "/streetla.png"}
                      alt="Streetla"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 p-3 bg-white border border-neutral-200 rounded-2xl text-neutral-500 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Quick Action Chips ── */}
            <div className="px-3 py-2.5 bg-white border-t border-neutral-100 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
              {quickActions.map((qa) => (
                <button
                  key={qa.id}
                  type="button"
                  onClick={() => handleActionClick(qa.action, null, qa.label)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-neutral-50 hover:bg-[#090909] hover:text-white text-neutral-800 border border-neutral-200 whitespace-nowrap transition-all shrink-0 active:scale-95 cursor-pointer shadow-2xs"
                >
                  {qa.label}
                </button>
              ))}
            </div>

            {/* ── Sticky Input Area ── */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-neutral-200 shrink-0"
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask about budget, comparisons, colors, stock..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 min-h-[46px] px-4 rounded-xl text-sm font-medium border border-neutral-200 bg-neutral-50 hover:border-neutral-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all"
                />

                <button
                  type="submit"
                  disabled={!inputVal.trim() || isLoading}
                  className="w-[46px] h-[46px] rounded-xl bg-[#090909] hover:bg-[#ED0712] text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-[#090909] active:scale-95 shrink-0 cursor-pointer shadow-sm"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Send className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </form>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
