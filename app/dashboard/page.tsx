"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useAuthStore } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { 
  Shield, CheckCircle, AlertTriangle, AlertOctagon, 
  History, BarChart3, ArrowRight, Loader2, Play, Copy, Check, Eye, Trash2
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { AnimatePresence, motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch user's scan history
      const response = await axios.get("/api/history?limit=50");
      if (response.data.success) {
        setHistory(response.data.history);
      }
    } catch (err) {
      console.error(err);
      toast("Failed to load dashboard metrics.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const totalScans = history.length;
  const safeScans = history.filter((item) => item.riskLevel === "Safe").length;
  const suspiciousScans = history.filter((item) => item.riskLevel === "Suspicious").length;
  const dangerousScans = history.filter((item) => item.riskLevel === "Dangerous").length;

  // Chart Data compilation (last 6 months scans timeline)
  const getChartData = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const timelineMap: Record<string, number> = {};

    // Initialize last 6 months
    const date = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      timelineMap[key] = 0;
    }

    // Populate timeline map
    history.forEach((item) => {
      const itemDate = new Date(item.createdAt);
      const key = `${monthNames[itemDate.getMonth()]} ${itemDate.getFullYear()}`;
      if (key in timelineMap) {
        timelineMap[key] += 1;
      }
    });

    return Object.keys(timelineMap).map((key) => ({
      name: key,
      scans: timelineMap[key],
    }));
  };

  const deleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop opening the modal
    if (!confirm("Are you sure you want to delete this scan from history?")) return;
    try {
      const response = await axios.delete(`/api/history/${id}`);
      if (response.data.success) {
        toast("Scan record deleted", "success");
        setHistory((prev) => prev.filter((item) => item._id !== id));
        if (activeAnalysis?._id === id) setActiveAnalysis(null);
      }
    } catch {
      toast("Failed to delete record", "error");
    }
  };

  const copyReply = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast("Safe reply copied!", "success", 1000);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Welcome back, {user?.name || "User"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Check your dashboard metrics and see recent threat statistics.
          </p>
        </div>
        <Link
          href="/analyze"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/95 transition-all shadow-md shadow-indigo-500/10"
        >
          New Security Scan
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* 1. STATS METRICS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* CARD 1: Total */}
            <div className="glass-panel p-6 rounded-2xl border border-border/50 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Scans</span>
                <div className="text-3xl font-extrabold text-foreground">{totalScans}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-primary flex items-center justify-center">
                <History className="w-6 h-6" />
              </div>
            </div>

            {/* CARD 2: Safe */}
            <div className="glass-panel p-6 rounded-2xl border border-border/50 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Safe Scans</span>
                <div className="text-3xl font-extrabold text-emerald-500">{safeScans}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>

            {/* CARD 3: Suspicious */}
            <div className="glass-panel p-6 rounded-2xl border border-border/50 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Suspicious</span>
                <div className="text-3xl font-extrabold text-amber-500">{suspiciousScans}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            {/* CARD 4: Dangerous */}
            <div className="glass-panel p-6 rounded-2xl border border-border/50 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Dangerous</span>
                <div className="text-3xl font-extrabold text-rose-500">{dangerousScans}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <AlertOctagon className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* 2. TIMELINE CHART & RECENT SCANS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Chart Area - 7 cols */}
            <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-border/50 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5">
                  <BarChart3 className="w-5 h-5 text-primary" /> Monthly Scan Volume
                </h3>
              </div>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "var(--popover)", borderColor: "var(--border)", borderRadius: "10px", color: "var(--foreground)" }} />
                    <Area type="monotone" dataKey="scans" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScans)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Scans - 5 cols */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-border/50 space-y-4">
              <div className="flex items-center justify-between border-b border-border/30 pb-3">
                <h3 className="text-lg font-bold text-foreground">Recent Scans</h3>
                <Link href="/history" className="text-xs text-primary font-semibold hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <div className="text-center text-xs text-muted-foreground py-10">No recent scans. Create a new check above!</div>
                ) : (
                  history.slice(0, 5).map((item) => (
                    <div
                      key={item._id}
                      onClick={() => setActiveAnalysis(item.analysisId)}
                      className="p-3.5 rounded-xl border border-border bg-background/50 hover:bg-muted/50 transition-colors flex items-center justify-between cursor-pointer group"
                    >
                      <div className="space-y-0.5 truncate pr-2">
                        <div className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="capitalize">{item.contentType}</span> &bull; <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.riskLevel === "Safe"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                            : item.riskLevel === "Suspicious"
                            ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                            : "border-rose-500/20 bg-rose-500/10 text-rose-500"
                        }`}>
                          {item.riskLevel}
                        </span>
                        
                        <button
                          type="button"
                          onClick={(e) => deleteItem(item._id, e)}
                          className="text-muted-foreground hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/5 transition-colors"
                          title="Delete Scan Log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* DETAIL REPORT MODAL */}
      <AnimatePresence>
        {activeAnalysis && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveAnalysis(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-popover border border-border shadow-2xl rounded-2xl overflow-hidden max-h-[85vh] flex flex-col z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                <div>
                  <h3 className="font-bold text-lg text-foreground">Scam Audit Report</h3>
                  <p className="text-xs text-muted-foreground">Scanned on {new Date(activeAnalysis.createdAt).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setActiveAnalysis(null)}
                  className="px-3 py-1.5 bg-muted text-foreground text-xs font-semibold rounded-lg hover:bg-muted/80 transition-all border border-border"
                >
                  Close
                </button>
              </div>

              {/* Scrollable Contents */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Risk & confidence banner */}
                <div className="flex items-center justify-between border border-border p-4 rounded-xl bg-background/50">
                  <div className="space-y-0.5">
                    <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Verdict</div>
                    <div className="font-bold text-foreground">{activeAnalysis.result.category}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border ${
                    activeAnalysis.result.riskLevel === "Safe"
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                      : activeAnalysis.result.riskLevel === "Suspicious"
                      ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                      : "border-rose-500/20 bg-rose-500/10 text-rose-500"
                  }`}>
                    {activeAnalysis.result.riskLevel === "Safe" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {activeAnalysis.result.riskLevel} ({Math.round(activeAnalysis.result.confidence)}% Confidence)
                  </span>
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">AI Explanation</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-xl border border-border">
                    {activeAnalysis.result.explanation}
                  </p>
                </div>

                {/* Red Flags */}
                {activeAnalysis.result.redFlags && activeAnalysis.result.redFlags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-rose-500">Red Flags</h4>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {activeAnalysis.result.redFlags.map((flag: string, fIdx: number) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2"></span>
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Recommended Safety Guidelines</h4>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    {activeAnalysis.result.recommendations.map((rec: string, rIdx: number) => (
                      <li key={rIdx} className="flex gap-2">
                        <span className="font-bold text-primary shrink-0">{rIdx + 1}.</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Counter Message suggestions */}
                {activeAnalysis.result.safeReply && (
                  <div className="border-t border-border pt-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Suggested Safe Reply</h4>
                      <button
                        onClick={() => copyReply(activeAnalysis.result.safeReply)}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy Text
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-primary/5 p-3 rounded-xl border border-primary/20 text-xs text-primary font-medium italic">
                      "{activeAnalysis.result.safeReply}"
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
