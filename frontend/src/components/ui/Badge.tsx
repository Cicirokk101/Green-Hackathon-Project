import { K } from "../../lib/karma";

interface KarmaBadgeProps {
  points: number;
  dark?: boolean;
}

export function KarmaBadge({ points, dark }: KarmaBadgeProps) {
  return (
    <span
      style={{
        background: dark ? K.ink : K.gold,
        color: dark ? K.gold : K.goldText,
        fontSize: 12,
        fontWeight: 800,
        padding: "5px 12px",
        borderRadius: 999,
      }}
    >
      +{points}
    </span>
  );
}
