"use client";

import React from "react";
import { MagickEntry } from "@/lib/types";
import {
  Sword,
  Sparkles,
  Moon,
  Eye,
  BookOpen,
  Star,
  Link as LinkIcon,
  Flame,
  User,
  Heart,
  Wand2,
  Trash2,
  Edit3,
} from "lucide-react";
import { ThelemicDateDisplay } from "@/components/ThelemicIcons";

interface EntryCardProps {
  entry: MagickEntry;
  onEdit: (entry: MagickEntry) => void;
  onDelete: (id: string) => void;
  onSelectConnect?: (entry: MagickEntry) => void;
}

export function EntryCard({ entry, onEdit, onDelete, onSelectConnect }: EntryCardProps) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case "ritual":
        return {
          label: "Ritual / Prática",
          icon: <Sword className="w-3.5 h-3.5 text-gold-400" />,
          badgeColor: "bg-gold-500/10 text-gold-400 border-gold-500/30",
          cardBorder: "border-forest-700 hover:border-gold-500/50",
        };
      case "oracle":
        return {
          label: "Oráculo / Thoth",
          icon: <Sparkles className="w-3.5 h-3.5 text-moss-400" />,
          badgeColor: "bg-moss-500/10 text-moss-400 border-moss-500/30",
          cardBorder: "border-forest-700 hover:border-moss-500/50",
        };
      case "dream":
        return {
          label: "Sonho Lúcido",
          icon: <Moon className="w-3.5 h-3.5 text-twilight-400" />,
          badgeColor: "bg-twilight-500/10 text-twilight-400 border-twilight-500/30",
          cardBorder: "border-forest-700 hover:border-twilight-400/50",
        };
      case "vision":
        return {
          label: "Visão Astral / Skrying",
          icon: <Eye className="w-3.5 h-3.5 text-lunar-400" />,
          badgeColor: "bg-lunar-500/10 text-lunar-400 border-lunar-500/30",
          cardBorder: "border-forest-700 hover:border-lunar-400/50",
        };
      case "study":
      default:
        return {
          label: "Estudo Hermético",
          icon: <BookOpen className="w-3.5 h-3.5 text-amber-500" />,
          badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/30",
          cardBorder: "border-forest-700 hover:border-amber-500/50",
        };
    }
  };

  const typeConfig = getTypeConfig(entry.type);

  const getInfluenceIcon = (category: string) => {
    switch (category) {
      case "entity":
        return <Sparkles className="w-3 h-3 text-gold-400" />;
      case "tool":
        return <Wand2 className="w-3 h-3 text-moss-400" />;
      case "candle":
        return <Flame className="w-3 h-3 text-scarlet-400" />;
      case "feeling":
        return <Heart className="w-3 h-3 text-twilight-400" />;
      case "person":
        return <User className="w-3 h-3 text-parchment-300" />;
      default:
        return <Sparkles className="w-3 h-3 text-parchment-400" />;
    }
  };

  const formattedDate = new Date(entry.date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`group relative bg-forest-800/80 rounded-xl border p-5 transition-all duration-200 shadow-sm hover:shadow-arcane ${typeConfig.cardBorder}`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeConfig.badgeColor}`}
          >
            {typeConfig.icon}
            <span>{typeConfig.label}</span>
          </span>

          <span className="text-xs text-parchment-400 font-mono">
            {formattedDate}
          </span>
        </div>

        {/* Success rating badge */}
        {entry.success_rating !== undefined && entry.success_rating > 0 && (
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-forest-750 border border-forest-600/50 text-xs font-mono font-semibold"
            title={`Taxa de Sucesso: ${entry.success_rating}/10`}
          >
            <Star className="w-3 h-3 fill-gold-500 text-gold-500" />
            <span className="text-gold-400">{entry.success_rating}</span>
            <span className="text-parchment-500 text-[10px]">/10</span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3
        onClick={() => onEdit(entry)}
        className="text-base font-serif font-bold text-parchment-100 group-hover:text-gold-400 cursor-pointer transition-colors mb-1.5 line-clamp-1"
      >
        {entry.title}
      </h3>

      {/* Thelemic Coordinates */}
      {entry.thelemic_date && (
        <div className="flex items-center gap-2 text-xs font-mono text-medium-300 mb-3 bg-medium-850 px-2.5 py-1 rounded border border-medium-700">
          <ThelemicDateDisplay thelemicDate={entry.thelemic_date} />
        </div>
      )}

      {/* Content excerpt */}
      <p className="text-xs text-parchment-300 line-clamp-3 mb-4 whitespace-pre-line leading-relaxed">
        {entry.content}
      </p>

      {/* If Oracle: Cards Preview */}
      {entry.oracle_data && entry.oracle_data.cards && entry.oracle_data.cards.length > 0 && (
        <div className="mb-3 p-2.5 rounded-lg bg-forest-850/80 border border-forest-700/60">
          <div className="text-[11px] font-semibold text-moss-400 mb-1 flex items-center justify-between">
            <span>{entry.oracle_data.spread_name}</span>
            <span className="text-parchment-400 font-normal italic">
              {entry.oracle_data.query ? `"${entry.oracle_data.query}"` : ""}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {entry.oracle_data.cards.map((c, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded bg-forest-800 text-parchment-200 border border-forest-700 font-mono"
              >
                <strong className="text-gold-400">{c.position}:</strong> {c.cardName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Influences */}
      {entry.influences && entry.influences.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {entry.influences.map((inf, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-forest-750/70 border border-forest-700 text-[11px] text-parchment-200"
            >
              {getInfluenceIcon(inf.category)}
              <span>{inf.name}</span>
            </span>
          ))}
        </div>
      )}

      {/* Bottom Footer: Tags & Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-forest-750 text-xs">
        {/* Connections or Tags */}
        <div className="flex items-center gap-2">
          {entry.connections && entry.connections.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-lunar-400 font-mono">
              <LinkIcon className="w-3 h-3" />
              <span>{entry.connections.length} conexões</span>
            </span>
          )}

          {entry.tags && entry.tags.length > 0 && (
            <div className="flex items-center gap-1">
              {entry.tags.slice(0, 3).map((t, idx) => (
                <span key={idx} className="text-[10px] text-parchment-400 font-mono">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(entry)}
            className="p-1.5 text-parchment-400 hover:text-parchment-100 hover:bg-forest-700 rounded transition-colors"
            title="Editar Entrada"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              if (confirm(`Tem certeza que deseja excluir "${entry.title}"?`)) {
                onDelete(entry.id);
              }
            }}
            className="p-1.5 text-parchment-400 hover:text-scarlet-400 hover:bg-forest-700 rounded transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
