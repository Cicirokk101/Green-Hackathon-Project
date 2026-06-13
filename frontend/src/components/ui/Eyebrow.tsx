import type { ReactNode } from "react";
import { K } from "../../lib/karma";

interface EyebrowProps {
  children: ReactNode;
  color?: string;
}

export function Eyebrow({ children, color = K.leaf }: EyebrowProps) {
  return (
    <div style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color, fontWeight: 700 }}>
      {children}
    </div>
  );
}
