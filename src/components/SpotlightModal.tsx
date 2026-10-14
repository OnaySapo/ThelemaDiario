"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { MagickEntry, normalizeCategory } from "@/lib/types";
import { getCategoryThelemicIcon, ZodiacIcon, ThelemicDateDisplay } from "@/components/ThelemicIcons";
import { Search, X, Calendar, Star, Compass, ArrowRight, CornerDownLeft } from "lucide-react";

interface SpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: MagickEntry[];
  onSelectEntry: (entry: MagickEntry) => void;
}

export function SpotlightModal({
  isOpen,
  onClose,
  entries,
  onSelectEntry,
}: SpotlightModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Foco automático no input ao abrir
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Resultados de busca filtrados e ranqueados
  const results = useMemo(() => {
    if (!query.trim()) {
      // Exibe as 8 notas mais recentes por padrão
      return entries.slice(0, 8);
    }

    const q = query.toLowerCase().trim();
    return entries
      .filter((e) => {
        const titleMatch = e.title.toLowerCase().includes(q);
        const contentMatch = e.content.toLowerCase().includes(q);
        const typeMatch = (e.type || "").toLowerCase().includes(q);
        const tagsMatch = (e.tags || []).some((t) => t.toLowerCase().includes(q));
        const astroMatch = `${e.sun_sign || ""} ${e.moon_sign || ""} ${e.thelemic_date || ""}`
          .toLowerCase()
          .includes(q);
        const influenceMatch = (e.influences || []).some(
          (inf) => inf.name.toLowerCase().includes(q) || inf.category.toLowerCase().includes(q)
        );

        return titleMatch || contentMatch || typeMatch || tagsMatch || astroMatch || influenceMatch;
      })
      .slice(0, 15);
  }, [entries, query]);

  // Navegação por teclado (Cima, Baixo, Enter, Esc)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelectEntry(results[selectedIndex]);
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, onSelectEntry, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-medium-850 border border-medium-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Campo de Busca Superior */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-medium-750 bg-medium-900/70">
          <Search className="w-5 h-5 text-medium-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Buscar por título, conteúdo, tag, astro, signo ou data Thelêmica..."
            className="flex-1 bg-transparent text-sm text-medium-100 placeholder-medium-500 font-sans focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-medium-800 border border-medium-700 text-[10px] font-mono text-medium-400 font-bold">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 rounded text-medium-400 hover:text-white hover:bg-medium-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de Resultados */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-medium-400 space-y-2">
              <p>Nenhuma anotação mágica encontrada para &ldquo;{query}&rdquo;.</p>
              <p className="text-[11px] text-medium-500">Tente buscar por termos do ritual, signos ou influências.</p>
            </div>
          ) : (
            results.map((entry, idx) => {
              const isSelected = idx === selectedIndex;
              const formattedDate = new Date(entry.date).toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={entry.id}
                  onClick={() => {
                    onSelectEntry(entry);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border flex items-start justify-between gap-3 ${
                    isSelected
                      ? "bg-medium-800 border-medium-500 text-medium-100 shadow-md ring-1 ring-medium-400/30"
                      : "bg-medium-850/60 border-medium-750/70 text-medium-300 hover:bg-medium-800/40 hover:border-medium-700"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`p-2 rounded-lg shrink-0 mt-0.5 border ${
                        isSelected
                          ? "bg-medium-750 text-medium-100 border-medium-600"
                          : "bg-medium-800/80 text-medium-300 border-medium-700"
                      }`}
                    >
                      {getCategoryThelemicIcon(entry.type, "w-4 h-4")}
                    </span>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono uppercase font-bold px-1.5 py-0.2 rounded border ${
                            isSelected
                              ? "bg-medium-750 border-medium-600 text-medium-200"
                              : "bg-medium-800 border-medium-700 text-medium-400"
                          }`}
                        >
                          {normalizeCategory(entry.type)}
                        </span>
                        <span className="text-xs font-serif font-bold truncate text-medium-100">
                          {entry.title}
                        </span>
                      </div>

                      <p className="text-xs line-clamp-1 leading-relaxed text-medium-400">
                        {entry.content.replace(/[#*`_>]/g, "")}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-medium-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formattedDate}</span>
                        </span>
                        {entry.thelemic_date && (
                          <span className="flex items-center gap-1">
                            <Compass className="w-3 h-3" />
                            <span>{entry.thelemic_date}</span>
                          </span>
                        )}
                        {entry.success_rating !== undefined && entry.success_rating !== null && (
                          <span className="flex items-center gap-1 font-semibold text-medium-200">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{entry.success_rating}/10</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center pt-2">
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono font-bold bg-medium-700 text-medium-100 border border-medium-600 px-2.5 py-1 rounded-md shadow-sm">
                        <span>Abrir</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </span>
                    ) : (
                      <ArrowRight className="w-4 h-4 text-medium-500" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé Informativo */}
        <div className="px-4 py-2 border-t border-medium-750 bg-medium-900/80 text-[11px] font-mono text-medium-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-medium-800 border border-medium-700 font-bold">↑</kbd>{" "}
              <kbd className="px-1 py-0.5 rounded bg-medium-800 border border-medium-700 font-bold">↓</kbd> Navegar
            </span>
            <span>·</span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-medium-800 border border-medium-700 font-bold">↵</kbd> Selecionar
            </span>
          </div>
          <span className="text-[10px] text-medium-500">
            {results.length} {results.length === 1 ? "registro" : "registros"}
          </span>
        </div>
      </div>
    </div>
  );
}
