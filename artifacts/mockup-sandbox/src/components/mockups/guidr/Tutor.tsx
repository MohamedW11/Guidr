import { useState, useEffect } from "react";
import { Check, LockKeyhole, ArrowRight } from "lucide-react";
import { Link, useLocation } from "./_shared/router";
import { Shell } from "./_shared";
import "./_group.css";

export const DEFAULT_MOCK_LESSONS = [
  {
    id: "demo-1",
    title: "What Are Extracurricular Activities?",
    description: "Understand how clubs, competitions, volunteering, and projects shape your personal growth and college readiness.",
    status: "published",
    completed: false,
    content: `Extracurricular activities are any pursuits you engage in outside of standard academic coursework. They allow you to explore personal interests, develop practical skills, and demonstrate commitment to future goals.

### 1. Why Are Extracurriculars Important?
- **Skill Development**: Build teamwork, leadership, problem-solving, and communication abilities.
- **Interest Exploration**: Test different fields (such as robotics, public speaking, software, or community service) before choosing a university major.
- **Distinction**: Show university admissions and scholarship committees what makes you unique beyond grades and test scores.

### 2. Key Types of Extracurricular Activities
- **Competitions & Fairs**: ISEF Science Fairs, NASA Space Apps, Hackathons, and Olympiads.
- **Student Organizations & Clubs**: Model United Nations (MUN Cairo), Student Unions, and Debate Societies.
- **Community Service & Volunteering**: Environmental initiatives, tutoring younger students, and local non-profit work.
- **Personal Projects**: Building an app, writing research papers, running a blog, or founding an initiative.

### 3. Quality vs. Quantity
Admissions officers prefer **deep engagement in 2–3 meaningful activities** where you showed initiative and impact, rather than superficial participation in a dozen clubs.`,
  },
  {
    id: "demo-2",
    title: "What Is a Scholarship?",
    description: "Learn about merit-based, need-based, and fully funded scholarships available for Egyptian students.",
    status: "published",
    completed: false,
    content: `A scholarship is financial aid awarded to students to assist with educational expenses, ranging from full tuition and living stipends to partial program grants.

### 1. Types of Scholarships
- **Merit-Based Scholarships**: Awarded for academic excellence, scientific research, leadership, or athletic achievement (e.g., AUC Merit Scholarship).
- **Need-Based Financial Aid**: Awarded based on a student’s demonstrated financial need to ensure education is accessible.
- **Fully Funded Grants**: Covers tuition, housing, airfare, monthly living stipends, and health insurance (e.g., USAID STEM Scholarship, MEPI Tomorrow's Leaders, Global UGRAD).

### 2. Essential Application Components
- **Official Academic Transcripts**: High school grade records.
- **Personal Statement & Essays**: Narratives highlighting your goals, achievements, and resilience.
- **Letters of Recommendation**: Written by teachers or mentors who know your character and work ethic.
- **Standardized Tests & English Proficiency**: TOEFL/IELTS or SAT scores where required.

### 3. Tips for Scholarship Success
1. **Start Early**: Research deadlines 6–12 months in advance.
2. **Tailor Your Essays**: Answer the specific prompt directly without generic templates.
3. **Proofread Carefully**: Ensure zero spelling or grammatical mistakes.`,
  },
  {
    id: "demo-3",
    title: "How to Use Guidr",
    description: "Discover how to explore opportunities, track deadlines, complete lessons, and chat with your AI Tutor.",
    status: "published",
    completed: false,
    content: `Guidr is your personal compass for navigating educational opportunities, scholarships, and academic growth across Egypt.

### 1. Exploring & Filtering Opportunities
- Navigate to the **Opportunities** page to browse curated competitions, scholarships, summer programs, and workshops.
- Use the **Checkboxes Filter Sidebar** to filter by Category, Interests, and Mode (In-Person vs. Online).
- Sort by **Closing Soon (Deadline)** to never miss an important application cutoff!

### 2. Saving & Tracking Deadlines
- Click the **Bookmark icon** on any opportunity card to save it to your personal dashboard.
- Saved opportunities appear right at the top of your **Dashboard** and **Saved** tab for quick access.

### 3. Learning with Guidr Tutor & AI Study Buddy
- Go to **Guidr Tutor** to follow structured learning paths designed for Egyptian high school students.
- Complete lessons sequentially—finishing one automatically unlocks the next step!
- Use the **Guidr AI Tutor** sidebar inside any lesson to ask questions, clarify confusing concepts, or start a **New Chat** anytime.`,
  },
];

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

  return (
    <Shell active="Guidr Tutor">
      <div className="content" style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ maxWidth: 760, margin: "0 auto 30px", textAlign: "center" }}>
          <h1 style={{ fontSize: 42, fontWeight: 700, margin: 0 }}>Guidr Tutor</h1>
        </div>

        {isLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#666" }}>Loading lessons...</div>
        ) : lessons.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#666" }}>No lessons published yet.</div>
        ) : (
          <div
            style={{
              position: "relative",
              maxWidth: 760,
              margin: "30px auto 0",
              padding: "0 0 16px",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 16,
                bottom: 42,
                left: "50%",
                width: 1,
                background: "var(--g-line)",
                transform: "translateX(-50%)",
              }}
            />

            {lessons.map((lesson, index) => {
              // Sequential completion logic: first lesson is unlocked; subsequent lessons unlock when previous lesson is completed
              const isUnlocked = index === 0 || lessons[index - 1]?.completed;
              const isCompleted = lesson.completed;
              const isActive = isUnlocked && !isCompleted;
              const onLeft = index % 2 === 0;

              return (
                <div
                  key={lesson.id}
                  style={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: "1fr 40px 1fr",
                    alignItems: "center",
                    minHeight: 140,
                  }}
                >
                  <div style={{ gridColumn: onLeft ? 1 : 3, position: "relative" }}>
                    <div
                      onClick={() => {
                        if (isUnlocked) setLocation(`/guidr/Lesson?id=${lesson.id}`);
                      }}
                      style={{
                        position: "relative",
                        display: "block",
                        minHeight: 110,
                        padding: "18px 20px",
                        cursor: isUnlocked ? "pointer" : "not-allowed",
                        textDecoration: "none",
                        textAlign: "left",
                        color: isActive || !isUnlocked ? "var(--g-paper)" : "var(--g-ink)",
                        background: isActive ? "var(--g-red)" : !isUnlocked ? "var(--g-ink)" : "var(--g-paper)",
                        border: isActive ? "1px solid var(--g-red)" : "1px solid var(--g-ink)",
                        borderRadius: 8,
                        opacity: !isUnlocked ? 0.7 : 1,
                      }}
                    >
                      <div className="g-label" style={{ color: isActive ? "var(--g-paper)" : undefined, opacity: 0.9, marginBottom: 4 }}>
                        Lesson {index + 1}
                      </div>
                      <h3 style={{ fontSize: 18, margin: "4px 0 6px", fontWeight: 700 }}>{lesson.title}</h3>
                      <p style={{ fontSize: 12, margin: "0 0 14px", opacity: 0.9, lineHeight: 1.4 }}>
                        {lesson.description || "Master core academic and research skills for STEM success."}
                      </p>
                      <small style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600 }}>
                        {isCompleted ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#16a34a" }}>
                            <Check size={14} /> Completed
                          </span>
                        ) : !isUnlocked ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, opacity: 0.8 }}>
                            <LockKeyhole size={13} /> Locked (Complete Lesson {index} first)
                          </span>
                        ) : (
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            Start Lesson <ArrowRight size={13} />
                          </span>
                        )}
                      </small>
                    </div>
                  </div>

                  <div
                    aria-hidden="true"
                    style={{
                      gridColumn: 2,
                      gridRow: 1,
                      justifySelf: "center",
                      zIndex: 1,
                      width: isActive ? 14 : 10,
                      height: isActive ? 14 : 10,
                      borderRadius: "50%",
                      background: isActive ? "var(--g-red)" : isCompleted ? "#16a34a" : "var(--g-ink)",
                      border: isCompleted ? "2px solid #16a34a" : "1px solid var(--g-ink)",
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}