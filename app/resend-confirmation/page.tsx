"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GitriumLogo } from "@/components/logo/GitriumLogo";
import { Button } from "@/components/ui/Button";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck, Clock } from "lucide-react";

export default function ResendConfirmationPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || cooldown > 0) return;

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: data.message || "Confirmation link requested. Check your inbox and spam folder.",
        });
        setCooldown(60); // 60s cooldown
      } else {
        if (data.retryAfterSeconds) {
          setCooldown(data.retryAfterSeconds);
        }
        setStatusMessage({
          type: "error",
          text: data.message || "Could not dispatch confirmation email. Please try again.",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Network error occurred. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F1] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#17201B]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <GitriumLogo variant="full" size="lg" textColor="dark" className="justify-center" />
        <h2 className="mt-7 text-2xl font-bold tracking-tight text-[#17201B]">
          Resend Email Confirmation
        </h2>
        <p className="mt-1.5 text-xs text-[#56635C] font-sans">
          Request a fresh activation link for your ADYK Gitrium vault
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-[#DDE1DC] py-8 px-6 sm:px-8 rounded-[11px] shadow-[0_2px_8px_rgba(21,26,23,0.04)] space-y-5">
          {statusMessage && (
            <div
              className={`p-3.5 rounded-[7px] text-xs flex items-start gap-2.5 ${
                statusMessage.type === "success"
                  ? "bg-[#DDF4EA] border border-[#159A72]/30 text-[#087453]"
                  : "bg-[#FAF0ED] border border-[#F3E3D8] text-[#D97745]"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#159A72] mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleResend} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-medium uppercase tracking-wider text-[#56635C] mb-1.5">
                Your Registered Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-[7px] bg-[#F7F6F1] border border-[#DDE1DC] pl-10 pr-3.5 py-2.5 text-xs text-[#17201B] placeholder-[#7A857E] font-mono focus:outline-none focus:border-[#159A72] focus:bg-white transition-colors"
                />
                <Mail className="w-4 h-4 text-[#7A857E] absolute left-3.5 top-3" />
              </div>
            </div>

            <Button
              type="submit"
              variant="emerald"
              size="lg"
              disabled={isLoading || cooldown > 0}
              isLoading={isLoading}
              className="w-full gap-2 justify-center font-medium bg-[#087453] hover:bg-[#159A72] text-white"
            >
              {cooldown > 0 ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Resend available in {cooldown}s</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Send Confirmation Email</span>
                </>
              )}
            </Button>
          </form>

          {/* Helpful Guidance */}
          <div className="pt-2 border-t border-[#EFEEE8] space-y-2 text-xs text-[#7A857E] font-sans">
            <p className="font-semibold text-[#56635C]">Still not receiving the email?</p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
              <li>Check your Spam, Junk, or Promotions folder.</li>
              <li>Wait up to 2-3 minutes for transactional mail relay.</li>
              <li>Or sign up directly with GitHub to bypass email verification.</li>
            </ul>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-[#56635C]">
            <Link href="/login" className="text-[#159A72] hover:underline flex items-center gap-1 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Login</span>
            </Link>
            <Link href="/signup" className="hover:underline">
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

