/**
 * Adds missing columns to the tasks table in Supabase.
 * Run: node scripts/migrate-tasks.js
 */
const { Client } = require("pg");

const DATABASE_URL =
  "postgresql://postgres.zggnnptxudksjidlnsha:L2oaSYtiK3dO8ZbW@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres";

const MIGRATION_SQL = `
-- Safely add every column the tasks table might be missing
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS due_time   TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS subject    TEXT NOT NULL DEFAULT 'Other';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS priority   TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS status     TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
`;

const VERIFY_SQL = `
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'tasks'
ORDER BY ordinal_position;
`;

async function main() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    console.log("🔌 Connecting to Supabase...");
    await client.connect();
    console.log("✅ Connected!\n");

    console.log("🔧 Running migration...");
    await client.query(MIGRATION_SQL);
    console.log("✅ Columns added (or already existed)!\n");

    console.log("📋 Current tasks table columns:");
    const result = await client.query(VERIFY_SQL);
    console.table(result.rows);

    console.log("\n🎉 Done! Refresh your app and try adding a task again.");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
