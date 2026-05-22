import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: "purple" | "blue" | "indigo" | "none";
}

export function GlassCard({
  children,
  className = "",
  glowColor = "purple",
  ...props
}: GlassCardProps) {
  const glowStyles = {
    purple: "before:absolute before:-inset-px before:rounded-3xl before:bg-gradient-to-r before:from-purple-500/10 before:to-pink-500/10 before:opacity-0 before:transition before:duration-500 hover:before:opacity-100",
    blue: "before:absolute before:-inset-px before:rounded-3xl before:bg-gradient-to-r before:from-blue-500/10 before:to-indigo-500/10 before:opacity-0 before:transition before:duration-500 hover:before:opacity-100",
    indigo: "before:absolute before:-inset-px before:rounded-3xl before:bg-gradient-to-r before:from-indigo-500/10 before:to-purple-500/10 before:opacity-0 before:transition before:duration-500 hover:before:opacity-100",
    none: "",
  };

  return (
    <div
      className={`relative rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 shadow-2xl transition-all duration-300 hover:border-white/20 ${glowStyles[glowColor]} ${className}`}
      {...props}
    >
      {/* Dynamic light refraction border inside the glass */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
