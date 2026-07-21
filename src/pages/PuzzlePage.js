import { useState, useEffect } from "react";
import { useT } from "../i18n";
import { whatsappShare, getPuzzleImages } from "../data";

/* ============================================================
   RADHA KRISHNA PUZZLE — slide puzzle (tukde sarka ke pic banao)
   Photos: default Makhan Chori + admin ki "Puzzle" album wali photos
   ============================================================ */
const PICS = getPuzzleImages();

// Solved state se random valid moves — hamesha solvable puzzle
function shuffleBoard(n, moves = 300) {
  const total = n * n;
  const board = Array.from({ length: total }, (_, i) => i); // last = empty
  let empty = total - 1;
  let prev = -1;
  for (let m = 0; m < moves; m++) {
    const r = Math.floor(empty / n), c = empty % n;
    const options = [];
    if (r > 0) options.push(empty - n);
    if (r < n - 1) options.push(empty + n);
    if (c > 0) options.push(empty - 1);
    if (c < n - 1) options.push(empty + 1);
    const pick = [];
    for (const o of options) { if (o !== prev) pick.push(o); }
    const from = pick[Math.floor(Math.random() * pick.length)];
    board[empty] = board[from];
    board[from] = total - 1;
    prev = empty;
    empty = from;
  }
  return board;
}

function isSolved(board) {
  return board.every((v, i) => v === i);
}

export default function PuzzlePage() {
  const { t } = useT();
  const [n, setN] = useState(3); // 3x3 ya 4x4
  const [board, setBoard] = useState(() => shuffleBoard(3));
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [picIdx, setPicIdx] = useState(0);          // kaunsi photo ka puzzle
  const [aspect, setAspect] = useState(1);          // photo ke hisaab se board ka shape
  const [best, setBest] = useState(() => {
    try { return JSON.parse(localStorage.getItem("radhaDhamPuzzleBest")) || {}; }
    catch { return {}; }
  });

  const total = n * n;
  const emptyVal = total - 1;
  const pic = PICS[picIdx] || PICS[0];
  const IMG_SRC = pic.src;

  // Photo ka asli shape le lo taaki tasveer khinchi hui na lage
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) setAspect(img.naturalWidth / img.naturalHeight);
    };
    img.src = IMG_SRC;
  }, [IMG_SRC]);

  function newGame(size = n) {
    setN(size);
    setBoard(shuffleBoard(size));
    setMoves(0);
    setWon(false);
  }

  function pickPic(i) {
    setPicIdx(i);
    setBoard(shuffleBoard(n));
    setMoves(0);
    setWon(false);
  }

  function tapTile(idx) {
    if (won) return;
    const empty = board.indexOf(emptyVal);
    const r1 = Math.floor(idx / n), c1 = idx % n;
    const r2 = Math.floor(empty / n), c2 = empty % n;
    // sirf empty ke bagal wali tile sarkegi
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return;
    const next = [...board];
    next[empty] = next[idx];
    next[idx] = emptyVal;
    setBoard(next);
    const mv = moves + 1;
    setMoves(mv);
    if (isSolved(next)) {
      setWon(true);
      if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
      setBest(prev => {
        const key = `${n}x${n}`;
        if (!prev[key] || mv < prev[key]) {
          const updated = { ...prev, [key]: mv };
          localStorage.setItem("radhaDhamPuzzleBest", JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    }
  }

  // Size badle to naya game
  useEffect(() => { /* newGame n badalne par button se hota hai */ }, []);

  const bestKey = `${n}x${n}`;

  return (
    <div className="page-section" style={{ maxWidth: 560 }}>
      <h2 className="section-heading">{t("h.puzzle")}</h2>
      <div className="section-divider" />

      {/* Difficulty + info */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button className={`lang-chip${n === 3 ? " active" : ""}`} onClick={() => newGame(3)}>🌱 Aasaan (3×3)</button>
        <button className={`lang-chip${n === 4 ? " active" : ""}`} onClick={() => newGame(4)}>🏆 Mushkil (4×4)</button>
        <button className="lang-chip" onClick={() => setShowHint(h => !h)}>{showHint ? "🙈 Hint band" : "👀 Puri pic dekho"}</button>
      </div>

      {/* Photo chuno — admin ki "Puzzle" album wali photos yahan aati hain */}
      {PICS.length > 1 && (
        <>
          <p style={{ textAlign: "center", fontSize: 12, color: "var(--c-dark)", margin: "0 0 8px" }}>🖼️ Photo chuno:</p>
          <div className="puzzle-pics">
            {PICS.map((p, i) => (
              <button key={p.src} className={`puzzle-pic${picIdx === i ? " active" : ""}`}
                onClick={() => pickPic(i)} title={p.name}>
                <img src={p.src} alt={p.name} />
              </button>
            ))}
          </div>
        </>
      )}

      <div className="puzzle-stats">
        <span>Chaal: <b>{moves}</b></span>
        {best[bestKey] && <span>🏅 Best: <b>{best[bestKey]}</b></span>}
      </div>

      {/* Board — hint isi ke side (kone) me chhoti si dikhti hai */}
      <div className="puzzle-area">
        {showHint && (
          <div className="puzzle-hint">
            <img src={IMG_SRC} alt={pic.name} />
            <span>Yehi banani hai 🧈</span>
          </div>
        )}
        <div className="puzzle-board" style={{ "--n": n, aspectRatio: String(aspect) }}>
        {board.map((val, idx) => {
          if (val === emptyVal && !won) {
            return <div key={idx} className="puzzle-tile empty" />;
          }
          const row = Math.floor(val / n), col = val % n;
          return (
            <button
              key={idx}
              className={`puzzle-tile${won ? " won" : ""}`}
              onClick={() => tapTile(idx)}
              style={{
                backgroundImage: `url(${IMG_SRC})`,
                backgroundSize: `${n * 100}% ${n * 100}%`,
                backgroundPosition: `${n > 1 ? (col / (n - 1)) * 100 : 0}% ${n > 1 ? (row / (n - 1)) * 100 : 0}%`,
              }}
            />
          );
        })}
        </div>
      </div>

      {/* Jeet gaye! */}
      {won ? (
        <div className="puzzle-win">
          <p className="puzzle-win-title">🎉 Badhai ho! Jai Shri Radhe! 🌸</p>
          <p className="puzzle-win-text">
            Aapne <b>{moves} chaalon</b> me {pic.name} ki picture bana li!
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
            <button className="btn-cta" onClick={() => newGame(n)}>🔄 Phir Khelo</button>
            <a
              className="share-btn"
              style={{ alignSelf: "center" }}
              href={whatsappShare(`🧩 Maine Radha Krishna Puzzle (${n}x${n}) sirf ${moves} chaalon me pura kiya! 🎉\n\nAap bhi khelo: https://shriradharani.in\n\n🌸 Jai Shri Radhe 🌸`)}
              target="_blank" rel="noreferrer"
            >WhatsApp par share karo ↗</a>
          </div>
        </div>
      ) : (
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--c-dark)", marginTop: 14, lineHeight: 1.7 }}>
          🧩 Khali jagah ke bagal wali tile pe tap karo — wo sarak jayegi.<br />
          Saare tukde sahi jagah lagao aur poori pic banao!
        </p>
      )}
    </div>
  );
}
