import type {
  AnswerMap,
  AnswerValue,
  InterestDiscoveryConfig,
  InterestDiscoveryScoreResult,
  PublicInterestDiscoveryConfig,
  ScoredInterest,
  ScoredSignal,
} from "./types.js";

function normalizeLikertAverage(average: number): number {
  return ((average - 1) / 4) * 100;
}

function isValidAnswerValue(value: unknown): value is AnswerValue {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;
}

export function validateAnswers(config: InterestDiscoveryConfig, answers: AnswerMap): string | null {
  for (const question of config.questions) {
    const value = answers[question.id];
    if (!isValidAnswerValue(value)) {
      return `Missing or invalid answer for ${question.id}`;
    }
  }

  const knownQuestionIds = new Set(config.questions.map((question) => question.id));
  for (const questionId of Object.keys(answers)) {
    if (!knownQuestionIds.has(questionId)) {
      return `Unknown question id: ${questionId}`;
    }
  }

  return null;
}

function computeSignalScores(config: InterestDiscoveryConfig, answers: AnswerMap): ScoredSignal[] {
  const valuesBySignal = new Map<string, number[]>();

  for (const signal of config.signals) {
    valuesBySignal.set(signal.id, []);
  }

  for (const question of config.questions) {
    const answer = answers[question.id];
    for (const signalId of question.signals) {
      valuesBySignal.get(signalId)?.push(answer);
    }
  }

  return config.signals.map((signal) => {
    const values = valuesBySignal.get(signal.id) ?? [];
    const average = values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 1;
    return {
      id: signal.id,
      label: signal.label,
      score: normalizeLikertAverage(average),
    };
  });
}

function computeInterestScores(
  config: InterestDiscoveryConfig,
  signalScores: ScoredSignal[],
): ScoredInterest[] {
  const signalScoreById = new Map(signalScores.map((signal) => [signal.id, signal.score]));

  return config.interests.map((interest) => {
    const score = Object.entries(interest.weights).reduce((total, [signalId, weight]) => {
      return total + (signalScoreById.get(signalId) ?? 0) * weight;
    }, 0);

    return {
      id: interest.id,
      label: interest.label,
      score: Math.round(score * 10) / 10,
    };
  });
}

function buildSummaryText(config: InterestDiscoveryConfig, topSignals: ScoredSignal[]): string {
  const phrases = topSignals
    .map((signal) => config.signals.find((item) => item.id === signal.id)?.summaryPhrase)
    .filter((phrase): phrase is string => Boolean(phrase));

  if (phrases.length === 0) {
    return "You shared thoughtful answers about the activities and situations we asked about.";
  }

  if (phrases.length === 1) {
    return `You seem to enjoy ${phrases[0]}.`;
  }

  const lastPhrase = phrases[phrases.length - 1];
  const leadingPhrases = phrases.slice(0, -1).join(", ");
  return `You seem to enjoy ${leadingPhrases}, and ${lastPhrase}.`;
}

export function scoreInterestDiscovery(
  config: InterestDiscoveryConfig,
  answers: AnswerMap,
): InterestDiscoveryScoreResult {
  const validationError = validateAnswers(config, answers);
  if (validationError) {
    throw new Error(validationError);
  }

  const signalScores = computeSignalScores(config, answers);
  const interestScores = computeInterestScores(config, signalScores);

  const sortedInterests = [...interestScores].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.label.localeCompare(b.label);
  });

  const topInterests = sortedInterests.slice(0, config.results.topN);
  const topSignals = [...signalScores]
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.label.localeCompare(b.label);
    })
    .slice(0, 3);

  return {
    version: config.version,
    topInterests,
    summarySignals: topSignals.map((signal) => signal.label),
    summaryText: buildSummaryText(config, topSignals),
    disclaimer: config.results.disclaimer,
  };
}

export function toPublicConfig(config: InterestDiscoveryConfig): PublicInterestDiscoveryConfig {
  return {
    version: config.version,
    scale: config.scale,
    questions: config.questions.map((question) => ({
      id: question.id,
      text: question.text,
    })),
    results: {
      introTitle: config.results.introTitle,
      introBody: config.results.introBody,
      resultsTitle: config.results.resultsTitle,
      resultsFooter: config.results.resultsFooter,
      disclaimer: config.results.disclaimer,
    },
  };
}
