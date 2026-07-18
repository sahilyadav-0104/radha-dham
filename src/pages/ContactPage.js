import { useState, useEffect } from "react";
import { INITIAL_COMMENTS, ALL_SEARCH_DATA } from "../data";
import { useT } from "../i18n";

/* ============================================================
   CONTACT PAGE — Comments (sabke liye — site par upload) + Search
   ============================================================ */

// Har browser ki ek pakki anonymous id — ban ke liye (koi personal jaankari nahi)
function getClientId() {
  let id = localStorage.getItem("radhaDhamCid");
  if (!id) {
    id = "c_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("radhaDhamCid", id);
  }
  return id;
}

// "kuch samay pehle" jaisa relative time
function relTime(ts) {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "abhi abhi";
  if (min < 60) return `${min} minute pehle`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ghante pehle`;
  const day = Math.floor(hr / 24);
  return `${day} din pehle`;
}

export default function ContactPage() {
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("comments");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // { ok, text }
  const { t } = useT();

  // Site par likhe saare anubhav load karo
  useEffect(() => {
    let alive = true;
    fetch("/api/comments")
      .then(r => r.json())
      .then(j => { if (alive && j.comments) setComments(j.comments); })
      .catch(() => { /* fetch fail ho to INITIAL_COMMENTS dikhte rahenge */ });
    return () => { alive = false; };
  }, []);

  const typeColors = {
    Bhajan: { bg:"#FAEEDA", text:"#633806" },
    Leela:  { bg:"#EEEDFE", text:"#3C3489" },
    Festival:{ bg:"#EAF3DE", text:"#27500A" },
    Gallery: { bg:"var(--c-bg)", text:"var(--c-dark)" },
    Counter: { bg:"var(--c-bg)", text:"var(--c-primary)" },
  };

  const results = ALL_SEARCH_DATA.filter(d => query.length > 1 && d.title.toLowerCase().includes(query.toLowerCase()));

  async function submit() {
    if (!name.trim() || !text.trim()) {
      setMsg({ ok: false, text: "Naam aur anubhav dono likhein 🙏" });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: name, text, cid: getClientId() }),
      });
      const j = await r.json();
      if (!r.ok) {
        setMsg({ ok: false, text: j.error || "Anubhav save nahi hua, dobara try karein" });
      } else {
        if (j.comments) setComments(j.comments);
        setName(""); setText("");
        setMsg({ ok: true, text: "✅ Aapka anubhav site par publish ho gaya! Jai Shri Radhe 🌸" });
        setTimeout(() => setMsg(null), 4000);
      }
    } catch (e) {
      setMsg({ ok: false, text: "Internet check karke dobara try karein" });
    }
    setBusy(false);
  }

  return (
    <div className="page-section">
      <div style={{ display:"flex", justifyContent:"center", gap:10, marginBottom:28 }}>
        {["comments","search"].map(tb => (
          <button key={tb} onClick={() => setTab(tb)} style={{
            background: tab===tb ? "var(--c-deep)" : "var(--c-bg)",
            color: tab===tb ? "var(--c-soft)" : "var(--c-dark)",
            border: "0.5px solid var(--c-border)",
            borderRadius: 20,
            padding: "8px 22px",
            fontSize: 14,
            fontFamily: "Georgia, serif",
            cursor: "pointer",
          }}>
            {tb==="comments" ? "💬 Anubhav Likhein" : "🔍 Khoj"}
          </button>
        ))}
      </div>

      {tab === "comments" && (
        <>
          <h2 className="section-heading">{t("h.contact")}</h2>
          <div className="section-divider" />
          <div className="comment-form">
            <h3>Apna anubhav share karein 🙏</h3>
            <p style={{ fontSize:12, color:"var(--c-dark)", margin:"0 0 10px" }}>
              Aapka anubhav site par sabhi bhakton ko dikhega 🌸
            </p>
            {msg && (
              <div style={{ background: msg.ok ? "#1D9E75" : "#D64545", color:"#fff", borderRadius:8, padding:"8px 14px", marginBottom:10, fontSize:13 }}>
                {msg.text}
              </div>
            )}
            <input type="text" placeholder="Aapka naam" value={name} onChange={e => setName(e.target.value)} maxLength={40} />
            <textarea placeholder="Radha Rani ke baare mein apna anubhav ya bhav likhein..." value={text} onChange={e => setText(e.target.value)} maxLength={600} />
            <button className="btn-submit" onClick={submit} disabled={busy}>
              {busy ? "Publish ho raha hai..." : "Submit Karein →"}
            </button>
          </div>
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <p className="comment-author">🙏 {c.author}</p>
              <p className="comment-text">{c.text}</p>
              <p className="comment-time">{c.time || relTime(c.ts)}</p>
            </div>
          ))}
        </>
      )}

      {tab === "search" && (
        <>
          <h2 className="section-heading">Smart Search</h2>
          <div className="section-divider" />
          <div className="search-wrap">
            <div className="search-input-wrap">
              <span style={{ fontSize:18 }}>🔍</span>
              <input type="text" placeholder="Bhajan, Leela ya Festival dhundho..." value={query} onChange={e => setQuery(e.target.value)} autoFocus />
              {query && <button onClick={() => setQuery("")} style={{ background:"transparent", border:"none", color:"#185FA5", cursor:"pointer", fontSize:16 }}>✕</button>}
            </div>
            {query.length > 1 && results.length === 0 && (
              <p style={{ textAlign:"center", color:"var(--c-dark)", fontSize:14 }}>Koi result nahi mila. Doosra naam try karein.</p>
            )}
            {results.map((r,i) => (
              <div key={i} className="search-result-card">
                <p className="search-result-title">{r.title}</p>
                <span style={{ fontSize:12, background:typeColors[r.type]?.bg, color:typeColors[r.type]?.text, borderRadius:12, padding:"2px 10px", display:"inline-block" }}>{r.type}</span>
              </div>
            ))}
            {query.length === 0 && (
              <div style={{ textAlign:"center", padding:"20px 0" }}>
                <p style={{ color:"var(--c-dark)", fontSize:13, marginBottom:12 }}>Kuch type karein... sabse pehle Radhe Radhe 🌸</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
                  {["Radhe","Vrindavan","Janmashtami","Raas Leela","Holi","Banke Bihari"].map(tag => (
                    <button key={tag} onClick={() => setQuery(tag)} style={{ background:"var(--c-bg)", border:"0.5px solid var(--c-border)", borderRadius:16, padding:"5px 14px", fontSize:13, color:"var(--c-dark)", cursor:"pointer", fontFamily:"Georgia, serif" }}>{tag}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
