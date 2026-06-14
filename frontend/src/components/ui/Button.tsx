import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { Icon, type IconName } from "../../lib/icons";
import { K } from "../../lib/karma";

type Variant = "primary" | "dark" | "ghost" | "soft" | "green";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  children?: ReactNode;
  variant?: Variant;
  icon?: IconName;
  size?: Size;
  full?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
}

export function Button({ children, variant = "primary", icon, size = "md", full, disabled, onClick, style }: ButtonProps) {
  const pad = size === "lg" ? "13px 26px" : size === "sm" ? "8px 16px" : "11px 22px";
  const fs = size === "lg" ? 15.5 : size === "sm" ? 13 : 14;
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: K.sans,
    fontWeight: 700,
    fontSize: fs,
    padding: pad,
    borderRadius: 12,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    width: full ? "100%" : "auto",
    whiteSpace: "nowrap",
    ...style,
  };
  const variants: Record<Variant, CSSProperties> = {
    primary: { background: K.orange, color: "#fff" },
    dark: { background: K.ink, color: "#fff" },
    ghost: { background: "#fff", color: K.text, border: `1.5px solid ${K.border}` },
    soft: { background: K.orangeBg, color: K.orangeDeep },
    green: { background: K.leaf, color: "#fff" },
  };
  return (
    <button className={"kbtn kbtn-" + variant} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>
      {icon && <Icon name={icon} size={fs + 2} sw={2.2} />}
      {children}
    </button>
  );
}
