export type ThemeId =
  | "medium"
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

export const THEMES: ThemeDefinition[] = [
  {
    id: "medium",
    name: "Medium",
    tagline: "Editorial Minimalista",
    badge: "Padrão",
    preview: {
      dark: {
        bg: "#121212",
        surface: "#1e1e1e",
        accent: "#ffffff",
        text: "#e5e5e5",
      },
      light: {
        bg: "#fcfcfb",
        surface: "#ffffff",
        accent: "#181818",
        text: "#222222",
      },
    },
  },
  {
    id: "rose-pine",
    name: "Rosé Pine",
    tagline: "Sobriedade Floral & Mística",
    badge: "Floral",
    preview: {
      dark: {
        bg: "#191724",
        surface: "#1f1d2e",
        accent: "#ebbcba",
        text: "#e0def4",
      },
      light: {
        bg: "#faf4ed",
        surface: "#fffaf3",
        accent: "#b4637a",
        text: "#575279",
      },
    },
  },
  {
    id: "catppuccin",
    name: "Catppuccin",
    tagline: "Pastel & Harmonia Calmante",
    badge: "Aconchego",
    preview: {
      dark: {
        bg: "#1e1e2e",
        surface: "#181825",
        accent: "#cba6f7",
        text: "#cdd6f4",
      },
      light: {
        bg: "#eff1f5",
        surface: "#e6e9ef",
        accent: "#8839ef",
        text: "#4c4f69",
      },
    },
  },
  {
    id: "nord",
    name: "Nord",
    tagline: "Geometria Ártica & Azuis Frios",
    badge: "Ártico",
    preview: {
      dark: {
        bg: "#2e3440",
        surface: "#3b4252",
        accent: "#88c0d0",
        text: "#e5e9f0",
      },
      light: {
        bg: "#eceff4",
        surface: "#f0f2f7",
        accent: "#5e81ac",
        text: "#2e3440",
      },
    },
  },
  {
    id: "gruvbox",
    name: "Gruvbox",
    tagline: "Retrô Quente & Tons de Terra",
    badge: "Orgânico",
    preview: {
      dark: {
        bg: "#282828",
        surface: "#3c3836",
        accent: "#fabd2f",
        text: "#ebdbb2",
      },
      light: {
        bg: "#fbf1c7",
        surface: "#ebdbb2",
        accent: "#b57614",
        text: "#3c3836",
      },
    },
  },
  {
    id: "dracula",
    name: "Drácula",
    tagline: "Vampírico & Contrastes Roxos",
    badge: "Gótico",
    preview: {
      dark: {
        bg: "#282a36",
        surface: "#21222c",
        accent: "#bd93f9",
        text: "#f8f8f2",
      },
      light: {
        bg: "#f8f8f2",
        surface: "#ffffff",
        accent: "#7d56c2",
        text: "#282a36",
      },
    },
  },
  {
    id: "tokyo-night",
    name: "Tokyo Night",
    tagline: "Neon Cyberpunk & Noite Urbana",
    badge: "Cyber",
    preview: {
      dark: {
        bg: "#1a1b26",
        surface: "#1f2335",
        accent: "#7aa2f7",
        text: "#c0caf5",
      },
      light: {
        bg: "#e1e2e7",
        surface: "#ebedf3",
        accent: "#2e7de9",
        text: "#343b58",
      },
    },
  },
];

export function applyTheme(theme: ThemeId, mode: ThemeMode) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-mode", mode);

  // Sync Tailwind .dark class for compatibility
  if (mode === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }

  try {
    localStorage.setItem("magick_theme", theme);
    localStorage.setItem("magick_mode", mode);
  } catch (e) {
    console.error("Erro ao salvar tema no localStorage:", e);
  }
}

export function getStoredTheme(): { theme: ThemeId; mode: ThemeMode } {
  if (typeof window === "undefined") {
    return { theme: "medium", mode: "dark" };
  }

  try {
    const theme = (localStorage.getItem("magick_theme") as ThemeId) || "medium";
    const mode = (localStorage.getItem("magick_mode") as ThemeMode) || "dark";
    const validThemes: ThemeId[] = [
      "medium",
      "rose-pine",
      "catppuccin",
      "nord",
      "gruvbox",
      "dracula",
      "tokyo-night",
    ];
    const validModes: ThemeMode[] = ["dark", "light"];

    return {
      theme: validThemes.includes(theme) ? theme : "medium",
      mode: validModes.includes(mode) ? mode : "dark",
    };
  } catch (e) {
    return { theme: "medium", mode: "dark" };
  }
}
