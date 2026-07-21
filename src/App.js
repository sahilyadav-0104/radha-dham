import "./App.css";
import { useState, useEffect, useRef } from "react";
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
import QuizPage from "./pages/QuizPage";
import YatraPage from "./pages/YatraPage";
import ReelsPage from "./pages/ReelsPage";
import PuzzlePage from "./pages/PuzzlePage";
import TemplePage from "./pages/TemplePage";
import AdminPage from "./pages/AdminPage";

/* ============================================================
   MAIN APP
   ============================================================ */
// Share link se aaya hua reel — /r/<id> ya #reel-<id>
function reelIdFromHash() {
  const p = String(window.location.pathname || "").match(/^\/r\/([^/?#]+)/);
  if (p) return decodeURIComponent(p[1]);
  const m = String(window.location.hash || "").match(/^#reel-(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

export default function App() {
  const [sharedReel, setSharedReel] = useState(reelIdFromHash);
  const [activeNav, setActiveNav] = useState(() => (reelIdFromHash() ? "Status" : "Home"));
  const [darshan, setDarshan] = useState(null); // current darshan image index
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(window.location.hash === "#admin");
  const tapRef = useRef({ count: 0, last: 0 });

  // Footer copyright ko 5 baar (2 sec me) tap karne se admin panel khulta hai
  // (installed app me #admin URL nahi chalta, isliye ye secret gesture)
  function secretAdminTap() {
    const now = Date.now();
    const t = tapRef.current;
    t.count = now - t.last < 2000 ? t.count + 1 : 1;
    t.last = now;
    if (t.count >= 5) {
      t.count = 0;
      window.location.hash = "#admin";
      setIsAdmin(true);
    }
  }
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

  // #admin se admin panel, #reel-<id> se seedha wahi reel khulta hai
  useEffect(() => {
    const onHash = () => {
      setIsAdmin(window.location.hash === "#admin");
      const rid = reelIdFromHash();
      if (rid) { setSharedReel(rid); setActiveNav("Status"); }
    };
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
      case "Quiz":     return <QuizPage />;
      case "Yatra":    return <YatraPage />;
      case "Puzzle":   return <PuzzlePage />;
      case "Mandir":   return <TemplePage />;
      case "Status":   return <ReelsPage />;
      case "Contact":  return <ContactPage />;
      default:         return <HomePage onNavigate={setActiveNav} />;
    }
  }

  function exitReels() {
    setSharedReel(null);
    // Share link ka URL saaf kar do, warna refresh pe wahi reel dobara khulegi
    if (reelIdFromHash()) window.history.replaceState(null, "", "/");
    setActiveNav("Home");
  }

  // Status/Reels — Instagram jaisa full page (upar ka bar/nav/footer hata do)
  if (!isAdmin && activeNav === "Status") {
    return (
      <LangContext.Provider value={{ lang, t }}>
        <ReelsPage fullScreen startId={sharedReel} onExit={exitReels} />
      </LangContext.Provider>
    );
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
        <div className="hero-photo" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/hero-bg.webp)` }} />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>Radha Rani</h1>
          <p className="hero-subtitle">{t("hero.sub")}</p>
          <p className="hero-tagline">{t("hero.tag")}</p>
          <p className="hero-links">Bhajans · Leelas · Quotes · Festival Calendar · Gallery</p>
          <button className="btn-cta" onClick={openDarshan}>{t("hero.cta")}</button>
        </div>
      </div>
      <nav className="main-nav">
        {NAV_LINKS.map(link => (
          <button key={link} className={`nav-btn${!isAdmin && activeNav===link?" active":""}`} onClick={() => { setActiveNav(link); if (isAdmin) { setIsAdmin(false); if (window.location.hash) window.location.hash = ""; } }}>{t("nav." + link)}</button>
        ))}
      </nav>
      {renderPage()}
      <footer className="main-footer">
        <p>🌸 Radha Rani Devotional Website 🌸</p>
        <p onClick={secretAdminTap} style={{ cursor: "default", userSelect: "none" }}>Built with love by Sahil · Training Project 2026 · Jai Shri Radhe</p>
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
