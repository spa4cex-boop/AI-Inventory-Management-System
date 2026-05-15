# Deployment Guide

This repository is now configured as a cloud-native inventory SaaS platform.

## Services

- Frontend: Next.js on Vercel
- Backend: Firebase Cloud Functions
- Authentication: Firebase Auth
- Database: Supabase PostgreSQL
- Storage: Firebase Storage
- Notifications: Firebase Cloud Messaging
- AI: OpenRouter free model

## 1. Configure Supabase

1. Create a free Supabase project.
2. Open the SQL editor and run `database/schema.sql` to create tables.
3. Add a `SUPABASE_DATABASE_URL` connection string in your Firebase Functions environment.

## 2. Create Firebase Project

1. Create a Firebase project at https://console.firebase.google.com.
2. Enable Authentication with Email/Password and Google providers.
3. Enable Firebase Storage.
4. Optionally configure Cloud Messaging for push notifications.

## 3. Configure Firebase Functions

1. Install Firebase CLI if you do not have it:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in and initialize the project:
   ```bash
   firebase login
   firebase init functions
   ```
3. Choose the `functions/` directory and TypeScript.
4. Deploy functions using:
   ```bash
   cd functions
   npm install
   npm run build
   firebase deploy --only functions
   ```

## 4. Set Firebase environment variables

Set the following Firebase Functions environment variables:

- `SUPABASE_DATABASE_URL`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL` (defaults to `deepseek/deepseek-chat:free`)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

The root `firebase.json` and `.firebaserc` are already configured for cloud deployment.

## 5. Deploy frontend to Vercel

1. Connect your repository to Vercel.
2. Set the project root to the repository root.
3. Configure the build command and output settings automatically by selecting the Next.js preset.
4. Define environment variables in Vercel for the frontend:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_API_URL`

## 6. Verify the deployment

- Frontend should load the login page from Vercel.
- After signing in, dashboard routes should be protected and require Firebase auth.
- Backend API requests should include Firebase ID tokens and target `NEXT_PUBLIC_API_URL`.
- AI assistant prompts should be processed through OpenRouter.

## 7. Notes

- The local Docker setup and FastAPI backend are no longer used in the main deployment flow.
- Existing APIs are now served through Firebase Functions and Supabase.
- `database/schema.sql` provides the PostgreSQL schema for Supabase.
