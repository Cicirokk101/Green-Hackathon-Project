import { K } from "../../lib/karma";

interface ProgressProps {
  pct: number;
  h?: number;
  fill?: string;
  track?: string;
}

export function Progress({ pct, h = 8, fill = K.leaf, track = "#EFEAE2" }: ProgressProps) {
  return (
    <div style={{ height: h, borderRadius: 999, background: track, overflow: "hidden" }}>
      <div style={{ width: pct + "%", height: "100%", background: fill, borderRadius: 999 }} />
    </div>
  );
}
