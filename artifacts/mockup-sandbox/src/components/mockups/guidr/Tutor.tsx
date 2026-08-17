import { useState, useEffect } from "react";
import { Check, LockKeyhole, ArrowRight, BookOpen, Compass, Target, CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "./_shared/router";
import { Shell } from "./_shared";
import "./_group.css";

export const MODULE_DEFINITIONS = [
  {
    id: "Know",
    number: "1",
    title: "Know",
    subtitle: "Understand what opportunities exist and why they matter.",
    icon: Compass,
    lessons: [
      "Welcome to Guidr",
      "What are educational opportunities?",
      "Why are they important?",
      "What are the different types of opportunities, and why is each one important?",
      "Which opportunities are right for you?",
    ],
  },
  {
    id: "Prepare",
    number: "2",
    title: "Prepare",
    subtitle: "Build a strong profile and learn how to prepare for opportunities.",
    icon: BookOpen,
    lessons: [
      "What is a good student profile?",
      "How to discover your interests and strengths",
      "How to find the right opportunities",
      "How to read and understand an opportunity",
      "How to build a strong application",
      "How to write strong essays",
      "How to prepare for interviews",
      "How to use Guidr effectively",
      "How to get accepted into summer programs",
      "How to win competitions",
      "How to get scholarships",
    ],
  },
  {
    id: "Act",
    number: "3",
    title: "Act",
    subtitle: "Turn what you have learned into real opportunities.",
    icon: Target,
    lessons: [
      "Opportunities After High School",
      "How to choose what to apply for",
      "How to plan",
      "How to track your applications",
      "What to do after applying",
      "What if you get rejected?",
      "What if you get accepted?",
    ],
  },
];

// Generate default mock lessons covering all 3 modules
export const DEFAULT_MOCK_LESSONS = MODULE_DEFINITIONS.flatMap((mod, modIdx) =>
  mod.lessons.map((title, lesIdx) => ({
    id: `demo-${mod.id.toLowerCase()}-${lesIdx + 1}`,
    title,
    module: mod.id,
    sortOrder: (modIdx * 20) + lesIdx + 1,
    status: "published",
    completed: false,
    content: `Learn all about ${title} in Guidr Tutor.`,
  }))
);

export function Tutor() {
  const [, setLocation] = useLocation();
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLessons() {
      try {
        const res = await fetch("/api/lessons", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setLessons(data.length > 0 ? data : DEFAULT_MOCK_LESSONS);
        } else {
          setLessons(DEFAULT_MOCK_LESSONS);
        }
      } catch (err) {
        console.error("Failed to fetch lessons:", err);
        setLessons(DEFAULT_MOCK_LESSONS);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLessons();
  }, []);

  // Compute unlock & completion status sequentially across all lessons
  const lessonList = lessons.length > 0 ? lessons : DEFAULT_MOCK_LESSONS;

  return (
    <Shell active="Guidr Tutor">
      <div className="content" style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header Section */}
        <div style={{ margin: "0 0 36px", textAlign: "left" }}>
          <div className="g-label" style={{ marginBottom: 6 }}>Curriculum Path</div>
          <h1 style={{ fontSize: 40, fontWeight: 700, margin: "0 0 8px", color: "var(--g-ink)" }}>Guidr Tutor</h1>
          <p style={{ fontSize: 14, color: "var(--g-muted)", margin: 0, maxWidth: 640 }}>
            Master educational opportunities step-by-step through our 3 structured modules: Know, Prepare, and Act.
          </p>
        </div>

        {isLoading ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--g-muted)" }}>Loading Guidr Tutor curriculum...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
            {MODULE_DEFINITIONS.map((mod) => {
              const ModuleIcon = mod.icon;
              // Filter lessons belonging to this module
              const moduleLessons = lessonList.filter(
                (l) => l.module?.toLowerCase() === mod.id.toLowerCase()
              );

              // If backend didn't return module field properly, fallback to match title list
              const displayLessons =
                moduleLessons.length > 0
                  ? moduleLessons
                  : mod.lessons.map((t) => lessonList.find((l) => l.title === t)).filter(Boolean);

              return (
                <div key={mod.id} style={{ borderTop: "1px solid var(--g-line)", paddingTop: 28 }}>
                  {/* Module Header */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
                    <div
                      style={{
                        background: "var(--g-ink)",
                        color: "var(--g-paper)",
                        width: 38,
                        height: 38,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 16,
                        fontWeight: 700,
                        borderRadius: 0, // Sharp square corners
                        flexShrink: 0,
                      }}
                    >
                      {mod.number}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "var(--g-ink)" }}>
                          {mod.title}
                        </h2>
                        <span style={{ fontSize: 11, background: "rgba(139,17,21,0.08)", color: "var(--g-red)", fontWeight: 700, padding: "2px 8px", borderRadius: 0 }}>
                          Module {mod.number}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--g-muted)", margin: "4px 0 0", fontStyle: "italic" }}>
                        {mod.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Sharp Square-Corner Title-Only Cards Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                      gap: 16,
                    }}
                  >
                    {displayLessons.map((lesson, idx) => {
                      // Sequential index check in full lesson list
                      const globalIdx = lessonList.findIndex((l) => l.id === lesson.id || l.title === lesson.title);
                      const isUnlocked = globalIdx <= 0 || lessonList[globalIdx - 1]?.completed;
                      const isCompleted = lesson.completed;
                      const isActive = isUnlocked && !isCompleted;

                      return (
                        <div
                          key={lesson.id || lesson.title}
                          onClick={() => {
                            if (isUnlocked) setLocation(`/guidr/Lesson?id=${lesson.id || `demo-${lesson.title}`}`);
                          }}
                          style={{
                            borderRadius: 0, // SHARP SQUARE CORNERS
                            border: isActive
                              ? "2px solid var(--g-red)"
                              : isCompleted
                              ? "1px solid #16a34a"
                              : !isUnlocked
                              ? "1px solid #d4d4d4"
                              : "1px solid var(--g-ink)",
                            background: isActive
                              ? "#fff"
                              : isCompleted
                              ? "#f0fdf4"
                              : !isUnlocked
                              ? "#f9f9f9"
                              : "#ffffff",
                            padding: "16px 18px",
                            cursor: isUnlocked ? "pointer" : "not-allowed",
                            opacity: !isUnlocked ? 0.75 : 1,
                            transition: "all 0.18s ease",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            minHeight: 115,
                            boxShadow: isActive ? "0 4px 12px rgba(139,17,21,0.08)" : "none",
                          }}
                          className="sharp-lesson-card"
                        >
                          <div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 8,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  letterSpacing: "0.12em",
                                  textTransform: "uppercase",
                                  color: isActive ? "var(--g-red)" : isCompleted ? "#16a34a" : "var(--g-muted)",
                                }}
                              >
                                Lesson {globalIdx >= 0 ? globalIdx + 1 : idx + 1}
                              </span>
                              {isCompleted ? (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, color: "#16a34a", fontWeight: 700 }}>
                                  <CheckCircle2 size={13} /> Done
                                </span>
                              ) : !isUnlocked ? (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, color: "#888", fontWeight: 600 }}>
                                  <LockKeyhole size={12} /> Locked
                                </span>
                              ) : (
                                <span style={{ fontSize: 10, background: "var(--g-red)", color: "#fff", padding: "2px 6px", fontWeight: 700, borderRadius: 0 }}>
                                  Active
                                </span>
                              )}
                            </div>

                            {/* TITLE-ONLY CARD REQUIRED: Only rendering title */}
                            <h3
                              style={{
                                fontSize: 15,
                                fontWeight: 700,
                                margin: 0,
                                lineHeight: 1.35,
                                color: !isUnlocked ? "#666" : "var(--g-ink)",
                              }}
                            >
                              {lesson.title}
                            </h3>
                          </div>

                          <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <small
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: isCompleted
                                  ? "#16a34a"
                                  : isActive
                                  ? "var(--g-red)"
                                  : !isUnlocked
                                  ? "#999"
                                  : "var(--g-ink)",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              {isCompleted ? (
                                "Review Lesson"
                              ) : !isUnlocked ? (
                                "Complete prior lesson to unlock"
                              ) : (
                                <>
                                  Start Lesson <ArrowRight size={12} />
                                </>
                              )}
                            </small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}