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
  // Delete/manage
  const [items, setItems] = useState(null); // { gallery, bhajans, leelas }
  const [loadingList, setLoadingList] = useState(false);

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

  async function api(body) {
    const r = await fetch("/api/add-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Secret": sessionStorage.getItem("adminSecret") || "",
      },
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => ({}));
    return { r, j };
  }

  // Kabhi bhi bare "undefined" na dikhe — status ke saath saaf message
  function errText(r, j, fallback) {
    if (j && j.error) return j.error + (j.detail ? " — " + j.detail : "");
    return `${fallback} (error ${r ? r.status : "?"})`;
  }

  async function send(type, data, image) {
    setBusy(true);
    setMsg(null);
    try {
      const { r, j } = await api({ action: "add", type, data, image });
      if (r.status === 401) { setMsg({ ok: false, text: j.error || "Galat password" }); lock(); }
      else if (!r.ok) setMsg({ ok: false, text: errText(r, j, "Add nahi hua") });
      else setMsg({ ok: true, text: j.message });
    } catch (e) {
      setMsg({ ok: false, text: "Network problem — dobara try karein" });
    }
    setBusy(false);
  }

  async function loadList() {
    setLoadingList(true);
    setMsg(null);
    try {
      const { r, j } = await api({ action: "list" });
      if (r.status === 401) { setMsg({ ok: false, text: j.error || "Galat password" }); lock(); }
      else if (!r.ok) setMsg({ ok: false, text: errText(r, j, "List load nahi hui") });
      else setItems(j.content);
    } catch (e) {
      setMsg({ ok: false, text: "Network problem — dobara try karein" });
    }
    setLoadingList(false);
  }

  async function del(type, index, name) {
    if (!window.confirm(`"${name}" ko delete karna hai?`)) return;
    setBusy(true);
    setMsg(null);
    try {
      const { r, j } = await api({ action: "delete", type, index });
      if (r.status === 401) { setMsg({ ok: false, text: j.error || "Galat password" }); lock(); }
      else if (!r.ok) setMsg({ ok: false, text: errText(r, j, "Delete nahi hua") });
      else { setMsg({ ok: true, text: j.message }); await loadList(); }
    } catch (e) {
      setMsg({ ok: false, text: "Network problem — dobara try karein" });
    }
    setBusy(false);
  }

  // Photo ko browser me hi resize + JPEG me convert karo (phone ki badi photo/webp/heic sab handle)
  // Input photo kitni bhi badi ho sakti hai — save 2000px high-quality JPEG hoti hai
  function resizePhoto(file, maxSide = 2000, quality = 0.9) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width > maxSide || height > maxSide) {
          const scale = maxSide / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl.split(",")[1]);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Photo padhi nahi ja saki")); };
      img.src = url;
    });
  }

  async function submitPhoto() {
    if (!photoFile) return setMsg({ ok: false, text: "Photo choose karo pehle" });
    setBusy(true);
    setMsg({ ok: true, text: "Photo taiyar ho rahi hai..." });
    try {
      const base64 = await resizePhoto(photoFile);
      setBusy(false);
      await send("gallery", { label: photoLabel || "Radha Krishna" }, { name: "photo.jpg", base64 });
      setPhotoFile(null); setPhotoLabel("");
    } catch (e) {
      setBusy(false);
      setMsg({ ok: false, text: "Photo process nahi hui — dusri photo try karein" });
    }
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
        {[["photo", "🖼️ Photo"], ["bhajan", "🎵 Bhajan"], ["leela", "📖 Leela"], ["manage", "🗑️ Delete"]].map(([id, label]) => (
          <button key={id} onClick={() => { setTab(id); setMsg(null); if (id === "manage") loadList(); }} className={`lang-chip${tab === id ? " active" : ""}`}>
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

      {tab === "manage" && (
        <div>
          <h3 style={{ textAlign: "center", color: "var(--c-deep)", marginBottom: 16 }}>Aapke add kiye items — delete karne ke liye</h3>
          {loadingList && <p style={{ textAlign: "center", color: "var(--c-dark)" }}>Load ho raha hai...</p>}
          {items && (() => {
            const groups = [
              ["gallery", "🖼️ Photos", i => i.label || "Photo"],
              ["bhajans", "🎵 Bhajans", i => i.title],
              ["leelas", "📖 Leelas", i => i.title],
            ];
            const typeOf = { gallery: "gallery", bhajans: "bhajan", leelas: "leela" };
            const total = groups.reduce((s, [k]) => s + (items[k]?.length || 0), 0);
            if (total === 0) return <p style={{ textAlign: "center", color: "var(--c-dark)" }}>Abhi aapne kuch add nahi kiya. Jo aap add karoge wahi yahan delete ke liye dikhega.<br />(Website ka original content yahan nahi aata.)</p>;
            return groups.map(([key, label, nameFn]) => (
              (items[key] && items[key].length > 0) && (
                <div key={key} style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--c-dark)", marginBottom: 8 }}>{label} ({items[key].length})</p>
                  {items[key].map((it, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--c-bg)", border: "0.5px solid var(--c-border)", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
                      {key === "gallery" && it.file && (
                        <img src={process.env.PUBLIC_URL + "/gallery/" + it.file} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                      )}
                      <span style={{ flex: 1, fontSize: 14, color: "var(--c-deep)" }}>{nameFn(it)}</span>
                      <button className="counter-reset-btn" disabled={busy} onClick={() => del(typeOf[key], idx, nameFn(it))}>Delete</button>
                    </div>
                  ))}
                </div>
              )
            ));
          })()}
          <button className="lang-chip" onClick={loadList} style={{ display: "block", margin: "10px auto 0" }}>🔄 Refresh</button>
        </div>
      )}

      <p style={{ textAlign: "center", fontSize: 12, color: "var(--c-dark)", marginTop: 18, lineHeight: 1.7 }}>
        Add/delete ke baad site apne aap update hoti hai — 2-3 minute lagte hain.<br />
        Ye page sirf aapke paas hai: <b>shriradharani.in/#admin</b>
      </p>
    </div>
  );
}
