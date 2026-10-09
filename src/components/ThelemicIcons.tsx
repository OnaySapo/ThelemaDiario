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
