"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  FolderOpen,
  Plus,
  Check,
  X,
  HardDrive,
  FileText,
  Sparkles,
  ArrowUp,
  RefreshCw,
  FolderPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { EstrelaDeThelema } from "@/components/ThelemicIcons";
import { formatDateBR } from "@/lib/dateUtils";

interface InspectionResult {
  success: boolean;
  directory: string;
  dirExists: boolean;
  dbFile: string;
  dbFileName: string;
  dbExists: boolean;
  isValidMagickDb: boolean;
  dbSizeBytes: number;
  entryCount: number;
  sampleEntries: { id: string; title: string; type: string; date: string }[];
  availableDbFiles: { name: string; fullPath: string; sizeBytes: number; mtime: string }[];
}

interface RecentVaultItem {
  name: string;
  storagePath: string;
  dbFileName: string;
  dbFile: string;
  lastOpened: string;
  entryCount?: number;
}

interface VaultSelectorModalProps {
  isOpen: boolean;
  isInitialOnboarding?: boolean;
  onClose: () => void;
  onVaultSelected: () => Promise<void>;
}

export function VaultSelectorModal({
  isOpen,
  isInitialOnboarding = false,
  onClose,
  onVaultSelected,
}: VaultSelectorModalProps) {
  const [activeTab, setActiveTab] = useState<"existing" | "create" | "current">("existing");
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [customDbName, setCustomDbName] = useState<string>("magick_diary.db");
  const [vaultLabel, setVaultLabel] = useState<string>("Grimório Thelêmico");
  const [seedMode, setSeedMode] = useState<"empty" | "examples" | "copy">("empty");

  // Estado do banco atual e recentes
  const [currentStorageInfo, setCurrentStorageInfo] = useState<{
    currentPath: string;
    defaultPath: string;
    dbFile: string;
    dbFileName: string;
    totalEntries: number;
    dbSizeBytes: number;
    isConfigured: boolean;
    recentVaults: RecentVaultItem[];
  } | null>(null);

  // Inspeção em tempo real do caminho selecionado
  const [inspection, setInspection] = useState<InspectionResult | null>(null);
  const [inspecting, setInspecting] = useState(false);

  // Navegador visual de pastas integrado
  const [showVisualBrowser, setShowVisualBrowser] = useState(false);
  const [browserDir, setBrowserDir] = useState<string>("");
  const [browserParent, setBrowserParent] = useState<string | null>(null);
  const [browserFolders, setBrowserFolders] = useState<{ name: string; path: string }[]>([]);
  const [browserDbFiles, setBrowserDbFiles] = useState<
    { name: string; path: string; sizeBytes: number; mtime: string }[]
  >([]);
  const [quickLocations, setQuickLocations] = useState<{ label: string; path: string }[]>([]);
  const [newSubfolderName, setNewSubfolderName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  const [nativePickerLoading, setNativePickerLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadInitialStorageState();
    }
  }, [isOpen]);

  const loadInitialStorageState = async () => {
    try {
      const res = await fetch("/api/storage");
      const data = await res.json();
      if (data.success) {
        setCurrentStorageInfo(data);
        const initialTarget = data.dbFile || data.currentPath || "";
        setSelectedPath(initialTarget);
        if (data.inspection) {
          setInspection(data.inspection);
        } else {
          await inspectPath(initialTarget);
        }
        // Se já houver notas no banco atual durante o onboarding, destaca a aba "Banco Detectado / Atual" ou "Abrir Existente"
        if (data.totalEntries > 0) {
          setActiveTab("existing");
        }
      }
      await loadDirectoryBrowser("");
    } catch (err) {
      console.error("Erro ao carregar estado do armazenamento:", err);
    }
  };

  const inspectPath = async (pathToInspect: string) => {
    if (!pathToInspect.trim()) {
      setInspection(null);
      return;
    }
    setInspecting(true);
    try {
      const res = await fetch("/api/storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "inspect", path: pathToInspect }),
      });
      const data = await res.json();
      setInspection(data);
    } catch (e) {
      console.error("Erro ao inspecionar caminho:", e);
    } finally {
      setInspecting(false);
    }
  };

  const loadDirectoryBrowser = async (targetDir: string) => {
    try {
      const url = targetDir
        ? `/api/storage/browse?dir=${encodeURIComponent(targetDir)}`
        : `/api/storage/browse`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setBrowserDir(data.currentDir);
        setBrowserParent(data.parentDir);
        setBrowserFolders(data.directories || []);
        setBrowserDbFiles(data.dbFiles || []);
        if (data.quickLocations) {
          setQuickLocations(data.quickLocations);
        }
      }
    } catch (e) {
      console.error("Erro no navegador de pastas:", e);
    }
  };

  const handleNativeWindowsPicker = async (mode: "native_folder" | "native_file") => {
    setNativePickerLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/storage/browse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (data.success && data.selectedPath) {
        setSelectedPath(data.selectedPath);
        await inspectPath(data.selectedPath);
      }
    } catch (e: any) {
      setStatusMessage({
        type: "err",
        text: "Não foi possível abrir a janela nativa. Use o navegador de pastas integrado abaixo.",
      });
      setShowVisualBrowser(true);
    } finally {
      setNativePickerLoading(false);
    }
  };

  const handleCreateSubfolder = async () => {
    if (!newSubfolderName.trim() || !browserDir) return;
    try {
      const res = await fetch("/api/storage/browse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "mkdir",
          parentDir: browserDir,
          folderName: newSubfolderName.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.createdPath) {
        setNewSubfolderName("");
        setShowNewFolderInput(false);
        setSelectedPath(data.createdPath);
        await loadDirectoryBrowser(data.createdPath);
        await inspectPath(data.createdPath);
      }
    } catch (e) {}
  };

  const handleOpenExistingDatabase = async (targetPathOverride?: string) => {
    const finalPath = (targetPathOverride || selectedPath).trim();
    if (!finalPath) return;

    setSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: finalPath,
          copyExisting: false,
          seedExamples: false,
          vaultName: vaultLabel.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "ok",
          text: `Grimório carregado com sucesso! (${data.totalEntries ?? 0} notas encontradas)`,
        });
        await onVaultSelected();
        setTimeout(() => {
          onClose();
        }, 400);
      } else {
        setStatusMessage({
          type: "err",
          text: data.error || "Erro ao carregar banco de dados.",
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "err",
        text: err.message || "Falha de conexão ao abrir banco.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateNewDatabase = async () => {
    const targetFolder = (inspection?.directory || selectedPath).trim();
    if (!targetFolder) return;

    setSubmitting(true);
    setStatusMessage(null);
    try {
      const cleanDbName = customDbName.trim().endsWith(".db")
        ? customDbName.trim()
        : `${customDbName.trim() || "magick_diary"}.db`;

      const res = await fetch("/api/storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: targetFolder,
          dbFileName: cleanDbName,
          copyExisting: seedMode === "copy",
          seedExamples: seedMode === "examples",
          vaultName: vaultLabel.trim() || "Novo Grimório",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "ok",
          text: `Grimório configurado em ${data.dbFile}! (${data.totalEntries ?? 0} notas)`,
        });
        await onVaultSelected();
        setTimeout(() => {
          onClose();
        }, 400);
      } else {
        setStatusMessage({
          type: "err",
          text: data.error || "Não foi possível criar o banco neste local.",
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "err",
        text: err.message || "Erro ao criar banco de dados.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmCurrentVault = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm_current" }),
      });
      await onVaultSelected();
      onClose();
    } catch (e) {
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes <= 0) return "0 KB";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-medium-900 border border-medium-700 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Sacred Header */}
        <div className="p-5 border-b border-medium-700 bg-gradient-to-r from-medium-900 via-medium-850 to-medium-900 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <EstrelaDeThelema className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-sans font-bold text-white tracking-tight uppercase">
                  Portal do Grimório — Cofre & Banco de Dados
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                  100% Soberano & Local
                </span>
              </div>
              <p className="text-xs text-medium-300 font-serif mt-0.5">
                Escolha onde suas notas e imagens ficarão salvas ou selecione um banco de dados{" "}
                <code className="text-amber-300 font-mono">.db</code> já existente para puxar todas as suas notas.
              </p>
            </div>
          </div>

          {!isInitialOnboarding && (
            <button
              onClick={onClose}
              className="p-2 text-medium-400 hover:text-white rounded-lg hover:bg-medium-800 transition-colors"
              title="Fechar janela"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 border-b border-medium-750 bg-medium-850/70">
          <button
            type="button"
            onClick={() => setActiveTab("existing")}
            className={`py-3.5 px-4 text-xs font-sans font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === "existing"
                ? "border-amber-400 text-amber-300 bg-amber-500/10"
                : "border-transparent text-medium-400 hover:text-white"
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>1. Abrir Banco Existente (Puxar Notas)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`py-3.5 px-4 text-xs font-sans font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === "create"
                ? "border-amber-400 text-amber-300 bg-amber-500/10"
                : "border-transparent text-medium-400 hover:text-white"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>2. Criar Novo Banco / Escolher Pasta</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("current")}
            className={`py-3.5 px-4 text-xs font-sans font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === "current"
                ? "border-amber-400 text-amber-300 bg-amber-500/10"
                : "border-transparent text-medium-400 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>
              3. Grimórios Recentes{" "}
              {currentStorageInfo?.totalEntries ? `(${currentStorageInfo.totalEntries} notas)` : ""}
            </span>
          </button>
        </div>

        {/* Main Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* Quick Banner if Existing Default DB already has notes */}
          {currentStorageInfo && currentStorageInfo.totalEntries > 0 && (
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <div className="text-xs font-sans font-bold text-emerald-200">
                    Banco de Dados Ativo Detectado com {currentStorageInfo.totalEntries} notas!
                  </div>
                  <div className="text-[11px] font-mono text-emerald-300/80 break-all">
                    Local: {currentStorageInfo.dbFile} ({formatBytes(currentStorageInfo.dbSizeBytes)})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleConfirmCurrentVault}
                disabled={submitting}
                className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-sans font-bold text-xs shrink-0 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Continuar Neste Banco ({currentStorageInfo.totalEntries} notas)</span>
              </button>
            </div>
          )}

          {/* TAB 1 & TAB 2: Path Input + Native Pickers + Visual Folder Explorer */}
          {(activeTab === "existing" || activeTab === "create") && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-medium-850 border border-medium-700 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-mono font-bold uppercase text-amber-300 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-amber-400" />
                    <span>
                      {activeTab === "existing"
                        ? "SELECIONE A PASTA OU ARQUIVO .DB DO SEU GRIMÓRIO EXISTENTE:"
                        : "ESCOLHA A PASTA ONDE O NOVO BANCO DE DADOS SERÁ CRIADO:"}
                    </span>
                  </label>

                  {/* Botões de Seletor Nativo do Windows */}
                  <div className="flex flex-wrap items-center gap-2">
                    {activeTab === "existing" && (
                      <button
                        type="button"
                        onClick={() => handleNativeWindowsPicker("native_file")}
                        disabled={nativePickerLoading}
                        className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-sans font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Database className="w-3.5 h-3.5" />
                        <span>
                          {nativePickerLoading ? "Abrindo Janela..." : "Selecionar Arquivo .db no Windows..."}
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleNativeWindowsPicker("native_folder")}
                      disabled={nativePickerLoading}
                      className="px-3 py-1.5 rounded-lg bg-medium-800 hover:bg-medium-750 text-white border border-medium-600 font-sans font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {nativePickerLoading ? "Abrindo..." : "Procurar Pasta no Windows..."}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowVisualBrowser((prev) => !prev);
                        if (!showVisualBrowser) {
                          loadDirectoryBrowser(selectedPath);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors flex items-center gap-1.5 ${
                        showVisualBrowser
                          ? "bg-white text-black border-white font-bold"
                          : "bg-medium-800 hover:bg-medium-750 text-medium-200 border-medium-700"
                      }`}
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>{showVisualBrowser ? "Ocultar Explorador" : "Explorador Integrado"}</span>
                    </button>
                  </div>
                </div>

                {/* Input de Caminho Direto + Botão Inspecionar */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedPath}
                    onChange={(e) => setSelectedPath(e.target.value)}
                    onBlur={() => inspectPath(selectedPath)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") inspectPath(selectedPath);
                    }}
                    placeholder="Ex: C:\Users\SeuNome\Documents\GrimorioThelema ou C:\Backup\magick_diary.db"
                    className="flex-1 bg-medium-900 border border-medium-700 rounded-lg px-3.5 py-2.5 text-xs text-white font-mono placeholder-medium-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => inspectPath(selectedPath)}
                    disabled={inspecting}
                    className="px-4 py-2.5 bg-medium-800 hover:bg-medium-750 text-white border border-medium-700 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${inspecting ? "animate-spin text-amber-400" : ""}`} />
                    <span>Verificar Local</span>
                  </button>
                </div>

                {/* Atalhos Rápidos de Pastas */}
                {quickLocations.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono text-medium-400 uppercase mr-1">
                      Locais Rápidos:
                    </span>
                    {quickLocations.map((loc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedPath(loc.path);
                          inspectPath(loc.path);
                          if (showVisualBrowser) loadDirectoryBrowser(loc.path);
                        }}
                        className="px-2.5 py-1 rounded-md bg-medium-800 hover:bg-medium-750 border border-medium-700 text-[11px] font-mono text-medium-200 hover:text-amber-300 transition-colors"
                      >
                        📁 {loc.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Explorador Visual Integrado de Pastas e Bancos .db */}
                {showVisualBrowser && (
                  <div className="mt-3 p-3 rounded-xl bg-medium-900 border border-medium-750 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-medium-800 pb-2">
                      <div className="flex items-center gap-2 text-xs font-mono text-amber-300 truncate">
                        <FolderOpen className="w-4 h-4 shrink-0" />
                        <span className="truncate" title={browserDir}>
                          {browserDir}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {browserParent && (
                          <button
                            type="button"
                            onClick={() => {
                              loadDirectoryBrowser(browserParent);
                              setSelectedPath(browserParent);
                              inspectPath(browserParent);
                            }}
                            className="px-2 py-1 rounded bg-medium-800 hover:bg-medium-750 text-xs font-mono text-medium-200 border border-medium-700 flex items-center gap-1"
                          >
                            <ArrowUp className="w-3 h-3" />
                            <span>Subir Pasta</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowNewFolderInput((prev) => !prev)}
                          className="px-2 py-1 rounded bg-medium-800 hover:bg-medium-750 text-xs font-mono text-amber-300 border border-medium-700 flex items-center gap-1"
                        >
                          <FolderPlus className="w-3 h-3" />
                          <span>Nova Pasta</span>
                        </button>
                      </div>
                    </div>

                    {showNewFolderInput && (
                      <div className="flex gap-2 p-2 rounded-lg bg-medium-850 border border-medium-700">
                        <input
                          type="text"
                          value={newSubfolderName}
                          onChange={(e) => setNewSubfolderName(e.target.value)}
                          placeholder="Nome da nova pasta (ex: MeuGrimorio)..."
                          className="flex-1 bg-medium-900 border border-medium-700 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={handleCreateSubfolder}
                          className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded transition-colors"
                        >
                          Criar Pasta
                        </button>
                      </div>
                    )}

                    <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 custom-scrollbar">
                      {/* Arquivos .db encontrados nesta pasta */}
                      {browserDbFiles.map((dbf) => (
                        <button
                          key={dbf.path}
                          type="button"
                          onClick={() => {
                            setSelectedPath(dbf.path);
                            inspectPath(dbf.path);
                          }}
                          className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                            selectedPath === dbf.path
                              ? "bg-amber-500/20 border-amber-400 text-amber-200"
                              : "bg-emerald-950/30 hover:bg-emerald-900/40 border-emerald-500/40 text-emerald-200"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-xs font-mono font-bold truncate">{dbf.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-300/80 shrink-0 ml-1">
                            {formatBytes(dbf.sizeBytes)}
                          </span>
                        </button>
                      ))}

                      {/* Subpastas */}
                      {browserFolders.map((dir) => (
                        <button
                          key={dir.path}
                          type="button"
                          onClick={() => {
                            loadDirectoryBrowser(dir.path);
                            setSelectedPath(dir.path);
                            inspectPath(dir.path);
                          }}
                          className="flex items-center justify-between p-2 rounded-lg bg-medium-850 hover:bg-medium-800 border border-medium-750 text-left text-xs font-sans text-medium-200 hover:text-white transition-colors"
                        >
                          <span className="truncate flex items-center gap-1.5">
                            <span>📁</span>
                            <span className="truncate">{dir.name}</span>
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-medium-500 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Painel de Diagnóstico do Banco no Caminho Selecionado */}
              {inspection && (
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    inspection.dbExists && inspection.isValidMagickDb
                      ? "bg-amber-500/10 border-amber-500/40"
                      : "bg-medium-850 border-medium-700"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Database
                        className={`w-5 h-5 ${
                          inspection.dbExists ? "text-amber-400" : "text-medium-400"
                        }`}
                      />
                      <div>
                        <h4 className="text-xs font-mono font-bold uppercase text-white">
                          {inspection.dbExists && inspection.isValidMagickDb
                            ? `✓ BANCO DE DADOS EXISTENTE ENCONTRADO (${inspection.entryCount} NOTAS)`
                            : "PASTA PRONTA PARA NOVO BANCO DE DADOS"}
                        </h4>
                        <p className="text-[11px] font-mono text-medium-300 break-all">
                          {inspection.dbExists
                            ? `Arquivo: ${inspection.dbFile} (${formatBytes(inspection.dbSizeBytes)})`
                            : `Diretório: ${inspection.directory}`}
                        </p>
                      </div>
                    </div>

                    {/* Se houver mais de um arquivo .db na mesma pasta, permite alternar entre eles */}
                    {inspection.availableDbFiles && inspection.availableDbFiles.length > 1 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-medium-400">Bancos na pasta:</span>
                        <select
                          value={inspection.dbFile}
                          onChange={(e) => {
                            setSelectedPath(e.target.value);
                            inspectPath(e.target.value);
                          }}
                          className="bg-medium-900 border border-amber-500/40 rounded px-2 py-1 text-xs text-amber-200 font-mono"
                        >
                          {inspection.availableDbFiles.map((f) => (
                            <option key={f.fullPath} value={f.fullPath}>
                              {f.name} ({formatBytes(f.sizeBytes)})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Lista Prévia das Notas Existentes Dentro do Banco Selecionado */}
                  {inspection.dbExists && inspection.sampleEntries && inspection.sampleEntries.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-amber-500/20">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-semibold block">
                        Amostra de Notas Existentes Neste Banco ({inspection.entryCount} no total):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {inspection.sampleEntries.map((s) => (
                          <div
                            key={s.id}
                            className="p-2 rounded-lg bg-medium-900/90 border border-medium-750 flex items-center justify-between gap-2 text-xs"
                          >
                            <span className="font-serif text-white truncate flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="truncate">{s.title}</span>
                            </span>
                            <span className="text-[10px] font-mono text-medium-400 shrink-0">
                              {formatDateBR(s.date)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Opções Extras caso esteja na Aba 2 (Criar Novo Banco) */}
                  {activeTab === "create" && (
                    <div className="pt-3 border-t border-medium-750 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-medium-300 mb-1">
                          NOME DO ARQUIVO DO BANCO (.db):
                        </label>
                        <input
                          type="text"
                          value={customDbName}
                          onChange={(e) => setCustomDbName(e.target.value)}
                          placeholder="magick_diary.db"
                          className="w-full bg-medium-900 border border-medium-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-medium-300 mb-1">
                          CONTEÚDO INICIAL DO NOVO BANCO:
                        </label>
                        <select
                          value={seedMode}
                          onChange={(e) => setSeedMode(e.target.value as "empty" | "examples" | "copy")}
                          className="w-full bg-medium-900 border border-medium-700 rounded-lg px-3 py-2 text-xs text-white font-sans focus:outline-none focus:border-amber-400"
                        >
                          <option value="empty">Iniciar 100% em Branco (0 notas)</option>
                          <option value="examples">Incluir 4 Notas Canônicas de Exemplo</option>
                          <option value="copy">Copiar notas do banco atual para esta pasta</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Grimórios Recentes */}
          {activeTab === "current" && (
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-medium-300 font-bold">
                Histórico de Grimórios / Bancos de Dados Recentes
              </h4>
              {currentStorageInfo?.recentVaults && currentStorageInfo.recentVaults.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {currentStorageInfo.recentVaults.map((rv, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-medium-850 border border-medium-700 hover:border-amber-400/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-amber-400" />
                          <span className="text-sm font-sans font-bold text-white">{rv.name}</span>
                          {rv.entryCount !== undefined && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              {rv.entryCount} notas
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-medium-400 break-all">{rv.dbFile}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenExistingDatabase(rv.dbFile)}
                        disabled={submitting}
                        className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-sans font-bold text-xs shrink-0 transition-colors"
                      >
                        Carregar Este Grimório
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-medium-400 font-mono">
                  Nenhum outro grimório recente registrado ainda.
                </p>
              )}
            </div>
          )}

          {statusMessage && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                statusMessage.type === "ok"
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                  : "bg-red-500/15 border-red-500/40 text-red-200"
              }`}
            >
              {statusMessage.type === "ok" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-medium-700 bg-medium-850 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-medium-400">
            💡 Todas as imagens e áudios das notas também são salvos na subpasta{" "}
            <code className="text-amber-300">/media</code> junto ao seu banco.
          </div>

          <div className="flex items-center gap-2.5">
            {!isInitialOnboarding && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-sans font-medium text-medium-300 hover:text-white hover:bg-medium-800 transition-colors"
              >
                Cancelar
              </button>
            )}

            {activeTab === "existing" && (
              <button
                type="button"
                disabled={submitting || !selectedPath.trim()}
                onClick={() => handleOpenExistingDatabase()}
                className="px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-black font-sans font-bold text-xs flex items-center gap-2 transition-colors shadow-md"
              >
                <Database className="w-4 h-4" />
                <span>
                  {inspection?.dbExists
                    ? `Carregar Banco Existente e Puxar Notas (${inspection.entryCount} notas)`
                    : "Usar Este Local como Grimório"}
                </span>
              </button>
            )}

            {activeTab === "create" && (
              <button
                type="button"
                disabled={submitting || !selectedPath.trim()}
                onClick={handleCreateNewDatabase}
                className="px-5 py-2.5 rounded-lg bg-white hover:bg-medium-200 disabled:opacity-40 text-black font-sans font-bold text-xs flex items-center gap-2 transition-colors shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Criar / Definir Banco de Dados Nesta Pasta</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
