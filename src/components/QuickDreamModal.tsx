"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Moon, Mic, Square, Sparkles, X, Check, CloudMoon, Clock, Eye, Compass } from "lucide-react";
import { MagickEntry } from "@/lib/types";
import { formatTime24h } from "@/lib/dateUtils";
import { detectTotemsInText } from "@/lib/dreamAnalytics";

interface QuickDreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDream: (entry: Partial<MagickEntry>) => Promise<void>;
}

const PHENOMENON_TYPES = [
  "Sonho Arquetípico / Narrativo",
  "Sonho Lúcido",
  "Projeção Astral (OOBE / Desdobramento)",
  "Recado de Guia / Incorporação / Terreiro",
  "Estado Hipnagógico / Vibracional",
];

const INDUCTION_TECHNIQUES = [
  "Espontâneo",
  "Banho de Ervas / Defumação (Ewê)",
  "MILD (Intenção Mnemônica)",
  "WILD (Despertar Iniciado pela Consciência)",
  "WBTB (Acordar e Voltar para a Cama)",
  "Meditação / Dharana Pré-Sono",
];

export function QuickDreamModal({ isOpen, onClose, onSaveDream }: QuickDreamModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [lucidityLevel, setLucidityLevel] = useState<number>(3); // 1 a 5
  const [phenomenonType, setPhenomenonType] = useState<string>(PHENOMENON_TYPES[0]);
  const [inductionTech, setInductionTech] = useState<string>(INDUCTION_TECHNIQUES[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
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
      setIsDictating(false);
      setRecordSeconds(0);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    }
  }, [isOpen]);

  // Totens de Lucidez detectados ao vivo no texto
  const detectedTotems = useMemo(() => {
    return detectTotemsInText(`${title} ${content}`);
  }, [title, content]);

  // Ditado Voz -> Texto (Web Speech API)
  const toggleSpeechToText = () => {
    if (isDictating) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsDictating(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Seu navegador não suporta ditado direto voz-para-texto. Use o botão Gravar Áudio.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript + " ";
        }
      }
      if (transcript.trim()) {
        setContent((prev) => (prev ? `${prev.trim()} ${transcript.trim()}` : transcript.trim()));
      }
    };

    recognition.onerror = () => {
      setIsDictating(false);
    };

    recognition.onend = () => {
      setIsDictating(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsDictating(true);
  };

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

      const lucidityLabels = [
        "1/5 - Sonho Difuso / Fragmentado",
        "2/5 - Sonho Comum / Narrativo",
        "3/5 - Semi-Lúcido / Consciência Parcial",
        "4/5 - Sonho Lúcido Nítido / Controle Moderado",
        "5/5 - Hiperlúcido / Projeção Astral Plena",
      ];

      let totemBlock = "";
      if (detectedTotems.length > 0) {
        totemBlock =
          `\n> **Totens de Lucidez Detectados:** ` +
          detectedTotems.map((t) => `${t.icon} *${t.name}* (${t.brasilisRuler})`).join(" · ");
      }

      const lucidityText = `\n\n> [!INSIGHT]\n> **Fenômeno:** ${phenomenonType}\n> **Técnica de Indução:** ${inductionTech}\n> **Nível de Lucidez:** ${lucidityLabels[lucidityLevel - 1]}${totemBlock}\n> Registrado imediatamente ao despertar via Quick Dream.`;
      finalContent += lucidityText;

      const now = new Date();
      await onSaveDream({
        title: title.trim() || `Sonho de ${formatTime24h(now)}`,
        content: finalContent,
        type: phenomenonType.includes("Projeção") ? "Visão Astral" : "Sonho",
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
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-950/95 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col gap-4">
        {/* Glow noturno decorativo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-inner">
              <CloudMoon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-bold text-white tracking-wide">
                  Onironáutica & Viagem Astral · Sussurro da Alvorada
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300">
                  Alt + S
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dite por voz ou digite imediatamente antes que a memória de Yesod se dissipe.
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

        {/* Gravação Rápida de Voz + Ditado Voz-para-Texto */}
        <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isRecording || isDictating
                  ? "bg-red-500 animate-ping"
                  : audioUrl
                  ? "bg-emerald-400"
                  : "bg-slate-500"
              }`}
            />
            <div>
              <div className="text-xs font-semibold text-slate-200">
                {isDictating
                  ? "🎙️ Ouvindo e transcrevendo sua voz em texto..."
                  : isRecording
                  ? `Gravando áudio: ${Math.floor(recordSeconds / 60)}:${(recordSeconds % 60)
                      .toString()
                      .padStart(2, "0")}s`
                  : audioUrl
                  ? "Áudio do sonho gravado e anexado!"
                  : "Captura por Voz ao Acordar (Texto ou Áudio)"}
              </div>
              <div className="text-[11px] text-slate-400">
                Fale livremente os símbolos, guias, lugares e sensações
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSpeechToText}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                isDictating
                  ? "bg-amber-500 text-slate-950 border-amber-300 animate-pulse font-bold"
                  : "bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-500/40"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isDictating ? "Parar Ditado" : "Ditar Texto"}</span>
            </button>

            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Gravar Áudio</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md animate-pulse"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Concluir</span>
              </button>
            )}
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3.5 relative z-10">
          {/* Fenômeno & Técnica */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                Tipo de Fenômeno Astral / Onírico
              </label>
              <select
                value={phenomenonType}
                onChange={(e) => setPhenomenonType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
              >
                {PHENOMENON_TYPES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                Técnica de Indução / Preparo
              </label>
              <select
                value={inductionTech}
                onChange={(e) => setInductionTech(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
              >
                {INDUCTION_TECHNIQUES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">
              TÍTULO DO SONHO OU SÍMBOLO PRINCIPAL
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Cachoeira Dourada, Caboclo na Mata, Templo Submerso..."
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
              rows={4}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 font-sans leading-relaxed resize-none"
              autoFocus
            />
          </div>

          {/* Totens de Lucidez Detectados Automaticamente */}
          {detectedTotems.length > 0 && (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Totens Oníricos Detectados (Yesod & Liber 777 Brasilis)</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {detectedTotems.map((t) => (
                  <span
                    key={t.id}
                    className="px-2 py-1 rounded-md bg-slate-900/90 border border-emerald-500/30 text-[11px] font-mono text-emerald-200"
                    title={t.meaning777}
                  >
                    {t.icon} <strong>{t.name}:</strong> {t.brasilisRuler}
                  </span>
                ))}
              </div>
            </div>
          )}

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
        <div className="flex items-center justify-between border-t border-indigo-500/20 pt-3 relative z-10">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Associa signos, fase lunar e Totens de Lucidez automaticamente</span>
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
