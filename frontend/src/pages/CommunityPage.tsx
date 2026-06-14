import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Eyebrow } from "../components/ui/Eyebrow";
import { Hero } from "../components/layout/Hero";
import { Icon, type IconName } from "../lib/icons";
import { CAT, K, type CategoryName } from "../lib/karma";

interface Workshop {
  id: number;
  skill: string;
  cat: CategoryName;
  host: string;
  host_name: string;
  when: string;
  place: string;
  seats: number;
  taken: number;
  seats_left: number;
  level: string;
  icon: IconName;
  full: boolean;
  attending: boolean;
}

interface SkillRequest {
  skill: string;
  count: number;
}

const TABS = ["Upcoming", "Hosting", "Attending", "Past"];

export function CommunityPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("Upcoming");
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [skillRequests, setSkillRequests] = useState<SkillRequest[]>([]);
  const [joining, setJoining] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/workshops?tab=${tab.toLowerCase()}`)
      .then((r) => r.json())
      .then(setWorkshops);
  }, [tab]);

  useEffect(() => {
    fetch("/api/skills/requested")
      .then((r) => r.json())
      .then(setSkillRequests);
  }, []);

  async function handleJoin(w: Workshop) {
    setJoining(w.id);
    const res = await fetch(`/api/workshops/${w.id}/join`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setWorkshops((prev) =>
        prev.map((x) =>
          x.id === w.id
            ? { ...x, seats_left: data.seats_left, full: data.seats_left === 0, attending: !data.on_waitlist }
            : x
        )
      );
    }
    setJoining(null);
  }

  return (
    <div>
      <Hero
        eyebrow="Community · Maplewood"
        title="Learn something. Teach something."
        sub="Neighbors are sharing what they know — workshops, clinics, and hands-on skill-shares this month."
        action={
          <div
            className="kbtn"
            onClick={() => navigate("/start-workshop")}
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
            Host a workshop
          </div>
        }
      />

      {/* tabs */}
      <div style={{ display: "flex", gap: 26, padding: "24px 36px 0", borderBottom: `1px solid ${K.border}`, margin: "20px 36px 0" }}>
        {TABS.map((t) => (
          <span
            key={t}
            className="ktab"
            onClick={() => setTab(t)}
            style={{
              paddingBottom: 12,
              fontSize: 14.5,
              fontWeight: 700,
              cursor: "pointer",
              color: t === tab ? K.ink : K.faint,
              borderBottom: t === tab ? `2.5px solid ${K.orange}` : "2.5px solid transparent",
            }}
          >
            {t}
          </span>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 28, padding: "24px 36px 44px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {workshops.length === 0 && (
            <div style={{ color: K.muted, padding: 40 }}>No workshops in this tab yet.</div>
          )}
          {workshops.map((w) => {
            const cat = CAT[w.cat];
            return (
              <div
                key={w.id}
                className="kcard"
                style={{ background: "#fff", borderRadius: 22, boxShadow: K.shadow, display: "grid", gridTemplateColumns: "92px 1fr auto", alignItems: "center", gap: 20, padding: 18 }}
              >
                <div style={{ width: 92, height: 92, borderRadius: 18, background: `linear-gradient(135deg,${cat.g[0]},${cat.g[1]})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={w.icon} size={36} color="#fff" sw={1.4} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <Eyebrow color={cat.fg}>{w.cat}</Eyebrow>
                    <span style={{ fontSize: 11.5, color: K.faint, fontWeight: 600 }}>· {w.level}</span>
                  </div>
                  <h4 style={{ fontFamily: K.serif, fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>{w.skill}</h4>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", color: K.muted, fontSize: 13 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <Avatar initials={w.host} size={22} />
                      {w.host_name}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="cal" size={14} color={K.faint} />
                      {w.when}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="pin" size={14} color={K.faint} />
                      {w.place}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                  <div style={{ fontSize: 12.5, color: w.full ? K.terra : K.muted, fontWeight: 700 }}>
                    {w.attending ? "Attending" : w.full ? "Waitlist only" : `${w.seats_left} seats left`}
                  </div>
                  <Button
                    variant={w.attending ? "ghost" : w.full ? "ghost" : "primary"}
                    disabled={w.attending || joining === w.id}
                    onClick={() => handleJoin(w)}
                  >
                    {w.attending ? "Reserved" : joining === w.id ? "…" : w.full ? "Join waitlist" : "Reserve a seat"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: `linear-gradient(150deg,${K.leaf},#2F6B45)`, borderRadius: 22, padding: 24, color: "#fff" }}>
            <Icon name="spark" size={26} color={K.gold} sw={1.8} />
            <h4 style={{ fontFamily: K.serif, fontSize: 21, fontWeight: 700, margin: "12px 0 6px" }}>Know how to do something?</h4>
            <p style={{ fontSize: 13.5, opacity: 0.92, margin: "0 0 16px", lineHeight: 1.5 }}>
              Teaching a skill earns you the most karma on Karma — and three neighbors who owe you one.
            </p>
            <Button variant="soft" onClick={() => navigate("/start-workshop")}>
              Host a workshop
            </Button>
          </div>
          <div style={{ background: "#fff", borderRadius: 22, padding: 22, boxShadow: K.shadow }}>
            <div style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: K.faint, fontWeight: 700, marginBottom: 14 }}>
              Most-requested skills
            </div>
            {skillRequests.map((s, i) => (
              <div key={s.skill} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderTop: i ? `1px solid ${K.border}` : "none" }}>
                <span style={{ fontSize: 13.5, color: K.text, fontWeight: 600 }}>{s.skill}</span>
                <span style={{ fontSize: 12, color: K.faint }}>{s.count} want this</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
