# Netlify Deployment Guide for AI Inventory Management System

This guide will help you deploy the complete AI Inventory Management System on Netlify with Firebase backend.

## 🎯 Overview

- **Frontend**: Next.js application (Netlify static hosting)
- **Backend**: Express.js running on Netlify Functions
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **AI Service**: OpenRouter (Free DeepSeek model)

## 📋 Prerequisites

Before starting, ensure you have:

1. **GitHub Account** - Required for connecting to Netlify
2. **Firebase Project** - For authentication and database
3. **OpenRouter Account** - For AI functionality (optional but recommended)
4. **Netlify Account** - Free tier available at [netlify.com](https://netlify.com)

## 🔧 Step 1: Prepare Firebase Configuration

### 1.1 Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable **Cloud Firestore**:
   - Go to **Build** → **Firestore Database**
   - Click **Create Database**
   - Select a region close to you
   - Start in **Production mode**

### 1.2 Set Up Firebase Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** provider:
   - Click **Email/Password**
   - Enable it
   - Save

### 1.3 Create Firebase Web App

1. Go to **Project Settings** (gear icon)
2. Under **Your apps**, click **Add app** → **Web**
3. Register app with a name (e.g., "AI Inventory Web")
4. Copy the Firebase config object - you'll need this

### 1.4 Create Firebase Service Account

1. In Project Settings, click **Service Accounts** tab
2. Click **Generate New Private Key**
3. Save the JSON file securely
4. Copy the entire JSON content - you'll need this for Netlify

## 🤖 Step 2: Set Up OpenRouter (Optional but Recommended)

1. Go to [OpenRouter.ai](https://openrouter.ai)
2. Sign up for free account
3. Go to Keys page and copy your API key
4. Note: Free tier has rate limits but sufficient for testing

## 🚀 Step 3: Deploy to Netlify

### 3.1 Push Code to GitHub

```bash
# Initialize git if not done
git init
git add .
git commit -m "Initial commit: AI Inventory Management System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 3.2 Connect GitHub to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub** and authorize
4. Select your repository
5. Keep the defaults:
   - Base directory: (leave empty)
   - Build command: `npm run build:netlify`
   - Publish directory: `frontend/out`

### 3.3 Configure Environment Variables

In Netlify Site Settings → **Build & Deploy** → **Environment**:

Add these variables:

```
# Firebase Web App Config (from Step 1.3)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Service Account (from Step 1.4 - entire JSON as one line)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'

# OpenRouter API Key (from Step 2)
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=deepseek/deepseek-chat:free

# API URL (will be your Netlify domain)
NEXT_PUBLIC_API_URL=https://your-site.netlify.app/api
NEXT_PUBLIC_API_BASE_URL=https://your-site.netlify.app/api
```

### 3.4 Deploy

1. Click **Deploy site**
2. Wait for build to complete (2-3 minutes)
3. Once successful, your site URL will be shown

## ✅ Step 4: Test the Deployment

### 4.1 Test Frontend

1. Open your Netlify site URL
2. You should see the login page
3. Try to sign up with email/password

### 4.2 Test Backend API

```bash
# Get health check
curl https://your-site.netlify.app/api/healthz

# Should return:
# {"status":"ok","service":"AI Inventory Management System",...}
```

### 4.3 Test Firebase Connection

1. Log in with your test account
2. Navigate to Dashboard
3. Check if data loads (may be empty initially)

## 🔄 Deploying Updates

After making changes:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Netlify will automatically detect changes and redeploy.

## 🛠️ Troubleshooting

### Build Fails

**Check logs**: In Netlify, go to **Deploys** → click on failed deploy → **Deploy log**

Common issues:
- Missing environment variables → Add them in Site Settings
- Node.js version mismatch → Ensure `package.json` has `"engines": {"node": "20.x"}`
- Firebase config invalid → Check the JSON format

### API Returns 503

**Firebase not configured**: 
- Check `FIREBASE_SERVICE_ACCOUNT_KEY` is valid JSON
- Verify service account has proper permissions

### Firebase Authentication Not Working

- Check web app config in `NEXT_PUBLIC_FIREBASE_*` variables
- Ensure Email/Password provider is enabled in Firebase Console
- Verify domain is not in CORS restrictions

### OpenRouter AI Not Working

- Verify `OPENROUTER_API_KEY` is set correctly
- Check rate limits haven't been exceeded
- Ensure JSON responses are being parsed correctly

## 📝 Environment File Reference

Copy `.env.production.example` to `.env.production` for build-time reference only:

```bash
cp .env.production.example .env.production
```

Then fill in actual values. Note: secrets should be managed through Netlify environment variables for cloud deployment, and `.env.production` should not be committed.

## 🔐 Security Best Practices

1. **Never commit `.env.production`** - Add to `.gitignore`
2. **Rotate Firebase keys** if accidentally exposed
3. **Use Netlify environment variables** for sensitive data
4. **Enable Firebase Security Rules** for Firestore access control
5. **Set up rate limiting** for API endpoints

## 📞 Support

- [Netlify Documentation](https://docs.netlify.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenRouter Documentation](https://openrouter.ai/docs)

## 🎉 Next Steps

After successful deployment:

1. Create admin users for your team
2. Set up custom domain (optional)
3. Enable SSL certificate (automatic with Netlify)
4. Configure Firestore backup rules
5. Set up monitoring and alerts

---

**Need help?** Check the build logs in Netlify dashboard or refer to the main README.md file.
