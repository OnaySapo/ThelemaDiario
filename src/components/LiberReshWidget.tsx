"use client";

import React, { useEffect, useState } from "react";
import { getReshSolarTide, getLiberReshFullText, ReshTideInfo } from "@/lib/astronomy";
import { Compass, Clock, Sun, Sparkles, BookOpen, Check, Copy } from "lucide-react";
import { EstrelaDeThelema } from "@/components/ThelemicIcons";

interface LiberReshWidgetProps {
  onInsertAdoration?: (markdown: string) => void;
  className?: string;
}

export function LiberReshWidget({ onInsertAdoration, className = "" }: LiberReshWidgetProps) {
  const [tide, setTide] = useState<ReshTideInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const updateTide = () => {
      setTide(getReshSolarTide(new Date()));
    };
    updateTide();
    const interval = setInterval(updateTide, 60000); // atualizar a cada minuto
    return () => clearInterval(interval);
  }, []);

  if (!tide) return null;

  const fullText = getLiberReshFullText(tide.station);

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText.fullMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-4 rounded-xl bg-medium-850 border border-medium-700 select-none relative overflow-hidden ${className}`}>
      {/* Glow de Fundo Sutil */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Informações da Estação Solar Atual */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 shadow-sm shrink-0">
            <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Liber Resh vel Helios
              </span>
              <span className="text-[11px] font-mono text-medium-400 flex items-center gap-1">
                <Compass className="w-3 h-3 text-medium-400" />
                <span>Voltado ao {tide.direction}</span>
              </span>
            </div>

            <h3 className="text-sm font-sans font-bold text-white tracking-tight mt-0.5 flex items-center gap-1.5">
              <span>{tide.thelemicGod}</span>
              <span className="text-xs text-amber-400 font-mono">({tide.hourRange})</span>
            </h3>
          </div>
        </div>

        {/* Contagem Regressiva & Ações */}
        <div className="flex items-center gap-2">
          <div className="text-right font-mono text-xs hidden sm:block mr-1">
            <span className="text-medium-400 block text-[10px]">Próxima Estação:</span>
            <span className="text-medium-200">
              {tide.nextStation} em <strong className="text-amber-400">{formatMinutes(tide.minutesToNext)}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-medium-800 hover:bg-medium-750 text-medium-200 hover:text-white border border-medium-700 text-xs font-mono transition-colors"
            title="Abrir oração canônica completa e sinal mágico"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Ver Adoração</span>
          </button>

          {onInsertAdoration && (
            <button
              type="button"
              onClick={() => onInsertAdoration(fullText.fullMarkdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-medium-200 text-black text-xs font-semibold shadow-sm transition-colors"
              title="Inserir Adoração no Diário / Nota Ativa"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Registrar Adoração</span>
            </button>
          )}
        </div>
      </div>

      {/* Salvação Rápida / Citação Canônica */}
      <div className="mt-3 pt-2.5 border-t border-medium-750/70 flex items-center justify-between text-xs text-medium-300 font-serif italic">
        <p className="truncate mr-4">"{tide.salutation}"</p>
        <span className="text-[10px] font-mono text-amber-400/80 not-italic shrink-0">
          ∴ 93 93/93 ∴
        </span>
      </div>

      {/* Modal da Oração Completa com Sinal Mágico */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-medium-850 border border-medium-700 w-full max-w-xl rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-medium-700 flex items-center justify-between bg-medium-900/50">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-sans font-bold text-white uppercase tracking-wide">
                  Liber Resh vel Helios — {fullText.god}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-medium-400 hover:text-white text-xs font-mono px-2 py-1 rounded hover:bg-medium-800"
              >
                Fechar (Esc)
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[75vh] space-y-4 text-sm font-sans text-medium-200 leading-relaxed custom-scrollbar">
              <div className="p-3 rounded-lg bg-medium-800/80 border border-medium-750 font-mono text-xs space-y-1">
                <div><span className="text-medium-400">Orientação:</span> <strong className="text-white">{fullText.direction}</strong></div>
                <div><span className="text-medium-400">Postura & Sinal:</span> <strong className="text-amber-300">{fullText.sign}</strong></div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 font-serif text-amber-100 italic text-base leading-relaxed">
                "{fullText.adoration}"
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-mono font-bold text-medium-400 uppercase tracking-wider">
                  Adoração da Unidade (Após o Sinal do Silêncio):
                </h5>
                <blockquote className="p-3 rounded-lg bg-medium-800/50 border-l-2 border-amber-400 font-serif text-sm text-medium-300 whitespace-pre-line leading-relaxed">
                  {fullText.unityAdoration}
                </blockquote>
              </div>
            </div>

            <div className="p-4 border-t border-medium-700 bg-medium-900/50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-medium-800 hover:bg-medium-750 text-white text-xs font-mono border border-medium-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                <span>{copied ? "Copiado!" : "Copiar Texto"}</span>
              </button>

              {onInsertAdoration && (
                <button
                  type="button"
                  onClick={() => {
                    onInsertAdoration(fullText.fullMarkdown);
                    setIsModalOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-medium-200 text-black text-xs font-bold rounded-lg shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Inserir no Diário</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
