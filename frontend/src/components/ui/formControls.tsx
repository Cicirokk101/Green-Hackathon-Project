import type { ChangeEvent, CSSProperties, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Icon } from "../../lib/icons";
import { K } from "../../lib/karma";

export const inputStyle: CSSProperties = {
  width: "100%",
  fontFamily: K.sans,
  fontSize: 14.5,
  color: K.ink,
  padding: "12px 14px",
  borderRadius: 12,
  border: `1.5px solid ${K.border}`,
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
};

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="kinput" style={inputStyle} {...props} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="kinput" style={{ ...inputStyle, minHeight: 96, resize: "vertical", lineHeight: 1.5 }} {...props} />;
}

interface SelectProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}

export function Select({ value, onChange, options }: SelectProps) {
  return (
    <div style={{ position: "relative" }}>
      <select className="kinput" value={value} onChange={onChange} style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Icon name="chevDown" size={16} color={K.faint} style={{ position: "absolute", right: 14, top: 14, pointerEvents: "none" }} />
    </div>
  );
}
