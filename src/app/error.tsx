"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, ShoppingBag } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled Route Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-black text-white">
      <div className="max-w-md w-full text-center bg-zinc-950 p-8 rounded-3xl border border-zinc-800 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
          Something went wrong
        </h1>

        <p className="text-zinc-400 text-sm leading-relaxed mb-8">
          We experienced a temporary glitch while loading this page. Please try refreshing or return to the homepage.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-black py-3.5 px-5 rounded-2xl font-bold text-sm hover:bg-zinc-200 active:scale-95 transition-all shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 py-3.5 px-5 rounded-2xl font-bold text-sm active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
