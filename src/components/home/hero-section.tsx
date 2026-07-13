"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MessageCircle, Star, Users } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/utils";

import MagneticButton from "@/components/ui/magnetic-button";

/* ─── Hero Slides ─── */
const heroSlides = [
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

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* ── Background Slideshow with Ken Burns + Crossfade ── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="sync">
          <motion.img
            key={currentSlide}
            src={heroSlides[currentSlide].src}
            alt={heroSlides[currentSlide].alt}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.5, ease: "easeInOut" },
              scale: { duration: 8, ease: "linear" },
            }}
            className="absolute inset-0 w-full h-full object-cover will-change-transform"
          />
        </AnimatePresence>

        {/* Left side blur and dark overlay for text readability */}
        <div 
          className="absolute inset-y-0 left-0 w-full lg:w-[65%] bg-gradient-to-r from-black/90 via-black/60 to-transparent backdrop-blur-md z-10"
          style={{
            maskImage: 'linear-gradient(to right, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 60%, transparent 100%)'
          }}
        />

        {/* Bottom gradient for slide indicators */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent z-10" />
      </div>

      {/* ── Slide Indicators ── */}
      <div className="absolute bottom-8 right-8 z-20 flex items-center gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className="group relative p-1"
            aria-label={`Go to slide ${index + 1}`}
          >
            <div
              className={`h-[3px] rounded-full transition-all duration-500 ${
                index === currentSlide
                  ? "w-8 bg-white"
                  : "w-4 bg-white/30 group-hover:bg-white/50"
              }`}
            />
            {/* Active slide progress bar */}
            {index === currentSlide && (
              <motion.div
                className="absolute top-1 left-1 h-[3px] rounded-full bg-white/50"
                initial={{ width: 0 }}
                animate={{ width: "2rem" }}
                transition={{ duration: 6, ease: "linear" }}
                key={`progress-${currentSlide}`}
              />
            )}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10 w-full pt-[100px] pb-16 lg:pt-[110px] lg:pb-24 flex justify-between items-center">
        
        {/* ── Left Content (Text Reveal) ── */}
        <motion.div 
          variants={containerVar}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-2xl text-left"
        >
          <motion.div variants={itemVar}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium mb-8 text-white shadow-xl hover:bg-white/15 transition-colors duration-300">
              <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Your Trusted Store in Vavuniya
            </div>
          </motion.div>

          <motion.h1 variants={itemVar} className="text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1] drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
            Premium Mobile <br className="hidden lg:block" />
            <span className="text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Experience.</span>
          </motion.h1>

          <motion.p variants={itemVar} className="text-lg lg:text-xl text-white/80 mb-10 max-w-xl leading-relaxed drop-shadow-md">
            Latest Smartphones. Best Prices. Professional Service.
            Everything you need for your digital life.
          </motion.p>

          <motion.div variants={itemVar} className="flex flex-col sm:flex-row items-center justify-start gap-5 w-full sm:w-auto">
            {/* Primary CTA with Animated Border & Magnetism */}
            <MagneticButton className="w-full sm:w-auto">
              <div className="animated-gradient-border group rounded-xl p-[1px]">
                <Link 
                  href="/products"
                  className="relative z-10 w-full flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-black/80 transition-all duration-300 active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </MagneticButton>
            
            {/* Secondary CTA */}
            <MagneticButton className="w-full sm:w-auto">
              <a 
                href={generateWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center gap-2 bg-black/40 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 active:scale-[0.98] hover:bg-black/50 hover:border-white/30 shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <MessageCircle className="w-4 h-4 text-green-400 relative z-10 transition-transform duration-300 group-hover:scale-110" />
                <span className="relative z-10">Contact Us</span>
              </a>
            </MagneticButton>
          </motion.div>
        </motion.div>

        {/* ── Right Content (Floating Glass Cards - Desktop Only) ── */}
        <div className="hidden lg:block relative w-[400px] h-full pointer-events-none">
          <motion.div
            custom={0}
            variants={floatVar}
            initial="initial"
            animate="animate"
            className="absolute top-[10%] right-0 pointer-events-auto"
          >
            <div className="group flex items-center gap-4 bg-white/10 backdrop-blur-[20px] border border-white/20 p-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-white/15 transition-all duration-500 hover:border-white/30">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
              </div>
              <div>
                <div className="text-white font-bold text-lg drop-shadow-md">4.9/5 Rating</div>
                <div className="text-white/60 text-sm">Google Reviews</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            custom={1}
            variants={floatVar}
            initial="initial"
            animate="animate"
            className="absolute bottom-[20%] right-[10%] pointer-events-auto"
          >
            <div className="group flex items-center gap-4 bg-white/10 backdrop-blur-[20px] border border-white/20 p-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-white/15 transition-all duration-500 hover:border-white/30">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
                <Users className="w-5 h-5 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
              </div>
              <div>
                <div className="text-white font-bold text-lg drop-shadow-md">10K+ Happy</div>
                <div className="text-white/60 text-sm">Customers Served</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

