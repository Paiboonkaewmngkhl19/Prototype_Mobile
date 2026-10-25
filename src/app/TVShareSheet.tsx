import iconSheetClose from "../assets/share/close.svg";
import iconSheetLink from "../assets/share/link.svg";
import iconSheetMore from "../assets/share/more.svg";
import logoLine from "../assets/shorts/share-line.svg?raw";
import logoMessenger from "../assets/shorts/share-messenger.svg?raw";
import logoFacebook from "../assets/shorts/share-facebook.svg?raw";
import logoX from "../assets/shorts/share-x.svg?raw";
import logoInstagram from "../assets/shorts/share-instagram.svg?raw";
import type { Channel } from "./TVScreen";

const BASE = import.meta.env.BASE_URL;

// ─── Share targets (Clips and TV share sheets) ───────────
// Each app's real mark in its own colours: white on the brand colour, except Facebook, whose round mark is drawn
// full size in blue over white so its "f" shows white
export const SHARE_TARGETS: { label: string; logo: string; bg: string; color: string; full?: boolean; border?: string }[] = [
  { label: "LINE", logo: logoLine, bg: "#06C755", color: "#fff" },
  { label: "Messenger", logo: logoMessenger, bg: "linear-gradient(45deg, #0099FF, #A033FF 60%, #FF5280 90%, #FF7061)", color: "#fff" },
  { label: "Facebook", logo: logoFacebook, bg: "#fff", color: "#0866FF", full: true },
  { label: "X", logo: logoX, bg: "#000", color: "#fff", border: "1px solid #3a3a3a" },
  { label: "Instagram", logo: logoInstagram, bg: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)", color: "#fff" },
];

// TV channel share sheet: handle, "Share" header with close, a divider, then the programme card (16:9 thumbnail,
// programme and channel), the share apps as a rail of 56px circles, and Copy link / More
export default function TVShareSheet({ ch, onClose, onDone }: { ch: Channel; onClose: () => void; onDone: (msg: string) => void }) {
  const link = `${window.location.origin}${BASE}#tv-${ch.no}`;
  const copy = () => { navigator.clipboard?.writeText(link).catch(() => {}); onDone("Link copied"); };
  const more = () => {
    if (navigator.share) navigator.share({ title: `${ch.program} · ${ch.name}`, url: link }).catch(() => {});
    else onDone("Sharing (demo)");
  };
  const btn = { background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.16)", boxShadow: "0 4px 4px rgba(0,0,0,0.2)" };
  return (
    <div className="flex flex-col pb-2" style={{ fontFamily: "'Open Sans'" }}>
      <div className="flex justify-center py-2"><div className="rounded-[2px]" style={{ width: 40, height: 4, background: "#a8a8a8", opacity: 0.4 }} /></div>
      <div className="flex items-center justify-between px-4 py-3">
        <p className="m-0 flex-1" style={{ fontSize: 16, fontWeight: 500, color: "#e8e8e8" }}>Share</p>
        <button onClick={onClose} aria-label="Close" className="shrink-0"><img src={iconSheetClose} alt="" width={24} height={24} className="block" /></button>
      </div>
      <div style={{ height: 1, background: "#5a5a5a", opacity: 0.3 }} />
      <div className="flex flex-col pt-3">
        {/* what's being shared */}
        <div className="px-4">
          <div className="flex items-center gap-3 p-2 rounded-[8px]" style={{ background: "rgba(0,0,0,0.25)" }}>
            <img src={ch.poster} alt="" className="shrink-0 rounded-[12px] object-cover" style={{ width: 120, height: 67.2 }} />
            <div className="flex flex-1 flex-col gap-1 min-w-0" style={{ color: "#e8e8e8" }}>
              <p className="m-0" style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.15, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{ch.program}</p>
              <p className="m-0 truncate" style={{ fontSize: 12, lineHeight: "16px", letterSpacing: 0.4 }}>{ch.name} · {ch.no}</p>
            </div>
          </div>
        </div>
        {/* share apps */}
        <div className="flex gap-2 overflow-x-auto p-4 pr-8 home-rail" style={{ scrollbarWidth: "none" }}>
          {SHARE_TARGETS.map(t => (
            <button key={t.label} onClick={() => onDone(`Shared to ${t.label} (demo)`)} aria-label={`Share to ${t.label}`}
              className={`shrink-0 rounded-full flex items-center justify-center overflow-hidden ${t.full ? "[&>svg]:w-14 [&>svg]:h-14" : "[&>svg]:w-[30px] [&>svg]:h-[30px]"}`}
              style={{ width: 56, height: 56, background: t.bg, color: t.color, border: t.border }}
              dangerouslySetInnerHTML={{ __html: t.logo }} />
          ))}
        </div>
        <div className="flex gap-2 px-4 pb-3">
          <button onClick={copy} className="flex-1 flex items-center justify-center gap-2 rounded-[10px] px-[14px] py-[6px]" style={{ minHeight: 40, ...btn }}>
            <img src={iconSheetLink} alt="" width={20} height={20} /><span style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0" }}>Copy link</span>
          </button>
          <button onClick={more} className="flex-1 flex items-center justify-center gap-2 rounded-[10px] px-[14px] py-[6px]" style={{ minHeight: 40, ...btn }}>
            <img src={iconSheetMore} alt="" width={20} height={20} /><span style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0" }}>More</span>
          </button>
        </div>
      </div>
    </div>
  );
}

