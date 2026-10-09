"use client";

import React, { useState, useMemo } from "react";
import { MagickEntry, normalizeCategory, CategoryName } from "@/lib/types";
import { getCategoryThelemicIcon, EstrelaDeThelema } from "@/components/ThelemicIcons";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Star, X, ArrowRight } from "lucide-react";

interface ThelemicCalendarProps {
  entries: MagickEntry[];
  onSelectEntry: (entry: MagickEntry) => void;
  onNewNote?: (targetDate?: string) => void;
}

const WEEKDAYS = [
  { short: "Seg", thelemic: "Dies ☽", full: "Dies Lunae" },
  { short: "Ter", thelemic: "Dies ♂", full: "Dies Martis" },
  { short: "Qua", thelemic: "Dies ☿", full: "Dies Mercurii" },
  { short: "Qui", thelemic: "Dies ♃", full: "Dies Jovis" },
  { short: "Sex", thelemic: "Dies ♀", full: "Dies Veneris" },
  { short: "Sáb", thelemic: "Dies ♄", full: "Dies Saturni" },
  { short: "Dom", thelemic: "Dies ☉", full: "Dies Solis" },
];

export function ThelemicCalendar({
  entries,
  onSelectEntry,
  onNewNote,
}: ThelemicCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth(); // 0 - 11

  // Pre-index entries by date string (YYYY-MM-DD)
  const entriesByDate = useMemo(() => {
    const map = new Map<string, MagickEntry[]>();
    for (const e of entries) {
      if (!e.date) continue;
      const dateKey = e.date.slice(0, 10);
      const list = map.get(dateKey) || [];
      list.push(e);
      map.set(dateKey, list);
    }
    return map;
  }, [entries]);

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Day of week: 0 (Sun) to 6 (Sat) -> map to Mon=0 ... Sun=6
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    const totalDays = lastDayOfMonth.getDate();
    const days: Array<{
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      entries: MagickEntry[];
    }> = [];

    const todayStr = new Date().toISOString().slice(0, 10);

    // Previous month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDay = prevMonthLastDay - i;
      const prevDate = new Date(currentYear, currentMonth - 1, prevDay);
      const dateStr = prevDate.toISOString().slice(0, 10);
      days.push({
        dateStr,
        dayNum: prevDay,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        entries: entriesByDate.get(dateStr) || [],
      });
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(currentYear, currentMonth, day);
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push({
        dateStr,
        dayNum: day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        entries: entriesByDate.get(dateStr) || [],
      });
    }

    // Next month padding to fill complete grid of 35 or 42 cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let day = 1; day <= remainingCells; day++) {
      const nextDate = new Date(currentYear, currentMonth + 1, day);
      const dateStr = nextDate.toISOString().slice(0, 10);
      days.push({
        dateStr,
        dayNum: day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        entries: entriesByDate.get(dateStr) || [],
      });
    }

    return days;
  }, [currentYear, currentMonth, entriesByDate]);

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setViewDate(new Date());
    setSelectedDateStr(new Date().toISOString().slice(0, 10));
  };

  const selectedDayNotes = selectedDateStr ? entriesByDate.get(selectedDateStr) || [] : [];

  return (
    <div className="bg-medium-850 rounded-xl border border-medium-700 p-5 space-y-4 shadow-sm">
      {/* Calendar Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-medium-750 pb-3">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-4 h-4 text-white" />
          <h3 className="text-sm font-sans font-bold text-white tracking-wide capitalize">
            {viewDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </h3>
          <span className="text-[10px] font-mono text-medium-400 bg-medium-800 px-2 py-0.5 rounded border border-medium-700">
            Calendário Thelêmico
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-mono text-medium-300 hover:text-white hover:bg-medium-800 rounded border border-medium-750 transition-colors"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 text-medium-400 hover:text-white hover:bg-medium-800 rounded transition-colors"
            title="Mês Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 text-medium-400 hover:text-white hover:bg-medium-800 rounded transition-colors"
            title="Próximo Mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekdays Row */}
      <div className="grid grid-cols-7 gap-1 text-center font-mono">
        {WEEKDAYS.map((w, idx) => (
          <div key={idx} className="py-1 text-[10px] text-medium-400 font-semibold" title={w.full}>
            <span className="block sm:hidden">{w.thelemic}</span>
            <span className="hidden sm:block">
              {w.short} <span className="text-medium-500 text-[9px] font-normal">({w.thelemic.replace("Dies ", "")})</span>
            </span>
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((cell, idx) => {
          const isSelected = selectedDateStr === cell.dateStr;
          const hasNotes = cell.entries.length > 0;

          // Group notes of this cell by category
          const categoryGroups: [CategoryName, MagickEntry[]][] = [];
          if (hasNotes) {
            const catMap = new Map<CategoryName, MagickEntry[]>();
            for (const entry of cell.entries) {
              const cat = normalizeCategory(entry.type);
              const list = catMap.get(cat) || [];
              list.push(entry);
              catMap.set(cat, list);
            }
            catMap.forEach((list, cat) => {
              categoryGroups.push([cat, list]);
            });
          }

          return (
            <div
              key={idx}
              onClick={() => setSelectedDateStr(cell.dateStr)}
              className={`min-h-[64px] sm:min-h-[76px] p-1.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                cell.isCurrentMonth ? "bg-medium-900/90" : "bg-medium-950/40 opacity-40"
              } ${
                isSelected
                  ? "border-white ring-1 ring-white bg-medium-800"
                  : cell.isToday
                  ? "border-medium-500 bg-medium-850"
                  : "border-medium-750/80 hover:border-medium-600 hover:bg-medium-800/50"
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-mono leading-none ${
                    cell.isToday
                      ? "w-4 h-4 rounded-full bg-white text-black font-bold flex items-center justify-center text-[10px]"
                      : cell.isCurrentMonth
                      ? "text-medium-300 font-medium"
                      : "text-medium-500"
                  }`}
                >
                  {cell.dayNum}
                </span>

                {hasNotes && (
                  <span className="text-[9px] font-mono text-medium-400 font-bold hidden sm:inline">
                    {cell.entries.length}
                  </span>
                )}
              </div>

              {/* Category Bubbles with Overlapping Count Badge */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {categoryGroups.map(([cat, catEntries]) => (
                  <div
                    key={cat}
                    className="relative inline-flex items-center justify-center group"
                    title={`${cat}: ${catEntries.length} ${catEntries.length === 1 ? "nota" : "notas"}`}
                  >
                    {/* Main Category Bubble */}
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-medium-800 border border-medium-700 flex items-center justify-center shadow-xs transition-transform hover:scale-110">
                      {getCategoryThelemicIcon(cat, "w-2.5 h-2.5 sm:w-3 sm:h-3 text-medium-200")}
                    </div>

                    {/* Overlapping Counter Bubble in bottom-right corner if count > 1 */}
                    {catEntries.length > 1 && (
                      <span className="absolute -bottom-1 -right-1 min-w-[13px] h-[13px] px-0.5 rounded-full bg-white text-black font-mono text-[8px] font-black flex items-center justify-center border border-medium-700 shadow-sm leading-none">
                        {catEntries.length}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Drawer / Notes List */}
      {selectedDateStr && (
        <div className="mt-4 pt-4 border-t border-medium-750 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Registros de {new Date(selectedDateStr + "T12:00:00").toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-medium-800 text-medium-300 border border-medium-700">
                {selectedDayNotes.length} {selectedDayNotes.length === 1 ? "nota" : "notas"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onNewNote && (
                <button
                  type="button"
                  onClick={() => onNewNote(selectedDateStr)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-medium-200 text-black rounded text-[11px] font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Nota Neste Dia</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedDateStr(null)}
                className="p-1 text-medium-400 hover:text-white rounded hover:bg-medium-800"
                title="Fechar Detalhes"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {selectedDayNotes.length === 0 ? (
            <div className="p-4 rounded-lg bg-medium-900 border border-medium-750 text-center text-xs text-medium-400 font-mono">
              Nenhuma operação mágicka ou diário registrado nesta data.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {selectedDayNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onSelectEntry(note)}
                  className="p-3 rounded-lg bg-medium-900 border border-medium-750 hover:border-medium-600 hover:bg-medium-800/80 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-semibold uppercase text-medium-300 px-1.5 py-0.5 rounded bg-medium-800 border border-medium-700 flex items-center gap-1">
                        {getCategoryThelemicIcon(note.type, "w-3 h-3 text-medium-300")}
                        <span>{normalizeCategory(note.type)}</span>
                      </span>

                      {note.success_rating !== undefined && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-medium-300 font-semibold">
                          <Star className="w-3 h-3 fill-white text-white" />
                          {note.success_rating}/10
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-serif font-bold text-white group-hover:underline line-clamp-1">
                      {note.title}
                    </h4>

                    <p className="text-[11px] text-medium-400 line-clamp-2 mt-1 leading-relaxed">
                      {note.content.replace(/[#*`_>]/g, "")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-medium-800/70 text-[10px] font-mono text-medium-400">
                    <span>{note.thelemic_date || note.date.slice(11, 16) || "Thelema"}</span>
                    <span className="flex items-center gap-1 text-white group-hover:translate-x-0.5 transition-transform">
                      <span>Abrir</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
