"use client";

import React, { useState, useEffect, useMemo } from "react";
import { calculateGematria, GematriaResult, THELEMIC_GEMATRIA_DICTIONARY } from "@/lib/gematria";
import { MagickEntry } from "@/lib/types";
import { Calculator, Sparkles, BookOpen, Search, X, Check, Copy, ArrowRight } from "lucide-react";
import { EstrelaDeThelema } from "@/components/ThelemicIcons";

interface GematriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
  allEntries?: MagickEntry[];
  onInsertGematriaNote?: (markdown: string) => void;
  onSelectEntry?: (entry: MagickEntry) => void;
}

export function GematriaModal({
  isOpen,
  onClose,
  initialText = "",
  allEntries = [],
  onInsertGematriaNote,
  onSelectEntry,
}: GematriaModalProps) {
  const [inputText, setInputText] = useState(initialText);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
    }
  }, [initialText]);

  const result: GematriaResult = useMemo(() => {
    return calculateGematria(inputText);
  }, [inputText]);

  // Buscar notas no diário que compartilham o mesmo número ou título equivalente
  const matchingEntries = useMemo(() => {
    if (!result || result.primaryValue === 0) return [];
    const targetVal = result.primaryValue;

    return allEntries.filter((e) => {
      // 1. Título bate com valor
      const titleRes = calculateGematria(e.title);
      if (
        titleRes.primaryValue === targetVal ||
        titleRes.hebrew === targetVal ||
        titleRes.greek === targetVal ||
        titleRes.englishSimple === targetVal ||
        titleRes.englishALW === targetVal
      ) {
        return true;
      }

      // 2. Tags possuem o número
      if (e.tags?.some((t) => t.includes(targetVal.toString()))) {
        return true;
      }

      return false;
    });
  }, [result, allEntries]);

  if (!isOpen) return null;

  const handleInsert = () => {
    if (!onInsertGematriaNote || !result.text) return;

    let md = `\n> 🔤 **Gematria Cabalística & Thelêmica de "${result.text}":**\n`;
    md += `> - **Valor Principal:** \`${result.primaryValue}\`\n`;
    if (result.hebrew > 0) md += `> - Hebraico: \`${result.hebrew}\`\n`;
    if (result.greek > 0) md += `> - Grego (Isopsefia): \`${result.greek}\`\n`;
    if (result.englishSimple > 0) md += `> - Inglês Simples: \`${result.englishSimple}\`\n`;
    if (result.englishALW > 0) md += `> - Cifra NAEQ (Liber AL): \`${result.englishALW}\`\n`;

    if (result.correspondences.length > 0) {
      md += `> \n> **Correspondências no Liber 777:**\n`;
      result.correspondences.forEach((c) => {
        md += `> - *${c.number}:* ${c.word} — ${c.meaning}\n`;
      });
    }
    md += `\n`;

    onInsertGematriaNote(md);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-medium-850 border border-medium-700 w-full max-w-2xl rounded-2xl flex flex-col shadow-2xl overflow-hidden max-h-[85vh]">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-medium-700 flex items-center justify-between bg-medium-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Calculator className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Calculadora de Gematria Thelêmica</span>
              </h3>
              <span className="text-[10px] font-mono text-medium-400">
                Sepher Sephiroth · Liber 777 · Isopsefia & NAEQ
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-medium-400 hover:text-white rounded hover:bg-medium-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Campo de Entrada */}
        <div className="p-4 border-b border-medium-700/80 bg-medium-900/30">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-medium-400" />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite uma palavra, frase, nome divino ou número (ex: Thelema, Babalon, 93, אחד)..."
              className="w-full bg-medium-800 border border-medium-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-medium-500 focus:outline-none focus:border-amber-400 font-sans"
              autoFocus
            />
          </div>
        </div>

        {/* Painel de Resultados */}
        <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar">
          {result.text ? (
            <>
              {/* Cards de Valores Numéricos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                <div className="p-3 rounded-xl bg-medium-800 border border-medium-750 flex flex-col justify-between">
                  <span className="text-[10px] text-medium-400 uppercase tracking-wide">Inglês Simples</span>
                  <div className="text-xl font-bold text-white mt-1">{result.englishSimple}</div>
                  <span className="text-[9px] text-medium-500 mt-1">A=1...Z=26</span>
                </div>

                <div className="p-3 rounded-xl bg-medium-800 border border-amber-500/30 flex flex-col justify-between">
                  <span className="text-[10px] text-amber-400 uppercase tracking-wide">NAEQ (Liber AL)</span>
                  <div className="text-xl font-bold text-amber-300 mt-1">{result.englishALW}</div>
                  <span className="text-[9px] text-medium-500 mt-1">Ordem ALW (Salto 11)</span>
                </div>

                <div className="p-3 rounded-xl bg-medium-800 border border-medium-750 flex flex-col justify-between">
                  <span className="text-[10px] text-medium-400 uppercase tracking-wide">Grego (Isopsefia)</span>
                  <div className="text-xl font-bold text-white mt-1">{result.greek || "—"}</div>
                  <span className="text-[9px] text-medium-500 mt-1">Α=1...Ω=800</span>
                </div>

                <div className="p-3 rounded-xl bg-medium-800 border border-medium-750 flex flex-col justify-between">
                  <span className="text-[10px] text-medium-400 uppercase tracking-wide">Hebraico Regular</span>
                  <div className="text-xl font-bold text-white mt-1">{result.hebrew || "—"}</div>
                  <span className="text-[9px] text-medium-500 mt-1">א=1...ת=400</span>
                </div>
              </div>

              {/* Destaque Principal Thelêmico */}
              {result.primaryValue > 0 && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-medium-800 to-amber-950/40 border border-amber-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                      Valor Cabalístico em Destaque
                    </span>
                    <h4 className="text-2xl font-mono font-black text-white mt-0.5 flex items-center gap-2">
                      <span>{result.primaryValue}</span>
                      <span className="text-xs font-sans text-amber-300 font-normal">
                        ({result.text})
                      </span>
                    </h4>
                  </div>
                  <div className="text-right font-mono text-xs text-medium-400">
                    <div>Sumeriano (x6): <strong className="text-white">{result.englishSumerian}</strong></div>
                  </div>
                </div>
              )}

              {/* Correspondências Canônicas no Liber 777 */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Correspondências no Liber 777 & Tradição Thelêmica</span>
                </h4>

                {result.correspondences.length > 0 ? (
                  <div className="space-y-2">
                    {result.correspondences.map((c, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-medium-800 border border-medium-750 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-400 text-sm">{c.number}</span>
                            <span className="font-semibold text-white">{c.word}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-medium-750 text-medium-400">
                              {c.language}
                            </span>
                          </div>
                          <p className="text-medium-300 font-serif italic text-[11px]">{c.meaning}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-medium-800/40 border border-medium-750/60 text-center text-xs text-medium-400 font-mono">
                    Nenhuma palavra canônica direta associada no índice preliminar de {result.primaryValue}.
                  </div>
                )}
              </div>

              {/* Notas do Diário Sincrônicas com este Número */}
              {matchingEntries.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-medium-750">
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Notas Sincrônicas no seu Diário ({matchingEntries.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {matchingEntries.slice(0, 5).map((e) => (
                      <div
                        key={e.id}
                        onClick={() => {
                          if (onSelectEntry) {
                            onSelectEntry(e);
                            onClose();
                          }
                        }}
                        className="p-2.5 rounded-lg bg-medium-800 hover:bg-medium-750 border border-medium-700/80 flex items-center justify-between cursor-pointer transition-colors text-xs group"
                      >
                        <span className="font-medium text-white group-hover:text-amber-300 truncate">
                          {e.title}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-medium-500 group-hover:text-white shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 space-y-2">
              <Calculator className="w-8 h-8 text-medium-500 mx-auto" />
              <p className="text-xs font-mono text-medium-400">
                Digite um nome divino, palavra ou frase para calcular o valor cabalístico.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                {["Thelema", "Agape", "Babalon", "Abrahadabra", "Hadit", "Nuit", "Ra-Hoor-Khuit"].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setInputText(w)}
                    className="px-2.5 py-1 rounded-full bg-medium-800 hover:bg-medium-750 border border-medium-700 text-xs text-medium-300 hover:text-white font-mono transition-colors"
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Ações */}
        <div className="p-4 border-t border-medium-700 bg-medium-900/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-medium-400 hover:text-white"
          >
            Fechar
          </button>

          {onInsertGematriaNote && result.text && (
            <button
              type="button"
              onClick={handleInsert}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-medium-200 text-black text-xs font-bold rounded-lg shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Inserir no Diário</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
