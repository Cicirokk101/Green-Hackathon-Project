import type { MouseEventHandler } from "react";
import { Icon, type IconName } from "../../lib/icons";
import { K } from "../../lib/karma";

interface IconButtonProps {
  name: IconName;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export function IconButton({ name, onClick }: IconButtonProps) {
  return (
    <button
      className="kiconbtn"
      onClick={onClick}
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        border: `1.5px solid ${K.border}`,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <Icon name={name} size={18} color={K.faint} />
    </button>
  );
}
