"use client";

import React, { useMemo, useState } from "react";
import { MagickEntry, normalizeCategory } from "@/lib/types";
import { Flame, Trophy, Calendar, Sparkles, CheckCircle2 } from "lucide-react";
import { EstrelaDeThelema } from "@/components/ThelemicIcons";

interface MagicHeatmapProps {
  entries: MagickEntry[];
  onSelectDate?: (dateStr: string) => void;
  className?: string;
}

interface DayData {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  count: number;
  entries: MagickEntry[];
  intensity: 0 | 1 | 2 | 3 | 4;
}

export function MagicHeatmap({ entries, onSelectDate, className = "" }: MagicHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  // Mapear entradas por data (YYYY-MM-DD)
  const { weeks, stats } = useMemo(() => {
    const entryMap = new Map<string, MagickEntry[]>();

    entries.forEach((entry) => {
      if (!entry.date) return;
      // Extrair YYYY-MM-DD
      const d = new Date(entry.date);
      if (isNaN(d.getTime())) return;
      const key = d.toISOString().split("T")[0];
      if (!entryMap.has(key)) {
        entryMap.set(key, []);
      }
      entryMap.get(key)!.push(entry);
    });

    // Gerar as últimas 52 semanas terminando hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Começar no domingo de 52 semanas atrás
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (52 * 7) + (7 - today.getDay()));

    const allDays: DayData[] = [];
    const curr = new Date(startDate);

    while (curr <= today) {
      const dateStr = curr.toISOString().split("T")[0];
      const dayEntries = entryMap.get(dateStr) || [];
      const count = dayEntries.length;

      let intensity: 0 | 1 | 2 | 3 | 4 = 0;
      if (count === 1) intensity = 1;
      else if (count === 2) intensity = 2;
      else if (count === 3) intensity = 3;
      else if (count >= 4) intensity = 4;

      allDays.push({
        date: new Date(curr),
        dateStr,
        count,
        entries: dayEntries,
        intensity,
      });

      curr.setDate(curr.getDate() + 1);
    }

    // Agrupar em colunas de semanas (7 dias por coluna)
    const weeksList: DayData[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeksList.push(allDays.slice(i, i + 7));
    }

    // Calcular estatísticas de constância (Streaks)
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let totalPracticedDays = 0;

    // Percorrer cronologicamente
    for (let i = 0; i < allDays.length; i++) {
      if (allDays[i].count > 0) {
        tempStreak++;
        totalPracticedDays++;
        if (tempStreak > maxStreak) {
          maxStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }

    // Calcular streak atual (de trás para a frente a partir de hoje/ontem)
    const rev = [...allDays].reverse();
    let isTrackingCurrent = true;
    for (const d of rev) {
      if (isTrackingCurrent) {
        if (d.count > 0) {
          currentStreak++;
        } else if (d.dateStr === today.toISOString().split("T")[0]) {
          // Se hoje ainda não teve registro, não zera imediatamente o streak se ontem teve
          continue;
        } else {
          break;
        }
      }
    }

    return {
      weeks: weeksList,
      stats: {
        totalPracticedDays,
        currentStreak,
        maxStreak,
        totalEntries: entries.length,
      },
    };
  }, [entries]);

  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  return (
    <div className={`p-4 rounded-xl bg-medium-850 border border-medium-700 select-none ${className}`}>
      {/* Cabeçalho e Métricas de Disciplina */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-medium-750">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Constância & Disciplina Mágica</span>
              <span className="text-[10px] text-amber-400 font-normal lowercase">(Liber E & O)</span>
            </h3>
            <p className="text-[11px] text-medium-400">
              Frequência de rituais, práticas e anotações nos últimos 365 dias
            </p>
          </div>
        </div>

        {/* Badges de Streak e Recorde */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-medium-800 border border-medium-700/80">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-medium-400 text-[11px]">Sequência Atual:</span>
            <strong className="text-amber-300 font-bold">{stats.currentStreak} dias</strong>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-medium-800 border border-medium-700/80">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-medium-400 text-[11px]">Maior Sequência:</span>
            <strong className="text-white font-bold">{stats.maxStreak} dias</strong>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-medium-800 border border-medium-700/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-medium-400 text-[11px]">Dias Ativos:</span>
            <strong className="text-emerald-300 font-bold">{stats.totalPracticedDays}</strong>
          </div>
        </div>
      </div>

      {/* Grid de Semanas (Estilo GitHub Solar) */}
      <div className="overflow-x-auto pb-2 custom-scrollbar">
        <div className="inline-flex flex-col gap-1 min-w-[700px]">
          {/* Matriz 7 linhas x 52 semanas */}
          <div className="flex gap-1">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((day) => {
                  let colorClass = "bg-medium-800/40 border-medium-750/30 hover:border-medium-500";
                  if (day.intensity === 1) {
                    colorClass = "bg-amber-900/40 border-amber-800/50 hover:border-amber-400";
                  } else if (day.intensity === 2) {
                    colorClass = "bg-amber-700/70 border-amber-600/70 hover:border-amber-300";
                  } else if (day.intensity === 3) {
                    colorClass = "bg-amber-500 border-amber-400 text-black shadow-sm hover:border-white";
                  } else if (day.intensity === 4) {
                    colorClass = "bg-amber-300 border-white text-black shadow-[0_0_8px_rgba(251,191,36,0.6)]";
                  }

                  return (
                    <button
                      key={day.dateStr}
                      type="button"
                      onClick={() => onSelectDate && onSelectDate(day.dateStr)}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-3 h-3 rounded-[2.5px] border transition-all ${colorClass}`}
                      title={`${day.dateStr}: ${day.count} registro(s)`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legenda de Intensidade */}
          <div className="flex items-center justify-between text-[10px] font-mono text-medium-400 pt-3 border-t border-medium-750/50 mt-1">
            <div className="flex items-center gap-2">
              {hoveredDay ? (
                <span className="text-white">
                  <strong className="text-amber-400">{hoveredDay.count} prática(s)</strong> em{" "}
                  {new Date(hoveredDay.dateStr).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                  {hoveredDay.entries.length > 0 && (
                    <span className="text-medium-300 ml-2 italic">
                      — {hoveredDay.entries.map((e) => e.title).join(", ")}
                    </span>
                  )}
                </span>
              ) : (
                <span>Passe o mouse sobre os dias para ver os rituais</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span>Menos</span>
              <div className="w-2.5 h-2.5 rounded-[2px] bg-medium-800/40 border border-medium-750/30" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-amber-900/40 border border-amber-800/50" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-amber-700/70 border border-amber-600/70" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-amber-500 border border-amber-400" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-amber-300 border border-white" />
              <span>Mais</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
