"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/utils";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Background abstract elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-foreground/5 blur-[120px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-foreground/5 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10 w-full py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className="flex flex-col items-start text-left max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 text-xs font-medium mb-6"
            >
              <span className="flex h-2 w-2 rounded-full bg-green-500" />
              We Are Near You
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"
            >
              Premium Mobile <br className="hidden lg:block" />
              <span className="text-muted-foreground">Experience.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed"
            >
              Latest Smartphones. Best Prices. Professional Service.
              Your trusted electronics store in Vavuniya.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <Link 
                href="/products"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-foreground text-background px-8 py-4 rounded-xl font-medium hover:bg-foreground/90 transition-all active:scale-[0.98]"
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <a 
                href={generateWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-background border border-border text-foreground px-8 py-4 rounded-xl font-medium hover:bg-foreground/5 transition-all active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4 text-green-500" />
                Contact Us
              </a>
            </motion.div>
          </div>

          {/* Image/Visual Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            {/* MacBook Image/Video */}
            <div className="relative z-10 w-full max-w-[500px] lg:max-w-[700px] rounded-2xl overflow-hidden shadow-2xl border border-border/50 group bg-black aspect-video flex items-center justify-center">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                preload="auto"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              >
                <source src="/video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              {/* Subtle gradient overlay to make it blend well with dark/light themes */}
              <div className="absolute inset-0 bg-gradient-to-tr from-background/20 via-transparent to-transparent pointer-events-none" />
            </div>
            
            {/* Floating Elements behind the phone */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute -right-4 lg:-right-12 top-20 w-32 h-32 bg-white rounded-2xl shadow-xl border border-border/50 glass flex items-center justify-center z-20"
            >
              <div className="text-center">
                <span className="block text-2xl font-bold">✓</span>
                <span className="text-xs text-muted-foreground font-medium">Genuine</span>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute -left-4 lg:-left-12 bottom-32 w-36 h-36 bg-foreground text-white rounded-full shadow-2xl flex items-center justify-center z-20"
            >
              <div className="text-center">
                <span className="block text-3xl font-bold">24h</span>
                <span className="text-xs text-white/80 font-medium">Delivery</span>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
