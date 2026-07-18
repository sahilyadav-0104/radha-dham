/* ============================================================
   PUBLIC COMMENTS API — koi bhi bhakt anubhav likh sakta hai
   GET  -> saare anubhav padho (site live fetch karti hai)
   POST -> naya anubhav jodo
   Storage: data/comments.json (GitHub). Commit "[skip ci]" ke
   saath hota hai taaki har comment par site rebuild na ho —
   site anubhav live is API se padhti hai (rebuild ki zaroorat nahi).
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
  return { list: Array.isArray(data.comments) ? data.comments : [], sha: j.sha };
}

function clean(s, max) {
  return String(s || "").replace(/\s+/g, " ").trim().slice(0, max);
}

export default async function handler(req, res) {
  // GET — anubhav padho
  if (req.method === "GET") {
    try {
      const { list } = await readFile();
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ ok: true, comments: list });
    } catch (e) {
      return res.status(500).json({ error: "Anubhav load nahi hue" });
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sirf GET/POST allowed hai" });
  }

  // POST — naya anubhav jodo
  const author = clean(req.body && req.body.author, 40);
  const text = clean(req.body && req.body.text, 600);

  if (!author || !text) {
    return res.status(400).json({ error: "Naam aur anubhav dono likhein" });
  }
  if (text.length < 2) {
    return res.status(400).json({ error: "Thoda aur likhein 🙏" });
  }
  // Spam se thodi suraksha — bahut saare link wale message rok do
  if ((text.match(/https?:\/\//gi) || []).length > 1) {
    return res.status(400).json({ error: "Anubhav mein link mat daalein 🙏" });
  }

  const item = {
    id: Date.now(),
    author,
    text,
    ts: new Date().toISOString(),
  };

  // SHA conflict (do log ek saath likhein) par ek baar retry
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { list, sha } = await readFile();
      const updated = [item, ...list].slice(0, MAX_COMMENTS);
      const put = await gh(`/repos/${REPO}/contents/${FILE}`, {
        method: "PUT",
        body: JSON.stringify({
          message: `Anubhav: ${author} [skip ci]`,
          content: Buffer.from(JSON.stringify({ comments: updated }, null, 2)).toString("base64"),
          sha,
        }),
      });
      if (put.ok) {
        return res.status(200).json({ ok: true, comments: updated });
      }
      if (put.status !== 409) {
        return res.status(500).json({ error: "Anubhav save nahi hua, dobara try karein" });
      }
      // 409 = conflict, loop dobara padhega
    } catch (e) {
      if (attempt === 1) return res.status(500).json({ error: "Kuch gadbad hui, dobara try karein" });
    }
  }
  return res.status(500).json({ error: "Server busy hai, thodi der baad try karein" });
}
