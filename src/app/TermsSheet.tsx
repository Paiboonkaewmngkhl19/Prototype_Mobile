import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import icScrollDown from "../assets/terms/scroll-down.svg";
import icCheck from "../assets/terms/check.svg";
import { PANEL, ON_SURFACE, OUTLINE } from "./theme";

// ─── Terms and Conditions sheet (Figma "Store" file, AIS PLAY: movie_mainFullPage 4717:173888) ─────────────────────
// Opened from Confirm on Package Details: a tall sheet (just under the status bar) with a handle, back + "Terms and
// Conditions", the numbered terms, and a sticky "I Agree and Confirm" that stays disabled until the terms have been
// read to the end. Until then a "Scroll to the bottom" pill floats over the text; tapping it scrolls there.

export default function TermsSheet({ topInset, bottomInset = "0px", terms, onAgree, onClose }: {
  topInset: string; bottomInset?: string; terms: string[]; onAgree: () => void; onClose: () => void;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setShown(true)); }, []);
  const close = (then: () => void) => { setShown(false); setTimeout(then, 250); };
  // read to the end (within a few px), checked on scroll and once laid out (short terms may need no scrolling)
  const body = useRef<HTMLDivElement>(null);
  const [read, setRead] = useState(false);
  const check = () => { const el = body.current; if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setRead(true); };
  useEffect(check, []);
  const toBottom = () => body.current?.scrollTo({ top: body.current.scrollHeight, behavior: "smooth" });

  return (
    <div className="absolute inset-0 z-[60] flex flex-col justify-end" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      <div className="absolute inset-0 transition-opacity duration-250" style={{ background: "rgba(0,0,0,0.7)", opacity: shown ? 1 : 0 }} onClick={() => close(onClose)} />
      <div className="relative flex flex-col rounded-t-[12px] overflow-hidden transition-transform duration-300"
        style={{ height: `calc(100% - ${topInset})`, background: PANEL, boxShadow: "0 -2px 16px rgba(0,0,0,0.1)",
          transform: shown ? "translateY(0)" : "translateY(100%)", transitionTimingFunction: "cubic-bezier(.2,0,0,1)" }}>
        {/* handle + back / title */}
        <div className="shrink-0 flex justify-center pt-4 pb-2"><div className="rounded-full" style={{ width: 48, height: 6, background: "#dadbdc" }} /></div>
        <div className="shrink-0 flex items-center gap-2 px-4" style={{ height: 44 }}>
          <button onClick={() => close(onClose)} aria-label="Back" className="w-8 h-8 rounded-full flex items-center justify-center"><ChevronLeft size={20} color="#fff" /></button>
          <h2 className="m-0 whitespace-nowrap" style={{ fontSize: 20, fontWeight: 600, color: ON_SURFACE }}>Terms and Conditions</h2>
        </div>

        {/* the terms */}
        <div className="relative flex-1 min-h-0 mt-4">
          <div ref={body} onScroll={check} className="terms-scroll h-full overflow-y-auto px-4 pb-6">
            <ol className="m-0 p-0 flex flex-col gap-2" style={{ fontSize: 16, lineHeight: "24px", letterSpacing: 0.25, color: ON_SURFACE, opacity: 0.8, listStyle: "decimal" }}>
              {terms.map((t, k) => <li key={k} style={{ marginLeft: 24 }}>{t}</li>)}
            </ol>
          </div>
          {/* until read: a pill to jump to the end */}
          <button onClick={toBottom} aria-hidden={read} tabIndex={read ? -1 : 0}
            className="absolute left-1/2 bottom-4 w-max flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-300"
            style={{ transform: `translateX(-50%) translateY(${read ? 12 : 0}px)`, opacity: read ? 0 : 1, pointerEvents: read ? "none" : "auto",
              background: ON_SURFACE, boxShadow: `0 0 0 2px ${PANEL_RING}, 0 0 0 4px ${ON_SURFACE}, 0 4px 12px rgba(0,0,0,0.35)` }}>
            <img src={icScrollDown} alt="" width={24} height={24} />
            <span className="whitespace-nowrap" style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", color: "#2a2a2a" }}>Scroll to the bottom</span>
          </button>
        </div>

        {/* sticky: I Agree and Confirm, enabled once read */}
        <div className="shrink-0 px-4 pt-4" style={{ paddingBottom: bottomInset, background: "rgba(7,14,22,0.82)", borderTop: `1px solid ${OUTLINE}`,
          backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)" }}>
          <button onClick={() => read && close(onAgree)} disabled={!read} className="w-full rounded-[10px] flex items-center justify-center gap-2 transition-opacity duration-300"
            style={{ minHeight: 48, background: "#f0f0f0", opacity: read ? 1 : 0.5, boxShadow: read ? "0 4px 4px rgba(0,0,0,0.2)" : "none" }}>
            <img src={icCheck} alt="" width={24} height={24} />
            <span style={{ fontSize: 16, fontWeight: 700, color: "#282828" }}>I Agree and Confirm</span>
          </button>
        </div>
      </div>
      <style>{`.terms-scroll{scrollbar-width:none}.terms-scroll::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}

// the pill's gap ring: the sheet's own colour between the pill and its outline (Figma "TV / Button": a light pill
// inset 4px inside a 2px light outline)
const PANEL_RING = "#2a3040";
