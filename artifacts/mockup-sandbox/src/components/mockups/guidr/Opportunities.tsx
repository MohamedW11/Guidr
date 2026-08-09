import { useState, useEffect } from "react";
import { useLocation } from "./_shared/router";
import { Shell, OpportunityCard } from "./_shared";
import { MVP_CATEGORIES, EGYPTIAN_GOVERNORATES, STUDENT_INTERESTS } from "../../../lib/governorates";
import { Bookmark, MapPin, Calendar, ExternalLink, ArrowUpDown } from "lucide-react";
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

export function Opportunities() {
  const [, setLocation] = useLocation();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("deadline");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchOpportunities = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("search", query);
      if (selectedCategory !== "All") params.append("category", selectedCategory);

      const res = await fetch(`/api/opportunities?${params.toString()}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data);
      }
    } catch (err) {
      console.error("Failed to fetch opportunities:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [query, selectedCategory]);

  const toggleSave = async (id: string, isSaved: boolean) => {
    try {
      const method = isSaved ? "DELETE" : "POST";
      const res = await fetch(`/api/opportunities/${id}/save`, { method, credentials: "include" });
      if (res.ok) {
        setOpportunities((prev) =>
          prev.map((o) => (o.id === id ? { ...o, isSaved: !isSaved } : o)),
        );
      }
    } catch (err) {
      console.error("Failed to toggle save opportunity:", err);
    }
  };

  const filteredOpportunities = opportunities.filter((item) => {
    if (selectedCategory !== "All") {
      const itemCats = item.categories || (item.tag ? [item.tag] : []);
      const matchCat = itemCats.some((c: string) => c.toLowerCase() === selectedCategory.toLowerCase());
      if (!matchCat) return false;
    }

    if (selectedModes.length > 0) {
      const itemMode = (item.locationType || item.mode || "").toLowerCase();
      const matchMode = selectedModes.some((m) => {
        if (m === "in_person") return itemMode.includes("in_person") || itemMode.includes("in-person");
        if (m === "online") return itemMode.includes("online");
        if (m === "hybrid") return itemMode.includes("hybrid");
        return false;
      });
      if (!matchMode) return false;
    }

    if (selectedInterests.length > 0) {
      const itemText = [
        item.name || item.title || "",
        item.description || item.desc || "",
        ...(item.types || []),
        ...(item.categories || []),
        item.tag || "",
      ].join(" ").toLowerCase();

      const matchInterest = selectedInterests.some((interest) =>
        itemText.includes(interest.toLowerCase())
      );
      if (!matchInterest) return false;
    }

    return true;
  });

  const sortedList = sortOpportunities(filteredOpportunities, sortBy);

  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedInterests.length > 0 ||
    selectedModes.length > 0;

  return (
    <Shell active="Opportunities">
      <div className="content">
        <div style={{ background: "var(--g-ink)", color: "white", padding: "28px 24px", margin: "0 0 24px", borderRadius: 8 }}>
          <div className="g-label" style={{ color: "white" }}>Explore with intention</div>
          <h1 style={{ fontSize: "clamp(24px, 5vw, 36px)", margin: "8px 0 16px" }}>
            Find your next yes<span style={{ color: "#bd3b3f" }}>.</span>
          </h1>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by keyword, title, or organization..."
            style={{ width: "min(480px,100%)", padding: 12, background: "#fff", border: 0, borderRadius: 4, color: "#111", minHeight: 44 }}
          />
        </div>

        {/* Results bar above grid with mobile filter toggle */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 13, color: "var(--g-ink)", fontWeight: 500, display: "flex", alignItems: "center", gap: 12 }}>
            <span>
              Showing <b style={{ color: "var(--g-red)" }}>{sortedList.length}</b> opportunities
            </span>
            <button
              type="button"
              className="g-btn small"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              style={{ padding: "6px 12px", background: showMobileFilters ? "var(--g-red)" : "#fff", color: showMobileFilters ? "#fff" : "var(--g-ink)" }}
            >
              Filters {hasActiveFilters && "•"}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--g-muted)" }}>
            <span style={{ fontWeight: 600 }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "6px 12px",
                fontSize: 12,
                borderRadius: 6,
                border: "1px solid var(--g-line)",
                background: "#fff",
                color: "var(--g-ink)",
                cursor: "pointer",
                fontWeight: 600,
                outline: "none",
                minHeight: 38,
              }}
            >
              <option value="deadline">Closing soon (deadline)</option>
              <option value="newest">Newest added</option>
              <option value="alpha">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Main Grid: Filter Block and Opportunity Cards */}
        <div className="opp-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, alignItems: "start" }}>
          <aside
            style={{
              background: "#fff",
              border: "1px solid var(--g-line)",
              padding: 18,
              borderRadius: 8,
              height: "fit-content",
              margin: 0,
              display: typeof window !== "undefined" && window.innerWidth < 768 && !showMobileFilters ? "none" : "block",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <b style={{ fontSize: 13 }}>Filters</b>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedInterests([]);
                    setSelectedModes([]);
                  }}
                  style={{ background: "none", border: 0, color: "var(--g-red)", fontSize: 11, cursor: "pointer", fontWeight: 600 }}
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div style={{ marginBottom: 18 }}>
              <b style={{ fontSize: 12, display: "block", marginBottom: 8, color: "var(--g-ink)" }}>Category</b>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedCategory === "All"}
                    onChange={() => setSelectedCategory("All")}
                    style={{ accentColor: "var(--g-red)" }}
                  />
                  <span>All Categories</span>
                </label>
                {MVP_CATEGORIES.map((cat: string) => (
                  <label key={cat} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(selectedCategory === cat ? "All" : cat)}
                      style={{ accentColor: "var(--g-red)" }}
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Where Filter (In-person / Online / Hybrid) */}
            <div style={{ marginBottom: 18, paddingTop: 14, borderTop: "1px solid var(--g-line)" }}>
              <b style={{ fontSize: 12, display: "block", marginBottom: 8, color: "var(--g-ink)" }}>Where</b>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "In-person", value: "in_person" },
                  { label: "Online", value: "online" },
                  { label: "Hybrid", value: "hybrid" },
                ].map((mode) => {
                  const isChecked = selectedModes.includes(mode.value);
                  return (
                    <label key={mode.value} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedModes((prev) => prev.filter((m) => m !== mode.value));
                          } else {
                            setSelectedModes((prev) => [...prev, mode.value]);
                          }
                        }}
                        style={{ accentColor: "var(--g-red)" }}
                      />
                      <span>{mode.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Interests Filter */}
            <div style={{ paddingTop: 14, borderTop: "1px solid var(--g-line)" }}>
              <b style={{ fontSize: 12, display: "block", marginBottom: 8, color: "var(--g-ink)" }}>Interests</b>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto", paddingRight: 4 }}>
                {STUDENT_INTERESTS.map((interest: string) => {
                  const isChecked = selectedInterests.includes(interest);
                  return (
                    <label key={interest} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedInterests((prev) => prev.filter((i) => i !== interest));
                          } else {
                            setSelectedInterests((prev) => [...prev, interest]);
                          }
                        }}
                        style={{ accentColor: "var(--g-red)" }}
                      />
                      <span>{interest}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </aside>

          <div style={{ margin: 0 }}>
            {isLoading ? (
              <div style={{ padding: 40, textAlign: "center", color: "#666" }}>Loading opportunities...</div>
            ) : sortedList.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
                No active opportunities found matching your filters.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {sortedList.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    item={opp}
                    saved={opp.isSaved}
                    onSave={() => toggleSave(opp.id, opp.isSaved)}
                    onOpen={() => setLocation(`/guidr/OpportunityDetail?id=${opp.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}