"use client";

import React, { useState, useMemo } from "react";
import { MagickEntry, normalizeCategory, CategoryName } from "@/lib/types";
import { getCategoryThelemicIcon, ZodiacIcon, IconeSolThelema, IconeLuaThelema } from "@/components/ThelemicIcons";
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
} from "lucide-react";

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
      const rating = e.success_rating !== undefined ? e.success_rating : 5;

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
      list = list.filter((i) => i.category.toLowerCase() === influenceCategory.toLowerCase());
    }

    // Filter by text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
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
      const rating = e.success_rating !== undefined ? e.success_rating : 5;
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
      const rating = e.success_rating !== undefined ? e.success_rating : 5;
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
      const rating = e.success_rating !== undefined ? e.success_rating : 5;
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
      if (e.success_rating !== undefined && e.success_rating > 0) {
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
      .filter((e) => e.success_rating !== undefined)
      .sort((a, b) => (b.success_rating || 0) - (a.success_rating || 0))
      .slice(0, 5);
  }, [filteredEntries]);

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
              <option value="all">Todas as Influências (Liber 777)</option>
              <option value="entity">Deidades & Entidades</option>
              <option value="incense">Incenso & Perfumes</option>
              <option value="tool">Armas & Instrumentos</option>
              <option value="candle">Cores & Velas</option>
              <option value="feeling">Sentimentos & Êxtase</option>
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
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-medium-800 text-medium-300 border border-medium-700 capitalize">
                      {item.category}
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
                  {new Date(e.date).toLocaleDateString("pt-BR")}
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
