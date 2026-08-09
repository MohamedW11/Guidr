import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "./_shared/router";
import { Shell } from "./_shared";
import { DEFAULT_MOCK_LESSONS } from "./Tutor";
import { Send, Bot, User, Check, Sparkles, RotateCcw } from "lucide-react";
import "./_group.css";

const DEFAULT_DEMO_LESSON = DEFAULT_MOCK_LESSONS[0];

export function Lesson() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const lessonId = params.get("id") || "demo-1";

  const [lesson, setLesson] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMobileTab, setActiveMobileTab] = useState<"lesson" | "chat">("lesson");

  // Chat state
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadLessonAndChat() {
      setIsLoading(true);
      try {
        const foundLocal = DEFAULT_MOCK_LESSONS.find((l) => l.id === lessonId);
        
        // Fetch lesson detail
        const lRes = await fetch(`/api/lessons/${lessonId}`, { credentials: "include" });
        if (lRes.ok) {
          const lData = await lRes.json();
          setLesson(lData);
          setCompleted(lData.completed || false);
        } else {
          setLesson(foundLocal || DEFAULT_DEMO_LESSON);
        }

        // Fetch chat history
        const cRes = await fetch(`/api/lessons/${lessonId}/chat/history`, { credentials: "include" });
        if (cRes.ok) {
          const cData = await cRes.json();
          setChatMessages(cData);
        }
      } catch (err) {
        console.error("Failed to load lesson or chat:", err);
        const foundLocal = DEFAULT_MOCK_LESSONS.find((l) => l.id === lessonId);
        setLesson(foundLocal || DEFAULT_DEMO_LESSON);
      } finally {
        setIsLoading(false);
      }
    }

    loadLessonAndChat();
  }, [lessonId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isSending]);

  const handleToggleComplete = async () => {
    const newStatus = !completed;
    setCompleted(newStatus);

    try {
      if (lessonId) {
        await fetch(`/api/lessons/${lessonId}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: newStatus }),
          credentials: "include",
        });
      }
    } catch (err) {
      console.error("Failed to update progress:", err);
    }

    // Auto-advance to next lesson if completed
    if (newStatus) {
      const currentIndex = DEFAULT_MOCK_LESSONS.findIndex((l) => l.id === (lessonId || "demo-1"));
      const nextLesson = DEFAULT_MOCK_LESSONS[currentIndex + 1];
      if (nextLesson) {
        setTimeout(() => {
          setLocation(`/guidr/Lesson?id=${nextLesson.id}`);
        }, 400);
      } else {
        setTimeout(() => {
          setLocation("/guidr/Tutor");
        }, 400);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userText = inputMessage.trim();
    setInputMessage("");

    // Optimistically append user message
    setChatMessages((prev) => [...prev, { role: "student", content: userText, id: Date.now().toString() }]);
    setIsSending(true);

    try {
      const res = await fetch(`/api/lessons/${lessonId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response, id: (Date.now() + 1).toString() },
        ]);
      } else {
        const liveResponse = await fetchLiveGroqTutor(
          userText,
          lesson?.title || "Scientific Method & Hypotheses",
          lesson?.content || "",
          chatMessages
        );
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: liveResponse, id: (Date.now() + 1).toString() },
        ]);
      }
    } catch (err) {
      console.error("Chat backend error, invoking live Groq API:", err);
      try {
        const liveResponse = await fetchLiveGroqTutor(
          userText,
          lesson?.title || "Scientific Method & Hypotheses",
          lesson?.content || "",
          chatMessages
        );
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: liveResponse, id: (Date.now() + 1).toString() },
        ]);
      } catch (groqErr) {
        const fallbackText = generateSimulatedResponse(userText, lesson?.title || "this lesson");
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: fallbackText, id: (Date.now() + 1).toString() },
        ]);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleNewChat = () => {
    setChatMessages([]);
  };

const GROQ_API_KEY = "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";

async function fetchLiveGroqTutor(
  userText: string,
  lessonTitle: string,
  lessonContent: string,
  history: any[]
): Promise<string> {
  const systemPrompt = {
    role: "system",
    content: `You are Guidr, a friendly, encouraging AI tutor friend for Egyptian high school students.

Your Guidelines:
1. FRIENDLY TUTOR TONE: Speak warmly and casually, like a supportive senior student or study buddy.
2. KEEP IT SHORT: Give brief, punchy responses (2-4 sentences max). Never send long essays or walls of text.
3. MISCONCEPTION DETECTION: Intuit what the student is confused about. Identify the exact mix-up (e.g., "Sounds like you might be confusing X and Y!") and clarify it simply.
4. QUICK CHECK-IN: End with a quick 1-line follow-up question or encouragement to verify they understood.

Lesson Title: "${lessonTitle}"

[LESSON CONTENT]
${lessonContent ? lessonContent.slice(0, 1500) : "Scientific method, independent & dependent variables, control groups, and writing testable hypotheses."}`,
  };

  const historyPayload = history.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }));

  const messages = [systemPrompt, ...historyPayload, { role: "user", content: userText }];

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.6,
      max_tokens: 280,
    }),
  });

  if (res.ok) {
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "I am here to help you study!";
  }

  throw new Error("Groq API call failed");
}

function generateSimulatedResponse(userText: string, lessonTitle: string): string {
  const queryLower = userText.toLowerCase().trim();
  if (queryLower.includes("what") || queryLower.includes("define") || queryLower.includes("meaning")) {
    return `Great question about **${lessonTitle}**!\n\n💡 **Core Concept**: Pay close attention to the independent/dependent variables and testable hypothesis structure outlined in this lesson.`;
  }
  if (queryLower.includes("how") || queryLower.includes("step") || queryLower.includes("process")) {
    return `Here is how to approach **${userText}** in *${lessonTitle}*:\n\n1. Define your primary question.\n2. Isolate controllable variables.\n3. Draft your findings matching standard scientific format.`;
  }
  if (queryLower.includes("example") || queryLower.includes("sample")) {
    return `Here is a practical example for **${lessonTitle}**:\n\n*"If salt concentration increases, then cell volume decreases due to osmosis."*`;
  }
  return `Regarding your question (*"${userText}"*) in **${lessonTitle}**:\n\nReview the core definitions and key takeaways in this lesson to solidify your understanding. Feel free to ask if you'd like a step-by-step example!`;
}

  if (isLoading) {
    return (
      <Shell active="Guidr Tutor">
        <div className="content" style={{ padding: 40, textAlign: "center", color: "#666" }}>
          Loading lesson content & AI assistant...
        </div>
      </Shell>
    );
  }

  if (!lesson) {
    return (
      <Shell active="Guidr Tutor">
        <div className="content" style={{ padding: 40, textAlign: "center" }}>
          <h2>Lesson not found</h2>
          <Link href="/guidr/Tutor" style={{ color: "#bd3b3f" }}>
            Return to Guidr Tutor catalog
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell active="Guidr Tutor">
      <div className="content">
        <Link href="/guidr/Tutor" style={{ fontSize: 12, color: "var(--g-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
          ← Back to Guidr Tutor / {lesson.title}
        </Link>

        {/* Mobile Tab Switcher (< 768px) */}
        <div style={{ display: "flex", gap: 8, marginTop: 14, marginBottom: 14 }} className="lesson-mobile-tabs">
          <button
            type="button"
            className="g-btn small"
            onClick={() => setActiveMobileTab("lesson")}
            style={{
              flex: 1,
              background: activeMobileTab === "lesson" ? "var(--g-red)" : "#fff",
              color: activeMobileTab === "lesson" ? "#fff" : "var(--g-ink)",
              borderColor: activeMobileTab === "lesson" ? "var(--g-red)" : "var(--g-line)",
              fontWeight: 600,
            }}
          >
            📖 Lesson Guide
          </button>
          <button
            type="button"
            className="g-btn small"
            onClick={() => setActiveMobileTab("chat")}
            style={{
              flex: 1,
              background: activeMobileTab === "chat" ? "var(--g-red)" : "#fff",
              color: activeMobileTab === "chat" ? "#fff" : "var(--g-ink)",
              borderColor: activeMobileTab === "chat" ? "var(--g-red)" : "var(--g-line)",
              fontWeight: 600,
            }}
          >
            💬 Guidr Tutor AI
          </button>
        </div>

        {/* Responsive grid layout */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginTop: 14 }}>
          {/* Main Lesson Content */}
          <article
            className="card"
            style={{
              padding: "24px 20px",
              background: "#fff",
              borderRadius: 8,
              border: "1px solid #e5e5e5",
              display: typeof window !== "undefined" && window.innerWidth < 768 && activeMobileTab !== "lesson" ? "none" : "block",
            }}
          >
            <h1 style={{ fontSize: "clamp(22px, 5vw, 32px)", margin: "0 0 16px", fontWeight: 700 }}>{lesson.title}</h1>

            <div
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: "#333",
                whiteSpace: "pre-wrap",
                marginBottom: 32,
              }}
            >
              {lesson.content || "No lesson content provided."}
            </div>

            <button
              className="g-btn red"
              onClick={handleToggleComplete}
              style={{
                background: completed ? "#16a34a" : "#bd3b3f",
                borderColor: completed ? "#16a34a" : "#bd3b3f",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 18px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                width: "100%",
                justifyContent: "center",
                minHeight: 44,
              }}
            >
              {completed ? <Check size={16} /> : null}
              {completed ? "Lesson Completed (Advancing...)" : "Mark Lesson as Completed"}
            </button>
          </article>

          {/* Guidr Tutor AI Chat Panel */}
          <aside
            style={{
              background: "var(--g-ink)",
              color: "white",
              padding: 18,
              borderRadius: 8,
              display: typeof window !== "undefined" && window.innerWidth < 768 && activeMobileTab !== "chat" ? "none" : "flex",
              flexDirection: "column",
              minHeight: 520,
              maxHeight: 700,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid #333", marginBottom: 12 }}>
              <div>
                <div className="g-label" style={{ color: "#bd3b3f", display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
                  <Sparkles size={14} /> Guidr AI Tutor
                </div>
                <h3 style={{ fontSize: 15, margin: "2px 0 0", color: "#fff" }}>Ask anything about this lesson</h3>
              </div>
              <button
                type="button"
                onClick={handleNewChat}
                style={{
                  background: "#262626",
                  border: "1px solid #444",
                  color: "#fff",
                  padding: "5px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontWeight: 600,
                }}
              >
                <RotateCcw size={12} /> New Chat
              </button>
            </div>

            {/* Chat message list */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 4 }}>
              {chatMessages.length === 0 ? (
                <div style={{ fontSize: 12, color: "#aaa", textAlign: "center", marginTop: 24, lineHeight: 1.5 }}>
                  👋 Hi! I'm your <b>Guidr Tutor</b> study buddy.<br />
                  Ask me anything about <i>"{lesson.title}"</i> or tell me what you find confusing!
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={msg.id || idx}
                    style={{
                      alignSelf: msg.role === "student" ? "flex-end" : "flex-start",
                      maxWidth: "88%",
                      background: msg.role === "student" ? "#bd3b3f" : "#262626",
                      color: "#fff",
                      borderRadius: 8,
                      padding: "10px 14px",
                      fontSize: 13,
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    <div style={{ fontSize: 10, opacity: 0.75, marginBottom: 4, display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                      {msg.role === "student" ? <User size={10} /> : <Bot size={10} />}
                      {msg.role === "student" ? "You" : "Guidr Tutor"}
                    </div>
                    {msg.content}
                  </div>
                ))
              )}
              {isSending && (
                <div style={{ fontSize: 11, color: "#aaa", fontStyle: "italic" }}>Guidr Tutor is typing...</div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask a question or explain what's confusing..."
                style={{
                  flex: 1,
                  background: "#262626",
                  border: "1px solid #444",
                  borderRadius: 6,
                  padding: "9px 12px",
                  color: "#fff",
                  fontSize: 12,
                }}
              />
              <button
                type="submit"
                disabled={isSending || !inputMessage.trim()}
                style={{
                  background: "#bd3b3f",
                  border: 0,
                  borderRadius: 6,
                  color: "#fff",
                  padding: "0 14px",
                  cursor: "pointer",
                }}
              >
                <Send size={14} />
              </button>
            </form>
          </aside>
        </div>
      </div>
    </Shell>
  );
}