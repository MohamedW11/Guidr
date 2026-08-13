export type AnswerValue = 1 | 2 | 3 | 4 | 5;

export type Step3Mode = "choose" | "discovery_intro" | "discovery_questions" | "discovery_results";

export interface QuestionItem {
  id: string;
  text: string;
}

export interface PublicConfig {
  version: string;
  scale: {
    min: number;
    max: number;
    labels: [string, string, string, string, string];
  };
  questions: QuestionItem[];
  results: {
    introTitle: string;
    introBody: string;
    resultsTitle: string;
    resultsFooter: string;
    disclaimer: string;
  };
}

export interface ScoredInterest {
  id: string;
  label: string;
  score: number;
}

export interface ScoreResponse {
  version: string;
  topInterests: ScoredInterest[];
  summarySignals: string[];
  summaryText: string;
  disclaimer: string;
}
