"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send, CheckCircle, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email address is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please enter a valid email", "error");
      return;
    }

    setLoading(true);

    // Mock reset call (for standalone system demonstration)
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      showToast("Password reset link sent!", "success");
    }, 1500);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-16 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[#080911] pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/10 blur-[150px] pointer-events-none animate-pulse" />

      <div className="w-full max-w-md z-10">
        <GlassCard glowColor="indigo" className="border-white/5 bg-black/50">
          {!success ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="text-center mb-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Reset Password
                </h1>
                <p className="text-white/40 text-xs mt-2">
                  Enter your email address and we'll send you a secure link to reset your password.
                </p>
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-11 h-4.5 w-4.5 text-white/30 pointer-events-none" />
                <Input
                  label="Email Address"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  error={error}
                  className="pl-12"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-500 py-4 px-6 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:brightness-110 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center text-center gap-6 py-4 animate-in zoom-in-95 duration-300">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/5">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Check your email</h1>
                <p className="text-white/40 text-xs mt-3 leading-relaxed max-w-xs mx-auto">
                  We've sent a password reset link to <strong className="text-white/80">{email}</strong>. Please check your inbox and spam folders.
                </p>
              </div>
              <button
                onClick={() => setSuccess(false)}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4 cursor-pointer"
              >
                Didn't receive it? Try again
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors font-medium"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
              Back to Login
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
