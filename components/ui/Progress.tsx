import React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0 - 100
  max?: number;
  className?: string;
  indicatorClassName?: string;
  showLabel?: boolean;
}

export function Progress({ value, max = 100, className, indicatorClassName, showLabel = false }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="w-full">
      <div className={cn("relative h-2 w-full overflow-hidden rounded-[3px] bg-[#EFEEE8] border border-[#DDE1DC]", className)}>
        <div
          className={cn(
            "h-full bg-[#159A72] transition-all duration-300 rounded-[3px]",
            indicatorClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 flex justify-between text-[11px] font-mono text-[#7A857E]">
          <span>{percentage.toFixed(0)}%</span>
          <span>Target: 100%</span>
        </div>
      )}
    </div>
  );
}
