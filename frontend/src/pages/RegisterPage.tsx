import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../lib/icons";
import { K } from "../lib/karma";
import { TextInput } from "../components/ui/formControls";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg.includes("409") ? "Email already registered." : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: K.paper, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 400, background: "#fff", borderRadius: 20, padding: "40px 36px", boxShadow: K.shadow }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 34, height: 34, borderRadius: 11, background: `linear-gradient(135deg,${K.orange},${K.gold})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="mark" size={19} color="#fff" sw={1.6} />
          </div>
          <span style={{ fontFamily: K.serif, fontSize: 22, fontWeight: 700, color: K.ink }}>Karma</span>
        </div>

        <h1 style={{ fontFamily: K.serif, fontSize: 24, fontWeight: 700, color: K.ink, margin: "0 0 6px" }}>Create account</h1>
        <p style={{ fontFamily: K.sans, fontSize: 14, color: K.muted, margin: "0 0 24px" }}>Join your neighborhood community</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <TextInput
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
          <TextInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <TextInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={6}
          />
          {error && <p style={{ fontFamily: K.sans, fontSize: 13, color: K.terra, margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              padding: "13px",
              background: loading ? K.muted : K.orange,
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontFamily: K.sans,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p style={{ fontFamily: K.sans, fontSize: 13.5, color: K.muted, textAlign: "center", marginTop: 20 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: K.orange, fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
