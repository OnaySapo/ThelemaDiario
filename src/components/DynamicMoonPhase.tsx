"use client";

import React, { useMemo } from "react";
import { ZodiacIcon } from "@/components/ThelemicIcons";

interface DynamicMoonPhaseProps {
  moonAngle?: number; // 0 to 360
  illumination?: number; // 0 to 100
  phaseName?: string;
  moonSign?: string;
  moonSignSymbol?: string;
  size?: number; // size in pixels, default 60
  showDetails?: boolean;
}

export function DynamicMoonPhase({
  moonAngle = 0,
  illumination = 50,
  phaseName = "Lua",
  moonSign = "",
  moonSignSymbol = "",
  size = 56,
  showDetails = true,
}: DynamicMoonPhaseProps) {
  // Dimension calculations for SVG
  const radius = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;

  // Path generator for exact lunar illumination
  const illuminatedPath = useMemo(() => {
    const angle = ((moonAngle % 360) + 360) % 360;
    const illum = Math.max(0, Math.min(100, illumination));

    // New Moon: basically dark
    if (illum <= 1.5) {
      return null;
    }

    // Full Moon: full circle
    if (illum >= 98.5) {
      return `M ${cx - radius},${cy} a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`;
    }

    // Normalized terminator radius: |2 * illum - 1| * radius
    const frac = illum / 100;
    const rx = Math.max(0.01, Math.abs(2 * frac - 1) * radius);

    // Waxing (Crescente, angle < 180): Light is on the RIGHT side
    if (angle < 180) {
      // Outer arc on the right: from North (cx, cy - radius) to South (cx, cy + radius)
      // Terminator arc returning from South to North
      // If illum < 50: terminator curves right (concave), sweep = 0
      // If illum >= 50: terminator curves left (convex), sweep = 1
      const sweep = illum >= 50 ? 1 : 0;
      return `M ${cx},${cy - radius} A ${radius},${radius} 0 0,1 ${cx},${cy + radius} A ${rx},${radius} 0 0,${sweep} ${cx},${cy - radius} Z`;
    }

    // Waning (Minguante, angle >= 180): Light is on the LEFT side
    // Outer arc on the left: from North to South (sweep = 0)
    // Terminator arc returning from South to North
    // If illum < 50: terminator curves left (concave), sweep = 1
    // If illum >= 50: terminator curves right (convex), sweep = 0
    const sweep = illum >= 50 ? 0 : 1;
    return `M ${cx},${cy - radius} A ${radius},${radius} 0 0,0 ${cx},${cy + radius} A ${rx},${radius} 0 0,${sweep} ${cx},${cy - radius} Z`;
  }, [moonAngle, illumination, cx, cy, radius]);

  return (
    <div className="flex flex-col items-center text-center select-none group">
      {/* SVG Lunar Sphere */}
      <div className="relative flex items-center justify-center p-1">
        {/* Subtle celestial glow around the moon */}
        <div
          className="absolute inset-0 rounded-full blur-md opacity-30 pointer-events-none transition-opacity group-hover:opacity-60"
          style={{
            background: illumination > 50 ? "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)" : "radial-gradient(circle, rgba(160,174,192,0.2) 0%, transparent 70%)",
          }}
        />

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]"
        >
          <defs>
            {/* Dark unlit side with deep crater texture simulation */}
            <radialGradient id="darkSideGrad" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#1E232A" />
              <stop offset="70%" stopColor="#12161A" />
              <stop offset="100%" stopColor="#0B0E11" />
            </radialGradient>

            {/* Illuminated lunar surface gradient */}
            <radialGradient id="lightSideGrad" cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#ECEEF2" />
              <stop offset="85%" stopColor="#D5D9E0" />
              <stop offset="100%" stopColor="#B4BAC4" />
            </radialGradient>

            {/* Clip path for the whole sphere */}
            <clipPath id="moonCircleClip">
              <circle cx={cx} cy={cy} r={radius} />
            </clipPath>
          </defs>

          {/* Group clipped to lunar disk */}
          <g clipPath="url(#moonCircleClip)">
            {/* 1. Base dark lunar disk */}
            <circle cx={cx} cy={cy} r={radius} fill="url(#darkSideGrad)" />

            {/* Subtle maria/craters on dark side */}
            <circle cx={cx - radius * 0.3} cy={cy - radius * 0.2} r={radius * 0.28} fill="#0d1013" opacity="0.6" />
            <circle cx={cx + radius * 0.25} cy={cy - radius * 0.35} r={radius * 0.22} fill="#0d1013" opacity="0.5" />
            <circle cx={cx - radius * 0.15} cy={cy + radius * 0.3} r={radius * 0.35} fill="#0d1013" opacity="0.65" />
            <circle cx={cx + radius * 0.3} cy={cy + radius * 0.2} r={radius * 0.2} fill="#0d1013" opacity="0.4" />

            {/* 2. Illuminated area (calculated dynamically) */}
            {illuminatedPath && (
              <path
                d={illuminatedPath}
                fill="url(#lightSideGrad)"
                className="transition-all duration-500 ease-out"
              />
            )}

            {/* Subtle craters visible on illuminated part (semi-transparent) */}
            {illuminatedPath && (
              <g opacity="0.12" fill="#475569">
                <circle cx={cx - radius * 0.3} cy={cy - radius * 0.2} r={radius * 0.28} />
                <circle cx={cx + radius * 0.25} cy={cy - radius * 0.35} r={radius * 0.22} />
                <circle cx={cx - radius * 0.15} cy={cy + radius * 0.3} r={radius * 0.35} />
                <circle cx={cx + radius * 0.3} cy={cy + radius * 0.2} r={radius * 0.2} />
              </g>
            )}
          </g>

          {/* Outer delicate rim/limb of the moon */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="0.8"
          />
        </svg>
      </div>

      {/* Details below or beside */}
      {showDetails && (
        <div className="mt-1 space-y-0.5">
          <span className="text-[11px] font-mono font-bold text-white block leading-tight">
            {phaseName}
          </span>
          <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-medium-400">
            <span className="text-white font-semibold">{illumination}%</span>
            {moonSign && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5 text-medium-300">
                  {moonSignSymbol && <ZodiacIcon sign={moonSignSymbol} className="w-2.5 h-2.5 text-white" size={10} />}
                  <span>{moonSign}</span>
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
