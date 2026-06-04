"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { User, Mail, ShieldAlert, Loader2, Save, Image as ImageIcon } from "lucide-react";

export default function Profile() {
  const { user, updateProfile } = useAuthStore();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      profilePicture: user?.profilePicture || "",
    },
  });

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await updateProfile(data);
      toast("Profile details updated successfully!", "success");
    } catch (err: any) {
      toast(err.message || "Failed to update profile", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const avatars = [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Account Profile
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your personal information and adjust avatar preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left column: Avatar preview */}
        <div className="md:col-span-1 glass-panel p-6 rounded-2xl border border-border/50 flex flex-col items-center gap-4 text-center">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary bg-muted flex items-center justify-center">
            {user?.profilePicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-muted-foreground" />
            )}
          </div>

          <div>
            <h3 className="font-bold text-foreground">{user?.name}</h3>
            <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary capitalize mt-1">
              Role: {user?.role}
            </span>
          </div>
        </div>

        {/* Right column: Edit details form */}
        <div className="md:col-span-2 glass-panel p-8 rounded-2xl border border-border/50">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email (Read-Only) */}
            <div className="flex flex-col gap-1.5 opacity-60">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> Email Address (Cannot change)
              </label>
              <input
                type="text"
                disabled
                value={user?.email || ""}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted text-sm text-foreground cursor-not-allowed"
              />
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-bold text-foreground uppercase tracking-wider">
                Display Name
              </label>
              <input
                id="name"
                type="text"
                {...register("name", { required: "Name is required" })}
                placeholder="Enter your name"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 transition-all"
              />
              {errors.name && <span className="text-xs text-rose-500">{errors.name.message}</span>}
            </div>

            {/* Avatar URL Input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="avatarUrl" className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" /> Avatar Image URL
              </label>
              <input
                id="avatarUrl"
                type="text"
                {...register("profilePicture")}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 transition-all"
              />
            </div>

            {/* Quick Avatar Picker */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Quick Avatar Picker
              </span>
              <div className="flex gap-3">
                {avatars.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setValue("profilePicture", url)}
                    className="w-10 h-10 rounded-full overflow-hidden border border-border hover:border-primary focus:border-primary transition-all duration-200 shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Preset ${index}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 transition-all shadow-md disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
