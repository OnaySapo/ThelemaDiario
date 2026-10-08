"use client";

import React, { useState, useEffect } from "react";
import { X, Key, Database, Download, ShieldCheck, Check } from "lucide-react";
import { MagickEntry } from "@/lib/types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: MagickEntry[];
}

export function SettingsModal({ isOpen, onClose, entries }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/settings?key=gemini_api_key")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setHasKey(data.hasKey);
            setMaskedKey(data.masked || "");
          }
        })
        .catch((err) => console.error("Erro ao carregar settings:", err));
    }
  }, [isOpen]);

  const handleSaveApiKey = async () => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "gemini_api_key", value: apiKey.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus("Chave salva com sucesso!");
        setHasKey(Boolean(apiKey.trim()));
        setMaskedKey(apiKey.trim() ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : "");
        setApiKey("");
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err) {
      alert("Erro ao salvar chave.");
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
    let mdContent = `# 📜 Diário Mágicko Thelêmico — Exportação\n\n`;
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
      <div className="bg-medium-900 border border-medium-700 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-medium-700 bg-medium-850 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-white" />
            <h2 className="text-sm font-sans font-bold text-white uppercase tracking-wide">
              Configurações & Soberania dos Dados
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
        <div className="p-6 space-y-6 text-xs text-medium-200">
          {/* Database Info */}
          <div className="bg-medium-850 p-4 rounded-lg border border-medium-700 space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold font-mono text-xs">
              <Database className="w-4 h-4 text-white" />
              <span>Banco de Dados Local Próprio (SQLite)</span>
            </div>
            <p className="text-medium-300 leading-relaxed font-sans">
              Todos os seus registros, oráculos de Thoth, sonhos e conexões estão salvos localmente na sua máquina:
            </p>
            <code className="block bg-medium-900 p-2.5 rounded border border-medium-750 text-white font-mono text-[11px] select-all">
              data/magick_diary.db
            </code>
            <p className="text-medium-400 text-[11px]">
              Privacidade absoluta: nenhum dado sai do seu computador sem o seu consentimento.
            </p>
          </div>

          {/* Gemini API Key */}
          <div className="bg-medium-850 p-4 rounded-lg border border-medium-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-semibold font-mono text-xs">
                <Key className="w-4 h-4 text-white" />
                <span>Chave Gemini API (Opcional)</span>
              </div>
              {hasKey && (
                <span className="px-2 py-0.5 rounded bg-medium-800 text-white border border-medium-700 text-[10px] font-mono">
                  Ativa: {maskedKey}
                </span>
              )}
            </div>
            <p className="text-medium-300 leading-relaxed font-sans">
              O Diário Mágicko possui inteligência analítica offline nativa. Caso deseje análises herméticas profundas e conversação fluida via Google Gemini, insira sua chave de API abaixo:
            </p>

            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Insira sua chave do Google Gemini..."
                className="flex-1 bg-medium-900 border border-medium-700 rounded px-3 py-2 text-xs text-white placeholder-medium-500 focus:outline-none focus:border-white font-mono"
              />
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-2 bg-white hover:bg-medium-200 text-black font-semibold rounded text-xs transition-colors"
              >
                Salvar
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
                <span>Exportar Notas em Markdown</span>
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
