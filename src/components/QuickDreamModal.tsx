"use client";

import React, { useState, useRef, useEffect } from "react";
import { Moon, Mic, Square, Sparkles, X, Check, CloudMoon, Clock, Eye } from "lucide-react";
import { MagickEntry } from "@/lib/types";
import { formatTime24h } from "@/lib/dateUtils";

interface QuickDreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDream: (entry: Partial<MagickEntry>) => Promise<void>;
}

export function QuickDreamModal({ isOpen, onClose, onSaveDream }: QuickDreamModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [lucidityLevel, setLucidityLevel] = useState<number>(3); // 1 a 5
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const timeStr = formatTime24h(now);
      setTitle(`Sonho Astral (${timeStr})`);
      setContent("");
      setAudioUrl(null);
      setIsRecording(false);
      setRecordSeconds(0);
    }
  }, [isOpen]);

  // Gravação de Áudio
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Microfone não suportado pelo navegador.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        streamRef.current?.getTracks().forEach((track) => track.stop());

        try {
          const formData = new FormData();
          const fileName = `sonho_voz_${Date.now()}.webm`;
          formData.append("file", audioBlob, fileName);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          const uploadedUrl = data.url || data.fileUrl;
          if (data.success && uploadedUrl) {
            setAudioUrl(uploadedUrl);
          } else {
            const reader = new FileReader();
            reader.onloadend = () => {
              setAudioUrl(reader.result as string);
            };
            reader.readAsDataURL(audioBlob);
          }
        } catch (e) {
          console.error("Falha ao salvar áudio:", e);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Permissão para microfone negada ou indisponível.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  const handleSave = async () => {
    if (!title.trim() && !content.trim() && !audioUrl) {
      alert("Escreva algo ou grave um áudio sobre o sonho.");
      return;
    }

    setIsSaving(true);
    try {
      let finalContent = content.trim();

      if (audioUrl) {
        finalContent = `![audio:Gravação de Voz ao Acordar](${audioUrl})\n\n` + finalContent;
      }

      // Adicionar callout ou nota de lucidez
      const lucidityLabels = [
        "1/5 - Sonho Difuso / Fragmentado",
        "2/5 - Sonho Comum / Narrativo",
        "3/5 - Semi-Lúcido / Consciência Parcial",
        "4/5 - Sonho Lúcido Nítido / Controle Moderado",
        "5/5 - Hiperlúcido / Projeção Astral Plena",
      ];
      const lucidityText = `\n\n> [!INSIGHT]\n> **Nível de Lucidez:** ${lucidityLabels[lucidityLevel - 1]}\n> Registrado imediatamente ao despertar via Quick Dream.`;
      finalContent += lucidityText;

      const now = new Date();
      await onSaveDream({
        title: title.trim() || `Sonho de ${formatTime24h(now)}`,
        content: finalContent,
        type: "Sonho",
        date: now.toISOString(),
      });

      onClose();
    } catch (e) {
      console.error("Erro ao salvar sonho rápido:", e);
      alert("Erro ao salvar sonho.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-950/95 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col gap-5 overflow-hidden">
        {/* Glow noturno decorativo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-inner">
              <CloudMoon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-bold text-white tracking-wide">
                  Quick Dream · Captura de Sonhos
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300">
                  Alt + S
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Grave ou digite imediatamente antes que a memória astral se dissipe.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gravação Rápida de Voz (Hero Banner) */}
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isRecording ? "bg-red-500 animate-ping" : audioUrl ? "bg-emerald-400" : "bg-slate-500"
              }`}
            />
            <div>
              <div className="text-xs font-semibold text-slate-200">
                {isRecording
                  ? `Gravando voz: ${Math.floor(recordSeconds / 60)}:${(recordSeconds % 60)
                      .toString()
                      .padStart(2, "0")}s`
                  : audioUrl
                  ? "Áudio do sonho gravado e pronto para anexar!"
                  : "Falar sonho em voz alta (Gravação Rápida)"}
              </div>
              <div className="text-[11px] text-slate-400">
                {isRecording
                  ? "Fale livremente os símbolos, rostos e sensações..."
                  : "Mais rápido do que digitar com sono"}
              </div>
            </div>
          </div>

          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Mic className="w-4 h-4" />
              <span>Gravar Áudio</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-md animate-pulse active:scale-95"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Concluir</span>
            </button>
          )}
        </div>

        {/* Inputs */}
        <div className="space-y-4 relative z-10">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              TÍTULO DO SONHO OU SÍMBOLO PRINCIPAL
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Templo Submerso, O Livro de Prata..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 font-serif"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              RELATO DO SONHO (Palavras-chave, enredo, mensagens, entidades)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Descreva o que aconteceu enquanto a memória ainda está fresca..."
              rows={5}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 font-sans leading-relaxed resize-none"
              autoFocus
            />
          </div>

          {/* Lucidez do Sonho */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-300" />
                <span>NÍVEL DE LUCIDEZ ASTRAL:</span>
              </label>
              <span className="text-xs font-semibold text-indigo-300">
                {lucidityLevel === 1 && "1/5 · Difuso"}
                {lucidityLevel === 2 && "2/5 · Comum"}
                {lucidityLevel === 3 && "3/5 · Semi-Lúcido"}
                {lucidityLevel === 4 && "4/5 · Lúcido"}
                {lucidityLevel === 5 && "5/5 · Projeção Astral Plena"}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLucidityLevel(lvl)}
                  className={`py-1.5 rounded-lg border text-xs font-mono transition-all ${
                    lucidityLevel >= lvl
                      ? "bg-indigo-600/30 border-indigo-400 text-white font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {lvl}★
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-indigo-500/20 pt-4 relative z-10">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Associa automaticamente signos lunar/solar e hora planetária</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
            >
              {isSaving ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Salvar no Diário</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
