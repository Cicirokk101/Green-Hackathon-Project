import React, { useState } from "react";

type CSS = React.CSSProperties;

interface Profile {
  name: string;
  handle: string;
  location: string;
  bio: string;
  skills: string[];
}

interface MetaEntry {
  label: string;
  value: string;
}

type Tab = "joined" | "created";

type CardKey = "garden" | "cleanup" | "tool" | "bike";
type OpenState = Record<CardKey, boolean>;

/* ------------------------------------------------------------------ */
/* Small presentational helpers                                        */
/* ------------------------------------------------------------------ */

function MetaItem({ label, value }: MetaEntry): React.ReactElement {
  return (
    <div>
      <div
        style={{
          fontSize: 10.5,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#A8997F",
          fontWeight: 700,
          marginBottom: 3,
        }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: "#2B2218", fontWeight: 600 }}>
        {value}
      </div>
    </div>
  );
}

function Chevron({ open }: { open: boolean }): React.ReactElement {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      style={{
        marginTop: 3,
        transition: "transform 0.3s ease",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
      }}>
      <path
        d="M6 9l6 6 6-6"
        stroke="#9A8C79"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatusPill({
  active,
  label,
}: {
  active: boolean;
  label: string;
}): React.ReactElement {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 700,
        color: active ? "#2F6B45" : "#8A7C6B",
        background: active ? "#E7F0E6" : "#EFE6D5",
        borderRadius: 999,
        padding: "5px 12px",
      }}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: active ? "#1F8A52" : "#B0A18C",
        }}
      />
      {label}
    </span>
  );
}

function ArrowRight(): React.ReactElement {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface ProjectPreviewProps {
  label: string;
  desc: string;
  meta: MetaEntry[];
  footerLeft: string;
  ctaText: string;
  ctaAccent: string;
  ctaHover: string;
  href?: string;
}

/** Dropdown preview shown when a project card is expanded. */
function ProjectPreview({
  label,
  desc,
  meta,
  footerLeft,
  ctaText,
  ctaAccent,
  ctaHover,
  href = "#",
}: ProjectPreviewProps): React.ReactElement {
  return (
    <div
      style={{
        borderTop: "1px solid #EFE6D5",
        background: "#FBF6EC",
        padding: 22,
      }}>
      <div
        style={{
          fontFamily: "'Newsreader', serif",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "#C6532A",
          marginBottom: 10,
        }}>
        {label}
      </div>
      <p
        style={{
          fontSize: 14.5,
          lineHeight: 1.6,
          color: "#5F5345",
          margin: "0 0 20px",
        }}>
        {desc}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px 28px",
          marginBottom: 22,
        }}>
        {meta.map((m) => (
          <MetaItem key={m.label} label={m.label} value={m.value} />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          paddingTop: 18,
          borderTop: "1px solid #EFE6D5",
        }}>
        <span style={{ fontSize: 13, color: "#9A8C79" }}>{footerLeft}</span>
        <a
          href={href}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: ctaAccent,
            color: "#fff",
            textDecoration: "none",
            borderRadius: 999,
            padding: "11px 22px",
            fontSize: 14,
            fontWeight: 600,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = ctaHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = ctaAccent;
          }}>
          {ctaText}
          <ArrowRight />
        </a>
      </div>
    </div>
  );
}

interface ExpandableCardProps {
  open: boolean;
  onToggle: () => void;
  summary: React.ReactNode;
  children: React.ReactNode;
}

/** Generic expandable project card. `summary` renders the always-visible top. */
function ExpandableCard({
  open,
  onToggle,
  summary,
  children,
}: ExpandableCardProps): React.ReactElement {
  return (
    <div
      style={{
        background: "#FFFDF8",
        border: "1px solid #E4D8C4",
        borderRadius: 16,
        boxShadow: "0 1px 3px rgba(43,34,24,0.06)",
        overflow: "hidden",
      }}>
      <div
        onClick={onToggle}
        title="Click to preview this project"
        className="k-card-summary"
        style={{ padding: 22, cursor: "pointer" }}>
        {summary}
      </div>
      {open && children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Icons used inside the card thumbnails                               */
/* ------------------------------------------------------------------ */

const thumbIcon: CSS = {
  position: "absolute",
  inset: 0,
  margin: "auto",
  opacity: 0.4,
};

const LeafIcon = (): React.ReactElement => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={thumbIcon}>
    <path
      d="M12 20V9M12 9c0-3 2-5 5-5 0 3-2 5-5 5zM12 11C12 8 10 6 7 6c0 3 2 5 5 5z"
      stroke="#fff"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const ChartIcon = (): React.ReactElement => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={thumbIcon}>
    <path
      d="M4 18l5-5 3 3 8-8"
      stroke="#fff"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 8h4v4"
      stroke="#fff"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const ShelfIcon = (): React.ReactElement => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={thumbIcon}>
    <rect
      x="4"
      y="5"
      width="16"
      height="5"
      rx="1.2"
      stroke="#fff"
      strokeWidth={1.3}
    />
    <rect
      x="4"
      y="14"
      width="16"
      height="5"
      rx="1.2"
      stroke="#fff"
      strokeWidth={1.3}
    />
  </svg>
);
const BikeIcon = (): React.ReactElement => (
  <svg width="42" height="42" viewBox="0 0 24 24" fill="none" style={thumbIcon}>
    <circle cx="6.5" cy="15.5" r="3.3" stroke="#fff" strokeWidth={1.3} />
    <circle cx="17.5" cy="15.5" r="3.3" stroke="#fff" strokeWidth={1.3} />
    <path
      d="M6.5 15.5l3.5-6.5h5l2.5 6.5M10 9h4.5"
      stroke="#fff"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const cardThumb = (gradient: string): CSS => ({
  width: 184,
  height: 92,
  borderRadius: 12,
  flexShrink: 0,
  background: gradient,
  position: "relative",
  overflow: "hidden",
});

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

const PREV_LEVEL = 780;
const NEXT_LEVEL = 1500;

export default function KarmaProfile(): React.ReactElement {
  const [profile, setProfile] = useState<Profile>({
    name: "Maya Reyes",
    handle: "@mayagrows",
    location: "Maplewood",
    bio: "Grows tomatoes on the Elm St. lot, fixes squeaky bikes, and always has an extra rake. Carpentry & gardening are my thing.",
    skills: ["Carpentry", "Gardening", "First aid"],
  });
  const [helping, setHelping] = useState<boolean>(true);
  const [karma] = useState<number>(1240);
  const [gardenHours] = useState<number>(8);
  const [cleanupHours] = useState<number>(4);

  const [tab, setTab] = useState<Tab>("joined");
  const [open, setOpen] = useState<OpenState>({
    garden: false,
    cleanup: false,
    tool: false,
    bike: false,
  });
  const toggle = (k: CardKey): void => setOpen((o) => ({ ...o, [k]: !o[k] }));

  // edit modal
  const [editing, setEditing] = useState<boolean>(false);
  const [draft, setDraft] = useState<Profile | null>(null);
  const [newSkill, setNewSkill] = useState<string>("");

  const initials =
    profile.name
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  const pct = Math.max(
    0,
    Math.min(100, ((karma - PREV_LEVEL) / (NEXT_LEVEL - PREV_LEVEL)) * 100),
  );
  const pointsToNext = Math.max(0, NEXT_LEVEL - karma);

  const openEdit = (): void => {
    setDraft({ ...profile, skills: [...profile.skills] });
    setNewSkill("");
    setEditing(true);
  };
  const closeEdit = (): void => {
    setEditing(false);
    setDraft(null);
  };
  const saveEdit = (): void => {
    if (!draft) return;
    setProfile((p) => ({
      name: draft.name.trim() || p.name,
      handle: draft.handle.trim() || p.handle,
      location: draft.location.trim() || p.location,
      bio: draft.bio,
      skills: draft.skills,
    }));
    closeEdit();
  };
  const addSkill = (): void => {
    const v = newSkill.trim();
    if (!v) return;
    setDraft((d) => (d ? { ...d, skills: [...d.skills, v] } : d));
    setNewSkill("");
  };
  const removeSkill = (i: number): void =>
    setDraft((d) =>
      d ? { ...d, skills: d.skills.filter((_, idx) => idx !== i) } : d,
    );

  const labelInput: CSS = {
    display: "block",
    fontSize: 12.5,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#8A7C6B",
    marginBottom: 7,
  };
  const textInput: CSS = {
    width: "100%",
    padding: "11px 14px",
    border: "1px solid #E4D8C4",
    borderRadius: 10,
    background: "#fff",
    fontSize: 15,
    color: "#2B2218",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        background: "#F7F1E6",
        minHeight: "100vh",
        fontFamily: "'Hanken Grotesk', sans-serif",
        color: "#2B2218",
      }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,500&family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .k-card-summary:hover { background: #FFFBF2; }
        .k-nav:hover { color: #2B2218; }
        .k-sidebar-row:hover { background: #FBF4E7 !important; }
        .k-edit:hover { background: #275838 !important; }
        input:focus, textarea:focus { outline: none; border-color: #2F6B45 !important; }
      `}</style>

      {/* ===== BODY ===== */}
      <div
        style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 48px 72px" }}>
        {/* HEADER ROW */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 372px",
            gap: 40,
            alignItems: "start",
            marginBottom: 36,
          }}>
          {/* identity */}
          <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
            <div
              style={{
                flexShrink: 0,
                padding: 4,
                borderRadius: 18,
                background: "linear-gradient(145deg, #F26A21, #2F6B45)",
              }}>
              <div
                style={{
                  width: 172,
                  height: 172,
                  borderRadius: 14,
                  overflow: "hidden",
                  background:
                    "repeating-linear-gradient(135deg, #E7DECB 0 11px, #EFE7D6 11px 22px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    color: "#A8997F",
                    textTransform: "uppercase",
                  }}>
                  your photo
                </span>
              </div>
            </div>
            <div style={{ paddingTop: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h1
                  style={{
                    fontFamily: "'Newsreader', serif",
                    fontSize: 40,
                    fontWeight: 600,
                    margin: 0,
                    lineHeight: 1,
                  }}>
                  {profile.name}
                </h1>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ marginTop: 6 }}>
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="#9A8C79"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div style={{ fontSize: 15, color: "#8A7C6B", marginTop: 6 }}>
                {profile.handle} · {profile.location}
              </div>

              <div
                onClick={() => setHelping((h) => !h)}
                title="Click to toggle your status"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 18,
                  background: helping ? "#E7F0E6" : "#EFE6D5",
                  color: helping ? "#2F6B45" : "#8A7C6B",
                  borderRadius: 999,
                  padding: "7px 15px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  userSelect: "none",
                }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: helping ? "#1F8A52" : "#B0A18C",
                  }}
                />
                {helping ? "Helping out this week" : "Taking a break"}
              </div>

              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  color: "#5F5345",
                  maxWidth: 440,
                  margin: "18px 0 0",
                }}>
                {profile.bio}
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 16,
                }}>
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      fontSize: 12.5,
                      padding: "6px 13px",
                      borderRadius: 999,
                      background: "#fff",
                      border: "1px solid #E4D8C4",
                      color: "#2F6B45",
                      fontWeight: 600,
                    }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* level / badge / edit */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
              }}>
              <span
                style={{
                  fontFamily: "'Newsreader', serif",
                  fontSize: 26,
                  fontWeight: 600,
                }}>
                Level 4
              </span>
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "2px solid #C6532A",
                  color: "#C6532A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 700,
                }}>
                4
              </span>
              <span style={{ fontSize: 13, color: "#8A7C6B", fontWeight: 600 }}>
                Cornerstone
              </span>
            </div>

            <div
              style={{
                background: "#2B2218",
                borderRadius: 14,
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: "linear-gradient(145deg, #F7B53B, #C6532A)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 3px 10px rgba(198,83,42,0.4)",
                }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3c0 4-3 5-3 8a3 3 0 006 0c0-1.4-.7-2.3-1.4-3.2C13 11 15 13 15 16a3 3 0 11-6 0"
                    stroke="#fff"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <div
                  style={{ fontSize: 15, fontWeight: 700, color: "#F7F1E6" }}>
                  Adept Accumulator
                </div>
                <div style={{ fontSize: 13, color: "#C8A98C", marginTop: 2 }}>
                  {karma.toLocaleString()} karma points
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  height: 6,
                  borderRadius: 999,
                  background: "#EFE6D5",
                  overflow: "hidden",
                }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: "#F7B53B",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
              <div style={{ fontSize: 12.5, color: "#8A7C6B", marginTop: 7 }}>
                {pointsToNext > 0
                  ? `${pointsToNext} points to Level 5 · Keystone`
                  : "Level 5 · Keystone reached!"}
              </div>
            </div>

            <button
              onClick={openEdit}
              className="k-edit"
              style={{
                marginTop: 18,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#2F6B45",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "10px 22px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 20h4l10-10-4-4L4 16v4z"
                  stroke="#fff"
                  strokeWidth={1.7}
                  strokeLinejoin="round"
                />
                <path d="M14 6l4 4" stroke="#fff" strokeWidth={1.7} />
              </svg>
              Edit profile
            </button>
          </div>
        </div>

        {/* LOWER ROW */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: 40,
            alignItems: "start",
          }}>
          {/* left column (tab-switched) */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                paddingBottom: 14,
                borderBottom: "2px solid #E4D8C4",
                marginBottom: 22,
              }}>
              <h2
                style={{
                  fontFamily: "'Newsreader', serif",
                  fontSize: 22,
                  fontWeight: 600,
                  margin: 0,
                }}>
                {tab === "joined" ? "Recent activity" : "Projects you created"}
              </h2>
              <span style={{ fontSize: 14, color: "#8A7C6B" }}>
                <strong style={{ color: "#2B2218" }}>
                  {tab === "joined"
                    ? `${gardenHours + cleanupHours} hours`
                    : "2 projects"}
                </strong>{" "}
                {tab === "joined"
                  ? "helping · past 2 weeks"
                  : "you organize these"}
              </span>
            </div>

            {tab === "joined" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Garden */}
                <ExpandableCard
                  open={open.garden}
                  onToggle={() => toggle("garden")}
                  summary={
                    <>
                      <div
                        style={{
                          display: "flex",
                          gap: 20,
                          alignItems: "flex-start",
                        }}>
                        <div
                          style={cardThumb(
                            "linear-gradient(135deg, #2F6B45, #4F8A5C)",
                          )}>
                          <LeafIcon />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 16,
                            }}>
                            <div>
                              <div
                                style={{
                                  fontSize: 11,
                                  letterSpacing: "0.12em",
                                  textTransform: "uppercase",
                                  color: "#2F6B45",
                                  fontWeight: 700,
                                }}>
                                Garden
                              </div>
                              <h3
                                style={{
                                  fontFamily: "'Newsreader', serif",
                                  fontSize: 21,
                                  fontWeight: 600,
                                  margin: "4px 0 0",
                                }}>
                                Elm St. Community Garden
                              </h3>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 14,
                                flexShrink: 0,
                              }}>
                              <div style={{ textAlign: "right" }}>
                                <div
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: "#2B2218",
                                  }}>
                                  {gardenHours} hrs contributed
                                </div>
                                <div
                                  style={{
                                    fontSize: 13,
                                    color: "#9A8C79",
                                    marginTop: 2,
                                  }}>
                                  last helped Jun 11
                                </div>
                              </div>
                              <Chevron open={open.garden} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  }>
                  <ProjectPreview
                    label="Project preview"
                    desc="A neighbor-run plot on the Elm St. lot — raised beds, a shared tool shed, and a compost system that feeds the whole block. Drop-in workdays run every weekend, all skill levels welcome."
                    meta={[
                      { label: "Organizer", value: "Elm St. Collective" },
                      { label: "Next workday", value: "Saturday, 9:00 am" },
                      { label: "Location", value: "214 Elm St., Maplewood" },
                      { label: "Active neighbors", value: "18 this month" },
                    ]}
                    footerLeft="You've helped here 6 times"
                    ctaText="View project page"
                    ctaAccent="#2F6B45"
                    ctaHover="#275838"
                  />
                </ExpandableCard>

                {/* Cleanup */}
                <ExpandableCard
                  open={open.cleanup}
                  onToggle={() => toggle("cleanup")}
                  summary={
                    <div
                      style={{
                        display: "flex",
                        gap: 20,
                        alignItems: "flex-start",
                      }}>
                      <div
                        style={cardThumb(
                          "linear-gradient(135deg, #C6532A, #E08A4A)",
                        )}>
                        <ChartIcon />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 16,
                          }}>
                          <div>
                            <div
                              style={{
                                fontSize: 11,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                color: "#2F6B45",
                                fontWeight: 700,
                              }}>
                              Cleanup
                            </div>
                            <h3
                              style={{
                                fontFamily: "'Newsreader', serif",
                                fontSize: 21,
                                fontWeight: 600,
                                margin: "4px 0 0",
                              }}>
                              Creek &amp; Trail Litter Sweep
                            </h3>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 14,
                              flexShrink: 0,
                            }}>
                            <div style={{ textAlign: "right" }}>
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: 700,
                                  color: "#2B2218",
                                }}>
                                {cleanupHours} hrs contributed
                              </div>
                              <div
                                style={{
                                  fontSize: 13,
                                  color: "#9A8C79",
                                  marginTop: 2,
                                }}>
                                last helped Jun 7
                              </div>
                            </div>
                            <Chevron open={open.cleanup} />
                          </div>
                        </div>
                        <p
                          style={{
                            fontSize: 13.5,
                            color: "#6F6253",
                            lineHeight: 1.5,
                            margin: "10px 0 0",
                          }}>
                          Cleared two miles of the Maple Creek path with eleven
                          neighbors. Earned the{" "}
                          <strong style={{ color: "#C6532A" }}>
                            Clean Sweep
                          </strong>{" "}
                          badge.
                        </p>
                      </div>
                    </div>
                  }>
                  <ProjectPreview
                    label="Project preview"
                    desc="Monthly litter sweeps along Maple Creek and its connecting trails, keeping two miles of waterway clear for the whole neighborhood. Gloves, bags, and grabbers provided at the trailhead."
                    meta={[
                      { label: "Organizer", value: "Creekkeepers" },
                      { label: "Next sweep", value: "Sat, Jun 21 · 8:00 am" },
                      { label: "Route", value: "Trailhead → footbridge" },
                      { label: "Volunteers", value: "11 signed up" },
                    ]}
                    footerLeft="You've helped here 2 times"
                    ctaText="View project page"
                    ctaAccent="#2F6B45"
                    ctaHover="#275838"
                  />
                </ExpandableCard>
              </div>
            )}

            {tab === "created" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Tool Library */}
                <ExpandableCard
                  open={open.tool}
                  onToggle={() => toggle("tool")}
                  summary={
                    <div
                      style={{
                        display: "flex",
                        gap: 20,
                        alignItems: "flex-start",
                      }}>
                      <div
                        style={cardThumb(
                          "linear-gradient(135deg, #C6532A, #F7B53B)",
                        )}>
                        <ShelfIcon />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 16,
                          }}>
                          <div>
                            <div
                              style={{
                                fontSize: 11,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                color: "#C6532A",
                                fontWeight: 700,
                              }}>
                              You organize
                            </div>
                            <h3
                              style={{
                                fontFamily: "'Newsreader', serif",
                                fontSize: 21,
                                fontWeight: 600,
                                margin: "4px 0 0",
                              }}>
                              Elm St. Tool Library
                            </h3>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 14,
                              flexShrink: 0,
                            }}>
                            <StatusPill active label="Active" />
                            <Chevron open={open.tool} />
                          </div>
                        </div>
                        <p
                          style={{
                            fontSize: 13.5,
                            color: "#6F6253",
                            lineHeight: 1.5,
                            margin: "10px 0 0",
                          }}>
                          A shared shelf of drills, ladders, and yard tools any
                          neighbor can borrow for the weekend.
                        </p>
                      </div>
                    </div>
                  }>
                  <ProjectPreview
                    label="Project preview"
                    desc="You started this lending shelf so neighbors don't each buy a ladder they'll use twice. Borrow with a tap, return within a week, keep the block well-equipped."
                    meta={[
                      { label: "Status", value: "Active · published" },
                      { label: "Borrowing now", value: "9 neighbors" },
                      { label: "Inventory", value: "32 tools listed" },
                      { label: "Started", value: "April 2024" },
                    ]}
                    footerLeft="3 borrow requests waiting"
                    ctaText="Manage project"
                    ctaAccent="#C6532A"
                    ctaHover="#A8431F"
                  />
                </ExpandableCard>

                {/* Bike Fix-It Stand (draft) */}
                <ExpandableCard
                  open={open.bike}
                  onToggle={() => toggle("bike")}
                  summary={
                    <div
                      style={{
                        display: "flex",
                        gap: 20,
                        alignItems: "flex-start",
                      }}>
                      <div
                        style={cardThumb(
                          "linear-gradient(135deg, #2F6B45, #C6532A)",
                        )}>
                        <BikeIcon />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 16,
                          }}>
                          <div>
                            <div
                              style={{
                                fontSize: 11,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                color: "#C6532A",
                                fontWeight: 700,
                              }}>
                              You organize
                            </div>
                            <h3
                              style={{
                                fontFamily: "'Newsreader', serif",
                                fontSize: 21,
                                fontWeight: 600,
                                margin: "4px 0 0",
                              }}>
                              Saturday Bike Fix-It Stand
                            </h3>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 14,
                              flexShrink: 0,
                            }}>
                            <StatusPill active={false} label="Draft" />
                            <Chevron open={open.bike} />
                          </div>
                        </div>
                        <p
                          style={{
                            fontSize: 13.5,
                            color: "#6F6253",
                            lineHeight: 1.5,
                            margin: "10px 0 0",
                          }}>
                          A weekend stand for tune-ups and squeaky-brake fixes
                          outside the library. Not published yet.
                        </p>
                      </div>
                    </div>
                  }>
                  <ProjectPreview
                    label="Draft preview"
                    desc="Your idea: a pop-up repair stand every other Saturday. Add a start date and a tool list to publish it to the neighborhood."
                    meta={[
                      { label: "Status", value: "Draft · unpublished" },
                      { label: "Interested", value: "6 neighbors" },
                      { label: "Category", value: "Bike repair" },
                      { label: "Created", value: "Jun 2026" },
                    ]}
                    footerLeft="2 steps left to publish"
                    ctaText="Continue setup"
                    ctaAccent="#C6532A"
                    ctaHover="#A8431F"
                  />
                </ExpandableCard>
              </div>
            )}
          </div>

          {/* sidebar */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#FFFDF8",
              border: "1px solid #E4D8C4",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(43,34,24,0.06)",
            }}>
            <div style={{ padding: "20px 22px 6px" }}>
              <h3
                style={{
                  fontFamily: "'Newsreader', serif",
                  fontSize: 19,
                  fontWeight: 600,
                  color: "#2F6B45",
                  margin: 0,
                }}>
                Currently helping
              </h3>
            </div>

            <div
              style={{
                padding: "18px 22px",
                borderBottom: "1px solid #EFE6D5",
              }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  marginBottom: 12,
                }}>
                <span
                  style={{ fontSize: 14, fontWeight: 600, color: "#2B2218" }}>
                  Badges
                </span>
                <span
                  style={{
                    fontFamily: "'Newsreader', serif",
                    fontSize: 22,
                    color: "#8A7C6B",
                  }}>
                  8
                </span>
              </div>
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                <span
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: "linear-gradient(145deg,#F7B53B,#C6532A)",
                  }}
                />
                <span
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: "linear-gradient(145deg,#1F8A52,#2F6B45)",
                  }}
                />
                <span
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: "linear-gradient(145deg,#F26A21,#C6532A)",
                  }}
                />
                <span
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: "#F7F1E6",
                    border: "1.5px dashed #D9CBB4",
                    color: "#9A8C79",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                  }}>
                  +5
                </span>
              </div>
            </div>

            {/* Projects joined — tab */}
            <div
              onClick={() => setTab("joined")}
              className="k-sidebar-row"
              style={{
                padding: "16px 22px 16px 19px",
                borderBottom: "1px solid #EFE6D5",
                display: "flex",
                alignItems: "center",
                gap: 9,
                cursor: "pointer",
                background: tab === "joined" ? "#FBF4E7" : "transparent",
              }}>
              <span
                style={{
                  width: 3,
                  height: 18,
                  borderRadius: 2,
                  background: tab === "joined" ? "#C6532A" : "transparent",
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: tab === "joined" ? "#C6532A" : "#2B2218",
                }}>
                Projects joined
              </span>
              <span
                style={{
                  fontFamily: "'Newsreader', serif",
                  fontSize: 22,
                  color: "#8A7C6B",
                  marginLeft: "auto",
                }}>
                13
              </span>
            </div>

            {/* Projects created — tab */}
            <div
              onClick={() => setTab("created")}
              className="k-sidebar-row"
              style={{
                padding: "16px 22px 16px 19px",
                borderBottom: "1px solid #EFE6D5",
                display: "flex",
                alignItems: "center",
                gap: 9,
                cursor: "pointer",
                background: tab === "created" ? "#FBF4E7" : "transparent",
              }}>
              <span
                style={{
                  width: 3,
                  height: 18,
                  borderRadius: 2,
                  background: tab === "created" ? "#C6532A" : "transparent",
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: tab === "created" ? "#C6532A" : "#2B2218",
                }}>
                Projects created
              </span>
              <span
                style={{
                  fontFamily: "'Newsreader', serif",
                  fontSize: 22,
                  color: "#8A7C6B",
                  marginLeft: "auto",
                }}>
                2
              </span>
            </div>

            <div
              style={{
                padding: "16px 22px",
                borderBottom: "1px solid #EFE6D5",
                display: "flex",
                alignItems: "baseline",
                gap: 8,
              }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#2B2218" }}>
                Neighbors helped
              </span>
              <span
                style={{
                  fontFamily: "'Newsreader', serif",
                  fontSize: 22,
                  color: "#8A7C6B",
                  marginLeft: "auto",
                }}>
                47
              </span>
            </div>

            <div
              className="k-sidebar-row"
              style={{
                padding: "16px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#C6532A" }}>
                Tools shared
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 6l6 6-6 6"
                  stroke="#C6532A"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ===== EDIT PROFILE MODAL ===== */}
      {editing && draft && (
        <div
          onClick={closeEdit}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(43,34,24,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 24,
          }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FBF6EC",
              borderRadius: 18,
              width: 520,
              maxWidth: "100%",
              maxHeight: "88vh",
              overflow: "auto",
              boxShadow: "0 24px 64px rgba(43,34,24,0.4)",
            }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "22px 26px",
                borderBottom: "1px solid #E4D8C4",
                position: "sticky",
                top: 0,
                background: "#FBF6EC",
              }}>
              <h2
                style={{
                  fontFamily: "'Newsreader', serif",
                  fontSize: 24,
                  fontWeight: 600,
                  margin: 0,
                }}>
                Edit profile
              </h2>
              <button
                onClick={closeEdit}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  color: "#8A7C6B",
                  display: "flex",
                }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div style={{ padding: "24px 26px" }}>
              <label style={labelInput}>Name</label>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                style={{ ...textInput, marginBottom: 18 }}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  marginBottom: 18,
                }}>
                <div>
                  <label style={labelInput}>Handle</label>
                  <input
                    value={draft.handle}
                    onChange={(e) =>
                      setDraft({ ...draft, handle: e.target.value })
                    }
                    style={textInput}
                  />
                </div>
                <div>
                  <label style={labelInput}>Neighborhood</label>
                  <input
                    value={draft.location}
                    onChange={(e) =>
                      setDraft({ ...draft, location: e.target.value })
                    }
                    style={textInput}
                  />
                </div>
              </div>

              <label style={labelInput}>Bio</label>
              <textarea
                value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                rows={3}
                style={{
                  ...textInput,
                  fontSize: 14.5,
                  lineHeight: 1.5,
                  resize: "vertical",
                  marginBottom: 18,
                  fontFamily: "inherit",
                }}
              />

              <label style={labelInput}>Skills</label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 10,
                }}>
                {draft.skills.length === 0 ? (
                  <span
                    style={{
                      fontSize: 13,
                      color: "#9A8C79",
                      fontStyle: "italic",
                    }}>
                    No skills yet — add one below.
                  </span>
                ) : (
                  draft.skills.map((skill, i) => (
                    <span
                      key={skill + i}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        fontSize: 12.5,
                        padding: "6px 8px 6px 13px",
                        borderRadius: 999,
                        background: "#fff",
                        border: "1px solid #E4D8C4",
                        color: "#2F6B45",
                        fontWeight: 600,
                      }}>
                      {skill}
                      <button
                        onClick={() => removeSkill(i)}
                        title="Remove"
                        style={{
                          background: "#EFE6D5",
                          border: "none",
                          borderRadius: "50%",
                          width: 18,
                          height: 18,
                          cursor: "pointer",
                          color: "#8A7C6B",
                          fontSize: 13,
                          lineHeight: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                        }}>
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Add a skill…"
                  style={{ ...textInput, flex: 1, fontSize: 14 }}
                />
                <button
                  onClick={addSkill}
                  style={{
                    background: "#fff",
                    border: "1px solid #2F6B45",
                    color: "#2F6B45",
                    borderRadius: 10,
                    padding: "0 18px",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}>
                  Add
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                padding: "18px 26px",
                borderTop: "1px solid #E4D8C4",
                position: "sticky",
                bottom: 0,
                background: "#FBF6EC",
              }}>
              <button
                onClick={closeEdit}
                style={{
                  background: "none",
                  border: "1px solid #D9CBB4",
                  color: "#5F5345",
                  borderRadius: 999,
                  padding: "10px 22px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}>
                Cancel
              </button>
              <button
                onClick={saveEdit}
                style={{
                  background: "#2F6B45",
                  border: "none",
                  color: "#fff",
                  borderRadius: 999,
                  padding: "10px 26px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
