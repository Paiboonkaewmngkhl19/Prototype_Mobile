import { useState } from "react";
import { ChevronLeft, ChevronRight, CircleHelp, Headset, Phone, Globe } from "lucide-react";
import imgHero from "../assets/home/store-banner.jpg";
import imgSportCard from "../assets/store/sport-card.jpg";
import imgSoundbar from "../assets/store/soundbar.jpg";
import imgCloud from "../assets/store/cloud.jpg";
import logoNetflix from "../assets/store/logo-netflix.png";
import logoHbo from "../assets/store/logo-hbo.png";
import logoHotstar from "../assets/store/logo-hotstar.png";
import logoViu from "../assets/store/logo-viu.png";
import logoIqiyi from "../assets/store/logo-iqiyi.png";
import lgPl from "../assets/sport/lg-pl.png";
import lgUcl from "../assets/sport/lg-ucl.png";
import lgRws from "../assets/sport/lg-rws.png";
import { PAGE_BG, BG, ON_SURFACE, ON_VARIANT, CHIP_BG, CHIP_BORDER, PILL, PILL_RING, GLASS_CARD, PANEL, OUTLINE } from "./theme";

// ─── Store (Figma "Store" file, Mobile / Content modal 5222:66002) ────────────────────────────────────────────────
// Opened from the Store rail on For you and Sports: a package hero (title, badges, Subscribe, VAT), package rails with
// category chips (Sports, Movies, Shorts, Great Value), PPV events, a highlight rail, rentals / buy / one-time, other
// products, a banner, My Subscription, FAQs and Customer Support. Wireframe slots are filled with the app's artwork.

const BASE = import.meta.env.BASE_URL;
const a = (p: string) => `${BASE}${p}`;
const FONT = "'Open Sans', sans-serif";
// cards in the app theme: the TV prototype's glass card
const CARD = GLASS_CARD;

type Pkg = { img: string; price: string; t: string };
const pkgs = (imgs: string[], price = "199 baht / Month", titles?: string[]): Pkg[] =>
  imgs.map((img, k) => ({ img, price, t: titles?.[k] ?? "Package Title" }));

const HERO = [
  { img: imgHero, t: "PLAY Ultimate", price: 199, vat: "212.93", tags: ["Monthly", "Recurring", "Recommend"] },
  { img: imgSportCard, t: "MONOMAX Sports", price: 299, vat: "319.93", tags: ["Monthly", "Recurring"] },
  { img: a("posters_portrait/House.jpg"), t: "HBO Max", price: 159, vat: "170.13", tags: ["Monthly", "New"] },
];

type Chip = { label: string; logo?: string; text?: string };
const RAILS: { title: string; chips: Chip[]; cards: Pkg[] }[] = [
  {
    title: "Sports",
    chips: [{ label: "Popular" }, { label: "Football", logo: lgUcl }, { label: "NBA", text: "NBA" }, { label: "Premier League", logo: lgPl }, { label: "RWS", logo: lgRws }],
    cards: pkgs([imgSportCard, a("posters/upcoming/live.jpg"), a("posters/arsenal.jpg"), a("posters/upcoming/u3.jpg")], "199 baht / Month",
      ["MONOMAX Sports", "Premier League Pass", "Football Plus", "Bundesliga Pass"]),
  },
  {
    title: "Movies",
    chips: [{ label: "Popular" }, { label: "Netflix", logo: logoNetflix }, { label: "HBO Max", logo: logoHbo }, { label: "Disney+ Hotstar", logo: logoHotstar }, { label: "Viu", logo: logoViu }, { label: "iQIYI", logo: logoIqiyi }],
    cards: pkgs([a("posters_portrait/John.jpg"), a("posters_portrait/House.jpg"), a("posters_portrait/avatar.jpg"), a("posters_portrait/F1.jpg")], "199 baht / Month",
      ["Netflix Standard", "HBO Max", "Disney+ Hotstar", "Prime Video"]),
  },
  {
    title: "Shorts",
    chips: [{ label: "Popular" }, { label: "ReelShort", text: "RS" }, { label: "DramaBox", text: "DB" }],
    cards: pkgs([a("tv-features-test/shorts-assets/love-island.jpg"), a("tv-features-test/shorts-assets/coolch.jpg"), a("tv-features-test/shorts-assets/spiderman.jpg"), a("tv-features-test/shorts-assets/doomsday.jpg")], "59 baht / Month",
      ["ReelShort VIP", "DramaBox", "Shorts Plus", "Clips Unlimited"]),
  },
  {
    title: "Great Value",
    chips: [{ label: "< 100 baht Enjoy" }, { label: "< 100 baht Sports" }, { label: "300 baht+" }],
    cards: [
      { img: a("posters_portrait/debt.jpg"), price: "99 baht / Month", t: "Thai Series Pack" },
      { img: a("posters_portrait/ex2.jpg"), price: "999 baht / Month", t: "PLAY All Yearly" },
      { img: a("posters_portrait/ex5.jpg"), price: "79 baht / Month", t: "Concert Pass" },
      { img: a("posters_portrait/topgun_m.jpg"), price: "399 baht / Month", t: "Movie Max" },
    ],
  },
];
const PPV = [
  { img: a("posters_portrait/ex3.jpg"), price: "199 baht", t: "Man City vs Arsenal", when: "23 Oct 2026 | 20:00 – 22:15" },
  { img: a("posters_portrait/ex1.jpg"), price: "299 baht", t: "BOSSCK Dream Concert", when: "30 Oct 2026 | 19:00 – 22:00" },
  { img: a("posters_portrait/ex2.jpg"), price: "149 baht", t: "The Sophomore D-Day", when: "1 Nov 2026 | 18:00 – 21:00" },
];
const HIGHLIGHT = pkgs([a("posters_portrait/ex4.jpg"), a("posters_portrait/lotr/r5.jpg"), a("posters_portrait/Venom.jpg")], "99 baht / Month", ["Matchday Live", "Fantasy Pack", "Action Pack"]);
const RENT = [a("posters_portrait/John.jpg"), a("posters_portrait/Venom.jpg"), a("posters_portrait/avatar.jpg"), a("posters_portrait/F1.jpg")];
const BUY = [a("posters_portrait/topgun_m.jpg"), a("posters_portrait/lotr/r1.jpg"), a("posters_portrait/legal/l1.jpg"), a("posters_portrait/House.jpg")];
const ONE_TIME = pkgs([a("posters_portrait/ex5.jpg"), a("posters_portrait/debt.jpg"), a("posters_portrait/ex1.jpg")], "199 baht / 7 Days", ["Weekly Pass", "Series Binge", "Concert Week"]);
const OTHERS = [{ img: imgSoundbar, t: "Smart Soundbar", pos: "12% center" }, { img: imgCloud, t: "AIS Cloud PC", pos: "25% center" }];
const SUBS = [
  { t: "Play Premium Plus", renews: "Renews 31 December", img: imgHero },
  { t: "Play For you", renews: "Renews 29 October", img: imgSportCard },
];
const FAQS = [
  { q: "How do I activate my package?", a: "After subscribing, your package is active right away on every device signed in to your AIS PLAY account. Open any channel or title in the package to start watching." },
  { q: "Can I cancel anytime?", a: "Yes. Recurring packages can be cancelled from My Subscription; you keep access until the end of the current billing period." },
  { q: "Which devices can I watch on?", a: "AIS PLAY works on phones, tablets, smart TVs, the AIS PLAYBOX and the web, up to the number of screens your package allows." },
];

export default function StorePage({ topInset, bottom, bottomInset = "0px", fullScreen, onBack, onToast }: {
  topInset: string; bottom: string; bottomInset?: string;   // bottomInset: room kept clear for the home indicator
  // on a phone: fixed to the whole screen (this height), clear of every container, so nothing can cut it short
  fullScreen?: string;
  onBack: () => void; onToast: (msg: string) => void;
}) {
  const demo = (label: string) => onToast(`${label} (demo)`);
  const [slide, setSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const h = HERO[slide];
  return (
    <div className={fullScreen ? "fixed inset-x-0 top-0 z-[70]" : "absolute inset-x-0 top-0 z-[16]"}
      style={{ ...(fullScreen ? { height: fullScreen } : { bottom }), background: PAGE_BG, fontFamily: FONT }}>
      {/* header: back + "Store", clear over the hero, glass once the page scrolls */}
      <div className="absolute inset-x-0 top-0 z-10 transition-all duration-300" style={{
        paddingTop: topInset,
        background: scrolled ? "linear-gradient(180deg, rgba(7,14,22,0.6), rgba(118,128,150,0))" : "linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0))",
        backdropFilter: scrolled ? "blur(20px)" : "none", WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
      }}>
        <div className="flex items-center gap-2 px-4" style={{ height: 64 }}>
          <button onClick={onBack} aria-label="Back" className="w-8 h-8 rounded-full flex items-center justify-center"><ChevronLeft size={24} color="#fff" /></button>
          <h1 className="m-0" style={{ fontSize: 20, fontWeight: 600, color: ON_SURFACE }}>Store</h1>
        </div>
      </div>

      <div className="absolute inset-0 overflow-y-auto overflow-x-hidden store-scroll" onScroll={e => setScrolled(e.currentTarget.scrollTop > 0)}>
        {/* hero: the package art, fading into the page, with its title, badges, Subscribe and VAT */}
        <section className="relative" style={{ height: 657 }}>
          <div className="absolute inset-0 overflow-hidden" style={{ WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent 100%)", maskImage: "linear-gradient(to bottom, #000 55%, transparent 100%)" }}>
            {HERO.map((s, k) => (
              <img key={k} src={s.img} alt="" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500" style={{ opacity: k === slide ? 1 : 0, objectPosition: "center top" }} />
            ))}
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 85%)" }} />
          </div>
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-6 px-4 py-2">
            <div className="flex flex-col items-center gap-2 w-full">
              <h2 className="m-0 truncate w-full text-center" style={{ fontSize: 24, lineHeight: "32px", fontWeight: 400, color: "#fff" }}>{h.t}</h2>
              <div className="flex gap-2">
                {h.tags.map(t => <span key={t} className="rounded-[14px] px-2" style={{ fontSize: 14, fontWeight: 500, color: ON_SURFACE, background: BG }}>{t}</span>)}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 w-full">
              <button onClick={() => demo(`Subscribe ${h.t}`)} className="w-full rounded-full flex items-center justify-center" style={{ minHeight: 48, background: "#f0f0f0", boxShadow: "0 4px 4px rgba(0,0,0,0.2)" }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#282828" }}>Subscribe {h.price} baht /Month</span>
              </button>
              <span style={{ fontSize: 14, fontWeight: 500, color: ON_SURFACE }}>(VAT Included: {h.vat} baht)</span>
            </div>
            <div className="flex items-center gap-[6px] p-1">
              {HERO.map((_, k) => (
                <button key={k} onClick={() => setSlide(k)} aria-label={`Package ${k + 1}`} className="rounded-full transition-all duration-300"
                  style={{ height: 8, width: k === slide ? 24 : 8, background: k === slide ? ON_SURFACE : "rgba(255,255,255,0.35)" }} />
              ))}
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-6 pt-6" style={{ paddingBottom: `calc(40px + ${bottomInset})` }}>
          {RAILS.map(r => <CategoryRail key={r.title} rail={r} demo={demo} />)}

          {/* PPV Event: 250 x 375 posters with the price, title, Premium and the date */}
          <Rail title="PPV Event">
            {PPV.map(p => (
              <button key={p.t} onClick={() => demo(p.t)} className="relative shrink-0 overflow-hidden rounded-[24px] text-left" style={{ width: 250, height: 375 }}>
                <img src={p.img} alt="" className="w-full h-full object-cover" />
                <span className="absolute inset-x-0 bottom-0" style={{ height: 200, background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.85))" }} />
                <span className="absolute left-4 right-4 bottom-6 flex flex-col items-start gap-1">
                  <span style={{ fontSize: 18, fontWeight: 500, color: ON_SURFACE }}>{p.price}</span>
                  <span className="truncate w-full" style={{ fontSize: 13, fontWeight: 600, color: ON_SURFACE }}>{p.t}</span>
                  <span className="rounded-full px-2 mt-1" style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: PILL, boxShadow: PILL_RING }}>Premium</span>
                  <span className="rounded-full px-2" style={{ fontSize: 12, color: ON_SURFACE, border: "1px solid rgba(255,255,255,0.4)", background: "rgba(0,0,0,0.3)" }}>{p.when}</span>
                </span>
              </button>
            ))}
          </Rail>

          {/* Highlight: over a picture that fades into the page */}
          <section className="relative flex flex-col gap-4 py-6">
            <img src={imgSoundbar} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ opacity: 0.55, WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 25%, #000 75%, transparent 100%)", maskImage: "linear-gradient(to bottom, transparent 0%, #000 25%, #000 75%, transparent 100%)" }} />
            <h3 className="relative m-0 px-4" style={{ fontSize: 18, fontWeight: 400, lineHeight: "24px", color: ON_SURFACE }}>Highlight</h3>
            <div className="relative store-rail flex gap-3 overflow-x-auto px-4">{HIGHLIGHT.map(p => <PackageCard key={p.t} p={p} onTap={() => demo(p.t)} />)}<Pad /></div>
          </section>

          <Rail title="Rentals" more onMore={() => demo("Rentals")}>{RENT.map(img => <Square key={img} img={img} onTap={() => demo("Rent")} />)}</Rail>
          <Rail title="Buy" more onMore={() => demo("Buy")}>{BUY.map(img => <Square key={img} img={img} onTap={() => demo("Buy")} />)}</Rail>
          <Rail title="One Time">{ONE_TIME.map(p => <PackageCard key={p.t} p={p} onTap={() => demo(p.t)} />)}</Rail>

          {/* Others: devices and services, price only */}
          <Rail title="Others">
            {OTHERS.map(o => (
              <button key={o.t} onClick={() => demo(o.t)} className="shrink-0 flex flex-col gap-2 overflow-hidden rounded-[8px] text-left" style={{ width: 200, height: 228, background: CARD }}>
                <img src={o.img} alt={o.t} className="w-full object-cover rounded-[11px]" style={{ height: 198, objectPosition: o.pos }} />
                <span className="px-1" style={{ fontSize: 18, fontWeight: 500, color: ON_SURFACE }}>199 baht</span>
              </button>
            ))}
          </Rail>

          {/* banner */}
          <div className="px-4">
            <button onClick={() => demo("Smart Soundbar")} className="relative w-full overflow-hidden rounded-[12px]" style={{ height: 120 }}>
              <img src={imgSoundbar} alt="Smart Soundbar" className="w-full h-full object-cover" />
              <span className="absolute left-1/2 -translate-x-1/2 bottom-2 flex items-center gap-1">
                {[0, 1, 2, 3, 4].map(k => <span key={k} className="rounded-full" style={{ height: 6, width: k === 0 ? 14 : 6, background: k === 0 ? ON_SURFACE : ON_VARIANT }} />)}
              </span>
            </button>
          </div>

          {/* My Subscription */}
          <section className="flex flex-col gap-4">
            <RailHeader title="My Subscription" more onMore={() => demo("My Subscription")} />
            <div className="flex flex-col gap-4 px-4">
              {SUBS.map(s => (
                <div key={s.t} className="flex flex-col gap-1 overflow-hidden rounded-[12px] pb-1" style={{ background: "rgba(255,255,255,0.12)" }}>
                  <div className="flex flex-col gap-3 p-3 rounded-b-[8px]" style={{ background: PANEL }}>
                    <div className="flex items-start gap-2">
                      <img src={s.img} alt="" className="rounded-[8px] object-cover shrink-0" style={{ width: 48, height: 48 }} />
                      <span className="flex-1 truncate" style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", color: ON_SURFACE }}>{s.t}</span>
                      <span className="flex items-center rounded-[4px] px-2" style={{ height: 20, fontSize: 10, fontWeight: 500, color: "#101010", background: "#9edb07" }}>Active</span>
                    </div>
                    <div className="flex flex-col gap-2 rounded-[8px] p-2" style={{ background: "rgba(0,0,0,0.25)" }}>
                      <div className="flex flex-wrap gap-[8px_6px]">
                        {[logoNetflix, logoHbo, logoHotstar, logoViu, logoIqiyi].map(l => <img key={l} src={l} alt="" className="rounded-[4px] object-cover" style={{ width: 32, height: 32 }} />)}
                        <span className="flex items-center justify-center rounded-[4px]" style={{ width: 32, height: 32, fontSize: 11, fontWeight: 500, color: "#000", background: "#c9c9c9" }}>+2</span>
                      </div>
                      <span style={{ fontSize: 14, lineHeight: "20px", color: ON_SURFACE }}>+99 Premium Channels</span>
                    </div>
                  </div>
                  <span className="text-center" style={{ fontSize: 12, lineHeight: "16px", color: ON_SURFACE }}>{s.renews}</span>
                </div>
              ))}
            </div>
          </section>

          <Faqs demo={demo} />

          {/* Customer Support */}
          <section className="flex flex-col gap-6 px-4">
            <div className="flex items-center gap-1"><Headset size={24} color={ON_SURFACE} /><h3 className="m-0" style={{ fontSize: 18, fontWeight: 400, color: ON_SURFACE }}>Customer Support</h3></div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1"><Phone size={20} color={ON_SURFACE} /><span style={{ fontSize: 18, color: ON_SURFACE }}>Customer service team</span></div>
              <ul className="m-0 pl-6 flex flex-col gap-2" style={{ fontSize: 14, lineHeight: "20px", color: ON_SURFACE }}>
                <li>Dial 1175 to speak directly with AIS customer support team.</li>
                <li>Dial 1530 to speak directly with 3BB customer support team.</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1"><Globe size={20} color={ON_SURFACE} /><span style={{ fontSize: 18, color: ON_SURFACE }}>myAIS Website</span></div>
              <button onClick={() => demo("myAIS website")} className="w-full rounded-full" style={{ minHeight: 48, background: "#f0f0f0", fontSize: 16, fontWeight: 700, color: "#282828" }}>Access support through the website</button>
            </div>
          </section>
        </div>
      </div>
      <style>{`.store-scroll,.store-rail{scrollbar-width:none}.store-scroll::-webkit-scrollbar,.store-rail::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}

function RailHeader({ title, more, onMore }: { title: string; more?: boolean; onMore?: () => void }) {
  return (
    <div className="flex items-center px-4">
      <h3 className="m-0" style={{ fontSize: 18, fontWeight: 400, lineHeight: "24px", color: ON_SURFACE }}>{title}</h3>
      {more && <button onClick={onMore} aria-label={`More ${title}`} className="p-1 rounded-full"><ChevronRight size={16} color="#fff" /></button>}
    </div>
  );
}
const Pad = () => <span className="shrink-0" style={{ width: 4 }} />;
function Rail({ title, more, onMore, children }: { title: string; more?: boolean; onMore?: () => void; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <RailHeader title={title} more={more} onMore={onMore} />
      <div className="store-rail flex gap-3 overflow-x-auto overflow-y-hidden px-4">{children}<Pad /></div>
    </section>
  );
}

// a package: 200px wide, 1:1 picture, the price and the package name
function PackageCard({ p, onTap }: { p: Pkg; onTap: () => void }) {
  return (
    <button onClick={onTap} className="shrink-0 flex flex-col gap-2 overflow-hidden rounded-[8px] text-left" style={{ width: 200, height: 253, background: CARD }}>
      <img src={p.img} alt="" className="w-full object-cover rounded-[11px]" style={{ height: 198 }} />
      <span className="px-1 truncate" style={{ fontSize: 18, fontWeight: 500, lineHeight: "22px", color: ON_SURFACE }}>{p.price}</span>
      <span className="px-1 truncate" style={{ fontSize: 14.5, lineHeight: "17px", color: ON_VARIANT, marginTop: -4 }}>{p.t}</span>
    </button>
  );
}
function Square({ img, onTap }: { img: string; onTap: () => void }) {
  return (
    <button onClick={onTap} className="shrink-0 overflow-hidden rounded-[8px]" style={{ width: 200, height: 200, background: CARD }}>
      <img src={img} alt="" className="w-full h-full object-cover" />
    </button>
  );
}

// a package rail with its category chips (a 32px round logo + name; the picked one light)
function CategoryRail({ rail, demo }: { rail: (typeof RAILS)[number]; demo: (label: string) => void }) {
  const [on, setOn] = useState(rail.chips[0].label);
  return (
    <section className="flex flex-col gap-4">
      <RailHeader title={rail.title} more onMore={() => demo(rail.title)} />
      <div className="store-rail flex gap-2 overflow-x-auto px-4">
        {rail.chips.map(c => {
          const sel = c.label === on, withImg = rail.title !== "Great Value";
          return (
            <button key={c.label} onClick={() => setOn(c.label)} className="shrink-0 flex items-center gap-[6px] rounded-[8px]"
              style={{ height: 44, padding: withImg ? "4px 12px 4px 4px" : "4px 16px", background: sel ? PILL : CHIP_BG,
                boxShadow: sel ? PILL_RING : "none", border: sel ? "none" : `1px solid ${CHIP_BORDER}`,
                backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
              {withImg && (
                <span className="rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ width: 32, height: 32, background: c.logo ? "#fff" : "#282828" }}>
                  {c.logo ? <img src={c.logo} alt="" className="w-full h-full object-cover" /> : c.text && <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{c.text}</span>}
                </span>
              )}
              <span className="whitespace-nowrap" style={{ fontSize: 14, fontWeight: 500, color: sel ? "#fff" : ON_SURFACE, fontWeight: sel ? 600 : 500, textShadow: sel ? "0 1px 3px rgba(0,0,0,.35)" : "none" }}>{c.label}</span>
            </button>
          );
        })}
        <Pad />
      </div>
      <div className="store-rail flex gap-3 overflow-x-auto px-4">{rail.cards.map(p => <PackageCard key={p.t} p={p} onTap={() => demo(p.t)} />)}<Pad /></div>
    </section>
  );
}

// FAQs: accordion, one open at a time; View all FAQs
function Faqs({ demo }: { demo: (label: string) => void }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="flex flex-col gap-6 px-4">
      <div className="flex items-center gap-1"><CircleHelp size={24} color={ON_SURFACE} /><h3 className="m-0" style={{ fontSize: 18, fontWeight: 400, color: ON_SURFACE }}>FAQs</h3></div>
      {FAQS.map((f, k) => (
        <div key={f.q} className="flex flex-col">
          <button onClick={() => setOpen(open === k ? null : k)} aria-expanded={open === k} className="flex items-center justify-between gap-3 text-left">
            <span style={{ fontSize: 18, fontWeight: 700, lineHeight: "26px", color: "#fff" }}>{f.q}</span>
            <span className="shrink-0" style={{ fontSize: 20, color: "#fff" }}>{open === k ? "−" : "+"}</span>
          </button>
          {open === k && (
            <>
              <span className="w-full" style={{ height: 1, background: OUTLINE }} />
              <div className="flex gap-4 pt-4 items-start">
                <img src={imgHero} alt="" className="rounded-[8px] object-cover shrink-0" style={{ width: 120, height: 68 }} />
                <p className="m-0 flex-1" style={{ fontSize: 14, lineHeight: "20px", color: "#d9d9d9" }}>{f.a}</p>
              </div>
            </>
          )}
        </div>
      ))}
      <div className="flex flex-col items-center gap-2">
        <button onClick={() => demo("View all FAQs")} className="w-full rounded-full" style={{ minHeight: 48, background: "#f0f0f0", fontSize: 16, fontWeight: 700, color: "#282828" }}>View all FAQs</button>
        <span style={{ fontSize: 14, fontWeight: 500, color: ON_VARIANT }}>View all FAQs on myAIS Application</span>
      </div>
    </section>
  );
}
