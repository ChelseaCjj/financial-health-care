export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  UNHEALTHY = 'UNHEALTHY',
  CAUTION = 'CAUTION',
  UNKNOWN = 'UNKNOWN'
}

export interface MetricAnalysis {
  category: string; // e.g. "Profitability", "Solvency"
  term: string; // e.g. "Net Profit Margin"
  status: 'Good' | 'Bad' | 'Neutral';
  value: string; // e.g. "15%" or "High"
  explanation: string; // Professional explanation
  metaphor: string; // The "Cat" metaphor
}

export interface AnalysisData {
  status: HealthStatus;
  summary: string;
  metrics: MetricAnalysis[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}

export type Language = 'en' | 'zh';