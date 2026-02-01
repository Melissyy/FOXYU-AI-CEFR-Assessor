export enum CEFRLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2'
}

export interface AssessmentResult {
  overallLevel: CEFRLevel;
  breakdown: {
    vocabulary: string;
    grammar: string;
    fluency: string;
    structure: string;
  };
  detailedAnalysis: {
    answer1: string;
    answer2: string;
    answer3: string;
  };
  recommendations: string[];
}

export interface Question {
  id: number;
  title: string;
  description: string;
  prompt: string;
}

export interface TranscriptionState {
  id: number;
  text: string;
  isRecording: boolean;
  audioBlob: Blob | null;
  status: 'idle' | 'recording' | 'transcribing' | 'completed';
}
