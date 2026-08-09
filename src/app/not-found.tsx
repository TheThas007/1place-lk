import Link from "next/link";
import { ShoppingBag, ArrowRight, Search, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-20 bg-black text-white">
      <div className="max-w-lg w-full text-center bg-zinc-950 p-8 sm:p-12 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 via-zinc-300 to-white mb-4">
          404
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
          Page Not Found
        </h1>

        <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          The product or page you are looking for might have been moved, renamed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-white text-black py-3.5 px-6 rounded-2xl font-bold text-sm hover:bg-zinc-200 active:scale-95 transition-all shadow-lg"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Products
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 py-3.5 px-6 rounded-2xl font-bold text-sm active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
