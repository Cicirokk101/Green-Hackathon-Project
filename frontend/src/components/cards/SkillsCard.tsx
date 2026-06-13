import { K } from "../../lib/karma";

const SKILLS = ["Carpentry", "Gardening", "First aid"];

export function SkillsCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 22, padding: 22, boxShadow: K.shadow }}>
      <div style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: K.faint, fontWeight: 700, marginBottom: 14 }}>
        Skills you share
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {SKILLS.map((s) => (
          <span key={s} style={{ fontSize: 12.5, padding: "6px 13px", borderRadius: 999, background: K.leafBg, color: K.leaf, fontWeight: 600 }}>
            {s}
          </span>
        ))}
        <span
          style={{
            fontSize: 12.5,
            padding: "6px 13px",
            borderRadius: 999,
            background: K.orangeBg,
            color: K.orangeDeep,
            border: "1px dashed #F0C79B",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + Add
        </span>
      </div>
    </div>
  );
}
