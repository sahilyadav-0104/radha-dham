/* ============================================================
   PUBLIC COMMENTS API — koi bhi bhakt anubhav likh sakta hai
   GET  -> saare anubhav padho (site live fetch karti hai)
   POST -> naya anubhav jodo
   POST (admin secret ke saath):
     action:"list"   -> anubhav (cid ke saath) — admin panel ke liye
     action:"delete" -> ek anubhav hatao (id se)
     action:"ban"    -> us bhakt ki id (cid) ban karo + uske sare anubhav hatao
     action:"unban"  -> cid ko unban karo
   Storage: data/comments.json { comments:[...], banned:[...] }
   Commit "[skip ci]" ke saath — har comment par site rebuild na ho.
   ============================================================ */
const REPO = "sahilyadav-0104/radha-dham";
const FILE = "data/comments.json";
const MAX_COMMENTS = 300;

async function gh(path, opts = {}) {
  return fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "radha-dham-comments",
      ...(opts.headers || {}),
    },
  });
}

async function readFile() {
  const r = await gh(`/repos/${REPO}/contents/${FILE}`);
  if (!r.ok) throw new Error("comments file read failed");
  const j = await r.json();
  const data = JSON.parse(Buffer.from(j.content, "base64").toString("utf8"));
  return {
    list: Array.isArray(data.comments) ? data.comments : [],
    banned: Array.isArray(data.banned) ? data.banned : [],
    sha: j.sha,
  };
}

async function writeFile(comments, banned, sha, message) {
  return gh(`/repos/${REPO}/contents/${FILE}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: Buffer.from(JSON.stringify({ comments, banned }, null, 2)).toString("base64"),
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

// Public response me cid (device id) chhupa do
function pub(list) {
  return list.map(({ cid, ...rest }) => rest);
}

// read -> modify -> write, 409 (conflict) par ek retry
async function mutate(fn, message) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { list, banned, sha } = await readFile();
    const next = fn(list, banned);
    const put = await writeFile(next.comments, next.banned, sha, message);
    if (put.ok) return next;
    if (put.status !== 409) throw new Error("write failed");
  }
  throw new Error("busy");
}

export default async function handler(req, res) {
  // GET — public anubhav padho
  if (req.method === "GET") {
    try {
      const { list } = await readFile();
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ ok: true, comments: pub(list) });
    } catch (e) {
      return res.status(500).json({ error: "Anubhav load nahi hue" });
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sirf GET/POST allowed hai" });
  }

  const action = (req.body && req.body.action) || "add";

  // -------- ADMIN ACTIONS --------
  if (action === "list" || action === "delete" || action === "ban" || action === "unban") {
    if (!isAdmin(req)) return res.status(401).json({ error: "Galat password! Sirf admin kar sakta hai." });

    try {
      if (action === "list") {
        const { list, banned } = await readFile();
        return res.status(200).json({ ok: true, comments: list, banned });
      }

      if (action === "delete") {
        const id = req.body.id;
        const next = await mutate((list, banned) => ({
          comments: list.filter(c => String(c.id) !== String(id)),
          banned,
        }), "Admin: anubhav delete [skip ci]");
        return res.status(200).json({ ok: true, comments: next.comments, banned: next.banned, message: "🗑️ Anubhav delete ho gaya" });
      }

      if (action === "ban") {
        const id = req.body.id;
        const next = await mutate((list, banned) => {
          const target = list.find(c => String(c.id) === String(id));
          const cid = target && target.cid;
          const newBanned = cid && !banned.includes(cid) ? [...banned, cid] : banned;
          // uska ye anubhav to hatao; agar cid hai to uske saare anubhav hatao
          const comments = cid
            ? list.filter(c => c.cid !== cid)
            : list.filter(c => String(c.id) !== String(id));
          return { comments, banned: newBanned };
        }, "Admin: bhakt ban [skip ci]");
        return res.status(200).json({ ok: true, comments: next.comments, banned: next.banned, message: "🚫 Ban ho gaya — ab ye dobara post nahi kar payega" });
      }

      if (action === "unban") {
        const cid = req.body.cid;
        const next = await mutate((list, banned) => ({
          comments: list,
          banned: banned.filter(b => b !== cid),
        }), "Admin: unban [skip ci]");
        return res.status(200).json({ ok: true, banned: next.banned, message: "✅ Unban ho gaya" });
      }
    } catch (e) {
      return res.status(500).json({ error: "Kuch gadbad hui, dobara try karein" });
    }
  }

  // -------- PUBLIC ADD --------
  const author = clean(req.body && req.body.author, 40);
  const text = clean(req.body && req.body.text, 600);
  const cid = clean(req.body && req.body.cid, 40);

  if (!author || !text) return res.status(400).json({ error: "Naam aur anubhav dono likhein" });
  if (text.length < 2) return res.status(400).json({ error: "Thoda aur likhein 🙏" });
  if ((text.match(/https?:\/\//gi) || []).length > 1) return res.status(400).json({ error: "Anubhav mein link mat daalein 🙏" });

  try {
    // ban check
    const { banned } = await readFile();
    if (cid && banned.includes(cid)) {
      return res.status(403).json({ error: "Aap anubhav post nahi kar sakte." });
    }

    const item = { id: Date.now(), author, text, ts: new Date().toISOString(), cid: cid || undefined };
    const next = await mutate((list, bn) => ({
      comments: [item, ...list].slice(0, MAX_COMMENTS),
      banned: bn,
    }), `Anubhav: ${author} [skip ci]`);

    return res.status(200).json({ ok: true, comments: pub(next.comments) });
  } catch (e) {
    return res.status(500).json({ error: "Server busy hai, thodi der baad try karein" });
  }
}
