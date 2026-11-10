export type ThemeId =
  | "medium"
  | "terra-brasilis"
  | "rose-pine"
  | "catppuccin"
  | "nord"
  | "gruvbox"
  | "dracula"
  | "tokyo-night";

export type ThemeMode = "dark" | "light";

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  tagline: string;
  badge: string;
  preview: {
    dark: {
      bg: string;
      surface: string;
      accent: string;
      text: string;
    };
    light: {
      bg: string;
      surface: string;
      accent: string;
      text: string;
    };
  };
}

/**
 * Tema Único e Coeso do Programa ("Sanctum")
 * Suporta apenas alternância limpa entre Modo Escuro (Obsidiana) e Modo Claro (Papel)
 */
export const THEMES: ThemeDefinition[] = [
  {
    id: "medium",
    name: "Sanctum Minimal",
    tagline: "Design único, sóbrio, silencioso e coeso",
    badge: "Padrão Único",
    preview: {
      dark: {
        bg: "#0e0e11",
        surface: "#16161a",
        accent: "#d4af37",
        text: "#ececef",
      },
      light: {
        bg: "#faf9f6",
        surface: "#ffffff",
        accent: "#18181b",
        text: "#1f1f23",
      },
    },
  },
];

export function applyTheme(_theme: ThemeId = "medium", mode: ThemeMode = "dark") {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  // Sempre fixa o tema único coeso ("medium")
  root.setAttribute("data-theme", "medium");
  root.setAttribute("data-mode", mode);

  if (mode === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }

  try {
    localStorage.setItem("magick_theme", "medium");
    localStorage.setItem("magick_mode", mode);
  } catch (e) {
    console.error("Erro ao salvar modo visual no localStorage:", e);
  }
}

export function getStoredTheme(): { theme: ThemeId; mode: ThemeMode } {
  if (typeof window === "undefined") {
    return { theme: "medium", mode: "dark" };
  }

  try {
    const mode = (localStorage.getItem("magick_mode") as ThemeMode) || "dark";
    const validModes: ThemeMode[] = ["dark", "light"];

    return {
      theme: "medium",
      mode: validModes.includes(mode) ? mode : "dark",
    };
  } catch (e) {
    return { theme: "medium", mode: "dark" };
  }
}
