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

    CREATE TABLE IF NOT EXISTS review_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      item_type TEXT NOT NULL CHECK(item_type IN ('vocabulary', 'flashcard', 'grammar')),
      item_id TEXT NOT NULL,
      item_label TEXT NOT NULL,
      score INTEGER CHECK(score BETWEEN 1 AND 5),
      reviewed_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS hsk_words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      simplified TEXT NOT NULL,
      traditional TEXT,
      pinyin TEXT NOT NULL,
      english TEXT NOT NULL,
      hsk_level INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_hsk_simplified ON hsk_words(simplified);
    CREATE INDEX IF NOT EXISTS idx_hsk_level ON hsk_words(hsk_level);

    CREATE TABLE IF NOT EXISTS cedict_entries (
      simplified TEXT NOT NULL,
      traditional TEXT NOT NULL,
      pinyin TEXT NOT NULL,
      pinyin_display TEXT NOT NULL,
      english TEXT NOT NULL,
      char_count INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_cedict_simplified ON cedict_entries(simplified);

    CREATE TABLE IF NOT EXISTS gloss_cache (
      entry_id TEXT NOT NULL,
      content_hash TEXT NOT NULL,
      gloss_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (entry_id)
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      stripe_customer_id TEXT NOT NULL,
      stripe_subscription_id TEXT,
      plan TEXT NOT NULL DEFAULT 'free' CHECK(plan IN ('free', 'pro')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete')),
      current_period_end TEXT,
      cancel_at_period_end INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_sub_user ON subscriptions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sub_stripe_customer ON subscriptions(stripe_customer_id);
  `);

  // Migration: add source_entry_id to flashcards
  try {
    db.exec(`ALTER TABLE flashcards ADD COLUMN source_entry_id TEXT`);
  } catch {
    // Column already exists — ignore
  }
}
