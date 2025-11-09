// Core types for Syntria

export type AIProvider = 'gemini' | 'openai';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ComplianceStatus = 'Pass' | 'Partial' | 'Fail';
export type EntityStatus = 'Active' | 'Pending' | 'Decommissioned';

export interface Entity {
  id: string;
  name: string;
  type: 'vendor' | 'client';
  riskLevel: RiskLevel;
  compliance: ComplianceStatus;
  status: EntityStatus;
  owner: string;
  createdAt: string;
  lastUpdated: string;
  decommissionReason?: string;
  decommissionedAt?: string;
  reactivatedAt?: string;
  hasControls?: boolean;
  hasPII?: boolean;
  documents?: string[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  entityId: string;
  entityName: string;
  action: string;
  user: string;
  details: string;
}

export interface ProjectContext {
  id: string;
  name: string;
  goals: string[];
  constraints: string[];
  artifacts: {
    prd?: string;
    roadmap?: string;
    backlog?: string;
    testCases?: string;
    releaseNotes?: string;
  };
}

export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  trace?: AgentTraceStep[];
}

export interface AgentTraceStep {
  timestamp: string;
  agent: string;
  action: string;
  input: any;
  output: any;
}

export interface StrategyInput {
  market: string;
  segment: string;
  goals: string[];
  constraints: string[];
}

export interface ResearchInput {
  feedback: string;
  competitors: string[];
  trends: string[];
}

export interface PlanningInput {
  requirements: string[];
  constraints: string[];
  sprintLength?: number;
}

export interface GTMInput {
  productBrief: string;
  targetAudience: string;
  launchDate: string;
}

export interface OnboardingFormData {
  companyName: string;
  companyType: 'vendor' | 'client';
  ein: string;
  country: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  documents: {
    w9: boolean;
    insurance: boolean;
    security: boolean;
  };
  controls: {
    iam: boolean;
    encryption: boolean;
    logging: boolean;
    network: boolean;
  };
  handlesPII: boolean;
  uploadedFiles?: Array<{
    name: string;
    type: string;
    base64: string;
  }>;
}
