"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuthStore } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { 
  Shield, MessageSquare, Link2, Scan, Mic, 
  UploadCloud, Play, Square, Loader2, RefreshCw, 
  AlertTriangle, CheckCircle, Copy, Check, Eye
} from "lucide-react";

export default function Analyze() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"text" | "url" | "screenshot" | "voice">("text");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Text Tab State
  const [textInput, setTextInput] = useState("");

  // URL Tab State
  const [urlInput, setUrlInput] = useState("");

  // Screenshot Tab State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Voice Note Tab State
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Copy State for Safe Reply
  const [copied, setCopied] = useState(false);

  // Clean timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle Text/URL scan submit
  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    let content = "";
    let fileType = undefined;

    if (activeTab === "text") {
      if (!textInput.trim()) {
        toast("Please enter some text to analyze", "warning");
        return;
      }
      content = textInput;
    } else if (activeTab === "url") {
      if (!urlInput.trim()) {
        toast("Please enter a URL link to analyze", "warning");
        return;
      }
      content = urlInput;
    } else if (activeTab === "screenshot") {
      if (!selectedImage) {
        toast("Please select or drop a screenshot", "warning");
        return;
      }
      content = await fileToBase64(selectedImage);
      fileType = selectedImage.type;
    } else if (activeTab === "voice") {
      if (!selectedAudio) {
        toast("Please upload a voice note or record one", "warning");
        return;
      }
      content = await fileToBase64(selectedAudio);
      fileType = selectedAudio.type;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/analyze", {
        contentType: activeTab,
        content,
        fileType,
      });

      if (response.data.success) {
        setResult(response.data.result);
        toast("Safety analysis completed!", "success");
      }
    } catch (err: any) {
      console.error(err);
      toast(err.response?.data?.error || "AI Scan failed. Please check parameters.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Convert File to base64 helper
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropImage = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
      } else {
        toast("Supported formats: JPEG, PNG, WEBP images.", "warning");
      }
    }
  };

  const handleDropAudio = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("audio/")) {
        setSelectedAudio(file);
        setAudioUrl(URL.createObjectURL(file));
      } else {
        toast("Supported formats: MP3, WAV, M4A audio files.", "warning");
      }
    }
  };

  // Recording controls
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const audioFile = new File([audioBlob], "voice-recording.wav", { type: "audio/wav" });
        setSelectedAudio(audioFile);
        setAudioUrl(URL.createObjectURL(audioBlob));
        
        // Stop all audio tracks to release the mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error(err);
      toast("Could not access microphone. Check browser permissions.", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Copy safe reply text
  const copyReply = (reply: string) => {
    navigator.clipboard.writeText(reply);
    setCopied(true);
    toast("Safe reply copied to clipboard", "success", 1500);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clear current tab inputs
  const resetTab = () => {
    setResult(null);
    setTextInput("");
    setUrlInput("");
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedAudio(null);
    setAudioUrl(null);
    if (timerRef.current) clearInterval(timerRef.current);
    setRecordingDuration(0);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            AI Scan Terminal
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Identify banking scams, phishy urls, and threat messages instantly using multimodal audits.
          </p>
        </div>
        <button
          onClick={resetTab}
          className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Reset Scanner
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* INPUT PANEL - 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-border/50">
            {/* Tabs Selector */}
            <div className="grid grid-cols-4 gap-2 mb-6 border-b border-border/30 pb-4">
              <button
                onClick={() => { setActiveTab("text"); setResult(null); }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-1 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "text"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Text</span>
              </button>

              <button
                onClick={() => { setActiveTab("url"); setResult(null); }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-1 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "url"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Link2 className="w-4 h-4 shrink-0" />
                <span>Link</span>
              </button>

              <button
                onClick={() => { setActiveTab("screenshot"); setResult(null); }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-1 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "screenshot"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Scan className="w-4 h-4 shrink-0" />
                <span>Image</span>
              </button>

              <button
                onClick={() => { setActiveTab("voice"); setResult(null); }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-1 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "voice"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Mic className="w-4 h-4 shrink-0" />
                <span>Audio</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleScan} className="space-y-6">
              {/* TAB 1: TEXT */}
              {activeTab === "text" && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Paste Chat message or SMS
                  </label>
                  <textarea
                    rows={8}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Example: 'Dear User, your account has been suspended due to unverified activities. Please click here to restore immediately: http://bankreset-alert.com'"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 resize-none leading-relaxed"
                  />
                </div>
              )}

              {/* TAB 2: URL */}
              {activeTab === "url" && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Check Phishing Link
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="e.g. http://secure-paypal-login.xyz/update"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: SCREENSHOT */}
              {activeTab === "screenshot" && (
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Upload Screenshot
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDropImage}
                    onClick={() => imageInputRef.current?.click()}
                    className="border-2 border-dashed border-border hover:border-primary/50 bg-background/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[220px]"
                  >
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedImage(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {imagePreview ? (
                      <div className="relative w-full max-h-[160px] flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-[160px] rounded-lg object-contain border border-border"
                        />
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-12 h-12 text-muted-foreground mb-3 animate-pulse" />
                        <p className="text-sm font-bold text-foreground">Drag and drop attachment here</p>
                        <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG, WEBP formats (Max 10MB)</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: VOICE NOTE */}
              {activeTab === "voice" && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Audio Voice Record
                    </label>
                    
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background">
                      {recording ? (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center animate-pulse"
                          title="Stop Recording"
                        >
                          <Square className="w-5 h-5 fill-white" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/95 shadow-md shadow-indigo-500/20"
                          title="Start Recording"
                        >
                          <Mic className="w-5 h-5 fill-primary-foreground" />
                        </button>
                      )}

                      <div>
                        <div className="text-sm font-bold text-foreground">
                          {recording ? "Recording Voice Message..." : "Click mic to speak"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {recording ? `Duration: ${formatDuration(recordingDuration)}` : "Record scam call audio"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-xs text-slate-500 font-bold uppercase tracking-wider my-2">— OR UPLOAD AUDIO FILE —</div>

                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDropAudio}
                    onClick={() => audioInputRef.current?.click()}
                    className="border-2 border-dashed border-border hover:border-primary/50 bg-background/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors"
                  >
                    <input
                      type="file"
                      ref={audioInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedAudio(file);
                          setAudioUrl(URL.createObjectURL(file));
                        }
                      }}
                      accept="audio/*"
                      className="hidden"
                    />

                    {audioUrl ? (
                      <div className="w-full flex flex-col gap-2 p-2">
                        <div className="text-xs font-semibold text-center truncate text-foreground">
                          File: {selectedAudio?.name}
                        </div>
                        <audio src={audioUrl} controls className="w-full h-8" />
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
                        <p className="text-sm font-bold text-foreground">Click to upload voice note file</p>
                        <p className="text-xs text-muted-foreground mt-1">Supports MP3, WAV, M4A formats (Max 10MB)</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Action */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI Scanner Active...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Analyze Safe Status
                  </>
                )}
              </button>
            </form>
          </div>
          
          {/* Guest reminder */}
          {!user && (
            <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-medium text-center">
              Scans run in Guest Mode are not saved.{" "}
              <Link href="/register" className="font-semibold underline hover:text-white">
                Create an account
              </Link>{" "}
              to save history and unlock monthly analytics.
            </div>
          )}
        </div>

        {/* OUTPUT PANEL - 5 cols */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {/* 1. Empty State */}
            {!loading && !result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel p-8 rounded-2xl border border-border/50 text-center min-h-[460px] flex flex-col items-center justify-center gap-4 text-muted-foreground"
              >
                <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center">
                  <Shield className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Waiting for Scan</h3>
                  <p className="text-sm mt-1.5 max-w-xs mx-auto">
                    Fill the form on the left and run analysis to display security ratings here.
                  </p>
                </div>
              </motion.div>
            )}

            {/* 2. Loading State */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel p-8 rounded-2xl border border-border/50 text-center min-h-[460px] flex flex-col items-center justify-center gap-6"
              >
                {/* Spinner visualizer ring */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse-ring"></div>
                  <div className="absolute inset-2 rounded-full border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent animate-spin"></div>
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-foreground">AI Scanning In Progress</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Running domain audits, extracting screenshot strings, and reviewing fraud indicators...
                  </p>
                </div>
              </motion.div>
            )}

            {/* 3. Output Results display */}
            {!loading && result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Main Verdict Card */}
                <div className="glass-panel p-6 rounded-2xl border border-border/50 space-y-6 shadow-xl">
                  {/* Title / Risk Level */}
                  <div className="flex items-center justify-between border-b border-border/30 pb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Scan Diagnostic</span>
                    
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      result.riskLevel === "Safe"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                        : result.riskLevel === "Suspicious"
                        ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                        : "border-rose-500/20 bg-rose-500/10 text-rose-500"
                    }`}>
                      {result.riskLevel === "Safe" ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      {result.riskLevel}
                    </span>
                  </div>

                  {/* Confidence Gauge */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-muted/80 border border-border font-mono text-sm font-bold text-foreground">
                      {Math.round(result.confidence)}%
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{result.category}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">AI Confidence Accuracy Rating</div>
                    </div>
                  </div>

                  {/* Plain language explanation */}
                  <div className="bg-muted/50 p-4 rounded-xl border border-border">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">Explanation</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {result.explanation}
                    </p>
                  </div>

                  {/* Red flags */}
                  {result.redFlags && result.redFlags.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Red Flags Identified</h4>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {result.redFlags.map((flag: string, fIdx: number) => (
                          <li key={fIdx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5"></span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Recommended Actions</h4>
                    <ol className="space-y-2 text-xs text-muted-foreground">
                      {result.recommendations.map((rec: string, rIdx: number) => (
                        <li key={rIdx} className="flex gap-2">
                          <span className="font-bold text-primary shrink-0">{rIdx + 1}.</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Safe Reply Suggestions */}
                  {result.safeReply && (
                    <div className="border-t border-border/30 pt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Suggested Response</h4>
                        <button
                          type="button"
                          onClick={() => copyReply(result.safeReply)}
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy Reply
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-primary/5 p-3 rounded-xl border border-primary/20 text-xs text-primary font-medium italic">
                        "{result.safeReply}"
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
