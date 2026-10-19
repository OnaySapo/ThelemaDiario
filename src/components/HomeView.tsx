"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MagickEntry, normalizeCategory, CategoryName, TodoItem } from "@/lib/types";
import { ThelemicCalendar } from "@/components/ThelemicCalendar";
import {
  IconeSolThelema,
  IconeLuaThelema,
  ZodiacIcon,
  getCategoryThelemicIcon,
  EstrelaDeThelema,
} from "@/components/ThelemicIcons";
import { DynamicMoonPhase } from "@/components/DynamicMoonPhase";
import { LiberReshWidget } from "@/components/LiberReshWidget";
import {
  getFullAstrologicalData,
  getUpcomingMoonPhases,
  getReshSolarTide,
  AstrologicalCoordinates,
  UpcomingMoonPhase,
  ReshTideInfo,
} from "@/lib/astronomy";
import { getDailyNumerologyCard } from "@/lib/thothTarot";
import {
  Sparkles,
  Clock,
  Compass,
  Star,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Calendar,
  BarChart2,
  ArrowRight,
  Sun,
  Moon,
  Info,
  ExternalLink,
  Flame,
  Award,
  Layers,
  Bell,
} from "lucide-react";
import { formatDateBR, formatTime24h, formatDateTimeBR } from "@/lib/dateUtils";

interface HomeViewProps {
  entries: MagickEntry[];
  onSelectEntry: (entry: MagickEntry) => void;
  onNewNote: (prefilledCategory?: CategoryName, prefilledContent?: string, prefilledTitle?: string) => void;
  onOpenDashboard: () => void;
  onOpenTree?: () => void;
  onOpenTimer?: () => void;
  onOpenAltar?: () => void;
}

export function HomeView({
  entries,
  onSelectEntry,
  onNewNote,
  onOpenDashboard,
  onOpenTree,
  onOpenTimer,
  onOpenAltar,
}: HomeViewProps) {
  // Live Clock & Astronomy
  const [now, setNow] = useState(new Date());
  const [astro, setAstro] = useState<AstrologicalCoordinates | null>(null);
  const [reshTide, setReshTide] = useState<ReshTideInfo | null>(null);
  const [upcomingMoons, setUpcomingMoons] = useState<UpcomingMoonPhase[]>([]);
  const [showReshModal, setShowReshModal] = useState(false);

  // Daily Tarot Card
  const dailyNumerology = useMemo(() => getDailyNumerologyCard(now), [now]);

  // Magickal To-Do List State
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [loadingTodos, setLoadingTodos] = useState(true);

  // Live timer update
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setNow(d);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute astronomical & tidal coordinates
  useEffect(() => {
    try {
      fetch("/api/astronomy")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setAstro(data);
          } else {
            setAstro(getFullAstrologicalData(now));
          }
        })
        .catch(() => {
          setAstro(getFullAstrologicalData(now));
        });

      setReshTide(getReshSolarTide(now));
      setUpcomingMoons(getUpcomingMoonPhases(now));
    } catch (e) {
      console.error("Erro nas efemérides:", e);
    }
  }, [now.getHours()]);

  // Load Todos
  const loadTodos = async () => {
    try {
      const res = await fetch("/api/todos");
      const data = await res.json();
      if (data.success) {
        setTodos(data.todos);
      }
    } catch (e) {
      console.error("Erro ao carregar afazeres:", e);
    } finally {
      setLoadingTodos(false);
    }
  };

  useEffect(() => {
    loadTodos();
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
    } catch (e) {
      alert("Erro ao adicionar tarefa.");
    }
  };

  const handleToggleTodo = async (id: string, currentCompleted: boolean) => {
    const nextCompleted = !currentCompleted;
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: nextCompleted } : t))
    );

    try {
      await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: nextCompleted }),
      });
    } catch (e) {
      console.error("Erro ao atualizar tarefa:", e);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
    } catch (e) {
      console.error("Erro ao excluir tarefa:", e);
    }
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryName, number> = {
      Diário: 0,
      Estudo: 0,
      "Visão Astral": 0,
      Sonho: 0,
      Oráculo: 0,
      Prática: 0,
    };

    let totalRating = 0;
    let ratingCount = 0;

    for (const e of entries) {
      const cat = normalizeCategory(e.type);
      if (counts[cat] !== undefined) counts[cat]++;
      if (e.success_rating !== undefined && e.success_rating !== null && e.success_rating > 0) {
        totalRating += e.success_rating;
        ratingCount++;
      }
    }

    const avgSuccess = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "—";
    return { counts, total: entries.length, avgSuccess };
  }, [entries]);

  // Recent entries
  const recentEntries = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [entries]);

  return (
    <div className="flex-1 h-full bg-medium-900 overflow-y-auto p-4 sm:p-8 space-y-8 select-text">
      {/* ========================================================
          1. HEADER THELÊMICO & CONTADOR DE HORAS THELEMITA
          ======================================================== */}
      <section className="bg-medium-850 rounded-2xl border border-medium-700 p-6 sm:p-8 relative overflow-hidden shadow-sm">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-white font-mono text-xs uppercase tracking-widest mb-1.5 font-bold">
              <EstrelaDeThelema className="w-4 h-4 text-white" />
              <span>O Método da Ciência, o Alvo da Religião</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-snug">
              Faze o que tu queres há de ser tudo da Lei.
            </h1>
            <p className="text-xs sm:text-sm text-medium-400 font-sans mt-2 max-w-2xl leading-relaxed">
              Bem-vindo ao seu Sanctum Thelêmico. Registre operações mágickas, consulte as lâminas de Thoth, correlacione as marés astrais e descubra o padrão da sua Verdadeira Vontade.
            </p>
          </div>

          {/* Contador de Horas Thelemita (Live Digital Arcane Clock + Fase Lunar Dinâmica Diária) */}
          <div className="bg-medium-900 border border-medium-700 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-center gap-5 shadow-sm shrink-0">
            {/* Lado Esquerdo: Coordenadas e Relógio (sem segundos) */}
            <div className="flex flex-col justify-between w-full md:w-auto min-w-[220px]">
              <div className="flex items-center justify-between gap-3 border-b border-medium-750 pb-2 mb-2.5">
                <span className="text-[10px] font-mono font-bold text-medium-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-white" />
                  <span>{formatDateBR(now)}</span>
                </span>
                <span className="text-xs font-mono font-bold text-white bg-medium-800 px-2 py-0.5 rounded border border-medium-700 tracking-wider shrink-0 shadow-sm">
                  {formatTime24h(now)}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between text-medium-300">
                  <span className="text-medium-400 text-[11px]">Ano Thelêmico:</span>
                  <strong className="text-white font-bold">{astro?.thelemicDate.split(", ").pop() || "Anno V:xii"}</strong>
                </div>
                <div className="flex items-center justify-between text-medium-300">
                  <span className="text-medium-400 text-[11px]">Dia Planetário:</span>
                  <span className="text-white flex items-center gap-1">
                    <span>{astro?.planetaryDaySymbol}</span>
                    <span>{astro?.planetaryDay || "Dies Solis"}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-medium-300">
                  <span className="text-medium-400 text-[11px]">Hora Planetária:</span>
                  <span className="text-white flex items-center gap-1">
                    <span>{astro?.planetaryHourSymbol}</span>
                    <span>{astro?.planetaryHour || "Hora Solar"}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-medium-300 pt-1 border-t border-medium-800">
                  <span className="text-medium-400 text-[11px]">Luminar Solar:</span>
                  <span className="flex items-center gap-1 text-white">
                    <IconeSolThelema className="w-3 h-3 text-white" size={12} />
                    {astro?.sunSignSymbol && <ZodiacIcon sign={astro.sunSignSymbol} className="w-3 h-3 text-white" size={12} />}
                    <span>{astro?.sunSign || "Sol"}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-medium-300">
                  <span className="text-medium-400 text-[11px]">Luminar Lunar:</span>
                  <span className="flex items-center gap-1 text-white">
                    <IconeLuaThelema className="w-3 h-3 text-white" size={12} />
                    {astro?.moonSignSymbol && <ZodiacIcon sign={astro.moonSignSymbol} className="w-3 h-3 text-white" size={12} />}
                    <span>{astro?.moonSign || "Lua"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Divisor Vertical */}
            <div className="hidden md:block w-[1px] h-full bg-medium-750 self-stretch my-0.5" />

            {/* Lado Direito: Lua Gráfica Dinâmica que se modifica a cada dia */}
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-medium-850/70 border border-medium-750/80 min-w-[130px] w-full md:w-auto shadow-inner">
              <span className="text-[9px] font-mono text-medium-400 uppercase tracking-widest block mb-1">
                Fase Lunar de Hoje
              </span>
              <DynamicMoonPhase
                moonAngle={astro?.moonAngle ?? 0}
                illumination={astro?.moonIllumination ?? 50}
                phaseName={astro?.moonPhaseName ?? "Lua"}
                moonSign={astro?.moonSign}
                moonSignSymbol={astro?.moonSignSymbol}
                size={58}
                showDetails={true}
              />
            </div>
          </div>
        </div>

        {/* Maré Solar Thelêmica Interativa (Liber Resh vel Helios) */}
        <LiberReshWidget
          onInsertAdoration={(md) => onNewNote("Prática", md, "Adoração de Liber Resh")}
          className="mt-6"
        />
      </section>

      {/* ========================================================
          TEMPLE TOOLS (ÁRVORE DA VIDA, DHARANA TIMER, MODO ALTAR)
          ======================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {onOpenAltar && (
          <button
            type="button"
            onClick={onOpenAltar}
            className="p-3.5 rounded-xl bg-medium-850 hover:bg-medium-800 border border-medium-700 hover:border-amber-500/50 transition-all text-left flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block group-hover:text-amber-300 transition-colors">
                  Modo Altar / Projeção
                </span>
                <span className="text-[10px] font-mono text-medium-400 block">
                  Visão em tela cheia para rituais
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-medium-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
          </button>
        )}

        {onOpenTimer && (
          <button
            type="button"
            onClick={onOpenTimer}
            className="p-3.5 rounded-xl bg-medium-850 hover:bg-medium-800 border border-medium-700 hover:border-blue-500/50 transition-all text-left flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block group-hover:text-blue-300 transition-colors">
                  Dharana & Cronômetro
                </span>
                <span className="text-[10px] font-mono text-medium-400 block">
                  Contador de quebras e sino tibetano
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-medium-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
          </button>
        )}

        {onOpenTree && (
          <button
            type="button"
            onClick={onOpenTree}
            className="p-3.5 rounded-xl bg-medium-850 hover:bg-medium-800 border border-medium-700 hover:border-purple-500/50 transition-all text-left flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block group-hover:text-purple-300 transition-colors">
                  Árvore da Vida (777)
                </span>
                <span className="text-[10px] font-mono text-medium-400 block">
                  10 Sephiroth e os 22 Caminhos
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-medium-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </section>

      {/* ========================================================
          2. MÉTRICAS DO DIÁRIO (VAULT STATS POR CATEGORIA)
          ======================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-medium-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-white" />
            <span>Inventário de Registros por Categoria</span>
          </h2>
          <span className="text-xs font-mono text-medium-400">
            Total: <strong className="text-white">{categoryCounts.total} notas</strong> · Eficácia Média:{" "}
            <strong className="text-white">{categoryCounts.avgSuccess}/10</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(
            [
              { cat: "Prática" as CategoryName, desc: "Rituais & Operações" },
              { cat: "Estudo" as CategoryName, desc: "Doutrina & Teoria" },
              { cat: "Visão Astral" as CategoryName, desc: "Planos & Viagens" },
              { cat: "Sonho" as CategoryName, desc: "Onirismo Lúcido" },
              { cat: "Oráculo" as CategoryName, desc: "Lâminas de Thoth" },
              { cat: "Diário" as CategoryName, desc: "Crônica Secular" },
            ] as const
          ).map(({ cat, desc }) => (
            <div
              key={cat}
              onClick={() => onNewNote(cat)}
              className="bg-medium-850 p-4 rounded-xl border border-medium-700 hover:border-medium-500 hover:bg-medium-800 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-7 h-7 rounded-full bg-medium-800 group-hover:bg-medium-750 border border-medium-700 flex items-center justify-center text-white">
                  {getCategoryThelemicIcon(cat, "w-3.5 h-3.5")}
                </span>
                <span className="text-lg font-mono font-bold text-white group-hover:scale-105 transition-transform">
                  {categoryCounts.counts[cat]}
                </span>
              </div>
              <div>
                <span className="text-xs font-serif font-bold text-white block group-hover:underline">
                  {cat}
                </span>
                <span className="text-[10px] text-medium-400 font-sans block mt-0.5 line-clamp-1">
                  {desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          3. GRID PRINCIPAL: CALENDÁRIO THELEMITA & CARTA DO DIA
          ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Lado Esquerdo: Calendário Thelemita Interativo (8 Colunas) */}
        <div className="lg:col-span-8 space-y-6">
          <ThelemicCalendar
            entries={entries}
            onSelectEntry={onSelectEntry}
            onNewNote={(dateStr) => onNewNote("Prática", undefined, dateStr ? `Operação de ${formatDateBR(dateStr)}` : undefined)}
          />

          {/* Afazeres Mágickos (To-Do List) */}
          <div className="bg-medium-850 rounded-xl border border-medium-700 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-medium-750 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Tarefas Mágickas & Metas Diárias
                </h3>
              </div>
              <span className="text-[10px] font-mono text-medium-400">
                {todos.filter((t) => t.completed).length}/{todos.length} concluídas
              </span>
            </div>

            {/* Form Add Todo */}
            <form onSubmit={handleAddTodo} className="flex gap-2">
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="Adicionar nova prática diária, meta ou estudo..."
                className="flex-1 bg-medium-900 border border-medium-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-medium-500 focus:outline-none focus:border-white font-sans"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-white hover:bg-medium-200 text-black font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </form>

            {/* Todo List */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {todos.length === 0 ? (
                <p className="text-xs text-medium-500 italic py-2">
                  Nenhuma tarefa pendente. Sua Vontade está livre.
                </p>
              ) : (
                todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-medium-900/80 border border-medium-750/70 hover:border-medium-700 transition-colors group"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleTodo(todo.id, todo.completed)}
                      className="flex items-center gap-2.5 flex-1 text-left"
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-medium-500 group-hover:text-white shrink-0" />
                      )}
                      <span
                        className={`text-xs font-sans ${
                          todo.completed
                            ? "line-through text-medium-500"
                            : "text-medium-200 group-hover:text-white"
                        }`}
                      >
                        {todo.text}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-medium-500 hover:text-red-400 transition-opacity"
                      title="Excluir tarefa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Lado Direito: Carta do Dia & Luas Importantes (4 Colunas) */}
        <div className="lg:col-span-4 space-y-6">
          {/* CARTA DO DIA (NUMEROLOGIA DOS ARCANOS MAIORES) */}
          <div className="bg-medium-850 rounded-xl border border-medium-700 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-medium-750 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Arcano do Dia (Numerologia)
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-medium-800 text-medium-300 border border-medium-700">
                {dailyNumerology.formula}
              </span>
            </div>

            {/* Card Preview */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative w-44 aspect-[3/5] rounded-xl overflow-hidden border border-medium-700 bg-medium-900 shadow-md">
                <img
                  src={dailyNumerology.card.imageUrl}
                  alt={dailyNumerology.card.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold text-medium-400 uppercase">
                  Atu {dailyNumerology.card.number} · {dailyNumerology.card.hebrewName} ({dailyNumerology.card.hebrewLetter})
                </span>
                <h4 className="text-base font-serif font-bold text-white mt-0.5">
                  {dailyNumerology.card.name}
                </h4>
                {dailyNumerology.card.thelemicTitle && (
                  <p className="text-[11px] text-medium-300 italic font-serif mt-1">
                    "{dailyNumerology.card.thelemicTitle}"
                  </p>
                )}
              </div>

              {/* Keywords */}
              <div className="flex flex-wrap justify-center gap-1">
                {dailyNumerology.card.keywords.slice(0, 4).map((kw, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-medium-900 text-medium-300 border border-medium-750"
                  >
                    {kw}
                  </span>
                ))}
              </div>

              <p className="text-xs text-medium-400 font-sans leading-relaxed text-left line-clamp-3 bg-medium-900 p-3 rounded-lg border border-medium-750 w-full">
                {dailyNumerology.card.description}
              </p>

              {/* Action: Create note based on today's card */}
              <button
                type="button"
                onClick={() =>
                  onNewNote(
                    "Oráculo",
                    `## 🔮 Meditação do Arcano do Dia: ${dailyNumerology.card.name}\n\n**Fórmula Numerológica**: ${dailyNumerology.formula}\n**Atribuição**: ${dailyNumerology.card.hebrewName} (${dailyNumerology.card.hebrewLetter}) — ${dailyNumerology.card.astrologicalSign}\n\n### Reflexões e Sintonização:\n${dailyNumerology.card.description}\n\n### Percepções da Minha Verdadeira Vontade:\n`,
                    `Arcano do Dia: ${dailyNumerology.card.name}`
                  )
                }
                className="w-full py-2 bg-white hover:bg-medium-200 text-black font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Meditação com a Carta</span>
              </button>
            </div>
          </div>

          {/* LUAS MAIS IMPORTANTES NO PERÍODO ATUAL */}
          <div className="bg-medium-850 rounded-xl border border-medium-700 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-medium-750 pb-2.5">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-white" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Efemérides Lunares Vigentes
                </h3>
              </div>
              <span className="text-[10px] font-mono text-medium-400">Próximos 30 dias</span>
            </div>

            <div className="space-y-2">
              {upcomingMoons.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-medium-900 border border-medium-750 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{m.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-xs font-sans font-semibold text-white">
                          {m.name}
                        </strong>
                        <span className="text-[10px] font-mono text-medium-400">
                          ({m.illuminationPct}%)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-medium-400">
                        {m.formattedDate}
                      </span>
                    </div>
                  </div>

                  {/* Sign badge with custom vector icon */}
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded bg-medium-800 border border-medium-700 text-xs font-mono text-white"
                    title={`Lua em ${m.zodiacSign} (${m.degreeFormatted})`}
                  >
                    <ZodiacIcon sign={m.zodiacSymbol} className="w-3.5 h-3.5 text-white" size={14} />
                    <span className="text-[11px]">{m.zodiacSign}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. REGISTROS RECENTES & BANNER DO DASHBOARD ANALÍTICO
          ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recentes (8 Colunas) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-medium-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white" />
              <span>Registros Acessados Recentemente</span>
            </h3>
            <button
              type="button"
              onClick={() => onNewNote()}
              className="text-xs font-mono text-white hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Nova Nota</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className="p-4 rounded-xl bg-medium-850 border border-medium-700 hover:border-medium-500 hover:bg-medium-800 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase font-semibold text-medium-300 px-2 py-0.5 rounded bg-medium-800 border border-medium-700 flex items-center gap-1.5">
                      {getCategoryThelemicIcon(entry.type, "w-3 h-3 text-medium-300")}
                      <span>{normalizeCategory(entry.type)}</span>
                    </span>

                    {entry.success_rating !== undefined && entry.success_rating !== null && (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-medium-300 font-semibold">
                        <Star className="w-3 h-3 fill-white text-white" />
                        {entry.success_rating}/10
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-serif font-bold text-white group-hover:underline line-clamp-1">
                    {entry.title}
                  </h4>

                  <p className="text-xs text-medium-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {entry.content.replace(/[#*`_>]/g, "")}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-medium-750 text-[10px] font-mono text-medium-400">
                  <span>{formatDateTimeBR(entry.date)}</span>
                  <span className="flex items-center gap-1 text-white group-hover:translate-x-1 transition-transform">
                    <span>Ler nota</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card de Acesso ao Dashboard Analítico (4 Colunas) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-medium-850 via-medium-850 to-medium-800 rounded-xl border border-medium-700 p-6 flex flex-col justify-between space-y-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-white font-mono text-xs uppercase font-bold mb-2">
              <Award className="w-4 h-4 text-white" />
              <span>Matriz Analítica & Métricas</span>
            </div>

            <h3 className="text-lg font-serif font-bold text-white leading-snug">
              Descubra os Padrões Científicos do seu Sucesso Mágicko
            </h3>

            <p className="text-xs text-medium-400 font-sans mt-2 leading-relaxed">
              Filtre por <strong>recorrência de influências</strong> (deidades, incensos, instrumentos do Liber 777), veja quais fases da lua e signos obtiveram <strong>maior taxa de sucesso</strong> em média e otimize suas operações.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenDashboard}
              className="w-full py-2.5 bg-white hover:bg-medium-200 text-black font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <BarChart2 className="w-4 h-4" />
              <span>Abrir Dashboard Analítico Completo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Modal: Oração Canônica de Liber Resh */}
      {showReshModal && reshTide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-medium-900 border border-medium-700 max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-medium-750 pb-3">
              <div className="flex items-center gap-2">
                <EstrelaDeThelema className="w-5 h-5 text-white" />
                <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                  Liber Resh vel Helios — Estação {reshTide.station} ({reshTide.direction})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReshModal(false)}
                className="p-1 text-medium-400 hover:text-white rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-serif text-sm text-medium-200 leading-relaxed">
              <p className="italic text-medium-300">
                "{reshTide.salutation}"
              </p>
              <blockquote className="border-l-2 border-white pl-3 text-medium-300 text-xs italic">
                Unidade totalmente demonstrada!<br />
                Eu Te adoro no poder do Teu sopro,<br />
                Supremo e terrível Deus,<br />
                Que fazes os Deuses e a Morte tremerem diante de Ti:<br />
                Eu, eu Te adoro!
              </blockquote>
              <p className="text-xs font-mono text-medium-400 pt-2 border-t border-medium-750">
                Regente Divino: <strong className="text-white">{reshTide.thelemicGod}</strong> · Horário solar ideal: {reshTide.hourRange}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowReshModal(false)}
                className="px-4 py-2 bg-medium-800 hover:bg-medium-750 text-white rounded text-xs font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
