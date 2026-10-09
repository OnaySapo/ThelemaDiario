"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ArticleView } from "@/components/ArticleView";
import { RightSidebar } from "@/components/RightSidebar";
import { SettingsModal } from "@/components/SettingsModal";
import { MagickEntry, normalizeCategory, CategoryName } from "@/lib/types";
import { getDefaultTemplateForCategory } from "@/lib/templates";

export default function Home() {
  const [entries, setEntries] = useState<MagickEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);

  // Global keyboard shortcut for Zen/Focus mode (Ctrl+\ or Cmd+\)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "\\") {
        e.preventDefault();
        setIsZenMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

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

  useEffect(() => {
    loadEntries();
  }, []);

  // Currently selected entry
  const selectedEntry = entries.find((e) => e.id === selectedEntryId) || (entries.length > 0 ? entries[0] : null);

  // Create new note directly in center canvas
  const handleNewNote = async () => {
    try {
      // Get astrological data for now
      const astroRes = await fetch("/api/astronomy");
      const astro = await astroRes.json();

      const targetCategory = (selectedCategory !== "all" ? normalizeCategory(selectedCategory) : "Prática") as CategoryName;
      const defaultContent = getDefaultTemplateForCategory(targetCategory);
      const defaultTitle =
        targetCategory === "Oráculo"
          ? "Consulta Oracular"
          : targetCategory === "Sonho"
          ? "Registro de Sonho Lúcido"
          : targetCategory === "Visão Astral"
          ? "Exploração do Plano Astral"
          : targetCategory === "Estudo"
          ? "Estudo & Correspondências"
          : "Operação Mágicka";

      const defaultOracleData =
        targetCategory === "Oráculo"
          ? {
              system: "thoth_tarot",
              spread_name: "Tiragem Livre",
              query: "",
              card_back_style: "rosa_cruz" as const,
              cards: [
                {
                  position: "1. Vontade / Situação",
                  cardId: "atu_0",
                  cardName: "0. O Louco (The Fool)",
                  imageUrl: "/api/tarot-image/00 - Louco.png",
                  imageFile: "00 - Louco.png",
                  x: 22,
                  y: 35,
                  rotation: 0,
                  isFlipped: true,
                  notes: "Início puro, potencial infinito da Verdadeira Vontade",
                },
                {
                  position: "2. Oposição / Influência",
                  cardId: "atu_1",
                  cardName: "I. O Mago (The Magus)",
                  imageUrl: "/api/tarot-image/01 - Magus.png",
                  imageFile: "01 - Magus.png",
                  x: 46,
                  y: 35,
                  rotation: 0,
                  isFlipped: true,
                  notes: "Canalização e articulação dos poderes elementares",
                },
                {
                  position: "3. Síntese / Resolução",
                  cardId: "atu_2",
                  cardName: "II. A Sacerdotisa (The Priestess)",
                  imageUrl: "/api/tarot-image/02 - Sacerdotisa.png",
                  imageFile: "02 - Sacerdotisa.png",
                  x: 70,
                  y: 35,
                  rotation: 0,
                  isFlipped: true,
                  notes: "Conexão com a intuição e a sabedoria velada",
                },
              ],
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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-medium-900 text-medium-100 antialiased font-sans">
      {/* 1. Left Sidebar (Obsidian Tree Navigator) */}
      <div
        className={`transition-all duration-300 ease-in-out flex-shrink-0 ${
          isZenMode ? "-ml-72 opacity-0 pointer-events-none w-0 overflow-hidden" : "w-72"
        }`}
      >
        <Sidebar
          entries={entries}
          selectedEntryId={selectedEntryId}
          onSelectEntry={(entry) => setSelectedEntryId(entry.id)}
          onNewEntry={handleNewNote}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </div>

      {/* 2. Center Reading & Editing Canvas (Medium Style) */}
      <main className="flex-1 h-full min-w-0 bg-medium-900 overflow-hidden flex flex-col transition-all duration-300">
        <ArticleView
          entry={selectedEntry}
          onUpdateEntry={handleUpdateEntry}
          onDeleteEntry={handleDeleteEntry}
          allEntries={entries}
          onSelectEntry={(entry) => setSelectedEntryId(entry.id)}
          onNewNote={handleNewNote}
          isZenMode={isZenMode}
          onToggleZenMode={() => setIsZenMode((prev) => !prev)}
        />
      </main>

      {/* 3. Right Sidebar (Frater Auxiliar + Mini Grafo) */}
      <div
        className={`transition-all duration-300 ease-in-out flex-shrink-0 ${
          isZenMode ? "-mr-80 md:-mr-88 opacity-0 pointer-events-none w-0 overflow-hidden" : "w-80 md:w-88"
        }`}
      >
        <RightSidebar
          currentEntry={selectedEntry}
          allEntries={entries}
          onSelectEntry={(entry) => setSelectedEntryId(entry.id)}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        entries={entries}
      />
    </div>
  );
}
