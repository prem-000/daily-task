/**
 * Fix missing columns in the tasks table.
 * Run: node scripts/fix-tasks-columns.js
 */

const https = require("https");

const SUPABASE_URL = "https://zggnnptxudksjidlnsha.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZ25ucHR4dWRrc2ppZGxuc2hhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM3ODg4NCwiZXhwIjoyMDk0OTU0ODg0fQ.PVuZ75ylQmB3B-1mnJRQGr84boMXVdFA0hAnNeb5sE4";

const PROJECT_REF = "zggnnptxudksjidlnsha";

// SQL statements to run
const SQL = `
-- Add missing columns to tasks table (safe — uses IF NOT EXISTS)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_time   TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subject    TEXT NOT NULL DEFAULT 'Other';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority   TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status     TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Verify result
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;
`;

function post(path, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(SUPABASE_URL + path);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        Prefer: "return=representation",
        ...extraHeaders,
      },
    };

    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log("🔧 Running tasks table migration...\n");

  // Use the Supabase REST SQL endpoint (requires service role)
  const result = await post("/rest/v1/rpc/exec_sql", { sql: SQL });

  if (result.status === 200 || result.status === 201) {
    console.log("✅ Migration successful!\n");
    console.log(JSON.stringify(result.body, null, 2));
    return;
  }

  // exec_sql rpc doesn't exist — use pg directly via fetch workaround
  console.log(
    `exec_sql RPC returned ${result.status}: ${JSON.stringify(result.body)}`
  );
  console.log("\n⚠️  Falling back to manual instructions...\n");
  printManual();
}

function printManual() {
  console.log(
    "════════════════════════════════════════════════════════════════"
  );
  console.log("  MANUAL FIX — run this in the Supabase SQL Editor:");
  console.log(
    "  https://supabase.com/dashboard/project/" +
      PROJECT_REF +
      "/sql/new"
  );
  console.log(
    "════════════════════════════════════════════════════════════════\n"
  );
  console.log(SQL);
  console.log(
    "════════════════════════════════════════════════════════════════"
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  printManual();
});
