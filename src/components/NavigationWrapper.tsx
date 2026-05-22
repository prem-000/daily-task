"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Calendar, MessageSquare, Bell, Settings, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/components/ui/auth-provider";
import { useToast } from "@/components/ui/toast";

interface NavigationWrapperProps {
  children: React.ReactNode;
}

export default function NavigationWrapper({ children }: NavigationWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isChatPage = pathname === "/chat";
  const { user, loading, logout } = useAuth();
  const { showToast } = useToast();
  const [loggingOut, setLoggingOut] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registered on scope:", reg.scope);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    }
  }, []);

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
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center flex-col gap-4 text-white">
        <Loader2 className="h-8 w-8 text-[#00D4AA] animate-spin" />
        <p className="text-white/60 text-sm">Validating session authority...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Let the middleware or useEffect handle redirection
  }

  const tabs = [
    { href: "/dashboard", label: "Calendar", icon: Calendar },
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white flex flex-col md:flex-row overflow-hidden relative">
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#00D4AA]/5 blur-[150px] pointer-events-none" />

      {/* Desktop Sidebar (visible on md and up) */}
      <aside className="w-64 border-r border-white/5 bg-black/35 backdrop-blur-xl p-6 hidden md:flex flex-col justify-between shrink-0 z-30">
        <div className="flex flex-col gap-8">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#00D4AA]/30 to-[#00D4AA] flex items-center justify-center shadow-md shadow-[#00D4AA]/10 border border-[#00D4AA]/20">
              <span className="font-extrabold text-sm text-black">SF</span>
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-[#00D4AA] bg-clip-text text-transparent">StudyFlow</span>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group border-l-[3px] ${
                    isActive
                      ? "border-[#00D4AA] bg-white/5 text-[#00D4AA] font-bold"
                      : "border-transparent text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-[#00D4AA]" : "text-white/60"}`} />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & Logout block */}
        <div className="flex flex-col gap-4">
          <Link href="/settings" className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all">
            <div className="h-10 w-10 rounded-full border border-[#00D4AA]/20 overflow-hidden relative">
              <img
                src={user.profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                alt="avatar"
                className="object-cover w-full h-full bg-[#16182c]"
              />
            </div>
            <div className="text-left truncate">
              <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
              <p className="text-[10px] text-white/40 font-mono">@{user.username}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-rose-500/10 hover:border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 font-semibold transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {loggingOut ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <LogOut className="h-4.5 w-4.5" />}
            Logout Account
          </button>
        </div>
      </aside>

      {/* Main content container */}
      <main className={`flex-1 flex flex-col min-w-0 z-10 ${isChatPage ? "h-screen max-h-screen overflow-hidden pb-0" : "overflow-y-auto max-h-screen pb-[80px] md:pb-0"}`}>
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      {!isChatPage && (
        <nav 
          className="fixed bottom-0 left-0 right-0 z-30 flex justify-around items-center md:hidden"
          style={{
            height: "calc(64px + env(safe-area-inset-bottom, 0px))",
            background: "rgba(10,15,30,0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)"
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex-1 flex flex-col items-center justify-center h-full relative"
              >
                <div 
                  className={`flex flex-col items-center justify-center transition-all duration-300 ${
                    isActive ? "scale-115 text-[#00D4AA]" : "text-white/60"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-[#00D4AA]" : "text-white/60"}`} />
                  <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
                </div>
                
                {isActive && (
                  <div 
                    className="absolute bottom-2.5 w-1 h-1 rounded-full bg-[#00D4AA]"
                    style={{
                      boxShadow: "0 0 8px rgba(0, 212, 170, 0.8)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
