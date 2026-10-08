import { MagickEntry, AnalyticalSummary } from "./types";

export function computeStatisticalInsights(entries: MagickEntry[]): AnalyticalSummary {
  const rituals = entries.filter((e) => e.type === "ritual" || (e.success_rating && e.success_rating > 0));
  const oracles = entries.filter((e) => e.type === "oracle");
  const dreams = entries.filter((e) => e.type === "dream");

  const totalSuccess = rituals.reduce((acc, curr) => acc + (curr.success_rating || 0), 0);
  const averageSuccess = rituals.length > 0 ? Math.round((totalSuccess / rituals.length) * 10) / 10 : 0;

  // 1. Group by Moon Phase
  const moonPhaseMap = new Map<string, { total: number; count: number }>();
  for (const r of rituals) {
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
  for (const r of rituals) {
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

  // 3. Group by Entities
  const entityMap = new Map<string, { total: number; count: number }>();
  // 4. Group by Tools
  const toolMap = new Map<string, { total: number; count: number }>();
  // 5. Group by Incenses
  const incenseMap = new Map<string, { total: number; count: number }>();

  for (const r of rituals) {
    if (r.influences) {
      for (const inf of r.influences) {
        if (inf.category === "entity") {
          const cur = entityMap.get(inf.name) || { total: 0, count: 0 };
          cur.total += r.success_rating || 0;
          cur.count += 1;
          entityMap.set(inf.name, cur);
        } else if (inf.category === "tool") {
          const cur = toolMap.get(inf.name) || { total: 0, count: 0 };
          cur.total += r.success_rating || 0;
          cur.count += 1;
          toolMap.set(inf.name, cur);
        } else if (inf.category === "incense") {
          const cur = incenseMap.get(inf.name) || { total: 0, count: 0 };
          cur.total += r.success_rating || 0;
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

  // Tags
  const tagMap = new Map<string, number>();
  for (const e of entries) {
    if (e.tags) {
      for (const t of e.tags) {
        tagMap.set(t, (tagMap.get(t) || 0) + 1);
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
