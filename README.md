# AI Inventory Management System - Cloud Deployment

A modern, cloud-first inventory management SaaS platform with AI-powered operations. This repository is configured for cloud deployment only and is designed to run on hosted platforms rather than local machines.

## 🚀 Deployment Options

### Option 1: **Netlify** (Recommended - Easiest Setup)
- **Frontend**: Next.js on Netlify static hosting
- **Backend**: Express.js on Netlify Functions
- **Database**: Firebase Firestore
- **Status**: ✅ Ready for production
- **Setup Time**: ~15 minutes
- **See**: [NETLIFY_DEPLOYMENT_GUIDE.md](NETLIFY_DEPLOYMENT_GUIDE.md)
- **Build command**: `npm run build:netlify`
- **Publish directory**: `frontend/out`
- **Environment variables**: See `.env.production.example`

### Option 2: Railway + Vercel (Alternative)
- **Frontend**: Next.js deployed on **Vercel** (free tier)
- **Backend**: FastAPI deployed on **Railway** (free tier)
- **Database**: PostgreSQL hosted on **Supabase** (free tier)
- **See**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 🎯 Key Features

- ✅ **AI Agent with Admin Rights**: AI can create, update, delete products and orders
- ✅ **Role-Based Access Control**: Admin, Manager, Staff roles
- ✅ **Real-time Inventory Tracking**: Low stock alerts and reorder management
- ✅ **Order Management**: Complete order lifecycle with inventory updates
- ✅ **Supplier Management**: Track supplier performance and ratings
- ✅ **Analytics Dashboard**: Sales reports and inventory insights
- ✅ **Cloud-Native**: Deploy on free tier platforms (Netlify, Railway, Vercel, Supabase)

## 📁 Project Structure

```
├── frontend/              # Next.js React application
├── backend/              # FastAPI backend (for Railway deployment)
├── netlify/functions/    # Express.js for Netlify Functions
├── database/             # PostgreSQL schema (for Railway deployment)
├── .env.production.example  # Production environment template
├── netlify.toml          # Netlify deployment config
├── railway.toml          # Railway deployment config
├── vercel.json           # Vercel deployment config
└── firebase.json         # Firebase project config
```

## 🚀 Quick Start (Netlify - Recommended)
2. Connect your GitHub repository
3. Railway auto-detects Python project
4. Add environment variables (see `.env.production.example`)
5. Set `DATABASE_URL` to your Supabase PostgreSQL URL
6. Deploy automatically triggers
7. **Save the Railway URL** - needed for Vercel

### 3. Vercel Frontend Deployment (Free)

1. Go to [vercel.com](https://vercel.com) and sign up
2. Connect your GitHub repository
3. Set project root to repository root
4. Vercel auto-detects Next.js
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your Railway backend URL
   - `NEXT_PUBLIC_API_BASE_URL`: Your Railway backend URL (optional alias)
   - `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase API key
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase project ID
6. Deploy automatically triggers

### 4. Firebase Authentication Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create/select project
3. Enable Authentication → Email/Password provider
4. Go to Project Settings → General → Copy:
   - **Web API Key**
   - **Auth Domain** (project.firebaseapp.com)
   - **Project ID**
5. Add these to Vercel environment variables

## 🔐 Security & AI Agent

### AI Agent Privileges
- **Admin Role**: Full CRUD operations on all entities
- **Authenticated**: Only logged-in users can access AI features
- **Audited**: All AI actions are logged for security

### Role-Based Access
- **Admin**: Full access (AI agent, user management, all operations)
- **Manager**: Product/supplier management, order approval
- **Staff**: Order creation, inventory viewing

## 🚀 Quick Start (Cloud)

1. **Set up Supabase** → Get PostgreSQL URL
2. **Deploy to Railway** → Set DATABASE_URL, get backend URL
3. **Deploy to Vercel** → Set NEXT_PUBLIC_API_URL to Railway URL
4. **Configure Firebase** → Add credentials to Vercel
5. **Access your app** at the Vercel URL!

## 📊 API Endpoints

### Authentication Required
- `GET /api/products` - List products
- `POST /api/products` - Create product (Manager+)
- `PUT /api/products/{id}` - Update product (Manager+)
- `DELETE /api/products/{id}` - Delete product (Admin only)
- `POST /api/orders` - Create order (Staff+)
- `POST /api/ai/assist` - AI assistant (Admin only)

### AI Agent Capabilities
The AI agent can perform:
- ✅ Create new products with pricing and inventory
- ✅ Update product quantities and reorder levels
- ✅ Create customer orders with inventory deduction
- ✅ Generate inventory reports and insights
- ✅ All operations require admin authentication

## 🔧 Environment Variables

### Backend (Railway)
```env
DATABASE_URL=postgresql://user:pass@host:port/db
OPENROUTER_API_KEY=your_key
FIREBASE_PROJECT_ID=your_project
FRONTEND_URL=https://your-vercel-app.vercel.app
AUTH_MODE=firebase
ENVIRONMENT=production
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
NEXT_PUBLIC_API_BASE_URL=https://your-railway-app.railway.app
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_AUTH_MODE=firebase
```

## 🎯 AI Agent Usage

Once deployed and logged in as admin:

1. Go to Dashboard → AI Assistant
2. Try prompts like:
   - "Create a product called Wireless Headphones for $99.99 with 50 units"
   - "Update product 1 to have 25 units in stock"
   - "Create an order for John Doe with 2 units of product 1"
   - "Show me low stock items"

## 📈 Monitoring & Scaling

- **Railway**: Auto-scaling, logs, and metrics included
- **Vercel**: Analytics, performance monitoring
- **Supabase**: Database monitoring and backups
- **Firebase**: Authentication analytics

## 🆓 Free Tier Limits

- **Railway**: 512MB RAM, 1GB storage, 100 hours/month
- **Vercel**: 100GB bandwidth, unlimited deployments
- **Supabase**: 500MB database, 50MB file storage
- **Firebase**: 1,000 auth users, generous API limits
- **OpenRouter**: Free DeepSeek model with rate limits

## 🆘 Troubleshooting

**Backend not starting?**
- Check Railway logs for Python errors
- Verify DATABASE_URL format
- Ensure all environment variables are set

**Frontend auth issues?**
- Verify Firebase credentials in Vercel
- Check browser console for Firebase errors
- Ensure NEXT_PUBLIC_API_URL points to Railway

**AI not working?**
- Check OpenRouter API key
- Verify admin role authentication
- Check Railway logs for AI service errors

---

**🎉 Your AI-powered inventory system is now cloud-deployed and ready to use!**

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_API_URL`

### Firebase Functions

- `SUPABASE_DATABASE_URL`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

## Getting started

The current repository is configured for cloud deployment only. Run it by deploying to cloud platforms like Railway, Vercel, or Netlify with the required environment variables.

## Supabase schema

Use `database/schema.sql` to create the tables in Supabase.

## Notes

This repository now supports:
- Firebase Authentication login/register flows
- Secure backend API calls with Firebase ID tokens
- Supabase PostgreSQL inventory storage
- OpenRouter AI assistant integration

For a full deployment guide, see `docs/deployment.md`.
