import { useEffect, useRef, useState } from "react";
import { MUSIC } from "./data";

/* ============================================================
   MURLI PLAYER — Krishna ki bansuri ki dhun background me
   - WebAudio se synthesize hoti hai (koi file/copyright nahi)
   - Browser autoplay block ki wajah se pehle tap/scroll pe shuru hoti hai
   - Chhota floating button: koi bhi visitor mute/unmute kar sakta hai
   - Admin (Sangeet tab) se: on/off, dhun (tune) aur volume control
   - Koi doosra audio/video (bhajan/reel) chale to murli apne aap dhimi
   ============================================================ */

const MUTED_KEY = "radhaDhamMurliMuted";

// Note frequencies (Hz)
const N = {
  D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0, r: 0,
};

// Har dhun = [frequency, duration(sec)] ka sequence — loop hoti rehti hai
const TUNES = {
  // Shaant, madhur bansuri
  bansuri: [
    [N.G4, 0.6], [N.A4, 0.55], [N.B4, 0.9], [N.A4, 0.5], [N.G4, 0.95], [N.r, 0.4],
    [N.E4, 0.6], [N.G4, 0.6], [N.A4, 1.0], [N.r, 0.5],
    [N.G4, 0.6], [N.E4, 0.55], [N.D4, 0.9], [N.E4, 0.6], [N.G4, 1.1], [N.r, 0.9],
  ],
  // Bahut dhimi, meditative — dhyaan ke liye
  shanti: [
    [N.D4, 1.3], [N.F4, 1.2], [N.G4, 1.7], [N.r, 0.6],
    [N.F4, 1.1], [N.E4, 1.1], [N.D4, 1.9], [N.r, 1.0],
    [N.A4, 1.2], [N.G4, 1.5], [N.E4, 1.9], [N.r, 1.3],
  ],
  // Chanchal, khilti hui — Raas jaisi
  raas: [
    [N.C5, 0.4], [N.D5, 0.4], [N.E5, 0.5], [N.G5, 0.5], [N.E5, 0.4], [N.D5, 0.5], [N.C5, 0.65], [N.r, 0.3],
    [N.A4, 0.4], [N.C5, 0.4], [N.D5, 0.5], [N.E5, 0.6], [N.D5, 0.4], [N.C5, 0.5], [N.A4, 0.75], [N.r, 0.5],
  ],
};

// Ek sur bajao — bansuri jaisi (triangle + vibrato + halki saans)
function playNote(ctx, dest, freq, dur) {
  if (!freq) return; // rest
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = freq;

  // vibrato (thodi si kaamp)
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 5.2;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = freq * 0.008;
  lfo.connect(lfoGain).connect(osc.frequency);

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 2200;

  const g = ctx.createGain();
  const atk = 0.14;
  const rel = Math.min(0.5, dur * 0.5);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.85, now + atk);
  g.gain.setValueAtTime(0.85, now + Math.max(atk, dur - rel));
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  osc.connect(lp).connect(g).connect(dest);
  osc.start(now);
  osc.stop(now + dur + 0.05);
  lfo.start(now);
  lfo.stop(now + dur + 0.05);

  // halki "saans" (breath noise) — asli bansuri jaisa
  const nDur = Math.min(0.25, dur);
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * nDur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const nb = ctx.createBufferSource();
  nb.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = freq * 2;
  bp.Q.value = 0.7;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.0001, now);
  ng.gain.exponentialRampToValueAtTime(0.05, now + atk);
  ng.gain.exponentialRampToValueAtTime(0.0001, now + nDur);
  nb.connect(bp).connect(ng).connect(dest);
  nb.start(now);
  nb.stop(now + nDur + 0.02);
}

// Ek baar user page se interact kar le (autoplay policy)
let gestured = false;

export default function MurliPlayer() {
  const [muted, setMuted] = useState(() => localStorage.getItem(MUTED_KEY) === "1");
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const timerRef = useRef(null);
  const idxRef = useRef(0);
  const duckRef = useRef(false); // koi aur audio chal raha hai?

  const enabled = MUSIC.enabled;

  useEffect(() => {
    if (!enabled) return;

    function buildChain(ctx) {
      const master = ctx.createGain();
      master.gain.value = MUSIC.volume * 0.5;
      // halki si space (delay) — mandir jaisa ehsaas
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.28;
      const fb = ctx.createGain();
      fb.gain.value = 0.22;
      const wet = ctx.createGain();
      wet.gain.value = 0.33;
      delay.connect(fb).connect(delay);
      master.connect(ctx.destination);
      master.connect(delay);
      delay.connect(wet).connect(ctx.destination);
      return master;
    }

    function loop() {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const seq = TUNES[MUSIC.tune] || TUNES.bansuri;
      const [freq, dur] = seq[idxRef.current % seq.length];
      if (!duckRef.current) playNote(ctx, masterRef.current, freq, dur);
      idxRef.current++;
      timerRef.current = setTimeout(loop, dur * 1000);
    }

    function start() {
      if (ctxRef.current || muted) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      ctxRef.current = ctx;
      masterRef.current = buildChain(ctx);
      ctx.resume().catch(() => {});
      idxRef.current = 0;
      setPlaying(true);
      loop();
    }

    function stop() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      if (ctxRef.current) { ctxRef.current.close().catch(() => {}); ctxRef.current = null; }
      masterRef.current = null;
      setPlaying(false);
    }

    // pehle gesture pe shuru
    function onGesture() {
      gestured = true;
      if (!muted) start();
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("scroll", onGesture);
    }

    // Agar koi bhajan/reel (audio/video) chale to murli dhimi/band
    function onMediaPlay(e) {
      if (e.target && (e.target.tagName === "AUDIO" || e.target.tagName === "VIDEO")) {
        duckRef.current = true;
      }
    }
    function onMediaStop() {
      const any = [...document.querySelectorAll("audio,video")].some(m => !m.paused && !m.ended);
      duckRef.current = any;
    }

    document.addEventListener("play", onMediaPlay, true);
    document.addEventListener("pause", onMediaStop, true);
    document.addEventListener("ended", onMediaStop, true);

    if (gestured && !muted) {
      start();
    } else {
      window.addEventListener("pointerdown", onGesture, { once: false });
      window.addEventListener("keydown", onGesture, { once: false });
      window.addEventListener("touchstart", onGesture, { once: false });
      window.addEventListener("scroll", onGesture, { once: false, passive: true });
    }

    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("scroll", onGesture);
      document.removeEventListener("play", onMediaPlay, true);
      document.removeEventListener("pause", onMediaStop, true);
      document.removeEventListener("ended", onMediaStop, true);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, muted]);

  if (!enabled) return null;

  function toggle() {
    setMuted(m => {
      const next = !m;
      localStorage.setItem(MUTED_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <button
      className={`murli-toggle${playing ? " playing" : ""}`}
      onClick={toggle}
      aria-label={muted ? "Murli chalao" : "Murli band karo"}
      title={muted ? "🎶 Murli chalao" : "Murli band karo"}
    >
      {muted ? "🔇" : "🎶"}
    </button>
  );
}
