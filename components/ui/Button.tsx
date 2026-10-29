"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "emerald" | "orange" | "danger" | "blue";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium rounded-[7px] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.96] active:translate-y-[0.5px] select-none";

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5 font-medium",
      md: "h-9 px-4 text-xs sm:text-sm gap-2 font-medium",
      lg: "h-11 px-5 text-sm sm:text-base gap-2.5 font-semibold",
    };

    const variantStyles = {
      primary:
        "bg-[#151A17] text-[#F7F6F1] hover:bg-[#18352B] border border-[#151A17] shadow-xs focus:ring-[#151A17]",
      secondary:
        "bg-[#FFFFFF] text-[#17201B] border border-[#DDE1DC] hover:bg-[#EFEEE8] hover:border-[#C4CCC5] shadow-xs focus:ring-[#DDE1DC]",
      outline:
        "bg-transparent text-[#17201B] border border-[#DDE1DC] hover:bg-[#EFEEE8] hover:text-[#17201B] focus:ring-[#DDE1DC]",
      ghost:
        "bg-transparent text-[#56635C] hover:text-[#17201B] hover:bg-[#EFEEE8] focus:ring-[#DDE1DC]",
      emerald:
        "bg-[#087453] text-white hover:bg-[#159A72] border border-[#087453] shadow-xs focus:ring-[#159A72]",
      blue:
        "bg-[#087453] text-white hover:bg-[#159A72] border border-[#087453] shadow-xs focus:ring-[#159A72]", // alias to emerald for backward compatibility
      orange:
        "bg-[#D97745] text-white hover:bg-[#c46535] border border-[#D97745] shadow-xs focus:ring-[#D97745]",
      danger:
        "bg-[#FAF0ED] text-[#D97745] border border-[#F3E3D8] hover:bg-[#F3E3D8] focus:ring-[#D97745]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
