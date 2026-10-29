import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

export function formatDate(dateInput: string | Date): string {
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return String(dateInput);
  }
}

export function getStrengthColor(strength: string) {
  switch (strength) {
    case "Strong Evidence":
      return {
        text: "text-emerald-400",
        border: "border-emerald-500/30",
        bg: "bg-emerald-500/10",
        glow: "rgba(16, 185, 129, 0.2)",
      };
    case "Moderate Evidence":
      return {
        text: "text-cyan-400",
        border: "border-cyan-500/30",
        bg: "bg-cyan-500/10",
        glow: "rgba(6, 182, 212, 0.2)",
      };
    case "Limited Evidence":
      return {
        text: "text-amber-400",
        border: "border-amber-500/30",
        bg: "bg-amber-500/10",
        glow: "rgba(245, 158, 11, 0.2)",
      };
    default:
      return {
        text: "text-rose-400",
        border: "border-rose-500/30",
        bg: "bg-rose-500/10",
        glow: "rgba(244, 63, 94, 0.2)",
      };
  }
}

