import { K } from "../../lib/karma";

export function MapCard() {
  return (
    <div className="kcard" style={{ background: "#fff", borderRadius: 22, overflow: "hidden", boxShadow: K.shadow, cursor: "pointer" }}>
      <div style={{ height: 120, background: `linear-gradient(135deg, ${K.leafBg}, #C4E6CF)`, position: "relative" }}>
        <svg width="100%" height="120" viewBox="0 0 300 120" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
          <path d="M0 70 Q60 40 120 70 T300 60" stroke={K.leaf} strokeWidth="2" fill="none" opacity="0.45" />
          <path d="M0 90 L90 70 L180 95 L300 75" stroke={K.orange} strokeWidth="2" fill="none" opacity="0.45" />
          <circle cx="120" cy="60" r="6" fill={K.orange} />
          <circle cx="200" cy="80" r="6" fill={K.leaf} />
        </svg>
        <span style={{ position: "absolute", left: 16, bottom: 12, fontSize: 12, color: K.leaf, fontWeight: 700 }}>11 projects nearby</span>
      </div>
      <div style={{ padding: "16px 20px" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: K.orange }}>Open map view →</span>
      </div>
    </div>
  );
}
