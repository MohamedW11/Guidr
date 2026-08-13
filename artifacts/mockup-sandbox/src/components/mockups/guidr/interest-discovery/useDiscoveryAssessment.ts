import { useState, useEffect } from "react";
import type { PublicConfig, ScoreResponse, AnswerValue } from "./types";

const SESSION_STORAGE_KEY = "guidr_discovery_answers";

// Default fallback config matching spec if API is unreachable
const FALLBACK_CONFIG: PublicConfig = {
  version: "v1",
  scale: {
    min: 1,
    max: 5,
    labels: [
      "Not interested at all",
      "Not interested",
      "Not sure",
      "Interested",
      "Very interested",
    ],
  },
  questions: [
    { id: "q1", text: "Solving a difficult problem that requires you to try several different approaches." },
    { id: "q2", text: "Finding out why something happened when the answer is not immediately obvious." },
    { id: "q3", text: "Using numbers, patterns, or logic to solve challenging problems." },
    { id: "q4", text: "Building or designing something that solves a real-world problem." },
    { id: "q5", text: "Learning how computers or digital systems work and finding ways to make them do useful things." },
    { id: "q6", text: "Conducting an experiment to test whether your idea is correct." },
    { id: "q7", text: "Investigating how the human body works and why people develop certain health problems." },
    { id: "q8", text: "Exploring how animals, plants, or other living things work." },
    { id: "q9", text: "Understanding how materials and substances behave and change." },
    { id: "q10", text: "Understanding why physical things happen—for example, how electricity, motion, or forces work." },
    { id: "q11", text: "Creating a new idea for a product, project, or business and figuring out how to make it work." },
    { id: "q12", text: "Understanding how money, markets, businesses, or financial decisions work." },
    { id: "q13", text: "Taking responsibility for organizing a team and making sure everyone works toward a goal." },
    { id: "q14", text: "Presenting an idea to a group and trying to convince them that your idea is worth considering." },
    { id: "q15", text: "Discussing a controversial issue and building arguments for or against different positions." },
    { id: "q16", text: "Helping solve a problem that affects people in your school or community." },
    { id: "q17", text: "Designing a poster, logo, visual identity, or other creative visual work." },
    { id: "q18", text: "Creating videos, social-media content, or other media to communicate an idea." },
    { id: "q19", text: "Writing stories, articles, essays, or other pieces to express your ideas." },
    { id: "q20", text: "Learning a new language and discovering how people communicate in different cultures." },
    { id: "q21", text: "Understanding how societies and cultures have changed throughout history." },
    { id: "q22", text: "Investigating environmental problems and thinking about ways to protect nature or use resources more sustainably." },
    { id: "q23", text: "Training to improve your physical performance or competing in a sport." },
    { id: "q24", text: "Playing music, singing, acting, dancing, or performing for others." },
  ],
  results: {
    introTitle: "Let's discover what you might enjoy.",
    introBody: "You don't need to know your interests already. We'll ask you about different activities and situations. There are no right or wrong answers.",
    resultsTitle: "We discovered some areas you may enjoy",
    resultsFooter: "These are suggestions based on your answers, not fixed labels. Your interests can change as you discover new things.",
    disclaimer: "These are suggestions based on your answers, not fixed labels. Your interests can change as you discover new things.",
  },
};

export function useDiscoveryAssessment() {
  const [config, setConfig] = useState<PublicConfig>(FALLBACK_CONFIG);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [scoreResult, setScoreResult] = useState<ScoreResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScoring, setIsScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore cached answers from sessionStorage
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (cached) {
        setAnswers(JSON.parse(cached));
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch config from server
  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/interest-discovery/config?version=v1");
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch {
        // Fallback config already set
      } finally {
        setIsLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const setAnswer = (questionId: string, value: AnswerValue) => {
    setAnswers((prev) => {
      const updated = { ...prev, [questionId]: value };
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const nextQuestion = () => {
    if (currentIndex < config.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const submitAssessment = async (): Promise<ScoreResponse | null> => {
    setError(null);
    setIsScoring(true);

    try {
      const res = await fetch("/api/interest-discovery/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: config.version,
          answers,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to calculate interest scores");
      }

      const result: ScoreResponse = await res.json();
      setScoreResult(result);
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to compute assessment scores");
      return null;
    } finally {
      setIsScoring(false);
    }
  };

  const resetAssessment = () => {
    setCurrentIndex(0);
    setAnswers({});
    setScoreResult(null);
    setError(null);
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return {
    config,
    currentIndex,
    setCurrentIndex,
    currentQuestion: config.questions[currentIndex],
    totalQuestions: config.questions.length,
    answers,
    setAnswer,
    nextQuestion,
    prevQuestion,
    submitAssessment,
    scoreResult,
    isLoading,
    isScoring,
    error,
    resetAssessment,
  };
}
