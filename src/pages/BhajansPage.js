import { useState, useRef, useEffect } from "react";
import { BHAJANS } from "../data";

/* ============================================================
   BHAJAN PLAYER — Audio player with real MP3 + lyrics
   ============================================================ */
export default function BhajansPage() {
  const [current, setCurrent] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;
    const a = audioRef.current;
    const onTime = () => setProgress(a.currentTime);
    const onDur = () => setDuration(a.duration);
    const onEnd = () => { setIsPlaying(false); setProgress(0); };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onDur);
    a.addEventListener("ended", onEnd);
    return () => { a.removeEventListener("timeupdate", onTime); a.removeEventListener("loadedmetadata", onDur); a.removeEventListener("ended", onEnd); };
  }, [current]);

  function play(idx) {
    setAudioError(false);
    if (current === idx) {
      if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
      else { audioRef.current.play().catch(() => setAudioError(true)); setIsPlaying(true); }
    } else {
      setCurrent(idx);
      setProgress(0);
      setIsPlaying(true);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(() => setAudioError(true));
        }
      }, 100);
    }
  }

  function seek(e) {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  }

  function fmt(s) {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s/60), sec = Math.floor(s%60);
    return `${m}:${sec.toString().padStart(2,"0")}`;
  }

  function next() { const n = current === null ? 0 : (current+1)%BHAJANS.length; setCurrent(n); setProgress(0); setIsPlaying(true); setTimeout(()=>{ audioRef.current?.play().catch(()=>setAudioError(true)); },100); }
  function prev() { const n = current === null ? 0 : (current-1+BHAJANS.length)%BHAJANS.length; setCurrent(n); setProgress(0); setIsPlaying(true); setTimeout(()=>{ audioRef.current?.play().catch(()=>setAudioError(true)); },100); }

  return (
    <div className="page-section">
      <h2 className="section-heading">Bhajan Player</h2>
      <div className="section-divider" />

      {current !== null && (
        <audio ref={audioRef} src={BHAJANS[current].src} crossOrigin="anonymous" />
      )}

      {/* Player Bar */}
      {current !== null && (
        <div style={{ background:"#72243E", borderRadius:16, padding:"16px 20px", marginBottom:28, border:"0.5px solid #993556" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
            <img src={BHAJANS[current].cover} alt="" onError={e=>e.target.style.display="none"}
              style={{ width:56, height:56, borderRadius:10, objectFit:"cover", flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <p style={{ color:"#FAC775", fontSize:16, fontWeight:500, margin:0 }}>{BHAJANS[current].title}</p>
              <p style={{ color:"#F4C0D1", fontSize:12, margin:"3px 0 0" }}>{BHAJANS[current].singer}</p>
            </div>
          </div>
          {audioError && (
            <p style={{ color:"#FAC775", fontSize:12, textAlign:"center", marginBottom:10, background:"rgba(255,255,255,0.1)", borderRadius:8, padding:"6px 12px" }}>
              ⚠️ Yeh bhajan load nahi hua. Internet check karein ya next try karein.
            </p>
          )}
          {/* Lyrics — saath mein gaayein */}
          {BHAJANS[current].lyrics && (
            <div style={{ background:"rgba(0,0,0,0.25)", borderRadius:10, padding:"10px 16px", marginBottom:12, textAlign:"center" }}>
              {BHAJANS[current].lyrics.split("\n").map((line, li) => (
                <p key={li} style={{ color:"#FBEAF0", fontSize:15, lineHeight:1.9, margin:0 }}>{line}</p>
              ))}
            </div>
          )}
          {/* Progress bar */}
          <div onClick={seek} style={{ background:"#993556", borderRadius:4, height:5, cursor:"pointer", marginBottom:6, position:"relative" }}>
            <div style={{ width:`${duration ? (progress/duration*100) : 0}%`, height:"100%", background:"#FAC775", borderRadius:4 }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#F4C0D1", marginBottom:12 }}>
            <span>{fmt(progress)}</span><span>{fmt(duration)}</span>
          </div>
          {/* Controls */}
          <div style={{ display:"flex", justifyContent:"center", gap:20, alignItems:"center" }}>
            <button onClick={prev} style={{ background:"#993556", border:"none", color:"#F4C0D1", borderRadius:"50%", width:40, height:40, cursor:"pointer", fontSize:18 }}>⏮</button>
            <button onClick={() => play(current)} style={{ background:"#FAC775", border:"none", color:"#412402", borderRadius:"50%", width:52, height:52, cursor:"pointer", fontSize:22 }}>
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button onClick={next} style={{ background:"#993556", border:"none", color:"#F4C0D1", borderRadius:"50%", width:40, height:40, cursor:"pointer", fontSize:18 }}>⏭</button>
          </div>
        </div>
      )}

      {/* Bhajan List */}
      <div className="bhajan-list">
        {BHAJANS.map((b, i) => (
          <div key={b.id} className={`bhajan-card${current===i ? " playing" : ""}`} onClick={() => play(i)}>
            <div style={{ position:"relative", flexShrink:0 }}>
              <img src={b.cover} alt="" onError={e=>e.target.style.display="none"}
                style={{ width:56, height:42, borderRadius:8, objectFit:"cover", display:"block" }} />
              <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.3)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ color:"white", fontSize:16 }}>{current===i && isPlaying ? "⏸" : "▶"}</span>
              </div>
            </div>
            <div className="bhajan-info">
              <p className="bhajan-title">{b.title}</p>
              <p className="bhajan-singer">{b.singer}</p>
            </div>
            <span className="bhajan-duration">{b.duration}</span>
          </div>
        ))}
      </div>

      <p style={{ textAlign:"center", fontSize:12, color:"#854F0B", marginTop:20, lineHeight:1.7 }}>
        🎵 Bhajans ke liye stable internet connection zaroori hai.<br/>
        Agar load na ho toh thoda wait karein ya next bhajan try karein.
      </p>
    </div>
  );
}
