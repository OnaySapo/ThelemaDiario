import { CategoryName } from "./types";

export interface RitualTemplateOption {
  id: string;
  label: string;
  tradition: "Thelema / Hermetismo" | "Brasilidade (Umbanda / Candomblé / Quimbanda / Jurema)";
  defaultTitle: string;
  category: CategoryName;
  content: string;
}

export const SPECIAL_RITUAL_TEMPLATES: RitualTemplateOption[] = [
  {
    id: "umbanda_gira",
    label: "🌿 Gira / Trabalho no Terreiro (Umbanda & Candomblé)",
    tradition: "Brasilidade (Umbanda / Candomblé / Quimbanda / Jurema)",
    defaultTitle: "Gira de Terreiro & Firmeza Espiritual",
    category: "Prática",
    content: `## 1. Preceito, Banho de Ervas (Ewê) & Firmeza de Ori / Anjo de Guarda
*Ervas utilizadas no banho (Amaci / Descarrego), vela acesa no Anjo de Guarda, roupas e preparação espiritual antes do trabalho.*

## 2. Defumação, Abertura & Saudação à Tronqueira / Congá
*Ervas da defumação, pontos cantados de abertura e saudação aos Guardiões e Orixás regentes da gira.*

## 3. Linha de Trabalho, Orixás & Guias Manifestados
*Qual linha trabalhou hoje (Caboclos, Pretos Velhos, Baianos, Boiadeiros, Marinheiros, Erês, Ciganos, Orixás)?*

## 4. Irradiação, Incorporação & Passes / Consultas
*Sensações no chakra coronário (Ori) e cardíaco, qualidade da incorporação/irradiação, pontos riscados e atendimentos realizados.*

## 5. Recado dos Guias & Orientações Recebidas
*Conselhos, alertas, firmezas ou banhos recomendados pelas entidades.*

## 6. Encerramento & Estado Energético Pós-Gira
*Como o corpo físico e o campo áurico responderam após o fechamento dos trabalhos.*`,
  },
  {
    id: "quimbanda_esquerda",
    label: "🔱 Operação de Quimbanda / Guardiões (Esquerda & Encruzilhada)",
    tradition: "Brasilidade (Umbanda / Candomblé / Quimbanda / Jurema)",
    defaultTitle: "Firmeza & Operação com os Guardiões da Esquerda",
    category: "Prática",
    content: `## 1. Propósito da Operação & Reino Trabalhado
*Objetivo (Abertura de caminhos, corte de demanda, proteção, prosperidade, encanto) e Reino invocado (Encruzilhada, Cruzeiro, Mata, Kalunga, Lira, Praia, Almas).*

## 2. Exu / Pombagira Regente & Ponto Riscado
*Guardiões chamados na operação e descrição (ou imagem anexada) do Ponto Riscado traçado com pemba.*

## 3. Padê, Oferenda & Elementos Materiais
*Velas (cores), bebidas (marafo, champanhe, whisky, anis), fumo (charuto, cigarrilha), comidas rituais e local de arriamento.*

## 4. Chamado, Pontos Cantados & Presença Astral
*Sinais físicos da presença dos Guardiões (estalos, variação térmica, chama das velas, arrepio, intuição direta).*

## 5. Despacho, Licença & Resposta Fenomênica
*Prazo firmado e sinais de confirmação observados nos caminhos.*`,
  },
  {
    id: "jurema_sagrada",
    label: "🏹 Sessão de Jurema Sagrada (Catimbó & Ciência Encantada)",
    tradition: "Brasilidade (Umbanda / Candomblé / Quimbanda / Jurema)",
    defaultTitle: "Mesa de Jurema Sagrada & Ciência dos Mestres",
    category: "Prática",
    content: `## 1. Abertura do Tronco & Cidade do Juremá Invocada
*Cidade encantada acessada (Juremá, Vajucá, Junco, Tanema, Catucá, Alhandra) e firmeza da Mesa / Príncipe e Princesa.*

## 2. Mestre(a) ou Caboclo(a) da Ciência Presente
*Entidade regente (Cabocla Jurema, Rei Malunguinho, Mestre Carlos, Mestre Zé Pelintra, Mestra Ritinha, Mestra Paulina, etc.).*

## 3. Ciência da Fumaça (Cachimbo) & Maracá
*Trabalhos realizados na fumaça (fumaça às direitas para cura/abertura ou às esquerdas para desmancho/proteção), linhas cantadas e consagração do vinho da Jurema.*

## 4. Ensinamentos, Segredos de Raiz & Receitas (Garrafadas / Banhos)
*Fórmulas vegetais, rezas fortes, benzimentos e orientações deixadas pelos Mestres.*

## 5. Fechamento do Tronco & Confirmações
*Sensação de força telúrica e desdobramento prático da sessão.*`,
  },
  {
    id: "thelema_ritual",
    label: "⛤ Ritual Cerimonial Thelêmico / Hermético (Padrão)",
    tradition: "Thelema / Hermetismo",
    defaultTitle: "Operação Mágicka Cerimonial",
    category: "Prática",
    content: getDefaultTemplateForCategory("Prática"),
  },
  {
    id: "liber_e_dharana",
    label: "🧘 Prática Científica de Liber E (Asana · Pranayama · Dharana)",
    tradition: "Thelema / Hermetismo",
    defaultTitle: "Registro Científico — Liber E vel Exercitiorum",
    category: "Prática",
    content: `## 1. Asana (Postura) & Tempo de Imobilidade
*Postura escolhida (ex: Dragão, Íbis, Deus, Lótus), duração exata e grau de conforto/dor física.*

## 2. Pranayama (Controle do Prana)
*Ciclo respiratório utilizado (ex: 10s inspiração · 20s retenção · 20s expiração), sudorese ou fenômenos sutis.*

## 3. Dharana (Concentração em Objeto Único)
*Objeto mental visualizado (ex: Triângulo Branco, Rosa-Cruz, Ponto, Tattwa) e **número exato de quebras/desvios de atenção**.*

## 4. Avaliação Científica (O Método da Ciência)
*Fatores fisiológicos, clima, alimentação e comparação objetiva com a sessão anterior.*`,
  },
];

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
*Indique o Livro Sagrado, trecho de Liber AL vel Legis, Liber 777 ou fundamento de Terreiro/Jurema sob escrutínio.*

## 2. Correspondências Herméticas, Cabalísticas & Afro-Brasileiras
*Sephiroth envolvidas, caminhos da Árvore da Vida, Orixás, Linhas, Ervas (Ewê), planetas, signos e elementos.*

## 3. Gematria & Análise Simbólica
*Valores numéricos de termos-chave, letras hebraicas, pontos riscados e equivalências cabalísticas.*

## 4. Hipótese Mágica a ser Testada
*De que forma essa teoria deve ser testada experimentalmente nos rituais, giras ou na vida diária?*

## 5. Conclusões Provisórias
*Síntese do entendimento alcançado sob o método da ciência.*`;
  }

  if (norm.includes("visão") || norm.includes("visao") || norm === "vision") {
    return `## 1. Portal de Entrada, Tattwa ou Ponto de Força
*Símbolo utilizado (ex: Yantra de Tejas, Apas, porta astral, espelho negro, cachoeira astral ou tronco da Jurema).*

## 2. Método de Projeção & Testes de Autenticidade
*Sinais de reconhecimento entoados, pontos cantados, senhas de grau e testes aplicados às figuras encontradas.*

## 3. Exploração da Paisagem Astral
*Cores, atmosfera, arquitetura, natureza, temperatura e características do plano penetrado.*

## 4. Comunicação & Mensagem Recebida
*Diálogos, instruções ou símbolos transmitidos pelas inteligências, guias ou guardiões astrais.*

## 5. Retorno ao Templo Físico & Selamento
*Reabsorção do Corpo de Luz, fechamento do portal e sensações físicas ao retornar.*`;
  }

  if (norm.includes("sonho") || norm === "dream") {
    return `## 1. Nível de Lucidez (0 a 5), Fenômeno & Horário
*Grau de consciência no plano de Yesod, tipo de fenômeno (Sonho Lúcido, Projeção Astral, Recado de Guia) e horário exato do despertar.*

## 2. Prática da Véspera, Banho de Ervas & Conexões
*Rituais, meditações, banhos de ervas ou estado mental que precederam o sono.*

## 3. Narrativa do Sonho Lúcido
*Relato minucioso dos acontecimentos, ambientes, transições e escolhas feitas.*

## 4. Sinais de Sonho (Totens de Lucidez) & Arquétipos
*Entidades, Orixás, animais, águas, encruzilhadas, números, cores e símbolos recorrentes observados.*

## 5. Efeito no Despertar
*Sensação física e ressonância espiritual no retorno à vigília.*`;
  }

  if (norm.includes("oráculo") || norm.includes("oraculo") || norm === "oracle") {
    return `## 1. Pergunta & Propósito da Consulta
*Formulação clara da questão diante do Silêncio e da Verdadeira Vontade.*

## 2. Método de Tiragem & Disposição da Mesa
*Disposição geométrica das lâminas sobre o altar (visualize na Mesa Oracular abaixo).*

## 3. Leitura das Lâminas & Forças em Ação
*Análise das correntes astrais, Orixás e forças elementares refletidas pelas cartas.*

## 4. Síntese Oracular para a Vontade
*Diretrizes práticas, banhos/firmezas recomendadas e conselho de conduta mágica para a Grande Obra.*

## 5. Confirmações Posteriores no Mundo Físico
*Anotações sobre como os acontecimentos fenomênicos refletiram a consulta.*`;
  }

  // Default: Prática / Ritual
  return `## 1. Intenção & Declaração de Vontade
*Declaração formal do propósito da operação mágica ou firmeza espiritual.*

## 2. Preparação do Templo, Banho de Ervas & Banimento Preliminar
*Purificação do espaço, defumação, banimento formal (ex: Rubi Estrela, LRP, Saudação à Porteira) e consagração dos elementos.*

## 3. Operação Central / Invocação / Chamado
*Nomes Sagrados vibrados, Orixás/Guias chamados, pontos cantados/riscados e fórmulas executadas.*

## 4. Sensações Corporais & Estados Astrais
*Vibrações sutis, arrepio de coroa (Ori), calor, eletricidade na coluna, odores ou luzes no templo.*

## 5. Licença para Partir & Fechamento
*Agradecimento às forças presentes, selamento e restauração da harmonia.*

## 6. Resultados & Confirmações Fenomênicas
*Efeitos físicos observados e manifestações posteriores no mundo exterior.*`;
}
