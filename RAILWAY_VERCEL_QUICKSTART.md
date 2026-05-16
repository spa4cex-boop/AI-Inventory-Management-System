# ⚡ Railway & Vercel Deployment - Quick Checklist

## 🔧 Your Code is Ready!

All necessary files are present and committed:
- ✅ `Dockerfile` - Backend containerization
- ✅ `vercel.json` - Vercel configuration  
- ✅ `railway.toml` - Railway configuration
- ✅ `backend/requirements.txt` - Python dependencies
- ✅ `frontend/package.json` - Node.js dependencies

---

## 🚀 Quick Setup Steps

### Step 1️⃣: Gather Credentials
Before deploying, collect these from Firebase and Supabase:

**From Supabase:**
- [ ] PostgreSQL Connection URL

**From Firebase Project Settings:**
- [ ] API Key
- [ ] Auth Domain  
- [ ] Project ID

**From OpenRouter (optional for AI):**
- [ ] API Key

---

### Step 2️⃣: Deploy Backend to Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"Create New Project"** → **"Deploy from GitHub"**
4. Select: `AI-Inventory-Management-System`
5. Wait for auto-detection and build
6. Go to **Variables** tab and add:
   ```
   DATABASE_URL=[supabase_url]
   FIREBASE_PROJECT_ID=[firebase_project_id]
   OPENROUTER_API_KEY=[openrouter_key]
   AUTH_MODE=firebase
   PORT=8000
   ```
7. **Save the Railway URL** (e.g., `https://project.up.railway.app`)

---

### Step 3️⃣: Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click **"Add New Project"** → Select your repo
4. Click **"Import"** (auto-detects Next.js)
5. Before deploying, go to **Settings** → **Environment Variables**
6. Add:
   ```
   NEXT_PUBLIC_API_URL=[your_railway_url]
   NEXT_PUBLIC_FIREBASE_API_KEY=[firebase_api_key]
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=[firebase_auth_domain]
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=[firebase_project_id]
   ```
7. Click **"Deploy"** - Done! 🎉

---

### Step 4️⃣: Test Your Deployment

- [ ] Visit your Vercel URL → Should show login page
- [ ] Create an account with email/password
- [ ] Login and access dashboard
- [ ] Try creating a product
- [ ] Check if AI assistant works (if enabled)

---

## 📊 Expected URLs After Deployment

**Backend (Railway):**
```
https://your-project-name.up.railway.app
```

**Frontend (Vercel):**
```
https://your-project-name.vercel.app
```

---

## 🔗 Useful Links

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs  
- **Full Guide:** See `RAILWAY_VERCEL_DEPLOYMENT.md`

---

## ✅ Status Check Commands

**Check if Railway backend is running:**
```bash
curl https://your-railway-url/healthz
```

Expected: `{"status":"ok"}`

---

## 💡 Pro Tips

1. **Auto-deploys:** Both Railway & Vercel auto-deploy when you push to GitHub
2. **Environment variables:** Can be updated anytime without redeploying
3. **Free tier:** You get ~100 hours/month on Railway free tier (may sleep after inactivity)
4. **Custom domain:** Both services support custom domains (paid feature)

---

Need help? Check the full `RAILWAY_VERCEL_DEPLOYMENT.md` guide in this repository!
