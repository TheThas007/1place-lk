"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, Variants, AnimatePresence } from "framer-motion";
import { Truck, ShieldCheck, Wrench, CreditCard, X } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Island-wide Delivery",
    description: "Fast & secure shipping across Sri Lanka",
    details: "We partner with top courier services to ensure your orders reach you safely and swiftly anywhere in Sri Lanka. Track your package in real-time and enjoy peace of mind with our fully insured shipping."
  },
  {
    icon: ShieldCheck,
    title: "Genuine Products",
    description: "100% authentic with official warranty",
    details: "Every device we sell is 100% authentic, sourced directly from authorized distributors. All our products come with an official company warranty, guaranteeing you the highest quality and support."
  },
  {
    icon: Wrench,
    title: "Repair Services",
    description: "Professional repairs by certified technicians",
    details: "Our certified technicians use only original parts to repair your devices. From screen replacements to complex motherboard repairs, we ensure your device is restored to its perfect condition with a service warranty."
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Safe and encrypted transaction methods",
    details: "Your security is our priority. We offer safe, encrypted, and seamless payment options including credit/debit cards, bank transfers, and convenient installment plans. Shop with absolute confidence."
  },
];

/* ─── Animation Variants ─── */
const containerVar: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const cardVar: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ─── Premium Glass Card Component ─── */
function FeatureCard({ feature, index, mouseX, mouseY, onClick }: any) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Parallax calculations
  const springConfig = { damping: 20, stiffness: 100, mass: 0.2 };
  const cardX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfig);
  const cardY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-5, 5]), springConfig);

  return (
    <motion.div variants={cardVar} style={{ x: cardX, y: cardY }} className="h-full">
      <motion.div
        ref={cardRef}
        onClick={() => onClick(feature)}
        whileHover={{ y: -10, scale: 1.03 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="group relative h-full flex flex-col items-center text-center p-8 rounded-[24px] bg-white/60 backdrop-blur-[20px] border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] cursor-pointer overflow-hidden"
      >
        {/* Premium Reflection Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Animated Border Glow (Shimmering White) */}
        <div className="absolute inset-0 rounded-[24px] border border-white opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.7),55%,transparent)] bg-[length:250%_100%] group-hover:animate-shimmer mix-blend-overlay" />

        {/* Icon Container */}
        <div className="relative w-16 h-16 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-6 group-hover:rotate-3 transition-transform duration-500">
          {/* Subtle Glow Behind Icon */}
          <div className="absolute inset-0 bg-black/5 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <feature.icon className="w-7 h-7 text-black relative z-10 group-hover:scale-110 transition-transform duration-500" />
        </div>

        {/* Connecting Animated Line */}
        <div className="w-8 h-[2px] bg-gray-200 mb-6 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-black" 
            initial={{ width: 0 }} 
            whileInView={{ width: "100%" }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8, delay: index * 0.15 + 0.4, ease: [0.16, 1, 0.3, 1] }} 
          />
        </div>

        {/* Typography */}
        <h3 className="font-bold text-lg mb-3 text-gray-900 tracking-tight group-hover:text-black transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed font-medium group-hover:text-gray-600 transition-colors duration-300">
          {feature.description}
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function TrustIndicators() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = sectionRef.current.getBoundingClientRect();
    mouseX.set((clientX - left) / width - 0.5);
    mouseY.set((clientY - top) / height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section 
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative py-24 overflow-hidden bg-white border-y border-black/5"
    >
      {/* ── Background Enhancements ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft radial ambient lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-white to-gray-100 opacity-80" />
        
        {/* Subtle noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.015] mix-blend-multiply"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />

        {/* Very light vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.02)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10">
        <motion.div 
          variants={containerVar}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 auto-rows-fr"
        >
          {features.map((feature, index) => (
            <FeatureCard 
              key={feature.title} 
              feature={feature} 
              index={index} 
              mouseX={mouseX} 
              mouseY={mouseY} 
              onClick={setSelectedFeature}
            />
          ))}
        </motion.div>
      </div>

      {/* ── Modal for Feature Details ── */}
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              {/* Decorative Background Blob */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <button 
                onClick={() => setSelectedFeature(null)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-6">
                  <selectedFeature.icon className="w-7 h-7 text-black" />
                </div>
                
                <h3 className="text-2xl font-black text-black tracking-tight mb-4">
                  {selectedFeature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {selectedFeature.details}
                </p>
                
                <button 
                  onClick={() => setSelectedFeature(null)}
                  className="mt-8 w-full py-4 rounded-xl bg-black text-white font-bold hover:bg-black/80 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
