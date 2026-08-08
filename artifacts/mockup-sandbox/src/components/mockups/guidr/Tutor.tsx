import type { MouseEvent } from "react";
import { Check, LockKeyhole } from "lucide-react";
import { Link } from "./_shared/router";
import { Shell } from "./_shared";
import "./_group.css";

const lessons = [
  ["01", "Your Guidr profile", "Complete", true],
  ["02", "Finding the right fit", "Complete", true],
  ["03", "Writing your story", "Current lesson", true],
  ["04", "Making a strong CV", "Locked", false],
  ["05", "The interview room", "Locked", false],
  ["06", "Your next 90 days", "Locked", false],
] as const;

export function Tutor() {
  return (
    <Shell active="Guidr Tutor">
      <div className="content" style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <div className="g-label">Guidr / Learning path</div>
          <h1 style={{ fontSize: 40, margin: "6px 0 10px" }}>Guidr Tutor</h1>
          <p
            style={{
              color: "var(--g-muted)",
              fontSize: 12,
              margin: 0,
            }}
          >
            Lessons created by students now at Stanford and Harvard.
          </p>
        </div>

        <div
          style={{
            position: "relative",
            maxWidth: 760,
            margin: "46px auto 0",
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

          {lessons.map(([number, title, status, unlocked], index) => {
            const active = index === 2;
            const complete = index < 2;
            const onLeft = index % 2 === 0;

            const card = (
              <Link
                href={unlocked ? "/guidr/Lesson" : "#"}
                aria-label={`${title} — ${status}`}
                style={{
                  position: "relative",
                  display: "block",
                  minHeight: 110,
                  padding: "17px 19px",
                  textDecoration: "none",
                  textAlign: "left",
                  color: active || !unlocked ? "var(--g-paper)" : "var(--g-ink)",
                  background: active
                    ? "var(--g-red)"
                    : !unlocked
                      ? "var(--g-ink)"
                      : "var(--g-paper)",
                  border: active
                    ? "1px solid var(--g-red)"
                    : "1px solid var(--g-ink)",
                  opacity: !unlocked ? 0.9 : 1,
                  transition: "transform .18s ease, box-shadow .18s ease",
                }}
                onMouseEnter={(event: MouseEvent<HTMLAnchorElement>) => {
                  if (unlocked) {
                    event.currentTarget.style.transform = "translateY(-2px)";
                    event.currentTarget.style.boxShadow =
                      "0 8px 0 rgba(17,17,17,.08)";
                  }
                }}
                onMouseLeave={(event: MouseEvent<HTMLAnchorElement>) => {
                  event.currentTarget.style.transform = "translateY(0)";
                  event.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  className="g-label"
                  style={{
                    color: active ? "var(--g-paper)" : undefined,
                    opacity: active ? 0.9 : undefined,
                  }}
                >
                  Lesson {number}
                </div>
                <h3 style={{ fontSize: 17, margin: "9px 0 13px" }}>
                  {title}
                </h3>
                <small
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 10,
                    opacity: 0.7,
                  }}
                >
                  {complete ? (
                    <Check size={13} aria-hidden="true" />
                  ) : !unlocked ? (
                    <LockKeyhole size={12} aria-hidden="true" />
                  ) : null}
                  {status}
                </small>
              </Link>
            );

            return (
              <div
                key={number}
                style={{
                  position: "relative",
                  display: "grid",
                  gridTemplateColumns: "1fr 40px 1fr",
                  alignItems: "center",
                  minHeight: 140,
                }}
              >
                <div
                  style={{
                    gridColumn: onLeft ? 1 : 3,
                    position: "relative",
                  }}
                >
                  {card}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: "50%",
                      [onLeft ? "right" : "left"]: -20,
                      width: 20,
                      height: 1,
                      background: active
                        ? "var(--g-red)"
                        : "var(--g-line)",
                    }}
                  />
                </div>

                <div
                  aria-hidden="true"
                  style={{
                    gridColumn: 2,
                    gridRow: 1,
                    justifySelf: "center",
                    zIndex: 1,
                    width: active ? 13 : 9,
                    height: active ? 13 : 9,
                    borderRadius: "50%",
                    background: active
                      ? "var(--g-red)"
                      : complete
                        ? "var(--g-paper)"
                        : "var(--g-ink)",
                    border: complete
                      ? "2px solid var(--g-red)"
                      : "1px solid var(--g-ink)",
                    boxShadow: active
                      ? "0 0 0 5px rgba(139,17,21,.12)"
                      : undefined,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}