// Typed API client for Syntria

const API_BASE = '/api';

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', response.status, errorText);
    let errorMessage = 'API request failed';
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// Health check
export const checkHealth = () => 
  apiCall<{ ok: boolean; provider: string; hasKey: boolean }>('/health');

// PM Agents
export const runStrategyAgent = (input: any) => 
  apiCall<any>('/pm/strategy', { method: 'POST', body: JSON.stringify(input) });

export const runCustomerAdvisoryAgent = (input: {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  customerSegment?: string;
  market?: string;
}) => 
  apiCall<{ success: boolean; data: { message: string } }>('/pm/customer-advisory', { method: 'POST', body: JSON.stringify(input) });

// Automation
export const syncCalendar = (input: { 
  strategyData: any; 
  customerMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  sessionId?: string;
}) => 
  apiCall<{ 
    success: boolean;
    needsAuth?: boolean;
    authUrl?: string;
    data: { 
      plan: any[]; 
      calendarEvents: any[]; 
      googleCalendarUrl?: string; 
      eventsCreated?: number;
      eventLinks?: string[];
      message: string; 
    } 
  }>('/pm/automation/sync-calendar', { method: 'POST', body: JSON.stringify(input) });

export const getGoogleAuthUrl = () => 
  apiCall<{ authUrl: string }>('/auth/google', { method: 'GET' });

// Audio Summary
export const generateAudioSummary = (input: {
  strategyData?: any;
  customerMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  automationPlan?: any[];
}) => 
  apiCall<{
    success: boolean;
    data: {
      audioBase64: string;
      summaryText: string;
      duration: string;
      message: string;
    };
  }>('/pm/audio-summary', { method: 'POST', body: JSON.stringify(input) });

// Voice Assistant
export const askVoiceAssistant = (input: {
  question: string;
  strategyData?: any;
  customerMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  automationPlan?: any[];
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  sessionId?: string;
}) => 
  apiCall<{
    success: boolean;
    data: {
      answer: string;
      audioBase64: string;
      question: string;
    };
  }>('/pm/voice-assistant', { method: 'POST', body: JSON.stringify(input) });

// Fetch calendar events
export const fetchCalendarEvents = (sessionId: string, timeMin?: string, timeMax?: string) => 
  apiCall<{
    success: boolean;
    data: {
      events: any[];
      count: number;
    };
  }>(`/pm/calendar/events?sessionId=${sessionId}${timeMin ? `&timeMin=${timeMin}` : ''}${timeMax ? `&timeMax=${timeMax}` : ''}`, { method: 'GET' });

// List available ElevenLabs voices
export const listElevenLabsVoices = () => 
  apiCall<{
    success: boolean;
    data: {
      voices: Array<{
        voice_id: string;
        name: string;
        category: string;
        description: string;
        preview_url?: string;
      }>;
    };
  }>('/pm/audio-summary/voices', { method: 'GET' });

export const createCalendarEvents = (events: any[]) => 
  apiCall<any>('/pm/automation/calendar', { method: 'POST', body: JSON.stringify({ events }) });

export const syncToNotion = (content: any) => 
  apiCall<any>('/pm/automation/notion', { method: 'POST', body: JSON.stringify(content) });

// Risk scoring
export const calculateRiskScore = (data: any) => 
  apiCall<{ riskLevel: string; reasons: string[]; score: number }>('/risk-score', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// Entities
export const getEntities = () => 
  apiCall<any[]>('/entities');

export const getEntity = (id: string) =>
  apiCall<any>(`/entities/${id}`);

export const createEntity = (entity: any) =>
  apiCall<any>('/entities', { method: 'POST', body: JSON.stringify(entity) });

export const updateEntity = (id: string, entity: any) =>
  apiCall<any>(`/entities/${id}`, { method: 'PUT', body: JSON.stringify(entity) });

// Audit
export const getAuditEvents = () => 
  apiCall<any[]>('/audit');

export const createAuditEvent = (event: any) => 
  apiCall<any>('/audit', { method: 'POST', body: JSON.stringify(event) });
