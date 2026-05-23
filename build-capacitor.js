const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const files = [
  'src/app/auth/callback/route.ts',
  'src/app/api/push/subscribe/route.ts',
  'src/app/api/push/send/route.ts',
  'src/app/api/parse-task/route.ts',
  'src/app/api/chat/route.ts',
  'src/app/api/cron/morning-digest/route.ts',
  'src/app/api/cron/repeat-reminders/route.ts',
  'src/app/api/cron/missed-tasks/route.ts',
  'src/app/api/auth/register/route.ts',
  'src/app/api/auth/profile/route.ts',
  'src/app/api/auth/logout/route.ts',
  'src/app/api/auth/login/route.ts',
  'src/app/api/auth/me/route.ts'
];

const absoluteFiles = files.map(f => path.join(__dirname, f));
const modifiedFiles = [];

try {
  // 1. Temporarily replace force-dynamic with force-static
  absoluteFiles.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      if (content.includes('export const dynamic = "force-dynamic";')) {
        content = content.replace('export const dynamic = "force-dynamic";', 'export const dynamic = "force-static";');
        fs.writeFileSync(file, content, 'utf8');
        modifiedFiles.push(file);
        console.log(`Temporarily set ${path.basename(file)} to force-static`);
      }
    }
  });

  // 2. Run Next.js static build
  console.log('Starting Next.js static build...');
  execSync('npx cross-env CAPACITOR_BUILD=true next build', { stdio: 'inherit' });
  console.log('Static build succeeded!');

} catch (error) {
  console.error('Build failed or was interrupted:', error);
  process.exitCode = 1;
} finally {
  // 3. Always restore force-dynamic in finally block
  modifiedFiles.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      if (content.includes('export const dynamic = "force-static";')) {
        content = content.replace('export const dynamic = "force-static";', 'export const dynamic = "force-dynamic";');
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Restored ${path.basename(file)} to force-dynamic`);
      }
    } catch (restoreError) {
      console.error(`Failed to restore ${path.basename(file)}:`, restoreError);
    }
  });
}
