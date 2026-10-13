"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Maximize2,
  Minimize2,
  Bell,
  Sun,
  Moon,
  Compass,
  Sparkles,
} from "lucide-react";
import { DynamicMoonPhase } from "@/components/DynamicMoonPhase";
import { AstrologicalCoordinates, ReshTideInfo, getReshSolarTide } from "@/lib/astronomy";
import { playCeremonialGong, playRitualKnock } from "@/lib/audioBell";
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

  // Modo Claro do Altar por padrão (com persistência no localStorage)
  const [altarTheme, setAltarTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("magick_altar_theme") as "light" | "dark") || "light";
    }
    return "light";
  });

  const isLight = altarTheme === "light";

  // Alterna entre Modo Claro e Escuro
  const toggleAltarTheme = () => {
    setAltarTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem("magick_altar_theme", next);
      } catch (e) {}
      return next;
    });
  };

  // Atualiza relógio e cálculo solar a cada segundo
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now);
      setResh(getReshSolarTide(now));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Alterna tela cheia
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Atalhos de teclado (Esc, G para Gongo, K para Knock, F para Fullscreen, T para alternar Claro/Escuro)
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
      if (e.key.toLowerCase() === "t") {
        toggleAltarTheme();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-10 select-none overflow-y-auto transition-colors duration-300 animate-in fade-in ${
        isLight
          ? "bg-gradient-to-b from-[#FAF8F5] via-[#F5F2EA] to-[#ECE7DC] text-slate-900"
          : "bg-[#07090E] text-white"
      }`}
    >
      {/* 1. Barra Superior: Cabeçalho Thelêmico & Controles */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${
          isLight ? "border-amber-900/15" : "border-white/10"
        }`}
      >
        <div className="flex items-center gap-3">
          <EstrelaDeThelema
            className={`w-7 h-7 drop-shadow-md transition-colors ${
              isLight ? "text-amber-700" : "text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]"
            }`}
          />
          <div>
            <h1
              className={`text-xs font-mono uppercase tracking-[0.25em] font-bold ${
                isLight ? "text-amber-950" : "text-amber-300"
              }`}
            >
              Sanctum · Modo Altar
            </h1>
            <p
              className={`text-xs font-serif font-medium mt-0.5 ${
                isLight ? "text-slate-700" : "text-slate-300"
              }`}
            >
              {astroData?.thelemicDate || "Anno VI:xii · Dies Martis"}
            </p>
          </div>
        </div>

        {/* Botões de Ação Ritualística */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Alternar Modo Claro / Escuro */}
          <button
            onClick={toggleAltarTheme}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 shadow-sm font-semibold ${
              isLight
                ? "bg-amber-500/15 hover:bg-amber-500/25 border-amber-600/30 text-amber-950"
                : "bg-neutral-800/90 hover:bg-neutral-700 border-neutral-600 text-neutral-200"
            }`}
            title="Alternar entre Modo Claro e Escuro (Atalho: T)"
          >
            {isLight ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-700" />
                <span>Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-300" />
                <span>Modo Escuro</span>
              </>
            )}
            <kbd
              className={`text-[10px] px-1 rounded font-bold ${
                isLight ? "bg-amber-200/80 text-amber-950" : "bg-neutral-700 text-neutral-300"
              }`}
            >
              T
            </kbd>
          </button>

          {/* Bateria / Knock */}
          <button
            onClick={() => playRitualKnock()}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 shadow-sm font-semibold ${
              isLight
                ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-800"
                : "bg-neutral-900/90 hover:bg-neutral-800 border-neutral-700 text-neutral-200 hover:text-white"
            }`}
            title="Toque ritualístico (Atalho: K)"
          >
            <span>Bateria / Knock</span>
            <kbd
              className={`text-[10px] px-1 rounded font-bold ${
                isLight ? "bg-slate-200 text-slate-700" : "bg-neutral-800 text-neutral-400"
              }`}
            >
              K
            </kbd>
          </button>

          {/* Gongo Cerimonial */}
          <button
            onClick={() => playCeremonialGong({ volume: 0.8 })}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 shadow-sm font-semibold ${
              isLight
                ? "bg-amber-100 hover:bg-amber-200/80 border-amber-300 text-amber-950"
                : "bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-200"
            }`}
            title="Gongo Cerimonial Thelêmico (Atalho: G)"
          >
            <Bell className={`w-3.5 h-3.5 ${isLight ? "text-amber-800" : "text-amber-400"}`} />
            <span>Gongo</span>
            <kbd
              className={`text-[10px] px-1 rounded font-bold ${
                isLight ? "bg-amber-200/80 text-amber-950" : "bg-amber-950/60 text-amber-200"
              }`}
            >
              G
            </kbd>
          </button>

          {/* Tela Cheia */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-lg border transition-all shadow-sm ${
              isLight
                ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-950"
                : "bg-neutral-900/90 hover:bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white"
            }`}
            title="Alternar Tela Cheia (Atalho: F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Fechar */}
          <button
            onClick={onClose}
            className={`p-2 rounded-lg border transition-all shadow-sm ${
              isLight
                ? "bg-white hover:bg-red-50 border-slate-300 text-slate-600 hover:text-red-700"
                : "bg-neutral-900/90 hover:bg-red-950/40 border-neutral-700 text-neutral-400 hover:text-red-300"
            }`}
            title="Sair do Modo Altar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Centro Sagrado: Grande Relógio com Fontes Nítidas & Tríade Cósmica */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 sm:my-10 gap-8 sm:gap-10">
        {/* Grande Relógio */}
        <div className="text-center">
          <div
            className={`font-serif text-7xl sm:text-8xl md:text-9xl font-extrabold tracking-tight select-none transition-colors ${
              isLight
                ? "text-slate-950 drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]"
                : "text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.25)]"
            }`}
          >
            <span>{time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
            <span
              className={`text-3xl sm:text-4xl md:text-5xl font-mono font-bold ml-3.5 transition-colors ${
                isLight ? "text-amber-800" : "text-amber-400/90"
              }`}
            >
              {time.getSeconds().toString().padStart(2, "0")}
            </span>
          </div>

          <p
            className={`text-xs font-mono font-bold uppercase tracking-[0.25em] mt-3 ${
              isLight ? "text-amber-900" : "text-amber-300"
            }`}
          >
            Hora Local & Alinhamento Cósmico
          </p>
        </div>

        {/* Tríade dos Cartões Cósmicos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {/* Card 1: Sol & Hora Planetária Temporal */}
          <div
            className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center shadow-lg transition-all ${
              isLight
                ? "bg-white/95 border-amber-500/25 hover:border-amber-500/60 hover:shadow-xl"
                : "bg-neutral-900/80 border-white/10 hover:border-amber-500/40 hover:shadow-2xl backdrop-blur-md"
            }`}
          >
            <div
              className={`w-13 h-13 rounded-full flex items-center justify-center mb-3.5 p-3 border shadow-sm ${
                isLight
                  ? "bg-amber-100 border-amber-300 text-amber-700"
                  : "bg-amber-500/15 border-amber-500/30 text-amber-400"
              }`}
            >
              <Sun className="w-6 h-6 stroke-[2.2]" />
            </div>

            <span
              className={`text-xs font-mono font-bold uppercase tracking-wider ${
                isLight ? "text-amber-900" : "text-neutral-300"
              }`}
            >
              {astroData?.planetaryDay || "Dies Martis"}
            </span>

            <h3
              className={`text-xl font-bold font-serif mt-1 ${
                isLight ? "text-slate-950" : "text-white"
              }`}
            >
              {astroData?.planetaryHour || "Hora de Mercúrio"}
            </h3>

            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold mt-2 border ${
                isLight
                  ? "bg-amber-50 border-amber-200 text-amber-900"
                  : "bg-amber-950/40 border-amber-500/30 text-amber-200"
              }`}
            >
              <span>{astroData?.isDiurnal ? "☀️ Hora Diurna" : "🌙 Hora Noturna"}</span>
              <span>(Hora #{astroData?.hourNumber || 1})</span>
            </div>

            {astroData?.sunrise && astroData?.sunset && (
              <span
                className={`text-[11px] font-mono font-semibold mt-3 ${
                  isLight ? "text-slate-600" : "text-neutral-400"
                }`}
              >
                Nascer: {astroData.sunrise} · Ocaso: {astroData.sunset}
              </span>
            )}
          </div>

          {/* Card 2: Lua Mágicka & Iluminação */}
          <div
            className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center shadow-lg transition-all ${
              isLight
                ? "bg-white/95 border-blue-500/25 hover:border-blue-500/60 hover:shadow-xl"
                : "bg-neutral-900/80 border-white/10 hover:border-blue-500/40 hover:shadow-2xl backdrop-blur-md"
            }`}
          >
            <div
              className={`mb-3.5 p-2 rounded-full border shadow-sm ${
                isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-800/60 border-neutral-700"
              }`}
            >
              <DynamicMoonPhase
                moonAngle={astroData?.moonAngle ?? 45}
                illumination={astroData?.moonIllumination ?? 25}
                size={54}
                showDetails={false}
              />
            </div>

            <span
              className={`text-xs font-mono font-bold uppercase tracking-wider ${
                isLight ? "text-slate-700" : "text-neutral-300"
              }`}
            >
              Fase Lunar
            </span>

            <h3
              className={`text-xl font-bold font-serif mt-1 ${
                isLight ? "text-slate-950" : "text-white"
              }`}
            >
              {astroData?.moonPhaseName || "Lua Crescente"} ({astroData?.moonIllumination || 0}%)
            </h3>

            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold mt-2 border ${
                isLight
                  ? "bg-blue-50 border-blue-200 text-blue-900"
                  : "bg-blue-950/40 border-blue-500/30 text-blue-200"
              }`}
            >
              <span>{astroData?.moonSign || "Escorpião"}</span>
              <ZodiacIcon sign={astroData?.moonSign || "Escorpião"} className="w-3.5 h-3.5 text-blue-600 dark:text-blue-300" />
              <span>{astroData?.moonDegreeFormatted}</span>
            </div>
          </div>

          {/* Card 3: Estação de Liber Resh (Adoração Solar) */}
          <div
            className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center shadow-lg transition-all ${
              isLight
                ? "bg-white/95 border-purple-500/25 hover:border-purple-500/60 hover:shadow-xl"
                : "bg-neutral-900/80 border-white/10 hover:border-purple-500/40 hover:shadow-2xl backdrop-blur-md"
            }`}
          >
            <div
              className={`w-13 h-13 rounded-full flex items-center justify-center mb-3.5 p-3 border shadow-sm ${
                isLight
                  ? "bg-purple-100 border-purple-300 text-purple-700"
                  : "bg-purple-500/15 border-purple-500/30 text-purple-400"
              }`}
            >
              <Compass className="w-6 h-6 stroke-[2.2]" />
            </div>

            <span
              className={`text-xs font-mono font-bold uppercase tracking-wider ${
                isLight ? "text-purple-950" : "text-neutral-300"
              }`}
            >
              Liber Resh vel Helios
            </span>

            <h3
              className={`text-xl font-bold font-serif mt-1 ${
                isLight ? "text-slate-950" : "text-white"
              }`}
            >
              {resh?.thelemicGod || "Ra (Leste)"}
            </h3>

            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold mt-2 border ${
                isLight
                  ? "bg-purple-50 border-purple-200 text-purple-950"
                  : "bg-purple-950/40 border-purple-500/30 text-purple-200"
              }`}
            >
              <span>Quadrante {resh?.direction || "Leste"}</span>
              <span>·</span>
              <span>{resh?.element || "Fogo"}</span>
            </div>

            <span
              className={`text-[11px] font-mono font-semibold mt-3 ${
                isLight ? "text-slate-600" : "text-neutral-400"
              }`}
            >
              Próxima: {resh?.nextStation} (~{resh?.minutesToNext} min)
            </span>
          </div>
        </div>
      </div>

      {/* 3. Rodapé: Saudação do Altar de Liber Resh */}
      {resh && (
        <div
          className={`max-w-4xl mx-auto w-full p-4 sm:p-5 rounded-xl border-2 text-center shadow-lg transition-all ${
            isLight
              ? "bg-white/95 border-amber-600/30"
              : "bg-neutral-900/90 border-amber-500/30 backdrop-blur-md"
          }`}
        >
          <p
            className={`text-xs font-mono font-bold uppercase tracking-widest mb-1.5 ${
              isLight ? "text-amber-950" : "text-amber-300"
            }`}
          >
            Saudação do Altar ({resh.thelemicGod} — Direção {resh.direction})
          </p>
          <p
            className={`font-serif italic text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium ${
              isLight ? "text-slate-900" : "text-neutral-100"
            }`}
          >
            &ldquo;{resh.salutation}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
