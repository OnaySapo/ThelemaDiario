import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

import { MagickEntry } from "./types";
export type { MagickEntry };

let dbInstance: DatabaseSync | null = null;

function performAutoBackup(dbPath: string, dataDir: string) {
  try {
    if (!fs.existsSync(dbPath)) return;
    const stats = fs.statSync(dbPath);
    if (stats.size < 1024) return; // Muito pequeno ou vazio

    const backupDir = path.join(dataDir, "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const dateStamp = new Date().toISOString().slice(0, 10);
    const backupFile = path.join(backupDir, `magick_diary_backup_${dateStamp}.db`);
    if (!fs.existsSync(backupFile)) {
      fs.copyFileSync(dbPath, backupFile);
    }

    // Rotaciona para manter até 7 backups diários
    const existing = fs
      .readdirSync(backupDir)
      .filter((f) => f.startsWith("magick_diary_backup_") && f.endsWith(".db"))
      .sort();
    while (existing.length > 7) {
      const oldest = existing.shift()!;
      try {
        fs.unlinkSync(path.join(backupDir, oldest));
      } catch (e) {}
    }
  } catch (err) {
    console.warn("Aviso ao realizar auto-backup do diário:", err);
  }
}

export function getDatabase(): DatabaseSync {
  if (dbInstance) return dbInstance;

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "magick_diary.db");
  performAutoBackup(dbPath, dataDir);

  const db = new DatabaseSync(dbPath);

  // High performance & integrity SQLite PRAGMAs
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA synchronous = NORMAL;");

  // Initialize Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      date TEXT NOT NULL,
      success_rating INTEGER DEFAULT 5,
      thelemic_date TEXT,
      sun_sign TEXT,
      sun_degree REAL,
      moon_sign TEXT,
      moon_degree REAL,
      moon_phase TEXT,
      moon_illumination REAL,
      planetary_day TEXT,
      planetary_hour TEXT,
      mental_state_before TEXT,
      mental_state_after TEXT,
      tags_json TEXT DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS entry_influences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id TEXT NOT NULL,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS entry_connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      relationship_type TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (source_id) REFERENCES entries(id) ON DELETE CASCADE,
      FOREIGN KEY (target_id) REFERENCES entries(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS oracle_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id TEXT NOT NULL UNIQUE,
      system TEXT NOT NULL,
      spread_name TEXT NOT NULL,
      query TEXT NOT NULL,
      cards_json TEXT NOT NULL,
      card_back_style TEXT,
      ai_interpretation TEXT,
      confirmation_notes TEXT,
      FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    -- Fast retrieval and ordering indexes
    CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date DESC);
    CREATE INDEX IF NOT EXISTS idx_entries_type ON entries(type);
    CREATE INDEX IF NOT EXISTS idx_entry_influences_entry_id ON entry_influences(entry_id);
    CREATE INDEX IF NOT EXISTS idx_entry_connections_source_id ON entry_connections(source_id);
    CREATE INDEX IF NOT EXISTS idx_entry_connections_target_id ON entry_connections(target_id);
    CREATE INDEX IF NOT EXISTS idx_oracle_records_entry_id ON oracle_records(entry_id);
  `);

  // Migrate existing tables if columns are missing
  try {
    const oracleCols = db.prepare("PRAGMA table_info(oracle_records)").all() as any[];
    const hasCardBack = oracleCols.some((c) => c.name === "card_back_style");
    const hasAiInterp = oracleCols.some((c) => c.name === "ai_interpretation");

    if (!hasCardBack) {
      db.exec("ALTER TABLE oracle_records ADD COLUMN card_back_style TEXT;");
    }
    if (!hasAiInterp) {
      db.exec("ALTER TABLE oracle_records ADD COLUMN ai_interpretation TEXT;");
    }
    if (!oracleCols.some((c) => c.name === "querent_name")) {
      db.exec("ALTER TABLE oracle_records ADD COLUMN querent_name TEXT;");
    }
    if (!oracleCols.some((c) => c.name === "querent_birthdate")) {
      db.exec("ALTER TABLE oracle_records ADD COLUMN querent_birthdate TEXT;");
    }
  } catch (err) {
    console.warn("Aviso ao verificar migrações do banco:", err);
  }

  // Check if initial seed is needed
  const countRow = db.prepare("SELECT COUNT(*) as count FROM entries").get() as { count: number };
  if (countRow.count === 0) {
    seedInitialData(db);
  }

  dbInstance = db;
  return dbInstance;
}

function seedInitialData(db: DatabaseSync) {
  const sampleEntries: MagickEntry[] = [
    {
      id: "ritual-rubi-estrela",
      type: "ritual",
      title: "Consagração do Templo & Rubi Estrela (Liber XXV)",
      content: `Execução formal do Rubi Estrela no Templo Interior voltado a Boleskine.\n\nPassos:\n1. Apo Pantos Kakodaimonos com grito de N.O.X.\n2. Traçado dos hexagramas de Nuit e Hadit nos quatro quadrantes com a espada de ferro.\n3. Entoação dos Nomes Sagrados: Cha-os, Babalon, Hadit, Therion.\n4. Vibração profunda sentida na coluna vertebral e elevação de Kundalini.\n\nResultado Fenomênico: Sensação eletrizante no ar, cheiro de ozônio nítido e estabilização de luz violeta no quarto.`,
      date: "2026-09-25T21:30:00.000Z",
      success_rating: 9,
      thelemic_date: "☉ in ♎ 02°, ☽ in ♓ 18°, Dies Veneris, Anno V:xii",
      sun_sign: "Libra",
      sun_degree: 2.1,
      moon_sign: "Peixes",
      moon_degree: 18.4,
      moon_phase: "Lua Cheia",
      moon_illumination: 98,
      planetary_day: "Dies Veneris",
      planetary_hour: "Hora de Vênus",
      mental_state_before: "Mente inquieta pelas pressões mundanas, necessidade de purificação.",
      mental_state_after: "Paz absoluta, foco diamantino, consciência expandida e reverência.",
      tags: ["#rubiestrela", "#banimento", "#therion", "#babalon"],
      influences: [
        { category: "entity", name: "Babalon" },
        { category: "entity", name: "Therion" },
        { category: "tool", name: "Espada Mágica" },
        { category: "candle", name: "Vela Vermelha Escarlate" },
        { category: "incense", name: "Mirra e Olíbano" },
        { category: "feeling", name: "Êxtase e Devoção" },
      ],
    },
    {
      id: "oraculo-thoth-vontade",
      type: "oracle",
      title: "Consulta Oracular: Alinhamento da Verdadeira Vontade",
      content: `Consulta ao Tarô de Thoth sobre a iniciação de uma nova operação de longo prazo visando o Conhecimento e Conversação do Sagrado Anjo Guardião.\n\nCartas obtidas:\n- A Vontade: Atu IX - O Eremita (A luz interior de Yod)\n- O Obstáculo: Atu XVI - A Torre (Apego a estruturas mentais obsoletas)\n- O Auxílio: Atu XIV - A Arte (Solve et Coagula, alquimia paciente)\n- O Resultado: Atu XXI - O Universo (Realização plena da Obra).\n\nA interpretação revela que antes da cristalização, a mente precisa consentir com a dissolução do ego rígido.`,
      date: "2026-09-26T14:15:00.000Z",
      success_rating: 9,
      thelemic_date: "☉ in ♎ 03°, ☽ in ♈ 01°, Dies Saturni, Anno V:xii",
      sun_sign: "Libra",
      sun_degree: 3.2,
      moon_sign: "Áries",
      moon_degree: 1.5,
      moon_phase: "Minguante Gibosa",
      moon_illumination: 92,
      planetary_day: "Dies Saturni",
      planetary_hour: "Hora de Saturno",
      mental_state_before: "Curiosidade sóbria e respeito ao oráculo.",
      mental_state_after: "Clareza límpida sobre o próximo passo sacrificial do ego.",
      tags: ["#thoth", "#oraculo", "#sagradoanjoguardiao", "#alquimia"],
      influences: [
        { category: "entity", name: "Tahuti / Thoth" },
        { category: "tool", name: "Tarô de Thoth" },
        { category: "incense", name: "Sândalo" },
        { category: "feeling", name: "Serenidade Filosófica" },
      ],
      oracle_data: {
        system: "thoth_tarot",
        spread_name: "Tiragem da Verdadeira Vontade",
        query: "Qual a atitude necessária para a Grande Obra neste trimestre?",
        cards: [
          { position: "A Verdadeira Vontade", cardId: "atu_9", cardName: "O Eremita (The Hermit)", notes: "Luz interior, isolamento frutífero" },
          { position: "O Obstáculo", cardId: "atu_16", cardName: "A Torre (The Tower)", notes: "Medo da ruptura com crenças velhas" },
          { position: "O Auxílio", cardId: "atu_14", cardName: "A Arte (Art)", notes: "Moderação alquímica e fusão de opostos" },
          { position: "O Resultado", cardId: "atu_21", cardName: "O Universo (The Universe)", notes: "Consumação da Obra" },
        ],
        confirmation_notes: "Dois dias após, recebi um sinal nítido através de sincronicidade bibliográfica no Liber Aleph.",
      },
    },
    {
      id: "sonho-torre-dissolucao",
      type: "dream",
      title: "Sonho Lúcido: A Torre de Chumbo e o Pássaro de Fogo",
      content: `Sonho lúcido após a meditação noturna.\n\nEu me encontrava no topo de uma torre circular cinzenta que começava a ruir sob relâmpagos avermelhados (ressonância evidente com o Atu XVI tirado horas antes). Em vez de pânico, lembrei-me da divisa thelêmica e saltei no abismo.\n\nDurante a queda, o corpo físico desfez-se em fagulhas e acordei flutuando com extrema lucidez no plano astral com uma sensação de leveza indescritível.`,
      date: "2026-09-27T05:30:00.000Z",
      success_rating: 8,
      thelemic_date: "☉ in ♎ 04°, ☽ in ♈ 14°, Dies Solis, Anno V:xii",
      sun_sign: "Libra",
      sun_degree: 3.8,
      moon_sign: "Áries",
      moon_degree: 14.1,
      moon_phase: "Minguante",
      moon_illumination: 85,
      planetary_day: "Dies Solis",
      planetary_hour: "Hora do Sol",
      mental_state_before: "Sono tranquilo com foco no Terceiro Olho.",
      mental_state_after: "Vigor renovado e maravilhamento.",
      tags: ["#sonholucido", "#astral", "#liberacao", "#saltonoabismo"],
      influences: [
        { category: "entity", name: "Hórus" },
        { category: "feeling", name: "Lucidez Serena" },
      ],
    },
    {
      id: "visao-tattwa-tejas",
      type: "vision",
      title: "Skrying no Espírito: Exploração do Tattwa Tejas (Triângulo Vermelho)",
      content: `Operação de visão astral através do símbolo de Tejas (o triângulo vermelho do Fogo).\n\nProcedimento:\n- Visualização do Yantra de Tejas até a inversão retiniana da cor complementar.\n- Projeção pelo portal com o corpo de luz.\n- Entrada numa paisagem desértica com areia incandescente e vulcões de obsidiana.\n- Encontro com uma figura andrógina trajando armadura de bronze dourado com um falcão no ombro.\n- Teste de autenticidade: Sinal do Fogo (Tuath) e o Nome Adonai Tzabaoth. A figura curvou-se em resposta e apontou para o zênite onde brilhava a Estrela de Prata.`,
      date: "2026-10-02T19:00:00.000Z",
      success_rating: 9,
      thelemic_date: "☉ in ♎ 09°, ☽ in ♋ 27°, Dies Veneris, Anno V:xii",
      sun_sign: "Libra",
      sun_degree: 9.3,
      moon_sign: "Câncer",
      moon_degree: 27.2,
      moon_phase: "Quarto Minguante",
      moon_illumination: 50,
      planetary_day: "Dies Veneris",
      planetary_hour: "Hora de Marte",
      mental_state_before: "Foco respiratório com Pranayama 4-4-4-4.",
      mental_state_after: "Calor físico evidente nas mãos e no plexo solar.",
      tags: ["#tattwa", "#tejas", "#fogo", "#skrying", "#astral"],
      influences: [
        { category: "element", name: "Fogo (Tejas)" },
        { category: "entity", name: "Arcanjo Kamael" },
        { category: "tool", name: "Vara Mágica" },
        { category: "candle", name: "Vela Dourada" },
        { category: "incense", name: "Canela e Sangue de Dragão" },
        { category: "feeling", name: "Ardência Mágica" },
      ],
    },
    {
      id: "estudo-liber-777-coluna-xlv",
      type: "study",
      title: "Estudo Hermético: Correspondências Mágicas de Liber 777",
      content: `Aprofundamento nas colunas XLV e CLXXV de Liber 777 com foco nas fragrâncias e pedras mágicas para evocações benéficas.\n\nNotas principais:\n- A relação estrita entre a resina de Olíbano e Tiphareth (o Sol) como agente universal de purificação.\n- Quando associado à Lua em Peixes (Yesod/Netzach reflexo), a Mirra atua como condutora ideal da substância astral.\n- Hipótese a ser testada: Rituais com incenso correspondente ao planeta do dia apresentam aumento estatístico de clareza nas visões.`,
      date: "2026-10-05T10:00:00.000Z",
      success_rating: 8,
      thelemic_date: "☉ in ♎ 12°, ☽ in ♌ 10°, Dies Lunae, Anno V:xii",
      sun_sign: "Libra",
      sun_degree: 12.1,
      moon_sign: "Leão",
      moon_degree: 10.4,
      moon_phase: "Minguante Balsâmica",
      moon_illumination: 20,
      planetary_day: "Dies Lunae",
      planetary_hour: "Hora da Lua",
      mental_state_before: "Intelecto desperto.",
      mental_state_after: "Inspiração para estruturar os próximos experimentos.",
      tags: ["#estudo", "#liber777", "#correspondencias", "#cabala"],
      influences: [
        { category: "entity", name: "Hermes Trismegisto" },
        { category: "feeling", name: "Curiosidade Lúcida" },
      ],
    },
    {
      id: "diario-cronica-cotidiano",
      type: "Diário",
      title: "Crônica Cotidiana: Rotina, Café e Equilíbrio Secular",
      content: `## 1. Crônica do Dia & Acontecimentos Mundanos\nDia produtivo dedicado à organização das tarefas de trabalho e rotina doméstica. Caminhada matinal sob o sol leve, organização da mesa de estudos e resolução de pendências práticas que estavam acumuladas.\n\n## 2. Pensamentos, Impressões & Emoções\nSensação de clareza mental e tranquilidade. Conversa agradável com um amigo à tarde sobre planos e leituras. O ritmo do dia fluiu sem pressa ou ansiedade desnecessária.\n\n## 3. Estado Físico, Corpo & Energia\nBoa disposição física ao longo de todo o período. Sono reparador na noite anterior, alimentação equilibrada e hidratação adequada.\n\n## 4. Aprendizados & Insights do Dia\nCuidar do plano material com zelo e atenção é a base que sustenta a estabilidade da mente. Quando as coisas práticas estão em ordem, o espírito encontra espaço para descansar e contemplar.\n\n## 5. Fechamento & Foco para Amanhã\nFinalizo a noite lendo e organizando a agenda de amanhã. Prioridade: manter a mesma serenidade nas tarefas matinais.`,
      date: "2026-10-06T20:15:00.000Z",
      success_rating: 8,
      thelemic_date: "☉ in ♎ 13°, ☽ in ♌ 04°",
      sun_sign: "Libra",
      sun_degree: 13.2,
      moon_sign: "Leão",
      moon_degree: 4.5,
      moon_phase: "Minguante",
      moon_illumination: 35,
      planetary_day: "Dies Martis",
      planetary_hour: "Hora de Marte",
      tags: ["#cotidiano", "#rotina", "#clareza", "#mundano"],
      influences: [],
    },
  ];

  for (const entry of sampleEntries) {
    saveEntry(entry, db);
  }

  // Create Connections between sample entries
  createConnection({
    source_id: "oraculo-thoth-vontade",
    target_id: "ritual-rubi-estrela",
    relationship_type: "result_of",
    notes: "O oráculo confirmou as correntes purificadoras estabelecidas no Rubi Estrela.",
  }, db);

  createConnection({
    source_id: "sonho-torre-dissolucao",
    target_id: "oraculo-thoth-vontade",
    relationship_type: "predicted_by",
    notes: "O sonho lúcido manifestou exatamente a energia do Atu XVI (A Torre) anunciado no oráculo.",
  }, db);

  createConnection({
    source_id: "visao-tattwa-tejas",
    target_id: "estudo-liber-777-coluna-xlv",
    relationship_type: "references",
    notes: "Aplicação das correspondências de Liber 777 durante a exploração do plano de Fogo.",
  }, db);
}

export function getAllEntries(filters?: { type?: string; tag?: string; search?: string }): MagickEntry[] {
  const db = getDatabase();
  let query = "SELECT * FROM entries WHERE 1=1";
  const params: any[] = [];

  if (filters?.type && filters.type !== "all") {
    query += " AND type = ?";
    params.push(filters.type);
  }

  if (filters?.search) {
    query += " AND (title LIKE ? OR content LIKE ?)";
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  query += " ORDER BY date DESC";

  const rows = db.prepare(query).all(...params) as any[];

  return rows.map((row) => {
    const influences = db.prepare("SELECT category, name FROM entry_influences WHERE entry_id = ?").all(row.id) as any[];
    const connections = db.prepare("SELECT target_id, relationship_type, notes FROM entry_connections WHERE source_id = ?").all(row.id) as any[];
    const oracle = db.prepare("SELECT * FROM oracle_records WHERE entry_id = ?").get(row.id) as any;

    let parsedOracleData: any = undefined;
    if (oracle) {
      parsedOracleData = {
        system: oracle.system,
        spread_name: oracle.spread_name,
        query: oracle.query,
        cards: JSON.parse(oracle.cards_json || "[]"),
        card_back_style: oracle.card_back_style || "rosa_cruz",
        ai_interpretation: oracle.ai_interpretation || "",
        confirmation_notes: oracle.confirmation_notes,
        querent_name: oracle.querent_name || "",
        querent_birthdate: oracle.querent_birthdate || "",
      };
    }

    return {
      id: row.id,
      type: row.type,
      title: row.title,
      content: row.content,
      date: row.date,
      success_rating: row.success_rating,
      thelemic_date: row.thelemic_date,
      sun_sign: row.sun_sign,
      sun_degree: row.sun_degree,
      moon_sign: row.moon_sign,
      moon_degree: row.moon_degree,
      moon_phase: row.moon_phase,
      moon_illumination: row.moon_illumination,
      planetary_day: row.planetary_day,
      planetary_hour: row.planetary_hour,
      mental_state_before: row.mental_state_before,
      mental_state_after: row.mental_state_after,
      tags: JSON.parse(row.tags_json || "[]"),
      influences,
      connections,
      oracle_data: parsedOracleData,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  });
}

export function getEntryById(id: string): MagickEntry | null {
  const db = getDatabase();
  const row = db.prepare("SELECT * FROM entries WHERE id = ?").get(id) as any;
  if (!row) return null;

  const influences = db.prepare("SELECT category, name FROM entry_influences WHERE entry_id = ?").all(id) as any[];
  const connections = db.prepare("SELECT target_id, relationship_type, notes FROM entry_connections WHERE source_id = ?").all(id) as any[];
  const oracle = db.prepare("SELECT * FROM oracle_records WHERE entry_id = ?").get(id) as any;

  let parsedOracleData: any = undefined;
  if (oracle) {
    parsedOracleData = {
      system: oracle.system,
      spread_name: oracle.spread_name,
      query: oracle.query,
      cards: JSON.parse(oracle.cards_json || "[]"),
      card_back_style: oracle.card_back_style || "rosa_cruz",
      ai_interpretation: oracle.ai_interpretation || "",
      confirmation_notes: oracle.confirmation_notes,
      querent_name: oracle.querent_name || "",
      querent_birthdate: oracle.querent_birthdate || "",
    };
  }

  return {
    id: row.id,
    type: row.type,
    title: row.title,
    content: row.content,
    date: row.date,
    success_rating: row.success_rating,
    thelemic_date: row.thelemic_date,
    sun_sign: row.sun_sign,
    sun_degree: row.sun_degree,
    moon_sign: row.moon_sign,
    moon_degree: row.moon_degree,
    moon_phase: row.moon_phase,
    moon_illumination: row.moon_illumination,
    planetary_day: row.planetary_day,
    planetary_hour: row.planetary_hour,
    mental_state_before: row.mental_state_before,
    mental_state_after: row.mental_state_after,
    tags: JSON.parse(row.tags_json || "[]"),
    influences,
    connections,
    oracle_data: parsedOracleData,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function saveEntry(entry: MagickEntry, customDb?: DatabaseSync): MagickEntry {
  const db = customDb || getDatabase();
  const now = new Date().toISOString();
  const entryId = entry.id || `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  db.prepare(`
    INSERT INTO entries (
      id, type, title, content, date, success_rating,
      thelemic_date, sun_sign, sun_degree, moon_sign, moon_degree,
      moon_phase, moon_illumination, planetary_day, planetary_hour,
      mental_state_before, mental_state_after, tags_json, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
    ON CONFLICT(id) DO UPDATE SET
      type = excluded.type,
      title = excluded.title,
      content = excluded.content,
      date = excluded.date,
      success_rating = excluded.success_rating,
      thelemic_date = excluded.thelemic_date,
      sun_sign = excluded.sun_sign,
      sun_degree = excluded.sun_degree,
      moon_sign = excluded.moon_sign,
      moon_degree = excluded.moon_degree,
      moon_phase = excluded.moon_phase,
      moon_illumination = excluded.moon_illumination,
      planetary_day = excluded.planetary_day,
      planetary_hour = excluded.planetary_hour,
      mental_state_before = excluded.mental_state_before,
      mental_state_after = excluded.mental_state_after,
      tags_json = excluded.tags_json,
      updated_at = excluded.updated_at
  `).run(
    entryId,
    entry.type,
    entry.title,
    entry.content,
    entry.date || now,
    (entry.success_rating !== undefined && entry.success_rating !== null) ? entry.success_rating : null,
    entry.thelemic_date || "",
    entry.sun_sign || "",
    entry.sun_degree || 0,
    entry.moon_sign || "",
    entry.moon_degree || 0,
    entry.moon_phase || "",
    entry.moon_illumination || 0,
    entry.planetary_day || "",
    entry.planetary_hour || "",
    entry.mental_state_before || "",
    entry.mental_state_after || "",
    JSON.stringify(entry.tags || []),
    entry.created_at || now,
    now
  );

  // Update Influences
  db.prepare("DELETE FROM entry_influences WHERE entry_id = ?").run(entryId);
  if (entry.influences && entry.influences.length > 0) {
    const insertInfluence = db.prepare("INSERT INTO entry_influences (entry_id, category, name) VALUES (?, ?, ?)");
    for (const inf of entry.influences) {
      if (inf.name && inf.name.trim()) {
        insertInfluence.run(entryId, inf.category, inf.name.trim());
      }
    }
  }

  // Update Connections
  if (entry.connections) {
    db.prepare("DELETE FROM entry_connections WHERE source_id = ?").run(entryId);
    const insertConn = db.prepare("INSERT INTO entry_connections (source_id, target_id, relationship_type, notes) VALUES (?, ?, ?, ?)");
    for (const conn of entry.connections) {
      if (conn.target_id && conn.target_id !== entryId) {
        insertConn.run(entryId, conn.target_id, conn.relationship_type, conn.notes || "");
      }
    }
  }

  // Update Oracle Record
  if (entry.oracle_data) {
    db.prepare("DELETE FROM oracle_records WHERE entry_id = ?").run(entryId);
    db.prepare(`
      INSERT INTO oracle_records (entry_id, system, spread_name, query, cards_json, card_back_style, ai_interpretation, confirmation_notes, querent_name, querent_birthdate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      entryId,
      entry.oracle_data.system || "thoth_tarot",
      entry.oracle_data.spread_name || "Tiragem Livre",
      entry.oracle_data.query || "",
      JSON.stringify(entry.oracle_data.cards || []),
      entry.oracle_data.card_back_style || "rosa_cruz",
      entry.oracle_data.ai_interpretation || "",
      entry.oracle_data.confirmation_notes || "",
      entry.oracle_data.querent_name || "",
      entry.oracle_data.querent_birthdate || ""
    );
  }

  return { ...entry, id: entryId };
}

export function deleteEntry(id: string): boolean {
  const db = getDatabase();
  db.prepare("DELETE FROM entry_influences WHERE entry_id = ?").run(id);
  db.prepare("DELETE FROM entry_connections WHERE source_id = ? OR target_id = ?").run(id, id);
  db.prepare("DELETE FROM oracle_records WHERE entry_id = ?").run(id);
  db.prepare("DELETE FROM entries WHERE id = ?").run(id);
  return true;
}

export function createConnection(conn: { source_id: string; target_id: string; relationship_type: string; notes?: string }, customDb?: DatabaseSync) {
  const db = customDb || getDatabase();
  db.prepare(`
    INSERT INTO entry_connections (source_id, target_id, relationship_type, notes)
    VALUES (?, ?, ?, ?)
  `).run(conn.source_id, conn.target_id, conn.relationship_type, conn.notes || "");
}

export function getGraphNetworkData() {
  const db = getDatabase();
  const entries = db.prepare("SELECT id, type, title, success_rating, moon_phase, sun_sign, date FROM entries").all() as any[];
  const connections = db.prepare("SELECT source_id, target_id, relationship_type, notes FROM entry_connections").all() as any[];
  const influences = db.prepare("SELECT entry_id, category, name FROM entry_influences").all() as any[];

  // Collect distinct prominent entities/influences as orbital nodes
  const influenceNodesMap = new Map<string, { id: string; name: string; category: string; count: number }>();
  for (const inf of influences) {
    const key = `inf-${inf.category}-${inf.name}`;
    if (!influenceNodesMap.has(key)) {
      influenceNodesMap.set(key, { id: key, name: inf.name, category: inf.category, count: 1 });
    } else {
      influenceNodesMap.get(key)!.count++;
    }
  }

  const nodes = [
    ...entries.map((e) => ({
      id: e.id,
      label: e.title,
      type: e.type,
      isEntry: true,
      success_rating: e.success_rating,
      date: e.date,
      moon_phase: e.moon_phase,
      sun_sign: e.sun_sign,
    })),
    ...Array.from(influenceNodesMap.values()).map((inf) => ({
      id: inf.id,
      label: inf.name,
      type: `influence_${inf.category}`,
      isEntry: false,
      count: inf.count,
    })),
  ];

  const edges = [
    ...connections.map((c) => ({
      source: c.source_id,
      target: c.target_id,
      label: c.relationship_type,
      notes: c.notes,
      type: "entry_connection",
    })),
    ...influences.map((inf) => ({
      source: inf.entry_id,
      target: `inf-${inf.category}-${inf.name}`,
      label: inf.category,
      type: "influence_link",
    })),
  ];

  return { nodes, edges };
}

export function getAppSetting(key: string): string | null {
  const db = getDatabase();
  const row = db.prepare("SELECT value FROM app_settings WHERE key = ?").get(key) as any;
  return row ? row.value : null;
}

export function setAppSetting(key: string, value: string): void {
  const db = getDatabase();
  db.prepare("INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, value);
}

export function getAllTodos() {
  const db = getDatabase();
  // Check if initial todos are needed
  const countRow = db.prepare("SELECT COUNT(*) as count FROM todos").get() as { count: number };
  if (countRow.count === 0) {
    const initialTodos = [
      "Executar Liber Resh vel Helios (Adoração Solar)",
      "Anotar e analisar sonhos lúcidos da noite",
      "Ritual Menor do Pentagrama (LBR / Banimento)",
      "Meditação Dharana e reflexão da Verdadeira Vontade",
    ];
    for (let i = 0; i < initialTodos.length; i++) {
      const id = `todo_seed_${i + 1}`;
      const created_at = new Date(Date.now() - (initialTodos.length - i) * 60000).toISOString();
      db.prepare("INSERT INTO todos (id, text, completed, created_at) VALUES (?, ?, 0, ?)").run(id, initialTodos[i], created_at);
    }
  }

  const rows = db.prepare("SELECT id, text, completed, created_at FROM todos ORDER BY completed ASC, created_at DESC").all() as any[];
  return rows.map((r) => ({
    id: r.id,
    text: r.text,
    completed: Boolean(r.completed),
    created_at: r.created_at,
  }));
}

export function createTodo(text: string) {
  const db = getDatabase();
  const id = `todo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const created_at = new Date().toISOString();
  db.prepare("INSERT INTO todos (id, text, completed, created_at) VALUES (?, ?, 0, ?)").run(id, text.trim(), created_at);
  return { id, text: text.trim(), completed: false, created_at };
}

export function updateTodo(id: string, completed: boolean) {
  const db = getDatabase();
  db.prepare("UPDATE todos SET completed = ? WHERE id = ?").run(completed ? 1 : 0, id);
}

export function deleteTodo(id: string) {
  const db = getDatabase();
  db.prepare("DELETE FROM todos WHERE id = ?").run(id);
}
