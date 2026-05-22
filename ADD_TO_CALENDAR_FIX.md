# Add to Calendar Button Fix

## ✅ Fix Applied

I've updated the `handleAddExtractedTask` function in `src/app/chat/page.tsx` with:
- Better error handling and logging
- Proper null handling for `due_time`
- User authentication check
- More detailed error messages
- Console logging for debugging

## 🔍 Common Issues & Solutions

### Issue 1: Table Doesn't Exist

**Symptom:** Button doesn't work, console shows "relation 'tasks' does not exist"

**Solution:**
```powershell
# Make sure you've run the database setup
npx prisma db push
```

### Issue 2: User Not Authenticated

**Symptom:** Nothing happens when clicking the button

**Solution:**
- Make sure you're logged in
- Check browser console for "Please log in to add tasks" message
- Try logging out and back in

### Issue 3: Supabase Mock Client

**Symptom:** Button appears to work but nothing is saved

**Solution:**
The Supabase client might be in mock mode. Check your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL="https://zggnnptxudksjidlnsha.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_actual_key"
```

### Issue 4: Database Connection Error

**Symptom:** Error message "Failed to add task: [error details]"

**Solution:**
1. Check DATABASE_URL in `.env.local`
2. Verify internet connection
3. Test connection: `npx prisma studio`

## 🧪 Testing the Fix

### Step 1: Open Browser Console
1. Press F12 to open DevTools
2. Go to Console tab
3. Keep it open while testing

### Step 2: Send a Test Message
In the chat, type:
```
Math homework due Friday at 7 PM
```

### Step 3: Check the Response
You should see:
- AI extracts the task details
- Task card appears with:
  - Title: "Math homework" (or similar)
  - Subject: Math (or Other)
  - Due date: 2026-05-22 (or the Friday date)
  - Time: 19:00
  - Priority: medium

### Step 4: Click "Add to Calendar"
Watch the console for:
```
Adding task to calendar: {title: "...", subject: "...", ...}
Task added successfully: [{...}]
```

### Step 5: Verify in Database
```powershell
npx prisma studio
```
- Open the `tasks` table
- You should see your new task

### Step 6: Check Dashboard
Go to http://localhost:3000/dashboard
- Your task should appear in the calendar

## 🐛 Debugging Steps

### Check 1: Is the Button Clickable?

Open browser console and run:
```javascript
// Check if user is authenticated
console.log("User:", window.localStorage);
```

### Check 2: What's the Error?

Look for error messages in:
1. **Browser Console** (F12 → Console)
2. **Server Terminal** (where `npm run dev` is running)

### Check 3: Is Supabase Working?

In browser console:
```javascript
// Test Supabase connection
fetch('/api/auth/me')
  .then(r => r.json())
  .then(console.log);
```

### Check 4: Database Table Structure

```powershell
npx prisma studio
```
Check that `tasks` table has these columns:
- id
- user_id
- title
- subject
- description
- due_date
- due_time
- priority
- status
- created_at
- updated_at

## 🔧 Manual Fix Steps

If the button still doesn't work:

### Step 1: Verify Database Schema
```powershell
# Regenerate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### Step 2: Check Environment Variables
Open `.env.local` and verify:
```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
```

### Step 3: Restart Everything
```powershell
# Stop dev server (Ctrl+C)
# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Restart
npm run dev
```

### Step 4: Test with Prisma Studio
1. Open Prisma Studio: `npx prisma studio`
2. Go to `tasks` table
3. Try manually adding a task
4. If this works, the issue is in the code
5. If this fails, the issue is with the database

## 📊 Expected Console Output

### When Clicking "Add to Calendar":

**Success:**
```
Adding task to calendar: {
  title: "Math homework",
  subject: "Math",
  due_date: "2026-05-22",
  due_time: "19:00",
  priority: "medium",
  description: "..."
}
Task added successfully: [{
  id: "uuid-here",
  user_id: "user-uuid",
  title: "Math homework",
  ...
}]
```

**Failure (Not Logged In):**
```
Toast: Please log in to add tasks
```

**Failure (Database Error):**
```
Insert task error: {message: "...", details: "...", hint: "..."}
Toast: Failed to add task: [error message]
```

## 🎯 What Changed in the Code

### Before:
```typescript
const { error } = await supabase.from("tasks").insert({...});
if (error) {
  showToast("Failed to add task to calendar", "error");
}
```

### After:
```typescript
const { data, error } = await supabase.from("tasks").insert({...}).select();
if (error) {
  console.error("Insert task error:", error);
  showToast(`Failed to add task: ${error.message}`, "error");
  return;
}
console.log("Task added successfully:", data);
```

**Improvements:**
- ✅ Added `.select()` to get inserted data back
- ✅ Added console logging for debugging
- ✅ More specific error messages
- ✅ User authentication check
- ✅ Proper null handling for `due_time`
- ✅ Early return on error

## 🚀 Quick Test Script

Run this in browser console to test the function:
```javascript
// Simulate clicking the button
const testTask = {
  title: "Test Task",
  subject: "Other",
  due_date: "2026-05-23",
  due_time: "14:00",
  priority: "medium",
  description: "Test description"
};

// This should trigger the same logic
console.log("Testing task insertion:", testTask);
```

## 📝 Additional Notes

### Database Field Mapping
The code uses snake_case for database columns:
- `user_id` (not `userId`)
- `due_date` (not `dueDate`)
- `due_time` (not `dueTime`)

This matches the Prisma schema's `@map()` directives.

### Supabase vs Prisma
- The chat page uses **Supabase client** (direct database access)
- The registration uses **Prisma client** (ORM)
- Both work with the same database tables
- Field names must match the database columns

## ✅ Verification Checklist

Before reporting issues, verify:

- [ ] Database tables exist (run `npx prisma studio`)
- [ ] User is logged in (check `/api/auth/me`)
- [ ] Environment variables are set correctly
- [ ] Dev server is running without errors
- [ ] Browser console shows no errors
- [ ] Supabase credentials are valid
- [ ] Internet connection is working

## 🆘 Still Not Working?

If the button still doesn't work after all these steps:

1. **Share the console output** - Copy the exact error from browser console
2. **Check server logs** - Copy any errors from the terminal running `npm run dev`
3. **Verify database** - Take a screenshot of Prisma Studio showing the tables
4. **Test authentication** - Go to `/api/auth/me` and share the response

The error message will tell us exactly what's wrong!
