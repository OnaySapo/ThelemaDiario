"use client";

import React, { useMemo } from "react";
import { MagickEntry } from "@/lib/types";
import { computeStatisticalInsights } from "@/lib/insights";
import {
  Star,
  Moon,
  Sparkles,
  Sword,
  Wand2,
  Flame,
  Award,
  TrendingUp,
  BarChart2,
} from "lucide-react";

interface InsightsViewProps {
  entries: MagickEntry[];
  onOpenNewEntry: () => void;
}

export function InsightsView({ entries }: InsightsViewProps) {
  const insights = useMemo(() => computeStatisticalInsights(entries), [entries]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-forest-850 via-forest-800 to-forest-850 p-6 rounded-2xl border border-forest-700 shadow-arcane flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl text-gold-400">⚖️</span>
            <h2 className="text-lg font-serif font-bold text-parchment-100">
              Matriz Científica de Sucesso Mágicko
            </h2>
          </div>
          <p className="text-xs text-parchment-300 max-w-2xl leading-relaxed">
            Análise empírica dos seus rituais e práticas baseada no lema thelêmico do *Equinox*.
            Descubra as sincronicidades, influências astrais e correspondências que maximizam a eficácia da sua Vontade.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-forest-900/80 px-4 py-3 rounded-xl border border-forest-750">
          <Award className="w-6 h-6 text-gold-400" />
          <div>
            <div className="text-[10px] text-parchment-400 font-mono uppercase">
              Média de Sucesso Geral
            </div>
            <div className="text-xl font-bold font-mono text-parchment-100 flex items-baseline gap-1">
              <span className="text-gold-400">{insights.averageSuccess}</span>
              <span className="text-xs text-parchment-400">/ 10</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-forest-800/70 p-4 rounded-xl border border-forest-700">
          <div className="flex items-center justify-between text-parchment-400 text-xs mb-2 font-mono">
            <span>RITUAIS REGISTRADOS</span>
            <Sword className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-parchment-100">
            {insights.ritualsCount}
          </div>
        </div>

        <div className="bg-forest-800/70 p-4 rounded-xl border border-forest-700">
          <div className="flex items-center justify-between text-parchment-400 text-xs mb-2 font-mono">
            <span>ORÁCULOS DE THOTH</span>
            <Sparkles className="w-4 h-4 text-moss-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-parchment-100">
            {insights.oraclesCount}
          </div>
        </div>

        <div className="bg-forest-800/70 p-4 rounded-xl border border-forest-700">
          <div className="flex items-center justify-between text-parchment-400 text-xs mb-2 font-mono">
            <span>SONHOS & VISÕES</span>
            <Moon className="w-4 h-4 text-twilight-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-parchment-100">
            {insights.dreamsCount}
          </div>
        </div>

        <div className="bg-forest-800/70 p-4 rounded-xl border border-forest-700">
          <div className="flex items-center justify-between text-parchment-400 text-xs mb-2 font-mono">
            <span>TOTAL DE ENTRADAS</span>
            <BarChart2 className="w-4 h-4 text-lunar-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-parchment-100">
            {insights.totalEntries}
          </div>
        </div>
      </div>

      {/* Correlations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Sucesso por Fase Lunar */}
        <div className="bg-forest-850 p-5 rounded-xl border border-forest-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-parchment-100 flex items-center gap-2">
              <Moon className="w-4 h-4 text-gold-400" />
              <span>Ressonância por Fase da Lua</span>
            </h3>
            <span className="text-[11px] font-mono text-parchment-400">Média (0-10)</span>
          </div>

          <div className="space-y-3">
            {insights.bestMoonPhases.length === 0 ? (
              <p className="text-xs text-parchment-400 italic">Nenhum dado registrado ainda.</p>
            ) : (
              insights.bestMoonPhases.map((p, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-parchment-200">{p.phase} ({p.count} rituais)</span>
                    <strong className="text-gold-400">{p.avgRating}/10</strong>
                  </div>
                  <div className="w-full bg-forest-900 rounded-full h-2 overflow-hidden border border-forest-750">
                    <div
                      className="bg-gold-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(p.avgRating / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Sucesso por Entidade */}
        <div className="bg-forest-850 p-5 rounded-xl border border-forest-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-parchment-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-moss-400" />
              <span>Entidades & Divindades Invocadas</span>
            </h3>
            <span className="text-[11px] font-mono text-parchment-400">Média (0-10)</span>
          </div>

          <div className="space-y-3">
            {insights.bestEntities.length === 0 ? (
              <p className="text-xs text-parchment-400 italic">Nenhuma entidade catalogada ainda.</p>
            ) : (
              insights.bestEntities.map((ent, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-parchment-200">{ent.name} ({ent.count} vezes)</span>
                    <strong className="text-moss-400">{ent.avgRating}/10</strong>
                  </div>
                  <div className="w-full bg-forest-900 rounded-full h-2 overflow-hidden border border-forest-750">
                    <div
                      className="bg-moss-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(ent.avgRating / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Sucesso por Signo Lunar */}
        <div className="bg-forest-850 p-5 rounded-xl border border-forest-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-parchment-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-lunar-400" />
              <span>Trânsito do Signo Lunar</span>
            </h3>
            <span className="text-[11px] font-mono text-parchment-400">Média (0-10)</span>
          </div>

          <div className="space-y-3">
            {insights.bestMoonSigns.length === 0 ? (
              <p className="text-xs text-parchment-400 italic">Nenhum dado registrado ainda.</p>
            ) : (
              insights.bestMoonSigns.map((s, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-parchment-200">Lua em {s.sign}</span>
                    <strong className="text-lunar-400">{s.avgRating}/10</strong>
                  </div>
                  <div className="w-full bg-forest-900 rounded-full h-2 overflow-hidden border border-forest-750">
                    <div
                      className="bg-lunar-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(s.avgRating / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 4. Incensos & Fragrâncias de Liber 777 */}
        <div className="bg-forest-850 p-5 rounded-xl border border-forest-700 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-parchment-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-scarlet-400" />
              <span>Fragrâncias & Incensos (Liber 777)</span>
            </h3>
            <span className="text-[11px] font-mono text-parchment-400">Média (0-10)</span>
          </div>

          <div className="space-y-3">
            {insights.bestIncenses.length === 0 ? (
              <p className="text-xs text-parchment-400 italic">Nenhum incenso catalogado ainda.</p>
            ) : (
              insights.bestIncenses.map((inc, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-parchment-200">{inc.name}</span>
                    <strong className="text-scarlet-400">{inc.avgRating}/10</strong>
                  </div>
                  <div className="w-full bg-forest-900 rounded-full h-2 overflow-hidden border border-forest-750">
                    <div
                      className="bg-scarlet-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(inc.avgRating / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
