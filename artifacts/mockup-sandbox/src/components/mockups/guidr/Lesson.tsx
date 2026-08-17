import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "./_shared/router";
import { Shell } from "./_shared";
import { DEFAULT_MOCK_LESSONS } from "./Tutor";
import { Send, Bot, User, Check, Sparkles, RotateCcw, PlayCircle, ArrowLeft, GraduationCap, Video } from "lucide-react";
import "./_group.css";

const DEFAULT_DEMO_LESSON = DEFAULT_MOCK_LESSONS[0];

export function Lesson() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const lessonId = params.get("id") || "demo-know-1";

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
        const foundLocal = DEFAULT_MOCK_LESSONS.find((l) => l.id === lessonId || l.title === lessonId);
        
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
        const foundLocal = DEFAULT_MOCK_LESSONS.find((l) => l.id === lessonId || l.title === lessonId);
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
      const currentIndex = DEFAULT_MOCK_LESSONS.findIndex((l) => l.id === lessonId || l.title === lessonId);
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
          lesson?.title || "Educational Opportunities",
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
          lesson?.title || "Educational Opportunities",
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
      content: `You are Guidr, a friendly, encouraging AI tutor for Egyptian high school students.
  
Your Guidelines:
1. FRIENDLY TUTOR TONE: Speak warmly and casually, like a supportive senior student or study buddy.
2. KEEP IT SHORT: Give brief, punchy responses (2-4 sentences max). Never send long essays or walls of text.
3. MISCONCEPTION DETECTION: Intuit what the student is confused about and clarify it simply.
4. QUICK CHECK-IN: End with a quick 1-line follow-up question or encouragement.

Lesson Title: "${lessonTitle}"

[LESSON CONTENT]
${lessonContent ? lessonContent.slice(0, 1500) : "Educational opportunities, profile building, scholarships, and applications."}`,
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
      return `Great question about **${lessonTitle}**!\n\n💡 **Core Concept**: Pay close attention to the key principles outlined in this lesson.`;
    }
    if (queryLower.includes("how") || queryLower.includes("step") || queryLower.includes("process")) {
      return `Here is how to approach **${userText}** in *${lessonTitle}*:\n\n1. Define your goal.\n2. Review eligibility.\n3. Execute your plan step by step.`;
    }
    return `Regarding your question (*"${userText}"*) in **${lessonTitle}**:\n\nReview the core definitions and key takeaways in this lesson. Feel free to ask if you'd like a step-by-step example!`;
  }

  // Helper to format YouTube or direct video URL for embed
  const getEmbedVideoUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) {
      const vId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${vId}`;
    }
    if (url.includes("youtu.be/")) {
      const vId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${vId}`;
    }
    return url;
  };

  if (isLoading) {
    return (
      <Shell active="Guidr Tutor">
        <div className="content" style={{ padding: 40, textAlign: "center", color: "#666" }}>
          Loading lesson content & video...
        </div>
      </Shell>
    );
  }

  if (!lesson) {
    return (
      <Shell active="Guidr Tutor">
        <div className="content" style={{ padding: 40, textAlign: "center" }}>
          <h2>Lesson not found</h2>
          <Link href="/guidr/Tutor" style={{ color: "var(--g-red)" }}>
            Return to Guidr Tutor catalog
          </Link>
        </div>
      </Shell>
    );
  }

  const embedUrl = getEmbedVideoUrl(lesson.videoUrl);

  return (
    <Shell active="Guidr Tutor">
      <div className="content" style={{ maxWidth: 1150, margin: "0 auto" }}>
        
        {/* GUIDR TUTOR BRANDING HEADER BAR - VISIBLE ON EVERY LESSON PAGE */}
        <div
          style={{
            background: "var(--g-ink)",
            color: "#fff",
            padding: "16px 24px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 0, // Sharp square corners
            boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 38,
                height: 38,
                background: "var(--g-red)",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              <GraduationCap size={22} />
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#fca5a5", fontWeight: 700 }}>
                Guidr Tutor Learning Path
              </div>
              <h2 style={{ fontSize: 18, margin: "2px 0 0", color: "#fff", fontWeight: 700 }}>
                Module: {lesson.module || "Know"} · {lesson.title}
              </h2>
            </div>
          </div>

          <Link
            href="/guidr/Tutor"
            style={{
              color: "#fff",
              textDecoration: "none",
              fontSize: 12,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#262626",
              padding: "8px 14px",
              border: "1px solid #444",
            }}
          >
            <ArrowLeft size={14} /> Back to Guidr Tutor
          </Link>
        </div>

        {/* Mobile Tab Switcher (< 768px) */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }} className="lesson-mobile-tabs">
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
            📖 Lesson & Video
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

        {/* Main Content Layout Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24 }}>
          
          {/* Main Article Container */}
          <article
            style={{
              background: "#fff",
              border: "1px solid var(--g-line)",
              padding: "24px 22px",
              borderRadius: 0, // Sharp square corners
              display: typeof window !== "undefined" && window.innerWidth < 768 && activeMobileTab !== "lesson" ? "none" : "block",
            }}
          >
            {/* VIDEO SECTION ABOVE LESSON CONTENT REQUIREMENT */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Video size={18} color="var(--g-red)" />
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--g-ink)" }}>Video Lesson</h3>
              </div>

              {embedUrl ? (
                embedUrl.includes("youtube.com") ? (
                  <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, background: "#000", border: "1px solid var(--g-ink)" }}>
                    <iframe
                      src={embedUrl}
                      title={lesson.title}
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <video
                    src={embedUrl}
                    controls
                    style={{ width: "100%", maxHeight: 380, background: "#000", border: "1px solid var(--g-ink)" }}
                  />
                )
              ) : (
                /* Sleek Video Player Container Placeholder when no video assigned */
                <div
                  style={{
                    width: "100%",
                    minHeight: 220,
                    background: "linear-gradient(135deg, #181818 0%, #0d0d0d 100%)",
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid var(--g-ink)",
                    padding: 24,
                    textAlign: "center",
                  }}
                >
                  <PlayCircle size={44} color="var(--g-red)" style={{ opacity: 0.9, marginBottom: 8 }} />
                  <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>Video Lesson</div>
                  <p style={{ fontSize: 12, color: "#aaa", margin: "6px 0 0", maxWidth: 420 }}>
                    No video assigned yet for this lesson. Watch for updates or read the complete written guide below.
                  </p>
                </div>
              )}
            </div>

            {/* Written Lesson Content */}
            <div style={{ borderTop: "1px solid var(--g-line)", paddingTop: 24 }}>
              <h1 style={{ fontSize: "clamp(22px, 4vw, 30px)", margin: "0 0 16px", fontWeight: 700, color: "var(--g-ink)" }}>
                {lesson.title}
              </h1>

              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.75,
                  color: "#333",
                  whiteSpace: "pre-wrap",
                  marginBottom: 32,
                }}
              >
                {lesson.content || "No written lesson content provided."}
              </div>

              {/* Complete Button */}
              <button
                className="g-btn red"
                onClick={handleToggleComplete}
                style={{
                  background: completed ? "#16a34a" : "var(--g-red)",
                  borderColor: completed ? "#16a34a" : "var(--g-red)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 18px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  width: "100%",
                  justifyContent: "center",
                  minHeight: 46,
                  borderRadius: 0, // Sharp square corners
                }}
              >
                {completed ? <Check size={16} /> : null}
                {completed ? "Lesson Completed (Advancing...)" : "Mark Lesson as Completed"}
              </button>
            </div>
          </article>

          {/* Guidr Tutor AI Chat Panel */}
          <aside
            style={{
              background: "var(--g-ink)",
              color: "white",
              padding: 20,
              borderRadius: 0, // Sharp square corners
              display: typeof window !== "undefined" && window.innerWidth < 768 && activeMobileTab !== "chat" ? "none" : "flex",
              flexDirection: "column",
              minHeight: 560,
              maxHeight: 740,
              border: "1px solid var(--g-ink)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid #333", marginBottom: 14 }}>
              <div>
                <div className="g-label" style={{ color: "var(--g-red)", display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
                  <Sparkles size={14} /> Guidr AI Tutor
                </div>
                <h3 style={{ fontSize: 15, margin: "3px 0 0", color: "#fff" }}>Ask anything about this lesson</h3>
              </div>
              <button
                type="button"
                onClick={handleNewChat}
                style={{
                  background: "#262626",
                  border: "1px solid #444",
                  color: "#fff",
                  padding: "6px 12px",
                  borderRadius: 0,
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
                <div style={{ fontSize: 12, color: "#aaa", textAlign: "center", marginTop: 32, lineHeight: 1.6 }}>
                  👋 Hi! I'm your <b>Guidr Tutor</b> assistant.<br />
                  Ask me questions about <i>"{lesson.title}"</i> or ask for examples and tips!
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={msg.id || idx}
                    style={{
                      alignSelf: msg.role === "student" ? "flex-end" : "flex-start",
                      maxWidth: "88%",
                      background: msg.role === "student" ? "var(--g-red)" : "#262626",
                      color: "#fff",
                      borderRadius: 0,
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
            <form onSubmit={handleSendMessage} style={{ marginTop: 14, display: "flex", gap: 8 }}>
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask a question about this lesson..."
                style={{
                  flex: 1,
                  background: "#262626",
                  border: "1px solid #444",
                  borderRadius: 0,
                  padding: "10px 12px",
                  color: "#fff",
                  fontSize: 12,
                }}
              />
              <button
                type="submit"
                disabled={isSending || !inputMessage.trim()}
                style={{
                  background: "var(--g-red)",
                  border: 0,
                  borderRadius: 0,
                  color: "#fff",
                  padding: "0 16px",
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