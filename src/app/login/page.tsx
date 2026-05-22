"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = "Email or Username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please enter all required fields", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse login response JSON:", jsonError);
        showToast("Server returned an invalid response. Please verify configuration.", "error");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        showToast(data.error || "Login failed", "error");
        setLoading(false);
        return;
      }

      showToast("Signed in successfully!", "success");

      // Redirect either to callbackUrl (e.g. from middleware) or default to /dashboard
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

      setTimeout(() => {
        router.push(callbackUrl);
        router.refresh();
      }, 1000);

    } catch (error) {
      console.error("Client login error:", error);
      showToast("An unexpected error occurred. Please try again.", "error");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Email/Username Input */}
      <div className="relative">
        <Mail className="absolute left-4 top-11 h-4.5 w-4.5 text-white/30 pointer-events-none" />
        <Input
          label="Email or Username"
          placeholder="you@example.com or johndoe"
          name="identifier"
          value={formData.identifier}
          onChange={handleChange}
          error={errors.identifier}
          className="pl-12"
          disabled={loading}
        />
      </div>

      {/* Password Input */}
      <div className="relative">
        <Lock className="absolute left-4 top-11 h-4.5 w-4.5 text-white/30 pointer-events-none" />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••••••"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          className="pl-12"
          disabled={loading}
        />
      </div>

      {/* Extra Options: Remember Me & Forgot Password */}
      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 cursor-pointer group text-white/60">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="h-4 w-4 rounded-lg border-white/10 bg-white/5 text-purple-600 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-purple-500"
            disabled={loading}
          />
          <span>Remember me</span>
        </label>

        <Link
          href="/forgot-password"
          className="text-purple-400 hover:text-purple-300 transition-colors font-medium underline underline-offset-2"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit Login Button */}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-500 py-4 px-6 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:brightness-110 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Logging you in...
          </>
        ) : (
          <>
            Sign In
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}

function LoginFormFallback() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Skeleton for Email Input */}
      <div className="space-y-2">
        <div className="h-4 w-28 bg-white/10 rounded" />
        <div className="h-12 w-full bg-white/5 rounded-2xl border border-white/5" />
      </div>

      {/* Skeleton for Password Input */}
      <div className="space-y-2">
        <div className="h-4 w-20 bg-white/10 rounded" />
        <div className="h-12 w-full bg-white/5 rounded-2xl border border-white/5" />
      </div>

      {/* Skeleton for Options */}
      <div className="flex justify-between items-center">
        <div className="h-4 w-24 bg-white/10 rounded" />
        <div className="h-4 w-28 bg-white/10 rounded" />
      </div>

      {/* Skeleton for Button */}
      <div className="h-12 w-full bg-white/10 rounded-2xl mt-2" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center py-16 px-4 overflow-hidden">
      {/* Background visual components */}
      <div className="absolute inset-0 bg-[#080911] pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/10 blur-[150px] pointer-events-none animate-pulse duration-[10s]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/15 blur-[150px] pointer-events-none animate-pulse duration-[8s]" />

      <div className="w-full max-w-md z-10">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4 border border-white/10">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-purple-200 bg-clip-text text-transparent">
            Welcome back
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Log in to manage your smart study workflow
          </p>
        </div>

        <GlassCard glowColor="blue" className="border-white/5 bg-black/50">
          <Suspense fallback={<LoginFormFallback />}>
            <LoginForm />
          </Suspense>

          {/* Foot link to registration */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-white/40">
            Don't have an account yet?{" "}
            <Link
              href="/register"
              className="text-purple-400 hover:text-purple-300 font-bold underline underline-offset-4"
            >
              Sign up free
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

