import type { MouseEventHandler, ReactNode } from "react";
import { K } from "../../lib/karma";

interface ChipProps {
  children: ReactNode;
  active?: boolean;
  color?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export function Chip({ children, active, color, onClick }: ChipProps) {
  const cls = "kchip" + (active ? " kchip-active" : "");
  return (
    <button
      className={cls}
      onClick={onClick}
      style={
        active
          ? { background: K.ink, color: "#fff", borderColor: K.ink }
          : color
            ? { background: K.leafBg, color: K.leaf, borderColor: "transparent" }
            : { background: "#fff", color: K.muted, borderColor: "transparent" }
      }
    >
      {children}
    </button>
  );
}
