import { useState } from "react";
import { randomRadhaCaption } from "../data";

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
  const [photoAlbum, setPhotoAlbum] = useState(""); // album (jaise "Radha Mandir") — khaali = normal gallery
  const [bulkFiles, setBulkFiles] = useState([]); // bulk photo upload
  const [bulkReels, setBulkReels] = useState(""); // bulk reels (ek line me ek link)
  const [progress, setProgress] = useState(""); // "3 / 50" jaisa
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
  const [sel, setSel] = useState({}); // multi-select: { "gallery:3": true, ... }
  // Comments moderation
  const [comments, setComments] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  // Reels
  const [reelUrl, setReelUrl] = useState("");
  const [reelCaption, setReelCaption] = useState("");
  const [reels, setReels] = useState(null);
  const [loadingReels, setLoadingReels] = useState(false);

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

  // ---- Multi-select delete ----
  function toggleSel(group, idx) {
    const k = `${group}:${idx}`;
    setSel(p => { const n = { ...p }; if (n[k]) delete n[k]; else n[k] = true; return n; });
  }
  function selectedIdx(group) {
    return Object.keys(sel).filter(k => k.startsWith(group + ":")).map(k => Number(k.split(":")[1]));
  }
  function selectAll(group, count) {
    setSel(p => {
      const n = { ...p };
      const already = selectedIdx(group).length === count;
      for (let i = 0; i < count; i++) { const k = `${group}:${i}`; if (already) delete n[k]; else n[k] = true; }
      return n;
    });
  }
  async function delMany(type, group) {
    const indexes = selectedIdx(group);
    if (!indexes.length) return setMsg({ ok: false, text: "Pehle kuch select karo" });
    if (!window.confirm(`${indexes.length} item delete karne hain?`)) return;
    setBusy(true); setMsg(null);
    try {
      const { r, j } = await api({ action: "deleteMany", type, indexes });
      if (r.status === 401) { setMsg({ ok: false, text: j.error || "Galat password" }); lock(); }
      else if (!r.ok) setMsg({ ok: false, text: errText(r, j, "Delete nahi hua") });
      else {
        setMsg({ ok: true, text: j.message });
        setSel(p => { const n = { ...p }; Object.keys(n).forEach(k => { if (k.startsWith(group + ":")) delete n[k]; }); return n; });
        await loadList();
      }
    } catch (e) {
      setMsg({ ok: false, text: "Network problem — dobara try karein" });
    }
    setBusy(false);
  }

  // ---- Comments moderation (alag API: /api/comments) ----
  async function commentsApi(body) {
    const r = await fetch("/api/comments", {
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

  async function loadComments() {
    setLoadingComments(true);
    setMsg(null);
    try {
      const { r, j } = await commentsApi({ action: "list" });
      if (r.status === 401) { setMsg({ ok: false, text: j.error || "Galat password" }); lock(); }
      else if (!r.ok) setMsg({ ok: false, text: errText(r, j, "Anubhav load nahi hue") });
      else setComments(j.comments || []);
    } catch (e) {
      setMsg({ ok: false, text: "Network problem — dobara try karein" });
    }
    setLoadingComments(false);
  }

  async function delComment(id, author) {
    if (!window.confirm(`${author} ka anubhav delete karna hai?`)) return;
    setBusy(true); setMsg(null);
    try {
      const { r, j } = await commentsApi({ action: "delete", id });
      if (r.status === 401) { setMsg({ ok: false, text: j.error || "Galat password" }); lock(); }
      else if (!r.ok) setMsg({ ok: false, text: errText(r, j, "Delete nahi hua") });
      else { setMsg({ ok: true, text: j.message }); setComments(j.comments || []); }
    } catch (e) { setMsg({ ok: false, text: "Network problem" }); }
    setBusy(false);
  }

  async function banComment(id, author) {
    if (!window.confirm(`${author} ko BAN karna hai? Iske saare anubhav hat jayenge aur ye dobara post nahi kar payega.`)) return;
    setBusy(true); setMsg(null);
    try {
      const { r, j } = await commentsApi({ action: "ban", id });
      if (r.status === 401) { setMsg({ ok: false, text: j.error || "Galat password" }); lock(); }
      else if (!r.ok) setMsg({ ok: false, text: errText(r, j, "Ban nahi hua") });
      else { setMsg({ ok: true, text: j.message }); setComments(j.comments || []); }
    } catch (e) { setMsg({ ok: false, text: "Network problem" }); }
    setBusy(false);
  }

  // ---- Reels (alag API: /api/reels) ----
  async function reelsApi(body) {
    const r = await fetch("/api/reels", {
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

  async function loadReels() {
    setLoadingReels(true);
    setMsg(null);
    try {
      const { r, j } = await reelsApi({ action: "list" });
      if (r.status === 401) { setMsg({ ok: false, text: j.error || "Galat password" }); lock(); }
      else if (!r.ok) setMsg({ ok: false, text: errText(r, j, "Reels load nahi hue") });
      else setReels(j.reels || []);
    } catch (e) { setMsg({ ok: false, text: "Network problem" }); }
    setLoadingReels(false);
  }

  async function submitReel() {
    if (!reelUrl.trim()) return setMsg({ ok: false, text: "Video / YouTube ka link daalein" });
    setBusy(true); setMsg(null);
    try {
      const { r, j } = await reelsApi({ action: "add", url: reelUrl.trim(), caption: reelCaption.trim() });
      if (r.status === 401) { setMsg({ ok: false, text: j.error || "Galat password" }); lock(); }
      else if (!r.ok) setMsg({ ok: false, text: errText(r, j, "Reel add nahi hua") });
      else { setMsg({ ok: true, text: j.message }); setReels(j.reels || []); setReelUrl(""); setReelCaption(""); }
    } catch (e) { setMsg({ ok: false, text: "Network problem" }); }
    setBusy(false);
  }

  async function delReel(id) {
    if (!window.confirm("Ye reel delete karna hai?")) return;
    setBusy(true); setMsg(null);
    try {
      const { r, j } = await reelsApi({ action: "delete", id });
      if (r.status === 401) { setMsg({ ok: false, text: j.error || "Galat password" }); lock(); }
      else if (!r.ok) setMsg({ ok: false, text: errText(r, j, "Delete nahi hua") });
      else { setMsg({ ok: true, text: j.message }); setReels(j.reels || []); }
    } catch (e) { setMsg({ ok: false, text: "Network problem" }); }
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
      // Naam na dala to Radha Rani se juda koi random naam lag jayega
      await send("gallery", {
        label: photoLabel.trim() || randomRadhaCaption(),
        ...(photoAlbum.trim() ? { album: photoAlbum.trim() } : {}),
      }, { name: "photo.jpg", base64 });
      setPhotoFile(null); setPhotoLabel("");
    } catch (e) {
      setBusy(false);
      setMsg({ ok: false, text: "Photo process nahi hui — dusri photo try karein" });
    }
  }

  // Bahut saari photos ek saath — pehle sab upload, phir ek hi baar gallery me jodo
  async function submitPhotosBulk() {
    if (!bulkFiles.length) return setMsg({ ok: false, text: "Photos choose karo pehle" });
    setBusy(true); setMsg({ ok: true, text: "Photos taiyar ho rahi hain..." });
    const uploaded = [];
    try {
      for (let i = 0; i < bulkFiles.length; i++) {
        setProgress(`${i + 1} / ${bulkFiles.length}`);
        let base64;
        try { base64 = await resizePhoto(bulkFiles[i]); } catch { continue; } // koi photo kharab ho to skip
        const { r, j } = await api({ action: "uploadImage", image: { name: "photo.jpg", base64 } });
        if (r.status === 401) { setProgress(""); setBusy(false); setMsg({ ok: false, text: j.error || "Galat password" }); lock(); return; }
        if (r.ok && j.file) uploaded.push({
          file: j.file,
          label: randomRadhaCaption(),
          ...(photoAlbum.trim() ? { album: photoAlbum.trim() } : {}),
        });
      }
      setProgress("");
      if (!uploaded.length) { setBusy(false); return setMsg({ ok: false, text: "Koi photo upload nahi hui" }); }
      const { r, j } = await api({ action: "addGalleryBulk", items: uploaded });
      setBusy(false);
      if (!r.ok) setMsg({ ok: false, text: errText(r, j, "Gallery update nahi hui") });
      else { setMsg({ ok: true, text: j.message }); setBulkFiles([]); }
    } catch (e) {
      setProgress(""); setBusy(false);
      setMsg({ ok: false, text: "Bulk upload me dikkat — dobara try karein" });
    }
  }

  // Bahut saare reels ek saath — ek line me ek link (ya "link | caption")
  async function submitReelsBulk() {
    const lines = bulkReels.split("\n").map(l => l.trim()).filter(Boolean);
    if (!lines.length) return setMsg({ ok: false, text: "Kam se kam ek link daalein (ek line me ek)" });
    const parsed = lines.map(line => {
      const [url, ...rest] = line.split("|");
      return { url: url.trim(), caption: rest.join("|").trim() };
    });
    setBusy(true); setMsg({ ok: true, text: `${parsed.length} reels add ho rahe hain...` });
    try {
      const { r, j } = await reelsApi({ action: "addMany", items: parsed });
      setBusy(false);
      if (r.status === 401) { setMsg({ ok: false, text: j.error || "Galat password" }); lock(); }
      else if (!r.ok) setMsg({ ok: false, text: errText(r, j, "Reels add nahi hue") });
      else { setMsg({ ok: true, text: j.message }); setReels(j.reels || []); setBulkReels(""); }
    } catch (e) {
      setBusy(false);
      setMsg({ ok: false, text: "Bulk reels me dikkat — dobara try karein" });
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
        {[["photo", "🖼️ Photo"], ["bhajan", "🎵 Bhajan"], ["leela", "📖 Leela"], ["reel", "🎬 Reels"], ["manage", "🗑️ Delete"], ["comment", "💬 Comments"]].map(([id, label]) => (
          <button key={id} onClick={() => { setTab(id); setMsg(null); if (id === "manage") loadList(); if (id === "comment") loadComments(); if (id === "reel") loadReels(); }} className={`lang-chip${tab === id ? " active" : ""}`}>
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
          <h3>Ek photo add karo</h3>
          <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0] || null)} />
          {photoFile && <p style={{ fontSize: 12, color: "var(--c-dark)" }}>📎 {photoFile.name} ({Math.round(photoFile.size / 1024)} KB)</p>}
          <input type="text" placeholder="Photo ka naam (khaali chhodo to Radha Rani wala naam khud lag jayega)" value={photoLabel} onChange={e => setPhotoLabel(e.target.value)} />

          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--c-dark)", margin: "10px 0 6px" }}>📁 Album (dono — ek aur bulk — pe lagta hai):</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {["Radha Mandir", "Daily Darshan", "Puzzle", ""].map(a => (
              <button key={a || "none"} type="button"
                className={`lang-chip${photoAlbum === a ? " active" : ""}`}
                onClick={() => setPhotoAlbum(a)}>
                {a || "✕ Album ke bina"}
              </button>
            ))}
          </div>
          <input type="text" placeholder="Ya apna album ka naam likho" value={photoAlbum} onChange={e => setPhotoAlbum(e.target.value)} maxLength={40} />
          <p style={{ fontSize: 11, color: "var(--c-dark)", marginTop: 6, lineHeight: 1.6 }}>
            💡 <b>Puzzle</b> album chunoge to wo photo Puzzle game me khelne ke liye aa jayegi.
          </p>
          <button className="btn-submit" disabled={busy} onClick={submitPhoto}>
            {busy ? "Upload ho raha hai..." : "Photo Add Karo →"}
          </button>

          <div style={{ borderTop: "0.5px solid var(--c-border)", margin: "20px 0 14px" }} />
          <h3>📦 Bahut saari photos ek saath (Bulk)</h3>
          <input type="file" accept="image/*" multiple onChange={e => setBulkFiles([...e.target.files])} />
          {bulkFiles.length > 0 && <p style={{ fontSize: 12, color: "var(--c-dark)" }}>📎 {bulkFiles.length} photos chuni gayi</p>}
          <button className="btn-submit" disabled={busy} onClick={submitPhotosBulk}>
            {busy ? `Upload ho raha hai... ${progress}` : `${bulkFiles.length || ""} Photos Upload Karo →`}
          </button>
          <p style={{ fontSize: 11, color: "var(--c-dark)", marginTop: 8 }}>
            💡 Ek saath 50+ photos chun sakte ho. Har photo chhoti (2000px) ho jaati hai — upload me thoda time lagta hai, page band mat karna. Naam apne aap Radha Rani wala lag jayega.
          </p>
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

      {tab === "reel" && (
        <div>
          <div className="comment-form">
            <h3>Naya Status / Reel add karo 🎬</h3>
            <input type="text" placeholder="Video ya YouTube ka link (Shorts bhi chalega) *" value={reelUrl} onChange={e => setReelUrl(e.target.value)} />
            <input type="text" placeholder="Caption (optional)" value={reelCaption} onChange={e => setReelCaption(e.target.value)} />
            <button className="btn-submit" disabled={busy} onClick={submitReel}>
              {busy ? "Add ho raha hai..." : "Reel Add Karo →"}
            </button>
            <p style={{ fontSize: 11, color: "var(--c-dark)", marginTop: 8, lineHeight: 1.6 }}>
              💡 YouTube / YouTube Shorts, Instagram reel, ya direct video (.mp4) — koi bhi link chalega. YouTube sabse smooth (autoplay) chalta hai; Instagram tap karke chalega.
            </p>

            <div style={{ borderTop: "0.5px solid var(--c-border)", margin: "18px 0 14px" }} />
            <h3>📦 Bahut saare reels ek saath (Bulk)</h3>
            <textarea
              style={{ minHeight: 150, fontFamily: "monospace", fontSize: 12 }}
              placeholder={"Ek line me ek link paste karo. Jaise:\nhttps://youtube.com/shorts/abc123\nhttps://youtu.be/xyz789 | Radhe Radhe\n... (jitne chaaho)"}
              value={bulkReels}
              onChange={e => setBulkReels(e.target.value)}
            />
            <button className="btn-submit" disabled={busy} onClick={submitReelsBulk}>
              {busy ? "Add ho raha hai..." : `${bulkReels.split("\n").filter(l => l.trim()).length || ""} Reels Add Karo →`}
            </button>
            <p style={{ fontSize: 11, color: "var(--c-dark)", marginTop: 8, lineHeight: 1.6 }}>
              💡 Ek line me ek YouTube link. Caption dena ho to link ke baad " | " lagakar likho. Ek saath 100 tak daal sakte ho.
            </p>
          </div>

          <h3 style={{ textAlign: "center", color: "var(--c-deep)", margin: "20px 0 12px" }}>Add kiye reels — delete karne ke liye</h3>
          {loadingReels && <p style={{ textAlign: "center", color: "var(--c-dark)" }}>Load ho raha hai...</p>}
          {reels && reels.length === 0 && <p style={{ textAlign: "center", color: "var(--c-dark)" }}>Abhi koi reel nahi hai.</p>}
          {reels && reels.map(rl => (
            <div key={rl.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--c-bg)", border: "0.5px solid var(--c-border)", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
              {rl.type === "youtube" && <img src={`https://i.ytimg.com/vi/${rl.ytId}/default.jpg`} alt="" style={{ width: 48, height: 34, borderRadius: 5, objectFit: "cover" }} />}
              <span style={{ flex: 1, fontSize: 13, color: "var(--c-deep)" }}>
                {rl.type === "youtube" ? "▶ YouTube" : "🎞️ Video"} · {rl.caption || "(no caption)"} · ❤️ {rl.likes || 0}
              </span>
              <button className="counter-reset-btn" disabled={busy} onClick={() => delReel(rl.id)}>Delete</button>
            </div>
          ))}
          <button className="lang-chip" onClick={loadReels} style={{ display: "block", margin: "10px auto 0" }}>🔄 Refresh</button>
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
            return groups.map(([key, label, nameFn]) => {
              if (!items[key] || items[key].length === 0) return null;
              const picked = selectedIdx(key);
              const allOn = picked.length === items[key].length;
              return (
                <div key={key} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--c-dark)", margin: 0, flex: 1 }}>{label} ({items[key].length})</p>
                    <button className="lang-chip" onClick={() => selectAll(key, items[key].length)}>
                      {allOn ? "✕ Sab hatao" : "☑️ Sab select"}
                    </button>
                    {picked.length > 0 && (
                      <button
                        className="counter-reset-btn"
                        style={{ borderColor: "#D64545", color: "#fff", background: "#D64545", fontWeight: 700 }}
                        disabled={busy}
                        onClick={() => delMany(typeOf[key], key)}
                      >🗑️ {picked.length} delete karo</button>
                    )}
                  </div>
                  {items[key].map((it, idx) => {
                    const on = !!sel[`${key}:${idx}`];
                    return (
                      <div key={idx}
                        onClick={() => toggleSel(key, idx)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          background: on ? "var(--c-soft)" : "var(--c-bg)",
                          border: on ? "1.5px solid var(--c-primary)" : "0.5px solid var(--c-border)",
                          borderRadius: 10, padding: "10px 14px", marginBottom: 8, cursor: "pointer",
                        }}>
                        <input type="checkbox" checked={on} readOnly
                          style={{ width: 18, height: 18, flexShrink: 0, accentColor: "var(--c-primary)" }} />
                        {key === "gallery" && it.file && (
                          <img src={process.env.PUBLIC_URL + "/gallery/" + it.file} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                        )}
                        <span style={{ flex: 1, fontSize: 14, color: "var(--c-deep)" }}>
                          {nameFn(it)}
                          {it.album && <span style={{ fontSize: 11, color: "var(--c-dark)" }}> · 📁 {it.album}</span>}
                        </span>
                        <button className="counter-reset-btn" disabled={busy}
                          onClick={e => { e.stopPropagation(); del(typeOf[key], idx, nameFn(it)); }}>Delete</button>
                      </div>
                    );
                  })}
                </div>
              );
            });
          })()}
          <button className="lang-chip" onClick={loadList} style={{ display: "block", margin: "10px auto 0" }}>🔄 Refresh</button>
        </div>
      )}

      {tab === "comment" && (
        <div>
          <h3 style={{ textAlign: "center", color: "var(--c-deep)", marginBottom: 6 }}>Bhakton ke anubhav — delete ya ban karo</h3>
          <p style={{ textAlign: "center", fontSize: 12, color: "var(--c-dark)", marginBottom: 16 }}>
            🚫 Ban = us bhakt ke saare anubhav hat jayenge aur wo dobara post nahi kar payega.
          </p>
          {loadingComments && <p style={{ textAlign: "center", color: "var(--c-dark)" }}>Load ho raha hai...</p>}
          {comments && comments.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--c-dark)" }}>Abhi koi anubhav nahi hai.</p>
          )}
          {comments && comments.map(c => (
            <div key={c.id} style={{ background: "var(--c-bg)", border: "0.5px solid var(--c-border)", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--c-deep)", margin: "0 0 4px" }}>🙏 {c.author}</p>
              <p style={{ fontSize: 14, color: "var(--c-dark)", margin: "0 0 10px", lineHeight: 1.6 }}>{c.text}</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="counter-reset-btn" disabled={busy} onClick={() => delComment(c.id, c.author)}>Delete</button>
                {c.cid
                  ? <button className="counter-reset-btn" disabled={busy} style={{ borderColor: "#D64545", color: "#D64545" }} onClick={() => banComment(c.id, c.author)}>🚫 Ban</button>
                  : <span style={{ fontSize: 11, color: "var(--c-dark)", alignSelf: "center" }}>(purana — ban nahi)</span>}
              </div>
            </div>
          ))}
          <button className="lang-chip" onClick={loadComments} style={{ display: "block", margin: "10px auto 0" }}>🔄 Refresh</button>
        </div>
      )}

      <p style={{ textAlign: "center", fontSize: 12, color: "var(--c-dark)", marginTop: 18, lineHeight: 1.7 }}>
        Add/delete ke baad site apne aap update hoti hai — 2-3 minute lagte hain.<br />
        Ye page sirf aapke paas hai: <b>shriradharani.in/#admin</b>
      </p>
    </div>
  );
}
