# 🎙️ Voice Calling Setup Guide

## Quick Start (5 Minutes)

### Step 1: Get Your Free Ultravox API Key

1. **Sign up** at https://app.ultravox.ai
   - Free account with **30 minutes** of call time
   - No credit card required

2. **Create API Key:**
   - Click on **Settings** in left navigation
   - Or go directly to https://app.ultravox.ai/settings/
   - Find the **API Keys** section
   - Click **"Generate New Key"**
   - Give it a name (e.g., "AI Support Test")
   - **Copy the key** (format: `Zk9Ht7Lm.wX7pN9fM3kLj6tRq2bGhA8yE5cZvD4sT`)

### Step 2: Add to Environment Variables

Edit your `.env.local` file and add:

```bash
ULTRAVOX_API_KEY=your-api-key-here
```

Full example:
```bash
OPENAI_API_KEY=sk-proj-your-api-key-here
COMPANY_NAME=Your Company Name
ULTRAVOX_API_KEY=Zk9Ht7Lm.wX7pN9fM3kLj6tRq2bGhA8yE5cZvD4sT
```

### Step 3: Restart Your Dev Server

```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

### Step 4: Test Voice Calling!

1. Open http://localhost:3000/voice-test
2. Select language (English or Bulgarian)
3. Click **"Start Voice Call"**
4. Allow microphone access when prompted
5. Start talking to your AI support agent!

---

## 📁 What Was Added

### New Files Created:

1. **API Route:** `/src/app/api/voice/create-call/route.ts`
   - Creates Ultravox calls
   - Uses your existing knowledge base
   - Supports bilingual (EN/BG)

2. **Test Page:** `/src/app/voice-test/page.tsx`
   - Beautiful UI to test voice calls
   - Language selector
   - Auto-opens call window

3. **Environment:** `.env.example` updated
   - Added `ULTRAVOX_API_KEY` variable

---

## 🎯 How It Works

```
User clicks "Start Voice Call"
  ↓
Your Next.js app calls Ultravox API
  ↓
Ultravox creates call with your knowledge base
  ↓
Returns joinUrl (web-based call interface)
  ↓
User talks to AI in browser (like Zoom/Meet)
  ↓
AI responds using your knowledge base docs
```

---

## 🌟 Features

- ✅ **Real-time voice** (low latency)
- ✅ **Bilingual** (English & Bulgarian)
- ✅ **Uses your knowledge base** (same as text chat)
- ✅ **Web-based** (no phone number needed for testing)
- ✅ **30 free minutes** included
- ✅ **$0.05/minute** after free tier

---

## 🔊 Voice Options

Default voice: `terrence` (male, clear)

To change voice, edit `/src/app/api/voice/create-call/route.ts`:

```typescript
voice: 'terrence',  // Options: terrence, mark, emma, etc.
```

Check Ultravox docs for all voice options.

---

## 📞 Adding Real Phone Calls (Later)

The current implementation uses **web-based calls** (browser microphone).

To add **real phone calling** (customers dial a number):

1. **Sign up for Voximplant** (Ultravox partner)
2. **Get a phone number** (~$1-2/month)
3. **Connect to Ultravox** (webhook integration)
4. Customers can now dial in!

Cost: $0.05/min (Ultravox) + $0.01-0.02/min (carrier fees) = **~$0.07/min total**

---

## 🐛 Troubleshooting

### Error: "ULTRAVOX_API_KEY not configured"

**Fix:**
1. Make sure `.env.local` exists (not `.env.example`)
2. Check the API key is correctly pasted
3. Restart your dev server (`npm run dev`)

### Error: "API key is invalid"

**Fix:**
1. Go to https://app.ultravox.ai/settings/
2. Delete the old key
3. Create a new one
4. Update `.env.local`

### Call window opens but no sound

**Fix:**
1. Check browser permissions (allow microphone)
2. Try a different browser (Chrome works best)
3. Check your microphone is working in other apps

### AI doesn't know my knowledge base

**Fix:**
1. Check `knowledge-base/` folder has `.md` files
2. Restart server to reload knowledge base
3. Check console logs for loaded documents

---

## 💰 Cost Breakdown

### Testing (30 free minutes):
- **$0** for first 30 minutes
- Test ~6 calls (5 min each)

### After Free Tier:
- **$0.05/minute** = $3/hour
- 5-minute support call = **$0.25**
- 100 calls/month (5 min avg) = **$25/month**

Compare to human agent:
- $15/hour minimum wage
- 100 calls × 5 min = 8.3 hours
- Cost: **$125/month**

**Savings: $100/month (80% cheaper!)**

---

## 🚀 Next Steps

1. ✅ Test with English knowledge base
2. ✅ Test with Bulgarian knowledge base
3. 📱 Add phone number (Voximplant)
4. 🌐 Deploy to Vercel
5. 📊 Monitor usage at https://app.ultravox.ai

---

## 📚 Resources

- **Ultravox Dashboard:** https://app.ultravox.ai
- **Ultravox Docs:** https://docs.ultravox.ai
- **Voice Test Page:** http://localhost:3000/voice-test
- **Chat Test Page:** http://localhost:3000

---

**Questions?** Check the updated README.md or Ultravox documentation!
