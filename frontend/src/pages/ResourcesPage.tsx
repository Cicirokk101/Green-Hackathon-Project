import { useEffect, useState } from "react";
import { Eyebrow } from "../components/ui/Eyebrow";
import { Icon, type IconName } from "../lib/icons";
import { K } from "../lib/karma";

interface ResourceLink {
  id: number;
  t: string;
  d: string;
  src: string;
  icon: IconName;
}

const BELIEFS = [
  { h: "Help is local", b: "The best help is already on your street. Karma only shows you what’s within a short walk." },
  { h: "Small is enough", b: "No heroics. An hour, a tool, a skill you already have. Tiny acts, added up, change a block." },
  { h: "Everyone gives", b: "Karma points keep it balanced — you give, you receive, and nobody keeps an awkward mental ledger." },
];

function LinkRow({ l }: { l: ResourceLink }) {
  return (
    <a
      className="klinkcard"
      href="#"
      onClick={(e) => e.preventDefault()}
      style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", border: `1px solid ${K.border}`, borderRadius: 16, padding: "18px 20px", textDecoration: "none" }}
    >
      <div style={{ width: 46, height: 46, borderRadius: 13, background: K.orangeBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={l.icon} size={22} color={K.orangeDeep} sw={1.8} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15.5, fontWeight: 700, color: K.ink, marginBottom: 3 }}>{l.t}</div>
        <div style={{ fontSize: 13, color: K.muted, lineHeight: 1.45 }}>{l.d}</div>
        <div style={{ fontSize: 11.5, color: K.faint, marginTop: 6, fontWeight: 600 }}>{l.src}</div>
      </div>
      <Icon name="arrow" size={18} color={K.faint} />
    </a>
  );
}

export function ResourcesPage() {
  const [links, setLinks] = useState<ResourceLink[]>([]);

  useEffect(() => {
    fetch("/api/resources")
      .then((r) => r.json())
      .then((data) =>
        setLinks(data.map((r: any) => ({ id: r.id, t: r.title, d: r.description, src: r.source, icon: r.icon })))
      );
  }, []);

  return (
    <div style={{ padding: "0 0 60px" }}>
      {/* manifesto hero */}
      <div style={{ background: K.ink, color: "#F7F1E6", padding: "64px 36px 72px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -80, top: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(242,106,33,0.16)" }} />
        <div style={{ position: "absolute", right: 160, bottom: -120, width: 260, height: 260, borderRadius: "50%", background: "rgba(247,181,59,0.12)" }} />
        <div style={{ maxWidth: 760, position: "relative" }}>
          <Eyebrow color={K.gold}>Why we built Karma</Eyebrow>
          <h1 style={{ fontFamily: K.serif, fontSize: 52, fontWeight: 700, lineHeight: 1.14, margin: "16px 0 26px" }}>
            Asking for help shouldn’t feel like a favor you’ll never repay.
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.6, color: "#E6DBCB", margin: 0, maxWidth: 660 }}>
            Most of us live a few doors down from someone who’d gladly lend a drill, watch the dog, or teach us to patch a bike tube. We just never
            ask. Karma turns those small, awkward asks into something easy — and keeps a friendly tally so no one feels like they’re taking too
            much.
          </p>
        </div>
      </div>

      {/* three-up belief columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 36, padding: "56px 36px", maxWidth: 1180, margin: "0 auto" }}>
        {BELIEFS.map((c, i) => (
          <div key={i}>
            <div style={{ fontFamily: K.serif, fontStyle: "italic", fontSize: 17, color: K.terra, marginBottom: 10 }}>0{i + 1}</div>
            <h3 style={{ fontFamily: K.serif, fontSize: 26, fontWeight: 700, margin: "0 0 10px" }}>{c.h}</h3>
            <p style={{ fontSize: 15.5, lineHeight: 1.6, color: K.muted, margin: 0 }}>{c.b}</p>
          </div>
        ))}
      </div>

      {/* pull quote */}
      <div style={{ background: K.leafBg, padding: "52px 36px", textAlign: "center" }}>
        <p style={{ fontFamily: K.serif, fontSize: 32, fontWeight: 500, fontStyle: "italic", color: K.forest, maxWidth: 820, margin: "0 auto", lineHeight: 1.35 }}>
          “The first time felt strange. By the third Saturday, half the street knew my name.”
        </p>
        <div style={{ fontSize: 14, color: K.leaf, fontWeight: 700, marginTop: 18, textTransform: "uppercase", letterSpacing: "0.1em" }}>— Rosa, Maplewood</div>
      </div>

      {/* helpful links */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 36px 0" }}>
        <Eyebrow color={K.orange}>Get started elsewhere too</Eyebrow>
        <h2 style={{ fontFamily: K.serif, fontSize: 34, fontWeight: 700, margin: "10px 0 6px" }}>Helpful links &amp; toolkits</h2>
        <p style={{ fontSize: 16, color: K.muted, margin: "0 0 28px", maxWidth: 620 }}>Hand-picked guides from organizations who’ve been doing this work for years.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {links.map((l) => (
            <LinkRow key={l.id} l={l} />
          ))}
        </div>
      </div>
    </div>
  );
}
