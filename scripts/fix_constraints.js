const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('Starting type migration and constraint corrections with robust retry...');

  const commands = [
    // 1. Drop existing incorrect foreign key constraints
    `ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;`,
    `ALTER TABLE public.push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_user_id_fkey;`,
    `ALTER TABLE public.notification_log DROP CONSTRAINT IF EXISTS notification_log_user_id_fkey;`,
    `ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey;`,
    `ALTER TABLE public.user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;`,

    // 2. Drop any legacy policies referencing user_id column to prevent type-alter blocking
    `DROP POLICY IF EXISTS "Users manage own tasks" ON public.tasks;`,
    `DROP POLICY IF EXISTS "tasks_policy" ON public.tasks;`,
    `DROP POLICY IF EXISTS "Users manage own subscriptions" ON public.push_subscriptions;`,
    `DROP POLICY IF EXISTS "push_subscriptions_policy" ON public.push_subscriptions;`,
    `DROP POLICY IF EXISTS "Users delete or update own notifications" ON public.notification_log;`,
    `DROP POLICY IF EXISTS "Users view own notifications" ON public.notification_log;`,
    `DROP POLICY IF EXISTS "notification_log_policy" ON public.notification_log;`,
    `DROP POLICY IF EXISTS "chat_messages_policy" ON public.chat_messages;`,
    `DROP POLICY IF EXISTS "user_settings_policy" ON public.user_settings;`,

    // 3. Convert user_id columns from UUID to TEXT to match public.users.id
    `ALTER TABLE public.tasks ALTER COLUMN user_id TYPE text USING user_id::text;`,
    `ALTER TABLE public.push_subscriptions ALTER COLUMN user_id TYPE text USING user_id::text;`,
    `ALTER TABLE public.notification_log ALTER COLUMN user_id TYPE text USING user_id::text;`,
    `ALTER TABLE public.chat_messages ALTER COLUMN user_id TYPE text USING user_id::text;`,
    `ALTER TABLE public.user_settings ALTER COLUMN user_id TYPE text USING user_id::text;`,

    // 4. Add correct foreign key constraints pointing to public.users(id)
    `ALTER TABLE public.tasks ADD CONSTRAINT tasks_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;`,
      
    `ALTER TABLE public.push_subscriptions ADD CONSTRAINT push_subscriptions_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;`,
      
    `ALTER TABLE public.notification_log ADD CONSTRAINT notification_log_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;`,
      
    `ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;`,
      
    `ALTER TABLE public.user_settings ADD CONSTRAINT user_settings_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;`,

    // 5. Configure public.users table RLS & policies
    `ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;`,
    `DROP POLICY IF EXISTS users_policy ON public.users;`,
    `CREATE POLICY users_policy ON public.users FOR ALL USING (true) WITH CHECK (true);`,

    // 6. Restore open RLS policies on custom tables
    `CREATE POLICY tasks_policy ON public.tasks FOR ALL USING (true) WITH CHECK (true);`,
    `CREATE POLICY chat_messages_policy ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);`,
    `CREATE POLICY push_subscriptions_policy ON public.push_subscriptions FOR ALL USING (true) WITH CHECK (true);`,
    `CREATE POLICY notification_log_policy ON public.notification_log FOR ALL USING (true) WITH CHECK (true);`,
    `CREATE POLICY user_settings_policy ON public.user_settings FOR ALL USING (true) WITH CHECK (true);`
  ];

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    let success = false;
    let retries = 10;
    
    while (!success && retries > 0) {
      const prisma = new PrismaClient();
      try {
        console.log(`Executing query (${11 - retries}/10):\n${cmd.trim()}\n`);
        await prisma.$executeRawUnsafe(cmd);
        console.log('Success.');
        success = true;
      } catch (e) {
        retries--;
        console.warn(`Attempt failed. Remaining retries: ${retries}. Error: ${e.message}`);
        if (retries === 0) {
          console.error(`Fatal error: Query failed after all retries.`);
          process.exit(1);
        }
        console.log('Waiting 3 seconds before next retry...');
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } finally {
        await prisma.$disconnect();
      }
    }
  }

  console.log('Constraint and policy corrections finished successfully.');
}

main();
