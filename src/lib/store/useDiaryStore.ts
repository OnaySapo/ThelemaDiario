"use client";

import { create } from "zustand";
import { MagickEntry, CategoryName, normalizeCategory } from "@/lib/types";
import { getDefaultTemplateForCategory } from "@/lib/templates";

export type ViewMode = "home" | "article" | "dashboard" | "tree";

interface DiaryState {
  // Dados
  entries: MagickEntry[];
  selectedEntryId: string | null;
  autoEditEntryId: string | null;
  loading: boolean;
  error: string | null;

  // Navegação e Filtros
  viewMode: ViewMode;
  selectedCategory: string;
  searchQuery: string;
  isZenMode: boolean;

  // Modais
  isSettingsOpen: boolean;
  isTimerModalOpen: boolean;
  isAltarModalOpen: boolean;
  isSpotlightOpen: boolean;
  isQuickDreamOpen: boolean;
  isGrimoireOpen: boolean;
  isGraphModalOpen: boolean;
  isGematriaModalOpen: boolean;

  // Setters diretos
  setEntries: (entries: MagickEntry[]) => void;
  setSelectedEntryId: (id: string | null) => void;
  setAutoEditEntryId: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  setIsZenMode: (zen: boolean) => void;
  toggleZenMode: () => void;

  // Modais setters
  setIsSettingsOpen: (open: boolean) => void;
  setIsTimerModalOpen: (open: boolean) => void;
  setIsAltarModalOpen: (open: boolean) => void;
  setIsSpotlightOpen: (open: boolean) => void;
  setIsQuickDreamOpen: (open: boolean) => void;
  setIsGrimoireOpen: (open: boolean) => void;
  setIsGraphModalOpen: (open: boolean) => void;
  setIsGematriaModalOpen: (open: boolean) => void;

  // Ações Assíncronas Integradas
  loadEntries: (selectId?: string) => Promise<void>;
  createNote: (
    prefilledCategory?: CategoryName,
    prefilledContent?: string,
    prefilledTitle?: string,
    prefilledInfluences?: { category: string; name: string }[]
  ) => Promise<MagickEntry | null>;
  updateNote: (updated: Partial<MagickEntry>) => Promise<MagickEntry | null>;
  deleteNote: (id: string) => Promise<boolean>;
}

export const useDiaryStore = create<DiaryState>((set, get) => ({
  entries: [],
  selectedEntryId: null,
  autoEditEntryId: null,
  loading: false,
  error: null,

  viewMode: "home",
  selectedCategory: "all",
  searchQuery: "",
  isZenMode: false,

  isSettingsOpen: false,
  isTimerModalOpen: false,
  isAltarModalOpen: false,
  isSpotlightOpen: false,
  isQuickDreamOpen: false,
  isGrimoireOpen: false,
  isGraphModalOpen: false,
  isGematriaModalOpen: false,

  setEntries: (entries) => set({ entries }),
  setSelectedEntryId: (selectedEntryId) => set({ selectedEntryId }),
  setAutoEditEntryId: (autoEditEntryId) => set({ autoEditEntryId }),
  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setIsZenMode: (isZenMode) => set({ isZenMode }),
  toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),

  setIsSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
  setIsTimerModalOpen: (isTimerModalOpen) => set({ isTimerModalOpen }),
  setIsAltarModalOpen: (isAltarModalOpen) => set({ isAltarModalOpen }),
  setIsSpotlightOpen: (isSpotlightOpen) => set({ isSpotlightOpen }),
  setIsQuickDreamOpen: (isQuickDreamOpen) => set({ isQuickDreamOpen }),
  setIsGrimoireOpen: (isGrimoireOpen) => set({ isGrimoireOpen }),
  setIsGraphModalOpen: (isGraphModalOpen) => set({ isGraphModalOpen }),
  setIsGematriaModalOpen: (isGematriaModalOpen) => set({ isGematriaModalOpen }),

  loadEntries: async (selectId?: string) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch("/api/entries");
      const data = await res.json();
      if (data.success) {
        const loaded: MagickEntry[] = data.entries || [];
        set((state) => {
          let nextSelected = state.selectedEntryId;
          if (selectId) {
            nextSelected = selectId;
          } else if (!nextSelected || !loaded.some((e) => e.id === nextSelected)) {
            nextSelected = loaded.length > 0 ? loaded[0].id : null;
          }
          return {
            entries: loaded,
            selectedEntryId: nextSelected,
            loading: false,
          };
        });
      } else {
        set({ error: data.error || "Falha ao carregar notas", loading: false });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createNote: async (
    prefilledCategory?: CategoryName,
    prefilledContent?: string,
    prefilledTitle?: string,
    prefilledInfluences?: { category: string; name: string }[]
  ) => {
    try {
      let astro: any = { success: false };
      try {
        const astroRes = await fetch("/api/astronomy");
        astro = await astroRes.json();
      } catch (e) {}

      const state = get();
      const targetCategory =
        prefilledCategory ||
        ((state.selectedCategory !== "all"
          ? normalizeCategory(state.selectedCategory)
          : "Prática") as CategoryName);

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
        influences: prefilledInfluences || [],
        connections: [],
        oracle_data: defaultOracleData,
      };

      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDraft),
      });
      const data = await res.json();
      if (data.success && data.entry) {
        const created: MagickEntry = data.entry;
        set((prev) => ({
          entries: [created, ...prev.entries.filter((e) => e.id !== created.id)],
          selectedEntryId: created.id,
          autoEditEntryId: created.id,
          viewMode: "article",
          selectedCategory: "all",
          searchQuery: "",
        }));
        return created;
      }
      return null;
    } catch (err) {
      console.error("Erro ao criar nova nota:", err);
      return null;
    }
  },

  updateNote: async (updated: Partial<MagickEntry>) => {
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success && data.entry) {
        const saved: MagickEntry = data.entry;
        set((prev) => ({
          entries: prev.entries.map((item) => (item.id === saved.id ? saved : item)),
        }));
        return saved;
      }
      return null;
    } catch (err) {
      console.error("Erro ao atualizar nota:", err);
      return null;
    }
  },

  deleteNote: async (id: string) => {
    try {
      const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        set((prev) => {
          const remaining = prev.entries.filter((e) => e.id !== id);
          const nextSelected =
            prev.selectedEntryId === id
              ? remaining.length > 0
                ? remaining[0].id
                : null
              : prev.selectedEntryId;
          return {
            entries: remaining,
            selectedEntryId: nextSelected,
          };
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Erro ao excluir nota:", err);
      return false;
    }
  },
}));
