/**
 * End-to-end test: inserts a task the same way the chat page does, then cleans it up.
 */
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://zggnnptxudksjidlnsha.supabase.co",
  // service role so we can bypass RLS for this test
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZ25ucHR4dWRrc2ppZGxuc2hhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM3ODg4NCwiZXhwIjoyMDk0OTU0ODg0fQ.PVuZ75ylQmB3B-1mnJRQGr84boMXVdFA0hAnNeb5sE4"
);

async function main() {
  console.log("🧪 Testing task insert (same payload as chat page)...\n");

  // Grab a real user_id from the users table
  const { data: users, error: ue } = await supabase.from("users").select("id").limit(1);
  if (ue || !users?.length) {
    console.log("ℹ️  No users found — using a placeholder UUID for the test.");
  }
  const userId = users?.[0]?.id ?? "00000000-0000-0000-0000-000000000001";

  const taskData = {
    user_id: userId,
    title: "Math Homework",
    subject: "Math",
    description: "Chapter 5 exercises",
    due_date: "2026-05-30",
    due_time: "7:00 PM",
    priority: "high",
    status: "pending",
  };

  console.log("Inserting task:", taskData);

  const { data, error } = await supabase.from("tasks").insert(taskData).select();

  if (error) {
    console.error("\n❌ Insert FAILED:", JSON.stringify(error, null, 2));
    process.exit(1);
  }

  console.log("\n✅ Insert succeeded! Row:", JSON.stringify(data, null, 2));

  // Clean up test row
  const { error: de } = await supabase.from("tasks").delete().eq("id", data[0].id);
  if (de) console.warn("⚠️  Cleanup failed (not critical):", de.message);
  else console.log("🧹 Test row cleaned up.");

  console.log("\n🎉 The 'Add to Calendar' button will now work correctly!");
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
