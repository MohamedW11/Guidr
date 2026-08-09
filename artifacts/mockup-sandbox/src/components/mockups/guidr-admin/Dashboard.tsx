import { useState, useEffect } from "react";
import { ArrowRight, GraduationCap, LayoutList, PenLine, Plus } from "lucide-react";
import { Link } from "../guidr/_shared/router";
import { AdminShell, AdminTop } from "./_shared/AdminShell";
import "./_group.css";

export function Dashboard() {
  const [opps, setOpps] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdminCounts() {
      setIsLoading(true);
      try {
        const [oppsRes, lessonsRes] = await Promise.all([
          fetch("/api/admin/opportunities", { credentials: "include" }),
          fetch("/api/admin/lessons", { credentials: "include" }),
        ]);

        if (oppsRes.ok) {
          const data = await oppsRes.json();
          setOpps(data);
        }

        if (lessonsRes.ok) {
          const data = await lessonsRes.json();
          setLessons(data);
        }
      } catch (err) {
        console.error("Failed to load admin counts:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminCounts();
  }, []);

  const totalOpps = opps.length;
  const activeOpps = opps.filter((i) => i.status === "active").length;
  const draftOpps = opps.filter((i) => i.status === "draft").length;
  const archivedOpps = opps.filter((i) => i.status === "archived").length;

  const totalLessons = lessons.length;
  const publishedLessons = lessons.filter((i) => i.status === "published").length;
  const draftLessons = lessons.filter((i) => i.status === "draft").length;
  const lockedLessons = lessons.filter((i) => i.status === "locked").length;

  return (
    <AdminShell active="Dashboard">
      <div className="ga-content">
        <AdminTop
          eyebrow="Overview"
          title="Dashboard"
          description="Manage the opportunities and learning paths that help Egypt's students make their next move."
        />

        <div className="ga-summary">
          <div className="ga-stat">
            <strong>{isLoading ? "..." : totalOpps}</strong>
            <span>Total opportunities</span>
          </div>
          <div className="ga-stat">
            <strong>{isLoading ? "..." : activeOpps}</strong>
            <span>Live for students</span>
          </div>
          <div className="ga-stat">
            <strong>{isLoading ? "..." : totalLessons}</strong>
            <span>Total lessons</span>
          </div>
          <div className="ga-stat">
            <strong>{isLoading ? "..." : publishedLessons}</strong>
            <span>Published lessons</span>
          </div>
        </div>

        <div className="ga-cards">
          <article className="ga-card">
            <div className="ga-label">Catalog management</div>
            <h2>Opportunities</h2>
            <p>
              Add, edit, archive, and filter the pathways into learning, work, and community that students see across Egypt.
            </p>
            <div className="ga-card-meta">
              <span>
                <strong>{activeOpps}</strong> active · <strong>{draftOpps}</strong> draft · <strong>{archivedOpps}</strong> archived
              </span>
            </div>
            <div className="ga-card-actions">
              <Link href="/guidr-admin/Opportunities" className="ga-btn red" style={{ textDecoration: "none" }}>
                <LayoutList size={15} />
                Manage opportunities
              </Link>
              <Link href="/guidr-admin/Opportunities" className="ga-btn small" style={{ textDecoration: "none" }}>
                <Plus size={14} />
                Add new
              </Link>
            </div>
          </article>

          <article className="ga-card">
            <div className="ga-label">Curriculum management</div>
            <h2>Guidr Tutor</h2>
            <p>
              Structure the sequence of lessons and update context indexed for the Guidr Tutor AI engine.
            </p>
            <div className="ga-card-meta">
              <span>
                <strong>{publishedLessons}</strong> published · <strong>{draftLessons}</strong> in progress · <strong>{lockedLessons}</strong> locked
              </span>
            </div>
            <div className="ga-card-actions">
              <Link href="/guidr-admin/Lessons" className="ga-btn red" style={{ textDecoration: "none" }}>
                <GraduationCap size={15} />
                Manage lessons
              </Link>
              <Link href="/guidr-admin/Lessons" className="ga-btn small" style={{ textDecoration: "none" }}>
                <Plus size={14} />
                Add lesson
              </Link>
            </div>
          </article>
        </div>
      </div>
    </AdminShell>
  );
}
