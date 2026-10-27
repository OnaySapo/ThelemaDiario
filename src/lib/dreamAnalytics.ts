import { MagickEntry, normalizeCategory } from "@/lib/types";

export interface DreamTotemDefinition {
  id: string;
  name: string;
  icon: string;
  keywords: string[];
  meaning777: string;
  brasilisRuler: string;
}

export const DREAM_TOTEM_DICTIONARY: DreamTotemDefinition[] = [
  {
    id: "agua_mar",
    name: "Águas & Oceano",
    icon: "🌊",
    keywords: ["mar", "oceano", "ondas", "praia", "agua", "águas", "mergulho", "navio", "barco"],
    meaning777: "Yesod / Mem — O Grande Mar do Inconsciente e a Matriz Astral",
    brasilisRuler: "Iemanjá (Kalunga Grande) & Marinheiros",
  },
  {
    id: "cachoeira_rio",
    name: "Cachoeira & Rio Doce",
    icon: "💧",
    keywords: ["cachoeira", "rio", "riacho", "fonte", "lago", "ouro", "peixe"],
    meaning777: "Netzach / Chesed — Fluxo Emocional, Purificação e Prosperidade",
    brasilisRuler: "Oxum & Caboclas das Águas",
  },
  {
    id: "mata_floresta",
    name: "Mata & Floresta",
    icon: "🌿",
    keywords: ["mata", "floresta", "arvore", "árvore", "folhas", "selva", "trilha", "jurema", "ervas"],
    meaning777: "Chokmah / Netzach — Força Vital, Cura (Ewê) e Busca Direcionada",
    brasilisRuler: "Oxóssi, Ossaim, Caboclos & Mestres da Jurema",
  },
  {
    id: "encruzilhada_caminho",
    name: "Encruzilhada & Portais",
    icon: "🛤️",
    keywords: ["encruzilhada", "rua", "estrada", "porta", "portal", "portão", "chave", "ponte"],
    meaning777: "Hod / Peh — Escolha de Caminhos, Comunicação entre Planos e Guardiões",
    brasilisRuler: "Exu, Pombagira & Ogum",
  },
  {
    id: "serpente_cobra",
    name: "Serpente & Arco-Íris",
    icon: "🐍",
    keywords: ["cobra", "serpente", "jiboia", "sucuri", "dragao", "dragão", "arco-iris", "arco-íris"],
    meaning777: "Teth / Nun — Kundalini, Renovação Alquímica e Movimento Contínuo",
    brasilisRuler: "Oxumarê & Ewá",
  },
  {
    id: "voo_levitacao",
    name: "Voo & Projeção Astral",
    icon: "🦅",
    keywords: ["voo", "voar", "voando", "levitar", "flutuar", "flutuando", "asas", "ceu", "céu", "passaro", "pássaro"],
    meaning777: "Aleph / Kether — Desprendimento do Corpo Astral e Lucidez Superior",
    brasilisRuler: "Oyá (Iansã) & Tempo (Iroko)",
  },
  {
    id: "fogo_trovao",
    name: "Fogo, Raio & Pedreira",
    icon: "⚡",
    keywords: ["fogo", "chama", "incendio", "incêndio", "raio", "trovao", "trovão", "relampago", "pedra", "montanha"],
    meaning777: "Shin / Geburah — Vontade Ígnea, Julgamento Justo e Transmutação",
    brasilisRuler: "Xangô & Oyá",
  },
  {
    id: "terreiro_templo",
    name: "Terreiro, Altar & Tambor",
    icon: "🥁",
    keywords: ["terreiro", "templo", "altar", "vela", "tambor", "atabaque", "gira", "ponto", "caboclo", "preto velho", "ritual"],
    meaning777: "Tiphareth / Hierofante — Chamado Iniciático e Instrução no Astral",
    brasilisRuler: "Egrégora do Terreiro & Mentores Espirituais",
  },
  {
    id: "escada_labirinto",
    name: "Escadas & Labirintos",
    icon: "🪜",
    keywords: ["escada", "escadaria", "subir", "descer", "elevador", "labirinto", "corredor", "subterraneo", "caverna"],
    meaning777: "Caminho de Tau / Gimel — Ascensão ou Descida entre as Esferas da Árvore",
    brasilisRuler: "Omolu, Nanã & Pretos Velhos",
  },
  {
    id: "espelho_sombra",
    name: "Espelho & Duplo Astral",
    icon: "🪞",
    keywords: ["espelho", "reflexo", "sombra", "duplo", "mascara", "máscara", "rosto"],
    meaning777: "Qoph (A Lua) — Confronto com o Guardião do Limiar e Autoconhecimento",
    brasilisRuler: "Oxum (Abebê) & Exu",
  },
];

export interface DetectedDreamTotem extends DreamTotemDefinition {
  count: number;
  notes: { id: string; title: string; date: string }[];
}

export function detectTotemsInText(text: string): DreamTotemDefinition[] {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return DREAM_TOTEM_DICTIONARY.filter((totem) =>
    totem.keywords.some((kw) => {
      const cleanKw = kw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const regex = new RegExp(`\\b${cleanKw}\\w*`, "i");
      return regex.test(normalized);
    })
  );
}

export function analyzeDreamTotemsAcrossEntries(entries: MagickEntry[]): {
  dreamNotesCount: number;
  astralNotesCount: number;
  totems: DetectedDreamTotem[];
} {
  const dreamEntries = entries.filter((e) => {
    const cat = normalizeCategory(e.type);
    return cat === "Sonho" || cat === "Visão Astral";
  });

  const dreamNotesCount = entries.filter((e) => normalizeCategory(e.type) === "Sonho").length;
  const astralNotesCount = entries.filter((e) => normalizeCategory(e.type) === "Visão Astral").length;

  const map = new Map<string, DetectedDreamTotem>();
  for (const def of DREAM_TOTEM_DICTIONARY) {
    map.set(def.id, { ...def, count: 0, notes: [] });
  }

  for (const entry of dreamEntries) {
    const fullText = `${entry.title} ${entry.content}`;
    const found = detectTotemsInText(fullText);
    for (const t of found) {
      const item = map.get(t.id)!;
      item.count += 1;
      item.notes.push({ id: entry.id, title: entry.title, date: entry.date });
    }
  }

  const totems = Array.from(map.values())
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);

  return {
    dreamNotesCount,
    astralNotesCount,
    totems,
  };
}
