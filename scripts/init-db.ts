import { ensureAppSchema, getPool } from "../src/lib/db";

async function main() {
  await ensureAppSchema();
  const pool = getPool();
  const result = await pool.query("SELECT current_database() AS name");
  console.log(`Initialized HanziBit schema in Postgres database: ${result.rows[0]?.name}`);
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
