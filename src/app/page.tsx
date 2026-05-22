'use client';

import React from 'react';
import Link from 'next/link';
import { Smartphone, Shield, Zap, Sparkles, LogIn, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-[#080911] overflow-hidden text-white">
      {/* Background Aurora Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-md z-10 space-y-8 text-center px-6 py-10 rounded-[32px] bg-black/40 backdrop-blur-[24px] border border-white/5 shadow-2xl">
        {/* App Logo & Header */}
        <div className="space-y-3">
          <div className="relative inline-flex items-center justify-center p-4 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-lg shadow-purple-500/25 animate-bounce-subtle">
            <Sparkles size={36} className="text-white animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mt-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            StudyFlow
          </h1>
          <p className="text-white/40 text-sm max-w-xs mx-auto">
            Smart AI Student Planner powered by Gemini AI & Secure Custom Auth
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-3 py-2 text-left">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-300">
            <Zap className="text-cyan-400 mb-1.5 w-5 h-5" />
            <h3 className="text-white text-xs font-semibold">AI Extraction</h3>
            <p className="text-[10px] text-white/40 mt-0.5">Auto parse assignments from messages</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-300">
            <Smartphone className="text-purple-400 mb-1.5 w-5 h-5" />
            <h3 className="text-white text-xs font-semibold">Aurora Glass UI</h3>
            <p className="text-[10px] text-white/40 mt-0.5">Vibrant, premium mobile-first interface</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-300 col-span-2 flex items-center gap-3">
            <Shield className="text-emerald-400 w-5 h-5" />
            <div>
              <h3 className="text-white text-xs font-semibold">Custom Auth System</h3>
              <p className="text-[10px] text-white/40">Secured with Argon2id & HTTP-only cookies</p>
            </div>
          </div>
        </div>

        {/* Dual Custom Gateway Buttons */}
        <div className="flex flex-col gap-3.5 pt-4">
          <Link href="/login" className="w-full">
            <button
              className="w-full py-4 rounded-[18px] font-bold text-white text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/10 bg-gradient-to-r from-purple-600 to-indigo-500"
            >
              <LogIn className="w-4.5 h-4.5" />
              <span>Sign In to Account</span>
            </button>
          </Link>

          <Link href="/register" className="w-full">
            <button
              className="w-full py-4 rounded-[18px] font-bold text-white/80 text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4.5 h-4.5 text-white/40" />
            </button>
          </Link>
          
          <p className="text-[10px] text-white/30 pt-2">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>

      {/* Embedded animation styles */}
      <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

