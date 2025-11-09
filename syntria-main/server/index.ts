import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.API_PORT || 8787;

// Middleware
app.use(cors());
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

// PM Agents
app.post('/api/pm/strategy', async (req, res) => {
  try {
    const { market, segment, goals, constraints } = req.body;
    
    // Mock response for now
    const response = {
      success: true,
      data: {
        northStar: `Become the leading ${market} solution for ${segment}`,
        icps: [
          { segment: segment, painPoints: ['Manual processes', 'Data silos'] },
        ],
        successMetrics: [
          'User retention > 90%',
          'Time to value < 7 days',
          'NPS > 50',
        ],
        constraints: constraints,
        prd: '# Product Brief\n\n## Vision\n\n...\n\n## Success Metrics\n\n...',
      },
      trace: [
        {
          timestamp: new Date().toISOString(),
          agent: 'strategy',
          action: 'generate_brief',
          input: { market, segment, goals },
          output: 'Generated product brief',
        },
      ],
    };

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pm/research', async (req, res) => {
  try {
    const { feedback, competitors, trends } = req.body;
    
    // Mock response
    const response = {
      success: true,
      data: {
        themes: [
          { name: 'Automation requests', count: 45, priority: 'high' },
          { name: 'Integration needs', count: 32, priority: 'medium' },
          { name: 'Performance improvements', count: 28, priority: 'medium' },
        ],
        insights: [
          'Users want to automate repetitive tasks',
          'Integration with existing tools is critical',
          'Performance is a key differentiator',
        ],
        opportunities: [
          'Build no-code automation builder',
          'Add Zapier integration',
          'Optimize database queries',
        ],
      },
      trace: [
        {
          timestamp: new Date().toISOString(),
          agent: 'research',
          action: 'cluster_feedback',
          input: { feedback },
          output: 'Clustered themes',
        },
      ],
    };

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pm/planning', async (req, res) => {
  try {
    const { requirements, constraints, sprintLength } = req.body;
    
    // Mock response
    const response = {
      success: true,
      data: {
        stories: requirements.map((req: string, i: number) => ({
          id: `US-${i + 1}`,
          title: req,
          description: `As a user, I want to ${req.toLowerCase()}`,
          acceptanceCriteria: [
            'Given valid input',
            'When action is triggered',
            'Then expected outcome occurs',
          ],
          priority: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
          effort: 'medium',
        })),
        sprint: {
          length: sprintLength || 2,
          capacity: 40,
          planned: requirements.slice(0, 3),
        },
        testCases: requirements.map((req: string, i: number) => ({
          id: `TC-${i + 1}`,
          scenario: `Test ${req.toLowerCase()}`,
          steps: ['Step 1', 'Step 2', 'Step 3'],
          expected: 'Expected result',
        })),
      },
      trace: [
        {
          timestamp: new Date().toISOString(),
          agent: 'planning',
          action: 'generate_backlog',
          input: { requirements },
          output: 'Generated stories and sprint plan',
        },
      ],
    };

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pm/gtm', async (req, res) => {
  try {
    const { product, targetAudience, valueProps, competitors, timeline } = req.body;
    
    // Mock GTM response
    const response = {
      success: true,
      data: {
        personas: [
          {
            name: 'Enterprise Decision Maker',
            role: 'VP of Operations',
            goals: ['Reduce costs', 'Improve efficiency', 'Scale operations'],
            painPoints: ['Manual processes', 'Data silos', 'Lack of visibility'],
            channels: ['LinkedIn', 'Industry conferences', 'Email'],
          },
          {
            name: 'Technical Evaluator',
            role: 'Engineering Manager',
            goals: ['Easy integration', 'Reliable performance', 'Good documentation'],
            painPoints: ['Complex setup', 'Poor API docs', 'Limited support'],
            channels: ['Technical blogs', 'GitHub', 'Developer communities'],
          },
        ],
        positioning: {
          headline: `${product} - The Modern Solution for ${targetAudience}`,
          tagline: 'Streamline operations, reduce costs, scale effortlessly',
          keyMessages: valueProps || [
            'Save 10+ hours per week on manual tasks',
            'Integrate with your existing tools in minutes',
            'Enterprise-grade security and compliance',
          ],
        },
        launchPlan: {
          phases: [
            {
              name: 'Pre-Launch (Weeks 1-2)',
              activities: [
                'Set up landing page and demo environment',
                'Create launch assets (videos, case studies)',
                'Brief sales team and partners',
                'Line up beta customers for testimonials',
              ],
            },
            {
              name: 'Launch Week',
              activities: [
                'Product Hunt launch',
                'Press release distribution',
                'Social media campaign',
                'Email to existing customer base',
                'Live demo webinar',
              ],
            },
            {
              name: 'Post-Launch (Weeks 3-4)',
              activities: [
                'Gather and respond to feedback',
                'Follow up with leads',
                'Publish case studies',
                'Iterate on messaging based on data',
              ],
            },
          ],
          timeline: timeline || '4 weeks',
        },
        channels: [
          { name: 'LinkedIn Ads', budget: '$5k/mo', expected: '50-75 qualified leads' },
          { name: 'Content Marketing', budget: '$3k/mo', expected: 'SEO growth + 25 leads' },
          { name: 'Product Hunt', budget: '$500', expected: 'Brand awareness + 100 signups' },
          { name: 'Webinars', budget: '$2k/mo', expected: '30-40 demos booked' },
        ],
        competitivePosition: `While ${competitors?.[0] || 'competitors'} focus on enterprise only, ${product} serves both mid-market and enterprise with flexible pricing and faster time to value.`,
      },
      trace: [
        {
          timestamp: new Date().toISOString(),
          agent: 'gtm',
          action: 'generate_gtm_plan',
          input: { product, targetAudience },
          output: 'Generated GTM strategy',
        },
      ],
    };

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Automation
app.post('/api/pm/automation/calendar', async (req, res) => {
  try {
    const { events } = req.body;
    
    const response = {
      success: true,
      data: {
        created: events?.length || 0,
        events: events?.map((e: any, i: number) => ({
          id: `cal-${Date.now()}-${i}`,
          title: e.title || e.name,
          date: e.date || new Date().toISOString(),
          status: 'created',
        })) || [],
        message: `Created ${events?.length || 0} calendar events`,
        provider: 'Google Calendar (Mock)',
      },
    };

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pm/automation/notion', async (req, res) => {
  try {
    const { content, workspace, page } = req.body;
    
    const response = {
      success: true,
      data: {
        pageId: `notion-${Date.now()}`,
        url: `https://notion.so/${workspace || 'workspace'}/page-${Date.now()}`,
        blocks: content?.userStories?.length || content?.themes?.length || 0,
        message: 'Successfully synced to Notion',
        workspace: workspace || 'Default Workspace',
      },
    };

    res.json(response);
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
