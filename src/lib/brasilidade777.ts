// ============================================================================
// LIBER 777 BRASILIS — Correspondências Afro-Brasileiras, Ameríndias e Herméticas
// Umbanda · Quimbanda · Candomblé (Ketu/Angola/Jeje) · Jurema Sagrada (Catimbó)
// ============================================================================

export interface SephirahBrasilisCorrespondence {
  sephirahId: number;
  sephirahName: string;
  planetOrSphere: string;
  orixas: string[];
  umbandaLines: string[];
  quimbandaGuardians: string[];
  juremaMasters: string[];
  sacredHerbs: string[];
  colors: string[];
  elementsAndPointsOfPower: string[];
  greeting: string;
  synthesis: string;
}

export const OTZ_CHIIM_BRASILIS: Record<number, SephirahBrasilisCorrespondence> = {
  1: {
    sephirahId: 1,
    sephirahName: "Kether",
    planetOrSphere: "Primum Mobile · Coroa do Ori",
    orixas: ["Oxalá (Oxalufan)", "Olorum / Olodumare", "Zambi"],
    umbandaLines: ["Linha de Oxalá", "Mestres da Luz Cristalina", "Anjo de Guarda / Ori Supremo"],
    quimbandaGuardians: ["Exu Rei das 7 Encruzilhadas (Coroa da Lei)", "Exu Maioral (Polo de Luz Primordial)"],
    juremaMasters: ["Pai Tupã", "Mestre Jesus", "Tronco Real da Jurema Branca"],
    sacredHerbs: ["Boldo (Tapete de Oxalá)", "Algodão", "Manjericão Branco", "Alecrim do Campo", "Colônia"],
    colors: ["Branco Cristalino", "Alabastro", "Prata Radiante"],
    elementsAndPointsOfPower: ["Alto da Montanha", "Céu Aberto ao Meio-Dia", "Ori (Topo da Cabeça)"],
    greeting: "Epa Babá! Xeuepê!",
    synthesis:
      "A Fonte Imaculada do Axé e a Centelha Divina do Ori antes da diferenciação. Em Kether, a Verdadeira Vontade Thelêmica encontra o acordo primordial do Ori com Olorum.",
  },
  2: {
    sephirahId: 2,
    sephirahName: "Chokmah",
    planetOrSphere: "Zodíaco · Sabedoria Ancestral & Ifá",
    orixas: ["Orunmilá (Ifá)", "Oxaguian (Jovem Guerreiro do Branco)", "Oxumarê (Movimento Perpétuo)"],
    umbandaLines: ["Linha de Yorimá (Pretos Velhos — Sabedoria Viva)", "Pai Joaquim de Angola", "Pai Guiné", "Pai Cipriano"],
    quimbandaGuardians: ["Exu Veludo", "Exu Rei dos 7 Cruzeiros", "Exu Pinga-Fogo"],
    juremaMasters: ["Velhos Pajés", "Mestre Carlos", "Caboclo Sete Estrelas", "Ciência Sagrada do Catimbó"],
    sacredHerbs: ["Arruda Macho", "Guiné", "Alecrim", "Folha de Louro", "Noz de Cola (Obi)"],
    colors: ["Branco e Azul Claro", "Prata", "Preto e Branco (Sabedoria das Almas)"],
    elementsAndPointsOfPower: ["Cruzeiro das Almas", "Pé de Árvore Centenária", "Tábua de Ifá"],
    greeting: "Epa Babá Oxaguian! Adorei as Almas!",
    synthesis:
      "O impulso dinâmico criador (Hadit / Yod) e a transmissão oral da sabedoria ancestral. Nos terreiros, manifesta-se na ciência profunda de Ifá, dos Pajés e na humildade luminosa dos Pretos Velhos.",
  },
  3: {
    sephirahId: 3,
    sephirahName: "Binah",
    planetOrSphere: "Saturno ♄ · O Grande Mar, o Tempo e a Ancestralidade",
    orixas: ["Nanã Buruquê", "Obaluaê / Omolu", "Iemanjá (Aspecto de Grande Mãe Primordial / Iyá Ori)"],
    umbandaLines: ["Vovó Maria Conga", "Vovó Cambinda", "Vovó Catarina", "Linha das Almas e da Cura"],
    quimbandaGuardians: ["Exu Caveira", "Exu João Caveira", "Exu Tata Caveira", "Pombagira Rosa Caveira", "Exu Calunga"],
    juremaMasters: ["Mestra Paulina", "Caboclo Roxo", "Encantados das Águas Profundas e Manguezais"],
    sacredHerbs: ["Cipreste", "Babosa", "Folha de Mamona", "Manjerona", "Assa-Peixe", "Crisântemo"],
    colors: ["Lilás / Roxo Profundo", "Preto, Branco e Vermelho", "Azul Marinho Abissal"],
    elementsAndPointsOfPower: ["Lama Primordial / Mangue", "Kalunga Pequena (Cemitério)", "Fundo do Oceano"],
    greeting: "Saluba Nanã! Atotô Obaluaê!",
    synthesis:
      "O Grande Mar de Binah (Nuit / Babalon) e o Senhor do Tempo Saturnino. Nanã fornece o barro primordial da existência e Obaluaê guarda a passagem do tempo, o segredo da morte, da transmutação e da cura.",
  },
  4: {
    sephirahId: 4,
    sephirahName: "Chesed",
    planetOrSphere: "Júpiter ♃ · Realeza, Justiça Divina e Expansão",
    orixas: ["Xangô (Rei de Oyó e Senhor da Justiça)", "Ayrá", "Aganju"],
    umbandaLines: ["Caboclo Cobracoal", "Caboclo Sete Pedreiras", "Caboclo Cachoeirinha", "Falange de Xangô"],
    quimbandaGuardians: ["Exu Gira-Mundo", "Exu 7 Pedreiras", "Exu Mangueira", "Pombagira Rainha do Trono"],
    juremaMasters: ["Rei Salomão da Ciência", "Mestre José do Reino", "Cidade do Vajucá"],
    sacredHerbs: ["Erva de São João", "Elevante (Levante)", "Para-Raio", "Folha da Fortuna", "Manjericão Roxo", "Orobô"],
    colors: ["Marrom Terra", "Vermelho e Branco", "Dourado Real"],
    elementsAndPointsOfPower: ["Pedreira Alta", "Montanha Rochosa", "Trovoada Real"],
    greeting: "Kaô Kabecilê Xangô!",
    synthesis:
      "O trono de Júpiter, a Lei Justa e o equilíbrio soberano. Xangô pesa as ações com seu machado duplo (Oxê), recompensando a retidão e fulminando a mentira.",
  },
  5: {
    sephirahId: 5,
    sephirahName: "Geburah",
    planetOrSphere: "Marte ♂ · Ferro, Guerra, Fogo, Ventos e Corte de Demanda",
    orixas: ["Ogum (Senhor do Ferro e da Guerra)", "Iansã / Oyá (Senhora dos Ventos, Raios e Eguns)"],
    umbandaLines: ["Caboclo Ogum Beira-Mar", "Ogum Rompe-Mato", "Ogum Megê", "Cabocla Iansã", "Linha dos Boiadeiros (Zé do Laço, Navizala)"],
    quimbandaGuardians: [
      "Exu Tranca-Ruas das Almas",
      "Exu Tiriri",
      "Exu Marabô",
      "Exu Quebra-Galho",
      "Pombagira Rainha das 7 Encruzilhadas",
      "Pombagira Maria Quitéria",
    ],
    juremaMasters: ["Mestre Ferro-Brabo", "Caboclo Quebra-Pedra", "Rei Malunguinho (Guerreiro do Catucá)"],
    sacredHerbs: ["Espada-de-São-Jorge", "Espada-de-Santa-Bárbara", "Aroeira Vermelha", "Comigo-Ninguém-Pode", "Pinhão-Roxo", "Losna"],
    colors: ["Vermelho Escarlate", "Azul Ferrete (Ogum)", "Coral e Amarelo-Cobre (Oyá)"],
    elementsAndPointsOfPower: ["Estrada e Trilhos de Ferro", "Forja / Bigorna", "Tempestade de Vento e Raio", "Bambuzal"],
    greeting: "Ogunhê! Patacori Ogum! / Eparrei Oyá!",
    synthesis:
      "A força marcial implacável que abre caminhos, forja o aço da Vontade e varre os obstáculos e obsessores. Sem a espada de Ogum e o vento de Oyá, nenhuma obra mágica se sustenta.",
  },
  6: {
    sephirahId: 6,
    sephirahName: "Tiphareth",
    planetOrSphere: "Sol ☉ · A Flecha Única da Vontade e o Coração da Mata",
    orixas: ["Oxóssi (O Caçador de Uma Flecha Só — Fokus / Dharana)", "Logun Edé", "Guaraci (Sol)"],
    umbandaLines: [
      "Caboclo das Sete Encruzilhadas",
      "Caboclo Tupinambá",
      "Caboclo Pena Branca",
      "Caboclo Arariboia",
      "Caboclo Ubirajara",
      "Cabocla Jurema",
    ],
    quimbandaGuardians: ["Exu do Ouro", "Exu 7 Lira / Lúcifer Solar", "Exu Pimenta", "Pombagira Rosa Dourada"],
    juremaMasters: [
      "Cabocla Jurema",
      "Rei Malunguinho",
      "Mestre Carlos",
      "Mestre João da Mata",
      "Cidade Sagrada do Juremá",
    ],
    sacredHerbs: ["Casca de Jurema Preta (Mimosa tenuiflora)", "Samambaia", "Guiné", "Alecrim", "Louro Solar", "Alfavaca", "Pitanga"],
    colors: ["Verde-Mata Esmeralda", "Ouro Solar", "Azul-Turquesa"],
    elementsAndPointsOfPower: ["Coração da Mata Virgem", "Clareira Iluminada pelo Sol", "Tronco Sagrado da Jurema"],
    greeting: "Okê Arô Oxóssi! Salve a Jurema Sagrada!",
    synthesis:
      "Em Tiphareth reside o Sagrado Anjo Guardião e a mira infalível de Oxóssi (*Otokan Soso* — o caçador de uma única flecha). Na tradição brasileira, é também o coração solar da Jurema Sagrada e dos grandes Caboclos.",
  },
  7: {
    sephirahId: 7,
    sephirahName: "Netzach",
    planetOrSphere: "Vênus ♀ · Amor, Ouro, Cachoeiras, Encanto e Desejo Criador",
    orixas: ["Oxum (Senhora do Ouro, do Amor e das Cachoeiras)", "Obá", "Ibeji (Cosme e Damião)"],
    umbandaLines: ["Cabocla Oxum", "Linha do Oriente e Povo Cigano (Wladimir, Esmeralda)", "Linha das Crianças / Erês (Doum, Mariazinha)"],
    quimbandaGuardians: [
      "Pombagira Maria Padilha",
      "Pombagira Maria Mulambo",
      "Pombagira Cigana das 7 Saias",
      "Pombagira Dama da Noite",
      "Pombagira Maria Farrapo",
    ],
    juremaMasters: ["Mestra Ritinha", "Mestra Maria do Acais", "Princesa Flora", "Mestra Jarina"],
    sacredHerbs: ["Macassá (Catinga-de-Mulata)", "Calêndula", "Camomila", "Rosa Amarela", "Rosa Vermelha", "Canela", "Erva-Doce", "Mel"],
    colors: ["Amarelo-Ouro", "Dourado", "Rosa", "Vermelho Rubi"],
    elementsAndPointsOfPower: ["Cachoeira de Água Doce", "Rio Cristalino", "Jardim de Rosas", "Acampamento Cigano"],
    greeting: "Ora Yê Yê Ô Oxum! Laroyê Pombagira! Optchá!",
    synthesis:
      "A força venusiana do encanto, da doçura estratégica, da prosperidade dourada e da paixão ardente (*Amor sob Vontade*). Reúne o ouro de Oxum, a alegria pura dos Erês e o magnetismo soberano das Pombagiras e Mestras.",
  },
  8: {
    sephirahId: 8,
    sephirahName: "Hod",
    planetOrSphere: "Mercúrio ☿ · Encruzilhadas, Comunicação, Magia das Folhas e Malandragem",
    orixas: [
      "Exu (Elegbara / Bará — Senhor da Comunicação e do Movimento)",
      "Ossaim (Senhor Sagrado das Folhas e da Ciência Litúrgica)",
    ],
    umbandaLines: [
      "Linha dos Malandros (Seu Zé Pelintra, Maria Navalha)",
      "Linha dos Baianos (Zé do Coco, Maria Bonita)",
      "Médicos do Espaço e Magos Brancos",
    ],
    quimbandaGuardians: [
      "Exu Sete Encruzilhadas",
      "Exu Capa Preta",
      "Exu Destranca-Ruas",
      "Exu Toquinho",
      "Exu Mirim",
    ],
    juremaMasters: [
      "Mestre Zé Pelintra (Padrinho da Jurema)",
      "Mestre Pilão Deitado",
      "Mestre Zé Bebinho",
      "Mestre Cachimbo",
    ],
    sacredHerbs: ["Peregun (Dracena)", "Arruda", "Fumo de Rolo", "Hortelã", "Cansanção", "Jarrinha", "Sete-Sangrias"],
    colors: ["Preto e Vermelho (Exu)", "Verde e Branco (Ossaim)", "Branco e Vermelho (Seu Zé Pelintra)"],
    elementsAndPointsOfPower: ["Encruzilhada Aberta", "Lapa / Arcos da Boemia", "Laboratório de Ervas (Pepelê)"],
    greeting: "Laroyê Exu, Exu é Mojubá! / Ewê Ô, Ewê Assá! / Salve a Malandragem!",
    synthesis:
      "O intelecto mágico de Mercúrio/Thoth encontra Exu (o mensageiro que fala todas as línguas entre o Orun e o Aiyê), Ossaim (*Kosi Ewê, Kosi Orixá* — sem folha não há Orixá) e a astúcia invencível de Seu Zé Pelintra.",
  },
  9: {
    sephirahId: 9,
    sephirahName: "Yesod",
    planetOrSphere: "Lua ☽ · As Grandes Águas, Sonhos, Vidência e o Plano Astral",
    orixas: ["Iemanjá (Rainha do Mar e da Lua)", "Ewá (Senhora das Brumas, Fontes e Clarividência)", "Jaci (Lua)"],
    umbandaLines: [
      "Linha dos Marinheiros (Martim Pescador, Seu Marujo)",
      "Sereias e Povo d'Água (Janaína, Iara)",
      "Cabocla Indaiá",
    ],
    quimbandaGuardians: ["Exu Meia-Noite", "Exu Mare", "Exu da Praia", "Pombagira da Praia", "Pombagira Menina da Praia"],
    juremaMasters: ["Sereia do Mar", "Encantados do Fundo das Águas", "Boto Encantado", "Mariana Turca"],
    sacredHerbs: ["Alfazema", "Rosa Branca", "Jasmim", "Lágrima-de-Nossa-Senhora", "Anis-Estrelado", "Artemísia"],
    colors: ["Azul Cristalino", "Verde-Água", "Prata Lunar", "Pérola"],
    elementsAndPointsOfPower: ["Beira-Mar / Ondas da Praia (Kalunga Grande)", "Lagoa Espelhada sob a Lua Cheia", "Bruma da Manhã"],
    greeting: "Odoyá, Odofiaba Iemanjá! Ri Rô Ewá! Salve a Marujada!",
    synthesis:
      "O espelho lunar do Plano Astral e dos Sonhos Lúcidos. As ondas de Iemanjá limpam o psiquismo, trazem equilíbrio emocional e abrem a vidência profunda sob o véu de Ewá.",
  },
  10: {
    sephirahId: 10,
    sephirahName: "Malkuth",
    planetOrSphere: "Terra 🜨 · O Terreiro, o Corpo Físico, o Congá e os 7 Reinos",
    orixas: ["Onilé (Senhora da Terra)", "Orixás Funfun e da Agricultura (Oko)", "Guardiões da Porteira"],
    umbandaLines: ["Todas as 7 Linhas Reunidas no Terreiro", "Caboclos Boiadeiros e Sertanejos", "Guardiões da Tronqueira"],
    quimbandaGuardians: [
      "Exu Porteira",
      "Exu Guarda",
      "Exu 7 Porteiras",
      "Os 7 Reinos da Quimbanda (Encruzilhada, Cruzeiro, Mata, Kalunga, Almas, Lira, Praia)",
    ],
    juremaMasters: ["Ciência Terrena da Jurema", "Cidades Encantadas Plantadas no Chão do Nordeste (Alhandra)"],
    sacredHerbs: ["Dandá da Costa (Tiririca)", "Raiz de Jurema", "Benjoim", "Mirra", "Alfazema", "Sete Ervas Sagradas"],
    colors: ["Terracota / Barro", "Citrino, Oliva, Castanho e Preto (4 Elementos)", "Branco da Pemba"],
    elementsAndPointsOfPower: ["Chão do Terreiro", "Congá / Peji", "Porteira / Tronqueira", "Quartinha de Barro"],
    greeting: "Saravá o Terreiro! Mojubá Guardiões da Porteira!",
    synthesis:
      "O Templo manifestado na matéria. Na magia brasileira, Malkuth é o próprio chão sagrado do Terreiro, os pés descalços na terra, a fumaça do cachimbo e do defumador e a firmeza da Tronqueira.",
  },
};

export interface AfroBrazilianWeekdayRuler {
  dayIndex: number; // 0 = Domingo ... 6 = Sábado
  dayNamePt: string;
  latinName: string;
  planet: string;
  orixas: string;
  linesAndEntities: string;
  greeting: string;
  candleColors: string;
  recommendedHerbs: string;
}

export const AFRO_BRAZILIAN_WEEKDAY_RULERS: Record<number, AfroBrazilianWeekdayRuler> = {
  0: {
    dayIndex: 0,
    dayNamePt: "Domingo",
    latinName: "Dies Solis",
    planet: "Sol ☉",
    orixas: "Ibeji (Erês), Oxalá Solar & Forças da Alegria",
    linesAndEntities: "Crianças (Cosme e Damião), Povo Cigano & Mestres Solares",
    greeting: "Oni Ibejada! Optchá!",
    candleColors: "Dourada, Amarela, Rosa ou Azul-Clara",
    recommendedHerbs: "Camomila, Louro, Calêndula, Canela e Hortelã",
  },
  1: {
    dayIndex: 1,
    dayNamePt: "Segunda-feira",
    latinName: "Dies Lunae",
    planet: "Lua ☽",
    orixas: "Exu, Obaluaê / Omolu & Nanã",
    linesAndEntities: "Pretos Velhos (Almas), Exus e Pombagiras Guardiões",
    greeting: "Laroyê Exu! Atotô Obaluaê! Adorei as Almas!",
    candleColors: "Preta e Branca (Almas/Omolu) ou Preta e Vermelha (Exu)",
    recommendedHerbs: "Arruda, Guiné, Alecrim, Pipoca (Doburu) e Dandá da Costa",
  },
  2: {
    dayIndex: 2,
    dayNamePt: "Terça-feira",
    latinName: "Dies Martis",
    planet: "Marte ♂",
    orixas: "Ogum & Oxumarê",
    linesAndEntities: "Caboclos de Ogum, Boiadeiros e Guardiões de Ronda",
    greeting: "Ogunhê, Meu Pai! Patacori Ogum! Arroboboi!",
    candleColors: "Azul Ferrete, Vermelha ou Vermelha e Branca",
    recommendedHerbs: "Espada-de-São-Jorge, Aroeira, Mangueira e Abre-Caminho",
  },
  3: {
    dayIndex: 3,
    dayNamePt: "Quarta-feira",
    latinName: "Dies Mercurii",
    planet: "Mercúrio ☿",
    orixas: "Xangô, Iansã (Oyá) & Obá",
    linesAndEntities: "Caboclos da Pedreira, Falange dos Ventos e Mestre Zé Pelintra",
    greeting: "Kaô Kabecilê Xangô! Eparrei Oyá!",
    candleColors: "Marrom, Vermelha ou Amarela-Coral",
    recommendedHerbs: "Erva de São João, Elevante, Espada-de-Santa-Bárbara e Para-Raio",
  },
  4: {
    dayIndex: 4,
    dayNamePt: "Quinta-feira",
    latinName: "Dies Jovis",
    planet: "Júpiter ♃",
    orixas: "Oxóssi, Ossaim & Logun Edé",
    linesAndEntities: "Caboclos da Mata, Mestres e Caboclas da Jurema Sagrada",
    greeting: "Okê Arô Oxóssi! Ewê Assá! Salve a Jurema Sagrada!",
    candleColors: "Verde-Mata, Verde e Branca ou Azul-Turquesa",
    recommendedHerbs: "Jurema Preta, Samambaia, Guiné, Alecrim, Peregun e Alfavaca",
  },
  5: {
    dayIndex: 5,
    dayNamePt: "Sexta-feira",
    latinName: "Dies Veneris",
    planet: "Vênus ♀",
    orixas: "Oxalá (Oxalufan e Oxaguian)",
    linesAndEntities: "Dia Sagrado do Branco, Paz, Firmeza de Anjo de Guarda e Ori",
    greeting: "Epa Babá Oxalá! Xeuepê!",
    candleColors: "Branca Imaculada",
    recommendedHerbs: "Boldo (Tapete de Oxalá), Manjericão Branco, Algodão e Alfazema",
  },
  6: {
    dayIndex: 6,
    dayNamePt: "Sábado",
    latinName: "Dies Saturni",
    planet: "Saturno ♄",
    orixas: "Iemanjá, Oxum & Nanã Buruquê",
    linesAndEntities: "Povo d'Água, Marinheiros, Sereias, Ciganas e Pombagiras",
    greeting: "Odoyá Iemanjá! Ora Yê Yê Ô Oxum! Saluba Nanã!",
    candleColors: "Azul-Clara, Amarela-Ouro, Rosa ou Lilás",
    recommendedHerbs: "Rosa Branca, Rosa Amarela, Macassá, Alfazema e Jasmim",
  },
};

export function getAfroBrazilianDayRuler(date: Date = new Date()): AfroBrazilianWeekdayRuler {
  const day = date.getDay();
  return AFRO_BRAZILIAN_WEEKDAY_RULERS[day] || AFRO_BRAZILIAN_WEEKDAY_RULERS[0];
}

// Presets de Influências Brasileiras para o Editor de Notas
export const BRASILIS_INFLUENCE_PRESETS: Record<string, string[]> = {
  orixa: [
    "Exu (Elegbara) · Mensageiro",
    "Ogum · Senhor do Ferro e Caminhos",
    "Oxóssi · Caçador de Uma Flecha Só",
    "Ossaim · Senhor Sagrado das Folhas",
    "Xangô · Rei da Justiça e Pedreira",
    "Iansã (Oyá) · Ventos, Raios e Eguns",
    "Oxum · Ouro, Amor e Cachoeiras",
    "Logun Edé · Príncipe das Matas e Rios",
    "Iemanjá · Rainha do Mar e do Astral",
    "Nanã Buruquê · Grande Mãe Ancestral",
    "Obaluaê / Omolu · Cura e Kalunga",
    "Oxumarê · Arco-Íris e Ciclos",
    "Obá · Força e Foco Guerreiro",
    "Ewá · Brumas e Vidência",
    "Ibeji · Alegria e Renovação",
    "Oxaguian · Invenção e Dinamismo",
    "Oxalufan (Oxalá) · Paz e Coroa do Ori",
  ],
  guia: [
    "Caboclo das 7 Encruzilhadas",
    "Caboclo Tupinambá",
    "Caboclo Pena Branca",
    "Caboclo Cobra Coral",
    "Cabocla Jurema",
    "Preto Velho Pai Joaquim de Angola",
    "Preto Velho Pai Cipriano",
    "Preta Velha Vovó Maria Conga",
    "Preta Velha Vovó Cambinda",
    "Seu Zé Pelintra (Mestre / Malandro)",
    "Maria Navalha",
    "Rei Malunguinho (Jurema)",
    "Mestre Carlos (Jurema)",
    "Mestra Paulina (Jurema)",
    "Mestra Ritinha (Jurema)",
    "Mestre Pilão Deitado (Jurema)",
    "Exu Tranca-Ruas das Almas",
    "Exu Tiriri",
    "Exu Marabô",
    "Exu 7 Encruzilhadas",
    "Exu Veludo",
    "Exu Caveira / João Caveira",
    "Exu Meia-Noite",
    "Exu Capa Preta",
    "Pombagira Maria Padilha",
    "Pombagira Maria Mulambo",
    "Pombagira Rainha das 7 Encruzilhadas",
    "Pombagira Rosa Caveira",
    "Pombagira Cigana",
    "Boiadeiro Zé do Laço",
    "Marinheiro Martim Pescador",
  ],
  ponto_forca: [
    "Terreiro / Congá / Peji",
    "Tronqueira / Porteira",
    "Mata Fechada (Oxóssi / Caboclos)",
    "Cachoeira de Água Doce (Oxum)",
    "Pedreira Real (Xangô)",
    "Praia / Kalunga Grande (Iemanjá)",
    "Encruzilhada Aberta (Exu / Pombagira)",
    "Cruzeiro das Almas (Pretos Velhos)",
    "Kalunga Pequena (Omolu / Guardiões)",
    "Tronco Sagrado da Jurema",
    "Estrada / Caminhos (Ogum)",
    "Bambuzal (Oyá / Iansã)",
  ],
  banho_defumacao: [
    "Banho de 7 Ervas (Descarrego e Abertura)",
    "Banho de Boldo / Tapete de Oxalá (Ori)",
    "Banho de Arruda, Guiné e Alecrim",
    "Banho de Rosas e Alfazema (Atração e Paz)",
    "Banho de Espada-de-São-Jorge (Proteção)",
    "Banho de Casca de Jurema Preta (Força)",
    "Defumação de Benjoim, Mirra e Alecrim",
    "Defumação de Dandá da Costa e Café",
    "Fumaça de Cachimbo da Jurema (Direita / Limpeza)",
    "Fumaça de Cachimbo da Jurema (Esquerda / Corte)",
    "Firmeza de Anjo de Guarda (Vela Branca e Copo d'Água)",
    "Padê de Exu (Farinha, Dendê / Mel e Marafo)",
    "Ponto Riscado na Pemba Consagrada",
  ],
};
