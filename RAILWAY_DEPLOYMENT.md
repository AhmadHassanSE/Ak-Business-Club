# Railway Deployment Guide

## Prerequisites
- Railway account at https://railway.app
- Git repository with this code pushed

## Deployment Steps

### 1. Create PostgreSQL Database on Railway
- Go to Railway Dashboard
- Click "+ New"
- Select "Database" → "PostgreSQL"
- Railway will automatically create and provision a PostgreSQL instance
- Copy the `DATABASE_URL` from the PostgreSQL plugin settings

### 2. Create Application Service
- In Railway Dashboard, click "+ New"
- Select "GitHub Repo" (or upload your repository)
- Connect your GitHub account and select this repository
- Railway will auto-detect it's a Node.js app

### 3. Configure Environment Variables
In Railway Dashboard for your app service, set these variables:

```
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
SESSION_SECRET=your-secure-random-string-here
NODE_ENV=production
```

The `DATABASE_URL` will be auto-generated from the PostgreSQL plugin.

For `SESSION_SECRET`, generate a random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Set Start Command (Optional)
In Railway deployment settings, set the start command to:
```
npm run start:prod
```

Or just use the default which will run the `start` script.

### 5. Deploy
- Push your code to GitHub
- Railway will automatically detect changes and deploy
- Monitor deployment in Railway dashboard
- Check logs to ensure database migrations run

## Database Schema
On first deployment, the schema will be created automatically when the app connects to PostgreSQL. If needed, you can manually run:

```bash
npm run db:push
```

## Environment Setup
The app uses these environment variables:
- `DATABASE_URL` - PostgreSQL connection string (required)
- `SESSION_SECRET` - Session encryption key (required for production)
- `NODE_ENV` - Should be `production` on Railway

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format is correct
- Check PostgreSQL service is running and healthy in Railway
- View app logs in Railway Dashboard for connection errors

### Build Failures
- Ensure all dependencies are in `package.json`
- Check that build script runs successfully locally
- View build logs in Railway Dashboard

### API Returning 503
- Usually means database is not connected
- Check `DATABASE_URL` environment variable
- Verify PostgreSQL service status
