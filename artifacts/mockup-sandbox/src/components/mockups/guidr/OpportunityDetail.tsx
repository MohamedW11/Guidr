import { useState, useEffect } from "react";
import { Link } from "./_shared/router";
import { Shell, opportunities as mockOpportunities, getOpportunityImage } from "./_shared";
import { Bookmark, MapPin, Calendar, ExternalLink, ArrowLeft } from "lucide-react";
import "./_group.css";

export function OpportunityDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const [opp, setOpp] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      if (!id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(`/api/opportunities/${id}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setOpp(data);
          setIsSaved(data.isSaved || false);
        } else {
          const fallback = mockOpportunities.find((o) => String(o.id).toLowerCase() === String(id).toLowerCase());
          if (fallback) {
            setOpp(fallback);
          }
        }
      } catch (err) {
        console.error("Failed to fetch opportunity detail:", err);
        const fallback = mockOpportunities.find((o) => String(o.id).toLowerCase() === String(id).toLowerCase());
        if (fallback) {
          setOpp(fallback);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const toggleSave = async () => {
    if (!id) return;
    try {
      const method = isSaved ? "DELETE" : "POST";
      const res = await fetch(`/api/opportunities/${id}/save`, { method, credentials: "include" });
      if (res.ok) {
        setIsSaved(!isSaved);
      }
    } catch (err) {
      console.error("Failed to toggle save:", err);
    }
  };

  if (isLoading) {
    return (
      <Shell active="Opportunities">
        <div className="content" style={{ padding: 40, textAlign: "center", color: "#666" }}>
          Loading opportunity details...
        </div>
      </Shell>
    );
  }

  if (!opp) {
    return (
      <Shell active="Opportunities">
        <div className="content" style={{ padding: 40, textAlign: "center" }}>
          <h2>Opportunity not found</h2>
          <Link href="/guidr/Opportunities" style={{ color: "#bd3b3f" }}>
            Return to opportunities catalog
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell active="Opportunities">
      <div className="content">
        <Link
          href="/guidr/Opportunities"
          style={{ fontSize: 12, color: "var(--g-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          <ArrowLeft size={13} /> Back to opportunities
        </Link>

        <section style={{ background: "var(--g-ink)", color: "white", padding: "24px 20px", marginTop: 16, borderRadius: 8 }}>
          <span className="tag" style={{ background: "#111111", color: "#fff", padding: "4px 8px", borderRadius: 4, fontSize: 11 }}>
            {opp.categories?.[0] || "Opportunity"}
          </span>
          <h1 style={{ fontSize: "clamp(22px, 5vw, 34px)", margin: "14px 0 6px", fontWeight: 700 }}>{opp.name}</h1>
          <p style={{ fontSize: 13, color: "#ccc" }}>
            {opp.organization} · {opp.locationType} ({opp.locationDetails || "Egypt"})
          </p>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginTop: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>About this opportunity</h2>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#333", whiteSpace: "pre-wrap" }}>{opp.description}</p>

            {opp.additionalRequirements && (
              <>
                <h2 style={{ fontSize: 20, margin: "24px 0 8px" }}>Eligibility & Requirements</h2>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "#444", whiteSpace: "pre-wrap" }}>
                  {opp.additionalRequirements}
                </p>
              </>
            )}

            {opp.timeline && (
              <>
                <h2 style={{ fontSize: 20, margin: "24px 0 8px" }}>Timeline & Key Dates</h2>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "#444", whiteSpace: "pre-wrap" }}>{opp.timeline}</p>
              </>
            )}

            {opp.applicationProcess && (
              <>
                <h2 style={{ fontSize: 20, margin: "24px 0 8px" }}>Application Process</h2>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "#444", whiteSpace: "pre-wrap" }}>
                  {opp.applicationProcess}
                </p>
              </>
            )}
          </div>

          <aside className="card" style={{ padding: 20, height: "fit-content", background: "#fff", border: "1px solid #e5e5e5", borderRadius: 8 }}>
            <div className="g-label" style={{ color: "#bd3b3f", fontWeight: 600 }}>
              Deadline
            </div>
            <h3 style={{ fontSize: 18, margin: "6px 0 16px" }}>{opp.deadlineDate || "Rolling / No strict deadline"}</h3>

            {opp.applicationLink && (
              <a
                href={opp.applicationLink}
                target="_blank"
                rel="noreferrer"
                className="g-btn red"
                style={{
                  width: "100%",
                  textAlign: "center",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  textDecoration: "none",
                  marginBottom: 10,
                }}
              >
                Apply Now <ExternalLink size={14} />
              </a>
            )}

            <button
              className="g-btn"
              style={{
                width: "100%",
                background: isSaved ? "rgba(189, 59, 63, 0.1)" : "#f5f5f5",
                borderColor: isSaved ? "#bd3b3f" : "#ccc",
                color: isSaved ? "#bd3b3f" : "#333",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
              onClick={toggleSave}
            >
              <Bookmark size={14} fill={isSaved ? "#bd3b3f" : "none"} />
              {isSaved ? "Saved" : "Save opportunity"}
            </button>
          </aside>
        </div>
      </div>
    </Shell>
  );
}