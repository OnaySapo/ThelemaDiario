export type CategoryName = "Diário" | "Estudo" | "Visão Astral" | "Sonho" | "Oráculo" | "Prática";

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
    cards: Array<{
      position: string;
      cardId: string;
      cardName: string;
      imageUrl?: string;
      imageFile?: string;
      x?: number; // 0 a 100% da largura da mesa
      y?: number; // 0 a 100% da altura da mesa
      rotation?: number; // graus (0, 90, 180, 270)
      isFlipped?: boolean; // false = verso da carta, true = face revelada
      cardBack?: "rosa_cruz" | "thelema";
      notes?: string;
    }>;
    card_back_style?: "rosa_cruz" | "thelema";
    ai_interpretation?: string;
    confirmation_notes?: string;
    querent_name?: string; // Nome da pessoa foco da tiragem
    querent_birthdate?: string; // AAAA-MM-DD (opcional)
  };
  created_at?: string;
  updated_at?: string;
}

export function normalizeCategory(rawType: string): CategoryName {
  const lower = (rawType || "").toLowerCase();
  if (lower.includes("diário") || lower.includes("diario") || lower === "journal" || lower === "mundane" || lower === "daily") return "Diário";
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

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
}
