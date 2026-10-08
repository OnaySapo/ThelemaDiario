"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { EntryCard } from "@/components/EntryCard";
import { EntryEditorModal } from "@/components/EntryEditorModal";
import { GraphView } from "@/components/GraphView";
import { InsightsView } from "@/components/InsightsView";
import { ChatDrawer } from "@/components/ChatDrawer";
import { SettingsModal } from "@/components/SettingsModal";
import { MagickEntry } from "@/lib/types";
import {
  Search,
  Filter,
  Sword,
  Sparkles,
  Moon,
  Eye,
  BookOpen,
  Plus,
  SlidersHorizontal,
  Flame,
  ArrowUpDown,
} from "lucide-react";

export default function Home() {
  const [entries, setEntries] = useState<MagickEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<"timeline" | "graph" | "insights">("timeline");

  // Filters & Search
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "rating_desc">("date_desc");

  // Modals & Drawers
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MagickEntry | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Fetch entries
  const loadEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/entries");
      const data = await res.json();
      if (data.success) {
        setEntries(data.entries);
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

  // Save or Update Entry
  const handleSaveEntry = async (entryData: Partial<MagickEntry>) => {
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryData),
      });
      const data = await res.json();
      if (data.success) {
        await loadEntries();
      } else {
        alert("Erro ao salvar entrada: " + data.error);
      }
    } catch (err: any) {
      alert("Falha na comunicação: " + err.message);
    }
  };

  // Delete Entry
  const handleDeleteEntry = async (id: string) => {
    try {
      const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      alert("Erro ao excluir entrada.");
    }
  };

  // Filtered & Sorted Entries
  const filteredEntries = useMemo(() => {
    return entries
      .filter((e) => {
        if (typeFilter !== "all" && e.type !== typeFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesTitle = e.title.toLowerCase().includes(q);
          const matchesContent = e.content.toLowerCase().includes(q);
          const matchesTags = e.tags?.some((t) => t.toLowerCase().includes(q));
          const matchesInfluences = e.influences?.some((i) => i.name.toLowerCase().includes(q));
          const matchesThelemic = e.thelemic_date?.toLowerCase().includes(q);
          return matchesTitle || matchesContent || matchesTags || matchesInfluences || matchesThelemic;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "rating_desc") {
          return (b.success_rating || 0) - (a.success_rating || 0);
        }
        if (sortBy === "date_asc") {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        // date_desc
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [entries, typeFilter, search, sortBy]);

  // Counts by Type
  const counts = useMemo(() => {
    return {
      all: entries.length,
      ritual: entries.filter((e) => e.type === "ritual").length,
      oracle: entries.filter((e) => e.type === "oracle").length,
      dream: entries.filter((e) => e.type === "dream").length,
      vision: entries.filter((e) => e.type === "vision").length,
      study: entries.filter((e) => e.type === "study").length,
    };
  }, [entries]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-forest-900 text-parchment-200">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onNewEntry={() => {
          setEditingEntry(null);
          setIsEditorOpen(true);
        }}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {currentTab === "timeline" && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="bg-forest-850 p-4 rounded-2xl border border-forest-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-parchment-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar notas, entidades, rituais..."
                  className="w-full bg-forest-900 border border-forest-750 rounded-xl pl-9 pr-3.5 py-2 text-xs text-parchment-100 placeholder-parchment-500 focus:outline-none focus:border-moss-500"
                />
              </div>

              {/* Type Category Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar">
                {[
                  { id: "all", label: "Todas", count: counts.all },
                  { id: "ritual", label: "Rituais", icon: <Sword className="w-3.5 h-3.5 text-gold-400" />, count: counts.ritual },
                  { id: "oracle", label: "Oráculos", icon: <Sparkles className="w-3.5 h-3.5 text-moss-400" />, count: counts.oracle },
                  { id: "dream", label: "Sonhos", icon: <Moon className="w-3.5 h-3.5 text-twilight-400" />, count: counts.dream },
                  { id: "vision", label: "Visões", icon: <Eye className="w-3.5 h-3.5 text-lunar-400" />, count: counts.vision },
                  { id: "study", label: "Estudos", icon: <BookOpen className="w-3.5 h-3.5 text-amber-500" />, count: counts.study },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTypeFilter(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      typeFilter === item.id
                        ? "bg-forest-750 border border-forest-600 text-parchment-100 shadow-sm"
                        : "text-parchment-300 hover:text-parchment-100 hover:bg-forest-800"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-forest-900 text-parchment-400 font-mono">
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sort Order Selector */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-parchment-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-forest-900 border border-forest-750 rounded-lg px-2.5 py-1.5 text-xs text-parchment-200 focus:outline-none focus:border-moss-500 font-mono"
                >
                  <option value="date_desc">Mais Recentes</option>
                  <option value="date_asc">Mais Antigas</option>
                  <option value="rating_desc">Maior Sucesso (★)</option>
                </select>
              </div>
            </div>

            {/* Entries Grid */}
            {loading ? (
              <div className="p-16 text-center text-xs text-parchment-400 font-mono flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-moss-500 animate-ping"></span>
                Carregando registros do arquivo sagrado...
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="p-16 text-center bg-forest-850/50 rounded-2xl border border-forest-750 border-dashed space-y-3">
                <Sparkles className="w-8 h-8 text-gold-500/60 mx-auto" />
                <h3 className="text-sm font-serif font-bold text-parchment-200">
                  Nenhum registro encontrado para este filtro
                </h3>
                <p className="text-xs text-parchment-400 max-w-sm mx-auto">
                  Inicie a anotação de um novo ritual, tiragem de tarô de Thoth, sonho lúcido ou estudo thelêmico.
                </p>
                <button
                  onClick={() => {
                    setEditingEntry(null);
                    setIsEditorOpen(true);
                  }}
                  className="px-4 py-2 bg-moss-600 hover:bg-moss-500 text-forest-950 font-semibold rounded-lg text-xs transition-all shadow-arcane"
                >
                  Criar Primeiro Registro
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredEntries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onEdit={(e) => {
                      setEditingEntry(e);
                      setIsEditorOpen(true);
                    }}
                    onDelete={handleDeleteEntry}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentTab === "graph" && (
          <GraphView
            entries={entries}
            onSelectEntry={(e) => {
              setEditingEntry(e);
              setIsEditorOpen(true);
            }}
          />
        )}

        {currentTab === "insights" && (
          <InsightsView
            entries={entries}
            onOpenNewEntry={() => {
              setEditingEntry(null);
              setIsEditorOpen(true);
            }}
          />
        )}
      </main>

      {/* Editor Modal */}
      <EntryEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveEntry}
        initialEntry={editingEntry}
        allEntries={entries}
      />

      {/* Frater Auxiliar Chat Drawer */}
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        entries={entries}
      />
    </div>
  );
}
