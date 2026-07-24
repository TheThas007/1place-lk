"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MessageCircle, Star, Users } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/utils";
import { getHeroSlides } from "@/lib/firestore-client";
import { ScrollDissolveReveal } from "@/components/ui/scroll-dissolve-reveal";

import MagneticButton from "@/components/ui/magnetic-button";

/* ─── Default Fallback Hero Slides ─── */
const defaultHeroSlides = [
  { src: "/hero-slide-1.png", alt: "Premium Mobile Store Interior" },
  { src: "/hero-slide-2.png", alt: "Latest Smartphones Collection" },
  { src: "/hero-slide-3.png", alt: "Mobile Accessories Display" },
  { src: "/hero-slide-4.png", alt: "Premium Phone Experience" },
];

/* ─── Animation Variants ─── */
const containerVar: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVar: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const floatVar: Variants = {
  initial: { y: 0 },
  animate: (i: number) => ({
    y: [0, -15, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
      delay: i * 1.5,
    },
  }),
};

const charVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const floatAnimation = {
  y: [-4, 4, -4],
  transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const, delay: 1 },
};

const headingContainerVariants: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

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

  const parallaxX = useSpring(useTransform(mouseX, [-500, 500], [-15, 15]), { stiffness: 50, damping: 20 });
  const parallaxY = useSpring(useTransform(mouseY, [-500, 500], [-15, 15]), { stiffness: 50, damping: 20 });

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

  useEffect(() => {
    // Timer removed since we're using ScrollDissolveReveal which is scroll-driven.
  }, [slides]);

  return (
    <ScrollDissolveReveal
      images={slides.slice(0, 4).map(s => s.src)}
      containerClassName="h-[400vh]"
    >
      <div 
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Ambient brand color backlight */}
        <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#88E788]/10 blur-[130px] rounded-full pointer-events-none z-0" />

        {/* Left side blur and dark overlay for text readability */}
        <div 
          className="absolute inset-y-0 left-0 w-full lg:w-[68%] bg-gradient-to-r from-black via-black/80 to-transparent backdrop-blur-[6px] z-10 pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to right, black 65%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 65%, transparent 100%)'
          }}
        />

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10 w-full pt-[100px] pb-16 lg:pt-[110px] lg:pb-24 flex justify-between items-center pointer-events-auto">
        
        {/* ── Left Content (Text Reveal) ── */}
        <div className="max-w-4xl text-left">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-xs font-medium mb-8 text-white shadow-xl hover:bg-white/10 transition-colors duration-300">
              <span className="flex h-2 w-2 rounded-full bg-green-400" />
              Your Trusted Store in Vavuniya
            </div>
          </div>

          <div className="mb-6">
            <h1 
              className="font-extrabold leading-[1.05] tracking-tight text-left text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
              style={{ fontFamily: "'SF Pro Display', 'Geist', 'Inter', 'Plus Jakarta Sans', sans-serif" }}
            >
              <div className="text-white">
                Premium Mobile
              </div>
              <div 
                className="bg-clip-text text-transparent mt-1"
                style={{
                  backgroundImage: "linear-gradient(180deg, rgba(240,240,240,0.75) 0%, rgba(150,150,150,0.25) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Experience.
              </div>
            </h1>
          </div>

          <motion.p variants={itemVar} className="text-[#6B7280] font-[400] md:font-[500] text-[20px] md:text-[22px] leading-[1.8] mb-10 max-w-[620px]">
            Latest Smartphones. Best Prices. Professional Service.
            Everything you need for your digital life.
          </motion.p>

          <motion.div variants={itemVar} className="flex flex-col sm:flex-row items-center justify-start gap-5 w-full sm:w-auto">
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
                <MessageCircle className="w-5 h-5 text-white/70 transition-transform duration-300 group-hover:scale-110" />
                Contact Us
              </a>
            </MagneticButton>
          </motion.div>
        </div>


      </div>
      </div>
    </ScrollDissolveReveal>
  );
}

