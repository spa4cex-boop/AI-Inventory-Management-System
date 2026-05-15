# AI Inventory Management System Architecture

## Overview
The system is now a cloud-native SaaS inventory platform built with a Next.js frontend, Firebase Cloud Functions backend, Supabase PostgreSQL data storage, and OpenRouter AI.

## Layers
- Frontend: Next.js 15, TypeScript, Tailwind CSS, Shadcn UI, Recharts
- Backend: Firebase Cloud Functions, Express, Supabase PostgreSQL
- Authentication: Firebase Authentication with Email/Password and Google sign-in
- AI Services: OpenRouter free model for inventory insights and recommendations
- Notifications: Firebase Cloud Messaging and persistent notification records in Supabase

## Deployment
- Frontend deployable to Vercel
- Backend deployable to Firebase Cloud Functions
- Database hosted in Supabase PostgreSQL
- Storage via Firebase Storage
- Authentication via Firebase Auth

## Notes
This repository no longer relies on local Docker Compose, Redis, or on-premises backend hosting.
