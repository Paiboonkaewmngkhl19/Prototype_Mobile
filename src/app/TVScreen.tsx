import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Cast, Settings, Heart, Pause, Play, PictureInPicture2, Maximize, History, X } from "lucide-react";
import iconCrown from "../assets/shorts/crown.svg";
import iconShare from "../assets/shorts/share-arrow.svg";
import iconRewind from "../assets/shorts/rewind-10.svg";
import iconForward from "../assets/shorts/forward-10.svg";
import iconFullRewind from "../assets/full/rewind.svg";
import iconFullForward from "../assets/full/forward.svg";
import iconBrightness from "../assets/full/brightness.svg";
import iconVolume from "../assets/full/volume.svg";
import iconMinimize from "../assets/full/minimize.svg";
import iconFullPip from "../assets/full/pip.svg";
import TVShareSheet from "./TVShareSheet";
import iconBell from "../assets/epg/bell.svg";
import iconBellOn from "../assets/epg/bell-filled.svg";
import iconAllPrograms from "../assets/epg/all-programs.svg";
import { PAGE_BG, BG, PANEL, PANEL_SOLID, OUTLINE, ON_SURFACE, ON_VARIANT, LIVE, PROGRESS, PILL, PILL_RING, GLASS_CARD_ON, CHIP_BORDER } from "./theme";
import { rules, ruleChannel } from "./mobileRules";
import { CrownFrame, CROWN_IN_FRAME } from "./cardTags";
import { TV_LINEUP, type LineupChannel } from "./tvChannels";

// ─── TV tab (Figma "PLAY-player": Mobile_PortraitPlay_Default_TVonmobile 1871:78141, Sticky Browse CH 1871:78788) ───
// Live TV on the phone: the channel plays in a 16:9 player pinned under the status bar; below it the programme info
// scrolls away and the category tabs stick under the player ("Sticky Browse CH") while the channel list scrolls on;
// a floating button, bottom right, opens All Program Guide. The Figma frames are wireframes; they're dressed in the
// app's own dark theme and filled with the channels and artwork the Home tab already uses.

const BASE = import.meta.env.BASE_URL;
const a = (path: string) => `${BASE}${path}`;
const FONT = "'Open Sans', sans-serif";

export const CATEGORIES = ["All Channels", "Recently Watched", "Favorite", "Exclusive", "Digital TV", "Sports", "Movies & Series", "News", "Cartoons", "Variety", "Others"];

type Cat = "Exclusive" | "Digital TV" | "Sports" | "Movies & Series" | "News" | "Cartoons" | "Variety" | "Others";
export interface Channel {
  // contain: a non-round logo fitted on white with padding; round: a logo that's already a full round badge, drawn edge
  // to edge (padding would show the badge's own soft edge as a grey ring)
  // logo: an image file, or — for channels without one — a text badge (short label on the channel's colour)
  no: string; name: string; logo?: string; box?: number[]; contain?: boolean; round?: boolean; short?: string; bg?: string; fg?: string; program: string; cats: Cat[]; tags: string[]; premium?: boolean; excl?: boolean;
  video?: string; poster: string;
  // timeshift: the programme can be rewound / fast-forwarded (catch-up icon in the list, seekable player)
  timeshift?: boolean;
  // Premium crowns: a plain crown is a premium channel not in the viewer's packages (free preview only, with the
  // countdown and Explore Packages in the player); owned: its package is bought, so it plays in full (crown + play mark)
  owned?: boolean;
}
// ─── The channel line-up: the TV prototype's (tvChannels.ts), the same channels, numbers, categories, logos and schedules ───
const LINEUP = TV_LINEUP;
const CAT_OF: Record<string, Cat> = { exclusive: "Exclusive", digital: "Digital TV", sports: "Sports", movies: "Movies & Series", news: "News", cartoons: "Cartoons", variety: "Variety", others: "Others" };
const V = (f: string) => a(`tv-features-test/Video/${f}`);
// the clip a channel plays (the TV prototype's rule by category; news-only channels show a picture, as there's no news clip here)
const VIDEO_OF: Record<string, string> = { HBO: "hbo.mp4", "Asian Games 907": "bad.mp4", "COOL Live": "coolch.mp4" };
const videoFor = (l: LineupChannel) => {
  const has = (k: string) => l.cats.includes(k);
  if (VIDEO_OF[l.n]) return V(VIDEO_OF[l.n]);
  if (l.cats.every(k => k === "news" || k === "digital") && has("news")) return undefined;
  return has("sports") ? V("Football.mp4") : has("cartoons") ? V("Dis.mp4") : has("variety") ? V("Concert.mp4") : has("movies") ? V("spiderman.mp4") : V("Concert.mp4");
};
// the picture while a programme has none of its own
const FALLBACK: Record<string, string[]> = {
  sports: ["posters/sport/sportMainPage_footballForYou_No1.webp", "posters/sport/sportMainPage_footballForYou_No5.webp", "posters/sport/sportMainPage_highlight_No1.webp", "posters/sport/sportMainPage_motorsportsForYou_No1.webp"],
  movies: ["posters/house-of-the-dragon.jpg", "posters/topgun-m.jpg", "posters/district9.jpg", "posters/last-of-us.jpg"],
  news: ["posters/news/bg-news-filter.webp", "posters/news/bg-news24.webp"],
  cartoons: ["posters/how-to-train.jpg", "posters/hero/encanto.jpg"],
  variety: ["tv-features-test/concert-assets/moment-010.jpg", "tv-features-test/concert-assets/moment-120.jpg", "tv-features-test/concert-assets/moment-190.jpg"],
  digital: ["posters/news/bg-news-filter.webp", "tv-features-test/concert-assets/moment-080.jpg"],
  others: ["posters/how-to-train.jpg", "posters/last-of-us.jpg"],
  exclusive: ["posters/liver-ben.jpg"],
};
const pictureFor = (l: LineupChannel, i: number, img: string | null | undefined) => {
  if (img) return a(img);
  if (l.n === "BBC News") return a("posters/news/bg-bbc.webp");
  const pool = FALLBACK[l.cats.find(k => k !== "digital") ?? l.cats[0]] ?? FALLBACK.others;
  return a(pool[i % pool.length]);
};

// each channel repeats its line-up around the real clock, from a per-channel offset; about 4 in 10 programmes have Time Shift
const progsCache: Programme[][] = [];
const progsOf = (i: number) => {
  if (progsCache[i]) return progsCache[i];
  const l = LINEUP[i], now = nowMinutes(), list: Programme[] = [];
  let t = -(90 + Math.round((i * 37 % 120) / 15) * 15), k = 0;
  while (t < 9 * 1440) {
    const s = l.sched[k % l.sched.length], start = t, hour = Math.floor((((start % 1440) + 1440) % 1440) / 60);
    t += s[1];
    list.push({ title: s[0], start, end: t, img: s[2], ts: (!!l.tsNow && start <= now && t > now) || (l.no * 7 + k * 13 + hour) % 10 < 4 });
    k++;
  }
  return progsCache[i] = list;
};
const onAirIndex = (i: number, at: number) => { const k = progsOf(i).findIndex(p => p.end > at); return k < 0 ? progsOf(i).length - 1 : k; };
const onAir = (i: number) => progsOf(i)[onAirIndex(i, nowMinutes())];

// all the channels, in channel-number order; the programme, picture and Time Shift follow what's on now
export const CHANNELS: Channel[] = LINEUP.map((l, i): Channel => ({
  no: String(l.no), name: l.n, excl: l.excl, cats: l.cats.map(k => CAT_OF[k]), tags: l.tags,
  logo: l.logo ? a(l.logo) : undefined, box: l.box ?? (l.fit === "contain" ? [15, 15, 70, 70] : undefined), round: l.fit === "cover" || undefined,
  short: l.logo ? undefined : l.txt, bg: l.bg === "#2a2a2a" ? PANEL_SOLID : l.bg, fg: "#fff", premium: !!l.crown, owned: l.crown === "owned", video: videoFor(l),
  get program() { return onAir(i).title; },
  get poster() { return pictureFor(l, i, onAir(i).img); },
  get timeshift() { return onAir(i).ts; },
}));
const indexOf = (no: string) => CHANNELS.findIndex(c => c.no === no);

// recently watched and favourites, kept here so they survive leaving the TV page (PiP, All Program Guide) and coming back
// recently watched, favourites, the category tab and programme reminders ("channel-start"), shared by the TV page and All Program Guide
// (kept here so they survive leaving the TV page for those pages or the PiP mini-player and coming back)
export const tvStore = { recent: LINEUP.flatMap((l, i) => l.recent ? [i] : []), favs: new Set(LINEUP.flatMap((l, i) => l.fav ? [i] : [])), cat: "All Channels", reminders: new Set<string>() };

// ── Programme schedule (All Program Guide) ──
// Each channel runs back-to-back programmes through today; the one on air now is the programme the TV page shows.
export interface Programme { title: string; start: number; end: number; img?: string | null; ts?: boolean }   // minutes since midnight
export const nowMinutes = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
export const clock = (m: number) => { const t = ((m % 1440) + 1440) % 1440; return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`; };
// around: the moment to build the schedule around, in minutes from midnight today (another day: ± 1440 per day);
// the programme on air now keeps the TV page's title
export const scheduleFor = (i: number, around = nowMinutes()): Programme[] => {
  const l = LINEUP[i], list = progsOf(i);
  if (l.excl) { const live = onAirIndex(i, nowMinutes()); return list.slice(live, live + 1 + (l.up ?? 0)); }   // Exclusive: the live one and what's right after it
  const at = onAirIndex(i, around);
  return list.slice(Math.max(0, at - 4), at + 7);
};

// sub filters under a category tab (TV page, All Program Guide), "All" first: only Sports and Others
const tagged = (id: string, label: string) => ({ label, test: (c: Channel) => c.tags.includes(id) });
export const SUBFILTERS: Partial<Record<string, { label: string; test: (c: Channel) => boolean }[]>> = {
  Sports: [tagged("multi", "Multi-Sports"), tagged("football", "Football"), tagged("motorsport", "Motorsport"), tagged("golf", "Golf"), tagged("basketball", "Basketball"), tagged("tennis", "Tennis"), tagged("rugby", "Rugby"), tagged("boxing", "Boxing")],
  Others: [tagged("education", "Education"), tagged("documentary", "Documentary"), tagged("shopping", "Shopping")],
};

// the channels under a category tab (TV page list, All Program Guide), optionally narrowed
// by one of its sub filters
export const channelsFor = (cat: string, recent: number[], favs: Set<number>, sub = "All") => {
  const all = CHANNELS.map((c, i) => ({ c, i }));
  const list = cat === "All Channels" ? all
    : cat === "Recently Watched" ? recent.map(i => ({ c: CHANNELS[i], i }))
    : cat === "Favorite" ? all.filter(x => favs.has(x.i))
    : all.filter(x => x.c.cats.includes(cat as Cat));
  const f = SUBFILTERS[cat]?.find(s => s.label === sub);
  return f ? list.filter(x => f.test(x.c)) : list;
};

// elapsed-time label: mm:ss with leading zeros, h:mm:ss past an hour
const elapsed = (s: number) => {
  const t = Math.max(0, Math.floor(s)), h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = String(t % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${String(m).padStart(2, "0")}:${sec}`;
};
const fmt = (s: number) => {
  const t = Math.max(0, Math.floor(s)), h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
};

// where the TV page picks up: the channel and playback position (from the PiP mini-player, or a fresh start)
export interface TVPos { cur: number; t: number }

const TIME_SHIFT_LOCKED = "Time Shift is part of the package. Get it to pause and rewind";
const RULE_SEEK = 10;   // RULES.SEEK_STEP_SECONDS

export default function TVScreen({ topInset, bottom, muted, start, onBack, onPrograms, onOpenStore, onShare, onToast }: {
  topInset: string; bottom: string; muted: boolean; start?: TVPos | null; onShare: (ch: Channel) => void;
  // the floating button opens All Program Guide, the channel carrying on in the PiP mini-player meanwhile
  onPrograms: (pos: TVPos) => void;
  // Explore Packages (free preview) opens the Store the same way
  onOpenStore: (pos: TVPos) => void;
  // Back and the PiP button both leave for Home, handing over what's playing so it carries on in the mini-player
  onBack: (pos: TVPos) => void; onToast: (msg: string) => void;
}) {
  const demo = (label: string) => onToast(`${label} (demo)`);
  const [cur, setCur] = useState(start?.cur ?? indexOf("902"));
  const [recent, setRecent] = useState<number[]>(() => start ? [start.cur, ...tvStore.recent.filter(x => x !== start.cur)].slice(0, 8) : tvStore.recent);
  useEffect(() => { tvStore.recent = recent; }, [recent]);
  const resumeAt = useRef(start?.t ?? 0);
  const [favs, setFavs] = useState<Set<number>>(() => tvStore.favs);
  useEffect(() => { tvStore.favs = favs; }, [favs]);
  const [cat, setCat] = useState(tvStore.cat);
  useEffect(() => { tvStore.cat = cat; }, [cat]);
  const ch = CHANNELS[cur];

  // player: controls show on tap and fade on their own (rules.js); premium channels run a free-preview countdown
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState({ t: 0, d: 0 });
  // the elapsed label stays hidden until the channel has actually started playing
  const [started, setStarted] = useState(false);
  const [controls, setControls] = useState(true);
  const hideAt = useRef<ReturnType<typeof setTimeout>>();
  const wake = () => {
    setControls(true);
    clearTimeout(hideAt.current);
    const after = rules().touch.controlsHideAfter(live.previewOver);   // null: they stay up once the preview is over
    if (after !== null) hideAt.current = setTimeout(() => setControls(false), after);
  };
  useEffect(() => { wake(); return () => clearTimeout(hideAt.current); }, [cur]);
  // what the viewer may do on this channel (rules.js): the free preview counts only while playing and is kept per
  // channel, so leaving and coming back doesn't restart it; Time Shift and pause need the package
  const [, setPreviewTick] = useState(0);
  const live = rules().liveState(ruleChannel(ch), !!ch.timeshift);
  useEffect(() => {
    if (!live.preview || live.previewOver || !playing) return;
    const t = setInterval(() => { rules().previewTick(ruleChannel(CHANNELS[cur]), true); setPreviewTick(n => n + 1); }, 1000);
    return () => clearInterval(t);
  }, [cur, live.preview, live.previewOver, playing]);
  useEffect(() => { if (live.previewOver) { video.current?.pause(); wake(); } }, [cur, live.previewOver]);

  const togglePlay = () => {
    if (!live.canPause) { if (live.timeShiftLocked) onToast(TIME_SHIFT_LOCKED); return; }
    const v = video.current;
    if (v) { if (v.paused) v.play().catch(() => {}); else v.pause(); }
    else setPlaying(p => !p);
    wake();
  };

  // ── Full screen, landscape (Figma playerLive_landscapeWakeFull 1860:147613) ──
  // The same player (video, gestures, seek bar, free preview) grows to cover the whole screen with landscape controls.
  // On a phone held upright it's turned sideways (rotated 90°); turning the phone to landscape enters it by itself,
  // and where the browser allows, it also goes browser-full-screen and locks to landscape.
  const rootRef = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState(false);
  const [area, setArea] = useState({ w: 0, h: 0 });   // the whole app screen: the TV page and the nav under it
  useLayoutEffect(() => {
    const el = rootRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(() => setArea({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const rotated = full && area.h > area.w;
  // the phone's safe areas (Dynamic Island / notch, home bar), read from a hidden probe; the full-screen player keeps
  // inside them, black around it. Turned sideways, the top of the phone (the island) is the player's left side.
  const probe = useRef<HTMLDivElement>(null);
  const [safe, setSafe] = useState({ t: 0, r: 0, b: 0, l: 0 });
  useEffect(() => {
    const read = () => {
      const cs = probe.current && getComputedStyle(probe.current);
      if (cs) setSafe({ t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0, b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0 });
    };
    read();
    addEventListener("resize", read);
    return () => removeEventListener("resize", read);
  }, [full]);
  // mini EPG (Figma Mobile_LandscapeMiniEPG_Default 1860:146306): Browse Channels in full screen shrinks the player to
  // the top left, with the channel's programmes up next under it and the channel list on the right
  const [epg, setEpg] = useState(false);
  // the player's own width / height in full screen, inside the safe areas
  const localW = rotated ? area.h - safe.t - safe.b : area.w - safe.l - safe.r;
  const localH = rotated ? area.w - safe.l - safe.r : area.h - safe.t - safe.b;
  const EPG_W = 280, UPNEXT_H = 79;
  const boxW = Math.max(0, localW - EPG_W), boxH = Math.max(0, Math.min(boxW * 9 / 16, localH - UPNEXT_H));
  useEffect(() => { if (!full) { setEpg(false); setSharing(false); } }, [full]);
  // share in full screen: the same share sheet as the TV page, opened inside the landscape player
  const [sharing, setSharing] = useState(false);
  const share = () => { if (full) setSharing(true); else onShare(ch); };
  const touch = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
  const enterFull = () => {
    setFull(true); wake();
    if (!touch) return;
    const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
    Promise.resolve(el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.())
      .then(() => (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> })?.lock?.("landscape"))
      .catch(() => {});
  };
  const exitFull = () => {
    setFull(false); wake();
    try { (screen.orientation as ScreenOrientation & { unlock?: () => void })?.unlock?.(); } catch { /* not supported */ }
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  };
  // turning a phone to landscape goes full screen, and back to portrait leaves it
  useEffect(() => {
    if (!touch) return;
    const mq = matchMedia("(orientation: landscape)");
    const on = () => setFull(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => { mq.removeEventListener("change", on); try { (screen.orientation as ScreenOrientation & { unlock?: () => void })?.unlock?.(); } catch { /* */ } };
  }, []);
  useEffect(() => {
    if (!full) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") exitFull(); };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [full]);
  // how far along an element a touch is, left to right in the player's own terms (turned sideways: top to bottom on
  // the screen), and up its height for the vertical sliders (turned sideways: right to left)
  const along = (e: { clientX: number; clientY: number }, r: DOMRect) =>
    Math.min(1, Math.max(0, rotated ? (e.clientY - r.top) / r.height : (e.clientX - r.left) / r.width));
  const up = (e: { clientX: number; clientY: number }, r: DOMRect) =>
    Math.min(1, Math.max(0, rotated ? (e.clientX - r.left) / r.width : (r.bottom - e.clientY) / r.height));
  // brightness (dims the picture) and volume, from the side sliders
  const [bright, setBright] = useState(1);
  const [vol, setVol] = useState(1);
  useEffect(() => { const v = video.current; if (v) { v.volume = vol; if (vol > 0 && full && v.muted) v.muted = false; } }, [vol, cur]);

  // ── Touch (rules.js R.touch): double-tap a side to jump 10s, hold a side to rewind / fast-forward (2x, 4x, 8x, 16x the
  // longer it's held), drag the seek bar; swipe up / down changes channel, from the left edge opens the mini EPG ──
  // Only on channels with time shift; a live-only channel plays at the live edge and none of these respond.
  const seekable = live.canSeek && !!ch.video;
  const gesture = (g: string) => rules().touch.player({ player: "live", gesture: g, controlsVisible: controls, live });
  const DOUBLE_TAP_MS = 300, HOLD_MS = 450;
  const press = useRef<{ x: number; y: number; frac: number; side: -1 | 1; timer?: ReturnType<typeof setTimeout>; held: boolean } | null>(null);
  const swiped = useRef(false);
  const [holdX, setHoldX] = useState(2);
  const [hold, setHold] = useState<-1 | 0 | 1>(0);
  const rewinder = useRef<ReturnType<typeof setInterval>>();
  const wasPlaying = useRef(true);
  const lastTap = useRef<{ t: number; side: -1 | 0 | 1; streak: number }>({ t: 0, side: 0, streak: 0 });
  const singleTap = useRef<ReturnType<typeof setTimeout>>();
  const [tapFx, setTapFx] = useState<{ side: -1 | 1; secs: number; key: number } | null>(null);
  const sideAt = (e: { clientX: number; clientY: number }, el: Element) => along(e, el.getBoundingClientRect());
  // live TV: the bar is full at the live edge and only shortens behind it. What's tracked is how far behind live the
  // picture is (not the clip's own time, which loops): rewinding adds to it, fast-forward takes it back down to live
  // and no further, a pause adds the time it lasted; changing channel or resuming starts live again
  const behind = useRef(0), lastTick = useRef(0), pausedAt = useRef(0);
  const goLive = () => { behind.current = 0; pausedAt.current = 0; lastTick.current = performance.now(); };
  const onTick = (v: HTMLVideoElement) => {
    const now = performance.now(), dt = (now - lastTick.current) / 1000;
    lastTick.current = now;
    if (v.playbackRate > 1 && dt < 1) {
      behind.current = Math.max(0, behind.current - (v.playbackRate - 1) * dt);
      if (behind.current === 0) v.playbackRate = 1;   // fast-forwarding stops at live
    }
  };
  const skip = (secs: number) => {
    const v = video.current;
    if (!v || !v.duration) return;
    // forward only as far as live; back only to the start of what's buffered (the clip's start)
    const s = Math.max(-v.currentTime, Math.min(secs, behind.current));
    v.currentTime = Math.min(v.duration - 0.1, v.currentTime + s);
    behind.current = Math.min(v.duration, behind.current - s);
  };
  const startHold = (side: -1 | 1) => {
    const v = video.current;
    if (!v) return;
    setHold(side); setControls(false); setHoldX(2);
    const from = performance.now();
    if (side > 0) v.playbackRate = 2;
    else { wasPlaying.current = !v.paused; v.pause(); }   // browsers can't play backwards: pause and step back instead
    rewinder.current = setInterval(() => {
      const x = rules().touch.holdSpeed((performance.now() - from) / 1000);
      setHoldX(x);
      if (side < 0) skip(-x * 0.1);
      else if (behind.current > 0) v.playbackRate = x;   // fast-forward only runs while behind live
    }, 100);
  };
  const endHold = () => {
    const v = video.current;
    clearInterval(rewinder.current);
    if (v) { v.playbackRate = 1; if (hold < 0 && wasPlaying.current) v.play().catch(() => {}); }
    setHold(0);
  };
  const onPressStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest("button")) return;
    const frac = sideAt(e, e.currentTarget);
    const p = { x: e.clientX, y: e.clientY, frac, side: (frac < 0.5 ? -1 : 1) as -1 | 1, held: false } as NonNullable<typeof press.current>;
    p.timer = setTimeout(() => {
      const r = gesture(p.side < 0 ? "longPressLeft" : "longPressRight");
      if (r.act === "holdSeek" && ch.video) { p.held = true; startHold(p.side); }
      else if (r.act === "timeShiftLocked") { p.held = true; onToast(r.message); }
    }, HOLD_MS);
    press.current = p;
  };
  const onPressMove = (e: React.PointerEvent) => {
    const p = press.current;
    if (p && !p.held && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 8) clearTimeout(p.timer);
  };
  const onPressEnd = (e: React.PointerEvent) => {
    const p = press.current;
    if (!p) return;
    clearTimeout(p.timer);
    if (p.held) { if (hold !== 0) endHold(); return; }
    if (e.type !== "pointerup" || (full && epg)) return;
    // a swipe, in the player's own axes (the full-screen player can be rotated on a portrait phone)
    const sx = e.clientX - p.x, sy = e.clientY - p.y, dx = rotated ? sy : sx, dy = rotated ? -sx : sy;
    const g = Math.abs(dy) > 50 && Math.abs(dy) > Math.abs(dx) * 1.5 ? (dy < 0 ? "swipeUp" : "swipeDown")
      : dx > 50 && p.frac < 0.12 && Math.abs(dx) > Math.abs(dy) * 1.5 ? "swipeFromLeft" : null;
    if (!g) return;
    swiped.current = true; press.current = null;
    const r = gesture(g);
    if (r.act === "changeChannel") { const next = rules().zap(ch.no, r.dir); pick(CHANNELS.findIndex(c => c.no === next.n)); wake(); }
    else if (r.act === "openMiniEpg" && full) setEpg(true);
  };
  // a tap brings the controls up; another tap while they're showing puts them away
  const toggleControls = () => { if (controls) { clearTimeout(hideAt.current); setControls(false); } else wake(); };
  const onTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (swiped.current) { swiped.current = false; return; }   // the end of a swipe, not a tap
    const p = press.current;
    press.current = null;
    if (p?.held) return;                       // the end of a hold, not a tap
    // mini EPG open: a tap on the picture closes it, back to the full player
    if (full && epg) { clearTimeout(singleTap.current); setEpg(false); wake(); return; }
    if (!seekable && !live.timeShiftLocked) { toggleControls(); return; }
    const fx = sideAt(e, e.currentTarget);
    const side: -1 | 0 | 1 = fx < 0.4 ? -1 : fx > 0.6 ? 1 : 0;
    const now = e.timeStamp, last = lastTap.current;
    const quick = now - last.t < DOUBLE_TAP_MS && side === last.side && side !== 0;
    lastTap.current = { t: now, side, streak: quick ? last.streak + 1 : 0 };
    clearTimeout(singleTap.current);
    if (quick) {
      const r = gesture(side < 0 ? "doubleTapLeft" : "doubleTapRight");
      if (r.act === "timeShiftLocked") { onToast(r.message); return; }
      skip(side * RULE_SEEK);
      setTapFx({ side: side as -1 | 1, secs: RULE_SEEK * (lastTap.current.streak || 1), key: now });
      return;
    }
    singleTap.current = setTimeout(toggleControls, DOUBLE_TAP_MS);
  };
  useEffect(() => () => { clearTimeout(singleTap.current); clearInterval(rewinder.current); }, []);
  useEffect(() => {
    if (!tapFx) return;
    const t = setTimeout(() => setTapFx(null), 650);
    return () => clearTimeout(t);
  }, [tapFx]);

  // seek bar: drag (or tap) along it to scrub; it thickens, shows a handle and the time, as in the Clips player
  const barRef = useRef<HTMLDivElement>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const seekTo = (e: { clientX: number; clientY: number }) => {
    const v = video.current, r = barRef.current?.getBoundingClientRect();
    if (!v || !r || !v.duration) return;
    // the bar's right end is live; its length covers one clip's worth of time behind it
    const f = along(e, r);
    skip(behind.current - (1 - f) * v.duration);
    setTime({ t: v.currentTime, d: v.duration });
  };
  const onSeekDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setScrubbing(true); setControls(true); clearTimeout(hideAt.current);
    seekTo(e);
  };
  const onSeekMove = (e: React.PointerEvent) => { if (scrubbing) { e.stopPropagation(); seekTo(e); } };
  const onSeekUp = (e: React.PointerEvent) => { e.stopPropagation(); setScrubbing(false); wake(); };

  const leave = () => onBack({ cur, t: video.current?.currentTime ?? 0 });

  const pick = (i: number) => {
    setLikeFx(null); setCur(i); setPlaying(true); setTime({ t: 0, d: 0 }); setStarted(false); setHold(0); setScrubbing(false); clearInterval(rewinder.current);
    goLive();
    setRecent(r => [i, ...r.filter(x => x !== i)].slice(0, 8));
  };

  const list = useMemo(() => channelsFor(cat, recent, favs), [cat, recent, favs]);

  const scroller = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  // on opening, bring the channel playing into view in the list: centred in the space under the docked tabs (if
  // it's already on screen, nothing moves)
  useEffect(() => {
    const sc = scroller.current, tabs = tabsRef.current, row = sc?.querySelector<HTMLElement>("[data-watching]");
    if (!sc || !tabs || !row) return;
    const rowTop = row.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop;
    if (rowTop + row.offsetHeight <= sc.clientHeight) return;
    const room = sc.clientHeight - tabs.offsetHeight;
    sc.scrollTo({ top: Math.max(0, rowTop - tabs.offsetHeight - (room - row.offsetHeight) / 2) });
  }, []);

  const pickCat = (c: string) => {
    setCat(c);
    const s = scroller.current, t = tabsRef.current;
    if (s && t && s.scrollTop > t.offsetTop) s.scrollTo({ top: t.offsetTop });
  };

  const fav = favs.has(cur);
  // favourite, TikTok style: adding pops the heart with a ring and a burst of dots; removing just shrinks it back
  const [likeFx, setLikeFx] = useState<{ on: boolean; key: number } | null>(null);
  const toggleFav = () => {
    setLikeFx({ on: !fav, key: Date.now() });
    setFavs(f => { const n = new Set(f); n.has(cur) ? n.delete(cur) : n.add(cur); return n; });
  };
  // how full the bar is: all of it at live, less the further behind live (a live-only channel is always full)
  const played = time.d ? Math.max(0, 1 - behind.current / time.d) : 1;

  return (
    // full screen: above the nav (and the phone frame's status bar)
    <div ref={rootRef} className="absolute inset-x-0 top-0 flex flex-col" style={{ bottom, zIndex: full ? 60 : 15, background: PAGE_BG, fontFamily: FONT }}>
      {/* status bar area, then the 16:9 player pinned under it */}
      <div className="shrink-0" style={{ height: topInset, background: "#000" }} />
      {/* no overflow clipping and z-10 over the list below, so the seek handle (half below the bottom edge) shows in full */}
      {/* safe-area probe; and in full screen, black behind the player out to the screen edges */}
      <div ref={probe} aria-hidden className="absolute pointer-events-none" style={{ visibility: "hidden", paddingTop: "env(safe-area-inset-top, 0px)", paddingRight: "env(safe-area-inset-right, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)", paddingLeft: "env(safe-area-inset-left, 0px)" }} />
      {full && <div className="absolute left-0 top-0" style={{ width: area.w, height: area.h, background: "#000", zIndex: 29 }} />}
      {/* full screen: the whole app screen inside its safe areas (turned sideways on an upright phone) */}
      <div className="relative z-10 w-full shrink-0" style={{
        ...(full
          ? { position: "absolute", zIndex: 30, width: localW, height: localH, background: "#000", transformOrigin: "0 0",
              ...(rotated
                ? { top: 0, left: 0, transform: `translate(${area.w - safe.r}px, ${safe.t}px) rotate(90deg)` }
                : { top: safe.t, left: safe.l, transform: "none" }) }
          : { aspectRatio: "16 / 9", background: PANEL_SOLID }),
        touchAction: "none", userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" }}
        onClick={onTap} onPointerDown={onPressStart} onPointerMove={onPressMove} onPointerUp={onPressEnd} onPointerCancel={onPressEnd} onPointerLeave={onPressEnd}
        onContextMenu={e => e.preventDefault()}>
        {ch.video
          ? <video key={ch.video} ref={video} src={ch.video} poster={ch.poster} autoPlay loop muted={muted} playsInline
              className="absolute" style={{ ...(full && epg ? { left: 0, top: 0, width: boxW, height: boxH } : { inset: 0, width: "100%", height: "100%" }), objectFit: full ? "contain" : "cover", filter: bright < 1 ? `brightness(${bright})` : undefined }}
              onPlay={() => { if (pausedAt.current) behind.current += (performance.now() - pausedAt.current) / 1000; pausedAt.current = 0; lastTick.current = performance.now(); setPlaying(true); }}
              onPause={() => { pausedAt.current = performance.now(); setPlaying(false); }} onPlaying={() => setStarted(true)}
              onLoadedMetadata={e => {
                const v = e.currentTarget;
                if (resumeAt.current) { v.currentTime = Math.min(resumeAt.current, (v.duration || 1) - 0.1); resumeAt.current = 0; }
                // a channel starts (or resumes) live
                goLive();
                setTime({ t: v.currentTime, d: v.duration || 0 });
              }}
              onTimeUpdate={e => { const v = e.currentTarget; onTick(v); setTime({ t: v.currentTime, d: v.duration || 0 }); }} />
          : <img key={ch.poster} src={ch.poster} alt="" className="absolute" style={{ ...(full && epg ? { left: 0, top: 0, width: boxW, height: boxH } : { inset: 0, width: "100%", height: "100%" }), objectFit: full ? "contain" : "cover", filter: bright < 1 ? `brightness(${bright})` : undefined }} />}

        {full && epg && (
          <MiniEpg ch={ch} cur={cur} boxW={boxW} boxH={boxH} panelW={EPG_W} playing={playing} seekable={seekable} started={started} t={time.t}
            played={played} scrubbing={scrubbing} fav={fav} barRef={barRef} recent={recent} favs={favs}
            onBack={() => setEpg(false)} onFav={toggleFav} onShare={share} onDemo={demo} onToast={onToast}
            onPip={() => { exitFull(); leave(); }} onMinimize={exitFull} onPick={pick}
            onSeekDown={onSeekDown} onSeekMove={onSeekMove} onSeekUp={onSeekUp} />
        )}
        {full && !epg && (
          <FullControls ch={ch} shown={controls} playing={playing} seekable={seekable} started={started} t={time.t} played={played}
            scrubbing={scrubbing} fav={fav} bright={bright} vol={vol} up={up} barRef={barRef}
            onBack={exitFull} onFav={toggleFav} onShare={share} onDemo={demo}
            onSkip={secs => { skip(secs); setTapFx({ side: secs < 0 ? -1 : 1, secs: Math.abs(secs), key: Date.now() }); wake(); }}
            onPlay={togglePlay} showPlay={live.canPause || live.timeShiftLocked} onBrowse={() => setEpg(true)} onPip={() => { exitFull(); leave(); }} onMinimize={exitFull}
            onBright={b => { setBright(b); clearTimeout(hideAt.current); }} onVol={v => { setVol(v); clearTimeout(hideAt.current); }} onSlideEnd={wake}
            onSeekDown={onSeekDown} onSeekMove={onSeekMove} onSeekUp={onSeekUp} />
        )}
        {/* controls: top and bottom scrims with the player chrome, faded out while watching */}
        {!full && <div className="absolute inset-0 transition-opacity duration-300" style={{ opacity: controls ? 1 : 0, pointerEvents: controls ? "auto" : "none" }}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 33%), linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.9) 100%)" }} />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <button onClick={e => { e.stopPropagation(); leave(); }} aria-label="Back"><ChevronLeft size={24} color="#fff" /></button>
            <div className="flex items-center gap-4">
              <button onClick={e => { e.stopPropagation(); demo("Cast"); }} aria-label="Cast"><Cast size={24} color="#fff" /></button>
              <button onClick={e => { e.stopPropagation(); demo("Settings"); }} aria-label="Settings"><Settings size={24} color="#fff" /></button>
            </div>
          </div>
          {/* 7px under the 32px icon row: 8px between the 24px icons and the 3px seek bar */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col" style={{ paddingBottom: 7 }}>
            <div className="flex items-center justify-between px-4" style={{ height: 32 }}>
              <div className="flex items-center gap-2">
                {(live.canPause || live.timeShiftLocked) && <button onClick={e => { e.stopPropagation(); togglePlay(); }} aria-label={playing ? "Pause" : "Play"}>
                  {playing ? <Pause size={24} color="#fff" fill="#fff" /> : <Play size={24} color="#fff" fill="#fff" />}
                </button>}
                {started && (
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#fff", fontVariantNumeric: "tabular-nums", textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>{elapsed(time.t)}</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button onClick={e => { e.stopPropagation(); leave(); }} aria-label="Picture in picture"><PictureInPicture2 size={24} color="#fff" /></button>
                <button onClick={e => { e.stopPropagation(); enterFull(); }} aria-label="Full screen"><Maximize size={24} color="#fff" /></button>
              </div>
            </div>
          </div>
        </div>}
        {/* free preview / Explore Packages: stays on screen while the rest of the controls are hidden, sliding down
            to 8px above the 3px seek bar */}
        {live.showExplorePackage && !(full && epg) && (
          <div className="absolute inset-x-0 flex items-end justify-between px-4 pb-2"
            // full screen: 16px above the seek line (its top is 69px up: 16 padding + 40 row + 7 of its 20px box)
            style={full
              ? { bottom: controls ? 77 : 8, paddingLeft: 44, paddingRight: 32, transition: "bottom .3s cubic-bezier(.2,0,0,1)" }
              : { bottom: 7 + 32, transform: controls ? "none" : "translateY(36px)", transition: "transform .3s cubic-bezier(.2,0,0,1)" }}>
            <span className="flex items-center gap-2 rounded-[4px]" style={{ height: full ? 40 : 32, padding: full ? "0 12px" : "0 8px", fontSize: full ? 14 : 10, background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
              <span style={{ color: ON_VARIANT }}>Free preview</span>
              <span style={{ color: ON_SURFACE, fontWeight: 600 }}>{live.previewOver ? "• Ended" : `• ${fmt(live.previewLeft)} minutes left`}</span>
            </span>
            <button onClick={e => { e.stopPropagation(); exitFull(); onOpenStore({ cur, t: video.current?.currentTime ?? 0 }); }}
              className="flex items-center gap-1 rounded-[4px]" style={{ height: full ? 40 : 32, padding: full ? "0 12px" : "0 8px", background: PILL, boxShadow: PILL_RING, color: "#fff", fontSize: full ? 14 : 10, fontWeight: 600, textShadow: "0 1px 3px rgba(0,0,0,.35)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
              <img src={iconCrown} alt="" style={{ width: full ? 18 : 14, height: full ? 18 : 14, filter: "brightness(0)" }} />Explore Packages
            </button>
          </div>
        )}
        {/* double-tap: a soft half-circle on that side with the seconds jumped */}
        {tapFx && (
          <div key={tapFx.key} className="tv-fade absolute top-0 bottom-0 flex items-center justify-center pointer-events-none"
            style={{ width: "42%", [tapFx.side < 0 ? "left" : "right"]: 0, background: "rgba(255,255,255,0.12)",
              borderRadius: tapFx.side < 0 ? "0 50% 50% 0 / 0 50% 50% 0" : "50% 0 0 50% / 50% 0 0 50%" }}>
            <span className="flex flex-col items-center gap-1 text-white" style={{ fontSize: 13, fontWeight: 600 }}>
              <img src={tapFx.side < 0 ? iconRewind : iconForward} alt="" className="block w-12 h-16 -my-3" />
              {tapFx.side < 0 ? "−" : "+"}{tapFx.secs}s
            </span>
          </div>
        )}
        {/* hold: rewind / fast-forward speed pill */}
        {hold !== 0 && (
          <span className="tv-fade absolute left-1/2 top-3 -translate-x-1/2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white pointer-events-none"
            style={{ background: "rgba(0,0,0,0.6)", fontSize: 13, fontWeight: 600 }}>
            {hold < 0 ? <><span className="tracking-[-3px]">◀◀</span> {holdX}x</> : <>{holdX}x <span className="tracking-[-3px]">▶▶</span></>}
          </span>
        )}
        {/* scrubbing: the time, large, in the middle of the picture */}
        {scrubbing && (
          // full screen: above the play / pause ring (its top is 40px over the middle), so it doesn't sit on it
          <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-white tabular-nums pointer-events-none whitespace-nowrap"
            style={{ top: full ? "calc(50% - 72px)" : "50%", fontSize: 24, fontWeight: 600, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
            {fmt(time.t)} <span style={{ color: ON_VARIANT }}>/ {fmt(time.d)}</span>
          </span>
        )}
        {/* seek bar along the player's bottom edge: draggable with time shift; a live-only channel sits at the live edge */}
        {full ? null : seekable ? (
          // 47px touch area around the 3px line: 10px above it (clear of the icon row) and 34px below it (over the
          // programme title's top padding, which has nothing to tap)
          <div className="absolute inset-x-0 flex items-start" style={{ bottom: -34, height: 10 + 3 + 34, paddingTop: 10, touchAction: "none" }}
            onPointerDown={onSeekDown} onPointerMove={onSeekMove} onPointerUp={onSeekUp} onPointerCancel={onSeekUp} onClick={e => e.stopPropagation()}>
            <div ref={barRef} className="relative w-full" style={{ height: 3, background: CHIP_BORDER }}>
              <div className="absolute left-0 top-0 h-full" style={{ width: `${played * 100}%`, background: PROGRESS }} />
              {(controls || scrubbing) && (
                // white handle centred on the line, 12px (16px while dragging), kept 8px clear of the screen edges
                <span className="absolute top-1/2 rounded-full" style={{
                  left: `clamp(8px, ${played * 100}%, calc(100% - 8px))`, width: 16, height: 16, background: "#fff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.4)", transform: `translate(-50%, -50%) scale(${scrubbing ? 1 : 0.75})`,
                  transition: "transform .15s ease",
                }} />
              )}
            </div>
          </div>
        ) : (
          <div className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: PROGRESS }} />
        )}
        {full && sharing && <LandscapeSheet onClose={() => setSharing(false)}>
          {close => <TVShareSheet ch={ch} onClose={close} onDone={msg => { close(); onToast(msg); }} />}
        </LandscapeSheet>}
      </div>

      <div ref={scroller} className="relative flex-1 overflow-y-auto overflow-x-hidden tv-scroll">
        {/* programme info */}
        <div className="flex flex-col gap-[6px] p-4" style={{ borderBottom: `1px solid ${OUTLINE}` }}>
          <h2 className="m-0 truncate" style={{ fontSize: 20, fontWeight: 600, color: "#fff" }}>{ch.program}</h2>
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <ChannelLogo c={ch} size={32} />
              <span className="truncate" style={{ fontSize: 16, fontWeight: 500, color: ON_VARIANT }}>{ch.name}</span>
              {!ch.excl && <span style={{ fontSize: 16, color: ON_VARIANT }}>|</span>}
              {ch.premium && <Crown c={ch} size={20} />}
              {!ch.excl && <span style={{ fontSize: 16, fontWeight: 500, color: ON_VARIANT }}>{ch.no}</span>}
            </div>
            <div className="flex items-center gap-4">
              <button onClick={toggleFav} aria-label={fav ? "Remove from favorites" : "Add to favorites"} aria-pressed={fav} className="relative">
                <Heart key={`heart-${likeFx?.key ?? 0}`} size={24} color={fav ? LIVE : ON_SURFACE} fill={fav ? LIVE : "none"}
                  className={likeFx ? (likeFx.on ? "tv-like-pop" : "tv-like-out") : undefined} />
                {likeFx?.on && (
                  <span key={`burst-${likeFx.key}`} className="absolute left-1/2 top-1/2 pointer-events-none" aria-hidden>
                    <span className="tv-like-ring absolute rounded-full" style={{ width: 40, height: 40, left: -20, top: -20, border: `2px solid ${LIVE}` }} />
                    {Array.from({ length: 8 }, (_, i) => (
                      <span key={i} className="tv-like-dot absolute rounded-full" style={{
                        width: 5, height: 5, left: -2.5, top: -2.5, background: ["#ea5454", "#ff8fb1", "#ffd257", "#ff5e8a"][i % 4],
                        ["--a" as string]: `${i * 45}deg`,
                      }} />
                    ))}
                  </span>
                )}
              </button>
              <button onClick={() => onShare(ch)} aria-label="Share"><img src={iconShare} alt="" width={24} height={24} className="block" /></button>
            </div>
          </div>
        </div>

        {/* category tabs: stick under the player once the info above has scrolled away */}
        <div ref={tabsRef} className="sticky top-0 z-10 pt-2" style={{ background: BG, borderBottom: `1px solid ${OUTLINE}` }}>
          <div className="tv-rail flex gap-2 overflow-x-auto px-4">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => pickCat(c)} className="relative shrink-0 px-2 pt-3 pb-[10px]">
                <span className="whitespace-nowrap" style={{ fontSize: 16, fontWeight: c === cat ? 700 : 400, color: c === cat ? "#fff" : ON_SURFACE }}>{c}</span>
                {c === cat && <span className="absolute left-2 right-2 bottom-0 h-[3px] rounded-[1.5px] bg-white" />}
              </button>
            ))}
            <span className="shrink-0" style={{ width: 8 }} />
          </div>
        </div>

        {/* channel list: the one playing is highlighted and tagged Watching */}
        <div className="flex flex-col" style={{ minHeight: "100%", paddingBottom: 88 }}>
          {list.length === 0 && <p className="m-0 p-6 text-center" style={{ fontSize: 14, color: ON_VARIANT }}>No channels here yet</p>}
          {list.map(({ c, i }) => {
            const on = i === cur;
            return (
              <button key={`${cat}-${i}`} onClick={() => pick(i)} data-watching={on || undefined} className="flex items-center gap-2 p-4 text-left w-full"
                style={{ background: on ? GLASS_CARD_ON : "transparent" }}>
                <ChannelLogo c={c} size={48} />
                <div className="flex flex-1 flex-col gap-[6px] min-w-0">
                  <span className="truncate" style={{ fontSize: 14, lineHeight: "18px", color: ON_SURFACE }}>{c.program}</span>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex items-center gap-2 shrink-0">
                      {c.premium && <Crown c={c} size={16} />}
                      {!c.excl && <span className="rounded-[4px] px-1 text-center text-white" style={{ minWidth: 28, fontSize: 10, lineHeight: "20px", fontWeight: 600, background: "rgba(214,222,240,0.18)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)" }}>{c.no}</span>}
                    </div>
                    {!c.excl && <span className="shrink-0" style={{ width: 1, height: 14, background: CHIP_BORDER }} />}
                    <span className="truncate" style={{ fontSize: 12, color: ON_VARIANT }}>{c.name}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between shrink-0" style={{ height: 46, width: 70 }}>
                  {c.timeshift ? (
                    <span role="button" aria-label={`Time shift: ${c.name}`} onClick={e => { e.stopPropagation(); demo(`Time shift: ${c.name}`); }}>
                      <History size={16} color={ON_VARIANT} />
                    </span>
                  ) : <span />}
                  {on && (
                    <WatchingTag playing={playing} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* All Programs: floats over the channel list, bottom right */}
      {!full && (
        <button onClick={() => onPrograms({ cur, t: video.current?.currentTime ?? 0 })} aria-label="All Programs"
          className="absolute right-4 bottom-4 z-20 w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{ background: PILL, boxShadow: `${PILL_RING}, 0 8px 20px rgba(0,0,0,0.45)`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
          <img src={iconAllPrograms} alt="" width={28} height={28} className="block" />
        </button>
      )}
      <style>{`.tv-scroll{scrollbar-width:none}.tv-scroll::-webkit-scrollbar,.tv-rail::-webkit-scrollbar{display:none}.tv-rail{scrollbar-width:none}
        .tv-fade{animation:tv-fade .15s ease-out}
        .tv-like-pop{animation:tv-like-pop .5s cubic-bezier(.2,0,0,1)}
        @keyframes tv-like-pop{0%{transform:scale(.3)}45%{transform:scale(1.3)}70%{transform:scale(.9)}100%{transform:scale(1)}}
        .tv-like-out{animation:tv-like-out .25s ease-out}
        @keyframes tv-like-out{0%{transform:scale(.7)}100%{transform:scale(1)}}
        .tv-like-ring{animation:tv-like-ring .5s ease-out forwards}
        @keyframes tv-like-ring{0%{transform:scale(.3);opacity:1}100%{transform:scale(1.3);opacity:0}}
        .tv-like-dot{opacity:0;animation:tv-like-dot .55s .08s ease-out forwards}
        @keyframes tv-like-dot{0%{opacity:1;transform:rotate(var(--a)) translateY(-8px) scale(1)}100%{opacity:0;transform:rotate(var(--a)) translateY(-22px) scale(.4)}}@keyframes tv-fade{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  );
}

// a channel's crown (rules.js): gold until the viewer has it; once owned it shows nothing, like a free channel
export function Crown({ c, size, framed }: { c: Channel; size: number; framed?: boolean }) {
  if (!rules().showsCrown({ ch: ruleChannel(c) })) return null;
  if (framed) return <CrownFrame><img src={iconCrown} alt="Premium, free preview" width={CROWN_IN_FRAME} height={CROWN_IN_FRAME} /></CrownFrame>;
  return <img src={iconCrown} alt="Premium, free preview" style={{ width: size, height: size }} />;
}

// the 9-bar waveform in the tag ripples out from the middle while the channel plays, and rests in full when paused
const WAVE = [4, 7, 10.3, 16.6, 24, 16.6, 10.3, 7, 4];
function WatchingTag({ playing, className = "" }: { playing: boolean; className?: string }) {
  return (
    <span className={`${className} shrink-0 flex items-center justify-center gap-[2px] rounded-[2px]`} style={{ height: 16, padding: "0 4px", fontSize: 10, fontWeight: 600, background: LIVE, color: "#fff" }}>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="#fff" aria-hidden>
        {WAVE.map((h, i) => (
          <rect key={i} className={playing ? "tv-wave" : undefined} x={12 + (i - 4) * 2.6 - 0.7} y={12 - h / 2} width={1.4} height={h} rx={0.7}
            style={{ transformOrigin: "12px 12px", animationDelay: `${Math.abs(i - 4) * 0.12 - 1}s` }} />
        ))}
      </svg>
      Watching
      <style>{`.tv-wave{animation:tv-wave .9s ease-in-out infinite}@keyframes tv-wave{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}@media (prefers-reduced-motion:reduce){.tv-wave{animation:none}}`}</style>
    </span>
  );
}

export function ChannelLogo({ c, size }: { c: Channel; size: number }) {
  const len = c.short?.length ?? 0;
  if (!c.logo) return (
    <span className="shrink-0 rounded-full flex items-center justify-center" style={{ width: size, height: size, background: c.bg, color: c.fg }}>
      <span className="text-center" style={{ padding: size * 0.06, fontSize: size * (len <= 2 ? 0.4 : len === 3 ? 0.3 : len <= 5 ? 0.24 : len <= 10 ? 0.16 : 0.135), fontWeight: 800, letterSpacing: 0.3, lineHeight: 1.1 }}>{c.short}</span>
    </span>
  );
  if (c.box) return (
    <span className="relative block shrink-0 overflow-hidden rounded-full" style={{ width: size, height: size, background: c.bg }}>
      <img src={c.logo} alt="" className="absolute max-w-none" style={{ left: `${c.box[0]}%`, top: `${c.box[1]}%`, width: `${c.box[2]}%`, height: `${c.box[3]}%`, objectFit: "contain" }} />
    </span>
  );
  return (
    <span className="shrink-0 overflow-hidden rounded-full flex items-center justify-center" style={{ width: size, height: size, background: c.contain || c.round ? "#fff" : "#404045" }}>
      <img src={c.logo} alt="" className="w-full h-full" style={{ objectFit: c.contain ? "contain" : "cover", padding: c.contain ? size * 0.08 : 0, transform: c.round ? "scale(1.06)" : undefined }} />
    </span>
  );
}

// ─── Full-screen landscape controls (Figma playerLive_landscapeWakeFull) ───────────────────────────────────────────
// Top: back, the channel (logo, programme, name, crown, number) and heart / share / cast / settings. Middle: −10s,
// play / pause in an 80px ring, +10s (the skips on a time-shift channel only). Sides: brightness and volume sliders.
// Bottom: the seek bar (draggable with time shift), the time, Browse Channels, PiP and leave full screen.
type Pt = { clientX: number; clientY: number };
function FullControls(p: {
  ch: Channel; shown: boolean; playing: boolean; seekable: boolean; started: boolean; t: number; played: number; scrubbing: boolean;
  fav: boolean; bright: number; vol: number; up: (e: Pt, r: DOMRect) => number; barRef: React.RefObject<HTMLDivElement>;
  onBack: () => void; onFav: () => void; onShare: () => void; onDemo: (label: string) => void; onSkip: (secs: number) => void;
  onPlay: () => void; showPlay: boolean; onBrowse: () => void; onPip: () => void; onMinimize: () => void;
  onBright: (v: number) => void; onVol: (v: number) => void; onSlideEnd: () => void;
  onSeekDown: (e: React.PointerEvent<HTMLDivElement>) => void; onSeekMove: (e: React.PointerEvent) => void; onSeekUp: (e: React.PointerEvent) => void;
}) {
  const stop = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn(); };
  const icon40 = "w-10 h-10 rounded-full flex items-center justify-center shrink-0";
  return (
    <div className="absolute inset-0 transition-opacity duration-300" style={{ opacity: p.shown ? 1 : 0, pointerEvents: p.shown ? "auto" : "none" }}>
      {/* player fade: dark at the top and the bottom */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 30%), linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.9) 100%)" }} />

      {/* top bar */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between" style={{ padding: "16px 32px 8px 44px" }}>
        <div className="flex items-start gap-2 min-w-0">
          <button onClick={stop(p.onBack)} aria-label="Leave full screen" className={icon40} style={{ width: 40, height: 40 }}><ChevronLeft size={24} color="#fff" /></button>
          <div className="flex items-center gap-2 pr-4 min-w-0">
            <ChannelLogo c={p.ch} size={32} />
            <div className="flex flex-col gap-1 min-w-0">
              <span className="truncate" style={{ fontSize: 14, fontWeight: 600, color: ON_SURFACE, maxWidth: 360 }}>{p.ch.program}</span>
              <span className="flex items-center gap-[6px]">
                <span className="truncate" style={{ fontSize: 12, color: ON_SURFACE }}>{p.ch.name}</span>
                {p.ch.premium && <Crown c={p.ch} size={16} />}
                {!p.ch.excl && <span className="rounded-[4px] px-2 text-center text-white" style={{ minWidth: 40, fontSize: 12, lineHeight: "20px", fontWeight: 500, background: "rgba(214,222,240,0.18)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)" }}>{p.ch.no}</span>}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 pl-4">
          <button onClick={stop(p.onFav)} aria-label={p.fav ? "Remove from favorites" : "Add to favorites"} aria-pressed={p.fav} className={icon40}>
            <Heart size={24} color={p.fav ? LIVE : "#fff"} fill={p.fav ? LIVE : "none"} className={p.fav ? "tv-like-pop" : undefined} />
          </button>
          <button onClick={stop(p.onShare)} aria-label="Share" className={icon40}><img src={iconShare} alt="" width={24} height={24} /></button>
          <button onClick={stop(() => p.onDemo("Cast"))} aria-label="Cast" className={icon40}><Cast size={24} color="#fff" /></button>
          <button onClick={stop(() => p.onDemo("Settings"))} aria-label="Settings" className={icon40}><Settings size={24} color="#fff" /></button>
        </div>
      </div>

      {/* middle: −10s, play / pause, +10s, 80px apart */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center" style={{ gap: 80 }}>
        {p.seekable && (
          <button onClick={stop(() => p.onSkip(-10))} aria-label="Back 10 seconds" className="rounded-full p-2" style={{ background: "rgba(0,0,0,0.6)" }}>
            <img src={iconFullRewind} alt="" width={32} height={32} className="block" />
          </button>
        )}
        {p.showPlay && <button onClick={stop(p.onPlay)} aria-label={p.playing ? "Pause" : "Play"} className="rounded-full flex items-center justify-center"
          style={{ width: 80, height: 80, background: "rgba(0,0,0,0.45)", boxShadow: "inset 0 0 0 3px #fff" }}>
          {p.playing ? <Pause size={34} color="#fff" fill="#fff" /> : <Play size={34} color="#fff" fill="#fff" style={{ marginLeft: 4 }} />}
        </button>}
        {p.seekable && (
          <button onClick={stop(() => p.onSkip(10))} aria-label="Forward 10 seconds" className="rounded-full p-2" style={{ background: "rgba(0,0,0,0.6)" }}>
            <img src={iconFullForward} alt="" width={32} height={32} className="block" />
          </button>
        )}
      </div>

      {/* sides: brightness (left), volume (right) */}
      <VSlider side="left" icon={iconBrightness} label="Brightness" value={(p.bright - 0.2) / 0.8} up={p.up} onChange={v => p.onBright(0.2 + v * 0.8)} onEnd={p.onSlideEnd} />
      <VSlider side="right" icon={iconVolume} label="Volume" value={p.vol} up={p.up} onChange={p.onVol} onEnd={p.onSlideEnd} />

      {/* bottom: seek bar, then time + Browse Channels / PiP / leave full screen */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col" style={{ padding: "16px 32px 16px 44px" }}>
        {p.seekable ? (
          <div className="relative flex items-center" style={{ height: 20, touchAction: "none" }}
            onPointerDown={p.onSeekDown} onPointerMove={p.onSeekMove} onPointerUp={p.onSeekUp} onPointerCancel={p.onSeekUp} onClick={e => e.stopPropagation()}>
            <div ref={p.barRef} className="relative w-full rounded-full" style={{ height: 6, background: CHIP_BORDER }}>
              <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${p.played * 100}%`, background: PROGRESS }} />
              <span className="absolute top-1/2 rounded-full" style={{
                left: `clamp(7px, ${p.played * 100}%, calc(100% - 7px))`, width: 14, height: 14, background: "#fff", border: "2px solid #fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.25)", transform: `translate(-50%, -50%) scale(${p.scrubbing ? 1.15 : 1})`, transition: "transform .15s ease",
              }} />
            </div>
          </div>
        ) : (
          <div className="flex items-center" style={{ height: 20 }}><div className="w-full rounded-full" style={{ height: 6, background: PROGRESS }} /></div>
        )}
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 14, lineHeight: "18px", color: ON_VARIANT, fontVariantNumeric: "tabular-nums" }}>{p.started ? elapsed(p.t) : ""}</span>
          <div className="flex items-center gap-2">
            <button onClick={stop(p.onBrowse)} className="rounded-[4px] px-3" style={{ minHeight: 32, fontSize: 16, fontWeight: 700, color: "#f0f0f0" }}>Browse Channels</button>
            <button onClick={stop(p.onPip)} aria-label="Picture in picture" className={icon40}><img src={iconFullPip} alt="" width={24} height={24} /></button>
            <button onClick={stop(p.onMinimize)} aria-label="Leave full screen" className={icon40}><img src={iconMinimize} alt="" width={24} height={24} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// a vertical slider at the side of the full-screen player: a 24px icon over a 128px track, filled from the bottom
function VSlider({ side, icon, label, value, up, onChange, onEnd }: {
  side: "left" | "right"; icon: string; label: string; value: number; up: (e: Pt, r: DOMRect) => number;
  onChange: (v: number) => void; onEnd: () => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const set = (e: Pt) => { const r = track.current?.getBoundingClientRect(); if (r) onChange(up(e, r)); };
  const v = Math.min(1, Math.max(0, value));
  return (
    <div className="absolute flex flex-col items-center gap-2" style={{ [side]: 44, top: "calc(50% - 30px)", transform: "translateY(-50%)", width: 48, height: 160 }}
      onClick={e => e.stopPropagation()}>
      <img src={icon} alt="" width={24} height={24} />
      <div role="slider" aria-label={label} aria-valuenow={Math.round(v * 100)} aria-valuemin={0} aria-valuemax={100}
        className="relative flex-1 flex justify-center" style={{ width: 44, touchAction: "none" }}
        onPointerDown={e => { e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); set(e); }}
        onPointerMove={e => { if (e.buttons || e.pointerType === "touch") { e.stopPropagation(); if (e.currentTarget.hasPointerCapture(e.pointerId)) set(e); } }}
        onPointerUp={e => { e.stopPropagation(); onEnd(); }}>
        <div ref={track} className="relative h-full rounded-full" style={{ width: 6, background: "rgba(235,235,235,0.35)", boxShadow: "0 1px 1px rgba(0,0,0,0.25)" }}>
          <div className="absolute inset-x-0 bottom-0 rounded-full" style={{ height: `${v * 100}%`, background: "#ebebeb" }} />
          <div className="absolute left-1/2 -translate-x-1/2 rounded-full" style={{ bottom: `calc(${v * 100}% + 3px)`, width: 16, height: 3, background: "#ebebeb" }} />
        </div>
      </div>
    </div>
  );
}

// ─── Mini EPG, full-screen landscape (Figma Mobile_LandscapeMiniEPG_Default) ──────────────────────────────────────
// The player in a box at the top left with its controls (back to the full player; heart / share / cast / settings;
// seek bar, time, PiP, leave full screen); under it "Up Next:", the channel's programmes (the one on air outlined,
// later ones with a reminder bell); on the right the category tabs with a close button (back to the full player) and
// the channel list — the same channels, tab, crowns and "Watching" tag as the TV page, without the time-shift mark so
// the titles get the room. Tapping a channel switches to it here.
function MiniEpg(p: {
  ch: Channel; cur: number; boxW: number; boxH: number; panelW: number; playing: boolean; seekable: boolean; started: boolean;
  t: number; played: number; scrubbing: boolean; fav: boolean; barRef: React.RefObject<HTMLDivElement>; recent: number[]; favs: Set<number>;
  onBack: () => void; onFav: () => void; onShare: () => void; onDemo: (label: string) => void; onToast: (msg: string) => void;
  onPip: () => void; onMinimize: () => void; onPick: (i: number) => void;
  onSeekDown: (e: React.PointerEvent<HTMLDivElement>) => void; onSeekMove: (e: React.PointerEvent) => void; onSeekUp: (e: React.PointerEvent) => void;
}) {
  const [cat, setCatState] = useState(tvStore.cat);
  const setCat = (c: string) => { tvStore.cat = c; setCatState(c); };
  const list = useMemo(() => channelsFor(cat, p.recent, p.favs), [cat, p.recent, p.favs]);
  const now = nowMinutes();
  const shows = useMemo(() => scheduleFor(p.cur).filter(x => x.end > now), [p.cur, now]);
  const [reminders, setReminders] = useState(() => new Set(tvStore.reminders));
  const [rung, setRung] = useState<string | null>(null);
  const remind = (x: Programme) => {
    const key = `${p.cur}-${x.start}`, on = !reminders.has(key);
    const next = new Set(reminders); on ? next.add(key) : next.delete(key);
    tvStore.reminders = next; setReminders(next); setRung(on ? key : null);
    p.onToast(on ? `Reminder set: ${x.title} at ${clock(x.start)}` : `Reminder removed: ${x.title}`);
  };
  // the list starts at the channel playing
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => { listRef.current?.querySelector<HTMLElement>("[data-watching]")?.scrollIntoView({ block: "center" }); }, []);
  // taps in the panel and the up-next row belong to them, not to the player's tap / hold gestures
  const keep = { onClick: (e: React.MouseEvent) => e.stopPropagation(), onPointerDown: (e: React.PointerEvent) => e.stopPropagation() };
  const stop = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn(); };
  const icon40 = "w-10 h-10 rounded-full flex items-center justify-center shrink-0";

  return (
    <>
      {/* player box controls */}
      <div className="absolute left-0 top-0" style={{ width: p.boxW, height: p.boxH }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 30%), linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.85) 100%)" }} />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between px-4 py-3">
          <button onClick={stop(p.onBack)} aria-label="Back to the player" className={icon40}><ChevronLeft size={24} color="#fff" /></button>
          <div className="flex items-center gap-2">
            <button onClick={stop(p.onFav)} aria-label={p.fav ? "Remove from favorites" : "Add to favorites"} aria-pressed={p.fav} className={icon40}>
              <Heart size={24} color={p.fav ? LIVE : "#fff"} fill={p.fav ? LIVE : "none"} />
            </button>
            <button onClick={stop(p.onShare)} aria-label="Share" className={icon40}><img src={iconShare} alt="" width={24} height={24} /></button>
            <button onClick={stop(() => p.onDemo("Cast"))} aria-label="Cast" className={icon40}><Cast size={24} color="#fff" /></button>
            <button onClick={stop(() => p.onDemo("Settings"))} aria-label="Settings" className={icon40}><Settings size={24} color="#fff" /></button>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex flex-col px-4">
          {p.seekable ? (
            <div className="relative flex items-center" style={{ height: 20, touchAction: "none" }}
              onPointerDown={p.onSeekDown} onPointerMove={p.onSeekMove} onPointerUp={p.onSeekUp} onPointerCancel={p.onSeekUp} onClick={e => e.stopPropagation()}>
              <div ref={p.barRef} className="relative w-full rounded-full" style={{ height: 6, background: CHIP_BORDER }}>
                <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${p.played * 100}%`, background: PROGRESS }} />
                <span className="absolute top-1/2 rounded-full" style={{ left: `clamp(7px, ${p.played * 100}%, calc(100% - 7px))`, width: 14, height: 14, background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.25)", transform: `translate(-50%, -50%) scale(${p.scrubbing ? 1.15 : 1})` }} />
              </div>
            </div>
          ) : (
            <div className="flex items-center" style={{ height: 20 }}><div className="w-full rounded-full" style={{ height: 6, background: PROGRESS }} /></div>
          )}
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 14, lineHeight: "18px", color: ON_SURFACE, fontVariantNumeric: "tabular-nums" }}>{p.started ? elapsed(p.t) : ""}</span>
            <div className="flex items-center gap-2">
              <button onClick={stop(p.onPip)} aria-label="Picture in picture" className={icon40}><img src={iconFullPip} alt="" width={24} height={24} /></button>
              <button onClick={stop(p.onMinimize)} aria-label="Leave full screen" className={icon40}><img src={iconMinimize} alt="" width={24} height={24} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* up next: this channel's programmes */}
      <div className="absolute left-0 bottom-0 flex items-center gap-2 pl-4" style={{ width: p.boxW, top: p.boxH, background: BG }} {...keep}>
        <span className="shrink-0" style={{ fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: -0.2 }}>Up Next:</span>
        <div className="tv-rail flex gap-2 overflow-x-auto pr-4 py-2">
          {shows.map((x, k) => {
            const onAir = k === 0 && x.start <= now, key = `${p.cur}-${x.start}`, reminded = reminders.has(key);
            return (
              <button key={x.start} onClick={() => (onAir ? p.onBack() : remind(x))} className="shrink-0 flex flex-col justify-center gap-1 rounded-[8px] px-2 py-1 text-left"
                style={{ width: 200, height: 56, background: onAir ? "rgba(255,255,255,0.17)" : "rgba(255,255,255,0.08)", border: onAir ? `1px solid ${CHIP_BORDER}` : "1px solid transparent" }}>
                <span className="truncate w-full" style={{ fontSize: 14, lineHeight: "18px", color: ON_SURFACE }}>{x.title}</span>
                <span className="flex items-center justify-between w-full">
                  <span style={{ fontSize: 12, color: ON_VARIANT }}>{clock(x.start)} - {clock(x.end)}</span>
                  {!onAir && <img key={reminded ? `on-${key === rung}` : "off"} src={reminded ? iconBellOn : iconBell} alt={reminded ? "Reminder set" : "Add reminder"} width={16} height={16} className={reminded && key === rung ? "tv-ring" : undefined} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* channel list */}
      <div className="absolute right-0 top-0 bottom-0 flex flex-col" style={{ width: p.panelW, background: "#0d141d" }} {...keep}>
        <div className="relative shrink-0" style={{ borderBottom: `1px solid ${OUTLINE}` }}>
          <div className="tv-rail flex gap-2 overflow-x-auto px-4">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)} className="relative shrink-0 px-2 pt-3 pb-[10px] outline-none">
                <span className="whitespace-nowrap" style={{ fontSize: 16, fontWeight: c === cat ? 700 : 400, color: c === cat ? "#fff" : ON_SURFACE }}>{c}</span>
                {c === cat && <span className="absolute left-2 right-2 bottom-0 h-[3px] rounded-[1.5px] bg-white" />}
              </button>
            ))}
            <span className="shrink-0" style={{ width: 56 }} />
          </div>
          {/* the tabs fade out under the close button at the right edge */}
          <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end pr-1 pointer-events-none" style={{ width: 76, background: "linear-gradient(270deg, #0d141d 62%, rgba(13,20,29,0))" }}>
            <button onClick={stop(p.onBack)} aria-label="Close channel list" className={`${icon40} pointer-events-auto`}><X size={24} color="#fff" /></button>
          </div>
        </div>
        <div ref={listRef} className="tv-scroll flex-1 overflow-y-auto pb-8">
          {list.length === 0 && <p className="m-0 p-6 text-center" style={{ fontSize: 14, color: ON_VARIANT }}>No channels here yet</p>}
          {list.map(({ c, i }) => {
            const on = i === p.cur;
            return (
              <button key={`${cat}-${i}`} onClick={() => p.onPick(i)} data-watching={on || undefined} className="w-full flex items-center gap-2 text-left"
                style={{ padding: "16px 16px 16px 12px", background: on ? GLASS_CARD_ON : "transparent" }}>
                <ChannelLogo c={c} size={40} />
                <div className="flex flex-1 flex-col gap-[6px] min-w-0">
                  <span className="truncate" style={{ fontSize: 14, lineHeight: "18px", color: ON_SURFACE }}>{c.program}</span>
                  <div className="flex items-center gap-2 min-w-0">
                    {c.premium && <Crown c={c} size={16} />}
                    {!c.excl && <span className="shrink-0 rounded-[4px] px-1 text-center text-white" style={{ minWidth: 28, fontSize: 10, lineHeight: "20px", fontWeight: 600, background: "rgba(214,222,240,0.18)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)" }}>{c.no}</span>}
                    {!c.excl && <span className="shrink-0" style={{ width: 1, height: 14, background: CHIP_BORDER }} />}
                    <span className="truncate" style={{ fontSize: 12, color: ON_VARIANT }}>{c.name}</span>
                    {on && <WatchingTag playing={p.playing} className="ml-auto" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <style>{`.tv-ring{transform-origin:50% 10%;animation:tv-ring .7s ease-out}@keyframes tv-ring{0%{transform:scale(.6) rotate(0)}15%{transform:scale(1.25) rotate(18deg)}30%{transform:scale(1.1) rotate(-16deg)}45%{transform:scale(1) rotate(12deg)}60%{transform:rotate(-8deg)}75%{transform:rotate(4deg)}100%{transform:rotate(0)}}`}</style>
    </>
  );
}

// a bottom sheet inside the landscape player: dimmed picture, the sheet rising from the bottom edge (480px wide,
// centred, scrolling if it's taller than the screen); taps stay in it, not on the player's gestures
function LandscapeSheet({ onClose, children }: { onClose: () => void; children: (close: () => void) => React.ReactNode }) {
  const [shown, setShown] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setShown(true)); }, []);
  const close = () => { setShown(false); setTimeout(onClose, 250); };
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-end" onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
      <div className="absolute inset-0 transition-opacity duration-200" style={{ background: "rgba(0,0,0,0.6)", opacity: shown ? 1 : 0 }} onClick={close} />
      <div className="relative w-full overflow-y-auto rounded-t-[16px] transition-transform duration-300 tv-scroll"
        style={{ maxWidth: 480, maxHeight: "100%", background: PANEL, transform: shown ? "translateY(0)" : "translateY(100%)", transitionTimingFunction: "cubic-bezier(.2,0,0,1)" }}>
        {children(close)}
      </div>
    </div>
  );
}
