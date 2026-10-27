"use client";

import React, { useMemo } from "react";
import { MagickEntry, normalizeCategory } from "@/lib/types";
import { formatDateTimeBR, getInfluenceCategoryLabel } from "@/lib/dateUtils";
import { OTZ_CHIIM_BRASILIS } from "@/lib/brasilidade777";
import { X, Star, Sparkles, ArrowRight, BookOpen, Compass, Award } from "lucide-react";

interface EntityDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityName: string;
  entityCategory?: string;
  entries: MagickEntry[];
  onSelectEntry: (entry: MagickEntry) => void;
}

export function EntityDossierModal({
  isOpen,
  onClose,
  entityName,
  entityCategory,
  entries,
  onSelectEntry,
}: EntityDossierModalProps) {
  const cleanQuery = entityName.trim().toLowerCase();

  // Correspondência com Liber 777 Brasilis
  const brasilisMatch = useMemo(() => {
    if (!cleanQuery) return null;
    const baseToken = cleanQuery.split("(")[0].trim();
    for (const item of Object.values(OTZ_CHIIM_BRASILIS)) {
      const hay = [
        item.sephirahName,
        ...item.orixas,
        ...item.umbandaLines,
        ...item.quimbandaGuardians,
        ...item.juremaMasters,
        ...item.sacredHerbs,
        ...item.elementsAndPointsOfPower,
      ]
        .join(" ")
        .toLowerCase();
      if (hay.includes(baseToken) && baseToken.length >= 3) {
        return item;
      }
    }
    return null;
  }, [cleanQuery]);

  // Notas que invocam ou mencionam esta entidade/força
  const stats = useMemo(() => {
    if (!cleanQuery) {
      return { matchingEntries: [], avgRating: "—", bestMoon: "—", categories: {} as Record<string, number> };
    }
    const baseToken = cleanQuery.split("(")[0].trim();

    const matchingEntries = entries.filter((entry) => {
      const hasInfluence = (entry.influences || []).some(
        (inf) =>
          inf.name.toLowerCase() === cleanQuery ||
          (baseToken.length >= 3 && inf.name.toLowerCase().includes(baseToken))
      );
      if (hasInfluence) return true;
      const text = `${entry.title} ${entry.content}`.toLowerCase();
      return baseToken.length >= 4 && text.includes(baseToken);
    });

    let sumRating = 0;
    let countRating = 0;
    const moonCounts: Record<string, number> = {};
    const categories: Record<string, number> = {};

    for (const e of matchingEntries) {
      const cat = normalizeCategory(e.type);
      categories[cat] = (categories[cat] || 0) + 1;

      if (e.success_rating && e.success_rating > 0) {
        sumRating += e.success_rating;
        countRating++;
      }
      if (e.moon_phase) {
        const phaseBase = e.moon_phase.split("(")[0].trim();
        moonCounts[phaseBase] = (moonCounts[phaseBase] || 0) + 1;
      }
    }

    const bestMoon =
      Object.entries(moonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    return {
      matchingEntries,
      avgRating: countRating > 0 ? (sumRating / countRating).toFixed(1) : "—",
      bestMoon,
      categories,
    };
  }, [entries, cleanQuery]);

  if (!isOpen || !entityName) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-medium-900 border border-medium-700 rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-medium-750 bg-medium-850 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold block">
                Dossiê Vivo · {entityCategory ? getInfluenceCategoryLabel(entityCategory) : "Força / Correspondência"}
              </span>
              <h2 className="text-xl font-serif font-bold text-white mt-0.5">
                {entityName}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-medium-400 hover:text-white hover:bg-medium-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* KPIs da Entidade no Diário */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-medium-850 border border-medium-750">
              <span className="text-[10px] font-mono uppercase text-medium-400 block">
                Registros no Diário
              </span>
              <span className="text-xl font-mono font-bold text-white mt-1 block">
                {stats.matchingEntries.length}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-medium-850 border border-medium-750">
              <span className="text-[10px] font-mono uppercase text-medium-400 block">
                Eficácia Média
              </span>
              <span className="text-xl font-mono font-bold text-amber-300 mt-1 flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{stats.avgRating}/10</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-medium-850 border border-medium-750">
              <span className="text-[10px] font-mono uppercase text-medium-400 block">
                Fase Lunar Frequente
              </span>
              <span className="text-xs font-mono font-bold text-white mt-1.5 block truncate">
                {stats.bestMoon}
              </span>
            </div>
          </div>

          {/* Ficha Liber 777 Brasilis (se houver correspondência) */}
          {brasilisMatch && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <span>🌿</span>
                  <span>Esfera de Correspondência: {brasilisMatch.sephirahName} (#{brasilisMatch.sephirahId})</span>
                </span>
                <span className="text-[10px] font-mono text-amber-300 font-bold">
                  {brasilisMatch.greeting.split(" / ")[0]}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                <div>
                  <span className="text-medium-400 block text-[9px] font-mono uppercase">Orixás & Regentes:</span>
                  <span className="text-white font-semibold">{brasilisMatch.orixas.join(" · ")}</span>
                </div>
                <div>
                  <span className="text-medium-400 block text-[9px] font-mono uppercase">Ponto de Força:</span>
                  <span className="text-emerald-200 font-semibold">{brasilisMatch.elementsAndPointsOfPower.join(" · ")}</span>
                </div>
                <div>
                  <span className="text-medium-400 block text-[9px] font-mono uppercase">Ervas Sagradas (Ewê):</span>
                  <span className="text-medium-200">{brasilisMatch.sacredHerbs.join(", ")}</span>
                </div>
                <div>
                  <span className="text-medium-400 block text-[9px] font-mono uppercase">Cores & Fios de Conta:</span>
                  <span className="text-amber-200">{brasilisMatch.colors.join(", ")}</span>
                </div>
              </div>

              <p className="text-[11px] font-serif italic text-medium-300 pt-1.5 border-t border-emerald-500/15">
                {brasilisMatch.synthesis}
              </p>
            </div>
          )}

          {/* Lista de Notas com esta Força */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-medium-300">
              Histórico de Operações & Estudos ({stats.matchingEntries.length})
            </h3>

            {stats.matchingEntries.length === 0 ? (
              <p className="text-xs text-medium-500 italic p-4 bg-medium-850 rounded-xl border border-medium-750">
                Nenhum registro encontrado com esta força ainda.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {stats.matchingEntries.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => {
                      onSelectEntry(note);
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-medium-850 hover:bg-medium-800 border border-medium-750 hover:border-amber-500/40 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-medium-400">
                        <span className="text-amber-300 font-semibold">{normalizeCategory(note.type)}</span>
                        <span>·</span>
                        <span>{formatDateTimeBR(note.date)}</span>
                        {note.success_rating ? (
                          <>
                            <span>·</span>
                            <span className="text-white font-bold">★ {note.success_rating}/10</span>
                          </>
                        ) : null}
                      </div>
                      <h4 className="text-sm font-serif font-bold text-white group-hover:text-amber-300 truncate mt-0.5">
                        {note.title}
                      </h4>
                    </div>
                    <ArrowRight className="w-4 h-4 text-medium-500 group-hover:text-white shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
