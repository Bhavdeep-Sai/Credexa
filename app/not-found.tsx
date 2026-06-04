"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center bg-grid-glow px-4 text-center">
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-border/50 max-w-md w-full space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-rose-500 tracking-wider">404</h1>
          <h2 className="text-xl font-bold text-foreground">Secure Route Not Found</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page you are looking for does not exist or may have been restricted under administrative safety policies.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => window.history.back()}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/95 transition-all shadow-sm"
          >
            <Home className="w-4 h-4" />
            Home Panel
          </Link>
        </div>
      </div>
    </div>
  );
}
