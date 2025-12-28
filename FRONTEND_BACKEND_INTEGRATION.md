# Connecting Frontend (Vercel) with Backend (Railway)

## Step 1: Get Your Railway Backend URL

Your Railway backend is deployed at:
```
https://ak-business-club-production.up.railway.app
```

Or check via Railway Dashboard:
1. Go to https://railway.app/dashboard
2. Click on **hospitable-balance** project
3. Click on **Ak-Business-Club** service
4. You'll see "Public Domain" or similar - that's your backend URL

## Step 2: Update Frontend Environment Variables

You need to set the backend API URL in your Vercel frontend.

### For Vite (client-side):

In your frontend's `.env.production`:
```
VITE_API_URL=https://ak-business-club-production.up.railway.app
```

Or in your Vercel project settings:
1. Go to https://vercel.com/dashboard
2. Select your frontend project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://ak-business-club-production.up.railway.app`
   - **Environments:** Select Production, Preview, Development

### Update your frontend code to use this variable:

In your `client/src/lib/queryClient.ts` or API setup:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const [url] = queryKey;
        const res = await fetch(`${API_BASE_URL}${url}`);
        // ...
      },
    },
  },
});
```

## Step 3: Enable CORS on Backend

Your backend needs to allow requests from Vercel domain. Update `server/index.ts`:

```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://your-vercel-domain.vercel.app',
  ],
  credentials: true,
}));
```

Or for development, allow all origins:
```typescript
app.use(cors({
  origin: '*',
  credentials: false,
}));
```

## Step 4: Update API Calls in Frontend

Replace all hardcoded `localhost:5000` calls with the environment variable:

Bad:
```typescript
fetch('http://localhost:5000/api/products')
```

Good:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
fetch(`${API_URL}/api/products`)
```

## Step 5: Deploy Frontend

1. Push your changes to GitHub
2. Vercel will automatically detect and deploy
3. Your frontend will now call the Railway backend

## Step 6: Test the Connection

1. Go to your Vercel frontend URL: `https://your-project.vercel.app`
2. Open browser DevTools → Network tab
3. Check that API calls are going to: `https://ak-business-club-production.up.railway.app/api/*`
4. Verify responses are successful (200 status)

## Full Example Integration

### Frontend `.env` files:

**.env.development:**
```
VITE_API_URL=http://localhost:5000
```

**.env.production:**
```
VITE_API_URL=https://ak-business-club-production.up.railway.app
```

### Frontend API Service:

```typescript
// lib/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = {
  products: {
    list: () => fetch(`${API_URL}/api/products`).then(r => r.json()),
    create: (data) => fetch(`${API_URL}/api/products`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.json()),
  },
  orders: {
    list: () => fetch(`${API_URL}/api/orders`).then(r => r.json()),
    create: (data) => fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important for sessions!
    }).then(r => r.json()),
  },
};
```

## Troubleshooting

### CORS Errors
```
Access to XMLHttpRequest at 'https://...' from origin 'https://...' has been blocked
```

Solution: Make sure backend CORS is configured properly with your Vercel domain.

### 404 Not Found
- Check the backend URL is correct
- Verify Railway backend is running (check logs)
- Test with: `curl https://ak-business-club-production.up.railway.app/api/products`

### 503 Service Unavailable
- Database connection issue on Railway
- Check Railway logs for database errors
- Verify DATABASE_URL is set in Railway

### Timeout/Connection Refused
- Railway app might not be running
- Check Railway deployment status
- Restart the service if needed

## Environment Variable Names

Common names for API URL environment variables:
- `VITE_API_URL` (Vite/React)
- `REACT_APP_API_URL` (Create React App)
- `NEXT_PUBLIC_API_URL` (Next.js)
- `VUE_APP_API_URL` (Vue)
- `SVELTE_APP_API_URL` (Svelte)

Use the one appropriate for your frontend framework!

## Quick Checklist

✓ Railway backend deployed and running
✓ Backend URL identified: `https://ak-business-club-production.up.railway.app`
✓ Environment variable set in Vercel
✓ Frontend code updated to use env variable
✓ CORS configured on backend
✓ Frontend redeployed
✓ Test API calls from frontend working

Done! Your frontend and backend are now connected! 🚀
