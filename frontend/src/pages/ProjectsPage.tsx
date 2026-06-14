import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilterRow, type FilterName } from "../components/FilterRow";
import { KarmaCard } from "../components/cards/KarmaCard";
import { MapCard } from "../components/cards/MapCard";
import { ProjectCard, type Project } from "../components/cards/ProjectCard";
import { SkillsCard } from "../components/cards/SkillsCard";
import { Hero } from "../components/layout/Hero";
import { Icon } from "../lib/icons";
import { K, type CategoryName } from "../lib/karma";

const CATEGORY_BY_FILTER: Partial<Record<FilterName, CategoryName>> = {
  Gardens: "Garden",
  Cleanups: "Cleanup",
  Repairs: "Repair",
  "Skill-shares": "Skill-share",
  "Mutual aid": "Mutual aid",
};

export function ProjectsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterName>("All");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cat = CATEGORY_BY_FILTER[filter];
    const url = cat ? `/api/projects?cat=${encodeURIComponent(cat)}` : "/api/projects";
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const items: Project[] = data.items.map((p: any) => ({
          ...p,
          hostName: p.host_name,
        }));
        setProjects(items);
      })
      .finally(() => setLoading(false));
  }, [filter]);

  const shown = projects;

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
          {loading && <div style={{ color: K.muted, padding: 40 }}>Loading…</div>}
          {!loading && shown.map((p, i) => (
            <ProjectCard key={i} p={p} />
          ))}
          {!loading && shown.length === 0 && <div style={{ color: K.muted, padding: 40 }}>No projects in this category yet.</div>}
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
