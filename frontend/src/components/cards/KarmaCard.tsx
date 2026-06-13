import { K } from "../../lib/karma";
import { Progress } from "../ui/Progress";

export function KarmaCard() {
  return (
    <div style={{ background: `linear-gradient(150deg,${K.ink},#3A2C1C)`, borderRadius: 22, padding: 24, color: "#F7F1E6" }}>
      <div style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "#E0A86B", fontWeight: 700 }}>
        Your karma
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "8px 0 2px" }}>
        <span style={{ fontFamily: K.serif, fontSize: 40, fontWeight: 700, color: K.gold }}>1,240</span>
        <span style={{ fontSize: 13, color: "#C8A98C" }}>pts</span>
      </div>
      <div style={{ fontSize: 13, color: "#D8C9B6", marginBottom: 14 }}>Level 4 · Cornerstone</div>
      <Progress pct={64} h={7} track="rgba(255,255,255,0.15)" fill={`linear-gradient(90deg,${K.orange},${K.gold})`} />
      <div style={{ fontSize: 12, color: "#C8A98C", marginTop: 8 }}>260 pts to Keystone →</div>
    </div>
  );
}
