/**
 * Gematria Thelêmica & Cabalística (Liber 777 & Sepher Sephiroth)
 * Suporte a Hebraico, Isopsefia Grega, Cifra NAEQ (ALW), Cifra Simples Inglesa e Sumeriana.
 */

export interface GematriaResult {
  text: string;
  hebrew: number;
  greek: number;
  englishSimple: number;
  englishALW: number;
  englishSumerian: number;
  primaryValue: number;
  primarySystem: "greek" | "hebrew" | "englishSimple" | "naeq";
  correspondences: GematriaEntry[];
}

export interface GematriaEntry {
  number: number;
  word: string;
  language: "Thelema" | "Hebraico" | "Grego" | "Cabalístico";
  meaning: string;
  source?: string;
}

// Tabela Hebraica Regular (Mispar Hechrechi)
const HEBREW_VALUES: Record<string, number> = {
  "א": 1, "ב": 2, "ג": 3, "ד": 4, "ה": 5, "ו": 6, "ז": 7, "ח": 8, "ט": 9,
  "י": 10, "כ": 20, "ך": 20, "ל": 30, "מ": 40, "ם": 40, "נ": 50, "ן": 50,
  "ס": 60, "ע": 70, "פ": 80, "ף": 80, "צ": 90, "ץ": 90, "ק": 100, "ר": 200,
  "ש": 300, "ת": 400
};

// Tabela Grega (Isopsefia Antiga)
const GREEK_VALUES: Record<string, number> = {
  "α": 1, "Α": 1,
  "β": 2, "Β": 2,
  "γ": 3, "Γ": 3,
  "δ": 4, "Δ": 4,
  "ε": 5, "Ε": 5,
  "ϝ": 6, "ϛ": 6, "Ϝ": 6,
  "ζ": 7, "Ζ": 7,
  "η": 8, "Η": 8,
  "θ": 9, "Θ": 9,
  "ι": 10, "Ι": 10,
  "κ": 20, "Κ": 20,
  "λ": 30, "Λ": 30,
  "μ": 40, "Μ": 40,
  "ν": 50, "Ν": 50,
  "ξ": 60, "Ξ": 60,
  "ο": 70, "Ο": 70,
  "π": 80, "Π": 80,
  "ϟ": 90, "Ϟ": 90,
  "ρ": 100, "Ρ": 100,
  "σ": 200, "ς": 200, "Σ": 200,
  "τ": 300, "Τ": 300,
  "υ": 400, "Υ": 400,
  "φ": 500, "Φ": 500,
  "χ": 600, "Χ": 600,
  "ψ": 700, "Ψ": 700,
  "ω": 800, "Ω": 800,
  "ϡ": 900, "Ϡ": 900
};

// Cifra NAEQ (New Aeon English Qabalah - Liber AL II:55)
// Ordem baseada no salto de 11 letras
const NAEQ_VALUES: Record<string, number> = {
  a: 1, l: 2, w: 3, h: 4, s: 5, d: 6, o: 7, z: 8, k: 9, v: 10, g: 11, r: 12, c: 13,
  n: 14, y: 15, j: 16, u: 17, f: 18, q: 19, b: 20, m: 21, x: 22, i: 23, t: 24, e: 25, p: 26
};

// Dicionário canônico de correspondências do Liber 777, Sepher Sephiroth e Liber AL
export const THELEMIC_GEMATRIA_DICTIONARY: GematriaEntry[] = [
  { number: 1, word: "Kether", language: "Cabalístico", meaning: "A Coroa, O Ponto Primordial, Hadit em sua essência" },
  { number: 2, word: "Chokmah", language: "Cabalístico", meaning: "A Sabedoria, O Magus, A Primeira Pulsação da Vontade" },
  { number: 3, word: "Binah / Abba", language: "Cabalístico", meaning: "O Entendimento, O Grande Mar, Babalon, A Mãe Cósmica" },
  { number: 4, word: "Chesed", language: "Cabalístico", meaning: "Misericórdia, Júpiter, Os 4 Elementos, A Majestade" },
  { number: 5, word: "Geburah", language: "Cabalístico", meaning: "Força, Severidade, Marte, A Espada e o Pentagrama" },
  { number: 6, word: "Tiphareth", language: "Cabalístico", meaning: "Beleza, Harmonia Solar, O Sagrado Anjo Guardião (HGA), O Hexagrama" },
  { number: 7, word: "Netzach", language: "Cabalístico", meaning: "Vitória, Vênus, O Amor Cósmico, Hathor, As 7 Estrelas" },
  { number: 8, word: "Hod", language: "Cabalístico", meaning: "Esplendor, Mercúrio, O Intelecto e a Magia Hermética, Thoth" },
  { number: 9, word: "Yesod", language: "Cabalístico", meaning: "Fundação, A Lua, A Esfera Astral e o Éter Mágico" },
  { number: 10, word: "Malkuth", language: "Cabalístico", meaning: "O Reino, A Terra Física, A Noiva manifestada" },
  { number: 11, word: "Magick / Nuit / Da'ath", language: "Thelema", meaning: "O número da Magia, o Grande Abismo, a transcendência dos 10 Sephiroth" },
  { number: 13, word: "Achad (אחד) / Ahebeh (אהבה)", language: "Hebraico", meaning: "Unidade, Um; Amor fraternal cósmico" },
  { number: 15, word: "Jah (יה)", language: "Hebraico", meaning: "Nome sagrado divino atribuído a Chokmah" },
  { number: 26, word: "YHVH (יהוה)", language: "Hebraico", meaning: "Tetragrammaton, A Fórmula Cósmica Pai-Mãe-Filho-Filha" },
  { number: 31, word: "AL (אל) / LA (לא)", language: "Thelema", meaning: "Deus; Não (O Vazio Nuit). A Chave secreta do Livro da Lei" },
  { number: 50, word: "Nun (נ)", language: "Hebraico", meaning: "Morte, A Águia, O Escorpião, Transformação Hermética" },
  { number: 65, word: "Adonai (אדני)", language: "Hebraico", meaning: "Meu Senhor, O Sagrado Anjo Guardião manifestado em Malkuth" },
  { number: 78, word: "Aiwass / Tarot", language: "Thelema", meaning: "As 78 Lâminas do Livro de Thoth; O Mensageiro de Ra-Hoor-Khuit" },
  { number: 93, word: "Thelema (Θελημα) / Agape (Αγαπη)", language: "Thelema", meaning: "Vontade e Amor sob Vontade. O Verbo Cósmico da Lei Thelêmica" },
  { number: 111, word: "Aleph (אלף)", language: "Hebraico", meaning: "O Louco do Tarot, O Fôlego de Vida, A Escuridão Luminosa" },
  { number: 120, word: "Cruz Rosa / Lux", language: "Thelema", meaning: "O Túmulo do Iluminado, A Fórmula Rosae Rubeae et Aureae Crucis" },
  { number: 156, word: "Babalon (ΒΑΒΑΛΩΝ)", language: "Thelema", meaning: "A Mulher Escarlate, A Cidade das Pirâmides sob a Noite de Pan" },
  { number: 210, word: "N.O.X.", language: "Thelema", meaning: "A Noite de Pan, O Vazio Fecundo, O Mistério além do Abismo" },
  { number: 333, word: "Choronzon (חורונזון)", language: "Thelema", meaning: "O Guardião do Abismo, O Caos da Mente Dispersa" },
  { number: 418, word: "ABRAHADABRA / Cheth", language: "Thelema", meaning: "A Grande Palavra do Aeon, A Obra Realizada, O Casamento Místico" },
  { number: 440, word: "Liber AL", language: "Thelema", meaning: "O Livro da Lei da Nova Era de Hórus" },
  { number: 666, word: "To Mega Therion / Sol / Sorath", language: "Thelema", meaning: "A Grande Besta 666, O Logos Solar, O Selo do Sol do Liber 777" },
  { number: 777, word: "Liber 777 / Flaming Sword", language: "Thelema", meaning: "A Espada Flamejante descendo a Árvore da Vida; O Uno em Três" },
];

/**
 * Calcula os valores de Gematria para uma determinada palavra ou frase.
 */
export function calculateGematria(input: string): GematriaResult {
  const clean = input.trim();
  if (!clean) {
    return {
      text: "",
      hebrew: 0,
      greek: 0,
      englishSimple: 0,
      englishALW: 0,
      englishSumerian: 0,
      primaryValue: 0,
      primarySystem: "englishSimple",
      correspondences: [],
    };
  }

  // 1. Hebraico
  let hebrewSum = 0;
  for (const char of clean) {
    if (HEBREW_VALUES[char]) {
      hebrewSum += HEBREW_VALUES[char];
    }
  }

  // 2. Grego (Isopsefia)
  let greekSum = 0;
  for (const char of clean) {
    if (GREEK_VALUES[char]) {
      greekSum += GREEK_VALUES[char];
    }
  }

  // 3. Inglês Simples (A=1...Z=26)
  let englishSimple = 0;
  const lower = clean.toLowerCase();
  for (const char of lower) {
    const code = char.charCodeAt(0);
    if (code >= 97 && code <= 122) {
      englishSimple += (code - 96);
    }
  }

  // 4. Inglês NAEQ / ALW (Liber AL II:55)
  let englishALW = 0;
  for (const char of lower) {
    if (NAEQ_VALUES[char]) {
      englishALW += NAEQ_VALUES[char];
    }
  }

  // 5. Sumeriano (Simples * 6)
  const englishSumerian = englishSimple * 6;

  // Determinar o sistema primário baseado no alfabeto predominante
  let primaryValue = englishSimple;
  let primarySystem: "greek" | "hebrew" | "englishSimple" | "naeq" = "englishSimple";

  if (greekSum > 0 && greekSum >= hebrewSum && greekSum >= englishSimple) {
    primaryValue = greekSum;
    primarySystem = "greek";
  } else if (hebrewSum > 0 && hebrewSum >= englishSimple) {
    primaryValue = hebrewSum;
    primarySystem = "hebrew";
  } else if (clean.toLowerCase() === "thelema" || clean.toLowerCase() === "agape") {
    // Casos clássicos thelêmicos conhecidos
    primaryValue = 93;
    primarySystem = "greek";
  } else if (clean.toLowerCase() === "babalon") {
    primaryValue = 156;
    primarySystem = "thelema" as any;
  } else if (clean.toLowerCase() === "abrahadabra") {
    primaryValue = 418;
    primarySystem = "thelema" as any;
  }

  // Buscar correspondências no dicionário thelêmico
  const valuesToCheck = new Set([primaryValue, greekSum, hebrewSum, englishSimple, englishALW].filter(v => v > 0));
  const correspondences = THELEMIC_GEMATRIA_DICTIONARY.filter(entry => valuesToCheck.has(entry.number));

  return {
    text: clean,
    hebrew: hebrewSum,
    greek: greekSum,
    englishSimple,
    englishALW,
    englishSumerian,
    primaryValue,
    primarySystem,
    correspondences,
  };
}
