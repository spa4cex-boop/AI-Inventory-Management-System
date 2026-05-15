# Railway URL Helper Script
# This script helps you get your Railway backend URL after deployment

Write-Host "🚂 Railway Backend URL Helper" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "After deploying to Railway, follow these steps to get your backend URL:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Go to your Railway project dashboard" -ForegroundColor White
Write-Host "   URL: https://railway.app/dashboard" -ForegroundColor Cyan
Write-Host ""

Write-Host "2. Click on your deployed project" -ForegroundColor White
Write-Host ""

Write-Host "3. Go to the 'Settings' tab" -ForegroundColor White
Write-Host ""

Write-Host "4. Copy the 'Public URL' from the Domains section" -ForegroundColor White
Write-Host "   It will look like: https://your-project-name.up.railway.app" -ForegroundColor Green
Write-Host ""

Write-Host "5. Use this URL for:" -ForegroundColor Yellow
Write-Host "   - Vercel NEXT_PUBLIC_API_URL environment variable" -ForegroundColor White
Write-Host "   - Frontend API calls" -ForegroundColor White
Write-Host "   - Testing your backend endpoints" -ForegroundColor White
Write-Host ""

Write-Host "Example URLs you might see:" -ForegroundColor Magenta
Write-Host "   https://ai-inventory-backend.up.railway.app" -ForegroundColor White
Write-Host "   https://inventory-system-production.up.railway.app" -ForegroundColor White
Write-Host "   https://your-custom-name.up.railway.app" -ForegroundColor White
Write-Host ""

Write-Host "Once you have the URL, update your Vercel deployment!" -ForegroundColor Green
Write-Host ""

# Ask user to input their Railway URL for validation
$railwayUrl = Read-Host "Enter your Railway backend URL (or press Enter to skip)"
if ($railwayUrl) {
    Write-Host ""
    Write-Host "✅ Validating URL format..." -ForegroundColor Yellow

    if ($railwayUrl -match "^https://.+\.up\.railway\.app/?$") {
        Write-Host "✅ URL format looks correct!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Set NEXT_PUBLIC_API_URL=$railwayUrl in Vercel" -ForegroundColor White
        Write-Host "2. Update vercel.json rewrites to point to $railwayUrl" -ForegroundColor White
        Write-Host "3. Redeploy your Vercel frontend" -ForegroundColor White
    } else {
        Write-Host "⚠️  URL format might be incorrect. Expected: https://something.up.railway.app" -ForegroundColor Red
        Write-Host "Please double-check the URL in your Railway dashboard" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Need help? Check the DEPLOYMENT_GUIDE.md file!" -ForegroundColor Cyan