import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import WhatsAppFab from "@/components/layout/whatsapp-fab";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "STREET MOBILE - Premium Mobile Store in Vavuniya",
  description: "Your Trusted Mobile Store in Vavuniya. Latest Smartphones, Accessories & Professional Repair Services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <MobileNav />
        <WhatsAppFab />
      </body>
    </html>
  );
}
