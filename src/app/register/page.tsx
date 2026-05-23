"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/ui/auth-provider";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  // "Already logged in" guard (replaces middleware.ts disabled for static export)
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);
  
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Clear error dynamically as the user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Password does not meet all secure requirements";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must agree to the Terms of Service";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast("Please correct the errors in the form", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse register response JSON:", jsonError);
        showToast("Server returned an invalid response. Please verify configuration.", "error");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        showToast(data.error || "Failed to create account", "error");
        setLoading(false);
        return;
      }

      showToast("Account successfully created!", "success");
      
      // Delay redirect slightly for better UX experience
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);

    } catch (error) {
      console.error("Client registration error:", error);
      showToast("An unexpected error occurred. Please try again.", "error");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-16 px-4 overflow-hidden">
      {/* Premium background gradients and mesh elements */}
      <div className="absolute inset-0 bg-[#080911] pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/10 blur-[150px] pointer-events-none animate-pulse duration-[10s]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/15 blur-[150px] pointer-events-none animate-pulse duration-[8s]" />
      
      <div className="w-full max-w-lg z-10">
        {/* Brand visual header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4 border border-white/10">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-purple-200 bg-clip-text text-transparent">
            Create your account
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Start organizing your studies with intelligent security
          </p>
        </div>

        <GlassCard glowColor="purple" className="border-white/5 bg-black/50">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Full Name input */}
            <div className="relative">
              <User className="absolute left-4 top-11 h-4.5 w-4.5 text-white/30 pointer-events-none" />
              <Input
                label="Full Name"
                placeholder="John Doe"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                className="pl-12"
                disabled={loading}
              />
            </div>

            {/* Username input */}
            <div className="relative">
              <span className="absolute left-4 top-11 text-sm font-bold text-white/30 pointer-events-none">@</span>
              <Input
                label="Username"
                placeholder="johndoe"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
                className="pl-12"
                disabled={loading}
              />
            </div>

            {/* Email input */}
            <div className="relative">
              <Mail className="absolute left-4 top-11 h-4.5 w-4.5 text-white/30 pointer-events-none" />
              <Input
                label="Email Address"
                placeholder="you@example.com"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                className="pl-12"
                disabled={loading}
              />
            </div>

            {/* Password input */}
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

            {/* Strength meter indicator */}
            <PasswordStrength password={formData.password} />

            {/* Confirm Password input */}
            <div className="relative">
              <Lock className="absolute left-4 top-11 h-4.5 w-4.5 text-white/30 pointer-events-none" />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••••••"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                className="pl-12"
                disabled={loading}
              />
            </div>

            {/* Accept Terms checkbox */}
            <div className="flex flex-col gap-2">
              <label className="flex items-start gap-3 cursor-pointer group text-xs text-white/60">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded-lg border-white/10 bg-white/5 text-purple-600 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-purple-500"
                  disabled={loading}
                />
                <span>
                  I agree to the{" "}
                  <a href="#" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.acceptTerms && (
                <span className="text-xs font-medium text-rose-400">
                  {errors.acceptTerms}
                </span>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-500 py-4 px-6 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:brightness-110 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Foot link to login */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-white/40">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-purple-400 hover:text-purple-300 font-bold underline underline-offset-4"
            >
              Sign in
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
