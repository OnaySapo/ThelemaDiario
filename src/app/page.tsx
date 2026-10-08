"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ArticleView } from "@/components/ArticleView";
import { RightSidebar } from "@/components/RightSidebar";
import { SettingsModal } from "@/components/SettingsModal";
import { MagickEntry, normalizeCategory } from "@/lib/types";

export default function Home() {
  const [entries, setEntries] = useState<MagickEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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

      const newDraft: Partial<MagickEntry> = {
        title: "Nova Operação Mágicka",
        content: "Descreva aqui os detalhes da operação, palavras entoadas, sensações astrais e resultados fenomênicos...",
        type: selectedCategory !== "all" ? selectedCategory : "Prática",
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

      {/* 2. Center Reading & Editing Canvas (Medium Style) */}
      <main className="flex-1 h-full min-w-0 bg-medium-900 overflow-hidden flex flex-col">
        <ArticleView
          entry={selectedEntry}
          onUpdateEntry={handleUpdateEntry}
          onDeleteEntry={handleDeleteEntry}
          allEntries={entries}
          onSelectEntry={(entry) => setSelectedEntryId(entry.id)}
          onNewNote={handleNewNote}
        />
      </main>

      {/* 3. Right Sidebar (Frater Auxiliar + Mini Grafo) */}
      <RightSidebar
        currentEntry={selectedEntry}
        allEntries={entries}
        onSelectEntry={(entry) => setSelectedEntryId(entry.id)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        entries={entries}
      />
    </div>
  );
}
