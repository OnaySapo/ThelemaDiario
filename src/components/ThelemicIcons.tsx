import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

// 1. Estrela de Thelema (Hexagrama Unicursal Canônico de Crowley)
export function EstrelaDeThelema({ className = "w-5 h-5", size = 24 }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M 50,6 L 88,72 L 50,48 L 12,24 L 88,24 L 50,48 L 12,72 L 50,94 Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Rosa Central de 5 Pétalas */}
      <circle cx="50" cy="48" r="7" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="50" cy="43" r="2.5" fill="currentColor" />
      <circle cx="55" cy="46.5" r="2.5" fill="currentColor" />
      <circle cx="53" cy="52" r="2.5" fill="currentColor" />
      <circle cx="47" cy="52" r="2.5" fill="currentColor" />
      <circle cx="45" cy="46.5" r="2.5" fill="currentColor" />
    </svg>
  );
}

// 2. Ícone para a Categoria: ESTUDO (Rolo Sagrado / Pena de Thoth)
export function IconeEstudo({ className = "w-4 h-4", size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Livro Aberto com Marcador Mágico */}
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M12 6v6" />
      <path d="M9 9h6" />
      <circle cx="12" cy="15" r="1" fill="currentColor" />
    </svg>
  );
}

// 3. Ícone para a Categoria: VISÃO ASTRAL (Olho de Hórus / Olho Desperto)
export function IconeVisaoAstral({ className = "w-4 h-4", size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Olho de Hórus / Visão do Espírito */}
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.5 4.5l1.5 1.5" />
      <path d="M18 6l1.5-1.5" />
    </svg>
  );
}

// 4. Ícone para a Categoria: SONHO (Crescente Astral & Estrelas de Nuit)
export function IconeSonho({ className = "w-4 h-4", size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Lua Crescente com Brilho Onírico */}
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      <path d="M17 4l.5 1.5L19 6l-1.5.5L17 8l-.5-1.5L15 6l1.5-.5z" fill="currentColor" stroke="none" />
      <circle cx="13" cy="9" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// 5. Ícone para a Categoria: ORÁCULO (Lâmina Sagrada de Thoth)
export function IconeOraculo({ className = "w-4 h-4", size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Carta de Tarô com Símbolo de Luz */}
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 7v2" />
      <path d="M12 15v2" />
      <path d="M7 12h2" />
      <path d="M15 12h2" />
    </svg>
  );
}

// 6. Ícone para a Categoria: PRÁTICA (Pentagrama / Espada de Vontade)
export function IconePratica({ className = "w-4 h-4", size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Pentagrama de Vontade de Thelema */}
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

// 7. Sol Thelêmico ☉
export function IconeSolThelema({ className = "w-4 h-4", size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

// 8. Lua Thelêmica ☽
export function IconeLuaThelema({ className = "w-4 h-4", size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.5 5.5 0 0 1-7.54-7.54A8.99 8.99 0 0 0 12 3z" />
    </svg>
  );
}

// 9. Ícone para a Categoria: DIÁRIO (Caderno Secular / Crônica Mundana)
export function IconeDiario({ className = "w-4 h-4", size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Caderno com linhas de escrita e pena secular */}
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 19.5z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
    </svg>
  );
}

export function getCategoryThelemicIcon(category: string, className = "w-4 h-4") {
  const norm = (category || "").toLowerCase();
  if (norm.includes("diário") || norm.includes("diario") || norm === "journal" || norm === "mundane") return <IconeDiario className={className} />;
  if (norm.includes("estudo")) return <IconeEstudo className={className} />;
  if (norm.includes("visão") || norm.includes("visao")) return <IconeVisaoAstral className={className} />;
  if (norm.includes("sonho")) return <IconeSonho className={className} />;
  if (norm.includes("oráculo") || norm.includes("oraculo")) return <IconeOraculo className={className} />;
  return <IconePratica className={className} />;
}

// =========================================================================
// 12 SIGNOS DO ZODÍACO (VETORES SVG PERSONALIZADOS EM PRETO & BRANCO)
// Substitui os emojis padrão roxos do Windows por glifos vetoriais nítidos
// =========================================================================

// 1. Áries (Aries) ♈
export function IconeAries({ className = "w-4 h-4", size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 21V8" />
      <path d="M12 8C12 4.5 8.5 3.5 6 5.5C4 7 4.5 10.5 7.5 10.5" />
      <path d="M12 8C12 4.5 15.5 3.5 18 5.5C20 7 19.5 10.5 16.5 10.5" />
    </svg>
  );
}

// 2. Touro (Taurus) ♉
export function IconeTouro({ className = "w-4 h-4", size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 4.5C6.5 9 17.5 9 19 4.5" />
      <circle cx="12" cy="15" r="5.5" />
    </svg>
  );
}

// 3. Gêmeos (Gemini) ♊
export function IconeGemeos({ className = "w-4 h-4", size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 4.5C8.5 7 15.5 7 20 4.5" />
      <path d="M4 19.5C8.5 17 15.5 17 20 19.5" />
      <path d="M9 5.5V18.5" />
      <path d="M15 5.5V18.5" />
    </svg>
  );
}

// 4. Câncer (Cancer) ♋
export function IconeCancer({ className = "w-4 h-4", size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="7" cy="9" r="2.5" />
      <path d="M9.5 9C14 7 19 8.5 19 12" />
      <circle cx="17" cy="15" r="2.5" />
      <path d="M14.5 15C10 17 5 15.5 5 12" />
    </svg>
  );
}

// 5. Leão (Leo) ♌
export function IconeLeao({ className = "w-4 h-4", size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="6.5" cy="15.5" r="2.5" />
      <path d="M9 15C9 9 14.5 5.5 16.5 10C17.5 13 18.5 18.5 21 16" />
    </svg>
  );
}

// 6. Virgem (Virgo) ♍
export function IconeVirgem({ className = "w-4 h-4", size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 18V8C4 5.5 7 5.5 7.5 8V18" />
      <path d="M7.5 8C8 5.5 11 5.5 11.5 8V18" />
      <path d="M11.5 8C12 5.5 15.5 5.5 16 8V16C16 19 14 20.5 12.5 19L19.5 12" />
    </svg>
  );
}

// 7. Libra (Libra) ♎
export function IconeLibra({ className = "w-4 h-4", size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 15H8A4 4 0 0 1 16 15H20" />
      <path d="M4 19H20" />
    </svg>
  );
}

// 8. Escorpião (Scorpio) ♏
export function IconeEscorpiao({ className = "w-4 h-4", size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 18V8C4 5.5 7 5.5 7.5 8V18" />
      <path d="M7.5 8C8 5.5 11 5.5 11.5 8V18" />
      <path d="M11.5 8C12 5.5 15.5 5.5 16 8V18H20" />
      <path d="M17.5 15.5L20 18L17.5 20.5" />
    </svg>
  );
}

// 9. Sagitário (Sagittarius) ♐
export function IconeSagitario({ className = "w-4 h-4", size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 19L19 5" />
      <path d="M13 5H19V11" />
      <path d="M7.5 11.5L12.5 16.5" />
    </svg>
  );
}

// 10. Capricórnio (Capricorn) ♑
export function IconeCapricornio({ className = "w-4 h-4", size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 7L8 18L12 7" />
      <path d="M12 7C14 4.5 17 5 17 9C17 14 13 17 15 20C16.5 22 19.5 21 20 18.5C20.5 15.5 17.5 15 17 18" />
    </svg>
  );
}

// 11. Aquário (Aquarius) ♒
export function IconeAquario({ className = "w-4 h-4", size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 8.5L6.5 6L10 8.5L13.5 6L17 8.5L20.5 6" />
      <path d="M3 15.5L6.5 13L10 15.5L13.5 13L17 15.5L20.5 13" />
    </svg>
  );
}

// 12. Peixes (Pisces) ♓
export function IconePeixes({ className = "w-4 h-4", size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7 4C4.5 8.5 4.5 15.5 7 20" />
      <path d="M17 4C19.5 8.5 19.5 15.5 17 20" />
      <path d="M4 12H20" />
    </svg>
  );
}

// =========================================================================
// RENDERIZADOR UNIVERSAL DE SIGNO DO ZODÍACO
// =========================================================================
export function ZodiacIcon({
  sign,
  className = "w-4 h-4",
  size = 18,
}: {
  sign?: string;
  className?: string;
  size?: number;
}) {
  const s = (sign || "").trim().toLowerCase();

  if (s === "♈" || s.includes("áries") || s.includes("aries")) return <IconeAries className={className} size={size} />;
  if (s === "♉" || s.includes("touro") || s.includes("taurus")) return <IconeTouro className={className} size={size} />;
  if (s === "♊" || s.includes("gêmeos") || s.includes("gemeos") || s.includes("gemini")) return <IconeGemeos className={className} size={size} />;
  if (s === "♋" || s.includes("câncer") || s.includes("cancer")) return <IconeCancer className={className} size={size} />;
  if (s === "♌" || s.includes("leão") || s.includes("leao") || s.includes("leo")) return <IconeLeao className={className} size={size} />;
  if (s === "♍" || s.includes("virgem") || s.includes("virgo")) return <IconeVirgem className={className} size={size} />;
  if (s === "♎" || s.includes("libra")) return <IconeLibra className={className} size={size} />;
  if (s === "♏" || s.includes("escorpião") || s.includes("escorpiao") || s.includes("scorpio")) return <IconeEscorpiao className={className} size={size} />;
  if (s === "♐" || s.includes("sagitário") || s.includes("sagitario") || s.includes("sagittarius")) return <IconeSagitario className={className} size={size} />;
  if (s === "♑" || s.includes("capricórnio") || s.includes("capricornio") || s.includes("capricorn")) return <IconeCapricornio className={className} size={size} />;
  if (s === "♒" || s.includes("aquário") || s.includes("aquario") || s.includes("aquarius")) return <IconeAquario className={className} size={size} />;
  if (s === "♓" || s.includes("peixes") || s.includes("pisces")) return <IconePeixes className={className} size={size} />;
  if (s === "☉" || s.includes("sol") || s.includes("sun")) return <IconeSolThelema className={className} size={size} />;
  if (s === "☽" || s.includes("lua") || s.includes("moon")) return <IconeLuaThelema className={className} size={size} />;

  return <span className={className}>{sign}</span>;
}

// =========================================================================
// RENDERIZADOR DE DATA THELÊMICA COM GLIFOS VETORIAIS INTEGRADOS
// =========================================================================
export function ThelemicDateDisplay({
  thelemicDate,
  className = "inline-flex items-center gap-1 flex-wrap",
}: {
  thelemicDate?: string;
  className?: string;
}) {
  if (!thelemicDate) {
    return <span className="opacity-60 font-mono">Thelemic Record</span>;
  }

  // Regex para capturar os símbolos planetários e zodiacais
  const regex = /([☉☽♈♉♊♋♌♍♎♏♐♑♒♓])/g;
  const parts = thelemicDate.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part) return null;
        if (part === "☉") {
          return (
            <span key={index} className="inline-flex items-center text-current shrink-0 align-middle" title="Sol ☉">
              <IconeSolThelema className="w-3.5 h-3.5 inline-block" size={14} />
            </span>
          );
        }
        if (part === "☽") {
          return (
            <span key={index} className="inline-flex items-center text-current shrink-0 align-middle" title="Lua ☽">
              <IconeLuaThelema className="w-3.5 h-3.5 inline-block" size={14} />
            </span>
          );
        }
        if (["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"].includes(part)) {
          return (
            <span
              key={index}
              className="inline-flex items-center justify-center text-current bg-white/10 px-1 py-0.5 rounded border border-white/15 shadow-xs mx-0.5 shrink-0 align-middle"
              title={`Signo ${part}`}
            >
              <ZodiacIcon sign={part} className="w-3.5 h-3.5" size={14} />
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
