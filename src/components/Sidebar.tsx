"use client";

import React, { useState } from "react";
import { MagickEntry, normalizeCategory } from "@/lib/types";
import {
  Search,
  Plus,
  Sparkles,
  Settings,
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
  Database,
  HelpCircle,
  Compass,
} from "lucide-react";
import { EstrelaDeThelema } from "@/components/ThelemicIcons";
import { formatDateBR, getInfluenceCategoryLabel } from "@/lib/dateUtils";

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
  onOpenSigilStudio?: () => void;
  onOpenVaultSelector?: () => void;
  onOpenOnboarding?: () => void;
  activeVaultLabel?: string;
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
  onOpenSigilStudio,
  onOpenVaultSelector,
  onOpenOnboarding,
  activeVaultLabel,
}: SidebarProps) {
  const categories = [
    { name: "all", label: "Todas as Categorias" },
    { name: "Diário", label: "Diário" },
    { name: "Sonho", label: "Sonho" },
    { name: "Oráculo", label: "Oráculo / Tarot" },
    { name: "Prática", label: "Prática & Rituais" },
    { name: "Visão Astral", label: "Visão Astral" },
    { name: "Estudo", label: "Estudo" },
  ];

  const filteredEntries = entries.filter((e) => {
    const category = normalizeCategory(e.type);
    if (selectedCategory !== "all" && category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = (e.title || "").toLowerCase().includes(q);
      const matchesContent = (e.content || "").toLowerCase().includes(q);
      const matchesTags = e.tags?.some((t) => t.toLowerCase().includes(q));
      const matchesInfluences = e.influences?.some(
        (inf) =>
          inf.name.toLowerCase().includes(q) ||
          inf.category.toLowerCase().includes(q) ||
          getInfluenceCategoryLabel(inf.category).toLowerCase().includes(q)
      );
      return matchesTitle || matchesContent || matchesTags || matchesInfluences;
    }
    return true;
  });

  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(50);
  const visibleEntries = filteredEntries.slice(0, visibleLimit);

  return (
    <aside className="w-full h-full bg-medium-900 border-r border-medium-800 flex flex-col select-none">
      {/* 1. Header Minimalista */}
      <div className="px-4 pt-4 pb-3 border-b border-medium-800 space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenHome}
            className="flex items-center gap-2 text-left group"
          >
            <EstrelaDeThelema className="w-4 h-4 text-medium-200 group-hover:text-white transition-colors" />
            <span className="text-xs font-semibold tracking-wide text-white uppercase">
              Diário Mágicko
            </span>
          </button>

          <div className="flex items-center gap-1">
            {onOpenOnboarding && (
              <button
                onClick={onOpenOnboarding}
                className="p-1.5 text-medium-400 hover:text-white rounded-md hover:bg-medium-850 transition-colors"
                title="Guia Rápido & Glossário"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onOpenSettings}
              className="p-1.5 text-medium-400 hover:text-white rounded-md hover:bg-medium-850 transition-colors"
              title="Configurações"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Seletor discreto de banco de dados (.db) */}
        {onOpenVaultSelector && (
          <button
            type="button"
            onClick={onOpenVaultSelector}
            className="w-full flex items-center justify-between px-2 py-1 rounded bg-medium-850/70 hover:bg-medium-800 border border-medium-800 text-[10px] font-mono text-medium-400 hover:text-white transition-colors"
            title="Trocar ou carregar outro banco de dados (.db)"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Database className="w-3 h-3 shrink-0" />
              <span className="truncate">{activeVaultLabel || "magick_diary.db"}</span>
            </span>
            <span className="text-medium-500">Trocar</span>
          </button>
        )}
      </div>

      {/* 2. Navegação Essencial & Ferramentas */}
      <div className="p-3 border-b border-medium-800 space-y-2">
        <button
          onClick={onNewEntry}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white hover:bg-medium-200 text-black text-xs font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Nova Nota</span>
        </button>

        <nav className="grid grid-cols-3 gap-1 pt-0.5">
          <button
            onClick={onOpenHome}
            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-[11px] font-medium transition-colors ${
              currentView === "home"
                ? "bg-medium-800 text-white"
                : "text-medium-400 hover:text-white hover:bg-medium-850"
            }`}
          >
            <Home className="w-3 h-3" />
            <span>Início</span>
          </button>

          <button
            onClick={onOpenDashboard}
            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-[11px] font-medium transition-colors ${
              currentView === "dashboard"
                ? "bg-medium-800 text-white"
                : "text-medium-400 hover:text-white hover:bg-medium-850"
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            <span>Dados</span>
          </button>

          {onOpenTree && (
            <button
              onClick={onOpenTree}
              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-[11px] font-medium transition-colors ${
                currentView === "tree"
                  ? "bg-medium-800 text-white"
                  : "text-medium-400 hover:text-white hover:bg-medium-850"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Árvore</span>
            </button>
          )}
        </nav>

        {/* Gaveta Discreta de Ferramentas */}
        <div>
          <button
            type="button"
            onClick={() => setIsToolsOpen(!isToolsOpen)}
            className="w-full flex items-center justify-between py-1 px-2 rounded-md text-[11px] text-medium-400 hover:text-white hover:bg-medium-850 transition-colors"
          >
            <span>Ferramentas do Templo</span>
            {isToolsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {isToolsOpen && (
            <div className="mt-1 p-1 rounded-lg bg-medium-850 border border-medium-800 grid grid-cols-2 gap-1">
              {onOpenQuickDream && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenQuickDream();
                    setIsToolsOpen(false);
                  }}
                  className="flex items-center gap-1.5 py-1.5 px-2 rounded text-[11px] text-medium-300 hover:text-white hover:bg-medium-800 text-left truncate"
                >
                  <CloudMoon className="w-3 h-3 shrink-0" />
                  <span className="truncate">Sonho (Voz)</span>
                </button>
              )}
              {onOpenSigilStudio && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenSigilStudio();
                    setIsToolsOpen(false);
                  }}
                  className="flex items-center gap-1.5 py-1.5 px-2 rounded text-[11px] text-medium-300 hover:text-white hover:bg-medium-800 text-left truncate"
                >
                  <Compass className="w-3 h-3 shrink-0" />
                  <span className="truncate">Sigilos & Pemba</span>
                </button>
              )}
              {onOpenTimer && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenTimer();
                    setIsToolsOpen(false);
                  }}
                  className="flex items-center gap-1.5 py-1.5 px-2 rounded text-[11px] text-medium-300 hover:text-white hover:bg-medium-800 text-left truncate"
                >
                  <Clock className="w-3 h-3 shrink-0" />
                  <span className="truncate">Dharana</span>
                </button>
              )}
              {onOpenAltar && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAltar();
                    setIsToolsOpen(false);
                  }}
                  className="flex items-center gap-1.5 py-1.5 px-2 rounded text-[11px] text-medium-300 hover:text-white hover:bg-medium-800 text-left truncate"
                >
                  <Flame className="w-3 h-3 shrink-0" />
                  <span className="truncate">Modo Altar</span>
                </button>
              )}
              {onOpenGematria && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenGematria();
                    setIsToolsOpen(false);
                  }}
                  className="flex items-center gap-1.5 py-1.5 px-2 rounded text-[11px] text-medium-300 hover:text-white hover:bg-medium-800 text-left truncate"
                >
                  <Calculator className="w-3 h-3 shrink-0" />
                  <span className="truncate">Gematria</span>
                </button>
              )}
              {onOpenGrimoireCompiler && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenGrimoireCompiler();
                    setIsToolsOpen(false);
                  }}
                  className="flex items-center gap-1.5 py-1.5 px-2 rounded text-[11px] text-medium-300 hover:text-white hover:bg-medium-800 text-left truncate"
                >
                  <BookMarked className="w-3 h-3 shrink-0" />
                  <span className="truncate">Exportar PDF</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Busca & Filtro Compacto de Categoria */}
      <div className="p-2.5 border-b border-medium-800 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-medium-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar notas..."
            className="w-full bg-medium-850 border border-medium-800 rounded-md pl-8 pr-2.5 py-1 text-xs text-white placeholder-medium-500 focus:outline-none focus:border-medium-600"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => onSelectCategory(e.target.value)}
          className="w-full bg-medium-850 border border-medium-800 rounded-md px-2.5 py-1 text-[11px] text-medium-300 focus:outline-none focus:border-medium-600 cursor-pointer"
        >
          {categories.map((c) => {
            const count =
              c.name === "all"
                ? entries.length
                : entries.filter((e) => normalizeCategory(e.type) === c.name).length;
            return (
              <option key={c.name} value={c.name} className="bg-medium-900 text-white">
                {c.label} ({count})
              </option>
            );
          })}
        </select>
      </div>

      {/* 4. Lista de Notas Minimalista (2 Linhas Limpas por Nota) */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {visibleEntries.length === 0 ? (
          <div className="p-6 text-center text-xs text-medium-500">
            Nenhuma nota encontrada.
          </div>
        ) : (
          <>
            {visibleEntries.map((entry) => {
              const isSelected = selectedEntryId === entry.id && currentView === "article";
              const category = normalizeCategory(entry.type);

              return (
                <div
                  key={entry.id}
                  onClick={() => onSelectEntry(entry)}
                  className={`px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-medium-800 text-white"
                      : "hover:bg-medium-850/70 text-medium-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`text-xs font-medium truncate ${
                        isSelected ? "text-white font-semibold" : "text-medium-200"
                      }`}
                    >
                      {entry.title}
                    </h3>
                    {entry.success_rating ? (
                      <span className="text-[10px] font-mono text-medium-400 flex items-center gap-0.5 shrink-0">
                        <Star className="w-2.5 h-2.5" />
                        {entry.success_rating}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-medium-500 mt-0.5">
                    <span>{category}</span>
                    <span>{formatDateBR(entry.date)}</span>
                  </div>
                </div>
              );
            })}

            {filteredEntries.length > visibleLimit && (
              <button
                type="button"
                onClick={() => setVisibleLimit((prev) => prev + 50)}
                className="w-full py-1.5 mt-1 text-[11px] font-mono text-medium-400 hover:text-white transition-colors"
              >
                Mostrar mais ({filteredEntries.length - visibleLimit})
              </button>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
