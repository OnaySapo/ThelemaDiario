"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Maximize2,
  Minimize2,
  Volume2,
  Bell,
  Sun,
  Moon,
  Compass,
  Sparkles,
  Flame,
} from "lucide-react";
import { DynamicMoonPhase } from "@/components/DynamicMoonPhase";
import { AstrologicalCoordinates, ReshTideInfo, getReshSolarTide } from "@/lib/astronomy";
import { playCeremonialGong, playTibetanBell, playRitualKnock } from "@/lib/audioBell";
import { EstrelaDeThelema, ZodiacIcon } from "@/components/ThelemicIcons";

interface AltarModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  astroData: AstrologicalCoordinates | null;
}

export function AltarModeModal({
  isOpen,
  onClose,
  astroData,
}: AltarModeModalProps) {
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resh, setResh] = useState<ReshTideInfo | null>(null);

  // Update clock every second
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now);
      setResh(getReshSolarTide(now));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard shortcuts (Esc to close, G for Gong, K for Knock, F for Fullscreen)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
      if (e.key.toLowerCase() === "g") {
        playCeremonialGong({ volume: 0.8 });
      }
      if (e.key.toLowerCase() === "k") {
        playRitualKnock();
      }
      if (e.key.toLowerCase() === "f") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#06080D] text-white flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden animate-in fade-in duration-300">
      {/* Top Bar: Thelemic Date & Controls */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <EstrelaDeThelema className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          <div>
            <h1 className="text-xs font-mono uppercase tracking-[0.25em] text-amber-300/90 font-semibold">
              Sanctum · Modo Altar
            </h1>
            <p className="text-[11px] font-mono text-neutral-400">
              {astroData?.thelemicDate || "Anno VI:xii · Dies Martis"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => playRitualKnock()}
            className="px-3 py-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/60 text-xs font-mono text-neutral-300 hover:text-white transition-all flex items-center gap-1.5"
            title="Toque ritualístico (Atalho: K)"
          >
            <span>Bateria / Knock</span>
            <kbd className="text-[10px] bg-neutral-800 px-1 rounded text-neutral-400">K</kbd>
          </button>

          <button
            onClick={() => playCeremonialGong({ volume: 0.8 })}
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-mono text-amber-200 transition-all flex items-center gap-1.5"
            title="Gongo Cerimonial Thelêmico (Atalho: G)"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Gongo</span>
            <kbd className="text-[10px] bg-neutral-800 px-1 rounded text-neutral-400">G</kbd>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/60 text-neutral-300 hover:text-white transition-all"
            title="Alternar Tela Cheia (Atalho: F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/60 text-neutral-400 hover:text-white transition-all"
            title="Sair do Modo Altar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Centerpiece: Great Clock & Cosmic Coordinate Orbs */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 gap-8">
        {/* Sacred Time Display */}
        <div className="text-center">
          <div className="font-mono text-7xl sm:text-8xl md:text-9xl font-bold tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
            {time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            <span className="text-3xl sm:text-4xl text-neutral-500 font-normal ml-3">
              {time.getSeconds().toString().padStart(2, "0")}
            </span>
          </div>
          <p className="text-xs font-mono text-amber-400/80 uppercase tracking-widest mt-2">
            Hora Local & Alinhamento Cósmico
          </p>
        </div>

        {/* Triple Cosmic Orbs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {/* 1. Sol & Hora Planetária Temporal */}
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/10 backdrop-blur-md flex flex-col items-center text-center shadow-xl hover:border-amber-500/30 transition-all">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
              <Sun className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
              {astroData?.planetaryDay || "Dies Martis"}
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              {astroData?.planetaryHour || "Hora de Mercúrio"}
            </h3>
            <span className="text-xs font-mono text-amber-300 mt-1">
              {astroData?.isDiurnal ? "☀️ Hora Diurna" : "🌙 Hora Noturna"} (Hora #{astroData?.hourNumber || 1})
            </span>
            {astroData?.sunrise && astroData?.sunset && (
              <span className="text-[10px] font-mono text-neutral-500 mt-2">
                Nascer: {astroData.sunrise} · Ocaso: {astroData.sunset}
              </span>
            )}
          </div>

          {/* 2. Lua Mágicka & Iluminação */}
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/10 backdrop-blur-md flex flex-col items-center text-center shadow-xl hover:border-blue-500/30 transition-all">
            <div className="mb-3">
              <DynamicMoonPhase
                moonAngle={astroData?.moonAngle ?? 45}
                illumination={astroData?.moonIllumination ?? 25}
                size={54}
                showDetails={false}
              />
            </div>
            <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
              Fase Lunar
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              {astroData?.moonPhaseName || "Lua Crescente"} ({astroData?.moonIllumination || 0}%)
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-mono text-blue-300 mt-1">
              <span>{astroData?.moonSign || "Escorpião"}</span>
              <ZodiacIcon sign={astroData?.moonSign || "Escorpião"} className="w-3.5 h-3.5" />
              <span>{astroData?.moonDegreeFormatted}</span>
            </div>
          </div>

          {/* 3. Estação de Liber Resh (Adoração Solar) */}
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/10 backdrop-blur-md flex flex-col items-center text-center shadow-xl hover:border-purple-500/30 transition-all">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-3">
              <Compass className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
              Liber Resh vel Helios
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              {resh?.thelemicGod || "Ra (Leste)"}
            </h3>
            <span className="text-xs font-mono text-purple-300 mt-1">
              Quadrante {resh?.direction || "Leste"} · {resh?.element || "Fogo"}
            </span>
            <span className="text-[10px] font-mono text-neutral-500 mt-2">
              Próxima: {resh?.nextStation} (~{resh?.minutesToNext} min)
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Resh Salutation for Ritual Incantation */}
      {resh && (
        <div className="max-w-4xl mx-auto w-full p-4 rounded-xl bg-neutral-900/70 border border-amber-500/20 text-center">
          <p className="text-[11px] font-mono text-amber-400 uppercase tracking-widest mb-1">
            Saudação do Altar ({resh.thelemicGod} — Direção {resh.direction})
          </p>
          <p className="font-serif italic text-sm text-neutral-200 leading-relaxed max-w-2xl mx-auto">
            &ldquo;{resh.salutation}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
