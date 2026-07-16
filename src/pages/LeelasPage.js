import { useState } from "react";
import { LEELAS, QUOTES, whatsappShare } from "../data";

/* ============================================================
   LEELAS PAGE — Full stories + Quotes
   ============================================================ */
export default function LeelasPage() {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const q = QUOTES[quoteIdx];

  return (
    <div className="page-section">
      <h2 className="section-heading">Leelas & Quotes</h2>
      <div className="section-divider" />

      {/* Quote */}
      <div className="quote-card">
        <span className="quote-mark">"</span>
        <p className="quote-text">{q.text}</p>
        <p className="quote-source">{q.source}</p>
      </div>
      <div style={{ textAlign:"center", marginBottom:40, display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
        <button className="quote-btn" onClick={() => setQuoteIdx((quoteIdx+1)%QUOTES.length)}>
          Aur ek doha dikhao → ({quoteIdx+1}/{QUOTES.length})
        </button>
        <a
          className="share-btn"
          href={whatsappShare(`🪔 "${q.text}"\n${q.source}\n\n🌸 Jai Shri Radhe 🌸`)}
          target="_blank" rel="noreferrer"
        >WhatsApp ↗</a>
      </div>

      {/* Leelas */}
      <h3 style={{ fontSize:18, color:"#72243E", marginBottom:16, textAlign:"center" }}>Radha Krishna ki Leelayein</h3>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {LEELAS.map((l, i) => (
          <div key={i} style={{ background:l.bg, border:`0.5px solid ${l.border}`, borderRadius:14, overflow:"hidden" }}>
            <div
              onClick={() => setExpanded(expanded===i ? null : i)}
              style={{ padding:"18px 20px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between" }}
            >
              <h4 style={{ fontSize:16, color:l.text, fontWeight:500, margin:0 }}>{l.title}</h4>
              <span style={{ fontSize:20 }}>{expanded===i ? "▲" : "▼"}</span>
            </div>
            {expanded === i && (
              <div style={{ padding:"0 20px 20px" }}>
                <div style={{ borderTop:`0.5px solid ${l.border}`, paddingTop:14 }}>
                  {l.story.split("\n\n").map((para, pi) => (
                    <p key={pi} style={{ fontSize:14, color:l.text, lineHeight:1.9, marginBottom:pi < l.story.split("\n\n").length-1 ? 14 : 0 }}>
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <p style={{ textAlign:"center", fontSize:13, color:"#993556", marginTop:20 }}>
        Kisi bhi leela par click karein puri kahani padhne ke liye 🌸
      </p>
    </div>
  );
}
