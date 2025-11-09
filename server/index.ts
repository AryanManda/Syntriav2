import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createEvents, EventAttributes } from 'ics';
import { google } from 'googleapis';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.API_PORT || 8787;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    const provider = geminiKey ? 'gemini' : 
                    process.env.OPENAI_API_KEY ? 'openai' : 'none';
    
    console.log('🔍 Health check - GEMINI_API_KEY present:', !!geminiKey);
    console.log('🔍 Key length:', geminiKey?.length || 0);
    
    res.json({
      ok: true,
      provider,
      hasKey: provider !== 'none',
      keyLength: geminiKey?.length || 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Strategy Agent - Generate comprehensive product strategy using AI
app.post('/api/pm/strategy', async (req, res) => {
  try {
    const { market, segment, goals, constraints } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'AI API key required. Please set GEMINI_API_KEY or OPENAI_API_KEY in .env.local' 
      });
    }

    console.log('📊 Generating strategy with AI...');
    
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = `You are a senior product strategist and advisor with 15+ years of experience at leading tech companies (Google, Amazon, Microsoft, etc.). You're providing strategic counsel to help build a successful product.

PRODUCT IDEA CONTEXT:
- Target Market: ${market || 'Not specified - analyze and recommend'}
- Customer Segment: ${segment || 'Not specified - identify and define'}
- Business Goals: ${goals && goals.length > 0 ? goals.join(', ') : 'Not specified - suggest strategic goals'}
- Constraints: ${constraints && constraints.length > 0 ? constraints.join(', ') : 'None specified'}

Your task: Create a comprehensive product strategy brief that reads like an executive summary and strategic advisory document. This should be insightful, actionable, and provide real strategic value.

Generate a detailed JSON response with this exact structure:
{
  "executiveSummary": "A compelling 2-3 paragraph executive summary that captures the product vision, opportunity, and strategic approach. Write this like a brief you'd present to executives.",
  "northStar": "A clear, inspiring North Star metric (1-2 sentences that define what success looks like)",
  "marketOpportunity": "A detailed analysis of the market opportunity - size, trends, timing, and why now. Be specific with numbers and trends if possible.",
  "competitiveLandscape": "Analysis of the competitive landscape - who are the main players, what are they doing well/poorly, and where is the whitespace opportunity?",
  "strategicRecommendations": [
    "Strategic recommendation 1 - specific, actionable advice for how to approach this product",
    "Strategic recommendation 2",
    "Strategic recommendation 3",
    "Strategic recommendation 4"
  ],
  "icps": [
    {
      "segment": "Specific customer segment name",
      "description": "Detailed description of this segment",
      "painPoints": ["Primary pain point 1 with context", "Primary pain point 2 with context", "Primary pain point 3 with context"],
      "opportunities": ["Opportunity 1 with rationale", "Opportunity 2 with rationale"],
      "buyingBehavior": "How this segment makes purchasing decisions"
    }
  ],
  "successMetrics": [
    {
      "metric": "Specific metric name",
      "target": "Target value and timeline",
      "rationale": "Why this metric matters"
    }
  ],
  "goToMarketConsiderations": [
    "GTM consideration 1 - specific advice on how to bring this to market",
    "GTM consideration 2",
    "GTM consideration 3"
  ],
  "risksAndChallenges": [
    {
      "risk": "Specific risk or challenge",
      "impact": "high|medium|low",
      "mitigation": "How to mitigate or address this risk"
    }
  ],
  "timelineAndMilestones": "Recommended timeline and key milestones for product development and launch. Be specific with phases.",
  "constraints": ${JSON.stringify(constraints || [])},
  "prd": "# Product Requirements Document\\n\\n## Vision\\n\\n[Clear, compelling vision statement]\\n\\n## Problem Statement\\n\\n[Detailed problem statement - what problem are we solving and why it matters]\\n\\n## Target Users\\n\\n[Detailed description of target users with personas]\\n\\n## Key Features\\n\\n[Core features and capabilities with prioritization]\\n\\n## User Experience\\n\\n[Key UX considerations and principles]\\n\\n## Success Metrics\\n\\n[How we measure success with specific targets]\\n\\n## Timeline\\n\\n[Detailed timeline with phases and milestones]\\n\\n## Risks & Mitigation\\n\\n[Key risks and how to address them]\\n\\n## Dependencies\\n\\n[Key dependencies and assumptions]"
}

Write this like a strategic brief from a top consulting firm or senior product advisor. Be specific, data-driven where possible, and provide real strategic value. Include actionable advice throughout. Return ONLY valid JSON, no markdown code blocks.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Parse JSON from response
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
      }
      
      const aiData = JSON.parse(jsonText);
      
      const response = {
        success: true,
        data: {
          executiveSummary: aiData.executiveSummary || '',
          northStar: aiData.northStar || `Build the leading ${market || 'product'} solution for ${segment || 'customers'}`,
          marketOpportunity: aiData.marketOpportunity || '',
          competitiveLandscape: aiData.competitiveLandscape || '',
          strategicRecommendations: aiData.strategicRecommendations || [],
          icps: aiData.icps || [],
          successMetrics: aiData.successMetrics || [],
          goToMarketConsiderations: aiData.goToMarketConsiderations || [],
          risksAndChallenges: aiData.risksAndChallenges || [],
          timelineAndMilestones: aiData.timelineAndMilestones || '',
          constraints: aiData.constraints || constraints || [],
          prd: aiData.prd || '# Product Brief\n\n## Vision\n\n...',
        },
        trace: [
          {
            timestamp: new Date().toISOString(),
            agent: 'strategy',
            action: 'generate_brief',
            input: { market, segment, goals, constraints },
            output: 'Generated comprehensive product strategy brief using AI',
          },
        ],
      };

      res.json(response);
    } catch (aiError: any) {
      console.error('❌ AI generation error:', aiError.message);
      res.status(500).json({ 
        error: `Failed to generate strategy: ${aiError.message}. Please check your API key and try again.` 
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Customer Advisory Agent - Chatbot that acts like a customer
app.post('/api/pm/customer-advisory', async (req, res) => {
  try {
    const { message, conversationHistory, customerSegment, market } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'AI API key required. Please set GEMINI_API_KEY or OPENAI_API_KEY in .env.local' 
      });
    }

    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    console.log('👥 Customer chatbot responding...');
    
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      // Build conversation context
      const segmentContext = customerSegment 
        ? `You are a real customer/user from this segment: "${customerSegment}"`
        : 'You are a real customer/user';
      
      const marketContext = market 
        ? `in the ${market} market`
        : '';

      // Build conversation history for context
      let conversationContext = '';
      if (conversationHistory && conversationHistory.length > 0) {
        conversationContext = '\n\nPrevious conversation:\n';
        conversationHistory.forEach((msg: any) => {
          if (msg.role === 'user') {
            conversationContext += `PM: ${msg.content}\n`;
          } else if (msg.role === 'assistant') {
            conversationContext += `Customer: ${msg.content}\n`;
          }
        });
      }

      const systemPrompt = `You are a real customer ${marketContext} ${segmentContext ? `(${customerSegment})` : ''}. 

IMPORTANT INSTRUCTIONS:
- Respond as if you are an actual user/customer, NOT as an AI assistant
- Be authentic, honest, and realistic in your responses
- Express real pain points, frustrations, needs, and desires
- Use natural, conversational language (not overly formal)
- Show emotion when appropriate (frustration, excitement, confusion, etc.)
- Be specific about your experiences and needs
- If you don't know something, say so naturally
- Don't be overly positive - be realistic about both good and bad experiences
- Think about what a real customer would actually say in this situation
- If asked about features you haven't used, respond as a customer would ("I haven't tried that yet" or "I didn't know that existed")
- Share your actual workflow and how you use products in your daily life/work
- Mention competitors you use if relevant
- Be honest about what would make you switch or stay

Your role: Help the product manager understand what customers like you actually need, want, and experience.`;

      const prompt = `${systemPrompt}

${conversationContext}

Current question from PM: "${message}"

Respond as a real customer would. Be authentic and helpful. Keep your response conversational and natural (2-4 sentences typically, but can be longer if the question warrants it).`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      const response = {
        success: true,
        data: {
          message: text.trim(),
        },
        trace: [
          {
            timestamp: new Date().toISOString(),
            agent: 'customer-advisory',
            action: 'chat_response',
            input: { message, customerSegment, market },
            output: 'Generated customer response',
          },
        ],
      };

      res.json(response);
    } catch (aiError: any) {
      console.error('❌ AI generation error:', aiError.message);
      res.status(500).json({ 
        error: `Failed to generate customer response: ${aiError.message}. Please check your API key and try again.` 
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Planning and GTM agents removed - functionality consolidated into Strategy and Customer Advisory agents

// Helper function to generate 2-week plan using AI
async function generateTwoWeekPlan(goal: string, strategy: string, startDate: Date, constraints: string[]): Promise<any[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    // Fallback plan without AI
    const plan = [];
    for (let i = 1; i <= 14; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i - 1);
      plan.push({
        day: i,
        date: date.toISOString().split('T')[0],
        task: `Work on: ${goal} (Day ${i})`,
        description: `Day ${i} tasks and milestones`,
        status: 'planned',
      });
    }
    return plan;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are a productivity expert. Create a detailed 2-week (14-day) plan to achieve this goal: "${goal}"

${strategy ? `Strategy: ${strategy}` : ''}
${constraints.length > 0 ? `Constraints: ${constraints.join(', ')}` : ''}

Generate a JSON array with 14 items, one for each day. Each item should have:
- day: number (1-14)
- task: string (specific task for that day)
- description: string (detailed description of what to do)
- duration: string (estimated time, e.g., "2 hours")

Return ONLY a valid JSON array, no markdown or extra text. Make it specific, actionable, and broken down into daily tasks that build toward the goal.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse JSON from response
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }
    
    const plan = JSON.parse(jsonText);
    
    // Add dates to each day
    return plan.map((item: any, index: number) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + index);
      return {
        ...item,
        date: date.toISOString().split('T')[0],
        status: 'planned',
      };
    });
  } catch (error: any) {
    console.error('Error generating plan with AI:', error.message);
    // Fallback plan
    const plan = [];
    for (let i = 1; i <= 14; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i - 1);
      plan.push({
        day: i,
        date: date.toISOString().split('T')[0],
        task: `Work on: ${goal} (Day ${i})`,
        description: `Day ${i} tasks and milestones`,
        status: 'planned',
      });
    }
    return plan;
  }
}

// Helper function to create ICS calendar file
function createICSFile(plan: any[], goal: string): string {
  const events: EventAttributes[] = plan.map((item, index) => {
    const date = new Date(item.date);
    date.setHours(0, 0, 0, 0); // Reset to start of day
    const [year, month, day] = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
    
    // Parse duration from item if available, default to 2 hours
    let durationHours = 2;
    if (item.duration) {
      const durationMatch = item.duration.toString().match(/(\d+)\s*hour/i);
      if (durationMatch) {
        durationHours = parseInt(durationMatch[1]);
      }
    }
    
    return {
      title: item.task || `Day ${item.day}: Work on ${goal}`,
      description: `${item.description || item.task || ''}\n\nGoal: ${goal}`,
      start: [year, month, day, 9, 0], // 9 AM
      duration: { hours: durationHours },
      status: 'TENTATIVE' as const,
      busyStatus: 'BUSY' as const,
    };
  });

  const { error, value } = createEvents(events);
  
  if (error) {
    console.error('Error creating ICS file:', error);
    throw new Error(`Failed to create calendar file: ${error.message}`);
  }
  
  return value || '';
}

// Helper function to generate schedule from Strategy and Customer Advisory data
async function generateScheduleFromStrategyAndChat(
  strategyData: any,
  customerMessages: Array<{ role: string; content: string }>
): Promise<any[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  // Extract key information from strategy
  const northStar = strategyData.northStar || '';
  const strategicRecommendations = strategyData.strategicRecommendations || [];
  const marketOpportunity = strategyData.marketOpportunity || '';
  const risks = strategyData.risksAndChallenges || [];
  const timeline = strategyData.timelineAndMilestones || '';

  // Extract customer insights from chat
  const customerInsights = customerMessages
    .filter((msg: any) => msg.role === 'assistant')
    .map((msg: any) => msg.content)
    .join('\n\n');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1); // Start tomorrow

  const prompt = `You are a product management expert. Create a detailed 2-week (14-day) action plan for a product manager based on their strategy and customer insights.

STRATEGY CONTEXT:
- North Star Metric: ${northStar}
- Strategic Recommendations: ${strategicRecommendations.join(', ')}
- Market Opportunity: ${marketOpportunity.substring(0, 500)}
- Timeline: ${timeline.substring(0, 300)}
- Risks: ${risks.map((r: any) => typeof r === 'string' ? r : r.risk).join(', ')}

CUSTOMER INSIGHTS FROM CHAT:
${customerInsights.substring(0, 1000)}

Create a comprehensive 14-day schedule that:
1. Addresses the strategic recommendations
2. Incorporates customer insights and needs
3. Builds toward the North Star metric
4. Mitigates identified risks
5. Follows the suggested timeline

Generate a JSON array with 14 items, one for each day. Each item should have:
- day: number (1-14)
- task: string (specific, actionable task title)
- description: string (detailed description of what to accomplish)
- duration: string (e.g., "2 hours", "3 hours", "half day")
- priority: "high" | "medium" | "low"
- category: string (e.g., "Research", "Development", "Customer Validation", "Planning")

Return ONLY a valid JSON array, no markdown or extra text. Make it actionable and realistic.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse JSON from response
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }
    
    const plan = JSON.parse(jsonText);
    
    // Add dates to each day
    return plan.map((item: any, index: number) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + index);
      return {
        ...item,
        date: date.toISOString().split('T')[0],
        status: 'planned',
      };
    });
  } catch (error: any) {
    console.error('Error generating schedule:', error.message);
    throw error;
  }
}

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `http://localhost:8787/api/auth/google/callback`;

// In-memory token storage (in production, use a database)
const tokenStore: { [key: string]: any } = {};

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

// Get Google OAuth URL
app.get('/api/auth/google', (req, res) => {
  // Check if credentials are configured
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !oauth2Client) {
    return res.status(500).json({ 
      error: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local' 
    });
  }

  const scopes = ['https://www.googleapis.com/auth/calendar'];
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
  res.json({ authUrl });
});

// OAuth callback
app.get('/api/auth/google/callback', async (req, res) => {
  try {
    if (!oauth2Client) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/workbench?error=oauth_not_configured`);
    }

    const { code } = req.query;
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/workbench?error=no_code`);
    }

    const { tokens } = await oauth2Client.getToken(code as string);
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    tokenStore[sessionId] = tokens;

    // Redirect to frontend with session ID
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/workbench?auth=success&session=${sessionId}`);
  } catch (error: any) {
    console.error('OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/workbench?error=auth_failed`);
  }
});

// Helper function to create events directly in Google Calendar
async function createEventsInGoogleCalendar(calendarEvents: any[], accessToken: string): Promise<{ created: number; eventLinks: string[] }> {
  try {
    if (!oauth2Client) {
      throw new Error('OAuth2 client not initialized');
    }
    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const eventLinks: string[] = [];
    let created = 0;

    for (const event of calendarEvents) {
      try {
        const calendarEvent = {
          summary: event.title,
          description: event.description,
          start: {
            dateTime: event.start,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: event.end,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        };

        const response = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: calendarEvent,
        });

        if (response.data.htmlLink) {
          eventLinks.push(response.data.htmlLink);
          created++;
        }
      } catch (error: any) {
        console.error('Error creating event:', error.message);
      }
    }

    return { created, eventLinks };
  } catch (error: any) {
    console.error('Error with Google Calendar API:', error.message);
    throw error;
  }
}

// Automation Agent - Generate schedule and create events directly in Google Calendar
app.post('/api/pm/automation/sync-calendar', async (req, res) => {
  try {
    const { strategyData, customerMessages, sessionId } = req.body;
    
    if (!strategyData) {
      return res.status(400).json({ error: 'Strategy data is required. Please generate a strategy first.' });
    }

    if (!customerMessages || customerMessages.length === 0) {
      return res.status(400).json({ error: 'Customer chat messages are required. Please have a conversation with the customer chatbot first.' });
    }

    console.log('📅 Generating schedule from Strategy and Customer Advisory...');
    
    // Generate schedule using AI based on strategy and customer insights
    const plan = await generateScheduleFromStrategyAndChat(strategyData, customerMessages);
    
    // Create calendar events
    const calendarEvents = plan.map((item) => {
      const date = new Date(item.date + 'T09:00:00');
      const endDate = new Date(date);
      
      let hours = 2;
      if (item.duration) {
        const match = item.duration.toString().match(/(\d+)\s*hour/i);
        if (match) {
          hours = parseInt(match[1]);
        }
      }
      endDate.setHours(endDate.getHours() + hours);
      
      return {
        title: item.task,
        description: item.description || item.task,
        start: date.toISOString(),
        end: endDate.toISOString(),
        date: item.date,
        priority: item.priority || 'medium',
        category: item.category || 'Task',
      };
    });

    // Try to create events directly in Google Calendar if we have an access token
    let eventsCreated = 0;
    let eventLinks: string[] = [];
    let needsAuth = false;

    if (sessionId && tokenStore[sessionId]) {
      try {
        const tokens = tokenStore[sessionId];
        if (tokens.access_token) {
          const result = await createEventsInGoogleCalendar(calendarEvents, tokens.access_token);
          eventsCreated = result.created;
          eventLinks = result.eventLinks;
        }
      } catch (apiError: any) {
        console.error('Error creating events via API:', apiError.message);
        // If token expired, need to re-authenticate
        if (apiError.message.includes('invalid_grant') || apiError.message.includes('expired')) {
          delete tokenStore[sessionId];
          needsAuth = true;
        }
      }
    } else {
      needsAuth = true;
    }

    // If events were created successfully
    if (eventsCreated > 0) {
      return res.json({
        success: true,
        data: {
          plan: plan,
          calendarEvents: calendarEvents,
          googleCalendarUrl: 'https://calendar.google.com/calendar/u/0/r',
          eventsCreated: eventsCreated,
          eventLinks: eventLinks,
          message: `Successfully created ${eventsCreated} events in your Google Calendar!`,
        },
        trace: [
          {
            timestamp: new Date().toISOString(),
            agent: 'automation',
            action: 'sync_calendar',
            input: { strategyData, customerMessagesCount: customerMessages.length },
            output: `Created ${eventsCreated} events in Google Calendar`,
          },
        ],
      });
    }

    // If authentication is needed, return auth URL
    if (needsAuth) {
      // Check if credentials are configured
      if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !oauth2Client) {
        return res.status(500).json({
          success: false,
          error: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local',
          data: {
            plan: plan,
            calendarEvents: calendarEvents,
            message: 'Google Calendar OAuth is not configured. Please add credentials to .env.local',
          },
        });
      }

      const scopes = ['https://www.googleapis.com/auth/calendar'];
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
      });

      return res.json({
        success: false,
        needsAuth: true,
        authUrl: authUrl,
        data: {
          plan: plan,
          calendarEvents: calendarEvents,
          message: 'Please authorize Google Calendar access to create events automatically.',
        },
      });
    }

    // Fallback: return plan data
    res.json({
      success: true,
      data: {
        plan: plan,
        calendarEvents: calendarEvents,
        message: `Schedule generated successfully! ${calendarEvents.length} events ready.`,
      },
    });
  } catch (error: any) {
    console.error('Automation agent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Legacy endpoints for backwards compatibility
app.post('/api/pm/automation/calendar', async (req, res) => {
  try {
    res.json({ success: true, data: { message: 'Use /api/pm/automation endpoint instead' } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pm/automation/notion', async (req, res) => {
  try {
    res.json({ success: true, data: { message: 'Use /api/pm/automation endpoint instead' } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Risk scoring with document analysis
app.post('/api/risk-score', async (req, res) => {
  const data = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('🔑 Risk score - API key present:', !!apiKey);
  console.log('🔑 Key length:', apiKey?.length || 0);
  
  if (!apiKey) {
    console.log('❌ No API key found - using fallback');
    const score = calculateFallbackScore(data);
    return res.json(score);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Build multimodal content
    const parts: any[] = [
      {
        text: `You are a risk analyst. Analyze this vendor/client onboarding data and uploaded documents.

Company: ${data.companyName} (${data.companyType})
Country: ${data.country}
Contact: ${data.contactEmail}
EIN: ${data.ein}
Has Security Controls: ${data.hasControls ? 'Yes' : 'No'}
Handles PII: ${data.hasPII ? 'Yes' : 'No'}
Document Checklist: ${data.documents?.join(', ') || 'None'}
Uploaded Files: ${data.uploadedFiles?.length || 0}

${data.uploadedFiles?.length > 0 ? 'ANALYZE THE UPLOADED DOCUMENTS BELOW. Look for:\n- Insurance coverage amounts and expiry dates\n- SOC2/ISO certifications and scope\n- Security policies and controls\n- Contract terms and liability clauses\n- W9 accuracy and completeness\n- Any red flags or compliance gaps' : ''}

Return risk level (LOW/MEDIUM/HIGH) and 3-5 specific, actionable reasons based on the documents and data provided.`
      }
    ];

    // Add uploaded files as images/documents
    if (data.uploadedFiles && data.uploadedFiles.length > 0) {
      for (const file of data.uploadedFiles) {
        parts.push({
          inlineData: {
            mimeType: file.type || 'application/pdf',
            data: file.base64
          }
        });
      }
    }

    const result = await model.generateContent(parts);
    const text = result.response.text();
    
    console.log('Gemini risk analysis:', text);
    
    // Parse response
    const riskLevel = text.includes('HIGH') ? 'HIGH' : text.includes('MEDIUM') ? 'MEDIUM' : 'LOW';
    const reasons = text.split('\n')
      .filter(l => l.trim().startsWith('-') || l.trim().match(/^\d+\./))
      .map(l => l.trim().replace(/^[-\d+.]\s*/, ''))
      .filter(r => r.length > 0)
      .slice(0, 5);
    
    res.json({ 
      riskLevel, 
      reasons: reasons.length > 0 ? reasons : ['Analysis complete based on submitted documents'], 
      score: riskLevel === 'HIGH' ? 85 : riskLevel === 'MEDIUM' ? 55 : 25 
    });
  } catch (err: any) {
    console.error('❌ Gemini API error:', err.message);
    console.error('Full error:', err);
    const score = calculateFallbackScore(data);
    res.json({ ...score, error: `Gemini failed: ${err.message}` });
  }
});

function calculateFallbackScore(data: any) {
  let score = 20;
  if (data.hasPII) score += 30;
  if (!data.hasControls) score += 25;
  if (data.country !== 'USA') score += 15;
  
  const riskLevel = score > 70 ? 'HIGH' : score > 40 ? 'MEDIUM' : 'LOW';
  return { riskLevel, reasons: ['Rule-based fallback'], score };
}


// In-memory storage
const entities: any[] = [];
const auditEvents: any[] = [];

// Entities
app.get('/api/entities', async (req, res) => {
  try {
    res.json(entities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/entities/:id', async (req, res) => {
  try {
    const entity = entities.find(e => e.id === req.params.id);
    if (!entity) {
      return res.status(404).json({ error: 'Entity not found' });
    }
    res.json(entity);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/entities', async (req, res) => {
  try {
    const entity = {
      id: `entity-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      ...req.body
    };
    entities.push(entity);
    res.json(entity);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/entities/:id', async (req, res) => {
  try {
    const index = entities.findIndex(e => e.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Entity not found' });
    }
    entities[index] = {
      ...entities[index],
      ...req.body,
      lastUpdated: new Date().toISOString(),
    };
    res.json(entities[index]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Audit
app.get('/api/audit', async (req, res) => {
  try {
    res.json(auditEvents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/audit', async (req, res) => {
  try {
    const event = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      entityName: req.body.entityId || 'Unknown',
      ...req.body
    };
    auditEvents.push(event);
    res.json(event);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});
