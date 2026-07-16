import { useState } from "react";
import { getFestivalsForYear, FESTIVAL_YEARS, whatsappShare } from "../data";

/* ============================================================
   CALENDAR PAGE — data ek jagah se aata hai (data.js)
   ============================================================ */
export default function CalendarPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(FESTIVAL_YEARS.includes(currentYear) ? currentYear : FESTIVAL_YEARS[0]);
  const festList = getFestivalsForYear(year);
  const today = new Date();

  return (
    <div className="page-section">
      <h2 className="section-heading">Festival Calendar</h2>
      <div className="section-divider" />

      {/* Year selector */}
      <div style={{ display:"flex", justifyContent:"center", gap:10, marginBottom:24 }}>
        {FESTIVAL_YEARS.map(y => (
          <button key={y} onClick={() => setYear(y)} style={{
            background: year===y ? "#72243E" : "#FBEAF0",
            color: year===y ? "#F4C0D1" : "#993556",
            border: "0.5px solid #ED93B1",
            borderRadius: 20,
            padding: "8px 22px",
            fontSize: 14,
            fontFamily: "Georgia, serif",
            cursor: "pointer",
            fontWeight: year===y ? 500 : 400,
          }}>
            {y} {y===currentYear ? "✦" : ""}
          </button>
        ))}
      </div>

      <div style={{ textAlign:"center", marginBottom:20, fontSize:13, color:"#3B6D11", background:"#EAF3DE", borderRadius:10, padding:"8px 16px", display:"inline-block", width:"100%" }}>
        🗓️ Aaj: {today.toLocaleDateString("hi-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
      </div>

      <div className="festival-list">
        {festList.map((f, i) => (
          <div key={i} className="festival-card">
            <div className="festival-date-box" style={{ background: f.color }}>
              <div className="festival-date-day">{f.day}</div>
              <div className="festival-date-month">{f.month} '{String(year).slice(2)}</div>
            </div>
            <div className="festival-info">
              <h3>{f.name}</h3>
              <p>{f.desc}</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
              <span className="festival-emoji">{f.emoji}</span>
              <a
                className="share-btn small"
                href={whatsappShare(`${f.emoji} ${f.name} — ${f.day} ${f.month} ${year}\n${f.desc}\n\n🌸 Jai Shri Radhe 🌸`)}
                target="_blank" rel="noreferrer"
              >Share</a>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background:"#EAF3DE", border:"0.5px solid #97C459", borderRadius:12, padding:"14px 20px", marginTop:24, textAlign:"center" }}>
        <p style={{ fontSize:13, color:"#3B6D11", lineHeight:1.7 }}>
          🌿 Dates Hindu Panchang ke anusaar hain.<br/>
          Sthaneey pandit ya panchang se confirm zaroor karein.
        </p>
      </div>
    </div>
  );
}
