import { useState } from "react";

/* ============================================================
   ADMIN PANEL — shriradharani.in/#admin
   Sirf admin (password wala) content add kar sakta hai.
   Photo/Bhajan/Leela add hote hi GitHub me save + auto-deploy.
   ============================================================ */
export default function AdminPage() {
  const [secret, setSecret] = useState(() => sessionStorage.getItem("adminSecret") || "");
  const [unlocked, setUnlocked] = useState(() => !!sessionStorage.getItem("adminSecret"));
  const [tab, setTab] = useState("photo");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // { ok, text }

  // Photo form
  const [photoFile, setPhotoFile] = useState(null);
  const [photoLabel, setPhotoLabel] = useState("");
  // Bhajan form
  const [bTitle, setBTitle] = useState("");
  const [bSinger, setBSinger] = useState("");
  const [bSrc, setBSrc] = useState("");
  const [bDuration, setBDuration] = useState("");
  const [bLyrics, setBLyrics] = useState("");
  // Leela form
  const [lTitle, setLTitle] = useState("");
  const [lEmoji, setLEmoji] = useState("🌸");
  const [lStory, setLStory] = useState("");

  function unlock() {
    if (!secret.trim()) return;
    sessionStorage.setItem("adminSecret", secret.trim());
    setUnlocked(true);
  }

  function lock() {
    sessionStorage.removeItem("adminSecret");
    setSecret("");
    setUnlocked(false);
  }

  async function send(type, data, image) {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/add-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Secret": sessionStorage.getItem("adminSecret") || "",
        },
        body: JSON.stringify({ type, data, image }),
      });
      const j = await r.json();
      if (r.status === 401) {
        setMsg({ ok: false, text: j.error });
        lock();
      } else if (!r.ok) {
        setMsg({ ok: false, text: j.error + (j.detail ? " — " + j.detail : "") });
      } else {
        setMsg({ ok: true, text: j.message });
      }
    } catch (e) {
      setMsg({ ok: false, text: "Network problem — dobara try karein" });
    }
    setBusy(false);
  }

  function fileToBase64(file) {
    return new Promise((res, rej) => {
      const rd = new FileReader();
      rd.onload = () => res(String(rd.result).split(",")[1]);
      rd.onerror = rej;
      rd.readAsDataURL(file);
    });
  }

  async function submitPhoto() {
    if (!photoFile) return setMsg({ ok: false, text: "Photo choose karo pehle" });
    if (photoFile.size > 3 * 1024 * 1024) return setMsg({ ok: false, text: "Photo 3 MB se chhoti honi chahiye" });
    const base64 = await fileToBase64(photoFile);
    await send("gallery", { label: photoLabel || "Radha Krishna" }, { name: photoFile.name, base64 });
    setPhotoFile(null); setPhotoLabel("");
  }

  async function submitBhajan() {
    if (!bTitle.trim() || !bSrc.trim()) return setMsg({ ok: false, text: "Bhajan ka naam aur MP3 link zaroori hai" });
    await send("bhajan", { title: bTitle, singer: bSinger, src: bSrc, duration: bDuration, lyrics: bLyrics || undefined });
    setBTitle(""); setBSinger(""); setBSrc(""); setBDuration(""); setBLyrics("");
  }

  async function submitLeela() {
    if (!lTitle.trim() || !lStory.trim()) return setMsg({ ok: false, text: "Leela ka naam aur kahani dono likho" });
    await send("leela", { title: lTitle, emoji: lEmoji, story: lStory });
    setLTitle(""); setLStory(""); setLEmoji("🌸");
  }

  // ---------- LOGIN SCREEN ----------
  if (!unlocked) {
    return (
      <div className="page-section" style={{ maxWidth: 420 }}>
        <h2 className="section-heading">🔐 Admin Panel</h2>
        <div className="section-divider" />
        <div className="comment-form">
          <h3>Admin password daalo</h3>
          <input
            type="password"
            placeholder="Password"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === "Enter" && unlock()}
          />
          <button className="btn-submit" onClick={unlock}>Kholo →</button>
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--c-dark)", marginTop: 14 }}>
          Ye page sirf admin ke liye hai. Password galat hoga toh kuch add nahi hoga.
        </p>
      </div>
    );
  }

  // ---------- ADMIN FORMS ----------
  return (
    <div className="page-section" style={{ maxWidth: 560 }}>
      <h2 className="section-heading">🔐 Admin Panel</h2>
      <div className="section-divider" />

      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
        {[["photo", "🖼️ Photo"], ["bhajan", "🎵 Bhajan"], ["leela", "📖 Leela"]].map(([id, label]) => (
          <button key={id} onClick={() => { setTab(id); setMsg(null); }} className={`lang-chip${tab === id ? " active" : ""}`}>
            {label}
          </button>
        ))}
        <button onClick={lock} className="lang-chip" style={{ marginLeft: "auto" }}>🔒 Lock</button>
      </div>

      {msg && (
        <div style={{
          background: msg.ok ? "#1D9E75" : "#D64545", color: "#fff",
          borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontSize: 14,
        }}>
          {msg.text}
        </div>
      )}

      {tab === "photo" && (
        <div className="comment-form">
          <h3>Nayi photo add karo</h3>
          <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0] || null)} />
          {photoFile && <p style={{ fontSize: 12, color: "var(--c-dark)" }}>📎 {photoFile.name} ({Math.round(photoFile.size / 1024)} KB)</p>}
          <input type="text" placeholder="Photo ka naam (jaise: Barsana Mandir)" value={photoLabel} onChange={e => setPhotoLabel(e.target.value)} />
          <button className="btn-submit" disabled={busy} onClick={submitPhoto}>
            {busy ? "Upload ho raha hai..." : "Photo Add Karo →"}
          </button>
        </div>
      )}

      {tab === "bhajan" && (
        <div className="comment-form">
          <h3>Naya bhajan add karo</h3>
          <input type="text" placeholder="Bhajan ka naam *" value={bTitle} onChange={e => setBTitle(e.target.value)} />
          <input type="text" placeholder="Gayak (singer)" value={bSinger} onChange={e => setBSinger(e.target.value)} />
          <input type="text" placeholder="MP3 ka link (URL) *" value={bSrc} onChange={e => setBSrc(e.target.value)} />
          <input type="text" placeholder="Duration (jaise 5:30)" value={bDuration} onChange={e => setBDuration(e.target.value)} />
          <textarea placeholder="Lyrics (2-4 line, optional)" value={bLyrics} onChange={e => setBLyrics(e.target.value)} />
          <button className="btn-submit" disabled={busy} onClick={submitBhajan}>
            {busy ? "Save ho raha hai..." : "Bhajan Add Karo →"}
          </button>
          <p style={{ fontSize: 11, color: "var(--c-dark)", marginTop: 8 }}>
            💡 MP3 link archive.org jaisi site se lo — link kholne par seedha audio bajna chahiye.
          </p>
        </div>
      )}

      {tab === "leela" && (
        <div className="comment-form">
          <h3>Nayi leela / kahani add karo</h3>
          <input type="text" placeholder="Leela ka naam *" value={lTitle} onChange={e => setLTitle(e.target.value)} />
          <input type="text" placeholder="Emoji (jaise 🌸 ⛰️ 🎵)" value={lEmoji} onChange={e => setLEmoji(e.target.value)} maxLength={4} />
          <textarea style={{ minHeight: 160 }} placeholder="Puri kahani yahan likho... (paragraph ke beech khali line chhodo) *" value={lStory} onChange={e => setLStory(e.target.value)} />
          <button className="btn-submit" disabled={busy} onClick={submitLeela}>
            {busy ? "Save ho raha hai..." : "Leela Add Karo →"}
          </button>
        </div>
      )}

      <p style={{ textAlign: "center", fontSize: 12, color: "var(--c-dark)", marginTop: 18, lineHeight: 1.7 }}>
        Add karne ke baad site apne aap update hoti hai — 2-3 minute lagte hain.<br />
        Ye page sirf aapke paas hai: <b>shriradharani.in/#admin</b>
      </p>
    </div>
  );
}
