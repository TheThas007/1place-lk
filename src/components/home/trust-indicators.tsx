"use client";

import { useRef, useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  Variants,
  AnimatePresence,
} from "framer-motion";
import { Truck, ShieldCheck, Wrench, CreditCard, X, ArrowRight } from "lucide-react";

/* ─── Data ─── */
const features = [
  {
    icon: Truck,
    title: "Island-wide Delivery",
    description: "Fast & secure shipping across Sri Lanka",
    details:
      "We partner with top courier services to ensure your orders reach you safely and swiftly anywhere in Sri Lanka. Track your package in real-time and enjoy peace of mind with our fully insured shipping.",
  },
  {
    icon: ShieldCheck,
    title: "Genuine Products",
    description: "100% authentic with official warranty",
    details:
      "Every device we sell is 100% authentic, sourced directly from authorized distributors. All our products come with an official company warranty, guaranteeing you the highest quality and support.",
  },
  {
    icon: Wrench,
    title: "Repair Services",
    description: "Professional repairs by certified technicians",
    details:
      "Our certified technicians use only original parts to repair your devices. From screen replacements to complex motherboard repairs, we ensure your device is restored to its perfect condition with a service warranty.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Safe and encrypted transaction methods",
    details:
      "Your security is our priority. We offer safe, encrypted, and seamless payment options including credit/debit cards, bank transfers, and convenient installment plans. Shop with absolute confidence.",
  },
];

/* ─── Animation Variants ─── */
const sectionTitleVar: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

const containerVar: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const cardVar: Variants = {
  hidden: { opacity: 0, y: 50, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ─── Floating Particle Component ─── */
function FloatingParticle({ delay, x, size }: { delay: number; x: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-gray-300/30"
      style={{
        width: size,
        height: size,
        left: x,
        bottom: "-20px",
      }}
      animate={{
        y: [0, -800],
        opacity: [0, 0.6, 0],
        scale: [0.5, 1, 0.3],
      }}
      transition={{
        duration: 12 + Math.random() * 8,
        repeat: Infinity,
        delay,
        ease: "linear",
      }}
    />
  );
}

/* ─── Premium 3D Tilt Card (White Theme) ─── */
function FeatureCard({
  feature,
  index,
  onClick,
}: {
  feature: (typeof features)[0];
  index: number;
  onClick: (f: (typeof features)[0]) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Per-card mouse tracking for 3D tilt
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 200 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);
      rotateX.set(-y * 8);
      rotateY.set(x * 8);
    },
    [rotateX, rotateY]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    setIsHovered(false);
  }, [rotateX, rotateY]);

  return (
    <motion.div variants={cardVar} className="h-full" style={{ perspective: 800 }}>
      <motion.div
        ref={cardRef}
        onClick={() => onClick(feature)}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ y: -12, scale: 1.02 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="group relative h-full flex flex-col items-center text-center p-8 lg:p-10 rounded-[24px] cursor-pointer overflow-hidden
          bg-white
          border border-black
          shadow-[0_4px_20px_rgba(0,0,0,0.06)]
          hover:border-black hover:shadow-[0_16px_40px_rgba(0,0,0,0.15)]
          transition-all duration-500"
      >
        {/* ── Top Accent Line (expands on hover) ── */}
        <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden rounded-t-[24px]">
          <motion.div
            className="h-full bg-gradient-to-r from-gray-300 via-gray-900 to-gray-300"
            initial={{ scaleX: 0, originX: 0 }}
            animate={isHovered ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* ── Shimmer sweep ── */}
        <div className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none">
          <motion.div
            className="absolute inset-y-0 w-[60%] bg-gradient-to-r from-transparent via-gray-100/70 to-transparent skew-x-[-15deg]"
            animate={{ x: ["-100%", "300%"] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              repeatDelay: 7,
              ease: "easeInOut",
              delay: index * 1.5,
            }}
          />
        </div>

        {/* ── Icon Container ── */}
        <motion.div
          className="relative w-16 h-16 rounded-full flex items-center justify-center mb-7 border transition-all duration-500
            bg-gray-50 border-gray-200 shadow-sm
            group-hover:bg-gray-900 group-hover:border-gray-900 group-hover:shadow-md"
          animate={isHovered ? { rotate: 6, scale: 1.1 } : { rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <feature.icon className="w-7 h-7 text-gray-900 relative z-10 transition-colors duration-500 group-hover:text-white" />
        </motion.div>

        {/* ── Animated Divider Line ── */}
        <div className="w-10 h-[2px] bg-gray-200 mb-6 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gray-900"
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: index * 0.15 + 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </div>

        {/* ── Typography ── */}
        <h3 className="font-bold text-[1.2rem] mb-3 text-gray-900 tracking-tight leading-tight transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed font-normal mb-6 group-hover:text-gray-900 transition-colors duration-300">
          {feature.description}
        </p>

        {/* ── CTA Arrow ── */}
        <div className="mt-auto flex items-center gap-2 text-xs font-semibold text-gray-500 group-hover:text-gray-900 transition-colors duration-300">
          <span>Learn more</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Section ─── */
export default function TrustIndicators() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedFeature, setSelectedFeature] = useState<(typeof features)[0] | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative py-28 lg:py-36 overflow-hidden bg-white text-gray-900"
    >
      {/* ══════════════════════════════════════════════════
          BACKGROUND LAYERS
      ══════════════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(0,0,0,0.02),transparent_60%)]" />
        <FloatingParticle delay={0} x="10%" size={4} />
        <FloatingParticle delay={3} x="25%" size={3} />
        <FloatingParticle delay={6} x="45%" size={5} />
        <FloatingParticle delay={2} x="65%" size={3} />
        <FloatingParticle delay={5} x="80%" size={4} />
        <FloatingParticle delay={8} x="90%" size={3} />
      </div>

      {/* ══════════════════════════════════════════════════
          CONTENT
      ══════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          variants={sectionTitleVar}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="text-center mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-900 tracking-wide uppercase mb-5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Why Choose Us
          </div>
          <h2 className="text-3xl lg:text-[2.75rem] font-bold text-gray-900 tracking-tight leading-tight mb-4">
            Why Choose Street Mobile
          </h2>
          <p className="text-gray-600 text-base lg:text-lg max-w-xl mx-auto leading-relaxed font-normal">
            Premium quality, professional service, and total peace of mind — every time.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVar}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7 auto-rows-fr"
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
              onClick={setSelectedFeature}
            />
          ))}
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════
          MODAL
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedFeature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFeature(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 30 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-white border border-gray-200 rounded-[28px] p-8 lg:p-10 shadow-2xl overflow-hidden text-gray-900"
            >
              <button
                onClick={() => setSelectedFeature(null)}
                className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-all z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mb-6">
                  <selectedFeature.icon className="w-7 h-7 text-gray-900" />
                </div>

                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-4 leading-tight">
                  {selectedFeature.title}
                </h3>

                <p className="text-gray-600 leading-relaxed text-[15px] font-normal">
                  {selectedFeature.details}
                </p>

                <button
                  onClick={() => setSelectedFeature(null)}
                  className="mt-8 w-full py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-black transition-colors shadow-md active:scale-[0.98]"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
