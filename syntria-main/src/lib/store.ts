import { create } from 'zustand';
import { AIProvider, ProjectContext, Entity, AuditEvent } from './types';

interface AppState {
  // AI Settings
  aiProvider: AIProvider;
  setAIProvider: (provider: AIProvider) => void;
  
  // Judge Mode (demo mode)
  judgeModeEnabled: boolean;
  setJudgeModeEnabled: (enabled: boolean) => void;
  
  // Current Project
  currentProject: ProjectContext | null;
  setCurrentProject: (project: ProjectContext | null) => void;
  
  // Projects
  projects: ProjectContext[];
  addProject: (project: ProjectContext) => void;
  
  // Entities (for onboarding/risk)
  entities: Entity[];
  setEntities: (entities: Entity[]) => void;
  addEntity: (entity: Entity) => void;
  
  // Audit trail
  auditEvents: AuditEvent[];
  addAuditEvent: (event: AuditEvent) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // AI Settings
  aiProvider: 'gemini',
  setAIProvider: (provider) => set({ aiProvider: provider }),
  
  // Judge Mode
  judgeModeEnabled: false,
  setJudgeModeEnabled: (enabled) => set({ judgeModeEnabled: enabled }),
  
  // Current Project
  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),
  
  // Projects
  projects: [],
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  
  // Entities
  entities: [],
  setEntities: (entities) => set({ entities }),
  addEntity: (entity) => set((state) => ({ entities: [...state.entities, entity] })),
  
  // Audit trail
  auditEvents: [],
  addAuditEvent: (event) => set((state) => ({ 
    auditEvents: [event, ...state.auditEvents] 
  })),
}));
