import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import iconBack from "../assets/browse/back.svg";
import { CATEGORIES, ChannelLogo, SUBFILTERS, channelsFor, tvStore } from "./TVScreen";
import { FilterChips } from "./HomeScreen";
import { PAGE_BG, ON_SURFACE, ON_VARIANT, LIVE, headerGlass } from "./theme";

// ─── Browse Channels (Figma "PLAY-player" Browse CH, node 1921:75125) ─────────────────────────────────────────────
// Opened from the TV page's Browse Channels button (the channel keeps playing in the PiP mini-player): a back
// arrow and title, the same category tabs as the TV page (and the same tab selected), then every channel as a
// 4-column grid of 80px round logos. Tapping one plays it on the TV page; the one playing has a red ring.

export const FONT = "'Open Sans', sans-serif";

// header shared by Browse Channels and All Program Guide: status bar space, back + title (64px), category tabs.
// Like the other pages' headers it floats over the page: a dark fade at the top, then the Home header's glass (a
// navy tint over a blur of what's underneath) once the page scrolls. Once the page's sub filters scroll up to it,
// they dock inside it (children). And like the package lists' chips, the tabs (with any docked filters) fold into a
// one-line subtitle (the tab and filter) while the page scrolls down, and open again on any scroll up or a tap.
export function TVSubHeader({ topInset, title, cat, subtitle, scrolled, folded, onUnfold, onCat, onBack, onHeight, children }: {
  topInset: string; title: string; cat: string; subtitle: string; scrolled: boolean; folded: boolean; onUnfold: () => void;
  onCat: (c: string) => void; onBack: () => void; onHeight: (h: number) => void; children?: React.ReactNode;
}) {
  // keep the selected tab in view (it may be one carried over from the TV page, further along the row)
  const tabsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = tabsRef.current, on = row?.querySelector<HTMLElement>("[aria-selected=true]");
    if (row && on) row.scrollTo({ left: Math.max(0, on.offsetLeft - 16), behavior: "smooth" });
  }, [cat]);
  // the page starts under the open header without docked chips: title + tabs (pulled up 15px), measured as laid out
  // open, so neither docking nor folding moves the page
  const titleRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const t = titleRef.current, row = tabsRef.current;
    if (!t || !row) return;
    const measure = () => onHeight(t.offsetHeight + row.offsetHeight - 15);
    const ro = new ResizeObserver(measure);
    ro.observe(t); ro.observe(row);
    return () => ro.disconnect();
  }, [onHeight]);
  const ease = "cubic-bezier(.2,0,0,1)";
  return (
    <div className="absolute inset-x-0 top-0 z-10 transition-all duration-300" style={headerGlass(scrolled)}>
      <div ref={titleRef} style={{ paddingTop: topInset }}>
        <div className="flex items-center gap-2 px-4" style={{ height: 64 }}>
          <button onClick={onBack} aria-label="Back" className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
            <img src={iconBack} alt="" width={20} height={20} className="block" />
          </button>
          <h1 className="m-0 whitespace-nowrap" style={{ fontSize: 20, fontWeight: 600, color: ON_SURFACE }}>{title}</h1>
        </div>
      </div>
      {/* folded: the tabs and docked filters close up into a subtitle under the title, lined up with its text */}
      <div className="relative" style={{ height: folded ? 20 : undefined, marginTop: folded ? -12 : 0, transition: `margin-top .3s ${ease}` }}>
        <div className="transition-all duration-300" style={{
          opacity: folded ? 0 : 1, transform: folded ? "translateY(-12px)" : "none", pointerEvents: folded ? "none" : "auto",
          maxHeight: folded ? 0 : 200, overflow: "hidden", transition: `opacity .3s ease, transform .3s ${ease}, max-height .3s ${ease}`,
        }}>
          {/* pulled up 15px: 15px between the title and the top of the tab text, as between the logo and the tabs on Home */}
          <div ref={tabsRef} className="tvsub-rail flex gap-2 overflow-x-auto px-4" style={{ marginTop: -15 }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => onCat(c)} aria-selected={c === cat} className="relative shrink-0 px-2 pt-3 pb-[10px] outline-none">
                <span className="whitespace-nowrap" style={{ fontSize: 16, fontWeight: c === cat ? 700 : 400, color: c === cat ? "#fff" : ON_SURFACE }}>{c}</span>
                {c === cat && <span className="absolute left-2 right-2 bottom-0 h-[3px] rounded-[1.5px] bg-white" />}
              </button>
            ))}
            <span className="shrink-0" style={{ width: 8 }} />
          </div>
          {children}
        </div>
        <button onClick={onUnfold} aria-label="Show categories" className="absolute top-0 flex items-center whitespace-nowrap transition-all duration-300"
          style={{ left: 56, height: 20, fontSize: 14, color: ON_VARIANT,
            opacity: folded ? 1 : 0, transform: folded ? "none" : "translateY(8px)", pointerEvents: folded ? "auto" : "none" }}>
          {subtitle}
        </button>
      </div>
      {/* room under the subtitle when folded */}
      {folded && <div style={{ height: 12 }} />}
      <style>{`.tvsub-rail{scrollbar-width:none}.tvsub-rail::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}

// the folded header's subtitle: the tab, and the sub filter when one is picked
export const subLine = (cat: string, sub: string) => sub === "All" ? cat : `${cat} · ${sub}`;

export function SubFilters({ cat, sub, onSub, docked, inHeader }: {
  cat: string; sub: string; onSub: (s: string) => void; docked: boolean; inHeader?: boolean;
}) {
  const subs = SUBFILTERS[cat];
  if (!subs || (inHeader && !docked)) return null;
  // "All" shows as "All Sports" on the Sports tab
  const all = cat === "Sports" ? "All Sports" : "All";
  return (
    <div className={inHeader ? "pt-2 pb-3" : "pt-2"} style={{ visibility: !inHeader && docked ? "hidden" : "visible" }}>
      <FilterChips items={[all, ...subs.map(s => s.label)]} chip={sub === "All" ? all : sub} onPick={c => onSub(c === all ? "All" : c)} />
    </div>
  );
}

// a page under TVSubHeader: the scroll area starts under the header and the header turns to glass once it scrolls
export function useSubPageScroll() {
  const [headerH, setHeaderH] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  // the sub filters sit 8px under the header, so they reach it (and dock) once the page has scrolled 8px
  const [docked, setDocked] = useState(false);
  // the tabs fold away while scrolling down (past the first 48px) and open on any scroll up, as on the package lists
  const [folded, setFolded] = useState(false);
  const lastY = useRef(0);
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const y = e.currentTarget.scrollTop, dy = y - lastY.current;
    lastY.current = y;
    setScrolled(y > 0); setDocked(y >= 8);
    if (y <= 0) setFolded(false);
    else if (dy > 2 && y > 48) setFolded(true);
    else if (dy < -2) setFolded(false);
  };
  // on opening, bring the channel being watched into view (centred in the space under the header), once
  const scroller = useRef<HTMLDivElement>(null);
  const focused = useRef(false);
  useEffect(() => {
    const sc = scroller.current, el = sc?.querySelector<HTMLElement>("[data-watching]");
    if (focused.current || !headerH || !sc) return;
    focused.current = true;
    if (!el) return;
    const top = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop;
    sc.scrollTo({ top: Math.max(0, top - headerH - (sc.clientHeight - headerH - el.offsetHeight) / 2) });
  }, [headerH]);
  return { headerH, setHeaderH, scrolled, docked, folded, unfold: () => setFolded(false), onScroll, scroller };
}

// the category tab, kept in step with the TV page, and its sub filter (back to "All" on another tab)
export function useTVCategory() {
  const [cat, setCat] = useState(tvStore.cat);
  const [sub, setSub] = useState("All");
  return { cat, sub, setSub, setCat: (c: string) => { tvStore.cat = c; setCat(c); setSub("All"); } };
}

export default function BrowseChannels({ topInset, bottom, watching, onBack, onPick }: {
  topInset: string; bottom: string; watching?: number; onBack: () => void; onPick: (cur: number) => void;
}) {
  const { cat, setCat, sub, setSub } = useTVCategory();
  const list = useMemo(() => channelsFor(cat, tvStore.recent, tvStore.favs, sub), [cat, sub]);
  const { headerH, setHeaderH, scrolled, docked, folded, unfold, onScroll, scroller } = useSubPageScroll();

  return (
    <div className="absolute inset-x-0 top-0 z-[15]" style={{ bottom, background: PAGE_BG, fontFamily: FONT }}>
      <TVSubHeader topInset={topInset} title="Browse Channels" cat={cat} subtitle={subLine(cat, sub)} scrolled={scrolled} folded={folded} onUnfold={unfold} onCat={setCat} onBack={onBack} onHeight={setHeaderH}>
        <SubFilters cat={cat} sub={sub} onSub={setSub} docked={docked} inHeader />
      </TVSubHeader>
      {/* channel grid: 4 columns, 8px gaps, 16px sides */}
      <div ref={scroller} className="absolute inset-0 overflow-y-auto tvsub-rail" style={{ paddingTop: headerH }} onScroll={onScroll}>
        <SubFilters cat={cat} sub={sub} onSub={setSub} docked={docked} />
        {list.length === 0
          ? <p className="m-0 p-6 text-center" style={{ fontSize: 14, color: "#a8a8a8" }}>No channels here yet</p>
          : (
            <div className="grid grid-cols-4 gap-2 px-4 py-4 justify-items-center">
              {list.map(({ c, i }) => (
                <button key={`${cat}-${sub}-${i}`} onClick={() => onPick(i)} data-watching={i === watching || undefined} aria-label={`${c.name}, channel ${c.no}${i === watching ? ", watching" : ""}`}
                  className="rounded-full active:scale-95 transition-transform"
                  style={{ boxShadow: i === watching ? `0 0 0 3px ${LIVE}` : "none" }}>
                  <ChannelLogo c={c} size={80} />
                </button>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
