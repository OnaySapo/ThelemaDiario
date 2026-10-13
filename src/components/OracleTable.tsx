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
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
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
      { position: "1. Vontade / Situação", x: 20, y: 32 },
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

  // Estados do Modal de Inspeção em Alta Resolução (Zoom)
  const [inspectCard, setInspectCard] = useState<CardOnTable | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panPos, setPanPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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

  // Gerador determinístico de estrelas cintilantes do espaço cósmico de Nuit
  const cosmicStars = useMemo(() => {
    const stars = [];
    for (let i = 0; i < 42; i++) {
      const x = ((i * 37 + 11) % 96) + 2;
      const y = ((i * 47 + 7) % 94) + 3;
      const size = (i % 4 === 0) ? 2.4 : (i % 3 === 0) ? 1.8 : (i % 2 === 0) ? 1.4 : 1.0;
      const dur = 2.0 + (i % 6) * 0.7;
      const delay = (i % 8) * 0.4;
      const isGold = i % 3 === 0;
      stars.push({ id: i, x, y, size, dur, delay, isGold });
    }
    return stars;
  }, []);

  // Cartas restantes no baralho
  const remainingDeckCount = useMemo(() => {
    const usedIds = new Set(cards.map((c) => c.cardId));
    return Math.max(0, THOTH_TAROT_DECK.length - usedIds.size);
  }, [cards]);

  // Função para sortear carta aleatória ainda não tirada
  const pickRandomCard = (): ThothCard => {
    const usedIds = new Set(cards.map((c) => c.cardId));
    const available = THOTH_TAROT_DECK.filter((c) => !usedIds.has(c.id));
    if (available.length === 0) {
      return THOTH_TAROT_DECK[Math.floor(Math.random() * THOTH_TAROT_DECK.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
  };

  // 1. Puxar Carta do Deck (Clicando no monte)
  const handleDrawFromDeck = () => {
    if (isDealing) return;
    const drawn = pickRandomCard();
    playCardDealSound();

    const count = cards.length;
    const posX = 38 + ((count * 7) % 36);
    const posY = 30 + ((count * 6) % 30);

    const newCard: CardOnTable = {
      position: `Lâmina #${count + 1}`,
      cardId: drawn.id,
      cardName: drawn.name,
      imageUrl: drawn.imageUrl,
      imageFile: drawn.imageFile,
      x: posX,
      y: posY,
      rotation: 0,
      isFlipped: false, // Inicia virada para baixo no altar
    };

    const updated = [...cards, newCard];
    onChange?.(updated);
    setActiveCardIdx(updated.length - 1);
  };

  // 2. Embaralhar o Deck com Animação e Som
  const handleTriggerShuffle = () => {
    if (isShuffling || isDealing) return;
    setIsShuffling(true);
    playCardDealSound();

    setTimeout(() => {
      playCardDealSound();
    }, 280);

    setTimeout(() => {
      setIsShuffling(false);
    }, 700);
  };

  // 3. Aplicar Método de Tiragem (Distribui sequencialmente carta a carta viradas para baixo)
  const handleApplySpreadMethod = async (preset: SpreadPreset) => {
    if (isDealing) return;
    setIsSpreadMenuOpen(false);
    setIsDealing(true);

    if (onSpreadNameChange) {
      onSpreadNameChange(preset.name);
    }

    const usedIds = new Set<string>();
    const newCards: CardOnTable[] = [];

    // Limpa a mesa antes de começar a nova tiragem
    onChange?.([]);
    setActiveCardIdx(null);

    // Distribui cada slot sequencialmente
    for (let i = 0; i < preset.slots.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 240));

      const slot = preset.slots[i];
      const available = THOTH_TAROT_DECK.filter((c) => !usedIds.has(c.id));
      const drawn =
        available.length > 0
          ? available[Math.floor(Math.random() * available.length)]
          : THOTH_TAROT_DECK[Math.floor(Math.random() * THOTH_TAROT_DECK.length)];

      usedIds.add(drawn.id);
      playCardDealSound();

      const dealtCard: CardOnTable = {
        position: slot.position,
        cardId: drawn.id,
        cardName: drawn.name,
        imageUrl: drawn.imageUrl,
        imageFile: drawn.imageFile,
        x: slot.x,
        y: slot.y,
        rotation: slot.rotation || 0,
        isFlipped: false, // Virada para baixo para revelar ritualisticamente
      };

      newCards.push(dealtCard);
      onChange?.([...newCards]);
    }

    setIsDealing(false);
  };

  // 4. Virar Carta (Flip 3D com Som)
  const handleToggleFlipCard = (index: number) => {
    if (!onChange || index < 0 || index >= cards.length) return;
    playCardFlipSound();
    const updated = [...cards];
    const currentStatus = updated[index].isFlipped !== false;
    updated[index] = {
      ...updated[index],
      isFlipped: !currentStatus,
    };
    onChange(updated);
  };

  // 5. Virar / Revelar Todas as Cartas
  const handleToggleFlipAll = () => {
    if (!onChange || cards.length === 0) return;
    playCardFlipSound();
    const someHidden = cards.some((c) => c.isFlipped === false);
    const updated = cards.map((c) => ({
      ...c,
      isFlipped: someHidden ? true : false,
    }));
    onChange(updated);
  };

  // Manipuladores de Arrastar (Drag & Drop) na Mesa
  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    if (!isEditable) return;
    if (e.button !== 0) return; // Apenas botão esquerdo

    setMouseDownPos({ x: e.clientX, y: e.clientY });
    setActiveCardIdx(index);
    setDraggingIdx(index);

    if (tableRef.current) {
      const rect = tableRef.current.getBoundingClientRect();
      const card = cards[index];
      const currentX = (card.x || 0) * (rect.width / 100);
      const currentY = (card.y || 0) * (rect.height / 100);
      setDragOffset({
        x: e.clientX - rect.left - currentX,
        y: e.clientY - rect.top - currentY,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingIdx === null || !tableRef.current || !onChange) return;
    const rect = tableRef.current.getBoundingClientRect();

    let newX = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    let newY = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;

    // Limites da mesa
    newX = Math.max(2, Math.min(88, newX));
    newY = Math.max(2, Math.min(84, newY));

    const updated = [...cards];
    updated[draggingIdx] = {
      ...updated[draggingIdx],
      x: Math.round(newX * 10) / 10,
      y: Math.round(newY * 10) / 10,
    };
    onChange(updated);
  };

  const handleCardMouseUp = (index: number, e: React.MouseEvent) => {
    if (mouseDownPos) {
      const dist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);
      if (dist < 5) {
        // Foi um clique estático: vira a carta
        handleToggleFlipCard(index);
      }
    }
    setDraggingIdx(null);
    setMouseDownPos(null);
  };

  const handleMouseUpGlobal = () => {
    setDraggingIdx(null);
    setMouseDownPos(null);
  };

  const handleCardClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveCardIdx(index);
  };

  const handleRotateCard = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onChange) return;
    const updated = [...cards];
    const curRot = updated[index].rotation || 0;
    updated[index] = {
      ...updated[index],
      rotation: (curRot + 90) % 360,
    };
    onChange(updated);
  };

  const handleRemoveCard = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onChange) return;
    const updated = cards.filter((_, i) => i !== index);
    onChange(updated);
    if (activeCardIdx === index) {
      setActiveCardIdx(null);
    } else if (activeCardIdx !== null && activeCardIdx > index) {
      setActiveCardIdx(activeCardIdx - 1);
    }
  };

  // Abrir Modal de Zoom da Carta
  const handleOpenZoom = (card: CardOnTable, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setInspectCard(card);
    setZoomScale(1);
    setPanPos({ x: 0, y: 0 });
  };

  // Controles de Pan no Zoom Modal
  const handleZoomWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomScale((prev) => Math.min(prev + 0.25, 4.0));
    } else {
      setZoomScale((prev) => Math.max(prev - 0.25, 0.75));
    }
  };

  const handlePanMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - panPos.x, y: e.clientY - panPos.y });
  };

  const handlePanMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanPos({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  };

  const handlePanMouseUp = () => {
    setIsPanning(false);
  };

  // Tecla Escape para fechar modal de zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && inspectCard) {
        setInspectCard(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inspectCard]);

  // Interpretação da IA (Frater Auxiliar)
  const handleRequestAiInterpretation = async () => {
    if (cards.length === 0) {
      alert("Coloque ou tire pelo menos uma carta na mesa para consultar o Frater Auxiliar.");
      return;
    }
    setShowAiModal(true);
    setIsAiLoading(true);
    setAiInterpretation(null);

    try {
      const res = await fetch("/api/oracle/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query || "Qual a corrente e a influência mágica desta operação?",
          spreadName: spreadName || "Mesa Oracular do Altar",
          cards: cards.map((c) => ({
            position: c.position,
            cardName: c.cardName,
            rotation: c.rotation || 0,
            isFlipped: c.isFlipped !== false,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("Falha na comunicação com o oráculo hermético.");
      }
      const data = await res.json();
      setAiInterpretation(data.interpretation || "Nenhuma interpretação gerada.");
    } catch (err: any) {
      setAiInterpretation(`Erro ao invocar o Frater Auxiliar: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopyAiText = () => {
    if (!aiInterpretation) return;
    navigator.clipboard.writeText(aiInterpretation);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const activeCard = activeCardIdx !== null ? cards[activeCardIdx] : null;
  const activeThoth = activeCard ? THOTH_TAROT_DECK.find((t) => t.id === activeCard.cardId) : null;
  const inspectThoth = inspectCard ? THOTH_TAROT_DECK.find((t) => t.id === inspectCard.cardId) : null;

  return (
    <div className="space-y-3">
      {/* Estilos CSS das Animações Cósmicas e do Baralho */}
      <style>{`
        @keyframes cosmicSpaceDrift {
          0% { background-position: 0px 0px, 0px 0px; }
          100% { background-position: 120px 80px, -80px -60px; }
        }
        @keyframes starTwinkleGlow {
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.35); filter: drop-shadow(0 0 4px rgba(253, 224, 71, 0.9)); }
        }
        @keyframes deckRiffleShuffle {
          0% { transform: rotate(-6deg) scale(1); }
          25% { transform: rotate(-18deg) translateX(-14px) scale(1.06); }
          50% { transform: rotate(14deg) translateX(12px) scale(1.06); }
          75% { transform: rotate(-10deg) translateX(-6px) scale(1.03); }
          100% { transform: rotate(-6deg) scale(1); }
        }
        @keyframes altarClothUnfold {
          0% { transform: scale(0.96) translateY(-6px); opacity: 0.6; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-deck-shuffle {
          animation: deckRiffleShuffle 0.65s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-cloth-unfold {
          animation: altarClothUnfold 0.4s ease-out;
        }
      `}</style>

      {/* BARRA SUPERIOR DE FERRAMENTAS DO ALTAR */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
        {/* Esquerda: Métodos de Tiragem + Embaralhar + Revelar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Menu Dropdown de Métodos de Tiragem */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSpreadMenuOpen(!isSpreadMenuOpen)}
              disabled={isDealing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/40 rounded-lg text-xs font-mono font-semibold transition-all shadow-sm"
              title="Escolher uma disposição de tiragem clássica"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Métodos de Tiragem</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
            </button>

            {isSpreadMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-80 bg-medium-850 border border-medium-700 rounded-xl p-2 shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between px-2 py-1 border-b border-medium-750 mb-1">
                  <span className="text-[10px] font-mono uppercase text-medium-400 font-bold tracking-wider">
                    Spreads Clássicos de Altar
                  </span>
                  <X
                    className="w-3.5 h-3.5 text-medium-400 hover:text-white cursor-pointer"
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

      {/* PANO ORACULAR DO ALTAR (ESPAÇO SIDERAL EM MOVIMENTO COM BRILHOS DE ESTRELAS) */}
      <div
        ref={tableRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpGlobal}
        onMouseLeave={handleMouseUpGlobal}
        className="relative w-full h-[540px] rounded-2xl border-2 border-amber-600/40 overflow-hidden shadow-[0_16px_45px_rgba(0,0,0,0.9),inset_0_0_60px_rgba(217,119,6,0.12)] animate-cloth-unfold select-none bg-[#05030A]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 40% 30%, rgba(99, 102, 241, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse at 75% 70%, rgba(168, 85, 247, 0.14) 0%, transparent 65%),
            linear-gradient(rgba(234, 179, 8, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(234, 179, 8, 0.035) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 42px 42px, 42px 42px",
          animation: "cosmicSpaceDrift 60s linear infinite",
        }}
      >
        {/* Camada das Estrelas Vivas do Espaço Cósmico de Nuit */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {cosmicStars.map((star) => (
            <div
              key={`star-${star.id}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                backgroundColor: star.isGold ? "#FDE047" : "#FFFFFF",
                boxShadow: star.isGold
                  ? "0 0 6px rgba(250, 204, 21, 0.8), 0 0 12px rgba(234, 179, 8, 0.4)"
                  : "0 0 6px rgba(255, 255, 255, 0.9), 0 0 10px rgba(192, 132, 252, 0.4)",
                animation: `starTwinkleGlow ${star.dur}s ease-in-out infinite alternate`,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Cantoneiras Douradas Sagradas nos 4 Cantos do Altar */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-500/50 rounded-tl pointer-events-none z-10" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-500/50 rounded-tr pointer-events-none z-10" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-500/50 rounded-bl pointer-events-none z-10" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-500/50 rounded-br pointer-events-none z-10" />

        {/* Marca d'água geométrica celestial central */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[420px] h-[420px] rounded-full border border-dashed border-amber-500/40 flex items-center justify-center">
            <div className="w-72 h-72 rounded-full border border-amber-400/30 flex items-center justify-center">
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
                <span className="text-[8px] font-mono font-bold text-amber-200 bg-black/85 px-1 py-0.5 rounded border border-amber-500/40 shadow-sm">
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

        {/* Notificação de Mesa Vazia */}
        {cards.length === 0 && !isDealing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-medium-400 font-mono text-xs pointer-events-none z-10">
            <Sparkles className="w-8 h-8 text-amber-400/60 mb-2 animate-pulse" />
            <span className="text-medium-100 font-semibold text-sm">Pano Oracular Estendido</span>
            <span className="text-[11px] text-medium-400 mt-1 max-w-sm">
              Clique no <strong>Baralho</strong> no canto superior esquerdo para puxar uma lâmina aleatória ou escolha um <strong>Método de Tiragem</strong> no menu.
            </span>
          </div>
        )}

        {/* Feedback de Distribuição Animada */}
        {isDealing && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-black/85 backdrop-blur-md px-4 py-2 rounded-full border border-purple-500/60 text-purple-200 text-xs font-mono flex items-center gap-2 shadow-2xl animate-pulse">
            <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
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
              onDoubleClick={(e) => handleOpenZoom(card, e)}
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
                className="w-24 sm:w-28 h-38 sm:h-44 rounded-lg shadow-2xl"
                style={{ perspective: "1000px" }}
              >
                <div
                  className="relative w-full h-full rounded-lg transition-transform duration-500 ease-out"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(0deg)" : "rotateY(180deg)",
                  }}
                >
                  {/* 1. FACE DA CARTA REVELADA (Apenas Imagem Pura com Indicador Superior da Casa) */}
                  <div
                    className={`absolute inset-0 w-full h-full rounded-lg overflow-hidden border-2 bg-[#0F0D15] flex flex-col justify-between p-1 shadow-2xl ${
                      isSelected
                        ? "border-amber-400 ring-2 ring-amber-400/40"
                        : "border-amber-700/60 hover:border-amber-400"
                    }`}
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    {/* Indicador Superior da Casa / Posição (Luminoso e Nítido) */}
                    <div className="bg-black/90 backdrop-blur-md px-1.5 py-0.5 rounded text-[8.5px] font-mono text-amber-200 text-center truncate font-bold border border-amber-600/50 shadow-sm z-10">
                      {card.position}
                    </div>

                    {/* Imagem Pura da Lâmina de Thoth (Preenche todo o corpo da carta) */}
                    <div className="flex-1 my-0.5 rounded overflow-hidden flex items-center justify-center bg-black/60 relative group/cardimg">
                      {faceImage ? (
                        <img
                          src={faceImage}
                          alt={card.cardName}
                          className="w-full h-full object-cover rounded pointer-events-none"
                        />
                      ) : (
                        <div className="text-center p-1">
                          <span className="text-[11px] font-serif font-bold text-white block">
                            {card.cardName}
                          </span>
                        </div>
                      )}

                      {/* Botão de Lupa para Exame em Alta Resolução */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenZoom(card, e)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/80 hover:bg-amber-400 hover:text-black text-amber-200 border border-amber-500/50 opacity-0 group-hover/cardimg:opacity-100 transition-all shadow-md z-20"
                        title="Examinar lâmina em alta resolução (Zoom)"
                      >
                        <ZoomIn className="w-3 h-3" />
                      </button>
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
                    <div className="bg-black/90 px-1 py-0.5 rounded text-[8.5px] font-mono text-amber-300 text-center truncate font-bold border border-amber-700/60">
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
            <div className="flex items-center gap-2.5">
              <div
                onClick={() => handleOpenZoom(activeCard)}
                className="w-8 h-12 rounded border border-amber-500/60 overflow-hidden bg-black shrink-0 cursor-pointer hover:border-amber-400 transition-all shadow-md group relative"
                title="Clique para ampliar em alta resolução"
              >
                <img
                  src={activeCard.imageUrl || activeThoth?.imageUrl || currentBack.imageUrl}
                  alt={activeCard.cardName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <ZoomIn className="w-3.5 h-3.5 text-white" />
                </div>
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
              {/* Botão Examinar em Alta Resolução */}
              <button
                type="button"
                onClick={() => handleOpenZoom(activeCard)}
                className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/40 rounded text-xs font-mono flex items-center gap-1.5 transition-colors shadow-sm font-semibold"
                title="Examinar detalhes e símbolos em alta resolução"
              >
                <ZoomIn className="w-3.5 h-3.5 text-amber-300" />
                <span>Alta Resolução</span>
              </button>

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

          {/* Atribuições de Liber 777 */}
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

      {/* MODAL DE INSPEÇÃO EM ALTA RESOLUÇÃO COM ZOOM & PAN INTERATIVO */}
      {inspectCard && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col p-4 sm:p-6 animate-in fade-in select-none"
          onClick={() => setInspectCard(null)}
        >
          {/* Barra Superior do Visualizador */}
          <div
            className="flex items-center justify-between pb-3 border-b border-medium-700 text-white z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest block font-bold">
                {inspectCard.position}
              </span>
              <h3 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
                <span>{inspectCard.cardName}</span>
                {inspectThoth?.thelemicTitle && (
                  <span className="text-xs font-mono text-medium-400 font-normal">
                    — {inspectThoth.thelemicTitle}
                  </span>
                )}
              </h3>
            </div>

            {/* Controles de Zoom */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.max(0.75, prev - 0.25))}
                className="p-1.5 rounded-lg bg-medium-800 hover:bg-medium-700 border border-medium-700 text-medium-200 hover:text-white transition-colors"
                title="Diminuir Zoom (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono text-amber-300 w-12 text-center font-bold">
                {Math.round(zoomScale * 100)}%
              </span>

              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(4.0, prev + 0.25))}
                className="p-1.5 rounded-lg bg-medium-800 hover:bg-medium-700 border border-medium-700 text-medium-200 hover:text-white transition-colors"
                title="Aumentar Zoom (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setZoomScale(1);
                  setPanPos({ x: 0, y: 0 });
                }}
                className="px-2 py-1.5 rounded-lg bg-medium-800 hover:bg-medium-700 border border-medium-700 text-xs font-mono text-medium-300 hover:text-white transition-colors flex items-center gap-1"
                title="Resetar Zoom (100%)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>100%</span>
              </button>

              <div className="w-[1px] h-5 bg-medium-700 mx-1" />

              <button
                type="button"
                onClick={() => setInspectCard(null)}
                className="p-1.5 rounded-lg bg-medium-800 hover:bg-red-950/60 border border-medium-700 hover:border-red-700 text-medium-300 hover:text-red-300 transition-colors"
                title="Fechar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Área Central: Imagem com Suporte a Pan e Zoom */}
          <div
            className="flex-1 overflow-hidden relative flex items-center justify-center p-4 cursor-grab active:cursor-grabbing"
            onWheel={handleZoomWheel}
            onMouseDown={handlePanMouseDown}
            onMouseMove={handlePanMouseMove}
            onMouseUp={handlePanMouseUp}
            onMouseLeave={handlePanMouseUp}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="transition-transform duration-75 ease-out select-none"
              style={{
                transform: `translate(${panPos.x}px, ${panPos.y}px) scale(${zoomScale})`,
                transformOrigin: "center center",
              }}
            >
              <img
                src={inspectCard.imageUrl || inspectThoth?.imageUrl || currentBack.imageUrl}
                alt={inspectCard.cardName}
                className="max-h-[75vh] w-auto object-contain rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] border-2 border-amber-500/60 pointer-events-none select-none"
                draggable={false}
              />
            </div>

            {/* Dica de Interação */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-medium-700 text-[11px] font-mono text-medium-400">
              Role o scroll do mouse para Zoom · Arraste para mover
            </div>
          </div>

          {/* Rodapé com Correspondências de Liber 777 */}
          {inspectThoth && (
            <div
              className="p-3 bg-medium-850/90 border-t border-medium-700 rounded-xl text-xs font-mono text-medium-300 flex flex-wrap items-center justify-between gap-4 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                {inspectThoth.hebrewLetter && (
                  <span>
                    <strong className="text-amber-400 font-bold">Letra Hebraica:</strong>{" "}
                    {inspectThoth.hebrewLetter} ({inspectThoth.hebrewName})
                  </span>
                )}
                {inspectThoth.astrologicalSign && (
                  <span>
                    <strong className="text-amber-400 font-bold">Astrologia:</strong>{" "}
                    {inspectThoth.astrologicalSign}
                  </span>
                )}
                {inspectThoth.sephirahPath && (
                  <span>
                    <strong className="text-amber-400 font-bold">Caminho da Árvore:</strong>{" "}
                    {inspectThoth.sephirahPath}
                  </span>
                )}
                {inspectThoth.keywords && inspectThoth.keywords.length > 0 && (
                  <span>
                    <strong className="text-medium-400">Atributos:</strong>{" "}
                    {inspectThoth.keywords.join(" · ")}
                  </span>
                )}
              </div>

              {inspectCard.notes && (
                <div className="text-[11px] font-sans italic text-medium-200">
                  <strong>Anotação:</strong> &ldquo;{inspectCard.notes}&rdquo;
                </div>
              )}
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
