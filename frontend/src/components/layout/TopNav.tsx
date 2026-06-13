import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "../../lib/icons";
import { K } from "../../lib/karma";
import { Avatar } from "../ui/Avatar";

const NAV = [
  { label: "Projects", to: "/" },
  { label: "Community", to: "/community" },
  { label: "Resources", to: "/resources" },
  { label: "Profile", to: "/profile" },
];

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 36px",
        background: "#fff",
        boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 11,
              background: `linear-gradient(135deg,${K.orange},${K.gold})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 3px 8px rgba(242,106,33,0.35)",
            }}
          >
            <Icon name="mark" size={19} color="#fff" sw={1.6} />
          </div>
          <span style={{ fontFamily: K.serif, fontSize: 22, fontWeight: 700, color: K.ink }}>Karma</span>
        </Link>
        <div style={{ display: "flex", gap: 6, fontSize: 14, fontWeight: 600 }}>
          {NAV.map((n) => {
            const active = location.pathname === n.to;
            return (
              <Link
                key={n.label}
                to={n.to}
                className="knav"
                style={
                  active
                    ? { color: "#fff", background: K.orange, padding: "8px 16px", borderRadius: 999, textDecoration: "none" }
                    : { color: K.muted, padding: "8px 16px", borderRadius: 999, textDecoration: "none" }
                }
              >
                {n.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, background: K.orangeBg, borderRadius: 999, padding: "8px 15px" }}>
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: K.gold,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="clock" size={11} color="#fff" sw={2} />
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: K.orangeDeep }}>1,240</span>
        </div>
        <button
          className="kbtn"
          onClick={() => navigate("/start")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: K.ink,
            color: "#fff",
            border: "none",
            borderRadius: 999,
            padding: "9px 17px",
            fontFamily: K.sans,
            fontSize: 13.5,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <Icon name="plus" size={15} sw={2.4} />
          Start a project
        </button>
        <Link to="/profile">
          <Avatar initials="MR" size={36} color={`linear-gradient(135deg,${K.orange},${K.terra})`} />
        </Link>
      </div>
    </div>
  );
}
