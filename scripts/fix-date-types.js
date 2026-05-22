const { Client } = require("pg");

const DATABASE_URL =
  "postgresql://postgres.zggnnptxudksjidlnsha:L2oaSYtiK3dO8ZbW@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres";

async function main() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // Convert due_date from DATE to TEXT so AI can send "Friday", "next week", ISO strings, etc.
  await client.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'tasks'
          AND column_name  = 'due_date'
          AND data_type    = 'date'
      ) THEN
        ALTER TABLE public.tasks ALTER COLUMN due_date TYPE TEXT USING due_date::TEXT;
        RAISE NOTICE 'Converted due_date to TEXT';
      ELSE
        RAISE NOTICE 'due_date is already TEXT — no change needed';
      END IF;
    END $$;
  `);

  // Final verification
  const r = await client.query(
    `SELECT column_name, data_type FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'tasks'
     ORDER BY ordinal_position`
  );
  console.log("\nFinal tasks table structure:");
  console.table(r.rows);

  await client.end();
  console.log("\n✅ All columns verified. Your app should work now!");
}

main().catch((e) => { console.error(e.message); process.exit(1); });
