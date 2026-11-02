"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GitriumLogo } from "@/components/logo/GitriumLogo";
import { Button } from "@/components/ui/Button";
import { Github, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { initiateGitHubConnect } from "@/lib/auth/githubAuthClient";
import { gitriumApi } from "@/lib/services/gitriumApiService";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const isEmailVerified = searchParams.get("email_verified") === "true" || searchParams.get("confirmed") === "true";
  const urlError = searchParams.get("error");
  const urlErrorDesc = searchParams.get("error_description");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError === "CONFIRMATION_LINK_INVALID"
      ? (urlErrorDesc ? decodeURIComponent(urlErrorDesc) : "Your email confirmation link is invalid or has expired.")
      : null
  );

  // Clear any lingering client-side cache when loading the login screen
  React.useEffect(() => {
    gitriumApi.clearCache();
  }, []);

  const handleGitHubAuth = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      await initiateGitHubConnect(redirectTo);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "GitHub authentication failed";
      setError(message);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign-in failed";
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F1] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#17201B]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <GitriumLogo variant="full" size="lg" textColor="dark" className="justify-center" />
        <h2 className="mt-7 text-2xl font-bold tracking-tight text-[#17201B]">
          Sign in to your Vault
        </h2>
        <p className="mt-1.5 text-xs text-[#56635C] font-mono">
          Access your verified developer evidence and AST intelligence
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-[#DDE1DC] py-8 px-6 sm:px-8 rounded-[11px] shadow-[0_2px_8px_rgba(21,26,23,0.04)]">
          {isEmailVerified && (
            <div className="mb-5 p-3.5 rounded-[7px] bg-[#DDF4EA] border border-[#159A72]/30 text-[#087453] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#159A72]" />
              <span className="leading-relaxed">Email confirmed successfully! You can now sign in to your vault.</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded-[7px] bg-[#FAF0ED] border border-[#F3E3D8] text-[#D97745] text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
              {error.toLowerCase().includes("not confirmed") && (
                <div className="pt-1.5 flex items-center justify-between text-[11px] border-t border-[#F3E3D8]/60">
                  <span>Haven&apos;t received confirmation email?</span>
                  <Link href="/resend-confirmation" className="font-semibold underline hover:text-[#B85C2B]">
                    Resend confirmation
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* GitHub Auth Button */}
          <div className="space-y-1.5 mb-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleGitHubAuth}
              disabled={isLoading}
              className="w-full justify-center gap-2.5 font-medium bg-[#151A17] hover:bg-[#24352C] text-white border border-[#24352C]"
            >
              <Github className="w-4 h-4 text-[#159A72]" />
              <span>Continue with GitHub</span>
            </Button>
            <p className="text-[10px] text-center text-[#7A857E] font-sans">
              Connects the active GitHub account in your browser. Publisher: ADYK Gitrium.
            </p>
          </div>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#DDE1DC]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest">
              <span className="bg-white px-3 text-[#7A857E]">Or authenticate via email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-medium uppercase tracking-wider text-[#56635C] mb-1.5">
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[7px] bg-[#F7F6F1] border border-[#DDE1DC] px-3.5 py-2.5 text-xs text-[#17201B] placeholder-[#7A857E] font-mono focus:outline-none focus:border-[#159A72] focus:bg-white transition-colors"
                placeholder="developer@company.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-mono font-medium uppercase tracking-wider text-[#56635C]">
                  Password
                </label>
                <a href="#" className="text-xs text-[#159A72] hover:text-[#087453] hover:underline font-mono">
                  Forgot key?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-[7px] bg-[#F7F6F1] border border-[#DDE1DC] px-3.5 py-2.5 text-xs text-[#17201B] placeholder-[#7A857E] font-mono focus:outline-none focus:border-[#159A72] focus:bg-white transition-colors"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="emerald"
                size="lg"
                isLoading={isLoading}
                className="w-full gap-2 justify-center font-medium"
              >
                <span>Unlock Vault</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2 text-xs text-[#56635C]">
            <div>
              New to Gitrium?{" "}
              <Link href="/signup" className="text-[#159A72] hover:text-[#087453] hover:underline font-medium">
                Create an evidence profile
              </Link>
            </div>
            <div>
              Missing confirmation email?{" "}
              <Link href="/resend-confirmation" className="text-[#159A72] hover:text-[#087453] hover:underline font-medium">
                Resend confirmation link
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center flex items-center justify-center gap-2 text-[11px] text-[#7A857E] font-mono">
          <ShieldCheck className="w-4 h-4 text-[#159A72]" />
          <span>Zero code storage • AST deterministic hashes</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#F7F6F1]" />}>
      <LoginForm />
    </React.Suspense>
  );
}
