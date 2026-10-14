/**
 * Numerologia Tarológica (Arcanos Pessoais)
 *
 * - Carta de Nascimento (Arcano de Alma): soma de dia + mês + ano de nascimento,
 *   reduzida teosoficamente até ficar entre 1 e 22 (22 = 0, O Louco).
 * - Carta do Ano Pessoal: dia + mês de nascimento + ano corrente, reduzida.
 *   O ano pessoal é contado a partir do aniversário: antes do aniversário,
 *   ainda vigora o ano pessoal anterior.
 * - Carta do Mês Pessoal: número do ano pessoal + mês corrente, reduzida.
 */

import { THOTH_TAROT_DECK, ThothCard } from "@/lib/thothTarot";

export interface PersonalArcanum {
  key: "birth" | "year" | "month";
  label: string;
  number: number; // 0..21
  calculation: string;
  card: ThothCard | undefined;
}

const sumDigits = (n: number): number =>
  String(Math.abs(n))
    .split("")
    .reduce((acc, d) => acc + Number(d), 0);

/** Reduz até 1..22; o 22 corresponde ao Atu 0 (O Louco). */
export function reduceToArcanum(n: number): number {
  let v = Math.abs(n);
  while (v > 22) v = sumDigits(v);
  if (v === 22 || v === 0) return 0;
  return v;
}

export function getMajorArcanumCard(num: number): ThothCard | undefined {
  return THOTH_TAROT_DECK.find((c) => c.id === `atu_${num}`);
}

/** Aceita "AAAA-MM-DD" (input date) ou "DD/MM/AAAA". */
export function parseBirthdate(raw?: string): { d: number; m: number; y: number } | null {
  if (!raw) return null;
  const s = raw.trim();
  let d = 0, m = 0, y = 0;
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const br = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (iso) {
    y = +iso[1]; m = +iso[2]; d = +iso[3];
  } else if (br) {
    d = +br[1]; m = +br[2]; y = +br[3];
  } else {
    return null;
  }
  if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1000) return null;
  return { d, m, y };
}

export function getPersonalArcana(birthdate?: string, refDate: Date = new Date()): PersonalArcanum[] | null {
  const b = parseBirthdate(birthdate);
  if (!b) return null;

  const dayStr = String(b.d).padStart(2, "0");
  const monthStr = String(b.m).padStart(2, "0");
  const yearStr = String(b.y);

  // 1. Carta de Nascimento (Soma dígito a dígito: D+D + M+M + A+A+A+A)
  // Ex: 21/08/2002 -> 2+1 + 0+8 + 2+0+0+2 = 15 (O Diabo / Atu XV)
  const birthDigits = `${dayStr}${monthStr}${yearStr}`.split("").map(Number);
  const birthSum = birthDigits.reduce((acc, d) => acc + d, 0);
  const birthNum = reduceToArcanum(birthSum);

  // 2. Ano Pessoal (considera se o aniversário deste ano já passou)
  const curMonth = refDate.getMonth() + 1;
  const curDay = refDate.getDate();
  const hadBirthday = curMonth > b.m || (curMonth === b.m && curDay >= b.d);
  const personalYearRef = hadBirthday ? refDate.getFullYear() : refDate.getFullYear() - 1;
  const yearDigits = `${dayStr}${monthStr}${personalYearRef}`.split("").map(Number);
  const yearSum = yearDigits.reduce((acc, d) => acc + d, 0);
  const yearNum = reduceToArcanum(yearSum);

  // 3. Mês Pessoal (Ano Pessoal + Mês Corrente)
  const monthSum = (yearNum === 0 ? 22 : yearNum) + curMonth;
  const monthNum = reduceToArcanum(monthSum);

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  const birthCalcStr = `${dayStr[0]}+${dayStr[1]}+${monthStr[0]}+${monthStr[1]}+${yearStr.split("").join("+")} = ${birthSum}${
    birthSum > 22 ? ` → ${birthNum === 0 ? "22 (0)" : birthNum}` : ""
  }`;

  const yearRefStr = String(personalYearRef);
  const yearCalcStr = `${dayStr[0]}+${dayStr[1]}+${monthStr[0]}+${monthStr[1]}+${yearRefStr.split("").join("+")} = ${yearSum}${
    yearSum > 22 ? ` → ${yearNum === 0 ? "22 (0)" : yearNum}` : ""
  }`;

  return [
    {
      key: "birth",
      label: "Arcano de Nascimento",
      number: birthNum,
      calculation: birthCalcStr,
      card: getMajorArcanumCard(birthNum),
    },
    {
      key: "year",
      label: `Regente do Ano (${personalYearRef}/${personalYearRef + 1})`,
      number: yearNum,
      calculation: yearCalcStr,
      card: getMajorArcanumCard(yearNum),
    },
    {
      key: "month",
      label: `Regente do Mês (${monthNames[curMonth - 1]})`,
      number: monthNum,
      calculation: `Ano ${yearNum === 0 ? 22 : yearNum} + Mês ${curMonth} = ${monthSum} → ${monthNum === 0 ? "22 (0)" : monthNum}`,
      card: getMajorArcanumCard(monthNum),
    },
  ];
}
