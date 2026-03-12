import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "sqlite.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title_zh TEXT NOT NULL,
      title_en TEXT NOT NULL,
      unit TEXT,
      hsk_level INTEGER DEFAULT 1,
      content_zh TEXT NOT NULL,
      bookmarked INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS entry_annotations (
      id TEXT PRIMARY KEY,
      entry_id TEXT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK(type IN ('grammar_tip', 'mnemonic')),
      title TEXT NOT NULL,
      content TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vocabulary (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      character_zh TEXT NOT NULL,
      pinyin TEXT NOT NULL,
      meaning TEXT NOT NULL,
      hsk_level INTEGER DEFAULT 1,
      category TEXT DEFAULT 'general',
      mastery INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      last_reviewed TEXT
    );

    CREATE TABLE IF NOT EXISTS grammar_points (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      pattern TEXT,
      explanation TEXT NOT NULL,
      examples TEXT NOT NULL DEFAULT '[]',
      hsk_level INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      deck TEXT DEFAULT 'general',
      next_review TEXT DEFAULT (datetime('now')),
      interval_days INTEGER DEFAULT 1,
      ease_factor REAL DEFAULT 2.5,
      review_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      unit TEXT NOT NULL,
      hsk_level INTEGER DEFAULT 1,
      description TEXT,
      content TEXT NOT NULL DEFAULT '',
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS review_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      item_type TEXT NOT NULL CHECK(item_type IN ('vocabulary', 'flashcard', 'grammar')),
      item_id TEXT NOT NULL,
      item_label TEXT NOT NULL,
      score INTEGER CHECK(score BETWEEN 1 AND 5),
      reviewed_at TEXT DEFAULT (datetime('now'))
    );
  `);
}
