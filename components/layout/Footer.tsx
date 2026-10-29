"use client";

import React from "react";
import Link from "next/link";
import { GitriumLogo } from "@/components/logo/GitriumLogo";
import { PRODUCT_INFO } from "@/lib/constants";
import { ShieldCheck, ExternalLink, Linkedin, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#151A17] text-[#A8B3AC] py-12 border-t border-[#24352C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#24352C]">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-3">
            <GitriumLogo variant="full" size="md" textColor="light" />
            <p className="text-xs text-[#A8B3AC] max-w-sm leading-relaxed mt-2">
              The trusted vault of code evidence. Gitrium transforms GitHub repositories, contributions,
              and project history into verifiable developer intelligence.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#159A72] font-mono pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#159A72]" />
              <span>Evidence-Backed Provenance Platform</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F7F6F1]">
              Platform
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/dashboard" className="text-[#A8B3AC] hover:text-[#F7F6F1] transition-colors">
                  Evidence Dashboard
                </Link>
              </li>
              <li>
                <Link href="/repositories" className="text-[#A8B3AC] hover:text-[#F7F6F1] transition-colors">
                  Repository Intelligence
                </Link>
              </li>
              <li>
                <Link href="/skills" className="text-[#A8B3AC] hover:text-[#F7F6F1] transition-colors">
                  Skill Intelligence
                </Link>
              </li>
              <li>
                <Link href="/integrity" className="text-[#A8B3AC] hover:text-[#F7F6F1] transition-colors">
                  Code Integrity Signals
                </Link>
              </li>
              <li>
                <Link href="/career" className="text-[#A8B3AC] hover:text-[#F7F6F1] transition-colors">
                  Career Alignment
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Social */}
          <div className="md:col-span-4 space-y-2.5">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F7F6F1]">
              ADYK Multi Venture Company
            </h4>
            <p className="text-xs text-[#A8B3AC]">
              Built by{" "}
              <a
                href={PRODUCT_INFO.founder.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-[#F7F6F1] hover:underline font-semibold"
              >
                Rejiesh Ashwanth
              </a>
              , Co-Founder.
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs font-mono">
              <a
                href={PRODUCT_INFO.social.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-[#A8B3AC] hover:text-[#159A72] transition-colors flex items-center gap-1"
                aria-label="ADYK LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-[#A8B3AC]" />
                <span>LinkedIn</span>
              </a>

              <a
                href={PRODUCT_INFO.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="text-[#A8B3AC] hover:text-[#159A72] transition-colors flex items-center gap-1"
                aria-label="ADYK Instagram"
              >
                <Instagram className="w-4 h-4 text-[#A8B3AC]" />
                <span>Instagram</span>
              </a>

              <a
                href={PRODUCT_INFO.social.x}
                target="_blank"
                rel="noreferrer"
                className="text-[#A8B3AC] hover:text-[#159A72] transition-colors flex items-center gap-1"
                aria-label="ADYK X"
              >
                <Twitter className="w-4 h-4 text-[#A8B3AC]" />
                <span>X</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Attribution */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7A857E] font-mono gap-2">
          <p>© {new Date().getFullYear()} ADYK GITRIUM. All rights reserved.</p>
          <p className="text-[#7A857E]">{PRODUCT_INFO.company}</p>
        </div>
      </div>
    </footer>
  );
}
