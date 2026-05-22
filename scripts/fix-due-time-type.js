/**
 * Fix due_time column type from TIME to TEXT so it accepts strings like "7:00 PM"
 */
const { Client } = require("pg");

const DATABASE_URL =
  "postgresql://postgres.zggnnptxudksjidlnsha:L2oaSYtiK3dO8ZbW@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres";

const FIX_SQL = `
-- Change due_time from TIME type to TEXT so it can store "7:00 PM", "14:30", etc.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'tasks'
      AND column_name  = 'due_time'
      AND data_type    = 'time without time zone'
  ) THEN
    ALTER TABLE public.tasks ALTER COLUMN due_time TYPE TEXT USING due_time::TEXT;
    RAISE NOTICE 'Converted due_time from TIME to TEXT';
  ELSE
    RAISE NOTICE 'due_time is already TEXT or does not exist';
  END IF;
END $$;
`;

async function main() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log("🔧 Fixing due_time column type...");
    await client.query(FIX_SQL);
    console.log("✅ due_time column is now TEXT — accepts '7:00 PM', '14:30', etc.");
  } catch (err) {
    console.error("❌ Fix failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
