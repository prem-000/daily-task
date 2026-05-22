const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tables = ['user_settings', 'push_subscriptions', 'chat_messages', 'tasks', 'notification_log'];
  
  for (const table of tables) {
    console.log(`\n================ STRUCTURE FOR ${table} ================`);
    const cols = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = '${table}' AND table_schema = 'public';
    `);
    console.log('Columns:');
    console.dir(cols);

    const indexes = await prisma.$queryRawUnsafe(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = '${table}' AND schemaname = 'public';
    `);
    console.log('Indexes:');
    console.dir(indexes);

    const constraints = await prisma.$queryRawUnsafe(`
      SELECT conname, contype, pg_get_constraintdef(oid) as condef
      FROM pg_constraint
      WHERE conrelid = 'public.${table}'::regclass;
    `);
    console.log('Constraints:');
    console.dir(constraints);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
