"use client";

import React, { useState } from "react";
import { MagickEntry, normalizeCategory, CategoryName } from "@/lib/types";
import {
  Search,
  Plus,
  BookOpen,
  Sparkles,
  Moon,
  Eye,
  Sword,
  SlidersHorizontal,
  Settings,
  Calendar,
  Star,
  Home,
  BarChart2,
  Clock,
  Flame,
  CloudMoon,
  BookMarked,
  Calculator,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { EstrelaDeThelema, getCategoryThelemicIcon, ZodiacIcon, IconeSolThelema } from "@/components/ThelemicIcons";

interface SidebarProps {
  entries: MagickEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (entry: MagickEntry) => void;
  onNewEntry: () => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSettings: () => void;
  currentView?: "home" | "article" | "dashboard" | "tree";
  onOpenHome?: () => void;
  onOpenDashboard?: () => void;
  onOpenTree?: () => void;
  onOpenTimer?: () => void;
  onOpenAltar?: () => void;
  onOpenQuickDream?: () => void;
  onOpenGrimoireCompiler?: () => void;
  onOpenGematria?: () => void;
}

export function Sidebar({
  entries,
  selectedEntryId,
  onSelectEntry,
  onNewEntry,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenSettings,
  currentView = "article",
  onOpenHome,
  onOpenDashboard,
  onOpenTree,
  onOpenTimer,
  onOpenAltar,
  onOpenQuickDream,
  onOpenGrimoireCompiler,
  onOpenGematria,
}: SidebarProps) {
  const categories: { name: string; label: string; icon: React.ReactNode }[] = [
    { name: "all", label: "Todas", icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
    { name: "Diário", label: "Diário", icon: getCategoryThelemicIcon("Diário", "w-3.5 h-3.5") },
    { name: "Estudo", label: "Estudo", icon: getCategoryThelemicIcon("Estudo", "w-3.5 h-3.5") },
    { name: "Visão Astral", label: "Visão Astral", icon: getCategoryThelemicIcon("Visão Astral", "w-3.5 h-3.5") },
    { name: "Sonho", label: "Sonho", icon: getCategoryThelemicIcon("Sonho", "w-3.5 h-3.5") },
    { name: "Oráculo", label: "Oráculo", icon: getCategoryThelemicIcon("Oráculo", "w-3.5 h-3.5") },
    { name: "Prática", label: "Prática", icon: getCategoryThelemicIcon("Prática", "w-3.5 h-3.5") },
  ];

  const filteredEntries = entries.filter((e) => {
    const category = normalizeCategory(e.type);
    if (selectedCategory !== "all" && category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = e.title.toLowerCase().includes(q);
      const matchesContent = e.content.toLowerCase().includes(q);
      const matchesTags = e.tags?.some((t) => t.toLowerCase().includes(q));
      return matchesTitle || matchesContent || matchesTags;
    }
    return true;
  });

  const [isTempleMenuOpen, setIsTempleMenuOpen] = useState(false);

  return (
    <aside className="w-full h-full bg-medium-900 border-r border-medium-700 flex flex-col select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-medium-700 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-medium-850 border border-medium-700 flex items-center justify-center text-white">
            <EstrelaDeThelema className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-sans font-bold tracking-tight text-white uppercase flex items-center gap-1.5">
              <span>Diário Mágicko</span>
            </h1>
            <span className="text-[10px] text-medium-400 font-mono tracking-wider block">
              THELEMA · OBSIDIAN EDITION
            </span>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="p-1.5 text-medium-400 hover:text-white rounded hover:bg-medium-800 transition-colors"
          title="Configurações e Soberania"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Quick Bar Simplificada & Consolidada */}
      <div className="p-2 border-b border-medium-700 bg-medium-850/60 space-y-1.5">
        {/* Pilares Centrais: Início · Dashboard · Árvore */}
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={onOpenHome}
            className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-md text-xs font-medium transition-all ${
              currentView === "home"
                ? "bg-white text-black font-semibold shadow-sm"
                : "bg-medium-800 hover:bg-medium-750 text-medium-300 hover:text-white border border-medium-700/60"
            }`}
            title="Tela Inicial Thelêmica (Portal de Entrada)"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="truncate">Início</span>
          </button>

          <button
            onClick={onOpenDashboard}
            className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-md text-xs font-medium transition-all ${
              currentView === "dashboard"
                ? "bg-white text-black font-semibold shadow-sm"
                : "bg-medium-800 hover:bg-medium-750 text-medium-300 hover:text-white border border-medium-700/60"
            }`}
            title="Dashboard Analítico de Frequência e Sucesso"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="truncate">Métricas</span>
          </button>

          {onOpenTree && (
            <button
              onClick={onOpenTree}
              className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-md text-xs font-medium transition-all ${
                currentView === "tree"
                  ? "bg-purple-600 text-white font-semibold shadow-sm"
                  : "bg-medium-800 hover:bg-medium-750 text-medium-300 hover:text-white border border-medium-700/60"
              }`}
              title="Árvore da Vida Cabalística (Otz Chiim / 10 Sephiroth)"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="truncate">Árvore</span>
            </button>
          )}
        </div>

        {/* Menu Retrátil Elegante: Templo, Rituais & Ferramentas */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsTempleMenuOpen(!isTempleMenuOpen)}
            className={`w-full flex items-center justify-between py-1 px-2 rounded text-[11px] font-mono transition-all border ${
              isTempleMenuOpen
                ? "bg-amber-500/15 text-amber-200 border-amber-500/30"
                : "bg-medium-800/80 hover:bg-medium-800 text-medium-300 hover:text-white border-medium-750"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Templo & Rituais</span>
            </span>
            {isTempleMenuOpen ? (
              <ChevronUp className="w-3 h-3 text-medium-400" />
            ) : (
              <ChevronDown className="w-3 h-3 text-medium-400" />
            )}
          </button>

          {isTempleMenuOpen && (
            <div className="mt-1 p-1 rounded-lg bg-medium-900 border border-medium-750 grid grid-cols-2 gap-1 animate-in fade-in duration-150">
              {onOpenQuickDream && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenQuickDream();
                    setIsTempleMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 py-1 px-1.5 rounded text-[10px] font-mono bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-500/30 transition-all text-left truncate"
                  title="Captura Rápida de Sonhos (Alt + S)"
                >
                  <CloudMoon className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span className="truncate">Sonho (Alt+S)</span>
                </button>
              )}

              {onOpenTimer && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenTimer();
                    setIsTempleMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 py-1 px-1.5 rounded text-[10px] font-mono bg-medium-800 hover:bg-medium-750 text-blue-200 border border-medium-700 transition-all text-left truncate"
                  title="Cronômetro Dharana (Liber E)"
                >
                  <Clock className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="truncate">Dharana</span>
                </button>
              )}

              {onOpenAltar && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAltar();
                    setIsTempleMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 py-1 px-1.5 rounded text-[10px] font-mono bg-amber-950/30 hover:bg-amber-900/50 text-amber-200 border border-amber-500/30 transition-all text-left truncate"
                  title="Modo Altar em Tela Cheia"
                >
                  <Flame className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">Altar Ritual</span>
                </button>
              )}

              {onOpenGrimoireCompiler && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenGrimoireCompiler();
                    setIsTempleMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 py-1 px-1.5 rounded text-[10px] font-mono bg-medium-800 hover:bg-medium-750 text-medium-200 border border-medium-700 transition-all text-left truncate"
                  title="Compilar Grimório em PDF"
                >
                  <BookMarked className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">Grimório PDF</span>
                </button>
              )}

              {onOpenGematria && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenGematria();
                    setIsTempleMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 py-1 px-1.5 rounded text-[10px] font-mono bg-medium-800 hover:bg-medium-750 text-amber-200 border border-medium-700 transition-all text-left truncate col-span-2"
                  title="Calculadora de Gematria Thelêmica"
                >
                  <Calculator className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">Gematria Thelêmica (777)</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Note Button & Search */}
      <div className="p-3 space-y-2 border-b border-medium-700 bg-medium-850">
        <button
          onClick={onNewEntry}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-medium-200 text-black text-xs font-semibold rounded-md transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nova Nota</span>
        </button>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-medium-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar nas notas..."
            className="w-full bg-medium-800 border border-medium-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-medium-400 focus:outline-none focus:border-medium-500 font-sans"
          />
        </div>
      </div>

      {/* Category Pills Bar - Todas as categorias visíveis e clicáveis em wrap */}
      <div className="p-2.5 border-b border-medium-700 bg-medium-850/60 flex flex-wrap items-center gap-1.5">
        {categories.map((c) => {
          const count =
            c.name === "all"
              ? entries.length
              : entries.filter((e) => normalizeCategory(e.type) === c.name).length;
          const isActive = selectedCategory === c.name;

          return (
            <button
              key={c.name}
              onClick={() => onSelectCategory(c.name)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                isActive
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "bg-medium-800 hover:bg-medium-750 text-medium-300 hover:text-white border border-medium-700/70"
              }`}
            >
              <span>{c.label}</span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-black/15 text-black font-bold" : "bg-medium-700/60 text-medium-300"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Note List (Obsidian-Style) */}
      <div className="flex-1 overflow-y-auto divide-y divide-medium-800/80 p-2 space-y-1">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-medium-400 font-mono italic">
            Nenhuma nota encontrada.
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isSelected = selectedEntryId === entry.id;
            const category = normalizeCategory(entry.type);
            const dateStr = new Date(entry.date).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
            });

            return (
              <div
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? "bg-medium-800 text-white border border-medium-600 shadow-sm"
                    : "hover:bg-medium-850/80 text-medium-200 border border-transparent"
                }`}
              >
                {/* Meta Line: Category & Date */}
                <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-medium-400">
                  <span className="uppercase tracking-wider font-semibold text-medium-300 flex items-center gap-1">
                    {getCategoryThelemicIcon(category, "w-3 h-3 text-medium-300")}
                    <span>{category}</span>
                  </span>
                  <span>{dateStr}</span>
                </div>

                {/* Title */}
                <h3
                  className={`text-xs font-sans font-semibold line-clamp-1 mb-1 leading-snug ${
                    isSelected ? "text-white" : "text-medium-100"
                  }`}
                >
                  {entry.title}
                </h3>

                {/* Excerpt */}
                <p className="text-[11px] text-medium-400 line-clamp-2 leading-relaxed">
                  {entry.content.replace(/[#*`_>]/g, "")}
                </p>

                {/* Coordinates & Success Micro-Tags */}
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-medium-800/60 text-[10px] font-mono text-medium-400">
                  <span className="truncate max-w-[170px] flex items-center gap-1">
                    <IconeSolThelema className="w-2.5 h-2.5 text-medium-400 shrink-0 inline-block" size={10} />
                    {entry.sun_sign ? (
                      <>
                        <ZodiacIcon sign={entry.sun_sign} className="w-2.5 h-2.5 text-white shrink-0 inline-block" size={10} />
                        <span>{entry.sun_sign}</span>
                      </>
                    ) : (
                      <span>Sol</span>
                    )}
                    <span className="text-medium-600">·</span>
                    <span>{entry.moon_phase || "Lua"}</span>
                  </span>
                  {entry.success_rating !== undefined && entry.success_rating !== null && entry.success_rating > 0 && (
                    <span className="flex items-center gap-0.5 text-medium-300 font-semibold">
                      <Star className="w-2.5 h-2.5 fill-white text-white" />
                      {entry.success_rating}/10
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-medium-700 bg-medium-900 text-[11px] font-mono text-medium-400 flex items-center justify-between">
        <span>Total: {entries.length} notas</span>
        <span className="text-white">Thelema v1.0</span>
      </div>
    </aside>
  );
}
