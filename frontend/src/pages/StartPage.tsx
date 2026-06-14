import type { ChangeEvent, ReactNode } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "../components/ui/Avatar";
import { KarmaBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Select, TextArea, TextInput } from "../components/ui/formControls";
import { CategoryTag } from "../components/ui/Tag";
import { Progress } from "../components/ui/Progress";
import { Icon, type IconName } from "../lib/icons";
import { CAT, K, type CategoryName } from "../lib/karma";
import { createProject, type ProjectCreateDTO } from "../lib/api";

const CATS: CategoryName[] = ["Garden", "Cleanup", "Repair", "Skill-share", "Mutual aid"];
const CAT_ICON: Record<CategoryName, IconName> = {
  Garden: "sprout",
  Cleanup: "trend",
  Repair: "wrench",
  "Skill-share": "bulb",
  "Mutual aid": "heart",
};

interface ProjectForm {
  cat: CategoryName;
  title: string;
  desc: string;
  when: string;
  place: string;
  cap: string;
  karma: string;
}

function Label({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 13, fontWeight: 700, color: K.text, marginBottom: 8 }}>{children}</div>;
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

function PreviewCard({ f }: { f: ProjectForm }) {
  const cat = CAT[f.cat] || CAT.Garden;
  return (
    <div style={{ background: "#fff", borderRadius: 22, overflow: "hidden", boxShadow: K.shadow }}>
      <div style={{ height: 140, background: `linear-gradient(135deg, ${cat.g[0]}, ${cat.g[1]})`, position: "relative" }}>
        <Icon name={CAT_ICON[f.cat] || "sprout"} size={46} color="#fff" sw={1.3} style={{ position: "absolute", inset: 0, margin: "auto", opacity: 0.4 }} />
        <span style={{ position: "absolute", left: 14, top: 14 }}>
          <CategoryTag label={f.cat} />
        </span>
        {f.karma && (
          <span style={{ position: "absolute", right: 14, top: 14 }}>
            <KarmaBadge points={Number(f.karma)} />
          </span>
        )}
      </div>
      <div style={{ padding: "16px 18px 18px" }}>
        <h4 style={{ fontFamily: K.serif, fontSize: 19, fontWeight: 700, margin: "0 0 10px", lineHeight: 1.2, color: f.title ? K.ink : K.faint }}>
          {f.title || "Your project title…"}
        </h4>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Avatar initials="MR" size={24} color={`linear-gradient(135deg,${K.orange},${K.terra})`} />
          <span style={{ fontSize: 12.5, color: K.muted }}>You · Maplewood {f.when ? "· " + f.when : ""}</span>
        </div>
        <Progress pct={0} />
        <div style={{ fontSize: 12, color: K.faint, marginTop: 6 }}>0 of {f.cap || "—"} neighbors joined</div>
      </div>
    </div>
  );
}

export function StartPage() {
  const navigate = useNavigate();
  const [f, setF] = useState<ProjectForm>({ cat: "Garden", title: "", desc: "", when: "", place: "", cap: "8", karma: "25" });
  const set = (k: keyof ProjectForm) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePost() {
    if (!f.title.trim() || !f.place.trim() || !f.when) {
      setError("Please add a title, location, and time before posting.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const body: ProjectCreateDTO = {
        cat: f.cat,
        title: f.title.trim(),
        desc: f.desc.trim() || null,
        when: new Date(f.when).toISOString(),
        place: f.place.trim(),
        cap: Number(f.cap),
        karma: Number(f.karma),
      };
      await createProject(body);
      navigate("/");
    } catch {
      setError("Couldn't post this project. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 36px 64px" }}>
      <span
        onClick={() => navigate("/")}
        className="klink"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, color: K.muted, fontWeight: 600, cursor: "pointer", marginBottom: 18 }}
      >
        <Icon name="chevron" size={15} color={K.muted} style={{ transform: "rotate(180deg)" }} />
        Back to projects
      </span>
      <h1 style={{ fontFamily: K.serif, fontSize: 38, fontWeight: 700, margin: "0 0 6px" }}>Start a project</h1>
      <p style={{ fontSize: 16, color: K.muted, margin: "0 0 32px", maxWidth: 560 }}>Rally a few neighbors around something small. It only takes a minute to post.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 40, alignItems: "start" }}>
        <div style={{ background: "#fff", borderRadius: 22, padding: "30px 32px", boxShadow: K.shadow }}>
          <Field label="What kind of project?">
            <CatPicker value={f.cat} onChange={(c) => setF({ ...f, cat: c })} />
          </Field>
          <Field label="Title" hint="Keep it plain and specific — neighbors scan fast.">
            <TextInput value={f.title} onChange={set("title")} placeholder="e.g. Build raised beds at the Elm St. lot" />
          </Field>
          <Field label="What needs doing?">
            <TextArea value={f.desc} onChange={set("desc")} placeholder="A sentence or two on the task, what to bring, and who it helps." />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Field label="When">
              <TextInput type="datetime-local" value={f.when} onChange={set("when")} />
            </Field>
            <Field label="Where">
              <TextInput value={f.place} onChange={set("place")} placeholder="Elm St. lot" />
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Field label="Neighbors needed">
              <Select value={f.cap} onChange={set("cap")} options={["4", "6", "8", "10", "12", "20"]} />
            </Field>
            <Field label="Karma reward" hint="Higher effort, higher reward.">
              <Select value={f.karma} onChange={set("karma")} options={["10", "15", "20", "25", "30", "40"]} />
            </Field>
          </div>
          {error && <div style={{ fontSize: 13, color: K.terra, fontWeight: 600, marginBottom: 12 }}>{error}</div>}
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <Button variant="primary" size="lg" icon="check" onClick={handlePost} disabled={submitting}>
              {submitting ? "Posting…" : "Post project"}
            </Button>
            <Button variant="ghost" size="lg" onClick={() => navigate("/")}>
              Save draft
            </Button>
          </div>
        </div>

        <div style={{ position: "sticky", top: 92 }}>
          <div style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: K.faint, fontWeight: 700, marginBottom: 12 }}>Live preview</div>
          <PreviewCard f={f} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, padding: "14px 16px", background: K.leafBg, borderRadius: 14 }}>
            <Icon name="spark" size={18} color={K.leaf} sw={1.8} />
            <span style={{ fontSize: 12.5, color: K.forest, fontWeight: 600, lineHeight: 1.4 }}>Projects with a clear title fill up 2× faster.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
