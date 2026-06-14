import type { ChangeEvent, ReactNode } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Select, TextArea, TextInput } from "../components/ui/formControls";
import { CategoryTag } from "../components/ui/Tag";
import { Icon, type IconName } from "../lib/icons";
import { CAT, K, type CategoryName } from "../lib/karma";
import { createWorkshop } from "../lib/api";

const CATS: CategoryName[] = ["Garden", "Repair", "Skill-share", "Mutual aid"];
const CAT_ICON: Record<CategoryName, IconName> = {
  Garden: "sprout",
  Cleanup: "trend",
  Repair: "wrench",
  "Skill-share": "bulb",
  "Mutual aid": "heart",
};
const LEVELS = ["Beginner", "Intermediate", "Advanced", "All levels"];

interface WorkshopForm {
  cat: CategoryName;
  skill: string;
  desc: string;
  when: string;
  place: string;
  seats: string;
  level: string;
}

function Label({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 700, color: K.text, marginBottom: 8 }}>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <Label>{label}</Label>
      {children}
      {hint && <div style={{ fontSize: 12, color: K.faint, marginTop: 6 }}>{hint}</div>}
    </div>
  );
}

function CatPicker({ value, onChange }: { value: CategoryName; onChange: (c: CategoryName) => void }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {CATS.map((c) => {
        const on = value === c;
        const col = CAT[c];
        return (
          <button
            key={c}
            className="kcatpick"
            onClick={() => onChange(c)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 999,
              cursor: "pointer",
              fontFamily: K.sans,
              fontSize: 13.5,
              fontWeight: 700,
              border: on ? `1.5px solid ${col.fg}` : `1.5px solid ${K.border}`,
              background: on ? col.fg + "16" : "#fff",
              color: on ? col.fg : K.muted,
            }}
          >
            <Icon name={CAT_ICON[c]} size={16} color={on ? col.fg : K.faint} sw={1.8} />
            {c}
          </button>
        );
      })}
    </div>
  );
}

function PreviewCard({ f }: { f: WorkshopForm }) {
  const cat = CAT[f.cat] || CAT["Skill-share"];
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 22,
        boxShadow: K.shadow,
        display: "grid",
        gridTemplateColumns: "92px 1fr",
        alignItems: "center",
        gap: 20,
        padding: 18,
      }}
    >
      <div
        style={{
          width: 92,
          height: 92,
          borderRadius: 18,
          background: `linear-gradient(135deg,${cat.g[0]},${cat.g[1]})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon name={CAT_ICON[f.cat] || "bulb"} size={36} color="#fff" sw={1.4} />
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <CategoryTag label={f.cat} />
          {f.level && (
            <span style={{ fontSize: 11.5, color: K.faint, fontWeight: 600 }}>
              · {f.level}
            </span>
          )}
        </div>
        <h4
          style={{
            fontFamily: K.serif,
            fontSize: 20,
            fontWeight: 700,
            margin: "0 0 8px",
            color: f.skill ? K.ink : K.faint,
          }}
        >
          {f.skill || "Your workshop title…"}
        </h4>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            color: K.muted,
            fontSize: 13,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Avatar initials="MR" size={22} color={`linear-gradient(135deg,${K.orange},${K.terra})`} />
            You
          </span>
          {f.when && (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="cal" size={14} color={K.faint} />
              {f.when}
            </span>
          )}
          {f.place && (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="pin" size={14} color={K.faint} />
              {f.place}
            </span>
          )}
        </div>
        {f.seats && (
          <div style={{ marginTop: 8, fontSize: 12.5, color: K.muted }}>
            {f.seats} seats available
          </div>
        )}
      </div>
    </div>
  );
}

export function HostWorkshopPage() {
  const navigate = useNavigate();
  const [f, setF] = useState<WorkshopForm>({
    cat: "Skill-share",
    skill: "",
    desc: "",
    when: "",
    place: "",
    seats: "8",
    level: "Beginner",
  });
  const [submitting, setSubmitting] = useState(false);

  const set =
    (k: keyof WorkshopForm) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setF({ ...f, [k]: e.target.value });

  async function handlePost() {
    setSubmitting(true);
    try {
      await createWorkshop({
        skill: f.skill,
        category: f.cat,
        when: f.when,
        place: f.place,
        seats: Number(f.seats),
        level: f.level,
        description: f.desc,
      });
      navigate("/community");
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 36px 64px" }}>
      <span
        onClick={() => navigate("/community")}
        className="klink"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13.5,
          color: K.muted,
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: 18,
        }}
      >
        <Icon name="chevron" size={15} color={K.muted} style={{ transform: "rotate(180deg)" }} />
        Back to community
      </span>

      <h1 style={{ fontFamily: K.serif, fontSize: 38, fontWeight: 700, margin: "0 0 6px" }}>
        Host a workshop
      </h1>
      <p style={{ fontSize: 16, color: K.muted, margin: "0 0 32px", maxWidth: 560 }}>
        Share what you know. Workshops earn you the most karma and connect you with neighbors who care about the same things.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 40, alignItems: "start" }}>
        <div style={{ background: "#fff", borderRadius: 22, padding: "30px 32px", boxShadow: K.shadow }}>
          <Field label="What kind of workshop?">
            <CatPicker value={f.cat} onChange={(c) => setF({ ...f, cat: c })} />
          </Field>

          <Field label="Workshop title" hint="Be specific — neighbors scan fast.">
            <TextInput
              value={f.skill}
              onChange={set("skill")}
              placeholder="e.g. Sourdough basics, Bike tune-up clinic"
            />
          </Field>

          <Field label="What will you cover?">
            <TextArea
              value={f.desc}
              onChange={set("desc")}
              placeholder="Describe what attendees will learn, what to bring, and who it's for."
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Field label="When">
              <TextInput value={f.when} onChange={set("when")} placeholder="Sat · Jun 21 · 10am" />
            </Field>
            <Field label="Where">
              <TextInput value={f.place} onChange={set("place")} placeholder="Tool Library, Elm St. lot…" />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Field label="Seats available">
              <Select value={f.seats} onChange={set("seats")} options={["4", "6", "8", "10", "12", "16", "20"]} />
            </Field>
            <Field label="Skill level">
              <Select value={f.level} onChange={set("level")} options={LEVELS} />
            </Field>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <Button
              variant="primary"
              size="lg"
              icon="check"
              onClick={handlePost}
              style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? "not-allowed" : undefined }}
            >
              {submitting ? "Posting…" : "Post workshop"}
            </Button>
            <Button variant="ghost" size="lg" onClick={() => navigate("/community")}>
              Cancel
            </Button>
          </div>
        </div>

        <div style={{ position: "sticky", top: 92 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: K.faint,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Live preview
          </div>
          <PreviewCard f={f} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 16,
              padding: "14px 16px",
              background: K.leafBg,
              borderRadius: 14,
            }}
          >
            <Icon name="spark" size={18} color={K.leaf} sw={1.8} />
            <span style={{ fontSize: 12.5, color: K.forest, fontWeight: 600, lineHeight: 1.4 }}>
              Teaching a skill earns the most karma on Karma.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
