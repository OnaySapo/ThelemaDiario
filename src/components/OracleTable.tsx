"use client";

import React, { useState, useRef } from "react";
import { THOTH_TAROT_DECK, ThothCard, CARD_BACKS } from "@/lib/thothTarot";
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
  EyeOff,
  Bot,
  Copy,
  BookOpen,
  Layers,
  Shuffle,
} from "lucide-react";

export interface CardOnTable {
  position: string;
  cardId: string;
  cardName: string;
  imageUrl?: string;
  imageFile?: string;
  x?: number; // porcentagem 5% a 90%
  y?: number; // porcentagem 5% a 85%
  rotation?: number; // 0, 90, 180, 270 graus
  isFlipped?: boolean; // false = verso da carta, true = face revelada
  notes?: string;
}

interface OracleTableProps {
  cards: CardOnTable[];
  onChange?: (cards: CardOnTable[]) => void;
  isEditable?: boolean;
  query?: string;
  spreadName?: string;
  onApplyInterpretation?: (text: string) => void;
  cardBackStyle?: "rosa_cruz" | "thelema";
  onCardBackStyleChange?: (style: "rosa_cruz" | "thelema") => void;
}

export function OracleTable({
  cards,
  onChange,
  isEditable = false,
  query = "",
  spreadName = "Tiragem Oracular",
  onApplyInterpretation,
  cardBackStyle = "rosa_cruz",
  onCardBackStyleChange,
}: OracleTableProps) {
  const tableRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeCardIdx, setActiveCardIdx] = useState<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageUploadIdx, setImageUploadIdx] = useState<number | null>(null);
  const [selectedThothToAdd, setSelectedThothToAdd] = useState("");
  const [localBackStyle, setLocalBackStyle] = useState<"rosa_cruz" | "thelema">(cardBackStyle);

  // Estados do Palpite da IA
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const currentBack = CARD_BACKS.find((b) => b.id === (cardBackStyle || localBackStyle)) || CARD_BACKS[0];

  const handleBackStyleChange = (style: "rosa_cruz" | "thelema") => {
    setLocalBackStyle(style);
    if (onCardBackStyleChange) {
      onCardBackStyleChange(style);
    }
  };

  // Adicionar Carta do Baralho de Thoth com imagem oficial mapeada
  const handleAddThothCard = (cardId: string) => {
    if (!onChange) return;
    const thoth = THOTH_TAROT_DECK.find((c) => c.id === cardId);
    if (!thoth) return;

    const count = cards.length;
    const newCard: CardOnTable = {
      position: `Posição ${count + 1}`,
      cardId: thoth.id,
      cardName: thoth.name,
      imageUrl: thoth.imageUrl,
      imageFile: thoth.imageFile,
      x: 25 + (count % 4) * 16,
      y: 25 + Math.floor(count / 4) * 22,
      rotation: 0,
      isFlipped: true,
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
      x: 30 + (count % 3) * 16,
      y: 30 + Math.floor(count / 3) * 22,
      rotation: 0,
      isFlipped: true,
      notes: "",
    };
    const updated = [...cards, newCard];
    onChange(updated);
    setActiveCardIdx(updated.length - 1);
  };

  // Tirar Carta Aleatória do Livro de Thoth (sorteio canônico com opção aberta ou oculta)
  const handleDrawRandomCard = (faceDown: boolean = false) => {
    if (!onChange) return;
    const existingIds = new Set(cards.map((c) => c.cardId));
    let availableDeck = THOTH_TAROT_DECK.filter((c) => !existingIds.has(c.id));
    if (availableDeck.length === 0) {
      availableDeck = [...THOTH_TAROT_DECK];
    }
    const randomIndex = Math.floor(Math.random() * availableDeck.length);
    const thoth = availableDeck[randomIndex];

    const count = cards.length;
    const posX = Math.min(Math.max(20 + (count % 4) * 17, 8), 76);
    const posY = Math.min(Math.max(20 + Math.floor(count / 4) * 22, 12), 65);

    const newCard: CardOnTable = {
      position: `Lâmina ${count + 1}`,
      cardId: thoth.id,
      cardName: thoth.name,
      imageUrl: thoth.imageUrl,
      imageFile: thoth.imageFile,
      x: posX,
      y: posY,
      rotation: 0,
      isFlipped: !faceDown,
      notes: thoth.keywords.join(", "),
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

  // Virar carta (Face-up / Face-down)
  const handleToggleFlipCard = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!onChange) return;
    const updated = [...cards];
    const isCurrentlyFlipped = updated[idx].isFlipped !== false;
    updated[idx] = {
      ...updated[idx],
      isFlipped: !isCurrentlyFlipped,
    };
    onChange(updated);
  };

  // Virar todas as cartas (Reveal all or hide all)
  const handleToggleFlipAll = () => {
    if (!onChange || cards.length === 0) return;
    const anyHidden = cards.some((c) => c.isFlipped === false);
    const updated = cards.map((c) => ({
      ...c,
      isFlipped: anyHidden ? true : false,
    }));
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
    updated[idx] = { ...updated[idx], imageUrl: undefined, imageFile: undefined };
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

    // Se clicou na carta e ela estiver virada para baixo no modo de leitura, vire-a!
    if (!isEditable && cards[idx].isFlipped === false && onChange) {
      const updated = [...cards];
      updated[idx] = { ...updated[idx], isFlipped: true };
      onChange(updated);
      return;
    }

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

  // Pedir Palpite do Frater Auxiliar (IA)
  const handleRequestAiInterpretation = async () => {
    if (cards.length === 0) {
      alert("Coloque ao menos uma lâmina no altar antes de solicitar o palpite da IA.");
      return;
    }
    setIsAiLoading(true);
    setShowAiModal(true);
    try {
      const res = await fetch("/api/oracle/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query || "",
          spreadName: spreadName || "Mesa Oracular",
          cards: cards.map((c) => ({
            position: c.position,
            cardId: c.cardId,
            cardName: c.cardName,
            rotation: c.rotation || 0,
            notes: c.notes || "",
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiInterpretation(data.interpretation);
      } else {
        setAiInterpretation("Não foi possível gerar a interpretação: " + data.error);
      }
    } catch (err: any) {
      setAiInterpretation("Erro ao comunicar com a IA: " + err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopyAiText = () => {
    if (aiInterpretation) {
      navigator.clipboard.writeText(aiInterpretation);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    }
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

      {/* Barra de Ferramentas Superior da Mesa */}
      <div className="p-3 bg-medium-850 rounded-lg border border-medium-700 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Lado Esquerdo: Adicionar Cartas (Modo Edição) */}
        {isEditable ? (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedThothToAdd}
              onChange={(e) => {
                const val = e.target.value;
                if (val) handleAddThothCard(val);
              }}
              className="bg-medium-800 border border-medium-700 rounded px-2.5 py-1.5 text-xs text-white max-w-[210px] truncate"
            >
              <option value="">+ Adicionar Lâmina de Thoth...</option>
              <optgroup label="Arcanos Maiores (22 Atus)">
                {THOTH_TAROT_DECK.filter((c) => c.suit === "major").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.number ? `${c.number}. ` : ""}{c.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Paus (Fogo - 14 Lâminas)">
                {THOTH_TAROT_DECK.filter((c) => c.suit === "wands").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Copas (Água - 14 Lâminas)">
                {THOTH_TAROT_DECK.filter((c) => c.suit === "cups").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Espadas (Ar - 14 Lâminas)">
                {THOTH_TAROT_DECK.filter((c) => c.suit === "swords").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Discos (Terra - 14 Lâminas)">
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
              <span>Personalizada</span>
            </button>

            <button
              type="button"
              onClick={() => handleDrawRandomCard(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-medium-800 hover:bg-medium-750 text-white rounded text-xs border border-medium-700 transition-colors font-medium"
              title="Tirar uma lâmina aleatória do Livro de Thoth sobre o altar"
            >
              <Shuffle className="w-3.5 h-3.5 text-white" />
              <span>Tirar Aleatória</span>
            </button>

            <button
              type="button"
              onClick={() => handleDrawRandomCard(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-medium-800 hover:bg-medium-750 text-medium-300 hover:text-white rounded text-xs border border-medium-700 transition-colors"
              title="Tirar uma lâmina oculta (virada para baixo) para revelação cega"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Tirar Oculta</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-mono text-medium-300">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="font-semibold text-white">Altar de Consulta Oracular</span>
            <span>({cards.length} {cards.length === 1 ? "lâmina" : "lâminas"})</span>
          </div>
        )}

        {/* Lado Direito: Versos das Cartas + Revelar + Palpite IA */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Verso (2 Tipos) */}
          <div className="flex items-center gap-1.5 bg-medium-800 px-2 py-1 rounded border border-medium-700">
            <Layers className="w-3.5 h-3.5 text-medium-400" />
            <span className="text-[10px] font-mono text-medium-400">Verso:</span>
            <select
              value={cardBackStyle || localBackStyle}
              onChange={(e) => handleBackStyleChange(e.target.value as any)}
              className="bg-transparent text-white text-[11px] font-mono focus:outline-none cursor-pointer"
            >
              <option value="rosa_cruz">Rosa-Cruz</option>
              <option value="thelema">Thelema</option>
            </select>
          </div>

          {/* Botão Revelar / Ocultar Todas */}
          {cards.length > 0 && (
            <button
              type="button"
              onClick={handleToggleFlipAll}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-medium-800 hover:bg-medium-750 text-white rounded text-[11px] font-mono border border-medium-700 transition-colors"
              title="Alternar entre mostrar a face ou o verso de todas as lâminas"
            >
              {cards.some((c) => c.isFlipped === false) ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Revelar Todas</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Ocultar Todas</span>
                </>
              )}
            </button>
          )}

          {/* Presets de Alinhamento (No modo edição) */}
          {isEditable && (
            <div className="hidden sm:flex items-center gap-1">
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
                title="Cruz (4)"
              >
                Cruz
              </button>
              <button
                type="button"
                onClick={() => applyPresetLayout("hexagram")}
                className="px-2 py-1 bg-medium-800 hover:bg-medium-750 text-white rounded text-[11px] font-mono border border-medium-700"
                title="Hexagrama (7)"
              >
                Hexagrama
              </button>
              <button
                type="button"
                onClick={() => applyPresetLayout("celtic")}
                className="px-2 py-1 bg-medium-800 hover:bg-medium-750 text-white rounded text-[11px] font-mono border border-medium-700"
                title="Cruz Céltica (10)"
              >
                Céltica
              </button>
            </div>
          )}

          {/* BOTÃO MÁGICO DE PALPITE DA IA */}
          <button
            type="button"
            onClick={handleRequestAiInterpretation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-medium-200 text-black font-semibold rounded text-xs transition-colors shadow-sm"
            title="Pedir palpite e interpretação hermética da tiragem ao Frater Auxiliar"
          >
            <Bot className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Palpite da IA</span>
          </button>
        </div>
      </div>

      {/* O Pano de Mesa do Altar (Canvas Interativo) */}
      <div
        ref={tableRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-full h-[470px] bg-[#111111] rounded-xl border-2 border-medium-700 overflow-hidden shadow-2xl"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, rgba(255, 255, 255, 0.06) 0%, transparent 75%),
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 35px 35px, 35px 35px",
        }}
      >
        {/* Geometria Sagrada no Centro do Altar */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
          <div className="w-80 h-80 rounded-full border border-dashed border-white/60 flex items-center justify-center">
            <div className="w-56 h-56 rounded-full border border-white/40 flex items-center justify-center">
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
                Selecione uma lâmina de Thoth no menu superior para dispor sobre o altar.
              </span>
            )}
          </div>
        )}

        {/* Renderização das Lâminas sobre a Mesa */}
        {cards.map((card, idx) => {
          const posX = card.x !== undefined ? card.x : 20 + (idx % 4) * 18;
          const posY = card.y !== undefined ? card.y : 20 + Math.floor(idx / 4) * 22;
          const rot = card.rotation || 0;
          const isFlipped = card.isFlipped !== false; // true = mostrando a face, false = verso
          const isDragging = draggingIdx === idx;
          const isSelected = activeCardIdx === idx;
          const thothInfo = THOTH_TAROT_DECK.find((tc) => tc.id === card.cardId);

          // Imagem efetiva da face
          const faceImage = card.imageUrl || thothInfo?.imageUrl;
          // Imagem do verso
          const backImage = currentBack.imageUrl;

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
              {/* Carta Visual com efeito de espessura de baralho */}
              <div
                className={`w-28 sm:w-32 h-44 sm:h-48 rounded-lg overflow-hidden border-2 bg-medium-900 flex flex-col justify-between p-1.5 shadow-2xl transition-all ${
                  isDragging || isSelected
                    ? "border-white ring-2 ring-white/40"
                    : "border-medium-600 hover:border-white"
                }`}
              >
                {/* Etiqueta da Posição */}
                <div className="bg-black/85 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono text-white text-center truncate font-semibold border border-medium-700">
                  {card.position}
                </div>

                {/* Centro da Carta: FACE ou VERSO */}
                <div className="flex-1 my-1 rounded overflow-hidden flex flex-col items-center justify-center relative bg-medium-950/70 border border-medium-800">
                  {!isFlipped ? (
                    /* VERSO DA CARTA (ROSA CRUZ OU THELEMA) */
                    <div className="w-full h-full relative flex items-center justify-center bg-black/60">
                      <img
                        src={backImage}
                        alt={currentBack.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors flex items-center justify-center">
                        <span className="text-[9px] font-mono text-white/90 bg-black/70 px-1 py-0.5 rounded border border-white/20">
                          {currentBack.id === "rosa_cruz" ? "Rosa-Cruz" : "Thelema"}
                        </span>
                      </div>
                    </div>
                  ) : faceImage ? (
                    /* FACE DA CARTA: IMAGEM ALTA RESOLUÇÃO */
                    <img
                      src={faceImage}
                      alt={card.cardName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    /* FACE DA CARTA: SÍMBOLO HERMÉTICO FALLBACK */
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
                    {isFlipped ? card.cardName : "Oculta"}
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
                    onClick={(e) => handleToggleFlipCard(idx, e)}
                    className="p-1 text-white hover:bg-medium-750 rounded"
                    title={isFlipped ? "Virar para Baixo (Verso)" : "Revelar Carta (Face)"}
                  >
                    {isFlipped ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
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
                    title="Carregar Foto Personalizada"
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
              ? "Arraste as lâminas livremente pela mesa como no altar. Clique em uma lâmina para editar detalhes ou virar."
              : "Clique nas lâminas para virar/inspecionar seus atributos cabalísticos e interpretação hermética."}
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

              {/* Botões de Ação da Imagem, Rotação e Face */}
              <div>
                <label className="block text-[10px] font-mono text-medium-400 mb-1">
                  ORIENTAÇÃO & FOTO
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleFlipCard(activeCardIdx)}
                    className="flex items-center gap-1 px-2 py-1.5 bg-medium-800 hover:bg-medium-750 text-white rounded text-[11px] border border-medium-700"
                    title="Alternar face ou verso da carta"
                  >
                    {activeCard.isFlipped === false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{activeCard.isFlipped === false ? "Revelar" : "Ocultar"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRotateCard(activeCardIdx)}
                    className="flex items-center gap-1 px-2 py-1.5 bg-medium-800 hover:bg-medium-750 text-white rounded text-[11px] border border-medium-700"
                    title="Girar Carta (90°)"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>{(activeCard.rotation || 0)}°</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerLocalImageUpload(activeCardIdx)}
                    className="flex items-center gap-1 px-2 py-1.5 bg-medium-800 hover:bg-medium-750 text-white rounded text-[11px] border border-medium-700"
                    title="Carregar Imagem Local"
                  >
                    <Upload className="w-3 h-3" />
                  </button>

                  {activeCard.imageUrl && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(activeCardIdx)}
                      className="px-2 py-1.5 text-red-400 hover:text-red-300 rounded text-[11px] border border-medium-700"
                      title="Resetar Imagem"
                    >
                      Reset
                    </button>
                  )}
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
              {(activeCard.imageUrl || (activeCard.isFlipped === false ? currentBack.imageUrl : null)) && (
                <div className="w-24 h-36 rounded-lg overflow-hidden border border-medium-700 shrink-0">
                  <img
                    src={activeCard.isFlipped === false ? currentBack.imageUrl : activeCard.imageUrl}
                    alt={activeCard.cardName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-medium-400 uppercase font-semibold">
                    {activeCard.position}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleFlipCard(activeCardIdx)}
                    className="text-[10px] font-mono text-medium-300 hover:text-white underline"
                  >
                    {activeCard.isFlipped === false ? "Revelar Carta" : "Virar para Baixo"}
                  </button>
                </div>
                <h4 className="text-base font-sans font-bold text-white">
                  {activeCard.isFlipped === false ? "Lâmina Oculta no Altar" : activeCard.cardName}
                </h4>
                {activeCard.notes && activeCard.isFlipped !== false && (
                  <p className="text-medium-200 font-serif italic text-xs pt-1 leading-relaxed">
                    "{activeCard.notes}"
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL DE PALPITE HERMÉTICO DA IA */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-medium-850 border border-medium-700 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-medium-700 flex items-center justify-between bg-medium-900">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-white" />
                <h3 className="text-sm font-sans font-bold text-white">
                  Palpite Hermético do Frater Auxiliar
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="p-1 text-medium-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 font-serif text-sm text-medium-200 leading-relaxed">
              {isAiLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-white animate-spin" />
                  <p className="text-sm font-sans font-semibold text-white">
                    Consultando as correntes astrais e as 78 lâminas do Livro de Thoth...
                  </p>
                  <p className="text-xs font-mono text-medium-400 max-w-md">
                    Avaliando dignidades elementais, posições e correspondências cabalísticas do Liber 777.
                  </p>
                </div>
              ) : aiInterpretation ? (
                <div className="whitespace-pre-wrap leading-relaxed select-text font-serif text-sm">
                  {aiInterpretation}
                </div>
              ) : (
                <p className="text-medium-400 italic">Nenhuma interpretação disponível.</p>
              )}
            </div>

            {/* Modal Footer */}
            {!isAiLoading && aiInterpretation && (
              <div className="p-4 border-t border-medium-700 bg-medium-900 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleCopyAiText}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-medium-800 hover:bg-medium-750 text-white rounded text-xs border border-medium-700 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSuccess ? "Copiado!" : "Copiar Texto"}</span>
                </button>

                <div className="flex items-center gap-2">
                  {onApplyInterpretation && (
                    <button
                      type="button"
                      onClick={() => {
                        onApplyInterpretation(aiInterpretation);
                        alert("Palpite hermético adicionado ao texto do diário com sucesso!");
                        setShowAiModal(false);
                      }}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-medium-200 text-black font-semibold rounded text-xs transition-colors shadow-sm"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Inserir no Diário</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowAiModal(false)}
                    className="px-4 py-1.5 text-medium-300 hover:text-white text-xs font-medium"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
