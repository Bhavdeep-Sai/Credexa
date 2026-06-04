"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, MessageSquare, Link2, Scan, Mic, Heart, HelpCircle, ArrowRight, CheckCircle, AlertTriangle, Play, Sparkles } from "lucide-react";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 1. HERO SECTION */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-12 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-72 h-72 bg-secondary/15 rounded-full blur-3xl pointer-events-none"></div>

        <motion.div
          className="flex-1 text-center lg:text-left z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 border border-primary/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Scam Shield Active
          </motion.div>
          
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6"
          >
            Verify Before <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              You Trust
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed"
          >
            Instant safety analysis for suspicious texts, phishing links, screen attachments, and voice notes. Protect yourself and your parents from cyber threats.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4"
          >
            <Link
              href="/analyze"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/95 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5"
            >
              Start Free Scan
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/grandparent"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-accent/30 bg-accent/10 text-accent font-semibold hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:-translate-y-0.5"
            >
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
              Grandparent Mode
            </Link>
          </motion.div>
        </motion.div>

        {/* Hero Interactive Terminal Mockup */}
        <motion.div
          className="flex-1 w-full max-w-lg z-10"
          initial={{ opacity: 0, scale: 0.9, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="glass-panel rounded-2xl shadow-2xl overflow-hidden border border-border/50">
            <div className="bg-muted px-4 py-3 flex items-center justify-between border-b border-border/50">
              <div className="flex gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500"></span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">credexa-scanner-v1.0.sh</span>
              <span className="w-4"></span>
            </div>
            
            <div className="p-6 font-mono text-sm space-y-4">
              <div className="flex gap-2 text-muted-foreground">
                <span className="text-primary font-bold">&gt;</span>
                <span>curl -X POST https://api.credexa.live/scan</span>
              </div>
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 animate-bounce" />
                <div>
                  <div className="font-bold text-base">Dangerous Threat Detected!</div>
                  <div className="text-xs text-red-400 mt-1">Category: OTP Theft / Bank Suspensation Fraud</div>
                </div>
              </div>
              <div className="bg-muted/50 p-4 rounded-xl border border-border text-xs text-muted-foreground">
                <strong className="text-foreground">Explanation:</strong> The text urges immediate password resets using an unofficial link containing zero security certificates.
              </div>
              <div className="flex justify-between items-center text-xs border-t border-border pt-4">
                <span className="text-emerald-500 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Confidence: 98.4%
                </span>
                <span className="text-slate-500">Scan ID: #42A577D3</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. CORE FEATURES SECTION */}
      <section className="w-full bg-muted/30 py-24 border-y border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              Complete Scam Detection System
            </h2>
            <p className="text-muted-foreground text-lg">
              One platform to check every medium. Analyze content instantly with advanced machine learning diagnostics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => (
              <motion.div
                key={idx}
                className="glass-panel p-6 rounded-2xl border border-border/50 flex flex-col gap-4 glass-card-hover"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${feat.color} text-white shadow-md`}>
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{feat.desc}</p>
                <Link href="/analyze" className="text-primary text-xs font-semibold flex items-center gap-1 group">
                  Scan now
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="w-full py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg">
            Scan content in three simple steps. Get clear verdicts without deciphering cybersecurity jargon.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          {/* Connector Line */}
          <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 bg-border -translate-y-1/2 z-0"></div>

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              className="flex flex-col items-center text-center z-10 bg-background px-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.4 }}
            >
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-lg border-4 border-background mb-6">
                {idx + 1}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. GRANDPARENT ACCESSIBILITY HIGHLIGHT */}
      <section className="w-full bg-amber-500/5 py-20 border-y border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20">
              Accessibility First
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-[1.15]">
              Designed for Seniors. <br />
              <span className="text-amber-500">Grandparent Mode</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              We built a custom interface optimized for elderly family members. It features extra large text scales, high contrast colors, simple touch targets, and a built-in Speech engine to read out safety recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/grandparent"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/15"
              >
                Open Grandparent Mode
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full max-w-md">
            <div className="border-4 border-amber-500/20 bg-background rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Verification Verdict</span>
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 animate-ping"></span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center py-8 rounded-2xl bg-rose-500/10 border-2 border-rose-500 text-rose-500 gap-3">
                  <AlertTriangle className="w-10 h-10" />
                  <span className="text-3xl font-extrabold tracking-tight">DANGEROUS</span>
                </div>
                <div className="bg-muted p-4 rounded-xl border border-border">
                  <p className="text-lg font-bold text-foreground leading-relaxed text-center">
                    "This message is a scam! Do not send money or codes."
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button className="flex items-center gap-1.5 px-6 py-3 bg-muted text-foreground font-bold rounded-xl text-base shadow hover:bg-muted/80">
                  <Play className="w-4 h-4 text-primary fill-primary" /> Read Explanation
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="w-full py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Have questions about how Credexa works? We have answers.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              className="glass-panel p-6 rounded-2xl border border-border/50"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
                <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                {faq.q}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed pl-7">
                {faq.a}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. CTA BANNER */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-16 overflow-hidden flex flex-col items-center text-center gap-6 shadow-2xl">
          {/* Neon radial blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

          <Shield className="w-16 h-16 text-indigo-400 z-10" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight z-10 max-w-xl">
            Start protecting yourself from digital scams today.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed z-10">
            Sign up for a free account to track your scan history, unlock dashboard stats, and export analysis reports.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-2 z-10">
            <Link
              href="/register"
              className="px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25"
            >
              Create Free Account
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 font-semibold hover:bg-slate-700 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "SMS & Chat Scans",
    desc: "Paste text messages or chat snippets. AI scans for fraud patterns, urgency triggers, and extortion language.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: <Link2 className="w-5 h-5" />,
    title: "Phishing Link Analyzer",
    desc: "Check domain registrations, redirect shorteners, and structural flags to identify malicious sites.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: <Scan className="w-5 h-5" />,
    title: "Screenshot OCR Scans",
    desc: "Upload images of chats or alerts. Gemini scans visual cues and parses the text for scams.",
    color: "from-purple-500 to-pink-600",
  },
  {
    icon: <Mic className="w-5 h-5" />,
    title: "Voice Note Analyzer",
    desc: "Upload recording clips. Converts voice notes to transcripts and flags caller impersonation schemes.",
    color: "from-teal-500 to-emerald-600",
  },
];

const steps = [
  {
    title: "Upload or Paste",
    desc: "Enter the text, insert a URL, or drop an audio file/screenshot directly into our scan terminal.",
  },
  {
    title: "AI Analysis",
    desc: "Google Gemini scans the content, cross-referencing phishing data and checking for high-urgency keywords.",
  },
  {
    title: "Get Security Verdict",
    desc: "Review the safety level, read a simple explanation, and copy a generated secure reply.",
  },
];

const faqs = [
  {
    q: "How does Credexa identify scams?",
    a: "Credexa utilizes Google Gemini AI API to check inputs. The system scans the semantic context, domain structures, grammatical inconsistencies, urgency flags, and request indicators (like bank account blocks or lottery winnings) to detect scams.",
  },
  {
    q: "Is my uploaded content private?",
    a: "Absolutely. We do not sell or store content scanned anonymously. Logged-in user history is securely encrypted in MongoDB and can be deleted by the user at any point.",
  },
  {
    q: "What is Grandparent Mode?",
    a: "Grandparent Mode is a high-accessibility design template built for seniors. It displays color-coded cards (Safe, Suspicious, Dangerous) and reads warnings aloud via voice generation, making it easy for older relatives.",
  },
  {
    q: "Can I use the screenshot scan on chat logs?",
    a: "Yes! If you receive a suspicious WhatsApp or Facebook message, screenshot the message and upload it in WebP, PNG, or JPG format. The system automatically reads and analyzes it.",
  },
];
