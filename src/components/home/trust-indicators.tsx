"use client";

import { useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  Variants,
  AnimatePresence,
} from "framer-motion";
import { Truck, ShieldCheck, Wrench, CreditCard, X, ArrowRight } from "lucide-react";

/* ─── Data ─── */
const features = [
  {
    number: "01",
    icon: Truck,
    title: "Island-wide Delivery",
    description: "Fast & secure shipping across Sri Lanka",
    details:
      "We partner with top courier services to ensure your orders reach you safely and swiftly anywhere in Sri Lanka. Track your package in real-time and enjoy peace of mind with our fully insured shipping.",
  },
  {
    number: "02",
    icon: ShieldCheck,
    title: "Genuine Products",
    description: "100% authentic with official warranty",
    details:
      "Every device we sell is 100% authentic, sourced directly from authorized distributors. All our products come with an official company warranty, guaranteeing you the highest quality and support.",
  },
  {
    number: "03",
    icon: Wrench,
    title: "Repair Services",
    description: "Professional repairs by certified technicians",
    details:
      "Our certified technicians use only original parts to repair your devices. From screen replacements to complex motherboard repairs, we ensure your device is restored to its perfect condition with a service warranty.",
  },
  {
    number: "04",
    icon: CreditCard,
    title: "Secure Payments",
    description: "Safe and encrypted transaction methods",
    details:
      "Your security is our priority. We offer safe, encrypted, and seamless payment options including credit/debit cards, bank transfers, and convenient installment plans. Shop with absolute confidence.",
  },
];

/* ─── Animation Variants ─── */
const sectionTitleVar: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const containerVar: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const cardVar: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ─── Premium Minimal Card Component ─── */
function FeatureCard({
  feature,
  onClick,
  prefersReducedMotion,
}: {
  feature: (typeof features)[0];
  onClick: (f: (typeof features)[0]) => void;
  prefersReducedMotion: boolean | null;
}) {
  const Icon = feature.icon;

  return (
    <motion.div variants={cardVar} className="h-full">
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
        whileHover={prefersReducedMotion ? {} : { y: -2 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="group relative w-full h-full min-h-[310px] flex flex-col items-center text-center p-8 sm:p-[34px] rounded-[22px] cursor-pointer overflow-hidden
          bg-white
          border border-black/[0.15]
          shadow-[0_2px_12px_rgba(0,0,0,0.03)]
          hover:border-black/[0.35] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]
          transition-colors duration-350 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
      >
        {/* Minimal Number Indicator */}
        <span
          className="absolute top-5 right-5 text-[11px] font-mono font-medium text-gray-900/30 group-hover:text-gray-900/50 transition-colors select-none tracking-widest"
          aria-hidden="true"
        >
          {feature.number}
        </span>

        {/* ── 60×60 Icon Container with 24px Icon ── */}
        <div
          className="w-[60px] h-[60px] rounded-full flex items-center justify-center mb-5 border border-gray-900/10 bg-gray-50/80 transition-all duration-350 group-hover:bg-gray-900 group-hover:border-gray-900 group-hover:shadow-xs shrink-0"
        >
          <motion.div
            animate={prefersReducedMotion ? {} : undefined}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Icon className="w-6 h-6 text-gray-900 transition-colors duration-350 group-hover:text-white" />
          </motion.div>
        </div>

        {/* ── 32px Thinner Divider Line ── */}
        <div className="w-8 h-[1px] bg-gray-200 mb-4 rounded-full" />

        {/* ── Heading (18-20px Semibold) ── */}
        <h3 className="font-semibold text-[18px] sm:text-[19px] mb-2 text-gray-900 tracking-tight leading-tight transition-colors duration-300">
          {feature.title}
        </h3>

        {/* ── Body Copy (14-15px, 1.6 line height) ── */}
        <p className="text-[14px] sm:text-[14.5px] text-gray-600 leading-[1.6] font-normal max-w-[240px] mx-auto mb-4 group-hover:text-gray-900 transition-colors duration-300">
          {feature.description}
        </p>

        {/* ── CTA Link Aligned at Bottom ── */}
        <div className="mt-auto pt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 group-hover:text-gray-900 transition-colors duration-300">
          <span>Learn more</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Section ─── */
export default function TrustIndicators() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedFeature, setSelectedFeature] = useState<(typeof features)[0] | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      aria-label="Why Choose Street Mobile"
      className="relative py-20 sm:py-24 lg:py-28 overflow-hidden bg-white text-gray-900 font-sans"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          variants={sectionTitleVar}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="text-center mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-900 tracking-wide uppercase mb-3.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Why Choose Us
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-3">
            Why Choose Street Mobile
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-[600px] mx-auto leading-relaxed font-normal">
            Premium quality, professional service, and total peace of mind — every time.
          </p>
        </motion.div>

        {/* 4 Cards Grid: 1 col on mobile, 2 cols on tablet, 4 cols on desktop */}
        <motion.div
          variants={containerVar}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 auto-rows-fr"
        >
          {features.map((feature) => (
            <FeatureCard
              key={feature.number}
              feature={feature}
              onClick={setSelectedFeature}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </motion.div>
      </div>

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
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors z-10"
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
                  className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-colors shadow-sm active:scale-[0.98]"
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
