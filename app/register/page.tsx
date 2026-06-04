"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Shield, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";

export default function Register() {
  const router = useRouter();
  const { register: registerUser, error, clearError, user } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
    return () => clearError();
  }, [user, router, clearError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    clearError();
    try {
      await registerUser(data);
      toast("Account registered successfully! Welcome to Credexa.", "success");
      router.push("/dashboard");
    } catch (err: any) {
      toast(err.message || "Registration failed. Check details.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-grid-glow px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 sm:p-10 rounded-3xl border border-border/50 shadow-2xl">
        {/* Header logo */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <Shield className="w-9 h-9 text-primary" />
            <span className="font-sans text-2xl font-bold tracking-tight text-foreground bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Credexa
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Create your free account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Or{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 text-xs font-semibold leading-relaxed">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-xs font-bold text-foreground uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="name"
                type="text"
                {...register("name", { required: "Full name is required" })}
                placeholder="Enter your name"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 transition-all"
              />
            </div>
            {errors.name && <span className="text-xs text-rose-500">{errors.name.message}</span>}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-bold text-foreground uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                {...register("email", { required: "Email address is required" })}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 transition-all"
              />
            </div>
            {errors.email && <span className="text-xs text-rose-500">{errors.email.message}</span>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-bold text-foreground uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="password"
                type="password"
                {...register("password", { required: "Password must be at least 6 characters" })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 transition-all"
              />
            </div>
            {errors.password && <span className="text-xs text-rose-500">{errors.password.message}</span>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
