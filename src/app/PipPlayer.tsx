import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import iconClose from "../assets/pip/close.svg";
import iconExpand from "../assets/pip/expand.svg";
import iconRewind from "../assets/pip/rewind.svg";
import iconPause from "../assets/pip/pause.svg";
import iconForward from "../assets/pip/forward.svg";
import type { Channel, TVPos } from "./TVScreen";
import { PANEL_SOLID, PROGRESS } from "./theme";

// ─── PiP mini-player (Figma "PLAY-player" card_PIP, node 1524:73580) ──────────────────────────────────────────────
// Leaving the TV page (Back or its PiP button) keeps the channel playing in this card over the Home page. A tap shows
// the controls for 3s: close and expand in the top corners, rewind / pause / forward at the bottom over the progress
// bar. Rewind and forward (10s) only on a time-shift channel; a live-only one has pause alone and a full bar.
// Drag the card anywhere; it snaps to the nearer side.

const W = 257, H = Math.round(W * 9 / 16), MARGIN = 16;
const CIRCLE = "rgba(0,0,0,0.7)";

export default function PipPlayer({ ch, cur, startT, muted, bottom, topInset, onClose, onExpand }: {
  ch: Channel; cur: number; startT: number; muted: boolean;
  bottom: string; topInset: string;           // the space the card keeps clear: the nav below, the status bar above
  onClose: () => void; onExpand: (pos: TVPos) => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const seekable = !!ch.timeshift && !!ch.video;
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState({ t: startT, d: 0 });

  const [controls, setControls] = useState(true);
  const hideAt = useRef<ReturnType<typeof setTimeout>>();
  const wake = () => {
    setControls(true);
    clearTimeout(hideAt.current);
    hideAt.current = setTimeout(() => setControls(false), 3000);
  };
  useEffect(() => { wake(); return () => clearTimeout(hideAt.current); }, []);

  const togglePlay = () => {
    const v = video.current;
    if (v) { if (v.paused) v.play().catch(() => {}); else v.pause(); }
    wake();
  };
  const skip = (secs: number) => {
    const v = video.current;
    if (v && v.duration) v.currentTime = Math.min(v.duration - 0.1, Math.max(0, v.currentTime + secs));
    wake();
  };

  // drag: the card follows the finger, then snaps to the left or right edge (kept between the status bar and the nav)
  const card = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState<"left" | "right">("right");
  const [lift, setLift] = useState(0);         // px above the resting spot just over the nav
  const drag = useRef<{ x: number; y: number; lift: number; moved: boolean } | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, lift, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 6) return;
    d.moved = true;
    setOffset({ x: dx, y: dy });
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (!d.moved) { if (controls) { clearTimeout(hideAt.current); setControls(false); } else wake(); return; }
    const el = card.current, box = el?.parentElement?.getBoundingClientRect(), r = el?.getBoundingClientRect();
    if (el && box && r) {
      setSide(r.left + r.width / 2 < box.left + box.width / 2 ? "left" : "right");
      // how far the card now sits above its resting spot, kept inside the page
      const rest = (parseFloat(getComputedStyle(el).bottom) || 0) - lift;
      const maxLift = box.height - rest - H - MARGIN - (parseFloat(topInset) || 0);
      setLift(Math.max(0, Math.min(maxLift, d.lift - (e.clientY - d.y))));
    }
    setOffset({ x: 0, y: 0 });
  };

  const played = time.d ? time.t / time.d : 0;

  return (
    <div ref={card}
      className="absolute z-[18] overflow-hidden rounded-[8px] select-none"
      style={{
        width: W, height: H, [side]: MARGIN, bottom: `calc(${bottom} + ${MARGIN + lift}px)`,
        background: PANEL_SOLID, border: "1px solid #1a1a1a", boxShadow: "0 24px 40px rgba(56,69,76,0.2), 0 8px 24px rgba(0,0,0,0.5)",
        transform: `translate(${offset.x}px, ${offset.y}px)`, transition: drag.current ? "none" : "transform .25s cubic-bezier(.2,0,0,1)",
        touchAction: "none",
      }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      {ch.video
        ? <video ref={video} src={ch.video} poster={ch.poster} autoPlay loop muted={muted} playsInline
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            onLoadedMetadata={e => { const v = e.currentTarget; if (startT) v.currentTime = Math.min(startT, (v.duration || 1) - 0.1); }}
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
            onTimeUpdate={e => setTime({ t: e.currentTarget.currentTime, d: e.currentTarget.duration || 0 })} />
        : <img src={ch.poster} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />}

      <div className="absolute inset-0 transition-opacity duration-300" style={{ opacity: controls ? 1 : 0, pointerEvents: controls ? "auto" : "none" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0) 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35))" }} />
        {/* close / expand */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-[6px]">
          <Circle size={34} label="Close" onClick={onClose}><img src={iconClose} alt="" width={20} height={20} /></Circle>
          <Circle size={34} label="Expand" onClick={() => onExpand({ cur, t: video.current?.currentTime ?? time.t })}><img src={iconExpand} alt="" width={20} height={20} /></Circle>
        </div>
        {/* rewind / pause / forward, 4px above the progress bar */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-between" style={{ bottom: 6 + 4, width: seekable ? 138 : 38 }}>
          {seekable && <Circle size={34} label="Back 10 seconds" onClick={() => skip(-10)}><img src={iconRewind} alt="" width={20} height={20} /></Circle>}
          <Circle size={38} label={playing ? "Pause" : "Play"} onClick={togglePlay}>
            {playing ? <img src={iconPause} alt="" width={24} height={24} /> : <Play size={20} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />}
          </Circle>
          {seekable && <Circle size={34} label="Forward 10 seconds" onClick={() => skip(10)}><img src={iconForward} alt="" width={20} height={20} /></Circle>}
        </div>
      </div>
      {/* progress bar along the bottom edge; a live-only channel sits full */}
      <div className="absolute inset-x-0 bottom-0 h-[6px] overflow-hidden rounded-full pointer-events-none"
        style={{ background: "rgba(255,255,255,0.4)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "0 0 12px rgba(0,0,0,0.2)" }}>
        <div className="h-full" style={{ width: `${(seekable ? played : 1) * 100}%`, background: PROGRESS }} />
      </div>
    </div>
  );
}

function Circle({ size, label, onClick, children }: { size: number; label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={e => { e.stopPropagation(); onClick(); }} aria-label={label}
      className="shrink-0 rounded-full flex items-center justify-center" style={{ width: size, height: size, background: CIRCLE }}>
      {children}
    </button>
  );
}
