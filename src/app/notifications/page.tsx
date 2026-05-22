"use client";

import React, { useState, useEffect } from "react";
import NavigationWrapper from "@/components/NavigationWrapper";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/ui/auth-provider";
import { useToast } from "@/components/ui/toast";
import { 
  Bell, Check, Trash2, Smartphone, BellRing, Sparkles, Clock, CircleAlert, Circle, Loader2
} from "lucide-react";

interface NotificationLogItem {
  id: string;
  user_id: string;
  task_id: string | null;
  message: string;
  sent_at: string;
  read: boolean;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const supabase = createClient();

  const [notifications, setNotifications] = useState<NotificationLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>("default");

  // Load notifications log
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("notification_log")
        .select("*")
        .eq("user_id", user.id)
        .order("sent_at", { ascending: false });

      if (error) {
        console.error("Failed to load notifications:", error);
      } else if (data) {
        setNotifications(data as NotificationLogItem[]);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Check push notification support
      if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
        setPushSupported(true);
        setPermissionState(Notification.permission);
        setPushEnabled(Notification.permission === "granted");
      }
    }
  }, [user]);

  // Real-time listener for notification logs
  useEffect(() => {
    if (user) {
      const channel = supabase
        .channel("notification-log-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "notification_log" },
          (payload) => {
            console.log("Realtime notification log changes:", payload);
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Helper to convert VAPID base64 key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Subscribe to Web Push
  const enableNotifications = async () => {
    if (!pushSupported) {
      showToast("Web Push is not supported in this browser.", "error");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);

      if (permission !== "granted") {
        showToast("Notification permission was denied.", "warning");
        return;
      }

      // Register Push Subscription
      const reg = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        showToast("VAPID Public Key configuration is missing.", "error");
        return;
      }

      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      // Post subscription object to backend
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      if (response.ok) {
        setPushEnabled(true);
        showToast("Notifications enabled successfully! 🎉", "success");
      } else {
        throw new Error("Failed to register subscription");
      }
    } catch (err) {
      console.error("Failed to enable push notifications:", err);
      showToast("Failed to connect notifications registration.", "error");
    }
  };

  const handleMarkAllRead = async () => {
    if (!user || notifications.length === 0) return;

    try {
      const { error } = await supabase
        .from("notification_log")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) {
        showToast("Failed to mark read", "error");
      } else {
        showToast("All marked as read ✓", "success");
        fetchNotifications();
      }
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleClearHistory = async () => {
    if (!user || notifications.length === 0) return;

    try {
      const { error } = await supabase
        .from("notification_log")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        showToast("Failed to clear history", "error");
      } else {
        showToast("Alert history cleared ✓", "success");
        setNotifications([]);
      }
    } catch (err) {
      console.error("Clear logs error:", err);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await supabase
        .from("notification_log")
        .update({ read: true })
        .eq("id", id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  // Humanize time difference
  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NavigationWrapper>
      <div className="p-4 md:p-8 flex flex-col gap-6 max-w-2xl w-full mx-auto relative min-h-screen">
        {/* Top Header */}
        <header className="flex justify-between items-center z-10">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Notification Center
            </h1>
            <p className="text-[11px] text-[#00D4AA] tracking-wider font-semibold uppercase mt-0.5">
              Browser push logs and system updates
            </p>
          </div>

          {notifications.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleMarkAllRead}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/70 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                title="Mark all read"
              >
                <Check className="h-4 w-4" /> Mark all read
              </button>
              <button
                onClick={handleClearHistory}
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-semibold text-[#FF4D6D] border border-red-500/10 transition flex items-center gap-1.5 cursor-pointer"
                title="Clear all history"
              >
                <Trash2 className="h-4 w-4" /> Clear all
              </button>
            </div>
          )}
        </header>

        {/* Enable Notifications Banner (Visible if permission not granted) */}
        {pushSupported && permissionState !== "granted" && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-[#00D4AA]/20 via-[#00D4AA]/10 to-transparent border border-[#00D4AA]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex gap-3.5 items-start">
              <div className="p-3 bg-[#00D4AA]/20 text-[#00D4AA] rounded-2xl shrink-0">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Enable Push Notifications</h3>
                <p className="text-xs text-white/60 leading-relaxed mt-1">
                  Stay updated on morning digests, tasks pending reminders, and missed task notifications directly on your device.
                </p>
              </div>
            </div>
            <button
              onClick={enableNotifications}
              className="py-3 px-5 bg-gradient-to-r from-[#00D4AA] to-emerald-500 text-black text-xs font-extrabold uppercase tracking-wider rounded-2xl transition hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0"
            >
              Allow Notifications
            </button>
          </div>
        )}

        {/* Notifications log Stream */}
        <main className="flex flex-col gap-3">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-16 gap-3">
              <Loader2 className="h-8 w-8 text-[#00D4AA] animate-spin" />
              <p className="text-xs text-white/40">Loading your inbox alerts...</p>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.read && handleMarkSingleRead(notif.id)}
                className={`p-4 rounded-2xl bg-white/[0.02] border transition-all duration-200 flex items-start gap-4 cursor-pointer hover:bg-white/[0.04] ${
                  notif.read ? "border-white/5 opacity-60" : "border-[#00D4AA]/20 bg-white/[0.03]"
                }`}
              >
                {/* Icon box based on content */}
                <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                  notif.message.includes("Missed") 
                    ? "bg-red-500/10 text-red-400" 
                    : notif.message.includes("Reminder")
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-[#00D4AA]/10 text-[#00D4AA]"
                }`}>
                  <Bell className="h-4.5 w-4.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white leading-relaxed font-semibold">
                    {notif.message}
                  </p>
                  
                  <div className="flex items-center gap-1.5 text-[10px] text-white/30 font-semibold uppercase mt-2">
                    <Clock className="h-3 w-3 text-[#00D4AA]" />
                    {timeAgo(notif.sent_at)}
                  </div>
                </div>

                {/* Read/unread status dot */}
                {!notif.read && (
                  <span className="h-2 w-2 rounded-full bg-[#00D4AA] animate-pulse mt-2 shrink-0" />
                )}
              </div>
            ))
          ) : (
            <div className="py-24 text-center rounded-3xl bg-white/[0.01] border border-white/5 flex flex-col items-center justify-center gap-3">
              <Sparkles className="text-white/10 w-12 h-12 mb-1" />
              <h3 className="text-sm font-bold text-white">You're all caught up! 🎉</h3>
              <p className="text-white/30 text-xs max-w-xs leading-relaxed">
                No past push logs in your database stream. Trigger crons or add new tasks to start receiving alerts.
              </p>
            </div>
          )}
        </main>
      </div>
    </NavigationWrapper>
  );
}
