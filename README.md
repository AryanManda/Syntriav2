## Syntria

AI-powered workspace that automates onboarding, detects risk, and supercharges product teams.

Syntria is an all-in-one platform that blends workflow automation, AI risk analysis, and intelligent product tooling. It handles vendor/client onboarding, flags risks in real time, generates product strategy for PMs, and drafts tasks and sprint plans on command — all inside a unified workspace.

## Features
### 1. AI Onboarding and Risk Detection

Step-by-step onboarding wizard

Gemini-powered risk scoring

Auto-routing (Low → auto-approve, Medium → manager review, High → risk committee)

Document, PII, and control checks

Built-in audit trail with CSV export

### 2. Product Management AI Suite

Strategy Agent

Sprint Planner

Task Generator

Idea Evaluator

Research Summaries

Product requirements generation

### 3. Workflow Automation

Auto-generated notes and summaries

Calendar-ready task breakdowns

Automated decommissioning flows

Unified admin panel for backend testing

## Tech Stack
### Frontend

Vite + React

TypeScript

TailwindCSS

ShadCN UI

### Backend

Node.js

Express

Gemini API (risk scoring + PM agents)

ElevenLabs (optional voice agent)

Serverless-style API endpoints

### Dev Tools

GitHub

Vercel (optional deployment)

npm + tsx

## Getting Started
### 1. Clone the repository
git clone https://github.com/bforce541/syntria
cd syntria

### 2. Install dependencies
npm install

### 3. Add your environment variables

Create a file named .env.local:

GEMINI_API_KEY=your_key_here
ELEVENLABS_API_KEY=optional_voice_key

### 4. Run the app
npm run dev
```

The app will be available at `http://localhost:8080`

### Environment Variables

Required (at least one):
```bash
GEMINI_API_KEY=your_gemini_api_key
# or
OPENAI_API_KEY=your_openai_api_key
```

Optional integrations:
```bash
ELEVENLABS_API_KEY=your_elevenlabs_key
NOTION_API_KEY=your_notion_key
GOOGLE_CALENDAR_CREDENTIALS_JSON=your_credentials
```

## Demo Script

### 2-Minute PM Workbench Demo
1. Navigate to **Overview** → Click "Try PM Workbench"
2. **Strategy Agent**: Enter market, segment, goals → Generate strategy (10s)
3. **Research Agent**: Paste feedback → Analyze insights
4. **Planning Agent**: Add requirements → Generate backlog and sprint plan
5. **Export**: Download artifacts as CSV/Markdown

### 90-Second Onboarding Demo
1. Navigate to **Overview** → Click "Try Onboarding"
2. Complete 4-step wizard (Company Info → Docs → Controls → Review)
3. View AI risk score and routing decision
4. Check **Audit Trail** for immutable events

- Perfect for quick 2-minute pitches

## Tech Stack

- **Frontend**: Vite + React + TypeScript, TailwindCSS, shadcn/ui
- **State**: Zustand
- **Charts**: Recharts
- **API**: Express serverless functions
- **AI**: Google Gemini (default) or OpenAI
- **Voice**: ElevenLabs TTS (optional)
- **Integrations**: Google Calendar + Notion (optional, mocked by default)

## API Endpoints

Health check:
```bash
curl http://localhost:8787/api/health
```

Test risk scoring:
```bash
curl -X POST http://localhost:8787/api/risk-score \
  -H "Content-Type: application/json" \
  -d '{
    "controls": {
      "iam": false,
      "encryption": true,
      "logging": true
    },
    "handlesPII": true
  }'
```

## Deployment

### Vercel
1. Connect your repository to Vercel
2. Add environment variables in project settings
3. Deploy (serverless functions auto-detected in `/api/*`)

The development Express server is only for local development. In production, Vercel will handle the API routes as serverless functions.

## Architecture

```
src/
├── components/      # UI components (TopBar, Navigation, Layout)
├── pages/          # Route pages (Overview, Workbench, Admin, etc.)
├── lib/            # Utilities, types, store, API client
└── hooks/          # React hooks

server/
└── index.ts        # Express dev server (proxied by Vite)
```

## License

MIT

---

Built with ❤️ using Lovable
