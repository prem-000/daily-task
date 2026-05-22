"use client";

import React, { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password?: string;
}

export function PasswordStrength({ password = "" }: PasswordStrengthProps) {
  const [strength, setStrength] = useState(0); // 0 to 4
  const [checks, setChecks] = useState({
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
  });

  useEffect(() => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);

    setChecks({
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
    });

    let score = 0;
    if (password.length > 0) {
      if (minLength) score++;
      if (hasUpper && hasLower) score++;
      if (hasNumber) score++;
      if (hasSpecial) score++;
    }

    setStrength(score);
  }, [password]);

  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "bg-white/10",         // 0
    "bg-rose-500",         // 1 (Weak)
    "bg-amber-500",        // 2 (Fair)
    "bg-indigo-500",       // 3 (Good)
    "bg-emerald-500",      // 4 (Strong)
  ];

  const strengthLabelColor = [
    "text-white/40",
    "text-rose-400",
    "text-amber-400",
    "text-indigo-400",
    "text-emerald-400",
  ];

  if (!password) return null;

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in duration-300">
      {/* Visual meter bar indicator */}
      <div className="flex gap-1.5 w-full h-1.5 rounded-full overflow-hidden bg-white/10">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`flex-1 transition-all duration-500 ${
              index <= strength ? strengthColors[strength] : "bg-transparent"
            }`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-white/50">Password Strength:</span>
        <span className={`font-bold ${strengthLabelColor[strength]}`}>
          {strengthLabels[strength - 1] || "Too Weak"}
        </span>
      </div>

      {/* Real-time checklist requirements */}
      <div className="grid grid-cols-2 gap-2 text-[11px] text-white/60">
        <CheckRequirement label="At least 8 characters" met={checks.minLength} />
        <CheckRequirement label="Uppercase letter" met={checks.hasUpper} />
        <CheckRequirement label="Lowercase letter" met={checks.hasLower} />
        <CheckRequirement label="One number" met={checks.hasNumber} />
        <CheckRequirement label="Special character (@$!%*?&)" met={checks.hasSpecial} className="col-span-2" />
      </div>
    </div>
  );
}

function CheckRequirement({ label, met, className = "" }: { label: string; met: boolean; className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 transition-colors duration-300 ${className} ${met ? "text-emerald-400" : "text-white/40"}`}>
      {met ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
      <span>{label}</span>
    </div>
  );
}
