import { useState } from "react";
import { getFestivalsForYear, FESTIVAL_YEARS, MONTH_IDX, whatsappShare } from "../data";
import { useT } from "../i18n";

/* ============================================================
   CALENDAR PAGE — mahine ka grid view (dates pe click karke
   events dekho) + festival list, dono
   ============================================================ */
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Ravi", "Som", "Mangal", "Budh", "Guru", "Shukra", "Shani"];

// Kis din kaunse festival hain
function festivalsOn(year, monthIdx, day) {
  return getFestivalsForYear(year).filter(
    f => MONTH_IDX[f.month] === monthIdx && Number(f.day) === day
  );
}

export default function CalendarPage() {
  const { t } = useT();
  const today = new Date();
  const currentYear = today.getFullYear();
  const minYear = Math.min(...FESTIVAL_YEARS);
  const maxYear = Math.max(...FESTIVAL_YEARS);

  const startYear = FESTIVAL_YEARS.includes(currentYear) ? currentYear : minYear;
  const [view, setView] = useState("grid"); // grid | list
  const [ym, setYm] = useState({ y: startYear, m: today.getFullYear() === startYear ? today.getMonth() : 0 });
  const [selected, setSelected] = useState(null); // selected day number
  const [listYear, setListYear] = useState(startYear);

  function moveMonth(dir) {
    setSelected(null);
    setYm(({ y, m }) => {
      let ny = y, nm = m + dir;
      if (nm < 0) { nm = 11; ny--; }
      if (nm > 11) { nm = 0; ny++; }
      if (ny < minYear) return { y: minYear, m: 0 };
      if (ny > maxYear) return { y: maxYear, m: 11 };
      return { y: ny, m: nm };
    });
  }

  // Grid ke cells banao
  const firstDay = new Date(ym.y, ym.m, 1).getDay();
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) => d === today.getDate() && ym.m === today.getMonth() && ym.y === today.getFullYear();
  const selectedFests = selected ? festivalsOn(ym.y, ym.m, selected) : [];
  const monthFests = getFestivalsForYear(ym.y).filter(f => MONTH_IDX[f.month] === ym.m);

  const festList = getFestivalsForYear(listYear);

  return (
    <div className="page-section">
      <h2 className="section-heading">{t("h.calendar")}</h2>
      <div className="section-divider" />

      {/* View toggle */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
        <button className={`lang-chip${view === "grid" ? " active" : ""}`} onClick={() => setView("grid")}>📅 Calendar</button>
        <button className={`lang-chip${view === "list" ? " active" : ""}`} onClick={() => setView("list")}>📋 List</button>
      </div>

      {view === "grid" && (
        <>
          {/* Month navigation */}
          <div className="cal-nav">
            <button className="cal-nav-btn" onClick={() => moveMonth(-1)} disabled={ym.y === minYear && ym.m === 0}>‹</button>
            <span className="cal-nav-title">{MONTH_NAMES[ym.m]} {ym.y}</span>
            <button className="cal-nav-btn" onClick={() => moveMonth(1)} disabled={ym.y === maxYear && ym.m === 11}>›</button>
          </div>

          {/* Weekday headers */}
          <div className="cal-grid cal-head-row">
            {DAY_NAMES.map(d => <div key={d} className="cal-head">{d}</div>)}
          </div>

          {/* Days grid */}
          <div className="cal-grid">
            {cells.map((d, i) => {
              if (d === null) return <div key={"b" + i} className="cal-day blank" />;
              const fests = festivalsOn(ym.y, ym.m, d);
              let cls = "cal-day";
              if (isToday(d)) cls += " today";
              if (fests.length) cls += " has-fest";
              if (selected === d) cls += " selected";
              return (
                <button key={d} className={cls} onClick={() => setSelected(selected === d ? null : d)}>
                  <span className="cal-day-num">{d}</span>
                  {fests.length > 0 && <span className="cal-day-emoji">{fests[0].emoji}</span>}
                </button>
              );
            })}
          </div>

          <p style={{ textAlign: "center", fontSize: 12, color: "var(--c-dark)", margin: "10px 0 18px" }}>
            Emoji wali date pe utsav hai — kisi bhi date pe click karke dekho 🌸
          </p>

          {/* Selected date ke events */}
          {selected && (
            <div className="cal-events">
              <p className="cal-events-title">
                📅 {selected} {MONTH_NAMES[ym.m]} {ym.y}
                {isToday(selected) ? " — Aaj" : ""}
              </p>
              {selectedFests.length === 0 ? (
                <p className="cal-no-event">Is din koi bada utsav nahi hai — par bhakti ke liye har din shubh hai! 🌸</p>
              ) : (
                selectedFests.map((f, i) => (
                  <div key={i} className="festival-card" style={{ marginBottom: 10 }}>
                    <div className="festival-date-box" style={{ background: f.color }}>
                      <div className="festival-date-day">{f.day}</div>
                      <div className="festival-date-month">{f.month} '{String(ym.y).slice(2)}</div>
                    </div>
                    <div className="festival-info">
                      <h3>{f.name}</h3>
                      <p>{f.desc}</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <span className="festival-emoji">{f.emoji}</span>
                      <a
                        className="share-btn small"
                        href={whatsappShare(`${f.emoji} ${f.name} — ${f.day} ${f.month} ${ym.y}\n${f.desc}\n\n🌸 Jai Shri Radhe 🌸`)}
                        target="_blank" rel="noreferrer"
                      >Share</a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Is mahine ke utsav (jab koi date select nahi hai) */}
          {!selected && monthFests.length > 0 && (
            <div className="cal-events">
              <p className="cal-events-title">✨ {MONTH_NAMES[ym.m]} {ym.y} ke utsav:</p>
              {monthFests.map((f, i) => (
                <button key={i} className="cal-month-fest" onClick={() => setSelected(Number(f.day))}>
                  <span>{f.emoji} <b>{f.day} {f.month}</b> — {f.name}</span>
                  <span>›</span>
                </button>
              ))}
            </div>
          )}
          {!selected && monthFests.length === 0 && (
            <p className="cal-no-event" style={{ textAlign: "center" }}>Is mahine koi bada utsav nahi hai 🌸</p>
          )}
        </>
      )}

      {view === "list" && (
        <>
          {/* Year selector */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 24 }}>
            {FESTIVAL_YEARS.map(y => (
              <button key={y} onClick={() => setListYear(y)} style={{
                background: listYear === y ? "var(--c-deep)" : "var(--c-bg)",
                color: listYear === y ? "var(--c-soft)" : "var(--c-dark)",
                border: "0.5px solid var(--c-border)",
                borderRadius: 20,
                padding: "8px 22px",
                fontSize: 14,
                fontFamily: "Georgia, serif",
                cursor: "pointer",
                fontWeight: listYear === y ? 500 : 400,
              }}>
                {y} {y === currentYear ? "✦" : ""}
              </button>
            ))}
          </div>

          <div style={{ textAlign: "center", marginBottom: 20, fontSize: 13, color: "#3B6D11", background: "#EAF3DE", borderRadius: 10, padding: "8px 16px", display: "inline-block", width: "100%" }}>
            🗓️ Aaj: {today.toLocaleDateString("hi-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>

          <div className="festival-list">
            {festList.map((f, i) => (
              <div key={i} className="festival-card">
                <div className="festival-date-box" style={{ background: f.color }}>
                  <div className="festival-date-day">{f.day}</div>
                  <div className="festival-date-month">{f.month} '{String(listYear).slice(2)}</div>
                </div>
                <div className="festival-info">
                  <h3>{f.name}</h3>
                  <p>{f.desc}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <span className="festival-emoji">{f.emoji}</span>
                  <a
                    className="share-btn small"
                    href={whatsappShare(`${f.emoji} ${f.name} — ${f.day} ${f.month} ${listYear}\n${f.desc}\n\n🌸 Jai Shri Radhe 🌸`)}
                    target="_blank" rel="noreferrer"
                  >Share</a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ background: "#EAF3DE", border: "0.5px solid #97C459", borderRadius: 12, padding: "14px 20px", marginTop: 24, textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "#3B6D11", lineHeight: 1.7 }}>
          🌿 Dates Hindu Panchang ke anusaar hain.<br />
          Sthaneey pandit ya panchang se confirm zaroor karein.
        </p>
      </div>
    </div>
  );
}
