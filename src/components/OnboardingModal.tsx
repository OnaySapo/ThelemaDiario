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
  const [activeTab, setActiveTab] = useState<"modo" | "tour" | "glossario" | "criar">("modo");
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
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[88vh] flex flex-col rounded-2xl border border-white/15 bg-[#0c0c12] text-gray-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-emerald-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Compass size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide text-white flex items-center gap-2">
                Central de Boas-Vindas & Guia Interativo
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Sanctum v4.0
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Personalize o nível de detalhes da interface, conheça os recursos ou consulte o Glossário Vivo.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Fechar Guia"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-white/10 bg-black/40 overflow-x-auto">
          <button
            onClick={() => setActiveTab("modo")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "modo"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers size={14} />
            1. Modo de Interface
          </button>
          <button
            onClick={() => setActiveTab("tour")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "tour"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Compass size={14} />
            2. Como Usar (4 Passos)
          </button>
          <button
            onClick={() => setActiveTab("glossario")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "glossario"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen size={14} />
            3. Glossário Vivo (Termos)
          </button>
          <button
            onClick={() => setActiveTab("criar")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "criar"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sparkles size={14} />
            4. Criar Registro Guiado
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "modo" && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-1">
                  Escolha como você prefere visualizar o Diário
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Você pode mudar este modo a qualquer momento. Todos os seus dados, notas e cruzamentos são
                  preservados independentemente do modo escolhido — isso apenas ajusta a quantidade de
                  informações técnicas visíveis na tela para deixar sua rotina mais limpa.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Object.keys(EXPERIENCE_PROFILES) as ExperienceLevel[]).map((lvl) => {
                  const prof = EXPERIENCE_PROFILES[lvl];
                  const isSelected = experienceLevel === lvl;
                  return (
                    <div
                      key={lvl}
                      onClick={() => onChangeExperienceLevel(lvl)}
                      className={`cursor-pointer rounded-xl p-5 border transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-400/60 shadow-lg shadow-amber-500/10"
                          : "bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300">
                            {prof.badge}
                          </span>
                          {isSelected && (
                            <span className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center">
                              <Check size={14} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-white mb-1">{prof.title}</h4>
                        <p className="text-xs text-amber-200/80 mb-3">{prof.subtitle}</p>
                        <p className="text-xs text-gray-300 leading-relaxed mb-4">{prof.description}</p>
                      </div>

                      <div className="space-y-1.5 pt-3 border-t border-white/10">
                        {prof.featuresSummary.map((feat, i) => (
                          <div key={i} className="flex items-start gap-2 text-[11px] text-gray-300">
                            <span className="text-amber-400 mt-0.5">•</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "tour" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Flame size={18} />
                    <span>Passo 1: Registre sem Poluição Visual</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Ao abrir ou editar uma nota, as informações técnicas (Data, Nota de Eficácia,
                    Correspondências e Conexões) ficam recolhidas em <strong>pílulas inteligentes</strong> no
                    topo. Clique numa pílula apenas quando quiser editá-la, deixando a página limpa para
                    escrever.
                  </p>
                  <p className="text-[11px] text-gray-400">
                    💡 <strong>Dica:</strong> Digite <code className="px-1.5 py-0.5 rounded bg-white/10 text-amber-300">/</code> em qualquer lugar do texto para abrir o menu rápido de inserção (Cartas de Tarot, Áudio, Imagens, Efemérides).
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Sparkles size={18} />
                    <span>Passo 2: Marque Forças, Orixás e Banhos (Ewê)</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Na pílula <strong>Correspondências</strong> da nota, você pode vincular rapidamente qual
                    Orixá, Guia (Caboclo, Preto Velho, Exu, Mestre da Jurema), Banho de Ervas, Planeta ou
                    Sephirah esteve presente.
                  </p>
                  <p className="text-[11px] text-gray-400">
                    💡 <strong>Dica:</strong> Você não precisa preencher tudo! Mesmo que você apenas escreva
                    normalmente no texto, o programa reconhece nomes de Orixás, Cartas e Símbolos de Sonhos
                    sozinho.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <Network size={18} />
                    <span>Passo 3: Descubra Sincronicidades e Cruzamentos</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    O motor analítico cruza automaticamente seus <strong>Oráculos (Tarot)</strong>,{" "}
                    <strong>Sonhos</strong> e <strong>Práticas</strong>. Na aba{" "}
                    <strong>Cruzamentos & Insights</strong>, use a Matriz 2D interativa para descobrir em qual
                    Fase da Lua, Dia da Semana ou com qual Erva suas práticas funcionam melhor!
                  </p>
                  <p className="text-[11px] text-gray-400">
                    💡 <strong>Dica:</strong> No painel lateral direito de qualquer nota, a aba{" "}
                    <strong>Sincronicidades</strong> mostra outras notas antigas que vibram na mesma energia.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                    <Database size={18} />
                    <span>Passo 4: Seus Dados 100% no Seu Controle</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Todas as suas anotações e imagens ficam salvas em um banco SQLite local (arquivo{" "}
                    <code className="text-sky-300">.db</code>). Clicando no ícone de <strong>Cofre</strong> no
                    topo da barra lateral esquerda, você pode escolher a pasta ou alternar entre múltiplos
                    diários existentes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "glossario" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={glossarySearch}
                    onChange={(e) => setGlossarySearch(e.target.value)}
                    placeholder="Buscar termo (ex: Ori, Ewê, Sephirah, Liber 777, Dharana, Sincronicidade)..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <select
                  value={selectedTradition}
                  onChange={(e) => setSelectedTradition(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-[#151520] border border-white/10 text-xs text-gray-200 focus:outline-none"
                >
                  <option value="all">Todas as Tradições</option>
                  <option value="Matriz Brasileira">Matriz Brasileira (Umbanda / Candomblé / Jurema)</option>
                  <option value="Thelema & Hermetismo">Thelema & Hermetismo</option>
                  <option value="Kabbalah">Kabbalah & Árvore da Vida</option>
                  <option value="Astrologia & Oráculo">Astrologia & Oráculo</option>
                  <option value="Prática & Sonhos">Prática & Sonhos</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGlossary.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h4 className="text-sm font-bold text-white">{item.term}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-emerald-300">
                          {item.tradition}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-amber-200/90 mb-2">{item.shortPlainMeaning}</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{item.detailedExplanation}</p>
                    </div>

                    <div className="space-y-1.5 pt-2.5 border-t border-white/10 text-[11px]">
                      {item.brazilianBridge && (
                        <div className="text-emerald-300/90">
                          <strong>🌿 Conexão Brasileira:</strong> {item.brazilianBridge}
                        </div>
                      )}
                      <div className="text-sky-300/90">
                        <strong>💡 No Programa:</strong> {item.howToUseInApp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "criar" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-300">
                Escolha um modelo abaixo para criar uma nota já estruturada e pronta para preencher:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {GUIDED_CREATION_CARDS.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => {
                      if (onStartGuidedNote) {
                        onStartGuidedNote(card);
                      }
                      handleClose();
                    }}
                    className="text-left p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-amber-400/50 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{card.icon}</span>
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-gray-300">
                          {card.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors mb-1">
                        {card.title}
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{card.subtitle}</p>
                    </div>
                    <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-amber-400 font-semibold">
                      <span>Iniciar agora</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/10 bg-black/50">
          <div className="text-xs text-gray-400">
            Modo ativo:{" "}
            <strong className="text-amber-300">{EXPERIENCE_PROFILES[experienceLevel].title}</strong>
          </div>
          <div className="flex items-center gap-2.5">
            {activeTab !== "criar" && (
              <button
                onClick={() =>
                  setActiveTab(
                    activeTab === "modo" ? "tour" : activeTab === "tour" ? "glossario" : "criar"
                  )
                }
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors"
              >
                Próxima Aba →
              </button>
            )}
            <button
              onClick={handleClose}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors"
            >
              Entrar no Diário
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
