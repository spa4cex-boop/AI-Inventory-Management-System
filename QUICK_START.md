# 🎯 Quick Deploy Guide - Start Here!

This is your **5-minute quick start** to get the AI Inventory Management System live on Netlify.

## 1️⃣ Firebase Setup (2 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Enable **Firestore Database** (Production mode)
4. Enable **Authentication** → **Email/Password**
5. Go to **Project Settings** → **Service Accounts**
6. Click **Generate New Private Key** and save the JSON
7. Go back to **General** tab and copy your Firebase config (API Key, Auth Domain, Project ID)

## 2️⃣ GitHub Setup (1 minute)

```bash
cd h:\AI Agent
git add .
git commit -m "Ready for Netlify"
git push origin main
```

## 3️⃣ Netlify Deployment (2 minutes)

1. Go to [app.netlify.com](https://app.netlify.com)
2. Sign in with GitHub
3. Click **Add new site** → **Import an existing project**
4. Select your repository
5. Click **Deploy site**

## 4️⃣ Add Environment Variables

Once site is created:

1. Go to **Site Settings** → **Build & Deploy** → **Environment**
2. Add these variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
OPENROUTER_API_KEY=sk-xxx (optional)
OPENROUTER_MODEL=deepseek/deepseek-chat:free
```

3. Click **Redeploy site**

## 5️⃣ Done! ✅

Your site is live at: `https://your-site.netlify.app`

- **Frontend**: Automatically deployed
- **API**: Available at `/api/` endpoints
- **Auto-deploys**: Any push to `main` branch deploys automatically

## 🧪 Quick Test

```bash
# Health check
curl https://your-site.netlify.app/api/healthz

# Should return:
# {"status":"ok","service":"AI Inventory Management System"...}
```

## 📚 Full Guides

- **Full Setup**: [NETLIFY_DEPLOYMENT_GUIDE.md](NETLIFY_DEPLOYMENT_GUIDE.md)
- **Deployment Summary**: [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)
- **Complete Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

## ⚡ Common Issues & Fixes

### Build Fails
- Check Netlify build log for error
- Ensure all Firebase variables are set
- Verify `netlify.toml` exists

### API Returns 503
- Check `FIREBASE_SERVICE_ACCOUNT_KEY` is valid JSON
- Ensure Firestore database is created
- Verify service account has permissions

### Login Not Working
- Check `NEXT_PUBLIC_FIREBASE_*` variables
- Verify Email/Password is enabled in Firebase
- Clear browser cache and try again

### Not Deploying Automatically
- Ensure GitHub is connected in Netlify
- Check main branch is set as default
- Verify `.netlify.toml` exists

## 🎯 What's Included

✅ Complete Express.js API with all endpoints
✅ Firebase Firestore integration
✅ Firebase Authentication
✅ Role-based access control (Admin, Manager, Staff)
✅ AI assistant with OpenRouter integration
✅ Dashboard with analytics
✅ Product, Order, Supplier management
✅ Low stock alerts
✅ Netlify Functions for serverless backend
✅ Next.js 15 frontend with TypeScript

## 📊 Architecture

```
Browser (Next.js)
    ↓
[Netlify CDN]
    ↓
[Netlify Functions] ← Express.js API
    ↓
[Firebase Firestore] ← Database
```

## 🚀 Next Steps After Deployment

1. Create test user account
2. Add sample products
3. Create a test order
4. Check dashboard metrics
5. Test AI assistant features
6. Invite team members

## 💡 Pro Tips

- **API Testing**: Use Postman or curl with Firebase token
- **Real-time Updates**: Use Firestore listeners for live data
- **Scaling**: Netlify auto-scales - no configuration needed
- **Custom Domain**: Add in Netlify Site Settings

## 🆘 Need Help?

1. Check **Netlify Build Logs** for deployment errors
2. Check **Netlify Functions Logs** for API errors
3. Check **Browser Console** (F12) for frontend errors
4. Check **Firebase Console** for database/auth issues
5. Review [NETLIFY_DEPLOYMENT_GUIDE.md](NETLIFY_DEPLOYMENT_GUIDE.md)

---

**🎉 You're all set! Your AI Inventory System is ready to deploy!**

Questions? Check the full deployment guide or Firebase/Netlify documentation.
