import { useEffect, useState } from "react";
import icClose from "../assets/sports-pkg/icon-close.svg";
import { PANEL, ON_SURFACE } from "./theme";

// ─── Coverage sheet (Figma "Store" file: Sports 4524:141210, Premium Channels 4524:143896) ─────────────────────────
// Opened from the chevron on a Package Details coverage card: a handle, the title with close, then everything the
// package covers in two columns — a 40px logo and its name (up to two lines) — scrolling with a thin bar when it
// doesn't fit.

export interface CoverageItem { key: string; name: string; tile: (size: number) => React.ReactNode }

export default function CoverageSheet({ title, items, onClose }: { title: string; items: CoverageItem[]; onClose: () => void }) {
  const [shown, setShown] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setShown(true)); }, []);
  const close = () => { setShown(false); setTimeout(onClose, 250); };

  return (
    <div className="absolute inset-0 z-[60] flex flex-col justify-end" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      <div className="absolute inset-0 transition-opacity duration-250" style={{ background: "rgba(0,0,0,0.7)", opacity: shown ? 1 : 0 }} onClick={close} />
      <div className="relative flex flex-col rounded-t-[12px] transition-transform duration-300"
        style={{ maxHeight: "min(512px, calc(100% - 34px))", background: PANEL, transform: shown ? "translateY(0)" : "translateY(100%)", transitionTimingFunction: "cubic-bezier(.2,0,0,1)" }}>
        <div className="shrink-0 flex justify-center pt-4 pb-2"><div className="rounded-full" style={{ width: 48, height: 6, background: "#dadbdc" }} /></div>
        <div className="shrink-0 flex items-center justify-between px-4" style={{ height: 44 }}>
          <h2 className="m-0" style={{ fontSize: 20, fontWeight: 600, color: ON_SURFACE }}>{title}</h2>
          <button onClick={close} aria-label="Close" className="w-8 h-8 rounded-full flex items-center justify-center">
            <img src={icClose} alt="" width={20} height={20} style={{ filter: "brightness(0) invert(1)" }} />
          </button>
        </div>
        <div className="coverage-scroll overflow-y-auto mt-4 mr-2 pl-6 pr-4" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}>
          <div className="grid grid-cols-2 gap-[10px]">
            {items.map(it => (
              <div key={it.key} className="flex items-center gap-[10px] min-w-0">
                {it.tile(40)}
                <span className="min-w-0" style={{ fontSize: 12, lineHeight: "16px", letterSpacing: 0.4, color: "#c6c6c6",
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{it.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Figma "Scroll bar": a 4px #a8a8a8 thumb */}
      <style>{`.coverage-scroll{scrollbar-width:thin;scrollbar-color:#a8a8a8 transparent}.coverage-scroll::-webkit-scrollbar{width:4px}.coverage-scroll::-webkit-scrollbar-thumb{background:#a8a8a8;border-radius:4px}`}</style>
    </div>
  );
}
