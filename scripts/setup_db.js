const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB setup...');
  
  const sqlCommands = [
    // 1. Create tasks table
    `CREATE TABLE IF NOT EXISTS public.tasks (
      id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      title        text NOT NULL,
      subject      text DEFAULT 'Other',
      description  text,
      due_date     date NOT NULL,
      due_time     time,
      priority     text DEFAULT 'medium',
      status       text DEFAULT 'pending',
      repeat       text DEFAULT 'none',
      tags         text[],
      note         text,
      created_at   timestamptz DEFAULT now(),
      updated_at   timestamptz DEFAULT now()
    );`,

    // 2. Create chat_messages table
    `CREATE TABLE IF NOT EXISTS public.chat_messages (
      id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      role       text NOT NULL,
      content    text NOT NULL,
      task_json  jsonb,
      created_at timestamptz DEFAULT now()
    );`,

    // 3. Create push_subscriptions table
    `CREATE TABLE IF NOT EXISTS public.push_subscriptions (
      id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      endpoint   text NOT NULL UNIQUE,
      p256dh     text NOT NULL,
      auth       text NOT NULL,
      created_at timestamptz DEFAULT now()
    );`,

    // 4. Create notification_log table
    `CREATE TABLE IF NOT EXISTS public.notification_log (
      id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      task_id    uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
      message    text NOT NULL,
      sent_at    timestamptz DEFAULT now(),
      read       boolean DEFAULT false
    );`,

    // 5. Create user_settings table
    `CREATE TABLE IF NOT EXISTS public.user_settings (
      id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id              uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
      reminder_interval    int DEFAULT 60,
      morning_notif        boolean DEFAULT true,
      morning_time         time DEFAULT '07:00',
      theme                text DEFAULT 'dark',
      updated_at           timestamptz DEFAULT now()
    );`,

    // Enable RLS on all tables
    `ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;`,

    // Create RLS Policies for tasks
    `DROP POLICY IF EXISTS tasks_policy ON public.tasks;`,
    `CREATE POLICY tasks_policy ON public.tasks
      FOR ALL USING (true) WITH CHECK (true);`,
 
    // Create RLS Policies for chat_messages
    `DROP POLICY IF EXISTS chat_messages_policy ON public.chat_messages;`,
    `CREATE POLICY chat_messages_policy ON public.chat_messages
      FOR ALL USING (true) WITH CHECK (true);`,
 
    // Create RLS Policies for push_subscriptions
    `DROP POLICY IF EXISTS push_subscriptions_policy ON public.push_subscriptions;`,
    `CREATE POLICY push_subscriptions_policy ON public.push_subscriptions
      FOR ALL USING (true) WITH CHECK (true);`,
 
    // Create RLS Policies for notification_log
    `DROP POLICY IF EXISTS notification_log_policy ON public.notification_log;`,
    `CREATE POLICY notification_log_policy ON public.notification_log
      FOR ALL USING (true) WITH CHECK (true);`,
 
    // Create RLS Policies for user_settings
    `DROP POLICY IF EXISTS user_settings_policy ON public.user_settings;`,
    `CREATE POLICY user_settings_policy ON public.user_settings
      FOR ALL USING (true) WITH CHECK (true);`,

    // Enable Realtime for tasks table by adding it to publication if not exists
    `ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;`
  ];

  for (const cmd of sqlCommands) {
    try {
      console.log(`Executing: ${cmd.substring(0, 80)}...`);
      await prisma.$executeRawUnsafe(cmd);
      console.log('Success.');
    } catch (e) {
      console.error('Error executing query:', e.message);
    }
  }

  console.log('DB setup finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
