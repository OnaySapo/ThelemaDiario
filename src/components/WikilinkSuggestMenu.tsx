"use client";

import React, { useState, useEffect, useRef } from "react";
import { MagickEntry, normalizeCategory } from "@/lib/types";
import { getCategoryThelemicIcon, ZodiacIcon } from "@/components/ThelemicIcons";
import { Link2, Sparkles, Star, Calendar } from "lucide-react";

interface WikilinkSuggestMenuProps {
  isOpen: boolean;
  query: string;
  position: { top: number; left: number };
  onClose: () => void;
  entries: MagickEntry[];
  onSelectEntry: (entry: MagickEntry) => void;
}

export function WikilinkSuggestMenu({
  isOpen,
  query,
  position,
  onClose,
  entries,
  onSelectEntry,
}: WikilinkSuggestMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filtered = entries
    .filter((e) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      const titleMatch = e.title.toLowerCase().includes(q);
      const contentMatch = (e.content || "").toLowerCase().includes(q);
      const typeMatch = (e.type || "").toLowerCase().includes(q);
      const tagsMatch = (e.tags || []).some((t) => t.toLowerCase().includes(q));
      return titleMatch || contentMatch || typeMatch || tagsMatch;
    })
    .slice(0, 8);

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
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onSelectEntry(filtered[selectedIndex]);
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onSelectEntry, onClose]);

  if (!isOpen || filtered.length === 0) return null;

  return (
    <div
      ref={menuRef}
      style={{
        top: `${Math.min(position.top, window.innerHeight - 340)}px`,
        left: `${Math.min(position.left, window.innerWidth - 320)}px`,
      }}
      className="fixed z-50 w-80 max-h-80 overflow-y-auto rounded-xl bg-medium-850/95 backdrop-blur-md border border-medium-700 shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 select-none custom-scrollbar"
    >
      <div className="px-2.5 py-1 text-[10px] font-mono font-bold text-medium-400 uppercase tracking-wider border-b border-medium-750 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-white">
          <Link2 className="w-3 h-3 text-amber-400" />
          <span>Vincular Nota ([[...]])</span>
        </span>
        <span className="text-[9px] text-amber-400/80">↑↓ navegar · ↵ escolher</span>
      </div>

      <div className="space-y-0.5">
        {filtered.map((entry, idx) => {
          const isSelected = idx === selectedIndex;
          const category = normalizeCategory(entry.type);
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => {
                onSelectEntry(entry);
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
                {getCategoryThelemicIcon(category, "w-3.5 h-3.5")}
              </div>
              <div className="flex-1 truncate">
                <div className="font-semibold truncate text-[13px]">{entry.title}</div>
                <div className="text-[10px] text-medium-400 truncate opacity-85 flex items-center gap-2 font-mono">
                  <span>{category}</span>
                  {entry.thelemic_date && (
                    <>
                      <span>•</span>
                      <span className="truncate">{entry.thelemic_date.slice(0, 20)}</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
