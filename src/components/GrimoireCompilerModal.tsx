"use client";

import React, { useState, useMemo } from "react";
import { MagickEntry, CategoryName, normalizeCategory } from "@/lib/types";
import { formatDateTimeBR, getInfluenceCategoryLabel } from "@/lib/dateUtils";
import { BookOpen, Printer, X, Check, Filter, Download, Sparkles, FileText, Calendar } from "lucide-react";

interface GrimoireCompilerModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: MagickEntry[];
}

export function GrimoireCompilerModal({ isOpen, onClose, entries }: GrimoireCompilerModalProps) {
  const [grimoireTitle, setGrimoireTitle] = useState("LIBER MEMORIAE VEL OPERIS");
  const [grimoireSubtitle, setGrimoireSubtitle] = useState("Diário e Registro de Operações Mágickas");
  const [magusMotto, setMagusMotto] = useState("Frater Thelema");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Prática",
    "Sonho",
    "Oráculo",
    "Estudo",
    "Diário",
    "Visão Astral",
  ]);
  const [sortBy, setSortBy] = useState<"date_asc" | "date_desc" | "category">("date_asc");

  // Filtragem e Ordenação
  const filteredEntries = useMemo(() => {
    let result = entries.filter((e) => {
      const cat = normalizeCategory(e.type);
      return selectedCategories.includes(cat);
    });

    if (sortBy === "date_asc") {
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === "date_desc") {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === "category") {
      result.sort((a, b) => normalizeCategory(a.type).localeCompare(normalizeCategory(b.type)));
    }

    return result;
  }, [entries, selectedCategories, sortBy]);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[92vh] bg-medium-900 border border-medium-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-medium-100">
        
        {/* Header de Controle (Não impresso no PDF) */}
        <div className="no-print p-4 border-b border-medium-800 bg-medium-850 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-white tracking-wide">
                Compilador de Grimório Thelêmico (Livro Sagrado)
              </h3>
              <p className="text-xs text-medium-400">
                Diagramação para impressão em folha A4 e salvamento em PDF com capa clássica e sumário.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-medium-400 hover:text-white rounded-lg hover:bg-medium-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Opções e Filtros (Não impresso) */}
        <div className="no-print p-3 border-b border-medium-800 bg-medium-900/90 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-medium-400 text-[11px] uppercase">Categorias:</span>
            {["Prática", "Sonho", "Oráculo", "Estudo", "Diário", "Visão Astral"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-2 py-1 rounded text-[11px] font-mono border transition-all ${
                  selectedCategories.includes(cat)
                    ? "bg-amber-400/20 text-amber-200 border-amber-500/40 font-semibold"
                    : "bg-medium-800 text-medium-400 border-medium-700 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-medium-400">Ordem:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-medium-800 border border-medium-700 rounded px-2 py-1 text-white focus:outline-none"
              >
                <option value="date_asc">Mais antigas primeiro (Cronológico)</option>
                <option value="date_desc">Mais recentes primeiro</option>
                <option value="category">Por Categoria</option>
              </select>
            </div>
            <span className="font-mono text-[11px] text-amber-300 font-semibold">
              {filteredEntries.length} notas inclusas
            </span>
          </div>
        </div>

        {/* Livro Compilado (Área Imprimível / Pré-visualização) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-10 bg-neutral-900 custom-scrollbar print:bg-white print:p-0 print:m-0 print:overflow-visible">
          
          <div className="max-w-[760px] mx-auto bg-stone-900/80 print:bg-white print:text-black border border-stone-800 print:border-none rounded-xl p-8 sm:p-14 shadow-2xl text-stone-200 print:shadow-none space-y-12">
            
            {/* CAPA DO GRIMÓRIO */}
            <div className="min-h-[700px] flex flex-col justify-between items-center text-center border-4 border-double border-amber-500/40 print:border-black p-10 print:p-8 rounded-lg page-break-after">
              <div className="space-y-3 pt-6">
                <div className="text-amber-400 print:text-black text-2xl font-serif">☉</div>
                <div className="text-xs font-mono tracking-[0.3em] uppercase text-stone-400 print:text-stone-600">
                  A.'.A.'. · SUB FIGURA CMLXIII
                </div>
                <input
                  type="text"
                  value={grimoireTitle}
                  onChange={(e) => setGrimoireTitle(e.target.value)}
                  className="no-print w-full text-center bg-transparent border-b border-dashed border-amber-500/40 text-2xl sm:text-3xl font-serif font-bold text-amber-300 uppercase tracking-widest focus:outline-none"
                />
                <h1 className="hidden print:block text-3xl font-serif font-bold text-black uppercase tracking-widest">
                  {grimoireTitle}
                </h1>
                <input
                  type="text"
                  value={grimoireSubtitle}
                  onChange={(e) => setGrimoireSubtitle(e.target.value)}
                  className="no-print w-full text-center bg-transparent text-sm italic font-serif text-stone-300 focus:outline-none"
                />
                <p className="hidden print:block text-base italic font-serif text-stone-700">
                  {grimoireSubtitle}
                </p>
              </div>

              {/* Selo Hermético Central */}
              <div className="my-10 relative flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border border-amber-500/30 print:border-black flex items-center justify-center">
                  <span className="text-5xl font-serif text-amber-400 print:text-black">⛤</span>
                </div>
              </div>

              {/* Rodapé da Capa */}
              <div className="space-y-4 pb-6">
                <div className="text-xs font-serif tracking-widest text-stone-400 print:text-stone-800">
                  REGISTRO PESSOAL DE
                </div>
                <input
                  type="text"
                  value={magusMotto}
                  onChange={(e) => setMagusMotto(e.target.value)}
                  className="no-print text-center bg-transparent border-b border-stone-600 text-lg font-serif font-bold text-amber-200 focus:outline-none"
                />
                <div className="hidden print:block text-lg font-serif font-bold text-black">
                  {magusMotto}
                </div>
                <div className="text-[11px] font-mono tracking-wider text-stone-500 print:text-stone-600">
                  "O Método da Ciência, o Objetivo da Religião."
                </div>
                <div className="text-[10px] font-mono text-stone-600 print:text-stone-500 pt-2">
                  ANNO DOMINI {currentYear} e.v.
                </div>
              </div>
            </div>

            {/* SUMÁRIO / ÍNDICE */}
            <div className="pt-8 border-t border-stone-800 print:border-black page-break-after">
              <h2 className="text-xl font-serif font-bold text-center tracking-widest text-amber-300 print:text-black uppercase mb-8">
                Tábua de Conteúdos
              </h2>
              <div className="space-y-3 font-serif text-sm">
                {filteredEntries.map((entry, idx) => (
                  <div
                    key={entry.id}
                    className="flex items-baseline justify-between gap-2 border-b border-stone-800/60 print:border-stone-300 pb-1"
                  >
                    <span className="text-amber-400/80 print:text-stone-600 font-mono text-xs w-8 shrink-0">
                      {(idx + 1).toString().padStart(2, "0")}.
                    </span>
                    <span className="font-semibold text-stone-200 print:text-black truncate flex-1">
                      {entry.title}
                    </span>
                    <span className="text-xs font-mono text-stone-400 print:text-stone-600 shrink-0">
                      {normalizeCategory(entry.type)} · {formatDateTimeBR(entry.date)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CORPO DE NOTAS / CAPÍTULOS */}
            <div className="space-y-16">
              {filteredEntries.map((entry, idx) => (
                <article
                  key={entry.id}
                  className="page-break-before pt-8 border-t-2 border-amber-500/20 print:border-black space-y-4"
                >
                  {/* Cabeçalho do Capítulo */}
                  <div className="border-b border-stone-800 print:border-stone-400 pb-3">
                    <div className="flex items-center justify-between text-xs font-mono text-amber-400/80 print:text-stone-600 mb-1">
                      <span>CAPÍTULO {(idx + 1).toString().padStart(2, "0")} · {normalizeCategory(entry.type)}</span>
                      <span>{formatDateTimeBR(entry.date, " às ")}</span>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-amber-200 print:text-black">
                      {entry.title}
                    </h3>
                    {entry.thelemic_date && (
                      <p className="text-xs font-serif italic text-stone-400 print:text-stone-700 mt-1">
                        ☉ {entry.thelemic_date}
                        {entry.moon_sign && ` · ☽ em ${entry.moon_sign}`}
                        {entry.moon_phase && ` (${entry.moon_phase})`}
                        {entry.planetary_day && ` · ${entry.planetary_day}`}
                      </p>
                    )}
                    {entry.influences && entry.influences.length > 0 && (
                      <p className="text-[11px] font-mono text-stone-400 print:text-stone-700 mt-1.5">
                        777: {entry.influences.map((inf) => `${getInfluenceCategoryLabel(inf.category)}: ${inf.name}`).join(" · ")}
                      </p>
                    )}
                  </div>

                  {/* Conteúdo da Nota Formatado */}
                  <div className="font-serif text-sm leading-relaxed text-stone-300 print:text-stone-900 whitespace-pre-wrap selection:bg-amber-500/30">
                    {entry.content
                      .replace(/\[\[(.*?)(?:\|(.*?))?\]\]/g, "$2$1")
                      .replace(/\*\*(.*?)\*\*/g, "$1")
                      .replace(/\*(.*?)\*/g, "$1")}
                  </div>

                  {/* Rodapé da Nota */}
                  {(entry.success_rating !== undefined && entry.success_rating !== null) && (
                    <div className="pt-2 text-xs font-mono text-stone-500 print:text-stone-600 flex items-center justify-between border-t border-stone-800/40 print:border-stone-300">
                      <span>Sucesso Mágicko: {entry.success_rating}/10</span>
                      {entry.oracle_data?.query && <span>Pergunta Oracular: "{entry.oracle_data.query}"</span>}
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* FECHAMENTO DO LIVRO */}
            <div className="page-break-before text-center py-16 space-y-4 border-t border-stone-800 print:border-black">
              <div className="text-amber-400 print:text-black text-3xl font-serif">∴</div>
              <div className="text-sm font-serif italic text-stone-300 print:text-stone-800">
                "Faze o que tu queres há de ser tudo da Lei."
              </div>
              <div className="text-sm font-serif italic text-stone-300 print:text-stone-800">
                "Amor é a lei, amor sob vontade."
              </div>
              <div className="text-xs font-mono tracking-widest text-stone-500 print:text-stone-600 pt-4">
                FIM DO REGISTRO
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Estilos Globais para Impressão e Quebra de Página */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break-before {
            page-break-before: always !important;
            break-before: page !important;
          }
          .page-break-after {
            page-break-after: always !important;
            break-after: page !important;
          }
        }
      `}</style>
    </div>
  );
}
