# StudyFlow Registration Fix Script
# This script helps set up the database and fix registration issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  StudyFlow Registration Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Error: .env.local file not found!" -ForegroundColor Red
    Write-Host "Creating .env.local from .env.local.example..." -ForegroundColor Yellow
    Copy-Item ".env.local.example" ".env.local"
    Write-Host "✅ Created .env.local" -ForegroundColor Green
}

# Check for DATABASE_URL
$envContent = Get-Content ".env.local" -Raw
if ($envContent -notmatch "DATABASE_URL=") {
    Write-Host "❌ DATABASE_URL is missing from .env.local" -ForegroundColor Red
    Write-Host "Please add DATABASE_URL to your .env.local file" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "✅ DATABASE_URL found in .env.local" -ForegroundColor Green
}

# Check for JWT_SECRET
if ($envContent -notmatch "JWT_SECRET=") {
    Write-Host "❌ JWT_SECRET is missing from .env.local" -ForegroundColor Red
    Write-Host "Please add JWT_SECRET to your .env.local file" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "✅ JWT_SECRET found in .env.local" -ForegroundColor Green
}

# Check if DATABASE_URL has placeholder password
if ($envContent -match "\[YOUR-PASSWORD\]") {
    Write-Host "⚠️  WARNING: DATABASE_URL still contains [YOUR-PASSWORD] placeholder" -ForegroundColor Yellow
    Write-Host "You need to replace it with your actual Supabase database password" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To get your password:" -ForegroundColor Cyan
    Write-Host "1. Go to https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "2. Select your project" -ForegroundColor White
    Write-Host "3. Go to Settings → Database" -ForegroundColor White
    Write-Host "4. Copy your database password (or reset it)" -ForegroundColor White
    Write-Host "5. Replace [YOUR-PASSWORD] in .env.local" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Have you updated the password? (y/n)"
    if ($continue -ne "y") {
        Write-Host "Please update the password and run this script again." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "Step 1: Cleaning up old Prisma client..." -ForegroundColor Cyan
if (Test-Path "node_modules\.prisma") {
    Remove-Item -Recurse -Force "node_modules\.prisma" -ErrorAction SilentlyContinue
    Write-Host "✅ Cleaned up old Prisma client" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Generating Prisma Client..." -ForegroundColor Cyan
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
Write-Host "Step 3: Pushing database schema..." -ForegroundColor Cyan
try {
    $output = npx prisma db push 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database schema pushed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to push database schema" -ForegroundColor Red
        Write-Host $output -ForegroundColor Red
        Write-Host ""
        Write-Host "This usually means:" -ForegroundColor Yellow
        Write-Host "- DATABASE_URL is incorrect" -ForegroundColor Yellow
        Write-Host "- Database password is wrong" -ForegroundColor Yellow
        Write-Host "- No internet connection" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Error pushing database schema: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your development server: npm run dev" -ForegroundColor White
Write-Host "2. Navigate to http://localhost:3000/register" -ForegroundColor White
Write-Host "3. Test registration with valid data" -ForegroundColor White
Write-Host ""
Write-Host "If you still have issues, check:" -ForegroundColor Yellow
Write-Host "- REGISTRATION_FIX_SUMMARY.md" -ForegroundColor White
Write-Host "- docs/REGISTRATION_SETUP.md" -ForegroundColor White
Write-Host ""
