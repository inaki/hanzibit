/**
 * Download CC-CEDICT and import into Postgres.
 *
 * Usage: pnpm import-cedict
 */

import path from "path";
import { createReadStream, createWriteStream, existsSync } from "fs";
import { createGunzip } from "zlib";
import { pipeline } from "stream/promises";
import { readFile } from "fs/promises";
import { Readable } from "stream";
import type { PoolClient } from "pg";
import { convertTones } from "../src/lib/parse-tokens";
import { ensureAppSchema, withTransaction, getPool } from "../src/lib/db";

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

async function insertBatch(client: PoolClient, entries: CedictEntry[]) {
  if (entries.length === 0) return;

  const values: unknown[] = [];
  const placeholders = entries.map((entry, rowIndex) => {
    values.push(
      entry.simplified,
      entry.traditional,
      entry.pinyin,
      entry.pinyin_display,
      entry.english,
      entry.char_count
    );
    const offset = rowIndex * 6;
    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`;
  });

  await client.query(
    `INSERT INTO cedict_entries (
       simplified,
       traditional,
       pinyin,
       pinyin_display,
       english,
       char_count
     ) VALUES ${placeholders.join(", ")}`,
    values
  );
}

async function importToDb() {
  const content = await readFile(CEDICT_TXT, "utf-8");
  const lines = content.split("\n");
  await ensureAppSchema();

  const entries: CedictEntry[] = [];
  for (const line of lines) {
    const entry = parseLine(line);
    if (entry) entries.push(entry);
  }

  console.log(`Parsed ${entries.length} entries, inserting into Postgres...`);
  await withTransaction(async (client) => {
    await client.query("DELETE FROM cedict_entries");

    for (let index = 0; index < entries.length; index += 500) {
      await insertBatch(client, entries.slice(index, index + 500));
    }
  });

  console.log(`Done! Imported ${entries.length} CC-CEDICT entries.`);
  await getPool().end();
}

async function main() {
  await download();
  await importToDb();
}

main().catch((err) => {
  console.error(err);
  getPool().end().catch(() => undefined);
  process.exit(1);
});
