"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Bell,
  Sparkles,
  Flame,
  Wind,
  CheckCircle,
  AlertCircle,
  FilePlus,
  Clock,
} from "lucide-react";
import { playTibetanBell, playCeremonialGong, playRitualKnock } from "@/lib/audioBell";
import { EstrelaDeThelema } from "@/components/ThelemicIcons";

export type PracticeMode = "dharana" | "pranayama" | "ritual" | "asana";

interface RitualTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogPracticeNote: (category: string, title: string, content: string) => void;
}

export function RitualTimerModal({
  isOpen,
  onClose,
  onLogPracticeNote,
}: RitualTimerModalProps) {
  const [mode, setMode] = useState<PracticeMode>("dharana");

  // Timer States
  const [isRunning, setIsRunning] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [targetDuration, setTargetDuration] = useState<number>(600); // 10 min default for Dharana
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Dharana Concentration Breaks Counter (Liber E)
  const [dharanaBreaks, setDharanaBreaks] = useState<number>(0);
  const [breakTimestamps, setBreakTimestamps] = useState<number[]>([]);

  // Asana selected posture
  const [selectedAsana, setSelectedAsana] = useState("O Deus (Osíris sentado)");

  // Pranayama State (4:4:4:4)
  const [pranayamaPhase, setPranayamaPhase] = useState<"inspire" | "hold_full" | "expire" | "hold_empty">("inspire");
  const [pranayamaPhaseTime, setPranayamaPhaseTime] = useState(0);
  const [pranayamaStepDuration, setPranayamaStepDuration] = useState(4); // 4 segundos cada fase
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  // Ritual Steps Marker
  const [ritualStages, setRitualStages] = useState<string[]>([]);
  const RITUAL_PRESETS = [
    "Abertura & Banimento (LBR/RP)",
    "Purificação pela Água & Consagração pelo Fogo",
    "Invocação da Deidade / Força",
    "Trabalho / Vontade / Carga do Sigilo",
    "Licença para Partir & Selamento",
    "Banimento Final",
  ];

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset on open/close or mode switch
  useEffect(() => {
    if (!isOpen) {
      setIsRunning(false);
      setSecondsElapsed(0);
      setDharanaBreaks(0);
      setBreakTimestamps([]);
      setRitualStages([]);
      setCyclesCompleted(0);
      setPranayamaPhaseTime(0);
    }
  }, [isOpen]);

  // Main Timer Interval
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => {
          const next = prev + 1;

          // Dharana target reached
          if (mode === "dharana" && targetDuration > 0 && next >= targetDuration) {
            setIsRunning(false);
            if (soundEnabled) {
              playTibetanBell({ volume: 0.8, duration: 6 });
            }
          }

          return next;
        });

        // Pranayama cycle progression
        if (mode === "pranayama") {
          setPranayamaPhaseTime((prev) => {
            const next = prev + 1;
            if (next >= pranayamaStepDuration) {
              setPranayamaPhase((cur) => {
                if (cur === "inspire") return "hold_full";
                if (cur === "hold_full") return "expire";
                if (cur === "expire") return "hold_empty";
                setCyclesCompleted((c) => c + 1);
                return "inspire";
              });
              if (soundEnabled) playRitualKnock();
              return 0;
            }
            return next;
          });
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, targetDuration, pranayamaStepDuration, soundEnabled]);

  // Keyboard shortcut: Spacebar to count Dharana Break while running
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (mode === "dharana" && isRunning && e.code === "Space") {
        e.preventDefault();
        handleAddDharanaBreak();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, mode, isRunning, secondsElapsed]);

  const handleStartPause = () => {
    if (!isRunning && secondsElapsed === 0 && soundEnabled) {
      playTibetanBell({ volume: 0.6 });
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsElapsed(0);
    setDharanaBreaks(0);
    setBreakTimestamps([]);
    setCyclesCompleted(0);
    setPranayamaPhaseTime(0);
    setRitualStages([]);
  };

  const handleAddDharanaBreak = () => {
    setDharanaBreaks((prev) => prev + 1);
    setBreakTimestamps((prev) => [...prev, secondsElapsed]);
    if (soundEnabled) {
      playRitualKnock();
    }
  };

  const toggleRitualStage = (stageName: string) => {
    setRitualStages((prev) =>
      prev.includes(stageName)
        ? prev.filter((s) => s !== stageName)
        : [...prev, stageName]
    );
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Convert practice into a rich Markdown Note
  const handleSaveToDiary = () => {
    const mins = Math.max(1, Math.round(secondsElapsed / 60));
    let title = "";
    let content = "";

    if (mode === "dharana") {
      title = `Sessão de Dharana — ${mins} min (${dharanaBreaks} quebras)`;
      content = [
        `### Sessão de Dharana (Concentração Mental — Liber E)`,
        `- **Duração da Operação:** ${mins} minutos (${formatTime(secondsElapsed)})`,
        `- **Total de Quebras de Foco:** ${dharanaBreaks} interrupções registradas`,
        `- **Taxa de Concentração:** ${(
          secondsElapsed > 0 ? (secondsElapsed / Math.max(1, dharanaBreaks + 1)).toFixed(1) : "0"
        )}s médios de foco contínuo por intervalo`,
        "",
        `#### Objeto de Foco & Símbolo:`,
        `Tattva / Ponto luminoso / Yantra mental`,
        "",
        `#### Fenomenologia & Observações da Mente:`,
        `Descreva aqui pensamentos intrusivos, estado do corpo e qualidade da absorção dharânica...`,
      ].join("\n");
    } else if (mode === "pranayama") {
      title = `Sessão de Pranayama — ${cyclesCompleted} Ciclos (${mins} min)`;
      content = [
        `### Prática de Pranayama (Controle do Prana — Liber E)`,
        `- **Duração da Prática:** ${mins} minutos (${formatTime(secondsElapsed)})`,
        `- **Ciclos Completados:** ${cyclesCompleted} respirações completas`,
        `- **Ritmo Utilizado:** ${pranayamaStepDuration}:${pranayamaStepDuration}:${pranayamaStepDuration}:${pranayamaStepDuration} (Puraka : Kumbhaka : Rechaka : Shunyaka)`,
        "",
        `#### Sensações Energéticas & Sudorese:`,
        `Descreva o fluxo de energia pela coluna (Sushumna), calor corporal e acalmia da mente...`,
      ].join("\n");
    } else if (mode === "asana") {
      title = `Prática de Asana — ${selectedAsana} (${mins} min)`;
      content = [
        `### Prática de Asana (Postura Imóvel — Liber E)`,
        `- **Postura Escolhida:** ${selectedAsana}`,
        `- **Tempo de Permanência:** ${mins} minutos (${formatTime(secondsElapsed)})`,
        `- **Controle de Inquietação:** Registre tremores musculares ou dores observadas`,
        "",
        `#### Observações do Observador:`,
        `Qualidade da quietude corporal e transição para o silêncio interior...`,
      ].join("\n");
    } else {
      title = `Operação Ritualística — ${mins} min`;
      content = [
        `### Operação Ritualística`,
        `- **Duração:** ${mins} minutos (${formatTime(secondsElapsed)})`,
        `- **Etapas Executadas:** ${ritualStages.join(", ") || "Ritual completo"}`,
        "",
        `#### Fenômenos & Resultados Mágickos:`,
        `Descreva aqui as vibrações dos nomes divinos, presença astral e confirmação...`,
      ].join("\n");
    }

    onLogPracticeNote("Prática", title, content);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-medium-850 border border-medium-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-medium-700 bg-medium-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <EstrelaDeThelema className="w-5 h-5 text-white" />
            <div>
              <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                Cronômetro Ritual & Dharana
              </h3>
              <span className="text-[11px] font-mono text-medium-400">
                Método científico de medição para concentração, asana e rituais (Liber E)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playTibetanBell({ volume: 0.4 });
              }}
              className={`p-1.5 rounded border transition-colors ${
                soundEnabled
                  ? "bg-medium-800 text-white border-medium-700"
                  : "bg-medium-900 text-medium-500 border-medium-800"
              }`}
              title={soundEnabled ? "Sino ativado" : "Sino silenciado"}
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-medium-400 hover:text-white rounded hover:bg-medium-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Practice Mode Selector Tabs */}
        <div className="grid grid-cols-4 border-b border-medium-700 bg-medium-900/40 text-xs font-mono">
          <button
            onClick={() => {
              setMode("dharana");
              handleReset();
            }}
            className={`py-2.5 px-2 text-center transition-all border-b-2 ${
              mode === "dharana"
                ? "border-white text-white font-bold bg-medium-800/60"
                : "border-transparent text-medium-400 hover:text-white"
            }`}
          >
            Dharana
          </button>
          <button
            onClick={() => {
              setMode("pranayama");
              handleReset();
            }}
            className={`py-2.5 px-2 text-center transition-all border-b-2 ${
              mode === "pranayama"
                ? "border-white text-white font-bold bg-medium-800/60"
                : "border-transparent text-medium-400 hover:text-white"
            }`}
          >
            Pranayama
          </button>
          <button
            onClick={() => {
              setMode("asana");
              handleReset();
            }}
            className={`py-2.5 px-2 text-center transition-all border-b-2 ${
              mode === "asana"
                ? "border-white text-white font-bold bg-medium-800/60"
                : "border-transparent text-medium-400 hover:text-white"
            }`}
          >
            Asana
          </button>
          <button
            onClick={() => {
              setMode("ritual");
              handleReset();
            }}
            className={`py-2.5 px-2 text-center transition-all border-b-2 ${
              mode === "ritual"
                ? "border-white text-white font-bold bg-medium-800/60"
                : "border-transparent text-medium-400 hover:text-white"
            }`}
          >
            Ritual
          </button>
        </div>

        {/* Main Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 flex flex-col items-center text-center">
          {/* Big Digital Display */}
          <div className="relative flex flex-col items-center justify-center my-2">
            <span className="font-mono text-6xl md:text-7xl font-bold tracking-tight text-white select-none">
              {formatTime(secondsElapsed)}
            </span>

            {mode === "dharana" && targetDuration > 0 && (
              <span className="text-xs font-mono text-medium-400 mt-1">
                Meta: {formatTime(targetDuration)} · Restante:{" "}
                {formatTime(Math.max(0, targetDuration - secondsElapsed))}
              </span>
            )}
          </div>

          {/* Mode Specific Controls & Widgets */}
          {mode === "dharana" && (
            <div className="w-full space-y-4">
              {/* Presets de Tempo */}
              <div className="flex justify-center gap-2">
                {[300, 600, 900, 1800].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => {
                      setTargetDuration(sec);
                      handleReset();
                    }}
                    className={`px-3 py-1 rounded text-xs font-mono border transition-colors ${
                      targetDuration === sec
                        ? "bg-white text-black font-semibold border-white"
                        : "bg-medium-900 text-medium-400 hover:text-white border-medium-750"
                    }`}
                  >
                    {sec / 60} min
                  </button>
                ))}
              </div>

              {/* Botão Gigante de Quebra de Foco (Dharana Breaks) */}
              <div className="p-4 rounded-xl bg-medium-900 border border-medium-750 flex flex-col items-center gap-2">
                <span className="text-[11px] font-mono text-medium-400 uppercase tracking-wider">
                  Contador de Falhas de Concentração (Liber E)
                </span>
                <button
                  type="button"
                  onClick={handleAddDharanaBreak}
                  disabled={!isRunning}
                  className={`w-full py-4 px-6 rounded-xl text-sm font-bold font-sans uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                    isRunning
                      ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/50 active:scale-98 cursor-pointer"
                      : "bg-medium-800/40 text-medium-500 border border-medium-800 cursor-not-allowed"
                  }`}
                >
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  <span>Registrar Quebra de Foco (Barra de Espaço)</span>
                  <span className="ml-2 px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-300 font-mono text-base font-bold">
                    {dharanaBreaks}
                  </span>
                </button>
                <span className="text-[10px] font-mono text-medium-500">
                  Pressione quando um pensamento estranho penetrar sua concentração no objeto.
                </span>
              </div>
            </div>
          )}

          {mode === "pranayama" && (
            <div className="w-full space-y-4 flex flex-col items-center">
              {/* Orb visual respiratório */}
              <div className="relative w-36 h-36 rounded-full flex items-center justify-center border-2 border-medium-700 bg-medium-900 overflow-hidden shadow-inner my-2">
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                    pranayamaPhase === "inspire"
                      ? "bg-blue-500/20 scale-100"
                      : pranayamaPhase === "hold_full"
                      ? "bg-amber-500/25 scale-105"
                      : pranayamaPhase === "expire"
                      ? "bg-purple-500/20 scale-90"
                      : "bg-neutral-800/40 scale-75"
                  }`}
                />
                <div className="relative text-center z-10">
                  <Wind className="w-6 h-6 text-white mx-auto mb-1 animate-pulse" />
                  <span className="text-xs font-bold font-sans uppercase tracking-wider text-white block">
                    {pranayamaPhase === "inspire"
                      ? "Inspirar"
                      : pranayamaPhase === "hold_full"
                      ? "Reter Cheio"
                      : pranayamaPhase === "expire"
                      ? "Expirar"
                      : "Reter Vazio"}
                  </span>
                  <span className="font-mono text-lg font-semibold text-white">
                    {pranayamaStepDuration - pranayamaPhaseTime}s
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-medium-300">
                <span>Ciclos completados: <strong className="text-white">{cyclesCompleted}</strong></span>
                <span>·</span>
                <span>Ritmo: <strong className="text-white">{pranayamaStepDuration}s</strong> por fase</span>
              </div>
            </div>
          )}

          {mode === "asana" && (
            <div className="w-full space-y-3 text-left">
              <label className="block text-[11px] font-mono text-medium-400">
                POSTURA SELECIONADA (LIBER E):
              </label>
              <select
                value={selectedAsana}
                onChange={(e) => setSelectedAsana(e.target.value)}
                className="w-full bg-medium-900 border border-medium-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-sans"
              >
                <option value="O Deus (Osíris sentado, mãos nos joelhos)">O Deus (Osíris sentado, mãos nos joelhos)</option>
                <option value="O Trovão (Vajrasana, sobre os calcanhares)">O Trovão (Vajrasana, sobre os calcanhares)</option>
                <option value="O Dragão (De cócoras com coluna ereta)">O Dragão (De cócoras com coluna ereta)</option>
                <option value="O Íbis (Em pé em uma só perna)">O Íbis (Em pé em uma só perna)</option>
                <option value="Lótus Completo (Padmasana)">Lótus Completo (Padmasana)</option>
              </select>
            </div>
          )}

          {mode === "ritual" && (
            <div className="w-full space-y-2 text-left">
              <span className="block text-[11px] font-mono text-medium-400 mb-1">
                MARCADORES DE ETAPAS DO RITUAL:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {RITUAL_PRESETS.map((stage, idx) => {
                  const isDone = ritualStages.includes(stage);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleRitualStage(stage)}
                      className={`p-2 rounded text-left text-xs font-sans flex items-center justify-between border transition-all ${
                        isDone
                          ? "bg-white text-black font-semibold border-white"
                          : "bg-medium-900 text-medium-300 hover:text-white border-medium-750"
                      }`}
                    >
                      <span className="truncate">{stage}</span>
                      {isDone && <CheckCircle className="w-3.5 h-3.5 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons: Play/Pause/Reset */}
          <div className="flex items-center gap-3 pt-4 border-t border-medium-750 w-full justify-center">
            <button
              onClick={handleStartPause}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md active:scale-95 ${
                isRunning
                  ? "bg-amber-400 hover:bg-amber-300 text-black"
                  : "bg-white hover:bg-medium-200 text-black"
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isRunning ? "Pausar" : "Iniciar Prática"}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-medium-900 hover:bg-medium-800 text-medium-300 hover:text-white border border-medium-750 transition-colors"
              title="Reiniciar cronômetro"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => playCeremonialGong({ volume: 0.6 })}
              className="p-2.5 rounded-xl bg-medium-900 hover:bg-medium-800 text-medium-300 hover:text-white border border-medium-750 transition-colors"
              title="Tocar Gongo Cerimonial"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer: Create Note */}
        <div className="p-4 border-t border-medium-700 bg-medium-900/60 flex items-center justify-between">
          <span className="text-[11px] font-mono text-medium-400">
            {secondsElapsed > 0 ? `${formatTime(secondsElapsed)} acumulados` : "Pronto para iniciar"}
          </span>
          <button
            onClick={handleSaveToDiary}
            disabled={secondsElapsed < 5}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              secondsElapsed >= 5
                ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-sm"
                : "bg-medium-800 text-medium-500 cursor-not-allowed border border-medium-750"
            }`}
          >
            <FilePlus className="w-4 h-4" />
            <span>Registrar como Nota de Prática</span>
          </button>
        </div>
      </div>
    </div>
  );
}
