/**
 * Download CC-CEDICT and import into SQLite.
 *
 * Usage: pnpm import-cedict
 */

import Database from "better-sqlite3";
import path from "path";
import { createReadStream, createWriteStream, existsSync } from "fs";
import { createGunzip } from "zlib";
import { pipeline } from "stream/promises";
import { readFile } from "fs/promises";
import { Readable } from "stream";
import { convertTones } from "../src/lib/parse-tokens";

const DB_PATH = path.join(process.cwd(), "sqlite.db");
const CEDICT_URL =
  "https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz";
const CEDICT_GZ = path.join(process.cwd(), "cedict.txt.gz");
const CEDICT_TXT = path.join(process.cwd(), "cedict.txt");

async function download() {
  if (existsSync(CEDICT_TXT)) {
    console.log("cedict.txt already exists, skipping download.");
    return;
  }

  console.log("Downloading CC-CEDICT...");
  const res = await fetch(CEDICT_URL);
  if (!res.ok || !res.body) throw new Error(`Download failed: ${res.status}`);

  // Save gzipped file
  await pipeline(
    Readable.fromWeb(res.body as import("stream/web").ReadableStream),
    createWriteStream(CEDICT_GZ)
  );

  // Decompress
  console.log("Decompressing...");
  await pipeline(
    createReadStream(CEDICT_GZ),
    createGunzip(),
    createWriteStream(CEDICT_TXT)
  );
  console.log("Downloaded and decompressed cedict.txt");
}

interface CedictEntry {
  simplified: string;
  traditional: string;
  pinyin: string;
  pinyin_display: string;
  english: string;
  char_count: number;
}

function parseLine(line: string): CedictEntry | null {
  // Format: traditional simplified [pinyin] /english1/english2/
  if (line.startsWith("#") || !line.trim()) return null;

  const match = line.match(/^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\/\s*$/);
  if (!match) return null;

  const [, traditional, simplified, pinyin, english] = match;
  const pinyinDisplay = convertTones(pinyin.toLowerCase());

  return {
    simplified,
    traditional,
    pinyin: pinyin.toLowerCase(),
    pinyin_display: pinyinDisplay,
    english: english.replace(/\//g, "; "),
    char_count: simplified.length,
  };
}

async function importToDb() {
  const content = await readFile(CEDICT_TXT, "utf-8");
  const lines = content.split("\n");

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Create table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS cedict_entries (
      simplified TEXT NOT NULL,
      traditional TEXT NOT NULL,
      pinyin TEXT NOT NULL,
      pinyin_display TEXT NOT NULL,
      english TEXT NOT NULL,
      char_count INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_cedict_simplified ON cedict_entries(simplified);
  `);

  // Clear existing data
  db.exec("DELETE FROM cedict_entries");

  const insert = db.prepare(
    `INSERT INTO cedict_entries (simplified, traditional, pinyin, pinyin_display, english, char_count)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  const insertMany = db.transaction((entries: CedictEntry[]) => {
    for (const e of entries) {
      insert.run(e.simplified, e.traditional, e.pinyin, e.pinyin_display, e.english, e.char_count);
    }
  });

  const entries: CedictEntry[] = [];
  for (const line of lines) {
    const entry = parseLine(line);
    if (entry) entries.push(entry);
  }

  console.log(`Parsed ${entries.length} entries, inserting into SQLite...`);
  insertMany(entries);
  console.log(`Done! Imported ${entries.length} CC-CEDICT entries.`);

  db.close();
}

async function main() {
  await download();
  await importToDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
