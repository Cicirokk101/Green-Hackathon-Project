import { AV } from "../../lib/karma";

interface AvatarProps {
  initials: string;
  size?: number;
  color?: string;
}

export function Avatar({ initials, size = 26, color }: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: color || AV[initials] || "#C6532A",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: 700,
        letterSpacing: "0.02em",
      }}
    >
      {initials}
    </div>
  );
}
