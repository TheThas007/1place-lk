"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-black text-white">
      <div className="max-w-md w-full text-center bg-zinc-950 p-8 sm:p-10 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">Something went wrong</h2>
        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
          We encountered an issue loading this page. Please try reloading or head back home.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 bg-white text-black py-3 px-5 rounded-xl font-bold text-xs sm:text-sm hover:bg-zinc-200 active:scale-95 transition-all cursor-pointer shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 py-3 px-5 rounded-xl font-bold text-xs sm:text-sm active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
