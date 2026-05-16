# 🚀 Railway & Vercel Deployment Guide

Complete step-by-step guide to deploy your AI Inventory System with Railway (backend) and Vercel (frontend).

---

## 📋 Prerequisites

- GitHub repository: https://github.com/spa4cex-boop/AI-Inventory-Management-System
- Railway account: https://railway.app
- Vercel account: https://vercel.com
- Supabase account: https://supabase.com (for database)
- Firebase account: https://console.firebase.google.com (for authentication)

---

## 🗄️ STEP 1: Setup Supabase Database

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Choose **Free tier**
4. Select a region close to your users
5. Wait for project to initialize (~2 minutes)

### 1.2 Get Database URL
1. Go to **Project Settings** → **Database**
2. Copy the **PostgreSQL Connection String**
3. Format: `postgresql://user:password@host:port/database`
4. **Save this** as `SUPABASE_DATABASE_URL`

---

## 🔥 STEP 2: Setup Firebase Authentication

### 2.1 Create Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com/)
2. Click **"Create project"**
3. Name it `ai-inventory-system`
4. Enable Google Analytics (optional)
5. Wait for creation

### 2.2 Enable Authentication
1. Go to **Authentication** (left sidebar)
2. Click **"Get started"**
3. Enable **Email/Password** provider
4. Save

### 2.3 Get Firebase Credentials
1. Go to **Project Settings** (gear icon)
2. Go to **General** tab
3. Copy these values:
   - **API Key** → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - **Auth Domain** → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - **Project ID** → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

### 2.4 Create Service Account (for backend)
1. Go to **Project Settings** → **Service Accounts**
2. Click **"Generate new private key"**
3. Download the JSON file
4. **Important:** Keep this secret, don't commit it to git

---

## 🤖 STEP 3: Get OpenRouter API Key (Optional)

For AI features:
1. Go to [openrouter.ai](https://openrouter.ai/)
2. Sign up or login
3. Copy your **API Key**
4. Note: Free tier available with DeepSeek model

---

## 🚂 STEP 4: Deploy Backend to Railway

### 4.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with **GitHub** (easiest option)
3. Authorize Railway to access your GitHub account

### 4.2 Create New Railway Project
1. Click **"Create a new project"** or go to Dashboard
2. Select **"Deploy from GitHub repo"**
3. Choose your repo: `AI-Inventory-Management-System`
4. Railway will auto-detect it's a Python project

### 4.3 Configure Environment Variables
Once your project is created in Railway:

1. Go to your project → **Variables** tab
2. Add the following variables:

```
DATABASE_URL=postgresql://[your_supabase_url]
FIREBASE_PROJECT_ID=[your_firebase_project_id]
OPENROUTER_API_KEY=[your_openrouter_key or empty]
OPENROUTER_MODEL=deepseek/deepseek-chat:free
AUTH_MODE=firebase
ENVIRONMENT=production
CLOUD_PLATFORM=railway
PORT=8000
FRONTEND_URL=https://your-vercel-url.vercel.app
```

### 4.4 Get Railway Backend URL
1. Go to **Settings** tab
2. Copy the **Public URL** (e.g., `https://your-project.up.railway.app`)
3. **Save this** for Vercel configuration

### 4.5 Check Deployment Status
1. Go to **Deployments** tab
2. Wait for build to complete (green checkmark)
3. Check logs if any errors occur

---

## ▲ STEP 5: Deploy Frontend to Vercel

### 5.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with **GitHub** (recommended)
3. Authorize Vercel to access your GitHub repos

### 5.2 Import Project to Vercel
1. Click **"Add New Project"** or **"Import Project"**
2. Select your GitHub repository
3. Vercel will auto-detect **Next.js**
4. Click **"Import"**

### 5.3 Configure Environment Variables
Before deploying, add environment variables:

1. In Vercel dashboard → Your Project → **Settings** → **Environment Variables**
2. Add these variables (for all environments):

```
NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app
NEXT_PUBLIC_FIREBASE_API_KEY=[your_firebase_api_key]
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=[your_firebase_auth_domain]
NEXT_PUBLIC_FIREBASE_PROJECT_ID=[your_firebase_project_id]
NEXT_PUBLIC_AUTH_MODE=firebase
```

3. Click **"Save"**

### 5.4 Deploy
1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Get your Vercel URL: `https://your-project-name.vercel.app`

### 5.5 Update Railway with Vercel URL
1. Go back to Railway dashboard
2. Go to **Variables** tab
3. Update `FRONTEND_URL` with your new Vercel URL
4. Click **"Redeploy"** if needed

---

## ✅ STEP 6: Post-Deployment Testing

### 6.1 Test Backend Health
```
curl https://your-railway-url.up.railway.app/healthz
```
Expected response: `{"status":"ok"}`

### 6.2 Test Frontend
1. Visit your Vercel URL: `https://your-vercel-app.vercel.app`
2. Should see login page
3. Click **"Sign Up"** to create account
4. Login with email/password
5. Access dashboard

### 6.3 Test Core Features
- [ ] Create a product
- [ ] View products list
- [ ] Create an order
- [ ] View dashboard metrics
- [ ] Test AI assistant (admin role)

---

## 🔑 Quick Reference: Environment Variables

| Variable | Railway | Vercel | Value |
|----------|---------|--------|-------|
| DATABASE_URL | ✅ | ❌ | From Supabase |
| FIREBASE_PROJECT_ID | ✅ | ✅ | From Firebase |
| NEXT_PUBLIC_API_URL | ❌ | ✅ | Your Railway URL |
| NEXT_PUBLIC_FIREBASE_API_KEY | ❌ | ✅ | From Firebase |
| NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN | ❌ | ✅ | From Firebase |
| OPENROUTER_API_KEY | ✅ | ❌ | From OpenRouter |
| OPENROUTER_MODEL | ✅ | ❌ | `deepseek/deepseek-chat:free` |

---

## 🆓 Free Tier Limits

### Railway
- **100 hours/month** execution time (free tier)
- **1 project** allowed
- Auto-sleeps after inactivity

### Vercel
- **Unlimited** projects
- **100 GB/month** bandwidth (free tier)
- Auto-deploys on git push

### Supabase
- **500 MB** storage (free tier)
- **2 GB/month** bandwidth

### Firebase
- **1 GB** Firestore storage (free tier)
- **Unlimited** authentication users

---

## 🆘 Troubleshooting

### Railway Build Fails
- Check logs: **Deployments** → **View Logs**
- Ensure `requirements.txt` is in root directory
- Verify `Dockerfile` is present

### Frontend Shows Blank Page
- Check browser console for errors
- Verify environment variables in Vercel
- Ensure `NEXT_PUBLIC_API_URL` is correct

### Login Not Working
- Verify Firebase credentials in Vercel env vars
- Check Firebase Authentication email/password is enabled
- Clear browser cache and try again

### API Returns 401 Unauthorized
- Verify `FIREBASE_PROJECT_ID` matches frontend
- Ensure token is being sent with requests
- Check Firebase rules allow your operations

---

## 📞 Support

- Railway: https://docs.railway.app
- Vercel: https://vercel.com/docs
- Firebase: https://firebase.google.com/docs
- Supabase: https://supabase.com/docs
