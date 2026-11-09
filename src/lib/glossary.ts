import { MagickEntry, CategoryName, normalizeCategory } from "./types";

export type ExperienceLevel = "essencial" | "sincretico" | "adepto";

export interface ExperienceProfileInfo {
  id: ExperienceLevel;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  featuresSummary: string[];
}

export const EXPERIENCE_PROFILES: Record<ExperienceLevel, ExperienceProfileInfo> = {
  essencial: {
    id: "essencial",
    title: "Modo Essencial (Iniciante & Fluido)",
    subtitle: "Simples, direto e acolhedor",
    badge: "🌱 Recomendado para novos usuários",
    description:
      "Ideal para quem quer registrar sonhos, tiragens de Tarot, meditações, banhos de ervas e reflexões diárias sem excesso de termos técnicos na tela.",
    featuresSummary: [
      "Interface despoluída focada na escrita, sonhos e Tarot",
      "Explicações em linguagem simples e acessível",
      "Oculta tabelas cabalísticas densas por padrão (acessíveis com 1 clique)",
    ],
  },
  sincretico: {
    id: "sincretico",
    title: "Modo Sincrético Brasileiro (Terreiro & Hermes)",
    subtitle: "Umbanda, Candomblé, Jurema, Tarot e Astrologia",
    badge: "🌿 Brasilidade & Magia Prática",
    description:
      "Conecta o calendário lunar e planetário às regências dos Orixás, Guias de Umbanda, Mestres da Jurema, Banhos de Ervas (Ewê) e Pontos Riscados.",
    featuresSummary: [
      "Destaque para o Orixá regente do dia, saudação e ervas recomendadas",
      "Tábua de Pemba Digital (Ponto Riscado) e Dossiê de Entidades",
      "Cruzamento automático entre Fases da Lua, Banhos, Sonhos e Tiragens",
    ],
  },
  adepto: {
    id: "adepto",
    title: "Modo Adepto Completo (Thelema + Kabbalah + Brasilis)",
    subtitle: "Todas as ferramentas herméticas e analíticas ativas",
    badge: "☀️ Laboratório Completo (A∴A∴ / 777)",
    description:
      "Exibe todas as métricas avançadas: Data Solar Thelêmica, Marés de Liber Resh, Gematria Hebraica/Grega, Árvore da Vida sincretizada e Matriz 777 completa.",
    featuresSummary: [
      "Data Thelêmica (Anno Legis), Graus Solares/Lunares e Horas Planetárias",
      "Liber Resh vel Helios, Calculadora de Gematria e Árvore da Vida completa",
      "Motor completo de cruzamento multidimensional e eficácia ritualística",
    ],
  },
};

const STORAGE_KEY_LEVEL = "diario_experience_level_v4";
const STORAGE_KEY_ONBOARDED = "diario_onboarding_completed_v4";

export function loadExperienceLevel(): ExperienceLevel {
  if (typeof window === "undefined") return "sincretico";
  const saved = window.localStorage.getItem(STORAGE_KEY_LEVEL) as ExperienceLevel | null;
  if (saved === "essencial" || saved === "sincretico" || saved === "adepto") {
    return saved;
  }
  return "sincretico";
}

export function saveExperienceLevel(level: ExperienceLevel): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY_LEVEL, level);
  window.dispatchEvent(new CustomEvent("experience-level-changed", { detail: level }));
}

export function isOnboardingCompleted(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY_ONBOARDED) === "true";
}

export function markOnboardingCompleted(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY_ONBOARDED, "true");
}

export interface GlossaryItem {
  id: string;
  term: string;
  tradition: "Thelema & Hermetismo" | "Kabbalah" | "Matriz Brasileira" | "Astrologia & Oráculo" | "Prática & Sonhos";
  shortPlainMeaning: string;
  detailedExplanation: string;
  brazilianBridge?: string;
  howToUseInApp: string;
  keywords: string[];
}

export const GLOSSARY_DICTIONARY: GlossaryItem[] = [
  {
    id: "liber_777",
    term: "Liber 777 & Correspondências",
    tradition: "Thelema & Hermetismo",
    shortPlainMeaning: "Uma tabela universal que conecta planetas, cores, incensos, ervas, cartas de Tarot e divindades que vibram na mesma sintonia.",
    detailedExplanation:
      "Originalmente compilado por Aleister Crowley, o Liber 777 funciona como um 'dicionário de afinidades simbólicas'. Neste diário, expandimos o 777 com o 'Liber 777 Brasilis', conectando cada esfera também aos Orixás, Linhas de Umbanda, Guardiões e Mestres da Jurema.",
    brazilianBridge: "Equivale a saber qual erva, cor de vela, dia da semana e saudação pertencem a cada Orixá ou Falange.",
    howToUseInApp: "Dentro de qualquer nota, clique na pílula 'Correspondências' para marcar quais forças, ervas ou entidades fizeram parte da sua prática.",
    keywords: ["777", "correspondencia", "correspondências", "influencias", "influências"],
  },
  {
    id: "sephirah_arvore",
    term: "Árvore da Vida & Sephiroth",
    tradition: "Kabbalah",
    shortPlainMeaning: "Um mapa espiritual composto por 10 esferas de energia (Sephiroth) e 22 caminhos que representam desde o espírito puro até o mundo físico.",
    detailedExplanation:
      "Cada Sephirah representa um arquétipo universal: Kether (Coroa/Origem), Chokmah (Sabedoria), Binah (Entendimento/Ancestralidade), Chesed (Misericórdia/Justiça), Geburah (Força/Corte), Tiphareth (Harmonia/Sol), Netzach (Amor/Natureza), Hod (Mente/Comunicação), Yesod (Lua/Sonhos) e Malkuth (Terra/Corpo).",
    brazilianBridge: "Na visão sincretizada do programa, cada esfera dialoga com forças brasileiras: ex. Kether ↔ Oxalá/Ori, Geburah ↔ Ogum/Oyá, Chesed ↔ Xangô, Netzach ↔ Oxum, Hod ↔ Exu/Ossaim, Yesod ↔ Iemanjá.",
    howToUseInApp: "Acesse a aba 'Árvore & Terreiro' na barra lateral para clicar em cada esfera e ver suas notas conectadas a ela.",
    keywords: ["sephirah", "sephiroth", "arvore da vida", "kether", "chokmah", "binah", "chesed", "geburah", "tiphareth", "netzach", "hod", "yesod", "malkuth"],
  },
  {
    id: "ori_axe",
    term: "Ori & Axé",
    tradition: "Matriz Brasileira",
    shortPlainMeaning: "Ori é a sua cabeça física e espiritual (sua consciência divina e destino pessoal); Axé é a força vital sagrada que coloca tudo em movimento.",
    detailedExplanation:
      "Nas tradições de Matriz Africana (Candomblé e Umbanda), 'Ori' é o primeiro Orixá de cada ser humano — a sede da intuição, do equilíbrio mental e do acordo espiritual antes do nascimento. 'Axé' é a energia dinâmica realizadora que circula nas folhas, nas palavras e nos rituais.",
    brazilianBridge: "O cuidado com o Ori (através de banhos frescos de boldo/manjericão e vela de Anjo de Guarda) harmoniza a Verdadeira Vontade.",
    howToUseInApp: "Ao registrar um banho de ervas ou firmeza, marque a influência 'Oxalá' ou 'Banho de Boldo' e avalie seu estado mental antes e depois.",
    keywords: ["ori", "axé", "axe", "oxalá", "oxala", "anjo de guarda", "firmeza"],
  },
  {
    id: "ewe_banhos",
    term: "Ewê (Segredo das Folhas & Banhos)",
    tradition: "Matriz Brasileira",
    shortPlainMeaning: "'Kosi Ewê, Kosi Orixá': Sem folha não há magia. As plantas carregam propriedades energéticas de limpeza, equilíbrio ou encantamento.",
    detailedExplanation:
      "Guardadas por Ossaim e pelos Caboclos e Mestres da Jurema, as ervas dividem-se em 'agressivas/quentes' (descarrego e corte, como Arruda, Espada-de-São-Jorge, Guiné), 'mornas' (equilíbrio e abertura, como Alecrim, Manjericão, Alfazema) e 'doces/frias' (atração e paz, como Rosas, Macassá e Boldo).",
    brazilianBridge: "Tradição viva das benzedeiras, raizeiros, terreiros de Umbanda, Candomblé e Catimbó-Jurema.",
    howToUseInApp: "Marque os banhos e defumações na nota para descobrir no Dashboard quais ervas trazem melhores resultados para o seu sono e humor.",
    keywords: ["ewe", "ewê", "folha", "erva", "banho", "defumação", "defumacao", "ossaim", "jurema", "alecrim", "arruda", "guiné", "boldo"],
  },
  {
    id: "ponto_riscado_sigilo",
    term: "Ponto Riscado (Pemba) & Sigilos",
    tradition: "Matriz Brasileira",
    shortPlainMeaning: "Diagramas geométricos sagrados desenhados para ancorar uma força espiritual, proteção ou intenção concentrada.",
    detailedExplanation:
      "Na Umbanda, Quimbanda e Jurema, o Ponto Riscado é traçado com pemba (giz calcário sagrado) combinando flechas, cruzes, estrelas, espirais e tridentes que identificam e firmam a linha de trabalho de um Guia. Na magia ocidental (Austin Osman Spare / Kameas), um Sigilo condensa uma frase de desejo em um glifo geométrico.",
    brazilianBridge: "Nossa 'Tábua de Pemba Digital' une os dois mundos: você pode traçar tanto Pontos Riscados tradicionais quanto Sigilos nos Quadrados Planetários.",
    howToUseInApp: "Clique em 'Pemba & Sigilos' no menu de ferramentas para desenhar e inserir diretamente na sua nota.",
    keywords: ["ponto riscado", "pemba", "sigilo", "kamea", "quadrado planetario", "glifo", "simbolo"],
  },
  {
    id: "liber_resh",
    term: "Liber Resh vel Helios (Saudações Solares)",
    tradition: "Thelema & Hermetismo",
    shortPlainMeaning: "Quatro pequenas pausas diárias (Amanhecer, Meio-Dia, Pôr do Sol e Meia-Noite) para saudar o Sol e alinhar a mente com os ciclos da natureza.",
    detailedExplanation:
      "Prática diária recomendada em Thelema para criar ritmo biológico e consciência cósmica. Ao saudar Rá (Nascente), Ahathoor (Meio-Dia), Tum (Poente) e Khephra (Meia-Noite), o praticante lembra sua conexão com o centro do sistema solar.",
    brazilianBridge: "Pode ser vivenciado em harmonia com as saudações às forças da natureza nos 4 turnos do dia.",
    howToUseInApp: "Na tela Inicial (Sanctum), você pode marcar com 1 clique as saudações solares concluídas hoje.",
    keywords: ["resh", "liber resh", "helios", "ra", "ahathoor", "tum", "khephra", "solar"],
  },
  {
    id: "dharana_meditacao",
    term: "Dharana, Asana & Pranayama",
    tradition: "Prática & Sonhos",
    shortPlainMeaning: "Treinamento prático de postura firme (Asana), respiração consciente (Pranayama) e foco mental absoluto em um único objeto (Dharana).",
    detailedExplanation:
      "Base de toda eficácia mágica e clareza mental (Liber E vel Exercitiorum). Antes de realizar grandes rituais ou interpretações oraculares, aquietar o corpo e sustentar a atenção sem distrações fortalece a Vontade.",
    brazilianBridge: "Corresponde à firmeza de pensamento e concentração necessárias antes de arriar uma obrigação, rezar ou incorporar.",
    howToUseInApp: "Use o botão 'Cronômetro Dharana' para cronometrar sua prática e gerar automaticamente o registro de quantas quebras de foco ocorreram.",
    keywords: ["dharana", "asana", "pranayama", "meditacao", "meditação", "foco", "respiração", "respiracao"],
  },
  {
    id: "sincronicidade",
    term: "Sincronicidade & Ecos Simbólicos",
    tradition: "Astrologia & Oráculo",
    shortPlainMeaning: "Coincidências significativas entre o que sai no seu Oráculo (Tarot), o que aparece nos seus Sonhos e o que acontece nos seus Rituais e na vida.",
    detailedExplanation:
      "Conceito formulado por Carl Gustav Jung e central na prática mágica: eventos internos (sonhos, intuições, cartas sorteadas) e externos espelham-se através de arquétipos comuns (ex: a mesma carta, elemento, animal ou Orixá surgindo em dias próximos).",
    brazilianBridge: "Quando um aviso dado no jogo de cartas ou búzios se confirma num sonho ou sinal na natureza.",
    howToUseInApp: "Veja a aba 'Sincronicidades' no painel direito ou no Dashboard: o sistema cruza suas notas automaticamente para revelar esses fios invisíveis!",
    keywords: ["sincronicidade", "eco", "tarot", "oráculo", "oraculo", "sonho", "presságio", "sinal"],
  },
];

export interface GuidedCreationOption {
  id: string;
  category: CategoryName;
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  defaultTitle: string;
  defaultInfluences?: { category: string; name: string }[];
  customTemplate?: string;
}

export const GUIDED_CREATION_CARDS: GuidedCreationOption[] = [
  {
    id: "sonho_onirico",
    category: "Sonho",
    title: "Relatar Sonho ou Visão",
    subtitle: "Detecta símbolos, animais e arquétipos automaticamente",
    icon: "🌙",
    accentColor: "#818cf8",
    defaultTitle: "Registro Onírico & Símbolos",
  },
  {
    id: "oraculo_tarot",
    category: "Oráculo",
    title: "Tiragem de Tarot / Oráculo",
    subtitle: "Mesa visual interativa para sortear ou registrar suas cartas",
    icon: "🃏",
    accentColor: "#c084fc",
    defaultTitle: "Consulta ao Oráculo",
  },
  {
    id: "banho_firmeza_brasilis",
    category: "Prática",
    title: "Banho de Ervas, Vela ou Firmeza",
    subtitle: "Registre banhos (Ewê), defumações, velas, pontos e trabalhos",
    icon: "🌿",
    accentColor: "#34d399",
    defaultTitle: "Firmeza & Banho de Ervas (Ewê)",
    customTemplate: `## 🌿 Intenção & Fundamento
*Qual o objetivo espiritual, limpeza, proteção ou agradecimento de hoje?*

## 🔥 Elementos Utilizados
- **Ervas / Banho / Defumação:** 
- **Velas / Cores:** 
- **Orixá, Guia ou Força Regente:** 
- **Saudação / Ponto Cantado ou Riscado:** 

## ✨ Sensações Durante e Após a Prática
*Como estava seu corpo e seu Ori antes, e como você se sentiu após concluir?*
`,
  },
  {
    id: "ritual_hermetico",
    category: "Prática",
    title: "Ritual, Banimento ou Meditação",
    subtitle: "Práticas Thelêmicas, Cabalísticas, Dharana ou Cerimoniais",
    icon: "🔥",
    accentColor: "#f59e0b",
    defaultTitle: "Operação Mágicka & Meditação",
  },
  {
    id: "diario_reflexao",
    category: "Diário",
    title: "Diário Livre & Sincronicidades",
    subtitle: "Acontecimentos do dia, sinais percebidos, humor e insights",
    icon: "📓",
    accentColor: "#38bdf8",
    defaultTitle: "Crônica do Dia & Sinais",
  },
  {
    id: "estudo_grimorio",
    category: "Estudo",
    title: "Estudo, Receita ou Fundamento",
    subtitle: "Anote estudos de livros, fundamentos de terreiro ou correspondências",
    icon: "📜",
    accentColor: "#fbbf24",
    defaultTitle: "Anotação de Estudo & Fundamento",
  },
];

/**
 * Analisa uma nota e retorna os termos do Glossário mais relevantes para ela,
 * ajudando iniciantes e praticantes a compreenderem os conceitos envolvidos na nota aberta.
 */
export function detectGlossaryTermsForNote(entry: MagickEntry | null): GlossaryItem[] {
  if (!entry) return GLOSSARY_DICTIONARY.slice(0, 4);

  const fullText = [
    entry.title || "",
    entry.content || "",
    entry.type || "",
    ...(entry.tags || []),
    ...(entry.influences || []).map((i) => `${i.category} ${i.name}`),
    ...(entry.oracle_data?.cards || []).map((c) => c.cardName),
  ]
    .join(" ")
    .toLowerCase();

  const matched: GlossaryItem[] = [];
  const cat = normalizeCategory(entry.type);

  for (const item of GLOSSARY_DICTIONARY) {
    const hasKeyword = item.keywords.some((kw) => fullText.includes(kw.toLowerCase()));
    if (hasKeyword) {
      matched.push(item);
    }
  }

  // Garante termos essenciais por categoria mesmo que a nota esteja no início
  if (cat === "Sonho" || cat === "Visão Astral") {
    const sync = GLOSSARY_DICTIONARY.find((g) => g.id === "sincronicidade");
    if (sync && !matched.some((m) => m.id === sync.id)) matched.push(sync);
  }
  if (cat === "Oráculo") {
    const sync = GLOSSARY_DICTIONARY.find((g) => g.id === "sincronicidade");
    const l777 = GLOSSARY_DICTIONARY.find((g) => g.id === "liber_777");
    if (sync && !matched.some((m) => m.id === sync.id)) matched.push(sync);
    if (l777 && !matched.some((m) => m.id === l777.id)) matched.push(l777);
  }
  if (cat === "Prática") {
    const ewe = GLOSSARY_DICTIONARY.find((g) => g.id === "ewe_banhos");
    const ori = GLOSSARY_DICTIONARY.find((g) => g.id === "ori_axe");
    if (ewe && !matched.some((m) => m.id === ewe.id)) matched.push(ewe);
    if (ori && !matched.some((m) => m.id === ori.id)) matched.push(ori);
  }

  if (matched.length === 0) {
    return GLOSSARY_DICTIONARY.slice(0, 4);
  }
  return matched;
}
