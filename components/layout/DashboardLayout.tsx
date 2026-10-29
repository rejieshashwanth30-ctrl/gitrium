"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitriumLogo } from "@/components/logo/GitriumLogo";
import { DASHBOARD_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  GitFork,
  Activity,
  Layers,
  FileCode,
  ShieldCheck,
  Scan,
  Briefcase,
  FileText,
  UserCheck,
  Settings,
  Menu,
  X,
  Github,
  CheckCircle,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { gitriumApi } from "@/lib/services/gitriumApiService";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

// Clean, Modern SVG Outline Icon Mapping (18px, stroke-[1.75])
const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard: LayoutDashboard,
  GitFork: GitFork,
  GitCommit: Activity,
  Cpu: Layers,
  FileCode: FileCode,
  ShieldCheck: ShieldCheck,
  Scan: Scan,
  Briefcase: Briefcase,
  FileText: FileText,
  UserCheck: UserCheck,
  Settings: Settings,
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<{
    name: string;
    username: string;
    avatarUrl?: string | null;
    isVerified: boolean;
  }>({
    name: "Developer",
    username: "developer",
    avatarUrl: null,
    isVerified: true,
  });

  useEffect(() => {
    gitriumApi
      .getProfile()
      .then((res) => {
        if (res?.user?.name) {
          setProfile({
            name: res.user.name,
            username: res.github?.username || res.user.username || "developer",
            avatarUrl: res.user.avatarUrl,
            isVerified: res.user.isVerified,
          });
        }
      })
      .catch(() => {});
  }, []);

  const initials =
    profile.name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "RA";

  const handleSignOut = async () => {
    try {
      gitriumApi.clearCache();
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  // Close mobile sidebar on Escape key or window resize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };

    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileSidebarOpen]);

  return (
    <div className="min-h-screen bg-[#151A17] text-[#F7F6F1] antialiased selection:bg-[#DDF4EA] selection:text-[#087453]">
      {/* ==================================================================== */}
      {/* MOBILE TOP HEADER (< 768px)                                          */}
      {/* ==================================================================== */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-[#24352C] bg-[#151A17]/95 backdrop-blur-md sticky top-0 z-30">
        <GitriumLogo
          variant="horizontal"
          size="sm"
          textColor="light"
          className="w-[125px] max-w-[135px]"
        />
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-[5px] bg-[#18352B] border border-[#27382F] text-[11px] text-[#159A72] font-mono font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified</span>
          </Link>

          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="min-w-[44px] min-h-[44px] rounded-[7px] flex items-center justify-center text-[#A8B3AC] hover:text-[#F7F6F1] hover:bg-[#1E2822] active:bg-[#24352C] transition-colors focus:outline-none"
            aria-label="Toggle Navigation Drawer"
            aria-expanded={mobileSidebarOpen}
          >
            {mobileSidebarOpen ? (
              <X className="w-5 h-5 text-[#F7F6F1]" />
            ) : (
              <Menu className="w-5 h-5 text-[#F7F6F1]" />
            )}
          </button>
        </div>
      </header>

      {/* MOBILE BACKDROP OVERLAY */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-[#151A17]/80 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ==================================================================== */}
      {/* SIDEBAR: Permanent Fixed 100vh on Desktop / Drawer on Mobile          */}
      {/* ==================================================================== */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-30 w-64 h-screen border-r border-[#24352C] bg-[#151A17] text-[#A8B3AC] flex flex-col justify-between transition-transform duration-200 ease-in-out shadow-lg md:shadow-none",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Top: Logo Header (Fixed 64px, never scrolls) */}
        <div className="h-16 px-5 border-b border-[#24352C] flex items-center justify-between shrink-0">
          <GitriumLogo
            variant="horizontal"
            size="md"
            textColor="light"
            className="w-[140px] max-w-[145px]"
          />
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-[6px] text-[#A8B3AC] hover:text-white hover:bg-[#1E2822] transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Middle Container: Developer Identity Card + Navigation Items */}
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-h-0 py-2 sidebar-scroll">
          {/* Developer Identity Card */}
          <Link
            href="/profile"
            onClick={() => setMobileSidebarOpen(false)}
            className="group mx-3 my-2.5 p-2.5 rounded-[9px] bg-[#18201C] hover:bg-[#1D2722] border border-[#27382F] hover:border-[#159A72]/40 flex items-center gap-3 shrink-0 transition-all duration-150 active:scale-[0.98] select-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-[7px] bg-gradient-to-br from-[#18352B] to-[#087453] text-[#F7F6F1] font-bold flex items-center justify-center text-xs flex-shrink-0 font-sans shadow-xs border border-[#159A72]/30 group-hover:scale-105 transition-transform">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold text-[#F7F6F1] truncate font-sans tracking-tight">
                  {profile.name}
                </span>
                <CheckCircle className="w-3.5 h-3.5 text-[#159A72] flex-shrink-0" />
              </div>
              <p className="text-[11px] text-[#7A857E] font-sans truncate">@{profile.username}</p>
            </div>
          </Link>

          {/* Navigation Links — Professional Inter Typography with Tactile Click Physics */}
          <nav className="px-2.5 space-y-1">
            {DASHBOARD_NAV.map((item) => {
              const Icon = ICON_MAP[item.icon] || LayoutDashboard;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] text-[13px] font-sans font-medium transition-all duration-150 ease-out select-none cursor-pointer",
                    "active:scale-[0.96] active:translate-y-[0.5px] active:duration-75",
                    isActive
                      ? "bg-[#18352B] text-white font-semibold border border-[#159A72]/30 shadow-[0_2px_8px_rgba(21,154,114,0.14)]"
                      : "text-[#9DA7A1] hover:text-[#F7F6F1] hover:bg-[#1C2621] hover:translate-x-1"
                  )}
                >
                  {/* Left accent bar on active */}
                  {isActive ? (
                    <span className="w-1 h-3.5 rounded-full bg-[#159A72] shadow-[0_0_8px_rgba(21,154,114,0.7)] -ml-0.5 flex-shrink-0" />
                  ) : (
                    <span className="w-1 h-3.5 rounded-full bg-transparent -ml-0.5 flex-shrink-0 group-hover:bg-[#24352C] transition-colors" />
                  )}

                  <Icon
                    className={cn(
                      "w-[18px] h-[18px] stroke-[1.75] flex-shrink-0 transition-all duration-150 ease-out group-hover:scale-110 group-active:scale-95",
                      isActive
                        ? "text-[#159A72]"
                        : "text-[#7A857E] group-hover:text-[#159A72]"
                    )}
                  />
                  <span className="truncate tracking-[-0.01em]">{item.label}</span>

                  {/* Right active pulse beacon indicator */}
                  {isActive && (
                    <span className="relative flex h-2 w-2 ml-auto flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#159A72] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#159A72]" />
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Sidebar Footer (Pinned to bottom, never scrolls) */}
        <div className="p-4 border-t border-[#24352C] space-y-2 shrink-0">
          <div className="flex items-center justify-between text-[11px] text-[#7A857E] font-sans">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#159A72]" />
              AST Engine Ready
            </span>
            <span className="font-mono">v1.4</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-sans text-[#A8B3AC] hover:text-[#F7F6F1] transition-all duration-150 active:scale-98"
            >
              <span>Public Homepage</span>
              <ExternalLink className="w-3 h-3 text-[#7A857E]" />
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 text-[11px] font-sans text-[#7A857E] hover:text-[#D97745] transition-colors active:scale-95 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* MAIN CONTENT CANVAS (Independently scrollable with correct offset)    */}
      {/* ==================================================================== */}
      <div className="flex flex-col min-w-0 min-h-screen md:pl-64 bg-[#151A17]">
        {/* Desktop Sticky Header */}
        <header className="hidden md:flex items-center justify-between px-6 lg:px-8 h-16 border-b border-[#24352C] bg-[#151A17]/95 backdrop-blur-md sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-[5px] bg-[#18352B] border border-[#27382F] text-xs font-mono text-[#159A72] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#159A72]" />
              <span>Gitrium Verified Vault</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#7A857E] font-mono">
              <Github className="w-3.5 h-3.5 text-[#A8B3AC]" />
              <span>github.com/{profile.username}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/analysis"
              className="text-xs font-sans font-semibold px-3.5 py-1.5 rounded-[7px] bg-[#087453] text-white hover:bg-[#159A72] active:scale-[0.96] active:translate-y-[0.5px] transition-all duration-150 shadow-xs"
            >
              + Run Code Analysis
            </Link>
            <Link href="/profile" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[7px] bg-[#18352B] hover:bg-[#24352C] border border-[#27382F] hover:border-[#159A72]/40 text-[#159A72] font-bold flex items-center justify-center text-xs shadow-xs font-sans active:scale-95 transition-all">
                {initials}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto pb-20">
          {children}
        </main>
      </div>
    </div>
  );
}
