import { useState, useEffect } from "react";

/* ============================================================
   INSTALL BANNER — App install karne ka option
   - Android Chrome: seedha install popup (beforeinstallprompt)
   - iPhone: Add to Home Screen ka tareeka
   - Baaki sab: APK direct download
   ============================================================ */
export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (isStandalone) {
      setInstalled(true);
      return;
    }
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // App ke andar se hi khola hai toh banner mat dikhao
  if (installed) return null;

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
  }

  return (
    <div className="install-banner">
      <span className="install-emoji">📲</span>
      <div className="install-info">
        <p className="install-title">Radha Dham App</p>
        <p className="install-sub">
          {isIOS
            ? "Safari me Share (⬆️) dabao → 'Add to Home Screen'"
            : "Phone par install karein — offline bhi chalega"}
        </p>
      </div>
      {deferredPrompt ? (
        <button className="install-btn" onClick={install}>Install Karo</button>
      ) : !isIOS ? (
        <a className="install-btn" href={process.env.PUBLIC_URL + "/app/radha-dham.apk"} download="radha-dham.apk">
          APK Download
        </a>
      ) : null}
    </div>
  );
}
