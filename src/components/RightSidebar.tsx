"use client";

import React, { useState, useEffect, useRef } from "react";
import { MagickEntry, ChatMessage } from "@/lib/types";
import { Send, Bot, Sparkles, User, Network, RotateCcw, Link2, Trash2 } from "lucide-react";

interface RightSidebarProps {
  currentEntry: MagickEntry | null;
  allEntries: MagickEntry[];
  onSelectEntry: (entry: MagickEntry) => void;
}

export function RightSidebar({
  currentEntry,
  allEntries,
  onSelectEntry,
}: RightSidebarProps) {
  // Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "**Faze o que tu queres há de ser tudo da Lei.**\n\nSou o seu Frater Auxiliar. Estou analisando em tempo real todas as suas notas, rituais e oráculos.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Mini Graph Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (customPrompt?: string) => {
    const text = (customPrompt || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Mini Graph Simulation focused on currentEntry
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    // Build sub-network for current entry
    interface MiniNode {
      id: string;
      label: string;
      isMain: boolean;
      entryObj?: MagickEntry;
      x: number;
      y: number;
      radius: number;
    }

    const miniNodes: MiniNode[] = [];
    const miniEdges: [string, string][] = [];

    if (currentEntry) {
      miniNodes.push({
        id: currentEntry.id,
        label: currentEntry.title,
        isMain: true,
        entryObj: currentEntry,
        x: cx,
        y: cy,
        radius: 12,
      });

      // Connected notes
      if (currentEntry.connections) {
        currentEntry.connections.forEach((conn, idx) => {
          const target = allEntries.find((e) => e.id === conn.target_id);
          if (target) {
            const angle = (idx / currentEntry.connections!.length) * Math.PI * 2;
            const dist = 65;
            miniNodes.push({
              id: target.id,
              label: target.title,
              isMain: false,
              entryObj: target,
              x: cx + Math.cos(angle) * dist,
              y: cy + Math.sin(angle) * dist,
              radius: 8,
            });
            miniEdges.push([currentEntry.id, target.id]);
          }
        });
      }

      // Influences as small satellites
      if (currentEntry.influences) {
        currentEntry.influences.slice(0, 4).forEach((inf, idx) => {
          const angle = (idx / 4) * Math.PI * 2 + Math.PI / 4;
          const dist = 42;
          const infId = `inf-${inf.name}`;
          miniNodes.push({
            id: infId,
            label: inf.name,
            isMain: false,
            x: cx + Math.cos(angle) * dist,
            y: cy + Math.sin(angle) * dist,
            radius: 5,
          });
          miniEdges.push([currentEntry.id, infId]);
        });
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Background subtle grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Edges
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1;
      const nodeMap = new Map(miniNodes.map((n) => [n.id, n]));
      for (const [sId, tId] of miniEdges) {
        const s = nodeMap.get(sId);
        const t = nodeMap.get(tId);
        if (s && t) {
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(t.x, t.y);
          ctx.stroke();
        }
      }

      // Draw Nodes
      for (const node of miniNodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.isMain ? "#ffffff" : node.entryObj ? "#a3a3a3" : "#525252";
        ctx.fill();
        ctx.strokeStyle = "#121212";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label for main and connected notes
        if (node.isMain || node.entryObj) {
          ctx.fillStyle = node.isMain ? "#ffffff" : "#a3a3a3";
          ctx.font = "9px Inter, sans-serif";
          ctx.textAlign = "center";
          const short = node.label.length > 14 ? `${node.label.slice(0, 12)}...` : node.label;
          ctx.fillText(short, node.x, node.y + node.radius + 10);
        }
      }
    };

    draw();

    // Canvas click to select connected note
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
  }, [currentEntry, allEntries, onSelectEntry]);

  return (
    <aside className="w-full h-full bg-medium-900 border-l border-medium-700 flex flex-col select-none">
      {/* ========================================================
          TOP: FRATER AUXILIAR (CHATBOT PERMANENTE)
          ======================================================== */}
      <div className="flex-1 flex flex-col min-h-0 border-b border-medium-700">
        {/* Chat Header */}
        <div className="p-3 border-b border-medium-700 bg-medium-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center font-bold text-xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-sans font-bold text-white tracking-wide uppercase">
                Frater Auxiliar
              </h3>
              <span className="text-[10px] text-medium-400 font-mono block">
                INSIGHTS & CORRELAÇÕES
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              setMessages([
                {
                  id: "reset",
                  role: "assistant",
                  content: "Memória reiniciada. Em que posso auxiliá-lo na Grande Obra?",
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ])
            }
            className="p-1 text-medium-400 hover:text-white rounded hover:bg-medium-800"
            title="Limpar Conversa"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="p-2 border-b border-medium-800 bg-medium-950/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() =>
              handleSend(
                "Quais processos mágickos eu tive mais sucessos e quais influências eles tinham em comum?"
              )
            }
            className="flex-shrink-0 px-2 py-1 rounded bg-medium-850 hover:bg-medium-800 border border-medium-700 text-[10px] text-medium-300 hover:text-white flex items-center gap-1 transition-colors"
            title="Análise dos rituais e práticas com maior nota de sucesso e fatores comuns"
          >
            <Sparkles className="w-3 h-3 text-white flex-shrink-0" />
            <span>Sucesso & Influências</span>
          </button>

          <button
            onClick={() =>
              handleSend(
                "Qual a relação entre as fases lunares e os signos lunares com meu índice de sucesso mágyco?"
              )
            }
            className="flex-shrink-0 px-2 py-1 rounded bg-medium-850 hover:bg-medium-800 border border-medium-700 text-[10px] text-medium-300 hover:text-white flex items-center gap-1 transition-colors"
            title="Cruzamento estatístico entre a Lua e o sucesso nos registros"
          >
            <span>🌕 Fases da Lua</span>
          </button>

          <button
            onClick={() =>
              handleSend(
                "Como as minhas consultas oraculares do Tarô de Thoth se conectaram com meus sonhos e visões?"
              )
            }
            className="flex-shrink-0 px-2 py-1 rounded bg-medium-850 hover:bg-medium-800 border border-medium-700 text-[10px] text-medium-300 hover:text-white flex items-center gap-1 transition-colors"
            title="Conexões entre oráculos, sonhos lúcidos e skrying"
          >
            <span>🎴 Oráculos & Sonhos</span>
          </button>

          <button
            onClick={() =>
              handleSend(
                "Quais correspondências do Liber 777 estão mais presentes no meu templo e quais posso explorar?"
              )
            }
            className="flex-shrink-0 px-2 py-1 rounded bg-medium-850 hover:bg-medium-800 border border-medium-700 text-[10px] text-medium-300 hover:text-white flex items-center gap-1 transition-colors"
            title="Correspondências cabalísticas e mágickas de Liber 777"
          >
            <span>📜 Liber 777</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-lg p-2.5 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-white text-black font-medium"
                    : "bg-medium-800 text-medium-200 border border-medium-750"
                }`}
              >
                <div className="whitespace-pre-line prose prose-invert prose-xs">
                  {m.content}
                </div>
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
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              Consultando registros...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-2 border-t border-medium-700 bg-medium-850">
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
              placeholder="Perguntar ao Frater..."
              disabled={loading}
              className="flex-1 bg-medium-800 border border-medium-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-medium-400 focus:outline-none focus:border-white font-sans"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-1.5 bg-white hover:bg-medium-200 disabled:opacity-40 text-black rounded transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ========================================================
          BOTTOM: MINI GRAFO DE CONEXÕES
          ======================================================== */}
      <div className="h-48 border-t border-medium-700 bg-medium-900 flex flex-col p-2">
        <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-medium-400 px-1 mb-1">
          <span className="flex items-center gap-1.5 text-white">
            <Network className="w-3.5 h-3.5 text-white" />
            <span>Mini Grafo de Conexões</span>
          </span>
          <span className="text-[10px] text-medium-500">
            {currentEntry?.connections?.length || 0} links
          </span>
        </div>

        <div className="flex-1 rounded border border-medium-800 bg-medium-950/60 overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={320}
            height={150}
            className="w-full h-full cursor-pointer"
          />
          <div className="absolute bottom-1 right-2 text-[9px] font-mono text-medium-500 pointer-events-none">
            Clique no nó para navegar
          </div>
        </div>
      </div>
    </aside>
  );
}
