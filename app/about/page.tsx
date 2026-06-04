"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Heart, Users, ShieldCheck } from "lucide-react";

export default function About() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-4">
          Our Mission: Protect & Verify
        </h1>
        <p className="text-muted-foreground text-lg">
          Cybercriminals target thousands of individuals daily. We believe security should be accessible to everyone, regardless of age or tech experience.
        </p>
      </div>

      {/* Grid: Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="glass-panel p-6 rounded-2xl border border-border/50 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">The Problem</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Scams are becoming highly sophisticated. Phishing links, OTP thefts, and imposter messages steal billions from families every year.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border/50 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Elderly Care</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Seniors are disproportionately targeted. Complexity prevents them from using standard cybersecurity apps, which is why we built Grandparent Mode.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border/50 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">The Solution</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Credexa uses state-of-the-art AI to translate threat signals into simple answers: Safe, Suspicious, or Dangerous, with clear instructions on what to do.
          </p>
        </div>
      </div>

      {/* Detail Block */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-border/50 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            A Platform Built On Trust
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Credexa is designed by security engineers and designers committed to privacy and digital equity. We do not sell user data or run advertisements. Every analysis processed is designed to verify the truth and prevent fraud.
          </p>
          <div className="flex gap-6 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-4 h-4 text-primary" />
              <span>100k+ Protected Users</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>SOC2 Compliant Auditing</span>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl font-mono text-xs text-slate-400">
          <div className="text-indigo-400 font-bold mb-2">// OUR SAFETY COMMITMENT</div>
          <ul className="space-y-2">
            <li>1. No persistent text logging for guests.</li>
            <li>2. Instant deletion of OCR images after analysis.</li>
            <li>3. Encrypted cloud endpoints.</li>
            <li>4. Clean UI without tracking hooks.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
