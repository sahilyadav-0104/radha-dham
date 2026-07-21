/* ============================================================
   SAB DATA EK JAGAH — pages isko import karte hain
   Admin panel (#admin) se add kiya content custom-content.json
   me aata hai aur yahan base data ke saath merge hota hai.
   ============================================================ */
import CUSTOM from "./custom-content.json";

// Darshan ki photos (public/ folder mein rakhi hain) — har pic ka apna mantra
export const DARSHAN_IMAGES = [
  { src: process.env.PUBLIC_URL + "/radha-krishna-1.webp", caption: "ISKCON Vrindavan — Radha Krishna", mantra: "राधे राधे श्याम मिला दे" },
  { src: process.env.PUBLIC_URL + "/radha-krishna-2.webp", caption: "Shri Radha Krishna — Divya Shringaar", mantra: "हरे कृष्ण हरे कृष्ण, कृष्ण कृष्ण हरे हरे" },
  { src: process.env.PUBLIC_URL + "/radha-krishna-3.webp", caption: "Radha Krishna — Pushp Shringaar", mantra: "राधे कृष्ण राधे कृष्ण, कृष्ण कृष्ण राधे राधे" },
  { src: process.env.PUBLIC_URL + "/radha-krishna-4.webp", caption: "Radha Krishna — Phoolon ka Darshan", mantra: "जय श्री राधे, जय जय श्री राधे" },
];

// Gallery photos — Wikimedia Commons se download karke public/gallery/ mein rakhi hain
const IMG = (file) => process.env.PUBLIC_URL + "/gallery/" + file;

// Jab admin photo ka naam na dale, to inme se koi random naam lag jata hai
export const RADHA_CAPTIONS = [
  "Radhe Radhe 🌸", "Jai Shri Radhe", "Ladli Ji", "Kishori Ji",
  "Barsane Wali Radha Rani", "Vrishbhanu Dulari", "Kirti Kumari",
  "Shyama Pyari", "Braj Rani Radha", "Radha Vallabh", "Radha Madhav",
  "Shri Radha", "Radha Rani ki Divya Chhavi", "Nitya Kishori Radha",
  "Radha Krishna", "Raseshwari Radha", "Vrindavan Bihari Radha",
];

export function randomRadhaCaption() {
  return RADHA_CAPTIONS[Math.floor(Math.random() * RADHA_CAPTIONS.length)];
}

const BASE_GALLERY = [
  { url: IMG("iskcon-radha-shyamsundar.jpg"), label: "ISKCON Vrindavan — Radha Shyamsundar" },
  { url: IMG("banke-bihari.jpg"), label: "Banke Bihari Mandir" },
  { url: IMG("prem-mandir.jpg"), label: "Prem Mandir, Vrindavan" },
  { url: IMG("yamuna-ghat.jpg"), label: "Yamuna Ghat" },
  { url: IMG("holi-vrindavan.jpg"), label: "Holi Utsav, Vrindavan" },
  { url: IMG("radha-raman.jpg"), label: "Radha Raman Mandir" },
  { url: IMG("govardhan-parvat.jpg"), label: "Govardhan Parvat" },
  { url: IMG("nauka-vihar.jpg"), label: "Radha Krishna — Nauka Vihar" },
  { url: IMG("nidhivan.jpg"), label: "Nidhivan" },
  { url: IMG("janmashtami.jpg"), label: "Janmashtami Utsav" },
  { url: IMG("govardhan-leela.jpg"), label: "Govardhan Leela" },
  { url: IMG("phool-shringaar.jpg"), label: "Phool Shringaar" },
];

// Admin ke add kiye photos merge karo
/* Puzzle ke liye photos — default + admin ki "Puzzle" album wali photos.
   Admin panel me photo upload karte waqt album "Puzzle" chuno, wo yahan aa jayegi. */
export function getPuzzleImages() {
  const admin = CUSTOM.gallery
    .filter(g => /puzzle/i.test(g.album || ""))
    .sort((a, b) => String(b.addedAt || "").localeCompare(String(a.addedAt || "")))
    .map(g => ({ src: g.file ? IMG(g.file) : g.url, name: g.label || "Radha Krishna" }));
  return [
    ...admin,
    { src: process.env.PUBLIC_URL + "/puzzle-makhan-chor.jpg", name: "Makhan Chori Leela" },
  ];
}

// Album wali photos sabse pehle (naya upload sabse upar), phir baaki
export const GALLERY_ITEMS = [
  ...BASE_GALLERY,
  ...CUSTOM.gallery.map(g => ({
    url: g.file ? IMG(g.file) : g.url,
    label: g.label || randomRadhaCaption(),
    album: g.album || undefined, // jaise "Radha Mandir"
    addedAt: g.addedAt,
  })),
];

/* ============================================================
   BHAJANS — Internet Archive se (sab URLs verified working)
   ============================================================ */
const BASE_BHAJANS = [
  {
    id: 1,
    title: "Jaya Radha Madhava",
    singer: "Sacinandana Swami",
    duration: "10:02",
    src: "https://archive.org/download/SacinandanaSwamiBhajan_5/SacinanadanaSwamiBhajan_64kb.mp3",
    cover: IMG("iskcon-radha-shyamsundar.jpg"),
    lyrics: "जय राधा-माधव जय कुञ्ज-बिहारी।\nजय गोपी-जन-वल्लभ जय गिरिवर-धारी॥",
  },
  {
    id: 2,
    title: "Radha Kunda Tata (Kirtan)",
    singer: "ISKCON Kirtan",
    duration: "6:55",
    src: "https://archive.org/download/iskcone-bhajan-radha-kunda-tata/recording-1.mp3",
    cover: IMG("yamuna-ghat.jpg"),
    lyrics: "राधा-कुण्ड-तट कुञ्ज-कुटीर।\nगोवर्धन-पर्वत यामुन-तीर॥",
  },
  {
    id: 3,
    title: "Jaya Radhe Jaya Krishna Jaya Vrindavan",
    singer: "ISKCON Kirtan",
    duration: "8:44",
    src: "https://archive.org/download/iskcone-bhajan-dzhaia-radkhe-dzhaia-krishna-dzhaia-vrindavan/recording-1.mp3",
    cover: IMG("prem-mandir.jpg"),
    lyrics: "जय राधे जय कृष्ण जय वृन्दावन।\nश्री गोविन्द गोपीनाथ मदन-मोहन॥",
  },
  {
    id: 4,
    title: "Adharam Madhuram (Madhurashtakam)",
    singer: "Traditional Bhajan",
    duration: "6:50",
    src: "https://archive.org/download/KRISHNABHAJANANDSTAVA/003.%20Adharam%20Madhuram.mp3",
    cover: IMG("nauka-vihar.jpg"),
    lyrics: "अधरं मधुरं वदनं मधुरं, नयनं मधुरं हसितं मधुरम्।\nहृदयं मधुरं गमनं मधुरं, मधुराधिपतेरखिलं मधुरम्॥",
  },
  {
    id: 5,
    title: "Chandan Charchit (Gita Govinda)",
    singer: "Traditional Bhajan",
    duration: "7:25",
    src: "https://archive.org/download/KRISHNABHAJANANDSTAVA/001.%20Chandan%20Charchit.mp3",
    cover: IMG("govardhan-leela.jpg"),
    lyrics: "चन्दन-चर्चित-नील-कलेवर-पीत-वसन-वनमाली।\nकेलि-चलन्मणि-कुण्डल-मण्डित-गण्ड-युग-स्मित-शाली॥",
  },
  {
    id: 6,
    title: "Mera Shyam Aa Jata Mere Samne",
    singer: "Krishna Bhajan",
    duration: "8:16",
    src: "https://archive.org/download/KrishnaBhajans_201805/Mera%20Shyam%20Aa%20Jata%20Mere%20Samne.mp3",
    cover: IMG("banke-bihari.jpg"),
  },
];

/* ============================================================
   YOUTUBE BHAJANS — naye/popular gaane (copyright ke karan MP3
   nahi, isliye app ke andar hi YouTube embed player se bajte hain)
   ytId = YouTube video ki ID
   ============================================================ */
const YT_BHAJANS = [
  { title: "Radha Rani Meri Hai", singer: "Devi Neha Saraswat", ytId: "yyl1GredDLY" },
  { title: "Braj Ras", singer: "B Praak · Jaani · Mir Desai", ytId: "C8iQCmo-o_Y" },
  { title: "Mithe Ras Se Bharyo Radha Rani Lage", singer: "The Bundeli Artists", ytId: "w8piP6I3VS0" },
  { title: "Main Haara", singer: "Jainen · Paras Chhabra", ytId: "RoXNfVS5NJY" },
  { title: "Meri Vinti Yahi Hai Radha Rani", singer: "Chitra Vichitra Ji Maharaj", ytId: "mjixdc3g9Cs" },
  { title: "Koi Jaye Jo Barsane", singer: "Nikhil Verma · KSHL Music", ytId: "a5rJoF0Xviw" },
  { title: "Radha Rani Mann Barsana", singer: "Nikhil Verma", ytId: "Q0QCiVell7Y" },
  { title: "Radha Rani Ke 28 Naam", singer: "Komal Bareth", ytId: "nrKBWz1WWwk" },
  { title: "Shyama Pyari Kunj Bihari", singer: "Chitra Vichitra Ji Maharaj", ytId: "aHlkANajtBs" },
  { title: "Karuna Karo Kasht Haro", singer: "Dr. Prakhar Dagar", ytId: "YQ8OTZ31yCs" },
];

const YT_COVERS = [
  IMG("iskcon-radha-shyamsundar.jpg"), IMG("prem-mandir.jpg"), IMG("banke-bihari.jpg"),
  IMG("nauka-vihar.jpg"), IMG("radha-raman.jpg"), IMG("yamuna-ghat.jpg"),
  IMG("govardhan-leela.jpg"), IMG("phool-shringaar.jpg"), IMG("janmashtami.jpg"), IMG("govardhan-parvat.jpg"),
];

// Admin ke add kiye bhajans merge karo
export const BHAJANS = [
  ...BASE_BHAJANS,
  ...YT_BHAJANS.map((b, i) => ({
    id: 200 + i,
    title: b.title,
    singer: b.singer,
    duration: "YouTube",
    ytId: b.ytId,
    cover: YT_COVERS[i % YT_COVERS.length],
  })),
  ...CUSTOM.bhajans.map((b, i) => ({
    id: 100 + i,
    title: b.title,
    singer: b.singer || "Bhajan",
    duration: b.duration || "—",
    src: b.src,
    cover: b.cover || IMG("iskcon-radha-shyamsundar.jpg"),
    lyrics: b.lyrics || undefined,
  })),
];

/* ============================================================
   LEELAS — Full detailed stories
   ============================================================ */
const BASE_LEELAS = [
  {
    title: "🎭 Raas Leela — Divya Prem ka Utsav",
    story: `Sharad Purnima ki raat thi. Yamuna ke kinare kadamba ke ped pe baithe Krishna ne murli utha li. Woh dhun jo unhone chhedi, woh koi saadharan dhun nahi thi — woh Radha ke prem ki pukar thi. Vrindavan ki galiyon mein, ghar ghar mein, gopi ke kaanon mein woh awaaz pahunchi aur unke paon apne aap Yamuna ke kinare ki taraf uthne lage.

Kuch gharon mein chulhe jal rahe the, kuch bacche so rahe the, kuch ke pati saath the — par Radha ki prem-shakthi ke saamne sab kuch rukh gaya. Gopi apne aap wahan pahunchi jahan Krishna kha the.

Aur phir woh raas shuru hua jo teeno loko mein pehle kabhi nahi hua tha. Devta aakash se phool barsane lage. Brahmand ka ek ek kona Radhe-Radhe ki dhun se goonj utha. Har gopi ke saath ek Krishna, par Radha ke saath woh sabse gehre prem mein the.

Yeh raas abhi bhi hota hai — Nidhivan mein, aaj bhi, har raat. Isliye Nidhivan ke darwaze sooraj dhalne ke baad band ho jaate hain.`,
    bg: "#EEEDFE", text: "#3C3489", border: "#AFA9EC", emoji: "🌙",
  },
  {
    title: "💔 Maan Leela — Prem ki Naraazgi",
    story: `Radha aur Krishna mein kabhikabhi itna gehra prem tha ki woh ek doosre se rooth jaate the — aur yeh rooth-manaana khud ek leela tha.

Ek baar Krishna kisi aur gopi ke saath phool leta hua dikh gaye Radha ko. Radha ka mann bhar aaya. Woh Barsana ki galiyon mein chali gayin, apni sakhi ke ghar, aur darwaza band kar liya. Krishna aaye, phir gaye, phir aaye. Bahar khade hokar kehte rahe — "Radhe, ek baar darwaza kholo."

Radha ne nahi khola.

Tab Krishna ne ek sakhi ke zariye kaha — "Keh do Radha se ki agar woh nahi aayengi, toh main bhi nahi aaunga. Aur phir koi bhi Radhe Radhe bolega, main nahi sunuunga."

Yeh sunke Radha khud aa gayin. Kyunki Radha jaanti thin — prem mein haarna hi jeetna hai.

Aaj bhi Barsana mein yeh leela yaad ki jaati hai — Lathmar Holi ke roop mein, jab Radha ki sakhiyan Krishna ke saathiyon ko laathi marti hain aur woh hanste hanste sahte hain.`,
    bg: "#FBEAF0", text: "#72243E", border: "#ED93B1", emoji: "🌸",
  },
  {
    title: "🏔️ Govardhan Leela — Prem ne Pahaad Uthaya",
    story: `Mathura mein ek baar Indra dev ne apni pooja band hone par krodh mein Vrindavan par bhaari varsha bheji. Kaali ghata chhaa gayi. Yamuna uchhalne lagi. Gaye, bacche, gopiyan — sab bheeg rahe the, kaanp rahe the.

Tabhi ek saath lakh chaar saal ke Krishna ne apni chhoti se ungali par Govardhan Parvat ko uthaa liya — jaise koi chhatta uthata ho. "Aao mere neeche," unhone kaha, "yahan koi bhi bheeg nahi sakta."

Saat din aur saat raatein Govardhan uthaa rahe. Tab Indra ko apni galti samjhi. Woh aaye, Krishna ke charanon mein gire, maafi maangi.

Krishna ne sirf muskuraake kaha — "Indra, yeh log mere hain. Inhe koi takleef nahi pahunch sakti."

Aaj bhi Govardhan Puja par bhakton ki lambi lambi Parikrama hoti hai — 21 kilometer. Haath mein diya, mann mein Krishna.`,
    bg: "#EAF3DE", text: "#27500A", border: "#97C459", emoji: "⛰️",
  },
  {
    title: "🌺 Phool Bangla Leela — Phoolon ka Mahal",
    story: `Sawan ka mahina tha. Vrindavan ki hawa mein chameli, juhi, aur kadamba ki khushboo basi hui thi. Radha ki sakhi Lalita ne ek din socha — aaj Radha aur Krishna ke liye ek aisa bangla banaate hain jisme sirf phool hon.

Poori raat sakhi ne phool chunein — marigold, chameli, gulab, kamal, kadamba. Ek ek phool ko prem se sajaaya. Bangla ka har stambh phoolon se dhaka tha. Farsh par phoolon ki pankhudiyan, chhat par phoolon ke jhaar.

Jab Radha aur Krishna us bangla mein aaye, toh dono ruk gaye. Itni khubsurati unhe bhi hairaan kar gayi. Krishna ne Radha ki taraf dekha, Radha ne Krishna ki taraf — aur dono muskuraye.

Woh raat sirf unki thi.

Aaj bhi Vrindavan mein sawan mein Phool Bangla Utsav manaya jaata hai. Mandir ke shringaar mein sirf taaza phool use hote hain. Bhakton ka manna hai ki aaj bhi Radha Krishna us bangla mein milte hain.`,
    bg: "#FAEEDA", text: "#633806", border: "#FAC775", emoji: "🌼",
  },
  {
    title: "🎪 Dan Leela — Raasta Roka",
    story: `Vrindavan ki gopiyan apna maakhan aur dahi bechne Mathura jaati thin. Ek din Krishna ne apne saathiyon ke saath raasta rok liya.

"Kahaan ja rahi ho?" Krishna ne muskuraate hue pucha.

"Mathura, maakhan bechne," Radha ki sakhi ne kaha.

"Yahan se jaana hai toh pehle mujhe bhi kuch dena hoga — Dan dena hoga."

Gopiyan maan gayin. Maakhan ki matki kholi. Krishna ne bhaav se chaakha — "Bahut accha hai. Par dan mein itna hi kaafi nahi. Thoda aur chahiye."

Sab ek doosre ko dekhne lage. Krishna hanste rahe. Gopiyan bhi hans gayin.

Yeh khel ghanton chala. Ant mein Krishna ne kaha — "Ek baar Radhe Radhe bol do, sab dan ho jaayega."

Aur sabne ek saath kaha — Radhe Radhe.

Aaj bhi Nandgaon aur Barsana mein yeh leela kheli jaati hai. Purush Radha ki taraf jaate hain, mahilayein unhe rokti hain — aur sab milkar hanste hain.`,
    bg: "#E1F5EE", text: "#085041", border: "#5DCAA5", emoji: "🏺",
  },
  {
    title: "🎵 Murli ki Dhun — Aawaz jo Aaj Bhi Hai",
    story: `Krishna ki murli ke baare mein kaha jaata hai ki jab woh bajate the, toh sirf gopiyan hi nahi, darakhton ki pattiyan, panchhi, yahan tak ki Yamuna ka behna bhi ruk jaata tha.

Ek baar ek rishi ne poochha — "Krishna, is murli mein aisa kya hai?"

Krishna muskuraye aur bole — "Main Radha ki yaad mein bajata hoon. Aur Radha ka prem is murli se guzarta hai — isliye har woh cheez jo sunta hai, woh rok jaata hai. Kyunki aisa prem phir kabhi nahi suna."

Rishi ne poochha — "Toh kya Radha bhi sunti hain?"

Krishna ne aankhein neechi kar lin aur bole — "Woh sunti nahi — woh khud us dhun mein hain."

Aaj Vrindavan mein jo bhi murli ki awaaz sunta hai — kuch pal ke liye sab kuch bhool jaata hai. Bhakton ka manna hai ki woh pehli dhun abhi bhi wahan hai — sirf sunne wala chahiye.`,
    bg: "#EEEDFE", text: "#26215C", border: "#CECBF6", emoji: "🎵",
  },
];

// Admin ki add ki leelas — rang bari-bari se milte hain
const LEELA_COLOR_SETS = [
  { bg: "#FBEAF0", text: "#72243E", border: "#ED93B1" },
  { bg: "#EAF3DE", text: "#27500A", border: "#97C459" },
  { bg: "#EEEDFE", text: "#3C3489", border: "#AFA9EC" },
  { bg: "#FAEEDA", text: "#633806", border: "#FAC775" },
  { bg: "#E1F5EE", text: "#085041", border: "#5DCAA5" },
];

export const LEELAS = [
  ...BASE_LEELAS,
  ...CUSTOM.leelas.map((l, i) => ({
    title: `${l.emoji || "🌸"} ${l.title}`,
    story: l.story,
    emoji: l.emoji || "🌸",
    ...LEELA_COLOR_SETS[i % LEELA_COLOR_SETS.length],
  })),
];

/* ============================================================
   FESTIVAL CALENDAR — ek hi jagah data, saal ke hisaab se
   ============================================================ */
// Dates Drik Panchang se verified hain (Rang Panchami 2027 approx — Holi ke 4 din baad)
const FESTIVAL_DATA = {
  2026: [
    { month: "Mar", day: "04", name: "Holi / Phoolon ki Holi", desc: "Vrindavan ki prasidh Phoolon wali Holi — Banke Bihari mandir mein phool barsaye jaate hain. (Holika Dahan: 3 Mar)", emoji: "🎨", color: "#ED93B1" },
    { month: "Mar", day: "08", name: "Rang Panchami", desc: "Vrindavan mein Holi ka aakhri din — is din Thakur ji ko rang chadhaaya jaata hai.", emoji: "🌈", color: "#CECBF6" },
    { month: "Aug", day: "15", name: "Hariyali Teej", desc: "Radha-Krishna ke milan ka utsav — sawan mein jhoolon par jhulna aur kirtan.", emoji: "🌿", color: "#C0DD97" },
    { month: "Sep", day: "04", name: "Janmashtami", desc: "Shri Krishna ka Prakatya Utsav — Mathura, Vrindavan mein 3 din ka mahotsav. (ISKCON mandiron mein 5 Sep)", emoji: "🪔", color: "#FAC775" },
    { month: "Sep", day: "19", name: "Radhashtami", desc: "Shri Radha Rani ka Prakatya Divas — Barsana mein poori raat kirtan aur vishesh abhishek.", emoji: "🌸", color: "#F4C0D1" },
    { month: "Oct", day: "25", name: "Sharad Purnima", desc: "Raas Leela ki raat — ashwin poornima, Yamuna kinare bhakton ka mela.", emoji: "🌕", color: "#B5D4F4" },
    { month: "Nov", day: "10", name: "Govardhan Puja", desc: "Giriraj Govardhan ki puja — Annakoot — hazaron bhog lagaye jaate hain, 21km ki parikrama.", emoji: "⛰️", color: "#C0DD97" },
    { month: "Nov", day: "24", name: "Kartik Purnima", desc: "Yamuna snan ka vishesh divas — Dev Deepawali — poore Vrindavan mein lakhon diye jalte hain.", emoji: "✨", color: "#FAC775" },
  ],
  2027: [
    { month: "Mar", day: "22", name: "Holi / Phoolon ki Holi", desc: "Vrindavan ki prasidh Phoolon wali Holi — Banke Bihari mandir mein phool barsaye jaate hain. (Holika Dahan: 21 Mar)", emoji: "🎨", color: "#ED93B1" },
    { month: "Mar", day: "26", name: "Rang Panchami", desc: "Vrindavan mein Holi ka aakhri din — is din Thakur ji ko rang chadhaaya jaata hai.", emoji: "🌈", color: "#CECBF6" },
    { month: "Aug", day: "04", name: "Hariyali Teej", desc: "Radha-Krishna ke milan ka utsav — sawan mein jhoolon par jhulna aur kirtan.", emoji: "🌿", color: "#C0DD97" },
    { month: "Aug", day: "25", name: "Janmashtami", desc: "Shri Krishna ka Prakatya Utsav — Mathura, Vrindavan mein 3 din ka mahotsav hota hai.", emoji: "🪔", color: "#FAC775" },
    { month: "Sep", day: "08", name: "Radhashtami", desc: "Shri Radha Rani ka Prakatya Divas — Barsana mein poori raat kirtan aur vishesh abhishek.", emoji: "🌸", color: "#F4C0D1" },
    { month: "Oct", day: "15", name: "Sharad Purnima", desc: "Raas Leela ki raat — ashwin poornima, Yamuna kinare bhakton ka mela.", emoji: "🌕", color: "#B5D4F4" },
    { month: "Oct", day: "30", name: "Govardhan Puja", desc: "Giriraj Govardhan ki puja — Annakoot — hazaron bhog lagaye jaate hain, 21km ki parikrama.", emoji: "⛰️", color: "#C0DD97" },
    { month: "Nov", day: "14", name: "Kartik Purnima", desc: "Yamuna snan ka vishesh divas — Dev Deepawali — poore Vrindavan mein lakhon diye jalte hain.", emoji: "✨", color: "#FAC775" },
  ],
};

export const FESTIVAL_YEARS = Object.keys(FESTIVAL_DATA).map(Number);

export function getFestivalsForYear(year) {
  return FESTIVAL_DATA[year] || FESTIVAL_DATA[2026];
}

export const MONTH_IDX = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

// Aane wala sabse nazdeeki festival (countdown ke liye)
export function getNextFestival() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let best = null;
  for (const year of FESTIVAL_YEARS) {
    for (const f of FESTIVAL_DATA[year]) {
      const d = new Date(year, MONTH_IDX[f.month], Number(f.day));
      if (d >= today && (!best || d < best.date)) best = { ...f, date: d, year };
    }
  }
  if (!best) return null;
  const daysLeft = Math.round((best.date - today) / (1000 * 60 * 60 * 24));
  return { ...best, daysLeft };
}

/* ============================================================
   QUOTES
   ============================================================ */
export const QUOTES = [
  { text: "Radhe Radhe bolne se hi, Vrindavan ki dharti pavitra ho jaati hai.", source: "— Vrindavan Mahima, Skanda Purana" },
  { text: "Jab Radha ka naam liya jaata hai, Krishna khud chale aate hain.", source: "— Sant Kabir" },
  { text: "Radha ki bhakti sabse badi bhakti hai, kyunki woh prem ki murthi hain.", source: "— Chaitanya Mahaprabhu" },
  { text: "Shri Radha ke charanon mein hi mera ghar hai, mera dil hai, mera sab kuch hai.", source: "— Hita Harivamsh" },
  { text: "Prem ka dusra naam Radha hai, aur Radha ka dusra naam prem hai.", source: "— Surdas" },
  { text: "Jo Radha ko jaanta hai, woh jaanta hai ki prem kya hota hai.", source: "— Rupa Goswami" },
  { text: "Vrindavan mein ek pal ka vaas, karo tirath ka sab kuch prayas.", source: "— Vrindavan Mahima" },
];

// Aaj ka doha — din ke hisaab se badalta hai
export function getQuoteOfTheDay() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return QUOTES[dayOfYear % QUOTES.length];
}

// WhatsApp share link banao
export function whatsappShare(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export const INITIAL_COMMENTS = [
  { id: 1, author: "Priya Devi", text: "Jai Shri Radhe! Yeh website dekh ke mann ko bahut sukoon mila. Radha Rani ki kripa sab par bani rahe. 🙏", time: "2 ghante pehle" },
  { id: 2, author: "Ravi Sharma", text: "Vrindavan jaane ka mann kar raha hai isko dekh ke. Bhajans sun ke aankhon mein aansu aa gaye. Bahut sundar bhav hai is website mein.", time: "5 ghante pehle" },
  { id: 3, author: "Sunita Gupta", text: "Radhashtami ki bahut bahut shubhkamnayein sabhi bhakton ko! Radhe Radhe 🌸", time: "1 din pehle" },
  { id: 4, author: "Mohan Das", text: "Leelayein padh ke lagta hai jaise khud Vrindavan mein hoon. Phool Bangla Leela toh bahut hi sundar likhi hai.", time: "2 din pehle" },
];

export const ALL_SEARCH_DATA = [
  { title: "Jaya Radha Madhava", type: "Bhajan" },
  { title: "Radha Kunda Tata", type: "Bhajan" },
  { title: "Jaya Radhe Jaya Krishna Jaya Vrindavan", type: "Bhajan" },
  { title: "Adharam Madhuram", type: "Bhajan" },
  { title: "Chandan Charchit", type: "Bhajan" },
  { title: "Mera Shyam Aa Jata Mere Samne", type: "Bhajan" },
  { title: "Raas Leela", type: "Leela" },
  { title: "Maan Leela", type: "Leela" },
  { title: "Govardhan Leela", type: "Leela" },
  { title: "Phool Bangla Leela", type: "Leela" },
  { title: "Dan Leela", type: "Leela" },
  { title: "Murli ki Dhun", type: "Leela" },
  { title: "Janmashtami", type: "Festival" },
  { title: "Radhashtami", type: "Festival" },
  { title: "Holi Phoolon ki", type: "Festival" },
  { title: "Govardhan Puja", type: "Festival" },
  { title: "Kartik Purnima", type: "Festival" },
  { title: "Sharad Purnima", type: "Festival" },
  { title: "Japa Counter", type: "Counter" },
  { title: "Radha Krishna Quiz", type: "Quiz" },
  { title: "Braj Yatra Guide", type: "Yatra" },
  { title: "Banke Bihari Mandir Timings", type: "Yatra" },
  { title: "Barsana Shriji Mandir", type: "Yatra" },
  { title: "Prem Mandir Vrindavan", type: "Yatra" },
  { title: "Govardhan Parikrama", type: "Yatra" },
  { title: "Krishna Janmabhoomi Mathura", type: "Yatra" },
  { title: "Radha Krishna Pahari Painting", type: "Gallery" },
  { title: "Banke Bihari Mandir Vrindavan", type: "Gallery" },
  { title: "Yamuna Ghat Vrindavan", type: "Gallery" },
  { title: "Govardhan Parvat", type: "Gallery" },
];

export const NAV_LINKS = ["Home", "Gallery", "Bhajans", "Leelas", "Calendar", "Counter", "Mandir", "Quiz", "Puzzle", "Yatra", "Status", "Contact"];

export const MANTRAS = ["राधे राधे", "हरे कृष्ण हरे कृष्ण", "जय श्री राधे", "ॐ नमो भगवते वासुदेवाय"];
