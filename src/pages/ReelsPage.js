import { useState, useRef, useEffect, useCallback } from "react";
import { whatsappShare } from "../data";

const SITE = "https://shriradharani.in";

// Ek reel ka apna link — ye khulte hi wahi reel chalti hai
function reelLink(reel) {
  return `${SITE}/r/${encodeURIComponent(reel.id)}`;
}

// Phone par native share sheet, warna WhatsApp
function shareReel(reel) {
  const url = reelLink(reel);
  const text = `${reel.caption ? reel.caption + "\n\n" : ""}🌸 Radha Dham par ye status dekhein 🌸\nJai Shri Radhe`;
  if (navigator.share) {
    navigator.share({ title: reel.caption || "Radha Dham", text, url }).catch(() => {});
    return;
  }
  window.open(whatsappShare(`${text}\n\n${url}`), "_blank", "noreferrer");
}

/* ============================================================
   STATUS / REELS — Instagram-reels style vertical video feed
   - Har reel full screen, scroll-snap se ek-ek karke aati hai
   - Jo reel screen par hai wahi apne aap chalti hai
   - Options: ❤️ like, ↗ share, 🔊 mute, tap se play/pause
   ============================================================ */
const LIKED_KEY = "radhaDhamLikedReels";

function loadLiked() {
  try { return new Set(JSON.parse(localStorage.getItem(LIKED_KEY)) || []); }
  catch { return new Set(); }
}
function saveLiked(set) {
  localStorage.setItem(LIKED_KEY, JSON.stringify([...set]));
}

// Reels ko har baar alag order me dikhao
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Reel({ reel, active, muted, onToggleMute, liked, onLike }) {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [burst, setBurst] = useState(false); // double-tap heart animation

  // Active reel apne aap chale, baaki ruk jaayein (sirf native video)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) { v.play().then(() => setPaused(false)).catch(() => {}); }
    else { v.pause(); v.currentTime = 0; }
  }, [active]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  function tapVideo() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPaused(false); } else { v.pause(); setPaused(true); }
  }

  function doubleTapLike() {
    if (!liked) onLike();
    setBurst(true);
    setTimeout(() => setBurst(false), 700);
  }

  return (
    <div className="reel">
      <div className="reel-media" onClick={tapVideo} onDoubleClick={doubleTapLike}>
        {reel.type === "youtube" ? (
          active ? (
            <iframe
              title={reel.caption || "reel"}
              className="reel-yt"
              src={`https://www.youtube-nocookie.com/embed/${reel.ytId}?autoplay=1&loop=1&playlist=${reel.ytId}&mute=${muted ? 1 : 0}&controls=0&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3&fs=0&disablekb=1`}
              allow="autoplay; encrypted-media; picture-in-picture"
            />
          ) : (
            <img src={`https://i.ytimg.com/vi/${reel.ytId}/hqdefault.jpg`} alt="" className="reel-thumb" />
          )
        ) : reel.type === "instagram" ? (
          <iframe
            title={reel.caption || "reel"}
            className="reel-ig"
            src={`https://www.instagram.com/${reel.igKind || "reel"}/${reel.igCode}/embed/`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            scrolling="no"
          />
        ) : (
          <video ref={videoRef} src={reel.src} loop playsInline muted={muted} preload="metadata" />
        )}

        {burst && <div className="reel-burst">❤️</div>}
        {reel.type === "video" && paused && active && <div className="reel-playicon">▶</div>}
      </div>

      {/* Right side action bar */}
      <div className="reel-actions">
        <button className={`reel-act${liked ? " liked" : ""}`} onClick={onLike}>
          <span className="reel-act-icon">{liked ? "❤️" : "🤍"}</span>
          <span className="reel-act-count">{reel.likes || 0}</span>
        </button>
        <button
          className="reel-act"
          onClick={e => { e.stopPropagation(); shareReel(reel); }}
        >
          <span className="reel-act-icon">↗</span>
          <span className="reel-act-count">Share</span>
        </button>
        <button className="reel-act" onClick={onToggleMute}>
          <span className="reel-act-icon">{muted ? "🔇" : "🔊"}</span>
          <span className="reel-act-count">{muted ? "Off" : "On"}</span>
        </button>
      </div>

      {/* Bottom caption */}
      <div className="reel-caption">
        <p className="reel-author">🌸 {reel.author || "Radha Dham"}</p>
        {reel.caption && <p className="reel-text">{reel.caption}</p>}
      </div>
    </div>
  );
}

export default function ReelsPage({ fullScreen, onExit, startId }) {
  const [reels, setReels] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  // Voice hamesha ON se shuru (user Status pe tap karke aaya hai, isliye
  // browser sound allow karta hai). Agar user ne mute kiya tha to wahi yaad rehta hai.
  const [muted, setMuted] = useState(() => localStorage.getItem("radhaDhamReelsMuted") === "1");
  const [liked, setLiked] = useState(loadLiked);
  const containerRef = useRef(null);
  const reelRefs = useRef([]);

  useEffect(() => {
    let alive = true;
    fetch("/api/reels")
      .then(r => r.json())
      .then(j => {
        if (!alive) return;
        const list = shuffle(j.reels || []);
        // Share link se aaye ho to wahi reel sabse pehle chalegi
        if (startId) {
          const i = list.findIndex(r => String(r.id) === String(startId));
          if (i > 0) list.unshift(...list.splice(i, 1));
        }
        setReels(list);
      })
      .catch(() => { if (alive) setReels([]); });
    return () => { alive = false; };
  }, [startId]);

  // Kaunsi reel screen par hai — usse active karo
  useEffect(() => {
    if (!reels || reels.length === 0) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio > 0.6) {
          const idx = Number(e.target.dataset.idx);
          setActiveIdx(idx);
        }
      });
    }, { threshold: [0.6] });
    reelRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, [reels]);

  const likeReel = useCallback((reel) => {
    const already = liked.has(reel.id);
    const dir = already ? -1 : 1;
    // Turant UI update (optimistic)
    setReels(prev => prev.map(r => r.id === reel.id ? { ...r, likes: Math.max(0, (r.likes || 0) + dir) } : r));
    setLiked(prev => {
      const next = new Set(prev);
      if (already) next.delete(reel.id); else next.add(reel.id);
      saveLiked(next);
      return next;
    });
    fetch("/api/reels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "like", id: reel.id, dir }),
    }).catch(() => {});
  }, [liked]);

  if (reels === null) {
    return (
      <div className="page-section" style={{ textAlign: "center", color: "var(--c-dark)" }}>
        {onExit && <button className="reel-back" onClick={onExit} aria-label="Wapas">‹</button>}
        Load ho raha hai... 🌸
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="page-section" style={{ textAlign: "center" }}>
        {onExit && <button className="reel-back" onClick={onExit} aria-label="Wapas">‹</button>}
        <h2 className="section-heading">🎬 Status</h2>
        <div className="section-divider" />
        <div style={{ background: "var(--c-bg)", border: "0.5px dashed var(--c-border)", borderRadius: 16, padding: "40px 24px" }}>
          <p style={{ fontSize: 40, marginBottom: 10 }}>🎬</p>
          <p style={{ color: "var(--c-deep)", fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Abhi koi status nahi hai</p>
          <p style={{ color: "var(--c-dark)", fontSize: 13, lineHeight: 1.7 }}>
            Jald hi Radha Rani ke sundar reels yahan aayenge 🌸
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`reels-wrap${fullScreen ? " full" : ""}`} ref={containerRef}>
      {onExit && (
        <button className="reel-back" onClick={onExit} aria-label="Wapas">‹</button>
      )}
      {reels.map((reel, i) => (
        <div key={reel.id} data-idx={i} ref={el => (reelRefs.current[i] = el)} className="reel-slot">
          <Reel
            reel={reel}
            active={activeIdx === i}
            muted={muted}
            onToggleMute={() => setMuted(m => { localStorage.setItem("radhaDhamReelsMuted", m ? "0" : "1"); return !m; })}
            liked={liked.has(reel.id)}
            onLike={() => likeReel(reel)}
          />
        </div>
      ))}
    </div>
  );
}
