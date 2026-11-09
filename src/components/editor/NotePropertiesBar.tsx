"use client";

import React, { useState } from "react";
import { CategoryName } from "@/lib/types";
import { BrazilianDateTimeInput } from "@/components/BrazilianDateTimeInput";
import { formatDateTimeBR, getInfluenceCategoryLabel } from "@/lib/dateUtils";
import { Calendar, Star, Tag, Sparkles, Plus, X, ChevronDown, ChevronUp } from "lucide-react";

interface NotePropertiesBarProps {
  editCategory: CategoryName;
  onChangeCategory: (newCat: CategoryName) => void;
  editDate: string;
  onChangeDate: (newDate: string) => void;
  hasRating: boolean;
  onToggleHasRating: () => void;
  editRating: number;
  onChangeRating: (val: number) => void;
  editInfluences: { category: string; name: string }[];
  newInfCat: string;
  onChangeNewInfCat: (cat: string) => void;
  newInfVal: string;
  onChangeNewInfVal: (val: string) => void;
  onAddInfluence: (presetValue?: string) => void;
  onRemoveInfluence: (idx: number) => void;
  presetsMap: Record<string, string[]>;
  hasOracleTable: boolean;
  onToggleOracleTable: () => void;
}

export function NotePropertiesBar({
  editCategory,
  onChangeCategory,
  editDate,
  onChangeDate,
  hasRating,
  onToggleHasRating,
  editRating,
  onChangeRating,
  editInfluences,
  newInfCat,
  onChangeNewInfCat,
  newInfVal,
  onChangeNewInfVal,
  onAddInfluence,
  onRemoveInfluence,
  presetsMap,
  hasOracleTable,
  onToggleOracleTable,
}: NotePropertiesBarProps) {
  const [activeDrawer, setActiveDrawer] = useState<"none" | "date" | "rating" | "influences">("none");

  const toggleDrawer = (drawer: "date" | "rating" | "influences") => {
    setActiveDrawer((prev) => (prev === drawer ? "none" : drawer));
  };

  return (
    <div className="space-y-2.5">
      {/* Faixa Horizontal de Pílulas de Propriedades (Estilo Linear / Notion — Despoluído) */}
      <div className="flex flex-wrap items-center gap-2 py-1.5">
        {/* 1. Pílula Seletora de Categoria */}
        <div className="inline-flex items-center rounded-lg bg-medium-850 border border-medium-700 px-2.5 py-1 text-xs text-white">
          <span className="text-[10px] font-mono uppercase text-medium-400 mr-1.5">Tipo:</span>
          <select
            value={editCategory}
            onChange={(e) => onChangeCategory(e.target.value as CategoryName)}
            className="bg-transparent text-xs font-semibold text-amber-300 focus:outline-none cursor-pointer"
          >
            <option value="Diário" className="bg-medium-900 text-white">
              📓 Diário (Cotidiano)
            </option>
            <option value="Sonho" className="bg-medium-900 text-white">
              🌙 Sonho
            </option>
            <option value="Oráculo" className="bg-medium-900 text-white">
              🃏 Oráculo / Tarot
            </option>
            <option value="Prática" className="bg-medium-900 text-white">
              🔥 Prática / Ritual / Banho
            </option>
            <option value="Visão Astral" className="bg-medium-900 text-white">
              👁️ Visão Astral
            </option>
            <option value="Estudo" className="bg-medium-900 text-white">
              📜 Estudo & Fundamento
            </option>
          </select>
        </div>

        {/* 2. Pílula de Data e Hora (DD/MM/AA 24h) */}
        <button
          type="button"
          onClick={() => toggleDrawer("date")}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
            activeDrawer === "date"
              ? "bg-amber-500/20 border-amber-400 text-amber-200"
              : "bg-medium-850 hover:bg-medium-800 border-medium-700 text-medium-200 hover:text-white"
          }`}
          title="Clique para ajustar a Data (DD/MM/AA) e Hora (24h)"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>{formatDateTimeBR(editDate)}</span>
          {activeDrawer === "date" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {/* 3. Pílula de Avaliação de Sucesso / Eficácia */}
        <button
          type="button"
          onClick={() => toggleDrawer("rating")}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
            activeDrawer === "rating"
              ? "bg-amber-500/20 border-amber-400 text-amber-200"
              : hasRating
              ? "bg-medium-850 hover:bg-medium-800 border-amber-500/30 text-amber-300"
              : "bg-medium-850 hover:bg-medium-800 border-medium-700 text-medium-400 hover:text-white"
          }`}
          title="Avaliar eficácia ou intensidade da experiência (0 a 10)"
        >
          <Star className={`w-3.5 h-3.5 ${hasRating ? "fill-amber-400 text-amber-400" : "text-medium-400"}`} />
          <span>{hasRating ? `Eficácia: ${editRating}/10` : "Avaliar (Opcional)"}</span>
          {activeDrawer === "rating" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {/* 4. Pílula de Correspondências (Liber 777 & Brasilidade) */}
        <button
          type="button"
          onClick={() => toggleDrawer("influences")}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
            activeDrawer === "influences"
              ? "bg-emerald-500/20 border-emerald-400 text-emerald-200"
              : editInfluences.length > 0
              ? "bg-emerald-950/30 hover:bg-emerald-900/40 border-emerald-500/40 text-emerald-300"
              : "bg-medium-850 hover:bg-medium-800 border-medium-700 text-medium-200 hover:text-white"
          }`}
          title="Adicionar Orixás, Guias, Banhos de Ervas, Entidades, Cores, Planetas ou Sephiroth"
        >
          <Tag className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            Correspondências 777 & Brasilis
            {editInfluences.length > 0 ? ` (${editInfluences.length})` : " +"}
          </span>
          {activeDrawer === "influences" ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>

        {/* 5. Pílula da Mesa Oracular */}
        <button
          type="button"
          onClick={onToggleOracleTable}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
            hasOracleTable
              ? "bg-purple-500/20 border-purple-400 text-purple-200"
              : "bg-medium-850 hover:bg-medium-800 border-medium-700 text-medium-300 hover:text-white"
          }`}
          title="Abrir ou recolher a Mesa de Tarot / Oráculo nesta nota"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>{hasOracleTable ? "Mesa Oracular Ativa" : "+ Mesa Oracular"}</span>
        </button>
      </div>

      {/* Chips Resumidos das Correspondências já adicionadas (sempre visíveis de forma limpa quando a gaveta está fechada) */}
      {activeDrawer !== "influences" && editInfluences.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          {editInfluences.map((inf, idx) => (
            <span
              key={`${inf.category}-${inf.name}-${idx}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-medium-850 border border-amber-500/25 text-[11px] font-mono text-amber-200"
            >
              <span className="text-medium-400">{getInfluenceCategoryLabel(inf.category)}:</span>
              <span>{inf.name}</span>
              <button
                type="button"
                onClick={() => onRemoveInfluence(idx)}
                className="ml-0.5 text-medium-400 hover:text-red-400"
                title="Remover"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* GAVETA 1: DATA E HORA */}
      {activeDrawer === "date" && (
        <div className="p-3.5 rounded-xl bg-medium-850 border border-medium-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div>
            <span className="text-xs font-bold text-white block">Data (DD/MM/AA) & Horário (24h)</span>
            <span className="text-[11px] text-medium-400">
              Padrão brasileiro. O cálculo lunar e planetário acompanha esta data.
            </span>
          </div>
          <div className="sm:w-72">
            <BrazilianDateTimeInput value={editDate} onChange={onChangeDate} />
          </div>
        </div>
      )}

      {/* GAVETA 2: AVALIAÇÃO DE SUCESSO / EFICÁCIA */}
      {activeDrawer === "rating" && (
        <div className="p-3.5 rounded-xl bg-medium-850 border border-medium-700 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">
              Grau de Eficácia / Lucidez {hasRating ? `(${editRating}/10)` : "(Desativado)"}
            </span>
            <button
              type="button"
              onClick={onToggleHasRating}
              className="text-xs font-mono text-amber-300 hover:underline"
            >
              {hasRating ? "Deixar sem nota" : "Ativar avaliação (0 a 10)"}
            </button>
          </div>
          {hasRating && (
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-mono text-medium-400">0</span>
              <input
                type="range"
                min={0}
                max={10}
                value={editRating}
                onChange={(e) => onChangeRating(Number(e.target.value))}
                className="flex-1 accent-amber-400 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-amber-300 w-8 text-right">
                {editRating}/10
              </span>
            </div>
          )}
        </div>
      )}

      {/* GAVETA 3: SELETOR COMPLETO DE CORRESPONDÊNCIAS (LIBER 777 & BRASILIS) */}
      {activeDrawer === "influences" && (
        <div className="p-4 rounded-xl bg-medium-850 border border-emerald-500/30 space-y-3 shadow-md animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Catalogar Forças, Orixás, Banhos de Ervas e Correspondências 777</span>
            </span>
            <button
              type="button"
              onClick={() => setActiveDrawer("none")}
              className="text-[11px] font-mono text-medium-400 hover:text-white"
            >
              Concluir ✕
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={newInfCat}
              onChange={(e) => onChangeNewInfCat(e.target.value)}
              className="bg-medium-800 border border-medium-700 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono sm:w-64"
            >
              <option value="orixa">🌿 Orixá / Vodum / Nkisi (Brasilidade)</option>
              <option value="guia">🥁 Guia / Exu / Caboclo / Mestre da Jurema</option>
              <option value="ponto_forca">⛰️ Ponto de Força / Domínio da Natureza</option>
              <option value="banho_defumacao">💨 Banho de Ervas / Defumação (Ewê)</option>
              <option value="entity">Entidade / Espírito / Inteligência</option>
              <option value="deity">Divindade / Forma-Deus</option>
              <option value="color">Cor (Escalas 777 & Velas)</option>
              <option value="element">Elemento (Fogo, Água, Ar, Terra, Espírito)</option>
              <option value="planet">Planeta / Astro</option>
              <option value="sephirah">Sephirah / Caminho da Árvore</option>
              <option value="tarot">Tarot / Atu de Thoth</option>
              <option value="incense">Incenso / Perfume / Óleo</option>
              <option value="instrument">Instrumento / Arma Mágicka</option>
              <option value="angel">Coro Angelical / Arcanjo</option>
              <option value="herb">Erva / Planta / Cristal</option>
              <option value="feeling">Estado / Emoção / Força</option>
            </select>

            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newInfVal}
                onChange={(e) => onChangeNewInfVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onAddInfluence();
                  }
                }}
                placeholder={`Digite ou clique numa sugestão abaixo (${getInfluenceCategoryLabel(newInfCat)})...`}
                className="flex-1 bg-medium-800 border border-medium-700 rounded-md px-3 py-2 text-xs text-white placeholder-medium-500 focus:outline-none focus:border-emerald-400 font-sans"
              />
              <button
                type="button"
                onClick={() => onAddInfluence()}
                className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-md text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {presetsMap[newInfCat] && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-medium-400 mr-1">
                Sugestões Rápidas ({getInfluenceCategoryLabel(newInfCat)}):
              </span>
              {presetsMap[newInfCat].map((preset) => {
                const isSelected = editInfluences.some(
                  (inf) => inf.category === newInfCat && inf.name.toLowerCase() === preset.toLowerCase()
                );
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onAddInfluence(preset)}
                    disabled={isSelected}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
                      isSelected
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 opacity-60 cursor-default"
                        : "bg-medium-800 hover:bg-medium-750 border-medium-700 hover:border-emerald-400/50 text-medium-300 hover:text-white"
                    }`}
                  >
                    + {preset}
                  </button>
                );
              })}
            </div>
          )}

          {editInfluences.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-medium-750">
              {editInfluences.map((inf, idx) => (
                <span
                  key={`${inf.category}-${inf.name}-${idx}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-medium-800 border border-emerald-500/30 text-xs font-mono text-white shadow-sm"
                >
                  <strong className="text-emerald-300">{getInfluenceCategoryLabel(inf.category)}:</strong>
                  <span>{inf.name}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveInfluence(idx)}
                    className="ml-0.5 text-medium-400 hover:text-red-400 transition-colors"
                    title="Remover correspondência"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
