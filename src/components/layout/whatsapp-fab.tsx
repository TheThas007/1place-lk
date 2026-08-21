"use client";

import { MessageCircle } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function WhatsAppFab() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <a
      href={generateWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-fab fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3 rounded-full shadow-lg shadow-[#25D366]/30 hover:scale-105 hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center cursor-pointer"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-5 h-5" fill="white" />
    </a>
  );
}
