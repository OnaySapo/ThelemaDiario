"use client";

import React, { useEffect, useState } from "react";
import { AstrologicalCoordinates } from "@/lib/astronomy";
import { Sparkles, Compass, Network, MessageSquare, Plus, Settings, BarChart3, Moon, Sun } from "lucide-react";

interface HeaderProps {
  currentTab: "timeline" | "graph" | "insights";
  onTabChange: (tab: "timeline" | "graph" | "insights") => void;
  onNewEntry: () => void;
  onOpenChat: () => void;
  onOpenSettings: () => void;
}

export function Header({
  currentTab,
  onTabChange,
  onNewEntry,
  onOpenChat,
  onOpenSettings,
}: HeaderProps) {
  const [astro, setAstro] = useState<AstrologicalCoordinates | null>(null);

  useEffect(() => {
    fetch("/api/astronomy")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAstro(data);
        }
      })
      .catch((err) => console.error("Erro ao carregar dados astrais:", err));
  }, []);

  return (
    <header className="border-b border-forest-700 bg-forest-900/95 backdrop-blur-md sticky top-0 z-40 transition-all">
      {/* Astral Ribbon */}
      <div className="bg-forest-950/80 px-4 py-1.5 text-xs border-b border-forest-800 flex flex-wrap items-center justify-between gap-3 text-parchment-300">
        <div className="flex items-center gap-2 font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-moss-500 animate-pulse"></span>
          <span className="text-gold-400 font-semibold tracking-wide">
            {astro ? astro.thelemicDate : "Calculando coordenadas Thelêmicas..."}
          </span>
        </div>

        {astro && (
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-parchment-200">
              <Sun className="w-3.5 h-3.5 text-gold-500" />
              <span>Sol em {astro.sunSign} ({astro.sunDegreeFormatted})</span>
            </div>
            <div className="flex items-center gap-1.5 text-parchment-200">
              <span className="text-sm">{astro.moonPhaseIcon}</span>
              <span>
                {astro.moonPhaseName} ({astro.moonIllumination}%) em {astro.moonSign} ({astro.moonDegreeFormatted})
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1 text-moss-400">
              <span>{astro.planetaryDaySymbol}</span>
              <span>{astro.planetaryDay} ({astro.planetaryHour})</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-forest-800 to-forest-750 border border-moss-500/40 flex items-center justify-center shadow-arcane">
            <span className="text-xl text-gold-400 font-serif select-none">𓁹</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-serif font-bold text-parchment-100 tracking-wider">
                DIÁRIO MÁGICKO
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-forest-800 text-moss-400 border border-moss-600/30 font-mono">
                THELEMA
              </span>
            </div>
            <p className="text-[11px] text-parchment-400 font-mono">
              O Método da Ciência, o Alvo da Religião
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-forest-850 p-1 rounded-lg border border-forest-700">
          <button
            onClick={() => onTabChange("timeline")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentTab === "timeline"
                ? "bg-forest-700 text-parchment-100 shadow-sm"
                : "text-parchment-300 hover:text-parchment-100 hover:bg-forest-800"
            }`}
          >
            <Compass className="w-4 h-4 text-moss-500" />
            <span>Diário</span>
          </button>

          <button
            onClick={() => onTabChange("graph")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentTab === "graph"
                ? "bg-forest-700 text-parchment-100 shadow-sm"
                : "text-parchment-300 hover:text-parchment-100 hover:bg-forest-800"
            }`}
          >
            <Network className="w-4 h-4 text-lunar-500" />
            <span>Grafo de Conexões</span>
          </button>

          <button
            onClick={() => onTabChange("insights")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentTab === "insights"
                ? "bg-forest-700 text-parchment-100 shadow-sm"
                : "text-parchment-300 hover:text-parchment-100 hover:bg-forest-800"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-gold-500" />
            <span>Matriz de Sucesso</span>
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 px-3 py-1.5 bg-forest-800 hover:bg-forest-750 text-parchment-200 hover:text-parchment-100 rounded-lg text-xs font-medium border border-moss-600/30 transition-all shadow-sm group"
            title="Abrir Frater Auxiliar / Chat de Insights"
          >
            <MessageSquare className="w-4 h-4 text-moss-500 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Frater Auxiliar</span>
          </button>

          <button
            onClick={onNewEntry}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-moss-600 hover:bg-moss-500 text-forest-950 font-semibold rounded-lg text-xs transition-all shadow-arcane hover:shadow-glow"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Nota</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 text-parchment-300 hover:text-parchment-100 hover:bg-forest-800 rounded-lg border border-transparent hover:border-forest-700 transition-all"
            title="Configurações e IA"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
