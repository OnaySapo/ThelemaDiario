import { CategoryName } from "./types";

export function getDefaultTemplateForCategory(category: CategoryName | string): string {
  const norm = (category || "").toLowerCase();

  if (norm.includes("diário") || norm.includes("diario") || norm === "journal" || norm === "mundane" || norm === "daily") {
    return `## 1. Crônica do Dia & Acontecimentos Mundanos
*Eventos do cotidiano secular, trabalho, estudos, notícias, encontros e tarefas.*

## 2. Pensamentos, Impressões & Emoções
*Reflexões pessoais, ideias que surgiram, sentimentos e dinâmicas dos relacionamentos.*

## 3. Estado Físico, Corpo & Energia
*Alimentação, qualidade do sono, cansaço, vigor físico, exercícios e saúde geral.*

## 4. Aprendizados & Insights do Dia
*O que a experiência prática do dia ensinou? O que funcionou e o que pode ser aprimorado?*

## 5. Fechamento & Foco para Amanhã
*Como encerro o dia e quais as prioridades imediatas para o dia seguinte.*`;
  }

  if (norm.includes("estudo") || norm === "study") {
    return `## 1. Obra & Tópico de Pesquisa
*Indique o Livro Sagrado, trecho de Liber AL vel Legis, Liber 777 ou teoria sob escrutínio.*

## 2. Correspondências Herméticas & Cabalísticas
*Sephiroth envolvidas, caminhos da Árvore da Vida, planetas, signos, elementos e correspondências do Liber 777.*

## 3. Gematria & Análise Simbólica
*Valores numéricos de termos-chave, letras hebraicas e equivalências cabalísticas.*

## 4. Hipótese Mágica a ser Testada
*De que forma essa teoria deve ser testada experimentalmente nos rituais ou na vida diária?*

## 5. Conclusões Provisórias
*Síntese do entendimento alcançado sob o método da ciência.*`;
  }

  if (norm.includes("visão") || norm.includes("visao") || norm === "vision") {
    return `## 1. Portal de Entrada & Tattwa Trabalhado
*Símbolo utilizado (ex: Yantra de Tejas, Apas, porta astral, espelho negro ou sigilo).*

## 2. Método de Projeção & Testes de Autenticidade
*Sinais de reconhecimento entoados, senhas de grau e testes aplicados às figuras encontradas.*

## 3. Exploração da Paisagem Astral
*Cores, atmosfera, arquitetura, temperatura e características do plano penetrado.*

## 4. Comunicação & Mensagem Recebida
*Diálogos, instruções ou símbolos transmitidos pelas inteligências astrais.*

## 5. Retorno ao Templo Físico & Selamento
*Reabsorção do Corpo de Luz, fechamento do portal e sensações físicas ao retornar.*`;
  }

  if (norm.includes("sonho") || norm === "dream") {
    return `## 1. Nível de Lucidez (0 a 5) & Horário
*Grau de consciência no plano de Yesod e horário exato do despertar.*

## 2. Prática da Véspera & Conexões
*Rituais, meditações ou estado mental que precederam o sono.*

## 3. Narrativa do Sonho Lúcido
*Relato minucioso dos acontecimentos, ambientes, transições e escolhas feitas.*

## 4. Arquétipos & Símbolos Marcantes
*Entidades, animais, números, cores e símbolos observados.*

## 5. Efeito no Despertar
*Sensação física e ressonância espiritual no retorno à vigília.*`;
  }

  if (norm.includes("oráculo") || norm.includes("oraculo") || norm === "oracle") {
    return `## 1. Pergunta & Propósito da Consulta
*Formulação clara da questão diante do Silêncio e da Verdadeira Vontade.*

## 2. Método de Tiragem & Disposição da Mesa
*Disposição geométrica das lâminas sobre o altar (visualize na Mesa Oracular abaixo).*

## 3. Leitura das Lâminas & Forças em Ação
*Análise das correntes astrais refletidas pelas cartas e suas relações elementares.*

## 4. Síntese Oracular para a Vontade
*Diretrizes práticas e conselho de conduta mágica para a Grande Obra.*

## 5. Confirmações Posteriores no Mundo Físico
*Anotações sobre como os acontecimentos fenomênicos refletiram a consulta.*`;
  }

  // Default: Prática / Ritual
  return `## 1. Intenção & Declaração de Vontade
*Declaração formal do propósito da operação mágica.*

## 2. Preparação do Templo & Banimento Preliminar
*Purificação do espaço, banimento formal (ex: Rubi Estrela, LRP) e consagração das armas.*

## 3. Operação Central / Invocação
*Nomes Sagrados vibrados, palavras de poder entoadas e fórmulas teúrgicas executadas.*

## 4. Sensações Corporais & Estados Astrais
*Vibrações sutis, calor, eletricidade na coluna, odores ou luzes no templo.*

## 5. Licença para Partir & Fechamento
*Agradecimento às forças presentes, selamento com o Sinal do Silêncio e restauração da harmonia.*

## 6. Resultados & Confirmações Fenomênicas
*Efeitos físicos observados e manifestações posteriores no mundo exterior.*`;
}
