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
