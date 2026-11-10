"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  BookOpen,
  Compass,
  Layers,
  Check,
  Search,
  ArrowRight,
  Database,
  Network,
  Flame,
} from "lucide-react";
import {
  ExperienceLevel,
  EXPERIENCE_PROFILES,
  GLOSSARY_DICTIONARY,
  GUIDED_CREATION_CARDS,
  GuidedCreationOption,
  markOnboardingCompleted,
} from "@/lib/glossary";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  experienceLevel: ExperienceLevel;
  onChangeExperienceLevel: (level: ExperienceLevel) => void;
  onStartGuidedNote?: (card: GuidedCreationOption) => void;
}

export function OnboardingModal({
  isOpen,
  onClose,
  experienceLevel,
  onChangeExperienceLevel,
  onStartGuidedNote,
}: OnboardingModalProps) {
  const [activeTab, setActiveTab] = useState<"tour" | "glossario" | "criar">("tour");
  const [glossarySearch, setGlossarySearch] = useState("");
  const [selectedTradition, setSelectedTradition] = useState<string>("all");

  if (!isOpen) return null;

  const handleClose = () => {
    markOnboardingCompleted();
    onClose();
  };

  const filteredGlossary = GLOSSARY_DICTIONARY.filter((item) => {
    const matchesTradition = selectedTradition === "all" || item.tradition === selectedTradition;
    const q = glossarySearch.trim().toLowerCase();
    if (!q) return matchesTradition;
    return (
      matchesTradition &&
      (item.term.toLowerCase().includes(q) ||
        item.shortPlainMeaning.toLowerCase().includes(q) ||
        item.detailedExplanation.toLowerCase().includes(q) ||
        (item.brazilianBridge || "").toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q)))
    );
  });

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-xl border border-medium-750 bg-medium-900 text-medium-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Minimalista */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-medium-800 bg-medium-850">
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-white" />
            <div>
              <h2 className="text-sm font-semibold text-white">
                Guia Rápido & Glossário
              </h2>
              <p className="text-[11px] text-medium-400">
                Conheça o funcionamento do programa e consulte o significado dos termos.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-medium-400 hover:text-white hover:bg-medium-800 transition-colors"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-2 border-b border-medium-800 bg-medium-900">
          <button
            onClick={() => setActiveTab("tour")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "tour"
                ? "bg-medium-800 text-white"
                : "text-medium-400 hover:text-white"
            }`}
          >
            <Compass size={13} />
            Como Usar
          </button>
          <button
            onClick={() => setActiveTab("glossario")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "glossario"
                ? "bg-medium-800 text-white"
                : "text-medium-400 hover:text-white"
            }`}
          >
            <BookOpen size={13} />
            Glossário de Termos
          </button>
          <button
            onClick={() => setActiveTab("criar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "criar"
                ? "bg-medium-800 text-white"
                : "text-medium-400 hover:text-white"
            }`}
          >
            <Sparkles size={13} />
            Modelos de Nota
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === "tour" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-medium-850 border border-medium-800 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <Flame size={15} />
                  <span>1. Escrita Limpa e Sem Distrações</span>
                </div>
                <p className="text-xs text-medium-300 leading-relaxed">
                  Ao editar uma nota, as propriedades (Data, Avaliação, Correspondências e Mesa Oracular) ficam recolhidas em pílulas discretas no topo. Digite <code className="px-1 py-0.5 rounded bg-medium-800 text-white">/</code> no texto para inserir imagens, áudio ou cartas de Tarot.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-medium-850 border border-medium-800 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <Sparkles size={15} />
                  <span>2. Correspondências (777 & Brasilidade)</span>
                </div>
                <p className="text-xs text-medium-300 leading-relaxed">
                  Você pode marcar Orixás, Guias, Banhos de Ervas (Ewê), Planetas ou Sephiroth na nota — ou simplesmente escrever normalmente, pois o programa reconhece os símbolos automaticamente no texto.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-medium-850 border border-medium-800 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <Network size={15} />
                  <span>3. Cruzamento de Dados & Sincronicidades</span>
                </div>
                <p className="text-xs text-medium-300 leading-relaxed">
                  Na aba <strong>Dados</strong> da barra lateral, cruze quaisquer duas variáveis (como Fase da Lua × Categoria ou Orixá × Eficácia) e veja fios de sincronicidade entre seus Oráculos, Sonhos e Práticas.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-medium-850 border border-medium-800 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <Database size={15} />
                  <span>4. Banco de Dados Local (.db)</span>
                </div>
                <p className="text-xs text-medium-300 leading-relaxed">
                  Suas notas e mídias ficam salvas localmente no seu computador. Pelo botão <strong>Trocar</strong> no topo da barra lateral, você pode escolher a pasta ou alternar entre bancos de dados.
                </p>
              </div>
            </div>
          )}

          {activeTab === "glossario" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-medium-500" />
                  <input
                    type="text"
                    value={glossarySearch}
                    onChange={(e) => setGlossarySearch(e.target.value)}
                    placeholder="Buscar termo (ex: Ori, Ewê, Sephirah, Liber 777, Dharana)..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-medium-850 border border-medium-750 text-xs text-white focus:outline-none focus:border-medium-500"
                  />
                </div>
                <select
                  value={selectedTradition}
                  onChange={(e) => setSelectedTradition(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-medium-850 border border-medium-750 text-xs text-medium-200 focus:outline-none"
                >
                  <option value="all">Todas as Tradições</option>
                  <option value="Matriz Brasileira">Matriz Brasileira</option>
                  <option value="Thelema & Hermetismo">Thelema & Hermetismo</option>
                  <option value="Kabbalah">Kabbalah & Árvore da Vida</option>
                  <option value="Astrologia & Oráculo">Astrologia & Oráculo</option>
                  <option value="Prática & Sonhos">Prática & Sonhos</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredGlossary.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-medium-850 border border-medium-800 flex flex-col justify-between space-y-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-xs font-semibold text-white">{item.term}</h4>
                        <span className="text-[10px] font-mono text-medium-400">
                          {item.tradition}
                        </span>
                      </div>
                      <p className="text-xs text-medium-200 mb-1.5">{item.shortPlainMeaning}</p>
                      <p className="text-[11px] text-medium-400 leading-relaxed">{item.detailedExplanation}</p>
                    </div>

                    {item.brazilianBridge && (
                      <div className="pt-2 border-t border-medium-800 text-[11px] text-medium-300">
                        <strong className="text-white">Conexão Brasileira:</strong> {item.brazilianBridge}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "criar" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {GUIDED_CREATION_CARDS.map((card) => (
                <button
                  key={card.id}
                  onClick={() => {
                    if (onStartGuidedNote) onStartGuidedNote(card);
                    handleClose();
                  }}
                  className="text-left p-4 rounded-xl bg-medium-850 hover:bg-medium-800 border border-medium-800 hover:border-medium-600 transition-colors group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg">{card.icon}</span>
                      <span className="text-[10px] font-mono uppercase text-medium-400">
                        {card.category}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-white mb-1">{card.title}</h4>
                    <p className="text-[11px] text-medium-400 leading-relaxed">{card.subtitle}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-medium-800 flex items-center justify-between text-[11px] text-white font-medium">
                    <span>Criar nota</span>
                    <ArrowRight size={12} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-medium-800 bg-medium-850">
          <button
            onClick={handleClose}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-medium-200 text-black text-xs font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
