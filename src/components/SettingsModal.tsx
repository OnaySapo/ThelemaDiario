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
  Search,
  HardDrive,
  FolderSync,
  Server,
  AlertCircle,
  FolderOpen,
  Upload,
} from "lucide-react";
import { MagickEntry } from "@/lib/types";
import { getLocalDateKey, formatDateTimeBR, getInfluenceCategoryLabel } from "@/lib/dateUtils";
import { EstrelaDeThelema } from "@/components/ThelemicIcons";
import {
  THEMES,
  ThemeId,
  ThemeMode,
  applyTheme,
  getStoredTheme,
} from "@/lib/theme";

const CITY_PRESETS = [
  { name: "São Paulo, SP (Brasil)", lat: -23.5505, lng: -46.6333 },
  { name: "Rio de Janeiro, RJ (Brasil)", lat: -22.9068, lng: -43.1729 },
  { name: "Brasília, DF (Brasil)", lat: -15.7975, lng: -47.8919 },
  { name: "Belo Horizonte, MG (Brasil)", lat: -19.9167, lng: -43.9345 },
  { name: "Curitiba, PR (Brasil)", lat: -25.4284, lng: -49.2733 },
  { name: "Porto Alegre, RS (Brasil)", lat: -30.0346, lng: -51.2177 },
  { name: "Salvador, BA (Brasil)", lat: -12.9777, lng: -38.5016 },
  { name: "Recife, PE (Brasil)", lat: -8.0476, lng: -34.8770 },
  { name: "Fortaleza, CE (Brasil)", lat: -3.7319, lng: -38.5267 },
  { name: "Manaus, AM (Brasil)", lat: -3.1190, lng: -60.0217 },
  { name: "Belém, PA (Brasil)", lat: -1.4558, lng: -48.4902 },
  { name: "Goiânia, GO (Brasil)", lat: -16.6869, lng: -49.2648 },
  { name: "Florianópolis, SC (Brasil)", lat: -27.5954, lng: -48.5480 },
  { name: "Campinas, SP (Brasil)", lat: -22.9099, lng: -47.0626 },
  { name: "Vitória, ES (Brasil)", lat: -20.3155, lng: -40.3128 },
  { name: "Natal, RN (Brasil)", lat: -5.7945, lng: -35.2110 },
  { name: "João Pessoa, PB (Brasil)", lat: -7.1195, lng: -34.8450 },
  { name: "Maceió, AL (Brasil)", lat: -9.6498, lng: -35.7089 },
  { name: "Aracaju, SE (Brasil)", lat: -10.9472, lng: -37.0731 },
  { name: "Teresina, PI (Brasil)", lat: -5.0920, lng: -42.8038 },
  { name: "São Luís, MA (Brasil)", lat: -2.5307, lng: -44.3068 },
  { name: "Campo Grande, MS (Brasil)", lat: -20.4697, lng: -54.6201 },
  { name: "Cuiabá, MT (Brasil)", lat: -15.6010, lng: -56.0974 },
  { name: "Palmas, TO (Brasil)", lat: -10.2491, lng: -48.3243 },
  { name: "Porto Velho, RO (Brasil)", lat: -8.7619, lng: -63.9039 },
  { name: "Rio Branco, AC (Brasil)", lat: -9.9753, lng: -67.8249 },
  { name: "Boa Vista, RR (Brasil)", lat: 2.8235, lng: -60.6758 },
  { name: "Macapá, AP (Brasil)", lat: 0.0356, lng: -51.0705 },
  { name: "Lisboa, Portugal", lat: 38.7223, lng: -9.1393 },
  { name: "Porto, Portugal", lat: 41.1579, lng: -8.6291 },
  { name: "Londres, Reino Unido", lat: 51.5074, lng: -0.1278 },
  { name: "Cairo, Egito", lat: 30.0444, lng: 31.2357 },
  { name: "Roma, Itália", lat: 41.9028, lng: 12.4964 },
  { name: "Atenas, Grécia", lat: 37.9838, lng: 23.7275 },
  { name: "Paris, França", lat: 48.8566, lng: 2.3522 },
  { name: "Nova York, EUA", lat: 40.7128, lng: -74.0060 },
  { name: "Los Angeles, EUA", lat: 34.0522, lng: -118.2437 },
  { name: "Buenos Aires, Argentina", lat: -34.6037, lng: -58.3816 },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: MagickEntry[];
  onReloadEntries?: () => void;
}

export function SettingsModal({ isOpen, onClose, entries, onReloadEntries }: SettingsModalProps) {
  // Theme States
  const [currentTheme, setCurrentTheme] = useState<ThemeId>("medium");
  const [currentMode, setCurrentMode] = useState<ThemeMode>("dark");

  // Storage Vault States (Local de Armazenamento / Servidor)
  const [storageCurrentPath, setStorageCurrentPath] = useState("");
  const [storageDefaultPath, setStorageDefaultPath] = useState("");
  const [isStorageCustom, setIsStorageCustom] = useState(false);
  const [storageDbSize, setStorageDbSize] = useState(0);
  const [storageBackupCount, setStorageBackupCount] = useState(0);
  const [inputStoragePath, setInputStoragePath] = useState("");
  const [copyExistingNotes, setCopyExistingNotes] = useState(true);
  const [isChangingStorage, setIsChangingStorage] = useState(false);
  const [storageStatusMessage, setStorageStatusMessage] = useState<string | null>(null);
  const [storageStatusType, setStorageStatusType] = useState<"success" | "error" | null>(null);

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

      // Fetch Storage / Vault Location
      fetch("/api/storage")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setStorageCurrentPath(data.currentPath);
            setStorageDefaultPath(data.defaultPath);
            setIsStorageCustom(data.isCustom);
            setStorageDbSize(data.dbSizeBytes || 0);
            setStorageBackupCount(data.backupCount || 0);
            setInputStoragePath(data.currentPath);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleSaveStoragePath = async () => {
    if (!inputStoragePath.trim()) {
      alert("Por favor, digite ou cole o caminho da pasta de destino.");
      return;
    }

    setIsChangingStorage(true);
    setStorageStatusMessage(null);
    try {
      const res = await fetch("/api/storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: inputStoragePath.trim(),
          copyExisting: copyExistingNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStorageCurrentPath(data.activePath);
        setIsStorageCustom(data.isCustom);
        setStorageDbSize(data.dbSizeBytes || 0);
        setStorageBackupCount(data.backupCount || 0);
        setStorageStatusType("success");
        setStorageStatusMessage(data.message || "Local de armazenamento alterado com sucesso!");
        if (onReloadEntries) {
          onReloadEntries();
        }
      } else {
        setStorageStatusType("error");
        setStorageStatusMessage(data.error || "Não foi possível alterar a pasta.");
      }
    } catch (err: any) {
      setStorageStatusType("error");
      setStorageStatusMessage("Erro ao conectar com o servidor: " + err.message);
    } finally {
      setIsChangingStorage(false);
    }
  };

  const handleResetStoragePath = async () => {
    if (!confirm("Deseja voltar o armazenamento para a pasta padrão local do aplicativo?")) return;

    setIsChangingStorage(true);
    setStorageStatusMessage(null);
    try {
      const res = await fetch("/api/storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (data.success) {
        setStorageCurrentPath(data.activePath);
        setIsStorageCustom(false);
        setInputStoragePath(data.activePath);
        setStorageDbSize(data.dbSizeBytes || 0);
        setStorageBackupCount(data.backupCount || 0);
        setStorageStatusType("success");
        setStorageStatusMessage("Armazenamento restaurado para a pasta padrão local!");
        if (onReloadEntries) {
          onReloadEntries();
        }
      } else {
        setStorageStatusType("error");
        setStorageStatusMessage(data.error || "Erro ao restaurar.");
      }
    } catch (err: any) {
      setStorageStatusType("error");
      setStorageStatusMessage(err.message);
    } finally {
      setIsChangingStorage(false);
    }
  };

  const [isSearchingCity, setIsSearchingCity] = useState(false);

  const handleSelectCityPreset = (cityName: string) => {
    const found = CITY_PRESETS.find((p) => p.name === cityName);
    if (found) {
      setGeoCity(found.name);
      setGeoLat(found.lat.toFixed(4));
      setGeoLng(found.lng.toFixed(4));
    }
  };

  const handleSearchCityCoords = async () => {
    if (!geoCity.trim()) return;
    try {
      setIsSearchingCity(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          geoCity.trim()
        )}&limit=1`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const found = data[0];
        setGeoLat(parseFloat(found.lat).toFixed(4));
        setGeoLng(parseFloat(found.lon).toFixed(4));
        setGeoCity(found.display_name.split(",").slice(0, 2).join(",").trim());
        setGeoSaveStatus(`Coordenadas encontradas: ${parseFloat(found.lat).toFixed(4)}, ${parseFloat(found.lon).toFixed(4)}`);
        setTimeout(() => setGeoSaveStatus(null), 3500);
      } else {
        alert("Cidade não encontrada no mapa. Insira as coordenadas manualmente nos campos abaixo.");
      }
    } catch (e: any) {
      alert("Não foi possível buscar as coordenadas online no momento. Digite a latitude e longitude manualmente.");
    } finally {
      setIsSearchingCity(false);
    }
  };

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

  const [isImportingJSON, setIsImportingJSON] = useState(false);
  const [importStatusMsg, setImportStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleExportVaultZip = async () => {
    try {
      setIsExportingVault(true);
      const res = await fetch("/api/export/vault");
      if (!res.ok) throw new Error("Falha na geração do ZIP do Vault.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `diario_magicko_vault_obsidian_${getLocalDateKey(new Date())}.zip`;
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
    downloadAnchor.setAttribute("download", `diario_magicko_backup_${getLocalDateKey(new Date())}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSONFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImportingJSON(true);
    setImportStatusMsg(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.entries) ? parsed.entries : null;
      if (!list || list.length === 0) {
        throw new Error("O arquivo JSON selecionado não contém notas válidas.");
      }

      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: list }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Erro ao importar notas.");
      }

      setImportStatusMsg({
        type: "success",
        text: `${data.importedCount ?? list.length} notas importadas / restauradas com sucesso!`,
      });
      if (onReloadEntries) {
        onReloadEntries();
      }
    } catch (err: any) {
      setImportStatusMsg({
        type: "error",
        text: err.message || "Falha ao ler arquivo JSON de backup.",
      });
    } finally {
      setIsImportingJSON(false);
      e.target.value = "";
    }
  };

  const handleExportMarkdown = () => {
    let mdContent = `# 📜 Diário Mágicko Thelêmico — Exportação Completa\n\n`;
    for (const e of entries) {
      mdContent += `## [${e.type.toUpperCase()}] ${e.title}\n`;
      mdContent += `* **Data**: ${formatDateTimeBR(e.date, " às ")}\n`;
      if (e.thelemic_date) mdContent += `* **Data Thelêmica**: ${e.thelemic_date}\n`;
      if (e.success_rating) mdContent += `* **Sucesso**: ${e.success_rating}/10\n`;
      if (e.influences && e.influences.length > 0) {
        mdContent += `* **Influências**: ${e.influences.map((i) => `${getInfluenceCategoryLabel(i.category)}: ${i.name}`).join(", ")}\n`;
      }
      mdContent += `\n${e.content}\n\n---\n\n`;
    }

    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(mdContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `diario_magicko_notas_${getLocalDateKey(new Date())}.md`);
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

            {/* Seletor Rápido de Cidade por Preset */}
            <div>
              <label className="block text-[10px] font-mono text-medium-400 mb-1 uppercase tracking-wider">
                1. PRESET RÁPIDO DE CAPITAIS / CIDADES HERMÉTICAS
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) handleSelectCityPreset(e.target.value);
                }}
                defaultValue=""
                className="w-full bg-medium-900 border border-medium-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white font-sans"
              >
                <option value="" disabled>
                  Escolha uma cidade da lista para preenchimento imediato...
                </option>
                {CITY_PRESETS.map((p, idx) => (
                  <option key={idx} value={p.name}>
                    {p.name} ({p.lat > 0 ? `${p.lat}°N` : `${Math.abs(p.lat)}°S`}, {p.lng > 0 ? `${p.lng}°L` : `${Math.abs(p.lng)}°O`})
                  </option>
                ))}
              </select>
            </div>

            {/* Inserção Manual / Busca de Qualquer Cidade */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-1">
                <label className="block text-[10px] font-mono text-medium-400 mb-1 uppercase tracking-wider">
                  2. CIDADE MANUAL
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={geoCity}
                    onChange={(e) => setGeoCity(e.target.value)}
                    placeholder="Ex: Sorocaba, Coimbra, etc."
                    className="flex-1 min-w-0 bg-medium-900 border border-medium-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white font-sans"
                  />
                  <button
                    type="button"
                    onClick={handleSearchCityCoords}
                    disabled={isSearchingCity}
                    title="Buscar coordenadas no mapa online sem necessitar de permissão de GPS"
                    className="px-2.5 py-1.5 bg-medium-800 hover:bg-medium-750 text-white rounded border border-medium-700 text-xs transition-colors shrink-0"
                  >
                    <Search className={`w-3.5 h-3.5 ${isSearchingCity ? "animate-spin text-amber-400" : ""}`} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-medium-400 mb-1 uppercase tracking-wider">
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
                <label className="block text-[10px] font-mono text-medium-400 mb-1 uppercase tracking-wider">
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

          {/* ========================================================
              SEÇÃO: LOCAL DE ARMAZENAMENTO DAS NOTAS (VAULT / SERVIDOR)
              ======================================================== */}
          <div className="bg-medium-850 p-4 rounded-lg border border-medium-700 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-medium-750 pb-2.5">
              <div className="flex items-center gap-2 text-white font-semibold font-mono text-xs">
                <HardDrive className="w-4 h-4 text-amber-400" />
                <span>Local de Armazenamento do Diário (Vault / Servidor)</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                  isStorageCustom
                    ? "bg-purple-950/60 text-purple-300 border-purple-500/40"
                    : "bg-medium-800 text-medium-300 border-medium-700"
                }`}
              >
                {isStorageCustom ? "Pasta Customizada / Servidor" : "Pasta Padrão Local"}
              </span>
            </div>

            <p className="text-medium-300 leading-relaxed font-sans text-xs">
              Escolha onde o banco de dados e as anotações são gravados. Você pode apontar para uma pasta em um{" "}
              <strong>servidor de rede</strong>, um <strong>drive compartilhado (NAS/Dropbox/Nextcloud)</strong> ou um
              diretório seguro em outro disco rígido.
            </p>

            {/* Caminho Atual Ativo */}
            <div className="p-2.5 rounded-lg bg-medium-900 border border-medium-750 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-medium-400">
                <span>DIRETÓRIO ATUALMENTE EM USO:</span>
                <span>
                  {storageDbSize > 0 && `${(storageDbSize / (1024 * 1024)).toFixed(2)} MB · `}
                  {storageBackupCount} backups
                </span>
              </div>
              <div className="font-mono text-xs text-amber-300 break-all select-all flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{storageCurrentPath || "Carregando caminho..."}</span>
              </div>
            </div>

            {/* Input para Novo Caminho */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono text-medium-400">
                NOVO CAMINHO DA PASTA DE DESTINO:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputStoragePath}
                  onChange={(e) => setInputStoragePath(e.target.value)}
                  placeholder="Ex: \\192.168.1.50\Servidor\Grimorio ou D:\DiarioMagickoVault"
                  className="flex-1 bg-medium-900 border border-medium-700 rounded px-3 py-2 text-xs text-white placeholder-medium-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
              <p className="text-[10px] text-medium-400 font-mono">
                Dica: Você pode digitar o caminho absoluto do Windows (ex:{" "}
                <code className="text-amber-200">D:\MinhasNotas</code>) ou endereço UNC de rede (ex:{" "}
                <code className="text-amber-200">\\servidor\compartilhamento</code>).
              </p>
            </div>

            {/* Checkbox: Migrar dados existentes */}
            <label className="flex items-center gap-2 text-xs text-medium-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={copyExistingNotes}
                onChange={(e) => setCopyExistingNotes(e.target.checked)}
                className="w-4 h-4 rounded border-medium-700 bg-medium-900 text-amber-400 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span>Copiar automaticamente todas as notas e backups atuais para a nova pasta</span>
            </label>

            {/* Ações e Feedback */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-medium-750">
              <button
                type="button"
                onClick={handleResetStoragePath}
                disabled={!isStorageCustom || isChangingStorage}
                className="px-3 py-1.5 bg-medium-800 hover:bg-medium-750 disabled:opacity-40 text-medium-300 hover:text-white rounded text-xs font-mono border border-medium-700 transition-colors"
                title="Volta o banco de dados para a pasta padrão 'data/' dentro do projeto"
              >
                Restaurar Padrão Local
              </button>

              <button
                type="button"
                onClick={handleSaveStoragePath}
                disabled={
                  isChangingStorage ||
                  !inputStoragePath.trim() ||
                  inputStoragePath.trim().toLowerCase() === storageCurrentPath.toLowerCase()
                }
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-black font-semibold rounded text-xs transition-colors flex items-center gap-2 shadow-sm"
              >
                <FolderSync className={`w-3.5 h-3.5 ${isChangingStorage ? "animate-spin" : ""}`} />
                <span>{isChangingStorage ? "Alterando e migrando..." : "Mudar Pasta de Armazenamento"}</span>
              </button>
            </div>

            {/* Mensagem de Status */}
            {storageStatusMessage && (
              <div
                className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs font-mono animate-fadeIn ${
                  storageStatusType === "success"
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                    : "bg-rose-950/40 border-rose-500/40 text-rose-200"
                }`}
              >
                {storageStatusType === "success" ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{storageStatusMessage}</span>
              </div>
            )}
          </div>

          {/* Export / Backup */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-medium-300 uppercase tracking-wider font-mono">
              Exportação, Importação & Backup
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

              <label
                className="flex items-center gap-2 px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 rounded border border-amber-500/40 text-xs font-medium transition-colors cursor-pointer"
                title="Importa ou restaura notas de um arquivo .JSON exportado anteriormente (sem apagar suas notas atuais)"
              >
                <Upload className={`w-4 h-4 text-amber-300 ${isImportingJSON ? "animate-bounce" : ""}`} />
                <span>{isImportingJSON ? "Importando..." : "Importar / Restaurar Backup (.JSON)"}</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJSONFile}
                  disabled={isImportingJSON}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleExportMarkdown}
                className="flex items-center gap-2 px-3.5 py-2 bg-medium-850 hover:bg-medium-800 text-white rounded border border-medium-700 text-xs font-medium transition-colors"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Exportar Caderno em Markdown</span>
              </button>
            </div>

            {importStatusMsg && (
              <div
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-mono ${
                  importStatusMsg.type === "success"
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                    : "bg-rose-950/40 border-rose-500/40 text-rose-200"
                }`}
              >
                {importStatusMsg.type === "success" ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{importStatusMsg.text}</span>
              </div>
            )}
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
