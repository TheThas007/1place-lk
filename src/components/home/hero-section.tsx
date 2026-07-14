"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MessageCircle, Star, Users } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/utils";
import { getHeroSlides } from "@/lib/firestore-client";

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
  transition: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 },
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
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides]);

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
    >
      {/* ── Background Slideshow with Ken Burns + Crossfade ── */}
      <div className="absolute inset-0 z-0 bg-[#070709]">
        {/* Ambient brand color backlight */}
        <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#88E788]/10 blur-[130px] rounded-full pointer-events-none z-0" />

        <AnimatePresence mode="sync">
          {slides[currentSlide] && (
            <motion.img
              key={currentSlide + slides[currentSlide].src}
              src={slides[currentSlide].src}
              alt={slides[currentSlide].alt}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 1.5, ease: "easeInOut" },
                scale: { duration: 8, ease: "linear" },
              }}
              className="absolute inset-0 w-full h-full object-cover object-center z-1 will-change-transform"
            />
          )}
        </AnimatePresence>

        {/* Left side blur and dark overlay for text readability */}
        <div 
          className="absolute inset-y-0 left-0 w-full lg:w-[68%] bg-gradient-to-r from-black via-black/80 to-transparent backdrop-blur-[6px] z-10"
          style={{
            maskImage: 'linear-gradient(to right, black 65%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 65%, transparent 100%)'
          }}
        />

        {/* Bottom gradient for slide indicators */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent z-10" />
      </div>

      {/* ── Slide Indicators ── */}
      <div className="absolute bottom-8 right-8 z-20 flex items-center gap-2">
        {slides.map((_, index) => (
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-xs font-medium mb-8 text-white shadow-xl hover:bg-white/10 transition-colors duration-300">
              <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Your Trusted Store in Vavuniya
            </div>
          </motion.div>

          <motion.div style={{ x: parallaxX, y: parallaxY }} className="mb-6">
            <motion.div animate={floatAnimation}>
              <motion.h1 
                className="font-[800] leading-[1.05] tracking-[-0.05em] text-left text-[clamp(29px,5vw,37px)] md:text-[clamp(35px,4vw,47px)] lg:text-[clamp(43px,4vw,59px)]"
                style={{ fontFamily: "'SF Pro Display', 'Geist', 'Plus Jakarta Sans', sans-serif" }}
                variants={headingContainerVariants}
                initial="hidden"
                animate="show"
              >
                <div className="text-white">
                  {"Premium Mobile".split("").map((char, i) => (
                    <motion.span key={`l1-${i}`} variants={charVariants} className="inline-block">
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </div>
                <div 
                  className="bg-clip-text text-transparent mt-[2px]"
                  style={{
                    backgroundImage: "linear-gradient(180deg, rgba(200,200,200,0.55) 0%, rgba(140,140,140,0.18) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {"Experience.".split("").map((char, i) => (
                    <motion.span key={`l2-${i}`} variants={charVariants} className="inline-block">
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </div>
              </motion.h1>
            </motion.div>
          </motion.div>

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

