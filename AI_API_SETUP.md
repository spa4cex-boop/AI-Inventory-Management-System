# AI API Setup Guide - Free Options

Your Netlify deployment now supports multiple free LLM APIs with intelligent fallback. Here's how to enable them.

## Quick Start (Recommended)

### Option 1: Groq API (Fastest & Completely Free) ⭐

**Best Choice**: Groq offers completely free API access with excellent speed and no payment required.

1. **Sign up for free** at https://console.groq.com/keys
2. **Get your API key** from the dashboard
3. **Add to Netlify environment variables:**
   - Go to https://app.netlify.com/projects/ai-inventory-management
   - Site settings → Build & deploy → Environment
   - Add new variable: `GROQ_API_KEY` = your key from step 2
   - (Optional) `GROQ_MODEL` = `mixtral-8x7b-32768` (default, fastest free model)

4. **Trigger a redeploy:**
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"

**Why Groq?**
- ✅ Completely free tier (no credit card needed after sign-up)
- ✅ Fastest inference speed (perfect for real-time responses)
- ✅ No rate limits for reasonable usage
- ✅ Models: Mixtral 8x7B, LLaMA 2 70B, Gemma

---

### Option 2: OpenRouter (Free Trial + Cheap)

1. Sign up at https://openrouter.ai
2. Get free trial credits
3. Add to Netlify:
   - `OPENROUTER_API_KEY` = your key
   - `OPENROUTER_MODEL` = `deepseek/deepseek-chat:free` (free model option)
4. Deploy

---

### Option 3: HuggingFace Inference API (Free Tier)

1. Sign up at https://huggingface.co
2. Create an API token at https://huggingface.co/settings/tokens
3. Add to Netlify:
   - `HUGGINGFACE_API_KEY` = your token
4. Deploy

---

## Current Implementation

Your `netlify/functions/api.js` now supports this priority order:

```
1. OpenRouter API (if OPENROUTER_API_KEY configured)
   ↓
2. Groq API (if GROQ_API_KEY configured) ← RECOMMENDED
   ↓
3. HuggingFace API (if HUGGINGFACE_API_KEY configured)
   ↓
4. Intelligent Fallback Response (always works, no API needed)
```

**Fallback Response**: Even without any API key, the system generates smart responses based on keywords in your prompt. This ensures the AI Assistant always returns useful guidance.

---

## Environment Variables Summary

| Variable | Value | Free? | Speed | Notes |
|----------|-------|-------|-------|-------|
| `GROQ_API_KEY` | Your Groq key | ✅ Yes | ⚡ Fastest | **Recommended** |
| `OPENROUTER_API_KEY` | Your OpenRouter key | ✅ Trial | Fast | Paid after trial |
| `HUGGINGFACE_API_KEY` | Your HF token | ✅ Yes | Slow | Rate-limited free tier |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase JSON | Required | - | For database access |

---

## Step-by-Step: Add Groq to Netlify

1. **Open Groq Console**: https://console.groq.com/keys
2. **Create/Copy API Key**
3. **Go to Netlify Site**:
   ```
   https://app.netlify.com/projects/ai-inventory-management
   ```
4. **Navigate to Environment**:
   - Click "Site settings" (top right)
   - Left sidebar: "Build & deploy"
   - Click "Environment"
   - Click "Edit variables"
5. **Add New Variable**:
   - Key: `GROQ_API_KEY`
   - Value: (paste your Groq API key)
   - Click "Save"
6. **Redeploy**:
   - Click "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"
   - Wait for build to complete (~2-3 min)
7. **Test**:
   - Go to https://ai-inventory-management.netlify.app
   - Click "Dashboard" → "AI Assistant"
   - Ask a question like "What products are low in stock?"
   - Should now get a response!

---

## Testing AI Responses

### Using cURL (Terminal):

```bash
# Test the AI endpoint
curl -X POST https://ai-inventory-management.netlify.app/api/ai/assist \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What inventory management best practices do you recommend?"}'
```

### Using the Web UI:

1. Open https://ai-inventory-management.netlify.app
2. Log in (or use demo mode)
3. Go to Dashboard → AI Assistant tab
4. Type a prompt and click "Send"
5. Should see intelligent response

---

## Troubleshooting

### Still seeing "Unable to contact the AI assistant"?

1. **Check Netlify Build Logs**:
   - Go to https://app.netlify.com/projects/ai-inventory-management
   - Click "Deploys"
   - Click latest deploy
   - Scroll to "Build log" section
   - Look for errors mentioning API keys

2. **Verify Environment Variable**:
   - Settings → Build & deploy → Environment
   - Confirm `GROQ_API_KEY` is set (should show as `•••` if hidden)
   - Click "Reveal" to verify it's there

3. **Force Redeploy**:
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"
   - Wait for deploy to finish (check status)

4. **Check API Key**:
   - Go to https://console.groq.com/keys
   - Verify your key still exists and is valid
   - Try creating a new key

### Getting timeout errors?

- Groq API is very fast, but first request may take 5-10 seconds
- Fallback response should always work instantly

---

## API Response Format

Success response:
```json
{
  "success": true,
  "data": {
    "assistant": "Your AI-generated response here..."
  }
}
```

Fallback response (no API configured):
```json
{
  "success": true,
  "data": {
    "assistant": "Inventory Assistant Response:\n\nRegarding your inquiry...\n- Smart recommendations based on keywords"
  }
}
```

---

## Cost Comparison

| API | Free Tier | Typical Cost |
|-----|-----------|-------------|
| **Groq** | Unlimited | Free (and paid tier) |
| **OpenRouter** | $5 trial credit | $0.001-0.01 per 1K tokens |
| **HuggingFace** | 30k requests/month | Free + paid options |
| **Fallback** | Unlimited | Free |

**Recommendation**: Start with Groq (free, fast, no payment required).

---

## Next Steps

1. ✅ Add `GROQ_API_KEY` to Netlify environment
2. ✅ Trigger redeploy
3. ✅ Test AI assistant in the dashboard
4. ✅ Monitor function logs at https://app.netlify.com/projects/ai-inventory-management/logs/functions

---

## Support

- **Groq Help**: https://console.groq.com/docs/quickstart
- **Netlify Env Vars**: https://docs.netlify.com/configure-builds/environment-variables/
- **OpenRouter Docs**: https://openrouter.ai/docs
- **HuggingFace Docs**: https://huggingface.co/docs/api-inference
