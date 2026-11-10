"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MagickEntry, normalizeCategory, CategoryName, TodoItem } from "@/lib/types";
import { ThelemicCalendar } from "@/components/ThelemicCalendar";
import {
  getCategoryThelemicIcon,
  EstrelaDeThelema,
} from "@/components/ThelemicIcons";
import { LiberReshWidget } from "@/components/LiberReshWidget";
import {
  getFullAstrologicalData,
  getUpcomingMoonPhases,
  AstrologicalCoordinates,
  UpcomingMoonPhase,
} from "@/lib/astronomy";
import { getDailyNumerologyCard } from "@/lib/thothTarot";
import { getAfroBrazilianDayRuler } from "@/lib/brasilidade777";
import {
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  ArrowRight,
  Star,
  HelpCircle,
  Compass,
  Calendar as CalendarIcon,
  FileText,
  Sparkles,
} from "lucide-react";
import { formatDateBR, formatTime24h, formatDateTimeBR } from "@/lib/dateUtils";
import { computeDailyCompass, detectSynchronicityThreads } from "@/lib/crossAnalytics";
import { ExperienceLevel, GUIDED_CREATION_CARDS } from "@/lib/glossary";

interface HomeViewProps {
  entries: MagickEntry[];
  onSelectEntry: (entry: MagickEntry) => void;
  onNewNote: (
    prefilledCategory?: CategoryName,
    prefilledContent?: string,
    prefilledTitle?: string,
    prefilledInfluences?: { category: string; name: string }[]
  ) => void;
  onOpenDashboard: () => void;
  onOpenTree?: () => void;
  onOpenTimer?: () => void;
  onOpenAltar?: () => void;
  onOpenSigilStudio?: () => void;
  experienceLevel?: ExperienceLevel;
  onOpenOnboarding?: () => void;
}

export function HomeView({
  entries,
  onSelectEntry,
  onNewNote,
  onOpenDashboard,
  onOpenTree,
  onOpenTimer,
  onOpenAltar,
  onOpenSigilStudio,
  onOpenOnboarding,
}: HomeViewProps) {
  const [activeTab, setActiveTab] = useState<"recentes" | "alinhamento" | "calendario">("recentes");
  const [now, setNow] = useState(new Date());
  const [astro, setAstro] = useState<AstrologicalCoordinates | null>(null);
  const [upcomingMoons, setUpcomingMoons] = useState<UpcomingMoonPhase[]>([]);

  const dailyNumerology = useMemo(() => getDailyNumerologyCard(now), [now.getDate()]);
  const afroDay = useMemo(() => getAfroBrazilianDayRuler(now), [now.getDate()]);

  const dailyCompass = useMemo(
    () => computeDailyCompass(entries, astro?.moonPhaseName, astro?.moonSign, now),
    [entries, astro?.moonPhaseName, astro?.moonSign, now.getDate()]
  );

  const topSyncThreads = useMemo(
    () => detectSynchronicityThreads(entries).slice(0, 2),
    [entries]
  );

  // To-Do State
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch("/api/astronomy")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAstro(data);
        else setAstro(getFullAstrologicalData(now));
      })
      .catch(() => setAstro(getFullAstrologicalData(now)));

    setUpcomingMoons(getUpcomingMoonPhases(now));
  }, [now.getHours()]);

  useEffect(() => {
    fetch("/api/todos")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTodos(data.todos);
      })
      .catch(() => {});
  }, []);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newTodoText.trim() }),
      });
      const data = await res.json();
      if (data.success && data.todo) {
        setTodos((prev) => [data.todo, ...prev]);
        setNewTodoText("");
      }
    } catch (e) {}
  };

  const handleToggleTodo = async (id: string, currentCompleted: boolean) => {
    const nextCompleted = !currentCompleted;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: nextCompleted } : t)));
    try {
      await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: nextCompleted }),
      });
    } catch (e) {}
  };

  const handleDeleteTodo = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
    } catch (e) {}
  };

  const recentEntries = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [entries]);

  return (
    <div className="flex-1 h-full bg-medium-900 overflow-y-auto select-text">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* =================================================================
            1. BARRA DE STATUS SUPERIOR MINIMALISTA (1 LINHA SILENCIOSA)
           ================================================================= */}
        <header className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-medium-800 text-xs text-medium-400 font-mono">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-white font-medium">{formatDateBR(now)}</span>
            <span>·</span>
            <span>{formatTime24h(now)}</span>
            {astro && (
              <>
                <span>·</span>
                <span>☉ {astro.sunSign}</span>
                <span>·</span>
                <span>
                  ☽ {astro.moonPhaseName} ({astro.moonSign})
                </span>
              </>
            )}
            <span>·</span>
            <span className="text-medium-300">{afroDay.orixas.split(",")[0]}</span>
          </div>

          {onOpenOnboarding && (
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="inline-flex items-center gap-1.5 text-xs text-medium-400 hover:text-white transition-colors"
              title="Abrir Guia Rápido e Glossário"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Guia</span>
            </button>
          )}
        </header>

        {/* =================================================================
            2. SAUDAÇÃO & CRIAÇÃO RÁPIDA (MINIMALISTA E DIRETA)
           ================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-semibold text-white tracking-tight">
                Diário & Sanctum
              </h1>
              <p className="text-xs text-medium-400 mt-0.5">
                Escolha um formato abaixo ou continue escrevendo nas suas notas recentes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNewNote()}
              className="px-4 py-2 rounded-lg bg-white hover:bg-medium-200 text-black text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Nota</span>
            </button>
          </div>

          {/* Pílulas Minimalistas de Criação Guiada */}
          <div className="flex flex-wrap items-center gap-2">
            {GUIDED_CREATION_CARDS.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() =>
                  onNewNote(card.category, card.customTemplate, card.defaultTitle, card.defaultInfluences)
                }
                className="px-3 py-1.5 rounded-lg bg-medium-850 hover:bg-medium-800 border border-medium-750 hover:border-medium-600 text-xs text-medium-200 hover:text-white flex items-center gap-2 transition-colors"
                title={card.subtitle}
              >
                <span>{card.icon}</span>
                <span>{card.category === "Prática" && card.id.includes("banho") ? "Banho / Firmeza" : card.category}</span>
              </button>
            ))}
          </div>
        </section>

        {/* =================================================================
            3. NAVEGAÇÃO INTERNA EM 3 ABAS LIMPAS (EVITA POLUIÇÃO VISUAL)
           ================================================================= */}
        <div className="flex items-center justify-between border-b border-medium-800">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab("recentes")}
              className={`pb-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === "recentes"
                  ? "border-white text-white"
                  : "border-transparent text-medium-400 hover:text-medium-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Notas Recentes ({entries.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("alinhamento")}
              className={`pb-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === "alinhamento"
                  ? "border-white text-white"
                  : "border-transparent text-medium-400 hover:text-medium-200"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Alinhamento & Carta do Dia</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("calendario")}
              className={`pb-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === "calendario"
                  ? "border-white text-white"
                  : "border-transparent text-medium-400 hover:text-medium-200"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendário & Metas</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenDashboard}
            className="pb-2.5 text-xs text-medium-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Ver Cruzamentos</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* =================================================================
            ABA 1 (PADRÃO): SÍNTESE DISCRETA DO DIA + LISTA DE NOTAS RECENTES
           ================================================================= */}
        {activeTab === "recentes" && (
          <div className="space-y-6">
            {/* Cartão Único e Discreto de Alinhamento do Dia */}
            <div className="p-4 rounded-xl bg-medium-850 border border-medium-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-mono text-medium-400">
                  <Compass className="w-3.5 h-3.5 text-medium-300" />
                  <span>BÚSSOLA DE HOJE · {dailyCompass.synergyPercent}% SINERGIA</span>
                </div>
                <p className="text-xs text-medium-200 leading-relaxed">
                  <strong className="text-white">{dailyCompass.headlinePt}.</strong>{" "}
                  Ervas do dia: <span className="text-medium-300">{dailyCompass.recommendedHerbs}</span>.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  onNewNote(
                    dailyCompass.recommendedCategory,
                    undefined,
                    dailyCompass.suggestedActionTitle,
                    dailyCompass.suggestedInfluences
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-medium-800 hover:bg-medium-750 border border-medium-700 text-xs text-white font-medium shrink-0 transition-colors"
              >
                Registrar {dailyCompass.recommendedCategory} →
              </button>
            </div>

            {/* Sincronicidades discretas (se houver) */}
            {topSyncThreads.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg bg-medium-850/60 border border-medium-800 text-xs text-medium-300">
                <div className="flex items-center gap-2 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-medium-400 shrink-0" />
                  <span className="truncate">
                    Sincronicidade ativa: <strong className="text-white">{topSyncThreads[0].symbolTitle}</strong> ({topSyncThreads[0].categoriesInvolved.join(" ↔ ")})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onOpenDashboard}
                  className="text-[11px] text-medium-400 hover:text-white shrink-0"
                >
                  Explorar →
                </button>
              </div>
            )}

            {/* Lista Limpa de Notas Recentes */}
            {recentEntries.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-medium-800 rounded-xl space-y-3">
                <p className="text-sm text-medium-300">Seu diário ainda não possui notas.</p>
                <button
                  type="button"
                  onClick={() => onNewNote()}
                  className="px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold"
                >
                  Criar Primeira Nota
                </button>
              </div>
            ) : (
              <div className="divide-y divide-medium-800 border-t border-b border-medium-800">
                {recentEntries.map((entry) => {
                  const cat = normalizeCategory(entry.type);
                  const cleanExcerpt = (entry.content || "")
                    .replace(/!\[.*?\]\(.*?\)/g, "")
                    .replace(/[#*`_>]/g, "")
                    .trim();

                  return (
                    <div
                      key={entry.id}
                      onClick={() => onSelectEntry(entry)}
                      className="py-3.5 px-2 hover:bg-medium-850/70 transition-colors cursor-pointer flex items-center justify-between gap-4 group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-medium-400 flex items-center gap-1">
                            {getCategoryThelemicIcon(cat, "w-3 h-3")}
                            <span>{cat}</span>
                          </span>
                          <span className="text-medium-600">·</span>
                          <span className="text-[11px] font-mono text-medium-400">
                            {formatDateTimeBR(entry.date)}
                          </span>
                        </div>
                        <h3 className="text-sm font-medium text-white group-hover:underline truncate">
                          {entry.title}
                        </h3>
                        {cleanExcerpt && (
                          <p className="text-xs text-medium-400 line-clamp-1 mt-0.5">{cleanExcerpt}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {entry.success_rating ? (
                          <span className="text-xs font-mono text-medium-300 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-medium-300 text-medium-300" />
                            {entry.success_rating}
                          </span>
                        ) : null}
                        <ArrowRight className="w-4 h-4 text-medium-500 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Atalhos Discretos de Rodapé */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-medium-400">
              <div className="flex flex-wrap items-center gap-4">
                {onOpenSigilStudio && (
                  <button
                    type="button"
                    onClick={onOpenSigilStudio}
                    className="hover:text-white transition-colors"
                  >
                    Ponto Riscado & Sigilos
                  </button>
                )}
                {onOpenTimer && (
                  <button
                    type="button"
                    onClick={onOpenTimer}
                    className="hover:text-white transition-colors"
                  >
                    Cronômetro Dharana
                  </button>
                )}
                {onOpenTree && (
                  <button
                    type="button"
                    onClick={onOpenTree}
                    className="hover:text-white transition-colors"
                  >
                    Árvore da Vida
                  </button>
                )}
                {onOpenAltar && (
                  <button
                    type="button"
                    onClick={onOpenAltar}
                    className="hover:text-white transition-colors"
                  >
                    Modo Altar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            ABA 2: ALINHAMENTO DE HOJE, EFEMÉRIDES & CARTA DO DIA
           ================================================================= */}
        {activeTab === "alinhamento" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Regência Afro-Brasileira & Planetária */}
              <div className="p-5 rounded-xl bg-medium-850 border border-medium-750 space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-medium-400 block">
                  Regência do Dia · {afroDay.dayNamePt} ({afroDay.planet})
                </span>
                <h3 className="text-base font-serif font-semibold text-white">{afroDay.orixas}</h3>
                <p className="text-xs text-medium-300 leading-relaxed">{afroDay.linesAndEntities}</p>
                <div className="pt-2 border-t border-medium-800 space-y-1 text-xs text-medium-300">
                  <div>
                    <span className="text-medium-400">Saudação:</span> {afroDay.greeting}
                  </div>
                  <div>
                    <span className="text-medium-400">Ervas (Ewê):</span> {afroDay.recommendedHerbs}
                  </div>
                  <div>
                    <span className="text-medium-400">Velas:</span> {afroDay.candleColors}
                  </div>
                </div>
              </div>

              {/* Arcano do Dia (Tarot de Thoth) */}
              <div className="p-5 rounded-xl bg-medium-850 border border-medium-750 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-medium-400 block">
                    Arcano Regente do Dia
                  </span>
                  <h3 className="text-base font-serif font-semibold text-white mt-0.5">
                    {dailyNumerology.card.number} · {dailyNumerology.card.name}
                  </h3>
                  <p className="text-xs text-medium-300 mt-1 leading-relaxed">
                    {dailyNumerology.card.thelemicTitle || dailyNumerology.card.description} — {dailyNumerology.card.astrologicalSign} (
                    {dailyNumerology.card.hebrewLetter})
                  </p>
                </div>

                <div className="pt-3 border-t border-medium-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-medium-400">
                    Caminho: {dailyNumerology.card.sephirahPath}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onNewNote(
                        "Oráculo",
                        `## Meditação Diária: ${dailyNumerology.card.name}\n\n**Atribuição:** ${dailyNumerology.card.astrologicalSign}\n\n### Reflexão:\n`,
                        `Arcano do Dia: ${dailyNumerology.card.name}`
                      )
                    }
                    className="text-xs text-white hover:underline font-medium"
                  >
                    Meditar nesta carta →
                  </button>
                </div>
              </div>
            </div>

            {/* Próximas Fases Lunares */}
            {upcomingMoons.length > 0 && (
              <div className="p-4 rounded-xl bg-medium-850 border border-medium-750">
                <span className="text-[10px] font-mono uppercase tracking-wider text-medium-400 block mb-3">
                  Próximas Fases da Lua
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {upcomingMoons.map((m, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-medium-900 border border-medium-800 text-xs">
                      <div className="font-medium text-white">
                        {m.icon} {m.name}
                      </div>
                      <div className="text-[11px] font-mono text-medium-400 mt-0.5">{m.formattedDate}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Liber Resh vel Helios */}
            <LiberReshWidget
              onInsertAdoration={(md) => onNewNote("Prática", md, "Adoração de Liber Resh")}
            />
          </div>
        )}

        {/* =================================================================
            ABA 3: CALENDÁRIO MENSAL & LISTA DE METAS
           ================================================================= */}
        {activeTab === "calendario" && (
          <div className="space-y-6 animate-fade-in">
            <ThelemicCalendar
              entries={entries}
              onSelectEntry={onSelectEntry}
              onNewNote={(dateStr) =>
                onNewNote("Prática", undefined, dateStr ? `Registro de ${formatDateBR(dateStr)}` : undefined)
              }
            />

            {/* Lista Minimalista de Tarefas / Metas */}
            <div className="p-5 rounded-xl bg-medium-850 border border-medium-750 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                  Metas & Tarefas
                </h3>
                <span className="text-[11px] font-mono text-medium-400">
                  {todos.filter((t) => t.completed).length}/{todos.length} concluídas
                </span>
              </div>

              <form onSubmit={handleAddTodo} className="flex gap-2">
                <input
                  type="text"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  placeholder="Adicionar meta ou prática pendente..."
                  className="flex-1 bg-medium-900 border border-medium-750 rounded-lg px-3 py-1.5 text-xs text-white placeholder-medium-500 focus:outline-none focus:border-medium-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold"
                >
                  Adicionar
                </button>
              </form>

              {todos.length > 0 && (
                <div className="divide-y divide-medium-800">
                  {todos.map((todo) => (
                    <div key={todo.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleToggleTodo(todo.id, todo.completed)}
                        className="flex items-center gap-2.5 text-left flex-1"
                      >
                        {todo.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-medium-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-medium-500 shrink-0" />
                        )}
                        <span className={todo.completed ? "line-through text-medium-500" : "text-medium-200"}>
                          {todo.text}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-medium-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
