import * as Astronomy from "astronomy-engine";

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

export function calculatePlanetaryHour(date: Date) {
  const dayOfWeek = date.getDay(); // 0 is Sunday
  const dayInfo = PLANETARY_DAYS[dayOfWeek];
  
  // Approximate standard planetary hour: 24 equal hours starting from sunrise ~06:00
  // Or relative to current hour
  const hour = date.getHours();
  // Hours elapsed since 6 AM (approximate sunrise)
  const hoursSinceDawn = ((hour - 6) + 24) % 24;
  
  // Chaldean rotation from the day's first hour ruler
  const currentChaldeanIndex = (dayInfo.chaldeanIndex + hoursSinceDawn) % 7;
  const planet = CHALDEAN_ORDER[currentChaldeanIndex];
  
  return {
    day: dayInfo.name,
    daySymbol: dayInfo.symbol,
    hour: `Hora de ${planet.name}`,
    hourSymbol: planet.symbol,
  };
}

export function getFullAstrologicalData(targetDate: Date = new Date()): AstrologicalCoordinates {
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

    // 3. Thelemic Date & Planetary Coordinates
    const thelemicYear = calculateThelemicYear(targetDate);
    const planetary = calculatePlanetaryHour(targetDate);

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
