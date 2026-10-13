"use client";

import React, { useState, useMemo } from "react";
import { MagickEntry, normalizeCategory } from "@/lib/types";
import {
  Sparkles,
  BookOpen,
  Plus,
  ArrowRight,
  Info,
  X,
  ExternalLink,
  Layers,
  Compass,
  Eye,
  EyeOff,
} from "lucide-react";
import { EstrelaDeThelema } from "@/components/ThelemicIcons";

export interface SephirahData {
  id: number;
  name: string;
  hebrew: string;
  transliteration: string;
  english: string;
  x: number; // percentage (0 to 100)
  y: number; // percentage (0 to 148 viewBox scale)
  color: string;
  textColor: string;
  highlightColor: string;
  shadeColor: string;
  rimColor: string;
  planet: string;
  element: string;
  archangel: string;
  godName: string;
  magicalImage: string;
  spiritualExperience: string;
  vice: string;
  virtue: string;
}

// 10 Sephiroth com posições verticais ampliadas (maior respiro entre esferas e caminho Yesod-Malkuth expandido)
export const SEPHIROT: SephirahData[] = [
  {
    id: 1,
    name: "Kether",
    hebrew: "כתר",
    transliteration: "Kether",
    english: "A Coroa",
    x: 50,
    y: 8,
    color: "#FFFFFF",
    textColor: "#0F172A",
    highlightColor: "#FFFFFF",
    shadeColor: "#CBD5E1",
    rimColor: "#94A3B8",
    planet: "Primum Mobile (Primeiro Movimento)",
    element: "Luz Ilimitada (LVX / Ain Soph Aur)",
    archangel: "Metatron",
    godName: "Eheieh (Eu Sou o Que Sou)",
    magicalImage: "Um rei coroado visto de perfil",
    spiritualExperience: "União com a Divindade (Kether)",
    vice: "Nenhum",
    virtue: "Realização plena do Grande Trabalho",
  },
  {
    id: 2,
    name: "Chokmah",
    hebrew: "חכמה",
    transliteration: "Chokmah",
    english: "A Sabedoria",
    x: 83,
    y: 25,
    color: "#94A3B8",
    textColor: "#0F172A",
    highlightColor: "#F8FAFC",
    shadeColor: "#64748B",
    rimColor: "#334155",
    planet: "O Zodíaco (Mazloth)",
    element: "Fogo Primordial / Vontade Dinâmica",
    archangel: "Raziel",
    godName: "Yah (Tetragrammaton)",
    magicalImage: "Uma figura barbada de um ancião ereto",
    spiritualExperience: "A Visão de Deus face a face",
    vice: "Nenhum",
    virtue: "Devoção / Vontade Pura",
  },
  {
    id: 3,
    name: "Binah",
    hebrew: "בינה",
    transliteration: "Binah",
    english: "O Entendimento",
    x: 17,
    y: 25,
    color: "#1E293B",
    textColor: "#F8FAFC",
    highlightColor: "#64748B",
    shadeColor: "#0F172A",
    rimColor: "#020617",
    planet: "Saturno (Shabbathai)",
    element: "Água Primordial / Grande Mãe Babalon",
    archangel: "Tzaphkiel",
    godName: "YHVH Elohim",
    magicalImage: "Uma matrona com o rosto coberto por um véu",
    spiritualExperience: "A Visão do Pesar e a Cidade das Pirâmides",
    vice: "Avareza",
    virtue: "Silêncio / Severidade Contida",
  },
  {
    id: 4,
    name: "Chesed",
    hebrew: "חסד",
    transliteration: "Chesed",
    english: "A Misericórdia / Amor",
    x: 83,
    y: 53,
    color: "#2563EB",
    textColor: "#FFFFFF",
    highlightColor: "#93C5FD",
    shadeColor: "#1D4ED8",
    rimColor: "#172554",
    planet: "Júpiter (Tzedek)",
    element: "Água / Coesão Formativa",
    archangel: "Tzadkiel",
    godName: "El (O Poderoso)",
    magicalImage: "Um rei benevolente coroado em seu trono",
    spiritualExperience: "A Visão do Amor Divino e da Majestade",
    vice: "Bigotismo / Hipocrisia",
    virtue: "Obediência à Vontade / Generosidade",
  },
  {
    id: 5,
    name: "Geburah",
    hebrew: "גבורה",
    transliteration: "Geburah",
    english: "A Severidade / Força",
    x: 17,
    y: 53,
    color: "#DC2626",
    textColor: "#FFFFFF",
    highlightColor: "#FCA5A5",
    shadeColor: "#B91C1C",
    rimColor: "#450A0A",
    planet: "Marte (Madim)",
    element: "Fogo / Purificação pelo Raio",
    archangel: "Kamael",
    godName: "Elohim Gibor",
    magicalImage: "Um poderoso guerreiro armado em sua carruagem",
    spiritualExperience: "A Visão do Poder e da Destruição Necessária",
    vice: "Crueldade",
    virtue: "Coragem / Energia",
  },
  {
    id: 6,
    name: "Tiphareth",
    hebrew: "תפארת",
    transliteration: "Tiphareth",
    english: "A Beleza / Harmonia",
    x: 50,
    y: 69,
    color: "#EAB308",
    textColor: "#0F172A",
    highlightColor: "#FEF08A",
    shadeColor: "#D97706",
    rimColor: "#78350F",
    planet: "Sol (Shemesh)",
    element: "Ar / Consciência Solar de Hadit",
    archangel: "Raphael",
    godName: "YHVH Eloah va-Daath",
    magicalImage: "Um rei majestoso, uma criança ou um deus sacrificado",
    spiritualExperience: "A Visão da Harmonia das Coisas e K&C do Sagrado Anjo Guardião",
    vice: "Orgulho",
    virtue: "Devoção ao Grande Trabalho",
  },
  {
    id: 7,
    name: "Netzach",
    hebrew: "נצח",
    transliteration: "Netzach",
    english: "A Vitória",
    x: 83,
    y: 95,
    color: "#16A34A",
    textColor: "#FFFFFF",
    highlightColor: "#86EFAC",
    shadeColor: "#15803D",
    rimColor: "#052E16",
    planet: "Vênus (Nogah)",
    element: "Fogo do Desejo / Êxtase Emocional",
    archangel: "Haniel",
    godName: "YHVH Tzabaoth (Senhor dos Exércitos)",
    magicalImage: "Uma mulher nua de suprema beleza",
    spiritualExperience: "A Visão da Beleza Triunfante",
    vice: "Imodéstia / Luxúria Desenfreada",
    virtue: "Generosidade e Paixão Nobre",
  },
  {
    id: 8,
    name: "Hod",
    hebrew: "הוד",
    transliteration: "Hod",
    english: "O Esplendor",
    x: 17,
    y: 95,
    color: "#EA580C",
    textColor: "#FFFFFF",
    highlightColor: "#FDBA74",
    shadeColor: "#C2410C",
    rimColor: "#7C2D12",
    planet: "Mercúrio (Kokab)",
    element: "Água Intelectual / Thoth & Hermes",
    archangel: "Michael",
    godName: "Elohim Tzabaoth",
    magicalImage: "Um hermafrodita com vestes resplandecentes",
    spiritualExperience: "A Visão do Esplendor e da Magia Teúrgica",
    vice: "Falsidade / Desonestidade",
    virtue: "Verdade / Intelecto Honesto",
  },
  {
    id: 9,
    name: "Yesod",
    hebrew: "יסוד",
    transliteration: "Yesod",
    english: "O Fundamento",
    x: 50,
    y: 111,
    color: "#9333EA",
    textColor: "#FFFFFF",
    highlightColor: "#D8B4FE",
    shadeColor: "#7E22CE",
    rimColor: "#3B0764",
    planet: "Lua (Levanah)",
    element: "Ar / O Plano Astral e Subconsciente",
    archangel: "Gabriel",
    godName: "Shaddai El Chai",
    magicalImage: "Um homem belo e forte com vestes prateadas",
    spiritualExperience: "A Visão da Maquinaria Cósmica e Sonhos Astrais",
    vice: "Preguiça",
    virtue: "Independência",
  },
  {
    id: 10,
    name: "Malkuth",
    hebrew: "מלכות",
    transliteration: "Malkuth",
    english: "O Reino",
    x: 50,
    y: 135,
    color: "#78350F",
    textColor: "#FFFFFF",
    highlightColor: "#D97706",
    shadeColor: "#582307",
    rimColor: "#260E02",
    planet: "Terra (Olam ha-Yesodoth)",
    element: "Quatro Elementos / Plano Físico Denso",
    archangel: "Sandalphon",
    godName: "Adonai ha-Aretz",
    magicalImage: "Uma jovem rainha coroada em seu trono terreno",
    spiritualExperience: "A Visão do Sagrado Anjo Guardião na Terra",
    vice: "Inércia",
    virtue: "Discriminação",
  },
];

export interface TreePathData {
  pathNumber: number; // 11 a 32 (Liber 777)
  fromId: number;
  toId: number;
  hebrewLetter: string;
  hebrewName: string;
  tarotNumber: string; // "0", "I", "II", ..., "XXI"
  tarotName: string;
  astrological: string;
  label: string;
  tOffset?: number; // Posição calculada (0 a 1) para evitar sobreposição em cruzamentos
}

// Os 22 Caminhos canônicos da Árvore da Vida com os Arcanos Maiores e Letras Hebraicas de Liber 777
export const TREE_PATHS: TreePathData[] = [
  {
    pathNumber: 11,
    fromId: 1,
    toId: 2,
    hebrewLetter: "א",
    hebrewName: "Aleph",
    tarotNumber: "0",
    tarotName: "O Louco",
    astrological: "Ar (Elemento Ar)",
    label: "11. Aleph · 0 · O Louco",
    tOffset: 0.5,
  },
  {
    pathNumber: 12,
    fromId: 1,
    toId: 3,
    hebrewLetter: "ב",
    hebrewName: "Beth",
    tarotNumber: "I",
    tarotName: "O Mago",
    astrological: "Mercúrio (☿)",
    label: "12. Beth · I · O Mago",
    tOffset: 0.5,
  },
  {
    pathNumber: 13,
    fromId: 1,
    toId: 6,
    hebrewLetter: "ג",
    hebrewName: "Gimel",
    tarotNumber: "II",
    tarotName: "A Sacerdotisa",
    astrological: "Lua (☽)",
    label: "13. Gimel · II · A Sacerdotisa",
    tOffset: 0.63, // Posicionado abaixo de Da'ath e acima do cruzamento Chesed-Geburah
  },
  {
    pathNumber: 14,
    fromId: 2,
    toId: 3,
    hebrewLetter: "ד",
    hebrewName: "Daleth",
    tarotNumber: "III",
    tarotName: "A Imperatriz",
    astrological: "Vênus (♀)",
    label: "14. Daleth · III · A Imperatriz",
    tOffset: 0.5,
  },
  {
    pathNumber: 15,
    fromId: 2,
    toId: 6,
    hebrewLetter: "ה",
    hebrewName: "Heh",
    tarotNumber: "IV",
    tarotName: "O Imperador",
    astrological: "Áries (♈)",
    label: "15. Heh · IV · O Imperador",
    tOffset: 0.48,
  },
  {
    pathNumber: 16,
    fromId: 2,
    toId: 4,
    hebrewLetter: "ו",
    hebrewName: "Vau",
    tarotNumber: "V",
    tarotName: "O Hierofante",
    astrological: "Touro (♉)",
    label: "16. Vau · V · O Hierofante",
    tOffset: 0.5,
  },
  {
    pathNumber: 17,
    fromId: 3,
    toId: 6,
    hebrewLetter: "ז",
    hebrewName: "Zayin",
    tarotNumber: "VI",
    tarotName: "Os Enamorados",
    astrological: "Gêmeos (♊)",
    label: "17. Zayin · VI · Os Enamorados",
    tOffset: 0.48,
  },
  {
    pathNumber: 18,
    fromId: 3,
    toId: 5,
    hebrewLetter: "ח",
    hebrewName: "Cheth",
    tarotNumber: "VII",
    tarotName: "A Carruagem",
    astrological: "Câncer (♋)",
    label: "18. Cheth · VII · A Carruagem",
    tOffset: 0.5,
  },
  {
    pathNumber: 19,
    fromId: 4,
    toId: 5,
    hebrewLetter: "ט",
    hebrewName: "Teth",
    tarotNumber: "VIII",
    tarotName: "A Força / Ajuste",
    astrological: "Leão (♌)",
    label: "19. Teth · VIII · A Força / Ajuste",
    tOffset: 0.5,
  },
  {
    pathNumber: 20,
    fromId: 4,
    toId: 6,
    hebrewLetter: "י",
    hebrewName: "Yod",
    tarotNumber: "IX",
    tarotName: "O Eremita",
    astrological: "Virgem (♍)",
    label: "20. Yod · IX · O Eremita",
    tOffset: 0.5,
  },
  {
    pathNumber: 21,
    fromId: 4,
    toId: 7,
    hebrewLetter: "כ",
    hebrewName: "Kaph",
    tarotNumber: "X",
    tarotName: "A Roda da Fortuna",
    astrological: "Júpiter (♃)",
    label: "21. Kaph · X · A Roda da Fortuna",
    tOffset: 0.5,
  },
  {
    pathNumber: 22,
    fromId: 5,
    toId: 6,
    hebrewLetter: "ל",
    hebrewName: "Lamed",
    tarotNumber: "XI",
    tarotName: "A Justiça",
    astrological: "Libra (♎)",
    label: "22. Lamed · XI · A Justiça",
    tOffset: 0.5,
  },
  {
    pathNumber: 23,
    fromId: 5,
    toId: 8,
    hebrewLetter: "מ",
    hebrewName: "Mem",
    tarotNumber: "XII",
    tarotName: "O Enforcado",
    astrological: "Água (Elemento Água)",
    label: "23. Mem · XII · O Enforcado",
    tOffset: 0.5,
  },
  {
    pathNumber: 24,
    fromId: 6,
    toId: 7,
    hebrewLetter: "נ",
    hebrewName: "Nun",
    tarotNumber: "XIII",
    tarotName: "A Morte",
    astrological: "Escorpião (♏)",
    label: "24. Nun · XIII · A Morte",
    tOffset: 0.52,
  },
  {
    pathNumber: 25,
    fromId: 6,
    toId: 9,
    hebrewLetter: "ס",
    hebrewName: "Samekh",
    tarotNumber: "XIV",
    tarotName: "A Arte (Temperança)",
    astrological: "Sagitário (♐)",
    label: "25. Samekh · XIV · A Arte",
    tOffset: 0.32, // Acima da horizontal Netzach-Hod (A Torre), sem qualquer sobreposição!
  },
  {
    pathNumber: 26,
    fromId: 6,
    toId: 8,
    hebrewLetter: "ע",
    hebrewName: "Ayin",
    tarotNumber: "XV",
    tarotName: "O Diabo",
    astrological: "Capricórnio (♑)",
    label: "26. Ayin · XV · O Diabo",
    tOffset: 0.52,
  },
  {
    pathNumber: 27,
    fromId: 7,
    toId: 8,
    hebrewLetter: "פ",
    hebrewName: "Peh",
    tarotNumber: "XVI",
    tarotName: "A Torre",
    astrological: "Marte (♂)",
    label: "27. Peh · XVI · A Torre",
    tOffset: 0.5,
  },
  {
    pathNumber: 28,
    fromId: 7,
    toId: 9,
    hebrewLetter: "צ",
    hebrewName: "Tzaddi",
    tarotNumber: "XVII",
    tarotName: "A Estrela",
    astrological: "Aquário (♒)",
    label: "28. Tzaddi · XVII · A Estrela",
    tOffset: 0.5,
  },
  {
    pathNumber: 29,
    fromId: 7,
    toId: 10,
    hebrewLetter: "ק",
    hebrewName: "Qoph",
    tarotNumber: "XVIII",
    tarotName: "A Lua",
    astrological: "Peixes (♓)",
    label: "29. Qoph · XVIII · A Lua",
    tOffset: 0.5,
  },
  {
    pathNumber: 30,
    fromId: 8,
    toId: 9,
    hebrewLetter: "ר",
    hebrewName: "Resh",
    tarotNumber: "XIX",
    tarotName: "O Sol",
    astrological: "Sol (☉)",
    label: "30. Resh · XIX · O Sol",
    tOffset: 0.5,
  },
  {
    pathNumber: 31,
    fromId: 8,
    toId: 10,
    hebrewLetter: "ש",
    hebrewName: "Shin",
    tarotNumber: "XX",
    tarotName: "O Aeon (Julgamento)",
    astrological: "Fogo / Espírito (Elemento Fogo)",
    label: "31. Shin · XX · O Aeon",
    tOffset: 0.5,
  },
  {
    pathNumber: 32,
    fromId: 9,
    toId: 10,
    hebrewLetter: "ת",
    hebrewName: "Tau",
    tarotNumber: "XXI",
    tarotName: "O Universo",
    astrological: "Saturno / Terra (♄)",
    label: "32. Tau · XXI · O Universo",
    tOffset: 0.5, // Totalmente espaçado entre Yesod e Malkuth
  },
];

interface TreeOfLifeViewProps {
  entries: MagickEntry[];
  onSelectEntry: (entry: MagickEntry) => void;
  onNewNoteUnderSephirah: (sephirahName: string) => void;
}

export function TreeOfLifeView({
  entries,
  onSelectEntry,
  onNewNoteUnderSephirah,
}: TreeOfLifeViewProps) {
  const [selectedSephirahId, setSelectedSephirahId] = useState<number>(6); // Default: Tiphareth
  const [hoveredSephirahId, setHoveredSephirahId] = useState<number | null>(null);
  const [selectedPathNumber, setSelectedPathNumber] = useState<number | null>(null);
  const [hoveredPathNumber, setHoveredPathNumber] = useState<number | null>(null);
  const [showTarotBadges, setShowTarotBadges] = useState<boolean>(true);

  // Mapeia notas para cada Sephirah
  const notesBySephirah = useMemo(() => {
    const map = new Map<number, MagickEntry[]>();
    SEPHIROT.forEach((s) => map.set(s.id, []));

    entries.forEach((entry) => {
      const text = `${entry.title} ${entry.content} ${entry.type}`.toLowerCase();
      const influences = entry.influences?.map((i) => `${i.category} ${i.name}`.toLowerCase()).join(" ") || "";
      const allText = `${text} ${influences}`;

      SEPHIROT.forEach((s) => {
        const sName = s.name.toLowerCase();
        const sEng = s.english.toLowerCase();
        const planet = s.planet.toLowerCase().split(" ")[0];

        if (
          allText.includes(sName) ||
          allText.includes(sEng) ||
          influences.includes(sName) ||
          (planet.length > 3 && allText.includes(planet))
        ) {
          map.get(s.id)?.push(entry);
        }
      });
    });

    return map;
  }, [entries]);

  const selectedSephirah = SEPHIROT.find((s) => s.id === selectedSephirahId) || SEPHIROT[5];
  const sephirahNotes = notesBySephirah.get(selectedSephirah.id) || [];

  const selectedPath = useMemo(() => {
    if (!selectedPathNumber) return null;
    return TREE_PATHS.find((p) => p.pathNumber === selectedPathNumber) || null;
  }, [selectedPathNumber]);

  // Caminhos conectados à Sephirah selecionada
  const connectedPaths = useMemo(() => {
    return TREE_PATHS.filter(
      (path) => path.fromId === selectedSephirah.id || path.toId === selectedSephirah.id
    ).map((path) => {
      const otherId = path.fromId === selectedSephirah.id ? path.toId : path.fromId;
      const otherSephirah = SEPHIROT.find((s) => s.id === otherId)!;
      return {
        path,
        target: otherSephirah,
      };
    });
  }, [selectedSephirah]);

  return (
    <div className="flex-1 h-full bg-medium-900 flex flex-col md:flex-row overflow-hidden">
      {/* 1. Canvas SVG da Geometria Sagrada da Árvore da Vida */}
      <div className="flex-1 h-full relative flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto select-none">
        {/* Cabeçalho do Canvas */}
        <div className="absolute top-4 left-6 z-10 flex flex-wrap items-center justify-between gap-3 right-6">
          <div>
            <div className="flex items-center gap-2">
              <EstrelaDeThelema className="w-5 h-5 text-medium-100" />
              <h2 className="text-sm font-sans font-bold text-medium-100 uppercase tracking-wider">
                Árvore da Vida Cabalística (Otz Chiim · Liber 777)
              </h2>
            </div>
            <p className="text-[11px] font-mono text-medium-400 mt-0.5">
              10 Sephiroth volumétricas em 3D e 22 Caminhos correlacionados com os Arcanos Maiores
            </p>
          </div>

          {/* Botão de Alternância dos Arcanos Maiores nos Caminhos */}
          <button
            type="button"
            onClick={() => setShowTarotBadges(!showTarotBadges)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors shadow-sm ${
              showTarotBadges
                ? "bg-amber-500/15 border-amber-500/40 text-amber-200"
                : "bg-medium-850 border-medium-700 text-medium-400 hover:text-white"
            }`}
            title="Alternar exibição dos Arcanos Maiores nos 22 caminhos"
          >
            {showTarotBadges ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Arcanos nos Caminhos ({showTarotBadges ? "Visíveis" : "Ocultos"})</span>
          </button>
        </div>

        {/* SVG Container com viewBox amplo (100x148) para respiro vertical generoso */}
        <div className="w-full max-w-lg aspect-[100/148] relative my-auto mt-16 mb-6 drop-shadow-2xl">
          <svg
            viewBox="0 0 100 148"
            className="w-full h-full overflow-visible"
          >
            <defs>
              <style>{`
                @keyframes sephirahIntenseGlow {
                  0% { opacity: 0.6; stroke-width: 1.4px; }
                  100% { opacity: 1; stroke-width: 2.4px; }
                }
                @keyframes sephirahPulseWave {
                  0% { r: 6.8px; opacity: 0.95; stroke-width: 1.6px; }
                  70% { r: 10.8px; opacity: 0.2; stroke-width: 0.8px; }
                  100% { r: 11.6px; opacity: 0; stroke-width: 0px; }
                }
                @keyframes pathEnergyFlow {
                  0% { stroke-dashoffset: 24; }
                  100% { stroke-dashoffset: 0; }
                }
                @keyframes tarotBadgePulse {
                  0% { transform: scale(1); }
                  50% { transform: scale(1.12); }
                  100% { transform: scale(1); }
                }
              `}</style>

              {/* Filtro de Sombra 3D Volumétrica (Curva para fora da tela) */}
              <filter id="sphereDepthShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2.2" stdDeviation="1.6" floodColor="#000000" floodOpacity="0.55" />
                <feDropShadow dx="0" dy="4.0" stdDeviation="3.2" floodColor="#000000" floodOpacity="0.30" />
              </filter>

              <filter id="badgeShadow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="1.0" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.6" />
              </filter>

              {/* Reflexo Especular da Lente Superior (Specular Glaze) */}
              <linearGradient id="specularGlaze" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.85} />
                <stop offset="60%" stopColor="#FFFFFF" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
              </linearGradient>

              {/* Anel Chanfrado Externo 3D (Bevel Ring) */}
              <linearGradient id="bevelRing" x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.7} />
                <stop offset="40%" stopColor="#94A3B8" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#0F172A" stopOpacity={0.9} />
              </linearGradient>

              {/* Gradientes Radiais 3D Específicos para cada Sephirah (Curvatura Esférica Convexa) */}
              {SEPHIROT.map((s) => (
                <radialGradient
                  key={`sphere-grad-${s.id}`}
                  id={`sphere-3d-${s.id}`}
                  cx="32%"
                  cy="28%"
                  r="68%"
                  fx="26%"
                  fy="22%"
                >
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity={s.id === 1 ? 1 : 0.88} />
                  <stop offset="22%" stopColor={s.highlightColor} stopOpacity={0.95} />
                  <stop offset="55%" stopColor={s.color} stopOpacity={1} />
                  <stop offset="85%" stopColor={s.shadeColor} stopOpacity={1} />
                  <stop offset="100%" stopColor={s.rimColor} stopOpacity={1} />
                </radialGradient>
              ))}

              {/* Gradientes Dinâmicos para os 22 Caminhos Conectados */}
              {TREE_PATHS.map((path, idx) => {
                const sFrom = SEPHIROT.find((s) => s.id === path.fromId)!;
                const sTo = SEPHIROT.find((s) => s.id === path.toId)!;
                const isFromSelected = sFrom.id === selectedSephirahId;
                const isToSelected = sTo.id === selectedSephirahId;

                if (!isFromSelected && !isToSelected) return null;

                const origin = isFromSelected ? sFrom : sTo;
                const target = isFromSelected ? sTo : sFrom;

                return (
                  <linearGradient
                    key={`grad-path-${idx}-${selectedSephirahId}`}
                    id={`grad-connected-${path.pathNumber}`}
                    gradientUnits="userSpaceOnUse"
                    x1={origin.x}
                    y1={origin.y}
                    x2={target.x}
                    y2={target.y}
                  >
                    <stop offset="0%" stopColor={origin.color} stopOpacity={1} />
                    <stop offset="30%" stopColor={origin.color} stopOpacity={0.95} />
                    <stop offset="70%" stopColor={target.color} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={target.color} stopOpacity={1} />
                  </linearGradient>
                );
              })}
            </defs>

            {/* 1. Os 22 Caminhos Sagrados */}
            {TREE_PATHS.map((path) => {
              const sFrom = SEPHIROT.find((s) => s.id === path.fromId)!;
              const sTo = SEPHIROT.find((s) => s.id === path.toId)!;
              const isConnected =
                path.fromId === selectedSephirahId || path.toId === selectedSephirahId;
              const isPathSelected = path.pathNumber === selectedPathNumber;
              const isPathHovered = path.pathNumber === hoveredPathNumber;

              // Ponto do Badge ao longo do caminho
              const t = path.tOffset ?? 0.5;
              const badgeX = sFrom.x + (sTo.x - sFrom.x) * t;
              const badgeY = sFrom.y + (sTo.y - sFrom.y) * t;

              return (
                <g
                  key={`path-group-${path.pathNumber}`}
                  className="cursor-pointer"
                  onClick={() => setSelectedPathNumber(path.pathNumber)}
                  onMouseEnter={() => setHoveredPathNumber(path.pathNumber)}
                  onMouseLeave={() => setHoveredPathNumber(null)}
                >
                  <title>{`${path.label} (${path.astrological})`}</title>

                  {/* Caminho Conectado à Sephirah Selecionada: Gradiente Vibrante com Fusão */}
                  {isConnected ? (
                    <>
                      {/* Aura luminosa de fundo */}
                      <line
                        x1={sFrom.x}
                        y1={sFrom.y}
                        x2={sTo.x}
                        y2={sTo.y}
                        stroke={`url(#grad-connected-${path.pathNumber})`}
                        strokeWidth={3.6}
                        strokeLinecap="round"
                        opacity={isPathHovered || isPathSelected ? 0.75 : 0.45}
                      />

                      {/* Linha principal com o degrade da Sephirah */}
                      <line
                        x1={sFrom.x}
                        y1={sFrom.y}
                        x2={sTo.x}
                        y2={sTo.y}
                        stroke={`url(#grad-connected-${path.pathNumber})`}
                        strokeWidth={isPathSelected ? 2.4 : 1.8}
                        strokeLinecap="round"
                      />

                      {/* Pulso de energia sutil */}
                      <line
                        x1={sFrom.x}
                        y1={sFrom.y}
                        x2={sTo.x}
                        y2={sTo.y}
                        stroke="#FFFFFF"
                        strokeWidth={0.8}
                        strokeLinecap="round"
                        strokeDasharray="2 6"
                        opacity={0.7}
                        style={{
                          animation: "pathEnergyFlow 1.6s linear infinite",
                        }}
                      />
                    </>
                  ) : (
                    <>
                      {/* Caminho Normal: Linhas Claras e Visíveis */}
                      <line
                        x1={sFrom.x}
                        y1={sFrom.y}
                        x2={sTo.x}
                        y2={sTo.y}
                        className="stroke-medium-750 dark:stroke-medium-800"
                        strokeWidth={isPathHovered || isPathSelected ? 2.2 : 1.6}
                        strokeLinecap="round"
                      />
                      <line
                        x1={sFrom.x}
                        y1={sFrom.y}
                        x2={sTo.x}
                        y2={sTo.y}
                        stroke={isPathSelected ? "#EAB308" : isPathHovered ? "#F8FAFC" : "rgb(var(--color-medium-400))"}
                        opacity={isPathSelected ? 1 : isPathHovered ? 0.95 : 0.75}
                        strokeWidth={isPathSelected ? 1.6 : 1.0}
                        strokeLinecap="round"
                        className="transition-all duration-200"
                      />
                    </>
                  )}

                  {/* 2. Badge dos Arcanos Maiores ao longo do Caminho */}
                  {showTarotBadges && (
                    <g
                      transform={`translate(${badgeX}, ${badgeY})`}
                      className="transition-transform duration-200"
                      style={{
                        transform: isPathHovered || isPathSelected ? `translate(${badgeX}px, ${badgeY}px) scale(1.22)` : undefined,
                        transformOrigin: `${badgeX}px ${badgeY}px`,
                      }}
                    >
                      {/* Sombra do Badge */}
                      <circle
                        cx={0}
                        cy={0}
                        r={2.4}
                        fill="#0A0A0C"
                        filter="url(#badgeShadow)"
                      />

                      {/* Borda / Aro do Arcano */}
                      <circle
                        cx={0}
                        cy={0}
                        r={2.3}
                        fill="#18181B"
                        stroke={
                          isPathSelected
                            ? "#F59E0B"
                            : isPathHovered
                            ? "#FFFFFF"
                            : isConnected
                            ? "#E2E8F0"
                            : "#71717A"
                        }
                        strokeWidth={isPathSelected ? 0.65 : isPathHovered ? 0.55 : 0.4}
                      />

                      {/* Letra Hebraica sutil em segundo plano */}
                      <text
                        x={0}
                        y={0.2}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={isPathSelected ? "#F59E0B" : "#A1A1AA"}
                        fillOpacity={0.22}
                        className="text-[2.2px] font-serif select-none pointer-events-none"
                      >
                        {path.hebrewLetter}
                      </text>

                      {/* Algarismo do Arcano Maior (0, I, II, ..., XXI) */}
                      <text
                        x={0}
                        y={0.05}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={
                          isPathSelected
                            ? "#FDE68A"
                            : isPathHovered
                            ? "#FFFFFF"
                            : isConnected
                            ? "#F8FAFC"
                            : "#D4D4D8"
                        }
                        className="text-[1.7px] font-mono font-bold tracking-tighter select-none pointer-events-none"
                      >
                        {path.tarotNumber}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* 3. Marcador Invisível do Abismo (Da'ath) */}
            <g>
              <circle
                cx={50}
                cy={38}
                r={3.2}
                fill="none"
                stroke="#A855F7"
                strokeWidth={0.8}
                strokeDasharray="1.2 1.2"
                className="opacity-70 animate-pulse"
              />
              <text
                x={50}
                y={38.8}
                textAnchor="middle"
                className="text-[2.2px] font-mono fill-purple-400 font-semibold select-none pointer-events-none"
              >
                Da'ath
              </text>
            </g>

            {/* 4. As 10 Esferas Sephiroth (Efeito 3D Convexo com Curvatura Volumétrica) */}
            {SEPHIROT.map((sephirah) => {
              const isSelected = sephirah.id === selectedSephirahId;
              const isHovered = sephirah.id === hoveredSephirahId;
              const noteCount = notesBySephirah.get(sephirah.id)?.length || 0;

              return (
                <g
                  key={`sephirah-${sephirah.id}`}
                  onClick={() => {
                    setSelectedSephirahId(sephirah.id);
                    setSelectedPathNumber(null);
                  }}
                  onMouseEnter={() => setHoveredSephirahId(sephirah.id)}
                  onMouseLeave={() => setHoveredSephirahId(null)}
                  className="cursor-pointer"
                >
                  <title>{`${sephirah.name} (${sephirah.english}) · Sephirah #${sephirah.id}`}</title>

                  {/* AURA DE SELEÇÃO: Pulso Vibrante e Constante na Cor da Própria Sephirah */}
                  {isSelected && (
                    <>
                      {/* Onda de expansão contínua */}
                      <circle
                        cx={sephirah.x}
                        cy={sephirah.y}
                        r={8.6}
                        fill="none"
                        stroke={sephirah.color}
                        style={{
                          animation: "sephirahPulseWave 1.8s cubic-bezier(0.2, 0, 0.4, 1) infinite",
                        }}
                      />

                      {/* Halo brilhante ao redor */}
                      <circle
                        cx={sephirah.x}
                        cy={sephirah.y}
                        r={7.6}
                        fill={sephirah.color}
                        fillOpacity={0.25}
                        stroke={sephirah.color}
                        style={{
                          animation: "sephirahIntenseGlow 1.2s ease-in-out infinite alternate",
                          filter: `drop-shadow(0 0 6px ${sephirah.color})`,
                        }}
                      />

                      {/* Anel concêntrico sagrado tracejado */}
                      <circle
                        cx={sephirah.x}
                        cy={sephirah.y}
                        r={6.2}
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth={0.8}
                        strokeDasharray="1 1"
                        className="opacity-90"
                      />
                    </>
                  )}

                  {/* AURA DE HOVER: Pulso de Resposta na Cor da Sephirah */}
                  {isHovered && !isSelected && (
                    <circle
                      cx={sephirah.x}
                      cy={sephirah.y}
                      r={7.4}
                      fill={sephirah.color}
                      fillOpacity={0.22}
                      stroke={sephirah.color}
                      strokeWidth={1.4}
                      className="animate-pulse"
                      style={{
                        filter: `drop-shadow(0 0 5px ${sephirah.color})`,
                      }}
                    />
                  )}

                  {/* SOMBRA 3D DE CONTATO PROJETADA (Dá a sensação de curvar para fora da tela) */}
                  <ellipse
                    cx={sephirah.x}
                    cy={sephirah.y + 4.8}
                    rx={4.4}
                    ry={1.5}
                    fill="#000000"
                    opacity={0.45}
                    filter="url(#sphereDepthShadow)"
                  />

                  {/* ARO CHANFRADO EXTERNO 3D (Bevel Ring metálico côncavo onde a esfera se assenta) */}
                  <circle
                    cx={sephirah.x}
                    cy={sephirah.y}
                    r={5.0}
                    fill="none"
                    stroke="url(#bevelRing)"
                    strokeWidth={0.9}
                  />

                  {/* CORPO PRINCIPAL DA ESFERA 3D (Gradiente Convexo Radial) */}
                  <circle
                    cx={sephirah.x}
                    cy={sephirah.y}
                    r={4.3}
                    fill={`url(#sphere-3d-${sephirah.id})`}
                    stroke={
                      sephirah.id === 1
                        ? "#CBD5E1"
                        : isSelected
                        ? "#FFFFFF"
                        : "rgba(0,0,0,0.35)"
                    }
                    strokeWidth={sephirah.id === 1 ? 0.6 : isSelected ? 0.6 : 0.4}
                    filter="url(#sphereDepthShadow)"
                  />

                  {/* REFLEXO ESPECULAR SUPERIOR 3D (Curvatura de Vidro / Gema saltando para fora da tela) */}
                  <ellipse
                    cx={sephirah.x - 0.5}
                    cy={sephirah.y - 1.5}
                    rx={2.2}
                    ry={1.1}
                    fill="url(#specularGlaze)"
                    transform={`rotate(-25 ${sephirah.x - 0.5} ${sephirah.y - 1.5})`}
                  />

                  {/* Reflexo de borda inferior (Rim light rebatido) */}
                  <ellipse
                    cx={sephirah.x + 0.6}
                    cy={sephirah.y + 2.6}
                    rx={1.8}
                    ry={0.6}
                    fill={sephirah.highlightColor}
                    opacity={0.35}
                  />

                  {/* Número da Sephirah gravado no orbe */}
                  <text
                    x={sephirah.x}
                    y={sephirah.y + 1.2}
                    textAnchor="middle"
                    fill={sephirah.textColor}
                    className="text-[3px] font-serif font-bold select-none pointer-events-none drop-shadow-sm"
                  >
                    {sephirah.id}
                  </text>

                  {/* Nome da Sephirah posicionado abaixo com respiro confortável */}
                  <text
                    x={sephirah.x}
                    y={sephirah.y + 7.4}
                    textAnchor="middle"
                    fill={isSelected ? sephirah.color : isHovered ? "currentColor" : "rgb(var(--color-medium-400))"}
                    className="text-[2.3px] font-mono font-bold select-none pointer-events-none tracking-tight transition-colors drop-shadow-sm"
                  >
                    {sephirah.name}
                  </text>

                  {/* Badge de Quantidade de Notas Associadas */}
                  {noteCount > 0 && (
                    <g transform={`translate(${sephirah.x + 3.4}, ${sephirah.y - 4.2})`}>
                      <circle cx={0} cy={0} r={2.0} fill="#E5B842" stroke="#FFFFFF" strokeWidth={0.35} filter="url(#badgeShadow)" />
                      <text
                        x={0}
                        y={0.65}
                        textAnchor="middle"
                        fill="#000000"
                        className="text-[1.8px] font-mono font-bold select-none"
                      >
                        {noteCount}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Guia / Legenda Rápida */}
        <div className="text-[11px] font-mono text-medium-400 flex flex-wrap items-center justify-center gap-3 bg-medium-850/80 px-4 py-2 rounded-full border border-medium-750 shadow-md">
          <span>Clique nas Esferas ou Arcanos para inspecionar</span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-sm" />
            <span>Notas vinculadas</span>
          </span>
          <span>·</span>
          <span>22 Arcanos Maiores nos caminhos</span>
        </div>
      </div>

      {/* 2. Painel Lateral do Inspetor: Detalhes da Sephirah ou Caminho Selecionado */}
      <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-medium-700 bg-medium-850 flex flex-col h-auto md:h-full overflow-hidden shadow-2xl">
        {selectedPath ? (
          /* Visualização de Detalhes do Caminho Selecionado */
          <div className="flex flex-col h-full overflow-hidden">
            {/* Cabeçalho do Caminho */}
            <div className="p-6 border-b border-medium-700 bg-medium-900/60 relative">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-bold">
                      Caminho #{selectedPath.pathNumber} de Liber 777
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-medium-100 flex items-center gap-2 mt-0.5">
                    <span>{selectedPath.tarotNumber} · {selectedPath.tarotName}</span>
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-serif text-lg text-amber-400 dark:text-amber-300">
                      {selectedPath.hebrewLetter}
                    </span>
                    <span className="text-xs font-mono text-medium-300">
                      ({selectedPath.hebrewName}) · {selectedPath.astrological}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPathNumber(null)}
                  className="p-1 text-medium-400 hover:text-white rounded hover:bg-medium-800 transition-colors"
                  title="Voltar à Sephirah"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conteúdo do Caminho */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs font-mono">
              <div className="p-3.5 rounded-lg bg-medium-900/80 border border-medium-750 space-y-2">
                <span className="text-[10px] text-medium-400 font-bold uppercase tracking-wider block">
                  Conexão entre as Esferas
                </span>
                <div className="flex items-center justify-between p-2 rounded bg-medium-850 border border-medium-700">
                  {(() => {
                    const s1 = SEPHIROT.find((s) => s.id === selectedPath.fromId)!;
                    const s2 = SEPHIROT.find((s) => s.id === selectedPath.toId)!;
                    return (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSephirahId(s1.id);
                            setSelectedPathNumber(null);
                          }}
                          className="flex items-center gap-2 hover:text-amber-300 transition-colors"
                        >
                          <div
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: s1.color }}
                          />
                          <span className="font-bold text-white">{s1.name} (#{s1.id})</span>
                        </button>
                        <ArrowRight className="w-4 h-4 text-medium-400" />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSephirahId(s2.id);
                            setSelectedPathNumber(null);
                          }}
                          className="flex items-center gap-2 hover:text-amber-300 transition-colors"
                        >
                          <div
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: s2.color }}
                          />
                          <span className="font-bold text-white">{s2.name} (#{s2.id})</span>
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-medium-900/80 border border-medium-750 space-y-2">
                <span className="text-[10px] text-medium-400 font-bold uppercase tracking-wider block">
                  Atribuições Herméticas (Liber 777)
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-medium-400 block text-[10px]">ARCANO MAIOR:</span>
                    <span className="text-medium-100 font-semibold">{selectedPath.tarotNumber} - {selectedPath.tarotName}</span>
                  </div>
                  <div>
                    <span className="text-medium-400 block text-[10px]">LETRA HEBRAICA:</span>
                    <span className="text-medium-100 font-semibold">{selectedPath.hebrewName} ({selectedPath.hebrewLetter})</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-medium-400 block text-[10px]">REGÊNCIA / FORÇA:</span>
                    <span className="text-amber-400 dark:text-amber-300 font-semibold">{selectedPath.astrological}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNewNoteUnderSephirah(`${selectedPath.tarotName} (${selectedPath.hebrewName})`)}
                className="w-full py-2.5 px-4 rounded-lg bg-medium-100 hover:bg-medium-200 text-medium-900 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm font-sans"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Criar Nota sobre {selectedPath.tarotName}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Visualização da Sephirah Selecionada */
          <div className="flex flex-col h-full overflow-hidden">
            {/* Cabeçalho da Sephirah */}
            <div className="p-6 border-b border-medium-700 bg-medium-900/60 relative">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-medium-400 uppercase tracking-widest block">
                    Sephirah #{selectedSephirah.id}
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-medium-100 flex items-center gap-2 mt-0.5">
                    <span>{selectedSephirah.name}</span>
                    <span className="text-sm font-normal text-medium-400">({selectedSephirah.english})</span>
                  </h3>
                  <span className="font-serif text-lg text-amber-400 dark:text-amber-300 block mt-0.5">
                    {selectedSephirah.hebrew}
                  </span>
                </div>

                <div
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center font-bold text-xs shadow-lg"
                  style={{
                    backgroundColor: selectedSephirah.color,
                    color: selectedSephirah.textColor,
                    boxShadow: `0 0 12px ${selectedSephirah.color}40`,
                  }}
                >
                  {selectedSephirah.id}
                </div>
              </div>
            </div>

            {/* Correspondências & Ligações */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs font-mono">
              <div className="p-3.5 rounded-lg bg-medium-900/80 border border-medium-750 space-y-2">
                <span className="text-[10px] text-medium-400 font-bold uppercase tracking-wider block">
                  Atribuições de Liber 777
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-medium-400 block text-[10px]">PLANETA / ESFERA:</span>
                    <span className="text-medium-100 font-semibold">{selectedSephirah.planet}</span>
                  </div>
                  <div>
                    <span className="text-medium-400 block text-[10px]">DEUS / ATRIBUIÇÃO:</span>
                    <span className="text-medium-100 font-semibold">{selectedSephirah.godName}</span>
                  </div>
                  <div>
                    <span className="text-medium-400 block text-[10px]">ARCANJO:</span>
                    <span className="text-medium-200">{selectedSephirah.archangel}</span>
                  </div>
                  <div>
                    <span className="text-medium-400 block text-[10px]">EXPERIÊNCIA:</span>
                    <span className="text-amber-400 dark:text-amber-300/90 font-medium">{selectedSephirah.spiritualExperience}</span>
                  </div>
                </div>
              </div>

              {/* Caminhos Conectados & Arcanos */}
              <div className="p-3.5 rounded-lg bg-medium-900/80 border border-medium-750 space-y-2">
                <span className="text-[10px] text-medium-400 font-bold uppercase tracking-wider block">
                  Caminhos & Ligações ({connectedPaths.length})
                </span>
                <div className="space-y-1.5">
                  {connectedPaths.map(({ path, target }, cIdx) => (
                    <div
                      key={`cp-${cIdx}`}
                      onClick={() => setSelectedPathNumber(path.pathNumber)}
                      className="flex items-center justify-between p-2 rounded bg-medium-850/60 hover:bg-medium-800 border border-medium-750/70 cursor-pointer transition-colors group"
                      title="Clique para inspecionar este Arcano"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-[11px] font-mono text-medium-300 group-hover:text-amber-300 font-semibold block truncate">
                          {path.tarotNumber} · {path.tarotName} ({path.hebrewName})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-mono text-medium-400">→ {target.name}</span>
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: target.color }}
                          title={`Ir para ${target.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSephirahId(target.id);
                            setSelectedPathNumber(null);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Criar Nova Nota sob esta Sephirah */}
              <button
                onClick={() => onNewNoteUnderSephirah(selectedSephirah.name)}
                className="w-full py-2.5 px-4 rounded-lg bg-medium-100 hover:bg-medium-200 text-medium-900 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm font-sans"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Criar Nova Nota sob {selectedSephirah.name}</span>
              </button>

              {/* Lista de Notas Correlacionadas */}
              <div className="space-y-2 pt-2 border-t border-medium-750">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-medium-300">
                    Notas Vinculadas ({sephirahNotes.length})
                  </span>
                </div>

                {sephirahNotes.length === 0 ? (
                  <div className="p-4 rounded-lg bg-medium-900/40 border border-medium-800 text-center text-medium-500 text-xs">
                    Nenhuma nota correlacionada diretamente com {selectedSephirah.name} ainda.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {sephirahNotes.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => onSelectEntry(note)}
                        className="p-2.5 rounded-lg bg-medium-900 hover:bg-medium-800 border border-medium-750 cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="text-[10px] font-mono text-medium-400 block">
                            {normalizeCategory(note.type)} · {new Date(note.date).toLocaleDateString("pt-BR")}
                          </span>
                          <h4 className="text-xs font-semibold text-medium-100 truncate group-hover:text-amber-400 dark:group-hover:text-amber-300 transition-colors">
                            {note.title}
                          </h4>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-medium-500 group-hover:text-medium-100 shrink-0 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
