"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sun,
  Calculator,
  CheckSquare,
  Layers,
  Compass,
  Sparkles,
  Link2,
  Image as ImageIcon,
  Video,
  Table,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Palette,
  Mic,
} from "lucide-react";

export interface SlashCommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: "thelêmico" | "formatação" | "mídia" | "hermético";
  keywords: string[];
  action: () => void;
}

interface SlashCommandMenuProps {
  isOpen: boolean;
  query: string;
  position: { top: number; left: number };
  onClose: () => void;
  commands: SlashCommandItem[];
}

export function SlashCommandMenu({
  isOpen,
  query,
  position,
  onClose,
  commands,
}: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filtered = commands.filter((cmd) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen || filtered.length === 0) return null;

  return (
    <div
      ref={menuRef}
      style={{
        top: `${Math.min(position.top, window.innerHeight - 340)}px`,
        left: `${Math.min(position.left, window.innerWidth - 300)}px`,
      }}
      className="fixed z-50 w-72 max-h-80 overflow-y-auto rounded-xl bg-medium-850/95 backdrop-blur-md border border-medium-700 shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 select-none custom-scrollbar"
    >
      <div className="px-2.5 py-1 text-[10px] font-mono font-bold text-medium-400 uppercase tracking-wider border-b border-medium-750 flex items-center justify-between">
        <span>Comandos Mágickos (/)</span>
        <span className="text-[9px] text-amber-400/80">↑↓ navegar · ↵ escolher</span>
      </div>

      <div className="space-y-0.5">
        {filtered.map((cmd, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={cmd.id}
              type="button"
              onClick={() => {
                cmd.action();
                onClose();
              }}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 transition-colors text-xs ${
                isSelected
                  ? "bg-amber-500/20 text-white border border-amber-500/40 font-medium"
                  : "text-medium-300 hover:text-white hover:bg-medium-800 border border-transparent"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                  isSelected ? "text-amber-300 bg-amber-500/20" : "text-medium-400 bg-medium-800"
                }`}
              >
                {cmd.icon}
              </div>
              <div className="flex-1 truncate">
                <div className="font-semibold truncate">{cmd.title}</div>
                <div className="text-[10px] text-medium-400 truncate opacity-85">{cmd.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
