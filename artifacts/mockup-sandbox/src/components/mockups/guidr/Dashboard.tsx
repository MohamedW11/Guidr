import { useState, useEffect } from "react";
import { Link, useLocation } from "./_shared/router";
import { Shell, OpportunityCard, opportunities as mockOpportunities } from "./_shared";
import { useAuth } from "../../../lib/AuthContext";
import { ArrowUpDown } from "lucide-react";
import "./_group.css";

function getDeadlineTimestamp(item: any): number {
  const dateVal = item.deadlineDate || item.date;
  if (!dateVal) return Infinity;
  const time = Date.parse(dateVal);
  return isNaN(time) ? Infinity : time;
}

function sortOpportunities(list: any[], sortMode: string) {
  const copy = [...list];
  if (sortMode === "deadline") {
    copy.sort((a, b) => getDeadlineTimestamp(a) - getDeadlineTimestamp(b));
  } else if (sortMode === "newest") {
    copy.sort((a, b) => {
      const timeA = a.createdAt ? Date.parse(a.createdAt) : 0;
      const timeB = b.createdAt ? Date.parse(b.createdAt) : 0;
      return timeB - timeA;
    });
  } else if (sortMode === "alpha") {
    copy.sort((a, b) => {
      const titleA = (a.title || a.name || "").toLowerCase();
      const titleB = (b.title || b.name || "").toLowerCase();
      return titleA.localeCompare(titleB);
    });
  }
  return copy;
}

export function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [nextLesson, setNextLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("deadline");

  const profile = user?.studentProfile;
  const firstName = profile?.firstName || "Student";

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [savedRes, oppsRes, lessonsRes] = await Promise.all([
          fetch("/api/opportunities/saved", { credentials: "include" }),
          fetch("/api/opportunities", { credentials: "include" }),
          fetch("/api/lessons", { credentials: "include" }),
        ]);

        if (savedRes.ok) {
          const savedData = await savedRes.json();
          setSavedItems(savedData);
        }

        if (oppsRes.ok) {
          const oppsData = await oppsRes.json();
          setRecommended(oppsData);
        }

        if (lessonsRes.ok) {
          const lessonsData = await lessonsRes.json();
          const next = lessonsData.find((l: any) => l.status === "published") || lessonsData[0];
          setNextLesson(next);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const toggleSave = async (id: string, isSaved: boolean) => {
    try {
      const method = isSaved ? "DELETE" : "POST";
      const res = await fetch(`/api/opportunities/${id}/save`, { method, credentials: "include" });
      if (res.ok) {
        if (isSaved) {
          setSavedItems((prev) => prev.filter((item) => item.id !== id));
        } else {
          const itemToSave = recommended.find((item) => item.id === id) || mockOpportunities.find((item) => item.id === id);
          if (itemToSave) {
            setSavedItems((prev) => [...prev, itemToSave]);
          }
        }
      }
    } catch (err) {
      console.error("Failed to toggle save opportunity:", err);
    }
  };

  const sortedSaved = sortOpportunities(savedItems, sortBy);
  const rawRecommended = recommended.length > 0 ? recommended : mockOpportunities;
  const sortedRecommended = sortOpportunities(rawRecommended, sortBy).slice(0, 3);

  return (
    <Shell active="Dashboard">
      <div className="content">
        <div className="topbar">
          <div>
            <div className="g-label">{new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
            <h1>
              Welcome back, {firstName}
              <span style={{ color: "var(--g-red)" }}>.</span>
            </h1>
            <p>Keep your momentum. Your next opportunity is closer than you think.</p>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: 30, color: "#666" }}>Loading opportunities...</div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, margin: 0 }}>
                {savedItems.length > 0 ? "Saved opportunities" : "Recommended for you"}
              </h2>

              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--g-muted)" }}>
                  <span style={{ fontWeight: 600 }}>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: "4px 8px",
                      fontSize: 11,
                      borderRadius: 4,
                      border: "1px solid var(--g-line)",
                      background: "#fff",
                      color: "var(--g-ink)",
                      cursor: "pointer",
                      fontWeight: 600,
                      outline: "none",
                    }}
                  >
                    <option value="deadline">Closing soon (deadline)</option>
                    <option value="newest">Newest added</option>
                    <option value="alpha">Alphabetical (A-Z)</option>
                  </select>
                </div>

                <Link href="/guidr/Opportunities" style={{ fontSize: 11, color: "var(--g-red)", textDecoration: "none" }}>
                  Explore all
                </Link>
              </div>
            </div>

            {savedItems.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div className="grid">
                  {sortedSaved.slice(0, 3).map((o) => (
                    <OpportunityCard
                      key={`saved-${o.id}`}
                      item={o}
                      saved={true}
                      onSave={() => toggleSave(o.id, true)}
                      onOpen={() => setLocation(`/guidr/OpportunityDetail?id=${o.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 28 }}>
              {savedItems.length > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <h2 style={{ fontSize: 20 }}>Recommended for you</h2>
                </div>
              )}
              <div className="grid">
                {sortedRecommended.map((o) => {
                  const isSaved = savedItems.some((s) => s.id === o.id);
                  return (
                    <OpportunityCard
                      key={`rec-${o.id}`}
                      item={o}
                      saved={isSaved}
                      onSave={() => toggleSave(o.id, isSaved)}
                      onOpen={() => setLocation(`/guidr/OpportunityDetail?id=${o.id}`)}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 28 }}>
          <div
            style={{
              background: "var(--g-ink)",
              color: "white",
              padding: 24,
              borderRadius: 8,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div className="g-label" style={{ color: "white" }}>
                Guidr Tutor · Next Lesson
              </div>
              <h2 style={{ fontSize: 20, margin: "12px 0 6px", fontWeight: 500, color: "white" }}>
                {nextLesson?.title || "Start your learning journey"}
              </h2>
              <p style={{ fontSize: 12, color: "#aaa", margin: 0, lineHeight: 1.5 }}>
                {nextLesson?.module || "Module 1: Fundamentals"}
              </p>
            </div>

            <div>
              <div style={{ height: 2, background: "#333", margin: "20px 0" }}>
                <div style={{ width: "40%", height: 2, background: "var(--g-red)" }} />
              </div>
              <Link
                href={nextLesson ? `/guidr/Lesson?id=${nextLesson.id}` : "/guidr/Tutor"}
                className="g-btn small"
                style={{ color: "white", borderColor: "#555", textDecoration: "none", width: "fit-content" }}
              >
                Resume Lesson
              </Link>
            </div>
          </div>

          <div
            style={{
              background: "var(--g-ink)",
              color: "white",
              padding: 24,
              borderRadius: 8,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div className="g-label" style={{ color: "white" }}>
                Based on your interests
              </div>
              <h2 style={{ fontSize: 20, margin: "12px 0 6px", fontWeight: 500, color: "white" }}>
                Explore Opportunities
              </h2>
              <p style={{ fontSize: 12, color: "#aaa", margin: 0, lineHeight: 1.5 }}>
                {recommended.length} fresh opportunities matching your profile are live across Egypt.
              </p>
            </div>

            <div>
              <div style={{ height: 2, background: "transparent", margin: "20px 0" }} />
              <Link
                href="/guidr/Opportunities"
                className="g-btn small"
                style={{ color: "white", borderColor: "#555", textDecoration: "none", width: "fit-content" }}
              >
                Explore catalog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}