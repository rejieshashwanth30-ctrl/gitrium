"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GitriumLogo } from "@/components/logo/GitriumLogo";
import { Button } from "@/components/ui/Button";
import {
  Github,
  ShieldCheck,
  Lock,
  ArrowRight,
  Eye,
  AlertCircle,
} from "lucide-react";
import { initiateGitHubConnect } from "@/lib/auth/githubAuthClient";

function GitHubConnectContent() {
  const [isConnecting, setIsConnecting] = useState(false);
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const handleConnect = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      await initiateGitHubConnect("/select-repositories");
    } catch {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F1] text-[#17201B] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-7">
        <GitriumLogo variant="full" size="lg" textColor="dark" className="justify-center" />
        <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold font-mono text-[#17201B] tracking-tight uppercase">
          Connect your GitHub
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#56635C] max-w-md mx-auto">
          Turn your development history, commits, and pull requests into verifiable evidence-backed intelligence.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="rounded-[12px] border border-[#DDE1DC] bg-white p-6 sm:p-9 shadow-subtle space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between pb-4 border-b border-[#EFEEE8] text-xs font-mono">
            <span className="text-[#159A72] font-bold">STEP 01 OF 02: AUTHORIZATION</span>
            <span className="text-[#7A857E]">NEXT: REPOSITORY SELECTION</span>
          </div>

          {errorParam && (
            <div className="p-3.5 rounded-[7px] bg-[#FAF0ED] border border-[#F3E3D8] text-[#D97745] text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                {errorParam === "invalid_token"
                  ? "GitHub authorization did not yield a valid access token. Please re-authorize GitHub."
                  : errorParam === "no_provider_token"
                  ? "No GitHub access token returned by OAuth session. Please try connecting again."
                  : errorParam === "exchange_failed"
                  ? "OAuth session exchange failed. Please re-authorize GitHub."
                  : "GitHub authorization could not be completed. Please try again."}
              </span>
            </div>
          )}

          {/* Connect Box */}
          <div className="p-6 rounded-[8px] bg-[#F7F6F1] border border-[#DDE1DC] text-center font-mono">
            <div className="w-12 h-12 rounded-[8px] bg-[#151A17] text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Github className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base font-bold text-[#17201B] mb-1">GitHub OAuth Ready</h3>
            <p className="text-xs text-[#56635C] max-w-sm mx-auto mb-5 font-sans">
              Connect your personal account or organization to generate an evidence vault for your developer profile.
            </p>

            <Button
              variant="emerald"
              size="lg"
              onClick={handleConnect}
              disabled={isConnecting}
              isLoading={isConnecting}
              className="w-full sm:w-auto px-6 gap-2 bg-[#087453] hover:bg-[#159A72] text-white"
            >
              <Github className="w-4 h-4" />
              <span>{isConnecting ? "Connecting to GitHub..." : "Connect GitHub Account"}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Permission Breakdown */}
          <div className="space-y-3 pt-1 font-mono">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A857E]">
              Clear Security &amp; Permission Boundary:
            </h4>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-[6px] bg-white border border-[#DDE1DC]">
                <Eye className="w-4 h-4 text-[#159A72] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-[#17201B] block">Read-Only Metadata Access</span>
                  <span className="text-[11px] text-[#56635C] font-sans">
                    Gitrium only reads commit DAGs, pull request status, and repository file hierarchies. We never ask for write access.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[6px] bg-white border border-[#DDE1DC]">
                <Lock className="w-4 h-4 text-[#087453] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-[#17201B] block">No Proprietary Code Retention</span>
                  <span className="text-[11px] text-[#56635C] font-sans">
                    Your source code is never cached, sold, trained on, or hosted on Gitrium servers. Only synthesized evidence hashes persist.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[6px] bg-white border border-[#DDE1DC]">
                <ShieldCheck className="w-4 h-4 text-[#159A72] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-[#17201B] block">Granular Repository Control</span>
                  <span className="text-[11px] text-[#56635C] font-sans">
                    Choose exactly which repositories are included in your public audit report in the next step.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-[#7A857E] font-mono">
          <Link href="/" className="hover:text-[#159A72] transition-colors">
            ← Return to Gitrium Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function GitHubConnectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F6F1]" />}>
      <GitHubConnectContent />
    </Suspense>
  );
}
