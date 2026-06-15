import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilterRow, type FilterName } from "../components/FilterRow";
import { KarmaCard } from "../components/cards/KarmaCard";
import { MapCard } from "../components/cards/MapCard";
import { ProjectCard, type Project } from "../components/cards/ProjectCard";
import { SkillsCard } from "../components/cards/SkillsCard";
import { Hero } from "../components/layout/Hero";
import { Icon } from "../lib/icons";
import { categoryMatchesSkills, K, type CategoryName } from "../lib/karma";
import { bookmarkProject, deleteProject, getMe, getProjects, joinProject, leaveProject, type ProjectDTO } from "../lib/api";

const CATEGORY_BY_FILTER: Partial<Record<FilterName, CategoryName>> = {
  Gardens: "Garden",
  Cleanups: "Cleanup",
  Repairs: "Repair",
  "Skill-shares": "Skill-share",
  "Mutual aid": "Mutual aid",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const day = WEEKDAYS[d.getDay()];
  let h = d.getHours();
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  const m = d.getMinutes();
  const time = m === 0 ? `${h}${ampm}` : `${h}:${String(m).padStart(2, "0")}${ampm}`;
  return `${day} ${time}`;
}

function toProject(dto: ProjectDTO): Project {
  return {
    id: dto.id,
    cat: dto.cat,
    icon: dto.icon,
    place: dto.place,
    karma: dto.karma,
    host: dto.host_initials,
    hostName: dto.host_name,
    when: formatWhen(dto.when),
    title: dto.title,
    joined: dto.joined,
    cap: dto.cap,
    pct: dto.pct,
    bookmarked: dto.bookmarked,
    joinedByMe: dto.joined_by_me,
    isMine: dto.is_mine,
  };
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterName>("All");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [joinedIds, setJoinedIds] = useState<Set<number>>(new Set());
  const [joiningIds, setJoiningIds] = useState<Set<number>>(new Set());
  const [mySkills, setMySkills] = useState<string[]>([]);

  useEffect(() => {
    getMe()
      .then((me) => setMySkills(me.skills))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    const cat = filter === "For me" ? undefined : CATEGORY_BY_FILTER[filter];
    getProjects(cat)
      .then((data) => {
        if (cancelled) return;
        const items = filter === "For me" ? data.items.filter((d) => categoryMatchesSkills(d.cat, mySkills)) : data.items;
        setProjects(items.map(toProject));
        setJoinedIds(new Set(items.filter((d) => d.joined_by_me).map((d) => d.id)));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter, mySkills]);

  async function handleJoin(id: number) {
    if (joinedIds.has(id) || joiningIds.has(id)) return;
    setJoiningIds((s) => new Set(s).add(id));
    try {
      const res = await joinProject(id);
      setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, joined: res.joined, pct: res.pct } : p)));
      setJoinedIds((s) => new Set(s).add(id));
    } finally {
      setJoiningIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  }

  async function handleLeave(id: number) {
    if (joiningIds.has(id)) return;
    setJoiningIds((s) => new Set(s).add(id));
    try {
      const res = await leaveProject(id);
      setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, joined: res.joined, pct: res.pct } : p)));
      setJoinedIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    } finally {
      setJoiningIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this project? This can't be undone.")) return;
    try {
      await deleteProject(id);
      setProjects((ps) => ps.filter((p) => p.id !== id));
    } catch {
      window.alert("Couldn't delete this project. Try again later.");
    }
  }

  async function handleBookmark(id: number) {
    setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, bookmarked: !p.bookmarked } : p)));
    try {
      await bookmarkProject(id);
    } catch {
      setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, bookmarked: !p.bookmarked } : p)));
    }
  }

  return (
    <div>
      <Hero
        eyebrow="Maplewood · within 2 miles"
        title="11 ways to help this week"
        sub="Your neighbors are gardening, fixing, teaching, and cleaning up. Jump in."
        action={
          <div
            className="kbtn"
            onClick={() => navigate("/start")}
            style={{
              position: "relative",
              background: "#fff",
              color: K.ink,
              borderRadius: 16,
              padding: "8px 22px",
              fontWeight: 700,
              fontSize: 14.5,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
              cursor: "pointer",
            }}
          >
            <Icon name="plus" size={16} color={K.orange} sw={2.4} />
            Start a project
          </div>
        }
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "26px 36px 10px", gap: 16, flexWrap: "wrap" }}>
        <FilterRow active={filter} setActive={setFilter} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 28, padding: "16px 36px 44px", alignItems: "start" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
          {loading && <div style={{ color: K.muted, padding: 40 }}>Loading projects…</div>}
          {!loading && error && <div style={{ color: K.terra, padding: 40 }}>Couldn't load projects. Try again later.</div>}
          {!loading && !error && projects.length === 0 && (
            <div style={{ color: K.muted, padding: 40 }}>
              {filter === "For me"
                ? mySkills.length === 0
                  ? "Add some skills to your profile to see projects picked for you."
                  : "No projects matching your skills right now."
                : "No projects in this category yet."}
            </div>
          )}
          {!loading &&
            !error &&
            projects.map((p) => (
              <ProjectCard
                key={p.id}
                p={p}
                onJoin={() => handleJoin(p.id)}
                onLeave={() => handleLeave(p.id)}
                onBookmark={() => handleBookmark(p.id)}
                onDelete={() => handleDelete(p.id)}
                joining={joiningIds.has(p.id)}
                hasJoined={joinedIds.has(p.id)}
              />
            ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <KarmaCard />
          <SkillsCard />
          <MapCard />
        </div>
      </div>
    </div>
  );
}
