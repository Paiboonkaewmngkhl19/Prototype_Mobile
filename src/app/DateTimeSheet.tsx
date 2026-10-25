import { useEffect, useRef, useState } from "react";
import iconClose from "../assets/epg/sheet-close.svg";
import iconConfirm from "../assets/epg/confirm.svg";
import iconReset from "../assets/epg/reset.svg";
import { PANEL } from "./theme";

// ─── Date & Time sheet (Figma "PLAY-player" node 1871:78701) ───────────────────────────────────────────────────────
// Opened from All Program Guide's date pill: a handle, "Date & Time" with close, then two wheels side by side —
// the day (today and the week ahead) and the hour (today: from the current hour on; nothing in the past) — with the selected row highlighted across both and
// the rows around it shrinking and fading away. Confirm shows the guide from that moment; Reset goes back to now.

export interface GuideTime { day: number; hour: number }   // day: 0 today, -1 yesterday, +1 tomorrow…

const ROW = 40, VISIBLE = 7, DAYS = 7;
const dayLabel = (d: number) => {
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  const t = new Date(); t.setDate(t.getDate() + d);
  return t.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
};
export const guideLabel = (t: GuideTime) => {
  const d = new Date(); d.setDate(d.getDate() + t.day);
  return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}, ${String(t.hour).padStart(2, "0")}:00`;
};

export default function DateTimeSheet({ value, onConfirm, onReset, onClose }: {
  value: GuideTime; onConfirm: (t: GuideTime) => void; onReset: () => void; onClose: () => void;
}) {
  const nowHour = new Date().getHours();
  const days = Array.from({ length: DAYS + 1 }, (_, k) => k);
  const [day, setDay] = useState(Math.max(0, value.day));
  const firstHour = day === 0 ? nowHour : 0;
  const hours = Array.from({ length: 24 - firstHour }, (_, h) => h + firstHour);
  const [hour, setHour] = useState(Math.max(value.day > 0 ? 0 : nowHour, value.hour));
  // back on today with an hour already gone: move up to the current hour
  useEffect(() => { if (day === 0 && hour < nowHour) setHour(nowHour); }, [day]);
  const [shown, setShown] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setShown(true)); }, []);
  const close = (then: () => void) => { setShown(false); setTimeout(then, 250); };

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      <div className="absolute inset-0 transition-opacity duration-250" style={{ background: "rgba(0,0,0,0.7)", opacity: shown ? 1 : 0 }} onClick={() => close(onClose)} />
      <div className="relative flex flex-col gap-8 pb-8 rounded-t-[12px] transition-transform duration-300"
        style={{ background: PANEL, transform: shown ? "translateY(0)" : "translateY(100%)", transitionTimingFunction: "cubic-bezier(.2,0,0,1)" }}>
        {/* handle + header */}
        <div style={{ borderBottom: "1px solid #4a4a4a" }}>
          <div className="flex justify-center py-2"><div className="rounded-[2px]" style={{ width: 40, height: 4, background: "#a8a8a8", opacity: 0.4 }} /></div>
          <div className="flex items-center justify-between px-4 py-3">
            <p className="m-0 flex-1" style={{ fontSize: 20, fontWeight: 500, color: "#e8e8e8" }}>Date &amp; Time</p>
            <button onClick={() => close(onClose)} aria-label="Close"><img src={iconClose} alt="" width={24} height={24} className="block" /></button>
          </div>
        </div>
        {/* wheels, the selected row highlighted across both */}
        <div className="relative flex items-center justify-center gap-8" style={{ height: ROW * VISIBLE }}>
          <div className="absolute left-4 right-4 rounded-[8px] pointer-events-none" style={{ top: ROW * 3 + 4, height: ROW - 8, background: "rgba(255,255,255,0.08)" }} />
          <Wheel items={days} value={day} onChange={setDay} label={dayLabel} width={130} ariaLabel="Day" />
          <Wheel key={firstHour} items={hours} value={Math.max(hour, firstHour)} onChange={setHour} label={h => `${String(h).padStart(2, "0")}:00`} width={80} ariaLabel="Hour" />
        </div>
        <div className="flex flex-col gap-3 px-4">
          <button onClick={() => close(() => onConfirm({ day, hour }))} className="flex items-center justify-center gap-2 rounded-[10px]"
            style={{ minHeight: 40, background: "#f0f0f0", boxShadow: "0 4px 4px rgba(0,0,0,0.2)" }}>
            <img src={iconConfirm} alt="" width={20} height={20} /><span style={{ fontSize: 14, fontWeight: 700, color: "#282828" }}>Confirm</span>
          </button>
          <button onClick={() => close(onReset)} className="flex items-center justify-center gap-2 rounded-[10px]"
            style={{ minHeight: 40, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "0 4px 4px rgba(0,0,0,0.2)" }}>
            <img src={iconReset} alt="" width={20} height={20} /><span style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0" }}>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// a scroll wheel: rows snap to the middle; the middle row is full size and white, the ones around it shrink and fade
function Wheel<T>({ items, value, onChange, label, width, ariaLabel }: {
  items: T[]; value: T; onChange: (v: T) => void; label: (v: T) => string; width: number; ariaLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(Math.max(0, items.indexOf(value)));   // scroll position, in rows
  useEffect(() => { ref.current?.scrollTo({ top: Math.max(0, items.indexOf(value)) * ROW }); }, []);
  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const p = el.scrollTop / ROW;
    setPos(p);
    const i = Math.min(items.length - 1, Math.max(0, Math.round(p)));
    if (items[i] !== value) onChange(items[i]);
  };
  return (
    <div ref={ref} role="listbox" aria-label={ariaLabel} onScroll={onScroll} className="dt-wheel relative overflow-y-auto"
      style={{ width, height: ROW * VISIBLE, scrollSnapType: "y mandatory", paddingBlock: ROW * 3,
        WebkitMaskImage: "linear-gradient(transparent, #000 25%, #000 75%, transparent)", maskImage: "linear-gradient(transparent, #000 25%, #000 75%, transparent)" }}>
      {items.map((v, k) => {
        const d = Math.min(3, Math.abs(k - pos));
        return (
          <button key={k} role="option" aria-selected={v === value} onClick={() => ref.current?.scrollTo({ top: k * ROW, behavior: "smooth" })}
            className="w-full flex items-center justify-center text-white whitespace-nowrap" style={{
              height: ROW, scrollSnapAlign: "center", fontSize: 22 - d * 3.8, opacity: d < 0.5 ? 1 : 0.35,
            }}>{label(v)}</button>
        );
      })}
      <style>{`.dt-wheel{scrollbar-width:none}.dt-wheel::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}
