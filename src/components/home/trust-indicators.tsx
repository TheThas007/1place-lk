"use client";

import { useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useTransform,
  useMotionValue,
  useSpring,
  Variants,
  AnimatePresence,
} from "framer-motion";
import { Truck, ShieldCheck, Wrench, CreditCard, X, ArrowRight, Tag, RotateCcw } from "lucide-react";

/* ─── Data ─── */
const features = [
  {
    id: "delivery",
    icon: Truck,
    title: "Island-wide Delivery",
    description: "Fast & secure shipping across Sri Lanka",
    details:
      "We partner with top courier services to ensure your orders reach you safely and swiftly anywhere in Sri Lanka. Track your package in real-time and enjoy peace of mind with our fully insured shipping.",
  },
  {
    id: "genuine",
    icon: ShieldCheck,
    title: "Genuine Products",
    description: "100% authentic with official warranty",
    details:
      "Every device we sell is 100% authentic, sourced directly from authorized distributors. All our products come with an official company warranty, guaranteeing you the highest quality and support.",
  },
  {
    id: "repairs",
    icon: Wrench,
    title: "Repair Services",
    description: "Professional repairs by certified technicians",
    details:
      "Our certified technicians use only original parts to repair your devices. From screen replacements to complex motherboard repairs, we ensure your device is restored to its perfect condition with a service warranty.",
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "Secure Payments",
    description: "Safe and encrypted transaction methods",
    details:
      "Your security is our priority. We offer safe, encrypted, and seamless payment options including credit/debit cards, bank transfers, and convenient installment plans. Shop with absolute confidence.",
  },
];

/* ─── Animation Variants ─── */
const sectionTitleVar: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const containerVar: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVar: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ─── Premium 3D Interactive Card Component (Desktop) ─── */
function DesktopFeatureCard({
  feature,
  onClick,
  prefersReducedMotion,
}: {
  feature: (typeof features)[0];
  onClick: (f: (typeof features)[0]) => void;
  prefersReducedMotion: boolean | null;
}) {
  const Icon = feature.icon;

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 220, damping: 22 });
  const mouseYSpring = useSpring(y, { stiffness: 220, damping: 22 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["9deg", "-9deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-9deg", "9deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      variants={cardVar}
      className="h-full"
      style={{ perspective: 1100 }}
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        className="silver-glow-wrapper h-full will-change-transform"
      >
        <motion.div
          role="button"
          tabIndex={0}
          onClick={() => onClick(feature)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick(feature);
            }
          }}
          className="silver-glow-inner group relative w-full h-full min-h-[300px] flex flex-col items-center text-center p-6 sm:p-7 cursor-pointer overflow-hidden
            bg-white
            hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.07)]
            transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
        >
          {/* Top Subtle Light Reflection */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 to-transparent pointer-events-none" />

          {/* Icon Container with Silver Chrome Effect */}
          <div
            style={{ transform: "translateZ(30px)" }}
            className="w-[58px] h-[58px] rounded-full flex items-center justify-center mb-5 border border-gray-900/10 bg-gray-50/80 shadow-[0_4px_12px_rgba(0,0,0,0.04)] group-hover:scale-105 transition-transform duration-300 ease-out"
          >
            <Icon className="w-6 h-6 text-gray-900 transition-colors duration-300" />
          </div>

          <div className="w-8 h-[1px] bg-gray-200 mb-4 rounded-full group-hover:w-12 transition-all duration-300" />

          {/* Title */}
          <h3
            style={{ transform: "translateZ(24px)" }}
            className="font-bold text-[17px] mb-2 text-gray-900 tracking-tight leading-tight group-hover:text-black transition-colors"
          >
            {feature.title}
          </h3>

          {/* Description */}
          <p
            style={{ transform: "translateZ(16px)" }}
            className="text-[13.5px] text-gray-600 leading-[1.55] font-normal max-w-[220px] mx-auto mb-4"
          >
            {feature.description}
          </p>

          {/* Learn More link */}
          <div
            style={{ transform: "translateZ(18px)" }}
            className="mt-auto pt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-neutral-500 group-hover:text-neutral-900 transition-colors duration-300"
          >
            <span>Learn more</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Section ─── */
export default function TrustIndicators({
  mode = "both",
}: {
  mode?: "strip_only" | "full_only" | "both";
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedFeature, setSelectedFeature] = useState<(typeof features)[0] | null>(null);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });
  const prefersReducedMotion = useReducedMotion();

  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollWidth > 0) {
      const cardWidth = target.scrollWidth / features.length;
      const index = Math.round(target.scrollLeft / cardWidth);
      setActiveMobileIndex(Math.min(features.length - 1, Math.max(0, index)));
    }
  };

  return (
    <>
      {/* ── Mobile Feature Strip (only if strip_only or both) ── */}
      {mode !== "full_only" && (
        <div className="md:hidden w-full bg-white px-3 sm:px-4 py-2 select-none">
          <div className="w-full py-2 px-2.5 bg-white border border-[#E8E8E8] rounded-xl flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-neutral-800 shadow-2xs">
            <div className="flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-700 stroke-[1.75]" />
              <span>100% Genuine</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Tag className="w-3.5 h-3.5 text-neutral-700 stroke-[1.75]" />
              <span>Best Prices</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <RotateCcw className="w-3.5 h-3.5 text-neutral-700 stroke-[1.75]" />
              <span>Easy Returns</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Truck className="w-3.5 h-3.5 text-neutral-700 stroke-[1.75]" />
              <span>Islandwide</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Single Unified "Why Choose 1place.lk" Section ── */}
      {mode !== "strip_only" && (
        <section
          id="why-choose-us"
          ref={sectionRef}
          aria-label="Why Choose 1place.lk"
          className="relative py-8 sm:py-12 md:py-20 lg:py-28 overflow-hidden bg-white text-gray-900 font-sans select-none"
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Single Unified Section Header across all screen sizes */}
            <motion.div
              variants={sectionTitleVar}
              initial="hidden"
              animate={isInView ? "show" : "hidden"}
              className="text-center mb-6 sm:mb-10 md:mb-12"
            >
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-[11px] sm:text-xs font-semibold text-gray-900 tracking-wide uppercase mb-2.5 sm:mb-3.5 shadow-2xs">
                <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-green-500 animate-pulse" />
                Why Choose Us
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2 sm:mb-3">
                Why Choose 1place.lk
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-[600px] mx-auto leading-relaxed font-normal">
                Premium quality, professional service, and total peace of mind — every time.
              </p>
            </motion.div>

            {/* Mobile Layout (< 768px): Horizontal Native Touch Snap Rail */}
            <div className="md:hidden w-full overflow-hidden">
              <div
                ref={scrollRef}
                onScroll={handleMobileScroll}
                className="w-full overflow-x-auto scrollbar-none px-1 py-1 flex items-stretch gap-3 snap-x snap-mandatory scroll-smooth"
                style={{
                  scrollbarWidth: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {features.map((feature) => (
                  <div
                    key={`mob-feat-${feature.id}`}
                    className="w-[78vw] max-w-[280px] shrink-0 snap-center"
                  >
                    <div className="silver-glow-wrapper h-full">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedFeature(feature)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedFeature(feature);
                          }
                        }}
                        className="silver-glow-inner group relative w-full h-full min-h-[220px] flex flex-col items-center text-center p-5 cursor-pointer overflow-hidden bg-white active:scale-[0.98] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
                      >
                        <div className="w-[46px] h-[46px] rounded-full flex items-center justify-center mb-2.5 border border-gray-900/10 bg-gray-50/80 shrink-0">
                          <feature.icon className="w-5 h-5 text-gray-900" />
                        </div>
                        <div className="w-7 h-[1px] bg-gray-200 mb-2 rounded-full" />
                        <p className="font-bold text-[15px] mb-1 text-gray-900 tracking-tight leading-tight">
                          {feature.title}
                        </p>
                        <p className="text-[12px] text-gray-600 leading-[1.45] font-normal max-w-[240px] mx-auto mb-2">
                          {feature.description}
                        </p>
                        <div className="mt-auto pt-1 flex items-center justify-center gap-1 text-xs font-semibold text-gray-500">
                          <span>Learn more</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Swipe Progress Dots */}
              <div className="flex items-center justify-center gap-1.5 mt-2.5 pb-1">
                {features.map((_, dotIdx) => (
                  <span
                    key={dotIdx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeMobileIndex === dotIdx ? "w-5 bg-black" : "w-1.5 bg-neutral-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop Layout (>= 768px): 4-Column 3D Tilt Grid */}
            <motion.div
              variants={containerVar}
              initial="hidden"
              animate={isInView ? "show" : "hidden"}
              className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 auto-rows-fr"
            >
              {features.map((feature) => (
                <DesktopFeatureCard
                  key={feature.id}
                  feature={feature}
                  onClick={setSelectedFeature}
                  prefersReducedMotion={prefersReducedMotion}
                />
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Feature Detail Modal ── */}
      <AnimatePresence>
        {selectedFeature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFeature(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-white border border-gray-200 rounded-[24px] p-7 sm:p-9 shadow-2xl overflow-hidden text-gray-900 z-10"
            >
              <button
                type="button"
                onClick={() => setSelectedFeature(null)}
                aria-label="Close modal"
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors z-10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <div className="w-[52px] h-[52px] rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mb-5">
                  <selectedFeature.icon className="w-6 h-6 text-gray-900" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-3 leading-tight">
                  {selectedFeature.title}
                </h3>

                <p className="text-gray-600 leading-relaxed text-sm sm:text-[15px] font-normal mb-6">
                  {selectedFeature.details}
                </p>

                <button
                  type="button"
                  onClick={() => setSelectedFeature(null)}
                  className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-colors shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
