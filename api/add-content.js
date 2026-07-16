/* ============================================================
   ADMIN API — sirf sahi password (ADMIN_SECRET) ke saath chalti hai
   Actions: add (naya content), list (dekhna), delete (hatana)
   Content GitHub repo me commit hota hai -> Vercel auto-deploy
   ============================================================ */
const REPO = "sahilyadav-0104/radha-dham";

async function gh(path, opts = {}) {
  return fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "radha-dham-admin",
      ...(opts.headers || {}),
    },
  });
}

// custom-content.json GitHub se padho (content + sha)
async function readContent() {
  const cur = await gh(`/repos/${REPO}/contents/src/custom-content.json`);
  if (!cur.ok) throw new Error("Content file nahi mili");
  const j = await cur.json();
  return { content: JSON.parse(Buffer.from(j.content, "base64").toString("utf8")), sha: j.sha };
}

async function writeContent(content, sha, message) {
  const put = await gh(`/repos/${REPO}/contents/src/custom-content.json`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
      sha,
    }),
  });
  if (!put.ok) throw new Error("Content save nahi hua: " + (await put.text()).slice(0, 150));
}

const KEY = { gallery: "gallery", bhajan: "bhajans", leela: "leelas" };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sirf POST allowed hai" });
  }

  // Password check — bina sahi secret ke kuch nahi hota
  const secret = req.headers["x-admin-secret"];
  if (!secret || !process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Galat password! Sirf admin add/delete kar sakta hai." });
  }

  const { action = "add", type, data, image, index } = req.body || {};

  try {
    // ---- LIST: current content wapas bhejo (delete tab ke liye) ----
    if (action === "list") {
      const { content } = await readContent();
      return res.status(200).json({ ok: true, content });
    }

    // ---- DELETE: ek item hatao ----
    if (action === "delete") {
      const arrKey = KEY[type];
      if (!arrKey) return res.status(400).json({ error: "type galat hai" });
      const { content, sha } = await readContent();
      const arr = content[arrKey] || [];
      if (index < 0 || index >= arr.length) {
        return res.status(400).json({ error: "Item nahi mila" });
      }
      const removed = arr[index];
      arr.splice(index, 1);

      // Agar photo thi toh uski file bhi repo se hatao (best-effort)
      if (removed && removed.file) {
        try {
          const f = await gh(`/repos/${REPO}/contents/public/gallery/${removed.file}`);
          if (f.ok) {
            const fj = await f.json();
            await gh(`/repos/${REPO}/contents/public/gallery/${removed.file}`, {
              method: "DELETE",
              body: JSON.stringify({ message: `Admin: photo delete ${removed.file}`, sha: fj.sha }),
            });
          }
        } catch (_) { /* photo file delete fail ho toh bhi content update karo */ }
      }

      await writeContent(content, sha, `Admin: ${type} delete kiya`);
      return res.status(200).json({ ok: true, message: "🗑️ Delete ho gaya! 2-3 minute me site se hat jayega." });
    }

    // ---- ADD: naya content ----
    if (!type || !data) return res.status(400).json({ error: "type aur data zaroori hai" });
    if (!KEY[type]) return res.status(400).json({ error: "type galat hai" });

    // Agar photo hai toh pehle usse repo me upload karo
    let fileName = null;
    if (image && image.base64) {
      const safe = (image.name || "photo.jpg").toLowerCase().replace(/[^a-z0-9.]+/g, "-");
      fileName = `admin-${Date.now()}-${safe}`;
      const up = await gh(`/repos/${REPO}/contents/public/gallery/${fileName}`, {
        method: "PUT",
        body: JSON.stringify({ message: `Admin: nayi photo ${fileName}`, content: image.base64 }),
      });
      if (!up.ok) {
        return res.status(500).json({ error: "Photo upload nahi hui", detail: (await up.text()).slice(0, 200) });
      }
    }

    const { content, sha } = await readContent();
    const item = { ...data, ...(fileName ? { file: fileName } : {}), addedAt: new Date().toISOString() };
    content[KEY[type]].push(item);

    await writeContent(content, sha, `Admin: naya ${type} add kiya — ${data.title || data.label || ""}`);
    return res.status(200).json({
      ok: true,
      message: "✅ Add ho gaya! 2-3 minute me site pe live ho jayega (auto-deploy chal raha hai).",
    });
  } catch (e) {
    return res.status(500).json({ error: "Kuch gadbad hui", detail: String(e.message || e).slice(0, 200) });
  }
}
