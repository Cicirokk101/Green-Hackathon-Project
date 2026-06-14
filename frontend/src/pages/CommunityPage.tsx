import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Eyebrow } from "../components/ui/Eyebrow";
import { Hero } from "../components/layout/Hero";
import { Icon, type IconName } from "../lib/icons";
import { CAT, K, type CategoryName } from "../lib/karma";
import { reserveSeat, cancelReservation, joinWaitlist } from "../lib/api";

interface Workshop {
  id: string;
  skill: string;
  cat: CategoryName;
  host: string;
  hostName: string;
  when: string;
  place: string;
  seats: number;
  taken: number;
  level: string;
  icon: IconName;
}

const WORKSHOPS: Workshop[] = [
  {
    id: "workshop-1",
    skill: "Sourdough basics",
    cat: "Skill-share",
    host: "RW",
    hostName: "Rosa W.",
    when: "Thu · Jun 19 · 6pm",
    place: "Maple Kitchen Co-op",
    seats: 8,
    taken: 5,
    level: "Beginner",
    icon: "spark",
  },
  {
    id: "workshop-2",
    skill: "Bike tune-up clinic",
    cat: "Repair",
    host: "SM",
    hostName: "Sam M.",
    when: "Sat · Jun 21 · 10am",
    place: "Tool Library",
    seats: 12,
    taken: 9,
    level: "All levels",
    icon: "wrench",
  },
  {
    id: "workshop-3",
    skill: "Container gardening",
    cat: "Garden",
    host: "DA",
    hostName: "Dana A.",
    when: "Sun · Jun 22 · 11am",
    place: "Elm St. lot",
    seats: 10,
    taken: 4,
    level: "Beginner",
    icon: "sprout",
  },
  {
    id: "workshop-4",
    skill: "Intro to woodworking",
    cat: "Skill-share",
    host: "JK",
    hostName: "Jordan K.",
    when: "Wed · Jun 25 · 7pm",
    place: "Community Workshop",
    seats: 6,
    taken: 6,
    level: "Beginner",
    icon: "bulb",
  },
];

const TABS = ["Upcoming", "Hosting", "Attending", "Past"];
const REQUESTED_SKILLS = [
  "Furniture repair",
  "Canning & preserving",
  "Basic electrical",
  "Resume help",
];
const REQUEST_COUNTS = [14, 11, 9, 7];

type ReservationState =
  | "idle"
  | "loading"
  | "reserved"
  | "waitlisted"
  | "error";

export function CommunityPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("Upcoming");
  // optimistic seat counts: workshopId → taken count
  const [takenMap, setTakenMap] = useState<Record<string, number>>({});
  // per-workshop button state
  const [reservationState, setReservationState] = useState<
    Record<string, ReservationState>
  >({});

  async function handleReserve(w: Workshop) {
    const current = reservationState[w.id];
    const taken = takenMap[w.id] ?? w.taken;
    const full = taken >= w.seats;

    // cancel if already reserved
    if (current === "reserved") {
      setReservationState((s) => ({ ...s, [w.id]: "loading" }));
      try {
        await cancelReservation(w.id);
        setTakenMap((m) => ({ ...m, [w.id]: taken - 1 }));
        setReservationState((s) => ({ ...s, [w.id]: "idle" }));
      } catch {
        setReservationState((s) => ({ ...s, [w.id]: "error" }));
      }
      return;
    }

    setReservationState((s) => ({ ...s, [w.id]: "loading" }));
    try {
      if (full) {
        await joinWaitlist(w.id);
        setReservationState((s) => ({ ...s, [w.id]: "waitlisted" }));
      } else {
        await reserveSeat(w.id);
        setTakenMap((m) => ({ ...m, [w.id]: taken + 1 }));
        setReservationState((s) => ({ ...s, [w.id]: "reserved" }));
      }
    } catch {
      setReservationState((s) => ({ ...s, [w.id]: "error" }));
    }
  }

  return (
    <div>
      <Hero
        eyebrow="Community · Maplewood"
        title="Learn something. Teach something."
        sub="Neighbors are sharing what they know — workshops, clinics, and hands-on skill-shares this month."
        action={
          <div
            className="kbtn"
            onClick={() => navigate("/start")}
            style={{
              position: "relative",
              background: "#fff",
              color: K.ink,
              borderRadius: 16,
              padding: "8px 22px",
              fontWeight: 700,
              fontSize: 14.5,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
              cursor: "pointer",
            }}>
            <Icon name="plus" size={16} color={K.orange} sw={2.4} />
            Host a workshop
          </div>
        }
      />

      {/* tabs */}
      <div
        style={{
          display: "flex",
          gap: 26,
          padding: "24px 36px 0",
          borderBottom: `1px solid ${K.border}`,
          margin: "20px 36px 0",
        }}>
        {TABS.map((t) => (
          <span
            key={t}
            className="ktab"
            onClick={() => setTab(t)}
            style={{
              paddingBottom: 12,
              fontSize: 14.5,
              fontWeight: 700,
              cursor: "pointer",
              color: t === tab ? K.ink : K.faint,
              borderBottom:
                t === tab
                  ? `2.5px solid ${K.orange}`
                  : "2.5px solid transparent",
            }}>
            {t}
          </span>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 28,
          padding: "24px 36px 44px",
          alignItems: "start",
        }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {WORKSHOPS.map((w, i) => {
            const cat = CAT[w.cat];
            const taken = takenMap[w.id] ?? w.taken;
            const full = taken >= w.seats;
            const rState = reservationState[w.id] ?? "idle";
            const isLoading = rState === "loading";
            const isReserved = rState === "reserved";
            const isWaitlisted = rState === "waitlisted";
            const isError = rState === "error";
            return (
              <div
                key={i}
                className="kcard"
                style={{
                  background: "#fff",
                  borderRadius: 22,
                  boxShadow: K.shadow,
                  display: "grid",
                  gridTemplateColumns: "92px 1fr auto",
                  alignItems: "center",
                  gap: 20,
                  padding: 18,
                }}>
                <div
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: 18,
                    background: `linear-gradient(135deg,${cat.g[0]},${cat.g[1]})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <Icon name={w.icon} size={36} color="#fff" sw={1.4} />
                </div>
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 4,
                    }}>
                    <Eyebrow color={cat.fg}>{w.cat}</Eyebrow>
                    <span
                      style={{
                        fontSize: 11.5,
                        color: K.faint,
                        fontWeight: 600,
                      }}>
                      · {w.level}
                    </span>
                  </div>
                  <h4
                    style={{
                      fontFamily: K.serif,
                      fontSize: 22,
                      fontWeight: 700,
                      margin: "0 0 8px",
                    }}>
                    {w.skill}
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      flexWrap: "wrap",
                      color: K.muted,
                      fontSize: 13,
                    }}>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <Avatar initials={w.host} size={22} />
                      {w.hostName}
                    </span>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="cal" size={14} color={K.faint} />
                      {w.when}
                    </span>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="pin" size={14} color={K.faint} />
                      {w.place}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 10,
                  }}>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: isReserved
                        ? K.leaf
                        : isWaitlisted
                          ? K.gold
                          : full
                            ? K.terra
                            : K.muted,
                      fontWeight: 700,
                    }}>
                    {isReserved
                      ? "You're in!"
                      : isWaitlisted
                        ? "On waitlist"
                        : isError
                          ? "Something went wrong"
                          : full
                            ? "Waitlist only"
                            : `${w.seats - taken} seats left`}
                  </div>
                  <Button
                    variant={
                      isReserved
                        ? "ghost"
                        : isWaitlisted
                          ? "ghost"
                          : full
                            ? "ghost"
                            : "primary"
                    }
                    onClick={() => !isLoading && handleReserve(w)}
                    style={{
                      cursor: isLoading || isWaitlisted ? "not-allowed" : undefined,
                      opacity: isLoading || isWaitlisted ? 0.55 : undefined,
                    }}>
                    {isLoading
                      ? "..."
                      : isReserved
                        ? "Leave a seat"
                        : isWaitlisted
                          ? "On waitlist"
                          : full
                            ? "Join waitlist"
                            : "Reserve a seat"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* sidebar */}

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 22,
              padding: 22,
              boxShadow: K.shadow,
            }}>
            <div
              style={{
                fontSize: 12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: K.faint,
                fontWeight: 700,
                marginBottom: 14,
              }}>
              Most-requested skills
            </div>
            {REQUESTED_SKILLS.map((s, i) => (
              <div
                key={s}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderTop: i ? `1px solid ${K.border}` : "none",
                }}>
                <span
                  style={{ fontSize: 13.5, color: K.text, fontWeight: 600 }}>
                  {s}
                </span>
                <span style={{ fontSize: 12, color: K.faint }}>
                  {REQUEST_COUNTS[i]} want this
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              background: `linear-gradient(150deg,${K.leaf},#2F6B45)`,
              borderRadius: 22,
              padding: 24,
              color: "#fff",
            }}>
            <Icon name="spark" size={26} color={K.gold} sw={1.8} />
            <h4
              style={{
                fontFamily: K.serif,
                fontSize: 21,
                fontWeight: 700,
                margin: "12px 0 6px",
              }}>
              Know how to do something?
            </h4>
            <p
              style={{
                fontSize: 13.5,
                opacity: 0.92,
                margin: "0 0 16px",
                lineHeight: 1.5,
              }}>
              Teaching a skill earns you the most karma on Karma — and three
              neighbors who owe you one.
            </p>
            <Button variant="soft" onClick={() => navigate("/start")}>
              Host a workshop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
