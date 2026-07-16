import "./App.css";
import { useState, useEffect } from "react";
import { DARSHAN_IMAGES, NAV_LINKS } from "./data";
import { THEMES } from "./themes";
import { LANGS, STRINGS, LangContext } from "./i18n";
import HomePage from "./pages/HomePage";
import GalleryPage from "./pages/GalleryPage";
import BhajansPage from "./pages/BhajansPage";
import LeelasPage from "./pages/LeelasPage";
import CalendarPage from "./pages/CalendarPage";
import CounterPage from "./pages/CounterPage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";

/* ============================================================
   HERO SVG
   ============================================================ */
function HeroBgSvg() {
  return (
    <svg className="hero-bg-svg" viewBox="0 0 1000 420" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="500" cy="230" rx="340" ry="200" fill="#D4537E" />
      <ellipse cx="500" cy="230" rx="240" ry="150" fill="#ED93B1" />
      <ellipse cx="500" cy="310" rx="120" ry="90" fill="#D4537E" />
      <ellipse cx="500" cy="270" rx="70" ry="100" fill="#993556" />
      <ellipse cx="360" cy="230" rx="80" ry="40" fill="#F4C0D1" transform="rotate(-20 360 230)" />
      <ellipse cx="310" cy="260" rx="60" ry="28" fill="#ED93B1" transform="rotate(-30 310 260)" />
      <ellipse cx="640" cy="230" rx="80" ry="40" fill="#F4C0D1" transform="rotate(20 640 230)" />
      <ellipse cx="690" cy="260" rx="60" ry="28" fill="#ED93B1" transform="rotate(30 690 260)" />
      <ellipse cx="500" cy="155" rx="45" ry="52" fill="#993556" />
      <ellipse cx="500" cy="108" rx="38" ry="18" fill="#BA7517" />
      <rect x="482" y="88" width="10" height="22" rx="5" fill="#854F0B" />
      <rect x="496" y="82" width="10" height="28" rx="5" fill="#BA7517" />
      <rect x="510" y="88" width="10" height="22" rx="5" fill="#854F0B" />
      <circle cx="487" cy="90" r="4" fill="#E24B4A" />
      <circle cx="501" cy="84" r="4" fill="#EF9F27" />
      <circle cx="515" cy="90" r="4" fill="#E24B4A" />
      <rect x="360" y="228" width="280" height="7" rx="3.5" fill="#BA7517" />
      {[0,1,2,3,4,5,6,7].map(i => <circle key={i} cx={378 + i * 32} cy="231" r="5" fill="#854F0B" />)}
      <ellipse cx="390" cy="235" rx="16" ry="10" fill="#993556" />
      <ellipse cx="610" cy="235" rx="16" ry="10" fill="#993556" />
      {[-120,-60,0,60,120].map((x,i) => (
        <g key={i}>
          <ellipse cx={500+x} cy="390" rx="22" ry="8" fill="#ED93B1" opacity="0.7" />
          <ellipse cx={500+x} cy="385" rx="14" ry="12" fill="#F4C0D1" opacity="0.8" />
          <ellipse cx={500+x} cy="383" rx="7" ry="7" fill="#D4537E" opacity="0.9" />
        </g>
      ))}
      <ellipse cx="500" cy="75" rx="6" ry="18" fill="#1D9E75" opacity="0.8" />
      <ellipse cx="490" cy="78" rx="5" ry="15" fill="#1D9E75" opacity="0.6" transform="rotate(-15 490 90)" />
      <ellipse cx="510" cy="78" rx="5" ry="15" fill="#1D9E75" opacity="0.6" transform="rotate(15 510 90)" />
      <circle cx="500" cy="58" r="5" fill="#185FA5" opacity="0.8" />
      {[[200,100],[750,120],[150,320],[820,300],[280,60],[700,70],[100,200],[880,180]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="5" fill="#FAC775" opacity="0.6" />
      ))}
    </svg>
  );
}

/* ============================================================
   MAIN APP
   ============================================================ */
export default function App() {
  const [activeNav, setActiveNav] = useState("Home");
  const [darshan, setDarshan] = useState(null); // current darshan image index
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(window.location.hash === "#admin");
  const [theme, setTheme] = useState(() => localStorage.getItem("radhaDhamTheme") || "gulabi");
  const [lang, setLang] = useState(() => localStorage.getItem("radhaDhamLang") || "hinglish");

  // Theme ke colors CSS variables me apply karo
  useEffect(() => {
    const th = THEMES.find(x => x.id === theme) || THEMES[0];
    for (const [k, v] of Object.entries(th.vars)) {
      document.documentElement.style.setProperty(k, v);
    }
    localStorage.setItem("radhaDhamTheme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("radhaDhamLang", lang);
  }, [lang]);

  // #admin hash se admin panel khulta hai (nav me nahi dikhta)
  useEffect(() => {
    const onHash = () => setIsAdmin(window.location.hash === "#admin");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const t = (key) => (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.hinglish[key] || key;

  function openDarshan() {
    // har baar jab darshan kholein, ek random image (jo pichli baar dikhi usse alag)
    let idx = Math.floor(Math.random() * DARSHAN_IMAGES.length);
    if (darshan !== null && DARSHAN_IMAGES.length > 1) {
      while (idx === darshan) {
        idx = Math.floor(Math.random() * DARSHAN_IMAGES.length);
      }
    }
    setDarshan(idx);
  }

  function renderPage() {
    if (isAdmin) return <AdminPage />;
    switch (activeNav) {
      case "Home":     return <HomePage onNavigate={setActiveNav} />;
      case "Gallery":  return <GalleryPage />;
      case "Bhajans":  return <BhajansPage />;
      case "Leelas":   return <LeelasPage />;
      case "Calendar": return <CalendarPage />;
      case "Counter":  return <CounterPage />;
      case "Contact":  return <ContactPage />;
      default:         return <HomePage onNavigate={setActiveNav} />;
    }
  }

  return (
    <LangContext.Provider value={{ lang, t }}>
    <div style={{ fontFamily:"Georgia, serif", background:"var(--c-page)", minHeight:"100vh" }}>
      <div className="browser-bar">
        <div className="browser-dots" onClick={() => setSettingsOpen(o => !o)} title="Settings — rang aur bhasha badlein">
          {["#E24B4A","#EF9F27","#639922"].map((c,i) => <div key={i} className="browser-dot" style={{ background:c }} />)}
        </div>
        <div className="browser-url">radharani.devotional.in</div>
      </div>

      {/* SETTINGS PANEL — 3 dots pe click se khulta hai */}
      {settingsOpen && (
        <>
          <div className="settings-overlay" onClick={() => setSettingsOpen(false)} />
          <div className="settings-panel">
            <p className="settings-title">🎨 {t("set.theme")}</p>
            <div className="theme-swatches">
              {THEMES.map(th => (
                <button
                  key={th.id}
                  className={`theme-swatch${theme === th.id ? " active" : ""}`}
                  style={{ background: th.vars["--c-primary"] }}
                  title={`${th.emoji} ${th.name}`}
                  onClick={() => setTheme(th.id)}
                >{theme === th.id ? "✓" : ""}</button>
              ))}
            </div>
            <p className="settings-theme-name">
              {(THEMES.find(x => x.id === theme) || THEMES[0]).emoji}{" "}
              {(THEMES.find(x => x.id === theme) || THEMES[0]).name}
            </p>
            <p className="settings-title">🌐 {t("set.lang")}</p>
            <div className="lang-list">
              {LANGS.map(l => (
                <button
                  key={l.id}
                  className={`lang-chip${lang === l.id ? " active" : ""}`}
                  onClick={() => setLang(l.id)}
                >{l.native}</button>
              ))}
            </div>
          </div>
        </>
      )}
      <div className="hero">
        <HeroBgSvg />
        <div className="hero-content">
          <div className="lotus-wrap">
            <div className="lotus-circle" style={{ width:180, height:180, background:"var(--c-soft)", opacity:0.35 }} />
            <div className="lotus-circle" style={{ width:130, height:130, background:"var(--c-border)", opacity:0.3 }} />
            <div className="lotus-circle" style={{ width:85, height:85, background:"var(--c-primary)", opacity:0.2 }} />
            <div className="lotus-flute" />
            {[0,1,2,3,4,5,6].map(i => <div key={i} className="lotus-hole" style={{ left:`calc(18% + ${i*10}%)` }} />)}
            {[-20,0,20].map((rot,i) => <div key={i} className="lotus-petal" style={{ background:i===1?"var(--c-soft)":"var(--c-border)", transform:`translate(-50%, 0) rotate(${rot}deg)` }} />)}
          </div>
          <h1>Radha Rani</h1>
          <p className="hero-subtitle">{t("hero.sub")}</p>
          <p className="hero-tagline">{t("hero.tag")}</p>
          <p className="hero-links">Bhajans · Leelas · Quotes · Festival Calendar · Gallery</p>
          <button className="btn-cta" onClick={openDarshan}>{t("hero.cta")}</button>
        </div>
      </div>
      <nav className="main-nav">
        {NAV_LINKS.map(link => (
          <button key={link} className={`nav-btn${activeNav===link?" active":""}`} onClick={() => setActiveNav(link)}>{t("nav." + link)}</button>
        ))}
      </nav>
      {renderPage()}
      <footer className="main-footer">
        <p>🌸 Radha Rani Devotional Website 🌸</p>
        <p>Built with love by Sahil · Training Project 2026 · Jai Shri Radhe</p>
        <a
          className="footer-app-link"
          href={process.env.PUBLIC_URL + "/app/radha-dham.apk"}
          download="radha-dham.apk"
        >
          📲 {t("footer.dl")}
        </a>
      </footer>

      {/* DARSHAN MODAL — Full Screen */}
      {darshan !== null && (
        <div
          onClick={() => setDarshan(null)}
          style={{
            position: "fixed", inset: 0,
            zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* Full screen background image (blurred) */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${DARSHAN_IMAGES[darshan].src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(20px) brightness(0.4)",
            transform: "scale(1.1)",
          }} />

          {/* Dark overlay */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(40,12,24,0.55)" }} />

          {/* Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 22,
              width: "100%",
              height: "100%",
              padding: "30px 20px",
              boxSizing: "border-box",
            }}
          >
            {/* Close button top-right */}
            <button
              onClick={() => setDarshan(null)}
              style={{
                position: "absolute", top: 20, right: 24,
                background: "rgba(0,0,0,0.4)", color: "var(--c-soft)",
                border: "1px solid var(--c-border)", borderRadius: "50%",
                width: 44, height: 44, fontSize: 22, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>

            <p style={{ color: "#FAC775", fontSize: 26, fontWeight: 500, margin: 0, textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
              🌸 Jai Shri Radhe 🌸
            </p>

            {/* Main image — bada */}
            <div style={{
              borderRadius: 18,
              overflow: "hidden",
              border: "3px solid #FAC775",
              boxShadow: "0 0 50px rgba(250,199,117,0.5)",
              maxWidth: "92vw",
              maxHeight: "62vh",
            }}>
              <img
                src={DARSHAN_IMAGES[darshan].src}
                alt={DARSHAN_IMAGES[darshan].caption}
                style={{ display: "block", maxWidth: "92vw", maxHeight: "62vh", objectFit: "contain" }}
              />
            </div>

            <p style={{ color: "var(--c-soft)", fontSize: 15, margin: 0, textAlign: "center", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
              {DARSHAN_IMAGES[darshan].caption}
            </p>

            {/* Mantra box — chant karne ke liye */}
            <div style={{
              background: "rgba(var(--c-deep-rgb),0.85)",
              border: "1.5px solid #FAC775",
              borderRadius: 16,
              padding: "16px 32px",
              textAlign: "center",
              maxWidth: "90vw",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}>
              <p style={{ color: "#FAC775", fontSize: 13, margin: "0 0 6px", letterSpacing: 1, textTransform: "uppercase" }}>
                🕉️ Aaj ka Mantra — Chant Karein
              </p>
              <p style={{ color: "var(--c-bg)", fontSize: 24, fontWeight: 500, margin: 0, lineHeight: 1.5 }}>
                {DARSHAN_IMAGES[darshan].mantra}
              </p>
            </div>

            <p style={{ color: "var(--c-border)", fontSize: 12, margin: 0, textAlign: "center" }}>
              Band karne ke liye kahin bhi click karein
            </p>
          </div>
        </div>
      )}
    </div>
    </LangContext.Provider>
  );
}
