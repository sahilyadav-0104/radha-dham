import { useState, useEffect } from "react";
import { useT } from "../i18n";
import { whatsappShare } from "../data";

/* ============================================================
   MERA MANDIR — apna virtual mandir banao aur sajao
   Murti, mala, diya, agarbatti, bhog, ghanti, aarti — sab
   aapki pasand ka, device par save rehta hai.
   ============================================================ */
const PUB = process.env.PUBLIC_URL;
const KEY = "radhaDhamMandir";

const DEITIES = [
  { src: PUB + "/radha-krishna-1.webp", name: "ISKCON Radha Krishna" },
  { src: PUB + "/radha-krishna-2.webp", name: "Divya Shringaar" },
  { src: PUB + "/radha-krishna-3.webp", name: "Pushp Shringaar" },
  { src: PUB + "/radha-krishna-4.webp", name: "Phoolon ka Darshan" },
  { src: PUB + "/gallery/iskcon-radha-shyamsundar.jpg", name: "Radha Shyamsundar" },
  { src: PUB + "/gallery/st-14.jpg", name: "Yugal Sarkar" },
];

const MALAS = [
  { id: "none", name: "Bina mala", flower: "" },
  { id: "genda", name: "Genda", flower: "🌼" },
  { id: "gulab", name: "Gulab", flower: "🌹" },
  { id: "mix", name: "Phool mala", flower: "🌺" },
];

const BHOG_ITEMS = [
  { id: "makhan", e: "🧈", name: "Makhan" },
  { id: "phal", e: "🍎", name: "Phal" },
  { id: "doodh", e: "🥛", name: "Doodh" },
  { id: "mithai", e: "🍯", name: "Mishri" },
  { id: "tulsi", e: "🌿", name: "Tulsi" },
];

const DEFAULTS = {
  name: "",
  deity: 0,
  mala: "mix",
  diya: true,
  agarbatti: true,
  bhog: ["makhan", "tulsi"],
};

function load() {
  try { return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY)) || {}) }; }
  catch { return { ...DEFAULTS }; }
}

// Mandir ki ghanti — WebAudio se (koi file nahi chahiye)
function ringBell() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = window.__mandirBell || (window.__mandirBell = new Ctx());
    const t = ctx.currentTime;
    [[660, 0.35, 1.8], [1320, 0.12, 1.1]].forEach(([freq, vol, dur]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.start(t);
      o.stop(t + dur + 0.1);
    });
  } catch (e) { /* audio na chale to bhi mandir chalta rahe */ }
}

export default function TemplePage() {
  const { t } = useT();
  const [m, setM] = useState(load);
  const [aarti, setAarti] = useState(false);
  const [belling, setBelling] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(m));
  }, [m]);

  function set(patch) { setM(prev => ({ ...prev, ...patch })); }

  function toggleBhog(id) {
    set({ bhog: m.bhog.includes(id) ? m.bhog.filter(b => b !== id) : [...m.bhog, id] });
  }

  function doAarti() {
    if (aarti) return;
    setAarti(true);
    ringBell();
    if (navigator.vibrate) navigator.vibrate([80, 60, 80]);
    setTimeout(() => setAarti(false), 6500);
  }

  function doBell() {
    ringBell();
    setBelling(true);
    if (navigator.vibrate) navigator.vibrate(40);
    setTimeout(() => setBelling(false), 900);
  }

  const mala = MALAS.find(x => x.id === m.mala) || MALAS[0];
  const deity = DEITIES[m.deity] || DEITIES[0];
  const title = m.name.trim() ? `${m.name.trim()} ka Mandir` : "Mera Mandir";

  return (
    <div className="page-section" style={{ maxWidth: 560 }}>
      <h2 className="section-heading">{t("h.mandir")}</h2>
      <div className="section-divider" />

      {/* ---------- MANDIR ---------- */}
      <p className="mandir-title">🚩 {title} 🚩</p>
      <div className="mandir-arch">
        {/* Mala */}
        {mala.flower && (
          <div className="mandir-mala">
            {Array.from({ length: 9 }).map((_, i) => <span key={i}>{mala.flower}</span>)}
          </div>
        )}

        {/* Ghantiyan */}
        <button className={`mandir-bell left${belling ? " ring" : ""}`} onClick={doBell}>🔔</button>
        <button className={`mandir-bell right${belling ? " ring" : ""}`} onClick={doBell}>🔔</button>

        {/* Murti */}
        <div className="mandir-murti-wrap">
          <img src={deity.src} alt={deity.name} className="mandir-murti" />
          {aarti && <span className="mandir-aarti-diya">🪔</span>}
        </div>

        {/* Bhog */}
        {m.bhog.length > 0 && (
          <div className="mandir-bhog">
            {m.bhog.map(id => {
              const b = BHOG_ITEMS.find(x => x.id === id);
              return b ? <span key={id} title={b.name}>{b.e}</span> : null;
            })}
          </div>
        )}

        {/* Diye */}
        {m.diya && (
          <>
            <span className="mandir-diya left">🪔</span>
            <span className="mandir-diya right">🪔</span>
          </>
        )}

        {/* Agarbatti ka dhuan */}
        {m.agarbatti && (
          <div className="mandir-agarbatti">
            <span className="smoke s1" />
            <span className="smoke s2" />
            <span className="smoke s3" />
          </div>
        )}
      </div>

      {/* Aarti + Share */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, margin: "16px 0 24px", flexWrap: "wrap" }}>
        <button className="btn-cta" onClick={doAarti} disabled={aarti}>
          {aarti ? "🪔 Aarti ho rahi hai..." : "🪔 Aarti Karo"}
        </button>
        <a
          className="share-btn"
          style={{ alignSelf: "center" }}
          href={whatsappShare(`🛕 Maine Radha Dham par apna virtual mandir banaya — "${title}" 🌸\n\nAap bhi apna mandir banao: https://shriradharani.in\n\nJai Shri Radhe 🙏`)}
          target="_blank" rel="noreferrer"
        >WhatsApp par share karo ↗</a>
      </div>

      {/* ---------- SAJAWAT ---------- */}
      <div className="comment-form">
        <h3>🎨 Apna mandir sajao</h3>

        <input
          type="text"
          placeholder="Aapka naam (jaise: Sahil) — mandir ke naam ke liye"
          value={m.name}
          maxLength={20}
          onChange={e => set({ name: e.target.value })}
        />

        <p className="mandir-label">🙏 Murti chuno:</p>
        <div className="mandir-deity-row">
          {DEITIES.map((d, i) => (
            <button
              key={i}
              className={`mandir-deity-pick${m.deity === i ? " active" : ""}`}
              onClick={() => set({ deity: i })}
              title={d.name}
            >
              <img src={d.src} alt={d.name} />
            </button>
          ))}
        </div>

        <p className="mandir-label">🌸 Mala:</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {MALAS.map(x => (
            <button key={x.id} className={`lang-chip${m.mala === x.id ? " active" : ""}`} onClick={() => set({ mala: x.id })}>
              {x.flower || "✕"} {x.name}
            </button>
          ))}
        </div>

        <p className="mandir-label">🪔 Sajawat:</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button className={`lang-chip${m.diya ? " active" : ""}`} onClick={() => set({ diya: !m.diya })}>🪔 Diye</button>
          <button className={`lang-chip${m.agarbatti ? " active" : ""}`} onClick={() => set({ agarbatti: !m.agarbatti })}>🕉️ Agarbatti</button>
        </div>

        <p className="mandir-label">🍽️ Bhog lagao:</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {BHOG_ITEMS.map(b => (
            <button key={b.id} className={`lang-chip${m.bhog.includes(b.id) ? " active" : ""}`} onClick={() => toggleBhog(b.id)}>
              {b.e} {b.name}
            </button>
          ))}
        </div>
      </div>

      <p style={{ textAlign: "center", fontSize: 12, color: "var(--c-dark)", marginTop: 14, lineHeight: 1.7 }}>
        🛕 Aapka mandir aapke phone par save rehta hai — jab bhi aao, waise ka waisa milega.<br />
        Ghanti bajao 🔔, bhog lagao aur roz aarti karo! 🌸
      </p>
    </div>
  );
}
