"use client";

import React, { useState, useMemo } from "react";
import { MagickEntry, normalizeCategory } from "@/lib/types";
import { ZodiacIcon } from "@/components/ThelemicIcons";
import {
  Star,
  Award,
  ArrowUpDown,
  Sparkles,
  ArrowLeft,
  Search,
  Layers,
  Flame,
} from "lucide-react";
import { MagicHeatmap } from "@/components/MagicHeatmap";
import { LiberReshWidget } from "@/components/LiberReshWidget";
import { formatDateTimeBR, formatDateBR, getInfluenceCategoryLabel } from "@/lib/dateUtils";
import { analyzeDreamTotemsAcrossEntries } from "@/lib/dreamAnalytics";
import {
  computeCrossMatrix2D,
  detectSynchronicityThreads,
  CROSS_DIMENSIONS,
  CrossDimensionId,
  CrossMatrixCell,
} from "@/lib/crossAnalytics";

interface DashboardViewProps {
  entries: MagickEntry[];
  onSelectEntry: (entry: MagickEntry) => void;
  onBackToHome: () => void;
}

type SortMode = "recurrent" | "success";
type PeriodMode = "all" | "30" | "90";
type DashboardTab = "matrix" | "sync" | "metrics";

export function DashboardView({
  entries,
  onSelectEntry,
  onBackToHome,
}: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("matrix");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortMode, setSortMode] = useState<SortMode>("recurrent");
  const [periodMode, setPeriodMode] = useState<PeriodMode>("all");
  const [influenceCategory, setInfluenceCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [matrixRowDim, setMatrixRowDim] = useState<CrossDimensionId>("entity_orixa");
  const [matrixColDim, setMatrixColDim] = useState<CrossDimensionId>("moon_phase");
  const [selectedMatrixCell, setSelectedMatrixCell] = useState<CrossMatrixCell | null>(null);

  // Filter entries by period and category
  const filteredEntries = useMemo(() => {
    let result = [...entries];

    if (periodMode !== "all") {
      const days = periodMode === "30" ? 30 : 90;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter((e) => new Date(e.date) >= cutoff);
    }

    if (selectedCategory !== "all") {
      result = result.filter((e) => normalizeCategory(e.type) === selectedCategory);
    }

    return result;
  }, [entries, selectedCategory, periodMode]);

  // Aggregate Influences
  const influencesAnalysis = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        category: string;
        count: number;
        totalRating: number;
        entries: MagickEntry[];
      }
    >();

    for (const e of filteredEntries) {
      if (!e.influences) continue;
      const rating = e.success_rating !== undefined && e.success_rating !== null ? e.success_rating : 5;

      for (const inf of e.influences) {
        if (!inf.name.trim()) continue;
        const key = `${inf.category}:::${inf.name.trim().toLowerCase()}`;
        const existing = map.get(key) || {
          name: inf.name.trim(),
          category: inf.category,
          count: 0,
          totalRating: 0,
          entries: [],
        };

        existing.count += 1;
        existing.totalRating += rating;
        existing.entries.push(e);
        map.set(key, existing);
      }
    }

    let list = Array.from(map.values()).map((item) => ({
      ...item,
      avgRating: Number((item.totalRating / item.count).toFixed(1)),
    }));

    if (influenceCategory !== "all") {
      list = list.filter((i) => {
        const cat = i.category.toLowerCase();
        const target = influenceCategory.toLowerCase();
        if (target === "orixa")
          return cat === "orixa" || cat === "guia" || cat === "ponto_forca" || cat === "banho_defumacao";
        if (target === "entity") return cat === "entity" || cat === "deity" || cat === "angel";
        if (target === "color") return cat === "color" || cat === "candle";
        if (target === "instrument") return cat === "instrument" || cat === "tool";
        return cat === target;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          getInfluenceCategoryLabel(i.category).toLowerCase().includes(q)
      );
    }

    if (sortMode === "recurrent") {
      list.sort((a, b) => b.count - a.count || b.avgRating - a.avgRating);
    } else {
      list.sort((a, b) => b.avgRating - a.avgRating || b.count - a.count);
    }

    return list;
  }, [filteredEntries, sortMode, influenceCategory, searchQuery]);

  // Moon Sign Success Correlations
  const moonSignStats = useMemo(() => {
    const map = new Map<string, { count: number; totalRating: number }>();
    for (const e of filteredEntries) {
      if (!e.moon_sign) continue;
      const sign = e.moon_sign.trim();
      const rating = e.success_rating !== undefined && e.success_rating !== null ? e.success_rating : 5;
      const cur = map.get(sign) || { count: 0, totalRating: 0 };
      cur.count += 1;
      cur.totalRating += rating;
      map.set(sign, cur);
    }

    return Array.from(map.entries())
      .map(([sign, data]) => ({
        sign,
        count: data.count,
        avgRating: Number((data.totalRating / data.count).toFixed(1)),
      }))
      .sort((a, b) => (sortMode === "recurrent" ? b.count - a.count : b.avgRating - a.avgRating));
  }, [filteredEntries, sortMode]);

  // Moon Phase Success Correlations
  const moonPhaseStats = useMemo(() => {
    const map = new Map<string, { count: number; totalRating: number }>();
    for (const e of filteredEntries) {
      if (!e.moon_phase) continue;
      const phase = e.moon_phase.trim();
      const rating = e.success_rating !== undefined && e.success_rating !== null ? e.success_rating : 5;
      const cur = map.get(phase) || { count: 0, totalRating: 0 };
      cur.count += 1;
      cur.totalRating += rating;
      map.set(phase, cur);
    }

    return Array.from(map.entries())
      .map(([phase, data]) => ({
        phase,
        count: data.count,
        avgRating: Number((data.totalRating / data.count).toFixed(1)),
      }))
      .sort((a, b) => (sortMode === "recurrent" ? b.count - a.count : b.avgRating - a.avgRating));
  }, [filteredEntries, sortMode]);

  // Planetary Day Success Correlations
  const planetaryDayStats = useMemo(() => {
    const map = new Map<string, { count: number; totalRating: number }>();
    for (const e of filteredEntries) {
      if (!e.planetary_day) continue;
      const day = e.planetary_day.trim();
      const rating = e.success_rating !== undefined && e.success_rating !== null ? e.success_rating : 5;
      const cur = map.get(day) || { count: 0, totalRating: 0 };
      cur.count += 1;
      cur.totalRating += rating;
      map.set(day, cur);
    }

    return Array.from(map.entries())
      .map(([day, data]) => ({
        day,
        count: data.count,
        avgRating: Number((data.totalRating / data.count).toFixed(1)),
      }))
      .sort((a, b) => (sortMode === "recurrent" ? b.count - a.count : b.avgRating - a.avgRating));
  }, [filteredEntries, sortMode]);

  // General KPIs
  const kpis = useMemo(() => {
    let totalScore = 0;
    let scoreCount = 0;

    for (const e of filteredEntries) {
      if (e.success_rating !== undefined && e.success_rating !== null && e.success_rating > 0) {
        totalScore += e.success_rating;
        scoreCount += 1;
      }
    }

    const avgScore = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : "—";
    const bestInfluence = influencesAnalysis.length > 0 ? influencesAnalysis[0] : null;
    const bestMoonSign = moonSignStats.length > 0 ? moonSignStats[0] : null;

    return {
      total: filteredEntries.length,
      avgScore,
      bestInfluence,
      bestMoonSign,
    };
  }, [filteredEntries, influencesAnalysis, moonSignStats]);

  // Top successful entries
  const topEntries = useMemo(() => {
    return [...filteredEntries]
      .filter((e) => e.success_rating !== undefined && e.success_rating !== null)
      .sort((a, b) => (b.success_rating || 0) - (a.success_rating || 0))
      .slice(0, 5);
  }, [filteredEntries]);

  // Pentagrama de Equilíbrio Elemental
  const elementalRadar = useMemo(() => {
    const counts = {
      Espirito: 1,
      Ar: 1,
      Fogo: 1,
      Agua: 1,
      Terra: 1,
    };

    for (const e of filteredEntries) {
      const cat = normalizeCategory(e.type);
      if (cat === "Oráculo" || cat === "Visão Astral") counts.Espirito += 1;
      if (cat === "Estudo") counts.Ar += 1;
      if (cat === "Prática") counts.Fogo += 1;
      if (cat === "Sonho") counts.Agua += 1;
      if (cat === "Diário") counts.Terra += 1;

      for (const inf of e.influences || []) {
        const val = `${inf.category} ${inf.name}`.toLowerCase();
        if (val.includes("fogo") || val.includes("marte") || val.includes("sol") || val.includes("xangô") || val.includes("ogum") || val.includes("exu")) {
          counts.Fogo += 2;
        }
        if (val.includes("água") || val.includes("agua") || val.includes("lua") || val.includes("oxum") || val.includes("iemanjá") || val.includes("nanã")) {
          counts.Agua += 2;
        }
        if (val.includes("ar") || val.includes("mercúrio") || val.includes("oyá") || val.includes("iansã") || val.includes("espada")) {
          counts.Ar += 2;
        }
        if (val.includes("terra") || val.includes("saturno") || val.includes("oxóssi") || val.includes("omolu") || val.includes("caboclo") || val.includes("jurema")) {
          counts.Terra += 2;
        }
        if (val.includes("espírito") || val.includes("kether") || val.includes("oxalá") || val.includes("akasha")) {
          counts.Espirito += 2;
        }
      }
    }

    const maxVal = Math.max(counts.Espirito, counts.Ar, counts.Fogo, counts.Agua, counts.Terra, 1);
    const axes = [
      { key: "Espirito", label: "🁢 Espírito (Akasha / Oxalá)", value: counts.Espirito, angle: -90 },
      { key: "Ar", label: "🜁 Ar (Intelecto / Oyá)", value: counts.Ar, angle: -18 },
      { key: "Fogo", label: "🜂 Fogo (Vontade / Ogum & Xangô)", value: counts.Fogo, angle: 54 },
      { key: "Agua", label: "🜄 Água (Astral / Iemanjá & Oxum)", value: counts.Agua, angle: 126 },
      { key: "Terra", label: "🜃 Terra (Reino / Oxóssi & Omolu)", value: counts.Terra, angle: 198 },
    ];

    const sorted = [...axes].sort((a, b) => b.value - a.value);
    return {
      axes,
      maxVal,
      dominant: sorted[0],
      deficient: sorted[sorted.length - 1],
    };
  }, [filteredEntries]);

  // Análise Onironáutica
  const dreamAnalysis = useMemo(() => {
    return analyzeDreamTotemsAcrossEntries(filteredEntries);
  }, [filteredEntries]);

  // Matriz de Cruzamento Bidimensional 2D
  const crossMatrix = useMemo(() => {
    return computeCrossMatrix2D(filteredEntries, matrixRowDim, matrixColDim);
  }, [filteredEntries, matrixRowDim, matrixColDim]);

  // Detector de Fios de Sincronicidade
  const syncThreads = useMemo(() => {
    return detectSynchronicityThreads(filteredEntries);
  }, [filteredEntries]);

  // Padrão de Ouro Empírico
  const goldenPattern = useMemo(() => {
    const sortedMoonSigns = [...moonSignStats].sort((a, b) => b.avgRating - a.avgRating);
    const sortedMoonPhases = [...moonPhaseStats].sort((a, b) => b.avgRating - a.avgRating);
    const sortedPlanetaryDays = [...planetaryDayStats].sort((a, b) => b.avgRating - a.avgRating);
    const bestOverallInf = [...influencesAnalysis].sort((a, b) => b.avgRating - a.avgRating)[0] || null;

    return {
      bestSign: sortedMoonSigns[0] || null,
      bestPhase: sortedMoonPhases[0] || null,
      bestDay: sortedPlanetaryDays[0] || null,
      bestOverallInf,
    };
  }, [moonSignStats, moonPhaseStats, planetaryDayStats, influencesAnalysis]);

  return (
    <div className="flex-1 h-full bg-medium-900 overflow-y-auto select-text">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* ========================================================
            1. HEADER MINIMALISTA
            ======================================================== */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-medium-800 pb-6">
          <div>
            <button
              type="button"
              onClick={onBackToHome}
              className="flex items-center gap-1.5 text-xs font-mono text-medium-400 hover:text-white transition-colors mb-3"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Início</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-white tracking-tight">
              Cruzamento de Dados & Métricas
            </h1>
            <p className="text-xs text-medium-400 mt-1">
              Investigue padrões de eficácia, sincronicidades e recorrências no seu diário.
            </p>
          </div>

          {/* KPI Compacto */}
          <div className="flex items-center gap-4 text-xs font-mono text-medium-400">
            <div>
              <span className="block text-[10px] uppercase">Registros</span>
              <strong className="text-base text-white">{kpis.total}</strong>
            </div>
            <div className="h-6 w-px bg-medium-800" />
            <div>
              <span className="block text-[10px] uppercase">Média Geral</span>
              <strong className="text-base text-white">{kpis.avgScore}/10</strong>
            </div>
          </div>
        </header>

        {/* ========================================================
            2. BARRA DE ABAS MINIMALISTA (3 VISÕES LIMPAS)
            ======================================================== */}
        <div className="flex items-center justify-between border-b border-medium-800">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab("matrix")}
              className={`pb-3 text-xs font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                activeTab === "matrix"
                  ? "border-white text-white"
                  : "border-transparent text-medium-400 hover:text-medium-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cruzamento 2D</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("sync")}
              className={`pb-3 text-xs font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                activeTab === "sync"
                  ? "border-white text-white"
                  : "border-transparent text-medium-400 hover:text-medium-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sincronicidades & Sonhos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("metrics")}
              className={`pb-3 text-xs font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                activeTab === "metrics"
                  ? "border-white text-white"
                  : "border-transparent text-medium-400 hover:text-medium-200"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Frequência & Eficácia</span>
            </button>
          </div>

          {/* Seletor de Período */}
          <div className="hidden sm:flex items-center gap-1 pb-2 text-xs font-mono">
            {(
              [
                { id: "all", label: "Tudo" },
                { id: "90", label: "90d" },
                { id: "30", label: "30d" },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriodMode(p.id)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  periodMode === p.id
                    ? "bg-medium-800 text-white font-medium"
                    : "text-medium-400 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================
            ABA 1: CRUZAMENTO MULTIDIMENSIONAL 2D & SÍNTESE
            ======================================================== */}
        {activeTab === "matrix" && (
          <div className="space-y-6">
            {/* Síntese em 1 Card Sereno */}
            {filteredEntries.length > 0 && (
              <div className="p-5 rounded-xl bg-medium-850 border border-medium-800 space-y-4">
                <div className="text-xs font-mono uppercase tracking-wider text-medium-400">
                  Síntese Empírica Pessoal
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-[11px] text-medium-400 block">Signo Lunar Ideal</span>
                    <strong className="text-sm text-white font-medium">
                      {goldenPattern.bestSign ? `${goldenPattern.bestSign.sign} (${goldenPattern.bestSign.avgRating}★)` : "—"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-medium-400 block">Fase Lunar</span>
                    <strong className="text-sm text-white font-medium">
                      {goldenPattern.bestPhase ? `${goldenPattern.bestPhase.phase} (${goldenPattern.bestPhase.avgRating}★)` : "—"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-medium-400 block">Dia Planetário</span>
                    <strong className="text-sm text-white font-medium">
                      {goldenPattern.bestDay ? `${goldenPattern.bestDay.day} (${goldenPattern.bestDay.avgRating}★)` : "—"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-medium-400 block">Força Principal</span>
                    <strong className="text-sm text-white font-medium truncate block">
                      {goldenPattern.bestOverallInf
                        ? `${goldenPattern.bestOverallInf.name} (${goldenPattern.bestOverallInf.avgRating}★)`
                        : "—"}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Matriz de Cruzamento 2D */}
            <div className="p-5 rounded-xl bg-medium-850 border border-medium-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-medium text-white">
                    Matriz de Cruzamento Bidimensional (2D)
                  </h2>
                  <p className="text-xs text-medium-400 mt-0.5">
                    Cruze duas dimensões e clique em qualquer célula para inspecionar as notas correspondentes.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-medium-400 mb-1">
                    Eixo Vertical (Linhas)
                  </label>
                  <select
                    value={matrixRowDim}
                    onChange={(e) => {
                      setMatrixRowDim(e.target.value as CrossDimensionId);
                      setSelectedMatrixCell(null);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-medium-900 border border-medium-800 text-xs text-white focus:outline-none focus:border-medium-600"
                  >
                    {CROSS_DIMENSIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-medium-400 mb-1">
                    Eixo Horizontal (Colunas)
                  </label>
                  <select
                    value={matrixColDim}
                    onChange={(e) => {
                      setMatrixColDim(e.target.value as CrossDimensionId);
                      setSelectedMatrixCell(null);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-medium-900 border border-medium-800 text-xs text-white focus:outline-none focus:border-medium-600"
                  >
                    {CROSS_DIMENSIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {crossMatrix.rows.length === 0 || crossMatrix.cols.length === 0 ? (
                <div className="p-6 text-center text-xs text-medium-400 bg-medium-900/50 rounded-lg border border-medium-800">
                  Registre mais notas para visualizar o cruzamento entre estas dimensões.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-medium-800 bg-medium-900">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-medium-800">
                        <th className="p-2.5 font-mono text-[10px] uppercase text-medium-400 sticky left-0 bg-medium-900 z-10 min-w-[130px]">
                          {CROSS_DIMENSIONS.find((d) => d.id === matrixRowDim)?.shortLabel} \{" "}
                          {CROSS_DIMENSIONS.find((d) => d.id === matrixColDim)?.shortLabel}
                        </th>
                        {crossMatrix.cols.map((col) => (
                          <th
                            key={col}
                            className="p-2.5 font-mono text-[10px] text-center text-medium-300 font-medium min-w-[84px]"
                          >
                            <span className="line-clamp-2">{col}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-medium-800">
                      {crossMatrix.rows.map((row) => (
                        <tr key={row}>
                          <td className="p-2.5 font-medium text-white sticky left-0 bg-medium-900 z-10 border-r border-medium-800 max-w-[160px] truncate">
                            {row}
                          </td>
                          {crossMatrix.cols.map((col) => {
                            const cell = crossMatrix.cells[row]?.[col];
                            const count = cell?.count || 0;
                            const avg = cell?.avgRating || 0;
                            const isSelected =
                              selectedMatrixCell?.rowKey === row && selectedMatrixCell?.colKey === col;

                            if (count === 0) {
                              return (
                                <td key={col} className="p-2 text-center text-medium-500 font-mono text-[10px]">
                                  —
                                </td>
                              );
                            }

                            return (
                              <td key={col} className="p-1.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => setSelectedMatrixCell(cell)}
                                  className={`w-full py-1.5 px-2 rounded-md border transition-all flex flex-col items-center justify-center ${
                                    isSelected
                                      ? "bg-white text-black border-white font-semibold"
                                      : "bg-medium-850 hover:bg-medium-800 border-medium-800 text-white"
                                  }`}
                                >
                                  <span className="font-semibold text-xs">{count}x</span>
                                  {avg > 0 && (
                                    <span className="text-[9px] font-mono opacity-75">{avg}★</span>
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedMatrixCell && (
                <div className="p-4 rounded-lg bg-medium-900 border border-medium-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-white">
                      {selectedMatrixCell.rowKey} × {selectedMatrixCell.colKey} ({selectedMatrixCell.count}{" "}
                      {selectedMatrixCell.count === 1 ? "nota" : "notas"})
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedMatrixCell(null)}
                      className="text-[11px] text-medium-400 hover:text-white"
                    >
                      Fechar ✕
                    </button>
                  </div>
                  <div className="divide-y divide-medium-800">
                    {selectedMatrixCell.entries.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => onSelectEntry(entry)}
                        className="w-full text-left py-2 flex items-center justify-between gap-2 hover:opacity-80 transition-opacity"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-white truncate">{entry.title}</div>
                          <div className="text-[10px] text-medium-400 font-mono">
                            {normalizeCategory(entry.type)} · {formatDateBR(entry.date)}
                          </div>
                        </div>
                        {entry.success_rating ? (
                          <span className="text-[10px] font-mono text-medium-300 shrink-0">
                            {entry.success_rating}/10
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 2: SINCRONICIDADES, SONHOS & EQUILÍBRIO ELEMENTAL
            ======================================================== */}
        {activeTab === "sync" && (
          <div className="space-y-6">
            {/* Fios de Sincronicidade */}
            <div className="p-5 rounded-xl bg-medium-850 border border-medium-800 space-y-4">
              <div>
                <h2 className="text-sm font-medium text-white">
                  Fios de Sincronicidade (Oráculo ↔ Sonho ↔ Prática)
                </h2>
                <p className="text-xs text-medium-400 mt-0.5">
                  Convergências automáticas onde o mesmo símbolo atravessou diferentes categorias de notas.
                </p>
              </div>

              {syncThreads.length === 0 ? (
                <p className="text-xs text-medium-400 py-4">
                  Conforme você registrar Oráculos, Sonhos e Práticas, os elos simbólicos aparecerão aqui.
                </p>
              ) : (
                <div className="divide-y divide-medium-800">
                  {syncThreads.map((thread) => (
                    <div key={thread.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span>{thread.icon}</span>
                          <span className="text-xs font-medium text-white">{thread.symbolTitle}</span>
                          <span className="text-[10px] font-mono text-medium-400">
                            ({thread.categoriesInvolved.join(" · ")})
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-medium-400">
                          {thread.entries.length} notas
                        </span>
                      </div>
                      <p className="text-xs text-medium-300 leading-relaxed">{thread.explanationPt}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {thread.entries.slice(0, 4).map((e) => (
                          <button
                            key={e.id}
                            type="button"
                            onClick={() => onSelectEntry(e)}
                            className="text-[10px] px-2 py-1 rounded bg-medium-900 hover:bg-medium-800 border border-medium-800 text-medium-300 hover:text-white transition-colors font-mono"
                          >
                            {formatDateBR(e.date)} · {e.title.slice(0, 24)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Grid: Equilíbrio Elemental & Totens Oníricos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-medium-850 border border-medium-800 space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-medium-400">
                  Equilíbrio Elemental (5 Pontas)
                </h3>
                <div className="space-y-2.5 text-xs font-mono">
                  {elementalRadar.axes.map((ax) => (
                    <div key={ax.key} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-medium-200">{ax.label}</span>
                        <span className="text-white">{ax.value} pts</span>
                      </div>
                      <div className="w-full h-1.5 bg-medium-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full"
                          style={{ width: `${Math.round((ax.value / elementalRadar.maxVal) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-xl bg-medium-850 border border-medium-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-medium-400">
                    Totens de Sonhos (Yesod)
                  </h3>
                  <span className="text-[10px] font-mono text-medium-400">
                    {dreamAnalysis.dreamNotesCount} sonhos
                  </span>
                </div>
                {dreamAnalysis.totems.length === 0 ? (
                  <p className="text-xs text-medium-400 py-4">
                    Registre sonhos para mapear automaticamente seus símbolos recorrentes.
                  </p>
                ) : (
                  <div className="divide-y divide-medium-800">
                    {dreamAnalysis.totems.slice(0, 5).map((totem) => (
                      <div key={totem.id} className="py-2 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-medium text-white">
                            {totem.icon} {totem.name}
                          </div>
                          <div className="text-[10px] text-medium-400">{totem.meaning777}</div>
                        </div>
                        <span className="text-xs font-mono text-white">{totem.count}x</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 3: FREQUÊNCIA, INFLUÊNCIAS & CORRELAÇÕES ASTRAIS
            ======================================================== */}
        {activeTab === "metrics" && (
          <div className="space-y-6">
            <LiberReshWidget />
            <MagicHeatmap
              entries={entries}
              onSelectDate={(dateStr) => {
                setSearchQuery(dateStr);
              }}
            />

            {/* Filtros de Influências */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSortMode("recurrent")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    sortMode === "recurrent"
                      ? "bg-white text-black"
                      : "bg-medium-850 text-medium-300 hover:text-white border border-medium-800"
                  }`}
                >
                  Mais Frequentes
                </button>
                <button
                  type="button"
                  onClick={() => setSortMode("success")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    sortMode === "success"
                      ? "bg-white text-black"
                      : "bg-medium-850 text-medium-300 hover:text-white border border-medium-800"
                  }`}
                >
                  Maior Sucesso
                </button>
              </div>

              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-medium-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filtrar influência..."
                  className="w-full bg-medium-850 border border-medium-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-medium-400 focus:outline-none focus:border-medium-600"
                />
              </div>
            </div>

            {/* Lista de Influências */}
            {influencesAnalysis.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {influencesAnalysis.slice(0, 12).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => item.entries[0] && onSelectEntry(item.entries[0])}
                    className="text-left bg-medium-850 p-3.5 rounded-xl border border-medium-800 hover:border-medium-600 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-medium-400">
                        {getInfluenceCategoryLabel(item.category)}
                      </span>
                      <span className="text-xs font-mono text-white font-medium">
                        {item.avgRating}★ · {item.count}x
                      </span>
                    </div>
                    <div className="text-sm font-medium text-white truncate">{item.name}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Top Notas */}
            {topEntries.length > 0 && (
              <div className="p-5 rounded-xl bg-medium-850 border border-medium-800 space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-medium-400">
                  Operações de Maior Eficácia
                </h3>
                <div className="divide-y divide-medium-800">
                  {topEntries.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => onSelectEntry(e)}
                      className="w-full text-left py-2.5 flex items-center justify-between gap-3 hover:opacity-80 transition-opacity"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white truncate">{e.title}</div>
                        <div className="text-[10px] font-mono text-medium-400">
                          {normalizeCategory(e.type)} · {formatDateTimeBR(e.date)}
                        </div>
                      </div>
                      <span className="text-xs font-mono text-white shrink-0">
                        {e.success_rating}/10
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
