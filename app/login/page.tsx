"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Shield, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, error, clearError, user } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const redirectPath = searchParams.get("redirect") || "/dashboard";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(redirectPath);
    }
    return () => clearError();
  }, [user, router, redirectPath, clearError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    clearError();
    try {
      await login(data);
      toast("Welcome back to Credexa!", "success");
      router.push(redirectPath);
    } catch (err: any) {
      toast(err.message || "Login failed. Check your credentials.", "error");
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
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Sign in to your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Or{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              create a new account for free
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
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-bold text-foreground uppercase tracking-wider">
                Password
              </label>
              <span className="text-xs text-muted-foreground hover:text-primary hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="password"
                type="password"
                {...register("password", { required: "Password is required" })}
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
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-grid-glow px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full flex flex-col items-center justify-center glass-panel p-8 sm:p-10 rounded-3xl border border-border/50 shadow-2xl min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Loading login form...</p>
        </div>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
