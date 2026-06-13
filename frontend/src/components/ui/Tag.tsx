import { CAT, type CategoryName } from "../../lib/karma";

interface CategoryTagProps {
  label: CategoryName;
}

export function CategoryTag({ label }: CategoryTagProps) {
  const c = (CAT[label] || CAT.Garden).fg;
  return (
    <span style={{ background: "#fff", color: c, fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 999 }}>
      {label}
    </span>
  );
}
