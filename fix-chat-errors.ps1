# StudyFlow Chat Error Fix Script
# This script fixes the chat page errors by setting up the database schema

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  StudyFlow Chat Error Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "1. Generate Prisma Client with updated schema" -ForegroundColor White
Write-Host "2. Create missing database tables (tasks, chat_messages)" -ForegroundColor White
Write-Host "3. Verify the database setup" -ForegroundColor White
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Error: .env.local file not found!" -ForegroundColor Red
    Write-Host "Please create .env.local from .env.local.example first" -ForegroundColor Yellow
    exit 1
}

# Check for DATABASE_URL
$envContent = Get-Content ".env.local" -Raw
if ($envContent -notmatch "DATABASE_URL=") {
    Write-Host "❌ DATABASE_URL is missing from .env.local" -ForegroundColor Red
    Write-Host "Please run .\fix-registration.ps1 first to set up the database" -ForegroundColor Yellow
    exit 1
}

# Check if DATABASE_URL has placeholder password
if ($envContent -match "\[YOUR-PASSWORD\]") {
    Write-Host "❌ DATABASE_URL still contains [YOUR-PASSWORD] placeholder" -ForegroundColor Red
    Write-Host "Please update your database password in .env.local" -ForegroundColor Yellow
    Write-Host "Run .\fix-registration.ps1 for detailed instructions" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Environment configuration looks good" -ForegroundColor Green
Write-Host ""

# Check for GEMINI_API_KEY
if ($envContent -notmatch "GEMINI_API_KEY=") {
    Write-Host "⚠️  WARNING: GEMINI_API_KEY is missing" -ForegroundColor Yellow
    Write-Host "The chat feature requires Gemini AI to work" -ForegroundColor Yellow
    Write-Host "Get your API key from: https://makersuite.google.com/app/apikey" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
} else {
    Write-Host "✅ GEMINI_API_KEY found" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 1: Cleaning up old Prisma client..." -ForegroundColor Cyan
if (Test-Path "node_modules\.prisma") {
    try {
        Remove-Item -Recurse -Force "node_modules\.prisma" -ErrorAction Stop
        Write-Host "✅ Cleaned up old Prisma client" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not delete old Prisma client (may be in use)" -ForegroundColor Yellow
        Write-Host "Continuing anyway..." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Step 2: Generating Prisma Client with updated schema..." -ForegroundColor Cyan
Write-Host "(This includes the new tasks and chat_messages tables)" -ForegroundColor Gray
try {
    $output = npx prisma generate 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Prisma Client generated successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
        Write-Host $output -ForegroundColor Red
        Write-Host ""
        Write-Host "Try running this script as Administrator:" -ForegroundColor Yellow
        Write-Host "Right-click PowerShell → Run as Administrator" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Error generating Prisma Client: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Creating database tables..." -ForegroundColor Cyan
Write-Host "(Creating: users, tasks, chat_messages)" -ForegroundColor Gray
try {
    $output = npx prisma db push --accept-data-loss 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database tables created successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create database tables" -ForegroundColor Red
        Write-Host $output -ForegroundColor Red
        Write-Host ""
        Write-Host "Common issues:" -ForegroundColor Yellow
        Write-Host "- DATABASE_URL is incorrect" -ForegroundColor White
        Write-Host "- Database password is wrong" -ForegroundColor White
        Write-Host "- No internet connection" -ForegroundColor White
        Write-Host "- Database is not accessible" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "❌ Error creating database tables: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 4: Verifying database setup..." -ForegroundColor Cyan
Write-Host "Opening Prisma Studio to verify tables..." -ForegroundColor Gray
Write-Host ""
Write-Host "Prisma Studio will open in your browser." -ForegroundColor Yellow
Write-Host "Please verify you see these tables:" -ForegroundColor Yellow
Write-Host "  - users" -ForegroundColor White
Write-Host "  - tasks" -ForegroundColor White
Write-Host "  - chat_messages" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C in this window to close Prisma Studio when done." -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 2

try {
    npx prisma studio
} catch {
    Write-Host "⚠️  Could not open Prisma Studio" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Chat Error Fix Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your development server: npm run dev" -ForegroundColor White
Write-Host "2. Navigate to http://localhost:3000/chat" -ForegroundColor White
Write-Host "3. Test sending a message like: 'Math homework due Friday'" -ForegroundColor White
Write-Host ""
Write-Host "Note about cookie warning:" -ForegroundColor Yellow
Write-Host "The '__cf_bm' cookie warning is harmless and can be ignored." -ForegroundColor White
Write-Host "It's a Cloudflare security feature from Supabase." -ForegroundColor White
Write-Host ""
Write-Host "If you still have issues, check:" -ForegroundColor Yellow
Write-Host "- CHAT_ERROR_FIX.md (detailed troubleshooting)" -ForegroundColor White
Write-Host "- Browser console for specific errors" -ForegroundColor White
Write-Host "- Server terminal for API errors" -ForegroundColor White
Write-Host ""
