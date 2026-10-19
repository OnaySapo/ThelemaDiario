import { MagickEntry, AnalyticalSummary, normalizeCategory } from "./types";

export function computeStatisticalInsights(entries: MagickEntry[]): AnalyticalSummary {
  const rituals = entries.filter((e) => {
    const cat = normalizeCategory(e.type);
    return cat === "Prática" || (e.success_rating !== undefined && e.success_rating !== null && e.success_rating > 0);
  });
  const oracles = entries.filter((e) => normalizeCategory(e.type) === "Oráculo");
  const dreams = entries.filter((e) => {
    const cat = normalizeCategory(e.type);
    return cat === "Sonho" || cat === "Visão Astral";
  });

  const ratedEntries = entries.filter(
    (e) => e.success_rating !== undefined && e.success_rating !== null && e.success_rating > 0
  );
  const totalSuccess = ratedEntries.reduce((acc, curr) => acc + (curr.success_rating || 0), 0);
  const averageSuccess =
    ratedEntries.length > 0 ? Math.round((totalSuccess / ratedEntries.length) * 10) / 10 : 0;

  // 1. Group by Moon Phase
  const moonPhaseMap = new Map<string, { total: number; count: number }>();
  for (const r of ratedEntries) {
    if (r.moon_phase) {
      const cur = moonPhaseMap.get(r.moon_phase) || { total: 0, count: 0 };
      cur.total += r.success_rating || 0;
      cur.count += 1;
      moonPhaseMap.set(r.moon_phase, cur);
    }
  }
  const bestMoonPhases = Array.from(moonPhaseMap.entries())
    .map(([phase, val]) => ({
      phase,
      count: val.count,
      avgRating: Math.round((val.total / val.count) * 10) / 10,
    }))
    .sort((a, b) => b.avgRating - a.avgRating);

  // 2. Group by Moon Sign
  const moonSignMap = new Map<string, { total: number; count: number }>();
  for (const r of ratedEntries) {
    if (r.moon_sign) {
      const cur = moonSignMap.get(r.moon_sign) || { total: 0, count: 0 };
      cur.total += r.success_rating || 0;
      cur.count += 1;
      moonSignMap.set(r.moon_sign, cur);
    }
  }
  const bestMoonSigns = Array.from(moonSignMap.entries())
    .map(([sign, val]) => ({
      sign,
      count: val.count,
      avgRating: Math.round((val.total / val.count) * 10) / 10,
    }))
    .sort((a, b) => b.avgRating - a.avgRating);

  // 3. Group by Entities / Deities / Angels
  const entityMap = new Map<string, { total: number; count: number }>();
  // 4. Group by Tools / Instruments
  const toolMap = new Map<string, { total: number; count: number }>();
  // 5. Group by Incenses / Herbs
  const incenseMap = new Map<string, { total: number; count: number }>();

  for (const r of entries) {
    const ratingVal = r.success_rating ?? 8;
    if (r.influences) {
      for (const inf of r.influences) {
        const cat = (inf.category || "").toLowerCase();
        if (cat === "entity" || cat === "deity" || cat === "angel") {
          const cur = entityMap.get(inf.name) || { total: 0, count: 0 };
          cur.total += ratingVal;
          cur.count += 1;
          entityMap.set(inf.name, cur);
        } else if (cat === "tool" || cat === "instrument") {
          const cur = toolMap.get(inf.name) || { total: 0, count: 0 };
          cur.total += ratingVal;
          cur.count += 1;
          toolMap.set(inf.name, cur);
        } else if (cat === "incense" || cat === "herb" || cat === "herb_crystal") {
          const cur = incenseMap.get(inf.name) || { total: 0, count: 0 };
          cur.total += ratingVal;
          cur.count += 1;
          incenseMap.set(inf.name, cur);
        }
      }
    }
  }

  const bestEntities = Array.from(entityMap.entries())
    .map(([name, val]) => ({
      name,
      count: val.count,
      avgRating: Math.round((val.total / val.count) * 10) / 10,
    }))
    .sort((a, b) => b.avgRating - a.avgRating);

  const bestTools = Array.from(toolMap.entries())
    .map(([name, val]) => ({
      name,
      count: val.count,
      avgRating: Math.round((val.total / val.count) * 10) / 10,
    }))
    .sort((a, b) => b.avgRating - a.avgRating);

  const bestIncenses = Array.from(incenseMap.entries())
    .map(([name, val]) => ({
      name,
      count: val.count,
      avgRating: Math.round((val.total / val.count) * 10) / 10,
    }))
    .sort((a, b) => b.avgRating - a.avgRating);

  // Tags + Liber 777 Influences combined
  const tagMap = new Map<string, number>();
  for (const e of entries) {
    if (e.tags) {
      for (const t of e.tags) {
        tagMap.set(t, (tagMap.get(t) || 0) + 1);
      }
    }
    if (e.influences) {
      for (const inf of e.influences) {
        tagMap.set(inf.name, (tagMap.get(inf.name) || 0) + 1);
      }
    }
  }
  const topTags = Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalEntries: entries.length,
    ritualsCount: rituals.length,
    oraclesCount: oracles.length,
    dreamsCount: dreams.length,
    averageSuccess,
    bestMoonPhases,
    bestMoonSigns,
    bestEntities,
    bestTools,
    bestIncenses,
    topTags,
  };
}
