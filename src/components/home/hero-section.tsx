"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, MessageCircle } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/utils";
import { getHeroSlides } from "@/lib/firestore-client";
import WebGLGuard from "@/components/ui/WebGLGuard";
import MagneticButton from "@/components/ui/magnetic-button";

// Dynamic import of 3D Canvas component to prevent SSR issues
const DynamicScrollDissolveReveal = dynamic(
  () => import("@/components/ui/scroll-dissolve-reveal").then((mod) => mod.ScrollDissolveReveal),
  { ssr: false }
);

/* ─── Default Fallback Hero Slides ─── */
const defaultHeroSlides = [
  { src: "/hero-slide-1.png", alt: "Premium Mobile Store Interior" },
  { src: "/hero-slide-2.png", alt: "Latest Smartphones Collection" },
  { src: "/hero-slide-3.png", alt: "Mobile Accessories Display" },
  { src: "/hero-slide-4.png", alt: "Premium Phone Experience" },
];

/* ─── Animation Variants ─── */
const itemVar: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ─── Static Desktop Hero Fallback (Rendered when WebGL is unavailable/disabled) ─── */
function DesktopHeroContent() {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10 w-full pt-[100px] pb-16 lg:pt-[110px] lg:pb-24 flex justify-between items-center pointer-events-auto">
      <div className="max-w-4xl text-left">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-xs font-medium mb-8 text-white shadow-xl hover:bg-white/10 transition-colors duration-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Your Trusted Store in Vavuniya
          </div>
        </div>

        <div className="mb-6">
          <h1 className="leading-[1.02] tracking-tight text-left">
            <span
              className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-tight drop-shadow-[0_10px_30px_rgba(255,255,255,0.12)]"
              style={{ fontFamily: "var(--font-outfit), sans-serif" }}
            >
              Premium Mobile
            </span>
            <span
              className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif italic mt-2 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-md"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Experience.
            </span>
          </h1>
        </div>

        <p className="text-[#6B7280] font-[400] md:font-[500] text-[20px] md:text-[22px] leading-[1.8] mb-10 max-w-[620px]">
          Latest Smartphones. Best Prices. Professional Service. Everything you need for your digital life.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-start gap-5 w-full sm:w-auto">
          {/* Primary CTA */}
          <MagneticButton className="w-full sm:w-auto">
            <Link
              href="/products"
              className="group relative z-10 w-full flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-[16px] font-[500] text-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(255,255,255,0.15)] active:scale-[0.98]"
            >
              Shop Now
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </MagneticButton>

          {/* Secondary CTA */}
          <MagneticButton className="w-full sm:w-auto">
            <a
              href={generateWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-full flex items-center justify-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-[16px] font-[500] text-lg transition-all duration-500 hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_8px_24px_rgba(255,255,255,0.05)] active:scale-[0.98]"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400 transition-transform duration-300 group-hover:scale-110" />
              Contact Us
            </a>
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}

function StaticDesktopHeroFallback({ bgImage }: { bgImage: string }) {
  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Static Background Image with Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt="Street Mobile Store"
          className="w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
      </div>

      <DesktopHeroContent />
    </div>
  );
}

export default function HeroSection() {
  const [slides, setSlides] = useState<Array<{ src: string; alt: string }>>(defaultHeroSlides);
  const [currentSlide, setCurrentSlide] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  useEffect(() => {
    async function loadDynamicSlides() {
      try {
        const fetched = await getHeroSlides();
        const activeSlides = fetched
          .filter((s) => s.active !== false)
          .map((s) => ({
            src: s.image_url,
            alt: s.alt || "Street Mobile Banner",
          }));
        if (activeSlides.length > 0) {
          setSlides(activeSlides);
          setCurrentSlide(0);
        }
      } catch (err) {
        console.error("Failed to load hero slides from DB:", err);
      }
    }
    loadDynamicSlides();
  }, []);

  // Auto-slide effect for mobile hero carousel
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const primaryBg = slides[0]?.src || defaultHeroSlides[0].src;

  return (
    <>
      {/* ── MOBILE HERO SECTION (Slide Transition Carousel) ── */}
      <section className="lg:hidden relative w-full min-h-[580px] bg-black overflow-hidden flex flex-col justify-between pt-24 pb-12 px-4">
        {/* Sliding Background Image Carousel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 z-0"
          >
            <img
              src={slides[currentSlide]?.src || defaultHeroSlides[0].src}
              alt={slides[currentSlide]?.alt || "Hero Banner"}
              className="w-full h-full object-cover object-center opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30 z-10" />
          </motion.div>
        </AnimatePresence>

        {/* Mobile Content Overlay */}
        <div className="relative z-20 max-w-xl mx-auto my-auto text-left py-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-medium text-white mb-5 shadow-lg">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Your Trusted Store in Vavuniya
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.05] tracking-tight mb-4">
            <span className="block font-sans">Premium Mobile</span>
            <span className="block font-serif italic text-slate-300">Experience.</span>
          </h1>

          <p className="text-gray-300 text-base leading-relaxed mb-8 max-w-sm">
            Latest Smartphones. Best Prices. Professional Service. Everything you need for your digital life.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/products"
              className="w-full flex items-center justify-center gap-2 bg-white text-black py-3.5 px-6 rounded-2xl font-bold text-base shadow-xl active:scale-95 transition-all"
            >
              Shop Now
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={generateWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white py-3.5 px-6 rounded-2xl font-bold text-base active:scale-95 transition-all"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              Contact Us
            </a>
          </div>
        </div>

        {/* Mobile Slide Dot Indicators */}
        {slides.length > 1 && (
          <div className="relative z-20 flex items-center justify-center gap-2 pt-4">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? "w-6 bg-white" : "w-1.5 bg-white/30"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── DESKTOP HERO SECTION (WebGL Guard + Dynamic Scroll Dissolve) ── */}
      <div className="hidden lg:block">
        <WebGLGuard fallback={<StaticDesktopHeroFallback bgImage={primaryBg} />}>
          <DynamicScrollDissolveReveal
            images={slides.slice(0, 4).map((s) => s.src)}
            containerClassName="h-[400vh]"
          >
            <div
              className="relative w-full h-full flex items-center justify-center overflow-hidden"
              onMouseMove={handleMouseMove}
            >
              {/* Ambient brand color backlight */}
              <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none z-0" />

              {/* Left side blur and dark overlay for text readability */}
              <div
                className="absolute inset-y-0 left-0 w-full lg:w-[68%] bg-gradient-to-r from-black via-black/80 to-transparent backdrop-blur-[6px] z-10 pointer-events-none"
                style={{
                  maskImage: "linear-gradient(to right, black 65%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to right, black 65%, transparent 100%)",
                }}
              />

              {/* Bottom gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />

              <DesktopHeroContent />
            </div>
          </DynamicScrollDissolveReveal>
        </WebGLGuard>
      </div>
    </>
  );
}
