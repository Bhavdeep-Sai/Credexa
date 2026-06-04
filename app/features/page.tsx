"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, Link2, Scan, Mic, Heart, ShieldAlert, CheckCircle, ArrowRight } from "lucide-react";

export default function Features() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-4">
          Advanced Scam Intelligence
        </h1>
        <p className="text-muted-foreground text-lg">
          Credexa scans five different formats of communication using multimodal AI. Learn how we detect and flag cyber scams.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {featureItems.map((item, idx) => (
          <div key={idx} className="glass-panel p-8 rounded-2xl border border-border/50 space-y-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-500/10 text-primary`}>
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            <div className="border-t border-border/50 pt-4 mt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Key Scanners</h4>
              <div className="flex flex-wrap gap-2">
                {item.scanners.map((scan, sIdx) => (
                  <span key={sIdx} className="text-xs bg-muted px-2.5 py-1 rounded-md text-foreground font-medium">
                    {scan}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Risk Explanation */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-border/50 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Risk Classifications Made Simple
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
          We translate complex security reports into one of three color-coded states so anyone can understand the danger immediately.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 max-w-3xl mx-auto">
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-500 flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8" />
            <span className="font-bold text-base">SAFE</span>
            <span className="text-xs text-muted-foreground text-center">No threats, phishing indicators, or urgency patterns found.</span>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-500 flex flex-col items-center gap-2">
            <ShieldAlert className="w-8 h-8" />
            <span className="font-bold text-base">SUSPICIOUS</span>
            <span className="text-xs text-muted-foreground text-center">Unverified offers or redirect links detected. Proceed with caution.</span>
          </div>

          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-500 flex flex-col items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
            <span className="font-bold text-base">DANGEROUS</span>
            <span className="text-xs text-muted-foreground text-center">Confirmed OTP requests, impersonation, or credential stealing.</span>
          </div>
        </div>

        <div className="pt-6">
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 transition-all shadow-md"
          >
            Go to Scan Terminal
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

const featureItems = [
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Text & Chat Analysis",
    desc: "Scan SMS texts, WhatsApp, and emails. We check for social engineering tactics, urgency language (e.g. 'Act now or account blocked'), fake lotteries, courier parcel tracking fees, and banking security prompts.",
    scanners: ["Urgency Analyzer", "OTP Requests", "Grammar & Imposture Checker"],
  },
  {
    icon: <Link2 className="w-6 h-6" />,
    title: "URL & Redirect Analysis",
    desc: "Check where links lead. Scans link-shortening services, lookalike domains (e.g. paypa1.com), missing SSL records, and domain age statistics to confirm legitimacy.",
    scanners: ["Domain Lookalike", "Redirection Tracking", "SSL Checker"],
  },
  {
    icon: <Scan className="w-6 h-6" />,
    title: "Screenshot OCR Engine",
    desc: "Upload image attachments of alerts, messages, or popups. The system extracts texts, checks logo positioning, and validates details to find fraudulent popups or bank impersonation emails.",
    scanners: ["Vision Text Extractor", "Malicious QR Code check", "Visual Spoofing Checker"],
  },
  {
    icon: <Mic className="w-6 h-6" />,
    title: "Speech Voice Analyzer",
    desc: "Analyze voice notes. We transcribe spoken words to inspect for phone extortion schemes, fake customer support calls, tax office claims, and elder financial scams.",
    scanners: ["Speech-to-Text Transcription", "Extortion Word Flags", "Emergency Scam Scans"],
  },
];
