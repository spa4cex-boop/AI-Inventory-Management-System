# Change Log

## Cloud Migration Completed

- Local Docker Compose and local service startup scripts were removed.
- Backend migrated from FastAPI to Firebase Cloud Functions.
- Authentication moved to Firebase Authentication.
- Database now targets Supabase PostgreSQL.
- AI assistant uses OpenRouter free model.
- Frontend prepared for Vercel deployment and Firebase auth.

## Deployment Flow

- Frontend: Vercel + Next.js
- Backend: Firebase Cloud Functions
- Database: Supabase PostgreSQL

## Validation Steps

1. Deploy frontend to Vercel.
2. Deploy functions to Firebase.
3. Configure environment variables for Firebase and Supabase.
4. Sign in via Firebase Auth and confirm dashboard access.
5. Confirm API requests include Firebase ID tokens.
