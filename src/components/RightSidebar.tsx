"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { MagickEntry, ChatMessage, normalizeCategory } from "@/lib/types";
import { formatTime24h, formatDateBR } from "@/lib/dateUtils";
import { findNoteResonances } from "@/lib/crossAnalytics";
import { detectGlossaryTermsForNote } from "@/lib/glossary";
import {
  Send,
  Bot,
  Sparkles,
  Network,
  Link2,
  Trash2,
  Maximize2,
  Compass,
  ArrowUpRight,
  HelpCircle,
} from "lucide-react";

interface RightSidebarProps {
  currentEntry: MagickEntry | null;
  allEntries: MagickEntry[];
  onSelectEntry: (entry: MagickEntry) => void;
  onOpenFullGraph?: () => void;
  onOpenOnboarding?: () => void;
}

export function RightSidebar({
  currentEntry,
  allEntries,
  onSelectEntry,
  onOpenFullGraph,
  onOpenOnboarding,
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<"sync" | "chat" | "guide">("sync");

  // Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "**Faze o que tu queres há de ser tudo da Lei.**\n\nSou o seu Frater Auxiliar. Posso cruzar todas as suas notas, interpretar símbolos oníricos, tiragens de Tarot ou sugerir correspondências do Liber 777 e Brasilis.",
      timestamp: formatTime24h(new Date()),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Mini Graph Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Conexões diretas (explícitas + wikilinks + backlinks)
  const directConnectedEntries = useMemo(() => {
    if (!currentEntry) return [];
    const map = new Map<string, { entry: MagickEntry; relation: string }>();

    if (currentEntry.connections) {
      currentEntry.connections.forEach((c) => {
        const target = allEntries.find((e) => e.id === c.target_id);
        if (target && target.id !== currentEntry.id) {
          map.set(target.id, { entry: target, relation: c.relationship_type || "Conexão" });
        }
      });
    }

    if (currentEntry.content) {
      const regex = /\[\[(.*?)\]\]/g;
      let m: RegExpExecArray | null;
      while ((m = regex.exec(currentEntry.content)) !== null) {
        const rawTarget = m[1]?.split("|")[0]?.trim().toLowerCase();
        if (rawTarget) {
          const match = allEntries.find(
            (e) => e.title?.toLowerCase().trim() === rawTarget || e.id?.toLowerCase().trim() === rawTarget
          );
          if (match && match.id !== currentEntry.id && !map.has(match.id)) {
            map.set(match.id, { entry: match, relation: "Citada no texto" });
          }
        }
      }
    }

    const currentTitle = currentEntry.title?.toLowerCase().trim();
    if (currentTitle) {
      for (const other of allEntries) {
        if (
          other.id !== currentEntry.id &&
          !map.has(other.id) &&
          other.content?.toLowerCase().includes(`[[${currentTitle}`)
        ) {
          map.set(other.id, { entry: other, relation: "Cita esta nota" });
        }
      }
    }

    return Array.from(map.values());
  }, [currentEntry, allEntries]);

  // Ecos Simbólicos & Sincronicidades Automáticas
  const resonances = useMemo(() => {
    return findNoteResonances(currentEntry, allEntries);
  }, [currentEntry, allEntries]);

  // Termos do Glossário detectados na nota atual
  const contextualGlossary = useMemo(() => {
    return detectGlossaryTermsForNote(currentEntry);
  }, [currentEntry]);

  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  const handleSend = async (customPrompt?: string) => {
    const text = (customPrompt || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: formatTime24h(new Date()),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: data.reply,
            timestamp: formatTime24h(new Date()),
          },
        ]);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Falha na transmissão mágica: ${err.message}`,
          timestamp: formatTime24h(new Date()),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Mini Graph Simulation focused on currentEntry
  useEffect(() => {
    if (activeTab !== "sync") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    interface MiniNode {
      id: string;
      label: string;
      isMain: boolean;
      isResonance?: boolean;
      entryObj?: MagickEntry;
      x: number;
      y: number;
      radius: number;
    }

    const miniNodes: MiniNode[] = [];
    const miniEdges: Array<{ from: string; to: string; dashed?: boolean }> = [];

    if (currentEntry) {
      miniNodes.push({
        id: currentEntry.id,
        label: currentEntry.title,
        isMain: true,
        entryObj: currentEntry,
        x: cx,
        y: cy,
        radius: 11,
      });

      const directList = directConnectedEntries.map((d) => d.entry);
      directList.forEach((target, idx) => {
        const angle = (idx / Math.max(1, directList.length)) * Math.PI * 2;
        const dist = 60;
        miniNodes.push({
          id: target.id,
          label: target.title,
          isMain: false,
          entryObj: target,
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          radius: 7.5,
        });
        miniEdges.push({ from: currentEntry.id, to: target.id, dashed: false });
      });

      // Plota também até 4 sincronicidades automáticas como órbita pontilhada
      const extraResonances = resonances
        .filter((r) => !directList.some((d) => d.id === r.entry.id))
        .slice(0, 4);

      extraResonances.forEach((resItem, idx) => {
        const angle = (idx / Math.max(1, extraResonances.length)) * Math.PI * 2 + Math.PI / 4;
        const dist = 54;
        miniNodes.push({
          id: resItem.entry.id,
          label: resItem.entry.title,
          isMain: false,
          isResonance: true,
          entryObj: resItem.entry,
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          radius: 6,
        });
        miniEdges.push({ from: currentEntry.id, to: resItem.entry.id, dashed: true });
      });
    }

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 36, 0, Math.PI * 2);
    ctx.arc(cx, cy, 62, 0, Math.PI * 2);
    ctx.stroke();

    const isLight =
      typeof document !== "undefined" && document.documentElement.getAttribute("data-mode") === "light";

    const nodeMap = new Map(miniNodes.map((n) => [n.id, n]));
    for (const edge of miniEdges) {
      const s = nodeMap.get(edge.from);
      const t = nodeMap.get(edge.to);
      if (s && t) {
        ctx.save();
        if (edge.dashed) {
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = isLight ? "rgba(168, 85, 247, 0.45)" : "rgba(192, 132, 252, 0.45)";
        } else {
          ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.3)";
        }
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    for (const node of miniNodes) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = node.isMain
        ? isLight
          ? "#111111"
          : "#fbbf24"
        : node.isResonance
        ? "#c084fc"
        : isLight
        ? "#444444"
        : "#e5e5e5";
      ctx.fill();
      ctx.strokeStyle = isLight ? "#ffffff" : "#121212";
      ctx.lineWidth = 2;
      ctx.stroke();

      if (node.isMain || node.entryObj) {
        ctx.fillStyle = node.isMain
          ? isLight
            ? "#111111"
            : "#ffffff"
          : isLight
          ? "#444444"
          : "#a3a3a3";
        ctx.font = "9px Inter, sans-serif";
        ctx.textAlign = "center";
        const short = node.label.length > 14 ? `${node.label.slice(0, 12)}...` : node.label;
        ctx.fillText(short, node.x, node.y + node.radius + 10);
      }
    }

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      for (const node of miniNodes) {
        if (!node.isMain && node.entryObj) {
          const dx = node.x - mouseX;
          const dy = node.y - mouseY;
          if (Math.sqrt(dx * dx + dy * dy) <= node.radius + 6) {
            onSelectEntry(node.entryObj);
            break;
          }
        }
      }
    };

    canvas.addEventListener("click", handleClick);
    return () => {
      canvas.removeEventListener("click", handleClick);
    };
  }, [currentEntry, directConnectedEntries, resonances, activeTab, onSelectEntry]);

  return (
    <aside className="w-full h-full bg-medium-900 border-l border-medium-700 flex flex-col select-none">
      {/* Top 3-Tab Switcher */}
      <div className="p-2 border-b border-medium-700 bg-medium-850 grid grid-cols-3 gap-1">
        <button
          onClick={() => setActiveTab("sync")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
            activeTab === "sync"
              ? "bg-medium-750 text-white border border-medium-600 shadow-sm"
              : "text-medium-400 hover:text-white hover:bg-medium-800/60"
          }`}
          title="Sincronicidades, Ecos Simbólicos e Grafo desta Nota"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="truncate">Ecos</span>
          {(directConnectedEntries.length + resonances.length) > 0 && (
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
              {directConnectedEntries.length + resonances.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
            activeTab === "chat"
              ? "bg-medium-750 text-white border border-medium-600 shadow-sm"
              : "text-medium-400 hover:text-white hover:bg-medium-800/60"
          }`}
          title="Conversar com o Frater IA sobre suas notas"
        >
          <Bot className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
          <span className="truncate">Frater IA</span>
        </button>

        <button
          onClick={() => setActiveTab("guide")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
            activeTab === "guide"
              ? "bg-medium-750 text-white border border-medium-600 shadow-sm"
              : "text-medium-400 hover:text-white hover:bg-medium-800/60"
          }`}
          title="Glossário e explicações simples sobre os símbolos desta nota"
        >
          <Compass className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="truncate">Guia</span>
        </button>
      </div>

      {/* =================================================================
          ABA 1: SINCRONICIDADES, ECOS SIMBÓLICOS & MINI-GRAFO
         ================================================================= */}
      {activeTab === "sync" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Mini Grafo Orbital */}
          <div className="rounded-xl border border-medium-750 bg-medium-950/60 p-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-medium-300 mb-1.5">
              <span className="flex items-center gap-1.5 text-white">
                <Network className="w-3.5 h-3.5 text-amber-400" />
                <span>Constelação da Nota</span>
              </span>
              {onOpenFullGraph && (
                <button
                  type="button"
                  onClick={onOpenFullGraph}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-medium-800 hover:bg-medium-750 text-medium-200 hover:text-white border border-medium-700 text-[10px] transition-colors"
                >
                  <Maximize2 className="w-2.5 h-2.5" />
                  <span>Mapa Geral</span>
                </button>
              )}
            </div>
            <div
              onClick={() => onOpenFullGraph && onOpenFullGraph()}
              className="rounded-lg border border-medium-800 bg-black/30 overflow-hidden relative cursor-pointer group h-36"
            >
              <canvas ref={canvasRef} width={290} height={144} className="w-full h-full" />
              <div className="absolute bottom-1 right-1.5 text-[9px] font-mono text-medium-400 bg-black/70 px-1.5 py-0.5 rounded pointer-events-none">
                ● Direto &nbsp; ◌ Sincronicidade
              </div>
            </div>
          </div>

          {/* Sincronicidades & Ressonâncias Automáticas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Ecos & Sincronicidades ({resonances.length})</span>
              </h4>
            </div>

            {resonances.length === 0 ? (
              <div className="p-3 rounded-xl bg-medium-850/60 border border-medium-800 text-[11px] text-medium-400 leading-relaxed">
                Conforme você registra sonhos, tiragens de Tarot, Orixás ou banhos de ervas, o sistema mostra
                automaticamente aqui outras notas que vibram na mesma sintonia.
              </div>
            ) : (
              <div className="space-y-2">
                {resonances.map((resItem) => (
                  <button
                    key={resItem.entry.id}
                    onClick={() => onSelectEntry(resItem.entry)}
                    className="w-full text-left p-2.5 rounded-xl bg-medium-850/70 hover:bg-medium-800 border border-medium-750 hover:border-purple-500/40 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                        {resItem.entry.title}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-medium-400 group-hover:text-purple-300 flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-medium-400 mb-1.5 font-mono">
                      <span>{normalizeCategory(resItem.entry.type)}</span>
                      <span>•</span>
                      <span>{formatDateBR(resItem.entry.date)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {resItem.sharedBadges.map((b, i) => (
                        <span
                          key={i}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-200 border border-purple-500/30"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Conexões Diretas / Wikilinks */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-medium-300 flex items-center gap-1.5 mb-2">
              <Link2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Conexões Diretas ({directConnectedEntries.length})</span>
            </h4>
            {directConnectedEntries.length === 0 ? (
              <p className="text-[11px] text-medium-500 italic">
                Nenhuma nota vinculada manualmente. Use <code className="text-medium-300">[[Título]]</code> no
                texto ou a pílula &ldquo;Conexões&rdquo; no topo da nota.
              </p>
            ) : (
              <div className="space-y-1.5">
                {directConnectedEntries.map(({ entry: target, relation }) => (
                  <button
                    key={target.id}
                    onClick={() => onSelectEntry(target)}
                    className="w-full text-left p-2 rounded-lg bg-medium-850 hover:bg-medium-800 border border-medium-750 flex items-center justify-between gap-2 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white truncate">{target.title}</div>
                      <div className="text-[10px] text-medium-400">
                        {relation} · {formatDateBR(target.date)}
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-medium-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================
          ABA 2: FRATER AUXILIAR (ASSISTENTE IA EM COLUNA INTEIRA)
         ================================================================= */}
      {activeTab === "chat" && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Quick Actions Bar */}
          <div className="p-2 border-b border-medium-800 bg-medium-950/60 flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {currentEntry && (
                <button
                  onClick={() =>
                    handleSend(
                      `Analise a minha nota atual "${currentEntry.title}" (${normalizeCategory(
                        currentEntry.type
                      )}, Lua: ${currentEntry.moon_phase || "N/A"} em ${
                        currentEntry.moon_sign || "N/A"
                      }) e aponte correspondências 777/Brasilis e possíveis sincronicidades com meu histórico.`
                    )
                  }
                  className="flex-shrink-0 px-2 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-[10px] text-purple-200 font-semibold flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-purple-300" />
                  <span>Analisar Esta Nota</span>
                </button>
              )}

              <button
                onClick={() =>
                  handleSend(
                    "Quais processos mágickos eu tive mais sucessos e quais influências eles tinham em comum?"
                  )
                }
                className="flex-shrink-0 px-2 py-1 rounded bg-medium-850 hover:bg-medium-800 border border-medium-700 text-[10px] text-medium-300 hover:text-white transition-colors"
              >
                <span>⚡ Padrões de Sucesso</span>
              </button>

              <button
                onClick={() =>
                  handleSend(
                    "Como as minhas consultas oraculares se conectaram com meus sonhos e práticas recentes?"
                  )
                }
                className="flex-shrink-0 px-2 py-1 rounded bg-medium-850 hover:bg-medium-800 border border-medium-700 text-[10px] text-medium-300 hover:text-white transition-colors"
              >
                <span>🃏 Oráculos ↔ Sonhos</span>
              </button>
            </div>

            <button
              onClick={() =>
                setMessages([
                  {
                    id: "reset",
                    role: "assistant",
                    content: "Memória reiniciada. Em que posso auxiliá-lo hoje?",
                    timestamp: formatTime24h(new Date()),
                  },
                ])
              }
              className="p-1 text-medium-400 hover:text-white rounded hover:bg-medium-800 flex-shrink-0"
              title="Limpar Conversa"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[92%] rounded-xl p-2.5 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-white text-black font-medium"
                      : "bg-medium-800 text-medium-200 border border-medium-750"
                  }`}
                >
                  <div className="whitespace-pre-line prose prose-invert prose-xs">{m.content}</div>
                  <div
                    className={`text-[9px] mt-1 font-mono text-right ${
                      m.role === "user" ? "text-black/60" : "text-medium-400"
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-[11px] text-medium-400 font-mono italic flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>
                Consultando registros do grimório...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-2.5 border-t border-medium-700 bg-medium-850">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Perguntar ao Frater IA..."
                disabled={loading}
                className="flex-1 bg-medium-800 border border-medium-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-medium-400 focus:outline-none focus:border-white font-sans"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-1.5 bg-white hover:bg-medium-200 disabled:opacity-40 text-black rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================
          ABA 3: GUIA CONTEXTUAL DA NOTA (GLOSSÁRIO VIVO PARA INICIANTES)
         ================================================================= */}
      {activeTab === "guide" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Guia Contextual da Nota</span>
              </span>
              {onOpenOnboarding && (
                <button
                  onClick={onOpenOnboarding}
                  className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-semibold transition-colors"
                >
                  Abrir Guia Completo
                </button>
              )}
            </div>
            <p className="text-[11px] text-medium-300 leading-relaxed">
              Conceitos e fundamentos detectados nesta nota explicados de forma direta:
            </p>
          </div>

          <div className="space-y-2.5">
            {contextualGlossary.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-medium-850/80 border border-medium-750 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-1">
                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>{item.term}</span>
                  </h5>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">{item.shortPlainMeaning}</p>
                {item.brazilianBridge && (
                  <p className="text-[10px] text-emerald-300/90 leading-relaxed pt-1 border-t border-medium-800">
                    <strong>🌿 Ponte Brasileira:</strong> {item.brazilianBridge}
                  </p>
                )}
                <p className="text-[10px] text-sky-300/90 leading-relaxed">
                  <strong>💡 Como usar:</strong> {item.howToUseInApp}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
