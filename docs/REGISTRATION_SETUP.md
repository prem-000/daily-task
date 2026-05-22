# Registration Setup Guide

This guide helps you troubleshoot and fix registration errors in StudyFlow.

## Common Registration Errors

### "An unexpected error occurred during registration"

This generic error can be caused by several issues. Follow the steps below to diagnose and fix:

## Required Environment Variables

Make sure your `.env.local` file contains all required variables:

```env
# Database Configuration (REQUIRED)
DATABASE_URL=postgresql://user:password@localhost:5432/studyflow?schema=public

# JWT Secret (REQUIRED)
JWT_SECRET=your_super_secure_jwt_secret_key_at_least_32_characters_long

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Web Push Notifications (VAPID Keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_MAILTO=mailto:admin@studyflow.app

# Cron Job Secret
CRON_SECRET=your_cron_secret
```

## Setup Steps

### 1. Configure Database

**Option A: Using Supabase (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to Settings > Database
3. Copy the connection string (URI format)
4. Add to `.env.local`:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

**Option B: Local PostgreSQL**

1. Install PostgreSQL locally
2. Create a database:
   ```bash
   createdb studyflow
   ```
3. Add to `.env.local`:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/studyflow
   ```

### 2. Generate JWT Secret

Generate a secure random string for JWT_SECRET:

```bash
# Using OpenSSL (recommended)
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add the generated string to `.env.local`:
```env
JWT_SECRET=your_generated_secret_here
```

### 3. Run Database Migrations

After configuring DATABASE_URL, run Prisma migrations:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Or push schema directly (for development)
npx prisma db push
```

### 4. Verify Prisma Connection

Test your database connection:

```bash
npx prisma studio
```

This should open Prisma Studio in your browser. If it fails, check your DATABASE_URL.

### 5. Restart Development Server

After making environment changes:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

## Troubleshooting Specific Errors

### "Database connection failed"

**Cause:** DATABASE_URL is missing or incorrect

**Fix:**
1. Verify DATABASE_URL in `.env.local`
2. Test connection: `npx prisma db pull`
3. Check database is running (for local PostgreSQL)

### "Database error. Please ensure Prisma is properly configured"

**Cause:** Prisma client not generated or migrations not run

**Fix:**
```bash
npx prisma generate
npx prisma db push
```

### "Authentication configuration error"

**Cause:** JWT_SECRET is missing

**Fix:**
1. Generate a JWT_SECRET (see step 2 above)
2. Add to `.env.local`
3. Restart server

### "Email is already registered" or "Username is already taken"

**Cause:** User already exists in database

**Fix:**
- Use a different email/username
- Or delete the existing user from database:
  ```bash
  npx prisma studio
  # Navigate to User model and delete the record
  ```

### Rate Limit Error

**Cause:** Too many registration attempts

**Fix:**
- Wait 1 hour before trying again
- Or restart the server to clear in-memory rate limit cache

## Testing Registration

1. Open browser console (F12)
2. Navigate to `/register`
3. Fill out the form with valid data:
   - Full Name: At least 2 characters
   - Username: 3-20 characters, alphanumeric + underscore
   - Email: Valid email format
   - Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
4. Check console for detailed error messages

## Development Mode Error Messages

In development mode, the API returns more detailed error messages. Check:

1. Browser console (Network tab)
2. Server terminal output
3. Look for specific error messages that indicate the root cause

## Verification Checklist

- [ ] `.env.local` file exists and contains all required variables
- [ ] DATABASE_URL is correctly formatted
- [ ] JWT_SECRET is set (at least 32 characters)
- [ ] Database is accessible
- [ ] Prisma client is generated (`npx prisma generate`)
- [ ] Database schema is up to date (`npx prisma db push`)
- [ ] Development server is restarted after env changes
- [ ] No TypeScript/build errors in terminal

## Still Having Issues?

1. Check server logs in terminal for detailed error messages
2. Verify all dependencies are installed: `npm install`
3. Clear Next.js cache: `rm -rf .next`
4. Rebuild: `npm run build`
5. Check the TROUBLESHOOTING.md document for more help

## Security Notes

- Never commit `.env.local` to version control
- Use strong, unique values for JWT_SECRET in production
- Use environment-specific database URLs
- Rotate secrets regularly in production
