"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { THOTH_TAROT_DECK, ThothCard, CARD_BACKS } from "@/lib/thothTarot";
import { playCardDealSound, playCardFlipSound } from "@/lib/audioBell";
import {
  Sparkles,
  RotateCw,
  Plus,
  Trash2,
  X,
  Eye,
  EyeOff,
  Bot,
  Copy,
  Layers,
  Shuffle,
  ChevronDown,
  Info,
  Check,
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

export interface SpreadPreset {
  id: string;
  name: string;
  description: string;
  slots: {
    position: string;
    x: number; // percentage
    y: number; // percentage
    rotation?: number;
  }[];
}

export const SPREAD_PRESETS: SpreadPreset[] = [
  {
    id: "single",
    name: "Carta Única (Foco do Dia / Conselho)",
    description: "Sintonização mágica imediata com a corrente e a Verdadeira Vontade.",
    slots: [
      { position: "Conselho da Vontade / Arcano Regente", x: 44, y: 32 },
    ],
  },
  {
    id: "trinity",
    name: "Três Fatos (Vontade, Oposição, Síntese)",
    description: "Método hermético clássico: tese, antítese e síntese resolutiva.",
    slots: [
      { position: "1. Vontade / Força Ativa", x: 20, y: 32 },
      { position: "2. Oposição / Influência", x: 44, y: 32 },
      { position: "3. Síntese / Resolução", x: 68, y: 32 },
    ],
  },
  {
    id: "time_line",
    name: "Linha Temporal (Passado, Presente, Futuro)",
    description: "A corrente que moldou o momento e para onde as forças convergem.",
    slots: [
      { position: "1. A Causa no Passado", x: 20, y: 32 },
      { position: "2. O Momento Presente", x: 44, y: 32 },
      { position: "3. Tendência Futura", x: 68, y: 32 },
    ],
  },
  {
    id: "elements_four",
    name: "Cruz dos 4 Elementos da Esfinge",
    description: "Saber, Querer, Ousar e Calar através dos poderes elementais.",
    slots: [
      { position: "Fogo (Yod / Vontade)", x: 44, y: 10 },
      { position: "Água (Heh / Emoção)", x: 20, y: 35 },
      { position: "Ar (Vav / Razão)", x: 68, y: 35 },
      { position: "Terra (Heh final / Ação)", x: 44, y: 60 },
    ],
  },
  {
    id: "thelemic_will",
    name: "Tiragem da Verdadeira Vontade (4 Lâminas)",
    description: "Alinhamento com a Grande Obra segundo Liber AL vel Legis.",
    slots: [
      { position: "1. A Verdadeira Vontade", x: 44, y: 10 },
      { position: "2. A Ilusão / Obstáculo", x: 20, y: 35 },
      { position: "3. A Energia Auxiliar (Hadit)", x: 68, y: 35 },
      { position: "4. A Resolução (A Grande Obra)", x: 44, y: 60 },
    ],
  },
  {
    id: "hexagram",
    name: "Hexagrama Thelêmico (7 Forças Planetárias)",
    description: "Mapeamento das forças do macrocosmo operando sobre a questão.",
    slots: [
      { position: "1. Saturno (Estrutura / Limites)", x: 44, y: 8 },
      { position: "2. Júpiter (Expansão / Graça)", x: 68, y: 22 },
      { position: "3. Marte (Purificação / Energia)", x: 20, y: 22 },
      { position: "4. Sol (O Centro / Tiphareth)", x: 44, y: 35 },
      { position: "5. Vênus (Amor / Harmonia)", x: 68, y: 52 },
      { position: "6. Mercúrio (Inteligência / Magia)", x: 20, y: 52 },
      { position: "7. Lua (Inconsciente / Yesod)", x: 44, y: 65 },
    ],
  },
  {
    id: "celtic_cross",
    name: "Cruz Céltica Expandida (10 Lâminas)",
    description: "O mais completo e clássico método divinatório adaptado a Thoth.",
    slots: [
      { position: "1. O Coração da Questão", x: 28, y: 35 },
      { position: "2. O Obstáculo Cruzado", x: 28, y: 35, rotation: 90 },
      { position: "3. A Raiz Inconsciente", x: 28, y: 62 },
      { position: "4. O Passado Recente", x: 12, y: 35 },
      { position: "5. O Objetivo Consciente", x: 28, y: 10 },
      { position: "6. O Futuro Imediato", x: 44, y: 35 },
      { position: "7. O Consulente / Magista", x: 72, y: 65 },
      { position: "8. Forças Ambientais", x: 72, y: 46 },
      { position: "9. Esperanças e Temores", x: 72, y: 27 },
      { position: "10. Desfecho Final", x: 72, y: 8 },
    ],
  },
];

interface OracleTableProps {
  cards: CardOnTable[];
  onChange?: (cards: CardOnTable[]) => void;
  isEditable?: boolean;
  query?: string;
  spreadName?: string;
  onApplyInterpretation?: (text: string) => void;
  cardBackStyle?: "rosa_cruz" | "thelema";
  onCardBackStyleChange?: (style: "rosa_cruz" | "thelema") => void;
  onSpreadNameChange?: (name: string) => void;
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
  onSpreadNameChange,
}: OracleTableProps) {
  const tableRef = useRef<HTMLDivElement | null>(null);

  const [activeCardIdx, setActiveCardIdx] = useState<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mouseDownPos, setMouseDownPos] = useState<{ x: number; y: number } | null>(null);
  const [localBackStyle, setLocalBackStyle] = useState<"rosa_cruz" | "thelema">(cardBackStyle);

  // Estados de Animações
  const [isShuffling, setIsShuffling] = useState(false);
  const [isDealing, setIsDealing] = useState(false);
  const [isSpreadMenuOpen, setIsSpreadMenuOpen] = useState(false);

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

  // Número de cartas restantes no baralho completo de 78
  const remainingDeckCount = useMemo(() => {
    const usedIds = new Set(cards.map((c) => c.cardId));
    return Math.max(0, 78 - usedIds.size);
  }, [cards]);

  // Embaralhar o deck com animação visual e sonora
  const handleTriggerShuffle = () => {
    if (isShuffling || isDealing) return;
    setIsShuffling(true);
    playCardDealSound();
    setTimeout(() => {
      playCardDealSound();
    }, 240);
    setTimeout(() => {
      setIsShuffling(false);
    }, 700);
  };

  // Puxar Carta do Deck no Canto Superior Esquerdo
  const handleDrawFromDeck = () => {
    if (!onChange || isDealing) return;
    const existingIds = new Set(cards.map((c) => c.cardId));
    let availableDeck = THOTH_TAROT_DECK.filter((c) => !existingIds.has(c.id));
    if (availableDeck.length === 0) {
      alert("Todas as 78 lâminas do Livro de Thoth já foram dispostas sobre a mesa!");
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableDeck.length);
    const thoth = availableDeck[randomIndex];

    // Distribuir na mesa em posição orgânica
    const count = cards.length;
    const col = count % 4;
    const row = Math.floor(count / 4);
    const posX = Math.min(Math.max(24 + col * 17, 20), 75);
    const posY = Math.min(Math.max(16 + row * 24, 10), 65);

    const newCard: CardOnTable = {
      position: `Lâmina #${count + 1}`,
      cardId: thoth.id,
      cardName: thoth.name,
      imageUrl: thoth.imageUrl,
      imageFile: thoth.imageFile,
      x: posX,
      y: posY,
      rotation: 0,
      isFlipped: false, // Inicia virada para baixo no pano de altar!
      notes: thoth.keywords.join(", "),
    };

    const updated = [...cards, newCard];
    onChange(updated);
    setActiveCardIdx(updated.length - 1);
    playCardDealSound();
  };

  // Aplicar Tiragem Padrão com animação carta a carta
  const handleApplySpreadMethod = (spread: SpreadPreset) => {
    if (!onChange || isDealing) return;
    setIsDealing(true);
    setIsSpreadMenuOpen(false);

    if (onSpreadNameChange) {
      onSpreadNameChange(spread.name);
    }

    // Embaralhar e retirar cartas únicas do deck
    const shuffled = [...THOTH_TAROT_DECK].sort(() => Math.random() - 0.5);
    const chosenCards = shuffled.slice(0, spread.slots.length);

    let dealtSoFar: CardOnTable[] = [];
    onChange([]);

    spread.slots.forEach((slot, idx) => {
      setTimeout(() => {
        const thoth = chosenCards[idx];
        const newCard: CardOnTable = {
          position: slot.position,
          cardId: thoth.id,
          cardName: thoth.name,
          imageUrl: thoth.imageUrl,
          imageFile: thoth.imageFile,
          x: slot.x,
          y: slot.y,
          rotation: slot.rotation || 0,
          isFlipped: false, // Todas viradas para baixo!
          notes: thoth.keywords.join(", "),
        };
        dealtSoFar = [...dealtSoFar, newCard];
        onChange([...dealtSoFar]);
        playCardDealSound();

        if (idx === spread.slots.length - 1) {
          setIsDealing(false);
          setActiveCardIdx(0);
        }
      }, (idx + 1) * 280);
    });
  };

  // Virar / Desvelar Carta específica (com animação 3D e som)
  const handleCardClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveCardIdx(idx);

    if (cards[idx].isFlipped === false && onChange) {
      const updated = [...cards];
      updated[idx] = { ...updated[idx], isFlipped: true };
      onChange(updated);
      playCardFlipSound();
    }
  };

  // Virar todas as cartas (Reveal all / Hide all)
  const handleToggleFlipAll = () => {
    if (!onChange || cards.length === 0) return;
    const anyHidden = cards.some((c) => c.isFlipped === false);
    const updated = cards.map((c) => ({
      ...c,
      isFlipped: anyHidden ? true : false,
    }));
    onChange(updated);
    playCardFlipSound();
  };

  // Girar carta selecionada em 90 graus
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

  // Remover carta da mesa
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
    setMouseDownPos({ x: e.clientX, y: e.clientY });
    setActiveCardIdx(idx);

    if (!isEditable || !tableRef.current) return;
    const cardEl = e.currentTarget as HTMLElement;
    const cardRect = cardEl.getBoundingClientRect();

    setDragOffset({
      x: e.clientX - cardRect.left,
      y: e.clientY - cardRect.top,
    });
    setDraggingIdx(idx);
  };

  const handleCardMouseUp = (idx: number, e: React.MouseEvent) => {
    if (mouseDownPos) {
      const dist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);
      if (dist < 6) {
        // Foi clique simples: se a carta estiver virada para baixo, virar em 3D!
        if (cards[idx].isFlipped === false && onChange) {
          const updated = [...cards];
          updated[idx] = { ...updated[idx], isFlipped: true };
          onChange(updated);
          playCardFlipSound();
        }
      }
    }
    setDraggingIdx(null);
    setMouseDownPos(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingIdx === null || !tableRef.current || !onChange) return;
    const rect = tableRef.current.getBoundingClientRect();

    const mouseX = e.clientX - rect.left - dragOffset.x;
    const mouseY = e.clientY - rect.top - dragOffset.y;

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

  const handleMouseUpGlobal = () => {
    setDraggingIdx(null);
    setMouseDownPos(null);
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

  const activeCard = activeCardIdx !== null ? cards[activeCardIdx] : null;
  const activeThoth = activeCard ? THOTH_TAROT_DECK.find((c) => c.id === activeCard.cardId) : null;

  return (
    <div className="space-y-3 select-none">
      {/* Estilos e Animações CSS para o Pano e as Cartas */}
      <style>{`
        @keyframes altarClothUnfold {
          0% {
            opacity: 0;
            transform: scaleY(0.18) scaleX(0.85);
            filter: blur(8px);
          }
          60% {
            opacity: 0.95;
            transform: scaleY(1.02) scaleX(1.01);
            filter: blur(0px);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px);
          }
        }
        @keyframes deckRiffleShuffle {
          0% { transform: rotate(-6deg) scale(1); }
          25% { transform: rotate(-14deg) translateX(-12px) scale(1.06); }
          50% { transform: rotate(10deg) translateX(12px) scale(1.06); }
          75% { transform: rotate(-8deg) translateY(-6px) scale(1.03); }
          100% { transform: rotate(-6deg) scale(1); }
        }
        .animate-cloth-unfold {
          animation: altarClothUnfold 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-deck-shuffle {
          animation: deckRiffleShuffle 0.65s ease-in-out infinite;
        }
      `}</style>

      {/* Barra de Ferramentas da Mesa Oracular */}
      <div className="p-3 bg-medium-850 rounded-xl border border-medium-700 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Esquerda: Botão de Métodos de Tiragem + Ações Rápidas */}
        <div className="flex flex-wrap items-center gap-2">
          {/* BOTÃO DE MÉTODOS DE TIRAGEM COM DROPDOWN */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSpreadMenuOpen(!isSpreadMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs shadow-sm transition-all"
              title="Escolher um método canônico de tiragem para dispor as lâminas automaticamente"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Métodos de Tiragem</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {isSpreadMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-medium-850 border border-medium-700 rounded-xl p-2 shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1.5 border-b border-medium-750 text-[10px] font-mono text-medium-400 font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>Métodos Tradicionais</span>
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-white"
                    onClick={() => setIsSpreadMenuOpen(false)}
                  />
                </div>
                {SPREAD_PRESETS.map((spread) => (
                  <button
                    key={spread.id}
                    type="button"
                    onClick={() => handleApplySpreadMethod(spread)}
                    className="w-full text-left p-2 rounded-lg hover:bg-medium-800 transition-colors group flex flex-col"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-medium-100 group-hover:text-amber-300">
                        {spread.name}
                      </span>
                      <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">
                        {spread.slots.length} {spread.slots.length === 1 ? "carta" : "cartas"}
                      </span>
                    </div>
                    <span className="text-[10px] text-medium-400 line-clamp-1 mt-0.5 font-mono">
                      {spread.description}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Botão Embaralhar */}
          <button
            type="button"
            onClick={handleTriggerShuffle}
            disabled={isShuffling || isDealing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-medium-800 hover:bg-medium-750 text-medium-200 hover:text-white rounded-lg border border-medium-700 transition-all font-mono text-[11px]"
            title="Embaralhar o monte de 78 cartas de Thoth"
          >
            <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? "animate-spin text-amber-400" : ""}`} />
            <span>{isShuffling ? "Embaralhando..." : "Embaralhar Deck"}</span>
          </button>

          {/* Botão Revelar / Ocultar Todas */}
          {cards.length > 0 && (
            <button
              type="button"
              onClick={handleToggleFlipAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-medium-800 hover:bg-medium-750 text-medium-200 hover:text-white rounded-lg border border-medium-700 transition-all font-mono text-[11px]"
              title="Revelar ou ocultar todas as lâminas sobre o altar"
            >
              {cards.some((c) => c.isFlipped === false) ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
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
        </div>

        {/* Direita: Verso + Limpar + Palpite da IA */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Verso (Rosa Cruz ou Thelema) */}
          <div className="flex items-center gap-1.5 bg-medium-800 px-2.5 py-1 rounded-lg border border-medium-700">
            <Layers className="w-3.5 h-3.5 text-medium-400" />
            <span className="text-[10px] font-mono text-medium-400">Verso:</span>
            <select
              value={cardBackStyle || localBackStyle}
              onChange={(e) => handleBackStyleChange(e.target.value as any)}
              className="bg-transparent text-medium-100 text-[11px] font-mono focus:outline-none cursor-pointer"
            >
              <option value="rosa_cruz">Rosa-Cruz</option>
              <option value="thelema">Thelema</option>
            </select>
          </div>

          {/* Limpar Mesa */}
          {cards.length > 0 && isEditable && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Deseja recolher todas as cartas de volta ao baralho?")) {
                  onChange?.([]);
                  setActiveCardIdx(null);
                }
              }}
              className="p-1.5 text-medium-400 hover:text-red-400 rounded-lg hover:bg-medium-800 transition-colors"
              title="Recolher todas as lâminas e limpar a mesa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Botão Palpite da IA (Frater Auxiliar) */}
          <button
            type="button"
            onClick={handleRequestAiInterpretation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-medium-200 text-black font-semibold rounded-lg text-xs transition-colors shadow-sm"
            title="Pedir interpretação hermética da tiragem ao Frater Auxiliar"
          >
            <Bot className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Palpite da IA</span>
          </button>
        </div>
      </div>

      {/* PANO ORACULAR DO ALTAR (CANVAS COM VELUDO E FILIGRANAS) */}
      <div
        ref={tableRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpGlobal}
        onMouseLeave={handleMouseUpGlobal}
        className="relative w-full h-[520px] rounded-2xl border-2 border-amber-600/40 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.85),inset_0_0_50px_rgba(217,119,6,0.1)] animate-cloth-unfold select-none bg-[#0a0812]"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, rgba(168, 85, 247, 0.08) 0%, rgba(10, 8, 18, 0.95) 75%),
            linear-gradient(rgba(234, 179, 8, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(234, 179, 8, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 36px 36px, 36px 36px",
        }}
      >
        {/* Cantoneiras Douradas do Pano de Altar nos 4 Cantos */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-500/50 rounded-tl pointer-events-none" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-500/50 rounded-tr pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-500/50 rounded-bl pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-500/50 rounded-br pointer-events-none" />

        {/* Marca d'água geométrica central do Pano de Altar */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-96 h-96 rounded-full border border-dashed border-amber-500/50 flex items-center justify-center">
            <div className="w-64 h-64 rounded-full border border-amber-400/40 flex items-center justify-center">
              <Sparkles className="w-20 h-20 text-amber-300" />
            </div>
          </div>
        </div>

        {/* DECK 3D INTERATIVO NO CANTO SUPERIOR ESQUERDO */}
        <div className="absolute top-4 left-4 z-30 select-none">
          <div
            onClick={handleDrawFromDeck}
            className="group relative cursor-pointer"
            title="Baralho de Thoth — Clique para Tirar uma Lâmina"
          >
            {/* Camadas inferiores do baralho (espessura 3D de 78 cartas) */}
            <div className="absolute -bottom-2 -right-2 w-20 sm:w-24 h-32 sm:h-38 rounded-lg bg-black/80 border border-amber-900/40 shadow-2xl" />
            <div className="absolute -bottom-1 -right-1 w-20 sm:w-24 h-32 sm:h-38 rounded-lg bg-[#181512] border border-amber-700/50 shadow-md" />

            {/* Carta do topo do monte (virada em ângulo) */}
            <div
              className={`relative w-20 sm:w-24 h-32 sm:h-38 rounded-lg overflow-hidden border-2 border-amber-500/80 bg-medium-950 p-1 shadow-2xl transition-all duration-300 transform -rotate-6 group-hover:-rotate-3 group-hover:scale-105 group-hover:border-amber-400 group-hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] ${
                isShuffling ? "animate-deck-shuffle" : ""
              }`}
            >
              <img
                src={currentBack.imageUrl}
                alt="Baralho de Thoth"
                className="w-full h-full object-cover rounded pointer-events-none"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/15 transition-colors flex flex-col items-center justify-between p-1.5 text-center">
                <span className="text-[8px] font-mono font-bold text-amber-200 bg-black/80 px-1 py-0.5 rounded border border-amber-500/40 shadow-sm">
                  {remainingDeckCount} no deck
                </span>
                <div className="w-6 h-6 rounded-full bg-amber-500/90 text-black flex items-center justify-center font-bold text-xs shadow-md group-hover:scale-110 transition-transform">
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-[7.5px] font-mono text-white bg-black/80 px-1 rounded uppercase tracking-wider font-semibold">
                  Tirar Carta
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notificação / Estado da Mesa */}
        {cards.length === 0 && !isDealing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-medium-400 font-mono text-xs pointer-events-none">
            <Sparkles className="w-8 h-8 text-amber-400/60 mb-2 animate-pulse" />
            <span className="text-medium-200 font-semibold text-sm">Pano Oracular Estendido</span>
            <span className="text-[11px] text-medium-400 mt-1 max-w-sm">
              Clique no <strong>Baralho</strong> no canto superior esquerdo para puxar uma lâmina aleatória ou escolha um <strong>Método de Tiragem</strong> no menu.
            </span>
          </div>
        )}

        {/* FEEDBACK DE DISTRIBUIÇÃO */}
        {isDealing && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-purple-500/50 text-purple-200 text-xs font-mono flex items-center gap-2 shadow-2xl animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Distribuindo lâminas sobre o altar...</span>
          </div>
        )}

        {/* RENDERIZAÇÃO DAS CARTAS NA MESA COM FLIP 3D */}
        {cards.map((card, idx) => {
          const posX = card.x !== undefined ? card.x : 24 + (idx % 4) * 18;
          const posY = card.y !== undefined ? card.y : 20 + Math.floor(idx / 4) * 24;
          const rot = card.rotation || 0;
          const isFlipped = card.isFlipped !== false;
          const isDragging = draggingIdx === idx;
          const isSelected = activeCardIdx === idx;
          const thothInfo = THOTH_TAROT_DECK.find((tc) => tc.id === card.cardId);

          const faceImage = card.imageUrl || thothInfo?.imageUrl;
          const backImage = currentBack.imageUrl;

          return (
            <div
              key={`table-card-${idx}`}
              onMouseDown={(e) => handleMouseDown(idx, e)}
              onMouseUp={(e) => handleCardMouseUp(idx, e)}
              onClick={(e) => handleCardClick(idx, e)}
              className={`absolute select-none transition-shadow ${
                isEditable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
              } ${
                isDragging
                  ? "z-50 scale-105 shadow-2xl"
                  : isSelected
                  ? "z-40 scale-102"
                  : "z-20 hover:z-30 hover:scale-[1.03]"
              }`}
              style={{
                left: `${posX}%`,
                top: `${posY}%`,
                transform: `rotate(${rot}deg)`,
                transformOrigin: "center center",
              }}
            >
              {/* ESTRUTURA FLIP 3D DA CARTA */}
              <div
                className="w-24 sm:w-28 h-38 sm:h-44 rounded-lg shadow-xl"
                style={{ perspective: "1000px" }}
              >
                <div
                  className="relative w-full h-full rounded-lg transition-transform duration-500 ease-out"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(0deg)" : "rotateY(180deg)",
                  }}
                >
                  {/* 1. FACE DA CARTA (ROTAÇÃO 0deg - REVELADA) */}
                  <div
                    className={`absolute inset-0 w-full h-full rounded-lg overflow-hidden border-2 bg-[#121018] flex flex-col justify-between p-1 shadow-2xl ${
                      isSelected
                        ? "border-amber-400 ring-2 ring-amber-400/40"
                        : "border-amber-700/60 hover:border-amber-400"
                    }`}
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    {/* Etiqueta da Posição */}
                    <div className="bg-black/90 backdrop-blur-sm px-1 py-0.5 rounded text-[8px] font-mono text-amber-200 text-center truncate font-bold border border-amber-900/60">
                      {card.position}
                    </div>

                    {/* Imagem da Face de Thoth */}
                    <div className="flex-1 my-0.5 rounded overflow-hidden flex items-center justify-center bg-black/60 relative">
                      {faceImage ? (
                        <img
                          src={faceImage}
                          alt={card.cardName}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      ) : (
                        <div className="text-center p-1">
                          <span className="text-[11px] font-serif font-bold text-white block">
                            {card.cardName}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Rodapé da Carta */}
                    <div className="bg-black/85 px-1 py-0.5 rounded text-[8px] font-mono text-white text-center truncate font-semibold border border-medium-800">
                      {card.cardName}
                    </div>
                  </div>

                  {/* 2. VERSO DA CARTA (ROTAÇÃO 180deg - OCULTA NO ALTAR) */}
                  <div
                    className={`absolute inset-0 w-full h-full rounded-lg overflow-hidden border-2 border-amber-500/80 bg-medium-950 p-1 shadow-2xl flex flex-col justify-between ${
                      isSelected ? "ring-2 ring-amber-400/50" : ""
                    }`}
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div className="bg-black/90 px-1 py-0.5 rounded text-[8px] font-mono text-amber-300 text-center truncate font-semibold border border-amber-700/60">
                      {card.position}
                    </div>

                    <div className="flex-1 my-0.5 rounded overflow-hidden relative flex items-center justify-center bg-black/50">
                      <img
                        src={backImage}
                        alt={currentBack.name}
                        className="w-full h-full object-cover rounded pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-black/30 hover:bg-black/10 transition-colors flex flex-col items-center justify-center text-center p-1">
                        <span className="text-[8px] font-mono font-bold text-amber-200 bg-black/85 px-1.5 py-0.5 rounded border border-amber-400/50 shadow-sm animate-pulse">
                          Clique p/ Virar
                        </span>
                      </div>
                    </div>

                    <div className="text-[7.5px] font-mono text-medium-400 text-center uppercase tracking-wider">
                      Lâmina Oculta
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PAINEL DE INSPEÇÃO DA LÂMINA ATIVA SELECIONADA */}
      {activeCard && (
        <div className="p-3.5 rounded-xl bg-medium-850 border border-medium-700 space-y-2 animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-medium-750 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-10 rounded border border-amber-500/50 overflow-hidden bg-black shrink-0">
                <img
                  src={activeCard.imageUrl || activeThoth?.imageUrl || currentBack.imageUrl}
                  alt={activeCard.cardName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold block">
                  {activeCard.position}
                </span>
                <h4 className="text-xs font-serif font-bold text-medium-100 flex items-center gap-1.5">
                  <span>{activeCard.cardName}</span>
                  {activeCard.isFlipped === false && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                      (Oculta)
                    </span>
                  )}
                </h4>
              </div>
            </div>

            {/* Ações Rápidas na Carta Selecionada */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => handleCardClick(activeCardIdx!, e)}
                className="px-2 py-1 bg-medium-800 hover:bg-medium-750 text-medium-200 hover:text-white rounded text-xs font-mono border border-medium-700 flex items-center gap-1 transition-colors"
                title="Virar esta carta"
              >
                {activeCard.isFlipped ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-amber-400" />}
                <span>{activeCard.isFlipped ? "Ocultar" : "Revelar"}</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleRotateCard(activeCardIdx!, e)}
                className="p-1 bg-medium-800 hover:bg-medium-750 text-medium-200 hover:text-white rounded border border-medium-700 transition-colors"
                title="Girar 90 graus"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              {isEditable && (
                <button
                  type="button"
                  onClick={(e) => handleRemoveCard(activeCardIdx!, e)}
                  className="p-1 text-medium-400 hover:text-red-400 rounded hover:bg-medium-800 transition-colors"
                  title="Remover carta da mesa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Atribuições de Liber 777 e Notas */}
          {activeThoth && (
            <div className="text-[11px] font-mono text-medium-300 flex flex-wrap gap-x-4 gap-y-1">
              {activeThoth.hebrewLetter && (
                <span>
                  <strong className="text-medium-400">Letra:</strong> {activeThoth.hebrewLetter} ({activeThoth.hebrewName})
                </span>
              )}
              {activeThoth.astrologicalSign && (
                <span>
                  <strong className="text-medium-400">Astro/Signo:</strong> {activeThoth.astrologicalSign}
                </span>
              )}
              {activeThoth.keywords && activeThoth.keywords.length > 0 && (
                <span>
                  <strong className="text-medium-400">Palavras-chave:</strong> {activeThoth.keywords.join(", ")}
                </span>
              )}
            </div>
          )}

          {/* Campo de Anotações do Praticante para a Carta */}
          {isEditable && (
            <div className="pt-1">
              <input
                type="text"
                value={activeCard.notes || ""}
                onChange={(e) => {
                  if (!onChange) return;
                  const updated = [...cards];
                  updated[activeCardIdx!] = {
                    ...updated[activeCardIdx!],
                    notes: e.target.value,
                  };
                  onChange(updated);
                }}
                placeholder="Anotações pessoais ou visão astral desta lâmina nesta posição..."
                className="w-full bg-medium-800 border border-medium-700 rounded-md px-2.5 py-1.5 text-xs text-medium-100 placeholder-medium-500 focus:outline-none focus:border-amber-400 font-sans"
              />
            </div>
          )}
        </div>
      )}

      {/* MODAL DO PALPITE DA IA (FRATER AUXILIAR) */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-medium-850 border border-medium-700 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-medium-750">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                  Palpite Hermético do Frater Auxiliar
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="text-medium-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 text-xs text-medium-200 leading-relaxed font-serif whitespace-pre-line">
              {isAiLoading ? (
                <div className="p-8 text-center text-medium-400 font-mono space-y-2">
                  <Sparkles className="w-6 h-6 text-purple-400 mx-auto animate-spin" />
                  <span>Sintetizando correspondências e correntes astrais...</span>
                </div>
              ) : (
                aiInterpretation || "Nenhuma interpretação disponível."
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-medium-750">
              <button
                type="button"
                onClick={handleCopyAiText}
                disabled={isAiLoading || !aiInterpretation}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-medium-800 hover:bg-medium-750 text-white rounded text-xs font-mono border border-medium-700 transition-colors"
              >
                {copiedSuccess ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSuccess ? "Copiado!" : "Copiar"}</span>
              </button>

              {onApplyInterpretation && aiInterpretation && (
                <button
                  type="button"
                  onClick={() => {
                    onApplyInterpretation(aiInterpretation);
                    setShowAiModal(false);
                  }}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded text-xs transition-colors"
                >
                  Inserir no Texto da Nota
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
