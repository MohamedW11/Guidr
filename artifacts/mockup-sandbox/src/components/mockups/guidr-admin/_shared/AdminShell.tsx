import React, { useState } from "react";
import { LayoutDashboard, LayoutList, GraduationCap, ArrowLeft, Settings2, Menu, X } from "lucide-react";
import { Link } from "../../guidr/_shared/router";
import { useAuth } from "../../../../lib/AuthContext";
import { GuidrLogo } from "../../../../lib/GuidrLogo";
import "../_group.css";

export function AdminBrand() {
  return (
    <div className="ga-brand">
      <GuidrLogo size={40} />
    </div>
  );
}

export function AdminShell({ active, children }: { active: string; children: React.ReactNode }) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const name = user?.adminProfile?.name || "Master Admin";
  const initials = name.substring(0, 2).toUpperCase();
  const roleTitle = user?.adminProfile?.role || "Content manager";

  const adminNav = [
    ["Dashboard", "/guidr-admin/Dashboard"],
    ["Opportunities", "/guidr-admin/Opportunities"],
    ["Guidr Tutor", "/guidr-admin/Lessons"],
    ["Workspace settings", "/guidr-admin/Settings"],
  ];

  return (
    <div className="ga-workspace ga">
      {/* Mobile Header Bar for Admin (< 768px) */}
      <header className="mobile-header ga-mobile-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AdminBrand />
          <span style={{ fontSize: 11, color: "var(--ga-muted)", borderLeft: "1px solid var(--ga-line)", paddingLeft: 10, fontWeight: 600 }}>
            {active}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: "none", border: 0, color: "var(--ga-ink)", padding: 6, cursor: "pointer", display: "flex", alignItems: "center" }}
          aria-label="Toggle admin menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Admin Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-nav-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <aside className="mobile-nav-drawer" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--ga-line)" }}>
              <AdminBrand />
              <button type="button" onClick={() => setMobileMenuOpen(false)} style={{ background: "none", border: 0, padding: 6, cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <nav className="mobile-nav-list" style={{ display: "grid", gap: 6 }}>
              {adminNav.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 6,
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: 13,
                    color: active === label ? "var(--ga-red)" : "var(--ga-ink)",
                    background: active === label ? "rgba(139, 17, 21, 0.08)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid var(--ga-line)" }}>
              <Link
                href="/guidr-admin/Settings"
                onClick={() => setMobileMenuOpen(false)}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0" }}>
                  <div className="ga-avatar">{initials}</div>
                  <div>
                    <b style={{ fontSize: 13 }}>{name}</b>
                    <br />
                    <span style={{ fontSize: 11, color: "var(--ga-muted)", textTransform: "capitalize" }}>{roleTitle}</span>
                  </div>
                </div>
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar (>= 768px) */}
      <aside className="ga-sidebar">
        <AdminBrand />
        <nav className="ga-nav">
          <Link href="/guidr-admin/Dashboard" className={active === "Dashboard" ? "active" : ""}>
            <span>Dashboard</span>
          </Link>
          <Link href="/guidr-admin/Opportunities" className={active === "Opportunities" ? "active" : ""}>
            <span>Opportunities</span>
          </Link>
          <Link href="/guidr-admin/Lessons" className={active === "Guidr Tutor" ? "active" : ""}>
            <span>Guidr Tutor</span>
          </Link>
          <Link href="/guidr-admin/Settings" className={active === "Settings" ? "active" : ""}>
            <span>Workspace settings</span>
          </Link>
        </nav>
        <Link
          href="/guidr-admin/Settings"
          style={{ textDecoration: "none", color: "inherit", display: "block", marginTop: "auto" }}
        >
          <div className="ga-account" style={{ cursor: "pointer" }}>
            <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
              <div className="ga-avatar">{initials}</div>
              <div>
                <b>{name}</b>
                <br />
                <span style={{ color: "var(--ga-muted)", textTransform: "capitalize" }}>{roleTitle}</span>
              </div>
            </div>
          </div>
        </Link>
      </aside>
      <main className="ga-main">{children}</main>
    </div>
  );
}

export function AdminTop({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="ga-topbar">
      <div>
        <div className="ga-label">{eyebrow}</div>
        <h1>
          {title}
          <span style={{ color: "var(--ga-red)" }}>.</span>
        </h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}