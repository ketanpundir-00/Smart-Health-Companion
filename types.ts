export interface AnalysisResult {
  summary: string;
  recommendations: string[];
  alert: {
    level: 'Low' | 'Moderate' | 'Critical';
    details: string;
  };
}

export interface MultimediaInput {
  mimeType: string;
  data: string; // Base64
}
