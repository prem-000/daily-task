const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Checking and adding missing columns to tasks table...');
  
  const columnsToAdd = [
    { name: 'description', type: 'text' },
    { name: 'due_time', type: 'time' },
    { name: 'repeat', type: 'text DEFAULT \'none\'' },
    { name: 'note', type: 'text' },
    { name: 'updated_at', type: 'timestamptz DEFAULT now()' }
  ];

  for (const col of columnsToAdd) {
    try {
      console.log(`Checking column: ${col.name}`);
      const checkResult = await prisma.$queryRawUnsafe(`
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tasks' 
        AND column_name = '${col.name}'
        AND table_schema = 'public';
      `);

      if (checkResult.length === 0) {
        console.log(`Column ${col.name} does not exist. Adding...`);
        await prisma.$executeRawUnsafe(`
          ALTER TABLE public.tasks ADD COLUMN ${col.name} ${col.type};
        `);
        console.log(`Column ${col.name} added successfully.`);
      } else {
        console.log(`Column ${col.name} already exists.`);
      }
    } catch (e) {
      console.error(`Error processing column ${col.name}:`, e.message);
    }
  }

  // Also reload postgrest schema cache just in case
  try {
    console.log('Notifying PostgREST to reload schema cache...');
    await prisma.$executeRawUnsafe("NOTIFY pgrst, 'reload schema';");
    console.log('Reload notification sent successfully.');
  } catch (e) {
    console.warn('Could not reload schema cache automatically:', e.message);
  }

  console.log('Finished checking missing columns.');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
