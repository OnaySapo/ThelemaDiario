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
} from "lucide-react";
import { EstrelaDeThelema } from "@/components/ThelemicIcons";

export interface SephirahData {
  id: number;
  name: string;
  hebrew: string;
  transliteration: string;
  english: string;
  x: number; // percentage (0 to 100)
  y: number; // percentage (0 to 100)
  color: string;
  textColor: string;
  planet: string;
  element: string;
  archangel: string;
  godName: string;
  magicalImage: string;
  spiritualExperience: string;
  vice: string;
  virtue: string;
}

export const SEPHIROT: SephirahData[] = [
  {
    id: 1,
    name: "Kether",
    hebrew: "כתר",
    transliteration: "Kether",
    english: "A Coroa",
    x: 50,
    y: 6,
    color: "#FFFFFF",
    textColor: "#000000",
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
    x: 82,
    y: 19,
    color: "#94A3B8",
    textColor: "#000000",
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
    x: 18,
    y: 19,
    color: "#1E293B",
    textColor: "#FFFFFF",
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
    x: 82,
    y: 40,
    color: "#2563EB",
    textColor: "#FFFFFF",
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
    x: 18,
    y: 40,
    color: "#DC2626",
    textColor: "#FFFFFF",
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
    y: 52,
    color: "#EAB308",
    textColor: "#000000",
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
    x: 82,
    y: 72,
    color: "#16A34A",
    textColor: "#FFFFFF",
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
    x: 18,
    y: 72,
    color: "#EA580C",
    textColor: "#FFFFFF",
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
    y: 82,
    color: "#9333EA",
    textColor: "#FFFFFF",
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
    y: 95,
    color: "#78350F",
    textColor: "#FFFFFF",
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

// As 22 Linhas de Conexão (Caminhos de Aleph a Tav)
export const TREE_PATHS: [number, number, string][] = [
  [1, 2, "11. Aleph (O Louco)"],
  [1, 3, "12. Beth (O Mago)"],
  [1, 6, "13. Gimel (A Sacerdotisa)"],
  [2, 3, "14. Daleth (A Imperatriz)"],
  [2, 6, "15. Heh (O Imperador)"],
  [2, 4, "16. Vav (O Hierofante)"],
  [3, 6, "17. Zayin (Os Enamorados)"],
  [3, 5, "18. Cheth (A Carruagem)"],
  [4, 5, "19. Teth (A Força / Ajuste)"],
  [4, 6, "20. Yod (O Eremita)"],
  [4, 7, "21. Kaph (A Roda da Fortuna)"],
  [5, 6, "22. Lamed (A Justiça)"],
  [5, 8, "23. Mem (O Enforcado)"],
  [6, 7, "24. Nun (A Morte)"],
  [6, 9, "25. Samekh (A Arte)"],
  [6, 8, "26. Ayin (O Diabo)"],
  [7, 8, "27. Peh (A Torre)"],
  [7, 9, "28. Tzaddi (A Estrela)"],
  [7, 10, "29. Qoph (A Lua)"],
  [8, 9, "30. Resh (O Sol)"],
  [8, 10, "31. Shin (O Aeon)"],
  [9, 10, "32. Tav (O Universo)"],
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
  const [filterQuery, setFilterQuery] = useState("");

  // Map notes to each Sephirah based on influences or content matching
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

  return (
    <div className="flex-1 h-full bg-medium-900 flex flex-col md:flex-row overflow-hidden">
      {/* 1. Main Interactive Sacred Geometry SVG Canvas */}
      <div className="flex-1 h-full relative flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto select-none">
        {/* Canvas Header */}
        <div className="absolute top-4 left-6 z-10">
          <div className="flex items-center gap-2">
            <EstrelaDeThelema className="w-5 h-5 text-white" />
            <h2 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
              Árvore da Vida Cabalística (Otz Chiim · Liber 777)
            </h2>
          </div>
          <p className="text-[11px] font-mono text-medium-400 mt-0.5">
            Mapeamento sagrado das 10 Sephiroth e dos 22 Caminhos correlacionados com suas notas
          </p>
        </div>

        {/* The SVG Container */}
        <div className="w-full max-w-xl aspect-[3/4] relative my-auto mt-14 mb-6">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]"
          >
            {/* Draw The 22 Paths */}
            {TREE_PATHS.map(([fromId, toId, pathLabel], idx) => {
              const sFrom = SEPHIROT.find((s) => s.id === fromId)!;
              const sTo = SEPHIROT.find((s) => s.id === toId)!;
              const isConnectedToSelected =
                fromId === selectedSephirahId || toId === selectedSephirahId;

              return (
                <g key={`path-${idx}`} className="group cursor-pointer">
                  <line
                    x1={sFrom.x}
                    y1={sFrom.y}
                    x2={sTo.x}
                    y2={sTo.y}
                    stroke={isConnectedToSelected ? "#E5B842" : "rgba(255,255,255,0.18)"}
                    strokeWidth={isConnectedToSelected ? 1.2 : 0.8}
                    strokeDasharray={isConnectedToSelected ? "none" : "none"}
                    className="transition-colors duration-200"
                  />
                </g>
              );
            })}

            {/* Invisible Abyss Marker (Da'ath) */}
            <circle
              cx={50}
              cy={29}
              r={3}
              fill="none"
              stroke="rgba(168, 85, 247, 0.4)"
              strokeWidth={0.6}
              strokeDasharray="1 1"
            />
            <text
              x={50}
              y={29.8}
              textAnchor="middle"
              className="text-[2.2px] font-mono fill-purple-400/70 select-none pointer-events-none"
            >
              Da'ath
            </text>

            {/* Draw The 10 Sephiroth Circles */}
            {SEPHIROT.map((sephirah) => {
              const isSelected = sephirah.id === selectedSephirahId;
              const noteCount = notesBySephirah.get(sephirah.id)?.length || 0;

              return (
                <g
                  key={`sephirah-${sephirah.id}`}
                  onClick={() => setSelectedSephirahId(sephirah.id)}
                  className="cursor-pointer group"
                >
                  {/* Glowing selection aura */}
                  {isSelected && (
                    <circle
                      cx={sephirah.x}
                      cy={sephirah.y}
                      r={7.2}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth={0.8}
                      className="animate-pulse"
                    />
                  )}

                  {/* Outer circle ring */}
                  <circle
                    cx={sephirah.x}
                    cy={sephirah.y}
                    r={5.5}
                    fill="#18181B"
                    stroke={isSelected ? "#FFFFFF" : sephirah.color}
                    strokeWidth={isSelected ? 1.4 : 1.0}
                    className="transition-transform duration-200 group-hover:scale-110"
                  />

                  {/* Inner color dot */}
                  <circle
                    cx={sephirah.x}
                    cy={sephirah.y}
                    r={4}
                    fill={sephirah.color}
                    fillOpacity={0.85}
                  />

                  {/* Sephirah Hebrew & Latin Label */}
                  <text
                    x={sephirah.x}
                    y={sephirah.y + 1.2}
                    textAnchor="middle"
                    fill={sephirah.textColor}
                    className="text-[3px] font-serif font-bold select-none pointer-events-none"
                  >
                    {sephirah.id}
                  </text>

                  {/* Name below sphere */}
                  <text
                    x={sephirah.x}
                    y={sephirah.y + 7.8}
                    textAnchor="middle"
                    fill={isSelected ? "#FFFFFF" : "#A1A1AA"}
                    className="text-[2.4px] font-mono font-semibold select-none pointer-events-none tracking-tight"
                  >
                    {sephirah.name}
                  </text>

                  {/* Note Count Badge */}
                  {noteCount > 0 && (
                    <g transform={`translate(${sephirah.x + 3.2}, ${sephirah.y - 4.5})`}>
                      <circle cx={0} cy={0} r={2.0} fill="#E5B842" />
                      <text
                        x={0}
                        y={0.7}
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

        {/* Quick Legend / Guide */}
        <div className="text-[11px] font-mono text-medium-400 flex items-center gap-4 bg-medium-850/80 px-4 py-2 rounded-full border border-medium-750">
          <span>Clique em qualquer Sephirah para inspecionar</span>
          <span>·</span>
          <span>Círculo Amarelo: Notas correlacionadas</span>
        </div>
      </div>

      {/* 2. Side Panel Inspector: Details of Selected Sephirah */}
      <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-medium-700 bg-medium-850 flex flex-col h-auto md:h-full overflow-hidden shadow-2xl">
        {/* Sephirah Header Banner */}
        <div className="p-6 border-b border-medium-700 bg-medium-900/60 relative">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono text-medium-400 uppercase tracking-widest block">
                Sephirah #{selectedSephirah.id}
              </span>
              <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-2 mt-0.5">
                <span>{selectedSephirah.name}</span>
                <span className="text-sm font-normal text-medium-400">({selectedSephirah.english})</span>
              </h3>
              <span className="font-serif text-lg text-amber-300 block mt-0.5">
                {selectedSephirah.hebrew}
              </span>
            </div>

            <div
              className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center font-bold text-xs"
              style={{ backgroundColor: selectedSephirah.color, color: selectedSephirah.textColor }}
            >
              {selectedSephirah.id}
            </div>
          </div>
        </div>

        {/* Correspondences Accordion / Grid */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs font-mono">
          <div className="p-3.5 rounded-lg bg-medium-900/80 border border-medium-750 space-y-2">
            <span className="text-[10px] text-medium-400 font-bold uppercase tracking-wider block">
              Atribuições de Liber 777
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-medium-400 block text-[10px]">PLANETA / ESFERA:</span>
                <span className="text-white font-semibold">{selectedSephirah.planet}</span>
              </div>
              <div>
                <span className="text-medium-400 block text-[10px]">DEUS / ATRIBUIÇÃO:</span>
                <span className="text-white font-semibold">{selectedSephirah.godName}</span>
              </div>
              <div>
                <span className="text-medium-400 block text-[10px]">ARCANJO:</span>
                <span className="text-white">{selectedSephirah.archangel}</span>
              </div>
              <div>
                <span className="text-medium-400 block text-[10px]">EXPERIÊNCIA:</span>
                <span className="text-amber-300/90">{selectedSephirah.spiritualExperience}</span>
              </div>
            </div>
          </div>

          {/* Action: Create Note under this Sephirah */}
          <button
            onClick={() => onNewNoteUnderSephirah(selectedSephirah.name)}
            className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-medium-200 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm font-sans"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Criar Nova Nota sob {selectedSephirah.name}</span>
          </button>

          {/* Correlated Notes List */}
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
                      <h4 className="text-xs font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
                        {note.title}
                      </h4>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-medium-500 group-hover:text-white shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
