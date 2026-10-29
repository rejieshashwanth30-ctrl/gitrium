"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface GitriumLogoProps {
  variant?: "full" | "horizontal" | "mark" | "official";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  href?: string;
  textColor?: "light" | "dark";
}

export function GitriumMarkSvg({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0", className)}
      aria-label="Gitrium Mark"
    >
      <defs>
        <linearGradient id="gitriumMarkGrad" x1="15" y1="85" x2="85" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#151A17" />
          <stop offset="50%" stopColor="#18352B" />
          <stop offset="100%" stopColor="#159A72" />
        </linearGradient>
      </defs>

      {/* Hexagonal Outer Circuit */}
      <path
        d="M 50 14 L 80 30 L 80 50 L 50 67 L 22 51 L 22 31 L 50 15"
        stroke="url(#gitriumMarkGrad)"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Hexagonal Intermediate Track */}
      <path
        d="M 45 28 L 70 42 L 70 68 L 50 79 L 28 67 L 28 46 L 45 36"
        stroke="url(#gitriumMarkGrad)"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Core Inner 'G' */}
      <path
        d="M 58 53 L 42 53 L 42 62 L 56 62 L 64 57"
        stroke="#159A72"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Up-Right Dynamic Arrow */}
      <path
        d="M 68 34 L 86 18 M 86 18 L 74 18 M 86 18 L 86 30"
        stroke="#159A72"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GitriumLogo({
  variant = "horizontal",
  size = "md",
  className,
  href = "/",
  textColor = "dark",
}: GitriumLogoProps) {
  const markSize = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
  };

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {variant === "official" ? (
        <div className="relative flex items-center select-none">
          <Image
            src="/logo.png"
            alt="ADYK GITRIUM - The Trusted Vault of Code Evidence"
            width={145}
            height={42}
            className="h-7 sm:h-8 w-auto max-w-[125px] sm:max-w-[145px] object-contain"
            priority
          />
        </div>
      ) : variant === "mark" ? (
        <GitriumMarkSvg className={markSize[size]} />
      ) : variant === "full" ? (
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <GitriumMarkSvg className={markSize[size]} />
            <div className="flex flex-col leading-none">
              <span className="text-[9px] font-bold tracking-widest uppercase text-[#159A72] font-mono">ADYK</span>
              <span
                className={cn(
                  "font-bold tracking-tight text-lg",
                  textColor === "dark" ? "text-[#17201B]" : "text-[#F7F6F1]"
                )}
              >
                GITRIUM
              </span>
            </div>
          </div>
          <span
            className={cn(
              "mt-0.5 text-[8.5px] tracking-wider uppercase font-semibold font-mono",
              textColor === "dark" ? "text-[#56635C]" : "text-[#7A857E]"
            )}
          >
            The Trusted Vault of Code Evidence
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2.5">
          <GitriumMarkSvg className={markSize[size]} />
          <div className="flex flex-col leading-none">
            <span className="text-[8.5px] font-bold tracking-widest uppercase text-[#159A72] font-mono">ADYK</span>
            <span
              className={cn(
                "font-bold tracking-tight text-lg",
                textColor === "dark" ? "text-[#17201B]" : "text-[#F7F6F1]"
              )}
            >
              GITRIUM
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
