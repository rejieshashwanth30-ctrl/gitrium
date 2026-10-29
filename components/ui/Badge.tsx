"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { EvidenceStrength } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "emerald" | "graphite" | "orange" | "ivory" | "outline" | "blue" | "success" | "warning" | "danger" | "navy";
  size?: "sm" | "md";
  className?: string;
  icon?: React.ReactNode;
}

export function Badge({ children, variant = "default", size = "sm", className, icon }: BadgeProps) {
  const variants = {
    default: "bg-[#EFEEE8] text-[#17201B] border-[#DDE1DC]",
    emerald: "bg-[#DDF4EA] text-[#087453] border-[#B7E7D4]",
    success: "bg-[#DDF4EA] text-[#087453] border-[#B7E7D4]",
    graphite: "bg-[#151A17] text-[#F7F6F1] border-[#24352C]",
    navy: "bg-[#151A17] text-[#F7F6F1] border-[#24352C]",
    orange: "bg-[#F3E3D8] text-[#D97745] border-[#E8CABA]",
    warning: "bg-[#F3E3D8] text-[#D97745] border-[#E8CABA]",
    danger: "bg-[#FAF0ED] text-[#D97745] border-[#F3E3D8]",
    ivory: "bg-[#F7F6F1] text-[#17201B] border-[#DDE1DC]",
    blue: "bg-[#DDF4EA] text-[#087453] border-[#B7E7D4]", // mapped to emerald
    outline: "bg-transparent text-[#56635C] border-[#DDE1DC]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium font-mono rounded-[5px] border transition-colors select-none",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function EvidenceStrengthBadge({
  strength,
  className,
}: {
  strength: EvidenceStrength;
  className?: string;
}) {
  const isStrong = strength === "Strong Evidence";
  const isModerate = strength === "Moderate Evidence";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] text-[11px] font-mono font-medium border select-none",
        isStrong
          ? "bg-[#DDF4EA] text-[#087453] border-[#B7E7D4]"
          : isModerate
          ? "bg-[#EFEEE8] text-[#18352B] border-[#DDE1DC]"
          : "bg-[#F3E3D8] text-[#D97745] border-[#E8CABA]",
        className
      )}
    >
      {isStrong ? (
        <ShieldCheck className="w-3.5 h-3.5 text-[#087453]" />
      ) : isModerate ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-[#18352B]" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5 text-[#D97745]" />
      )}
      {strength}
    </span>
  );
}
