"use client";

import React from "react";
import Link from "next/link";
import { Check, ShieldCheck, Zap } from "lucide-react";

export default function Pricing() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-4">
          Transparent, Simple Pricing
        </h1>
        <p className="text-muted-foreground text-lg">
          Protect yourself and your family with our AI-powered scam defense tools. Cancel anytime.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
        {/* Free Plan */}
        <div className="glass-panel p-8 rounded-2xl border border-border/50 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-foreground">Free Shield</h3>
              <p className="text-sm text-muted-foreground mt-2">Basic scanning protection for individuals.</p>
            </div>
            
            <div className="flex items-baseline text-foreground">
              <span className="text-5xl font-extrabold tracking-tight">$0</span>
              <span className="text-sm font-semibold text-muted-foreground ml-1">/ forever</span>
            </div>

            <ul className="space-y-3.5 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>5 scans per hour limit</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Text and URL threat checker</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground/60 line-through">
                <Check className="w-4 h-4 shrink-0" />
                <span>Screenshot OCR Scan</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground/60 line-through">
                <Check className="w-4 h-4 shrink-0" />
                <span>Voice Note transcription & check</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground/60 line-through">
                <Check className="w-4 h-4 shrink-0" />
                <span>Grandparent Mode enabled</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <Link
              href="/register"
              className="w-full flex items-center justify-center px-6 py-3 border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-colors text-sm"
            >
              Sign Up Free
            </Link>
          </div>
        </div>

        {/* Premium Plan */}
        <div className="glass-panel p-8 rounded-2xl border-2 border-primary flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold uppercase px-3 py-1 rounded-bl-lg">
            Recommended
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-foreground flex items-center gap-1.5">
                Family Premium
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              </h3>
              <p className="text-sm text-muted-foreground mt-2">Complete multimodal protection for your entire household.</p>
            </div>
            
            <div className="flex items-baseline text-foreground">
              <span className="text-5xl font-extrabold tracking-tight">$9</span>
              <span className="text-sm font-semibold text-muted-foreground ml-1">/ month</span>
            </div>

            <ul className="space-y-3.5 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Unlimited scans</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Text and URL threat checker</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Screenshot OCR Scan (Vision)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Voice Note transcription (Audio)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-semibold text-foreground">Grandparent Mode access</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Scan export and history vault</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <Link
              href="/register"
              className="w-full flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-indigo-500/20 text-sm"
            >
              Get Premium Access
            </Link>
          </div>
        </div>
      </div>

      {/* Safety Note */}
      <div className="mt-16 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5 max-w-md mx-auto leading-relaxed border border-border/50 p-4 rounded-xl">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>Try premium features completely free for the first 14 days. No payment card required to create your basic account.</span>
      </div>
    </div>
  );
}
