@echo off
echo ========================================
echo   StudyFlow Database Setup
echo ========================================
echo.
echo This script will:
echo 1. Delete old Prisma client
echo 2. Generate new Prisma client
echo 3. Create database tables
echo 4. Open Prisma Studio for verification
echo.
echo IMPORTANT: Make sure you've stopped your dev server first!
echo Press Ctrl+C now if you need to stop it.
echo.
pause

echo.
echo Step 1: Cleaning up old Prisma client...
if exist "node_modules\.prisma" (
    rmdir /s /q "node_modules\.prisma"
    echo Done!
) else (
    echo No old client found, skipping...
)

echo.
echo Step 2: Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to generate Prisma Client
    echo.
    echo Try these solutions:
    echo 1. Close VS Code completely
    echo 2. Stop all Node processes
    echo 3. Run this script as Administrator
    echo 4. Restart your computer
    echo.
    pause
    exit /b 1
)

echo.
echo Step 3: Creating database tables...
call npx prisma db push
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to create database tables
    echo.
    echo Check:
    echo 1. DATABASE_URL is correct in .env.local
    echo 2. You have internet connection
    echo 3. Database password is correct
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Opening Prisma Studio to verify tables...
echo You should see: users, tasks, chat_messages
echo.
echo Press Ctrl+C in this window to close Prisma Studio when done.
echo.
pause

call npx prisma studio

echo.
echo Next steps:
echo 1. Start your dev server: npm run dev
echo 2. Test registration: http://localhost:3000/register
echo 3. Test chat: http://localhost:3000/chat
echo.
pause
