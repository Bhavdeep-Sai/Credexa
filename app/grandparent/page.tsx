"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useToast } from "@/components/ui/Toast";
import { 
  Shield, Play, Volume2, ArrowLeft, Loader2, 
  CheckCircle, AlertTriangle, Eye, EyeOff, AlertOctagon, HelpCircle 
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function GrandparentMode() {
  const { toast } = useToast();
  
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Accessibility Toggles
  const [contrastTheme, setContrastTheme] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Stop reading if page changes
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      toast("Please type or paste a message first.", "warning");
      return;
    }

    setLoading(true);
    setResult(null);
    window.speechSynthesis.cancel();
    setSpeaking(false);

    try {
      const response = await axios.post("/api/analyze", {
        contentType: "text",
        content: inputText,
      });

      if (response.data.success) {
        setResult(response.data.result);
        toast("Scanned successfully!", "success");
      }
    } catch (err: any) {
      console.error(err);
      toast("Failed to scan message. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Text-to-Speech (TTS) Voice Engine
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Clear previous reading
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85; // Speak slower for seniors
      utterance.pitch = 1;
      
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      toast("Voice reading is not supported on this browser.", "warning");
    }
  };

  const handleStopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return (
    <div className={`min-h-screen w-full flex flex-col ${
      contrastTheme ? "bg-white text-black font-sans" : "bg-zinc-950 text-zinc-50 font-sans"
    }`}>
      {/* 1. BIG ACCESSIBILITY HEADER */}
      <header className={`px-6 py-6 border-b-4 flex flex-col sm:flex-row items-center justify-between gap-4 ${
        contrastTheme ? "border-black bg-white" : "border-zinc-800 bg-zinc-900"
      }`}>
        <div className="flex items-center gap-3">
          <Shield className="w-10 h-10 text-amber-500 fill-amber-500 shrink-0" />
          <h1 className="text-3xl sm:text-4xl font-black tracking-wider uppercase">
            Credexa Helper
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Contrast Mode Toggle */}
          <button
            onClick={() => setContrastTheme(!contrastTheme)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-base font-extrabold border-2 transition-all cursor-pointer ${
              contrastTheme 
                ? "border-black bg-black text-white" 
                : "border-zinc-50 bg-zinc-50 text-black hover:bg-zinc-200"
            }`}
          >
            {contrastTheme ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            {contrastTheme ? "Standard Theme" : "High Contrast Mode"}
          </button>

          {/* Return button */}
          <Link
            href="/"
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-base font-extrabold border-2 transition-all ${
              contrastTheme
                ? "border-black bg-white text-black hover:bg-zinc-100"
                : "border-zinc-800 bg-zinc-900 text-zinc-50 hover:bg-zinc-800"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </Link>
        </div>
      </header>

      {/* 2. MAIN ACCESSIBILITY WORKSPACE */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col gap-10">
        
        {/* Helper Explanation Banner */}
        <div className={`p-6 border-4 rounded-3xl ${
          contrastTheme ? "border-black bg-zinc-100" : "border-zinc-800 bg-zinc-900/50"
        }`}>
          <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2 mb-2">
            <HelpCircle className="w-7 h-7 text-amber-500 shrink-0" />
            How to use this helper:
          </h2>
          <p className="text-lg leading-relaxed text-slate-400">
            Paste or type any suspicious message, SMS, email, or bank notification into the box below. Click the big green button, and our helper will tell you if it is safe or a scam.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleScan} className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label htmlFor="grandparent-input" className="text-xl sm:text-2xl font-black uppercase tracking-wider">
              Paste or type your message here:
            </label>
            <textarea
              id="grandparent-input"
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste message here..."
              className={`w-full p-6 text-xl rounded-3xl border-4 font-medium transition-all ${
                contrastTheme
                  ? "border-black bg-white text-black placeholder-zinc-500 focus:ring-4 focus:ring-black"
                  : "border-zinc-800 bg-zinc-900 text-zinc-50 placeholder-zinc-600 focus:ring-4 focus:ring-amber-500"
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-6 sm:py-8 rounded-3xl text-2xl sm:text-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all cursor-pointer ${
              loading 
                ? "opacity-50 cursor-not-allowed bg-zinc-500 text-white" 
                : contrastTheme 
                ? "bg-emerald-600 text-white hover:bg-emerald-700 border-4 border-black" 
                : "bg-emerald-500 text-slate-950 hover:bg-emerald-400 hover:scale-[1.01] shadow-lg shadow-emerald-500/25"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin" />
                Checking safety...
              </>
            ) : (
              <>
                <Shield className="w-8 h-8 fill-current" />
                Check Message Safety
              </>
            )}
          </button>
        </form>

        {/* 3. SCREEN OUTPUT & SPEECH SYNTHESIS */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`border-4 rounded-3xl p-8 space-y-8 ${
                contrastTheme ? "border-black bg-white" : "border-zinc-800 bg-zinc-900"
              }`}
            >
              {/* Large verdict Banner */}
              <div className="flex flex-col items-center justify-center text-center py-10 rounded-2xl border-4 gap-4">
                {result.riskLevel === "Safe" && (
                  <div className="flex flex-col items-center gap-4 text-emerald-500">
                    <CheckCircle className="w-20 h-20 fill-emerald-500/10" />
                    <span className="text-4xl sm:text-5xl font-black uppercase tracking-wider">SAFE MESSAGE</span>
                  </div>
                )}
                {result.riskLevel === "Suspicious" && (
                  <div className="flex flex-col items-center gap-4 text-amber-500">
                    <AlertTriangle className="w-20 h-20 fill-amber-500/10" />
                    <span className="text-4xl sm:text-5xl font-black uppercase tracking-wider font-extrabold">SUSPICIOUS</span>
                  </div>
                )}
                {result.riskLevel === "Dangerous" && (
                  <div className="flex flex-col items-center gap-4 text-rose-500">
                    <AlertOctagon className="w-20 h-20 fill-rose-500/10" />
                    <span className="text-4xl sm:text-5xl font-black uppercase tracking-wider font-black">DANGEROUS SCAM</span>
                  </div>
                )}
              </div>

              {/* One-Sentence Simple Explanation */}
              <div className="space-y-3">
                <span className="text-lg font-black uppercase tracking-wider text-muted-foreground block">
                  Safety explanation:
                </span>
                <p className="text-xl sm:text-2xl font-bold leading-relaxed">
                  {result.explanation}
                </p>
              </div>

              {/* Recommended Guideline Actions */}
              <div className="space-y-4 border-t-2 border-border/30 pt-6">
                <span className="text-lg font-black uppercase tracking-wider text-muted-foreground block">
                  What you should do:
                </span>
                <ol className="space-y-3">
                  {result.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex gap-3 text-lg sm:text-xl font-bold">
                      <span className="text-amber-500 font-extrabold shrink-0">{index + 1}.</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* TTS Voice Read Aloud Controls */}
              <div className="border-t-2 border-border/30 pt-6 flex flex-col sm:flex-row gap-4">
                {speaking ? (
                  <button
                    type="button"
                    onClick={handleStopSpeaking}
                    className="flex-1 py-4 bg-rose-600 text-white font-extrabold text-lg rounded-2xl hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 border-2 border-black"
                  >
                    Stop Voice Reading
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => speakText(`The message is rated as ${result.riskLevel}. Explanation: ${result.explanation}. Recommended actions: ${result.recommendations.join(". ")}`)}
                    className={`flex-1 py-5 font-black text-xl rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      contrastTheme 
                        ? "bg-black text-white hover:bg-zinc-800" 
                        : "bg-amber-500 text-slate-950 hover:bg-amber-400 hover:scale-[1.01] shadow-lg shadow-amber-500/15"
                    }`}
                  >
                    <Volume2 className="w-6 h-6 shrink-0" />
                    Read Safety Warning Aloud
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
