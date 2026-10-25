import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Cast, Settings, Heart, Pause, Play, PictureInPicture2, Maximize, History } from "lucide-react";
import iconCrown from "../assets/shorts/crown.svg";
import iconShare from "../assets/shorts/share-arrow.svg";
import iconCrownOwned from "../assets/shorts/crown-owned.svg";
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
import iconTimeshiftSmall from "../assets/epg/timeshift.svg";
import { PAGE_BG, BG, PANEL, PANEL_SOLID, OUTLINE, ON_SURFACE, ON_VARIANT, LIVE, PROGRESS, PILL, PILL_RING, CHIP_BG, CHIP_BORDER, GLASS_CARD_ON } from "./theme";

// ─── TV tab (Figma "PLAY-player": Mobile_PortraitPlay_Default_TVonmobile 1871:78141, Sticky Browse CH 1871:78788) ───
// Live TV on the phone: the channel plays in a 16:9 player pinned under the status bar; below it the programme info
// and the Browse Channels / All Programs buttons scroll away, and the category tabs stick under the player
// ("Sticky Browse CH") while the channel list scrolls on. The Figma frames are wireframes; they're dressed in the
// app's own dark theme and filled with the channels and artwork the Home tab already uses.

const BASE = import.meta.env.BASE_URL;
const a = (path: string) => `${BASE}${path}`;
const FONT = "'Open Sans', sans-serif";
const SUCCESS = "#59d478";

export const CATEGORIES = ["All Channels", "Recently Watched", "Favorite", "Digital TV", "Sports", "Movies & Series", "News", "Cartoons", "Variety", "Others"];

type Cat = "Digital TV" | "Sports" | "Movies & Series" | "News" | "Cartoons" | "Variety" | "Others";
export interface Channel {
  // contain: a non-round logo fitted on white with padding; round: a logo that's already a full round badge, drawn edge
  // to edge (padding would show the badge's own soft edge as a grey ring)
  // logo: an image file, or — for channels without one — a text badge (short label on the channel's colour)
  no: string; name: string; logo?: string; contain?: boolean; round?: boolean; short?: string; bg?: string; fg?: string; program: string; cats: Cat[]; premium?: boolean;
  video?: string; poster: string;
  // timeshift: the programme can be rewound / fast-forwarded (catch-up icon in the list, seekable player)
  timeshift?: boolean;
  // Premium crowns: a plain crown is a premium channel not in the viewer's packages (free preview only, with the
  // countdown and Explore Package in the player); owned: its package is bought, so it plays in full (crown + play mark)
  owned?: boolean;
}
const PREMIUM_AND_SPORTS: Channel[] = [
  { no: "902", timeshift: true, name: "Asian Games 2026", logo: a("tv-features-test/live-stream-assets/channel-asian-games.png"), round: true, program: "Football · Japan vs Thailand (Men's Group A)", cats: ["Sports", "Digital TV"], video: a("tv-features-test/Video/Football.mp4"), poster: a("tv-features-test/live-stream-assets/football-255.jpg") },
  { no: "907", timeshift: true, name: "Asian Games 2026", logo: a("tv-features-test/shorts-assets/channel-907.png"), round: true, program: "Badminton · Women's Singles Quarter-final", cats: ["Sports"], video: a("tv-features-test/Video/bad.mp4"), poster: a("tv-features-test/shorts-assets/badminton.jpg") },
  { no: "909", name: "Asian Games 2026", logo: a("tv-features-test/shorts-assets/channel-909.png"), round: true, program: "Volleyball · Thailand vs Korea (Women)", cats: ["Sports"], video: a("tv-features-test/Video/vall.mp4"), poster: a("tv-features-test/shorts-assets/volleyball.jpg") },
  { no: "61", owned: true, name: "PLAY Sports", logo: a("icons/channels/playsports.png"), program: "Premier League · Liverpool vs Brentford", cats: ["Sports"], premium: true, poster: a("posters/upcoming/live.jpg") },
  { no: "120", name: "MUTV", logo: a("icons/epg/mutv.png"), program: "PL Match: v Chelsea (A) 25/26", cats: ["Sports"], premium: true, poster: a("posters/upcoming/u3.jpg") },
  { no: "121", name: "Real Madrid TV", logo: a("icons/epg/realmadrid.png"), program: "Champions League 15/16: Real Madrid vs Atlético", cats: ["Sports"], poster: a("posters/upcoming/u2.jpg") },
  { no: "251", owned: true, timeshift: true, name: "HBO", logo: a("icons/channels/hbo.png"), program: "House of the Dragon · Season 2", cats: ["Movies & Series"], premium: true, video: a("tv-features-test/Video/hbo.mp4"), poster: a("tv-features-test/shorts-assets/hbo.jpg") },
  { no: "252", name: "HBO Hits", logo: a("icons/channels/hbohits.png"), program: "John Wick: Chapter 4", cats: ["Movies & Series"], premium: true, poster: a("posters_portrait/John.jpg") },
  { no: "253", timeshift: true, name: "HBO Family", logo: a("icons/channels/hbofamily.png"), program: "Spider-Man: Across the Spider-Verse", cats: ["Movies & Series", "Cartoons"], premium: true, video: a("tv-features-test/Video/spiderman.mp4"), poster: a("tv-features-test/shorts-assets/spiderman.jpg") },
  { no: "230", owned: true, name: "Warner TV", logo: a("icons/channels/wbtv.png"), program: "Avengers: Doomsday · First Look", cats: ["Movies & Series"], premium: true, video: a("tv-features-test/Video/Dis.mp4"), poster: a("tv-features-test/shorts-assets/doomsday.jpg") },
  { no: "255", name: "Cinemax", logo: a("icons/channels/cinemax.png"), program: "F1: The Movie", cats: ["Movies & Series"], premium: true, poster: a("posters_portrait/F1.jpg") },
  { no: "520", name: "CNN", logo: a("icons/epg/cnn.jpg"), program: "CNN News Central", cats: ["News"], poster: a("posters/continue/c4.jpg") },
  { no: "521", name: "BBC News", logo: a("icons/epg/bbc.jpg"), program: "BBC News at Ten", cats: ["News"], poster: a("posters/continue/c3.jpg") },
  { no: "135", timeshift: true, name: "Cool Channel", logo: a("tv-features-test/shorts-assets/coolch.jpg"), program: "Cool Live Concert · Bangkok 2026", cats: ["Variety", "Digital TV"], video: a("tv-features-test/Video/Concert.mp4"), poster: a("tv-features-test/shorts-assets/coolch.jpg") },
  { no: "260", name: "Rock Entertainment", logo: a("icons/channels/rock.png"), program: "Love Island · Season 11", cats: ["Variety"], poster: a("tv-features-test/shorts-assets/love-island.jpg") },
  { no: "640", name: "W Sport", logo: a("icons/epg/wsport.png"), contain: true, program: "Malaysia Regional Cup '26: Wildcats v Sneakers", cats: ["Sports"], poster: a("posters/upcoming/u4.png") },
];

// Thai digital TV (NBTC numbers 1–36) and a few more, with text badges in place of logo files

const POSTERS = ["posters/SC.jpg", "posters/all.jpg", "posters/arsenal.jpg", "posters/f1.jpg", "posters/maxresdefault.jpg",
  "posters/continue/c1.jpg", "posters/continue/c2.jpg", "posters/continue/c5.jpg", "posters/upcoming/u1.jpg",
  "posters_portrait/ex1.jpg", "posters_portrait/ex2.jpg", "posters_portrait/ex4.jpg", "posters_portrait/ex5.jpg", "posters_portrait/debt.jpg"];
const th = (no: string, name: string, short: string, bg: string, fg: string, program: string, cats: Cat[], i: number): Channel =>
  ({ no, name, short, bg, fg, program, cats, poster: a(POSTERS[i % POSTERS.length]) });
const THAI: Channel[] = [
  th("1", "TV5 HD", "TV5", "#0a7d3b", "#fff", "Morning News · Thailand Today", ["Digital TV", "News"], 0),
  th("2", "NBT", "NBT", "#1f4fa3", "#fff", "NBT News Hour", ["Digital TV", "News"], 1),
  th("3", "Thai PBS", "PBS", "#f58220", "#fff", "Thai PBS Documentary: Mekong Life", ["Digital TV", "News", "Others"], 2),
  th("4", "ALTV", "ALTV", "#7b3fa0", "#fff", "Learning Space for Kids", ["Digital TV", "Cartoons", "Others"], 3),
  th("10", "TPTV", "TPTV", "#b8892b", "#fff", "Parliament Live Session", ["Digital TV", "News"], 4),
  th("16", "TNN16", "TNN", "#c8102e", "#fff", "TNN Business Update", ["Digital TV", "News"], 5),
  th("18", "JKN18", "JKN", "#1a1a1a", "#fff", "Global News Tonight", ["Digital TV", "News"], 6),
  th("22", "Nation TV", "NTV", "#0055a5", "#fff", "Nation Talk Night", ["Digital TV", "News"], 7),
  th("23", "Workpoint TV", "WP", "#ff2d55", "#fff", "The Mask Singer Thailand", ["Digital TV", "Variety"], 8),
  th("24", "True4U", "4U", "#e60012", "#fff", "Thai Lakorn Classic", ["Digital TV", "Variety"], 9),
  th("25", "GMM25", "25", "#ff6a00", "#fff", "GMM25 Series: Love Mechanics", ["Digital TV", "Movies & Series"], 10),
  th("27", "Channel 8", "8", "#d91e2b", "#fff", "Muay Thai Super Champ", ["Digital TV", "Sports"], 11),
  th("29", "Mono29", "MONO", "#111111", "#fff", "Mono Movie: Action Night", ["Digital TV", "Movies & Series"], 12),
  th("30", "MCOT HD", "MCOT", "#e2001a", "#fff", "MCOT Evening News", ["Digital TV", "News"], 13),
  th("31", "One31", "31", "#e4007f", "#fff", "One31 Lakorn: Love Destiny", ["Digital TV", "Variety"], 0),
  th("32", "Thairath TV", "TR", "#003b8e", "#fff", "Thairath News Night", ["Digital TV", "News"], 1),
  th("33", "Channel 3 HD", "3", "#f7a600", "#1a1a1a", "Channel 3 Drama: Buppesannivas", ["Digital TV", "Variety"], 2),
  th("34", "Amarin TV", "AMR", "#0b8fd6", "#fff", "Amarin Talk Show", ["Digital TV", "Variety"], 3),
  th("35", "Channel 7 HD", "7", "#00a650", "#fff", "Channel 7 Lakorn Prime Time", ["Digital TV", "Variety"], 4),
  th("36", "PPTV HD", "PPTV", "#1c2a6b", "#fff", "Thai League 1 Highlights", ["Digital TV", "Sports"], 5),
  th("41", "Bugaboo TV", "BUG", "#ffcc00", "#222", "Cartoon Morning", ["Cartoons"], 6),
  th("50", "PLAY Kids", "KIDS", "#b8f416", "#111", "PLAY Kids: Animal Friends", ["Cartoons"], 7),
  th("62", "PLAY Sports 2", "PS2", "#b8f416", "#111", "Thai League 1: Buriram vs BG Pathum", ["Sports"], 8),
  th("70", "PLAY Movie", "PM", "#b8f416", "#111", "PLAY Movie: Thai Box Office", ["Movies & Series"], 9),
  th("80", "PLAY Shop", "SHOP", "#ff5e8a", "#fff", "PLAY Shop Live: Home & Kitchen Deals", ["Others"], 10),
];

// all 40 channels, in channel-number order
export const CHANNELS: Channel[] = [...THAI, ...PREMIUM_AND_SPORTS].sort((x, y) => Number(x.no) - Number(y.no));
const indexOf = (no: string) => CHANNELS.findIndex(c => c.no === no);

// recently watched and favourites, kept here so they survive leaving the TV page (PiP, Browse Channels) and coming back
// recently watched, favourites, the category tab and programme reminders ("channel-start"), shared by the TV page, Browse Channels and All Program Guide
// (kept here so they survive leaving the TV page for those pages or the PiP mini-player and coming back)
export const tvStore = { recent: [indexOf("902")], favs: new Set([indexOf("902"), indexOf("251")]), cat: "All Channels", reminders: new Set<string>() };

// ── Programme schedule (All Program Guide) ──
// Each channel runs back-to-back programmes through today; the one on air now is the programme the TV page shows.
export interface Programme { title: string; start: number; end: number }   // minutes since midnight
const SHOWS: Record<Cat, string[]> = {
  "Digital TV": ["Morning Talk", "Lunchtime News", "Thai Lakorn Rerun", "Afternoon Variety", "Evening News", "Prime Time Drama", "Late Night Talk"],
  Sports: ["Match Preview", "Live Match", "Post-Match Analysis", "Classic Matches", "Sports Tonight", "Highlights Show", "Training Ground"],
  "Movies & Series": ["Feature Film", "Series Marathon", "Behind the Scenes", "Blockbuster Night", "Box Office Hits", "Director's Cut", "Late Movie"],
  News: ["Headlines", "World Report", "Business Update", "News Hour", "Debate Live", "Weather & Traffic", "Night News"],
  Cartoons: ["Cartoon Morning", "Animal Friends", "Learn & Play", "Super Heroes", "Toon Time", "Story Hour", "Bedtime Tales"],
  Variety: ["Game Show", "Music Live", "Cooking Battle", "Comedy Hour", "Talent Show", "Talk Show", "Concert Special"],
  Others: ["Programme", "Special Feature", "Documentary", "Magazine Show", "Replay", "Community Hour", "Night Programme"],
};
export const nowMinutes = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
export const clock = (m: number) => { const t = ((m % 1440) + 1440) % 1440; return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`; };
// around: the moment to build the schedule around, in minutes from midnight today (another day: ± 1440 per day);
// the programme on air now keeps the TV page's title
export const scheduleFor = (i: number, around = nowMinutes()): Programme[] => {
  const c = CHANNELS[i], now = nowMinutes(), pool = SHOWS[c.cats[0]];
  // slot lengths vary by channel (30/60/90 min), on the hour or the half hour
  const len = [60, 30, 90, 60][i % 4];
  const offset = (i % 2) * 30 % len;
  const first = Math.floor((around - offset) / len) * len + offset;
  const out: Programme[] = [];
  for (let k = -4; k <= 6; k++) {
    const start = first + k * len, slot = Math.floor((start - offset) / len);
    const live = start <= now && now < start + len;
    out.push({ title: live ? c.program : pool[((slot % pool.length) + pool.length + i) % pool.length], start, end: start + len });
  }
  return out;
};

// sub-genres, by channel number (for the sub filters)
const TAGS: Record<string, string[]> = {
  "902": ["Multi-Sports", "Football"], "907": ["Multi-Sports"], "909": ["Multi-Sports"],
  "61": ["Football", "Golf", "Tennis"], "62": ["Football", "Motorsport", "Rugby"], "120": ["Football"], "121": ["Football"], "36": ["Football"],
  "27": ["Boxing"], "640": ["Basketball"],
  "4": ["Education"], "3": ["Documentary"], "80": ["Shopping"],
};
const tagged = (t: string) => (c: Channel) => (TAGS[c.no] ?? []).includes(t);

// sub filters under a category tab (Browse Channels, All Program Guide), "All" first: only Sports and Others
export const SUBFILTERS: Partial<Record<string, { label: string; test: (c: Channel) => boolean }[]>> = {
  Sports: ["Multi-Sports", "Football", "Motorsport", "Golf", "Basketball", "Tennis", "Rugby", "Boxing"].map(t => ({ label: t, test: tagged(t) })),
  Others: ["Education", "Documentary", "Shopping"].map(t => ({ label: t, test: tagged(t) })),
};

// the channels under a category tab (TV page list, Browse Channels grid, All Program Guide), optionally narrowed
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

export default function TVScreen({ topInset, bottom, muted, start, onBack, onBrowse, onPrograms, onShare, onToast }: {
  topInset: string; bottom: string; muted: boolean; start?: TVPos | null; onShare: (ch: Channel) => void;
  // Browse Channels / All Programs open their own pages, the channel carrying on in the PiP mini-player meanwhile
  onBrowse: (pos: TVPos) => void; onPrograms: (pos: TVPos) => void;
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

  // player: controls show on tap and fade after 3s; premium channels run a free-preview countdown
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
    hideAt.current = setTimeout(() => setControls(false), 3000);
  };
  useEffect(() => { wake(); return () => clearTimeout(hideAt.current); }, [cur]);
  const [preview, setPreview] = useState(174);
  useEffect(() => { setPreview(174); }, [cur]);
  useEffect(() => {
    if (!ch.premium || ch.owned) return;
    const t = setInterval(() => setPreview(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [cur, ch.premium, ch.owned]);

  const togglePlay = () => {
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

  // ── Time shift: double-tap a side to jump 10s, hold a side to rewind / fast-forward at 2x, drag the seek bar ──
  // Only on channels with time shift; a live-only channel plays at the live edge and none of these respond.
  const seekable = !!ch.timeshift && !!ch.video;
  const DOUBLE_TAP_MS = 300, HOLD_MS = 450;
  const press = useRef<{ x: number; y: number; side: -1 | 1; timer?: ReturnType<typeof setTimeout>; held: boolean } | null>(null);
  const [hold, setHold] = useState<-1 | 0 | 1>(0);
  const rewinder = useRef<ReturnType<typeof setInterval>>();
  const wasPlaying = useRef(true);
  const lastTap = useRef<{ t: number; side: -1 | 0 | 1; streak: number }>({ t: 0, side: 0, streak: 0 });
  const singleTap = useRef<ReturnType<typeof setTimeout>>();
  const [tapFx, setTapFx] = useState<{ side: -1 | 1; secs: number; key: number } | null>(null);
  const sideAt = (e: { clientX: number; clientY: number }, el: Element) => along(e, el.getBoundingClientRect());
  const skip = (secs: number) => {
    const v = video.current;
    if (v && v.duration) v.currentTime = Math.min(v.duration - 0.1, Math.max(0, v.currentTime + secs));
  };
  const startHold = (side: -1 | 1) => {
    const v = video.current;
    if (!v) return;
    setHold(side); setControls(false);
    if (side > 0) { v.playbackRate = 2; return; }
    // browsers can't play backwards: pause and step back at 2x speed instead
    wasPlaying.current = !v.paused;
    v.pause();
    rewinder.current = setInterval(() => skip(-0.2), 100);
  };
  const endHold = () => {
    const v = video.current;
    clearInterval(rewinder.current);
    if (v) { v.playbackRate = 1; if (hold < 0 && wasPlaying.current) v.play().catch(() => {}); }
    setHold(0);
  };
  const onPressStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!seekable || (e.target as Element).closest("button")) return;
    const p = { x: e.clientX, y: e.clientY, side: (sideAt(e, e.currentTarget) < 0.5 ? -1 : 1) as -1 | 1, held: false } as NonNullable<typeof press.current>;
    p.timer = setTimeout(() => { p.held = true; startHold(p.side); }, HOLD_MS);
    press.current = p;
  };
  const onPressMove = (e: React.PointerEvent) => {
    const p = press.current;
    if (p && !p.held && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 8) { clearTimeout(p.timer); press.current = null; }
  };
  const onPressEnd = () => {
    const p = press.current;
    if (!p) return;
    clearTimeout(p.timer);
    if (p.held) endHold();
  };
  // a tap brings the controls up; another tap while they're showing puts them away
  const toggleControls = () => { if (controls) { clearTimeout(hideAt.current); setControls(false); } else wake(); };
  const onTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const p = press.current;
    press.current = null;
    if (p?.held) return;                       // the end of a hold, not a tap
    // mini EPG open: a tap on the picture closes it, back to the full player
    if (full && epg) { clearTimeout(singleTap.current); setEpg(false); wake(); return; }
    if (!seekable) { toggleControls(); return; }
    const fx = sideAt(e, e.currentTarget);
    const side: -1 | 0 | 1 = fx < 0.4 ? -1 : fx > 0.6 ? 1 : 0;
    const now = e.timeStamp, last = lastTap.current;
    const quick = now - last.t < DOUBLE_TAP_MS && side === last.side && side !== 0;
    lastTap.current = { t: now, side, streak: quick ? last.streak + 1 : 0 };
    clearTimeout(singleTap.current);
    if (quick) {
      skip(side * 10);
      setTapFx({ side: side as -1 | 1, secs: 10 * lastTap.current.streak, key: now });
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
    const f = along(e, r);
    v.currentTime = f * v.duration;
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
    setRecent(r => [i, ...r.filter(x => x !== i)].slice(0, 8));
  };

  const list = useMemo(() => channelsFor(cat, recent, favs), [cat, recent, favs]);

  const scroller = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const browse = () => onBrowse({ cur, t: video.current?.currentTime ?? 0 });
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
  const played = time.d ? time.t / time.d : 0;

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
        touchAction: seekable ? "manipulation" : undefined, userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" }}
        onClick={onTap} onPointerDown={onPressStart} onPointerMove={onPressMove} onPointerUp={onPressEnd} onPointerCancel={onPressEnd} onPointerLeave={onPressEnd}
        onContextMenu={e => { if (seekable) e.preventDefault(); }}>
        {ch.video
          ? <video key={ch.video} ref={video} src={ch.video} poster={ch.poster} autoPlay loop muted={muted} playsInline
              className="absolute" style={{ ...(full && epg ? { left: 0, top: 0, width: boxW, height: boxH } : { inset: 0, width: "100%", height: "100%" }), objectFit: full ? "contain" : "cover", filter: bright < 1 ? `brightness(${bright})` : undefined }}
              onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onPlaying={() => setStarted(true)}
              onLoadedMetadata={e => {
                const v = e.currentTarget;
                if (resumeAt.current) { v.currentTime = Math.min(resumeAt.current, (v.duration || 1) - 0.1); resumeAt.current = 0; }
                setTime({ t: v.currentTime, d: v.duration || 0 });
              }}
              onTimeUpdate={e => setTime({ t: e.currentTarget.currentTime, d: e.currentTarget.duration || 0 })} />
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
            onPlay={togglePlay} onBrowse={() => setEpg(true)} onPip={() => { exitFull(); leave(); }} onMinimize={exitFull}
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
                <button onClick={e => { e.stopPropagation(); togglePlay(); }} aria-label={playing ? "Pause" : "Play"}>
                  {playing ? <Pause size={24} color="#fff" fill="#fff" /> : <Play size={24} color="#fff" fill="#fff" />}
                </button>
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
        {/* free preview / Explore Package: stays on screen while the rest of the controls are hidden, sliding down
            to 8px above the 3px seek bar */}
        {ch.premium && !ch.owned && !(full && epg) && (
          <div className="absolute inset-x-0 flex items-end justify-between px-4 pb-2"
            // full screen: 16px above the seek line (its top is 69px up: 16 padding + 40 row + 7 of its 20px box)
            style={full
              ? { bottom: controls ? 77 : 8, paddingLeft: 44, paddingRight: 32, transition: "bottom .3s cubic-bezier(.2,0,0,1)" }
              : { bottom: 7 + 32, transform: controls ? "none" : "translateY(36px)", transition: "transform .3s cubic-bezier(.2,0,0,1)" }}>
            <span className="flex items-center gap-2 rounded-[4px]" style={{ height: full ? 40 : 32, padding: full ? "0 12px" : "0 8px", fontSize: full ? 14 : 10, background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
              <span style={{ color: ON_VARIANT }}>Free preview</span>
              <span style={{ color: ON_SURFACE, fontWeight: 600 }}>• {fmt(preview)} minutes left</span>
            </span>
            <button onClick={e => { e.stopPropagation(); demo("Explore Package"); }}
              className="flex items-center gap-1 rounded-[4px]" style={{ height: full ? 40 : 32, padding: full ? "0 12px" : "0 8px", background: PILL, boxShadow: PILL_RING, color: "#fff", fontSize: full ? 14 : 10, fontWeight: 600, textShadow: "0 1px 3px rgba(0,0,0,.35)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
              <img src={iconCrown} alt="" style={{ width: full ? 18 : 14, height: full ? 18 : 14, filter: "brightness(0)" }} />Explore Package
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
        {/* hold: 2x rewind / fast-forward pill */}
        {hold !== 0 && (
          <span className="tv-fade absolute left-1/2 top-3 -translate-x-1/2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white pointer-events-none"
            style={{ background: "rgba(0,0,0,0.6)", fontSize: 13, fontWeight: 600 }}>
            {hold < 0 ? <><span className="tracking-[-3px]">◀◀</span> 2x</> : <>2x <span className="tracking-[-3px]">▶▶</span></>}
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
            <div ref={barRef} className="relative w-full" style={{ height: 3, background: "#4a4a4a" }}>
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
              <span className="truncate" style={{ fontSize: 16, fontWeight: 500, color: ON_VARIANT }}>{ch.name} HD</span>
              <span style={{ fontSize: 16, color: ON_VARIANT }}>|</span>
              {ch.premium && <Crown c={ch} size={20} />}
              <span style={{ fontSize: 16, fontWeight: 500, color: ON_VARIANT }}>{ch.no}</span>
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

        {/* Browse Channels / All Programs (Figma "Mobile / Button general", Blur) */}
        <div className="flex gap-[10px] px-4 pt-4">
          {[["Browse Channels", browse], ["All Programs", () => onPrograms({ cur, t: video.current?.currentTime ?? 0 })]].map(([t, fn]) => (
            <button key={t as string} onClick={fn as () => void} className="flex-1 rounded-[10px]"
              style={{ minHeight: 40, fontSize: 14, fontWeight: 700, color: "#fff", background: CHIP_BG, border: `1px solid ${CHIP_BORDER}`, boxShadow: "0 4px 8px rgba(0,0,0,0.2)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>{t as string}</button>
          ))}
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
        <div className="flex flex-col pb-4" style={{ minHeight: "100%" }}>
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
                      <span className="rounded-[4px] px-1 text-center text-white" style={{ minWidth: 28, fontSize: 10, lineHeight: "20px", fontWeight: 600, background: "rgba(214,222,240,0.18)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)" }}>{c.no}</span>
                    </div>
                    <span className="shrink-0" style={{ width: 1, height: 14, background: "#4a4a4a" }} />
                    <span className="truncate" style={{ fontSize: 12, color: ON_VARIANT }}>{c.name}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between shrink-0" style={{ height: 46, width: 54 }}>
                  {c.timeshift ? (
                    <span role="button" aria-label={`Time shift: ${c.name}`} onClick={e => { e.stopPropagation(); demo(`Time shift: ${c.name}`); }}>
                      <History size={16} color={ON_VARIANT} />
                    </span>
                  ) : <span />}
                  {on && (
                    <span className="flex items-center justify-center rounded-[2px]" style={{ height: 16, padding: "0 4px", fontSize: 10, fontWeight: 600, background: SUCCESS, color: "#0b2a14" }}>Watching</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
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

export function Crown({ c, size }: { c: Channel; size: number }) {
  return c.owned
    ? <img src={iconCrownOwned} alt="Premium, package bought" style={{ width: size, height: size * 17 / 16 }} />
    : <img src={iconCrown} alt="Premium, free preview" style={{ width: size, height: size }} />;
}

export function ChannelLogo({ c, size }: { c: Channel; size: number }) {
  if (!c.logo) return (
    <span className="shrink-0 rounded-full flex items-center justify-center" style={{ width: size, height: size, background: c.bg, color: c.fg }}>
      <span style={{ fontSize: size * ((c.short?.length ?? 0) > 3 ? 0.24 : (c.short?.length ?? 0) > 2 ? 0.3 : 0.4), fontWeight: 800, letterSpacing: 0.3 }}>{c.short}</span>
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
  onPlay: () => void; onBrowse: () => void; onPip: () => void; onMinimize: () => void;
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
                <span className="rounded-[4px] px-2 text-center text-white" style={{ minWidth: 40, fontSize: 12, lineHeight: "20px", fontWeight: 500, background: "rgba(214,222,240,0.18)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)" }}>{p.ch.no}</span>
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
        <button onClick={stop(p.onPlay)} aria-label={p.playing ? "Pause" : "Play"} className="rounded-full flex items-center justify-center"
          style={{ width: 80, height: 80, background: "rgba(0,0,0,0.45)", boxShadow: "inset 0 0 0 3px #fff" }}>
          {p.playing ? <Pause size={34} color="#fff" fill="#fff" /> : <Play size={34} color="#fff" fill="#fff" style={{ marginLeft: 4 }} />}
        </button>
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
            <div ref={p.barRef} className="relative w-full rounded-full" style={{ height: 6, background: "#4a4a4a" }}>
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
// later ones with a reminder bell); on the right the category tabs and the channel list — the same channels, tab,
// crowns, time shift and "Watching" tag as the TV page. Tapping a channel switches to it here.
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
              <div ref={p.barRef} className="relative w-full rounded-full" style={{ height: 6, background: "#4a4a4a" }}>
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
                style={{ width: 200, height: 56, background: onAir ? "rgba(255,255,255,0.17)" : "rgba(255,255,255,0.08)", border: onAir ? "1px solid #5a5a5a" : "1px solid transparent" }}>
                <span className="truncate w-full" style={{ fontSize: 14, lineHeight: "18px", color: ON_SURFACE }}>{x.title}</span>
                <span className="flex items-center justify-between w-full">
                  <span style={{ fontSize: 12, color: ON_VARIANT }}>{clock(x.start)} - {clock(x.end)}</span>
                  <span className="flex items-center gap-3">
                    {p.ch.timeshift && <img src={iconTimeshiftSmall} alt="Time shift" width={16} height={16} />}
                    {!onAir && <img key={reminded ? `on-${key === rung}` : "off"} src={reminded ? iconBellOn : iconBell} alt={reminded ? "Reminder set" : "Add reminder"} width={16} height={16} className={reminded && key === rung ? "tv-ring" : undefined} />}
                  </span>
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
            <span className="shrink-0" style={{ width: 40 }} />
          </div>
          {/* the tabs fade out at the right edge */}
          <div className="absolute right-0 top-0 bottom-0 pointer-events-none" style={{ width: 56, background: "linear-gradient(270deg, #0d141d 22%, rgba(13,20,29,0))" }} />
        </div>
        <div ref={listRef} className="tv-scroll flex-1 overflow-y-auto pb-8">
          {list.length === 0 && <p className="m-0 p-6 text-center" style={{ fontSize: 14, color: ON_VARIANT }}>No channels here yet</p>}
          {list.map(({ c, i }) => {
            const on = i === p.cur;
            return (
              <button key={`${cat}-${i}`} onClick={() => p.onPick(i)} data-watching={on || undefined} className="w-full flex items-center gap-2 text-left"
                style={{ padding: "16px 16px 16px 12px", background: on ? GLASS_CARD_ON : "transparent" }}>
                <ChannelLogo c={c} size={40} />
                <div className="flex flex-1 flex-col gap-[2px] min-w-0">
                  <span className="truncate" style={{ fontSize: 14, lineHeight: "18px", color: ON_SURFACE }}>{c.program}</span>
                  <div className="flex items-center gap-2 min-w-0">
                    {c.premium && <Crown c={c} size={16} />}
                    <span className="shrink-0 rounded-[4px] px-1 text-center text-white" style={{ minWidth: 28, fontSize: 10, lineHeight: "20px", fontWeight: 600, background: "rgba(214,222,240,0.18)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)" }}>{c.no}</span>
                    <span className="shrink-0" style={{ width: 1, height: 14, background: "#4a4a4a" }} />
                    <span className="truncate" style={{ fontSize: 12, color: ON_VARIANT }}>{c.name}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between shrink-0 self-stretch" style={{ width: on ? 54 : 26 }}>
                  {c.timeshift ? <History size={16} color={ON_VARIANT} /> : <span />}
                  {on && <span className="flex items-center justify-center rounded-[2px]" style={{ height: 16, padding: "0 4px", fontSize: 10, fontWeight: 600, background: "#59d478", color: "#0b2a14" }}>Watching</span>}
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
