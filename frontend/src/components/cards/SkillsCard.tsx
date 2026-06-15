import { useEffect, useState } from "react";
import { K } from "../../lib/karma";
import { getMe, updateSkills } from "../../lib/api";

export function SkillsCard() {
  const [skills, setSkills] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    getMe()
      .then((me) => setSkills(me.skills))
      .catch(() => {});
  }, []);

  function addSkill() {
    const v = newSkill.trim();
    if (!v || skills.some((s) => s.toLowerCase() === v.toLowerCase())) {
      setNewSkill("");
      setAdding(false);
      return;
    }
    const next = [...skills, v];
    setSkills(next);
    setNewSkill("");
    setAdding(false);
    updateSkills(next).catch(() => {});
  }

  function removeSkill(skill: string) {
    const next = skills.filter((s) => s !== skill);
    setSkills(next);
    updateSkills(next).catch(() => {});
  }

  return (
    <div style={{ background: "#fff", borderRadius: 22, padding: 22, boxShadow: K.shadow }}>
      <div style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: K.faint, fontWeight: 700, marginBottom: 14 }}>
        Skills you share
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {skills.map((s) => (
          <span
            key={s}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered((h) => (h === s ? null : h))}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12.5,
              padding: "6px 13px",
              borderRadius: 999,
              background: K.leafBg,
              color: K.leaf,
              fontWeight: 600,
            }}
          >
            {s}
            {hovered === s && (
              <button
                onClick={() => removeSkill(s)}
                title="Remove skill"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(31,138,82,0.18)",
                  color: K.leaf,
                  fontSize: 11,
                  lineHeight: 1,
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "inherit",
                }}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {adding ? (
          <input
            autoFocus
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
              if (e.key === "Escape") {
                setNewSkill("");
                setAdding(false);
              }
            }}
            onBlur={addSkill}
            placeholder="Skill name…"
            style={{
              fontSize: 12.5,
              padding: "6px 13px",
              borderRadius: 999,
              border: `1px solid ${K.border}`,
              outline: "none",
              fontFamily: K.sans,
              width: 120,
            }}
          />
        ) : (
          <span
            onClick={() => setAdding(true)}
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
        )}
      </div>
    </div>
  );
}
