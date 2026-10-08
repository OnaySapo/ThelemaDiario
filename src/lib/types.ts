export type CategoryName = "Estudo" | "Visão Astral" | "Sonho" | "Oráculo" | "Prática";

export interface MagickEntry {
  id: string;
  type: string; // "Estudo" | "Visão Astral" | "Sonho" | "Oráculo" | "Prática" (or legacy keys)
  title: string;
  content: string;
  date: string;
  success_rating: number; // 0 to 10
  thelemic_date?: string;
  sun_sign?: string;
  sun_degree?: number;
  moon_sign?: string;
  moon_degree?: number;
  moon_phase?: string;
  moon_illumination?: number;
  planetary_day?: string;
  planetary_hour?: string;
  mental_state_before?: string;
  mental_state_after?: string;
  tags?: string[];
  influences?: { category: string; name: string }[];
  connections?: { target_id: string; relationship_type: string; notes?: string }[];
  oracle_data?: {
    system: string;
    spread_name: string;
    query: string;
    cards: Array<{ position: string; cardId: string; cardName: string; notes?: string }>;
    confirmation_notes?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export function normalizeCategory(rawType: string): CategoryName {
  const lower = (rawType || "").toLowerCase();
  if (lower.includes("estudo") || lower === "study") return "Estudo";
  if (lower.includes("visão") || lower.includes("visao") || lower === "vision") return "Visão Astral";
  if (lower.includes("sonho") || lower === "dream") return "Sonho";
  if (lower.includes("oráculo") || lower.includes("oraculo") || lower === "oracle") return "Oráculo";
  return "Prática"; // default / ritual / practice
}

export interface AnalyticalSummary {
  totalEntries: number;
  ritualsCount: number;
  oraclesCount: number;
  dreamsCount: number;
  averageSuccess: number;
  bestMoonPhases: Array<{ phase: string; count: number; avgRating: number }>;
  bestMoonSigns: Array<{ sign: string; count: number; avgRating: number }>;
  bestEntities: Array<{ name: string; count: number; avgRating: number }>;
  bestTools: Array<{ name: string; count: number; avgRating: number }>;
  bestIncenses: Array<{ name: string; count: number; avgRating: number }>;
  topTags: Array<{ tag: string; count: number }>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: string[];
}
