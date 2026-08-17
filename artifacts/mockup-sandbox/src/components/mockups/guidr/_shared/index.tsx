import { Bookmark, LayoutDashboard, Search, GraduationCap, UserRound, ArrowRight } from "lucide-react";
import { Link } from "./router";
import { useAuth } from "../../../../lib/AuthContext";
import { GuidrLogo } from "../../../../lib/GuidrLogo";
import "../_group.css";

const DEFAULT_IMAGES: Record<string, string> = {
  mun: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
  stem: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80",
  usaid: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
  injaz: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
  nasa: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  venture: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80",
  isef: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80",
  zewail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
  auc: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
};

export function getOpportunityImage(item: any): string {
  if (item?.imageUrl) return item.imageUrl;
  if (item?.image) return item.image;
  
  const idStr = String(item?.id || "").toLowerCase();
  for (const key in DEFAULT_IMAGES) {
    if (idStr.includes(key)) return DEFAULT_IMAGES[key];
  }
  
  const titleStr = String(item?.title || item?.name || "").toLowerCase();
  if (titleStr.includes("mun") || titleStr.includes("model united nations")) return DEFAULT_IMAGES.mun;
  if (titleStr.includes("stem") || titleStr.includes("isef") || titleStr.includes("science")) return DEFAULT_IMAGES.stem;
  if (titleStr.includes("usaid") || titleStr.includes("community")) return DEFAULT_IMAGES.usaid;
  if (titleStr.includes("injaz") || titleStr.includes("business") || titleStr.includes("company")) return DEFAULT_IMAGES.injaz;
  if (titleStr.includes("nasa") || titleStr.includes("space") || titleStr.includes("tech")) return DEFAULT_IMAGES.nasa;
  if (titleStr.includes("venture") || titleStr.includes("startup")) return DEFAULT_IMAGES.venture;
  if (titleStr.includes("zewail") || titleStr.includes("research")) return DEFAULT_IMAGES.zewail;
  if (titleStr.includes("auc") || titleStr.includes("scholarship")) return DEFAULT_IMAGES.auc;

  return "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80";
}

export const opportunities = [
  { id: "isef", title: "ISEF Egypt Science & Engineering Fair", name: "ISEF Egypt Science & Engineering Fair", org: "Ministry of Education & Intel Egypt", organization: "Ministry of Education & Intel Egypt", tag: "Competitions", categories: ["Competitions"], mode: "In-person", locationType: "in_person", date: "15 Nov 2026", deadlineDate: "15 Nov 2026", desc: "The flagship national STEM research competition for Egyptian high school students presenting groundbreaking scientific projects.", description: "The flagship national STEM research competition for Egyptian high school students presenting groundbreaking scientific projects.", imageUrl: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1000&q=80" },
  { id: "usaid", title: "USAID STEM Undergraduate Scholarship Egypt", name: "USAID STEM Undergraduate Scholarship Egypt", org: "USAID Egypt & Ministry of Education", organization: "USAID Egypt & Ministry of Education", tag: "Scholarships", categories: ["Scholarships"], mode: "In-person", locationType: "in_person", date: "30 Aug 2026", deadlineDate: "30 Aug 2026", desc: "Fully funded university scholarship for top Egyptian STEM high school graduates pursuing science and technology degrees.", description: "Fully funded university scholarship for top Egyptian STEM high school graduates pursuing science and technology degrees.", imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1000&q=80" },
  { id: "mun", title: "AUC Model United Nations (MUN Cairo)", name: "AUC Model United Nations (MUN Cairo)", org: "American University in Cairo", organization: "American University in Cairo", tag: "Workshops", categories: ["Workshops"], mode: "In-person", locationType: "in_person", date: "24 Jun 2026", deadlineDate: "24 Jun 2026", desc: "Empowering Egyptian youth through diplomatic debate, global affairs analysis, and international negotiations.", description: "Empowering Egyptian youth through diplomatic debate, global affairs analysis, and international negotiations.", imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80" },
  { id: "injaz", title: "INJAZ Egypt Student Company Program", name: "INJAZ Egypt Student Company Program", org: "INJAZ Egypt & Junior Achievement", organization: "INJAZ Egypt & Junior Achievement", tag: "Workshops", categories: ["Workshops"], mode: "Hybrid", locationType: "hybrid", date: "18 Aug 2026", deadlineDate: "18 Aug 2026", desc: "Hands-on entrepreneurship accelerator guiding high school teams to launch real, viable student enterprises.", description: "Hands-on entrepreneurship accelerator guiding high school teams to launch real, viable student enterprises.", imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80" },
  { id: "nasa", title: "NASA Space Apps Challenge Cairo", name: "NASA Space Apps Challenge Cairo", org: "NASA & IEEE Egypt", organization: "NASA & IEEE Egypt", tag: "Competitions", categories: ["Competitions"], mode: "In-person", locationType: "in_person", date: "02 Sep 2026", deadlineDate: "02 Sep 2026", desc: "48-hour global hackathon using open space data to solve Earth and space exploration challenges.", description: "48-hour global hackathon using open space data to solve Earth and space exploration challenges.", imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80" },
  { id: "flat6", title: "Flat6Labs Youth Innovation Incubator", name: "Flat6Labs Youth Innovation Incubator", org: "Flat6Labs Cairo", organization: "Flat6Labs Cairo", tag: "Workshops", categories: ["Workshops"], mode: "Online", locationType: "online", date: "21 Sep 2026", deadlineDate: "21 Sep 2026", desc: "Mentorship and seed incubator helping young founders refine technology prototypes into scalable ventures.", description: "Mentorship and seed incubator helping young founders refine technology prototypes into scalable ventures.", imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1000&q=80" },
  { id: "zewail", title: "Zewail City Research Fellowship", name: "Zewail City Research Fellowship", org: "Zewail City of Science and Technology", organization: "Zewail City of Science and Technology", tag: "Research Programs", categories: ["Research Programs"], mode: "In-person", locationType: "in_person", date: "30 May 2026", deadlineDate: "30 May 2026", desc: "Immersive summer lab fellowship pairing students with lead scientists in bio-tech, nanotech, and renewable energy.", description: "Immersive summer lab fellowship pairing students with lead scientists in bio-tech, nanotech, and renewable energy.", imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80" },
  { id: "auc", title: "AUC Excellence Merit Scholarship", name: "AUC Excellence Merit Scholarship", org: "The American University in Cairo", organization: "The American University in Cairo", tag: "Scholarships", categories: ["Scholarships"], mode: "In-person", locationType: "in_person", date: "01 Aug 2026", deadlineDate: "01 Aug 2026", desc: "Full and partial merit scholarships for exceptional Egyptian high school graduates across engineering and sciences.", description: "Full and partial merit scholarships for exceptional Egyptian high school graduates across engineering and sciences.", imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80" },
  { id: "alx", title: "ALX Egypt Software Engineering Bootcamp", name: "ALX Egypt Software Engineering Bootcamp", org: "ALX Africa & Mastercard Foundation", organization: "ALX Africa & Mastercard Foundation", tag: "Workshops", categories: ["Workshops"], mode: "Online", locationType: "online", date: "15 Oct 2026", deadlineDate: "15 Oct 2026", desc: "Rigorous 12-month software engineering and career readiness program for ambitious African developers.", description: "Rigorous 12-month software engineering and career readiness program for ambitious African developers.", imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80" },
  { id: "ieee", title: "IEEE Egypt STEM Student Robotics Challenge", name: "IEEE Egypt STEM Student Robotics Challenge", org: "IEEE Egypt Section", organization: "IEEE Egypt Section", tag: "Competitions", categories: ["Competitions"], mode: "In-person", locationType: "in_person", date: "10 Nov 2026", deadlineDate: "10 Nov 2026", desc: "National engineering championship challenging student teams to design autonomous robots for industrial tasks.", description: "National engineering championship challenging student teams to design autonomous robots for industrial tasks.", imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80" },
  { id: "fulbright", title: "Fulbright Junior Development Fellowship", name: "Fulbright Junior Development Fellowship", org: "US-EF Commission in Egypt", organization: "US-EF Commission in Egypt", tag: "Exchange Programs", categories: ["Exchange Programs"], mode: "In-person", locationType: "in_person", date: "01 Dec 2026", deadlineDate: "01 Dec 2026", desc: "Prestigious US exchange grant for young leaders to complete academic coursework and cultural exchange in the US.", description: "Prestigious US exchange grant for young leaders to complete academic coursework and cultural exchange in the US.", imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80" },
  { id: "iot", title: "Egypt IoT & AI National Challenge", name: "Egypt IoT & AI National Challenge", org: "Ministry of Communications (MCIT) & IEEE", organization: "Ministry of Communications (MCIT) & IEEE", tag: "Competitions", categories: ["Competitions"], mode: "Hybrid", locationType: "hybrid", date: "25 Oct 2026", deadlineDate: "25 Oct 2026", desc: "National innovation competition for Internet of Things and Artificial Intelligence applications in agriculture & healthcare.", description: "National innovation competition for Internet of Things and Artificial Intelligence applications in agriculture & healthcare.", imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80" },
  { id: "rise", title: "Rise Egypt Social Innovation Fellowship", name: "Rise Egypt Social Innovation Fellowship", org: "Rise Egypt Foundation", organization: "Rise Egypt Foundation", tag: "Volunteering", categories: ["Volunteering"], mode: "Hybrid", locationType: "hybrid", date: "14 Sep 2026", deadlineDate: "14 Sep 2026", desc: "Fellowship supporting social entrepreneurs creating sustainable economic and environmental impact across Egypt.", description: "Fellowship supporting social entrepreneurs creating sustainable economic and environmental impact across Egypt.", imageUrl: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1000&q=80" },
  { id: "mepi", title: "MEPI Tomorrow's Leaders Scholarship", name: "MEPI Tomorrow's Leaders Scholarship", org: "US Department of State & AUC", organization: "US Department of State & AUC", tag: "Scholarships", categories: ["Scholarships"], mode: "In-person", locationType: "in_person", date: "15 Dec 2026", deadlineDate: "15 Dec 2026", desc: "Fully funded undergraduate scholarship covering full tuition, living expenses, and leadership development.", description: "Fully funded undergraduate scholarship covering full tuition, living expenses, and leadership development.", imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80" },
  { id: "climate", title: "Cairo Youth Climate Action Summit", name: "Cairo Youth Climate Action Summit", org: "Youth Loves Egypt & Ministry of Environment", organization: "Youth Loves Egypt & Ministry of Environment", tag: "Volunteering", categories: ["Volunteering"], mode: "In-person", locationType: "in_person", date: "05 Nov 2026", deadlineDate: "05 Nov 2026", desc: "National summit gathering youth advocates to present renewable energy and sustainability policy recommendations.", description: "National summit gathering youth advocates to present renewable energy and sustainability policy recommendations.", imageUrl: "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?auto=format&fit=crop&w=1000&q=80" },
  { id: "cyber", title: "CyberTalents Egypt Security Hackathon", name: "CyberTalents Egypt Security Hackathon", org: "CyberTalents & MCIT", organization: "CyberTalents & MCIT", tag: "Competitions", categories: ["Competitions"], mode: "Online", locationType: "online", date: "18 Oct 2026", deadlineDate: "18 Oct 2026", desc: "Capture the Flag (CTF) competition testing ethical hacking, cryptography, and network security skills.", description: "Capture the Flag (CTF) competition testing ethical hacking, cryptography, and network security skills.", imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80" },
  { id: "ugrad", title: "Global UGRAD Exchange Program", name: "Global UGRAD Exchange Program", org: "US Embassy Cairo & World Learning", organization: "US Embassy Cairo & World Learning", tag: "Exchange Programs", categories: ["Exchange Programs"], mode: "In-person", locationType: "in_person", date: "15 Dec 2026", deadlineDate: "15 Dec 2026", desc: "Semester-long non-degree exchange program at US universities for emerging student leaders.", description: "Semester-long non-degree exchange program at US universities for emerging student leaders.", imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80" },
  { id: "gsoc", title: "Google Summer of Code (GSoC) Egypt", name: "Google Summer of Code (GSoC) Egypt", org: "Google Developer Groups Cairo", organization: "Google Developer Groups Cairo", tag: "Workshops", categories: ["Workshops"], mode: "Online", locationType: "online", date: "04 Apr 2026", deadlineDate: "04 Apr 2026", desc: "Global online program focusing on bringing student developers into open-source software development.", description: "Global online program focusing on bringing student developers into open-source software development.", imageUrl: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1000&q=80" },
  { id: "undp", title: "UNDP Egypt Youth Fellowship", name: "UNDP Egypt Youth Fellowship", org: "United Nations Development Programme Egypt", organization: "United Nations Development Programme Egypt", tag: "Research Programs", categories: ["Research Programs"], mode: "Hybrid", locationType: "hybrid", date: "20 Nov 2026", deadlineDate: "20 Nov 2026", desc: "Research grant pairing student researchers with UN policy analysts working on sustainable development goals.", description: "Research grant pairing student researchers with UN policy analysts working on sustainable development goals.", imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1000&q=80" },
  { id: "stemfair", title: "Egyptian STEM Schools National Fair", name: "Egyptian STEM Schools National Fair", org: "STEM Egypt & EGF Foundation", organization: "STEM Egypt & EGF Foundation", tag: "Competitions", categories: ["Competitions"], mode: "In-person", locationType: "in_person", date: "12 Dec 2026", deadlineDate: "12 Dec 2026", desc: "Annual national exhibition showcasing capstone engineering and scientific innovations from Egypt's STEM schools.", description: "Annual national exhibition showcasing capstone engineering and scientific innovations from Egypt's STEM schools.", imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80" },
];

export function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <div className="brand" style={{ color: dark ? "var(--g-paper)" : undefined }}>
      <GuidrLogo />
      <span>guidr</span>
    </div>
  );
}

const nav = [
  ["Dashboard", "/guidr/Dashboard"],
  ["Opportunities", "/guidr/Opportunities"],
  ["Saved", "/guidr/Saved"],
  ["Guidr Tutor", "/guidr/Tutor"],
  ["Profile", "/guidr/Profile"],
];

import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Shell({ active, children }: { active: string; children: React.ReactNode }) {
  const { user } = useAuth();
  const profile = user?.studentProfile;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = profile?.firstName ? `${profile.firstName} ${profile.lastName || ""}`.trim() : "Student";
  const initials = profile?.firstName ? `${profile.firstName[0]}${profile.lastName ? profile.lastName[0] : ""}`.toUpperCase() : "ST";
  const subText = profile?.grade ? `Grade ${profile.grade} · ${profile.governorate || "Egypt"}` : "Student Portal";

  return (
    <div className="workspace guidr">
      {/* Mobile Top Navigation Bar (< 768px) */}
      <header className="mobile-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Brand />
          <span style={{ fontSize: 11, color: "var(--g-muted)", borderLeft: "1px solid var(--g-line)", paddingLeft: 10, fontWeight: 600 }}>
            {active}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: "none", border: 0, color: "var(--g-ink)", padding: 6, cursor: "pointer", display: "flex", alignItems: "center" }}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile Navigation Backdrop & Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-nav-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <aside className="mobile-nav-drawer" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--g-line)" }}>
              <Brand />
              <button type="button" onClick={() => setMobileMenuOpen(false)} style={{ background: "none", border: 0, padding: 6, cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <nav className="mobile-nav-list" style={{ display: "grid", gap: 6 }}>
              {nav.map(([name, href]: any) => (
                <Link
                  key={name}
                  href={href}
                  className={active === name ? "active" : ""}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 6,
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: 13,
                    color: active === name ? "var(--g-red)" : "var(--g-ink)",
                    background: active === name ? "rgba(139, 17, 21, 0.08)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {name}
                </Link>
              ))}
            </nav>

            <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid var(--g-line)" }}>
              <Link
                href="/guidr/Profile"
                onClick={() => setMobileMenuOpen(false)}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0" }}>
                  <div className="avatar">{initials}</div>
                  <div>
                    <b style={{ fontSize: 13 }}>{displayName}</b>
                    <br />
                    <span style={{ fontSize: 11, color: "var(--g-muted)" }}>{subText}</span>
                  </div>
                </div>
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar (>= 768px) */}
      <aside className="sidebar">
        <Brand />
        <nav className="nav">
          {nav.map(([name, href]: any) => (
            <Link key={name} href={href} className={active === name ? "active" : ""}>
              <span>{name}</span>
            </Link>
          ))}
        </nav>
        <Link href="/guidr/Profile" style={{ textDecoration: "none", color: "inherit", display: "block", marginTop: "auto" }}>
          <div className="account" style={{ cursor: "pointer" }}>
            <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
              <div className="avatar">{initials}</div>
              <div>
                <b>{displayName}</b>
                <br />
                <span style={{ color: "var(--g-muted)" }}>{subText}</span>
              </div>
            </div>
          </div>
        </Link>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}

function getInitials(item: any): string {
  const name = item.org || item.organization || item.title || item.name || "OP";
  const words = name.trim().split(/\s+/).filter((w: string) => !["and", "the", "for", "of", "&"].includes(w.toLowerCase()));
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function OpportunityCard({ item, onOpen, saved, onSave }: { item: any; onOpen?: () => void; saved?: boolean; onSave?: () => void }) {
  const initials = getInitials(item);
  const categoryTag = (item.tag || item.categories?.[0] || "Opportunity").toUpperCase();

  return (
    <article
      className="card"
      style={{
        borderRadius: 0,
        border: "1px solid var(--g-line)",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      <div style={{ padding: "16px 16px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header Row: Initials Avatar Box, # CURATED badge, Bookmark */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                background: "#f3f3f3",
                border: "1px solid var(--g-line)",
                borderRadius: 0,
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: 12,
                color: "var(--g-ink)",
                letterSpacing: "0.04em",
              }}
            >
              {initials}
            </div>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                background: "#f3f3f3",
                border: "1px solid var(--g-line)",
                color: "var(--g-muted)",
                padding: "3px 7px",
                borderRadius: 0,
              }}
            >
              # Curated
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave?.();
            }}
            aria-label="Save opportunity"
            style={{
              background: "none",
              border: 0,
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: saved ? "var(--g-red)" : "var(--g-muted)",
            }}
          >
            <Bookmark size={16} fill={saved ? "var(--g-red)" : "none"} color={saved ? "var(--g-red)" : "var(--g-muted)"} />
          </button>
        </div>

        {/* Category Label in Uppercase Red */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "var(--g-red)",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {categoryTag}
        </div>

        {/* Title */}
        <h3
          onClick={onOpen}
          style={{
            fontSize: 16,
            fontWeight: 700,
            margin: "0 0 4px",
            lineHeight: 1.3,
            cursor: onOpen ? "pointer" : "default",
            color: "var(--g-ink)",
          }}
        >
          {item.title || item.name}
        </h3>

        {/* Provider / Organization */}
        <div style={{ fontSize: 11, color: "var(--g-muted)", marginBottom: 10, fontWeight: 500 }}>
          {item.org || item.organization}
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: 12,
            lineHeight: 1.5,
            color: "#444444",
            margin: "0 0 16px",
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.desc || item.description}
        </p>

        {/* Footer Meta & Actions */}
        <div style={{ borderTop: "1px solid var(--g-line)", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <button
            type="button"
            className="g-btn small"
            onClick={onOpen}
            style={{ borderRadius: 0, padding: "7px 12px" }}
          >
            View details <ArrowRight size={12} style={{ verticalAlign: "middle" }} />
          </button>

          {item.applicationLink && (
            <a
              href={item.applicationLink}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                color: "var(--g-red)",
                fontSize: 11,
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              Apply <ArrowRight size={11} style={{ transform: "rotate(-45deg)" }} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function AuthHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header style={{ padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Brand dark />
      {right}
    </header>
  );
}