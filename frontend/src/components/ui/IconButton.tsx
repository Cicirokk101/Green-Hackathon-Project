import type { MouseEventHandler } from "react";
import { Icon, type IconName } from "../../lib/icons";
import { K } from "../../lib/karma";

interface IconButtonProps {
  name: IconName;
  active?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export function IconButton({ name, active, onClick }: IconButtonProps) {
  return (
    <button
      className="kiconbtn"
      onClick={onClick}
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        border: `1.5px solid ${active ? K.orange : K.border}`,
        background: active ? K.orangeBg : "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <Icon name={name} size={18} color={active ? K.orange : K.faint} />
    </button>
  );
}
