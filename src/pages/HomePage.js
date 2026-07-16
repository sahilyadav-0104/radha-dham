import { getNextFestival, getQuoteOfTheDay, whatsappShare } from "../data";

/* ============================================================
   HOME PAGE — features + festival countdown + aaj ka doha
   ============================================================ */
const FEATURES = [
  { title: "Photo Gallery", color: { bg: "#F4C0D1", text: "#72243E", tag: "#FBEAF0", tagText: "#993556" }, nav: "Gallery", icon: "🖼️", desc: "Radha Rani ki divya photos" },
  { title: "Bhajan Player", color: { bg: "#FAC775", text: "#412402", tag: "#FAEEDA", tagText: "#633806" }, nav: "Bhajans", icon: "🎵", desc: "Suniye aur bhakti mein doob jaiye" },
  { title: "Leelas & Quotes", color: { bg: "#CECBF6", text: "#26215C", tag: "#EEEDFE", tagText: "#3C3489" }, nav: "Leelas", icon: "📖", desc: "Puri kahaniyan aur dohe" },
  { title: "Festival Calendar", color: { bg: "#C0DD97", text: "#173404", tag: "#EAF3DE", tagText: "#27500A" }, nav: "Calendar", icon: "📅", desc: "Har saal ka panchang" },
  { title: "Japa Counter", color: { bg: "#ED93B1", text: "#72243E", tag: "#FBEAF0", tagText: "#993556" }, nav: "Counter", icon: "📿", desc: "Naam jaap ginein — roz, mahina, saal" },
  { title: "Bhakto ke Anubhav", color: { bg: "#9FE1CB", text: "#04342C", tag: "#E1F5EE", tagText: "#085041" }, nav: "Contact", icon: "💬", desc: "Apna anubhav share karein" },
  { title: "Smart Search", color: { bg: "#B5D4F4", text: "#042C53", tag: "#E6F1FB", tagText: "#0C447C" }, nav: "Contact", icon: "🔍", desc: "Bhajan ya Leela dhundho" },
];

export default function HomePage({ onNavigate }) {
  const nextFest = getNextFestival();
  const doha = getQuoteOfTheDay();

  return (
    <div className="page-section">
      <h2 className="section-heading">🌸 Radha Rani Devotional Portal</h2>
      <div className="section-divider" />

      {/* Festival countdown banner */}
      {nextFest && (
        <div className="countdown-banner" onClick={() => onNavigate("Calendar")}>
          <span className="countdown-emoji">{nextFest.emoji}</span>
          <div className="countdown-info">
            <p className="countdown-title">
              {nextFest.name} — {nextFest.day} {nextFest.month} {nextFest.year}
            </p>
            <p className="countdown-days">
              {nextFest.daysLeft === 0 ? "🎉 Aaj hi hai! Jai Shri Radhe!" : `${nextFest.daysLeft} din baaki hain`}
            </p>
          </div>
          <a
            className="share-btn"
            href={whatsappShare(`${nextFest.emoji} ${nextFest.name} — ${nextFest.day} ${nextFest.month} ${nextFest.year}${nextFest.daysLeft > 0 ? ` (${nextFest.daysLeft} din baaki!)` : " (Aaj hi hai!)"}\n${nextFest.desc}\n\n🌸 Jai Shri Radhe 🌸`)}
            target="_blank" rel="noreferrer"
            onClick={e => e.stopPropagation()}
          >Share ↗</a>
        </div>
      )}

      {/* Aaj ka Doha */}
      <div className="daily-doha">
        <p className="daily-doha-label">🪔 Aaj ka Doha</p>
        <p className="daily-doha-text">"{doha.text}"</p>
        <p className="daily-doha-source">{doha.source}</p>
        <a
          className="share-btn"
          href={whatsappShare(`🪔 Aaj ka Doha:\n\n"${doha.text}"\n${doha.source}\n\n🌸 Jai Shri Radhe 🌸`)}
          target="_blank" rel="noreferrer"
        >WhatsApp par share karein ↗</a>
      </div>

      <div className="features-grid">
        {FEATURES.map(f => (
          <div
            key={f.title}
            className="feature-card"
            style={{ "--bg": f.color.bg, "--text": f.color.text, "--tag": f.color.tag, "--tagText": f.color.tagText }}
            onClick={() => onNavigate(f.nav)}
          >
            <div className="feature-card-header"><span>{f.title}</span></div>
            <div className="feature-card-body">
              <div style={{ fontSize: 36, margin: "8px 0" }}>{f.icon}</div>
              <p>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: "#FBEAF0", border: "0.5px solid #ED93B1", borderRadius: 14, padding: "24px", textAlign: "center", marginTop: 36 }}>
        <p style={{ fontSize: 22, color: "#72243E", fontWeight: 500, marginBottom: 10 }}>🌸 Jai Shri Radhe 🌸</p>
        <p style={{ fontSize: 14, color: "#993556", lineHeight: 1.9 }}>
          Radha Rani ki kripa sabhi bhakton par bani rahe.<br />
          Vrindavan ki divya bhumi ko pranam.<br />
          <em>Prem ka dusra naam Radha hai — Radha ka dusra naam prem hai.</em>
        </p>
      </div>
    </div>
  );
}
