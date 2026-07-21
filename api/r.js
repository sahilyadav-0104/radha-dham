/* ============================================================
   REEL SHARE LINK — https://shriradharani.in/r/<reel-id>
   - WhatsApp/Facebook ka bot yahan aata hai to usse reel ka
     thumbnail + caption (OG tags) milta hai -> sundar preview
   - Asli banda aata hai to seedha site ke us reel par pahunch
     jaata hai (/#reel-<id>)
   ============================================================ */
const REPO = "sahilyadav-0104/radha-dham";
const FILE = "data/reels.json";
const SITE = "https://shriradharani.in";

async function readReels() {
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "radha-dham-share",
    },
  });
  if (!r.ok) return [];
  const j = await r.json();
  const data = JSON.parse(Buffer.from(j.content, "base64").toString("utf8"));
  return Array.isArray(data.reels) ? data.reels : [];
}

// HTML me daalne se pehle text safe karo
function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export default async function handler(req, res) {
  const id = String((req.query && req.query.id) || "").trim();

  let title = "Radha Dham — Shri Radha Rani ka Digital Mandir 🌸";
  let desc = "Bhajans, Leelas, Status Reels, Japa Counter aur Braj Yatra Guide. Jai Shri Radhe 🌸";
  let image = `${SITE}/logo512.png`;
  let target = `${SITE}/`;

  if (id) {
    target = `${SITE}/#reel-${encodeURIComponent(id)}`;
    try {
      const reels = await readReels();
      const reel = reels.find(r => String(r.id) === id);
      if (reel) {
        if (reel.caption) title = `${reel.caption} 🌸`;
        desc = `${reel.author || "Radha Dham"} · Radha Dham par ye status dekhein 🌸 Jai Shri Radhe`;
        if (reel.type === "youtube" && reel.ytId) {
          image = `https://i.ytimg.com/vi/${reel.ytId}/hqdefault.jpg`;
        }
      }
    } catch (_) { /* reel na mile to bhi site to khulegi hi */ }
  }

  const html = `<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<meta property="og:type" content="video.other" />
<meta property="og:site_name" content="Radha Dham" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:url" content="${esc(target)}" />
<meta property="og:locale" content="hi_IN" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
<meta name="twitter:image" content="${esc(image)}" />
<link rel="canonical" href="${esc(target)}" />
<meta http-equiv="refresh" content="0; url=${esc(target)}" />
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
       background:#2E0A1C;color:#FDE7EF;font-family:Georgia,serif;text-align:center;padding:24px}
  a{color:#FAC775}
</style>
</head>
<body>
<div>
  <p style="font-size:40px;margin:0 0 12px">🌸</p>
  <p style="font-size:18px;margin:0 0 8px">Radha Dham khul raha hai…</p>
  <p style="font-size:13px;opacity:.8;margin:0 0 16px">Jai Shri Radhe</p>
  <a href="${esc(target)}">Yahan tap karein ↗</a>
</div>
<script>location.replace(${JSON.stringify(target)});</script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
  return res.status(200).send(html);
}
