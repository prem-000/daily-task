"use client";

import React, { useState, useEffect } from "react";
import NavigationWrapper from "@/components/NavigationWrapper";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/ui/auth-provider";
import { useToast } from "@/components/ui/toast";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { 
  Bell, Palette, LogOut, Check, Loader2, Save, Moon, Sun, Info, Smartphone, Download, CheckCircle2,
  X, Laptop, Monitor, Sparkles, HelpCircle, ChevronRight, Apple
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { isInstallable, isInstalled, triggerInstall } = usePWAInstall();
  const supabase = createClient();
  const router = useRouter();
  const [installingApp, setInstallingApp] = useState(false);

  // PWA Installer Guide States
  const [showInstallerGuide, setShowInstallerGuide] = useState(false);
  const [installerTab, setInstallerTab] = useState<"ios" | "android" | "desktop">("ios");

  // Dynamic Desktop Shortcut downloader (.url format for Windows/macOS web app)
  const downloadDesktopShortcut = () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://studyflow.vercel.app';
      const urlContent = `[InternetShortcut]\r\nURL=${origin}/dashboard\r\nIconIndex=0\r\nIconFile=${origin}/favicon.ico\r\n`;
      const blob = new Blob([urlContent], { type: 'text/plain;charset=utf-8' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'StudyFlow.url';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      showToast('Desktop shortcut downloaded! 🖥️', 'success');
    } catch (err) {
      console.error('Shortcut download failed:', err);
      showToast('Download failed. Try again.', 'error');
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

            {isInstalled ? (
              /* Already installed */
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-white">StudyFlow is installed</h4>
                    <p className="text-[10px] text-white/40 mt-0.5">You&apos;re using the installed app version</p>
                  </div>
                  <span className="ml-auto text-[9px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                    ✓ Installed
                  </span>
                </div>

                <div className="border-t border-white/5 pt-3">
                  <p className="text-[10px] text-white/40 mb-2 leading-relaxed">
                    Want to add a direct launcher shortcut to your desktop?
                  </p>
                  <button
                    type="button"
                    onClick={downloadDesktopShortcut}
                    className="w-full h-11 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold text-[11px] tracking-wider uppercase rounded-xl transition hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Download className="h-4 w-4 stroke-[2.5]" />
                    Download Web Shortcut File
                  </button>
                </div>
              </div>
            ) : (
              /* Not installed / Installable options */
              <div className="flex flex-col gap-3.5">
                <div>
                  <h4 className="text-xs font-bold text-white">Download & Install StudyFlow App</h4>
                  <p className="text-[10px] text-white/40 mt-1 leading-relaxed">
                    StudyFlow is a progressive web app. Instead of a heavy installer file, you can install it instantly through your browser as a lightweight standalone application.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    id="settings-install-btn"
                    onClick={async () => {
                      if (isInstallable) {
                        setInstallingApp(true)
                        try {
                          const accepted = await triggerInstall()
                          if (accepted) showToast('App installed! 🎉', 'success')
                        } finally {
                          setInstallingApp(false)
                        }
                      } else {
                        // Open the gorgeous step-by-step installer guide
                        setShowInstallerGuide(true)
                      }
                    }}
                    disabled={installingApp}
                    className="w-full h-12 bg-gradient-to-r from-[#00D4AA] to-emerald-500 text-black font-extrabold text-xs tracking-wider uppercase rounded-2xl transition hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-[#00D4AA]/10"
                  >
                    {installingApp ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Smartphone className="h-4 w-4 stroke-[2.5]" />
                    )}
                    {isInstallable ? "Install App Directly" : "How to Install App (Guide)"}
                  </button>

                  <div className="border-t border-white/5 pt-3 mt-1">
                    <p className="text-[10px] text-white/40 mb-2 leading-relaxed">
                      Alternative: Download a desktop shortcut launcher instead:
                    </p>
                    <button
                      type="button"
                      onClick={downloadDesktopShortcut}
                      className="w-full h-11 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold text-[11px] tracking-wider uppercase rounded-xl transition hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Download className="h-4 w-4 stroke-[2.5]" />
                      Download Web Shortcut File
                    </button>
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

        {/* PWA Installer Guide Modal */}
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
                <h3 className="text-lg font-bold text-white">How to Install StudyFlow</h3>
                <p className="text-[11px] text-white/40">Add the app directly to your home screen or desktop launcher.</p>
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
                        Open <span className="text-[#00D4AA] font-bold">Safari</span> and navigate to <span className="font-mono text-white/60">studyflow.app</span>
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold">2</span>
                      <p className="text-xs text-white/80 leading-relaxed">
                        Tap the <span className="bg-white/10 px-2 py-0.5 rounded border border-white/15 text-white font-bold">Share</span> button in Safari&apos;s bottom toolbar (the rectangle with an arrow pointing up).
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold">3</span>
                      <p className="text-xs text-white/80 leading-relaxed">
                        Scroll down the action sheet and select <span className="text-[#00D4AA] font-bold">&ldquo;Add to Home Screen&rdquo;</span>.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold">4</span>
                      <p className="text-xs text-white/80 leading-relaxed">
                        Name it <span className="font-bold text-white">StudyFlow</span> and tap <span className="text-[#00D4AA] font-bold">Add</span> in the top-right corner.
                      </p>
                    </div>
                  </div>
                )}

                {installerTab === "android" && (
                  <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">
                    <div className="flex gap-3">
                      <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold">1</span>
                      <p className="text-xs text-white/80 leading-relaxed">
                        Open <span className="text-[#00D4AA] font-bold">Google Chrome</span> on your Android device.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold">2</span>
                      <p className="text-xs text-white/80 leading-relaxed">
                        Tap the <span className="bg-white/10 px-2 py-0.5 rounded border border-white/15 text-white font-bold">Menu</span> icon (three vertical dots) in the top-right corner.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold">3</span>
                      <p className="text-xs text-white/80 leading-relaxed">
                        Select <span className="text-[#00D4AA] font-bold">&ldquo;Install app&rdquo;</span> or <span className="text-[#00D4AA] font-bold">&ldquo;Add to Home screen&rdquo;</span>.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold">4</span>
                      <p className="text-xs text-white/80 leading-relaxed">
                        Confirm the prompt by tapping <span className="text-[#00D4AA] font-bold">Install</span>.
                      </p>
                    </div>
                  </div>
                )}

                {installerTab === "desktop" && (
                  <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">
                    <div className="flex gap-3">
                      <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold">1</span>
                      <p className="text-xs text-white/80 leading-relaxed">
                        Use <span className="text-[#00D4AA] font-bold">Chrome</span>, <span className="text-[#00D4AA] font-bold">Edge</span>, or <span className="text-[#00D4AA] font-bold">Brave</span> on your PC or Mac.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold">2</span>
                      <p className="text-xs text-white/80 leading-relaxed">
                        Look at the right side of the address bar for the <span className="text-[#00D4AA] font-bold">Install</span> icon (looks like a monitor with a down arrow, or a small overlapping square/plus symbol).
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-lg bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-bold">3</span>
                      <p className="text-xs text-white/80 leading-relaxed">
                        Click the icon and select <span className="text-[#00D4AA] font-bold">Install</span> to create a launchable standalone window.
                      </p>
                    </div>
                    <div className="border-t border-white/5 pt-3 mt-1 flex flex-col gap-2">
                      <p className="text-[10px] text-white/40">Alternative: Download a custom desktop file shortcut directly to your computer:</p>
                      <button
                        type="button"
                        onClick={() => {
                          downloadDesktopShortcut();
                          setShowInstallerGuide(false);
                        }}
                        className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 text-white/90 hover:text-white cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download Windows Desktop Shortcut
                      </button>
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
    </NavigationWrapper>
  );
}
