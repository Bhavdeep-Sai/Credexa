"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { Lock, Loader2, Save, Eye, Bell, EyeOff } from "lucide-react";

export default function Settings() {
  const { updateProfile } = useAuthStore();
  const { toast } = useToast();
  
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Preference switches (local states)
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [historySave, setHistorySave] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPasswordVal = watch("newPassword");

  const onSubmitPassword = async (data: any) => {
    setSubmitting(true);
    try {
      await updateProfile({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast("Password changed successfully!", "success");
      reset();
    } catch (err: any) {
      toast(err.message || "Failed to change password. Current password may be incorrect.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const savePreferences = () => {
    toast("Settings preferences updated!", "success");
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          System Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure security settings, change passwords, and manage notification preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Preference Settings - 5 cols */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-border/50 space-y-6">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5">
            <Bell className="w-5 h-5 text-primary" /> Preferences
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-foreground">Email Notifications</div>
                <div className="text-xs text-muted-foreground mt-0.5">Receive alert logs for high-risk threats.</div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-primary rounded bg-background border-border accent-primary"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-foreground">History Vault Logging</div>
                <div className="text-xs text-muted-foreground mt-0.5">Auto-save completed scan results to History.</div>
              </div>
              <input
                type="checkbox"
                checked={historySave}
                onChange={(e) => setHistorySave(e.target.checked)}
                className="w-4 h-4 text-primary rounded bg-background border-border accent-primary"
              />
            </div>
          </div>

          <button
            onClick={savePreferences}
            className="w-full py-2.5 bg-muted text-foreground text-sm font-semibold rounded-xl border border-border hover:bg-muted/80 transition-colors"
          >
            Save Preferences
          </button>
        </div>

        {/* Change Password - 7 cols */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-border/50 space-y-6">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5">
            <Lock className="w-5 h-5 text-primary" /> Update Password
          </h3>

          <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
            {/* Current Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="currentPassword" className="text-xs font-bold text-foreground uppercase tracking-wider">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  {...register("currentPassword", { required: "Current password is required" })}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.currentPassword && <span className="text-xs text-rose-500">{errors.currentPassword.message}</span>}
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="newPassword" className="text-xs font-bold text-foreground uppercase tracking-wider">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                {...register("newPassword", {
                  required: "New password is required",
                  minLength: { value: 6, message: "New password must be at least 6 characters" },
                })}
                placeholder="Enter new password"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 transition-all"
              />
              {errors.newPassword && <span className="text-xs text-rose-500">{errors.newPassword.message}</span>}
            </div>

            {/* Confirm New Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-bold text-foreground uppercase tracking-wider">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", {
                  required: "Please confirm your new password",
                  validate: (val) => val === newPasswordVal || "Passwords do not match",
                })}
                placeholder="Confirm new password"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 transition-all"
              />
              {errors.confirmPassword && <span className="text-xs text-rose-500">{errors.confirmPassword.message}</span>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 transition-all shadow-md disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
