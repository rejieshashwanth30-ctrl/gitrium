"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { gitriumApi } from "@/lib/services/gitriumApiService";
import {
  Settings,
  User,
  Github,
  Lock,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [company, setCompany] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [saved, setSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const prof = await gitriumApi.getProfile();
      if (prof) {
        setName(prof.user.name);
        setBio(prof.user.bio);
        setCompany(prof.user.company || "");
        setGithubUsername(prof.github.username);
      }
    }
    loadProfile();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMsg(null);
    try {
      const res = await gitriumApi.triggerGitHubSync();
      setSyncMsg(res.message);
    } catch {
      setSyncMsg("Sync failed. Check network.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#24352C]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-[#18352B] border border-[#27382F] text-[#159A72] text-xs font-mono font-semibold mb-2">
              <Settings className="w-3.5 h-3.5" />
              <span>VAULT CONFIGURATION</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#F7F6F1] tracking-tight uppercase">
              Settings &amp; Privacy Controls
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#A8B3AC] font-mono">
              Manage developer profile visibility, connected GitHub repositories, and data preferences.
            </p>
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-6 shadow-subtle space-y-5">
          <h2 className="text-sm font-bold font-mono text-[#F7F6F1] flex items-center gap-2">
            <User className="w-4 h-4 text-[#159A72]" />
            <span>Developer Profile Details</span>
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#7A857E] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#151A17] border border-[#2E3E34] rounded-[6px] px-3 py-2 text-xs font-mono text-[#F7F6F1] focus:outline-none focus:border-[#159A72]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#7A857E] mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-[#151A17] border border-[#2E3E34] rounded-[6px] px-3 py-2 text-xs font-mono text-[#F7F6F1] focus:outline-none focus:border-[#159A72]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#7A857E] mb-1">
                Engineering Bio
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#151A17] border border-[#2E3E34] rounded-[6px] p-3 text-xs font-sans text-[#F7F6F1] focus:outline-none focus:border-[#159A72]"
              />
            </div>

            <div className="pt-1 flex items-center gap-3 font-mono">
              <Button type="submit" variant="emerald" size="sm" className="bg-[#087453] hover:bg-[#159A72] text-white">
                Save Profile Changes
              </Button>
              {saved && (
                <span className="text-xs text-[#159A72] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-[#159A72]" /> Changes saved to vault
                </span>
              )}
            </div>
          </form>
        </div>

        {/* GitHub Connection */}
        <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-6 shadow-subtle space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#F7F6F1] flex items-center gap-2">
              <Github className="w-4 h-4 text-[#159A72]" />
              <span>Connected GitHub Account</span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-[4px] bg-[#18352B] text-[#159A72] border border-[#27382F] font-semibold">
              Active Sync
            </span>
          </div>

          <div className="p-4 rounded-[6px] bg-[#151A17] border border-[#24352C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-[#F7F6F1]">@{githubUsername || "connected"}</div>
              <p className="text-xs text-[#7A857E] mt-0.5">
                {syncMsg || "Cryptographic evidence trees synchronized to Neon PostgreSQL vault."}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              isLoading={isSyncing}
              className="gap-2 text-xs border-[#2E3E34] bg-[#18201C] hover:bg-[#24352C] text-[#F7F6F1]"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#159A72] ${isSyncing ? "animate-spin" : ""}`} />
              <span>Force Re-Sync</span>
            </Button>
          </div>
        </div>

        {/* Visibility */}
        <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-bold font-mono text-[#F7F6F1] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#159A72]" />
            <span>Profile Visibility &amp; Public Link</span>
          </h2>

          <div className="flex items-center justify-between p-4 rounded-[6px] bg-[#151A17] border border-[#24352C]">
            <div>
              <span className="text-xs font-mono font-bold text-[#F7F6F1] block">Public Verified Vault Profile</span>
              <span className="text-[11px] text-[#A8B3AC]">
                Allow hiring managers to view your verified skill evidence report at /profile/{githubUsername}.
              </span>
            </div>

            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                isPublic ? "bg-[#159A72]" : "bg-[#2E3E34]"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  isPublic ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-[11px] border border-[#D97745]/30 bg-[#18201C] p-6 shadow-subtle space-y-3 font-mono">
          <h2 className="text-sm font-bold text-[#D97745] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#D97745]" />
            <span>Danger Zone</span>
          </h2>
          <p className="text-xs text-[#A8B3AC] font-sans">
            Disconnecting GitHub will delete all cached AST proof trees and remove your verified evidence score.
          </p>

          <div className="pt-1 flex flex-wrap gap-2.5">
            <Button variant="danger" size="sm" className="gap-2 bg-[#FAF0ED] text-[#D97745] border-[#F3E3D8]">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Disconnect GitHub Account</span>
            </Button>
            <Button variant="danger" size="sm" className="gap-2 bg-[#FAF0ED] text-[#D97745] border-[#F3E3D8]">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Entire Evidence Vault</span>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
