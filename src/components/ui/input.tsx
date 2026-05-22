"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, type = "text", className = "", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
            {label}
          </label>
        )}
        
        <div className="relative flex items-center">
          <input
            type={inputType}
            className={`w-full rounded-2xl border bg-white/5 px-4 py-3.5 text-sm text-white placeholder-white/30 backdrop-blur-md outline-none transition-all duration-300 focus:bg-white/10 focus:ring-2 focus:ring-purple-500/50 ${
              error
                ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-white/10 focus:border-purple-500/50"
            } ${className}`}
            ref={ref}
            {...props}
          />
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-white/40 hover:text-white/75 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}
        </div>

        {error && (
          <span className="text-xs font-medium text-rose-400 animate-in fade-in duration-200">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
