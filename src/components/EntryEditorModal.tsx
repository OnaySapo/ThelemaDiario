"use client";

import React, { useState, useEffect } from "react";
import { MagickEntry } from "@/lib/types";
import { AstrologicalCoordinates } from "@/lib/astronomy";
import { THOTH_TAROT_DECK, TAROT_SPREADS, ThothCard } from "@/lib/thothTarot";
import {
  X,
  Sparkles,
  Sword,
  Moon,
  Eye,
  BookOpen,
  Calendar,
  Compass,
  Star,
  Plus,
  Trash2,
  Link as LinkIcon,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { ThelemicDateDisplay, ZodiacIcon } from "@/components/ThelemicIcons";

interface EntryEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Partial<MagickEntry>) => Promise<void>;
  initialEntry?: MagickEntry | null;
  allEntries: MagickEntry[];
}

export function EntryEditorModal({
  isOpen,
  onClose,
  onSave,
  initialEntry,
  allEntries,
}: EntryEditorModalProps) {
  const [type, setType] = useState<string>("Prática");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [hasRating, setHasRating] = useState<boolean>(true);
  const [successRating, setSuccessRating] = useState<number>(8);
  const [mentalBefore, setMentalBefore] = useState("");
  const [mentalAfter, setMentalAfter] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  // Astrological Data
  const [astroData, setAstroData] = useState<Partial<AstrologicalCoordinates>>({});
  const [isCalculatingAstro, setIsCalculatingAstro] = useState(false);

  // Influences
  const [influences, setInfluences] = useState<{ category: string; name: string }[]>([]);
  const [newInfCategory, setNewInfCategory] = useState("entity");
  const [newInfName, setNewInfName] = useState("");

  // Connections
  const [connections, setConnections] = useState<{ target_id: string; relationship_type: string; notes?: string }[]>([]);
  const [newConnTarget, setNewConnTarget] = useState("");
  const [newConnType, setNewConnType] = useState("result_of");
  const [newConnNotes, setNewConnNotes] = useState("");

  // Oracle Specific
  const [oracleSystem, setOracleSystem] = useState("thoth_tarot");
  const [spreadId, setSpreadId] = useState("three_time");
  const [oracleQuery, setOracleQuery] = useState("");
  const [oracleQuerentName, setOracleQuerentName] = useState("");
  const [oracleQuerentBirthdate, setOracleQuerentBirthdate] = useState("");
  const [oracleCards, setOracleCards] = useState<
    Array<{ position: string; cardId: string; cardName: string; notes?: string }>
  >([]);
  const [confirmationNotes, setConfirmationNotes] = useState("");

  // Load initial data
  useEffect(() => {
    if (initialEntry) {
      setType(initialEntry.type);
      setTitle(initialEntry.title);
      setContent(initialEntry.content);
      setDate(new Date(initialEntry.date).toISOString().slice(0, 16));
      const entryHasRating = initialEntry.success_rating !== undefined && initialEntry.success_rating !== null;
      setHasRating(entryHasRating);
      setSuccessRating(entryHasRating ? initialEntry.success_rating! : 7);
      setMentalBefore(initialEntry.mental_state_before || "");
      setMentalAfter(initialEntry.mental_state_after || "");
      setTagsInput(initialEntry.tags?.join(", ") || "");
      setInfluences(initialEntry.influences || []);
      setConnections(initialEntry.connections || []);
      setAstroData({
        thelemicDate: initialEntry.thelemic_date,
        sunSign: initialEntry.sun_sign,
        sunDegree: initialEntry.sun_degree,
        moonSign: initialEntry.moon_sign,
        moonDegree: initialEntry.moon_degree,
        moonPhaseName: initialEntry.moon_phase,
        moonIllumination: initialEntry.moon_illumination,
        planetaryDay: initialEntry.planetary_day,
        planetaryHour: initialEntry.planetary_hour,
      });

      if (initialEntry.oracle_data) {
        setOracleSystem(initialEntry.oracle_data.system || "thoth_tarot");
        setOracleQuery(initialEntry.oracle_data.query || "");
        setOracleQuerentName(initialEntry.oracle_data.querent_name || "");
        setOracleQuerentBirthdate(initialEntry.oracle_data.querent_birthdate || "");
        setOracleCards(initialEntry.oracle_data.cards || []);
        setConfirmationNotes(initialEntry.oracle_data.confirmation_notes || "");
      }
    } else {
      // New Entry Defaults
      setType("ritual");
      setTitle("");
      setContent("");
      setOracleQuerentName("");
      setOracleQuerentBirthdate("");
      const now = new Date();
      setDate(now.toISOString().slice(0, 16));
      setSuccessRating(8);
      setMentalBefore("");
      setMentalAfter("");
      setTagsInput("");
      setInfluences([
        { category: "incense", name: "Olíbano" },
        { category: "tool", name: "Espada Mágica" },
      ]);
      setConnections([]);
      fetchAstroForDate(now);
      setupSpreadCards("three_time");
    }
  }, [initialEntry, isOpen]);

  const fetchAstroForDate = async (targetDate: Date) => {
    setIsCalculatingAstro(true);
    try {
      const res = await fetch(`/api/astronomy?date=${targetDate.toISOString()}`);
      const data = await res.json();
      if (data.success) {
        setAstroData(data);
      }
    } catch (err) {
      console.error("Erro ao buscar coordenadas:", err);
    } finally {
      setIsCalculatingAstro(false);
    }
  };

  const handleDateChange = (val: string) => {
    setDate(val);
    if (val) {
      fetchAstroForDate(new Date(val));
    }
  };

  const setupSpreadCards = (sId: string) => {
    const spread = TAROT_SPREADS.find((s) => s.id === sId) || TAROT_SPREADS[1];
    setSpreadId(spread.id);
    setOracleCards(
      spread.positions.map((pos, idx) => ({
        position: pos,
        cardId: THOTH_TAROT_DECK[idx % THOTH_TAROT_DECK.length].id,
        cardName: THOTH_TAROT_DECK[idx % THOTH_TAROT_DECK.length].name,
        notes: "",
      }))
    );
  };

  const handleAddInfluence = () => {
    if (!newInfName.trim()) return;
    setInfluences([...influences, { category: newInfCategory, name: newInfName.trim() }]);
    setNewInfName("");
  };

  const handleRemoveInfluence = (idx: number) => {
    setInfluences(influences.filter((_, i) => i !== idx));
  };

  const handleAddConnection = () => {
    if (!newConnTarget) return;
    setConnections([
      ...connections,
      {
        target_id: newConnTarget,
        relationship_type: newConnType,
        notes: newConnNotes.trim(),
      },
    ]);
    setNewConnTarget("");
    setNewConnNotes("");
  };

  const handleRemoveConnection = (idx: number) => {
    setConnections(connections.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Por favor, insira o título do registro.");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith("#") ? t : `#${t}`));

    const payload: Partial<MagickEntry> = {
      id: initialEntry ? initialEntry.id : undefined,
      type,
      title: title.trim(),
      content: content.trim(),
      date: new Date(date).toISOString(),
      success_rating: hasRating ? successRating : null,
      thelemic_date: astroData.thelemicDate,
      sun_sign: astroData.sunSign,
      sun_degree: astroData.sunDegree,
      moon_sign: astroData.moonSign,
      moon_degree: astroData.moonDegree,
      moon_phase: astroData.moonPhaseName,
      moon_illumination: astroData.moonIllumination,
      planetary_day: astroData.planetaryDay,
      planetary_hour: astroData.planetaryHour,
      mental_state_before: mentalBefore.trim(),
      mental_state_after: mentalAfter.trim(),
      tags,
      influences,
      connections,
      oracle_data:
        type === "oracle"
          ? {
              system: oracleSystem,
              spread_name: TAROT_SPREADS.find((s) => s.id === spreadId)?.name || "Tiragem",
              query: oracleQuery.trim(),
              querent_name: oracleQuerentName.trim(),
              querent_birthdate: oracleQuerentBirthdate,
              cards: oracleCards,
              confirmation_notes: confirmationNotes.trim(),
            }
          : undefined,
    };

    await onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-forest-900 border border-forest-700 w-full max-w-4xl rounded-2xl shadow-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-forest-700 bg-forest-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl text-gold-400">📜</span>
            <div>
              <h2 className="text-base font-serif font-bold text-parchment-100">
                {initialEntry ? "Editar Registro Mágicko" : "Novo Registro Mágicko"}
              </h2>
              <div className="text-xs text-parchment-400 font-mono mt-0.5">
                <ThelemicDateDisplay thelemicDate={astroData.thelemicDate} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-parchment-400 hover:text-parchment-100 hover:bg-forest-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-parchment-300 uppercase tracking-wider mb-2 font-mono">
              Tipo de Operação
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: "ritual", label: "Ritual / Prática", icon: <Sword className="w-4 h-4 text-gold-400" /> },
                { id: "oracle", label: "Oráculo (Thoth)", icon: <Sparkles className="w-4 h-4 text-moss-400" /> },
                { id: "dream", label: "Sonho Lúcido", icon: <Moon className="w-4 h-4 text-twilight-400" /> },
                { id: "vision", label: "Visão Astral", icon: <Eye className="w-4 h-4 text-lunar-400" /> },
                { id: "study", label: "Estudo / Tese", icon: <BookOpen className="w-4 h-4 text-amber-500" /> },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setType(item.id as any)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                    type === item.id
                      ? "bg-forest-750 border-moss-500 text-parchment-100 shadow-arcane"
                      : "bg-forest-850/60 border-forest-700 text-parchment-300 hover:bg-forest-800"
                  }`}
                >
                  {item.icon}
                  <span className="mt-1.5">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-parchment-300 uppercase tracking-wider mb-1 font-mono">
                Título do Registro *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Operação de Consagração do Pentáculo em Yesod..."
                className="w-full bg-forest-850 border border-forest-700 rounded-lg px-3.5 py-2 text-sm text-parchment-100 placeholder-parchment-500 focus:outline-none focus:border-moss-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-parchment-300 uppercase tracking-wider mb-1 font-mono flex items-center justify-between">
                <span>Data & Hora</span>
                <button
                  type="button"
                  onClick={() => fetchAstroForDate(new Date(date))}
                  className="text-moss-400 hover:text-moss-300 text-[11px] flex items-center gap-1"
                  title="Recalcular efemérides"
                >
                  <RefreshCw className={`w-3 h-3 ${isCalculatingAstro ? "animate-spin" : ""}`} />
                  Recalcular
                </button>
              </label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full bg-forest-850 border border-forest-700 rounded-lg px-3 py-2 text-xs text-parchment-100 font-mono focus:outline-none focus:border-moss-500"
              />
            </div>
          </div>

          {/* Astrological Coords Display / Override */}
          <div className="bg-forest-850/70 p-3.5 rounded-xl border border-forest-750 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-parchment-300">
              <span className="text-gold-400 font-semibold flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-gold-400" />
                Coordenadas Astrológicas & Thelêmicas (Cálculo Automático):
              </span>
              <ThelemicDateDisplay thelemicDate={astroData.thelemicDate} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-parchment-200">
              <div className="bg-forest-900/60 p-2 rounded border border-forest-700">
                <span className="text-parchment-400 block text-[10px]">SOL</span>
                <strong className="flex items-center gap-1.5">
                  <ZodiacIcon sign={astroData.sunSign} className="w-3.5 h-3.5 text-gold-400 shrink-0" size={14} />
                  <span>{astroData.sunSign || "—"} ({astroData.sunDegreeFormatted || `${astroData.sunDegree}°`})</span>
                </strong>
              </div>
              <div className="bg-forest-900/60 p-2 rounded border border-forest-700">
                <span className="text-parchment-400 block text-[10px]">LUA</span>
                <strong className="flex items-center gap-1.5">
                  <ZodiacIcon sign={astroData.moonSign} className="w-3.5 h-3.5 text-gold-400 shrink-0" size={14} />
                  <span>{astroData.moonSign || "—"} ({astroData.moonDegreeFormatted || `${astroData.moonDegree}°`})</span>
                </strong>
              </div>
              <div className="bg-forest-900/60 p-2 rounded border border-forest-700">
                <span className="text-parchment-400 block text-[10px]">FASE LUNAR</span>
                <strong>{astroData.moonPhaseName || "—"} ({astroData.moonIllumination}%)</strong>
              </div>
              <div className="bg-forest-900/60 p-2 rounded border border-forest-700">
                <span className="text-parchment-400 block text-[10px]">REGÊNCIA</span>
                <strong>{astroData.planetaryDay} ({astroData.planetaryHour})</strong>
              </div>
            </div>
          </div>

          {/* If Oracle: Dedicated Section */}
          {type === "oracle" && (
            <div className="p-4 rounded-xl bg-forest-850/90 border border-moss-600/40 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-moss-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Consulta ao Livro de Thoth
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-parchment-400 mb-1">
                    Método de Tiragem
                  </label>
                  <select
                    value={spreadId}
                    onChange={(e) => setupSpreadCards(e.target.value)}
                    className="w-full bg-forest-800 border border-forest-700 rounded-lg px-3 py-2 text-xs text-parchment-100 focus:outline-none focus:border-moss-500"
                  >
                    {TAROT_SPREADS.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.name} ({sp.positions.length} cartas)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-parchment-400 mb-1">
                    Pergunta / Propósito da Consulta
                  </label>
                  <input
                    type="text"
                    value={oracleQuery}
                    onChange={(e) => setOracleQuery(e.target.value)}
                    placeholder="Ex: Qual a melhor conduta para a operação mágica em curso?"
                    className="w-full bg-forest-800 border border-forest-700 rounded-lg px-3 py-2 text-xs text-parchment-100 placeholder-parchment-500 focus:outline-none focus:border-moss-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-parchment-400 mb-1">
                    Nome da Pessoa Foco da Tiragem
                  </label>
                  <input
                    type="text"
                    value={oracleQuerentName}
                    onChange={(e) => setOracleQuerentName(e.target.value)}
                    placeholder="Ex: Frater Perdurabo, Maria Silva..."
                    className="w-full bg-forest-800 border border-forest-700 rounded-lg px-3 py-2 text-xs text-parchment-100 placeholder-parchment-500 focus:outline-none focus:border-moss-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-parchment-400 mb-1">
                    Data de Nascimento <span className="text-parchment-500">(opcional · Arcanos Pessoais)</span>
                  </label>
                  <input
                    type="date"
                    value={oracleQuerentBirthdate}
                    onChange={(e) => setOracleQuerentBirthdate(e.target.value)}
                    className="w-full bg-forest-800 border border-forest-700 rounded-lg px-3 py-2 text-xs text-parchment-100 focus:outline-none focus:border-moss-500 font-mono"
                  />
                </div>
              </div>

              {/* Spread Cards Pickers */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-mono text-parchment-400 block">Lâminas da Tiragem:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {oracleCards.map((c, idx) => (
                    <div key={idx} className="bg-forest-900/80 p-2.5 rounded-lg border border-forest-700">
                      <div className="flex items-center justify-between text-xs text-gold-400 font-semibold mb-1">
                        <span>{c.position}</span>
                      </div>
                      <select
                        value={c.cardId}
                        onChange={(e) => {
                          const selectedCard = THOTH_TAROT_DECK.find((tc) => tc.id === e.target.value);
                          const updated = [...oracleCards];
                          updated[idx] = {
                            ...updated[idx],
                            cardId: e.target.value,
                            cardName: selectedCard ? selectedCard.name : e.target.value,
                          };
                          setOracleCards(updated);
                        }}
                        className="w-full bg-forest-800 border border-forest-750 rounded p-1.5 text-xs text-parchment-100 mb-1.5 focus:outline-none focus:border-moss-500"
                      >
                        {THOTH_TAROT_DECK.map((tc) => (
                          <option key={tc.id} value={tc.id}>
                            {tc.name} ({tc.astrologicalSign || tc.element || ""})
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={c.notes || ""}
                        onChange={(e) => {
                          const updated = [...oracleCards];
                          updated[idx] = { ...updated[idx], notes: e.target.value };
                          setOracleCards(updated);
                        }}
                        placeholder="Comentário sobre esta lâmina..."
                        className="w-full bg-forest-800/60 border border-forest-750 rounded px-2 py-1 text-[11px] text-parchment-200 placeholder-parchment-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-parchment-400 mb-1">
                  Confirmação Fenomênica Posterior
                </label>
                <input
                  type="text"
                  value={confirmationNotes}
                  onChange={(e) => setConfirmationNotes(e.target.value)}
                  placeholder="Ex: No dia seguinte, recebi o sinal prometido..."
                  className="w-full bg-forest-800 border border-forest-700 rounded-lg px-3 py-1.5 text-xs text-parchment-100 placeholder-parchment-500"
                />
              </div>
            </div>
          )}

          {/* Content / Journal Body */}
          <div>
            <label className="block text-xs font-semibold text-parchment-300 uppercase tracking-wider mb-1 font-mono">
              Relato da Prática / Visão / Estudo *
            </label>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Descreva minuciosamente o procedimento, palavras de poder entoadas, sensações astrais, entidades avistadas, resultados físicos e reflexões..."
              className="w-full bg-forest-850 border border-forest-700 rounded-lg p-3 text-sm text-parchment-100 placeholder-parchment-500 focus:outline-none focus:border-moss-500 font-sans leading-relaxed"
            />
          </div>

          {/* Success Rating & Mental States */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-forest-850/40 p-4 rounded-xl border border-forest-750">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-parchment-300 uppercase tracking-wider font-mono">
                  Grau de Sucesso {hasRating ? `(${successRating}/10)` : "(Opcional)"}
                </label>
                <button
                  type="button"
                  onClick={() => setHasRating(!hasRating)}
                  className="text-[10px] font-mono text-moss-400 hover:text-moss-300 underline transition-colors"
                >
                  {hasRating ? "Desativar" : "+ Ativar"}
                </button>
              </div>
              {hasRating ? (
                <>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={successRating}
                    onChange={(e) => setSuccessRating(Number(e.target.value))}
                    className="w-full accent-moss-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-parchment-400 font-mono mt-1">
                    <span>0 (Dispersão)</span>
                    <span>5 (Neutro)</span>
                    <span>10 (Êxtase/Vitória)</span>
                  </div>
                </>
              ) : (
                <div className="text-[11px] font-mono text-parchment-400 italic bg-forest-900/60 p-2 rounded border border-forest-750">
                  Sem avaliação atribuída (ideal para diários comuns, sonhos ou estudos).
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-parchment-300 uppercase tracking-wider mb-1 font-mono">
                Estado Mental Anterior
              </label>
              <input
                type="text"
                value={mentalBefore}
                onChange={(e) => setMentalBefore(e.target.value)}
                placeholder="Ex: Inquietude, dispersão..."
                className="w-full bg-forest-800 border border-forest-700 rounded-lg px-3 py-1.5 text-xs text-parchment-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-parchment-300 uppercase tracking-wider mb-1 font-mono">
                Estado Mental Posterior
              </label>
              <input
                type="text"
                value={mentalAfter}
                onChange={(e) => setMentalAfter(e.target.value)}
                placeholder="Ex: Paz absoluta, sensação de poder..."
                className="w-full bg-forest-800 border border-forest-700 rounded-lg px-3 py-1.5 text-xs text-parchment-100"
              />
            </div>
          </div>

          {/* Influences & Elements */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-parchment-300 uppercase tracking-wider font-mono">
              Influências & Correspondências (Liber 777)
            </label>

            <div className="flex flex-wrap gap-2 mb-2">
              {influences.map((inf, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-forest-750 border border-forest-700 text-xs text-parchment-200"
                >
                  <strong className="text-gold-400 capitalize">{inf.category}:</strong>
                  <span>{inf.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInfluence(idx)}
                    className="text-parchment-400 hover:text-scarlet-400 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <select
                value={newInfCategory}
                onChange={(e) => setNewInfCategory(e.target.value)}
                className="bg-forest-850 border border-forest-700 rounded-lg px-3 py-1.5 text-xs text-parchment-200"
              >
                <option value="entity">Entidade / Divindade</option>
                <option value="candle">Vela / Cor</option>
                <option value="incense">Incenso / Perfume</option>
                <option value="tool">Arma / Instrumento Mágico</option>
                <option value="feeling">Sentimento / Êxtase</option>
                <option value="person">Pessoa Presente</option>
                <option value="element">Elemento / Tattwa</option>
              </select>

              <input
                type="text"
                value={newInfName}
                onChange={(e) => setNewInfName(e.target.value)}
                placeholder="Nome da influência (ex: Babalon, Mirra, Espada, Vermelho)..."
                className="flex-1 bg-forest-850 border border-forest-700 rounded-lg px-3 py-1.5 text-xs text-parchment-100 placeholder-parchment-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddInfluence();
                  }
                }}
              />

              <button
                type="button"
                onClick={handleAddInfluence}
                className="px-3 py-1.5 bg-forest-750 hover:bg-forest-700 border border-forest-600 text-parchment-100 rounded-lg text-xs font-semibold"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Connections to other notes */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-parchment-300 uppercase tracking-wider font-mono">
              Conectar a Outras Notas do Diário (Rede de Insights)
            </label>

            {connections.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {connections.map((c, idx) => {
                  const targetEntry = allEntries.find((e) => e.id === c.target_id);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-forest-850 border border-forest-700 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-3.5 h-3.5 text-lunar-400" />
                        <span className="text-parchment-300">
                          {c.relationship_type === "result_of"
                            ? "Resultado de"
                            : c.relationship_type === "predicted_by"
                            ? "Profetizado por"
                            : c.relationship_type === "synchronic_with"
                            ? "Sincrônico com"
                            : "Referência de"}
                          :
                        </span>
                        <strong className="text-parchment-100">
                          {targetEntry ? targetEntry.title : c.target_id}
                        </strong>
                        {c.notes && <span className="text-parchment-400 italic">({c.notes})</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveConnection(idx)}
                        className="text-parchment-400 hover:text-scarlet-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={newConnTarget}
                onChange={(e) => setNewConnTarget(e.target.value)}
                className="bg-forest-850 border border-forest-700 rounded-lg px-3 py-1.5 text-xs text-parchment-200"
              >
                <option value="">Selecione uma nota para ligar...</option>
                {allEntries
                  .filter((e) => !initialEntry || e.id !== initialEntry.id)
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      [{e.type.toUpperCase()}] {e.title}
                    </option>
                  ))}
              </select>

              <select
                value={newConnType}
                onChange={(e) => setNewConnType(e.target.value)}
                className="bg-forest-850 border border-forest-700 rounded-lg px-3 py-1.5 text-xs text-parchment-200"
              >
                <option value="result_of">Resultado Fenomênico de</option>
                <option value="predicted_by">Profetizado / Anunciado por</option>
                <option value="synchronic_with">Sincrônico com</option>
                <option value="references">Referência de Estudo</option>
              </select>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newConnNotes}
                  onChange={(e) => setNewConnNotes(e.target.value)}
                  placeholder="Nota da conexão..."
                  className="flex-1 bg-forest-850 border border-forest-700 rounded-lg px-2.5 py-1.5 text-xs text-parchment-100 placeholder-parchment-500"
                />
                <button
                  type="button"
                  onClick={handleAddConnection}
                  className="px-3 py-1.5 bg-forest-750 hover:bg-forest-700 border border-forest-600 text-parchment-100 rounded-lg text-xs font-semibold"
                >
                  Vincular
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-parchment-300 uppercase tracking-wider mb-1 font-mono">
              Palavras-chave / Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Ex: #banimento, #therion, #babalon, #ouro, #sol"
              className="w-full bg-forest-850 border border-forest-700 rounded-lg px-3.5 py-2 text-xs text-parchment-100 placeholder-parchment-500"
            />
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-forest-750">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-parchment-300 hover:text-parchment-100 hover:bg-forest-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg text-xs font-semibold bg-moss-600 hover:bg-moss-500 text-forest-950 transition-all shadow-arcane hover:shadow-glow flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{initialEntry ? "Atualizar Registro" : "Consagrar Registro"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
