import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import iconBack from "../assets/browse/back.svg";
import { CATEGORIES, ChannelLogo, SUBFILTERS, channelsFor, tvStore } from "./TVScreen";
import { FilterChips } from "./HomeScreen";
import { PAGE_BG, ON_SURFACE, OUTLINE, LIVE } from "./theme";

// ─── Browse Channels (Figma "PLAY-player" Browse CH, node 1921:75125) ─────────────────────────────────────────────
// Opened from the TV page's Browse Channels button (the channel keeps playing in the PiP mini-player): a back
// arrow and title, the same category tabs as the TV page (and the same tab selected), then every channel as a
// 4-column grid of 80px round logos. Tapping one plays it on the TV page; the one playing has a red ring.

export const FONT = "'Open Sans', sans-serif";

// header shared by Browse Channels and All Program Guide: status bar space, back + title (64px), category tabs.
// It floats over the page: clear at the top, then the Home header's glass (a navy tint over a blur of what's
// underneath) once the page scrolls. Once the page's sub filters scroll up to it, they dock inside it (children).
export function TVSubHeader({ topInset, title, cat, scrolled, onCat, onBack, onHeight, children }: {
  topInset: string; title: string; cat: string; scrolled: boolean; onCat: (c: string) => void;
  onBack: () => void; onHeight: (h: number) => void; children?: React.ReactNode;
}) {
  // keep the selected tab in view (it may be one carried over from the TV page, further along the row)
  const tabsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = tabsRef.current, on = row?.querySelector<HTMLElement>("[aria-selected=true]");
    if (row && on) row.scrollTo({ left: Math.max(0, on.offsetLeft - 16), behavior: "smooth" });
  }, [cat]);
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // the page starts under the header without docked chips (+1px for its bottom line), so docking doesn't move it
    const ro = new ResizeObserver(() => onHeight(el.offsetHeight + 1));
    ro.observe(el);
    return () => ro.disconnect();
  }, [onHeight]);
  return (
    <div className="absolute inset-x-0 top-0 z-10 transition-all duration-300" style={{
      background: scrolled ? "linear-gradient(180deg, rgba(7,14,22,0.6), rgba(118,128,150,0))" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none", WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.08)" : OUTLINE}`,
    }}>
      <div ref={ref} style={{ paddingTop: topInset }}>
      <div className="flex items-center gap-2 px-4" style={{ height: 64 }}>
        <button onClick={onBack} aria-label="Back" className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
          <img src={iconBack} alt="" width={20} height={20} className="block" />
        </button>
        <h1 className="m-0 whitespace-nowrap" style={{ fontSize: 20, fontWeight: 600, color: ON_SURFACE }}>{title}</h1>
      </div>
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
      </div>
      {children}
      <style>{`.tvsub-rail{scrollbar-width:none}.tvsub-rail::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}

// the tab's sub filters (the Sport tab's chips), at the top of the page just under the header, when it has any
// docked: drawn inside the header instead (in the same spot, 8px under the tabs); the one in the page is hidden
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
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const y = e.currentTarget.scrollTop;
    setScrolled(y > 0); setDocked(y >= 8);
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
  return { headerH, setHeaderH, scrolled, docked, onScroll, scroller };
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
  const { headerH, setHeaderH, scrolled, docked, onScroll, scroller } = useSubPageScroll();

  return (
    <div className="absolute inset-x-0 top-0 z-[15]" style={{ bottom, background: PAGE_BG, fontFamily: FONT }}>
      <TVSubHeader topInset={topInset} title="Browse Channels" cat={cat} scrolled={scrolled} onCat={setCat} onBack={onBack} onHeight={setHeaderH}>
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
