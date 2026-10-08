"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Bot, User, Trash2, ArrowRight } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatDrawer({ isOpen, onClose }: ChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "**Faze o que tu queres há de ser tudo da Lei.**\n\nSaudações, Frater. Eu sou o seu Secretário e Frater Auxiliar Mágicko. Posso analisar todos os seus registros, cruzar graus de sucesso com fases da lua, entidades, incensos e oráculos.\n\nComo posso auxiliá-lo na Grande Obra hoje?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
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
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || "Erro ao consultar o assistente.");
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Ocorreu uma perturbação no fluxo: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-forest-900 border-l border-forest-700 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-forest-700 bg-forest-850 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-moss-500/20 border border-moss-500/40 flex items-center justify-center">
            <Bot className="w-4 h-4 text-moss-400" />
          </div>
          <div>
            <h2 className="text-sm font-serif font-bold text-parchment-100 flex items-center gap-1.5">
              <span>Frater Auxiliar</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-forest-750 text-gold-400 border border-gold-500/30">
                IA THELEMA
              </span>
            </h2>
            <p className="text-[11px] text-parchment-400 font-mono">
              Cruzamento de Padrões & Insights
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              setMessages([
                {
                  id: "welcome-reset",
                  role: "assistant",
                  content:
                    "**Faze o que tu queres há de ser tudo da Lei.**\n\nMemória do diálogo reiniciada. Pode formular uma nova consulta.",
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ])
            }
            className="p-1.5 text-parchment-400 hover:text-scarlet-400 hover:bg-forest-750 rounded-lg transition-colors"
            title="Limpar Conversa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-parchment-400 hover:text-parchment-100 hover:bg-forest-750 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Suggested Chips */}
      <div className="p-3 bg-forest-950/60 border-b border-forest-800 text-xs overflow-x-auto flex gap-1.5 no-scrollbar">
        {[
          "Quais processos mágickos eu tive mais sucessos e quais influências eles tinham em comum?",
          "Quais tiragens de Tarô se manifestaram nos sonhos seguintes?",
          "Qual a melhor fase lunar para meus rituais?",
        ].map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-forest-800 hover:bg-forest-750 border border-forest-700 text-parchment-300 hover:text-gold-400 text-[11px] transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-gold-500" />
            <span className="truncate max-w-[200px]">{prompt}</span>
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-forest-800 border border-forest-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-moss-400" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                m.role === "user"
                  ? "bg-moss-600 text-forest-950 font-medium rounded-tr-none"
                  : "bg-forest-800/90 text-parchment-200 border border-forest-700 rounded-tl-none font-sans"
              }`}
            >
              <div className="whitespace-pre-line prose prose-invert prose-xs">
                {m.content}
              </div>
              <div
                className={`text-[9px] mt-1.5 text-right font-mono ${
                  m.role === "user" ? "text-forest-900/80" : "text-parchment-500"
                }`}
              >
                {m.timestamp}
              </div>
            </div>

            {m.role === "user" && (
              <div className="w-7 h-7 rounded-lg bg-moss-600/30 border border-moss-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-parchment-100" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-parchment-400 font-mono italic pl-10">
            <span className="w-2 h-2 rounded-full bg-moss-500 animate-ping"></span>
            Consultando registros e correspondências de Liber 777...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-forest-700 bg-forest-850">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre seus rituais, influências ou oráculos..."
            disabled={loading}
            className="flex-1 bg-forest-900 border border-forest-700 rounded-xl px-3.5 py-2.5 text-xs text-parchment-100 placeholder-parchment-500 focus:outline-none focus:border-moss-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 bg-moss-600 hover:bg-moss-500 disabled:opacity-50 text-forest-950 font-bold rounded-xl transition-all shadow-arcane"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
