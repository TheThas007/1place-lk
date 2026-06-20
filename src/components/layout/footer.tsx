import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

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
    <footer className="bg-foreground text-white pb-24 lg:pb-0">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-16 pb-12">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-block mb-6 group cursor-pointer">
              <div className="relative w-64 h-16 lg:w-80 lg:h-20 flex items-center justify-start transition-transform group-hover:scale-105">
                {/* Fallback text if image fails to load */}
                <span className="font-bold text-xl tracking-tight absolute z-0 hidden" id="logo-fallback-footer">
                  STREET MOBILE
                </span>
                <img 
                  src="/logo.png" 
                  alt="STREET MOBILE Logo" 
                  className="absolute inset-0 w-full h-full object-contain object-left z-10"
                />
              </div>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
              Your trusted mobile store in Vavuniya. Latest smartphones,
              accessories, and professional repair services.
            </p>
            <div className="space-y-2">
              <a
                href="tel:+94774141118"
                className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                +94 77 414 1118
              </a>
              <a
                href="mailto:info@streetmobile.lk"
                className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                info@streetmobile.lk
              </a>
              <p className="flex items-center gap-2 text-sm text-white/60">
                <MapPin className="w-4 h-4 shrink-0" />
                163, Kandaswamy Kovil Road, Vavuniya
              </p>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">
              Services
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
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
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 flex flex-col lg:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} STREET MOBILE (Pvt) Ltd. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://facebook.com/streetmobile"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 011-1h3v-4h-3a5 5 0 00-5 5v2.01h-2l-.396 3.98h2.396v8.01z" />
              </svg>
            </a>
            <a
              href="https://instagram.com/streetmobile"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z" />
              </svg>
            </a>
            <a
              href="https://tiktok.com/@streetmobile"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors"
              aria-label="TikTok"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 015.9 5.82V4.8C5.9 3.81 6.71 3 7.7 3h.6v9.3a3.349 3.349 0 01-2.2 3.15 3.357 3.357 0 01-3.7-.93 3.36 3.36 0 014.07-5.22V6.9a5.76 5.76 0 00-1.07-.1 5.77 5.77 0 105.77 5.77V8.24a7.97 7.97 0 004.56 1.44V6.5a4.26 4.26 0 01-2.43-.68z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
