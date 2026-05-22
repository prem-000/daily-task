# Database Setup Instructions

## ⚠️ IMPORTANT: You need to complete this setup for registration to work!

Your `.env.local` file has been updated with placeholder values. Follow these steps to get your actual database connection string:

## Step 1: Get Your Supabase Database URL

1. Go to your Supabase project: https://supabase.com/dashboard/project/zggnnptxudksjidlnsha

2. Navigate to **Settings** → **Database**

3. Scroll down to **Connection String** section

4. Copy the **Connection Pooling** URI (recommended for serverless):
   - Select "URI" format
   - Mode: "Transaction"
   - Copy the connection string

5. It should look like:
   ```
   postgresql://postgres.zggnnptxudksjidlnsha:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

6. Replace `[YOUR-PASSWORD]` with your actual database password

7. Update the `DATABASE_URL` in `.env.local` with this value

## Step 2: Run Database Migrations

After updating DATABASE_URL, run these commands:

```bash
# Generate Prisma Client
npx prisma generate

# Push the schema to your database
npx prisma db push
```

## Step 3: Verify Database Connection

Test that everything works:

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

If Prisma Studio opens successfully, your database is connected!

## Step 4: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## Step 5: Test Registration

1. Navigate to http://localhost:3000/register
2. Fill out the registration form
3. Submit and check if it works!

## Alternative: Using Direct Connection (Not Recommended for Production)

If you prefer a direct connection instead of connection pooling:

1. In Supabase Dashboard → Settings → Database
2. Copy the **Direct Connection** string instead
3. It will look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.zggnnptxudksjidlnsha.supabase.com:5432/postgres
   ```

## Troubleshooting

### "Can't reach database server"
- Check your internet connection
- Verify the DATABASE_URL is correct
- Make sure you replaced `[YOUR-PASSWORD]` with your actual password

### "Password authentication failed"
- Your database password is incorrect
- Reset it in Supabase: Settings → Database → Reset Database Password

### "Prisma Client not generated"
- Run: `npx prisma generate`

### Still not working?
- Check `docs/REGISTRATION_SETUP.md` for detailed troubleshooting
- Verify all environment variables are set correctly
- Check the server console for specific error messages

## Security Note

⚠️ **Never commit `.env.local` to Git!** It's already in `.gitignore`, but double-check before pushing code.
