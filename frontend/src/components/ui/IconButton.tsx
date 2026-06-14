import type { MouseEventHandler } from "react";
import { Icon, type IconName } from "../../lib/icons";
import { K } from "../../lib/karma";

interface IconButtonProps {
  name: IconName;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  active?: boolean;
}

export function IconButton({ name, onClick, active }: IconButtonProps) {
  return (
    <button
      className="kiconbtn"
      onClick={onClick}
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        border: active ? `1.5px solid ${K.gold}` : `1.5px solid ${K.border}`,
        background: active ? K.orangeBg : "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <Icon name={name} size={18} color={active ? K.goldDeep : K.faint} fill={active ? K.gold : "none"} />
    </button>
  );
}
