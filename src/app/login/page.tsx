"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Lock, Mail, ShieldCheck, ArrowRight, Loader2,
  ChevronRight, Apple, Smartphone, Monitor, Sparkles, X, Download
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/ui/auth-provider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const supabase = createClient();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

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
      // 1. Authenticate with local Prisma API to set secure HTTP-only cookie
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

      // 2. Authenticate with Supabase using standard email retrieved from local login response
      if (typeof supabase.auth.signInWithPassword === "function") {
        const { error: supabaseError } = await supabase.auth.signInWithPassword({
          email: data.user.email,
          password: formData.password,
        });

        if (supabaseError) {
          console.error("Supabase authentication failed:", supabaseError.message);
          showToast(supabaseError.message || "Supabase authentication failed", "error");
          setLoading(false);
          return;
        }
      }

      showToast("Signed in successfully!", "success");
      setIsRedirecting(true);

      // Refresh auth provider state to sync with newly set HTTP-only cookie
      await refreshUser();

      // Redirect either to callbackUrl (e.g. from middleware) or default to /dashboard
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

      router.push(callbackUrl);
      router.refresh();

    } catch (error) {
      console.error("Client login error:", error);
      showToast("An unexpected error occurred. Please try again.", "error");
      setLoading(false);
    }
  };

  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in duration-300">
        <div className="relative mb-6">
          <div className="h-16 w-16 rounded-full border-4 border-purple-500/10 border-t-purple-500 animate-spin" />
          <Loader2 className="absolute inset-0 m-auto h-6 w-6 text-purple-400 animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Preparing your workspace</h3>
        <p className="text-xs text-white/50 max-w-[250px] leading-relaxed">
          Securing your session and redirecting you to your dashboard...
        </p>
      </div>
    );
  }

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
  const { showToast } = useToast();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showInstallerGuide, setShowInstallerGuide] = useState(false);
  const [installerTab, setInstallerTab] = useState<"ios" | "android" | "desktop">("ios");
  const [installingApp, setInstallingApp] = useState(false);

  // "Already logged in" guard (replaces middleware.ts disabled for static export)
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  // PWA Native Installer States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if window object exists and custom prompt is already caught
    if (typeof window !== 'undefined' && (window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
      setCanInstall(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for custom event in case layout script fired
    const customHandler = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setDeferredPrompt(customEvent.detail);
        setCanInstall(true);
      }
    };
    window.addEventListener('pwa-prompt-available', customHandler as EventListener);

    // Listen for successful install
    const installedHandler = () => {
      setCanInstall(false);
      setDeferredPrompt(null);
      if ((window as any).deferredPrompt) {
        (window as any).deferredPrompt = null;
      }
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('pwa-prompt-available', customHandler as EventListener);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstallingApp(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setCanInstall(false);
        showToast('App installed successfully! 🎉', 'success');
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Install failed:', err);
    } finally {
      setInstallingApp(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-16 px-4 overflow-hidden">
      {/* Background visual components */}
      <div className="absolute inset-0 bg-[#080911] pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/10 blur-[150px] pointer-events-none animate-pulse duration-[10s]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/15 blur-[150px] pointer-events-none animate-pulse duration-[8s]" />

      <div className="w-full max-w-md z-10 flex flex-col">
        {/* PWA Download Banner Alert */}
        <div className="mb-6 w-full animate-in fade-in slide-in-from-top-4 duration-500">
          <div 
            onClick={canInstall ? handleInstall : () => setShowInstallerGuide(true)}
            className="group relative flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/5 to-transparent border border-emerald-500/25 hover:border-emerald-500/40 hover:bg-emerald-500/20 transition-all duration-300 cursor-pointer shadow-lg shadow-emerald-950/20 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </div>
              <div className="flex items-center gap-2 text-left">
                <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    StudyFlow App is Available!
                  </p>
                  <p className="text-[10px] text-white/50 mt-0.5">
                    {canInstall ? "Click to install on this device instantly" : "Click to view mobile & desktop install guide"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#00D4AA] group-hover:translate-x-0.5 transition-transform shrink-0">
              <span>{canInstall ? (installingApp ? "Installing..." : "Install App") : "Install Guide"}</span>
              <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </div>
          </div>
        </div>

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

      {/* PWA Platform Installer Guide Modal */}
      {showInstallerGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden glass-modal rounded-3xl p-6 shadow-2xl border border-white/10 flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            {/* Modal Close Button */}
            <button 
              onClick={() => setShowInstallerGuide(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-[#00D4AA] text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                Platform Installer Guide
              </div>
              <h3 className="text-lg font-bold text-white">How to Install StudyFlow App</h3>
              <p className="text-[11px] text-white/40 leading-relaxed mt-1">
                Add StudyFlow directly to your device home screen or computer dashboard. PWAs launch as standalone, responsive applications with offline capabilities and zero clutter.
              </p>
            </div>

            {/* Platform Tabs */}
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              {(["ios", "android", "desktop"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setInstallerTab(tab)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    installerTab === tab
                      ? "bg-[#00D4AA] text-black shadow-md shadow-[#00D4AA]/10"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {tab === "ios" && <Apple className="h-3.5 w-3.5" />}
                  {tab === "android" && <Smartphone className="h-3.5 w-3.5" />}
                  {tab === "desktop" && <Monitor className="h-3.5 w-3.5" />}
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="flex flex-col gap-4 min-h-[220px] py-1">
              {installerTab === "ios" && (
                <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">
                  <div className="flex gap-3">
                    <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold">1</span>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Open <span className="text-[#00D4AA] font-bold">Safari</span> on your iPhone/iPad and make sure you're browsing this site.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold">2</span>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Tap the <span className="bg-white/10 px-2 py-0.5 rounded border border-white/15 text-white font-bold">Share</span> button in Safari's bottom toolbar (rectangle with up arrow).
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold">3</span>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Scroll down the options sheet and tap <span className="text-[#00D4AA] font-bold">&ldquo;Add to Home Screen&rdquo;</span>.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold">4</span>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Verify the name is <span className="font-bold text-white">StudyFlow</span> and tap <span className="text-[#00D4AA] font-bold">Add</span> in the top-right.
                    </p>
                  </div>
                </div>
              )}

              {installerTab === "android" && (
                <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">
                  <div className="flex gap-3">
                    <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold">1</span>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Open <span className="text-[#00D4AA] font-bold">Google Chrome</span> on your Android mobile device.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold">2</span>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Tap the <span className="bg-white/10 px-2 py-0.5 rounded border border-white/15 text-white font-bold">Menu</span> icon (three dots in top-right corner).
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold">3</span>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Tap <span className="text-[#00D4AA] font-bold">&ldquo;Install app&rdquo;</span> or <span className="text-[#00D4AA] font-bold">&ldquo;Add to Home screen&rdquo;</span>.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold">4</span>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Confirm the installation prompt by selecting <span className="text-[#00D4AA] font-bold">Install</span>.
                    </p>
                  </div>
                </div>
              )}

              {installerTab === "desktop" && (
                <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">
                  <div className="flex gap-3">
                    <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold">1</span>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Use <span className="text-[#00D4AA] font-bold">Chrome</span>, <span className="text-[#00D4AA] font-bold">Edge</span>, or <span className="text-[#00D4AA] font-bold">Brave</span> on your PC, Mac, or Linux computer.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold">2</span>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Look at the right side of the address bar for the <span className="text-[#00D4AA] font-bold">Install</span> icon (looks like a monitor with down arrow or a overlapping square plus sign).
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold">3</span>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Click the icon and select <span className="text-[#00D4AA] font-bold">Install</span> to launch StudyFlow as a standalone app.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowInstallerGuide(false)}
                className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all text-white/60 hover:text-white cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

