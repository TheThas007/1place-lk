"use client";

import { MessageCircle } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/utils";

export default function WhatsAppFab() {
  return (
    <a
      href={generateWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 lg:bottom-8 right-4 z-40 bg-[#25D366] text-white p-3.5 rounded-full shadow-lg shadow-[#25D366]/30 hover:scale-110 hover:shadow-xl hover:shadow-[#25D366]/40 transition-all duration-300 active:scale-95"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" fill="white" />
    </a>
  );
}
