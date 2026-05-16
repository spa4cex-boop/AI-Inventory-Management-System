Netlify Deployment - Quick Setup Guide

1) Create a GitHub repository
- Create a new repository on GitHub and push the project root into it:

```bash
git init
git add .
git commit -m "Initial commit: AI Inventory Management System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

2) Netlify site creation
- In Netlify, click "Add new site" → "Import an existing project" → choose GitHub
- Select your repository
- Build command: `npm run build:netlify`
- Publish directory: `frontend/out`
- Functions directory (Netlify setting): `netlify/functions`

3) Environment variables (Netlify UI: Site settings → Build & deploy → Environment)
- Add the following variables exactly as shown. Replace placeholder values with your own secrets.

```
# OpenRouter
OPENROUTER_API_KEY=[YOUR_OPENROUTER_KEY]
OPENROUTER_MODEL=deepseek/deepseek-chat:free

# Firebase (Web SDK - public)
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_WEB_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase service account JSON (private - keep secure)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account", ... }

# API URLs
NEXT_PUBLIC_API_URL=https://your-site.netlify.app/api
NEXT_PUBLIC_API_BASE_URL=https://your-site.netlify.app/api

# Optional: Database / Supabase
DATABASE_URL=postgresql://user:pass@host:5432/db
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App settings
AUTH_MODE=firebase
ENVIRONMENT=production

```

4) Deploy
- Click "Deploy site" in Netlify
- Wait 2-5 minutes for build + functions packaging

5) Post-deploy checks
- Visit your site URL
- Health check: `https://your-site.netlify.app/api/healthz`
- AI endpoint: `POST https://your-site.netlify.app/api/ai/assist` (requires admin auth)

6) Notes & Troubleshooting
- If build fails, check Deploy logs in Netlify for missing envs or build errors.
- Ensure `FIREBASE_SERVICE_ACCOUNT_KEY` is valid JSON (single-line or properly escaped).
- If AI returns error, verify `OPENROUTER_API_KEY` and `OPENROUTER_MODEL`.

7) Optional: Continuous deploy branch settings
- Use `main` for production
- Use branch deploys for staging/test branches

---
If you want, I can run the interactive Netlify CLI deploy from this machine now — but you will need to sign in when prompted. Otherwise, follow the steps above in the Netlify UI.