"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/Toast";
import { 
  Settings, Users, ShieldAlert, BarChart3, Database, 
  Trash2, ShieldCheck, RefreshCw, Loader2, Save, Power 
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";

export default function AdminPanel() {
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"stats" | "users" | "logs" | "settings">("stats");
  const [loading, setLoading] = useState(true);

  // States for stats
  const [stats, setStats] = useState<any>(null);

  // States for users
  const [users, setUsers] = useState<any[]>([]);

  // States for logs
  const [logs, setLogs] = useState<any[]>([]);

  // States for settings
  const [settings, setSettings] = useState<any>({
    maintenanceMode: false,
    allowedFileTypes: [],
    maxFileSizeMB: 10,
    basePrompt: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "stats") {
        const res = await axios.get("/api/admin/stats");
        if (res.data.success) setStats(res.data.stats);
      } else if (activeTab === "users") {
        const res = await axios.get("/api/admin/users");
        if (res.data.success) setUsers(res.data.users);
      } else if (activeTab === "logs") {
        const res = await axios.get("/api/admin/logs");
        if (res.data.success) setLogs(res.data.logs);
      } else if (activeTab === "settings") {
        const res = await axios.get("/api/admin/settings");
        if (res.data.success) setSettings(res.data.settings);
      }
    } catch (err: any) {
      console.error(err);
      toast(err.response?.data?.error || "Failed to load admin panel data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Promote / Demote Role
  const handleRoleChange = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    if (!confirm(`Are you sure you want to change this user's role to ${nextRole}?`)) return;

    try {
      const res = await axios.put("/api/admin/users", { userId, role: nextRole });
      if (res.data.success) {
        toast("User role updated successfully", "success");
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: nextRole } : u))
        );
      }
    } catch (err: any) {
      toast(err.response?.data?.error || "Failed to update role", "error");
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user account? This cannot be undone.")) return;

    try {
      const res = await axios.delete(`/api/admin/users?userId=${userId}`);
      if (res.data.success) {
        toast("User account deleted", "success");
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    } catch (err: any) {
      toast(err.response?.data?.error || "Failed to delete user", "error");
    }
  };

  // Update Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await axios.put("/api/admin/settings", settings);
      if (res.data.success) {
        toast("System settings updated successfully", "success");
        setSettings(res.data.settings);
      }
    } catch (err: any) {
      toast(err.response?.data?.error || "Failed to save settings", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  // Pie chart colors
  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  const getRiskPieData = () => {
    if (!stats?.scans?.riskDistribution) return [];
    const dist = stats.scans.riskDistribution;
    return [
      { name: "Safe", value: dist.Safe },
      { name: "Suspicious", value: dist.Suspicious },
      { name: "Dangerous", value: dist.Dangerous },
    ];
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Admin Panel
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            System administration dashboard, user control panels, safety configurations, and audit logs.
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar - 3 cols */}
        <div className="lg:col-span-3 glass-panel p-4 rounded-xl border border-border/50 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex items-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all shrink-0 lg:shrink ${
              activeTab === "stats" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Statistics</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all shrink-0 lg:shrink ${
              activeTab === "users" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all shrink-0 lg:shrink ${
              activeTab === "logs" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Audit Logs</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all shrink-0 lg:shrink ${
              activeTab === "settings" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>System Rules</span>
          </button>
        </div>

        {/* Contents Area - 9 cols */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className="min-h-[400px] flex items-center justify-center glass-panel rounded-2xl border border-border/50">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* TAB 1: STATISTICS */}
              {activeTab === "stats" && stats && (
                <div className="space-y-6">
                  {/* Top quick stats cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="glass-panel p-6 rounded-xl border border-border/50 text-center space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Users</span>
                      <div className="text-3xl font-extrabold text-foreground">{stats.users.total}</div>
                    </div>
                    
                    <div className="glass-panel p-6 rounded-xl border border-border/50 text-center space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Scans</span>
                      <div className="text-3xl font-extrabold text-foreground">{stats.scans.total}</div>
                    </div>

                    <div className="glass-panel p-6 rounded-xl border border-border/50 text-center space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin Accounts</span>
                      <div className="text-3xl font-extrabold text-primary">{stats.users.admins}</div>
                    </div>
                  </div>

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pie Chart: Risk levels */}
                    <div className="glass-panel p-6 rounded-xl border border-border/50 space-y-4 flex flex-col items-center">
                      <h3 className="text-base font-bold text-foreground w-full">Risk Distribution</h3>
                      <div className="w-full h-56 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getRiskPieData()}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {getRiskPieData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex gap-4 text-xs">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Safe</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Suspicious</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Dangerous</span>
                      </div>
                    </div>

                    {/* Bar Chart: Categories */}
                    <div className="glass-panel p-6 rounded-xl border border-border/50 space-y-4">
                      <h3 className="text-base font-bold text-foreground">Scam Category Frequency</h3>
                      <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.scans.popularCategories} layout="vertical" margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                            <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                            <YAxis dataKey="category" type="category" stroke="var(--muted-foreground)" fontSize={11} width={80} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: USER MANAGEMENT */}
              {activeTab === "users" && (
                <div className="glass-panel rounded-2xl border border-border/50 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-border bg-muted/20">
                    <h3 className="text-base font-bold text-foreground">Registered Accounts</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-muted-foreground">
                      <thead className="text-xs uppercase bg-muted/40 text-foreground border-b border-border">
                        <tr>
                          <th className="px-6 py-3">Name</th>
                          <th className="px-6 py-3">Email</th>
                          <th className="px-6 py-3">Role</th>
                          <th className="px-6 py-3">Joined Date</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-muted/10">
                            <td className="px-6 py-4 font-semibold text-foreground">{u.name}</td>
                            <td className="px-6 py-4">{u.email}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                                u.role === "admin"
                                  ? "border-primary/20 bg-primary/10 text-primary"
                                  : "border-border bg-muted/50 text-foreground"
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleRoleChange(u._id, u.role)}
                                className="px-2.5 py-1 border border-border rounded text-xs font-semibold hover:bg-muted hover:text-foreground transition-all"
                              >
                                {u.role === "admin" ? "Demote" : "Promote"}
                              </button>
                              
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                className="p-1 border border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white rounded transition-all"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: SYSTEM AUDIT LOGS */}
              {activeTab === "logs" && (
                <div className="glass-panel rounded-2xl border border-border/50 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-border bg-muted/20">
                    <h3 className="text-base font-bold text-foreground">Recent Audits & Events</h3>
                  </div>

                  <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-xs text-left text-muted-foreground">
                      <thead className="text-[10px] uppercase bg-muted/40 text-foreground border-b border-border">
                        <tr>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Action</th>
                          <th className="px-4 py-3">Details</th>
                          <th className="px-4 py-3">User Email</th>
                          <th className="px-4 py-3">IP Address</th>
                          <th className="px-4 py-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {logs.map((log) => (
                          <tr key={log._id} className="hover:bg-muted/10">
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-1.5 py-0.5 rounded font-bold border ${
                                log.logType === "error"
                                  ? "border-rose-500/20 bg-rose-500/10 text-rose-500"
                                  : log.logType === "warn"
                                  ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                                  : "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                              }`}>
                                {log.logType}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-foreground">{log.action}</td>
                            <td className="px-4 py-3 max-w-[200px] truncate" title={log.details}>
                              {log.details}
                            </td>
                            <td className="px-4 py-3">{log.userId?.email || "guest"}</td>
                            <td className="px-4 py-3">{log.ipAddress || "unknown"}</td>
                            <td className="px-4 py-3">{new Date(log.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: SYSTEM SETTINGS */}
              {activeTab === "settings" && (
                <div className="glass-panel p-6 rounded-2xl border border-border/50 shadow-sm">
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5">
                      <Settings className="w-5 h-5 text-primary" /> Edit Safety Thresholds
                    </h3>

                    {/* Maintenance toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/50">
                      <div>
                        <div className="text-sm font-bold text-foreground flex items-center gap-1">
                          <Power className="w-4 h-4 text-rose-500" /> Maintenance Mode
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Toggling this temporarily stops Guest / User scam checks.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) =>
                          setSettings({ ...settings, maintenanceMode: e.target.checked })
                        }
                        className="w-4 h-4 text-primary rounded bg-background border-border accent-primary"
                      />
                    </div>

                    {/* Max File size input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Max Allowed File Upload Size (MB)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={settings.maxFileSizeMB}
                        onChange={(e) =>
                          setSettings({ ...settings, maxFileSizeMB: parseInt(e.target.value, 10) })
                        }
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45"
                      />
                    </div>

                    {/* Gemini Base Prompt Editor */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Gemini Base Agent System Prompt
                      </label>
                      <textarea
                        rows={6}
                        value={settings.basePrompt}
                        onChange={(e) =>
                          setSettings({ ...settings, basePrompt: e.target.value })
                        }
                        placeholder="Define general AI guidelines..."
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 resize-none leading-relaxed"
                      />
                    </div>

                    {/* Submit settings button */}
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 transition-all shadow-md disabled:opacity-50"
                    >
                      {savingSettings ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving configurations...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5" />
                          Apply Safety Rules
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
