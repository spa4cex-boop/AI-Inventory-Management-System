# 📋 Netlify Deployment Checklist

Use this checklist to ensure everything is ready before deploying to Netlify.

## ✅ Pre-Deployment Setup

### Cloud Deployment Preparation
- [ ] GitHub account created
- [ ] Repository pushed to GitHub
- [ ] Netlify account created
- [ ] Firebase project created
- [ ] Supabase project created

### Firebase Setup
- [ ] Firebase project created
- [ ] Firestore Database enabled (Production mode)
- [ ] Authentication enabled (Email/Password provider)
- [ ] Web app created and config copied
- [ ] Service account created and JSON downloaded
- [ ] Service account has Firestore permissions

### Code Ready
- [ ] All source files committed (`git status` shows clean)
- [ ] `.env.production` created from `.env.production.example`
- [ ] `.gitignore` includes `.env.production` and `node_modules/`
- [ ] netlify.toml file present and valid
- [ ] netlify/functions/api.js is complete
- [ ] package.json has `build:netlify` script

## 🚀 Netlify Deployment

### Create Netlify Site
- [ ] Netlify account created at [netlify.com](https://netlify.com)
- [ ] Repository connected via GitHub
- [ ] Site created successfully
- [ ] Site URL generated (e.g., https://your-site.netlify.app)

### Configure Environment Variables
In Netlify Site Settings → Build & Deploy → Environment:

- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` = (from Firebase Console)
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = (from Firebase Console)
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = (from Firebase Console)
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = (from Firebase Console)
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = (from Firebase Console)
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID` = (from Firebase Console)
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` = (entire service account JSON)
- [ ] `OPENROUTER_API_KEY` = (optional, for AI features)
- [ ] `OPENROUTER_MODEL` = `deepseek/deepseek-chat:free` (or your model)

### Deploy
- [ ] Click "Deploy site" or push to main branch
- [ ] Build completes successfully (check build logs)
- [ ] No errors in build log
- [ ] Site is live and accessible

## ✅ Post-Deployment Testing

### Health Check
- [ ] Access health endpoint: `https://your-site.netlify.app/api/healthz`
- [ ] Response shows `{"status":"ok","service":"..."}`

### Frontend
- [ ] Site loads at `https://your-site.netlify.app`
- [ ] Login page displays
- [ ] Can create account
- [ ] Can login with email/password
- [ ] Dashboard loads after login

### API Authentication
- [ ] Protected endpoints return 401 without token
- [ ] Protected endpoints work with valid Firebase token
- [ ] Role-based access control works (test staff, manager, admin)

### Core Functionality
- [ ] Can create a product
- [ ] Can view products list
- [ ] Can create an order
- [ ] Can view orders
- [ ] Low-stock alert shows correctly
- [ ] Dashboard metrics load

### AI Features (if enabled)
- [ ] OpenRouter API key is set
- [ ] AI assistant endpoint works (`POST /api/ai/assist`)
- [ ] Receives AI responses
- [ ] Responses are stored in Firestore

### Database
- [ ] Firestore collections created automatically:
  - [ ] `products`
  - [ ] `orders`
  - [ ] `categories`
  - [ ] `suppliers`
  - [ ] `notifications` (if used)
  - [ ] `aiInsights` (if AI used)

## 🔄 Continuous Deployment

### Git Workflow
- [ ] Local changes made
- [ ] Changes committed (`git add . && git commit`)
- [ ] Changes pushed to main (`git push origin main`)
- [ ] Netlify auto-deployment triggered
- [ ] Build completes successfully
- [ ] Site updates live automatically

### Monitoring
- [ ] Check Netlify dashboard regularly
- [ ] Monitor Firebase usage
- [ ] Check function execution times
- [ ] Review error logs if issues occur

## 🛡️ Security Verification

- [ ] `.env.production` is in `.gitignore` ✅
- [ ] Service account key not in repository
- [ ] Firebase security rules are set to Production mode
- [ ] CORS headers are correctly configured
- [ ] API tokens are verified on protected endpoints
- [ ] No sensitive data in logs

## 📊 Performance Checks

- [ ] Frontend loads in <3 seconds
- [ ] API responses in <1 second
- [ ] Function cold starts acceptable
- [ ] No 500 errors in logs
- [ ] Firestore indexes created if needed

## 🔧 Troubleshooting Checklist

If deployment fails, check:

### Build Errors
- [ ] Check Netlify build log for specific error
- [ ] Verify `package.json` has all dependencies
- [ ] Verify cloud build command is configured correctly
- [ ] Check Node.js version matches (20.x)

### Environment Variables
- [ ] All NEXT_PUBLIC_* variables set
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` is valid JSON
- [ ] JSON is on a single line without formatting
- [ ] No quotes around JSON in environment variable

### Firebase Issues
- [ ] Service account has Firestore permissions
- [ ] Firestore database is in Production mode
- [ ] Email/Password auth provider enabled
- [ ] Web app config matches NEXT_PUBLIC_* variables

### API Issues
- [ ] Check Netlify function logs
- [ ] Verify Firebase initialization succeeds
- [ ] Check for CORS errors in browser console
- [ ] Verify API URL in frontend matches site URL

### Frontend Issues
- [ ] Check browser console for errors
- [ ] Clear browser cache
- [ ] Check Firebase credentials in browser inspector
- [ ] Verify API_URL points to correct domain

## 🎯 Final Verification

- [ ] Site is publicly accessible
- [ ] All core features work
- [ ] No errors in console (browser or server)
- [ ] Performance is acceptable
- [ ] Ready for users!

## 📞 Support Resources

If you get stuck:

1. **Netlify Logs**: Check Site Settings → Functions or Deploys tab
2. **Firebase Console**: Check Firestore usage and errors
3. **Browser Console**: Check for client-side errors (F12)
4. **Netlify Docs**: https://docs.netlify.com/
5. **Firebase Docs**: https://firebase.google.com/docs

## 🎉 Success!

Once all items are checked, your AI Inventory Management System is live on Netlify!

Share your site URL with users, and they can start using the system immediately.

---

**Need help?** See [NETLIFY_DEPLOYMENT_GUIDE.md](NETLIFY_DEPLOYMENT_GUIDE.md) for detailed instructions.
