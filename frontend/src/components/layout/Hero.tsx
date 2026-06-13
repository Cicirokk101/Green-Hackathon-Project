import type { ReactNode } from "react";
import { K } from "../../lib/karma";

interface HeroProps {
  eyebrow: string;
  title: string;
  sub: string;
  action?: ReactNode;
}

export function Hero({ eyebrow, title, sub, action }: HeroProps) {
  return (
    <div
      style={{
        margin: "28px 36px 0",
        background: `linear-gradient(120deg, ${K.orange}, #F7943B)`,
        borderRadius: 22,
        padding: "32px 34px",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", right: -30, top: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
      <div style={{ position: "absolute", right: 90, bottom: -60, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.10)" }} />
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 12.5, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, opacity: 0.9 }}>{eyebrow}</div>
        <h1 style={{ fontFamily: K.serif, fontSize: 38, fontWeight: 700, margin: "6px 0 8px", lineHeight: 1.14 }}>{title}</h1>
        <p style={{ fontSize: 15.5, opacity: 0.95, margin: 0, maxWidth: 460 }}>{sub}</p>
      </div>
      {action}
    </div>
  );
}
