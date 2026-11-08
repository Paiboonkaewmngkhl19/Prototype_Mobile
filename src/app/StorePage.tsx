import { useState } from "react";
import { ChevronLeft, ChevronRight, CircleHelp, Headset, Phone, Globe } from "lucide-react";
import imgHero from "../assets/home/store-banner.jpg";
import logoNetflix from "../assets/store/logo-netflix.png";
import logoHbo from "../assets/store/logo-hbo.png";
import logoHotstar from "../assets/store/logo-hotstar.png";
import logoViu from "../assets/store/logo-viu.png";
import logoIqiyi from "../assets/store/logo-iqiyi.png";
import lgPl from "../assets/sport/lg-pl.png";
import lgUcl from "../assets/sport/lg-ucl.png";
import lgRws from "../assets/sport/lg-rws.png";
import type { Kind } from "./PackagesPage";
import { PAGE_BG, BG, ON_SURFACE, ON_VARIANT, CHIP_BG, CHIP_BORDER, PILL, PILL_RING, GLASS_CARD, PANEL, OUTLINE, PANEL_SOLID, TAG_BG, TAG_TEXT } from "./theme";
import { CATALOG as C, SHORT_DRAMAS, RENT_LIST } from "./catalog";
import { OTT, PKG, type StorePkg } from "./storeData";
import { rules } from "./mobileRules";
import { CrownFrame, CROWN_IN_FRAME, OttTag } from "./cardTags";
import iconCrown from "../assets/home/crown.svg";

// ─── Store (Figma "Store" file, Mobile / Content modal 5222:66002) ────────────────────────────────────────────────
// Opened from the Store rail on For you and Sports: a package hero (title, badges, Subscribe, VAT), package rails with
// category chips (Sports, Movies, Shorts, Great Value), PPV events, a highlight rail, rentals / buy / one-time, other
// products, a banner, My Subscription, FAQs and Customer Support. Wireframe slots are filled with the app's artwork.

const BASE = import.meta.env.BASE_URL;
const a = (p: string) => `${BASE}${p}`;
const FONT = "'Open Sans', sans-serif";
// cards in the app theme: the TV prototype's glass card
const CARD = GLASS_CARD;

// the Shorts cards keep their short-drama posters: the app's own, in turn
const dramaOf = (plat: string, i: number) => { const own = SHORT_DRAMAS.filter(s => s.plat === plat); return a(`posters/shorts/${own[i % own.length].img}`); };
const shortCard = (p: StorePkg, i: number, badge?: string): Pkg => ({ ...cardOf(p, badge), ott: undefined, plat: p.ott, img: dramaOf(p.ott, i) });
// a card: its own art, or an OTT app / league (ott: its logo on its colours); badge: top left, the rail's first card
type Pkg = { img?: string; price: string; t: string; ott?: string; plat?: string; badge?: string };
const art = (f: string) => a(`posters/store/${f}`);
const num = (n: number) => n.toLocaleString("en-US");
const vat = (n: number) => (Math.round(n * 107) / 100).toLocaleString("en-US", { minimumFractionDigits: 2 });
const cardOf = (p: StorePkg, badge?: string): Pkg => ({ t: p.t, price: `${num(p.price)} baht / ${p.card}`, ott: p.ott, badge });
const allPkgs = () => Object.values(PKG).flat();
// packages matching a test, cheapest first; the first carries the rail's badge
const pick = (test: (p: StorePkg) => boolean, badge?: string) => allPkgs().filter(test).sort((x, y) => x.price - y.price).map((p, i) => cardOf(p, i ? undefined : badge));


const PLAY_ALL = { img: art("foryou-play-all.webp"), t: "PLAY ALL", price: 1999, per: "Year" };
const HERO = [
  { img: art("foryou-play-ultimate.webp"), t: "PLAY ULTIMATE", price: 999, per: "Month", tags: ["Monthly", "Recurring", "Recommended"] },
  { ...PLAY_ALL, tags: ["Annual", "Recurring", "Best Seller"] },
  { img: art("foryou-supergirl.webp"), t: "PLAY PREMIUM PLUS Monthly", price: 299, per: "Month", tags: ["Monthly", "Recurring", "New Release"] },
];

// the rails whose title opens a package list (Great Value has none)
const isKind = (t: string): t is Kind => t === "Sports" || t === "Movies" || t === "Shorts";

export type Chip = { label: string; logo?: string; text?: string; contain?: boolean };
const lg = (k: string): Chip => ({ label: OTT[k].n, logo: a(OTT[k].logo!), contain: true });
const asian = ["iqiyi", "viu", "monomax", "disney", "reelshort", "dramabox", "shortmax"], isLeague = (p: StorePkg) => OTT[p.ott].kind === "league";
const leagues = ["epl", "ucl", "nba", "thai1", "rws", "bundesliga", "motogp", "pga"], tagged = (k: string): Chip => ({ label: OTT[k].n, logo: a(`badges/tag-${k}.png`) });
// tabs: the chips on this page, and tabCards what each shows (the TV Store's); chips: the filters of the package list page
export const RAILS: { title: string; chips: Chip[]; tabs: Chip[]; tabCards: Record<string, Pkg[]> }[] = [
  {
    title: "Sports",
    chips: [{ label: "Popular" }, { label: "Football", logo: lgUcl }, { label: "NBA", text: "NBA" }, { label: "Premier League", logo: lgPl }, { label: "RWS", logo: lgRws }],
    tabs: [{ label: "Popular" }, ...leagues.map(lg)],
    tabCards: {
      Popular: [{ img: PLAY_ALL.img, t: PLAY_ALL.t, price: `${num(PLAY_ALL.price)} baht / ${PLAY_ALL.per}`, badge: "Recommended" }, ...leagues.map(k => cardOf(PKG[k][0]))],
      ...Object.fromEntries(leagues.map(k => [OTT[k].n, PKG[k].map((p, i) => cardOf(p, i ? undefined : p.badge))])),
    },
  },
  {
    title: "Movies",
    chips: [{ label: "Popular" }, { label: "Netflix", logo: logoNetflix }, { label: "HBO Max", logo: logoHbo }, { label: "Disney+ Hotstar", logo: logoHotstar }, { label: "Viu", logo: logoViu }, { label: "iQIYI", logo: logoIqiyi }],
    tabs: [{ label: "Popular" }, ...["netflix", "hbo", "disney", "viu", "monomax"].map(tagged), { label: "iQIYI", logo: logoIqiyi }],
    tabCards: {
      Popular: [cardOf(PKG.netflix[0], "Recommended"), ...[PKG.disney[0], PKG.hbo[0], PKG.prime[0], PKG.viu[0], PKG.iqiyi[0], PKG.netflix[1], PKG.monomax[0]].map(p => cardOf(p))],
      ...Object.fromEntries(["netflix", "hbo", "disney", "iqiyi", "viu", "monomax"].map(k => [OTT[k].n, PKG[k].map((p, i) => cardOf(p, i ? undefined : p.badge))])),
    },
  },
  {
    title: "Shorts",
    chips: [{ label: "Popular" }, { label: "ReelShort", text: "RS" }, { label: "DramaBox", text: "DB" }],
    tabs: [{ label: "Popular" }, ...["reelshort", "dramabox", "shortmax"].map(tagged)],
    tabCards: {
      Popular: ["reelshort", "dramabox", "shortmax"].flatMap(k => PKG[k].slice(0, 2).map((p, i) => ({ p, i }))).sort((x, y) => x.i - y.i).map(({ p, i }, n) => shortCard(p, i, n ? undefined : "Recommended")),
      ...Object.fromEntries(["reelshort", "dramabox", "shortmax"].map(k => [OTT[k].n, PKG[k].map((p, i) => shortCard(p, i, i ? undefined : p.badge))])),
    },
  },
  {
    title: "Great Value",
    chips: [{ label: "< 100 baht Enjoy" }, { label: "< 100 baht Sports" }, { label: "300 baht+" }],
    tabs: [{ label: "< 100 baht Enjoy" }, { label: "< 100 baht Sports" }, { label: "300 - 500 baht" }, { label: "Asian Games" }],
    tabCards: {
      "< 100 baht Enjoy": pick(p => p.price < 100 && asian.includes(p.ott), "Best Saver"),
      "< 100 baht Sports": pick(p => p.price < 100 && isLeague(p), "Best Saver"),
      "300 - 500 baht": pick(p => p.price >= 300 && p.price <= 500, "Recommended"),
      "Asian Games": [{ img: PLAY_ALL.img, t: PLAY_ALL.t, price: `${num(PLAY_ALL.price)} baht / ${PLAY_ALL.per}`, badge: "Recommended" }, ...pick(p => isLeague(p) && p.card === "Month")],
    },
  },
];
// PPV Event: AIS PLAY's own events; the first shows its picture without printed text, so the details read clearly
const PPV: { k: string; img: string; badge: string; pos?: string }[] = [
  { k: "assanee", img: a(C.assanee.w ?? ""), badge: "New Arrival" },
  { k: "missuni", img: a(C.missuni.p ?? ""), badge: "#1 in Thailand", pos: "90% center" },
  { k: "sophomores", img: a(C.sophomores.p ?? ""), badge: "Rerun" },
  { k: "bossckm", img: a(C.bossckm.p ?? ""), badge: "New Arrival" },
];
const HIGHLIGHT: Pkg[] = ([["play-inter", "PLAY INTER", 199], ["play-disney", "PLAY Disney+", 289], ["play-premium", "PLAY PREMIUM", 199], ["play-family", "PLAY FAMILY", 249], ["play-shortmax", "PLAY ShortMax", 99], ["good-tv", "Good TV", 59]] as const)
  .map(([f, t, p]) => ({ img: art(`highlight-${f}.webp`), t, price: `${p} baht / Month` }));
// Rentals and Buy: the titles sold on their own, by whether they can be rented or bought
const SOLD = [...RENT_LIST.map(r => r.k), "superman", "debt", "medium", "khemjira"];
const titleSquare = (k: string) => ({ k, plat: C[k].plat, img: a(C[k].p ?? C[k].w ?? ""), t: C[k].t, pos: k === "superman" ? "87% center" : undefined });
const RENT = SOLD.filter(k => (C[k].rent ?? 0) > 0 && k !== "avatar").map(titleSquare);
const BUY = SOLD.filter(k => (C[k].buy ?? 0) > 0).map(titleSquare);
// One Time: every 7-day pass, charged once, Netflix's first
const ONE_TIME: Pkg[] = [cardOf(PKG.netflix[0]), ...pick(p => p.card === "7 Days" && p !== PKG.netflix[0])];
const OTHERS = ([["5g-max-experience", "AIS 5G MAX Experience", "599 baht / Month"], ["the-one-sim", "The One SIM", "50 baht / SIM"], ["5g-tiktok-shop", "AIS 5G TikTok Shop", "749 baht / Month"], ["5g-seller", "AIS 5G Seller", "699 baht / Month"], ["fam-save", "Fam Save", "299 baht / Month"], ["zeed-movie-lover", "AIS ZEED Movie Lover", "199 baht / Month"]] as const)
  .map(([f, t, price]) => ({ img: art(`others-${f}.webp`), t, price }));
const BANNERS = [{ t: "Smart Soundbar", img: art("banner-soundbar.png") }, { t: "AIS 3BB Fibre3: Refer a Friend", img: art("banner-fibre3-refer.webp"), pos: "center 85%" }, { t: "Home FibreLAN Plus", img: art("banner-fibrelan-plus.webp") }];
const SUBS = [
  { t: "PLAY PREMIUM PLUS Monthly", renews: "Renews December 31", img: art("foryou-supergirl.webp") },
  { t: "PLAY ULTIMATE", renews: "Renews October 29", img: art("foryou-play-ultimate.webp") },
];
const FAQS = [
  { q: "How do I activate my package?", a: "After subscribing, your package is active right away on every device signed in to your AIS PLAY account. Open any channel or title in the package to start watching." },
  { q: "Can I cancel anytime?", a: "Yes. Recurring packages can be canceled from My Subscription; you keep access until the end of the current billing period." },
  { q: "Which devices can I watch on?", a: "AIS PLAY works on phones, tablets, smart TVs, the AIS PLAYBOX and the web, up to the number of screens your package allows." },
];

export default function StorePage({ topInset, bottom, bottomInset = "0px", fullScreen, onBack, onOpenPackages, onToast }: {
  topInset: string; bottom: string; bottomInset?: string;   // bottomInset: room kept clear for the home indicator
  // on a phone: fixed to the whole screen (this height), clear of every container, so nothing can cut it short
  fullScreen?: string;
  onBack: () => void; onOpenPackages: (kind: Kind) => void; onToast: (msg: string) => void;
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
        {/* hero: the package art, fading into the page above the logo printed at its foot, with its title, badges, Subscribe and VAT */}
        <section className="relative" style={{ height: 657 }}>
          <div className="absolute inset-0 overflow-hidden" style={{ WebkitMaskImage: "linear-gradient(to bottom, #000 40%, transparent 76%)", maskImage: "linear-gradient(to bottom, #000 40%, transparent 76%)" }}>
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
              <button onClick={() => demo(`Subscribe ${h.t}`)} className="w-full rounded-[10px] flex items-center justify-center" style={{ minHeight: 48, background: "#f0f0f0", boxShadow: "0 4px 4px rgba(0,0,0,0.2)" }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#282828" }}>Subscribe {num(h.price)} baht /{h.per}</span>
              </button>
              <span style={{ fontSize: 14, fontWeight: 500, color: ON_SURFACE }}>(VAT Included: {vat(h.price)} baht)</span>
            </div>
            <div className="flex items-center gap-[6px] p-1">
              {HERO.map((_, k) => (
                <button key={k} onClick={() => setSlide(k)} aria-label={`Package ${k + 1}`} className="rounded-full transition-all duration-300"
                  style={{ height: 8, width: k === slide ? 24 : 8, background: k === slide ? "#fff" : "rgba(255,255,255,0.35)" }} />
              ))}
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-6 pt-6" style={{ paddingBottom: `calc(40px + ${bottomInset})` }}>
          {RAILS.map(r => <CategoryRail key={r.title} rail={r} demo={demo} onMore={isKind(r.title) ? () => onOpenPackages(r.title as Kind) : undefined} />)}

          {/* PPV Event: 250 x 375 posters with the price, title, Premium and the date */}
          <Rail title="PPV Event">
            {PPV.map(p => { const m = C[p.k], price = rules().price(p.k); return (
              <button key={p.k} onClick={() => demo(m.t)} className="relative shrink-0 overflow-hidden rounded-[24px] text-left" style={{ width: 250, height: 375 }}>
                <img src={p.img} alt="" className="w-full h-full object-cover" style={{ objectPosition: p.pos ?? "center" }} />
                <span className="absolute inset-x-0 bottom-0" style={{ height: 200, background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.85))" }} />
                <CardBadge label={p.badge} />
                <span className="absolute left-4 right-4 bottom-6 flex flex-col items-start gap-1">
                  <span style={{ fontSize: 18, fontWeight: 500, color: ON_SURFACE }}>{price} baht</span>
                  <span className="truncate w-full" style={{ fontSize: 13, fontWeight: 600, color: ON_SURFACE }}>{m.t}</span>
                  <span className="flex items-center gap-2 mt-1">
                    {rules().showsCrown({ k: p.k }) && <CrownFrame><img src={iconCrown} alt="Premium" width={CROWN_IN_FRAME} height={CROWN_IN_FRAME} /></CrownFrame>}
                    {m.plat && <OttTag inline plat={m.plat} />}
                  </span>
                </span>
              </button>
            ); })}
          </Rail>

          {/* Highlight: over a picture that fades into the page */}
          <section className="relative flex flex-col gap-4 py-6">
            <img src={art("hero-play-inter.webp")} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ opacity: 0.55, WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 25%, #000 75%, transparent 100%)", maskImage: "linear-gradient(to bottom, transparent 0%, #000 25%, #000 75%, transparent 100%)" }} />
            <h3 className="relative m-0 px-4" style={{ fontSize: 18, fontWeight: 400, lineHeight: "24px", color: ON_SURFACE }}>Highlight</h3>
            <div className="relative store-rail flex gap-3 overflow-x-auto px-4">{HIGHLIGHT.map(p => <PackageCard key={p.t} p={p} onTap={() => demo(p.t)} />)}<Pad /></div>
          </section>

          <Rail title="Rentals" more onMore={() => demo("Rentals")}>{RENT.map(s => <Square key={s.k} img={s.img} pos={s.pos} plat={s.plat} label={s.t} onTap={() => demo(`Rent ${s.t}`)} />)}</Rail>
          <Rail title="Buy" more onMore={() => demo("Buy")}>{BUY.map(s => <Square key={s.k} img={s.img} pos={s.pos} plat={s.plat} label={s.t} onTap={() => demo(`Buy ${s.t}`)} />)}</Rail>
          <Rail title="One Time">{ONE_TIME.map(p => <PackageCard key={p.t} p={p} onTap={() => demo(p.t)} />)}</Rail>

          {/* Others: devices and services, price only */}
          <Rail title="Others">
            {OTHERS.map(o => (
              <button key={o.t} onClick={() => demo(o.t)} className="shrink-0 flex flex-col overflow-hidden rounded-[8px] text-left" style={{ width: 200, height: 236, background: CARD }}>
                <img src={o.img} alt={o.t} className="w-full shrink-0 object-cover rounded-[11px]" style={{ height: 198 }} />
                <span className="p-2 truncate" style={{ fontSize: 18, fontWeight: 500, lineHeight: "22px", color: ON_SURFACE }}>{o.price}</span>
              </button>
            ))}
          </Rail>

          <BannerCarousel onTap={demo} />

          {/* My Subscription */}
          <section className="flex flex-col gap-4">
            <RailHeader title="My Subscription" more onMore={() => demo("My Subscription")} />
            <SubscriptionCards />
          </section>

          <Faqs demo={demo} />

          {/* Customer Support */}
          <section className="flex flex-col gap-6 px-4">
            <IconTitle icon={<Headset size={24} color={ON_SURFACE} />}><h3 className="m-0" style={{ fontSize: 18, fontWeight: 400, color: ON_SURFACE }}>Customer Support</h3></IconTitle>
            <div className="flex flex-col gap-2">
              <IconTitle icon={<Phone size={20} color={ON_SURFACE} />}><span style={{ fontSize: 18, color: ON_SURFACE }}>Customer service team</span></IconTitle>
              <ul className="m-0 pl-9 flex flex-col gap-2" style={{ fontSize: 14, lineHeight: "20px", color: ON_SURFACE }}>
                <li>Dial 1175 to speak directly with the AIS customer support team.</li>
                <li>Dial 1530 to speak directly with the 3BB customer support team.</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <IconTitle icon={<Globe size={20} color={ON_SURFACE} />}><span style={{ fontSize: 18, color: ON_SURFACE }}>myAIS Website</span></IconTitle>
              <button onClick={() => demo("myAIS website")} className="w-full rounded-[10px]" style={{ minHeight: 48, background: "#f0f0f0", fontSize: 16, fontWeight: 700, color: "#282828" }}>Access support through the website</button>
            </div>
          </section>
        </div>
      </div>
      <style>{`.store-scroll,.store-rail{scrollbar-width:none}.store-scroll::-webkit-scrollbar,.store-rail::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}

// the subscriber's packages, in a side-scrolling row, the same on this page and on Profile. rail: the page's class that
// hides the scrollbar
export function SubscriptionCards({ rail = "store-rail" }: { rail?: string }) {
  return (
    <div className={`${rail} flex items-stretch gap-3 overflow-x-auto overflow-y-hidden px-4`}>
      {SUBS.map(s => (
        <div key={s.t} className="shrink-0 flex flex-col gap-1 overflow-hidden rounded-[12px] pb-1" style={{ width: 289, background: "rgba(255,255,255,0.12)" }}>
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
      <Pad />
    </div>
  );
}

function RailHeader({ title, more, onMore }: { title: string; more?: boolean; onMore?: () => void }) {
  return (
    <div className="flex items-center px-4">
      {/* with more, the whole title (not just the chevron) opens the list */}
      {more
        ? <button onClick={onMore} aria-label={`More ${title}`} className="flex items-center">
            <h3 className="m-0" style={{ fontSize: 18, fontWeight: 400, lineHeight: "24px", color: ON_SURFACE }}>{title}</h3>
            <span className="p-1"><ChevronRight size={16} color="#fff" /></span>
          </button>
        : <h3 className="m-0" style={{ fontSize: 18, fontWeight: 400, lineHeight: "24px", color: ON_SURFACE }}>{title}</h3>}
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
// a card's badge, 8px in from its top left corner
function CardBadge({ label }: { label?: string }) {
  if (!label) return null;
  return <span className="absolute left-2 top-2 rounded-full px-2 whitespace-nowrap" style={{ fontSize: 12, fontWeight: 500, lineHeight: "18px", color: TAG_TEXT, background: TAG_BG }}>{label}</span>;
}

// an OTT app's or league's card art: its logo on its own colours
function BrandArt({ k }: { k: string }) {
  const b = OTT[k];
  const logo = !b.logo ? null : b.kind === "league"
    ? <span className="relative block overflow-hidden rounded-full bg-white" style={{ width: 96, height: 96 }}>
        <img src={a(b.logo)} alt={b.n} className={b.box ? "absolute max-w-none" : "w-full h-full"} style={b.box ? { left: `${b.box[0]}%`, top: `${b.box[1]}%`, width: `${b.box[2]}%`, height: `${b.box[3]}%`, objectFit: "contain" } : { objectFit: b.fit, padding: b.fit === "contain" ? 10 : 0 }} />
      </span>
    : <img src={a(b.logo)} alt={b.n} className={b.kind === "wide" ? "object-contain" : "brand-logo object-cover rounded-[16px]"}
        style={b.kind === "wide" ? { width: 124, height: 72 } : { width: 124, height: "auto" }} />;   // otherwise a logo on its own plate or app icon, shown whole
  return <span className="flex items-center justify-center w-full rounded-[11px] shrink-0" style={{ height: 198, background: b.bg }}>{logo}</span>;
}

function PackageCard({ p, onTap }: { p: Pkg; onTap: () => void }) {
  return (
    <button onClick={onTap} className="relative shrink-0 flex flex-col overflow-hidden rounded-[8px] text-left" style={{ width: 200, height: 257, background: CARD }}>
      {p.ott ? <BrandArt k={p.ott} /> : <span className="relative block w-full shrink-0" style={{ height: 198 }}><img src={p.img} alt="" className="w-full h-full object-cover rounded-[11px]" />{p.plat && <OttTag plat={p.plat} />}</span>}
      <CardBadge label={p.badge} />
      <span className="flex flex-col gap-1 p-2 min-w-0">
        <span className="truncate" style={{ fontSize: 18, fontWeight: 500, lineHeight: "22px", color: ON_SURFACE }}>{p.price}</span>
        <span className="truncate" style={{ fontSize: 14.5, lineHeight: "17px", color: ON_VARIANT }}>{p.t}</span>
      </span>
    </button>
  );
}

// the promotions: swipe between them; the dots follow
function BannerCarousel({ onTap }: { onTap: (label: string) => void }) {
  const [at, setAt] = useState(0);
  return (
    <div className="relative px-4">
      <div className="store-rail flex overflow-x-auto rounded-[12px]" style={{ scrollSnapType: "x mandatory" }}
        onScroll={e => { const el = e.currentTarget; setAt(Math.round(el.scrollLeft / el.clientWidth)); }}>
        {BANNERS.map(b => (
          <button key={b.t} onClick={() => onTap(b.t)} aria-label={b.t} className="shrink-0 w-full overflow-hidden" style={{ height: 120, scrollSnapAlign: "start" }}>
            <img src={b.img} alt="" className="w-full h-full object-cover" style={{ objectPosition: b.pos }} />
          </button>
        ))}
      </div>
      <span className="absolute left-1/2 -translate-x-1/2 bottom-2 flex items-center gap-1 pointer-events-none">
        {BANNERS.map((b, k) => <span key={b.t} className="rounded-full transition-all duration-300" style={{ height: 6, width: k === at ? 14 : 6, background: k === at ? ON_SURFACE : ON_VARIANT }} />)}
      </span>
    </div>
  );
}
function Square({ img, pos, plat, label, onTap }: { img: string; pos?: string; plat?: string; label?: string; onTap: () => void }) {
  return (
    <button onClick={onTap} aria-label={label} className="relative shrink-0 overflow-hidden rounded-[8px]" style={{ width: 200, height: 200, background: CARD }}>
      <img src={img} alt="" className="w-full h-full object-cover" style={{ objectPosition: pos }} />
      {plat && <OttTag plat={plat} />}
    </button>
  );
}

// a package rail with its category chips (a 32px round logo + name; the picked one light)
function CategoryRail({ rail, demo, onMore }: { rail: (typeof RAILS)[number]; demo: (label: string) => void; onMore?: () => void }) {
  const [on, setOn] = useState(rail.tabs[0].label);
  return (
    <section className="flex flex-col gap-4">
      <RailHeader title={rail.title} more onMore={onMore ?? (() => demo(rail.title))} />
      <div className="store-rail flex gap-2 overflow-x-auto px-4">
        {rail.tabs.map(c => <CategoryChip key={c.label} c={c} sel={c.label === on} withImg={rail.title !== "Great Value"} onTap={() => setOn(c.label)} />)}
        <Pad />
      </div>
      <div className="store-rail flex gap-3 overflow-x-auto px-4">{(rail.tabCards[on] ?? []).map(p => <PackageCard key={p.t} p={p} onTap={() => demo(p.t)} />)}<Pad /></div>
    </section>
  );
}

// a category chip: a 32px round logo (or short text) + name; the picked one in the light glass
export function CategoryChip({ c, sel, withImg = true, onTap }: { c: Chip; sel: boolean; withImg?: boolean; onTap: () => void }) {
  // a chip with nothing to show in the circle (Popular) has no circle
  const circle = withImg && !!(c.logo || c.text);
  return (
    <button onClick={onTap} className="shrink-0 flex items-center gap-[6px] rounded-[8px]"
      style={{ height: 44, padding: circle ? "4px 12px 4px 4px" : "4px 16px", background: sel ? PILL : CHIP_BG,
        boxShadow: sel ? PILL_RING : "none", border: sel ? "none" : `1px solid ${CHIP_BORDER}`,
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
      {circle && (
        <span className="rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ width: 32, height: 32, background: c.logo ? "#fff" : "#282828" }}>
          {c.logo ? <img src={c.logo} alt="" className={`w-full h-full ${c.contain ? "object-contain p-1" : "object-cover"}`} /> : c.text && <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{c.text}</span>}
        </span>
      )}
      <span className="whitespace-nowrap" style={{ fontSize: 14, color: sel ? "#fff" : ON_SURFACE, fontWeight: sel ? 600 : 500, textShadow: sel ? "0 1px 3px rgba(0,0,0,.35)" : "none" }}>{c.label}</span>
    </button>
  );
}

// a heading with a leading icon: every icon sits in the same 24px box, 12px from its title, so titles (and the
// text indented under them, 36px) line up whatever the icon's size
function IconTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 flex items-center justify-center" style={{ width: 24, height: 24 }}>{icon}</span>
      {children}
    </div>
  );
}

// FAQs: accordion, one open at a time; View all FAQs
function Faqs({ demo }: { demo: (label: string) => void }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="flex flex-col gap-6 px-4">
      <IconTitle icon={<CircleHelp size={24} color={ON_SURFACE} />}><h3 className="m-0" style={{ fontSize: 18, fontWeight: 400, color: ON_SURFACE }}>FAQs</h3></IconTitle>
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
        <button onClick={() => demo("View all FAQs")} className="w-full rounded-[10px]" style={{ minHeight: 48, background: "#f0f0f0", fontSize: 16, fontWeight: 700, color: "#282828" }}>View all FAQs</button>
        <span style={{ fontSize: 14, fontWeight: 500, color: ON_VARIANT }}>View all FAQs in the myAIS app</span>
      </div>
    </section>
  );
}
