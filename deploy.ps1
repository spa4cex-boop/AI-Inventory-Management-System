# Cloud Deployment Script for AI Inventory Management System
# PowerShell version for Windows
Write-Host "AI Inventory Management System - Cloud Deployment" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Check if required tools are installed
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
$pythonInstalled = Get-Command python -ErrorAction SilentlyContinue

if (-not $gitInstalled) {
    Write-Host "Git is required but not installed. Please install Git from https://git-scm.com/" -ForegroundColor Red
    exit 1
}
if (-not $nodeInstalled) {
    Write-Host "Node.js is required but not installed. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
if (-not $pythonInstalled) {
    Write-Host "Python is required but not installed. Please install from https://python.org/" -ForegroundColor Red
    exit 1
}

Write-Host "Prerequisites check passed" -ForegroundColor Green

# Step 1: Supabase Setup
Write-Host ""
Write-Host "Step 1: Supabase Database Setup" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow
Write-Host "1. Go to https://supabase.com" -ForegroundColor White
Write-Host "2. Create a new account or sign in" -ForegroundColor White
Write-Host "3. Click 'New Project'" -ForegroundColor White
Write-Host "4. Choose free tier and select a region" -ForegroundColor White
Write-Host "5. Wait for project creation (~2 minutes)" -ForegroundColor White
Write-Host "6. Go to SQL Editor and run the contents of database/schema.sql" -ForegroundColor White
Write-Host "7. Go to Settings -> Database -> Copy the PostgreSQL URL" -ForegroundColor White
Write-Host ""

$SUPABASE_URL = Read-Host "Enter your Supabase PostgreSQL URL"
if ([string]::IsNullOrEmpty($SUPABASE_URL)) {
    Write-Host "Supabase URL is required" -ForegroundColor Red
    exit 1
}

# Step 2: Firebase Setup
Write-Host ""
Write-Host "Step 2: Firebase Authentication Setup" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host "1. Go to https://console.firebase.google.com/" -ForegroundColor White
Write-Host "2. Create a new project or select existing" -ForegroundColor White
Write-Host "3. Enable Authentication -> Email/Password provider" -ForegroundColor White
Write-Host "4. Go to Project Settings -> General tab" -ForegroundColor White
Write-Host ""

$FIREBASE_API_KEY = Read-Host "Enter Firebase API Key"
$FIREBASE_AUTH_DOMAIN = Read-Host "Enter Firebase Auth Domain (project.firebaseapp.com)"
$FIREBASE_PROJECT_ID = Read-Host "Enter Firebase Project ID"

if ([string]::IsNullOrEmpty($FIREBASE_API_KEY) -or [string]::IsNullOrEmpty($FIREBASE_AUTH_DOMAIN) -or [string]::IsNullOrEmpty($FIREBASE_PROJECT_ID)) {
    Write-Host "All Firebase credentials are required" -ForegroundColor Red
    exit 1
}

# Step 3: OpenRouter API Key
Write-Host ""
Write-Host "Step 3: OpenRouter AI Setup" -ForegroundColor Yellow
Write-Host "------------------------------" -ForegroundColor Yellow
Write-Host "1. Go to https://openrouter.ai/" -ForegroundColor White
Write-Host "2. Sign up for a free account" -ForegroundColor White
Write-Host "3. Get your API key from the dashboard" -ForegroundColor White
Write-Host ""

$OPENROUTER_KEY = Read-Host "Enter your OpenRouter API Key (or press Enter to skip)"

# Step 4: Railway Deployment
Write-Host ""
Write-Host "Step 4: Railway Backend Deployment" -ForegroundColor Yellow
Write-Host "-------------------------------------" -ForegroundColor Yellow
Write-Host "1. Go to https://railway.app" -ForegroundColor White
Write-Host "2. Sign up and connect your GitHub account" -ForegroundColor White
Write-Host "3. Click 'New Project' -> 'Deploy from GitHub repo'" -ForegroundColor White
Write-Host "4. Select this repository" -ForegroundColor White
Write-Host "5. Railway will auto-detect Python and deploy" -ForegroundColor White
Write-Host "6. Add these environment variables in Railway:" -ForegroundColor White
Write-Host ""
Write-Host "DATABASE_URL=$SUPABASE_URL" -ForegroundColor Cyan
Write-Host "OPENROUTER_API_KEY=$OPENROUTER_KEY" -ForegroundColor Cyan
Write-Host "OPENROUTER_MODEL=deepseek/deepseek-chat:free" -ForegroundColor Cyan
Write-Host "FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID" -ForegroundColor Cyan
Write-Host "FRONTEND_URL=https://your-vercel-app.vercel.app" -ForegroundColor Cyan
Write-Host "AUTH_MODE=firebase" -ForegroundColor Cyan
Write-Host "ENVIRONMENT=production" -ForegroundColor Cyan
Write-Host "CLOUD_PLATFORM=railway" -ForegroundColor Cyan
Write-Host "PORT=8000" -ForegroundColor Cyan
Write-Host ""

$RAILWAY_URL = Read-Host "Enter your Railway backend URL (after deployment)"

# Step 5: Vercel Deployment
Write-Host ""
Write-Host "Step 5: Vercel Frontend Deployment" -ForegroundColor Yellow
Write-Host "------------------------------------" -ForegroundColor Yellow
Write-Host "1. Go to https://vercel.com" -ForegroundColor White
Write-Host "2. Sign up and connect your GitHub account" -ForegroundColor White
Write-Host "3. Click 'New Project' -> Import this repository" -ForegroundColor White
Write-Host "4. Vercel will auto-detect Next.js" -ForegroundColor White
Write-Host "5. Add these environment variables in Vercel:" -ForegroundColor White
Write-Host ""
Write-Host "NEXT_PUBLIC_API_URL=$RAILWAY_URL" -ForegroundColor Cyan
Write-Host "NEXT_PUBLIC_FIREBASE_API_KEY=$FIREBASE_API_KEY" -ForegroundColor Cyan
Write-Host "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN" -ForegroundColor Cyan
Write-Host "NEXT_PUBLIC_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID" -ForegroundColor Cyan
Write-Host "NEXT_PUBLIC_AUTH_MODE=firebase" -ForegroundColor Cyan
Write-Host ""

# Create production environment file
Write-Host ""
Write-Host "Creating production environment file..." -ForegroundColor Green

$envContent = "# Production Environment Configuration`n" +
"# Generated by deploy.ps1 script`n`n" +
"# Database`n" +
"DATABASE_URL=$SUPABASE_URL`n" +
"CLOUD_PLATFORM=supabase`n" +
"ENVIRONMENT=production`n`n" +
"# AI Service`n" +
"OPENROUTER_API_KEY=$OPENROUTER_KEY`n" +
"OPENROUTER_MODEL=deepseek/deepseek-chat:free`n`n" +
"# Firebase Configuration`n" +
"FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID`n`n" +
"# Frontend Configuration`n" +
"NEXT_PUBLIC_FIREBASE_API_KEY=$FIREBASE_API_KEY`n" +
"NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN`n" +
"NEXT_PUBLIC_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID`n" +
"NEXT_PUBLIC_API_URL=$RAILWAY_URL`n" +
"FRONTEND_URL=https://your-vercel-frontend.vercel.app`n`n" +
"# Authentication`n" +
"AUTH_MODE=firebase`n`n" +
"# Application`n" +
"PORT=8000"

$envContent | Out-File -FilePath ".env.production" -Encoding UTF8

Write-Host "Production environment file created: .env.production" -ForegroundColor Green
Write-Host ""
Write-Host "Cloud deployment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Complete Railway deployment with the environment variables shown above" -ForegroundColor White
Write-Host "2. Complete Vercel deployment with the environment variables shown above" -ForegroundColor White
Write-Host "3. Update FRONTEND_URL in Railway with your actual Vercel URL" -ForegroundColor White
Write-Host "4. Test your deployed application!" -ForegroundColor White
Write-Host ""
Write-Host "Your app will be available at:" -ForegroundColor Cyan
Write-Host "   Frontend: https://your-vercel-app.vercel.app" -ForegroundColor White
Write-Host "   Backend API: $RAILWAY_URL" -ForegroundColor White
Write-Host ""
Write-Host "AI Agent Features:" -ForegroundColor Magenta
Write-Host "   - Admin-only access to AI assistant" -ForegroundColor White
Write-Host "   - Can create/update products and orders" -ForegroundColor White
Write-Host "   - Full CRUD operations with authentication" -ForegroundColor White
Write-Host ""
Write-Host "Support: Check Railway/Vercel logs if deployment fails" -ForegroundColor Yellow