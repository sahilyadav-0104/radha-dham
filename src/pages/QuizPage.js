import { useState } from "react";
import { useT } from "../i18n";
import { whatsappShare } from "../data";
import { QUIZ_BANK } from "../quizData";

/* ============================================================
   RADHA KRISHNA QUIZ — 3 levels, har baar 12 random sawaal
   ============================================================ */
const LEVELS = [
  { id: "easy", name: "Easy", emoji: "🌱", desc: "Shuruaati bhakton ke liye — seedhe sawaal" },
  { id: "medium", name: "Medium", emoji: "🌸", desc: "Braj ki leelaon ke jaankaron ke liye" },
  { id: "hard", name: "Hard", emoji: "🏆", desc: "Param bhakton ke liye — gehri jaankari" },
];

const RATINGS = [
  { min: 12, title: "🏆 Param Bhakt!", text: "Poore 12/12! Radha Rani ki vishesh kripa hai aap par! 🌸" },
  { min: 9, title: "🌟 Maha Bhakt!", text: "Bahut khoob! Braj ki leelaon ke sacche jaankaar ho aap." },
  { min: 6, title: "🌸 Bhakt", text: "Achha score! Leelas aur Yatra page padhoge toh aur bhi seekh jaoge." },
  { min: 0, title: "🌱 Shuruaat", text: "Koi baat nahi — Leelas aur Yatra page padho, phir dobara khelo!" },
];

// Array ko shuffle karo (Fisher-Yates)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Bank se 12 random sawaal lo, har sawaal ke options bhi shuffle karo
function makeSession(levelId) {
  return shuffle(QUIZ_BANK[levelId]).slice(0, 12).map(q => {
    const order = shuffle([0, 1, 2, 3]);
    return {
      q: q.q,
      options: order.map(idx => q.o[idx]),
      answer: order.indexOf(q.a),
      info: q.i,
    };
  });
}

export default function QuizPage() {
  const { t } = useT();
  const [level, setLevel] = useState(null);
  const [session, setSession] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  function start(levelId) {
    setLevel(levelId);
    setSession(makeSession(levelId));
    setIdx(0); setPicked(null); setScore(0); setDone(false);
  }

  function pick(i) {
    if (picked !== null) return;
    setPicked(i);
    if (i === session[idx].answer) setScore(s => s + 1);
  }

  function next() {
    if (idx + 1 >= session.length) setDone(true);
    else { setIdx(idx + 1); setPicked(null); }
  }

  const levelInfo = LEVELS.find(l => l.id === level);

  // ---------- LEVEL SELECT ----------
  if (!level) {
    const total = Object.values(QUIZ_BANK).reduce((s, arr) => s + arr.length, 0);
    return (
      <div className="page-section" style={{ maxWidth: 560 }}>
        <h2 className="section-heading">{t("h.quiz")}</h2>
        <div className="section-divider" />
        <p style={{ textAlign: "center", fontSize: 14, color: "var(--c-dark)", marginBottom: 20 }}>
          Apna level chuno — har baar <b>12 naye random sawaal</b> milenge!
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {LEVELS.map(l => (
            <button key={l.id} className="quiz-level-btn" onClick={() => start(l.id)}>
              <span className="quiz-level-emoji">{l.emoji}</span>
              <span className="quiz-level-info">
                <b>{l.name}</b>
                <small>{l.desc}</small>
              </span>
              <span>›</span>
            </button>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--c-dark)", marginTop: 18 }}>
          📚 Question bank me abhi {total} sawaal hain — har quiz alag hoti hai!
        </p>
      </div>
    );
  }

  // ---------- RESULT ----------
  if (done) {
    const rating = RATINGS.find(r => score >= r.min);
    return (
      <div className="page-section" style={{ maxWidth: 560 }}>
        <h2 className="section-heading">{t("h.quiz")}</h2>
        <div className="section-divider" />
        <div className="quiz-result">
          <p style={{ fontSize: 13, color: "var(--c-dark)", margin: "0 0 6px" }}>{levelInfo.emoji} {levelInfo.name} Level</p>
          <p className="quiz-result-emoji">{rating.title}</p>
          <p className="quiz-result-score">{score} / {session.length}</p>
          <p className="quiz-result-text">{rating.text}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 18 }}>
            <button className="btn-cta" onClick={() => start(level)}>🔄 Naye Sawaal</button>
            <button className="quote-btn" onClick={() => setLevel(null)}>📊 Level Badlo</button>
            <a
              className="share-btn"
              style={{ alignSelf: "center" }}
              href={whatsappShare(`🎯 Radha Krishna Quiz (${levelInfo.name} level) me mera score: ${score}/${session.length} — ${rating.title}\n\nAap bhi khelo: https://shriradharani.in\n\n🌸 Jai Shri Radhe 🌸`)}
              target="_blank" rel="noreferrer"
            >WhatsApp par share karo ↗</a>
          </div>
        </div>
      </div>
    );
  }

  // ---------- QUIZ ----------
  const q = session[idx];
  return (
    <div className="page-section" style={{ maxWidth: 560 }}>
      <h2 className="section-heading">{t("h.quiz")}</h2>
      <div className="section-divider" />

      <div className="quiz-progress">
        <span>{levelInfo.emoji} {levelInfo.name} · Sawaal {idx + 1} / {session.length}</span>
        <span>Score: {score}</span>
      </div>
      <div className="counter-mala-track" style={{ marginBottom: 20 }}>
        <div className="counter-mala-fill" style={{ width: `${(idx / session.length) * 100}%` }} />
      </div>

      <div className="quiz-card">
        <p className="quiz-question">{q.q}</p>
        <div className="quiz-options">
          {q.options.map((opt, i) => {
            let cls = "quiz-option";
            if (picked !== null) {
              if (i === q.answer) cls += " correct";
              else if (i === picked) cls += " wrong";
              else cls += " disabled";
            }
            return (
              <button key={i} className={cls} onClick={() => pick(i)}>
                {String.fromCharCode(65 + i)}. {opt}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div className={`quiz-info${picked === q.answer ? " right" : " wrong"}`}>
            {picked === q.answer ? "✅ Sahi jawab!" : "❌ Galat — sahi jawab: " + q.options[q.answer]}
            <p>{q.info}</p>
          </div>
        )}
        {picked !== null && (
          <button className="btn-cta" style={{ marginTop: 14 }} onClick={next}>
            {idx + 1 >= session.length ? "Result Dekho →" : "Agla Sawaal →"}
          </button>
        )}
      </div>
    </div>
  );
}
