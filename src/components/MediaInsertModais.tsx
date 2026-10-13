"use client";

import React, { useState, useRef } from "react";
import { X, Upload, Link, Image as ImageIcon, Video, Check, Loader2, Play } from "lucide-react";

// ==========================================
// 1. MODAL DE INSERÇÃO DE IMAGEM
// ==========================================
interface ImageInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, caption: string) => void;
}

export function ImageInsertModal({ isOpen, onClose, onInsert }: ImageInsertModalProps) {
  const [tab, setTab] = useState<"url" | "upload">("url");
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setImageUrl(data.url);
        if (!caption) {
          setCaption(file.name.replace(/\.[^/.]+$/, ""));
        }
      } else {
        setUploadError(data.error || "Falha no envio da imagem.");
      }
    } catch (err: any) {
      setUploadError(err.message || "Erro de conexão ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = () => {
    if (!imageUrl.trim()) return;
    onInsert(imageUrl.trim(), caption.trim());
    setImageUrl("");
    setCaption("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-medium-850 border border-medium-700 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-medium-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-medium-800 text-white border border-medium-700">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wide">
                Inserir Imagem no Diário
              </h3>
              <p className="text-[11px] font-mono text-medium-400">
                Via link externo da web ou arquivo local do computador
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-medium-400 hover:text-white rounded hover:bg-medium-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-medium-750 bg-medium-900/50">
          <button
            onClick={() => setTab("url")}
            className={`flex-1 py-2.5 px-4 text-xs font-medium font-sans flex items-center justify-center gap-2 border-b-2 transition-all ${
              tab === "url"
                ? "border-white text-white font-semibold bg-medium-800/50"
                : "border-transparent text-medium-400 hover:text-white"
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Via URL da Web</span>
          </button>
          <button
            onClick={() => setTab("upload")}
            className={`flex-1 py-2.5 px-4 text-xs font-medium font-sans flex items-center justify-center gap-2 border-b-2 transition-all ${
              tab === "upload"
                ? "border-white text-white font-semibold bg-medium-800/50"
                : "border-transparent text-medium-400 hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Arquivo Local (Upload)</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {tab === "url" ? (
            <div>
              <label className="block text-xs font-mono text-medium-300 mb-1.5">
                ENDEREÇO DA IMAGEM (URL):
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemplo.com/altar_ou_sigilo.png"
                className="w-full bg-medium-800 border border-medium-700 rounded-md px-3 py-2 text-xs text-white placeholder-medium-500 focus:outline-none focus:border-white font-mono"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-mono text-medium-300 mb-1.5">
                SELECIONAR ARQUIVO DE IMAGEM:
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-medium-700 hover:border-medium-500 rounded-lg p-6 text-center cursor-pointer transition-colors bg-medium-900/40"
              >
                {uploading ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                    <span className="text-xs font-mono text-medium-300">Enviando imagem para o diário...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="w-6 h-6 text-medium-400" />
                    <span className="text-xs font-sans text-medium-200">
                      Clique para escolher uma imagem do seu computador
                    </span>
                    <span className="text-[10px] font-mono text-medium-400">
                      PNG, JPG, WEBP, GIF, SVG
                    </span>
                  </div>
                )}
              </div>

              {uploadError && (
                <p className="text-xs text-red-400 font-mono mt-2">{uploadError}</p>
              )}
            </div>
          )}

          {/* Legenda */}
          <div>
            <label className="block text-xs font-mono text-medium-300 mb-1.5">
              LEGENDA / DESCRIÇÃO (OPCIONAL):
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ex: Altar consagrado com cálice e baqueta..."
              className="w-full bg-medium-800 border border-medium-700 rounded-md px-3 py-2 text-xs text-white placeholder-medium-500 focus:outline-none focus:border-white font-serif"
            />
          </div>

          {/* Preview */}
          {imageUrl && (
            <div className="p-2 rounded-lg bg-medium-900 border border-medium-750">
              <span className="text-[10px] font-mono text-medium-400 block mb-1">PRÉ-VISUALIZAÇÃO:</span>
              <img
                src={imageUrl}
                alt={caption || "Preview"}
                className="max-h-36 max-w-full rounded mx-auto object-contain border border-medium-800"
                onError={() => {}}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-medium-700 bg-medium-900/60 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-medium-400 hover:text-white rounded hover:bg-medium-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            disabled={!imageUrl.trim() || uploading}
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-medium-200 disabled:opacity-40 text-black text-xs font-semibold rounded-md transition-colors shadow-sm"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Inserir Imagem</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. MODAL DE INSERÇÃO DE VÍDEO
// ==========================================
interface VideoInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, caption: string) => void;
}

export function VideoInsertModal({ isOpen, onClose, onInsert }: VideoInsertModalProps) {
  const [tab, setTab] = useState<"url" | "upload">("url");
  const [videoUrl, setVideoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadError("");
    setUploadProgress(`Enviando "${file.name}"...`);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setVideoUrl(data.url);
        if (!caption) {
          setCaption(file.name.replace(/\.[^/.]+$/, ""));
        }
        setUploadProgress("Vídeo enviado com sucesso!");
      } else {
        setUploadError(data.error || "Falha ao enviar arquivo de vídeo.");
      }
    } catch (err: any) {
      setUploadError(err.message || "Erro de conexão durante o upload do vídeo.");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = () => {
    if (!videoUrl.trim()) return;
    onInsert(videoUrl.trim(), caption.trim());
    setVideoUrl("");
    setCaption("");
    setUploadProgress("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-medium-850 border border-medium-700 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-medium-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-medium-800 text-white border border-medium-700">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wide">
                Inserir Vídeo no Diário
              </h3>
              <p className="text-[11px] font-mono text-medium-400">
                Suporte a YouTube, Vimeo, MP4 via link ou arquivo local
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-medium-400 hover:text-white rounded hover:bg-medium-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-medium-750 bg-medium-900/50">
          <button
            onClick={() => setTab("url")}
            className={`flex-1 py-2.5 px-4 text-xs font-medium font-sans flex items-center justify-center gap-2 border-b-2 transition-all ${
              tab === "url"
                ? "border-white text-white font-semibold bg-medium-800/50"
                : "border-transparent text-medium-400 hover:text-white"
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Via URL / YouTube / Vimeo</span>
          </button>
          <button
            onClick={() => setTab("upload")}
            className={`flex-1 py-2.5 px-4 text-xs font-medium font-sans flex items-center justify-center gap-2 border-b-2 transition-all ${
              tab === "upload"
                ? "border-white text-white font-semibold bg-medium-800/50"
                : "border-transparent text-medium-400 hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Arquivo Local (Upload)</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {tab === "url" ? (
            <div className="space-y-2">
              <label className="block text-xs font-mono text-medium-300">
                LINK DO VÍDEO (YOUTUBE, VIMEO OU LINK DIRETO .MP4/.WEBM):
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... ou https://.../video.mp4"
                className="w-full bg-medium-800 border border-medium-700 rounded-md px-3 py-2 text-xs text-white placeholder-medium-500 focus:outline-none focus:border-white font-mono"
              />
              <p className="text-[11px] text-medium-400 font-mono">
                💡 Cole um link do YouTube (ex: <code>youtu.be/...</code>), Vimeo ou arquivo <code>.mp4</code> para gerar o player embutido.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-mono text-medium-300 mb-1.5">
                SELECIONAR VÍDEO DO COMPUTADOR:
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-medium-700 hover:border-medium-500 rounded-lg p-6 text-center cursor-pointer transition-colors bg-medium-900/40"
              >
                {uploading ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                    <span className="text-xs font-mono text-medium-300">{uploadProgress}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Video className="w-6 h-6 text-medium-400" />
                    <span className="text-xs font-sans text-medium-200">
                      Clique para escolher um arquivo de vídeo (.mp4, .webm, .mov)
                    </span>
                    <span className="text-[10px] font-mono text-medium-400">
                      O arquivo será salvo na biblioteca local do Diário
                    </span>
                  </div>
                )}
              </div>

              {uploadProgress && !uploading && !uploadError && (
                <p className="text-xs text-emerald-400 font-mono mt-2 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{uploadProgress}</span>
                </p>
              )}

              {uploadError && (
                <p className="text-xs text-red-400 font-mono mt-2">{uploadError}</p>
              )}
            </div>
          )}

          {/* Legenda */}
          <div>
            <label className="block text-xs font-mono text-medium-300 mb-1.5">
              TÍTULO / LEGENDA DO VÍDEO (OPCIONAL):
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ex: Registro da Invocação dos Guardiões ou Demonstração..."
              className="w-full bg-medium-800 border border-medium-700 rounded-md px-3 py-2 text-xs text-white placeholder-medium-500 focus:outline-none focus:border-white font-serif"
            />
          </div>

          {/* Status / Link selecionado */}
          {videoUrl && (
            <div className="p-2.5 rounded-lg bg-medium-900 border border-medium-750 text-xs font-mono text-medium-300 flex items-center justify-between">
              <span className="truncate max-w-[340px] text-white">
                URL pronta: {videoUrl}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">Pronto</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-medium-700 bg-medium-900/60 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-medium-400 hover:text-white rounded hover:bg-medium-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            disabled={!videoUrl.trim() || uploading}
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-medium-200 disabled:opacity-40 text-black text-xs font-semibold rounded-md transition-colors shadow-sm"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Inserir Vídeo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
