"use client";

import React, { useState, useRef } from "react";
import { THOTH_TAROT_DECK, ThothCard } from "@/lib/thothTarot";
import {
  Sparkles,
  RotateCw,
  Plus,
  Trash2,
  Image as ImageIcon,
  Move,
  Upload,
  Link as LinkIcon,
  X,
  Compass,
  Check,
  Eye,
} from "lucide-react";

export interface CardOnTable {
  position: string;
  cardId: string;
  cardName: string;
  imageUrl?: string;
  x?: number; // porcentagem 5% a 90%
  y?: number; // porcentagem 5% a 85%
  rotation?: number; // 0, 90, 180, 270 graus
  notes?: string;
}

interface OracleTableProps {
  cards: CardOnTable[];
  onChange?: (cards: CardOnTable[]) => void;
  isEditable?: boolean;
}

export function OracleTable({ cards, onChange, isEditable = false }: OracleTableProps) {
  const tableRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeCardIdx, setActiveCardIdx] = useState<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageUploadIdx, setImageUploadIdx] = useState<number | null>(null);
  const [selectedThothToAdd, setSelectedThothToAdd] = useState("");

  // Adicionar Carta do Baralho de Thoth
  const handleAddThothCard = (cardId: string) => {
    if (!onChange) return;
    const thoth = THOTH_TAROT_DECK.find((c) => c.id === cardId);
    if (!thoth) return;

    const count = cards.length;
    const newCard: CardOnTable = {
      position: `Posição ${count + 1}`,
      cardId: thoth.id,
      cardName: thoth.name,
      x: 30 + (count % 4) * 15,
      y: 30 + Math.floor(count / 4) * 20,
      rotation: 0,
      notes: thoth.keywords.join(", "),
    };
    const updated = [...cards, newCard];
    onChange(updated);
    setActiveCardIdx(updated.length - 1);
    setSelectedThothToAdd("");
  };

  // Adicionar Carta Personalizada (Qualquer Oráculo)
  const handleAddCustomCard = () => {
    if (!onChange) return;
    const count = cards.length;
    const newCard: CardOnTable = {
      position: `Lâmina ${count + 1}`,
      cardId: `custom-${Date.now()}`,
      cardName: `Nova Lâmina / Oráculo`,
      x: 35 + (count % 3) * 15,
      y: 35 + Math.floor(count / 3) * 20,
      rotation: 0,
      notes: "",
    };
    const updated = [...cards, newCard];
    onChange(updated);
    setActiveCardIdx(updated.length - 1);
  };

  // Girar carta em 90 graus
  const handleRotateCard = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!onChange) return;
    const updated = [...cards];
    const currentRot = updated[idx].rotation || 0;
    updated[idx] = {
      ...updated[idx],
      rotation: (currentRot + 90) % 360,
    };
    onChange(updated);
  };

  // Alterar URL da imagem diretamente
  const handlePromptImageUrl = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!onChange) return;
    const current = cards[idx].imageUrl || "";
    const url = prompt("Insira a URL direta da imagem da carta:", current);
    if (url !== null) {
      const updated = [...cards];
      updated[idx] = { ...updated[idx], imageUrl: url.trim() || undefined };
      onChange(updated);
    }
  };

  // Disparar upload de imagem local
  const triggerLocalImageUpload = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setImageUploadIdx(idx);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Processar arquivo de imagem local e converter para DataURL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || imageUploadIdx === null || !onChange) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      if (dataUrl) {
        const updated = [...cards];
        updated[imageUploadIdx] = { ...updated[imageUploadIdx], imageUrl: dataUrl };
        onChange(updated);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Remover Imagem da Carta
  const handleRemoveImage = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!onChange) return;
    const updated = [...cards];
    updated[idx] = { ...updated[idx], imageUrl: undefined };
    onChange(updated);
  };

  // Remover carta
  const handleRemoveCard = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!onChange) return;
    const updated = cards.filter((_, i) => i !== idx);
    onChange(updated);
    if (activeCardIdx === idx) {
      setActiveCardIdx(null);
    } else if (activeCardIdx !== null && activeCardIdx > idx) {
      setActiveCardIdx(activeCardIdx - 1);
    }
  };

  // Iniciar Drag no Altar
  const handleMouseDown = (idx: number, e: React.MouseEvent) => {
    setActiveCardIdx(idx);
    if (!isEditable || !tableRef.current) return;

    const rect = tableRef.current.getBoundingClientRect();
    const cardEl = e.currentTarget as HTMLElement;
    const cardRect = cardEl.getBoundingClientRect();

    setDragOffset({
      x: e.clientX - cardRect.left,
      y: e.clientY - cardRect.top,
    });
    setDraggingIdx(idx);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingIdx === null || !tableRef.current || !onChange) return;
    const rect = tableRef.current.getBoundingClientRect();

    const mouseX = e.clientX - rect.left - dragOffset.x;
    const mouseY = e.clientY - rect.top - dragOffset.y;

    // Converter para porcentagem com limites seguros dentro da mesa
    const pctX = Math.min(Math.max((mouseX / rect.width) * 100, 2), 85);
    const pctY = Math.min(Math.max((mouseY / rect.height) * 100, 2), 75);

    const updated = [...cards];
    updated[draggingIdx] = {
      ...updated[draggingIdx],
      x: Math.round(pctX),
      y: Math.round(pctY),
    };
    onChange(updated);
  };

  const handleMouseUp = () => {
    setDraggingIdx(null);
  };

  // Presets de Geometria Sagrada na Mesa
  const applyPresetLayout = (layout: "line" | "cross" | "hexagram" | "celtic") => {
    if (!onChange || cards.length === 0) return;
    const updated = [...cards];

    if (layout === "line") {
      const step = 80 / (updated.length + 1);
      updated.forEach((c, i) => {
        c.x = Math.round(10 + (i + 1) * step);
        c.y = 35;
        c.rotation = 0;
      });
    } else if (layout === "cross") {
      const positions = [
        { x: 44, y: 10 }, // Topo
        { x: 22, y: 35 }, // Esquerda
        { x: 66, y: 35 }, // Direita
        { x: 44, y: 60 }, // Base
      ];
      updated.forEach((c, i) => {
        if (positions[i]) {
          c.x = positions[i].x;
          c.y = positions[i].y;
          c.rotation = 0;
        }
      });
    } else if (layout === "hexagram") {
      const positions = [
        { x: 44, y: 35, rot: 0 },  // Centro (Sol / Tiphareth)
        { x: 44, y: 8,  rot: 0 },  // Saturno (Topo)
        { x: 70, y: 20, rot: 0 },  // Júpiter (Alto Direita)
        { x: 70, y: 55, rot: 0 },  // Vênus (Baixo Direita)
        { x: 44, y: 68, rot: 0 },  // Lua (Base)
        { x: 18, y: 55, rot: 0 },  // Mercúrio (Baixo Esquerda)
        { x: 18, y: 20, rot: 0 },  // Marte (Alto Esquerda)
      ];
      updated.forEach((c, i) => {
        if (positions[i]) {
          c.x = positions[i].x;
          c.y = positions[i].y;
          c.rotation = positions[i].rot;
        }
      });
    } else if (layout === "celtic") {
      const positions = [
        { x: 28, y: 35, rot: 0 },   // 1. Centro
        { x: 28, y: 35, rot: 90 },  // 2. Cruzada
        { x: 28, y: 65, rot: 0 },   // 3. Base / Inconsciente
        { x: 10, y: 35, rot: 0 },   // 4. Passado
        { x: 28, y: 8,  rot: 0 },   // 5. Coroa / Meta
        { x: 46, y: 35, rot: 0 },   // 6. Futuro Imediato
        { x: 72, y: 68, rot: 0 },   // 7. O Próprio
        { x: 72, y: 48, rot: 0 },   // 8. Ambiente / Outros
        { x: 72, y: 28, rot: 0 },   // 9. Esperanças / Temores
        { x: 72, y: 8,  rot: 0 },   // 10. Desfecho Final
      ];
      updated.forEach((c, i) => {
        if (positions[i]) {
          c.x = positions[i].x;
          c.y = positions[i].y;
          c.rotation = positions[i].rot;
        }
      });
    }

    onChange(updated);
  };

  // Card Ativo Selecionado
  const activeCard = activeCardIdx !== null ? cards[activeCardIdx] : null;

  return (
    <div className="space-y-3 select-none">
      {/* Hidden File Input for local image uploading */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Barra de Ferramentas da Mesa (Modo Edição) */}
      {isEditable && (
        <div className="p-3 bg-medium-850 rounded-lg border border-medium-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Seletor Thoth & Adição */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedThothToAdd}
              onChange={(e) => {
                const val = e.target.value;
                if (val) handleAddThothCard(val);
              }}
              className="bg-medium-800 border border-medium-700 rounded px-2.5 py-1.5 text-xs text-white max-w-[200px]"
            >
              <option value="">+ Lâmina de Thoth...</option>
              <optgroup label="Arcanos Maiores">
                {THOTH_TAROT_DECK.filter((c) => c.suit === "major").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.number ? `${c.number}. ` : ""}{c.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Bastões (Fogo)">
                {THOTH_TAROT_DECK.filter((c) => c.suit === "wands").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Copas (Água)">
                {THOTH_TAROT_DECK.filter((c) => c.suit === "cups").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Espadas (Ar)">
                {THOTH_TAROT_DECK.filter((c) => c.suit === "swords").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Discos (Terra)">
                {THOTH_TAROT_DECK.filter((c) => c.suit === "disks").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            </select>

            <button
              type="button"
              onClick={handleAddCustomCard}
              className="flex items-center gap-1 px-3 py-1.5 bg-medium-800 hover:bg-medium-750 text-white rounded text-xs border border-medium-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Carta Personalizada</span>
            </button>
          </div>

          {/* Presets de Alinhamento */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-medium-400 font-semibold uppercase">
              Alinhamento:
            </span>
            <button
              type="button"
              onClick={() => applyPresetLayout("line")}
              className="px-2 py-1 bg-medium-800 hover:bg-medium-750 text-white rounded text-[11px] font-mono border border-medium-700"
              title="Alinhar em Linha"
            >
              Linha
            </button>
            <button
              type="button"
              onClick={() => applyPresetLayout("cross")}
              className="px-2 py-1 bg-medium-800 hover:bg-medium-750 text-white rounded text-[11px] font-mono border border-medium-700"
              title="Dispor em Cruz (4 Cartas)"
            >
              Cruz
            </button>
            <button
              type="button"
              onClick={() => applyPresetLayout("hexagram")}
              className="px-2 py-1 bg-medium-800 hover:bg-medium-750 text-white rounded text-[11px] font-mono border border-medium-700"
              title="Hexagrama Thelêmico (7 Cartas)"
            >
              Hexagrama
            </button>
            <button
              type="button"
              onClick={() => applyPresetLayout("celtic")}
              className="px-2 py-1 bg-medium-800 hover:bg-medium-750 text-white rounded text-[11px] font-mono border border-medium-700"
              title="Cruz Céltica (10 Cartas)"
            >
              Cruz Céltica
            </button>
          </div>
        </div>
      )}

      {/* O Pano de Mesa do Altar (Canvas Interativo) */}
      <div
        ref={tableRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-full h-[450px] bg-[#121212] rounded-xl border-2 border-medium-700 overflow-hidden shadow-2xl"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 0%, transparent 70%),
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 35px 35px, 35px 35px",
        }}
      >
        {/* Marca d'água da Geometria do Altar Thelêmico */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-80 h-80 rounded-full border border-dashed border-white flex items-center justify-center">
            <div className="w-56 h-56 rounded-full border border-white flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Estado Vazio */}
        {cards.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-medium-400 font-mono text-xs">
            <Sparkles className="w-8 h-8 text-medium-500 mb-2" />
            <span>Nenhuma lâmina sobre a mesa oracular.</span>
            {isEditable && (
              <span className="text-[11px] text-medium-500 mt-1">
                Selecione uma lâmina no menu superior para dispor sobre o altar.
              </span>
            )}
          </div>
        )}

        {/* Renderização das Lâminas sobre a Mesa */}
        {cards.map((card, idx) => {
          const posX = card.x !== undefined ? card.x : 20 + (idx % 4) * 18;
          const posY = card.y !== undefined ? card.y : 20 + Math.floor(idx / 4) * 22;
          const rot = card.rotation || 0;
          const isDragging = draggingIdx === idx;
          const isSelected = activeCardIdx === idx;
          const thothInfo = THOTH_TAROT_DECK.find((tc) => tc.id === card.cardId);

          return (
            <div
              key={idx}
              onMouseDown={(e) => handleMouseDown(idx, e)}
              className={`absolute group select-none transition-shadow ${
                isEditable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
              } ${
                isDragging ? "z-50 scale-105 shadow-2xl" : isSelected ? "z-40 scale-102" : "z-20 hover:z-30 hover:scale-[1.03]"
              }`}
              style={{
                left: `${posX}%`,
                top: `${posY}%`,
                transform: `rotate(${rot}deg)`,
                transformOrigin: "center center",
              }}
            >
              {/* Carta Visual */}
              <div
                className={`w-28 sm:w-32 h-44 sm:h-48 rounded-lg overflow-hidden border-2 bg-medium-900 flex flex-col justify-between p-2 shadow-2xl transition-colors ${
                  isDragging || isSelected
                    ? "border-white ring-2 ring-white/30"
                    : "border-medium-600 hover:border-white"
                }`}
              >
                {/* Etiqueta da Posição */}
                <div className="bg-black/85 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono text-white text-center truncate font-semibold border border-medium-700">
                  {card.position}
                </div>

                {/* Centro da Carta: Imagem OU Arte Hermética */}
                <div className="flex-1 my-1.5 rounded overflow-hidden flex flex-col items-center justify-center relative bg-medium-950/70 border border-medium-800">
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt={card.cardName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-2">
                      {thothInfo?.hebrewLetter && (
                        <span className="text-2xl text-white font-serif block leading-none mb-1">
                          {thothInfo.hebrewLetter}
                        </span>
                      )}
                      <span className="text-[11px] font-sans font-bold text-white block line-clamp-2 leading-tight">
                        {card.cardName}
                      </span>
                      {thothInfo?.astrologicalSign && (
                        <span className="text-[9px] font-mono text-medium-400 block mt-1">
                          {thothInfo.astrologicalSign}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Rodapé da Carta */}
                <div className="flex items-center justify-between text-[9px] font-mono text-medium-400 px-0.5">
                  <span className="truncate max-w-[70px]">
                    {card.cardName}
                  </span>
                  <span>
                    {rot === 90 ? "Cruzada" : rot === 180 ? "Invert." : "Direta"}
                  </span>
                </div>
              </div>

              {/* Botões Flutuantes Rápidos na Carta (Modo Edição) */}
              {isEditable && (
                <div className="absolute -top-3 -right-3 hidden group-hover:flex items-center gap-1 bg-medium-850 p-1 rounded-md border border-medium-600 shadow-xl z-50">
                  <button
                    type="button"
                    onClick={(e) => handleRotateCard(idx, e)}
                    className="p-1 text-white hover:bg-medium-750 rounded"
                    title="Girar Lâmina (90°)"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => triggerLocalImageUpload(idx, e)}
                    className="p-1 text-white hover:bg-medium-750 rounded"
                    title="Carregar Foto Local"
                  >
                    <Upload className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handlePromptImageUrl(idx, e)}
                    className="p-1 text-white hover:bg-medium-750 rounded"
                    title="Inserir Link URL da Foto"
                  >
                    <LinkIcon className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveCard(idx, e)}
                    className="p-1 text-red-400 hover:bg-medium-750 rounded"
                    title="Remover Carta"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Dica no rodapé do altar */}
        <div className="absolute bottom-2 left-3 text-[10px] font-mono text-medium-400 pointer-events-none flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-white" />
          <span>
            {isEditable
              ? "Arraste as cartas livremente pela mesa como no altar. Clique em uma carta para editar detalhes."
              : "Clique em qualquer lâmina para inspecionar seus atributos e interpretação hermética."}
          </span>
        </div>
      </div>

      {/* Painel do Card Selecionado (Inspetor / Editor) */}
      {activeCard && activeCardIdx !== null && (
        <div className="p-4 rounded-xl bg-medium-850 border border-medium-700 text-xs space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-medium-700 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-white">
                {isEditable ? "Editar Carta Selecionada" : "Lâmina Inspecionada"}
              </span>
              <span className="text-[10px] font-mono text-medium-400">
                (Posição {activeCardIdx + 1} de {cards.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveCardIdx(null)}
              className="p-1 text-medium-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isEditable && onChange ? (
            /* Modo Edição dos Detalhes da Carta */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-medium-400 mb-1">
                  POSIÇÃO NO ORÁCULO
                </label>
                <input
                  type="text"
                  value={activeCard.position}
                  onChange={(e) => {
                    const updated = [...cards];
                    updated[activeCardIdx] = { ...updated[activeCardIdx], position: e.target.value };
                    onChange(updated);
                  }}
                  className="w-full bg-medium-800 border border-medium-700 rounded px-2.5 py-1.5 text-xs text-white"
                  placeholder="Ex: 1. A Vontade Central"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-medium-400 mb-1">
                  NOME DA LÂMINA
                </label>
                <input
                  type="text"
                  value={activeCard.cardName}
                  onChange={(e) => {
                    const updated = [...cards];
                    updated[activeCardIdx] = { ...updated[activeCardIdx], cardName: e.target.value };
                    onChange(updated);
                  }}
                  className="w-full bg-medium-800 border border-medium-700 rounded px-2.5 py-1.5 text-xs text-white"
                  placeholder="Ex: O Louco / Runa Fehu"
                />
              </div>

              {/* Botões de Ação da Imagem e Rotação */}
              <div>
                <label className="block text-[10px] font-mono text-medium-400 mb-1">
                  IMAGEM & ORIENTAÇÃO
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => triggerLocalImageUpload(activeCardIdx)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-medium-800 hover:bg-medium-750 text-white rounded text-[11px] border border-medium-700"
                    title="Carregar Imagem do Computador"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePromptImageUrl(activeCardIdx)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-medium-800 hover:bg-medium-750 text-white rounded text-[11px] border border-medium-700"
                    title="Inserir Link URL"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>Link</span>
                  </button>
                  {activeCard.imageUrl && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(activeCardIdx)}
                      className="px-2 py-1.5 text-red-400 hover:text-red-300 rounded text-[11px] border border-medium-700"
                      title="Remover Imagem"
                    >
                      Remover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRotateCard(activeCardIdx)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-medium-800 hover:bg-medium-750 text-white rounded text-[11px] border border-medium-700 ml-auto"
                    title="Girar Carta"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>{(activeCard.rotation || 0)}°</span>
                  </button>
                </div>
              </div>

              {/* Notas de Interpretação */}
              <div className="md:col-span-3">
                <label className="block text-[10px] font-mono text-medium-400 mb-1">
                  INTERPRETAÇÃO & NOTAS DESTA LÂMINA
                </label>
                <textarea
                  rows={2}
                  value={activeCard.notes || ""}
                  onChange={(e) => {
                    const updated = [...cards];
                    updated[activeCardIdx] = { ...updated[activeCardIdx], notes: e.target.value };
                    onChange(updated);
                  }}
                  className="w-full bg-medium-800 border border-medium-700 rounded p-2 text-xs text-white font-serif placeholder-medium-500 leading-relaxed"
                  placeholder="Significado da carta no contexto da tiragem..."
                />
              </div>
            </div>
          ) : (
            /* Modo Leitura dos Detalhes da Carta */
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {activeCard.imageUrl && (
                <div className="w-24 h-36 rounded-lg overflow-hidden border border-medium-700 shrink-0">
                  <img
                    src={activeCard.imageUrl}
                    alt={activeCard.cardName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-1.5 flex-1">
                <span className="text-[10px] font-mono text-medium-400 uppercase font-semibold">
                  {activeCard.position}
                </span>
                <h4 className="text-base font-sans font-bold text-white">
                  {activeCard.cardName}
                </h4>
                {activeCard.notes && (
                  <p className="text-medium-200 font-serif italic text-xs pt-1 leading-relaxed">
                    "{activeCard.notes}"
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
