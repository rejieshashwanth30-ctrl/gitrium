import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { GitFork, ShieldAlert, Sparkles, FolderSearch } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ElementType;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = FolderSearch,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-[11px] border border-dashed border-[#24352C] bg-[#18201C] p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto",
        className
      )}
    >
      <div className="w-12 h-12 rounded-[7px] bg-[#151A17] border border-[#24352C] text-[#159A72] flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="text-base font-bold text-white tracking-tight mb-1.5">{title}</h3>
      <p className="text-xs text-[#9DA7A1] max-w-sm mb-6 leading-relaxed">{description}</p>

      {actionLabel && onAction && (
        <Button variant="emerald" size="sm" onClick={onAction} className="gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{actionLabel}</span>
        </Button>
      )}
    </div>
  );
}
