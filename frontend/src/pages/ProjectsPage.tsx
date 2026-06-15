import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilterRow, type FilterName } from "../components/FilterRow";
import { KarmaCard } from "../components/cards/KarmaCard";
import { MapCard } from "../components/cards/MapCard";
import { ProjectCard, type Project } from "../components/cards/ProjectCard";
import { SkillsCard } from "../components/cards/SkillsCard";
import { Hero } from "../components/layout/Hero";
import { Icon } from "../lib/icons";
import { K, type CategoryName } from "../lib/karma";

const PROJECTS: Project[] = [
  {
    cat: "Garden", icon: "sprout", place: "Riverside lot", karma: 40, host_initials: "DA", host_name: "Dana A.",
    when: "Sat 9am", title: "Build raised beds at the Elm St. lot", joined: 6, cap: 10, pct: 60,
  },
  {
    cat: "Repair", icon: "wrench", place: "Tool library", karma: 25, host_initials: "JK", host_name: "Jordan K.",
    when: "Sun 2pm", title: "Fix-it café: lamps, chairs & bikes", joined: 3, cap: 8, pct: 38,
  },
  {
    cat: "Cleanup", icon: "trend", place: "Creek path", karma: 30, host_initials: "PL", host_name: "Priya L.",
    when: "Sat 8am", title: "Creek & trail litter sweep", joined: 12, cap: 20, pct: 60,
  },
  {
    cat: "Skill-share", icon: "bulb", place: "Library room B", karma: 20, host_initials: "SM", host_name: "Sam M.",
    when: "Wed 6pm", title: "Teach & learn: bike maintenance", joined: 5, cap: 12, pct: 42,
  },
  {
    cat: "Mutual aid", icon: "heart", place: "Oak Ave.", karma: 15, host_initials: "TN", host_name: "Tomas N.",
    when: "Sun 10am", title: "Help Mr. Ortiz prep his yard", joined: 2, cap: 4, pct: 50,
  },
];

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
  const shown = filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.cat === CATEGORY_BY_FILTER[filter]);

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
          {shown.map((p, i) => (
            <ProjectCard key={i} p={p} />
          ))}
          {shown.length === 0 && <div style={{ color: K.muted, padding: 40 }}>No projects in this category yet.</div>}
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
