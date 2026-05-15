# AI Inventory Management System - Deployment Guide

## 🚀 Complete Cloud Deployment Guide

This guide will help you deploy the AI Inventory Management System to Railway (backend) and Vercel (frontend) with full cloud infrastructure.

## 📋 Prerequisites

1. **Git**: [Download from git-scm.com](https://git-scm.com/)
2. **Node.js**: [Download from nodejs.org](https://nodejs.org/)
3. **Python**: [Download from python.org](https://python.org/)
4. **GitHub Account**: [Create at github.com](https://github.com)

## 📁 Project Structure Check

Ensure you have these files:
- ✅ `railway.toml` - Railway deployment config
- ✅ `vercel.json` - Vercel deployment config
- ✅ `Dockerfile` - Container configuration
- ✅ `.dockerignore` - Docker ignore rules
- ✅ `backend/requirements.txt` - Python dependencies
- ✅ `frontend/package.json` - Node.js dependencies
- ✅ `database/schema.sql` - Database schema

## 🌐 Step 1: Supabase Database Setup

1. Go to [supabase.com](https://supabase.com) and create account
2. Click "New Project" → Free tier → Choose region
3. Wait for project creation (~2 minutes)
4. Go to **SQL Editor** and run the contents of `database/schema.sql`
5. Go to **Settings** → **Database** → Copy the **PostgreSQL URL**
6. **Save this URL** - you'll need it for Railway

## 🔥 Step 2: Firebase Authentication Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com/)
2. Create new project or select existing
3. Enable **Authentication** → **Email/Password** provider
4. Go to **Project Settings** → **General** tab
5. Copy these values:
   - **API Key**
   - **Auth Domain** (project.firebaseapp.com)
   - **Project ID**

## 🤖 Step 3: OpenRouter AI Setup (Optional)

1. Go to [openrouter.ai](https://openrouter.ai/) and sign up
2. Get your **API key** from dashboard
3. Note: Free tier available with DeepSeek model

## 📦 Step 4: GitHub Repository Setup

```bash
# Initialize Git repository
git init
git add .
git commit -m "Initial commit - AI Inventory System"
git branch -M main

# Create GitHub repository and get its URL
# Replace YOUR_USERNAME and YOUR_REPO_NAME with actual values
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## 🚂 Step 5: Railway Backend Deployment

### 5.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub account
3. Connect your GitHub account to Railway

### 5.2 Deploy Backend
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository
4. Railway auto-detects Python and starts deployment

### 5.3 Configure Environment Variables
In Railway dashboard, go to your project → **Variables** tab and add:

```
DATABASE_URL=postgresql://[YOUR_SUPABASE_URL]
OPENROUTER_API_KEY=[YOUR_OPENROUTER_KEY_OR_EMPTY]
OPENROUTER_MODEL=deepseek/deepseek-chat:free
FIREBASE_PROJECT_ID=[YOUR_FIREBASE_PROJECT_ID]
FRONTEND_URL=https://your-vercel-app.vercel.app
AUTH_MODE=firebase
ENVIRONMENT=production
CLOUD_PLATFORM=railway
PORT=8000
```

### 5.4 Get Railway Backend URL
1. After deployment, go to **Settings** tab
2. Copy the **Public URL** (e.g., `https://your-project-name.up.railway.app`)
3. **Save this URL** - you'll need it for Vercel

## ▲ Step 6: Vercel Frontend Deployment

### 6.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Connect your GitHub account to Vercel

### 6.2 Deploy Frontend
1. Click **"New Project"**
2. Import your GitHub repository
3. Vercel auto-detects Next.js
4. Configure build settings if needed

### 6.3 Configure Environment Variables
In Vercel dashboard, go to your project → **Settings** → **Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://your-railway-backend-url.up.railway.app
NEXT_PUBLIC_FIREBASE_API_KEY=[YOUR_FIREBASE_API_KEY]
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=[YOUR_FIREBASE_AUTH_DOMAIN]
NEXT_PUBLIC_FIREBASE_PROJECT_ID=[YOUR_FIREBASE_PROJECT_ID]
NEXT_PUBLIC_AUTH_MODE=firebase
```

### 6.4 Update Railway with Vercel URL
1. Go back to Railway dashboard
2. Update `FRONTEND_URL` variable with your Vercel URL
3. Redeploy Railway app

## 🔗 Step 7: Final Configuration

### 7.1 Update Vercel Rewrites
In `vercel.json`, update the rewrite destination:
```json
{
  "source": "/api/(.*)",
  "destination": "https://your-railway-backend-url.up.railway.app/api/$1"
}
```

### 7.2 Test Deployment
1. Visit your Vercel frontend URL
2. Try logging in with Firebase
3. Test AI assistant (admin only)
4. Check API endpoints work

## 🎯 AI Agent Features

Your deployed AI agent can:
- ✅ Create products: *"Add a laptop for $999 with 50 units"*
- ✅ Update inventory: *"Update laptop stock to 25 units"*
- ✅ Create orders: *"Create order for John with 2 laptops"*
- ✅ View analytics: *"Show me sales report"*

**Admin-only access enforced via Firebase authentication**

## 🆓 Free Tier Limits

- **Railway**: 512MB RAM, 100 hours/month
- **Vercel**: 100GB bandwidth, unlimited deployments
- **Supabase**: 500MB database, generous API limits
- **Firebase**: 1,000 users, generous auth limits
- **OpenRouter**: Free DeepSeek AI model

## 🔧 Troubleshooting

### Railway Issues
- Check deployment logs in Railway dashboard
- Verify environment variables are set correctly
- Ensure database URL is accessible

### Vercel Issues
- Check build logs in Vercel dashboard
- Verify API URL is correct
- Check environment variables

### Firebase Issues
- Ensure authentication is enabled
- Verify API keys are correct
- Check project ID matches

## 📞 Support

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- Firebase Docs: [firebase.google.com/docs](https://firebase.google.com/docs)

---

**🎉 Your AI Inventory Management System is now live in the cloud!**