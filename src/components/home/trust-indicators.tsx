"use client";

import { motion } from "framer-motion";
import { Truck, ShieldCheck, Wrench, CreditCard } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Island-wide Delivery",
    description: "Fast & secure shipping across Sri Lanka",
  },
  {
    icon: ShieldCheck,
    title: "Genuine Products",
    description: "100% authentic with official warranty",
  },
  {
    icon: Wrench,
    title: "Repair Services",
    description: "Professional repairs by certified technicians",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Safe and encrypted transaction methods",
  },
];

export default function TrustIndicators() {
  return (
    <section className="py-12 bg-background border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center p-4"
            >
              <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center mb-4 text-foreground">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm lg:text-base mb-2">{feature.title}</h3>
              <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
