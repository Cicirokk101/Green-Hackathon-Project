import { Chip } from "./ui/Chip";

export const FILTERS = ["All", "For me", "Gardens", "Cleanups", "Repairs", "Skill-shares", "Mutual aid"] as const;
export type FilterName = (typeof FILTERS)[number];

const FILTER_EMOJI: Partial<Record<FilterName, string>> = {
  Gardens: "🌱",
  Cleanups: "🧹",
  Repairs: "🔧",
  "Skill-shares": "💡",
  "Mutual aid": "🤝",
};

interface FilterRowProps {
  active: FilterName;
  setActive: (f: FilterName) => void;
}

export function FilterRow({ active, setActive }: FilterRowProps) {
  return (
    <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
      {FILTERS.map((f) => (
        <Chip key={f} active={active === f} color={active !== f && f !== "All"} onClick={() => setActive(f)}>
          {FILTER_EMOJI[f] ? FILTER_EMOJI[f] + " " : ""}
          {f}
        </Chip>
      ))}
    </div>
  );
}
