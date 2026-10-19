import * as Astronomy from "astronomy-engine";
import { formatTime24h, formatDateTimeBR } from "@/lib/dateUtils";

export interface AstrologicalCoordinates {
  date: string;
  thelemicDate: string;
  sunSign: string;
  sunSignSymbol: string;
  sunDegree: number;
  sunDegreeFormatted: string;
  moonSign: string;
  moonSignSymbol: string;
  moonDegree: number;
  moonDegreeFormatted: string;
  moonPhaseName: string;
  moonPhaseIcon: string;
  moonIllumination: number; // 0 to 100%
  moonAngle: number;
  planetaryDay: string;
  planetaryDaySymbol: string;
  planetaryHour: string;
  planetaryHourSymbol: string;
  isDiurnal?: boolean;
  hourNumber?: number;
  sunrise?: string;
  sunset?: string;
}

const ZODIAC_SIGNS = [
  { name: "Áries", symbol: "♈", element: "Fogo" },
  { name: "Touro", symbol: "♉", element: "Terra" },
  { name: "Gêmeos", symbol: "♊", element: "Ar" },
  { name: "Câncer", symbol: "♋", element: "Água" },
  { name: "Leão", symbol: "♌", element: "Fogo" },
  { name: "Virgem", symbol: "♍", element: "Terra" },
  { name: "Libra", symbol: "♎", element: "Ar" },
  { name: "Escorpião", symbol: "♏", element: "Água" },
  { name: "Sagitário", symbol: "♐", element: "Fogo" },
  { name: "Capricórnio", symbol: "♑", element: "Terra" },
  { name: "Aquário", symbol: "♒", element: "Ar" },
  { name: "Peixes", symbol: "♓", element: "Água" },
];

const PLANETARY_DAYS = [
  { name: "Dies Solis", symbol: "☉", ruler: "Sol", chaldeanIndex: 3 },      // Sunday
  { name: "Dies Lunae", symbol: "☽", ruler: "Lua", chaldeanIndex: 6 },      // Monday
  { name: "Dies Martis", symbol: "♂", ruler: "Marte", chaldeanIndex: 2 },    // Tuesday
  { name: "Dies Mercurii", symbol: "☿", ruler: "Mercúrio", chaldeanIndex: 5 },// Wednesday
  { name: "Dies Jovis", symbol: "♃", ruler: "Júpiter", chaldeanIndex: 1 },   // Thursday
  { name: "Dies Veneris", symbol: "♀", ruler: "Vênus", chaldeanIndex: 4 },    // Friday
  { name: "Dies Saturni", symbol: "♄", ruler: "Saturno", chaldeanIndex: 0 },  // Saturday
];

// Chaldean order: Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon
const CHALDEAN_ORDER = [
  { name: "Saturno", symbol: "♄" },
  { name: "Júpiter", symbol: "♃" },
  { name: "Marte", symbol: "♂" },
  { name: "Sol", symbol: "☉" },
  { name: "Vênus", symbol: "♀" },
  { name: "Mercúrio", symbol: "☿" },
  { name: "Lua", symbol: "☽" },
];

function toRoman(num: number, lowercase = false): string {
  const romanMap: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let res = "";
  let n = num;
  for (const [val, str] of romanMap) {
    while (n >= val) {
      res += str;
      n -= val;
    }
  }
  return lowercase ? res.toLowerCase() : res;
}

export function calculateThelemicYear(targetDate: Date): string {
  const year = targetDate.getFullYear();
  // Equinox of the Gods occurred around March 21, 1904
  const equinoxThisYear = new Date(year, 2, 20); // ~20 March
  const thelemicYears = targetDate >= equinoxThisYear ? year - 1904 : year - 1905;
  
  const cycleIndex = Math.floor(thelemicYears / 22) + 1;
  const remainder = thelemicYears % 22;
  
  const cycleRoman = toRoman(cycleIndex, false);
  const remainderRoman = remainder === 0 ? "o" : toRoman(remainder, true);
  
  return `Anno ${cycleRoman}:${remainderRoman}`;
}

export function getZodiacFromLongitude(degrees: number) {
  const normalized = ((degrees % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degreeInSign = normalized % 30;
  const sign = ZODIAC_SIGNS[signIndex] || ZODIAC_SIGNS[0];
  
  const deg = Math.floor(degreeInSign);
  const min = Math.floor((degreeInSign - deg) * 60);

  return {
    sign: sign.name,
    symbol: sign.symbol,
    element: sign.element,
    degree: Math.round(degreeInSign * 100) / 100,
    formatted: `${deg}°${min.toString().padStart(2, "0")}' ${sign.symbol}`,
  };
}

export function getMoonPhaseDetails(moonAngle: number, phaseFraction: number) {
  // MoonAngle is 0 at New Moon, 90 at First Quarter, 180 at Full Moon, 270 at Third Quarter
  const angle = ((moonAngle % 360) + 360) % 360;
  
  let name = "";
  let icon = "🌑";
  
  if (angle >= 345 || angle < 15) {
    name = "Lua Nova";
    icon = "🌑";
  } else if (angle >= 15 && angle < 75) {
    name = "Lua Crescente";
    icon = "🌒";
  } else if (angle >= 75 && angle < 105) {
    name = "Quarto Crescente";
    icon = "🌓";
  } else if (angle >= 105 && angle < 165) {
    name = "Gibosa Crescente";
    icon = "🌔";
  } else if (angle >= 165 && angle < 195) {
    name = "Lua Cheia";
    icon = "🌕";
  } else if (angle >= 195 && angle < 255) {
    name = "Gibosa Minguante";
    icon = "🌖";
  } else if (angle >= 255 && angle < 285) {
    name = "Quarto Minguante";
    icon = "🌗";
  } else {
    name = "Lua Balsâmica / Minguante";
    icon = "🌘";
  }

  return {
    name,
    icon,
    illuminationPct: Math.round(phaseFraction * 100),
  };
}

export function calculatePlanetaryHour(date: Date, latitude = -23.5505, longitude = -46.6333) {
  try {
    const obs = new Astronomy.Observer(latitude, longitude, 0);

    // Search window: from 36 hours before date to catch the sunrise defining current astrological day
    const windowStart = new Date(date.getTime() - 36 * 3600 * 1000);
    let currentRise: Date | null = null;
    let searchCursor = windowStart;

    for (let i = 0; i < 5; i++) {
      const riseRes = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, 1, searchCursor, 2);
      if (!riseRes) break;
      if (riseRes.date.getTime() <= date.getTime()) {
        currentRise = riseRes.date;
        searchCursor = new Date(riseRes.date.getTime() + 10 * 60 * 1000);
      } else {
        break;
      }
    }

    if (!currentRise) {
      currentRise = new Date(date);
      currentRise.setHours(6, 0, 0, 0);
      if (currentRise.getTime() > date.getTime()) {
        currentRise.setTime(currentRise.getTime() - 24 * 3600 * 1000);
      }
    }

    const setRes = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, -1, currentRise, 2);
    const currentSet = setRes ? setRes.date : new Date(currentRise.getTime() + 12 * 3600 * 1000);

    const dayOfWeek = currentRise.getDay();
    const dayInfo = PLANETARY_DAYS[dayOfWeek];

    let hourIndex = 0;
    let isDiurnal = true;
    let hourNumber = 1;

    if (date.getTime() < currentSet.getTime()) {
      isDiurnal = true;
      const dayDuration = Math.max(1, currentSet.getTime() - currentRise.getTime());
      const hourLength = dayDuration / 12;
      const elapsed = Math.max(0, date.getTime() - currentRise.getTime());
      hourIndex = Math.min(11, Math.floor(elapsed / hourLength));
      hourNumber = hourIndex + 1;
    } else {
      isDiurnal = false;
      const nextRiseRes = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, 1, currentSet, 2);
      const nextRiseTime = nextRiseRes ? nextRiseRes.date : new Date(currentSet.getTime() + 12 * 3600 * 1000);
      const nightDuration = Math.max(1, nextRiseTime.getTime() - currentSet.getTime());
      const hourLength = nightDuration / 12;
      const elapsed = Math.max(0, date.getTime() - currentSet.getTime());
      const nightHour = Math.min(11, Math.floor(elapsed / hourLength));
      hourIndex = 12 + nightHour;
      hourNumber = nightHour + 1;
    }

    const currentChaldeanIndex = (dayInfo.chaldeanIndex + hourIndex) % 7;
    const planet = CHALDEAN_ORDER[currentChaldeanIndex];

    const formatTime = (d: Date) => formatTime24h(d);

    return {
      day: dayInfo.name,
      daySymbol: dayInfo.symbol,
      hour: `Hora de ${planet.name}`,
      hourSymbol: planet.symbol,
      hourNumber,
      isDiurnal,
      sunrise: formatTime(currentRise),
      sunset: formatTime(currentSet),
    };
  } catch (err) {
    console.error("Erro no cálculo temporal das horas planetárias:", err);
    const dayOfWeek = date.getDay();
    const dayInfo = PLANETARY_DAYS[dayOfWeek];
    const hour = date.getHours();
    const hoursSinceDawn = ((hour - 6) + 24) % 24;
    const currentChaldeanIndex = (dayInfo.chaldeanIndex + hoursSinceDawn) % 7;
    const planet = CHALDEAN_ORDER[currentChaldeanIndex];

    return {
      day: dayInfo.name,
      daySymbol: dayInfo.symbol,
      hour: `Hora de ${planet.name}`,
      hourSymbol: planet.symbol,
      hourNumber: (hoursSinceDawn % 12) + 1,
      isDiurnal: hoursSinceDawn < 12,
      sunrise: "06:00",
      sunset: "18:00",
    };
  }
}

export function getFullAstrologicalData(
  targetDate: Date = new Date(),
  latitude = -23.5505,
  longitude = -46.6333
): AstrologicalCoordinates {
  try {
    // 1. Sun Position
    const sunPos = Astronomy.SunPosition(targetDate);
    const sunZodiac = getZodiacFromLongitude(sunPos.elon);

    // 2. Moon Position & Illumination
    const moonVec = Astronomy.GeoVector(Astronomy.Body.Moon, targetDate, false);
    const moonEcl = Astronomy.Ecliptic(moonVec);
    const moonZodiac = getZodiacFromLongitude(moonEcl.elon);
    
    const moonIllum = Astronomy.Illumination(Astronomy.Body.Moon, targetDate);
    const moonPhase = Astronomy.MoonPhase(targetDate);
    const phaseInfo = getMoonPhaseDetails(moonPhase, moonIllum.phase_fraction);

    // 3. Thelemic Date & Planetary Coordinates (real temporal calculation)
    const thelemicYear = calculateThelemicYear(targetDate);
    const planetary = calculatePlanetaryHour(targetDate, latitude, longitude);

    // Crowley format: ☉ in ♎ 15°, ☽ in ♍ 21°, Dies Mercurii, Anno V:xii
    const thelemicDateFormatted = `☉ in ${sunZodiac.symbol} ${Math.floor(sunZodiac.degree)}°, ☽ in ${moonZodiac.symbol} ${Math.floor(moonZodiac.degree)}°, ${planetary.day}, ${thelemicYear}`;

    return {
      date: targetDate.toISOString(),
      thelemicDate: thelemicDateFormatted,
      sunSign: sunZodiac.sign,
      sunSignSymbol: sunZodiac.symbol,
      sunDegree: sunZodiac.degree,
      sunDegreeFormatted: sunZodiac.formatted,
      moonSign: moonZodiac.sign,
      moonSignSymbol: moonZodiac.symbol,
      moonDegree: moonZodiac.degree,
      moonDegreeFormatted: moonZodiac.formatted,
      moonPhaseName: phaseInfo.name,
      moonPhaseIcon: phaseInfo.icon,
      moonIllumination: phaseInfo.illuminationPct,
      moonAngle: Math.round(moonPhase * 10) / 10,
      planetaryDay: planetary.day,
      planetaryDaySymbol: planetary.daySymbol,
      planetaryHour: planetary.hour,
      planetaryHourSymbol: planetary.hourSymbol,
      isDiurnal: planetary.isDiurnal,
      hourNumber: planetary.hourNumber,
      sunrise: planetary.sunrise,
      sunset: planetary.sunset,
    };
  } catch (err) {
    console.error("Erro ao calcular efemérides astrológicas:", err);
    // Fallback safe defaults
    return {
      date: targetDate.toISOString(),
      thelemicDate: `☉ in ♎, Dies Solis, Anno V:xii`,
      sunSign: "Libra",
      sunSignSymbol: "♎",
      sunDegree: 15.0,
      sunDegreeFormatted: "15°00' ♎",
      moonSign: "Virgem",
      moonSignSymbol: "♍",
      moonDegree: 21.0,
      moonDegreeFormatted: "21°00' ♍",
      moonPhaseName: "Crescente",
      moonPhaseIcon: "🌒",
      moonIllumination: 25,
      moonAngle: 45,
      planetaryDay: "Dies Mercurii",
      planetaryDaySymbol: "☿",
      planetaryHour: "Hora de Mercúrio",
      planetaryHourSymbol: "☿",
    };
  }
}

export interface UpcomingMoonPhase {
  name: string;
  phaseCode: "nova" | "crescente" | "cheia" | "minguante";
  date: string;
  formattedDate: string;
  icon: string;
  illuminationPct: number;
  zodiacSign: string;
  zodiacSymbol: string;
  degreeFormatted: string;
}

export function getUpcomingMoonPhases(startDate: Date = new Date()): UpcomingMoonPhase[] {
  try {
    const phasesToSearch = [
      { angle: 0, code: "nova" as const, name: "Lua Nova", icon: "🌑", pct: 0 },
      { angle: 90, code: "crescente" as const, name: "Quarto Crescente", icon: "🌓", pct: 50 },
      { angle: 180, code: "cheia" as const, name: "Lua Cheia", icon: "🌕", pct: 100 },
      { angle: 270, code: "minguante" as const, name: "Quarto Minguante", icon: "🌗", pct: 50 },
    ];

    const rawList = phasesToSearch.flatMap((p) => {
      const searchRes = Astronomy.SearchMoonPhase(p.angle, startDate, 45);
      if (!searchRes) return [];
      const moonDate = searchRes.date;

      // Calculate Moon's Zodiac sign on that date
      const moonVec = Astronomy.GeoVector(Astronomy.Body.Moon, moonDate, false);
      const moonEcl = Astronomy.Ecliptic(moonVec);
      const zodiac = getZodiacFromLongitude(moonEcl.elon);

      return [
        {
          name: p.name,
          phaseCode: p.code,
          date: moonDate.toISOString(),
          formattedDate: formatDateTimeBR(moonDate, " às "),
          icon: p.icon,
          illuminationPct: p.pct,
          zodiacSign: zodiac.sign,
          zodiacSymbol: zodiac.symbol,
          degreeFormatted: zodiac.formatted,
          rawTime: moonDate.getTime(),
        },
      ];
    });

    rawList.sort((a, b) => a.rawTime - b.rawTime);
    return rawList.map(({ rawTime, ...rest }) => rest);
  } catch (e) {
    console.error("Erro ao calcular fases lunares:", e);
    return [];
  }
}

export interface ReshTideInfo {
  station: "Ra" | "Hathor" | "Tum" | "Khephra";
  direction: "Leste" | "Sul" | "Oeste" | "Norte";
  element: string;
  hourRange: string;
  salutation: string;
  thelemicGod: string;
  symbol: string;
  minutesToNext: number;
  nextStation: "Ra" | "Hathor" | "Tum" | "Khephra";
}

export function getReshSolarTide(date: Date = new Date()): ReshTideInfo {
  const hours = date.getHours() + date.getMinutes() / 60;

  // Ra: 03:00 to 09:00 (Dawn / East)
  // Hathor: 09:00 to 15:00 (Noon / South)
  // Tum: 15:00 to 21:00 (Sunset / West)
  // Khephra: 21:00 to 03:00 (Midnight / North)

  if (hours >= 3 && hours < 9) {
    const minsLeft = Math.round((9 - hours) * 60);
    return {
      station: "Ra",
      direction: "Leste",
      element: "Fogo / Aurora",
      hourRange: "Nascer do Sol (~06:00)",
      salutation: "Salve a Ti que és Ra em Teu nascer, mesmo a Ti que és Ra em Tua força...",
      thelemicGod: "Ra (O Sol Vitorioso no Leste)",
      symbol: "☉",
      minutesToNext: minsLeft,
      nextStation: "Hathor",
    };
  }

  if (hours >= 9 && hours < 15) {
    const minsLeft = Math.round((15 - hours) * 60);
    return {
      station: "Hathor",
      direction: "Sul",
      element: "Luz Meridiana / Êxtase",
      hourRange: "Meio-Dia Solar (~12:00)",
      salutation: "Salve a Ti que és Hathor em Teu triunfo, mesmo a Ti que és Hathor em Tua beleza...",
      thelemicGod: "Hathor (O Sol no Zênite Meridional)",
      symbol: "♀",
      minutesToNext: minsLeft,
      nextStation: "Tum",
    };
  }

  if (hours >= 15 && hours < 21) {
    const minsLeft = Math.round((21 - hours) * 60);
    return {
      station: "Tum",
      direction: "Oeste",
      element: "Crepúsculo / Introspecção",
      hourRange: "Pôr do Sol (~18:00)",
      salutation: "Salve a Ti que és Tum em Teu ocaso, mesmo a Ti que és Tum em Tua quietude...",
      thelemicGod: "Tum (O Sol Poente no Ocidente)",
      symbol: "♄",
      minutesToNext: minsLeft,
      nextStation: "Khephra",
    };
  }

  // Khephra (21h to 03h)
  const minsLeft = Math.round(((hours < 3 ? 3 - hours : 27 - hours)) * 60);
  return {
    station: "Khephra",
    direction: "Norte",
    element: "Meia-Noite / O Escaravelho Sagrado",
    hourRange: "Meia-Noite Oculta (~00:00)",
    salutation: "Salve a Ti que és Khephra em Teu esconderijo, mesmo a Ti que és Khephra em Teu silêncio...",
    thelemicGod: "Khephra (O Sol Secreto da Meia-Noite)",
    symbol: "☽",
    minutesToNext: minsLeft,
    nextStation: "Ra",
  };
}

export function getLiberReshFullText(station: "Ra" | "Hathor" | "Tum" | "Khephra"): {
  god: string;
  direction: string;
  sign: string;
  adoration: string;
  unityAdoration: string;
  fullMarkdown: string;
} {
  const unityAdoration = `Unidade que se estende além de tudo!
Eu adoro o poder do Teu alento,
Deus supremo e terrível,
que fazes os deuses e a morte tremerem diante de Ti: —
Eu, eu Te adoro!

Aparece sobre o trono de Rá!
Abre os caminhos do Khu!
Ilumina os caminhos do Ka!
Os caminhos dos Khabs percorrem para me agitar ou me acalmar!
Aum! Que ela me mate!`;

  if (station === "Ra") {
    return {
      god: "Ra",
      direction: "Leste (Nascer do Sol)",
      sign: "Sinal do Entrante / Deus Hórus",
      adoration: `Salve a Ti que és Ra em Teu nascer, mesmo a Ti que és Ra em Tua força, que viajas através dos Céus em Tua barca no Renascer do Sol. Tahuti se posta em Seu esplendor na proa, e Ra-Hoor habita no leme. Salve a Ti desde as Moradas da Noite!`,
      unityAdoration,
      fullMarkdown: `### ☀️ Liber Resh vel Helios — Adoração da Aurora (Ra)\n\n**Posição:** Voltado ao **Leste**\n**Sinal:** *Sinal do Entrante* (passo à frente com o pé esquerdo, braços lançados adiante como um dardo)\n\n> "Salve a Ti que és Ra em Teu nascer, mesmo a Ti que és Ra em Tua força, que viajas através dos Céus em Tua barca no Renascer do Sol. Tahuti se posta em Seu esplendor na proa, e Ra-Hoor habita no leme. Salve a Ti desde as Moradas da Noite!"\n\n*(Após a saudação, faz-se o Sinal do Silêncio e recita-se a Unidade:)*\n\n> ${unityAdoration.replace(/\n/g, "\n> ")}\n\n*∴ 93 93/93 ∴*\n`,
    };
  }

  if (station === "Hathor") {
    return {
      god: "Ahathoor / Hathor",
      direction: "Sul (Meio-Dia Solar)",
      sign: "Sinal de Puella / Hathor (Mão esquerda sobre o peito, direita sobre a genitália)",
      adoration: `Salve a Ti que és Hathor em Teu triunfo, mesmo a Ti que és Hathor em Tua beleza, que viajas através dos Céus em Tua barca no Zênite do Sol. Tahuti se posta em Seu esplendor na proa, e Ra-Hoor habita no leme. Salve a Ti desde as Moradas da Manhã!`,
      unityAdoration,
      fullMarkdown: `### ☀️ Liber Resh vel Helios — Adoração Meridiana (Ahathoor)\n\n**Posição:** Voltado ao **Sul**\n**Sinal:** *Sinal de Puella* (Mão esquerda velando o seio, mão direita o ventre)\n\n> "Salve a Ti que és Hathor em Teu triunfo, mesmo a Ti que és Hathor em Tua beleza, que viajas através dos Céus em Tua barca no Zênite do Sol. Tahuti se posta em Seu esplendor na proa, e Ra-Hoor habita no leme. Salve a Ti desde as Moradas da Manhã!"\n\n*(Após a saudação, faz-se o Sinal do Silêncio e recita-se a Unidade:)*\n\n> ${unityAdoration.replace(/\n/g, "\n> ")}\n\n*∴ 93 93/93 ∴*\n`,
    };
  }

  if (station === "Tum") {
    return {
      god: "Tum",
      direction: "Oeste (Pôr do Sol)",
      sign: "Sinal de Puer (Braço direito erguido em ângulo reto, mão fechada)",
      adoration: `Salve a Ti que és Tum em Teu ocaso, mesmo a Ti que és Tum em Tua quietude, que viajas através dos Céus em Tua barca no Pôr do Sol. Tahuti se posta em Seu esplendor na proa, e Ra-Hoor habita no leme. Salve a Ti desde as Moradas do Dia!`,
      unityAdoration,
      fullMarkdown: `### ☀️ Liber Resh vel Helios — Adoração do Ocaso (Tum)\n\n**Posição:** Voltado ao **Oeste**\n**Sinal:** *Sinal de Puer*\n\n> "Salve a Ti que és Tum em Teu ocaso, mesmo a Ti que és Tum em Tua quietude, que viajas através dos Céus em Tua barca no Pôr do Sol. Tahuti se posta em Seu esplendor na proa, e Ra-Hoor habita no leme. Salve a Ti desde as Moradas do Dia!"\n\n*(Após a saudação, faz-se o Sinal do Silêncio e recita-se a Unidade:)*\n\n> ${unityAdoration.replace(/\n/g, "\n> ")}\n\n*∴ 93 93/93 ∴*\n`,
    };
  }

  return {
    god: "Khephra",
    direction: "Norte (Meia-Noite)",
    sign: "Sinal de Baphomet / Ísis em Luto",
    adoration: `Salve a Ti que és Khephra em Teu esconderijo, mesmo a Ti que és Khephra em Teu silêncio, que viajas através dos Céus em Tua barca na Meia-Noite do Sol. Tahuti se posta em Seu esplendor na proa, e Ra-Hoor habita no leme. Salve a Ti desde as Moradas da Noite!`,
    unityAdoration,
    fullMarkdown: `### ☀️ Liber Resh vel Helios — Adoração da Meia-Noite (Khephra)\n\n**Posição:** Voltado ao **Norte**\n**Sinal:** *Sinal de Khephra / Ísis em Luto*\n\n> "Salve a Ti que és Khephra em Teu esconderijo, mesmo a Ti que és Khephra em Teu silêncio, que viajas através dos Céus em Tua barca na Meia-Noite do Sol. Tahuti se posta em Seu esplendor na proa, e Ra-Hoor habita no leme. Salve a Ti desde as Moradas da Noite!"\n\n*(Após a saudação, faz-se o Sinal do Silêncio e recita-se a Unidade:)*\n\n> ${unityAdoration.replace(/\n/g, "\n> ")}\n\n*∴ 93 93/93 ∴*\n`,
  };
}

