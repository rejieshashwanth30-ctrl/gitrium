"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GitriumLogo } from "@/components/logo/GitriumLogo";
import { Button } from "@/components/ui/Button";
import { Github, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { initiateGitHubConnect } from "@/lib/auth/githubAuthClient";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          {error && (
            <div className="mb-5 p-3 rounded-[7px] bg-[#FAF0ED] border border-[#F3E3D8] text-[#D97745] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* GitHub Auth Button */}
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

          <div className="mt-6 text-center text-xs text-[#56635C]">
            New to Gitrium?{" "}
            <Link href="/signup" className="text-[#159A72] hover:text-[#087453] hover:underline font-medium">
              Create an evidence profile
            </Link>
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
