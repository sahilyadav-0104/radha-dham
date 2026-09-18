/* ============================================================
   BUILD KE BAAD CHALTA HAI (npm run build ke end me)

   Kaam kya karta hai:
   1. Har route ka apna static HTML banata hai —
      build/bhajan/index.html, build/braj-yatra/index.html, ...
      Har file me us page ka apna title, description, canonical,
      OG tags, schema.org data aur asli text content hota hai.
      Isse Google ko JavaScript chalane ki zaroorat nahi padti —
      wo seedha HTML padh kar page samajh leta hai.
   2. build/sitemap.xml me saare URLs likh deta hai.

   Route ki jaankari src/seo-routes.json se aati hai — wahi file
   React app (src/App.js) bhi padhta hai, to dono hamesha match
   karte hain.
   ============================================================ */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BUILD = path.join(ROOT, "build");
const SHELL = path.join(BUILD, "index.html");
const SEO = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "seo-routes.json"), "utf8"));

// HTML me daalne se pehle text safe karo
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* Page khulne se pehle jo content dikhta hai — yahi Google padhta hai.
   App load hote hi React isko asli page se badal deta hai. Neeche ke
   links Google ko ek page se doosre page tak pahunchne ka rasta dete
   hain (nav buttons <a> nahi hain, to crawler unhe follow nahi kar
   sakta). */
function preloadBlock(route) {
  const links = SEO.routes
    .filter((r) => r.path !== route.path)
    .map((r) => `<a href="${r.path}" style="color:#72243E">${esc(r.linkText)}</a>`)
    .join(" · ");

  const paras = route.intro.map((p) => `<p style="margin:0 0 14px">${esc(p)}</p>`).join("");

  return (
    `<div style="background:#fff5f8;min-height:100vh;box-sizing:border-box;` +
    `max-width:100%;padding:48px 20px;` +
    `font-family:Georgia,serif;color:#4a2233;line-height:1.7;text-align:center">` +
    `<div style="max-width:760px;margin:0 auto">` +
    `<h1 style="color:#72243E;font-size:1.7rem;margin:0 0 20px">${esc(route.h1)}</h1>` +
    paras +
    `<p style="margin:26px 0 10px;font-size:.95rem">${links}</p>` +
    `<p style="color:#9a7285;font-size:.85rem;margin:22px 0 0">🌸 Jai Shri Radhe 🌸</p>` +
    `</div></div>`
  );
}

// Sub-page ke liye WebPage schema (home par WebSite schema hi rehta hai)
function pageSchema(route) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: route.title,
    url: SEO.site + route.path,
    description: route.description,
    inLanguage: "hi",
    isPartOf: { "@type": "WebSite", name: "Radha Dham", url: SEO.site + "/" },
  });
}

// Ek route ka poora HTML banao (shell le kar uske tags badal do)
function buildHtml(shell, route) {
  const url = SEO.site + route.path;
  let html = shell;

  const swap = (re, replacement, label) => {
    if (!re.test(html)) {
      console.warn(`  ! ${label} nahi mila (${route.path}) — chhod diya`);
      return;
    }
    html = html.replace(re, replacement);
  };

  swap(/<title>[\s\S]*?<\/title>/, `<title>${esc(route.title)}</title>`, "<title>");
  swap(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${esc(route.description)}"/>`,
    "description"
  );
  swap(
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${url}"/>`,
    "canonical"
  );
  swap(
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${url}"/>`,
    "og:url"
  );
  swap(
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${esc(route.title)}"/>`,
    "og:title"
  );
  swap(
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${esc(route.description)}"/>`,
    "og:description"
  );
  swap(
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${esc(route.title)}"/>`,
    "twitter:title"
  );
  swap(
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${esc(route.description)}"/>`,
    "twitter:description"
  );

  // Home par site-wide WebSite schema rakho, baaki pages par WebPage
  if (route.path !== "/") {
    swap(
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
      `<script type="application/ld+json">${pageSchema(route)}</script>`,
      "ld+json"
    );
  }

  // JS off ho to bhi page ka matlab samajh aaye
  swap(
    /<noscript>[\s\S]*?<\/noscript>/,
    `<noscript><h1>${esc(route.h1)}</h1>${route.intro
      .map((p) => `<p>${esc(p)}</p>`)
      .join("")}<p>Poora page dekhne ke liye JavaScript on karein.</p></noscript>`,
    "<noscript>"
  );

  // Asli content — React load hone tak yahi dikhta hai, Google yahi padhta hai
  swap(
    /<div id="root">\s*<\/div>/,
    `<div id="root">${preloadBlock(route)}</div>`,
    'div#root'
  );

  return html;
}

/* Gallery ki photos client-side render hoti hain, to Google Images unhe
   HTML me dekh hi nahi pata. Sitemap me image URLs seedhe dene se Google
   Images tak pahunch jaata hai — 170+ Radha Krishna photos ke liye ye
   bada farq hai. */
function galleryImages() {
  const dir = path.join(BUILD, "gallery");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
    .sort()
    .map((f) => `${SEO.site}/gallery/${encodeURIComponent(f)}`);
}

// Home par dikhne wali darshan photos
function darshanImages() {
  return fs
    .readdirSync(BUILD)
    .filter((f) => /^radha-krishna-\d+\.(webp|jpe?g|png)$/i.test(f))
    .sort()
    .map((f) => `${SEO.site}/${f}`);
}

function sitemap() {
  const imagesFor = { "/gallery": galleryImages(), "/": darshanImages() };
  const urls = SEO.routes
    .map((r) => {
      const imgs = (imagesFor[r.path] || [])
        .map((u) => `    <image:image>\n      <image:loc>${u}</image:loc>\n    </image:image>`)
        .join("\n");
      return (
        `  <url>\n    <loc>${SEO.site}${r.path}</loc>\n` +
        `    <changefreq>weekly</changefreq>\n` +
        `    <priority>${r.path === "/" ? "1.0" : "0.8"}</priority>\n` +
        (imgs ? imgs + "\n" : "") +
        `  </url>`
      );
    })
    .join("\n");
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
    `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    `${urls}\n</urlset>\n`
  );
}

/* IndexNow — Bing, Yandex, DuckDuckGo wagera ko bata deta hai ki site
   update hui hai. Bina kisi login ke chalta hai (key file public/ me
   padi hai). Google IndexNow support NAHI karta — uske liye Search
   Console se hi indexing request karni padti hai.
   Ye fail ho jaye to build nahi rukna chahiye — sirf warning. */
async function pingIndexNow() {
  const key = SEO.indexNowKey;
  if (!key) return;
  if (typeof fetch !== "function") {
    console.log("  · IndexNow skip (is Node me fetch nahi hai)");
    return;
  }
  const body = {
    host: SEO.site.replace(/^https?:\/\//, ""),
    key,
    keyLocation: `${SEO.site}/${key}.txt`,
    urlList: SEO.routes.map((r) => SEO.site + r.path),
  };
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    console.log(`  ${res.ok ? "✓" : "·"} IndexNow ping -> HTTP ${res.status}`);
  } catch (e) {
    console.log(`  · IndexNow ping nahi ho paya (${e.message}) — build theek hai`);
  }
}

async function main() {
  if (!fs.existsSync(SHELL)) {
    console.error("generate-seo-pages: build/index.html nahi mila — pehle build chalao.");
    process.exit(1);
  }
  const shell = fs.readFileSync(SHELL, "utf8");

  console.log("\nSEO pages bana raha hoon:");
  for (const route of SEO.routes) {
    const html = buildHtml(shell, route);
    let out;
    if (route.path === "/") {
      out = SHELL;
    } else {
      const dir = path.join(BUILD, route.path.replace(/^\//, ""));
      fs.mkdirSync(dir, { recursive: true });
      out = path.join(dir, "index.html");
    }
    fs.writeFileSync(out, html, "utf8");
    console.log(`  ✓ ${route.path.padEnd(20)} -> ${path.relative(ROOT, out)}`);
  }

  // build/ me (jo deploy hota hai) aur public/ me dono jagah likho —
  // public wali copy sirf isliye taaki repo me bhi sahi sitemap dikhe
  const xml = sitemap();
  fs.writeFileSync(path.join(BUILD, "sitemap.xml"), xml, "utf8");
  fs.writeFileSync(path.join(ROOT, "public", "sitemap.xml"), xml, "utf8");
  const imgCount = (xml.match(/<image:loc>/g) || []).length;
  console.log(`  ✓ sitemap.xml (${SEO.routes.length} URLs, ${imgCount} images)`);

  await pingIndexNow();
  console.log("");
}

main();
