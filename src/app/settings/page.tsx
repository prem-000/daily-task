"use client";

import React, { useState, useEffect } from "react";
import NavigationWrapper from "@/components/NavigationWrapper";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/ui/auth-provider";
import { useToast } from "@/components/ui/toast";
import { 
  Bell, Palette, LogOut, Check, Loader2, Save, Moon, Sun, Info, Smartphone, CheckCircle2,
  X, Laptop, Monitor, Sparkles, HelpCircle, ChevronRight, Apple
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const supabase = createClient();
  const router = useRouter();
  const [installingApp, setInstallingApp] = useState(false);

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
      const customEvent = e as CustomEvent
      if (customEvent.detail) {
        setDeferredPrompt(customEvent.detail)
        setCanInstall(true)
      }
    }
    window.addEventListener('pwa-prompt-available', customHandler as EventListener)

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

  // Settings states
  const [interval, setIntervalVal] = useState<number>(60);
  const [morningNotif, setMorningNotif] = useState<boolean>(true);
  const [morningTime, setMorningTime] = useState<string>("07:00");
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Load user settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error loading user settings:", error);
        } else if (data) {
          setIntervalVal(data.reminder_interval);
          setMorningNotif(data.morning_notif);
          // format HH:MM:SS or HH:MM to HH:MM
          const timeVal = data.morning_time ? data.morning_time.substring(0, 5) : "07:00";
          setMorningTime(timeVal);
          setThemeMode(data.theme as "dark" | "light" || "dark");
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: user.id,
            reminder_interval: interval,
            morning_notif: morningNotif,
            morning_time: morningTime,
            theme: themeMode,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

      if (error) {
        console.error("Error saving settings:", error);
        showToast("Failed to save settings", "error");
      } else {
        showToast("Settings saved successfully ✓", "success");
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      showToast("An unexpected error occurred", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    showToast("Logging you out safely...", "info");
    try {
      await logout();
    } catch (error) {
      setLoggingOut(false);
      showToast("Logout failed. Try again.", "error");
    }
  };

  if (loading) {
    return (
      <NavigationWrapper>
        <div className="flex flex-col justify-center items-center py-24 gap-3">
          <Loader2 className="h-8 w-8 text-[#00D4AA] animate-spin" />
          <p className="text-xs text-white/40">Opening your preferences...</p>
        </div>
      </NavigationWrapper>
    );
  }

  if (!user) return null;

  return (
    <NavigationWrapper>
      <div className="p-4 md:p-8 flex flex-col gap-6 max-w-xl w-full mx-auto relative min-h-screen">
        {/* Top Header */}
        <header className="z-10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-[11px] text-[#00D4AA] tracking-wider font-semibold uppercase mt-0.5">
            Personalize your StudyFlow workspace
          </p>
        </header>

        {/* User profile read-only block */}
        <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center gap-4 backdrop-blur-md">
          <div className="h-16 w-16 rounded-full border-2 border-[#00D4AA]/30 overflow-hidden relative shrink-0">
            <img
              src={user.profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
              alt="avatar"
              className="object-cover w-full h-full bg-[#16182c]"
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] font-extrabold bg-[#00D4AA]/20 text-[#00D4AA] border border-[#00D4AA]/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Google Account
            </span>
            <h3 className="text-base font-bold text-white mt-1.5 truncate">{user.fullName}</h3>
            <p className="text-xs text-white/40 truncate">{user.email}</p>
          </div>
        </div>

        {/* Settings categories */}
        <div className="flex flex-col gap-5">
          {/* Category 1: Reminders */}
          <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-4 backdrop-blur-md">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Bell className="h-4.5 w-4.5 text-[#00D4AA]" /> Task Reminders
            </h3>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-extrabold text-white/40 uppercase tracking-wider">
                Repeating Interval (Minutes)
              </label>
              
              <div className="grid grid-cols-4 gap-2">
                {[30, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setIntervalVal(mins)}
                    className={`py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      interval === mins
                        ? "bg-[#00D4AA] text-black"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category 2: Morning Digest */}
          <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-4 backdrop-blur-md">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Bell className="h-4.5 w-4.5 text-[#00D4AA]" /> Morning Digest
            </h3>

            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-white">Daily Digest Alerts</h4>
                <p className="text-[10px] text-white/40 mt-0.5">Receive today's task breakdown at 7:00 AM</p>
              </div>

              {/* IOS Toggle styling */}
              <button
                type="button"
                onClick={() => setMorningNotif(!morningNotif)}
                className={`w-12 h-6.5 rounded-full p-1 transition-all duration-300 relative cursor-pointer ${
                  morningNotif ? "bg-[#00D4AA]" : "bg-white/10"
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full bg-black transition-all duration-300 ${
                    morningNotif ? "translate-x-5.5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {morningNotif && (
              <div className="flex flex-col gap-2.5 pt-2 animate-in fade-in duration-200">
                <label className="text-[10px] font-extrabold text-white/40 uppercase tracking-wider">
                  Digest Trigger Time
                </label>
                <input
                  type="time"
                  value={morningTime}
                  onChange={(e) => setMorningTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-[#00D4AA] focus:outline-none transition-all"
                />
              </div>
            )}
          </div>

          {/* Category 3: Styling Theme */}
          <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-4 backdrop-blur-md">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Palette className="h-4.5 w-4.5 text-[#00D4AA]" /> Style Theme
            </h3>

            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-white">Workspace Theme</h4>
                <p className="text-[10px] text-white/40 mt-0.5">Choose between light accent or deep dark</p>
              </div>

              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setThemeMode("dark")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                    themeMode === "dark"
                      ? "bg-[#00D4AA] text-black"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" /> Dark
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode("light")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                    themeMode === "light"
                      ? "bg-[#00D4AA] text-black"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" /> Light
                </button>
              </div>
            </div>
          </div>
        </div>

          {/* Category 4: App Installation */}
          <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-4 backdrop-blur-md">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Smartphone className="h-4 w-4 text-[#00D4AA]" /> App Installation
            </h3>

            {canInstall ? (
              /* Installable options */
              <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">
                <div>
                  <h4 className="text-xs font-bold text-white">Install StudyFlow on your device</h4>
                  <p className="text-[10px] text-white/40 mt-1 leading-relaxed">
                    Gain quick access from your home screen, support offline use, and enjoy automated task updates.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    id="settings-install-btn"
                    onClick={handleInstall}
                    disabled={installingApp}
                    className="w-full h-12 bg-gradient-to-r from-[#00D4AA] to-emerald-500 text-black font-extrabold text-xs tracking-wider uppercase rounded-2xl transition hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-[#00D4AA]/10"
                  >
                    {installingApp ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Smartphone className="h-4 w-4 stroke-[2.5]" />
                    )}
                    Install StudyFlow App
                  </button>
                </div>
              </div>
            ) : (
              /* Not installable / Already installed */
              <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">
                <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Already installed or use browser menu</h4>
                    <p className="text-[10px] text-white/40 mt-1 leading-relaxed">
                      If StudyFlow is not yet installed on this device, you can install it using your browser's menu option (e.g., tap the three vertical dots in Chrome or the Share button in Safari, then select &ldquo;Install app&rdquo; or &ldquo;Add to Home Screen&rdquo;).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

        {/* Action triggers */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex-1 py-4 bg-gradient-to-r from-[#00D4AA] to-emerald-500 text-black font-extrabold text-xs tracking-wider uppercase rounded-2xl transition hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-[#00D4AA]/10"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 stroke-[3]" />}
            Save Settings
          </button>
          
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="py-4 px-6 bg-rose-500/10 hover:bg-rose-500/20 text-[#FF4D6D] border border-rose-500/20 font-extrabold text-xs tracking-wider uppercase rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 stroke-[3]" />}
            Sign Out
          </button>
        </div>

        {/* Footer info */}
        <footer className="text-center py-4 space-y-1 mt-6">
          <div className="flex justify-center items-center gap-1.5 text-white/20 text-[10px] font-semibold">
            <Info size={12} />
            <span>StudyFlow v1.0.0 • PWA Secure Mode</span>
          </div>
        </footer>

      </div>
    </NavigationWrapper>
  );
}
