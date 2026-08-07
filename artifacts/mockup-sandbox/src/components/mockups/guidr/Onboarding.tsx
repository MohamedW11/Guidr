import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useLocation } from "./_shared/router";
import { Brand } from "./_shared";
import "./_group.css";

const interestOptions = [
  "Computer Science",
  "Engineering",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Medicine & Healthcare",
  "Business & Entrepreneurship",
  "Economics & Finance",
  "Research",
  "Leadership",
  "Public Speaking & Debate",
  "Law & Politics",
  "Arts & Design",
  "Media & Content Creation",
  "Writing & Literature",
  "Languages",
  "Social Impact & Volunteering",
  "Environment & Sustainability",
  "Sports & Fitness",
  "Music & Performing Arts",
  "History",
];

const steps = [
  {
    title: "What grade are you in?",
    description:
      "This helps us surface opportunities you’re actually eligible for.",
    options: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
  },
  {
    title: "What are you curious about?",
    description:
      "Choose all the areas you want to explore. You can always change these later.",
    options: interestOptions,
  },
  {
    title: "Where are you based?",
    description:
      "We’ll use your city to help you find opportunities close to you.",
    options: ["Cairo", "Alexandria", "Giza", "Other"],
  },
] as const;

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [, setLocation] = useLocation();
  const currentStep = steps[step];
  const isInterestStep = step === 1;

  const toggleOption = (option: string) => {
    setSelected((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );
  };

  const continueStep = () => {
    if (step < steps.length - 1) {
      setStep((current) => current + 1);
    } else {
      setLocation("/guidr/Dashboard");
    }
  };

  return (
    <div className="auth guidr">
      <div
        style={{
          width: "min(550px, calc(100% - 40px))",
          margin: "13vh auto",
          paddingBottom: 32,
        }}
      >
        <Brand dark />
        <div
          style={{
            height: 2,
            background: "#3a3a3a",
            marginTop: 42,
          }}
        >
          <div
            style={{
              height: 2,
              width: `${((step + 1) / steps.length) * 100}%`,
              background: "var(--g-red)",
              transition: "width .2s ease",
            }}
          />
        </div>

        <div className="g-label" style={{ marginTop: 28 }}>
          Step {step + 1} of {steps.length}
        </div>
        <h1 style={{ fontSize: 34, margin: "12px 0 8px" }}>
          {currentStep.title}
        </h1>
        <p style={{ fontSize: 12, color: "#92908c", margin: 0 }}>
          {currentStep.description}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isInterestStep
              ? "repeat(2, minmax(0, 1fr))"
              : "1fr 1fr",
            gap: 8,
            margin: "24px 0",
            maxHeight: isInterestStep ? 300 : undefined,
            overflowY: isInterestStep ? "auto" : undefined,
            paddingRight: isInterestStep ? 6 : undefined,
          }}
        >
          {currentStep.options.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <button
                key={option}
                type="button"
                className="g-btn"
                aria-pressed={isSelected}
                onClick={() => toggleOption(option)}
                style={{
                  borderColor: isSelected ? "var(--g-red)" : undefined,
                  background: isSelected ? "var(--g-red)" : undefined,
                  color: isSelected ? "var(--g-paper)" : undefined,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textAlign: "left",
                  minHeight: isInterestStep ? 44 : undefined,
                }}
              >
                {option}
                {isSelected && <Check size={14} aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        <button
          className="g-btn red"
          type="button"
          onClick={continueStep}
          disabled={selected.length === 0}
          style={{
            opacity: selected.length === 0 ? 0.45 : 1,
            cursor: selected.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          {step === steps.length - 1 ? "Finish setup" : "Continue"}{" "}
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}