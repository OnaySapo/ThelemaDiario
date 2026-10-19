"use client";

import React, { useState, useEffect, useRef } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { parseSafeDate, toLocalDateTimeValue } from "@/lib/dateUtils";

interface BrazilianDateTimeInputProps {
  value: string; // YYYY-MM-DDTHH:mm (local) ou ISO
  onChange: (newValue: string) => void;
  className?: string;
}

const MONTHS_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const WEEKDAYS_PT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function BrazilianDateTimeInput({
  value,
  onChange,
  className = "",
}: BrazilianDateTimeInputProps) {
  const parsed = parseSafeDate(value);

  const formatToBrDateText = (d: Date) => {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const yearShort = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${yearShort}`;
  };

  const formatTo24hText = (d: Date) => {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const [dateText, setDateText] = useState(() => formatToBrDateText(parsed));
  const [timeText, setTimeText] = useState(() => formatTo24hText(parsed));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewMonthDate, setViewMonthDate] = useState(() => new Date(parsed.getFullYear(), parsed.getMonth(), 1));
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sincroniza quando value externo muda
  useEffect(() => {
    const d = parseSafeDate(value);
    setDateText(formatToBrDateText(d));
    setTimeText(formatTo24hText(d));
    setViewMonthDate(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [value]);

  // Fecha popover ao clicar fora
  useEffect(() => {
    if (!isCalendarOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCalendarOpen]);

  const commitDateAndTime = (newDatePart: { y: number; m: number; d: number }, newTimePart: { hh: number; mm: number }) => {
    const combined = new Date(
      newDatePart.y,
      newDatePart.m - 1,
      newDatePart.d,
      newTimePart.hh,
      newTimePart.mm,
      0
    );
    if (!isNaN(combined.getTime())) {
      onChange(toLocalDateTimeValue(combined));
    }
  };

  // Máscara e parsing de DD/MM/AA ou DD/MM/AAAA
  const handleDateInputChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    let masked = digits;
    if (digits.length > 4) {
      masked = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      masked = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    setDateText(masked);

    if (digits.length === 6 || digits.length === 8) {
      const day = parseInt(digits.slice(0, 2), 10);
      const month = parseInt(digits.slice(2, 4), 10);
      let year = parseInt(digits.slice(4), 10);
      if (digits.length === 6) {
        year = year < 70 ? 2000 + year : 1900 + year;
      }
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
        const cur = parseSafeDate(value);
        commitDateAndTime(
          { y: year, m: month, d: day },
          { hh: cur.getHours(), mm: cur.getMinutes() }
        );
      }
    }
  };

  const handleDateBlur = () => {
    const d = parseSafeDate(value);
    setDateText(formatToBrDateText(d));
  };

  // Máscara e parsing de Hora 24h (HH:mm)
  const handleTimeInputChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    let masked = digits;
    if (digits.length > 2) {
      masked = `${digits.slice(0, 2)}:${digits.slice(2)}`;
    }
    setTimeText(masked);

    if (digits.length === 4) {
      const hh = Math.min(23, Math.max(0, parseInt(digits.slice(0, 2), 10)));
      const mm = Math.min(59, Math.max(0, parseInt(digits.slice(2, 4), 10)));
      const cur = parseSafeDate(value);
      commitDateAndTime(
        { y: cur.getFullYear(), m: cur.getMonth() + 1, d: cur.getDate() },
        { hh, mm }
      );
    }
  };

  const handleTimeBlur = () => {
    // Se digitou apenas 1 ou 2 dígitos (ex: "9" -> "09:00", "14" -> "14:00") ou 3 dígitos ("930" -> "09:30")
    const digits = timeText.replace(/\D/g, "");
    const cur = parseSafeDate(value);
    if (digits.length >= 1 && digits.length <= 3) {
      let hh = cur.getHours();
      let mm = cur.getMinutes();
      if (digits.length <= 2) {
        hh = Math.min(23, Math.max(0, parseInt(digits, 10)));
        mm = 0;
      } else if (digits.length === 3) {
        hh = Math.min(23, Math.max(0, parseInt(digits.slice(0, 1), 10)));
        mm = Math.min(59, Math.max(0, parseInt(digits.slice(1, 3), 10)));
      }
      commitDateAndTime(
        { y: cur.getFullYear(), m: cur.getMonth() + 1, d: cur.getDate() },
        { hh, mm }
      );
      setTimeText(`${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
      return;
    }
    setTimeText(formatTo24hText(cur));
  };

  const handleSetNow = () => {
    const now = new Date();
    onChange(toLocalDateTimeValue(now));
    setIsCalendarOpen(false);
  };

  // Gera dias do mês para o mini-calendário brasileiro
  const renderCalendarDays = () => {
    const y = viewMonthDate.getFullYear();
    const m = viewMonthDate.getMonth();
    const firstDay = new Date(y, m, 1);
    const totalDays = new Date(y, m + 1, 0).getDate();

    let startOffset = firstDay.getDay() - 1;
    if (startOffset === -1) startOffset = 6; // Domingo no fim

    const cells: Array<{ day: number | null }> = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push({ day: null });
    }
    for (let d = 1; d <= totalDays; d++) {
      cells.push({ day: d });
    }

    const cur = parseSafeDate(value);
    const isSameMonth = cur.getFullYear() === y && cur.getMonth() === m;

    return cells.map((cell, idx) => {
      if (!cell.day) {
        return <div key={`empty-${idx}`} className="h-6" />;
      }
      const isSelected = isSameMonth && cur.getDate() === cell.day;
      return (
        <button
          key={cell.day}
          type="button"
          onClick={() => {
            commitDateAndTime(
              { y, m: m + 1, d: cell.day! },
              { hh: cur.getHours(), mm: cur.getMinutes() }
            );
            setIsCalendarOpen(false);
          }}
          className={`h-6 w-6 mx-auto rounded text-[11px] font-mono flex items-center justify-center transition-colors ${
            isSelected
              ? "bg-amber-400 text-black font-bold shadow-sm"
              : "text-medium-200 hover:bg-medium-750 hover:text-white"
          }`}
        >
          {cell.day}
        </button>
      );
    });
  };

  return (
    <div ref={containerRef} className={`relative flex items-center gap-1.5 ${className}`}>
      {/* Campo de Data DD/MM/AA */}
      <div className="relative flex-1 min-w-[115px]">
        <input
          type="text"
          inputMode="numeric"
          value={dateText}
          onChange={(e) => handleDateInputChange(e.target.value)}
          onBlur={handleDateBlur}
          placeholder="DD/MM/AA"
          title="Data no padrão brasileiro: Dia/Mês/Ano (DD/MM/AA)"
          className="w-full bg-medium-800 border border-medium-700 rounded-md pl-2.5 pr-7 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400 tracking-wider"
        />
        <button
          type="button"
          onClick={() => setIsCalendarOpen((prev) => !prev)}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-medium-400 hover:text-amber-300 rounded transition-colors"
          title="Abrir calendário brasileiro (DD/MM/AA)"
        >
          <Calendar className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Campo de Hora 24h (HH:mm) */}
      <div className="relative w-[88px] shrink-0">
        <Clock className="w-3 h-3 text-medium-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          inputMode="numeric"
          value={timeText}
          onChange={(e) => handleTimeInputChange(e.target.value)}
          onBlur={handleTimeBlur}
          placeholder="24h"
          title="Horário no formato 24h (00:00 às 23:59)"
          className="w-full bg-medium-800 border border-medium-700 rounded-md pl-6 pr-2 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400 text-center tracking-wider"
        />
      </div>

      {/* Botão Rápido: Agora */}
      <button
        type="button"
        onClick={handleSetNow}
        className="px-2 py-2 bg-medium-800 hover:bg-medium-750 border border-medium-700 rounded-md text-[10px] font-mono text-medium-300 hover:text-amber-300 transition-colors shrink-0"
        title="Definir data e hora para o momento atual (Agora)"
      >
        Agora
      </button>

      {/* Popover do Mini-Calendário Brasileiro + Seletor 24h */}
      {isCalendarOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-64 bg-medium-850 border border-medium-700 rounded-xl p-3 shadow-2xl z-50 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
          {/* Navegação Mês/Ano */}
          <div className="flex items-center justify-between border-b border-medium-750 pb-2">
            <button
              type="button"
              onClick={() =>
                setViewMonthDate(new Date(viewMonthDate.getFullYear(), viewMonthDate.getMonth() - 1, 1))
              }
              className="p-1 text-medium-400 hover:text-white rounded hover:bg-medium-800"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-bold text-white">
              {MONTHS_PT[viewMonthDate.getMonth()]} / {String(viewMonthDate.getFullYear()).slice(-2)}
            </span>
            <button
              type="button"
              onClick={() =>
                setViewMonthDate(new Date(viewMonthDate.getFullYear(), viewMonthDate.getMonth() + 1, 1))
              }
              className="p-1 text-medium-400 hover:text-white rounded hover:bg-medium-800"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dias da Semana */}
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAYS_PT.map((w) => (
              <span key={w} className="text-[9px] font-mono text-medium-400 font-semibold">
                {w}
              </span>
            ))}
          </div>

          {/* Dias do Mês */}
          <div className="grid grid-cols-7 gap-0.5">{renderCalendarDays()}</div>

          {/* Seletor Rápido 24h no Rodapé */}
          <div className="pt-2 border-t border-medium-750 flex items-center justify-between gap-2 text-[11px] font-mono">
            <span className="text-medium-400">Hora (24h):</span>
            <div className="flex items-center gap-1">
              <select
                value={parsed.getHours()}
                onChange={(e) => {
                  const hh = parseInt(e.target.value, 10);
                  commitDateAndTime(
                    { y: parsed.getFullYear(), m: parsed.getMonth() + 1, d: parsed.getDate() },
                    { hh, mm: parsed.getMinutes() }
                  );
                }}
                className="bg-medium-800 border border-medium-700 rounded px-1.5 py-0.5 text-white text-xs focus:outline-none"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, "0")}h
                  </option>
                ))}
              </select>
              <span className="text-medium-400">:</span>
              <select
                value={parsed.getMinutes()}
                onChange={(e) => {
                  const mm = parseInt(e.target.value, 10);
                  commitDateAndTime(
                    { y: parsed.getFullYear(), m: parsed.getMonth() + 1, d: parsed.getDate() },
                    { hh: parsed.getHours(), mm }
                  );
                }}
                className="bg-medium-800 border border-medium-700 rounded px-1.5 py-0.5 text-white text-xs focus:outline-none"
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, "0")}m
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Input de Data Simples no Padrão Brasileiro (DD/MM/AAAA) — Ideal para Data de Nascimento
 */
export function BrazilianDateInput({
  value,
  onChange,
  placeholder = "DD/MM/AAAA",
  className = "",
}: {
  value: string; // YYYY-MM-DD
  onChange: (ymd: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const ymdToBr = (ymd: string) => {
    if (!ymd) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
      const [y, m, d] = ymd.split("-");
      return `${d}/${m}/${y}`;
    }
    return ymd;
  };

  const [text, setText] = useState(() => ymdToBr(value));

  useEffect(() => {
    setText(ymdToBr(value));
  }, [value]);

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    let masked = digits;
    if (digits.length > 4) {
      masked = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      masked = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    setText(masked);

    if (digits.length === 0) {
      onChange("");
      return;
    }

    if (digits.length === 8 || digits.length === 6) {
      const d = digits.slice(0, 2);
      const m = digits.slice(2, 4);
      let y = digits.slice(4);
      if (y.length === 2) {
        const yNum = parseInt(y, 10);
        y = String(yNum < 35 ? 2000 + yNum : 1900 + yNum);
      }
      const dayNum = parseInt(d, 10);
      const monthNum = parseInt(m, 10);
      if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
        onChange(`${y}-${m}-${d}`);
      }
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={text}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      title="Data no padrão brasileiro (DD/MM/AAAA)"
      className={
        className ||
        "flex-1 bg-medium-800 border border-medium-700 rounded-md px-3 py-2 text-xs text-white placeholder-medium-500 focus:outline-none focus:border-amber-400 font-mono"
      }
    />
  );
}
