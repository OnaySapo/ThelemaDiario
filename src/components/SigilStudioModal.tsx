"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  X,
  Compass,
  Sparkles,
  Trash2,
  Undo2,
  Download,
  Check,
  Eye,
  EyeOff,
  Flame,
} from "lucide-react";

interface SigilStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSigil: (markdownImage: string, title: string, description: string) => void;
}

type StudioTab = "ponto_riscado" | "kamea" | "spare";

interface DrawCommand {
  type: "stroke" | "stamp";
  color: string;
  size: number;
  points?: { x: number; y: number }[];
  symmetry?: number;
  stampId?: string;
  x?: number;
  y?: number;
  rotation?: number;
}

const PEMBA_COLORS = [
  { id: "branca", label: "Pemba Branca (Oxalá / Paz)", hex: "#F8FAFC" },
  { id: "vermelha", label: "Pemba Vermelha (Exu / Ogum)", hex: "#EF4444" },
  { id: "ouro", label: "Pemba Amarela / Ouro (Oxum / Xangô)", hex: "#EAB308" },
  { id: "verde", label: "Pemba Verde (Oxóssi / Caboclos / Jurema)", hex: "#22C55E" },
  { id: "azul", label: "Pemba Azul (Iemanjá / Marinheiros)", hex: "#38BDF8" },
  { id: "roxa", label: "Pemba Roxa / Lilás (Nanã / Almas)", hex: "#C084FC" },
  { id: "preta", label: "Pemba Preta / Cinza (Quimbanda)", hex: "#94A3B8" },
];

const PONTO_STAMPS = [
  { id: "tridente_exu", label: "Tridente Reto (Exu)", icon: "Ψ" },
  { id: "tridente_pombagira", label: "Tridente Curvo (Pombagira)", icon: "☿" },
  { id: "arco_flecha", label: "Arco e Flecha (Oxóssi / Caboclo)", icon: "🏹" },
  { id: "espada_ogum", label: "Espada (Ogum)", icon: "⚔️" },
  { id: "machado_xango", label: "Machado Oxê (Xangô)", icon: "🪓" },
  { id: "raio_oya", label: "Raio (Oyá / Iansã)", icon: "⚡" },
  { id: "espelho_oxum", label: "Abebê / Coração (Oxum)", icon: "💛" },
  { id: "ancora_iemanja", label: "Âncora / Mar (Iemanjá)", icon: "⚓" },
  { id: "cruzeiro_almas", label: "Cruzeiro das Almas (Preto Velho)", icon: "✝" },
  { id: "cachimbo_jurema", label: "Cachimbo & Folha (Jurema)", icon: "🌿" },
  { id: "pentagrama", label: "Estrela de 5 Pontas", icon: "☆" },
  { id: "estrela_7", label: "Estrela de 7 Pontas", icon: "✴" },
  { id: "sol", label: "Sol (Astre)", icon: "☉" },
  { id: "lua", label: "Lua Crescente", icon: "☽" },
  { id: "espiral", label: "Espiral / Redemoinho", icon: "🌀" },
];

// Os 7 Quadrados Mágicos Planetários Tradicionais (Cornelius Agrippa)
const PLANETARY_KAMEAS: Record<
  string,
  {
    name: string;
    symbol: string;
    sephirah: string;
    orixa: string;
    size: number;
    sum: number;
    color: string;
    grid: number[][];
  }
> = {
  saturn: {
    name: "Saturno (3×3)",
    symbol: "♄",
    sephirah: "Binah",
    orixa: "Omolu / Obaluaê / Nanã",
    size: 3,
    sum: 15,
    color: "#94A3B8",
    grid: [
      [4, 9, 2],
      [3, 5, 7],
      [8, 1, 6],
    ],
  },
  jupiter: {
    name: "Júpiter (4×4)",
    symbol: "♃",
    sephirah: "Chesed",
    orixa: "Xangô / Ayrá",
    size: 4,
    sum: 34,
    color: "#3B82F6",
    grid: [
      [4, 14, 15, 1],
      [9, 7, 6, 12],
      [5, 11, 10, 8],
      [16, 2, 3, 13],
    ],
  },
  mars: {
    name: "Marte (5×5)",
    symbol: "♂",
    sephirah: "Geburah",
    orixa: "Ogum / Oyá",
    size: 5,
    sum: 65,
    color: "#EF4444",
    grid: [
      [11, 24, 7, 20, 3],
      [4, 12, 25, 8, 16],
      [17, 5, 13, 21, 9],
      [10, 18, 1, 14, 22],
      [23, 6, 19, 2, 15],
    ],
  },
  sun: {
    name: "Sol (6×6)",
    symbol: "☉",
    sephirah: "Tiphareth",
    orixa: "Oxalá / Orunmilá",
    size: 6,
    sum: 111,
    color: "#EAB308",
    grid: [
      [6, 32, 3, 34, 35, 1],
      [7, 11, 27, 28, 8, 30],
      [19, 14, 16, 15, 23, 24],
      [18, 20, 22, 21, 17, 13],
      [25, 29, 10, 9, 26, 12],
      [36, 5, 33, 4, 2, 31],
    ],
  },
  venus: {
    name: "Vênus (7×7)",
    symbol: "♀",
    sephirah: "Netzach",
    orixa: "Oxum / Oxumarê",
    size: 7,
    sum: 175,
    color: "#22C55E",
    grid: [
      [22, 47, 16, 41, 10, 35, 4],
      [5, 23, 48, 17, 42, 11, 29],
      [30, 6, 24, 49, 18, 36, 12],
      [13, 31, 7, 25, 43, 19, 37],
      [38, 14, 32, 1, 26, 44, 20],
      [21, 39, 8, 33, 2, 27, 45],
      [46, 15, 40, 9, 34, 3, 28],
    ],
  },
  mercury: {
    name: "Mercúrio (8×8)",
    symbol: "☿",
    sephirah: "Hod",
    orixa: "Exu / Ossaim",
    size: 8,
    sum: 260,
    color: "#F97316",
    grid: [
      [8, 58, 59, 5, 4, 62, 63, 1],
      [49, 15, 14, 52, 53, 11, 10, 56],
      [41, 23, 22, 44, 45, 19, 18, 48],
      [32, 34, 35, 29, 28, 38, 39, 25],
      [40, 26, 27, 37, 36, 30, 31, 33],
      [17, 47, 46, 20, 21, 43, 42, 24],
      [9, 55, 54, 12, 13, 51, 50, 16],
      [64, 2, 3, 61, 60, 6, 7, 57],
    ],
  },
  moon: {
    name: "Lua (9×9)",
    symbol: "☽",
    sephirah: "Yesod",
    orixa: "Iemanjá",
    size: 9,
    sum: 369,
    color: "#A855F7",
    grid: [
      [37, 78, 29, 70, 21, 62, 13, 54, 5],
      [6, 38, 79, 30, 71, 22, 63, 14, 46],
      [47, 7, 39, 80, 31, 72, 23, 55, 15],
      [16, 48, 8, 40, 81, 32, 64, 24, 56],
      [57, 17, 49, 9, 41, 73, 33, 65, 25],
      [26, 58, 18, 50, 1, 42, 74, 34, 66],
      [67, 27, 59, 10, 51, 2, 43, 75, 35],
      [36, 68, 19, 60, 11, 52, 3, 44, 76],
      [77, 28, 69, 20, 61, 12, 53, 4, 45],
    ],
  },
};

function drawTraditionalStamp(
  ctx: CanvasRenderingContext2D,
  stampId: string,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const r = size;

  switch (stampId) {
    case "tridente_exu": {
      // Haste central + garfo reto quadrado + seta na ponta
      ctx.beginPath();
      ctx.moveTo(0, r);
      ctx.lineTo(0, -r);
      ctx.moveTo(-r * 0.55, -r * 0.2);
      ctx.lineTo(-r * 0.55, -r * 0.85);
      ctx.moveTo(r * 0.55, -r * 0.2);
      ctx.lineTo(r * 0.55, -r * 0.85);
      ctx.moveTo(-r * 0.55, -r * 0.2);
      ctx.lineTo(r * 0.55, -r * 0.2);
      // Pontas
      ctx.moveTo(-r * 0.15, -r * 0.82);
      ctx.lineTo(0, -r);
      ctx.lineTo(r * 0.15, -r * 0.82);
      ctx.stroke();
      break;
    }
    case "tridente_pombagira": {
      // Haste central + garfo curvo em U
      ctx.beginPath();
      ctx.moveTo(0, r);
      ctx.lineTo(0, -r);
      ctx.arc(0, -r * 0.35, r * 0.55, 0, Math.PI, false);
      ctx.moveTo(-r * 0.55, -r * 0.35);
      ctx.lineTo(-r * 0.55, -r * 0.85);
      ctx.moveTo(r * 0.55, -r * 0.35);
      ctx.lineTo(r * 0.55, -r * 0.85);
      ctx.stroke();
      break;
    }
    case "arco_flecha": {
      // Arco e Flecha (Oxóssi / Caboclo)
      ctx.beginPath();
      ctx.arc(-r * 0.15, 0, r * 0.75, -Math.PI * 0.42, Math.PI * 0.42, false);
      ctx.moveTo(-r * 0.15, -r * 0.72);
      ctx.lineTo(-r * 0.15, r * 0.72);
      // Flecha horizontal/diagonal
      ctx.moveTo(-r * 0.75, 0);
      ctx.lineTo(r * 0.85, 0);
      ctx.moveTo(r * 0.55, -r * 0.22);
      ctx.lineTo(r * 0.85, 0);
      ctx.lineTo(r * 0.55, r * 0.22);
      ctx.stroke();
      break;
    }
    case "espada_ogum": {
      // Espada de Ogum
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(0, r * 0.85);
      ctx.moveTo(-r * 0.45, r * 0.35);
      ctx.lineTo(r * 0.45, r * 0.35);
      ctx.arc(0, r * 0.9, r * 0.1, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case "machado_xango": {
      // Machado Duplo (Oxê de Xangô)
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.9);
      ctx.lineTo(0, r * 0.95);
      // Asa esquerda
      ctx.moveTo(0, -r * 0.65);
      ctx.quadraticCurveTo(-r * 0.85, -r * 0.9, -r * 0.75, -r * 0.15);
      ctx.quadraticCurveTo(-r * 0.85, r * 0.2, 0, -r * 0.1);
      // Asa direita
      ctx.moveTo(0, -r * 0.65);
      ctx.quadraticCurveTo(r * 0.85, -r * 0.9, r * 0.75, -r * 0.15);
      ctx.quadraticCurveTo(r * 0.85, r * 0.2, 0, -r * 0.1);
      ctx.stroke();
      break;
    }
    case "raio_oya": {
      ctx.beginPath();
      ctx.moveTo(r * 0.25, -r * 0.9);
      ctx.lineTo(-r * 0.3, -r * 0.1);
      ctx.lineTo(r * 0.15, -r * 0.1);
      ctx.lineTo(-r * 0.25, r * 0.9);
      ctx.stroke();
      break;
    }
    case "espelho_oxum": {
      ctx.beginPath();
      ctx.arc(0, -r * 0.25, r * 0.5, 0, Math.PI * 2);
      ctx.moveTo(0, r * 0.25);
      ctx.lineTo(0, r * 0.95);
      ctx.moveTo(-r * 0.25, r * 0.6);
      ctx.lineTo(r * 0.25, r * 0.6);
      ctx.stroke();
      break;
    }
    case "ancora_iemanja": {
      ctx.beginPath();
      ctx.arc(0, -r * 0.65, r * 0.18, 0, Math.PI * 2);
      ctx.moveTo(0, -r * 0.47);
      ctx.lineTo(0, r * 0.75);
      ctx.moveTo(-r * 0.4, -r * 0.2);
      ctx.lineTo(r * 0.4, -r * 0.2);
      ctx.arc(0, r * 0.15, r * 0.6, Math.PI * 0.15, Math.PI * 0.85, false);
      ctx.stroke();
      break;
    }
    case "cruzeiro_almas": {
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.85);
      ctx.lineTo(0, r * 0.65);
      ctx.moveTo(-r * 0.5, -r * 0.3);
      ctx.lineTo(r * 0.5, -r * 0.3);
      // Base em degraus
      ctx.strokeRect(-r * 0.35, r * 0.65, r * 0.7, r * 0.22);
      ctx.stroke();
      break;
    }
    case "cachimbo_jurema": {
      // Folha Sagrada da Jurema + Cachimbo
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.85);
      ctx.quadraticCurveTo(r * 0.65, 0, 0, r * 0.85);
      ctx.quadraticCurveTo(-r * 0.65, 0, 0, -r * 0.85);
      ctx.moveTo(0, -r * 0.85);
      ctx.lineTo(0, r * 0.95);
      ctx.stroke();
      break;
    }
    case "pentagrama": {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = ((i * 144 - 90) * Math.PI) / 180;
        const px = Math.cos(angle) * r * 0.85;
        const py = Math.sin(angle) * r * 0.85;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case "estrela_7": {
      ctx.beginPath();
      for (let i = 0; i < 7; i++) {
        const angle = ((i * (360 * 3 / 7) - 90) * Math.PI) / 180;
        const px = Math.cos(angle) * r * 0.85;
        const py = Math.sin(angle) * r * 0.85;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case "sol": {
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "lua": {
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.65, -Math.PI * 0.45, Math.PI * 0.45, false);
      ctx.quadraticCurveTo(r * 0.15, 0, Math.cos(-Math.PI * 0.45) * r * 0.65, Math.sin(-Math.PI * 0.45) * r * 0.65);
      ctx.stroke();
      break;
    }
    case "espiral": {
      ctx.beginPath();
      for (let t = 0; t < Math.PI * 5; t += 0.15) {
        const rad = (t / (Math.PI * 5)) * r * 0.85;
        const px = Math.cos(t) * rad;
        const py = Math.sin(t) * rad;
        if (t === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

export function SigilStudioModal({
  isOpen,
  onClose,
  onInsertSigil,
}: SigilStudioModalProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>("ponto_riscado");
  const [title, setTitle] = useState("Ponto Riscado / Sigilo Consagrado");
  const [intention, setIntention] = useState("ABERTURA DE CAMINHOS E FORCA");
  const [selectedPlanet, setSelectedPlanet] = useState<string>("sun");
  const [showKameaGrid, setShowKameaGrid] = useState(true);

  // Ponto Riscado & Spare Drawing State
  const [pembaColor, setPembaColor] = useState("#F8FAFC");
  const [brushSize, setBrushSize] = useState(3.5);
  const [symmetry, setSymmetry] = useState<number>(1);
  const [showCircleBorder, setShowCircleBorder] = useState(true);
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);
  const [stampScale, setStampScale] = useState<number>(36);
  const [commands, setCommands] = useState<DrawCommand[]>([]);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[] | null>(null);
  const [saving, setSaving] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Austin Osman Spare reduction
  const spareReduced = useMemo(() => {
    const clean = intention
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z]/g, "");
    const noVowels = clean.replace(/[AEIOU]/g, "");
    const unique: string[] = [];
    for (const ch of noVowels) {
      if (!unique.includes(ch)) unique.push(ch);
    }
    return {
      original: clean,
      uniqueConsonants: unique.join(" · "),
      rawLetters: unique,
    };
  }, [intention]);

  // Kamea number path from intention
  const kameaSequence = useMemo(() => {
    const kamea = PLANETARY_KAMEAS[selectedPlanet] || PLANETARY_KAMEAS.sun;
    const maxNum = kamea.size * kamea.size;
    const clean = intention
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z]/g, "");

    const nums: number[] = [];
    for (const ch of clean) {
      // Aiq Beker / Gematria reduction mapped into 1..maxNum
      const code = ch.charCodeAt(0) - 64; // 1..26
      const mapped = ((code * 3 - 2) % maxNum) + 1;
      if (nums[nums.length - 1] !== mapped) {
        nums.push(mapped);
      }
    }
    return nums;
  }, [intention, selectedPlanet]);

  // Render Canvas whenever state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    // 1. Background Tábua Escura
    ctx.fillStyle = "#0B0F17";
    ctx.fillRect(0, 0, W, H);

    // 2. Círculo Sagrado / Tábua de Ponto Riscado
    if (showCircleBorder) {
      ctx.save();
      ctx.strokeStyle = "rgba(234, 179, 8, 0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, W * 0.44, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(cx, H * 0.06);
      ctx.lineTo(cx, H * 0.94);
      ctx.moveTo(W * 0.06, cy);
      ctx.lineTo(W * 0.94, cy);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Se estiver na aba Kamea, desenhar a grade e o vetor do sigilo
    if (activeTab === "kamea") {
      const kamea = PLANETARY_KAMEAS[selectedPlanet] || PLANETARY_KAMEAS.sun;
      const n = kamea.size;
      const pad = W * 0.14;
      const boardSize = W - pad * 2;
      const cell = boardSize / n;

      if (showKameaGrid) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.fillStyle = "rgba(255,255,255,0.28)";
        ctx.font = `bold ${Math.max(10, Math.floor(cell * 0.28))}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (let r = 0; r < n; r++) {
          for (let c = 0; c < n; c++) {
            const x = pad + c * cell;
            const y = pad + r * cell;
            ctx.strokeRect(x, y, cell, cell);
            ctx.fillText(String(kamea.grid[r][c]), x + cell / 2, y + cell / 2);
          }
        }
        ctx.restore();
      }

      // Encontrar coordenadas de cada número da sequência
      const coords: { x: number; y: number }[] = [];
      for (const num of kameaSequence) {
        for (let r = 0; r < n; r++) {
          for (let c = 0; c < n; c++) {
            if (kamea.grid[r][c] === num) {
              coords.push({
                x: pad + c * cell + cell / 2,
                y: pad + r * cell + cell / 2,
              });
            }
          }
        }
      }

      if (coords.length > 0) {
        ctx.save();
        ctx.strokeStyle = kamea.color;
        ctx.fillStyle = kamea.color;
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = kamea.color;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        coords.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();

        // Círculo inicial (Anel de partida Golden Dawn)
        const first = coords[0];
        ctx.beginPath();
        ctx.arc(first.x, first.y, 7, 0, Math.PI * 2);
        ctx.stroke();

        // Barra perpendicular final (Selamento)
        if (coords.length >= 2) {
          const last = coords[coords.length - 1];
          const prev = coords[coords.length - 2];
          const angle = Math.atan2(last.y - prev.y, last.x - prev.x) + Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(last.x + Math.cos(angle) * 9, last.y + Math.sin(angle) * 9);
          ctx.lineTo(last.x - Math.cos(angle) * 9, last.y - Math.sin(angle) * 9);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // 4. Desenhar comandos de Pemba / Carimbos (Ponto Riscado & Spare)
    const drawCommandList = [...commands];
    if (currentStroke && currentStroke.length > 0) {
      drawCommandList.push({
        type: "stroke",
        color: pembaColor,
        size: brushSize,
        points: currentStroke,
        symmetry,
      });
    }

    for (const cmd of drawCommandList) {
      if (cmd.type === "stamp" && cmd.stampId && cmd.x !== undefined && cmd.y !== undefined) {
        drawTraditionalStamp(ctx, cmd.stampId, cmd.x, cmd.y, cmd.size, cmd.color);
      } else if (cmd.type === "stroke" && cmd.points && cmd.points.length > 0) {
        const sym = cmd.symmetry || 1;
        ctx.save();
        ctx.strokeStyle = cmd.color;
        ctx.lineWidth = cmd.size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let s = 0; s < sym; s++) {
          const rot = (s * Math.PI * 2) / sym;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(rot);
          ctx.translate(-cx, -cy);

          ctx.beginPath();
          cmd.points.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
      }
    }
  }, [
    activeTab,
    selectedPlanet,
    showKameaGrid,
    kameaSequence,
    commands,
    currentStroke,
    pembaColor,
    brushSize,
    symmetry,
    showCircleBorder,
  ]);

  if (!isOpen) return null;

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getCanvasPoint(e);
    if (selectedStamp) {
      setCommands((prev) => [
        ...prev,
        {
          type: "stamp",
          stampId: selectedStamp,
          x: pt.x,
          y: pt.y,
          size: stampScale,
          color: pembaColor,
        },
      ]);
      return;
    }
    setCurrentStroke([pt]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentStroke) return;
    const pt = getCanvasPoint(e);
    setCurrentStroke((prev) => (prev ? [...prev, pt] : [pt]));
  };

  const handleMouseUp = () => {
    if (currentStroke && currentStroke.length > 0) {
      setCommands((prev) => [
        ...prev,
        {
          type: "stroke",
          color: pembaColor,
          size: brushSize,
          points: currentStroke,
          symmetry,
        },
      ]);
      setCurrentStroke(null);
    }
  };

  const handleUndo = () => {
    setCommands((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setCommands([]);
  };

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "ponto-sigilo"}.png`;
    a.click();
  };

  const handleSaveAndInsert = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSaving(true);
    try {
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );
      if (!blob) throw new Error("Falha ao exportar imagem da Tábua.");

      const file = new File([blob], `sigilo-${Date.now()}.png`, { type: "image/png" });
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        const mdImage = `![${title}](${data.url})`;
        const desc =
          activeTab === "kamea"
            ? `**Kamea:** ${PLANETARY_KAMEAS[selectedPlanet]?.name} · **Intenção:** *${intention}*`
            : activeTab === "spare"
            ? `**Monograma de Spare:** \`${spareReduced.uniqueConsonants}\` · **Declaração de Vontade:** *${intention}*`
            : `**Ponto Riscado / Pemba Consagrada:** *${title}*`;
        onInsertSigil(mdImage, title, desc);
        onClose();
      } else {
        alert(data.error || "Erro ao salvar imagem do sigilo.");
      }
    } catch (e: any) {
      alert(e.message || "Erro ao salvar Ponto Riscado / Sigilo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-medium-900 border border-medium-700 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-medium-750 bg-medium-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white">
                Oficina de Sigilos & Tábua de Ponto Riscado Digital
              </h2>
              <p className="text-xs text-medium-400 font-sans">
                Pemba Digital (Umbanda, Quimbanda & Jurema), Quadrados Mágicos Planetários (Kameas) e Monogramas de Spare
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-medium-400 hover:text-white hover:bg-medium-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas dos 3 Motores */}
        <div className="flex border-b border-medium-750 bg-medium-900 px-4 pt-2 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("ponto_riscado")}
            className={`px-4 py-2.5 text-xs font-mono font-bold rounded-t-lg border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "ponto_riscado"
                ? "border-emerald-400 text-emerald-300 bg-emerald-950/20"
                : "border-transparent text-medium-400 hover:text-white"
            }`}
          >
            <span>🥁</span>
            <span>1. Tábua de Ponto Riscado (Pemba Digital)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedStamp(null);
              setActiveTab("kamea");
            }}
            className={`px-4 py-2.5 text-xs font-mono font-bold rounded-t-lg border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "kamea"
                ? "border-amber-400 text-amber-300 bg-amber-950/20"
                : "border-transparent text-medium-400 hover:text-white"
            }`}
          >
            <span>🪐</span>
            <span>2. Kameas Planetários (Quadrados Mágicos)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedStamp(null);
              setActiveTab("spare");
            }}
            className={`px-4 py-2.5 text-xs font-mono font-bold rounded-t-lg border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "spare"
                ? "border-purple-400 text-purple-300 bg-purple-950/20"
                : "border-transparent text-medium-400 hover:text-white"
            }`}
          >
            <span>🜁</span>
            <span>3. Método de Austin Osman Spare</span>
          </button>
        </div>

        {/* Corpo Principal: Canvas à Esquerda + Controles à Direita */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Lado Esquerdo: Tábua / Canvas Interativo (6 Colunas) */}
          <div className="lg:col-span-6 flex flex-col items-center space-y-3">
            <div className="relative rounded-2xl overflow-hidden border-2 border-medium-700 shadow-2xl bg-[#0B0F17]">
              <canvas
                ref={canvasRef}
                width={480}
                height={480}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="w-full max-w-[440px] aspect-square cursor-crosshair block"
              />
            </div>

            {/* Barra de Ações do Canvas */}
            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
              <button
                type="button"
                onClick={handleUndo}
                disabled={commands.length === 0}
                className="px-3 py-1.5 rounded-lg bg-medium-800 hover:bg-medium-750 disabled:opacity-40 text-xs font-mono text-white border border-medium-700 flex items-center gap-1.5"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Desfazer Traço</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={commands.length === 0}
                className="px-3 py-1.5 rounded-lg bg-medium-800 hover:bg-red-950/40 disabled:opacity-40 text-xs font-mono text-red-300 border border-medium-700 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Tábua</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCircleBorder((v) => !v)}
                className="px-3 py-1.5 rounded-lg bg-medium-800 hover:bg-medium-750 text-xs font-mono text-medium-200 border border-medium-700 flex items-center gap-1.5"
              >
                {showCircleBorder ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showCircleBorder ? "Ocultar Círculo" : "Mostrar Círculo"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPng}
                className="px-3 py-1.5 rounded-lg bg-medium-800 hover:bg-medium-750 text-xs font-mono text-amber-300 border border-amber-500/30 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar PNG</span>
              </button>
            </div>
          </div>

          {/* Lado Direito: Ferramentas de Acordo com a Aba (6 Colunas) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Nome / Título do Ponto ou Sigilo */}
            <div className="bg-medium-850 p-3.5 rounded-xl border border-medium-750 space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-medium-400 block">
                Nome / Identificação do Ponto Riscado ou Sigilo
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Ponto Riscado de Caboclo Sete Flechas / Sigilo Solar..."
                className="w-full bg-medium-900 border border-medium-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* ABA 1: PONTO RISCADO (PEMBA DIGITAL) */}
            {activeTab === "ponto_riscado" && (
              <div className="space-y-4">
                {/* Cores de Pemba */}
                <div className="bg-medium-850 p-3.5 rounded-xl border border-medium-750 space-y-2.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                    1. Escolha a Cor da Pemba Consagrada
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PEMBA_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setPembaColor(c.hex)}
                        className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono flex items-center gap-2 transition-all ${
                          pembaColor === c.hex
                            ? "border-white bg-medium-800 text-white font-bold shadow-sm"
                            : "border-medium-700 bg-medium-900 text-medium-300 hover:border-medium-500"
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/30"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.label.split(" (")[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Carimbos de Símbolos de Fundamento */}
                <div className="bg-medium-850 p-3.5 rounded-xl border border-medium-750 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 block">
                      2. Símbolos de Fundamento (Clique no símbolo e depois na Tábua)
                    </span>
                    {selectedStamp && (
                      <button
                        type="button"
                        onClick={() => setSelectedStamp(null)}
                        className="text-[10px] font-mono text-emerald-300 underline"
                      >
                        Voltar para Traço Livre
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {PONTO_STAMPS.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() =>
                          setSelectedStamp((prev) => (prev === st.id ? null : st.id))
                        }
                        className={`p-2 rounded-lg border text-left text-[11px] font-mono flex items-center gap-2 transition-all ${
                          selectedStamp === st.id
                            ? "border-amber-400 bg-amber-500/15 text-white font-bold"
                            : "border-medium-750 bg-medium-900 text-medium-300 hover:border-medium-600"
                        }`}
                      >
                        <span className="text-sm shrink-0">{st.icon}</span>
                        <span className="truncate">{st.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Tamanho do Carimbo / Simetria Radial */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-medium-750 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-medium-400 block mb-1">
                        Tamanho do Símbolo ({stampScale}px):
                      </span>
                      <input
                        type="range"
                        min={18}
                        max={95}
                        value={stampScale}
                        onChange={(e) => setStampScale(Number(e.target.value))}
                        className="w-full accent-amber-400"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-medium-400 block mb-1">
                        Simetria do Traço Livre:
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 4].map((sym) => (
                          <button
                            key={sym}
                            type="button"
                            onClick={() => {
                              setSelectedStamp(null);
                              setSymmetry(sym);
                            }}
                            className={`flex-1 py-1 rounded border text-[11px] ${
                              symmetry === sym && !selectedStamp
                                ? "bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold"
                                : "bg-medium-900 border-medium-700 text-medium-400"
                            }`}
                          >
                            {sym}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 2: KAMEAS PLANETÁRIOS */}
            {activeTab === "kamea" && (
              <div className="space-y-4">
                <div className="bg-medium-850 p-3.5 rounded-xl border border-medium-750 space-y-2.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 block">
                    1. Escolha o Quadrado Mágico Planetário (Kamea)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(PLANETARY_KAMEAS).map(([key, k]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedPlanet(key)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          selectedPlanet === key
                            ? "border-amber-400 bg-amber-500/15 text-white"
                            : "border-medium-750 bg-medium-900 text-medium-300 hover:border-medium-600"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono font-bold">
                          <span>
                            {k.symbol} {k.name}
                          </span>
                          <span className="text-[10px] text-amber-300">Soma {k.sum}</span>
                        </div>
                        <span className="text-[10px] text-medium-400 block mt-0.5">
                          {k.sephirah} · {k.orixa}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-medium-850 p-3.5 rounded-xl border border-medium-750 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-medium-400">
                      2. Digite a Intenção, Nome Divino ou Espírito
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowKameaGrid((v) => !v)}
                      className="text-[10px] font-mono text-amber-300 hover:underline"
                    >
                      {showKameaGrid ? "Ocultar Grade Numérica" : "Mostrar Grade Numérica"}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder="Ex: SORATH / OXOSSI / PROSPERIDADE..."
                    className="w-full bg-medium-900 border border-medium-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[11px] font-mono text-medium-400">
                    Sequência Geomântica no Kamea:{" "}
                    <strong className="text-amber-300">{kameaSequence.join(" → ") || "—"}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* ABA 3: AUSTIN OSMAN SPARE */}
            {activeTab === "spare" && (
              <div className="space-y-4">
                <div className="bg-medium-850 p-4 rounded-xl border border-purple-500/30 space-y-3">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300 block">
                    1. Declaração de Vontade (Purificação de Vogais & Duplicatas)
                  </label>
                  <input
                    type="text"
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder="Ex: É MINHA VONTADE OBTER..."
                    className="w-full bg-medium-900 border border-medium-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-400"
                  />

                  <div className="p-3 rounded-lg bg-medium-900 border border-medium-750 space-y-1">
                    <span className="text-[10px] font-mono text-medium-400 uppercase block">
                      Consoantes Únicas Purificadas (Matéria-Prima do Monograma):
                    </span>
                    <p className="text-base font-mono font-bold text-purple-300 tracking-widest">
                      {spareReduced.uniqueConsonants || "—"}
                    </p>
                  </div>

                  <p className="text-xs text-medium-400 leading-relaxed">
                    Use o mouse na Tábua ao lado para fundir as letras{" "}
                    <strong className="text-white">{spareReduced.uniqueConsonants}</strong> em um único glifo abstrato.
                  </p>
                </div>
              </div>
            )}

            {/* Botão Principal: Inserir na Nota */}
            <button
              type="button"
              onClick={handleSaveAndInsert}
              disabled={saving}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>
                {saving
                  ? "Consagrando e Salvando Imagem..."
                  : "Inserir Ponto Riscado / Sigilo na Nota"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
