import { useState } from "react";
import { useT } from "../i18n";
import { whatsappShare } from "../data";

/* ============================================================
   RADHA KRISHNA QUIZ — 12 sawaal, score aur share ke saath
   ============================================================ */
const QUESTIONS = [
  {
    q: "Radha Rani ka janm kis gaon me hua maana jata hai?",
    options: ["Vrindavan", "Barsana", "Gokul", "Mathura"],
    answer: 1,
    info: "Barsana Radha Rani ka gaon hai — yahin unka Shriji Mandir pahadi par bana hai.",
  },
  {
    q: "Radha Rani ke pita ka naam kya tha?",
    options: ["Nand Baba", "Vasudev", "Vrishbhanu", "Kans"],
    answer: 2,
    info: "Vrishbhanu ji Barsana ke raja the aur Radha Rani unki ladli beti thin.",
  },
  {
    q: "Shri Krishna ka janm kahan hua tha?",
    options: ["Gokul", "Vrindavan", "Dwarka", "Mathura ki jail me"],
    answer: 3,
    info: "Krishna ka janm Mathura me Kans ki jail me hua tha — aaj wahan Krishna Janmabhoomi mandir hai.",
  },
  {
    q: "Krishna ne Govardhan Parvat kitne din tak uthaya tha?",
    options: ["1 din", "3 din", "7 din", "11 din"],
    answer: 2,
    info: "Saat din saat raat Krishna ne apni chhoti ungli par Govardhan uthaya aur Vrindavan ko Indra ki varsha se bachaya.",
  },
  {
    q: "Nidhivan ke baare me kya manyata hai?",
    options: [
      "Wahan sona milta hai",
      "Raat ko Raas Leela hoti hai",
      "Wahan Yamuna nikalti hai",
      "Wahan Holi khali jaati hai",
    ],
    answer: 1,
    info: "Manyata hai ki har raat Nidhivan me Radha Krishna ka Raas hota hai — isliye suraj dhalne ke baad wahan koi nahi rukta.",
  },
  {
    q: "Lathmar Holi kis jagah ki sabse famous hai?",
    options: ["Barsana", "Agra", "Kashi", "Haridwar"],
    answer: 0,
    info: "Barsana ki Lathmar Holi world-famous hai — Radha ki sakhiyan Nandgaon ke gwalon ko laathi maarti hain.",
  },
  {
    q: "Banke Bihari ji ki murti kisne prakat ki thi?",
    options: ["Tulsidas", "Swami Haridas", "Surdas", "Meerabai"],
    answer: 1,
    info: "Swami Haridas ji (Tansen ke guru) ne Nidhivan me apni bhakti se Banke Bihari ji ko prakat kiya tha.",
  },
  {
    q: "Krishna ki foster mata (palan-poshan karne wali maa) kaun thin?",
    options: ["Devki", "Rohini", "Yashoda", "Kirti"],
    answer: 2,
    info: "Yashoda maiya ne Gokul me Krishna ka palan-poshan kiya — 'Yashoda ka Nandlala' isi liye kehte hain.",
  },
  {
    q: "Maha Raas kis raat ko hua tha?",
    options: ["Janmashtami", "Sharad Purnima", "Diwali", "Radhashtami"],
    answer: 1,
    info: "Sharad Purnima ki chandni raat me Yamuna kinare Maha Raas hua tha — har gopi ke saath ek Krishna.",
  },
  {
    q: "Govardhan Parikrama kitne kilometer ki hoti hai?",
    options: ["7 km", "11 km", "21 km", "51 km"],
    answer: 2,
    info: "Poori Govardhan Parikrama 21 km ki hai — lakhon bhakt nange paon karte hain.",
  },
  {
    q: "Prem Mandir (Vrindavan) kisne banwaya?",
    options: [
      "Jagadguru Kripalu Ji Maharaj",
      "Srila Prabhupada",
      "Birla parivar",
      "Akshaya Patra",
    ],
    answer: 0,
    info: "Prem Mandir 2012 me Jagadguru Kripalu Ji Maharaj ne banwaya — safed Italian marble se, raat ki lighting dekhne layak hai.",
  },
  {
    q: "Krishna ke bachpan ka gaon kaun sa tha jahan Nand Baba rehte the?",
    options: ["Barsana", "Mathura", "Kurukshetra", "Gokul / Nandgaon"],
    answer: 3,
    info: "Janm ke baad Krishna Gokul laye gaye, phir Nand Baba ka parivar Nandgaon aa gaya — dono Krishna ki bachpan ki leela bhumi hain.",
  },
];

const RATINGS = [
  { min: 12, title: "🏆 Param Bhakt!", text: "Poore 12/12! Radha Rani ki vishesh kripa hai aap par! 🌸" },
  { min: 9, title: "🌟 Maha Bhakt!", text: "Bahut khoob! Braj ki leelaon ke sacche jaankaar ho aap." },
  { min: 6, title: "🌸 Bhakt", text: "Achha score! Leelas page padhoge toh aur bhi seekh jaoge." },
  { min: 0, title: "🌱 Shuruaat", text: "Koi baat nahi — Leelas aur Yatra page padho, phir dobara khelo!" },
];

export default function QuizPage() {
  const { t } = useT();
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null); // is sawaal me kya chuna
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = QUESTIONS[idx];

  function pick(i) {
    if (picked !== null) return; // ek hi baar
    setPicked(i);
    if (i === q.answer) setScore(s => s + 1);
  }

  function next() {
    if (idx + 1 >= QUESTIONS.length) setDone(true);
    else { setIdx(idx + 1); setPicked(null); }
  }

  function restart() {
    setIdx(0); setPicked(null); setScore(0); setDone(false);
  }

  if (done) {
    const rating = RATINGS.find(r => score >= r.min);
    return (
      <div className="page-section" style={{ maxWidth: 560 }}>
        <h2 className="section-heading">{t("h.quiz")}</h2>
        <div className="section-divider" />
        <div className="quiz-result">
          <p className="quiz-result-emoji">{rating.title}</p>
          <p className="quiz-result-score">{score} / {QUESTIONS.length}</p>
          <p className="quiz-result-text">{rating.text}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 18 }}>
            <button className="btn-cta" onClick={restart}>🔄 Dobara Khelo</button>
            <a
              className="share-btn"
              style={{ alignSelf: "center" }}
              href={whatsappShare(`🎯 Radha Krishna Quiz me mera score: ${score}/${QUESTIONS.length} — ${rating.title}\n\nAap bhi khelo: https://shriradharani.in\n\n🌸 Jai Shri Radhe 🌸`)}
              target="_blank" rel="noreferrer"
            >WhatsApp par share karo ↗</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-section" style={{ maxWidth: 560 }}>
      <h2 className="section-heading">{t("h.quiz")}</h2>
      <div className="section-divider" />

      {/* Progress */}
      <div className="quiz-progress">
        <span>Sawaal {idx + 1} / {QUESTIONS.length}</span>
        <span>Score: {score}</span>
      </div>
      <div className="counter-mala-track" style={{ marginBottom: 20 }}>
        <div className="counter-mala-fill" style={{ width: `${((idx) / QUESTIONS.length) * 100}%` }} />
      </div>

      {/* Sawaal */}
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
            {idx + 1 >= QUESTIONS.length ? "Result Dekho →" : "Agla Sawaal →"}
          </button>
        )}
      </div>
    </div>
  );
}
