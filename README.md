# AI Support Agent

An AI-powered support agent trained on your company's knowledge base and chat style. Built with Next.js, OpenAI, and deployable to Vercel.

## Features

- **Custom Knowledge Base**: Train the AI on your FAQs, policies, and product docs
- **Chat Style Learning**: Teach the AI your team's communication style
- **Embeddable Widget**: Add to any website with a simple script tag
- **Real-Time Voice Calls**: Let customers call and talk to AI (powered by Ultravox)
- **Bilingual Support**: English and Bulgarian with automatic language detection
- **Modern Stack**: Next.js 14, TypeScript, OpenAI GPT-4, Ultravox Voice AI

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```
# Required for text chat
OPENAI_API_KEY=sk-proj-your-api-key-here
COMPANY_NAME=Your Company Name
OPENAI_MODEL=gpt-4o-mini

# Optional: For voice calling (30 free minutes!)
ULTRAVOX_API_KEY=your-ultravox-api-key-here
```

**Get Ultravox API Key:**
1. Sign up at https://app.ultravox.ai (free account)
2. Go to Settings → API Keys
3. Create new key and add to `.env.local`

### 3. Add Your Knowledge Base

Add documents to the `knowledge-base/` folder:
- `faq-general.md` - Common questions
- `policy-refunds.md` - Refund policy
- `examples-chat-style.md` - How your team talks

See `knowledge-base/README.md` for details.

### 4. Run Locally

```bash
npm run dev
```

Open http://localhost:3000 to test the chat.

### 5. Test Voice Calling (Optional)

If you added `ULTRAVOX_API_KEY`, test voice calls:

```bash
# Open the voice test page
open http://localhost:3000/voice-test
```

Or visit http://localhost:3000/voice-test in your browser:
- Click "Start Voice Call"
- Allow microphone access
- Talk to your AI support agent in real-time!
- Supports both English and Bulgarian

## Deploy to Vercel

### Option A: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add OPENAI_API_KEY
vercel env add COMPANY_NAME

# Deploy to production
vercel --prod
```

### Option B: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `OPENAI_API_KEY` = your OpenAI key
   - `COMPANY_NAME` = Your Company
5. Deploy

## Embed on Your Website

After deployment, add this to your website:

```html
<!-- Configuration (customize these) -->
<script>
  window.AI_SUPPORT_API_URL = 'https://your-app.vercel.app';
  window.AI_SUPPORT_TITLE = 'Support';
  window.AI_SUPPORT_COLOR = '#007bff';
  window.AI_SUPPORT_GREETING = 'Hi! How can I help you today?';
  window.AI_SUPPORT_POSITION = 'right'; // or 'left'
</script>

<!-- Load the widget -->
<script src="https://your-app.vercel.app/widget.js"></script>
```

## Training with Your Chat Logs

### Method 1: Manual

Create `knowledge-base/examples-chat-style.md` with conversations:

```markdown
## Example 1
Customer: Hi, I need help with my order
Agent: Hello! I'd be happy to help. What's your order number?
```

### Method 2: Automated

1. Export chat logs from your support system
2. Save as CSV, JSON, or TXT in `raw-data/` folder
3. Run: `npm run prepare-kb`

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts         # Chat API endpoint
│   │   │   └── voice/
│   │   │       └── create-call/
│   │   │           └── route.ts     # Voice call API
│   │   ├── voice-test/
│   │   │   └── page.tsx             # Voice test page
│   │   ├── layout.tsx
│   │   └── page.tsx                 # Chat test page
│   └── lib/
│       ├── openai.ts                # OpenAI client
│       └── knowledge-base.ts        # KB loader
├── public/
│   └── widget.js                    # Embeddable chat widget
├── knowledge-base/                  # Your training docs
├── scripts/
│   └── prepare-knowledge-base.ts
└── vercel.json                      # Deployment config
```

## Customization

### Change Colors

In your embed code:
```javascript
window.AI_SUPPORT_COLOR = '#your-brand-color';
```

### Change Model

In `.env.local`:
```
OPENAI_MODEL=gpt-4o  # More powerful, more expensive
# or
OPENAI_MODEL=gpt-3.5-turbo  # Cheaper, faster
```

### Adjust AI Behavior

Edit `src/lib/knowledge-base.ts` and modify the `buildSystemPrompt` function.

## Cost Estimation

### Text Chat (GPT-4o-mini)
- ~$0.15 per 1M input tokens
- ~$0.60 per 1M output tokens
- Typical conversation (10 messages): ~$0.001-0.002
- **1000 conversations/month: ~$1-5/month**

### Voice Calls (Ultravox)
- **$0.05 per minute** (1/3 the cost of OpenAI Realtime)
- **30 free minutes** to start
- 5-minute call: $0.25
- **100 calls/month (5 min avg): ~$25/month**
- Still cheaper than human agents at $15/hour!

## Support

Issues? Check:
1. OpenAI API key is valid and has credits
2. `.env.local` file exists with correct values
3. Knowledge base has at least one `.md` file
