/**
 * Sintetizador Web Audio API de Sino Tibetano & Gongo Cerimonial Thelêmico
 * Funciona 100% offline sem arquivos de áudio externos, sintetizando
 * parciais harmônicos metálicos ricos com decaimento exponencial suave.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export interface BellOptions {
  fundamental?: number; // Frequência base em Hz (padrão: 320Hz para tigela tibetana, 180Hz para gongo)
  duration?: number; // Duração em segundos (padrão: 4.5s)
  volume?: number; // Volume 0.0 a 1.0 (padrão: 0.6)
}

/**
 * Toca um sino tibetano suave (ideal para término de meditação Dharana ou respiração)
 */
export function playTibetanBell(options: BellOptions = {}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const baseFreq = options.fundamental || 320;
  const duration = options.duration || 4.2;
  const maxGain = options.volume || 0.6;
  const now = ctx.currentTime;

  // Razões de frequência inarmônicas típicas de sinos e taças tibetanas
  const partials = [
    { ratio: 1.0, gain: 0.65, decay: duration },
    { ratio: 2.76, gain: 0.35, decay: duration * 0.75 },
    { ratio: 5.4, gain: 0.18, decay: duration * 0.5 },
    { ratio: 8.93, gain: 0.08, decay: duration * 0.3 },
  ];

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(maxGain, now);
  masterGain.connect(ctx.destination);

  partials.forEach((p) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq * p.ratio, now);

    // Ataque rápido suave (5ms) para evitar clique estático
    oscGain.gain.setValueAtTime(0.0001, now);
    oscGain.gain.linearRampToValueAtTime(p.gain, now + 0.008);
    // Decaimento exponencial suave
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

    osc.connect(oscGain);
    oscGain.connect(masterGain);

    osc.start(now);
    osc.stop(now + p.decay + 0.1);
  });
}

/**
 * Toca um Gongo Cerimonial Solene / Profundo (ideal para o Modo Altar e Abertura de Rituais)
 */
export function playCeremonialGong(options: BellOptions = {}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const baseFreq = options.fundamental || 172; // Frequência do Ano Platônico / Tiphareth
  const duration = options.duration || 6.0;
  const maxGain = options.volume || 0.7;
  const now = ctx.currentTime;

  const partials = [
    { ratio: 1.0, gain: 0.7, decay: duration },
    { ratio: 1.98, gain: 0.45, decay: duration * 0.8 },
    { ratio: 3.01, gain: 0.3, decay: duration * 0.6 },
    { ratio: 4.88, gain: 0.15, decay: duration * 0.4 },
    { ratio: 7.12, gain: 0.07, decay: duration * 0.25 },
  ];

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(maxGain, now);
  masterGain.connect(ctx.destination);

  partials.forEach((p) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq * p.ratio, now);

    // Ataque suave
    oscGain.gain.setValueAtTime(0.0001, now);
    oscGain.gain.linearRampToValueAtTime(p.gain, now + 0.015);
    // Decaimento
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

    osc.connect(oscGain);
    oscGain.connect(masterGain);

    osc.start(now);
    osc.stop(now + p.decay + 0.1);
  });
}

/**
 * Toca a bateria tradicional thelêmica (Knocks/Baterias ritualísticas, ex: 3-5-3 ou 1 toque solene)
 */
export function playRitualKnock() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(260, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

  gain.gain.setValueAtTime(0.8, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.16);
}

/**
 * Toca o som suave e tátil de deslizamento de carta ao ser puxada do baralho
 */
export function playCardDealSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(420, now);
  osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.1);
}

/**
 * Toca o som nítido de virar uma lâmina de tarô (card flip)
 */
export function playCardFlipSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(680, now);
  osc.frequency.exponentialRampToValueAtTime(280, now + 0.06);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}

/**
 * Drone meditativo de energização (tônica grave + quinta + oitava com "respiração"
 * lenta via LFO). Usado no chamado do nome do consulente antes da tiragem.
 * Retorna uma função para interromper o som suavemente.
 */
export function playEnergizationDrone(durationSec = 6, volume = 0.22): () => void {
  const ctx = getAudioContext();
  if (!ctx) return () => {};
  const now = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(volume, now + 1.2);
  master.gain.setValueAtTime(volume, now + Math.max(1.3, durationSec - 1.4));
  master.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

  // Filtro passa-baixa para timbre quente
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(900, now);
  filter.connect(master);
  master.connect(ctx.destination);

  // LFO de respiração (pulsação ~0.5 Hz) sobre o volume
  const breath = ctx.createGain();
  breath.gain.setValueAtTime(0.75, now);
  breath.connect(filter);
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.setValueAtTime(0.5, now);
  lfoGain.gain.setValueAtTime(0.25, now);
  lfo.connect(lfoGain);
  lfoGain.connect(breath.gain);
  lfo.start(now);
  lfo.stop(now + durationSec + 0.2);

  const base = 136.1; // "OM" (frequência do ano terrestre)
  const voices = [
    { f: base, g: 0.55, type: "sine" as OscillatorType, detune: 0 },
    { f: base, g: 0.25, type: "triangle" as OscillatorType, detune: 6 },
    { f: base * 1.5, g: 0.22, type: "sine" as OscillatorType, detune: -4 },
    { f: base * 2, g: 0.14, type: "sine" as OscillatorType, detune: 3 },
    { f: base * 3, g: 0.05, type: "sine" as OscillatorType, detune: 0 },
  ];
  const oscs: OscillatorNode[] = [];
  voices.forEach((v) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = v.type;
    o.frequency.setValueAtTime(v.f, now);
    o.detune.setValueAtTime(v.detune, now);
    g.gain.setValueAtTime(v.g, now);
    o.connect(g);
    g.connect(breath);
    o.start(now);
    o.stop(now + durationSec + 0.2);
    oscs.push(o);
  });

  return () => {
    try {
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), t);
      master.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      oscs.forEach((o) => o.stop(t + 0.45));
      lfo.stop(t + 0.45);
    } catch (e) {}
  };
}
