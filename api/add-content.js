/* ============================================================
   ADMIN API — sirf sahi password (ADMIN_SECRET) ke saath chalti hai
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sirf POST allowed hai" });
  }

  // Password check — bina sahi secret ke kuch nahi hota
  const secret = req.headers["x-admin-secret"];
  if (!secret || !process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Galat password! Sirf admin add kar sakta hai." });
  }

  const { type, data, image } = req.body || {};
  if (!type || !data) {
    return res.status(400).json({ error: "type aur data zaroori hai" });
  }
  if (!["gallery", "bhajan", "leela"].includes(type)) {
    return res.status(400).json({ error: "type galat hai" });
  }

  try {
    // 1. Agar photo hai toh pehle usse repo me upload karo
    let fileName = null;
    if (image && image.base64) {
      const safe = (image.name || "photo.jpg").toLowerCase().replace(/[^a-z0-9.]+/g, "-");
      fileName = `admin-${Date.now()}-${safe}`;
      const up = await gh(`/repos/${REPO}/contents/public/gallery/${fileName}`, {
        method: "PUT",
        body: JSON.stringify({
          message: `Admin: nayi photo ${fileName}`,
          content: image.base64,
        }),
      });
      if (!up.ok) {
        return res.status(500).json({ error: "Photo upload nahi hui", detail: (await up.text()).slice(0, 200) });
      }
    }

    // 2. custom-content.json padho, naya item jodo, wapas commit karo
    const cur = await gh(`/repos/${REPO}/contents/src/custom-content.json`);
    if (!cur.ok) {
      return res.status(500).json({ error: "Content file nahi mili", detail: (await cur.text()).slice(0, 200) });
    }
    const j = await cur.json();
    const content = JSON.parse(Buffer.from(j.content, "base64").toString("utf8"));

    const item = { ...data, ...(fileName ? { file: fileName } : {}), addedAt: new Date().toISOString() };
    if (type === "gallery") content.gallery.push(item);
    else if (type === "bhajan") content.bhajans.push(item);
    else content.leelas.push(item);

    const put = await gh(`/repos/${REPO}/contents/src/custom-content.json`, {
      method: "PUT",
      body: JSON.stringify({
        message: `Admin: naya ${type} add kiya — ${data.title || data.label || ""}`,
        content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
        sha: j.sha,
      }),
    });
    if (!put.ok) {
      return res.status(500).json({ error: "Content save nahi hua", detail: (await put.text()).slice(0, 200) });
    }

    return res.status(200).json({
      ok: true,
      message: "✅ Add ho gaya! 2-3 minute me site pe live ho jayega (auto-deploy chal raha hai).",
    });
  } catch (e) {
    return res.status(500).json({ error: "Kuch gadbad hui", detail: String(e).slice(0, 200) });
  }
}
