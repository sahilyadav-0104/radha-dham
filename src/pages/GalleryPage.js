import { useState } from "react";
import { GALLERY_ITEMS } from "../data";

/* ============================================================
   GALLERY PAGE — with lightbox
   ============================================================ */
export default function GalleryPage() {
  const [selected, setSelected] = useState(null);
  const [errors, setErrors] = useState({});
  const fallbackEmoji = ["🌸","🪔","🌿","🎨","⛰️","🌺","🎭","🛕","🌙","🏵️","🪷","✨"];

  return (
    <div className="page-section">
      <h2 className="section-heading">Photo Gallery</h2>
      <div className="section-divider" />
      <div className="gallery-grid">
        {GALLERY_ITEMS.map((item, i) => (
          <div key={i} className="gallery-item" onClick={() => setSelected(i)} style={{ position: "relative" }}>
            {!errors[i] ? (
              <img src={item.url} alt={item.label} onError={() => setErrors(p => ({...p,[i]:true}))}
                style={{ width:"100%", height:"100%", objectFit:"cover", position:"absolute", top:0, left:0 }} />
            ) : (
              <div style={{ width:"100%", height:"100%", background:"#FBEAF0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:44 }}>
                {fallbackEmoji[i % fallbackEmoji.length]}
              </div>
            )}
            <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"linear-gradient(transparent,rgba(114,36,62,0.88))", padding:"22px 8px 8px" }}>
              <span style={{ fontSize:11, color:"#F4C0D1", display:"block", textAlign:"center" }}>{item.label}</span>
            </div>
          </div>
        ))}
      </div>
      {selected !== null && (
        <div onClick={() => setSelected(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, flexDirection:"column", gap:14 }}>
          <button onClick={() => setSelected(null)} style={{ position:"absolute", top:18, right:22, background:"transparent", border:"none", color:"#F4C0D1", fontSize:30, cursor:"pointer" }}>✕</button>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <button onClick={e => { e.stopPropagation(); setSelected((selected-1+GALLERY_ITEMS.length)%GALLERY_ITEMS.length); }}
              style={{ background:"#72243E", border:"none", color:"#F4C0D1", fontSize:24, borderRadius:"50%", width:46, height:46, cursor:"pointer" }}>‹</button>
            <div style={{ maxWidth:520, maxHeight:420, borderRadius:14, overflow:"hidden", border:"2px solid #ED93B1" }}>
              {!errors[selected] ? (
                <img src={GALLERY_ITEMS[selected].url} alt={GALLERY_ITEMS[selected].label}
                  style={{ maxWidth:520, maxHeight:420, display:"block", objectFit:"contain" }} />
              ) : (
                <div style={{ width:300, height:220, background:"#FBEAF0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:60 }}>
                  {fallbackEmoji[selected % fallbackEmoji.length]}
                </div>
              )}
            </div>
            <button onClick={e => { e.stopPropagation(); setSelected((selected+1)%GALLERY_ITEMS.length); }}
              style={{ background:"#72243E", border:"none", color:"#F4C0D1", fontSize:24, borderRadius:"50%", width:46, height:46, cursor:"pointer" }}>›</button>
          </div>
          <p style={{ color:"#F4C0D1", fontSize:15 }}>{GALLERY_ITEMS[selected].label}</p>
          <p style={{ color:"#ED93B1", fontSize:12 }}>{selected+1} / {GALLERY_ITEMS.length}</p>
        </div>
      )}
      <p style={{ textAlign:"center", fontSize:13, color:"#993556", marginTop:20 }}>
        Apni Radha Rani ki photo share karne ke liye hume Contact mein likhein 🌸
      </p>
    </div>
  );
}
