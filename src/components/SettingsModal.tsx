"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Key,
  Database,
  Download,
  ShieldCheck,
  Check,
  Sparkles,
  Cpu,
  Palette,
  Sun,
  Moon,
  MapPin,
  Navigation,
  Archive,
  Globe,
} from "lucide-react";
import { MagickEntry } from "@/lib/types";
import { EstrelaDeThelema } from "@/components/ThelemicIcons";
import {
  THEMES,
  ThemeId,
  ThemeMode,
  applyTheme,
  getStoredTheme,
} from "@/lib/theme";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: MagickEntry[];
}

export function SettingsModal({ isOpen, onClose, entries }: SettingsModalProps) {
  // Theme States
  const [currentTheme, setCurrentTheme] = useState<ThemeId>("medium");
  const [currentMode, setCurrentMode] = useState<ThemeMode>("dark");

  // Geolocation States
  const [geoCity, setGeoCity] = useState("São Paulo, SP");
  const [geoLat, setGeoLat] = useState("-23.5505");
  const [geoLng, setGeoLng] = useState("-46.6333");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [geoSaveStatus, setGeoSaveStatus] = useState<string | null>(null);

  // Vault Zip Export State
  const [isExportingVault, setIsExportingVault] = useState(false);

  // OpenRouter States
  const [apiKey, setApiKey] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    // Load initial theme from localStorage
    const stored = getStoredTheme();
    setCurrentTheme(stored.theme);
    setCurrentMode(stored.mode);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Sync theme from server settings if available
      fetch("/api/settings?key=theme")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.value) {
            setCurrentTheme(data.value as ThemeId);
          }
        })
        .catch(() => {});

      fetch("/api/settings?key=theme_mode")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.value) {
            setCurrentMode(data.value as ThemeMode);
          }
        })
        .catch(() => {});

      // Fetch OpenRouter Key
      fetch("/api/settings?key=openrouter_api_key")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setHasKey(data.hasKey);
            setMaskedKey(data.masked || "");
          }
        })
        .catch((err) => console.error("Erro ao carregar key:", err));

      // Fetch OpenRouter Model
      fetch("/api/settings?key=openrouter_model")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.hasKey) {
            setSelectedModel(data.value || data.masked || "google/gemini-2.5-flash");
          }
        })
        .catch((err) => console.error("Erro ao carregar modelo:", err));

      // Fetch Geolocation Settings
      fetch("/api/settings?key=geo_city")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.value) setGeoCity(data.value);
        })
        .catch(() => {});

      fetch("/api/settings?key=geo_latitude")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.value) setGeoLat(data.value);
        })
        .catch(() => {});

      fetch("/api/settings?key=geo_longitude")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.value) setGeoLng(data.value);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleDetectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Geolocalização não é suportada por este dispositivo.");
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        setGeoLat(lat);
        setGeoLng(lng);
        setGeoCity("Localização Detectada via GPS");
        setIsDetectingLocation(false);
      },
      (err) => {
        setIsDetectingLocation(false);
        alert("Não foi possível detectar localização: " + err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSaveGeo = async () => {
    try {
      await Promise.all([
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "geo_city", value: geoCity.trim() }),
        }),
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "geo_latitude", value: geoLat.trim() }),
        }),
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "geo_longitude", value: geoLng.trim() }),
        }),
      ]);
      setGeoSaveStatus("Localização salva! Horas planetárias temporais atualizadas.");
      setTimeout(() => setGeoSaveStatus(null), 3500);
    } catch (e) {
      alert("Erro ao salvar localização.");
    }
  };

  const handleExportVaultZip = async () => {
    try {
      setIsExportingVault(true);
      const res = await fetch("/api/export/vault");
      if (!res.ok) throw new Error("Falha na geração do ZIP do Vault.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `diario_magicko_vault_obsidian_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Erro ao exportar vault: " + err.message);
    } finally {
      setIsExportingVault(false);
    }
  };

  const handleSelectTheme = async (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    applyTheme(themeId, currentMode);

    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "theme", value: themeId }),
      });
    } catch (e) {
      console.error("Erro ao salvar tema no servidor:", e);
    }
  };

  const handleSelectMode = async (mode: ThemeMode) => {
    setCurrentMode(mode);
    applyTheme(currentTheme, mode);

    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "theme_mode", value: mode }),
      });
    } catch (e) {
      console.error("Erro ao salvar modo no servidor:", e);
    }
  };

  const handleSaveSettings = async () => {
    try {
      if (apiKey.trim()) {
        await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "openrouter_api_key", value: apiKey.trim() }),
        });
        setHasKey(true);
        setMaskedKey(`${apiKey.trim().slice(0, 8)}...${apiKey.trim().slice(-4)}`);
        setApiKey("");
      }

      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "openrouter_model", value: selectedModel.trim() }),
      });

      setSaveStatus("Configurações do OpenRouter salvas com sucesso!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      alert("Erro ao salvar configurações.");
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `diario_magicko_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportMarkdown = () => {
    let mdContent = `# 📜 Diário Mágicko Thelêmico — Exportação Completa\n\n`;
    for (const e of entries) {
      mdContent += `## [${e.type.toUpperCase()}] ${e.title}\n`;
      mdContent += `* **Data**: ${e.date}\n`;
      if (e.thelemic_date) mdContent += `* **Data Thelêmica**: ${e.thelemic_date}\n`;
      if (e.success_rating) mdContent += `* **Sucesso**: ${e.success_rating}/10\n`;
      if (e.influences && e.influences.length > 0) {
        mdContent += `* **Influências**: ${e.influences.map((i) => `${i.category}: ${i.name}`).join(", ")}\n`;
      }
      mdContent += `\n${e.content}\n\n---\n\n`;
    }

    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(mdContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `diario_magicko_notas_${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-medium-900 border border-medium-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-medium-700 bg-medium-850 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <EstrelaDeThelema className="w-5 h-5 text-white" />
            <h2 className="text-sm font-sans font-bold text-white uppercase tracking-wide">
              Configurações, Temas & IA
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-medium-400 hover:text-white rounded hover:bg-medium-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-medium-200 overflow-y-auto">
          {/* ========================================================
              SEÇÃO: PALETAS DE CORES & TEMAS (LIGHT / DARK)
              ======================================================== */}
          <div className="bg-medium-850 p-4 rounded-lg border border-medium-700 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-medium-750 pb-2.5">
              <div className="flex items-center gap-2 text-white font-semibold font-mono text-xs">
                <Palette className="w-4 h-4 text-white" />
                <span>Paleta de Cores & Aparência</span>
              </div>
              <span className="text-[11px] font-mono text-medium-400">
                Ativo:{" "}
                <strong className="text-white uppercase">
                  {THEMES.find((t) => t.id === currentTheme)?.name || currentTheme} (
                  {currentMode === "dark" ? "Escuro" : "Claro"})
                </strong>
              </span>
            </div>

            {/* Seletor de Modo: Claro / Escuro */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-medium-400 mb-2 uppercase tracking-wider">
                1. MODO DE APARÊNCIA
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectMode("dark")}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border transition-all text-xs font-semibold ${
                    currentMode === "dark"
                      ? "bg-white text-black border-white shadow-sm ring-1 ring-white"
                      : "bg-medium-900 border-medium-750 text-medium-300 hover:text-white hover:bg-medium-800"
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Modo Escuro (Dark)</span>
                  {currentMode === "dark" && <Check className="w-3.5 h-3.5 ml-1 stroke-[3]" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectMode("light")}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border transition-all text-xs font-semibold ${
                    currentMode === "light"
                      ? "bg-white text-black border-white shadow-sm ring-1 ring-white"
                      : "bg-medium-900 border-medium-750 text-medium-300 hover:text-white hover:bg-medium-800"
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Modo Claro (Light)</span>
                  {currentMode === "light" && <Check className="w-3.5 h-3.5 ml-1 stroke-[3]" />}
                </button>
              </div>
            </div>

            {/* Seletor de Família do Tema (7 Temas) */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-medium-400 mb-2 uppercase tracking-wider">
                2. FAMÍLIA VISUAL DO TEMA ({THEMES.length} PALETAS)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {THEMES.map((theme) => {
                  const isSelected = currentTheme === theme.id;
                  const preview = theme.preview[currentMode];

                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`text-left p-3 rounded-lg border transition-all relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? "bg-medium-800 border-white ring-1 ring-white shadow-sm"
                          : "bg-medium-900 border-medium-750 hover:border-medium-600 hover:bg-medium-800/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-white">
                              {theme.name}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-medium-750 text-medium-300 border border-medium-700">
                              {theme.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-medium-400 line-clamp-1 mt-0.5">
                            {theme.tagline}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center shrink-0 shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Amostras das 4 cores do tema no modo selecionado */}
                      <div className="flex items-center gap-1.5 pt-2 border-t border-medium-750/70">
                        <span className="text-[9px] font-mono text-medium-500 mr-1">Paleta:</span>
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: preview.bg }}
                          title={`Fundo: ${preview.bg}`}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: preview.surface }}
                          title={`Superfície: ${preview.surface}`}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: preview.accent }}
                          title={`Destaque: ${preview.accent}`}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: preview.text }}
                          title={`Texto: ${preview.text}`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Database Info */}
          <div className="bg-medium-850 p-4 rounded-lg border border-medium-700 space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold font-mono text-xs">
              <Database className="w-4 h-4 text-white" />
              <span>Banco de Dados Local Próprio (SQLite)</span>
            </div>
            <p className="text-medium-300 leading-relaxed font-sans">
              Todos os seus rituais, oráculos, sonhos e conexões residem localmente em:
            </p>
            <code className="block bg-medium-900 p-2.5 rounded border border-medium-750 text-white font-mono text-[11px] select-all">
              data/magick_diary.db
            </code>
            <p className="text-medium-400 text-[11px]">
              Soberania total: zero servidores de terceiros armazenando suas anotações.
            </p>
          </div>

          {/* Localização Geográfica (Horas Planetárias Reais) */}
          <div className="bg-medium-850 p-4 rounded-lg border border-medium-700 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-medium-750 pb-2">
              <div className="flex items-center gap-2 text-white font-semibold font-mono text-xs">
                <MapPin className="w-4 h-4 text-white" />
                <span>Localização & Horas Planetárias Temporais</span>
              </div>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-medium-800 hover:bg-medium-750 text-white rounded text-[11px] font-mono border border-medium-700 transition-colors"
                title="Detectar automaticamente latitude e longitude do dispositivo"
              >
                <Navigation className={`w-3 h-3 ${isDetectingLocation ? "animate-spin" : ""}`} />
                <span>{isDetectingLocation ? "Detectando GPS..." : "Detectar Localização Atual"}</span>
              </button>
            </div>

            <p className="text-medium-300 leading-relaxed font-sans text-[11px]">
              O cálculo das <strong>Horas Planetárias Thelêmicas e Herméticas</strong> é temporal, dividindo o intervalo exato entre o Nascer e o Pôr do Sol em 12 horas diurnas e 12 noturnas. Configure suas coordenadas para máxima precisão mágica.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] font-mono text-medium-400 mb-1">
                  CIDADE / LOCALIDADE
                </label>
                <input
                  type="text"
                  value={geoCity}
                  onChange={(e) => setGeoCity(e.target.value)}
                  placeholder="Ex: São Paulo, SP"
                  className="w-full bg-medium-900 border border-medium-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-medium-400 mb-1">
                  LATITUDE (°DECIMAL)
                </label>
                <input
                  type="text"
                  value={geoLat}
                  onChange={(e) => setGeoLat(e.target.value)}
                  placeholder="-23.5505"
                  className="w-full bg-medium-900 border border-medium-700 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-medium-400 mb-1">
                  LONGITUDE (°DECIMAL)
                </label>
                <input
                  type="text"
                  value={geoLng}
                  onChange={(e) => setGeoLng(e.target.value)}
                  placeholder="-46.6333"
                  className="w-full bg-medium-900 border border-medium-700 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-medium-400 font-mono">
                Padrão: São Paulo (-23.5505, -46.6333).
              </span>
              <button
                type="button"
                onClick={handleSaveGeo}
                className="px-3.5 py-1.5 bg-white hover:bg-medium-200 text-black font-semibold rounded text-xs transition-colors"
              >
                Salvar Localização
              </button>
            </div>

            {geoSaveStatus && (
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono">
                <Check className="w-3.5 h-3.5" />
                <span>{geoSaveStatus}</span>
              </div>
            )}
          </div>

          {/* OpenRouter Configuration */}
          <div className="bg-medium-850 p-4 rounded-lg border border-medium-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-semibold font-mono text-xs">
                <Cpu className="w-4 h-4 text-white" />
                <span>IA do Frater Auxiliar (OpenRouter)</span>
              </div>
              {hasKey && (
                <span className="px-2 py-0.5 rounded bg-medium-800 text-white border border-medium-700 text-[10px] font-mono">
                  Ativa: {maskedKey}
                </span>
              )}
            </div>

            <p className="text-medium-300 leading-relaxed font-sans">
              O Frater Auxiliar utiliza sua chave do <strong>OpenRouter</strong> para responder consultas e correlacionar dados do diário com alta inteligência hermética.
            </p>

            <div>
              <label className="block text-[11px] font-mono text-medium-400 mb-1">
                CHAVE DE API OPENROUTER
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasKey ? "Chave configurada (digite para substituir)..." : "sk-or-v1-..."}
                className="w-full bg-medium-900 border border-medium-700 rounded px-3 py-2 text-xs text-white placeholder-medium-500 focus:outline-none focus:border-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-medium-400 mb-1">
                MODELO DE IA DO OPENROUTER
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-medium-900 border border-medium-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono"
              >
                <option value="google/gemini-2.5-flash">google/gemini-2.5-flash (Recomendado: Rápido & Econômico)</option>
                <option value="anthropic/claude-3.5-sonnet">anthropic/claude-3.5-sonnet (Máxima Erudição & Profundidade)</option>
                <option value="deepseek/deepseek-chat">deepseek/deepseek-chat (Alta Eficiência)</option>
                <option value="meta-llama/llama-3.3-70b-instruct">meta-llama/llama-3.3-70b-instruct (Open Source)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-medium-400 font-mono">
                Tokens limitados automaticamente para economia de créditos.
              </span>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-white hover:bg-medium-200 text-black font-semibold rounded text-xs transition-colors"
              >
                Salvar Configurações
              </button>
            </div>

            {saveStatus && (
              <div className="flex items-center gap-1.5 text-white text-xs font-mono">
                <Check className="w-3.5 h-3.5" />
                <span>{saveStatus}</span>
              </div>
            )}
          </div>

          {/* Export / Backup */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-medium-300 uppercase tracking-wider font-mono">
              Exportação & Backup
            </span>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportVaultZip}
                disabled={isExportingVault}
                className="flex items-center gap-2 px-3.5 py-2 bg-purple-900/30 hover:bg-purple-900/50 text-purple-200 rounded border border-purple-600/50 text-xs font-medium transition-colors shadow-sm"
                title="Exporta o cofre completo com pastas por categoria, frontmatter YAML e anexos para abrir diretamente no Obsidian"
              >
                <Archive className={`w-4 h-4 text-purple-300 ${isExportingVault ? "animate-pulse" : ""}`} />
                <span>{isExportingVault ? "Gerando Vault ZIP..." : "Exportar Vault Completo (.ZIP para Obsidian)"}</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="flex items-center gap-2 px-3.5 py-2 bg-medium-850 hover:bg-medium-800 text-white rounded border border-medium-700 text-xs font-medium transition-colors"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Exportar Tudo em JSON</span>
              </button>

              <button
                onClick={handleExportMarkdown}
                className="flex items-center gap-2 px-3.5 py-2 bg-medium-850 hover:bg-medium-800 text-white rounded border border-medium-700 text-xs font-medium transition-colors"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Exportar Caderno em Markdown</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-medium-700 bg-medium-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-medium-800 hover:bg-medium-750 text-white rounded text-xs font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
