import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import icClose from "../assets/sports-pkg/icon-close.svg";
import logoBundesliga from "../assets/sports-pkg/logo-bundesliga.png";
import logoNetflix from "../assets/sports-pkg/chip-netflix.png";
import logoHbo from "../assets/store/logo-hbo.png";
import logoHotstar from "../assets/store/logo-hotstar.png";
import logoViu from "../assets/store/logo-viu.png";
import lgPl from "../assets/sport/lg-pl.png";
import lgUcl from "../assets/sport/lg-ucl.png";
import lgFacup from "../assets/sport/lg-facup.png";
import lgRws from "../assets/sport/lg-rws.png";
import { PANEL, ON_SURFACE, PILL, PILL_RING, CHIP_BG, CHIP_BORDER } from "./theme";

// ─── Package filter sheet (Figma "Store" file: Filter For you 5258:66106, Shorts 5258:67131, Sports 5258:69112,
// Movies 5258:69169) ──────────────────────────────────────────────────────────────────────────────────────────────
// Opened from the filter button on a package list: a handle, back + "Filter" with close, then chip groups. Category
// picks one; For You and Sports show Sub Category and League & Tournament, Movies and Shorts show Streaming Apps; then
// Duration. The other groups are multi-pick with All (none picked = All). Show Package applies; Reset clears.
// Wireframe logo slots carry the app's league and app logos.

export type Category = "For You" | "Sports" | "Movies" | "Shorts";
export interface PackageFilter { category: Category; sub: string[]; league: string[]; apps: string[]; duration: string[] }
export const NO_FILTER: PackageFilter = { category: "For You", sub: [], league: [], apps: [], duration: [] };
// how many things the filter narrows by (for a badge on the filter button)
export const filterCount = (f: PackageFilter) => f.sub.length + f.league.length + f.apps.length + f.duration.length;

type Opt = { label: string; logo?: string; pad?: boolean; text?: string };
const CATEGORIES: Category[] = ["For You", "Sports", "Movies", "Shorts"];
const SUBS: Opt[] = ["Football", "Motorsport", "Golf", "Basketball", "Tennis", "Rugby", "Boxing"].map(label => ({ label }));
const LEAGUES: Opt[] = [
  { label: "Bundesliga", logo: logoBundesliga, pad: true },
  { label: "MotoGP", text: "GP" },
  { label: "NBA", text: "NBA" },
  { label: "Premier League", logo: lgPl },
  { label: "Champions League", logo: lgUcl },
  { label: "FA Cup", logo: lgFacup },
  { label: "RWS", logo: lgRws },
];
const MOVIE_APPS: Opt[] = [
  { label: "Netflix", logo: logoNetflix },
  { label: "HBO Max", logo: logoHbo },
  { label: "Disney+", logo: logoHotstar },
  { label: "Prime", text: "P" },
  { label: "VIU", logo: logoViu },
  { label: "WeTV", text: "We" },
  { label: "oneD", text: "1D" },
  { label: "MONOMAX", text: "MX" },
];
const SHORT_APPS: Opt[] = [{ label: "ReelShort", text: "RS" }, { label: "DramaBox", text: "DB" }, { label: "ShortMax", text: "SM" }];
// the apps each category lists, for telling which packages a category covers
export const MOVIE_APP_NAMES = MOVIE_APPS.map(o => o.label), SHORT_APP_NAMES = SHORT_APPS.map(o => o.label);
const DURATIONS: Opt[] = ["Daily", "Monthly", "Yearly"].map(label => ({ label }));

export default function FilterSheet({ value, reset = NO_FILTER, onApply, onClose }: {
  value: PackageFilter; reset?: PackageFilter;   // reset: what Reset goes back to (a Movies list starts on Movies)
  onApply: (f: PackageFilter) => void; onClose: () => void;
}) {
  const [f, setF] = useState(value);
  const [shown, setShown] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setShown(true)); }, []);
  const close = (then: () => void) => { setShown(false); setTimeout(then, 250); };
  const sporty = f.category === "For You" || f.category === "Sports";
  // a new category starts its own groups fresh (Duration carries over)
  const pickCategory = (category: Category) => setF(category === f.category ? f : { ...NO_FILTER, category, duration: f.duration });
  const toggle = (key: "sub" | "league" | "apps" | "duration") => (label: string | null) =>
    setF(s => ({ ...s, [key]: label === null ? [] : s[key].includes(label) ? s[key].filter(x => x !== label) : [...s[key], label] }));

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      <div className="absolute inset-0 transition-opacity duration-250" style={{ background: "rgba(0,0,0,0.7)", opacity: shown ? 1 : 0 }} onClick={() => close(onClose)} />
      <div className="relative flex flex-col rounded-t-[12px] transition-transform duration-300"
        style={{ maxHeight: "calc(100% - 34px)", background: PANEL, transform: shown ? "translateY(0)" : "translateY(100%)", transitionTimingFunction: "cubic-bezier(.2,0,0,1)" }}>
        {/* handle + back / "Filter" / close */}
        <div className="shrink-0 flex justify-center pt-4 pb-2"><div className="rounded-full" style={{ width: 48, height: 6, background: "#dadbdc" }} /></div>
        <div className="shrink-0 flex items-center justify-between px-4" style={{ height: 44 }}>
          <div className="flex items-center gap-2">
            <button onClick={() => close(onClose)} aria-label="Back" className="w-8 h-8 rounded-full flex items-center justify-center"><ChevronLeft size={20} color="#fff" /></button>
            <h2 className="m-0" style={{ fontSize: 24, fontWeight: 600, color: ON_SURFACE }}>Filter</h2>
          </div>
          <button onClick={() => close(onClose)} aria-label="Close" className="w-8 h-8 rounded-full flex items-center justify-center"><img src={icClose} alt="" width={20} height={20} style={{ filter: "brightness(0) invert(1)" }} /></button>
        </div>

        {/* the groups (scroll when they don't fit) */}
        <div className="filter-scroll flex flex-col gap-6 overflow-y-auto px-4 pt-4 pb-4">
          <Group title="Category">
            {CATEGORIES.map(c => <FilterChip key={c} o={{ label: c }} sel={f.category === c} onTap={() => pickCategory(c)} />)}
          </Group>
          {sporty ? (
            <>
              <MultiGroup title="Sub Category" opts={SUBS} picked={f.sub} onToggle={toggle("sub")} all />
              <MultiGroup title="League & Tournament" opts={LEAGUES} picked={f.league} onToggle={toggle("league")} all />
            </>
          ) : (
            <MultiGroup key={f.category} title="Streaming Apps" opts={f.category === "Movies" ? MOVIE_APPS : SHORT_APPS} picked={f.apps} onToggle={toggle("apps")} all />
          )}
          <MultiGroup title="Duration" opts={DURATIONS} picked={f.duration} onToggle={toggle("duration")} all />
        </div>

        {/* Show Package / Reset */}
        <div className="shrink-0 flex flex-col gap-3 px-4 pt-2" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}>
          <button onClick={() => close(() => onApply(f))} className="w-full rounded-[10px] flex items-center justify-center" style={{ minHeight: 48, background: "#f0f0f0", boxShadow: "0 4px 4px rgba(0,0,0,0.2)" }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#282828" }}>Show Package</span>
          </button>
          <button onClick={() => setF(reset)} className="w-full rounded-[10px] flex items-center justify-center" style={{ minHeight: 48, border: "1px solid rgba(240,240,240,0.5)" }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f0" }}>Reset</span>
          </button>
        </div>
      </div>
      <style>{`.filter-scroll{scrollbar-width:none}.filter-scroll::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="m-0" style={{ fontSize: 18, fontWeight: 400, lineHeight: "24px", color: ON_SURFACE }}>{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

// a multi-pick group led by All (on when nothing else is)
function MultiGroup({ title, opts, picked, onToggle, all }: { title: string; opts: Opt[]; picked: string[]; onToggle: (label: string | null) => void; all?: boolean }) {
  return (
    <Group title={title}>
      {all && <FilterChip o={{ label: "All" }} sel={picked.length === 0} onTap={() => onToggle(null)} />}
      {opts.map(o => <FilterChip key={o.label} o={o} sel={picked.includes(o.label)} onTap={() => onToggle(o.label)} />)}
    </Group>
  );
}

// a 44px chip: text, or a 24px round logo (or short text) + name; picked in the light glass, like the Store's chips
function FilterChip({ o, sel, onTap }: { o: Opt; sel: boolean; onTap: () => void }) {
  const mark = o.logo || o.text;
  return (
    <button onClick={onTap} aria-pressed={sel} className="shrink-0 flex items-center gap-[6px] rounded-[7px]"
      style={{ height: 44, minWidth: 48, padding: mark ? "4px 10px 4px 4px" : "0 10px", justifyContent: "center",
        background: sel ? PILL : CHIP_BG, boxShadow: sel ? PILL_RING : "none", border: sel ? "none" : `1px solid ${CHIP_BORDER}` }}>
      {mark && (
        <span className="rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ width: 24, height: 24, background: o.logo ? "#fff" : "#282828" }}>
          {o.logo
            ? <img src={o.logo} alt="" className={o.pad ? "object-contain" : "w-full h-full object-cover"} style={o.pad ? { width: "62.5%", height: "62.5%" } : undefined} />
            : <span style={{ fontSize: 8, fontWeight: 800, color: "#fff" }}>{o.text}</span>}
        </span>
      )}
      <span className="whitespace-nowrap" style={{ fontSize: 12, lineHeight: "16px", letterSpacing: 0.5, color: sel ? "#fff" : ON_SURFACE, fontWeight: sel ? 600 : 500, textShadow: sel ? "0 1px 3px rgba(0,0,0,.35)" : "none" }}>{o.label}</span>
    </button>
  );
}
