import { getAllEntries, getAppSetting } from "./db";
import { getFullAstrologicalData } from "./astronomy";
import { MagickEntry, AnalyticalSummary, ChatMessage } from "./types";
import { computeStatisticalInsights } from "./insights";

export type { ChatMessage, AnalyticalSummary };


export function generateLocalAnalyticalResponse(userQuery: string, entries: MagickEntry[]): string {
  const query = userQuery.toLowerCase();
  const insights = computeStatisticalInsights(entries);

  // Check if asking about success or influences
  if (
    query.includes("sucesso") ||
    query.includes("influência") ||
    query.includes("influencia") ||
    query.includes("lua") ||
    query.includes("entidade") ||
    query.includes("melhor") ||
    query.includes("comum")
  ) {
    let response = `**Faze o que tu queres há de ser tudo da Lei.**\n\n`;
    response += `Examinei minuciosamente seus registros no Diário Mágicko (*Total: ${insights.totalEntries} entradas, das quais ${insights.ritualsCount} práticas avaliadas*).\n\n`;
    response += `### 🔬 Padrões Empíricos Identificados:\n\n`;
    response += `* **Média Geral de Sucesso**: \`${insights.averageSuccess} / 10\`\n\n`;

    if (insights.bestMoonPhases.length > 0) {
      const topPhase = insights.bestMoonPhases[0];
      response += `* 🌕 **Fase Lunar com Maior Ressonância**: **${topPhase.phase}** (Média de sucesso: **${topPhase.avgRating}/10** em ${topPhase.count} práticas).\n`;
    }

    if (insights.bestMoonSigns.length > 0) {
      const topSign = insights.bestMoonSigns[0];
      response += `* ♈ **Signo Lunar Mais Favorável**: **${topSign.sign}** (Média de sucesso: **${topSign.avgRating}/10**).\n`;
    }

    if (insights.bestEntities.length > 0) {
      const topEntity = insights.bestEntities[0];
      response += `* ⚡ **Entidade com Maior Confirmação / Sucesso**: **${topEntity.name}** (Média de sucesso: **${topEntity.avgRating}/10**).\n`;
    }

    if (insights.bestIncenses.length > 0) {
      const topIncense = insights.bestIncenses[0];
      response += `* 🕯️ **Incenso Mais Eficaz**: **${topIncense.name}** (Média de sucesso: **${topIncense.avgRating}/10**).\n`;
    }

    // Detail high-success rituals
    const topRituals = entries
      .filter((e) => e.success_rating && e.success_rating >= 8)
      .slice(0, 3);

    if (topRituals.length > 0) {
      response += `\n### ⚔️ Práticas de Pico de Sucesso Registradas:\n`;
      for (const r of topRituals) {
        const infNames = r.influences?.map((i) => i.name).join(", ") || "Nenhuma influência listada";
        response += `1. **${r.title}** (Nota: **${r.success_rating}/10**)\n`;
        response += `   * *Data Thelêmica*: ${r.thelemic_date || "Não registrada"}\n`;
        response += `   * *Influências Presentes*: ${infNames}\n`;
        response += `   * *Estado mental*: ${r.mental_state_after || "Foco estabelecido"}\n`;
      }
    }

    response += `\n> **Conclusão Hermética**: Seus melhores resultados convergem quando a intenção é clara, sob a égide de fases lunares plenas e alinhamento elementar correspondente ao Liber 777.\n\n*Amor é a lei, amor sob vontade.*`;
    return response;
  }

  // Check if asking about tarot / oracle / Thoth
  if (query.includes("oraculo") || query.includes("tarô") || query.includes("thoth") || query.includes("carta")) {
    const oracles = entries.filter((e) => e.type === "oracle");
    let response = `**Faze o que tu queres há de ser tudo da Lei.**\n\n`;
    response += `Você possui **${oracles.length}** consultas oraculares registradas no diário.\n\n`;

    if (oracles.length > 0) {
      response += `### 🎴 Últimas Consultas e Ecos Registrados:\n`;
      for (const o of oracles.slice(0, 2)) {
        response += `* **${o.title}** (${o.date.split("T")[0]})\n`;
        if (o.oracle_data?.query) {
          response += `  * *Pergunta*: "${o.oracle_data.query}"\n`;
        }
        if (o.oracle_data?.cards) {
          const cardNames = o.oracle_data.cards.map((c) => `${c.position}: ${c.cardName}`).join(" | ");
          response += `  * *Lâminas*: ${cardNames}\n`;
        }
      }
    }

    response += `\n*Lembre-se da instrução do Livro de Thoth: 'O oráculo não prediz um futuro mecânico, mas espelha o fluxo dinâmico das correntes astrais em relação à Verdadeira Vontade.'*\n\n*Amor é a lei, amor sob vontade.*`;
    return response;
  }

  // Check if asking about dreams
  if (query.includes("sonho") || query.includes("astral") || query.includes("lucidez")) {
    const dreams = entries.filter((e) => e.type === "dream" || e.type === "vision");
    let response = `**Faze o que tu queres há de ser tudo da Lei.**\n\n`;
    response += `Constam **${dreams.length}** experiências astrais e sonhos lúcidos catalogados.\n\n`;

    for (const d of dreams.slice(0, 3)) {
      response += `* **${d.title}** [${d.type.toUpperCase()}]\n`;
      response += `  * *Condição Lunar*: ${d.moon_phase || "Lua"} em ${d.moon_sign || ""}\n`;
      response += `  * *Resumo*: ${d.content.slice(0, 150)}...\n\n`;
    }

    response += `*Amor é a lei, amor sob vontade.*`;
    return response;
  }

  // Check if asking about Liber 777 / correspondences
  if (query.includes("777") || query.includes("correspond") || query.includes("cabala") || query.includes("arvore")) {
    const studies = entries.filter((e) => e.type === "study");
    let response = `**Faze o que tu queres há de ser tudo da Lei.**\n\n`;
    response += `### 📜 Correspondências Herméticas de Liber 777 Identificadas:\n\n`;
    response += `Seu diário registra **${studies.length}** estudos doutrinários catalogados.\n\n`;
    response += `* **Chave Fundamental**: *'A Cabala não é uma fantasia de palavras, mas o esqueleto anatômico da mente do universo.'* (Liber 777).\n`;
    response += `* **Elementos em Destaque nos seus Trabalhos Registrados**:\n`;
    if (insights.bestIncenses.length > 0) {
      response += `  * *Perfumes e Incensos*: ${insights.bestIncenses.map((i) => `**${i.name}**`).join(", ")} (Coluna XLII)\n`;
    }
    if (insights.bestEntities.length > 0) {
      response += `  * *Hierarquias e Forças Invocadas*: ${insights.bestEntities.map((e) => `**${e.name}**`).join(", ")} (Colunas XVIII e XIX)\n`;
    }
    response += `\n> **Instrução para a Obra**: Ao planejar suas operações, verifique se as armas mágicas (Vara, Taça, Espada, Disco) e o perfume do templo ressoam estritamente com o Sephira ou Caminho do trânsito astrológico vigente.\n\n*Amor é a lei, amor sob vontade.*`;
    return response;
  }

  // Default synthesis
  const astro = getFullAstrologicalData();
  return (
    `**Faze o que tu queres há de ser tudo da Lei.**\n\n` +
    `Eu sou o seu Secretário e Frater Auxiliar Mágicko. Estou conectado à totalidade do seu Diário Mágicko (${entries.length} entradas registradas).\n\n` +
    `🌌 **Trânsito Astral Vigente**: ${astro.thelemicDate}\n` +
    `* Sol: ${astro.sunDegreeFormatted} | Lua: ${astro.moonDegreeFormatted} (${astro.moonPhaseName}, ${astro.moonIllumination}% iluminada)\n` +
    `* Regência do Momento: ${astro.planetaryDay} — ${astro.planetaryHour}\n\n` +
    `Você pode me perguntar:\n` +
    `1. *"Quais processos mágickos eu tive mais sucessos e quais influências eles tinham em comum?"*\n` +
    `2. *"Como meus oráculos se conectaram com os sonhos seguintes?"*\n` +
    `3. *"Qual a melhor fase lunar para meus trabalhos com Babalon ou Thoth?"*\n` +
    `4. *"Analise a correlação entre meus incensos e estados mentais."*\n\n` +
    `*Amor é a lei, amor sob vontade.*`
  );
}

export async function processChatRequest(userQuery: string): Promise<string> {
  const entries = getAllEntries();
  const openRouterKey =
    getAppSetting("openrouter_api_key") ||
    process.env.OPENROUTER_API_KEY ||
    getAppSetting("gemini_api_key") ||
    process.env.GEMINI_API_KEY;

  if (!openRouterKey) {
    // Return offline analytical engine
    return generateLocalAnalyticalResponse(userQuery, entries);
  }

  const modelName = getAppSetting("openrouter_model") || "google/gemini-2.5-flash";

  try {
    const astro = getFullAstrologicalData();
    const insights = computeStatisticalInsights(entries);

    // Format concise entries for prompt context
    const entriesSummary = entries.slice(0, 20).map((e) => ({
      id: e.id,
      categoria: e.type,
      titulo: e.title,
      data: e.date,
      dataThelemica: e.thelemic_date,
      sucessoRating: e.success_rating,
      faseLunar: e.moon_phase,
      signoLunar: e.moon_sign,
      influencias: e.influences,
      oraculo: e.oracle_data ? { pergunta: e.oracle_data.query, laminas: e.oracle_data.cards } : undefined,
      trecho: e.content.slice(0, 300),
    }));

    const systemPrompt = `Você é o Frater Auxiliar, Secretário Hermético e Guia do Magista no Diário Mágicko Thelêmico.
Sua postura é erudita, atenciosa, científica e profundamente versada no Thelema (Aleister Crowley, Liber AL vel Legis, Liber 777, O Livro de Thoth, Magick in Theory and Practice) e no lema: "O Método da Ciência -- O Alvo da Religião".
Sempre cumprimente e encerre com as saudações tradicionais thelêmicas ("Faze o que tu queres há de ser tudo da Lei." e "Amor é a lei, amor sob vontade.").

Contexto Astrológico Vigente:
${astro.thelemicDate}

Resumo Estatístico do Diário do Magista:
${JSON.stringify(insights, null, 2)}

Amostra de Entradas Recentes do Diário:
${JSON.stringify(entriesSummary, null, 2)}

Instruções:
- Responda diretamente e com rigor empírico cruzando os dados do diário.
- Entradas da categoria "Diário" são para crônicas e reflexões mundanas/seculares cotidianas (fora do foco puramente cerimonial); respeite esse contexto secular e ajude a integrar harmoniosamente a rotina diária à Grande Obra.
- Se perguntado sobre quais processos tiveram mais sucesso e influências em comum, aponte correlações explícitas (signos, luas, velas, incensos, entidades).
- Forneça recomendações práticas e fundamentadas na Cabala Hermética e no Liber 777.
- Utilize formatação Markdown limpa e moderna.`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Diario Magicko Thelemico",
      },
      body: JSON.stringify({
        model: modelName,
        max_tokens: 1500,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userQuery },
        ],
      }),
    });

    if (!res.ok) {
      console.warn("Falha na chamada OpenRouter:", await res.text());
      return generateLocalAnalyticalResponse(userQuery, entries);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;
    return reply || generateLocalAnalyticalResponse(userQuery, entries);
  } catch (err) {
    console.error("Erro ao chamar OpenRouter API:", err);
    return generateLocalAnalyticalResponse(userQuery, entries);
  }
}

export async function interpretOracleSpread(params: {
  query?: string;
  spreadName?: string;
  cards: Array<{
    position: string;
    cardId: string;
    cardName: string;
    rotation?: number;
    notes?: string;
  }>;
}): Promise<string> {
  const { query, spreadName, cards } = params;
  const openRouterKey =
    getAppSetting("openrouter_api_key") ||
    process.env.OPENROUTER_API_KEY ||
    getAppSetting("gemini_api_key") ||
    process.env.GEMINI_API_KEY;

  const astro = getFullAstrologicalData();

  if (!cards || cards.length === 0) {
    return "Nenhuma lâmina foi posicionada na mesa do altar para interpretação.";
  }

  // Format cards with their orientations
  const cardsDescription = cards
    .map((c, i) => {
      const rot = c.rotation || 0;
      const orientacao = rot === 90 ? "Cruzada (Tensão/Obstáculo)" : rot === 180 ? "Invertida (Sombra/Bloqueio)" : "Em pé (Direta)";
      return `${i + 1}. **${c.position}**: ${c.cardName} [${orientacao}]${c.notes ? ` (Notas do magista: "${c.notes}")` : ""}`;
    })
    .join("\n");

  const promptText = `Pergunta / Vontade do Magista:
"${query?.trim() || "Orientação Geral para a Vontade e a Grande Obra"}"

Método / Disposição:
${spreadName || "Mesa Oracular"}

Lâminas no Altar:
${cardsDescription}

Momento Astrológico e Thelêmico:
${astro.thelemicDate} (Sol em ${astro.sunSign}, Lua em ${astro.moonSign} - ${astro.moonPhaseName})`;

  if (!openRouterKey) {
    // Retorno analítico offline
    let localResponse = `**Faze o que tu queres há de ser tudo da Lei.**\n\n`;
    localResponse += `### 🎴 Análise da Tiragem Oracular: *${spreadName || "Mesa de Thoth"}*\n\n`;
    if (query?.trim()) {
      localResponse += `> **Foco da Consulta**: "${query.trim()}"\n\n`;
    }
    localResponse += `**Momento Astrológico**: ${astro.thelemicDate}\n\n`;
    localResponse += `#### ⚔️ Leitura das Correntes no Altar:\n`;

    cards.forEach((c) => {
      const rot = c.rotation || 0;
      const orientacao = rot === 90 ? "cruzada" : rot === 180 ? "invertida" : "direta";
      localResponse += `* **${c.position}** — **${c.cardName}** (${orientacao}):\n`;
      localResponse += `  A lâmina opera como canal da força correspondente. Em posição ${orientacao}, indica que a energia ${rot === 180 ? "encontra resistência no veículo material ou requer introspecção silenciosa" : rot === 90 ? "atua como um atrito fecundo para despertar a resolução da vontade" : "flui em seu vetor primário de manifestação"}.\n`;
    });

    localResponse += `\n#### 👁️ Síntese para a Verdadeira Vontade:\n`;
    localResponse += `O método da ciência exige não tomar a consulta como um fatalismo, mas como uma radiografia do campo psíquico e astral. Mantenha o silêncio interior, purifique as intenções de qualquer apego ao resultado e dirija todas as armas do templo em linha reta em direção à Grande Obra.\n\n`;
    localResponse += `*Amor é a lei, amor sob vontade.*`;
    return localResponse;
  }

  const modelName = getAppSetting("openrouter_model") || "google/gemini-2.5-flash";

  try {
    const systemPrompt = `Você é o Frater Auxiliar, Secretário Hermético e Mestre Iniciado versado no Livro de Thoth (Liber LXXVIII) de Aleister Crowley, no Liber 777 e na Cabala da Aurora Dourada / Thelema.
O magista realizou uma tiragem de Tarot de Thoth e pede seu palpite hermético e interpretação profunda.

Instruções para a interpretação:
1. Abra formalmente com a saudação Thelêmica: "Faze o que tu queres há de ser tudo da Lei."
2. Interprete cada lâmina na sua posição específica, considerando sua orientação (direta, invertida ou cruzada) e suas atribuições cabalísticas e astrológicas do Livro de Thoth.
3. Avalie as Dignidades Elementais (como os elementos Fogo, Água, Ar e Terra das cartas interagem entre si, se fortificam ou mitigam).
4. Forneça uma Síntese Prática e Direta para a Verdadeira Vontade do Magista frente à questão proposta ("O que fazer / o que observar").
5. Finalize formalmente com a saudação: "Amor é a lei, amor sob vontade."
Use formatação Markdown elegante, clara e erudita.`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Diario Magicko Thelemico",
      },
      body: JSON.stringify({
        model: modelName,
        max_tokens: 1800,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: promptText },
        ],
      }),
    });

    if (!res.ok) {
      console.warn("Falha na chamada OpenRouter para oráculo:", await res.text());
      return "Não foi possível obter a resposta da IA no momento. Verifique sua chave de API nas configurações.";
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;
    return reply || "A consulta foi concluída, mas nenhuma mensagem foi retornada.";
  } catch (err: any) {
    console.error("Erro na interpretação do oráculo:", err);
    return `Erro ao processar palpite da IA: ${err.message}`;
  }
}


