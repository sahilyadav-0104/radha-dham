import { useState, useMemo } from "react";
import { GALLERY_ITEMS } from "../data";
import { useT } from "../i18n";

/* ============================================================
   GALLERY PAGE — albums (jaise "Radha Mandir") + lightbox
   Album ki photo pe click -> uske andar ki saari photos
   ============================================================ */
const FALLBACK = ["🌸","🪔","🌿","🎨","⛰️","🌺","🎭","🛕","🌙","🏵️","🪷","✨"];

export default function GalleryPage() {
  const { t } = useT();
  const [openAlbum, setOpenAlbum] = useState(null); // album ka naam ya null
  const [selected, setSelected] = useState(null);
  const [errors, setErrors] = useState({});

  // Album wise chhaanto — naya upload sabse pehle
  const { albums, loose } = useMemo(() => {
    const map = new Map();
    const rest = [];
    for (const item of GALLERY_ITEMS) {
      if (item.album) {
        if (!map.has(item.album)) map.set(item.album, []);
        map.get(item.album).push(item);
      } else {
        rest.push(item);
      }
    }
    // har album me nayi photo sabse upar
    for (const arr of map.values()) {
      arr.sort((a, b) => String(b.addedAt || "").localeCompare(String(a.addedAt || "")));
    }
    return { albums: [...map.entries()], loose: rest };
  }, []);

  // Abhi jo photos dikh rahi hain (album ke andar ho to uski, warna baaki)
  const list = openAlbum
    ? (albums.find(([name]) => name === openAlbum)?.[1] || [])
    : loose;

  function openList(idx) { setSelected(idx); }
  function closeAlbum() { setOpenAlbum(null); setSelected(null); }

  const Tile = ({ item, i }) => (
    <div className="gallery-item" onClick={() => openList(i)} style={{ position: "relative" }}>
      {!errors[item.url] ? (
        <img src={item.url} alt={item.label} onError={() => setErrors(p => ({ ...p, [item.url]: true }))}
          style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "var(--c-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>
          {FALLBACK[i % FALLBACK.length]}
        </div>
      )}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(var(--c-deep-rgb),0.88))", padding: "22px 8px 8px" }}>
        <span style={{ fontSize: 11, color: "var(--c-soft)", display: "block", textAlign: "center" }}>{item.label}</span>
      </div>
    </div>
  );

  return (
    <div className="page-section">
      <h2 className="section-heading">{t("h.gallery")}</h2>
      <div className="section-divider" />

      {/* Album ke andar — wapas jaane ka button */}
      {openAlbum && (
        <div className="album-head">
          <button className="album-back" onClick={closeAlbum}>‹</button>
          <div>
            <p className="album-head-name">📁 {openAlbum}</p>
            <p className="album-head-count">{list.length} photos</p>
          </div>
        </div>
      )}

      {/* Album cards — sabse upar (cover pe click karo, andar saari photos) */}
      {!openAlbum && albums.length > 0 && (
        <div className="gallery-grid" style={{ marginBottom: 18 }}>
          {albums.map(([name, items]) => (
            <div key={name} className="gallery-item album-card" onClick={() => setOpenAlbum(name)} style={{ position: "relative" }}>
              <img src={items[0].url} alt={name}
                style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} />
              <span className="album-badge">📁 {items.length}</span>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(var(--c-deep-rgb),0.92))", padding: "26px 8px 9px" }}>
                <span style={{ fontSize: 12, color: "#FAC775", display: "block", textAlign: "center", fontWeight: 700 }}>{name}</span>
                <span style={{ fontSize: 10, color: "var(--c-soft)", display: "block", textAlign: "center" }}>khol ke dekho →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photos */}
      <div className="gallery-grid">
        {list.map((item, i) => <Tile key={item.url + i} item={item} i={i} />)}
      </div>

      {list.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--c-dark)", fontSize: 14 }}>Is album me abhi koi photo nahi hai 🌸</p>
      )}

      {/* Lightbox */}
      {selected !== null && list[selected] && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, flexDirection: "column", gap: 14 }}>
          <button onClick={() => setSelected(null)} style={{ position: "absolute", top: 18, right: 22, background: "transparent", border: "none", color: "var(--c-soft)", fontSize: 30, cursor: "pointer" }}>✕</button>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={e => { e.stopPropagation(); setSelected((selected - 1 + list.length) % list.length); }}
              style={{ background: "var(--c-deep)", border: "none", color: "var(--c-soft)", fontSize: 24, borderRadius: "50%", width: 46, height: 46, cursor: "pointer" }}>‹</button>
            <div style={{ maxWidth: 520, maxHeight: 420, borderRadius: 14, overflow: "hidden", border: "2px solid var(--c-border)" }}>
              {!errors[list[selected].url] ? (
                <img src={list[selected].url} alt={list[selected].label}
                  style={{ maxWidth: 520, maxHeight: 420, display: "block", objectFit: "contain" }} />
              ) : (
                <div style={{ width: 300, height: 220, background: "var(--c-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60 }}>
                  {FALLBACK[selected % FALLBACK.length]}
                </div>
              )}
            </div>
            <button onClick={e => { e.stopPropagation(); setSelected((selected + 1) % list.length); }}
              style={{ background: "var(--c-deep)", border: "none", color: "var(--c-soft)", fontSize: 24, borderRadius: "50%", width: 46, height: 46, cursor: "pointer" }}>›</button>
          </div>
          <p style={{ color: "var(--c-soft)", fontSize: 15 }}>{list[selected].label}</p>
          {!errors[list[selected].url] && (
            <a
              href={list[selected].url}
              download={
                (list[selected].label || "radha-krishna")
                  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
                + "." + (list[selected].url.split(".").pop().split("?")[0] || "jpg")
              }
              onClick={e => e.stopPropagation()}
              style={{
                background: "var(--c-primary)", color: "#fff", textDecoration: "none",
                borderRadius: 20, padding: "9px 22px", fontSize: 14,
                fontFamily: "Georgia, serif", fontWeight: 600,
              }}
            >⬇️ Photo Download Karo</a>
          )}
          <p style={{ color: "var(--c-border)", fontSize: 12 }}>{selected + 1} / {list.length}</p>
        </div>
      )}

      <p style={{ textAlign: "center", fontSize: 13, color: "var(--c-dark)", marginTop: 20 }}>
        Apni Radha Rani ki photo share karne ke liye hume Contact mein likhein 🌸
      </p>
    </div>
  );
}
