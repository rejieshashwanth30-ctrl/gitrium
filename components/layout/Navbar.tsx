"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { GitriumLogo } from "@/components/logo/GitriumLogo";
import { Button } from "@/components/ui/Button";
import { NAV_LINKS, MOBILE_NAV_LINKS } from "@/lib/constants";
import { Menu, X, ArrowRight, Github } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Sticky Scroll Detection & Active Section Indicator
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 15);

      const sections = [
        { id: "what-gitrium-does" },
        { id: "features" },
        { id: "evidence-graph" },
        { id: "integrity" },
        { id: "career" },
        { id: "about" },
      ];

      const navHeight = window.innerWidth >= 1024 ? 70 : 60;
      const offset = navHeight + 30;
      let current = "";

      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop - offset;
          const bottom = top + el.offsetHeight;
          if (scrollY >= top && scrollY < bottom) {
            current = section.id;
          }
        }
      }

      if (
        window.innerHeight + Math.round(window.scrollY) >=
        document.documentElement.scrollHeight - 60
      ) {
        current = "about";
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Body Scroll Locking & Escape Key Handling
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Smooth Anchor Scrolling with Exact Offset
  const scrollToAnchor = (href: string) => {
    if (!href.startsWith("#")) return;
    const targetId = href.slice(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const navHeight = window.innerWidth >= 1024 ? 70 : 60;
      const targetPosition =
        targetElement.getBoundingClientRect().top +
        window.pageYOffset -
        (navHeight + 16);

      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: "smooth",
      });

      window.history.pushState(null, "", href);
    }
  };

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      scrollToAnchor(href);
    }
  };

  const handleMobileLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    setMobileMenuOpen(false);
    if (href.startsWith("#")) {
      e.preventDefault();
      setTimeout(() => {
        scrollToAnchor(href);
      }, 120);
    }
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-200 ease-in-out select-none",
          "h-[60px] lg:h-[70px]",
          isScrolled
            ? "bg-[#151A17]/95 backdrop-blur-md border-b border-[#24352C] shadow-sm"
            : "bg-[#151A17] border-b border-[#24352C]/80"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* LEFT: Gitrium Official Logo */}
          <div className="flex items-center shrink-0">
            <GitriumLogo
              variant="full"
              size="sm"
              textColor="light"
              className="w-[125px] sm:w-[135px] lg:w-[145px] max-w-[145px]"
            />
          </div>

          {/* CENTER: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 whitespace-nowrap">
            {NAV_LINKS.map((link) => {
              const sectionId = link.href.slice(1);
              const isActive = activeSection === sectionId;

              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className={cn(
                    "relative py-1.5 text-[13px] font-medium transition-colors duration-150 group flex flex-col items-center whitespace-nowrap",
                    isActive
                      ? "text-[#159A72] font-semibold"
                      : "text-[#A8B3AC] hover:text-[#F7F6F1]"
                  )}
                >
                  <span>{link.label}</span>
                  <span
                    className={cn(
                      "absolute -bottom-0.5 left-0 w-full h-[2px] rounded-full transition-all duration-150",
                      isActive
                        ? "bg-[#159A72] scale-x-100 opacity-100"
                        : "bg-[#24352C] scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100 group-hover:bg-[#159A72]"
                    )}
                  />
                </a>
              );
            })}
          </nav>

          {/* RIGHT: Desktop CTA Actions */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[#A8B3AC] hover:text-[#F7F6F1] hover:bg-[#1E2822] font-medium px-3 h-9"
              >
                Sign In
              </Button>
            </Link>

            <Link href="/github-connect">
              <button
                className="group relative inline-flex items-center justify-center h-9 px-4 text-xs font-semibold rounded-[7px] bg-[#087453] text-white hover:bg-[#159A72] border border-[#087453] shadow-xs active:scale-[0.96] active:translate-y-[0.5px] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#159A72]/40 whitespace-nowrap gap-1.5 cursor-pointer"
                aria-label="Analyze My GitHub"
              >
                <Github className="w-3.5 h-3.5 text-white/90" />
                <span>Analyze My GitHub</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5 text-white/80 group-hover:translate-x-0.5 transition-transform duration-150" />
              </button>
            </Link>
          </div>

          {/* TABLET & MOBILE CONTROLS (< 1024px) */}
          <div className="flex lg:hidden items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-[#A8B3AC] hover:text-[#F7F6F1] font-medium px-2.5 h-8 sm:h-9"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/github-connect">
                <button
                  className="inline-flex items-center justify-center h-8 sm:h-9 px-3 text-xs font-semibold rounded-[7px] bg-[#087453] text-white hover:bg-[#159A72] active:scale-95 transition-all whitespace-nowrap"
                  aria-label="Analyze My GitHub"
                >
                  <Github className="w-3 h-3 mr-1 text-white/90" />
                  <span>Analyze GitHub</span>
                </button>
              </Link>
            </div>

            <div className="flex sm:hidden items-center">
              <Link href="/github-connect">
                <button
                  className="inline-flex items-center justify-center min-h-[36px] px-3 text-xs font-semibold rounded-[7px] bg-[#087453] text-white hover:bg-[#159A72] active:scale-95 transition-all whitespace-nowrap"
                  aria-label="Analyze GitHub"
                >
                  <span>Analyze</span>
                  <ArrowRight className="w-3 h-3 ml-1 text-white/80" />
                </button>
              </Link>
            </div>

            {/* Hamburger Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-w-[44px] min-h-[44px] rounded-[7px] flex items-center justify-center text-[#A8B3AC] hover:text-[#F7F6F1] hover:bg-[#1E2822] active:bg-[#24352C] transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[#F7F6F1]" />
              ) : (
                <Menu className="w-5 h-5 text-[#F7F6F1]" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE & TABLET DRAWER WITH SOLID GRAPHITE SURFACE */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[60px] lg:top-[70px] z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#151A17]/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div
            ref={drawerRef}
            className="relative bg-[#151A17] border-b border-[#24352C] shadow-2xl px-5 pt-3 pb-6 space-y-3.5 max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-150"
          >
            <div className="flex flex-col divide-y divide-[#24352C]">
              {MOBILE_NAV_LINKS.map((link) => {
                const sectionId = link.href.slice(1);
                const isActive = activeSection === sectionId;

                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleMobileLinkClick(e, link.href)}
                    className={cn(
                      "min-h-[44px] py-2 px-3 flex items-center justify-between text-sm font-medium rounded-[7px] transition-colors whitespace-nowrap",
                      isActive
                        ? "text-[#159A72] bg-[#18352B] font-semibold"
                        : "text-[#A8B3AC] hover:bg-[#1E2822] hover:text-[#F7F6F1]"
                    )}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#159A72]" />
                    )}
                  </a>
                );
              })}
            </div>

            <div className="pt-1">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] px-3 py-2.5 rounded-[7px] text-xs font-semibold text-[#159A72] bg-[#18352B] hover:bg-[#1E2822] flex items-center justify-between transition-colors border border-[#24352C]"
              >
                <span>Live Evidence Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="pt-3 border-t border-[#24352C] flex flex-col gap-2.5">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full min-h-[44px] font-medium bg-[#1E2822] text-[#F7F6F1] border-[#2E3E34] hover:bg-[#24352C]"
                >
                  Sign In
                </Button>
              </Link>

              <Link
                href="/github-connect"
                onClick={() => setMobileMenuOpen(false)}
              >
                <button className="w-full min-h-[44px] px-4 rounded-[7px] bg-[#087453] hover:bg-[#159A72] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all">
                  <Github className="w-4 h-4 text-white/90" />
                  <span>Analyze My GitHub</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white/80" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
