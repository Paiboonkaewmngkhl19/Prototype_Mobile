import { useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import icFilter from "../assets/sports-pkg/icon-filter.svg";
import ic4k from "../assets/sports-pkg/icon-4k.svg";
import icDolby from "../assets/sports-pkg/icon-dolby.svg";
import dot from "../assets/sports-pkg/dot.svg";
import logoPlay from "../assets/sports-pkg/logo-play.png";
import logoNetflix from "../assets/sports-pkg/logo-netflix.png";
import logoHbo from "../assets/sports-pkg/logo-hbo.jpg";
import logoHotstar from "../assets/sports-pkg/logo-hotstar.jpg";
import logoViu from "../assets/store/logo-viu.png";
import logoIqiyi from "../assets/store/logo-iqiyi.png";
import imgSportCard from "../assets/store/sport-card.jpg";
import lgPl from "../assets/sport/lg-pl.png";
import lgUcl from "../assets/sport/lg-ucl.png";
import lgRws from "../assets/sport/lg-rws.png";
import { RAILS, CategoryChip } from "./StorePage";
import PackageDetailsPage from "./PackageDetailsPage";
import FilterSheet, { NO_FILTER, filterCount, MOVIE_APP_NAMES, SHORT_APP_NAMES, type PackageFilter } from "./FilterSheet";
import { PAGE_BG, ON_SURFACE, ON_VARIANT, PANEL, CHIP_BORDER, headerGlass } from "./theme";

// ─── Package lists: Sports / Movies / Shorts (Figma "Store" file, AIS PLAY: store_mainPage 4950:209044) ──────────────
// Opened from the Sports, Movies and Shorts rail titles on the Store: back + "<Kind> Package", a filter button and
// that rail's category chips (Popular shows them all), then each package as a card: Best Seller band, logo + name,
// what it includes, 4K / Dolby / screens, the price (VAT excluded) and View details. Wireframe slots carry the app's
// artwork. The filter button opens the filter sheet; its tags (sub category, league, streaming apps, duration)
// narrow the list.

const BASE = import.meta.env.BASE_URL;
const a = (p: string) => `${BASE}${p}`;
const FONT = "'Open Sans', sans-serif";

export type Kind = "Sports" | "Movies" | "Shorts";
// a logo tile: an image, or a short text badge (apps without a logo file)
type LogoTile = string | { text: string; bg: string };
export type Pkg = {
  t: string; img: string; contain?: boolean; price: string; cats: string[]; logos: LogoTile[]; more: number; channels: number; screens: number; best?: boolean;
  // the line under the logos (default "+N Premium Channels"); hd: HD only, no 4K / Dolby
  note?: string; hd?: boolean;
  // filter sheet tags
  sub: string[]; league: string[]; apps: string[]; duration: string[];
};
const RS = { text: "RS", bg: "#e5322d" }, DB = { text: "DB", bg: "#f5a623" }, SM = { text: "SM", bg: "#7b4dff" }, MX = { text: "MX", bg: "#1b1b1b" };

const PLAY_ULTIMATE: Pkg = { t: "PLAY ULTIMATE Package", img: logoPlay, contain: true, price: "999", best: true,
  cats: ["Football", "NBA", "Premier League", "RWS", "Netflix", "HBO Max", "Disney+ Hotstar", "Viu", "iQIYI"],
  logos: [logoNetflix, logoHbo, logoHotstar, logoViu, logoIqiyi, lgPl, lgUcl], more: 2, channels: 99, screens: 4,
  sub: ["Football", "Basketball", "Boxing", "Motorsport"], league: ["Champions League", "Bundesliga", "MotoGP", "NBA", "Premier League", "RWS"], apps: ["Netflix", "HBO Max", "Disney+", "iQIYI", "VIU", "WeTV"], duration: ["Monthly", "Yearly"] };

const PACKAGES: Record<Kind, Pkg[]> = {
  Sports: [
    PLAY_ULTIMATE,
    { t: "MONOMAX Sports", img: imgSportCard, price: "1,999", cats: ["Football", "Premier League"],
      logos: [lgPl, lgUcl, logoNetflix, logoHbo], more: 3, channels: 60, screens: 4,
      sub: ["Football", "Golf", "Tennis", "Rugby"], league: ["Premier League", "Champions League", "FA Cup", "Bundesliga"], apps: ["Netflix", "HBO Max", "MONOMAX"], duration: ["Monthly", "Yearly"] },
    { t: "Premier League Pass", img: a("posters/upcoming/live.jpg"), price: "599", cats: ["Football", "Premier League"],
      logos: [lgPl], more: 0, channels: 12, screens: 2,
      sub: ["Football"], league: ["Premier League"], apps: [], duration: ["Monthly"] },
    { t: "Football Plus", img: a("posters/arsenal.jpg"), price: "399", cats: ["Football"],
      logos: [lgUcl, lgPl], more: 1, channels: 20, screens: 2,
      sub: ["Football"], league: ["Champions League", "Premier League", "FA Cup"], apps: [], duration: ["Daily", "Monthly"] },
    { t: "NBA League Pass", img: a("posters/upcoming/u3.jpg"), price: "299", cats: ["NBA"],
      logos: [logoHotstar], more: 0, channels: 8, screens: 2,
      sub: ["Basketball"], league: ["NBA"], apps: ["Disney+"], duration: ["Monthly", "Yearly"] },
    { t: "RWS Fight Night", img: a("posters_portrait/ex4.jpg"), price: "199", cats: ["RWS"],
      logos: [lgRws], more: 0, channels: 4, screens: 1,
      sub: ["Boxing"], league: ["RWS"], apps: [], duration: ["Daily", "Monthly"] },
  ],
  Movies: [
    PLAY_ULTIMATE,
    { t: "Movie Max", img: a("posters_portrait/topgun_m.jpg"), price: "399", cats: ["Netflix", "HBO Max", "Disney+ Hotstar"],
      logos: [logoNetflix, logoHbo, logoHotstar, MX], more: 0, channels: 0, screens: 4, note: "Hollywood, Asian & Thai movies",
      sub: [], league: [], apps: ["Netflix", "HBO Max", "Disney+", "MONOMAX"], duration: ["Monthly", "Yearly"] },
    { t: "Netflix Standard", img: a("posters_portrait/John.jpg"), price: "419", cats: ["Netflix"],
      logos: [logoNetflix], more: 0, channels: 0, screens: 2, note: "Netflix series & films",
      sub: [], league: [], apps: ["Netflix"], duration: ["Monthly"] },
    { t: "HBO Max", img: a("posters_portrait/House.jpg"), price: "159", cats: ["HBO Max"],
      logos: [logoHbo], more: 0, channels: 0, screens: 2, note: "HBO Originals & Warner Bros. movies",
      sub: [], league: [], apps: ["HBO Max"], duration: ["Monthly", "Yearly"] },
    { t: "Disney+ Hotstar", img: a("posters_portrait/avatar.jpg"), price: "199", cats: ["Disney+ Hotstar"],
      logos: [logoHotstar], more: 0, channels: 0, screens: 4, note: "Disney, Pixar, Marvel & Star Wars",
      sub: [], league: [], apps: ["Disney+"], duration: ["Monthly", "Yearly"] },
    { t: "Viu Premium", img: a("posters_portrait/debt.jpg"), price: "119", cats: ["Viu"],
      logos: [logoViu], more: 0, channels: 0, screens: 2, note: "Korean & Asian dramas, ad-free",
      sub: [], league: [], apps: ["VIU"], duration: ["Daily", "Monthly"] },
    { t: "iQIYI VIP", img: a("posters_portrait/F1.jpg"), price: "129", cats: ["iQIYI"],
      logos: [logoIqiyi], more: 0, channels: 0, screens: 2, note: "Chinese series, anime & variety",
      sub: [], league: [], apps: ["iQIYI"], duration: ["Monthly", "Yearly"] },
  ],
  Shorts: [
    { t: "Clips Unlimited", img: a("tv-features-test/shorts-assets/doomsday.jpg"), price: "149", best: true, cats: ["ReelShort", "DramaBox"],
      logos: [RS, DB, SM], more: 0, channels: 0, screens: 2, hd: true, note: "Every short drama, no ads",
      sub: [], league: [], apps: ["ReelShort", "DramaBox", "ShortMax"], duration: ["Monthly", "Yearly"] },
    { t: "ReelShort VIP", img: a("tv-features-test/shorts-assets/love-island.jpg"), price: "59", cats: ["ReelShort"],
      logos: [RS], more: 0, channels: 0, screens: 1, hd: true, note: "+500 short dramas",
      sub: [], league: [], apps: ["ReelShort"], duration: ["Daily", "Monthly"] },
    { t: "DramaBox", img: a("tv-features-test/shorts-assets/coolch.jpg"), price: "59", cats: ["DramaBox"],
      logos: [DB], more: 0, channels: 0, screens: 1, hd: true, note: "+300 short dramas",
      sub: [], league: [], apps: ["DramaBox"], duration: ["Daily", "Monthly"] },
    { t: "Shorts Plus", img: a("tv-features-test/shorts-assets/spiderman.jpg"), price: "99", cats: ["ReelShort", "DramaBox"],
      logos: [RS, DB], more: 0, channels: 0, screens: 2, hd: true, note: "ReelShort + DramaBox together",
      sub: [], league: [], apps: ["ReelShort", "DramaBox"], duration: ["Monthly"] },
  ],
};

export default function PackagesPage({ kind, topInset, bottomInset = "0px", fullScreen, onBack, onToast }: {
  kind: Kind; topInset: string; bottomInset?: string;   // bottomInset: room kept clear for the home indicator
  // on a phone: fixed to the whole screen (this height), like the Store page
  fullScreen?: string;
  onBack: () => void; onToast: (msg: string) => void;
}) {
  const chips = RAILS.find(r => r.title === kind)!.chips;
  const packages = PACKAGES[kind];
  // the filter starts on this list's own category (Sports for Sports, …)
  const base: PackageFilter = { ...NO_FILTER, category: kind };
  const [cat, setCat] = useState(chips[0].label);
  const [filter, setFilter] = useState<PackageFilter>(base);
  const [sheet, setSheet] = useState(false);
  // the package whose View details is open
  const [detail, setDetail] = useState<Pkg | null>(null);
  const any = (picked: string[], have: string[]) => picked.length === 0 || picked.some(x => have.includes(x));
  // a category covers a package by its tags: Sports by sport, Movies / Shorts by their apps (For You: everything)
  const covers = (p: Pkg) => filter.category === "Sports" ? p.sub.length > 0
    : filter.category === "Movies" ? p.apps.some(x => MOVIE_APP_NAMES.includes(x))
    : filter.category === "Shorts" ? p.apps.some(x => SHORT_APP_NAMES.includes(x)) : true;
  const fits = (p: Pkg) => covers(p) && any(filter.sub, p.sub) && any(filter.league, p.league) && any(filter.apps, p.apps) && any(filter.duration, p.duration);
  const list = (cat === chips[0].label ? packages : packages.filter(p => p.cats.includes(cat))).filter(fits);
  const active = filterCount(filter) + (filter.category === kind ? 0 : 1);

  // like the Home header: a dark fade over the page at rest, glass once it scrolls; and like the Sport tab's docked
  // chips, the filter row folds into a one-line subtitle (the active chip + filters) while scrolling down and comes
  // back as soon as the page scrolls up
  const [scrolled, setScrolled] = useState(false);
  const [folded, setFolded] = useState(false);
  const lastY = useRef(0);
  const subtitle = active > 0 ? `${cat} · ${active} filter${active > 1 ? "s" : ""}` : cat;

  return (
    <div className={fullScreen ? "fixed inset-x-0 top-0 z-[71]" : "absolute inset-0 z-[17]"}
      style={{ ...(fullScreen ? { height: fullScreen } : {}), background: PAGE_BG, fontFamily: FONT }}>
      {/* header: back + "<Kind> Package", then the filter button and the category chips (or, folded, the subtitle) */}
      <div className="absolute inset-x-0 top-0 z-10 transition-all duration-300" style={{
        paddingTop: topInset, ...headerGlass(scrolled),
      }}>
        <div className="flex items-center gap-2 px-4" style={{ height: 64 }}>
          <button onClick={onBack} aria-label="Back" className="w-8 h-8 rounded-full flex items-center justify-center"><ChevronLeft size={24} color="#fff" /></button>
          <h1 className="m-0" style={{ fontSize: 20, fontWeight: 600, color: ON_SURFACE }}>{kind} Package</h1>
        </div>
        <div className="relative overflow-hidden" style={{
          // chips: 44px row + 16px under it; folded: a 20px subtitle pulled up under the title
          height: folded ? 28 : 60, marginTop: folded ? -8 : 0,
          transition: "height .3s cubic-bezier(.2,0,0,1), margin-top .3s cubic-bezier(.2,0,0,1)",
        }}>
          <div className="pkgs-rail absolute inset-x-0 top-0 flex items-center gap-2 overflow-x-auto px-4 transition-all duration-300" style={{
            opacity: folded ? 0 : 1, transform: folded ? "translateY(-12px)" : "none", pointerEvents: folded ? "none" : "auto",
          }}>
            <button onClick={() => setSheet(true)} aria-label="Filter" className="relative shrink-0 flex items-center justify-center rounded-[10px]"
              style={{ width: 48, height: 44, background: "#f0f0f0", boxShadow: "0 4px 4px rgba(0,0,0,0.2)" }}>
              <img src={icFilter} alt="" width={20} height={20} />
              {/* how many filters are on */}
              {active > 0 && <span className="absolute -top-1 -right-1 flex items-center justify-center rounded-full"
                style={{ minWidth: 18, height: 18, padding: "0 4px", fontSize: 11, fontWeight: 700, color: "#fff", background: "#ea5454" }}>{active}</span>}
            </button>
            <span className="shrink-0" style={{ width: 1, height: 38, background: CHIP_BORDER }} />
            {chips.map(c => <CategoryChip key={c.label} c={c} sel={c.label === cat} onTap={() => setCat(c.label)} />)}
            <span className="shrink-0" style={{ width: 4 }} />
          </div>
          {/* subtitle under the title, lined up with its text; tapping it brings the chips back */}
          <button onClick={() => setFolded(false)} aria-label="Show filters"
            className="absolute top-0 flex items-center transition-all duration-300 whitespace-nowrap"
            style={{ left: 56, height: 20, fontSize: 14, color: ON_VARIANT,
              opacity: folded ? 1 : 0, transform: folded ? "none" : "translateY(8px)", pointerEvents: folded ? "auto" : "none" }}>
            {subtitle}
          </button>
        </div>
      </div>

      <div className="absolute inset-0 overflow-y-auto overflow-x-hidden pkgs-scroll" onScroll={e => {
        const y = e.currentTarget.scrollTop, dy = y - lastY.current;
        lastY.current = y;
        setScrolled(y > 0);
        if (y <= 0) setFolded(false);
        else if (dy > 2 && y > 48) setFolded(true);
        else if (dy < -2) setFolded(false);
      }}>
        {/* room for the header (title 64 + chips 60) */}
        <div style={{ height: `calc(${topInset} + 124px)` }} />
        <div className="flex flex-col gap-4 px-4" style={{ paddingBottom: `calc(${bottomInset} + 24px)` }}>
          {list.map(p => <PackageCard key={p.t} p={p} onView={() => setDetail(p)} />)}
          {list.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-16">
              <span style={{ fontSize: 16, color: ON_SURFACE }}>No packages match your filter</span>
              <button onClick={() => { setFilter(base); setCat(chips[0].label); }} className="rounded-[10px] px-6" style={{ minHeight: 44, border: "1px solid rgba(240,240,240,0.5)" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0" }}>Clear filter</span>
              </button>
            </div>
          )}
        </div>
      </div>
      {detail && <PackageDetailsPage p={detail} topInset={topInset} bottomInset={bottomInset} onBack={() => setDetail(null)} onToast={onToast} />}
      {sheet && <FilterSheet value={filter} reset={base} onApply={f => { setFilter(f); setSheet(false); }} onClose={() => setSheet(false)} />}
      <style>{`.pkgs-scroll,.pkgs-rail{scrollbar-width:none}.pkgs-scroll::-webkit-scrollbar,.pkgs-rail::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}

// a package card: (Best Seller band), logo + name, the services box, 4K • Dolby • screens, price and View details
function PackageCard({ p, onView }: { p: Pkg; onView: () => void }) {
  const body = { fontSize: 14, lineHeight: "20px", letterSpacing: 0.25, color: ON_SURFACE };
  return (
    <div className="flex flex-col overflow-hidden rounded-[8px]" style={{ background: PANEL, boxShadow: "inset 0 0 0 1px rgba(214,222,240,0.12)" }}>
      {p.best && (
        <div className="flex justify-center py-[6px]" style={{ background: ON_SURFACE }}>
          <span style={{ fontSize: 11, fontWeight: 500, lineHeight: "16px", letterSpacing: 0.5, color: "#101010" }}>Best Seller</span>
        </div>
      )}
      <div className="flex flex-col gap-6 p-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <img src={p.img} alt="" className="shrink-0 rounded-[8px]" style={{ width: 48, height: 48, background: "#000", objectFit: p.contain ? "contain" : "cover" }} />
            <span className="flex-1 truncate" style={{ fontSize: 18, lineHeight: "24px", color: ON_SURFACE }}>{p.t}</span>
          </div>
          <div className="flex flex-col gap-2 p-2 rounded-[8px]" style={{ background: "rgba(0,0,0,0.25)" }}>
            <div className="flex flex-wrap gap-[8px_7px]">
              {p.logos.map(l => typeof l === "string"
                ? <img key={l} src={l} alt="" className="rounded-[4px] object-contain" style={{ width: 32, height: 32, background: "#000" }} />
                : <span key={l.text} className="flex items-center justify-center rounded-[4px]" style={{ width: 32, height: 32, fontSize: 11, fontWeight: 800, color: "#fff", background: l.bg }}>{l.text}</span>)}
              {p.more > 0 && <span className="flex items-center justify-center rounded-[4px]" style={{ width: 32, height: 32, fontSize: 11, fontWeight: 500, color: "#000", background: "#c9c9c9" }}>+{p.more}</span>}
            </div>
            <span style={body}>{p.note ?? `+${p.channels} Premium Channels`}</span>
          </div>
          <div className="flex items-center gap-2">
            {p.hd
              ? <span className="flex items-center rounded-[6px] px-[6px]" style={{ height: 22, fontSize: 13, fontWeight: 600, color: ON_SURFACE, border: `1.5px solid ${ON_SURFACE}` }}>HD</span>
              : <>
                  <img src={ic4k} alt="4K" width={40} height={40} />
                  <img src={dot} alt="" width={4} height={4} />
                  <img src={icDolby} alt="Dolby Atmos" width={40} height={40} />
                </>}
            <img src={dot} alt="" width={4} height={4} />
            <span style={body}>{p.screens} Screen{p.screens > 1 ? "s" : ""} at once</span>
          </div>
        </div>
        <div className="flex items-stretch justify-between">
          <div className="flex flex-col gap-1">
            <span className="flex items-end gap-1">
              <span style={{ fontSize: 22, fontWeight: p.best ? 700 : 400, lineHeight: "28px", color: "#fff" }}>{p.price} baht</span>
              <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.15, color: ON_SURFACE }}>/ Month</span>
            </span>
            <span style={{ fontSize: 11, lineHeight: "16px", letterSpacing: 0.4, color: ON_SURFACE }}>Exclude VAT</span>
          </div>
          <button onClick={onView} className="shrink-0 flex items-center justify-center rounded-[10px] px-4" style={{ width: 132, minHeight: 48, background: ON_SURFACE }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#282828" }}>View details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
