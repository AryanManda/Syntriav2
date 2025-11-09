# Syntria

> AI agents for product leaders — from onboarding to execution

Syntria combines a lightweight vendor/client onboarding hub with a Product Manager AI workbench powered by multi-agent automation.

## Features

### PM Workbench
- **Strategy Agent**: Generate product briefs, North Star metrics, and roadmaps
- **Research Agent**: Synthesize feedback, cluster themes, identify opportunities
- **Planning Agent**: Create user stories, acceptance criteria, and sprint plans
- **GTM Agent**: Draft personas, messaging, and launch checklists
- **Automation Agent**: Sync to Calendar and Notion, export artifacts

### Onboarding Hub
- 4-step wizard with AI risk scoring
- Automated compliance routing
- Vendor and client onboarding
- Immutable audit trails

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- At least one AI provider API key (Gemini or OpenAI)

### Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd productboardiq

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.local.example .env.local
# Edit .env.local and add your API keys

# 4. Start development servers
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
