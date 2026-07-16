import { useState, useEffect } from "react";
import { INITIAL_COMMENTS, ALL_SEARCH_DATA } from "../data";
import { useT } from "../i18n";

/* ============================================================
   CONTACT PAGE — Comments (device par save) + Search
   ============================================================ */
const COMMENTS_KEY = "radhaDhamComments";

function loadComments() {
  try {
    const saved = JSON.parse(localStorage.getItem(COMMENTS_KEY));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch {}
  return INITIAL_COMMENTS;
}

export default function ContactPage() {
  const [comments, setComments] = useState(loadComments);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("comments");
  const [submitted, setSubmitted] = useState(false);
  const { t } = useT();

  useEffect(() => {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  }, [comments]);

  const typeColors = {
    Bhajan: { bg:"#FAEEDA", text:"#633806" },
    Leela:  { bg:"#EEEDFE", text:"#3C3489" },
    Festival:{ bg:"#EAF3DE", text:"#27500A" },
    Gallery: { bg:"var(--c-bg)", text:"var(--c-dark)" },
    Counter: { bg:"var(--c-bg)", text:"var(--c-primary)" },
  };

  const results = ALL_SEARCH_DATA.filter(d => query.length > 1 && d.title.toLowerCase().includes(query.toLowerCase()));

  function submit() {
    if (!name.trim() || !text.trim()) return;
    setComments([{ id: Date.now(), author: name, text, time: "Abhi abhi" }, ...comments]);
    setName(""); setText("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <div className="page-section">
      <div style={{ display:"flex", justifyContent:"center", gap:10, marginBottom:28 }}>
        {["comments","search"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab===t ? "var(--c-deep)" : "var(--c-bg)",
            color: tab===t ? "var(--c-soft)" : "var(--c-dark)",
            border: "0.5px solid var(--c-border)",
            borderRadius: 20,
            padding: "8px 22px",
            fontSize: 14,
            fontFamily: "Georgia, serif",
            cursor: "pointer",
          }}>
            {t==="comments" ? "💬 Anubhav Likhein" : "🔍 Khoj"}
          </button>
        ))}
      </div>

      {tab === "comments" && (
        <>
          <h2 className="section-heading">{t("h.contact")}</h2>
          <div className="section-divider" />
          <div className="comment-form">
            <h3>Apna anubhav share karein 🙏</h3>
            {submitted && (
              <div style={{ background:"#1D9E75", color:"#E1F5EE", borderRadius:8, padding:"8px 14px", marginBottom:10, fontSize:13 }}>
                ✅ Aapka anubhav share ho gaya! Jai Shri Radhe 🌸
              </div>
            )}
            <input type="text" placeholder="Aapka naam" value={name} onChange={e => setName(e.target.value)} />
            <textarea placeholder="Radha Rani ke baare mein apna anubhav ya bhav likhein..." value={text} onChange={e => setText(e.target.value)} />
            <button className="btn-submit" onClick={submit}>Submit Karein →</button>
          </div>
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <p className="comment-author">🙏 {c.author}</p>
              <p className="comment-text">{c.text}</p>
              <p className="comment-time">{c.time}</p>
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
