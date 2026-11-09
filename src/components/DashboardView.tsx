"use client";

import React, { useState, useMemo } from "react";
import { MagickEntry, normalizeCategory, CategoryName } from "@/lib/types";
import { getCategoryThelemicIcon, ZodiacIcon, IconeSolThelema, IconeLuaThelema, EstrelaDeThelema } from "@/components/ThelemicIcons";
import {
  BarChart2,
  TrendingUp,
  Star,
  Award,
  Filter,
  ArrowUpDown,
  Calendar,
  Sparkles,
  ArrowLeft,
  Search,
  Layers,
  Flame,
  CheckCircle,
  Zap,
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

export function DashboardView({
  entries,
  onSelectEntry,
  onBackToHome,
}: DashboardViewProps) {
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

    // Period filter
    if (periodMode !== "all") {
      const days = periodMode === "30" ? 30 : 90;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter((e) => new Date(e.date) >= cutoff);
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((e) => normalizeCategory(e.type) === selectedCategory);
    }

    return result;
  }, [entries, selectedCategory, periodMode]);

  // Aggregate Liber 777 Influences
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

    // Filter by influence category
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

    // Filter by text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          getInfluenceCategoryLabel(i.category).toLowerCase().includes(q)
      );
    }

    // Sort: Recurrent vs Success
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

  // Pentagrama de Equilíbrio Elemental (Espírito, Ar, Fogo, Água, Terra)
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

  // Análise Onironáutica (Totens de Lucidez)
  const dreamAnalysis = useMemo(() => {
    return analyzeDreamTotemsAcrossEntries(filteredEntries);
  }, [filteredEntries]);

  // Matriz de Cruzamento Bidimensional 2D (Heatmap Interativo)
  const crossMatrix = useMemo(() => {
    return computeCrossMatrix2D(filteredEntries, matrixRowDim, matrixColDim);
  }, [filteredEntries, matrixRowDim, matrixColDim]);

  // Detector de Fios de Sincronicidade (Oráculo ↔ Sonho ↔ Prática)
  const syncThreads = useMemo(() => {
    return detectSynchronicityThreads(filteredEntries);
  }, [filteredEntries]);

  // Padrão de Ouro Empírico & Síntese Hermética (Cruzamento Automatizado)
  const goldenPattern = useMemo(() => {
    const sortedMoonSigns = [...moonSignStats].sort((a, b) => b.avgRating - a.avgRating);
    const sortedMoonPhases = [...moonPhaseStats].sort((a, b) => b.avgRating - a.avgRating);
    const sortedPlanetaryDays = [...planetaryDayStats].sort((a, b) => b.avgRating - a.avgRating);

    const sortedEntities = influencesAnalysis
      .filter((i) => i.category.toLowerCase() === "entity")
      .sort((a, b) => b.avgRating - a.avgRating);

    const sortedIncenses = influencesAnalysis
      .filter((i) => i.category.toLowerCase() === "incense")
      .sort((a, b) => b.avgRating - a.avgRating);

    const bestSign = sortedMoonSigns[0] || null;
    const bestPhase = sortedMoonPhases[0] || null;
    const bestDay = sortedPlanetaryDays[0] || null;
    const bestEntity = sortedEntities[0] || null;
    const bestIncense = sortedIncenses[0] || null;
    const bestOverallInf = [...influencesAnalysis].sort((a, b) => b.avgRating - a.avgRating)[0] || null;

    const baseAvg = Number(kpis.avgScore) || 5;
    const peakRating = Math.max(
      bestSign?.avgRating || 0,
      bestPhase?.avgRating || 0,
      bestDay?.avgRating || 0,
      bestOverallInf?.avgRating || 0
    );

    const upliftPercent =
      baseAvg > 0 && peakRating > baseAvg
        ? Math.round(((peakRating - baseAvg) / baseAvg) * 100)
        : null;

    return {
      bestSign,
      bestPhase,
      bestDay,
      bestEntity,
      bestIncense,
      bestOverallInf,
      peakRating,
      upliftPercent,
    };
  }, [moonSignStats, moonPhaseStats, planetaryDayStats, influencesAnalysis, kpis.avgScore]);

  return (
    <div className="flex-1 h-full bg-medium-900 overflow-y-auto p-4 sm:p-8 space-y-8 select-text">
      {/* ========================================================
          1. HEADER & CONTROLES SUPERIORES
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-medium-750 pb-5">
        <div>
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-mono text-medium-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Início (Home)</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Matriz Analítica & Dashboard Hermético
          </h1>
          <p className="text-xs text-medium-400 font-sans mt-1">
            Ciência mágica empírica: investigue quais deidades, incensos, instrumentos e trânsitos lunares maximizam seu êxito.
          </p>
        </div>

        {/* Global KPI Badge */}
        <div className="bg-medium-850 px-4 py-2.5 rounded-xl border border-medium-700 flex items-center gap-3 shrink-0 shadow-sm">
          <Award className="w-5 h-5 text-white" />
          <div>
            <span className="text-[10px] font-mono text-medium-400 block uppercase">
              Média Geral de Sucesso
            </span>
            <span className="text-lg font-mono font-bold text-white flex items-baseline gap-1">
              <span>{kpis.avgScore}</span>
              <span className="text-xs text-medium-400 font-normal">/ 10</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          Padrão de Ouro Empírico & Síntese Hermética
          ======================================================== */}
      {filteredEntries.length > 0 && (
        <section className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-medium-850 to-medium-850 p-6 sm:p-7 shadow-lg relative overflow-hidden space-y-5">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 shadow-sm">
                <EstrelaDeThelema className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Padrão de Ouro Empírico & Síntese Hermética</span>
                  {goldenPattern.upliftPercent !== null && goldenPattern.upliftPercent > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-semibold">
                      +{goldenPattern.upliftPercent}% Eficácia
                    </span>
                  )}
                </h2>
                <p className="text-xs text-medium-400 font-sans mt-0.5">
                  Cruzamento estatístico automatizado dos fatores astrais e materiais de maior confirmação na sua Obra.
                </p>
              </div>
            </div>

            {goldenPattern.peakRating > 0 && (
              <div className="bg-medium-900/90 border border-amber-500/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2 shrink-0 self-start sm:self-auto font-mono">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-xs text-medium-400">Pico Comprovado:</span>
                <strong className="text-amber-300 font-bold text-sm">{goldenPattern.peakRating} / 10</strong>
              </div>
            )}
          </div>

          {/* Cards dos 4 Pilares da Fórmula */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10">
            {/* 1. Signo Lunar Ideal */}
            <div className="p-3.5 rounded-xl bg-medium-900/80 border border-medium-750 space-y-1.5">
              <span className="text-[10px] font-mono text-medium-400 uppercase tracking-wider flex items-center gap-1.5">
                <IconeLuaThelema className="w-3.5 h-3.5 text-amber-300" size={14} />
                <span>Signo Lunar Ideal</span>
              </span>
              <div className="flex items-center gap-2">
                {goldenPattern.bestSign?.sign && (
                  <ZodiacIcon sign={goldenPattern.bestSign.sign} className="w-4 h-4 text-white" size={16} />
                )}
                <span className="text-sm font-sans font-bold text-white truncate">
                  {goldenPattern.bestSign?.sign || "Dados insuficientes"}
                </span>
              </div>
              {goldenPattern.bestSign && (
                <div className="text-[10px] font-mono text-medium-400 flex items-center justify-between pt-1 border-t border-medium-800">
                  <span>Média: <strong className="text-amber-300">{goldenPattern.bestSign.avgRating}/10</strong></span>
                  <span>{goldenPattern.bestSign.count} {goldenPattern.bestSign.count === 1 ? "prática" : "práticas"}</span>
                </div>
              )}
            </div>

            {/* 2. Fase Lunar Ótima */}
            <div className="p-3.5 rounded-xl bg-medium-900/80 border border-medium-750 space-y-1.5">
              <span className="text-[10px] font-mono text-medium-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Fase Lunar Mais Fluida</span>
              </span>
              <span className="text-sm font-sans font-bold text-white block truncate">
                {goldenPattern.bestPhase?.phase || "Dados insuficientes"}
              </span>
              {goldenPattern.bestPhase && (
                <div className="text-[10px] font-mono text-medium-400 flex items-center justify-between pt-1 border-t border-medium-800">
                  <span>Média: <strong className="text-amber-300">{goldenPattern.bestPhase.avgRating}/10</strong></span>
                  <span>{goldenPattern.bestPhase.count} {goldenPattern.bestPhase.count === 1 ? "registro" : "registros"}</span>
                </div>
              )}
            </div>

            {/* 3. Dia Planetário Consagrado */}
            <div className="p-3.5 rounded-xl bg-medium-900/80 border border-medium-750 space-y-1.5">
              <span className="text-[10px] font-mono text-medium-400 uppercase tracking-wider flex items-center gap-1.5">
                <IconeSolThelema className="w-3.5 h-3.5 text-amber-300" size={14} />
                <span>Dia Planetário Consagrado</span>
              </span>
              <span className="text-sm font-sans font-bold text-white block truncate">
                {goldenPattern.bestDay?.day || "Dados insuficientes"}
              </span>
              {goldenPattern.bestDay && (
                <div className="text-[10px] font-mono text-medium-400 flex items-center justify-between pt-1 border-t border-medium-800">
                  <span>Média: <strong className="text-amber-300">{goldenPattern.bestDay.avgRating}/10</strong></span>
                  <span>{goldenPattern.bestDay.count} {goldenPattern.bestDay.count === 1 ? "operação" : "operações"}</span>
                </div>
              )}
            </div>

            {/* 4. Correspondência Chave (777) */}
            <div className="p-3.5 rounded-xl bg-medium-900/80 border border-medium-750 space-y-1.5">
              <span className="text-[10px] font-mono text-medium-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                <span>Catalisador Chave (777)</span>
              </span>
              <span className="text-sm font-sans font-bold text-white block truncate">
                {goldenPattern.bestIncense?.name || goldenPattern.bestEntity?.name || goldenPattern.bestOverallInf?.name || "Dados insuficientes"}
              </span>
              {(goldenPattern.bestIncense || goldenPattern.bestEntity || goldenPattern.bestOverallInf) && (
                <div className="text-[10px] font-mono text-medium-400 flex items-center justify-between pt-1 border-t border-medium-800">
                  <span className="capitalize">{goldenPattern.bestIncense ? "Incenso" : goldenPattern.bestEntity ? "Entidade" : "Elemento"}</span>
                  <strong className="text-amber-300">
                    {(goldenPattern.bestIncense || goldenPattern.bestEntity || goldenPattern.bestOverallInf)?.avgRating}/10
                  </strong>
                </div>
              )}
            </div>
          </div>

          {/* Síntese Descritiva em Linguagem Natural */}
          <div className="p-4 rounded-xl bg-medium-900/90 border border-amber-500/20 text-xs text-medium-300 leading-relaxed font-sans relative z-10">
            <p>
              <strong className="text-amber-300 font-mono font-semibold">🔬 Síntese Científico-Mágicka: </strong>
              {goldenPattern.bestSign && goldenPattern.bestPhase ? (
                <>
                  Seus registros indicam que o ápice de validação fenomênica ocorre sob a{" "}
                  <strong className="text-white">{goldenPattern.bestPhase.phase}</strong> com a Lua em{" "}
                  <strong className="text-white">{goldenPattern.bestSign.sign}</strong>
                  {goldenPattern.bestDay ? (
                    <>
                      , preferencialmente no <strong className="text-white">{goldenPattern.bestDay.day}</strong>
                    </>
                  ) : null}
                  {goldenPattern.bestIncense ? (
                    <>
                      {" "}e consagração com <strong className="text-white">{goldenPattern.bestIncense.name}</strong>
                    </>
                  ) : goldenPattern.bestEntity ? (
                    <>
                      {" "}em alinhamento com <strong className="text-white">{goldenPattern.bestEntity.name}</strong>
                    </>
                  ) : null}
                  . Sob esta configuração empírica, sua taxa média de sucesso atinge{" "}
                  <strong className="text-amber-300 font-mono font-bold">{goldenPattern.peakRating}/10</strong>
                  {goldenPattern.upliftPercent ? (
                    <span className="text-emerald-400 font-mono"> (+{goldenPattern.upliftPercent}% acima da sua média basal)</span>
                  ) : null}
                  . O Método da Ciência, o Alvo da Religião.
                </>
              ) : (
                "Continue registrando suas práticas, rituais e incensos para que a matriz hermética sintetize seu padrão fenomênico individual."
              )}
            </p>
          </div>
        </section>
      )}

      {/* ========================================================
          NOVO: LABORATÓRIO DE CRUZAMENTO 2D (MATRIZ INTERATIVA) & FIOS DE SINCRONICIDADE
          ======================================================== */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Coluna 7/12: Matriz de Cruzamento Bidimensional 2D */}
        <div className="xl:col-span-7 rounded-2xl border border-medium-750 bg-medium-850 p-5 sm:p-6 space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-medium-750 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>Matriz de Cruzamento Multidimensional (2D)</span>
              </h2>
              <p className="text-xs text-medium-400 mt-0.5">
                Escolha duas dimensões para cruzar dados de eficácia (★) e frequência. Clique em qualquer célula para ver as notas.
              </p>
            </div>
          </div>

          {/* Seletores de Eixo X e Eixo Y */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-medium-900/80 p-3 rounded-xl border border-medium-800">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-amber-300 mb-1">
                Eixo Vertical (Linhas)
              </label>
              <select
                value={matrixRowDim}
                onChange={(e) => {
                  setMatrixRowDim(e.target.value as CrossDimensionId);
                  setSelectedMatrixCell(null);
                }}
                className="w-full px-3 py-1.5 rounded-lg bg-medium-850 border border-medium-700 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {CROSS_DIMENSIONS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-purple-300 mb-1">
                Eixo Horizontal (Colunas)
              </label>
              <select
                value={matrixColDim}
                onChange={(e) => {
                  setMatrixColDim(e.target.value as CrossDimensionId);
                  setSelectedMatrixCell(null);
                }}
                className="w-full px-3 py-1.5 rounded-lg bg-medium-850 border border-medium-700 text-xs text-white focus:outline-none focus:border-purple-400"
              >
                {CROSS_DIMENSIONS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Top Sinergias Detectadas */}
          {crossMatrix.topSynergies.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">
                🔥 Maiores Sinergias:
              </span>
              {crossMatrix.topSynergies.slice(0, 3).map((syn, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    setSelectedMatrixCell({
                      rowKey: syn.rowKey,
                      colKey: syn.colKey,
                      count: syn.count,
                      ratedCount: syn.count,
                      avgRating: syn.avgRating,
                      entries: syn.entries,
                    })
                  }
                  className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-200 transition-colors"
                >
                  <strong>{syn.rowKey}</strong> × <strong>{syn.colKey}</strong> ({syn.avgRating}★ · {syn.count}x)
                </button>
              ))}
            </div>
          )}

          {/* Tabela Heatmap 2D */}
          {crossMatrix.rows.length === 0 || crossMatrix.cols.length === 0 ? (
            <div className="p-6 text-center text-xs text-medium-400 bg-medium-900/50 rounded-xl border border-medium-800">
              Registre mais notas para visualizar o cruzamento entre estas dimensões.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-medium-750 bg-medium-900/60">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-medium-750 bg-medium-900">
                    <th className="p-2.5 font-mono text-[10px] uppercase text-medium-400 sticky left-0 bg-medium-900 z-10 min-w-[130px]">
                      {CROSS_DIMENSIONS.find((d) => d.id === matrixRowDim)?.shortLabel} \{" "}
                      {CROSS_DIMENSIONS.find((d) => d.id === matrixColDim)?.shortLabel}
                    </th>
                    {crossMatrix.cols.map((col) => (
                      <th
                        key={col}
                        className="p-2.5 font-mono text-[10px] text-center text-medium-300 font-semibold min-w-[88px]"
                      >
                        <span className="line-clamp-2">{col}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-medium-800">
                  {crossMatrix.rows.map((row) => (
                    <tr key={row} className="hover:bg-white/[0.02]">
                      <td className="p-2.5 font-semibold text-white sticky left-0 bg-medium-900/95 z-10 border-r border-medium-800 max-w-[160px] truncate">
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
                            <td key={col} className="p-2 text-center text-medium-600 font-mono text-[10px]">
                              —
                            </td>
                          );
                        }

                        const bgClass =
                          avg >= 8.5
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-200"
                            : avg >= 7
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-200"
                            : count >= 2
                            ? "bg-purple-500/20 border-purple-500/40 text-purple-200"
                            : "bg-medium-800 border-medium-700 text-medium-200";

                        return (
                          <td key={col} className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedMatrixCell(cell)}
                              className={`w-full py-1.5 px-2 rounded-lg border transition-all flex flex-col items-center justify-center ${bgClass} ${
                                isSelected ? "ring-2 ring-white scale-[1.03]" : "hover:scale-[1.02]"
                              }`}
                            >
                              <span className="font-bold text-xs">{count}x</span>
                              {avg > 0 && (
                                <span className="text-[9px] font-mono opacity-90">{avg}★</span>
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

          {/* Gaveta de Notas da Célula Selecionada */}
          {selectedMatrixCell && (
            <div className="p-4 rounded-xl bg-medium-900 border border-amber-500/40 space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white">
                  Cruzamento:{" "}
                  <span className="text-amber-300">{selectedMatrixCell.rowKey}</span> ×{" "}
                  <span className="text-purple-300">{selectedMatrixCell.colKey}</span> (
                  {selectedMatrixCell.count} {selectedMatrixCell.count === 1 ? "nota" : "notas"})
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMatrixCell(null)}
                  className="text-[11px] text-medium-400 hover:text-white"
                >
                  Fechar ✕
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {selectedMatrixCell.entries.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => onSelectEntry(entry)}
                    className="text-left p-2.5 rounded-lg bg-medium-850 hover:bg-medium-800 border border-medium-750 flex items-center justify-between gap-2 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{entry.title}</div>
                      <div className="text-[10px] text-medium-400 font-mono">
                        {normalizeCategory(entry.type)} · {formatDateBR(entry.date)}
                      </div>
                    </div>
                    {entry.success_rating ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 shrink-0">
                        {entry.success_rating}/10
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Coluna 5/12: Detector de Fios de Sincronicidade (Oráculo ↔ Sonho ↔ Prática) */}
        <div className="xl:col-span-5 rounded-2xl border border-medium-750 bg-medium-850 p-5 sm:p-6 space-y-4 shadow-md flex flex-col">
          <div className="border-b border-medium-750 pb-4">
            <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Fios de Sincronicidade Detectados</span>
            </h2>
            <p className="text-xs text-medium-400 mt-0.5">
              Convergências automáticas onde o mesmo Arcano, Orixá, Totem de Sonho ou Erva atravessou seus Oráculos, Sonhos e Práticas.
            </p>
          </div>

          {syncThreads.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6 text-center text-xs text-medium-400 bg-medium-900/50 rounded-xl border border-medium-800">
              Conforme você registrar Oráculos, Sonhos e Práticas, os elos simbólicos entre eles aparecerão automaticamente aqui.
            </div>
          ) : (
            <div className="flex-1 space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {syncThreads.map((thread) => (
                <div
                  key={thread.id}
                  className="p-3.5 rounded-xl bg-medium-900/80 border border-medium-750 hover:border-purple-500/40 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{thread.icon}</span>
                      <div>
                        <h4 className="text-xs font-bold text-white">{thread.symbolTitle}</h4>
                        <div className="flex flex-wrap items-center gap-1 mt-0.5">
                          {thread.categoriesInvolved.map((cat) => (
                            <span
                              key={cat}
                              className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30"
                            >
                              {cat}
                            </span>
                          ))}
                          {thread.isCrossModal && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              ✨ Sincronicidade Cruzada
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-medium-400 shrink-0">
                      {thread.entries.length} notas
                    </span>
                  </div>

                  <p className="text-[11px] text-medium-300 leading-relaxed">{thread.explanationPt}</p>

                  {/* Linha do Tempo Compacta das Notas Conectadas */}
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-medium-800">
                    {thread.entries.slice(0, 4).map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => onSelectEntry(e)}
                        className="text-[10px] px-2 py-1 rounded-lg bg-medium-850 hover:bg-medium-800 border border-medium-700 text-medium-200 hover:text-white transition-colors flex items-center gap-1.5 max-w-full"
                      >
                        <span className="font-mono text-amber-300/90 shrink-0">
                          {formatDateBR(e.date)}
                        </span>
                        <span className="truncate max-w-[140px]">{e.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          DISCIPLINA MÁGICA, PENTAGRAMA ELEMENTAL & TOTENS ONÍRICOS
          ======================================================== */}
      <div className="space-y-4">
        <LiberReshWidget />
        <MagicHeatmap
          entries={entries}
          onSelectDate={(dateStr) => {
            setSearchQuery(dateStr);
          }}
        />

        {/* Grid: Pentagrama de Equilíbrio Elemental + Totens Oníricos (Yesod) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Pentagrama de Equilíbrio Elemental */}
          <div className="bg-medium-850 rounded-xl border border-medium-700 p-5 flex flex-col justify-between space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-medium-750 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Pentagrama de Equilíbrio Elemental & Forças
                </h3>
              </div>
              <span className="text-[10px] font-mono text-amber-300">
                5 Pontas do Templo
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* SVG Radar Pentagram */}
              <svg viewBox="0 0 220 220" className="w-44 h-44 shrink-0">
                {/* Grade concêntrica */}
                {[0.33, 0.66, 1].map((scale, sIdx) => {
                  const pts = elementalRadar.axes
                    .map((ax) => {
                      const rad = (ax.angle * Math.PI) / 180;
                      const r = 78 * scale;
                      return `${110 + Math.cos(rad) * r},${110 + Math.sin(rad) * r}`;
                    })
                    .join(" ");
                  return (
                    <polygon
                      key={sIdx}
                      points={pts}
                      fill="none"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Eixos */}
                {elementalRadar.axes.map((ax) => {
                  const rad = (ax.angle * Math.PI) / 180;
                  return (
                    <line
                      key={ax.key}
                      x1={110}
                      y1={110}
                      x2={110 + Math.cos(rad) * 78}
                      y2={110 + Math.sin(rad) * 78}
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Polígono preenchido do praticante */}
                <polygon
                  points={elementalRadar.axes
                    .map((ax) => {
                      const rad = (ax.angle * Math.PI) / 180;
                      const ratio = Math.max(0.18, ax.value / elementalRadar.maxVal);
                      const r = 78 * ratio;
                      return `${110 + Math.cos(rad) * r},${110 + Math.sin(rad) * r}`;
                    })
                    .join(" ")}
                  fill="rgba(234, 179, 8, 0.25)"
                  stroke="#EAB308"
                  strokeWidth="2"
                />

                {/* Rótulos das 5 Pontas */}
                {elementalRadar.axes.map((ax) => {
                  const rad = (ax.angle * Math.PI) / 180;
                  const lx = 110 + Math.cos(rad) * 95;
                  const ly = 110 + Math.sin(rad) * 95;
                  return (
                    <text
                      key={`lbl-${ax.key}`}
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#F8FAFC"
                      className="text-[8px] font-mono font-bold"
                    >
                      {ax.key.toUpperCase()}
                    </text>
                  );
                })}
              </svg>

              {/* Barras e Diagnóstico */}
              <div className="flex-1 w-full space-y-2 text-xs font-mono">
                {elementalRadar.axes.map((ax) => (
                  <div key={ax.key} className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-medium-200">{ax.label}</span>
                      <strong className="text-amber-300">{ax.value} pts</strong>
                    </div>
                    <div className="w-full h-1.5 bg-medium-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${Math.round((ax.value / elementalRadar.maxVal) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}

                <p className="text-[11px] font-sans text-medium-300 pt-2 border-t border-medium-750 leading-relaxed">
                  <strong>Diagnóstico do Templo:</strong> Força dominante em{" "}
                  <span className="text-amber-300 font-semibold">{elementalRadar.dominant.label}</span>. Para equilíbrio hermético, trabalhe mais{" "}
                  <span className="text-emerald-300 font-semibold">{elementalRadar.deficient.label}</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Mapa de Totens Oníricos & Viagem Astral (Dream Signs) */}
          <div className="bg-medium-850 rounded-xl border border-medium-700 p-5 flex flex-col justify-between space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-medium-750 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Totens de Lucidez & Onironáutica (Yesod)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-indigo-300">
                {dreamAnalysis.dreamNotesCount} sonhos · {dreamAnalysis.astralNotesCount} viagens astrais
              </span>
            </div>

            {dreamAnalysis.totems.length === 0 ? (
              <p className="text-xs text-medium-400 italic py-6 text-center">
                Registre sonhos ou visões astrais para que o motor de Yesod detecte automaticamente seus Totens de Lucidez (Águas, Mata, Encruzilhada, Serpente, Voo, Terreiro...).
              </p>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {dreamAnalysis.totems.map((totem) => (
                  <div
                    key={totem.id}
                    className="p-3 rounded-lg bg-medium-900 border border-medium-750 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{totem.icon}</span>
                        <strong className="text-xs text-white font-serif">{totem.name}</strong>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                          {totem.brasilisRuler}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-medium-400 mt-1">
                        {totem.meaning777}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded border border-indigo-500/30 shrink-0">
                      {totem.count}x
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          2. FILTROS INTERATIVOS (RECORRENTES vs MAIOR SUCESSO)
          ======================================================== */}
      <div className="bg-medium-850 p-4 rounded-xl border border-medium-700 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-medium-750 pb-3">
          {/* Ordenação Principal: Mais Recorrentes vs Maior Sucesso */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-medium-400 uppercase font-semibold mr-1">
              Classificar por:
            </span>
            <button
              type="button"
              onClick={() => setSortMode("recurrent")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                sortMode === "recurrent"
                  ? "bg-white text-black shadow-sm"
                  : "bg-medium-900 text-medium-300 hover:text-white border border-medium-750"
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Mais Recorrentes (Frequência)</span>
            </button>

            <button
              type="button"
              onClick={() => setSortMode("success")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                sortMode === "success"
                  ? "bg-white text-black shadow-sm"
                  : "bg-medium-900 text-medium-300 hover:text-white border border-medium-750"
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Maior Taxa de Sucesso em Média</span>
            </button>
          </div>

          {/* Filtro de Período Temporal */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-medium-400">Período:</span>
            {(
              [
                { id: "all", label: "Tudo" },
                { id: "90", label: "90 Dias" },
                { id: "30", label: "30 Dias" },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriodMode(p.id)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  periodMode === p.id
                    ? "bg-medium-800 text-white border border-medium-600 font-semibold"
                    : "text-medium-400 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Linha 2: Categorias de Notas & Busca de Influências */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Categoria da Nota */}
          <div className="md:col-span-5 flex items-center gap-1 overflow-x-auto pb-1">
            <span className="text-[10px] font-mono text-medium-400 uppercase mr-1 shrink-0">
              Categoria:
            </span>
            {(
              [
                "all",
                "Prática",
                "Estudo",
                "Visão Astral",
                "Sonho",
                "Oráculo",
                "Diário",
              ] as const
            ).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-1 rounded text-xs font-sans whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-white text-black font-semibold shadow-xs"
                    : "bg-medium-900 text-medium-300 hover:text-white border border-medium-750"
                }`}
              >
                {cat === "all" ? "Todas" : cat}
              </button>
            ))}
          </div>

          {/* Tipo de Influência Liber 777 */}
          <div className="md:col-span-4">
            <select
              value={influenceCategory}
              onChange={(e) => setInfluenceCategory(e.target.value)}
              className="w-full bg-medium-900 border border-medium-750 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white font-mono"
            >
              <option value="all">Todas as Influências (Liber 777 & Brasilis)</option>
              <option value="orixa">🌿 Orixás, Guias, Jurema & Pontos de Força</option>
              <option value="entity">Entidades, Divindades & Anjos</option>
              <option value="color">Cores & Escalas do 777</option>
              <option value="element">Elementos (Fogo, Água, Ar, Terra, Espírito)</option>
              <option value="planet">Planetas & Astros</option>
              <option value="sephirah">Sephiroth & Caminhos</option>
              <option value="tarot">Tarot & Atus de Thoth</option>
              <option value="incense">Incensos & Perfumes</option>
              <option value="instrument">Armas & Instrumentos Mágickos</option>
              <option value="herb">Ervas, Plantas & Cristais</option>
            </select>
          </div>

          {/* Busca textual */}
          <div className="md:col-span-3 relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-medium-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar influência..."
              className="w-full bg-medium-900 border border-medium-750 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-medium-500 focus:outline-none focus:border-white font-sans"
            />
          </div>
        </div>
      </div>

      {/* ========================================================
          3. TABELA / GRID ANALÍTICA DE INFLUÊNCIAS (LIBER 777)
          ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-white" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Influências Herméticas (Liber 777): Recorrência vs Eficácia
            </h2>
          </div>
          <span className="text-xs font-mono text-medium-400">
            {influencesAnalysis.length} influências encontradas
          </span>
        </div>

        {influencesAnalysis.length === 0 ? (
          <div className="p-8 rounded-xl bg-medium-850 border border-medium-700 text-center text-xs text-medium-400 font-mono">
            Nenhuma influência encontrada com os filtros selecionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {influencesAnalysis.map((item, idx) => (
              <div
                key={idx}
                className="bg-medium-850 p-4 rounded-xl border border-medium-700 hover:border-medium-500 transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-medium-800 text-amber-300 border border-medium-700">
                      {getInfluenceCategoryLabel(item.category)}
                    </span>

                    <span className="flex items-center gap-1 font-mono text-xs font-bold text-white bg-medium-800 px-2 py-0.5 rounded border border-medium-700">
                      <Star className="w-3 h-3 fill-white text-white" />
                      <span>{item.avgRating}/10</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-serif font-bold text-white leading-snug">
                    {item.name}
                  </h3>
                </div>

                <div className="pt-2 border-t border-medium-750/70 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-medium-400">
                    <span>Recorrência:</span>
                    <strong className="text-white">
                      {item.count} {item.count === 1 ? "registro" : "registros"}
                    </strong>
                  </div>

                  {/* Visual Progress Bar for Rating */}
                  <div className="w-full bg-medium-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-white h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (item.avgRating / 10) * 100)}%` }}
                    />
                  </div>

                  {/* Click to inspect first note */}
                  {item.entries.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onSelectEntry(item.entries[0])}
                      className="text-[10px] font-mono text-medium-400 hover:text-white flex items-center gap-1 pt-1"
                    >
                      <span>Ver nota associada: "{item.entries[0].title.slice(0, 20)}..."</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================
          4. CORRELAÇÕES ASTRAIS & LUNARES DE SUCESSO (LIBER 777)
          ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Correlações Astrais de Sucesso (Liber 777 & Eficácia Empírica)
            </h2>
          </div>
          <span className="text-[10px] font-mono text-medium-400">
            {sortMode === "recurrent" ? "Ordenado por Recorrência" : "Ordenado por Maior Nota de Sucesso"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Signos Lunares de Maior Sucesso */}
          <div className="bg-medium-850 rounded-xl border border-medium-700 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-medium-750 pb-3">
              <div className="flex items-center gap-2">
                <IconeLuaThelema className="w-4 h-4 text-white" size={16} />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Signo Lunar (☽)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-medium-400">
                {moonSignStats.length} signos
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {moonSignStats.length === 0 ? (
                <p className="text-xs text-medium-500 italic py-2">
                  Sem registros com signo lunar anotado.
                </p>
              ) : (
                moonSignStats.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-medium-900 border border-medium-750 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <ZodiacIcon sign={item.sign} className="w-4 h-4 text-white" size={16} />
                      <span className="text-xs font-sans font-semibold text-white">
                        {item.sign}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-medium-400 text-[11px]">
                        {item.count} {item.count === 1 ? "nota" : "notas"}
                      </span>
                      <span className="flex items-center gap-1 text-white font-bold bg-medium-800 px-2 py-0.5 rounded border border-medium-700">
                        <Star className="w-3 h-3 fill-white text-white" />
                        {item.avgRating}/10
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. Fases da Lua de Maior Sucesso */}
          <div className="bg-medium-850 rounded-xl border border-medium-700 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-medium-750 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Fase Lunar (Fase)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-medium-400">
                {moonPhaseStats.length} fases
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {moonPhaseStats.length === 0 ? (
                <p className="text-xs text-medium-500 italic py-2">
                  Sem registros com fase lunar anotada.
                </p>
              ) : (
                moonPhaseStats.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-medium-900 border border-medium-750 flex items-center justify-between gap-3"
                  >
                    <span className="text-xs font-sans font-semibold text-white">
                      {item.phase}
                    </span>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-medium-400 text-[11px]">
                        {item.count} {item.count === 1 ? "nota" : "notas"}
                      </span>
                      <span className="flex items-center gap-1 text-white font-bold bg-medium-800 px-2 py-0.5 rounded border border-medium-700">
                        <Star className="w-3 h-3 fill-white text-white" />
                        {item.avgRating}/10
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. Dias Planetários de Maior Sucesso */}
          <div className="bg-medium-850 rounded-xl border border-medium-700 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-medium-750 pb-3">
              <div className="flex items-center gap-2">
                <IconeSolThelema className="w-4 h-4 text-white" size={16} />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Dia Planetário
                </h3>
              </div>
              <span className="text-[10px] font-mono text-medium-400">
                {planetaryDayStats.length} dias
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {planetaryDayStats.length === 0 ? (
                <p className="text-xs text-medium-500 italic py-2">
                  Sem registros com dia planetário anotado.
                </p>
              ) : (
                planetaryDayStats.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-medium-900 border border-medium-750 flex items-center justify-between gap-3"
                  >
                    <span className="text-xs font-sans font-semibold text-white">
                      {item.day}
                    </span>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-medium-400 text-[11px]">
                        {item.count} {item.count === 1 ? "nota" : "notas"}
                      </span>
                      <span className="flex items-center gap-1 text-white font-bold bg-medium-800 px-2 py-0.5 rounded border border-medium-700">
                        <Star className="w-3 h-3 fill-white text-white" />
                        {item.avgRating}/10
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. TOP REGISTROS DE MAIOR SUCESSO
          ======================================================== */}
      <section className="bg-medium-850 rounded-xl border border-medium-700 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-medium-750 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-white" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Operações de Maior Eficácia Empírica
            </h3>
          </div>
          <span className="text-[10px] font-mono text-medium-400">
            Registros com maior validação fenomênica
          </span>
        </div>

        <div className="space-y-2.5">
          {topEntries.map((e) => (
            <div
              key={e.id}
              onClick={() => onSelectEntry(e)}
              className="p-3 rounded-lg bg-medium-900 border border-medium-750 hover:border-medium-600 hover:bg-medium-800 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase font-semibold text-medium-300 px-1.5 py-0.2 rounded bg-medium-800 border border-medium-700">
                    {normalizeCategory(e.type)}
                  </span>
                  <h4 className="text-xs font-serif font-bold text-white group-hover:underline">
                    {e.title}
                  </h4>
                </div>
                <p className="text-[11px] text-medium-400 font-sans line-clamp-1">
                  {e.content.replace(/[#*`_>]/g, "")}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                <span className="text-medium-400 text-[10px]">
                  {formatDateTimeBR(e.date)}
                </span>
                <span className="flex items-center gap-1 text-white font-bold bg-medium-800 px-2 py-0.5 rounded border border-medium-700">
                  <Star className="w-3 h-3 fill-white text-white" />
                  {e.success_rating}/10
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
