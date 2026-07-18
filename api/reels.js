/* ============================================================
   REELS / STATUS API — Instagram-reels style vertical videos
   GET            -> saare reels padho (site live fetch karti hai)
   POST like      -> ek reel ka like +/- (public)
   POST (admin secret ke saath):
     action:"add"    -> naya reel (video/YouTube link + caption)
     action:"delete" -> reel hatao (id se)
   Storage: data/reels.json { reels:[...] }  (commit "[skip ci]")
   ============================================================ */
const REPO = "sahilyadav-0104/radha-dham";
const FILE = "data/reels.json";
const MAX_REELS = 200;

async function gh(path, opts = {}) {
  return fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "radha-dham-reels",
      ...(opts.headers || {}),
    },
  });
}

async function readFile() {
  const r = await gh(`/repos/${REPO}/contents/${FILE}`);
  if (!r.ok) throw new Error("reels file read failed");
  const j = await r.json();
  const data = JSON.parse(Buffer.from(j.content, "base64").toString("utf8"));
  return { list: Array.isArray(data.reels) ? data.reels : [], sha: j.sha };
}

async function writeFile(reels, sha, message) {
  return gh(`/repos/${REPO}/contents/${FILE}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: Buffer.from(JSON.stringify({ reels }, null, 2)).toString("base64"),
      sha,
    }),
  });
}

function clean(s, max) {
  return String(s || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function isAdmin(req) {
  const s = req.headers["x-admin-secret"];
  return s && process.env.ADMIN_SECRET && s === process.env.ADMIN_SECRET;
}

// YouTube / Shorts link se video id nikaalo
function parseYouTube(url) {
  const m = String(url).match(/(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

async function mutate(fn, message) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { list, sha } = await readFile();
    const next = fn(list);
    const put = await writeFile(next, sha, message);
    if (put.ok) return next;
    if (put.status !== 409) throw new Error("write failed");
  }
  throw new Error("busy");
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { list } = await readFile();
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ ok: true, reels: list });
    } catch (e) {
      return res.status(500).json({ error: "Reels load nahi hue" });
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sirf GET/POST allowed hai" });
  }

  const action = (req.body && req.body.action) || "like";

  // -------- PUBLIC: like +/- --------
  if (action === "like") {
    const id = req.body && req.body.id;
    const dir = req.body && req.body.dir === -1 ? -1 : 1;
    try {
      const next = await mutate(
        (list) => list.map(r => String(r.id) === String(id) ? { ...r, likes: Math.max(0, (r.likes || 0) + dir) } : r),
        `Reel like [skip ci]`
      );
      const reel = next.find(r => String(r.id) === String(id));
      return res.status(200).json({ ok: true, likes: reel ? reel.likes : 0 });
    } catch (e) {
      return res.status(500).json({ error: "Like save nahi hua" });
    }
  }

  // -------- ADMIN --------
  if (!isAdmin(req)) return res.status(401).json({ error: "Galat password! Sirf admin kar sakta hai." });

  try {
    if (action === "add") {
      const url = clean(req.body && req.body.url, 300);
      const caption = clean(req.body && req.body.caption, 200);
      const author = clean(req.body && req.body.author, 40) || "Radha Dham";
      if (!url) return res.status(400).json({ error: "Video ya YouTube ka link daalein" });

      const ytId = parseYouTube(url);
      const reel = ytId
        ? { id: Date.now(), type: "youtube", ytId, caption, author, likes: 0, ts: new Date().toISOString() }
        : { id: Date.now(), type: "video", src: url, caption, author, likes: 0, ts: new Date().toISOString() };

      const next = await mutate((list) => [reel, ...list].slice(0, MAX_REELS), `Admin: naya reel [skip ci]`);
      return res.status(200).json({ ok: true, reels: next, message: "✅ Reel add ho gaya!" });
    }

    if (action === "delete") {
      const id = req.body && req.body.id;
      const next = await mutate((list) => list.filter(r => String(r.id) !== String(id)), `Admin: reel delete [skip ci]`);
      return res.status(200).json({ ok: true, reels: next, message: "🗑️ Reel delete ho gaya" });
    }

    if (action === "list") {
      const { list } = await readFile();
      return res.status(200).json({ ok: true, reels: list });
    }

    return res.status(400).json({ error: "Galat action" });
  } catch (e) {
    return res.status(500).json({ error: "Kuch gadbad hui, dobara try karein" });
  }
}
