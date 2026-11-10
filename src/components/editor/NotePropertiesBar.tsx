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
      {/* Faixa Horizontal Minimalista de Propriedades */}
      <div className="flex flex-wrap items-center gap-2 py-1">
        {/* 1. Categoria */}
        <div className="inline-flex items-center rounded-lg bg-medium-850 border border-medium-750 px-2.5 py-1 text-xs text-white">
          <span className="text-[10px] font-mono uppercase text-medium-400 mr-1.5">Tipo:</span>
          <select
            value={editCategory}
            onChange={(e) => onChangeCategory(e.target.value as CategoryName)}
            className="bg-transparent text-xs font-medium text-white focus:outline-none cursor-pointer"
          >
            <option value="Diário" className="bg-medium-900 text-white">
              Diário
            </option>
            <option value="Sonho" className="bg-medium-900 text-white">
              Sonho
            </option>
            <option value="Oráculo" className="bg-medium-900 text-white">
              Oráculo / Tarot
            </option>
            <option value="Prática" className="bg-medium-900 text-white">
              Prática / Ritual
            </option>
            <option value="Visão Astral" className="bg-medium-900 text-white">
              Visão Astral
            </option>
            <option value="Estudo" className="bg-medium-900 text-white">
              Estudo
            </option>
          </select>
        </div>

        {/* 2. Data e Hora */}
        <button
          type="button"
          onClick={() => toggleDrawer("date")}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
            activeDrawer === "date"
              ? "bg-medium-800 border-medium-500 text-white"
              : "bg-medium-850 hover:bg-medium-800 border-medium-750 text-medium-300 hover:text-white"
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-medium-400" />
          <span>{formatDateTimeBR(editDate)}</span>
          {activeDrawer === "date" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {/* 3. Avaliação */}
        <button
          type="button"
          onClick={() => toggleDrawer("rating")}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
            activeDrawer === "rating"
              ? "bg-medium-800 border-medium-500 text-white"
              : "bg-medium-850 hover:bg-medium-800 border-medium-750 text-medium-300 hover:text-white"
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${hasRating ? "fill-white text-white" : "text-medium-400"}`} />
          <span>{hasRating ? `${editRating}/10` : "Avaliar"}</span>
          {activeDrawer === "rating" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {/* 4. Correspondências */}
        <button
          type="button"
          onClick={() => toggleDrawer("influences")}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
            activeDrawer === "influences"
              ? "bg-medium-800 border-medium-500 text-white"
              : "bg-medium-850 hover:bg-medium-800 border-medium-750 text-medium-300 hover:text-white"
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-medium-400" />
          <span>
            Correspondências{editInfluences.length > 0 ? ` (${editInfluences.length})` : ""}
          </span>
          {activeDrawer === "influences" ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>

        {/* 5. Mesa Oracular */}
        <button
          type="button"
          onClick={onToggleOracleTable}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
            hasOracleTable
              ? "bg-medium-800 border-medium-500 text-white"
              : "bg-medium-850 hover:bg-medium-800 border-medium-750 text-medium-300 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-medium-400" />
          <span>{hasOracleTable ? "Mesa Oracular Ativa" : "+ Mesa Oracular"}</span>
        </button>
      </div>

      {/* Chips Resumidos */}
      {activeDrawer !== "influences" && editInfluences.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          {editInfluences.map((inf, idx) => (
            <span
              key={`${inf.category}-${inf.name}-${idx}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-medium-850 border border-medium-750 text-[11px] font-mono text-medium-200"
            >
              <span className="text-medium-400">{getInfluenceCategoryLabel(inf.category)}:</span>
              <span>{inf.name}</span>
              <button
                type="button"
                onClick={() => onRemoveInfluence(idx)}
                className="ml-0.5 text-medium-400 hover:text-white"
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
        <div className="p-3.5 rounded-xl bg-medium-850 border border-medium-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-white block">Data (DD/MM/AA) & Horário (24h)</span>
            <span className="text-[11px] text-medium-400">
              Padrão brasileiro. O cálculo lunar e planetário acompanha esta data.
            </span>
          </div>
          <div className="sm:w-72">
            <BrazilianDateTimeInput value={editDate} onChange={onChangeDate} />
          </div>
        </div>
      )}

      {/* GAVETA 2: AVALIAÇÃO */}
      {activeDrawer === "rating" && (
        <div className="p-3.5 rounded-xl bg-medium-850 border border-medium-750 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">
              Grau de Eficácia / Lucidez {hasRating ? `(${editRating}/10)` : "(Desativado)"}
            </span>
            <button
              type="button"
              onClick={onToggleHasRating}
              className="text-xs font-mono text-medium-300 hover:text-white underline"
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
                className="flex-1 accent-white cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-white w-8 text-right">
                {editRating}/10
              </span>
            </div>
          )}
        </div>
      )}

      {/* GAVETA 3: CORRESPONDÊNCIAS */}
      {activeDrawer === "influences" && (
        <div className="p-4 rounded-xl bg-medium-850 border border-medium-750 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-medium-400" />
              <span>Correspondências (Liber 777 & Brasilis)</span>
            </span>
            <button
              type="button"
              onClick={() => setActiveDrawer("none")}
              className="text-[11px] font-mono text-medium-400 hover:text-white"
            >
              Fechar ✕
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={newInfCat}
              onChange={(e) => onChangeNewInfCat(e.target.value)}
              className="bg-medium-900 border border-medium-750 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-medium-500 font-mono sm:w-64"
            >
              <option value="orixa">Orixá / Vodum / Nkisi</option>
              <option value="guia">Guia / Exu / Caboclo / Mestre da Jurema</option>
              <option value="ponto_forca">Ponto de Força / Natureza</option>
              <option value="banho_defumacao">Banho de Ervas / Defumação (Ewê)</option>
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
                placeholder={`Adicionar ${getInfluenceCategoryLabel(newInfCat)}...`}
                className="flex-1 bg-medium-900 border border-medium-750 rounded-md px-3 py-2 text-xs text-white placeholder-medium-500 focus:outline-none focus:border-medium-500 font-sans"
              />
              <button
                type="button"
                onClick={() => onAddInfluence()}
                className="px-3.5 py-2 bg-white hover:bg-medium-200 text-black rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {presetsMap[newInfCat] && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-medium-400 mr-1">Sugestões:</span>
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
                        ? "bg-medium-800 border-medium-600 text-medium-500 cursor-default"
                        : "bg-medium-900 hover:bg-medium-800 border-medium-750 text-medium-300 hover:text-white"
                    }`}
                  >
                    + {preset}
                  </button>
                );
              })}
            </div>
          )}

          {editInfluences.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-medium-800">
              {editInfluences.map((inf, idx) => (
                <span
                  key={`${inf.category}-${inf.name}-${idx}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-medium-900 border border-medium-750 text-xs font-mono text-white"
                >
                  <span className="text-medium-400">{getInfluenceCategoryLabel(inf.category)}:</span>
                  <span>{inf.name}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveInfluence(idx)}
                    className="ml-0.5 text-medium-400 hover:text-white"
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
