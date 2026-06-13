import { CAT, K, type CategoryName } from "../../lib/karma";
import { Icon, type IconName } from "../../lib/icons";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";
import { CategoryTag } from "../ui/Tag";
import { KarmaBadge } from "../ui/Badge";
import { Progress } from "../ui/Progress";

export interface Project {
  cat: CategoryName;
  icon: IconName;
  place: string;
  karma: number;
  host: string;
  hostName: string;
  dist: string;
  when: string;
  title: string;
  joined: number;
  cap: number;
  pct: number;
}

export function ProjectCard({ p }: { p: Project }) {
  const cat = CAT[p.cat] || CAT.Garden;
  return (
    <div className="kcard" style={{ background: "#fff", borderRadius: 22, overflow: "hidden", boxShadow: K.shadow }}>
      <div style={{ height: 158, background: `linear-gradient(135deg, ${cat.g[0]}, ${cat.g[1]})`, position: "relative" }}>
        <Icon name={p.icon} size={52} color="#fff" sw={1.3} style={{ position: "absolute", inset: 0, margin: "auto", opacity: 0.4 }} />
        <span style={{ position: "absolute", left: 14, top: 14 }}>
          <CategoryTag label={p.cat} />
        </span>
        <span style={{ position: "absolute", right: 14, top: 14 }}>
          <KarmaBadge points={p.karma} dark={p.cat === "Skill-share"} />
        </span>
        <span
          style={{
            position: "absolute",
            left: 14,
            bottom: 14,
            background: "rgba(0,0,0,0.32)",
            color: "#fff",
            fontSize: 10.5,
            padding: "3px 9px",
            borderRadius: 999,
          }}
        >
          {p.place}
        </span>
      </div>
      <div style={{ padding: "18px 20px 20px" }}>
        <h4 style={{ fontFamily: K.serif, fontSize: 20, fontWeight: 700, margin: "0 0 12px", lineHeight: 1.2 }}>{p.title}</h4>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Avatar initials={p.host} size={26} />
          <span style={{ fontSize: 13, color: K.muted }}>
            {p.hostName} · {p.dist} · {p.when}
          </span>
        </div>
        <div style={{ marginBottom: 14 }}>
          <Progress pct={p.pct} />
          <div style={{ fontSize: 12, color: K.muted, marginTop: 6 }}>
            {p.joined} of {p.cap} neighbors joined
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="primary" full>
            Join
          </Button>
          <IconButton name="bookmark" />
        </div>
      </div>
    </div>
  );
}
