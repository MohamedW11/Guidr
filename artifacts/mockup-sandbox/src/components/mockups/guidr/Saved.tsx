import { useState, useEffect } from "react";
import { Shell, OpportunityCard } from "./_shared";
import { Link, useLocation } from "./_shared/router";

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

export function Saved() {
  const [, setLocation] = useLocation();
  const [savedList, setSavedList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("deadline");

  const fetchSaved = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/opportunities/saved", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSavedList(data);
      }
    } catch (err) {
      console.error("Failed to fetch saved opportunities:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const unsaveOpportunity = async (id: string) => {
    try {
      const res = await fetch(`/api/opportunities/${id}/save`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setSavedList((prev: any[]) => prev.filter((item: any) => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to unsave opportunity:", err);
    }
  };

  const sortedList = sortOpportunities(savedList, sortBy);

  return (
    <Shell active="Saved">
      <div className="content">
        <div className="g-label">Your list</div>
        <h1 style={{ fontSize: 36, margin: "7px 0" }}>
          Saved opportunities<span style={{ color: "var(--g-red)" }}>.</span>
        </h1>
        <p style={{ fontSize: 12, color: "var(--g-muted)", marginBottom: 28 }}>
          Everything you’ve bookmarked, in one place, so nothing gets lost in a hundred tabs.
        </p>

        {isLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#666" }}>Loading saved opportunities...</div>
        ) : savedList.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              background: "#fff",
              border: "1px solid #e5e5e5",
              borderRadius: 8,
              color: "#666",
            }}
          >
            You haven't saved any opportunities yet. Browse the catalog to save programs for later!
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#666" }}>
                Saved <b>{savedList.length}</b> opportunities
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--g-muted)" }}>
                <span style={{ fontWeight: 600 }}>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: "5px 10px",
                    fontSize: 12,
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
            </div>            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {sortedList.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  item={opp}
                  saved={true}
                  onSave={() => unsaveOpportunity(opp.id)}
                  onOpen={() => setLocation(`/guidr/OpportunityDetail?id=${opp.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}