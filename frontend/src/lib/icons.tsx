import type { CSSProperties } from "react";

// ===== Line icon set (24x24, currentColor) =====
const PATHS = {
  sprout: "M12 20V9M12 9c0-3 2-5 5-5 0 3-2 5-5 5zM12 11C12 8 10 6 7 6c0 3 2 5 5 5z",
  mark: "M12 3c0 4-3 5-3 8a3 3 0 006 0c0-1.4-.7-2.3-1.4-3.2C13 11 15 13 15 16a3 3 0 11-6 0",
  wrench: "M14 6l4 4-8 8H6v-4l8-8z",
  trend: "M4 18l5-5 3 3 8-8M16 8h4v4",
  bulb: "M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c.7.7 1 1.2 1 2.5h6c0-1.3.3-1.8 1-2.5A6 6 0 0012 3z",
  heart: "M12 21s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 11c0 5.5-7 10-7 10z",
  plus: "M12 5v14M5 12h14",
  search: "M11 4a7 7 0 105 12l3 3",
  clock: "M12 7v5l3 2",
  bookmark: "M6 4h12v16l-6-4-6 4V4z",
  cal: "M3 9h18M8 3v4M16 3v4",
  map: "M9 4l6 2 6-2v14l-6 2-6-2-6 2V6z M9 4v14 M15 6v14",
  users: "M16 18v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M9.5 9a3 3 0 100-6 3 3 0 000 6zM17 13a3 3 0 10-1-5.8",
  arrow: "M5 12h14M13 6l6 6-6 6",
  check: "M5 12l5 5L20 6",
  star: "M12 3l2.6 5.6L21 9.3l-4.5 4.2L17.6 21 12 17.7 6.4 21l1.1-7.5L3 9.3l6.4-.7z",
  chevron: "M9 6l6 6-6 6",
  chevDown: "M6 9l6 6 6-6",
  x: "M6 6l12 12M18 6L6 18",
  image: "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6",
  link: "M10 13a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1M14 11a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18",
  pin: "M12 21s-6-5.2-6-10a6 6 0 1112 0c0 4.8-6 10-6 10z",
  hand: "M7 11V6a1.5 1.5 0 013 0v4m0-5a1.5 1.5 0 013 0v5m0-4a1.5 1.5 0 013 0v7a5 5 0 01-5 5h-1a5 5 0 01-4.5-2.8L7 14",
  chat: "M21 12a8 8 0 01-11.5 7.2L4 21l1.8-5.5A8 8 0 1121 12z",
  ticket: "M4 8a2 2 0 012-2h12a2 2 0 012 2 2 2 0 000 4 2 2 0 010 4H6a2 2 0 01-2-2 2 2 0 000-4z",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  book: "M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM19 17H6",
  globe: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18",
  camera: "M4 8h3l2-2h6l2 2h3v11H4zM12 16a3.5 3.5 0 100-7 3.5 3.5 0 000 7z",
  gift: "M12 8v13M4 12h16M5 8h14v13H5zM12 8S10 3 7.5 3 5 6 5 6s2 2 7 2zM12 8s2-5 4.5-5S19 6 19 6s-2 2-7 2z",
  flag: "M5 21V4h11l-2 4 2 4H5",
  shield: "M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z",
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  sw?: number;
  fill?: string;
  style?: CSSProperties;
}

export function Icon({ name, size = 18, color = "currentColor", sw = 1.7, fill = "none", style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      style={style}
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
