import { useMemo, useState } from "react";
import iconCalendar from "../assets/epg/calendar.svg";
import iconTimeshift from "../assets/epg/timeshift.svg";
import iconBell from "../assets/epg/bell.svg";
import iconBellOn from "../assets/epg/bell-filled.svg";
import { CHANNELS, ChannelLogo, Crown, channelsFor, clock, nowMinutes, scheduleFor, tvStore, type Programme } from "./TVScreen";
import { FONT, SubFilters, TVSubHeader, subLine, useSubPageScroll, useTVCategory } from "./BrowseChannels";
import DateTimeSheet, { guideLabel, type GuideTime } from "./DateTimeSheet";
import { PAGE_BG, ON_SURFACE, ON_VARIANT, LIVE } from "./theme";

// ─── All Program Guide (Figma "PLAY-player" All Program, node 1921:75487) ────────────────────────────────────────
// Opened from the TV page's All Programs button (the channel keeps playing in the PiP mini-player): the same
// header and category tabs as Browse Channels, a date / time pill, then one row per channel — its badge (logo,
// crown, number) and its programmes as 243px cards that scroll sideways: the one on air, then what's next (finished
// ones aren't shown). The programme you're watching (on air on the channel playing) is outlined, with animated
// sound bars; on a time-shift channel every programme carries the time-shift mark (up next: the bell to its right).
// Tapping the badge or the programme on air plays the channel on the TV page. Programmes up next carry a bell:
// tapping the card (or the bell) sets a reminder — the bell fills and rings — or takes it off again.

const CARD_W = 243, ROW_H = 48 + 8 + 20;
// cards: up next; on air (a little brighter); the one you're watching (dark, outlined)
const CARD = "rgba(255,255,255,0.08)", CARD_NOW = "rgba(255,255,255,0.17)", CARD_ON = "rgba(0,0,0,0.35)";

export default function AllPrograms({ topInset, bottom, watching, onBack, onPick, onToast }: {
  topInset: string; bottom: string; watching?: number; onBack: () => void; onPick: (cur: number) => void; onToast: (msg: string) => void;
}) {
  const { cat, setCat, sub, setSub } = useTVCategory();
  const list = useMemo(() => channelsFor(cat, tvStore.recent, tvStore.favs, sub), [cat, sub]);
  const now = nowMinutes();
  const { headerH, setHeaderH, scrolled, docked, folded, unfold, onScroll, scroller } = useSubPageScroll();
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  // the moment the guide shows: now, or a day / hour picked in the Date & Time sheet (minutes from midnight today)
  const [at, setAt] = useState<GuideTime | null>(null);
  const [picking, setPicking] = useState(false);
  const view = at ? at.day * 1440 + at.hour * 60 : now;

  const [reminders, setReminders] = useState(() => new Set(tvStore.reminders));
  const [rung, setRung] = useState<string | null>(null);   // the reminder just set, whose bell rings
  const tapProgramme = (i: number, p: Programme) => {
    const c = CHANNELS[i];
    if (p.start <= now && now < p.end) { onPick(i); return; }
    // already over (an earlier time picked): plays back on a time-shift channel
    if (p.end <= now) { if (c.timeshift) onPick(i); else onToast(`${p.title} can't be played back on ${c.name}`); return; }
    const key = `${i}-${p.start}`, on = !reminders.has(key);
    const next = new Set(reminders);
    on ? next.add(key) : next.delete(key);
    tvStore.reminders = next; setReminders(next);
    setRung(on ? key : null);
    onToast(on ? `Reminder set: ${p.title} at ${clock(p.start)}` : `Reminder removed: ${p.title}`);
  };

  return (
    // over the nav while the Date & Time sheet is open
    <div className="absolute inset-x-0 top-0" style={{ bottom, zIndex: picking ? 25 : 15, background: PAGE_BG, fontFamily: FONT }}>
      <TVSubHeader topInset={topInset} title="All Program Guide" cat={cat} subtitle={subLine(cat, sub)} scrolled={scrolled} folded={folded} onUnfold={unfold} onCat={setCat} onBack={onBack} onHeight={setHeaderH}>
        <SubFilters cat={cat} sub={sub} onSub={setSub} docked={docked} inHeader />
      </TVSubHeader>
      <div ref={scroller} className="absolute inset-0 overflow-y-auto tvsub-rail pb-4" style={{ paddingTop: headerH }} onScroll={onScroll}>
        <SubFilters cat={cat} sub={sub} onSub={setSub} docked={docked} />
        {/* date / time: now, or the moment picked; opens the Date & Time sheet */}
        <div className="px-4 pt-4 pb-4">
          <button onClick={() => setPicking(true)} className="w-full flex items-center justify-center gap-2 rounded-[8px]"
            style={{ height: 36, background: CARD, border: "1px solid rgba(255,255,255,0.16)" }}>
            <span style={{ fontSize: 14, color: ON_SURFACE }}>{at ? guideLabel(at) : `${today}, ${clock(now)}`}</span>
            <img src={iconCalendar} alt="" width={20} height={20} />
          </button>
        </div>
        {list.length === 0 && <p className="m-0 p-6 text-center" style={{ fontSize: 14, color: ON_VARIANT }}>No channels here yet</p>}
        {/* reminder set: the bell pops and swings like it's ringing */}
        <style>{`.epg-ring{transform-origin:50% 10%;animation:epg-ring .7s ease-out}@keyframes epg-ring{0%{transform:scale(.6) rotate(0)}15%{transform:scale(1.25) rotate(18deg)}30%{transform:scale(1.1) rotate(-16deg)}45%{transform:scale(1) rotate(12deg)}60%{transform:rotate(-8deg)}75%{transform:rotate(4deg)}100%{transform:rotate(0)}}`}</style>
        <div className="flex flex-col gap-1">
          {list.map(({ i }) => <Row key={`${cat}-${sub}-${i}-${view}`} i={i} now={now} view={view} watching={i === watching} reminders={reminders} rung={rung} onPick={onPick} onProgramme={tapProgramme} />)}
        </div>
      </div>
      {picking && (
        <div className="absolute inset-x-0 top-0" style={{ bottom: `calc(-1 * ${bottom})` }}>
          <DateTimeSheet value={at ?? { day: 0, hour: Math.floor(now / 60) }}
            onConfirm={t => { setPicking(false); setAt(t.day === 0 && t.hour === Math.floor(now / 60) ? null : t); }}
            onReset={() => { setPicking(false); setAt(null); }}
            onClose={() => setPicking(false)} />
        </div>
      )}
    </div>
  );
}

function Row({ i, now, view, watching, reminders, rung, onPick, onProgramme }: {
  i: number; now: number; view: number; watching: boolean; reminders: Set<string>; rung: string | null;
  onPick: (cur: number) => void; onProgramme: (i: number, p: Programme) => void;
}) {
  const c = CHANNELS[i];
  // the programme at the moment shown (now, or the time picked) and what's after it; earlier ones aren't shown
  const shows = useMemo(() => scheduleFor(i, view).filter(p => p.end > view), [i, view]);
  const onIdx = shows.findIndex(p => p.start <= view && view < p.end);

  return (
    <div className="flex items-center gap-2 py-2 pl-4" data-watching={watching || undefined}>
      {/* channel badge: logo, then crown + number */}
      <button onClick={() => onPick(i)} aria-label={`Play ${c.name}, channel ${c.no}`} className="shrink-0 flex flex-col items-center gap-2" style={{ width: 48 }}>
        <span className="rounded-full" style={{ boxShadow: watching ? `0 0 0 2px ${LIVE}` : "none" }}><ChannelLogo c={c} size={48} /></span>
        {/* crown + number side by side; without a crown the number sits centred */}
        <span className={`flex items-center w-full ${c.premium ? "justify-between" : "justify-center"}`}>
          {c.premium && <Crown c={c} size={16} />}
          <span className="rounded-[4px] px-1 text-center text-white" style={{ minWidth: 28, fontSize: 10, lineHeight: "20px", fontWeight: 600, background: "rgba(214,222,240,0.18)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)" }}>{c.no}</span>
        </span>
      </button>
      {/* programmes */}
      <div className="tvsub-rail flex gap-2 overflow-x-auto pr-4" style={{ scrollSnapType: "x proximity", scrollPaddingLeft: 0 }}>
        {shows.map((p, k) => {
          // first: the programme at that moment (brighter); live: on air right now
          const onAir = k === onIdx, live = p.start <= now && now < p.end, upcoming = p.start > now, replay = !!c.timeshift;
          const key = `${i}-${p.start}`, reminded = reminders.has(key);
          const playing = live && watching;
          return (
            <button key={p.start} onClick={() => onProgramme(i, p)} className="shrink-0 flex flex-col justify-center gap-3 rounded-[8px] px-2 py-1 text-left"
              style={{ width: CARD_W, height: ROW_H, scrollSnapAlign: "start", background: playing ? CARD_ON : onAir ? CARD_NOW : CARD, border: playing ? "1px solid #5a5a5a" : "1px solid transparent", }}>
              <span className="truncate w-full" style={{ fontSize: 16, lineHeight: "20px", color: ON_SURFACE }}>{p.title}</span>
              <span className="flex items-center justify-between w-full">
                <span style={{ fontSize: 14, color: ON_VARIANT }}>{clock(p.start)} - {clock(p.end)}</span>
                <span className="flex items-center gap-3">
                  {playing && <SoundBars />}
                  {replay && <img src={iconTimeshift} alt="Time shift" width={16} height={16} />}
                  {upcoming && (
                    <img key={reminded ? `on-${key === rung}` : "off"} src={reminded ? iconBellOn : iconBell} alt={reminded ? "Reminder set" : "Add reminder"}
                      width={16} height={16} className={reminded && key === rung ? "epg-ring" : undefined} />
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// "now playing": three bars bouncing like a sound meter (16px, in place of Figma's static bars icon)
function SoundBars() {
  return (
    <span role="img" aria-label="Now playing" className="flex items-end justify-center gap-[2px]" style={{ width: 16, height: 16, padding: "2px 1px" }}>
      {[0, 0.25, 0.5].map(d => (
        <span key={d} className="epg-bar block rounded-[1px]" style={{ width: 3, height: "100%", background: ON_SURFACE, animationDelay: `-${d}s` }} />
      ))}
      <style>{`.epg-bar{transform-origin:bottom;animation:epg-bar .9s ease-in-out infinite}@keyframes epg-bar{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}`}</style>
    </span>
  );
}
