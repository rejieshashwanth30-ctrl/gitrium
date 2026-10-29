"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Gitrium Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#151A17] text-[#F7F6F1] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-[11px] border border-[#24352C] bg-[#18201C] p-8 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-[7px] bg-[#F3E3D8]/10 text-[#D97745] flex items-center justify-center mx-auto border border-[#D97745]/30">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="font-mono text-xs uppercase tracking-wider text-[#D97745] font-semibold">
          Execution Fault Detected
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Analysis Stream Interrupted</h2>
        <p className="text-xs text-[#9DA7A1] leading-relaxed">
          An unexpected anomaly occurred during AST verification. You can retry the operation or return to the vault command center.
        </p>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Button variant="emerald" size="sm" onClick={() => reset()} className="gap-2">
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Retry Pipeline</span>
          </Button>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2 text-[#9DA7A1] border-[#24352C] hover:bg-[#24352C]">
              <Home className="w-3.5 h-3.5" />
              <span>Vault Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
