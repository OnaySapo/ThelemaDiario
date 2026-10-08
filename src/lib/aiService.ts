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
  const apiKey = getAppSetting("gemini_api_key") || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Return offline analytical engine
    return generateLocalAnalyticalResponse(userQuery, entries);
  }

  // If Gemini API Key is available, use Gemini with deep context!
  try {
    const astro = getFullAstrologicalData();
    const insights = computeStatisticalInsights(entries);

    // Format concise entries for prompt context
    const entriesSummary = entries.slice(0, 15).map((e) => ({
      id: e.id,
      type: e.type,
      title: e.title,
      date: e.date,
      thelemicDate: e.thelemic_date,
      successRating: e.success_rating,
      moonPhase: e.moon_phase,
      moonSign: e.moon_sign,
      influences: e.influences,
      oracle: e.oracle_data ? { query: e.oracle_data.query, cards: e.oracle_data.cards } : undefined,
      contentExcerpt: e.content.slice(0, 300),
    }));

    const systemPrompt = `Você é o Secretário e Guia Hermético do magista em um Diário Mágicko Thelêmico de alta precisão.
Sua postura é erudita, atenciosa, científica e profundamente versada no Thelema (Aleister Crowley, Liber AL vel Legis, Liber 777, Livro de Thoth, Magick in Theory and Practice) e no Método da Ciência com o Alvo da Religião.
Cumprimente e finalize sempre com as saudações tradicionais thelêmicas em português ("Faze o que tu queres há de ser tudo da Lei." e "Amor é a lei, amor sob vontade.").

Contexto Atual dos Astros:
${astro.thelemicDate}

Resumo Estatístico do Diário do Magista:
${JSON.stringify(insights, null, 2)}

Amostra Recente de Entradas do Diário:
${JSON.stringify(entriesSummary, null, 2)}

Instruções:
- Responda à pergunta do magista com rigor analítico cruzando os dados do diário.
- Quando perguntado sobre sucessos e influências em comum, aponte correlações empíricas explícitas (signos, luas, velas, incensos, entidades).
- Ofereça sugestões práticas e fundamentadas na Cabala Hermética e no Liber 777 quando cabível.
- Seja formatado em Markdown impecável.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nPergunta do Magista:\n${userQuery}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn("Falha na chamada ao Gemini API, recorrendo ao motor local:", await res.text());
      return generateLocalAnalyticalResponse(userQuery, entries);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText || generateLocalAnalyticalResponse(userQuery, entries);
  } catch (err) {
    console.error("Erro ao chamar Gemini API:", err);
    return generateLocalAnalyticalResponse(userQuery, entries);
  }
}
