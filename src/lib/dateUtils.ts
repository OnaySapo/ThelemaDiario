/**
 * Utilitários de Data e Hora — Padrão Brasileiro (DD/MM/AA e 24h)
 * Garante que todas as datas e horários do Diário Mágicko operem estritamente
 * no fuso horário local do usuário, sem deslocamento UTC (+3h) e sem formato EUA (MM/DD/YYYY ou AM/PM).
 */

export function parseSafeDate(dateInput?: string | Date | null): Date {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? new Date() : dateInput;
  }
  const str = String(dateInput).trim();
  // Se vier apenas YYYY-MM-DD, interpreta ao meio-dia local para evitar recuo de fuso
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }
  // Se vier YYYY-MM-DDTHH:mm (sem Z e sem offset), interpreta estritamente no fuso local
  const localMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (localMatch) {
    const [, y, m, d, hh, mm, ss] = localMatch;
    return new Date(
      Number(y),
      Number(m) - 1,
      Number(d),
      Number(hh),
      Number(mm),
      ss ? Number(ss) : 0
    );
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Retorna a chave de data local YYYY-MM-DD (sem converter para UTC)
 * Evita que notas criadas após as 21h (GMT-3) caiam no dia seguinte no Calendário e Heatmap.
 */
export function getLocalDateKey(dateInput?: string | Date | null): string {
  const d = parseSafeDate(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Retorna string local YYYY-MM-DDTHH:mm preservando a hora local exata (nunca usa toISOString)
 */
export function toLocalDateTimeValue(dateInput?: string | Date | null): string {
  const d = parseSafeDate(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Converte uma string de data/hora local (YYYY-MM-DDTHH:mm ou ISO) para ISO UTC
 * preservando exatamente o horário local escolhido pelo usuário.
 */
export function localDateTimeToISO(localValue: string): string {
  const d = parseSafeDate(localValue);
  return d.toISOString();
}

/**
 * Formata data no padrão brasileiro curto: DD/MM/AA (ex: 19/10/26)
 */
export function formatDateBR(dateInput?: string | Date | null): string {
  if (!dateInput) return "";
  const d = parseSafeDate(dateInput);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const yearShort = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${yearShort}`;
}

/**
 * Formata data no padrão brasileiro com 4 dígitos no ano: DD/MM/AAAA (ex: 19/10/2026)
 */
export function formatDateFullBR(dateInput?: string | Date | null): string {
  if (!dateInput) return "";
  const d = parseSafeDate(dateInput);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formata horário estritamente no padrão 24h: HH:mm (ex: 14:30, 00:15, 23:45)
 */
export function formatTime24h(dateInput?: string | Date | null): string {
  if (!dateInput) return "00:00";
  const d = parseSafeDate(dateInput);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Formata horário estritamente no padrão 24h com segundos: HH:mm:ss
 */
export function formatTime24hWithSeconds(dateInput?: string | Date | null): string {
  const d = parseSafeDate(dateInput);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Formata data e hora no padrão brasileiro: DD/MM/AA · HH:mm (24h)
 */
export function formatDateTimeBR(dateInput?: string | Date | null, separator = " · "): string {
  if (!dateInput) return "";
  return `${formatDateBR(dateInput)}${separator}${formatTime24h(dateInput)}`;
}

/**
 * Traduz a categoria de influência do Liber 777 para português claro
 */
export function getInfluenceCategoryLabel(category: string): string {
  switch ((category || "").toLowerCase().trim()) {
    case "entity":
      return "Entidade / Divindade";
    case "element":
      return "Elemento / Tattwa";
    case "candle":
      return "Cor / Vela";
    case "incense":
      return "Incenso / Perfume";
    case "tool":
      return "Instrumento Mágicko";
    case "planet":
      return "Planeta / Sephirah";
    case "feeling":
      return "Estado / Sentimento";
    case "person":
      return "Pessoa";
    default:
      return category;
  }
}
