import { MagickEntry, CategoryName, normalizeCategory } from "./types";
import { getAfroBrazilianDayRuler, AfroBrazilianWeekdayRuler } from "./brasilidade777";
import { detectTotemsInText } from "./dreamAnalytics";
import { parseSafeDate as parseEntryDate } from "./dateUtils";

export type CrossDimensionId =
  | "category"
  | "moon_phase"
  | "moon_sign"
  | "weekday"
  | "entity_orixa"
  | "herb_tool"
  | "dream_totem";

export interface CrossDimensionMeta {
  id: CrossDimensionId;
  label: string;
  shortLabel: string;
  description: string;
}

export const CROSS_DIMENSIONS: CrossDimensionMeta[] = [
  {
    id: "entity_orixa",
    label: "Orixá, Guia ou Entidade",
    shortLabel: "Orixá / Entidade",
    description: "Divindades, Orixás, Falanges de Umbanda/Jurema, Anjos ou Sephiroth",
  },
  {
    id: "moon_phase",
    label: "Fase da Lua",
    shortLabel: "Fase Lunar",
    description: "Lua Nova, Crescente, Cheia ou Minguante no momento do registro",
  },
  {
    id: "category",
    label: "Categoria do Registro",
    shortLabel: "Categoria",
    description: "Prática, Oráculo, Sonho, Visão Astral, Estudo ou Diário",
  },
  {
    id: "weekday",
    label: "Dia da Semana (Regência)",
    shortLabel: "Dia da Semana",
    description: "De Domingo (Sol/Oxalá) a Sábado (Saturno/Iemanjá & Oxum)",
  },
  {
    id: "herb_tool",
    label: "Ervas (Ewê), Banhos & Armas",
    shortLabel: "Ervas & Banhos",
    description: "Banhos de ervas, defumações, incensos e instrumentos mágicos",
  },
  {
    id: "moon_sign",
    label: "Signo Lunar",
    shortLabel: "Signo da Lua",
    description: "Signo zodiacal em que a Lua transitava",
  },
  {
    id: "dream_totem",
    label: "Totem / Arquétipo Onírico",
    shortLabel: "Totem de Sonho",
    description: "Símbolos recorrentes detectados no texto (Águas, Serpente, Mata, Encruzilhada...)",
  },
];

const WEEKDAY_NAMES_PT = [
  "Domingo (Sol)",
  "Segunda (Lua/Exu)",
  "Terça (Marte/Ogum)",
  "Quarta (Mercúrio/Xangô)",
  "Quinta (Júpiter/Oxóssi)",
  "Sexta (Vênus/Oxalá)",
  "Sábado (Saturno/Yabás)",
];

const KNOWN_ORIXAS_AND_FORCES = [
  "Exu",
  "Pombagira",
  "Ogum",
  "Oxóssi",
  "Ossaim",
  "Xangô",
  "Iansã",
  "Oyá",
  "Oxum",
  "Logun Edé",
  "Iemanjá",
  "Nanã",
  "Obaluaê",
  "Omolu",
  "Oxumarê",
  "Oxalá",
  "Caboclo",
  "Preto Velho",
  "Zé Pelintra",
  "Jurema",
  "Malunguinho",
  "Boiadeiro",
  "Marinheiro",
  "Kether",
  "Chokmah",
  "Binah",
  "Chesed",
  "Geburah",
  "Tiphareth",
  "Netzach",
  "Hod",
  "Yesod",
  "Malkuth",
];

const MAJOR_ARCANA_KEYWORDS = [
  "O Louco",
  "O Mago",
  "A Sacerdotisa",
  "A Imperatriz",
  "O Imperador",
  "O Hierofante",
  "Os Amantes",
  "O Carro",
  "Ajustamento",
  "A Justiça",
  "O Eremita",
  "Roda da Fortuna",
  "Luxúria",
  "A Força",
  "O Enforcado",
  "A Morte",
  "Arte",
  "A Temperança",
  "O Diabo",
  "A Torre",
  "A Estrela",
  "A Lua",
  "O Sol",
  "O Aeon",
  "O Julgamento",
  "O Universo",
  "O Mundo",
];

/**
 * Extrai os valores de uma dimensão para uma nota específica
 */
export function extractDimensionValues(entry: MagickEntry, dimension: CrossDimensionId): string[] {
  switch (dimension) {
    case "category":
      return [normalizeCategory(entry.type)];

    case "moon_phase":
      return entry.moon_phase && entry.moon_phase.trim() ? [entry.moon_phase.trim()] : ["Não informada"];

    case "moon_sign":
      return entry.moon_sign && entry.moon_sign.trim() ? [entry.moon_sign.trim()] : ["Não informado"];

    case "weekday": {
      const d = parseEntryDate(entry.date);
      if (isNaN(d.getTime())) return ["Indefinido"];
      return [WEEKDAY_NAMES_PT[d.getDay()] || "Indefinido"];
    }

    case "entity_orixa": {
      const results = new Set<string>();
      if (entry.influences) {
        for (const inf of entry.influences) {
          const cat = (inf.category || "").toLowerCase();
          if (
            cat === "entity" ||
            cat === "deity" ||
            cat === "angel" ||
            cat === "orixa" ||
            cat === "guia" ||
            cat === "sephirah" ||
            cat === "planet"
          ) {
            const cleanName = inf.name.split("·")[0].trim();
            if (cleanName) results.add(cleanName);
          }
        }
      }
      // Fallback: busca menções diretas no título/conteúdo se não houver influência marcada
      if (results.size === 0) {
        const textLower = `${entry.title || ""} ${entry.content || ""}`.toLowerCase();
        for (const force of KNOWN_ORIXAS_AND_FORCES) {
          if (textLower.includes(force.toLowerCase())) {
            results.add(force);
          }
        }
      }
      return results.size > 0 ? Array.from(results) : ["Sem Entidade Específica"];
    }

    case "herb_tool": {
      const results = new Set<string>();
      if (entry.influences) {
        for (const inf of entry.influences) {
          const cat = (inf.category || "").toLowerCase();
          if (
            cat === "incense" ||
            cat === "herb" ||
            cat === "herb_crystal" ||
            cat === "tool" ||
            cat === "instrument" ||
            cat === "banho_defumacao" ||
            cat === "ponto_forca"
          ) {
            const cleanName = inf.name.split("(")[0].trim();
            if (cleanName) results.add(cleanName);
          }
        }
      }
      return results.size > 0 ? Array.from(results) : ["Nenhum marcado"];
    }

    case "dream_totem": {
      const totems = detectTotemsInText(`${entry.title || ""} ${entry.content || ""}`);
      return totems.length > 0 ? totems.map((t) => `${t.icon} ${t.name}`) : ["Sem Totem Detectado"];
    }
  }
}

export interface CrossMatrixCell {
  rowKey: string;
  colKey: string;
  count: number;
  ratedCount: number;
  avgRating: number;
  entries: MagickEntry[];
}

export interface CrossMatrixSynergyHighlight {
  rowKey: string;
  colKey: string;
  count: number;
  avgRating: number;
  entries: MagickEntry[];
}

export interface CrossMatrixResult {
  rowDimension: CrossDimensionId;
  colDimension: CrossDimensionId;
  rows: string[];
  cols: string[];
  cells: Record<string, Record<string, CrossMatrixCell>>;
  topSynergies: CrossMatrixSynergyHighlight[];
  maxCount: number;
}

/**
 * Calcula uma Matriz Bidimensional (Heatmap 2D) cruzando quaisquer duas variáveis do Diário
 */
export function computeCrossMatrix2D(
  entries: MagickEntry[],
  rowDim: CrossDimensionId,
  colDim: CrossDimensionId
): CrossMatrixResult {
  const rowCounts = new Map<string, number>();
  const colCounts = new Map<string, number>();
  const cellMap: Record<string, Record<string, CrossMatrixCell>> = {};
  let maxCount = 0;

  for (const entry of entries) {
    const rVals = extractDimensionValues(entry, rowDim);
    const cVals = extractDimensionValues(entry, colDim);
    const hasRating =
      entry.success_rating !== undefined && entry.success_rating !== null && entry.success_rating > 0;
    const ratingVal = hasRating ? Number(entry.success_rating) : 0;

    for (const rKey of rVals) {
      if (rKey === "Sem Entidade Específica" || rKey === "Nenhum marcado" || rKey === "Sem Totem Detectado") {
        // Mantém apenas se não houver mais nada, mas com menor prioridade na ordenação
      }
      rowCounts.set(rKey, (rowCounts.get(rKey) || 0) + 1);
      if (!cellMap[rKey]) cellMap[rKey] = {};

      for (const cKey of cVals) {
        colCounts.set(cKey, (colCounts.get(cKey) || 0) + 1);
        if (!cellMap[rKey][cKey]) {
          cellMap[rKey][cKey] = {
            rowKey: rKey,
            colKey: cKey,
            count: 0,
            ratedCount: 0,
            avgRating: 0,
            entries: [],
          };
        }
        const cell = cellMap[rKey][cKey];
        if (!cell.entries.some((e) => e.id === entry.id)) {
          cell.entries.push(entry);
          cell.count += 1;
          if (hasRating) {
            const totalBefore = cell.avgRating * cell.ratedCount;
            cell.ratedCount += 1;
            cell.avgRating = Math.round(((totalBefore + ratingVal) / cell.ratedCount) * 10) / 10;
          }
          if (cell.count > maxCount) {
            maxCount = cell.count;
          }
        }
      }
    }
  }

  const isPlaceholder = (k: string) =>
    k === "Sem Entidade Específica" ||
    k === "Nenhum marcado" ||
    k === "Sem Totem Detectado" ||
    k === "Não informada" ||
    k === "Não informado";

  const rows = Array.from(rowCounts.entries())
    .sort((a, b) => {
      if (isPlaceholder(a[0]) && !isPlaceholder(b[0])) return 1;
      if (!isPlaceholder(a[0]) && isPlaceholder(b[0])) return -1;
      return b[1] - a[1];
    })
    .slice(0, 10)
    .map(([k]) => k);

  const cols = Array.from(colCounts.entries())
    .sort((a, b) => {
      if (isPlaceholder(a[0]) && !isPlaceholder(b[0])) return 1;
      if (!isPlaceholder(a[0]) && isPlaceholder(b[0])) return -1;
      return b[1] - a[1];
    })
    .slice(0, 8)
    .map(([k]) => k);

  const allCells: CrossMatrixSynergyHighlight[] = [];
  for (const r of rows) {
    for (const c of cols) {
      if (isPlaceholder(r) || isPlaceholder(c) || r === c) continue;
      const cell = cellMap[r]?.[c];
      if (cell && cell.count > 0) {
        allCells.push({
          rowKey: r,
          colKey: c,
          count: cell.count,
          avgRating: cell.avgRating || 8.0,
          entries: cell.entries,
        });
      }
    }
  }

  allCells.sort((a, b) => {
    const scoreA = a.avgRating * Math.min(a.count, 4);
    const scoreB = b.avgRating * Math.min(b.count, 4);
    return scoreB - scoreA;
  });

  return {
    rowDimension: rowDim,
    colDimension: colDim,
    rows,
    cols,
    cells: cellMap,
    topSynergies: allCells.slice(0, 4),
    maxCount,
  };
}

// ============================================================================
// FIOS DE SINCRONICIDADE (Oráculo ↔ Sonho ↔ Prática ↔ Diário)
// ============================================================================

export interface SynchronicityThread {
  id: string;
  symbolTitle: string;
  symbolType: "tarot" | "orixa_forca" | "totem_onirico" | "erva_elemento";
  icon: string;
  categoriesInvolved: CategoryName[];
  isCrossModal: boolean; // true se cruza categorias diferentes (ex: Oráculo + Sonho + Prática)
  daySpan: number;
  strengthScore: number;
  explanationPt: string;
  entries: MagickEntry[];
}

function extractSymbolicTokens(entry: MagickEntry): Array<{
  key: string;
  label: string;
  type: "tarot" | "orixa_forca" | "totem_onirico" | "erva_elemento";
  icon: string;
}> {
  const tokens: Array<{
    key: string;
    label: string;
    type: "tarot" | "orixa_forca" | "totem_onirico" | "erva_elemento";
    icon: string;
  }> = [];
  const seen = new Set<string>();

  const addToken = (
    key: string,
    label: string,
    type: "tarot" | "orixa_forca" | "totem_onirico" | "erva_elemento",
    icon: string
  ) => {
    const norm = key.toLowerCase().trim();
    if (!norm || seen.has(norm)) return;
    seen.add(norm);
    tokens.push({ key: norm, label, type, icon });
  };

  // 1. Cartas de Tarot / Oráculo explícitas
  if (entry.oracle_data?.cards) {
    for (const c of entry.oracle_data.cards) {
      if (c.cardName) {
        addToken(`tarot:${c.cardName}`, `Carta: ${c.cardName}`, "tarot", "🃏");
      }
    }
  }

  const combinedText = `${entry.title || ""} ${entry.content || ""}`;
  const lowerText = combinedText.toLowerCase();

  // Cartas citadas no corpo do texto
  for (const arcano of MAJOR_ARCANA_KEYWORDS) {
    if (lowerText.includes(arcano.toLowerCase())) {
      addToken(`tarot:${arcano}`, `Arcano: ${arcano}`, "tarot", "🃏");
    }
  }

  // 2. Influências marcadas (Orixás, Entidades, Ervas, Banhos)
  if (entry.influences) {
    for (const inf of entry.influences) {
      const cat = (inf.category || "").toLowerCase();
      const shortName = inf.name.split("·")[0].split("(")[0].trim();
      if (!shortName) continue;
      if (cat === "orixa" || cat === "guia" || cat === "deity" || cat === "entity" || cat === "angel") {
        addToken(`forca:${shortName}`, shortName, "orixa_forca", "⚡");
      } else if (cat === "banho_defumacao" || cat === "herb" || cat === "incense" || cat === "herb_crystal") {
        addToken(`erva:${shortName}`, shortName, "erva_elemento", "🌿");
      }
    }
  }

  // 3. Menções diretas a Orixás, Guias e Sephiroth no texto
  for (const force of KNOWN_ORIXAS_AND_FORCES) {
    if (lowerText.includes(force.toLowerCase())) {
      addToken(`forca:${force}`, force, "orixa_forca", "⚡");
    }
  }

  // 4. Totens Oníricos / Arquétipos Simbólicos
  const totems = detectTotemsInText(combinedText);
  for (const t of totems) {
    addToken(`totem:${t.id}`, `Totem: ${t.name}`, "totem_onirico", t.icon);
  }

  return tokens;
}

/**
 * Detecta Fios de Sincronicidade conectando Oráculos, Sonhos, Práticas e Diários
 */
export function detectSynchronicityThreads(entries: MagickEntry[]): SynchronicityThread[] {
  if (!entries || entries.length < 2) return [];

  const tokenBuckets = new Map<
    string,
    {
      label: string;
      type: "tarot" | "orixa_forca" | "totem_onirico" | "erva_elemento";
      icon: string;
      entries: MagickEntry[];
    }
  >();

  for (const entry of entries) {
    const tokens = extractSymbolicTokens(entry);
    for (const tk of tokens) {
      const bucket = tokenBuckets.get(tk.key) || {
        label: tk.label,
        type: tk.type,
        icon: tk.icon,
        entries: [],
      };
      if (!bucket.entries.some((e) => e.id === entry.id)) {
        bucket.entries.push(entry);
      }
      tokenBuckets.set(tk.key, bucket);
    }
  }

  const threads: SynchronicityThread[] = [];

  for (const [key, bucket] of tokenBuckets.entries()) {
    if (bucket.entries.length < 2) continue;

    // Ordena cronologicamente (mais antiga -> mais recente para mostrar a evolução do fio)
    const sorted = [...bucket.entries].sort(
      (a, b) => parseEntryDate(a.date).getTime() - parseEntryDate(b.date).getTime()
    );

    const catsSet = new Set<CategoryName>(sorted.map((e) => normalizeCategory(e.type)));
    const categoriesInvolved = Array.from(catsSet);
    const isCrossModal = categoriesInvolved.length >= 2;

    const firstTime = parseEntryDate(sorted[0].date).getTime();
    const lastTime = parseEntryDate(sorted[sorted.length - 1].date).getTime();
    const daySpan = Math.max(0, Math.round((lastTime - firstTime) / (1000 * 60 * 60 * 24)));

    // Pontuação maior quando conecta categorias distintas (ex: Oráculo -> Sonho -> Prática)
    const proximityBonus = daySpan <= 14 ? 25 : daySpan <= 30 ? 12 : 5;
    const crossModalBonus = isCrossModal ? categoriesInvolved.length * 22 : 8;
    const volumeScore = Math.min(sorted.length, 6) * 8;
    const strengthScore = proximityBonus + crossModalBonus + volumeScore;

    const catFlow = categoriesInvolved.join(" ↔ ");
    let explanationPt = "";
    if (isCrossModal) {
      explanationPt = `Convergência entre ${catFlow}: "${bucket.label}" manifestou-se em ${sorted.length} registros diferentes${
        daySpan <= 14 ? ` num intervalo curto de ${daySpan === 0 ? "mesmo dia" : `${daySpan} dias`}` : ""
      }.`;
    } else {
      explanationPt = `Recorrência temática em ${categoriesInvolved[0]}: "${bucket.label}" apareceu em ${sorted.length} ocasiões.`;
    }

    threads.push({
      id: `sync-${key}`,
      symbolTitle: bucket.label,
      symbolType: bucket.type,
      icon: bucket.icon,
      categoriesInvolved,
      isCrossModal,
      daySpan,
      strengthScore,
      explanationPt,
      entries: sorted,
    });
  }

  return threads.sort((a, b) => b.strengthScore - a.strengthScore).slice(0, 12);
}

// ============================================================================
// ECOS SIMBÓLICOS PARA A NOTA ATUAL (Radar de Ressonância)
// ============================================================================

export interface NoteResonanceItem {
  entry: MagickEntry;
  sharedBadges: string[];
  resonanceScore: number;
  isExplicitlyLinked: boolean;
}

/**
 * Encontra outras notas do banco que ressoam simbolicamente com a nota aberta
 */
export function findNoteResonances(
  currentEntry: MagickEntry | null,
  allEntries: MagickEntry[]
): NoteResonanceItem[] {
  if (!currentEntry || allEntries.length <= 1) return [];

  const currentTokens = extractSymbolicTokens(currentEntry);
  const currentTags = new Set((currentEntry.tags || []).map((t) => t.toLowerCase().trim()));
  const explicitIds = new Set((currentEntry.connections || []).map((c) => c.target_id));

  const results: NoteResonanceItem[] = [];

  for (const other of allEntries) {
    if (other.id === currentEntry.id) continue;

    const sharedBadges: string[] = [];
    let score = 0;

    const otherTokens = extractSymbolicTokens(other);
    for (const ct of currentTokens) {
      if (otherTokens.some((ot) => ot.key === ct.key)) {
        sharedBadges.push(`${ct.icon} ${ct.label}`);
        score += ct.type === "tarot" ? 30 : ct.type === "orixa_forca" ? 25 : 20;
      }
    }

    // Tags em comum
    if (other.tags) {
      for (const t of other.tags) {
        if (currentTags.has(t.toLowerCase().trim())) {
          sharedBadges.push(`#${t}`);
          score += 15;
        }
      }
    }

    // Mesma configuração lunar exata (Fase + Signo)
    if (
      currentEntry.moon_phase &&
      other.moon_phase === currentEntry.moon_phase &&
      currentEntry.moon_sign &&
      other.moon_sign === currentEntry.moon_sign
    ) {
      sharedBadges.push(`🌙 ${currentEntry.moon_phase} em ${currentEntry.moon_sign}`);
      score += 18;
    }

    if (score > 0) {
      results.push({
        entry: other,
        sharedBadges: sharedBadges.slice(0, 4),
        resonanceScore: score,
        isExplicitlyLinked: explicitIds.has(other.id),
      });
    }
  }

  return results.sort((a, b) => b.resonanceScore - a.resonanceScore).slice(0, 6);
}

// ============================================================================
// BÚSSOLA PREDITIVA DO DIA ("O Que Operar Hoje?")
// ============================================================================

export interface DailyPredictiveCompass {
  synergyPercent: number;
  dayRuler: AfroBrazilianWeekdayRuler;
  recommendedCategory: CategoryName;
  recommendedForce: string;
  recommendedHerbs: string;
  headlinePt: string;
  empiricalInsightPt: string;
  suggestedActionTitle: string;
  suggestedInfluences: { category: string; name: string }[];
}

export function computeDailyCompass(
  entries: MagickEntry[],
  currentMoonPhase?: string,
  currentMoonSign?: string,
  now: Date = new Date()
): DailyPredictiveCompass {
  const dayRuler = getAfroBrazilianDayRuler(now);
  const currentDayIndex = now.getDay();

  // Filtra notas realizadas sob a mesma Fase Lunar, mesmo Signo Lunar ou mesmo Dia da Semana
  const resonantEntries = entries.filter((e) => {
    const d = parseEntryDate(e.date);
    const sameDay = !isNaN(d.getTime()) && d.getDay() === currentDayIndex;
    const samePhase = currentMoonPhase && e.moon_phase === currentMoonPhase;
    const sameSign = currentMoonSign && e.moon_sign === currentMoonSign;
    return sameDay || samePhase || sameSign;
  });

  const ratedResonant = resonantEntries.filter(
    (e) => e.success_rating !== undefined && e.success_rating !== null && e.success_rating > 0
  );

  // Calcula a categoria mais eficaz do usuário nessas condições
  const catStats = new Map<CategoryName, { total: number; count: number }>();
  const forceStats = new Map<string, { total: number; count: number }>();

  for (const e of resonantEntries) {
    const cat = normalizeCategory(e.type);
    const rating = e.success_rating ?? 8;
    const curCat = catStats.get(cat) || { total: 0, count: 0 };
    curCat.total += rating;
    curCat.count += 1;
    catStats.set(cat, curCat);

    const forces = extractDimensionValues(e, "entity_orixa");
    for (const f of forces) {
      if (f !== "Sem Entidade Específica") {
        const curF = forceStats.get(f) || { total: 0, count: 0 };
        curF.total += rating;
        curF.count += 1;
        forceStats.set(f, curF);
      }
    }
  }

  let bestCat: CategoryName = "Prática";
  let bestCatAvg = 8.5;
  for (const [cat, st] of catStats.entries()) {
    const avg = st.total / st.count;
    if (avg >= bestCatAvg) {
      bestCatAvg = avg;
      bestCat = cat;
    }
  }

  let bestHistoricalForce = "";
  let bestForceAvg = 0;
  for (const [force, st] of forceStats.entries()) {
    const avg = st.total / st.count;
    if (avg > bestForceAvg) {
      bestForceAvg = avg;
      bestHistoricalForce = force;
    }
  }

  const primaryOrixa = dayRuler.orixas.split(",")[0].split("&")[0].trim();
  const recommendedForce = bestHistoricalForce || primaryOrixa;
  const firstHerb = dayRuler.recommendedHerbs.split(",")[0].trim();

  const avgResonantRating =
    ratedResonant.length > 0
      ? ratedResonant.reduce((acc, c) => acc + (c.success_rating || 8), 0) / ratedResonant.length
      : 8.6;

  const synergyPercent = Math.min(99, Math.max(72, Math.round(avgResonantRating * 10)));

  const moonContext = currentMoonPhase
    ? `com ${currentMoonPhase}${currentMoonSign ? ` em ${currentMoonSign}` : ""}`
    : "no trânsito atual";

  const headlinePt = `${dayRuler.dayNamePt} (${dayRuler.orixas}) ${moonContext}`;

  const empiricalInsightPt =
    ratedResonant.length >= 2
      ? `Cruzando seus ${ratedResonant.length} registros anteriores em condições astrais semelhantes, sua eficácia média é de ${avgResonantRating.toFixed(
          1
        )}/10 (melhor fluxo em ${bestCat}${bestHistoricalForce ? ` com ${bestHistoricalForce}` : ""}).`
      : `Pela regência de ${dayRuler.dayNamePt} (${dayRuler.planet}), o dia favorece operações com ${dayRuler.orixas}, firmezas e banhos de ${dayRuler.recommendedHerbs}.`;

  return {
    synergyPercent,
    dayRuler,
    recommendedCategory: bestCat,
    recommendedForce,
    recommendedHerbs: dayRuler.recommendedHerbs,
    headlinePt,
    empiricalInsightPt,
    suggestedActionTitle: `Prática de ${dayRuler.dayNamePt} · ${primaryOrixa}`,
    suggestedInfluences: [
      { category: "orixa", name: primaryOrixa },
      { category: "banho_defumacao", name: `Banho de ${firstHerb}` },
    ],
  };
}
