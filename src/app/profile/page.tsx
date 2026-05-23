"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Shield, KeyRound, ArrowLeft, Save, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/ui/auth-provider";
import { useToast } from "@/components/ui/toast";

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  // Client-side auth guard (replaces middleware.ts disabled for static export)
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    profileImage: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        username: user.username,
        profileImage: user.profileImage || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const selectAvatar = (seed: string) => {
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
    setFormData((prev) => ({ ...prev, profileImage: avatarUrl }));
    showToast(`Selected avatar preset: ${seed}`, "info");
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
      newErrors.username = "Username can only contain alphanumeric characters and underscores";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please enter correct details", "error");
      return;
    }

    setUpdating(true);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse profile response JSON:", jsonError);
        showToast("Server returned an invalid response. Please verify configuration.", "error");
        setUpdating(false);
        return;
      }

      if (!response.ok) {
        showToast(data.error || "Profile update failed", "error");
        setUpdating(false);
        return;
      }

      showToast("Profile successfully updated!", "success");
      await refreshUser();
      setUpdating(false);

    } catch (error) {
      console.error("Client profile update error:", error);
      showToast("An unexpected error occurred. Please try again.", "error");
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080911] flex items-center justify-center flex-col gap-4 text-white">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
        <p className="text-white/60 text-sm">Loading security keys...</p>
      </div>
    );
  }

  if (!user) return null;

  const avatarSeeds = ["Atlas", "Pixel", "Cosmo", "Vector", "Orion"];

  return (
    <div className="relative min-h-screen bg-[#080911] text-white py-12 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[#080911] pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/5 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-2xl mx-auto z-10 relative flex flex-col gap-6">
        {/* Back Link Nav Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors font-medium"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            Back to Dashboard
          </Link>
          <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase font-mono">Profile Panel</span>
        </div>

        <GlassCard glowColor="purple" className="border-white/5 bg-black/50">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="flex items-center gap-4 pb-6 border-b border-white/5">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <User className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Personal Profile</h1>
                <p className="text-xs text-white/40">Manage your identity details inside the cockpit</p>
              </div>
            </div>

            {/* Avatar Preset Grid selector */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/60">Choose Avatar Preset</label>
              
              <div className="flex items-center gap-4 flex-wrap">
                <div className="h-20 w-20 rounded-2xl border-2 border-purple-500/50 bg-[#16182c] overflow-hidden relative shadow-lg">
                  <img
                    src={formData.profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                    alt="avatar-preview"
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-white/40">Orion DiceBear bot presets:</span>
                  <div className="flex gap-2">
                    {avatarSeeds.map((seed) => {
                      const computedUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
                      const isSelected = formData.profileImage === computedUrl;
                      return (
                        <button
                          key={seed}
                          type="button"
                          onClick={() => selectAvatar(seed)}
                          className={`h-9 w-9 rounded-lg overflow-hidden bg-white/5 border text-[9px] font-semibold flex items-center justify-center hover:bg-white/10 transition-all ${
                            isSelected ? "border-purple-500 ring-2 ring-purple-500/20 scale-95" : "border-white/10"
                          }`}
                        >
                          <img src={computedUrl} alt={seed} className="w-7 h-7" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Standard Input fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                disabled={updating}
              />

              <Input
                label="Username Handle"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
                disabled={updating}
              />
            </div>

            {/* Fixed Email Field */}
            <div className="flex flex-col gap-2 opacity-50 select-none">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/60">Registered Email Address (Cannot change)</label>
              <div className="w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3.5 text-sm text-white/60 backdrop-blur-md cursor-not-allowed">
                {user.email}
              </div>
            </div>

            {/* Save Profile Button */}
            <button
              type="submit"
              disabled={updating}
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-500 py-4 px-6 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:brightness-110 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving updates...
                </>
              ) : (
                <>
                  Save Changes
                  <Save className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </GlassCard>

        {/* Extra Security Context visual card */}
        <GlassCard glowColor="none" className="p-6 border-white/5 bg-black/40">
          <div className="flex items-start gap-4">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="h-4.5 w-4.5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Account Integrity Protection</h3>
              <p className="text-xs text-white/40 mt-1 leading-relaxed">
                For security reasons, changing your registered email address requires verification. If you need to update it, please open a support ticket or contact our credentials department.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
