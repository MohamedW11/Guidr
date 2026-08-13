import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import type { AnswerValue, QuestionItem } from "./types";
import { LikertScale } from "./LikertScale";

interface DiscoveryQuestionProps {
  question: QuestionItem;
  currentIndex: number;
  totalQuestions: number;
  scaleLabels: [string, string, string, string, string];
  currentAnswer: AnswerValue | undefined;
  onAnswer: (val: AnswerValue) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isScoring: boolean;
  error: string | null;
}

export function DiscoveryQuestion({
  question,
  currentIndex,
  totalQuestions,
  scaleLabels,
  currentAnswer,
  onAnswer,
  onNext,
  onPrev,
  onSubmit,
  isScoring,
  error,
}: DiscoveryQuestionProps) {
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const handleNextClick = () => {
    if (!currentAnswer) return;
    if (isLastQuestion) {
      onSubmit();
    } else {
      onNext();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Progress header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="g-label" style={{ margin: 0 }}>
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <span style={{ fontSize: 12, color: "#8a8884" }}>{progressPercent}% completed</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: "rgba(255, 255, 255, 0.1)", borderRadius: 2 }}>
        <div
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            background: "var(--g-red)",
            borderRadius: 2,
            transition: "width 0.25s ease",
          }}
        />
      </div>

      {/* Question text */}
      <div style={{ minHeight: 70, marginTop: 8 }}>
        <h3 style={{ fontSize: "clamp(16px, 3vw, 20px)", fontWeight: 500, lineHeight: 1.4, margin: 0, color: "#fefcfa" }}>
          {question.text}
        </h3>
      </div>

      {/* Error alert */}
      {error && (
        <div
          style={{
            padding: "10px 14px",
            background: "rgba(220, 38, 38, 0.15)",
            border: "1px solid rgba(220, 38, 38, 0.4)",
            borderRadius: 6,
            color: "#f87171",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* Likert Scale selection */}
      <LikertScale
        labels={scaleLabels}
        selectedValue={currentAnswer}
        onChange={(val) => {
          onAnswer(val);
        }}
      />

      {/* Navigation footer */}
      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <button
          type="button"
          className="g-btn"
          onClick={onPrev}
          disabled={currentIndex === 0 || isScoring}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <button
          type="button"
          className="g-btn red"
          disabled={!currentAnswer || isScoring}
          onClick={handleNextClick}
          style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          {isScoring ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Scoring...
            </>
          ) : isLastQuestion ? (
            <>
              See My Results <ArrowRight size={14} />
            </>
          ) : (
            <>
              Next Question <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
