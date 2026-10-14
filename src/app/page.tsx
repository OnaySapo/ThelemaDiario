"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ArticleView } from "@/components/ArticleView";
import { RightSidebar } from "@/components/RightSidebar";
import { SettingsModal } from "@/components/SettingsModal";
import { GraphView } from "@/components/GraphView";
import { HomeView } from "@/components/HomeView";
import { DashboardView } from "@/components/DashboardView";
import { TreeOfLifeView, SEPHIROT } from "@/components/TreeOfLifeView";
import { RitualTimerModal } from "@/components/RitualTimerModal";
import { AltarModeModal } from "@/components/AltarModeModal";
import { SpotlightModal } from "@/components/SpotlightModal";
import { QuickDreamModal } from "@/components/QuickDreamModal";
import { GrimoireCompilerModal } from "@/components/GrimoireCompilerModal";
import { AstrologicalCoordinates } from "@/lib/astronomy";
import { MagickEntry, normalizeCategory, CategoryName } from "@/lib/types";
import { getDefaultTemplateForCategory } from "@/lib/templates";
import { applyTheme, getStoredTheme } from "@/lib/theme";
import { Network } from "lucide-react";

export default function Home() {
  const [entries, setEntries] = useState<MagickEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"home" | "article" | "dashboard" | "tree">("home");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [isAltarModalOpen, setIsAltarModalOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isQuickDreamOpen, setIsQuickDreamOpen] = useState(false);
  const [isGrimoireOpen, setIsGrimoireOpen] = useState(false);
  const [astroData, setAstroData] = useState<AstrologicalCoordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);

  // Global keyboard shortcuts (Ctrl+\ for Zen Mode, Ctrl+K for Spotlight, Alt+S for Quick Dream, Escape for Graph Modal)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K / Cmd+K para Spotlight
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      }
      // Alt+S para Captura Rápida de Sonhos (Quick Dream)
      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setIsQuickDreamOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "\\") {
        e.preventDefault();
        setIsZenMode((prev) => !prev);
      }
      if (e.key === "Escape" && isGraphModalOpen) {
        setIsGraphModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isGraphModalOpen]);

  // Load entries
  const loadEntries = async (preferSelectedId?: string) => {
    try {
      const res = await fetch("/api/entries");
      const data = await res.json();
      if (data.success) {
        setEntries(data.entries);
        if (data.entries.length > 0) {
          if (preferSelectedId) {
            setSelectedEntryId(preferSelectedId);
          } else if (!selectedEntryId) {
            setSelectedEntryId(data.entries[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Erro ao carregar entradas:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAstro = async () => {
    try {
      const res = await fetch("/api/astronomy");
      const data = await res.json();
      if (data.success) {
        setAstroData(data);
      }
    } catch (err) {
      console.error("Erro ao carregar dados astrais:", err);
    }
  };

  useEffect(() => {
    const { theme, mode } = getStoredTheme();
    applyTheme(theme, mode);
    loadEntries();
    loadAstro();
  }, []);

  // Currently selected entry
  const selectedEntry = entries.find((e) => e.id === selectedEntryId) || (entries.length > 0 ? entries[0] : null);

  // Create new note directly in center canvas
  const handleNewNote = async (
    prefilledCategory?: CategoryName,
    prefilledContent?: string,
    prefilledTitle?: string
  ) => {
    try {
      // Get astrological data for now
      const astroRes = await fetch("/api/astronomy");
      const astro = await astroRes.json();

      const targetCategory = prefilledCategory || ((selectedCategory !== "all" ? normalizeCategory(selectedCategory) : "Prática") as CategoryName);
      const defaultContent = prefilledContent || getDefaultTemplateForCategory(targetCategory);
      const defaultTitle =
        prefilledTitle ||
        (targetCategory === "Diário"
          ? "Crônica Diária & Reflexões"
          : targetCategory === "Oráculo"
          ? "Consulta Oracular"
          : targetCategory === "Sonho"
          ? "Registro de Sonho Lúcido"
          : targetCategory === "Visão Astral"
          ? "Exploração do Plano Astral"
          : targetCategory === "Estudo"
          ? "Estudo & Correspondências"
          : "Operação Mágicka");

      const defaultOracleData =
        targetCategory === "Oráculo"
          ? {
              system: "thoth_tarot",
              spread_name: "Tiragem Livre",
              query: "",
              card_back_style: "rosa_cruz" as const,
              cards: [],
            }
          : undefined;

      const newDraft: Partial<MagickEntry> = {
        title: defaultTitle,
        content: defaultContent,
        type: targetCategory,
        success_rating: 8,
        date: new Date().toISOString(),
        thelemic_date: astro.success ? astro.thelemicDate : "",
        sun_sign: astro.success ? astro.sunSign : "",
        sun_degree: astro.success ? astro.sunDegree : 0,
        moon_sign: astro.success ? astro.moonSign : "",
        moon_degree: astro.success ? astro.moonDegree : 0,
        moon_phase: astro.success ? astro.moonPhaseName : "",
        moon_illumination: astro.success ? astro.moonIllumination : 0,
        planetary_day: astro.success ? astro.planetaryDay : "",
        planetary_hour: astro.success ? astro.planetaryHour : "",
        tags: [],
        influences: [],
        connections: [],
        oracle_data: defaultOracleData,
      };

      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDraft),
      });
      const data = await res.json();
      if (data.success) {
        await loadEntries(data.entry.id);
        setViewMode("article");
      }
    } catch (err) {
      console.error("Erro ao criar nova nota:", err);
    }
  };

  // Update existing note
  const handleUpdateEntry = async (updated: Partial<MagickEntry>) => {
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) {
        await loadEntries(data.entry.id);
      }
    } catch (err: any) {
      alert("Erro ao atualizar: " + err.message);
    }
  };

  // Delete note
  const handleDeleteEntry = async (id: string) => {
    try {
      const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        const remaining = entries.filter((e) => e.id !== id);
        setEntries(remaining);
        if (remaining.length > 0) {
          setSelectedEntryId(remaining[0].id);
        } else {
          setSelectedEntryId(null);
        }
      }
    } catch (err) {
      alert("Erro ao excluir.");
    }
  };

  // Create note under a specific Sephirah from Tree of Life
  const handleNewNoteUnderSephirah = (sephirahName: string) => {
    const sephirah = SEPHIROT.find((s) => s.name === sephirahName);
    const title = `Operação em ${sephirahName} (${sephirah ? sephirah.transliteration : ""})`;
    const content = `## Aspiração & Operação Mágicka em ${sephirahName}\n\n**Sephirah:** ${sephirahName} (${sephirah?.transliteration || ""}) — ${sephirah?.english || ""}\n**Força Planetária:** ${sephirah?.planet || ""}\n**Nome Divino:** ${sephirah?.godName || ""}\n**Arcanjo:** ${sephirah?.archangel || ""}\n**Experiência Espiritual:** ${sephirah?.spiritualExperience || ""}\n\n### 1. Invocação & Alinhamento\n\n\n### 2. Visão Astral / Ação Ritualística\n\n\n### 3. Registro de Fenômenos & Fechamento\n`;
    handleNewNote("Prática", content, title);
  };

  // Log practice note from Ritual Timer
  const handleLogPracticeNote = (category: string, title: string, content: string) => {
    handleNewNote(category as CategoryName, content, title);
    setIsTimerModalOpen(false);
  };

  // Quick Dream Save Handler
  const handleSaveDream = async (dreamEntry: Partial<MagickEntry>) => {
    try {
      const astroRes = await fetch("/api/astronomy");
      const astro = await astroRes.json();

      const newDream: Partial<MagickEntry> = {
        title: dreamEntry.title || "Sonho Astral",
        content: dreamEntry.content || "",
        type: "Sonho",
        date: dreamEntry.date || new Date().toISOString(),
        thelemic_date: astro.success ? astro.thelemicDate : "",
        sun_sign: astro.success ? astro.sunSign : "",
        sun_degree: astro.success ? astro.sunDegree : 0,
        moon_sign: astro.success ? astro.moonSign : "",
        moon_degree: astro.success ? astro.moonDegree : 0,
        moon_phase: astro.success ? astro.moonPhaseName : "",
        moon_illumination: astro.success ? astro.moonIllumination : 0,
        planetary_day: astro.success ? astro.planetaryDay : "",
        planetary_hour: astro.success ? astro.planetaryHour : "",
        tags: ["sonho", "lucidez", "astral"],
        influences: [],
        connections: [],
      };

      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDream),
      });
      const data = await res.json();
      if (data.success && data.entry) {
        await loadEntries(data.entry.id);
        setSelectedEntryId(data.entry.id);
        setViewMode("article");
      }
    } catch (err) {
      console.error("Erro ao salvar sonho rápido:", err);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-medium-900 text-medium-100 antialiased font-sans">
      {/* 1. Left Sidebar (Obsidian Tree Navigator) */}
      <div
        className={`transition-all duration-300 ease-in-out flex-shrink-0 h-full ${
          isZenMode ? "-ml-80 opacity-0 pointer-events-none w-0 overflow-hidden" : "w-80"
        }`}
      >
        <Sidebar
          entries={entries}
          selectedEntryId={selectedEntryId}
          onSelectEntry={(entry) => {
            setSelectedEntryId(entry.id);
            setViewMode("article");
          }}
          onNewEntry={() => handleNewNote()}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenSettings={() => setIsSettingsOpen(true)}
          currentView={viewMode}
          onOpenHome={() => setViewMode("home")}
          onOpenDashboard={() => setViewMode("dashboard")}
          onOpenTree={() => setViewMode("tree")}
          onOpenTimer={() => setIsTimerModalOpen(true)}
          onOpenAltar={() => setIsAltarModalOpen(true)}
          onOpenQuickDream={() => setIsQuickDreamOpen(true)}
          onOpenGrimoireCompiler={() => setIsGrimoireOpen(true)}
        />
      </div>

      {/* 2. Center Canvas (Home / Dashboard / Tree / Article) */}
      <main className="flex-1 h-full min-w-0 bg-medium-900 overflow-hidden flex flex-col transition-all duration-300">
        {viewMode === "home" ? (
          <HomeView
            entries={entries}
            onSelectEntry={(entry) => {
              setSelectedEntryId(entry.id);
              setViewMode("article");
            }}
            onNewNote={(cat, content, title) => handleNewNote(cat, content, title)}
            onOpenDashboard={() => setViewMode("dashboard")}
            onOpenTree={() => setViewMode("tree")}
            onOpenTimer={() => setIsTimerModalOpen(true)}
            onOpenAltar={() => setIsAltarModalOpen(true)}
          />
        ) : viewMode === "dashboard" ? (
          <DashboardView
            entries={entries}
            onSelectEntry={(entry) => {
              setSelectedEntryId(entry.id);
              setViewMode("article");
            }}
            onBackToHome={() => setViewMode("home")}
          />
        ) : viewMode === "tree" ? (
          <TreeOfLifeView
            entries={entries}
            onSelectEntry={(entry) => {
              setSelectedEntryId(entry.id);
              setViewMode("article");
            }}
            onNewNoteUnderSephirah={handleNewNoteUnderSephirah}
          />
        ) : (
          <ArticleView
            entry={selectedEntry}
            onUpdateEntry={handleUpdateEntry}
            onDeleteEntry={handleDeleteEntry}
            allEntries={entries}
            onSelectEntry={(entry) => setSelectedEntryId(entry.id)}
            onNewNote={() => handleNewNote()}
            isZenMode={isZenMode}
            onToggleZenMode={() => setIsZenMode((prev) => !prev)}
            onBackToHome={() => setViewMode("home")}
          />
        )}
      </main>

      {/* 3. Right Sidebar (Frater Auxiliar + Mini Grafo) - ativo no modo artigo */}
      {viewMode === "article" && (
        <div
          className={`transition-all duration-300 ease-in-out flex-shrink-0 h-full ${
            isZenMode ? "-mr-80 opacity-0 pointer-events-none w-0 overflow-hidden" : "w-80"
          }`}
        >
          <RightSidebar
            currentEntry={selectedEntry}
            allEntries={entries}
            onSelectEntry={(entry) => setSelectedEntryId(entry.id)}
            onOpenFullGraph={() => setIsGraphModalOpen(true)}
          />
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        entries={entries}
      />

      {/* Ritual Timer & Dharana Modal */}
      <RitualTimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
        onLogPracticeNote={handleLogPracticeNote}
      />

      {/* Altar Mode Fullscreen Projection Modal */}
      <AltarModeModal
        isOpen={isAltarModalOpen}
        onClose={() => setIsAltarModalOpen(false)}
        astroData={astroData}
      />

      {/* 4. Fullscreen Expanded Graph Modal (Visão Geral) */}
      {isGraphModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col p-3 sm:p-6 md:p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-medium-700">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-white text-black flex items-center justify-center font-bold text-xs">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-sans font-bold text-white uppercase tracking-wide">
                  Visão Geral do Grafo Mágicko
                </h2>
                <span className="text-[11px] font-mono text-medium-400">
                  Constelação completa de conexões entre rituais, oráculos, sonhos lúcidos e correspondências de Liber 777
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsGraphModalOpen(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-medium-800 hover:bg-medium-750 text-white rounded text-xs font-mono border border-medium-700 transition-colors"
            >
              <span>Fechar</span>
              <kbd className="text-[10px] bg-medium-700 px-1 rounded text-medium-300">Esc</kbd>
            </button>
          </div>

          <div className="flex-1 w-full min-h-0">
            <GraphView
              entries={entries}
              onSelectEntry={(entry) => {
                setSelectedEntryId(entry.id);
                setIsGraphModalOpen(false);
              }}
              onClose={() => setIsGraphModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Spotlight / Busca Global Rápida (Ctrl+K) */}
      <SpotlightModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        entries={entries}
        onSelectEntry={(entry) => {
          setSelectedEntryId(entry.id);
          setViewMode("article");
        }}
      />

      {/* Quick Dream (Captura Rápida de Sonhos - Alt+S) */}
      <QuickDreamModal
        isOpen={isQuickDreamOpen}
        onClose={() => setIsQuickDreamOpen(false)}
        onSaveDream={handleSaveDream}
      />

      {/* Compilador de Grimório Thelêmico em Livro (A4 / PDF) */}
      <GrimoireCompilerModal
        isOpen={isGrimoireOpen}
        onClose={() => setIsGrimoireOpen(false)}
        entries={entries}
      />
    </div>
  );
}
