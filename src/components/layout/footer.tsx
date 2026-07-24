import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { siteSettings } from "@/lib/data";

const footerLinks = {
  shop: [
    { href: "/products", label: "All Products" },
    { href: "/categories/iphone", label: "iPhone" },
    { href: "/categories/samsung", label: "Samsung" },
    { href: "/categories/xiaomi", label: "Xiaomi" },
    { href: "/categories/accessories", label: "Accessories" },
  ],
  services: [
    { href: "/contact", label: "Mobile Repairs" },
    { href: "/contact", label: "Screen Replacement" },
    { href: "/contact", label: "Software Support" },
    { href: "/contact", label: "Island-wide Delivery" },
  ],
  company: [
    { href: "/", label: "Home" },
    { href: "/gallery", label: "Gallery" },
    { href: "/reviews", label: "Reviews" },
    { href: "/contact", label: "Contact" },
    { href: "/admin/login", label: "Admin" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-800 text-white pb-24 lg:pb-0">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-16 pb-12">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-block mb-8 group cursor-pointer w-full">
              <div className="relative w-full max-w-[550px] h-32 sm:h-40 lg:h-48 flex items-center justify-start transition-transform duration-300 group-hover:scale-[1.02]">
                {/* Fallback text if image fails to load */}
                <span className="font-extrabold text-3xl lg:text-4xl tracking-tight absolute z-0 hidden" id="logo-fallback-footer">
                  STREET MOBILE
                </span>
                <img 
                  src="/logo.png" 
                  alt="STREET MOBILE Logo" 
                  className="w-full h-full object-contain object-left z-10 brightness-0 invert"
                />
              </div>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6 max-w-xs">
              Your trusted mobile store in Vavuniya. Latest smartphones,
              accessories, and professional repair services.
            </p>
            <div className="space-y-2">
              <a
                href="tel:+94774141118"
                className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                +94 77 414 1118
              </a>
              <a 
                href={`mailto:${siteSettings.email}`}
                className="flex items-center gap-3 text-zinc-300 hover:text-white transition-colors group"
              >
                <Mail className="w-4 h-4" />
                <span>{siteSettings.email}</span>
              </a>
              <p className="flex items-center gap-2 text-sm text-zinc-300">
                <MapPin className="w-4 h-4 shrink-0" />
                163, Kandaswamy Kovil Road, Vavuniya
              </p>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
              Services
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 flex flex-col lg:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} STREET MOBILE (Pvt) Ltd. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/share/1CwkxMjUkr/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 011-1h3v-4h-3a5 5 0 00-5 5v2.01h-2l-.396 3.98h2.396v8.01z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/streetmobile.lk?utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@streetmobile.lk?_r=1&_t=ZS-97ViT22ZBK9"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors"
              aria-label="TikTok"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.22-1.15 4.34-2.82 5.76-1.68 1.43-4.04 2.05-6.2 1.57-2.14-.49-3.95-1.93-4.9-3.85-.92-1.89-.98-4.2-.1-6.14.9-1.99 2.66-3.44 4.74-3.96 1.4-.33 2.88-.2 4.21.28v4.06c-1.57-.46-3.34-.1-4.62 1.05-1.28 1.15-1.74 3.12-.99 4.67.75 1.54 2.5 2.56 4.23 2.39 1.74-.16 3.19-1.39 3.73-3.03.11-.31.18-.63.19-.95.06-2.58.04-5.16.05-7.75.01-4.96.01-9.93.01-14.89h.01z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
