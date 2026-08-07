const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ ok: boolean }>('/health'),
  me: () => request<{ user: { id: string; email: string; mode: string; name?: string } }>('/auth/me'),
  listProjects: () => request<Project[]>('/projects'),
  getProject: (id: string) => request<ProjectDetail>(`/projects/${id}`),
  createProject: (body: { name: string; idea: string; mode: string }) =>
    request<ProjectDetail>('/projects', { method: 'POST', body: JSON.stringify(body) }),
  getPipeline: (projectId: string) => request<GenerationRun>(`/projects/${projectId}/pipeline`),
  advancePipeline: (projectId: string, userAnswers?: string) =>
    request<GenerationRun>(`/projects/${projectId}/pipeline/advance`, {
      method: 'POST',
      body: JSON.stringify({ userAnswers }),
    }),
  approvePipeline: (projectId: string) =>
    request<GenerationRun>(`/projects/${projectId}/pipeline/approve`, { method: 'POST', body: '{}' }),
  listFiles: (projectId: string) => request<FileNode[]>(`/projects/${projectId}/files`),
  explainFile: (projectId: string, path: string) =>
    request<ExplainResult>(`/projects/${projectId}/files/explain?path=${encodeURIComponent(path)}`),
  sendChat: (body: { content: string; mode?: string; sessionId?: string; projectId?: string }) =>
    request<ChatSendResult>('/chat/messages', { method: 'POST', body: JSON.stringify(body) }),
  listSessions: () => request<ChatSession[]>('/chat/sessions'),
  getSession: (id: string) => request<ChatSessionDetail>(`/chat/sessions/${id}`),
  latestReview: (projectId: string) => request<ReviewRow | null>(`/projects/${projectId}/reviews/latest`),
  runReview: (projectId: string) =>
    request<ReviewRow>(`/projects/${projectId}/reviews`, { method: 'POST', body: '{}' }),
  generateUi: (prompt: string) =>
    request<unknown>('/generators/ui', { method: 'POST', body: JSON.stringify({ prompt }) }),
  generateDatabase: (entities: string[]) =>
    request<unknown>('/generators/database', { method: 'POST', body: JSON.stringify({ entities }) }),
  generateApi: (style: string) =>
    request<unknown>('/generators/api', { method: 'POST', body: JSON.stringify({ style }) }),
  generateDevops: (appName: string) =>
    request<unknown>('/generators/devops', { method: 'POST', body: JSON.stringify({ appName }) }),
  billingPlans: () => request<{ plans: BillingPlan[] }>('/billing/plans'),
  createDeployment: (projectId: string, provider: string) =>
    request<unknown>(`/projects/${projectId}/deployments`, {
      method: 'POST',
      body: JSON.stringify({ provider }),
    }),
  exportUrl: (projectId: string) => `${API_URL}/api/projects/${projectId}/export`,
};

export interface Project {
  id: string;
  name: string;
  idea: string;
  status: string;
  mode: string;
  updatedAt: string;
}

export interface FileNode {
  id: string;
  path: string;
  content: string;
  language: string;
}

export interface PipelineStep {
  id: string;
  type: string;
  status: string;
  payload?: unknown;
  mentoring?: {
    why?: string;
    nextStep?: string;
    security?: string[];
    performance?: string[];
    commonMistakes?: string[];
    seniorTips?: string[];
  };
}

export interface GenerationRun {
  id: string;
  stage: string;
  approvedForCode: boolean;
  steps: PipelineStep[];
  reviewReports?: ReviewRow[];
}

export interface ProjectDetail extends Project {
  fileNodes: FileNode[];
  generationRuns: GenerationRun[];
}

export interface ExplainResult {
  path: string;
  explanation: string;
  why: string;
  securityNotes?: string[];
  performanceNotes?: string[];
  nextStep?: string;
}

export interface ChatSendResult {
  sessionId: string;
  mentoring: {
    explanation: string;
    why: string;
    bestPractices: string[];
    commonMistakes: string[];
    seniorTips: string[];
    securityNotes: string[];
    performanceNotes: string[];
    nextStep: string;
    diagramMermaid?: string;
    code?: string;
    exercises?: string[];
  };
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
}

export interface ChatSessionDetail extends ChatSession {
  messages: Array<{ id: string; role: string; content: string; mentoring?: unknown }>;
}

export interface ReviewRow {
  id: string;
  overall: number;
  summary: string;
  scores: unknown;
  findings: unknown;
}

export interface BillingPlan {
  id: string;
  name: string;
  priceUsd: number;
  limits: { projects: number; tokensPerMonth: number };
}
