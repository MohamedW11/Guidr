export type AnswerValue = 1 | 2 | 3 | 4 | 5;

export type AnswerMap = Record<string, AnswerValue>;

export interface InterestDiscoveryConfig {
  version: string;
  scale: {
    min: number;
    max: number;
    labels: [string, string, string, string, string];
  };
  questions: Array<{
    id: string;
    text: string;
    signals: string[];
  }>;
  signals: Array<{
    id: string;
    label: string;
    summaryPhrase: string;
  }>;
  interests: Array<{
    id: string;
    label: string;
    weights: Record<string, number>;
  }>;
  results: {
    topN: number;
    minTopN: number;
    disclaimer: string;
    introTitle: string;
    introBody: string;
    resultsTitle: string;
    resultsFooter: string;
  };
}

export interface ScoredInterest {
  id: string;
  label: string;
  score: number;
}

export interface ScoredSignal {
  id: string;
  label: string;
  score: number;
}

export interface InterestDiscoveryScoreResult {
  version: string;
  topInterests: ScoredInterest[];
  summarySignals: string[];
  summaryText: string;
  disclaimer: string;
}

export interface PublicInterestDiscoveryConfig {
  version: string;
  scale: InterestDiscoveryConfig["scale"];
  questions: Array<{ id: string; text: string }>;
  results: Pick<
    InterestDiscoveryConfig["results"],
    "introTitle" | "introBody" | "resultsTitle" | "resultsFooter" | "disclaimer"
  >;
}
