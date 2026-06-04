"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/Toast";
import { 
  Search, Trash2, Filter, Download, ArrowLeft, ArrowRight, 
  Loader2, CheckCircle, AlertTriangle, AlertOctagon, Calendar, Copy, Check 
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function History() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  
  // Search & Filter State
  const [search, setSearch] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [contentType, setContentType] = useState("");
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Detail Modal
  const [activeAnalysis, setActiveAnalysis] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/history?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&riskLevel=${riskLevel}&contentType=${contentType}`
      );
      if (response.data.success) {
        setHistory(response.data.history);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.total);
      }
    } catch (err) {
      console.error(err);
      toast("Failed to load scan history records.", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, riskLevel, contentType, toast]);

  useEffect(() => {
    fetchHistory();
  }, [page, riskLevel, contentType, fetchHistory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scan permanently?")) return;
    try {
      const response = await axios.delete(`/api/history/${id}`);
      if (response.data.success) {
        toast("Scan record successfully deleted.", "success");
        setHistory((prev) => prev.filter((item) => item._id !== id));
        setTotalItems((prev) => prev - 1);
        if (activeAnalysis?._id === id) setActiveAnalysis(null);
      }
    } catch {
      toast("Failed to delete history record", "error");
    }
  };

  const clearAllHistory = async () => {
    if (!confirm("WARNING: This will permanently wipe your entire scan history. Are you sure?")) return;
    try {
      const response = await axios.delete("/api/history");
      if (response.data.success) {
        toast(response.data.message, "success");
        setHistory([]);
        setTotalItems(0);
        setTotalPages(1);
        setPage(1);
      }
    } catch {
      toast("Failed to wipe history", "error");
    }
  };

  // Export details to JSON / CSV
  const exportData = (format: "json" | "csv") => {
    if (history.length === 0) {
      toast("No history records to export", "warning");
      return;
    }

    let dataStr = "";
    let mimeType = "";
    let filename = "";

    if (format === "json") {
      dataStr = JSON.stringify(history, null, 2);
      mimeType = "application/json";
      filename = `credexa-history-${new Date().toISOString().split("T")[0]}.json`;
    } else {
      // CSV format compile
      const headers = ["Title", "ContentType", "RiskLevel", "Category", "Confidence", "ScannedDate"];
      const rows = history.map((item) => [
        `"${item.title.replace(/"/g, '""')}"`,
        item.contentType,
        item.riskLevel,
        `"${item.category.replace(/"/g, '""')}"`,
        `${item.analysisId?.result?.confidence || item.confidence}%`,
        new Date(item.createdAt).toLocaleDateString(),
      ]);
      dataStr = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      mimeType = "text/csv";
      filename = `credexa-history-${new Date().toISOString().split("T")[0]}.csv`;
    }

    const blob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast(`Exported as ${format.toUpperCase()}`, "success");
  };

  const copyReply = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast("Safe reply copied!", "success", 1000);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Scan History Vault
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Browse, search, delete, and export records of your safety checks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportData("csv")}
            className="flex items-center gap-1 px-4 py-2 border border-border rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          
          <button
            onClick={() => exportData("json")}
            className="flex items-center gap-1 px-4 py-2 border border-border rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>

          {history.length > 0 && (
            <button
              onClick={clearAllHistory}
              className="flex items-center gap-1 px-4 py-2 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg text-xs font-semibold transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Vault
            </button>
          )}
        </div>
      </div>

      {/* SEARCH / FILTERS BAR */}
      <div className="glass-panel p-4 rounded-xl border border-border/50 flex flex-col md:flex-row items-center gap-4">
        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords, categories, or titles..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45"
          />
        </form>

        {/* Filter selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Risk Level */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <select
              value={riskLevel}
              onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }}
              className="w-full sm:w-auto px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none"
            >
              <option value="">All Risk Levels</option>
              <option value="Safe">Safe</option>
              <option value="Suspicious">Suspicious</option>
              <option value="Dangerous">Dangerous</option>
            </select>
          </div>

          {/* Content Type */}
          <select
            value={contentType}
            onChange={(e) => { setContentType(e.target.value); setPage(1); }}
            className="w-full sm:w-auto px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none"
          >
            <option value="">All Formats</option>
            <option value="text">SMS / Text</option>
            <option value="url">Web Links</option>
            <option value="screenshot">Screenshot Images</option>
            <option value="voice">Audio Messages</option>
          </select>
        </div>
      </div>

      {/* SCANS LIST */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : history.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-border/50 text-center text-muted-foreground">
          No records match your filters. Run checks in the terminal or clear filters.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {history.map((item) => (
              <div
                key={item._id}
                onClick={() => setActiveAnalysis(item.analysisId)}
                className="glass-panel p-5 rounded-2xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group shadow-sm"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h3 className="font-bold text-base text-foreground truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="capitalize px-2 py-0.5 rounded bg-muted text-foreground font-semibold">
                      {item.contentType}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <span className="truncate max-w-[200px]">
                      Category: <strong className="text-foreground">{item.category}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-none border-border/40 pt-3 sm:pt-0">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
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
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item._id);
                    }}
                    className="p-2 border border-border rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5 transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION PANEL */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/30 pt-6">
              <span className="text-xs text-muted-foreground">
                Showing page {page} of {totalPages} ({totalItems} items)
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-2 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="p-2 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
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
