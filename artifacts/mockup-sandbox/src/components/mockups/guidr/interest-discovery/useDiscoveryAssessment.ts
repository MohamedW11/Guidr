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
      "Not at all like me",
      "A little like me",
      "Somewhat like me",
      "Mostly like me",
      "Very much like me",
    ],
  },
  questions: [
    { id: "q1", text: "The fan or AC breaks before iftar and guests are coming. You try to fix it yourself before calling anyone." },
    { id: "q2", text: "On a free Friday, you would rather fix something with your hands (a bike, a phone, a charger) than watch a video about how to fix it." },
    { id: "q3", text: "On a school trip to a factory, you like watching the machines work more than listening to the guide talk." },
    { id: "q4", text: "When the WiFi at home stops working, you try to fix it yourself before calling for help." },
    { id: "q5", text: "A full day of physical work, like helping set up for a family event, with no time to sit and think makes you feel tired, not excited." },
    { id: "q6", text: "Your grade in a subject goes down this term. Before asking your teacher, you check your answer sheet yourself to find out why." },
    { id: "q7", text: "Your teacher asks a hard question in class that no one can answer right away. You feel curious, not uncomfortable." },
    { id: "q8", text: "You want to know why something works, not just that it works." },
    { id: "q9", text: "Once you solve a math problem one way, you move to the next question. You don't try to find a better way." },
    { id: "q10", text: "Long videos that explain how something works lose your attention quickly." },
    { id: "q11", text: "Your teacher gives you an assignment with strict rules — an exact number of pages, a fixed structure — and no freedom. You feel stuck, not comfortable." },
    { id: "q12", text: "You often change or personalize things, like your notebook, your room, your playlist, without anyone asking you to." },
    { id: "q13", text: "When your class is planning a trip, you are usually the one who suggests something different from the usual plan." },
    { id: "q14", text: "You feel more comfortable when a question has one clear answer, like in math, than when it's open, like an essay." },
    { id: "q15", text: "You would rather follow the exact method your tutor taught you than try your own way, even if yours might also work." },
    { id: "q16", text: "A classmate is behind in a subject you're good at. The night before an exam, you want to actually teach them, not just send your notes." },
    { id: "q17", text: "You notice when a friend is quiet in the group chat, even before they say something is wrong. You check on them." },
    { id: "q18", text: "Studying with a group before exams feels better to you than studying alone, even if you cover less material." },
    { id: "q19", text: "You would rather study completely alone than with a group." },
    { id: "q20", text: "In a group project, you focus on finishing your own part well. You don't check if your teammates understand theirs." },
    { id: "q21", text: "When your school plans a charity event or a National Day event, you like leading the planning more than doing one small task." },
    { id: "q22", text: "It is easy for you to convince your parents or a teacher to agree with you — like getting permission for a trip." },
    { id: "q23", text: "You would rather explain your idea to the whole class than write it and hand it in quietly." },
    { id: "q24", text: "Being in charge of a school event stresses you more than it excites you." },
    { id: "q25", text: "You have thought about starting something of your own — a small shop, tutoring other students, a social media page." },
    { id: "q26", text: "You keep your study schedule and notes organized without your parents telling you to." },
    { id: "q27", text: "You feel satisfied when you finish a task by following a checklist step by step." },
    { id: "q28", text: "When your class collects money for a trip, you want to track every pound carefully." },
    { id: "q29", text: "You often forget deadlines because you focus on the big picture, not the small details." },
    { id: "q30", text: "Filling out a form, like a scholarship application, feels boring to you, not satisfying." },
    { id: "q31", text: "Your school is running a charity drive during Ramadan. Would you rather (a) collect donations door-to-door yourself, or (b) plan and manage the whole collection for your class?" },
    { id: "q32", text: "For your school science fair, would you rather (a) build the model and make it work, or (b) work out the math and theory behind it?" },
    { id: "q33", text: "Your class has an open project for National Day. Would you rather (a) make something new from scratch, even if it's not perfect, or (b) take something that already exists and improve it?" },
    { id: "q34", text: "Your school is talking to a bus company for a cheaper trip price. Would you rather (a) be the one who negotiates with the company, or (b) spend that time helping a classmate study for an exam?" },
    { id: "q35", text: "You're choosing a school club to join. Which is more true for you: (a) \"I want to see what it's like, I'm curious,\" or (b) \"It will look good on my university application\"?" },
    { id: "q36", text: "Think about a subject you work hard in. Which is more true: (a) \"I enjoy doing it,\" or (b) \"It's expected of me — by my family, or because of my exam score and which college it can get me into\"?" },
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
