"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GitriumLogo } from "@/components/logo/GitriumLogo";
import { Button } from "@/components/ui/Button";
import { Github, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { initiateGitHubConnect } from "@/lib/auth/githubAuthClient";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGitHubAuth = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      await initiateGitHubConnect("/github-connect");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "GitHub signup failed";
      setError(message);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            display_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/github-connect`,
        },
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        // Automatically authenticated
        router.push("/github-connect");
        router.refresh();
      } else if (data.user) {
        // Confirmation email sent
        setSuccessMessage(
          "Confirmation link dispatched to your email. Check your inbox to activate your vault."
        );
        setIsLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F1] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#17201B]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <GitriumLogo variant="full" size="lg" textColor="dark" className="justify-center" />
        <h2 className="mt-7 text-2xl font-bold tracking-tight text-[#17201B]">
          Claim your Evidence Vault
        </h2>
        <p className="mt-1.5 text-xs text-[#56635C]">
          Convert real GitHub commits into verified developer intelligence
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

          {successMessage && (
            <div className="mb-5 p-3 rounded-[7px] bg-[#DDF4EA] border border-[#159A72]/30 text-[#087453] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#159A72]" />
              <span>{successMessage}</span>
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            onClick={handleGitHubAuth}
            disabled={isLoading}
            className="w-full justify-center gap-2.5 font-medium bg-[#151A17] hover:bg-[#24352C] text-white border border-[#24352C]"
          >
            <Github className="w-4 h-4 text-[#159A72]" />
            <span>Sign up with GitHub</span>
          </Button>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#DDE1DC]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest">
              <span className="bg-white px-3 text-[#7A857E]">Or register with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-medium uppercase tracking-wider text-[#56635C] mb-1.5">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Developer Name"
                className="w-full rounded-[7px] bg-[#F7F6F1] border border-[#DDE1DC] px-3.5 py-2.5 text-xs text-[#17201B] placeholder-[#7A857E] focus:outline-none focus:border-[#159A72] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-medium uppercase tracking-wider text-[#56635C] mb-1.5">
                Primary Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-[7px] bg-[#F7F6F1] border border-[#DDE1DC] px-3.5 py-2.5 text-xs text-[#17201B] placeholder-[#7A857E] font-mono focus:outline-none focus:border-[#159A72] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-medium uppercase tracking-wider text-[#56635C] mb-1.5">
                Master Security Key
              </label>
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
                <span>Initialize Vault Setup</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-[#56635C]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#159A72] hover:text-[#087453] hover:underline font-medium">
              Sign in to Vault
            </Link>
          </div>
        </div>

        <div className="mt-6 space-y-2 text-center text-[11px] text-[#7A857E] font-mono">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#159A72]" />
            <span>Zero code retention policy guaranteed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
