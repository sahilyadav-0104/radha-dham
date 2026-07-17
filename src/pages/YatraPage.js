import { useState } from "react";
import { useT } from "../i18n";

/* ============================================================
   BRAJ YATRA GUIDE — Vrindavan, Barsana, Mathura, Govardhan,
   Nandgaon — mandir history, timings aur aarti ke saath
   ============================================================ */
const PLACES = [
  {
    id: "vrindavan",
    name: "Vrindavan",
    emoji: "🛕",
    intro: "Krishna ki leela bhumi — jahan har gali me Radhe Radhe goonjta hai. Yahan 5000 se zyada mandir hain. Kam se kam 2 din rukne ka plan banayein.",
    reach: "🚗 Delhi se ~150 km (Yamuna Expressway se 3 ghante) · 🚂 Nearest station: Mathura Jn (14 km) · Vrindavan me e-rickshaw sabse aasaan hai",
    temples: [
      {
        name: "Banke Bihari Mandir",
        emoji: "🌸",
        history: "Swami Haridas ji (sangeet samrat Tansen ke guru) ne Nidhivan me apni bhakti se Banke Bihari ji ko prakat kiya tha. Abhi ka mandir 1864 me bana. Yahan Thakur ji ke darshan jhanki me hote hain — parda baar-baar band hota hai kyunki manyata hai ki Bihari ji ki nazar se koi bhakt behosh na ho jaye!",
        timings: "Garmi: 7:45 AM – 12:00 PM & 5:30 PM – 9:30 PM · Sardi: 8:45 AM – 1:00 PM & 4:30 PM – 8:30 PM",
        aarti: "Shringar Aarti: subah darshan khulte hi · Rajbhog Aarti: dopahar band hone se pehle · Shayan Aarti: raat band hone se pehle. Khaas baat — Mangala Aarti saal me sirf ek baar, Janmashtami ki raat hoti hai!",
        tip: "Subah khulte hi jao, bheed kam milegi. Phone/chashma bandaron se bachao!",
      },
      {
        name: "Prem Mandir",
        emoji: "🏛️",
        history: "2012 me Jagadguru Kripalu Ji Maharaj ne banwaya. Poora mandir safed Italian marble ka hai, deewaron par Krishna leela ki jhankiyan bani hain. Raat ko rang badalti lighting iski pehchaan hai.",
        timings: "5:30 AM – 12:00 PM & 4:30 PM – 8:30 PM (roz)",
        aarti: "Aarti: 5:30 AM, 8:30 AM, 12:00 PM (Rajbhog), 4:30 PM, 8:10 PM (Shayan) · 💡 Musical fountain / light show: shaam 7:30 baje ke aas paas (mausam ke hisaab se)",
        tip: "Shaam ko jao — sunset ke baad ki lighting aur fountain show miss mat karna.",
      },
      {
        name: "ISKCON — Krishna Balaram Mandir",
        emoji: "🕉️",
        history: "1975 me Srila Prabhupada ne banwaya. Yahan Krishna-Balaram, Radha-Shyamsundar aur Gaura-Nitai ke vigraha hain. Prabhupada ji ka samadhi mandir bhi yahin hai. Videshi bhakton ka kirtan dekhne layak hota hai.",
        timings: "4:10 AM – 8:45 PM (dopahar 12:45 – 4:30 darshan band)",
        aarti: "Mangala Aarti: 4:30 AM · Darshan Aarti: 7:15 AM · Rajbhog: 12:00 PM · Sandhya Aarti: 7:00 PM · Shayan: 8:30 PM",
        tip: "Subah 4:30 ki Mangala Aarti ka anubhav alag hi hai — ek baar zaroor lo.",
      },
      {
        name: "Radha Raman Mandir",
        emoji: "💎",
        history: "1542 me sthapit — Vrindavan ke sabse purane mandiron me se. Gopala Bhatta Goswami ki bhakti se shaligram shila se Radha Raman ji ka vigraha swayam prakat hua tha. Yahan Radha ji ki murti nahi — unke sthan par mukut rakha jata hai.",
        timings: "Subah ~8:00 AM – 12:30 PM & Shaam ~6:00 PM – 8:00 PM (sardi me shaam 5:30 se)",
        aarti: "Dhoop Aarti subah, Sandhya Aarti shaam ko · 480+ saal se yahan ka bhog usi parivar ki rasoi se banta hai",
        tip: "Shant aur asli Vrindavan ka anubhav chahiye toh yahan zaroor jao.",
      },
      {
        name: "Nidhivan",
        emoji: "🌳",
        history: "Manyata hai ki har raat yahan Radha Krishna ka Raas hota hai. Tulsi ke ped jode me hain — kaha jata hai ye gopiyan hain. Rang Mahal me roz shaam Thakur ji ke liye shringar aur datun rakhi jati hai — subah bistar aisa milta hai jaise koi soya ho.",
        timings: "Suryoday se suryast tak (raat me entry poori tarah band — koi nahi rukta, bandar bhi nahi!)",
        aarti: "Sandhya aarti ke baad parisar khali kara diya jata hai",
        tip: "Din me jao aur guide ki kahaniyan suno — rongtay khade ho jayenge.",
      },
    ],
  },
  {
    id: "barsana",
    name: "Barsana",
    emoji: "👑",
    intro: "Radha Rani ka gaon — Brahma parvat ki pahadi par unka mahal jaisa mandir hai. Yahan log 'Radhe Radhe' nahi, 'Ladli ji ki jai' bolte hain. Lathmar Holi yahin ki world-famous hai.",
    reach: "🚗 Vrindavan se ~45 km (1 ghanta) · Mathura se ~50 min · Nandgaon yahan se sirf 8 km hai — dono ek saath ghoomo",
    temples: [
      {
        name: "Shriji Mandir (Radha Rani / Ladli Ji Mandir)",
        emoji: "👑",
        history: "Manyata hai ki mool vigraha Krishna ke parpote Vajranabh ji ne sthapit kiya tha. Abhi ka bhavya mandir 1675 me Raja Veer Singh ne banwaya. Pahadi par ~200+ seedhiyan chadh ke jaana hota hai — upar se poore Barsana ka nazara milta hai.",
        timings: "Garmi: 5:00 AM – 2:00 PM & 5:00 PM – 9:00 PM · Sardi: 5:30 AM – 2:00 PM & 5:00 PM – 8:30 PM (approx)",
        aarti: "Mangala Aarti: subah khulte hi · Shringar & Rajbhog: dopahar se pehle · Sandhya Aarti: suryast ke baad · Shayan Aarti: band hone se pehle",
        tip: "Seedhiyan nahi chadh sakte toh gadi upar tak bhi jaati hai. Radhashtami pe yahan ka utsav sabse bada hota hai.",
      },
      {
        name: "Kirti Mandir",
        emoji: "🤱",
        history: "Duniya ka iklauta mandir jahan Radha Rani apni maa Kirti ji ki god me virajman hain. Jagadguru Kripalu Ji Maharaj ki prerna se bana, 2019 me khula. Safed marble ki khubsurat karigari.",
        timings: "5:30 AM – 12:00 PM & 4:00 PM – 8:30 PM (approx)",
        aarti: "Subah aur sandhya aarti — samay mandir se confirm karein",
        tip: "Shriji Mandir ke baad yahan aao — dono paas hi hain.",
      },
      {
        name: "Maan Mandir (Maan Garh)",
        emoji: "💔",
        history: "Yahi wo jagah hai jahan Radha Rani Krishna se rooth ke (maan karke) baithi thin aur Krishna unhe manane aaye the. Pahadi par bana chhota sa mandir — Maan Leela ki yaad me.",
        timings: "Din bhar khula (suryoday se suryast)",
        aarti: "Sthaniya pujari ke anusaar",
        tip: "Yahan se sunset bahut sundar dikhta hai.",
      },
    ],
  },
  {
    id: "mathura",
    name: "Mathura",
    emoji: "🏰",
    intro: "Krishna ki janmabhoomi — 5000 saal purana sheher. Yamuna ke ghat, prachin mandir aur peda (mithai) yahan ki pehchaan hai.",
    reach: "🚂 Mathura Junction — Delhi/Agra se seedhi train · 🚗 Delhi se ~145 km · Vrindavan se sirf 14 km",
    temples: [
      {
        name: "Shri Krishna Janmabhoomi",
        emoji: "⛓️",
        history: "Yahi wo jagah hai jahan Kans ki jail me Krishna ka janm hua tha. Garbh Grih (jail ki kothri) aaj bhi darshan ke liye hai. Mandir kai baar toota aur bana — abhi ka mandir 1965 me poora hua.",
        timings: "Garmi: 5:00 AM – 12:00 PM & 4:00 PM – 9:30 PM · Sardi: 5:30 AM – 12:00 PM & 3:00 PM – 8:30 PM",
        aarti: "Mangala Aarti: subah khulte hi · Shringar Aarti: ~7:40 AM · Sandhya Aarti: shaam ko (mausam ke hisaab se)",
        tip: "Camera/phone andar allowed nahi — locker bahar milta hai. Janmashtami pe yahan ka mahotsav dekhne layak hai.",
      },
      {
        name: "Dwarkadhish Mandir",
        emoji: "🚩",
        history: "1814 me Gwalior ke khazanchi Seth Gokul Das Parikh ne banwaya. Rajasthani shaili ki chitrakari aur jhoolan utsav (sawan ke jhoole) yahan famous hain. Mathura ke purane bazaar ke beech me hai.",
        timings: "6:30 AM – 10:30 AM & 4:00 PM – 7:00 PM (approx, mausam ke hisaab se badalta hai)",
        aarti: "Mangala, Shringar, Rajbhog subah · Sandhya aur Shayan aarti shaam ko",
        tip: "Mandir ke bahar wale bazaar se Mathura ke pede zaroor lena!",
      },
      {
        name: "Vishram Ghat",
        emoji: "🌊",
        history: "Manyata hai ki Kans vadh ke baad Krishna ne yahin vishram kiya tha. Mathura ke 25 ghaton me sabse pramukh — yahan ki shaam ki Yamuna Aarti Banaras ki Ganga Aarti jaisi hoti hai.",
        timings: "Ghat hamesha khula · Yamuna Aarti: shaam ko suryast ke samay (~7 PM garmi, ~6 PM sardi)",
        aarti: "Shaam ki Yamuna Aarti — diye, shankh aur ghantiyon ke saath",
        tip: "Aarti se 20 min pehle pahunch ke aage ki jagah le lo. Naav ki sawari bhi kar sakte ho.",
      },
    ],
  },
  {
    id: "govardhan",
    name: "Govardhan",
    emoji: "⛰️",
    intro: "Giriraj ji — wahi parvat jo Krishna ne ungli par uthaya tha. Yahan ki 21 km parikrama har bhakt ka sapna hai. Radha Kund aur Mansi Ganga bhi yahin hain.",
    reach: "🚗 Mathura se ~22 km, Vrindavan se ~25 km · Parikrama ke liye subah jaldi ya raat ka samay best hai",
    temples: [
      {
        name: "Daan Ghati Mandir",
        emoji: "🙏",
        history: "Yahin se Govardhan Parikrama shuru hoti hai. Manyata hai ki yahan Krishna gopiyon se daan (makhan) maangte the. Giriraj ji ki shila ka darshan aur doodh chadhane ki parampara hai.",
        timings: "Subah 4:30 AM se raat 9:00 PM tak (parikrama 24 ghante chalti hai)",
        aarti: "Mangala aarti subah, sandhya aarti shaam — Giriraj shila par doodh ka abhishek din bhar",
        tip: "Parikrama nange paon karne ki parampara hai — 21 km hai, paani saath rakho. Purnima ki raat parikrama ka alag hi anand hai.",
      },
      {
        name: "Radha Kund & Shyam Kund",
        emoji: "💧",
        history: "Braj ka sabse pavitra sthal mana jata hai. Manyata hai ki Radha Rani aur Krishna ne apne haathon se ye kund banaye the. Ahoi Ashtami par yahan snan ka vishesh mahatva hai.",
        timings: "Hamesha khula · Snan ka samay: subah brahma muhurat sabse uttam",
        aarti: "Kund kinare ke mandiron me subah-shaam aarti hoti hai",
        tip: "Yahan ka shant vatavaran dhyan ke liye perfect hai. Kund ka jal charnamrit ki tarah liya jata hai.",
      },
      {
        name: "Mansi Ganga & Mukharvind Mandir",
        emoji: "🪔",
        history: "Manyata hai ki Krishna ne apne mann se is sarovar ko prakat kiya tha (isliye 'Mansi'). Mukharvind Mandir me Giriraj ji ke mukh ka darshan hota hai — yahan makhan-mishri ka bhog lagta hai.",
        timings: "Din bhar khula · Deepdaan: shaam ko",
        aarti: "Govardhan Puja aur Diwali par yahan lakhs diye jalte hain",
        tip: "Parikrama ke beech me yahan rukk ke prasad lo.",
      },
    ],
  },
  {
    id: "nandgaon",
    name: "Nandgaon",
    emoji: "🐄",
    intro: "Nand Baba ka gaon — jahan Krishna ka bachpan beeta. Makhan chori, gaay charana, gopiyon ko chhedna — sab leelayein yahin ki hain. Barsana se sirf 8 km door.",
    reach: "🚗 Barsana se 8 km, Vrindavan se ~55 km · Barsana ke saath ek hi din me ghoom sakte ho",
    temples: [
      {
        name: "Nand Bhavan (Nand Rai Mandir)",
        emoji: "🏠",
        history: "Pahadi par bana Nand Baba ka ghar — jahan Krishna aur Balram ka bachpan beeta. Manyata hai ki ye bhavan Vishwakarma ji ne ek raat me banaya tha. Yahan Nand Baba, Yashoda, Krishna-Balram aur Radha Rani ke vigraha hain.",
        timings: "Garmi: 5:00 AM – 12:00 PM & 4:00 PM – 9:00 PM · Sardi: 6:00 AM – 12:00 PM & 4:00 PM – 8:00 PM (approx)",
        aarti: "Subah Mangala aur shaam Sandhya aarti — Holi ke samay yahan ka utsav Barsana jaisa hi bada hota hai",
        tip: "Yahan se Barsana ka Shriji Mandir door se dikhta hai — Radha Krishna ke gaon ek dusre ko dekhte hain!",
      },
    ],
  },
];

export default function YatraPage() {
  const { t } = useT();
  const [place, setPlace] = useState("vrindavan");
  const [openTemple, setOpenTemple] = useState(0);

  const p = PLACES.find(x => x.id === place);

  return (
    <div className="page-section">
      <h2 className="section-heading">{t("h.yatra")}</h2>
      <div className="section-divider" />

      {/* Jagah chuno */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {PLACES.map(pl => (
          <button
            key={pl.id}
            className={`lang-chip${place === pl.id ? " active" : ""}`}
            onClick={() => { setPlace(pl.id); setOpenTemple(0); }}
          >{pl.emoji} {pl.name}</button>
        ))}
      </div>

      {/* Intro + kaise pahunche */}
      <div className="yatra-intro">
        <p className="yatra-intro-text">{p.intro}</p>
        <p className="yatra-reach">{p.reach}</p>
      </div>

      {/* Mandir cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {p.temples.map((tm, i) => (
          <div key={i} className="yatra-temple">
            <div className="yatra-temple-head" onClick={() => setOpenTemple(openTemple === i ? null : i)}>
              <h4>{tm.emoji} {tm.name}</h4>
              <span>{openTemple === i ? "▲" : "▼"}</span>
            </div>
            {openTemple === i && (
              <div className="yatra-temple-body">
                <p className="yatra-label">📜 Itihas</p>
                <p className="yatra-text">{tm.history}</p>
                <p className="yatra-label">🕐 Darshan Timings</p>
                <p className="yatra-text">{tm.timings}</p>
                <p className="yatra-label">🪔 Aarti</p>
                <p className="yatra-text">{tm.aarti}</p>
                <div className="yatra-tip">💡 {tm.tip}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ background: "#FAEEDA", border: "0.5px solid #FAC775", borderRadius: 12, padding: "14px 20px", marginTop: 24, textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "#633806", lineHeight: 1.7 }}>
          🕐 Timings mausam aur utsav ke hisaab se badalte hain —<br />
          jaane se pehle mandir se confirm zaroor kar lein. Jai Shri Radhe! 🌸
        </p>
      </div>
    </div>
  );
}
