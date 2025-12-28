# Railway PostgreSQL Connection Fix

## Problem
Railway PostgreSQL connections require SSL and use internal DNS names like `postgres.railway.internal`

## Solution

### Step 1: Verify DATABASE_URL Format
Your Railway PostgreSQL plugin should provide a `DATABASE_URL` that looks like:
```
postgresql://postgres:YOUR_PASSWORD@postgres.railway.internal:5432/railway
```

### Step 2: Set Correct Environment Variables in Railway Dashboard

In your Railway app service, set these variables:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@postgres.railway.internal:5432/railway
SESSION_SECRET=your-secure-random-key
NODE_ENV=production
PGSSLMODE=require
```

**Important:** The connection string from Railway already has the correct format. Just copy-paste it directly.

### Step 3: Ensure PostgreSQL Service is Running

1. Go to Railway Dashboard
2. Click on your project
3. Verify that both services are present:
   - ✓ PostgreSQL database (with green "Running" status)
   - ✓ Your app service (should be building/deploying)

### Step 4: Verify Service Linking

If the database still isn't connecting:

1. In Railway Dashboard, go to your app service
2. Click "Variables" 
3. Look for `DATABASE_URL` - if it's not there automatically, Railway may not have linked the services
4. Manually add it if needed, or:
   - Delete the app service
   - Redeploy from your GitHub repo
   - Railway should auto-detect and link the PostgreSQL service

### Step 5: Check Logs for Connection Status

In Railway Dashboard:
- View "Logs" for your app service
- Look for messages like:
  - ✓ "Database connection established successfully" - **Good!**
  - ✗ "ENOTFOUND postgres.railway.internal" - DNS issue, service not linked
  - ✗ "Connection refused" - PostgreSQL service not running
  - ✗ "SSL Error" - Usually resolves on retry

### If Still Not Working

1. **Force redeploy:**
   - In Railway, go to your app service
   - Click "Deploy" → "Redeploy"
   - Wait 2-3 minutes for full initialization

2. **Check PostgreSQL is accessible:**
   - In Railway, click the PostgreSQL service
   - Verify it shows "Running" status
   - Check if there's a "Connection" or "Public URL" you can test

3. **Enable verbose logging:**
   - Add `DB_SSL_STRICT=false` to allow unverified certificates (Railway uses self-signed certs)
   - This is already handled in the code for railway.internal URLs

## Code Changes Made

The updated `server/db.ts` now:
- Automatically detects Railway internal URLs
- Enables SSL for railway.internal connections
- Retries connection up to 30 times (30 seconds)
- Provides detailed error messages
- Doesn't crash if database takes time to start

## Testing Locally

To test with a similar setup:
```bash
npm run build
export DATABASE_URL="postgresql://localhost:5432/test_db"
export SESSION_SECRET="test-secret"
export NODE_ENV=production
npm start
```

The connection will retry automatically if the database isn't immediately available.
