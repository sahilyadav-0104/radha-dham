import { useState, useEffect } from "react";
import { MANTRAS } from "../data";

/* ============================================================
   JAPA COUNTER — Naam jaap ka hisaab (device par save hota hai)
   Streak, daily goal aur 7-din ki history ke saath
   ============================================================ */
const COUNTER_KEY = "japaCounterData";
const GOAL_OPTIONS = [108, 324, 540, 1080]; // 1, 3, 5, 10 mala

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayKeys() {
  const now = new Date();
  const dayKey = dateKey(now);
  return { dayKey, monthKey: dayKey.slice(0, 7), yearKey: dayKey.slice(0, 4) };
}

// Sirf pichle 30 din ki history rakho
function pruneHistory(history) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffKey = dateKey(cutoff);
  const out = {};
  for (const [k, v] of Object.entries(history || {})) {
    if (k >= cutoffKey) out[k] = v;
  }
  return out;
}

function loadCounter() {
  const keys = todayKeys();
  let d = {};
  try { d = JSON.parse(localStorage.getItem(COUNTER_KEY)) || {}; } catch { d = {}; }
  return {
    total: d.total || 0,
    day: d.dayKey === keys.dayKey ? (d.day || 0) : 0,
    month: d.monthKey === keys.monthKey ? (d.month || 0) : 0,
    year: d.yearKey === keys.yearKey ? (d.year || 0) : 0,
    mantra: d.mantra || 0,
    goal: d.goal || 108,
    history: pruneHistory(d.history),
    ...keys,
  };
}

// Lagatar kitne din jaap hua (aaj ya kal se peeche gin ke)
function calcStreak(history, todayCount) {
  const d = new Date();
  let streak = 0;
  if (todayCount > 0) {
    streak = 1;
  } else {
    d.setDate(d.getDate() - 1); // aaj abhi 0 hai toh kal se check karo
    if (!history[dateKey(d)]) return 0;
    streak = 1;
  }
  while (true) {
    d.setDate(d.getDate() - 1);
    if (history[dateKey(d)] > 0) streak++;
    else break;
  }
  return streak;
}

// Pichle 7 din ka data chart ke liye
function last7Days(history, todayCount) {
  const days = [];
  const labels = ["Ravi", "Som", "Mangal", "Budh", "Guru", "Shukra", "Shani"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    days.push({
      key,
      label: labels[d.getDay()],
      count: i === 0 ? todayCount : (history[key] || 0),
      isToday: i === 0,
    });
  }
  return days;
}

export default function CounterPage() {
  const [c, setC] = useState(loadCounter);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    localStorage.setItem(COUNTER_KEY, JSON.stringify(c));
  }, [c]);

  function count() {
    const keys = todayKeys(); // raat 12 baje cross hone par bhi sahi bucket mein gine
    setC(prev => {
      const newDay = (prev.dayKey === keys.dayKey ? prev.day : 0) + 1;
      return {
        ...prev, ...keys,
        total: prev.total + 1,
        day: newDay,
        month: (prev.monthKey === keys.monthKey ? prev.month : 0) + 1,
        year: (prev.yearKey === keys.yearKey ? prev.year : 0) + 1,
        history: pruneHistory({ ...prev.history, [keys.dayKey]: newDay }),
      };
    });
    setPulse(true);
    setTimeout(() => setPulse(false), 150);
    if (navigator.vibrate) navigator.vibrate(15);
  }

  function reset(which) {
    const labels = { day: "aaj ka", month: "is mahine ka", year: "is saal ka", all: "PURA (lifetime)" };
    if (!window.confirm(`Kya aap ${labels[which]} count reset karna chahte hain?`)) return;
    if (which === "all") setC(prev => ({ ...prev, total: 0, day: 0, month: 0, year: 0, history: {} }));
    else if (which === "day") setC(prev => ({ ...prev, day: 0, history: { ...prev.history, [prev.dayKey]: 0 } }));
    else setC(prev => ({ ...prev, [which]: 0 }));
  }

  const beads = c.day % 108;
  const malasToday = Math.floor(c.day / 108);
  const streak = calcStreak(c.history, c.day);
  const goalPct = Math.min(100, Math.round((c.day / c.goal) * 100));
  const week = last7Days(c.history, c.day);
  const weekMax = Math.max(...week.map(d => d.count), 1);

  const stats = [
    { label: "🌅 Aaj", value: c.day, key: "day" },
    { label: "🗓️ Is Mahine", value: c.month, key: "month" },
    { label: "📅 Is Saal", value: c.year, key: "year" },
    { label: "📿 Kul Jaap", value: c.total, key: "all" },
  ];

  return (
    <div className="page-section">
      <h2 className="section-heading">Japa Counter</h2>
      <div className="section-divider" />

      {/* Streak badge */}
      <div className="counter-streak">
        {streak > 0
          ? <>🔥 <b>{streak} din</b> ka streak chal raha hai — Radhe Radhe!</>
          : <>Aaj se jaap shuru karein — streak banayein! 🌸</>}
      </div>

      {/* Mantra chunein */}
      <div className="counter-mantra-row">
        {MANTRAS.map((m, i) => (
          <button
            key={i}
            className={`counter-mantra-btn${c.mantra === i ? " active" : ""}`}
            onClick={() => setC(p => ({ ...p, mantra: i }))}
          >{m}</button>
        ))}
      </div>

      {/* Bada count button */}
      <div style={{ textAlign: "center", margin: "26px 0 10px" }}>
        <button className={`counter-big-btn${pulse ? " pulse" : ""}`} onClick={count}>
          <span className="counter-big-num">{c.day}</span>
          <span className="counter-big-label">{MANTRAS[c.mantra]}</span>
          <span className="counter-big-tap">yahan tap karein 🌸</span>
        </button>
      </div>

      {/* Mala progress */}
      <div className="counter-mala">
        <div className="counter-mala-track">
          <div className="counter-mala-fill" style={{ width: `${(beads / 108) * 100}%` }} />
        </div>
        <p>Mala: {beads} / 108 moti · Aaj puri malayein: <b>{malasToday}</b></p>
      </div>

      {/* Aaj ka lakshya */}
      <div className="counter-goal">
        <div className="counter-goal-head">
          <span>🎯 Aaj ka lakshya: {c.goal} jaap</span>
          <span className={goalPct >= 100 ? "goal-done" : ""}>{goalPct >= 100 ? "✅ Pura hua!" : `${goalPct}%`}</span>
        </div>
        <div className="counter-mala-track">
          <div className="counter-goal-fill" style={{ width: `${goalPct}%` }} />
        </div>
        <div className="counter-goal-opts">
          {GOAL_OPTIONS.map(g => (
            <button
              key={g}
              className={`counter-goal-btn${c.goal === g ? " active" : ""}`}
              onClick={() => setC(p => ({ ...p, goal: g }))}
            >{g / 108} mala</button>
          ))}
        </div>
      </div>

      {/* 7 din ki history */}
      <div className="counter-week">
        <p className="counter-week-title">Pichle 7 din</p>
        <div className="counter-week-bars">
          {week.map(d => (
            <div key={d.key} className="counter-week-col" title={`${d.key}: ${d.count} jaap`}>
              <span className="counter-week-count">{d.count > 0 ? d.count : ""}</span>
              <div
                className={`counter-week-bar${d.isToday ? " today" : ""}`}
                style={{ height: `${Math.max(4, (d.count / weekMax) * 70)}px` }}
              />
              <span className="counter-week-label">{d.isToday ? "Aaj" : d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats + Reset */}
      <div className="counter-stats-grid">
        {stats.map(s => (
          <div key={s.key} className="counter-stat-card">
            <p className="counter-stat-label">{s.label}</p>
            <p className="counter-stat-value">{s.value.toLocaleString("en-IN")}</p>
            <button className="counter-reset-btn" onClick={() => reset(s.key)}>Reset</button>
          </div>
        ))}
      </div>

      <p style={{ textAlign: "center", fontSize: 12, color: "#993556", marginTop: 18, lineHeight: 1.7 }}>
        📿 Aapka jaap is device par apne aap save hota rehta hai.<br />
        Din, mahina aur saal badalte hi count apne aap naye bucket mein shuru ho jaata hai.
      </p>
    </div>
  );
}
