import { useEffect, useRef, useState } from "react";
import { Cast, Play, Plus, Check, ChevronRight, Heart, History, MoreVertical, ChevronDown } from "lucide-react";
import iconCrown from "../assets/shorts/crown.svg";
import imgShortsBg from "../assets/home/sports-bg.png";
import imgGolfBg from "../assets/home/golf-bg.png";
import imgGolf1 from "../assets/home/golf-1.png";
import imgGolf2 from "../assets/home/golf-2.png";
import imgGolf3 from "../assets/home/golf-3.png";
import imgNetflix from "../assets/home/netflix-badge.png";
import imgStoreBanner from "../assets/home/store-banner.jpg";
import imgUclBg from "../assets/sport/ucl-bg.jpg";
import lgUcl from "../assets/sport/lg-ucl.png";
import lgPl from "../assets/sport/lg-pl.png";
import lgBundesliga from "../assets/sport/lg-bundesliga.png";
import lgFaCup from "../assets/sport/lg-facup.png";
import lgFrenchOpen from "../assets/sport/lg-frenchopen.png";
import lgRws from "../assets/sport/lg-rws.png";
import iconHeartDark from "../assets/sport/heart.svg";
import iconQaSubscription from "../assets/home/qa-subscription.svg";
import iconQaFaqs from "../assets/home/qa-faqs.svg";
import iconQaRental from "../assets/home/qa-rental.svg";
import iconQaSetting from "../assets/home/qa-setting.svg";
import { CHANNELS as TV_CHANNELS, Crown as TVCrown, ChannelLogo, clock, nowMinutes, scheduleFor, tvStore } from "./TVScreen";
import { PAGE_BG, ON_SURFACE, ON_VARIANT, LIVE, PILL, PILL_RING, CHIP_BG, CHIP_BORDER } from "./theme";

// ─── Home tab (Figma "AIS PLAY / Home / Full Page", node 695:69713) ─────────────────────────────────────────────
// The phone Home screen behind the bottom navigation's Home tab: a full-bleed hero carousel under the header and
// top tabs, then rails (Jump Right Back In, TV Guide, Hot Channel, Live and Upcoming, Top 10, Shorts, AIS Play
// Exclusive). The Figma frame is a wireframe; its slots are filled with the artwork the TV Home already uses.

const BASE = import.meta.env.BASE_URL;
const a = (path: string) => `${BASE}${path}`;
const tag = (name: string) => a(`badges/tag-${name}.png`);
const FONT = "'Open Sans', sans-serif";

interface Slide { title: string; img: string; pos?: string; drop?: number; platform: string; channel: string; live?: boolean; time?: string }
const SLIDES: Slide[] = [
  { title: "Liverpool vs Brentford", img: a("posters_portrait/liver-ben.jpg"), pos: "center top", platform: "monomax", channel: "Channel 501: Monomax1", live: true, time: "20:00 – 22:15" },
  { title: "House of the Dragon", img: a("posters_portrait/House.jpg"), platform: "hbo", channel: "HBO Original · Season 2" },
  { title: "F1: The Movie", img: a("posters_portrait/F1.jpg"), platform: "prime", channel: "Movie · 2 hr 35 min" },
  { title: "John Wick: Chapter 4", img: a("posters_portrait/John.jpg"), platform: "netflix", channel: "Movie · 2 hr 49 min" },
  { title: "Avatar: Fire and Ash", img: a("posters_portrait/avatar.jpg"), platform: "disney", channel: "Movie · 3 hr 12 min" },
];

const CONTINUE = [
  { t: "Young Sherlock S1:E1", img: a("posters/continue/c1.jpg"), plat: "prime", left: 27, pct: 62 },
  { t: "Avengers: Endgame", img: a("posters/continue/c2.jpg"), plat: "disney", left: 48, pct: 70 },
  { t: "Superman", img: a("posters/continue/c3.jpg"), plat: "hbo", left: 35, pct: 55 },
  { t: "All Or Nothing: Brazil National Team", img: a("posters/continue/c4.jpg"), plat: "netflix", left: 18, pct: 80 },
  { t: "Project Hail Mary", img: a("posters/continue/c5.jpg"), plat: "netflix", left: 64, pct: 40 },
];


const UPCOMING = [
  { t: "Liverpool vs Brentford", sub: "Premier League", img: a("posters/upcoming/live.jpg"), live: true },
  { t: "Leipzig vs Gladbach", sub: "Bundesliga", img: a("posters/upcoming/u2.jpg"), badge: "Today 20:30", premium: true },
  { t: "Dortmund vs Hamburg", sub: "Bundesliga", img: a("posters/upcoming/u3.jpg"), badge: "Today 20:30" },
  { t: "Masterchef Thailand", sub: "Season 7", img: a("posters/upcoming/u1.jpg"), badge: "Start in 58:12" },
  { t: "CT14 Eala vs Jovic (R1)", sub: "WTA Tour", img: a("posters/upcoming/u4.png"), badge: "Tomorrow 6:00 PM" },
];

const TOP10 = [
  "posters_portrait/House.jpg", "posters_portrait/John.jpg", "posters_portrait/Venom.jpg", "posters_portrait/avatar.jpg",
  "posters_portrait/debt.jpg", "posters_portrait/F1.jpg", "posters_portrait/topgun_m.jpg", "posters_portrait/legal/l1.jpg",
  "posters_portrait/lotr/r1.jpg", "posters_portrait/lotr/r5.jpg",
].map(a);

const EXCLUSIVE = [
  { img: a("posters_portrait/ex3.jpg"), live: true },
  { img: a("posters_portrait/ex1.jpg") },
  { img: a("posters_portrait/ex2.jpg") },
  { img: a("posters_portrait/ex4.jpg") },
  { img: a("posters_portrait/ex5.jpg") },
];

// ── Home rails added in the Figma redesign (Home file, PLAY:Home_fullPageAfterWatched 1063:111194) ──
// Wireframe slots, filled with the artwork the app already has. tag: the badge on top (New / Top 10 / Soon leaving);
// netflix: the Netflix pill at the bottom left.
type Poster = { img: string; t: string; tag?: string; netflix?: boolean };
const P = (f: string) => a(f);
const POSTERS = ["posters_portrait/House.jpg", "posters_portrait/John.jpg", "posters_portrait/Venom.jpg", "posters_portrait/avatar.jpg",
  "posters_portrait/debt.jpg", "posters_portrait/F1.jpg", "posters_portrait/topgun_m.jpg", "posters_portrait/legal/l1.jpg",
  "posters_portrait/lotr/r1.jpg", "posters_portrait/lotr/r5.jpg", "posters_portrait/ex1.jpg", "posters_portrait/ex2.jpg",
  "posters_portrait/ex4.jpg", "posters_portrait/ex5.jpg"].map(P);
const TITLES = ["House of the Dragon", "John Wick: Chapter 4", "Venom", "Avatar: Fire and Ash", "Squid Game", "F1: The Movie",
  "Top Gun: Maverick", "Legal Eagles", "The Lord of the Rings", "The Return of the King", "Exclusive Series", "Exclusive Live",
  "Exclusive Drama", "Exclusive Show"];
// a rail of 2:3 posters starting at a different poster each time, with badges placed by the pattern given
const posterRail = (from: number, tags: (string | undefined)[], netflix: number[] = []): Poster[] =>
  Array.from({ length: 7 }, (_, k) => {
    const i = (from + k) % POSTERS.length;
    return { img: POSTERS[i], t: TITLES[i], tag: tags[k], netflix: netflix.includes(k) };
  });
const NEW_RELEASE = posterRail(3, [undefined, "New", undefined, "New"]);
const RAY = posterRail(6, [undefined, "Soon leaving"], [0, 3]);
const LOVE = posterRail(1, [undefined, "Soon leaving"], [2]);
const CHILL = posterRail(9, [undefined, "New"], [0]);
const BECAUSE = posterRail(5, [undefined, undefined, "Soon leaving"], [0]);
const FOR_YOU = [7, 0, 4, 8, 2].map(i => ({ img: POSTERS[i], t: TITLES[i] }));
const MY_LIST = [
  { img: P("posters/continue/c2.jpg"), t: "Avengers: Endgame" }, { img: P("posters/continue/c5.jpg"), t: "Project Hail Mary" },
  { img: P("posters/f1.jpg"), t: "F1: The Movie" }, { img: P("posters/continue/c3.jpg"), t: "Superman" },
];
const GOLF = [{ img: imgGolf1, t: "LPGA Lotte Championship", netflix: true }, { img: imgGolf2, t: "Honda LPGA Thailand 2024" }, { img: imgGolf3, t: "BGC Match Play" }];
// pictures without their own title art, so the collection name reads clearly over them
const SEASONAL = [{ img: P("tv-features-test/shorts-assets/love-island.jpg"), t: "Summer Love" }, { img: P("tv-features-test/concert-assets/moment-150.jpg"), t: "Concert Season" }, { img: P("tv-features-test/shorts-assets/volleyball.jpg"), t: "Asian Games 2026" }];
const KARAOKE = [
  { img: P("tv-features-test/concert-assets/moment-010.jpg"), t: "Cool Hits", sub: "Cool Channel", pr: true },
  { img: P("tv-features-test/concert-assets/moment-080.jpg"), t: "Luk Thung Night", sub: "Karaoke" },
  { img: P("tv-features-test/concert-assets/moment-120.jpg"), t: "T-Pop Party", sub: "Karaoke", pr: true },
  { img: P("tv-features-test/concert-assets/moment-150.jpg"), t: "Rock Anthems", sub: "Karaoke" },
  { img: P("tv-features-test/concert-assets/moment-190.jpg"), t: "Love Songs", sub: "Karaoke" },
];
const QUICK = [
  { t: "Manage Subscription", icon: iconQaSubscription }, { t: "FAQs", icon: iconQaFaqs, grow: true },
  { t: "My rental", icon: iconQaRental, w: 119 }, { t: "Setting", icon: iconQaSetting, grow: true },
];
// Hot Channel Program: what's on now on the TV channels that have their own picture
const HOT_PROGRAM = TV_CHANNELS.map((c, i) => ({ c, i })).filter(x => x.c.logo && !x.c.short).slice(0, 8);

// top tabs; "For you" is the Home page, "Sports" the Sport page, the rest are demos for now
const TABS = ["For you", "Sports", "Movie", "News", "Kids", "Games", "Music", "Lifestyle"];
const HERO_FADE = "linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)";
// rail backgrounds (Shorts, featured collection): faded in at the top and out at the bottom
const SHORTS_FADE = "linear-gradient(to bottom, transparent 0%, #000 30%, #000 68%, transparent 100%)";
const GOLF_FADE = "linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%)";
const UCL_FADE = "linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)";

// ─── Sport tab (Figma "AIS PLAY / Sport", node 701:71230) ───
const SPORT_SLIDES: Slide[] = [
  { title: "Man City vs Arsenal", img: a("posters_portrait/ex3.jpg"), platform: "monomax", channel: "Premier League", live: true, time: "20:00 – 22:15" },
  { title: "Liverpool vs Brentford", img: a("posters_portrait/liver-ben.jpg"), pos: "center top", platform: "monomax", channel: "Premier League", live: true, time: "22:30 – 00:30" },
  { title: "Man Utd vs Chelsea", img: a("posters_portrait/ex4.jpg"), platform: "monomax", channel: "Emirates FA Cup", time: "Sat 19:30" },
  { title: "Japan vs Thailand", img: a("tv-features-test/live-stream-assets/football-255.jpg"), platform: "monomax", channel: "Asian Games 2026", live: true, time: "18:00 – 20:00" },
  { title: "F1: The Movie", img: a("posters_portrait/F1.jpg"), platform: "prime", channel: "Movie · 2 hr 35 min" },
];
// ── Sport tab rails (Figma "Sports" file, AIS PLAY: sport_mainFullPage 2544:38144) ──
// League & Tournament: the six logos from Figma, then crest circles for the rest; fav: heart badge
const LEAGUES: { t: string; img?: string; fit?: "cover" | "contain"; white?: boolean; short?: string; bg?: string; fg?: string; fav?: boolean }[] = [
  { t: "UEFA Champion League", img: lgUcl, fav: true },
  { t: "Premier League", img: lgPl, fit: "contain", fav: true },
  { t: "Bundesliga", img: lgBundesliga, fit: "contain", white: true, fav: true },
  { t: "FA Cup", img: lgFaCup, fav: true },
  { t: "French Open", img: lgFrenchOpen },
  { t: "RWS", img: lgRws },
  { t: "NBA", short: "NBA", bg: "linear-gradient(135deg,#1d428a,#c8102e)", fg: "#fff" },
  { t: "PGA Tour", short: "PGA", bg: "linear-gradient(135deg,#0b2341,#1e5aa8)", fg: "#fff" },
  { t: "MotoGP", short: "GP", bg: "linear-gradient(135deg,#d6001c,#1a1a1a)", fg: "#fff" },
];
type Clip = { img: string; t: string; d?: string; live?: boolean };
const LATEST: Clip[] = [
  { img: a("tv-features-test/live-stream-assets/football-180.jpg"), t: "Como vs Man United Highlight", d: "6m" },
  { img: a("posters/SC.jpg"), t: "Timberwolves vs Heat Full Game Highlights", d: "18m" },
  { img: a("tv-features-test/live-stream-assets/football-024.jpg"), t: "Japan vs Thailand Highlight", d: "8m" },
  { img: a("tv-features-test/shorts-assets/volleyball.jpg"), t: "Thailand vs China Volleyball Highlight", d: "12m" },
];
const UCL: Clip[] = [
  { img: a("posters/arsenal.jpg"), t: "Bayern München vs Arsenal", live: true },
  { img: a("posters/upcoming/u2.jpg"), t: "Real Madrid vs RB Leipzig", live: true },
  { img: a("posters/upcoming/u3.jpg"), t: "PSG vs Barcelona", d: "Today 02:00" },
  { img: a("tv-features-test/live-stream-assets/football-109.jpg"), t: "Inter vs Bayern Highlights", d: "6m" },
];
const FOOTBALL_FY: Clip[] = [
  { img: a("tv-features-test/live-stream-assets/football-190.jpg"), t: "Como vs Man United Highlight", d: "6m" },
  { img: a("posters/upcoming/live.jpg"), t: "Paris Saint-Germain vs Barcelona Full Match", d: "95m" },
  { img: a("posters/arsenal.jpg"), t: "Arsenal vs Chelsea Highlight", d: "9m" },
  { img: a("tv-features-test/live-stream-assets/football-255.jpg"), t: "Japan vs Thailand Full Match", d: "92m" },
];
const BASKETBALL_FY: Clip[] = [
  { img: a("posters/SC.jpg"), t: "Timberwolves vs Heat Full Game Highlights", d: "18m" },
  { img: a("posters/upcoming/u4.png"), t: "Warriors vs Lakers Full Game", d: "24m" },
  { img: a("posters/maxresdefault.jpg"), t: "Celtics vs Knicks Highlights", d: "11m" },
];
const MOTORSPORT_FY: Clip[] = [
  { img: a("posters/f1.jpg"), t: "2026 Australian GP Full Race", d: "78m" },
  { img: a("posters_portrait/F1.jpg"), t: "2026 German GP Full Race", d: "84m" },
  { img: a("posters/all.jpg"), t: "Best MotoGP Moments 2026 Japanese GP", d: "6m" },
];
const SPORT_CHIPS = ["All", "Football", "Basketball", "Golf", "Tennis", "Badminton", "Motorsport"];
const DOCUMENTARY = [
  { img: a("posters/maxresdefault.jpg"), pos: "92% center", t: "Sir Alex Ferguson: Never Give In" },
  { img: a("posters/all.jpg"), pos: "22% center", t: "All Or Nothing: Brazil National Team" },
  { img: a("posters_portrait/F1.jpg"), t: "F1: The Movie" },
  { img: a("posters/f1.jpg"), pos: "30% center", t: "Drive to Survive" },
];
// the TV tab's sports channels (TV Guide and Sport Channel rails)
const SPORT_TV = TV_CHANNELS.map((c, i) => ({ c, i })).filter(x => x.c.cats.includes("Sports"));

export interface ShortThumb { img: string; title: string }

export default function HomeScreen({
  topInset, bottom, shorts, onOpenShort, onOpenChannel, onOpenStore, onToast,
}: {
  topInset: string;                      // status bar / safe-area height
  bottom: string;                        // space taken by the bottom navigation
  shorts: ShortThumb[];
  onOpenShort: (index: number) => void;
  onOpenChannel: (index: number) => void;    // plays that TV channel on the TV tab
  onOpenStore: () => void;                   // the Store page
  onToast: (msg: string) => void;
}) {
  const [slide, setSlide] = useState(0);
  const [tab, setTab] = useState("For you");
  const [scrolled, setScrolled] = useState(false);
  // the top tabs stay hidden on the first view and fade in, sliding down from the top, once the page scrolls
  const [showTabs, setShowTabs] = useState(false);
  // titles added to My List from the hero's + button (it turns into a check mark)
  const [myList, setMyList] = useState<Set<string>>(new Set());
  const toggleList = (title: string) => {
    const has = myList.has(title);
    setMyList(prev => { const n = new Set(prev); if (has) n.delete(title); else n.add(title); return n; });
    onToast(has ? "Removed from My List" : "Added to My List");
  };
  const scroller = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const logoRowRef = useRef<HTMLDivElement>(null);
  const playRowRef = useRef<HTMLDivElement>(null);
  // compact header: once the Play button scrolls up to the header, the logo and the tab row give way to a single
  // "⌄ Home" title (Figma "Mobile / Header Detail Page"); tapping it expands the tab row under it again
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Sport tab: the selected sport chip, and whether the chip row is docked inside the header
  const [chip, setChip] = useState("All");
  const onChip = (c: string) => { setChip(c); if (c !== "All") onToast(`${c} (demo)`); };
  const chipsRef = useRef<HTMLDivElement>(null);
  const [chipsDocked, setChipsDocked] = useState(false);
  // docked chips fold into a one-line subtitle (the active filter) while the page keeps scrolling down past the
  // next rail, and expand back into chips as soon as it scrolls up
  const [chipsFolded, setChipsFolded] = useState(false);
  const lastY = useRef(0);
  const dockedAt = useRef(0);

  // the hero carousel moves on every 5s (not while a finger is on it); a swipe moves it at once and restarts the wait
  const [tick, setTick] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);   // px the slides follow the finger, while dragging
  useEffect(() => {
    if (drag !== null) return;
    const n = tab === "Sports" ? SPORT_SLIDES.length : SLIDES.length;
    const t = setTimeout(() => setSlide(s => (s + 1) % n), 5000);
    return () => clearTimeout(t);
  }, [slide, tick, tab, drag]);
  // swipe: a sideways drag (the page keeps vertical scrolls) moves the slides with the finger; letting go past a
  // quarter of the width, or with a quick flick, snaps to the next / previous slide, otherwise back
  const swipe = useRef<{ x: number; y: number; t: number; dir: "x" | "y" | null } | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const onHeroDown = (e: React.PointerEvent) => { swipe.current = { x: e.clientX, y: e.clientY, t: e.timeStamp, dir: null }; };
  const onHeroMove = (e: React.PointerEvent) => {
    const st = swipe.current;
    if (!st) return;
    const dx = e.clientX - st.x, dy = e.clientY - st.y;
    if (!st.dir && Math.hypot(dx, dy) > 8) {
      st.dir = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (st.dir === "x") (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);   // keep following past the edge
    }
    if (st.dir === "x") setDrag(dx);
  };
  const onHeroUp = (e: React.PointerEvent) => {
    const st = swipe.current;
    swipe.current = null;
    if (!st || st.dir !== "x") { setDrag(null); return; }
    const dx = e.clientX - st.x, w = heroRef.current?.offsetWidth ?? 375;
    const flick = Math.abs(dx) / Math.max(1, e.timeStamp - st.t) > 0.5;
    setDrag(null);
    if (Math.abs(dx) > w / 4 || (flick && Math.abs(dx) > 30)) go(dx < 0 ? 1 : -1);
  };
  const go = (d: number) => { const n = tab === "Sports" ? SPORT_SLIDES.length : SLIDES.length; setSlide(s => (s + d + n) % n); setTick(t => t + 1); };

  const demo = (label: string) => onToast(`${label} (demo)`);
  // the tab row shows once the page has scrolled a little; in the compact header only while it's expanded (⌄ tapped)
  const tabsOn = compact ? menuOpen : showTabs;
  // the compact "⌄ Home" title, only while collapsed
  const titleOn = compact && !menuOpen;
  const openedAt = useRef(0);
  useEffect(() => { if (menuOpen) openedAt.current = scroller.current?.scrollTop ?? 0; }, [menuOpen]);
  const pickTab = (t: string) => {
    setMenuOpen(false);
    if (t === "For you" || t === "Sports") {
      setTab(t); setSlide(0); setTick(k => k + 1); scroller.current?.scrollTo({ top: 0 });
      setShowTabs(false); setScrolled(false); setCompact(false); setChipsDocked(false); setChipsFolded(false);
    } else demo(t);
  };
  const slides = tab === "Sports" ? SPORT_SLIDES : SLIDES;
  const s = slides[slide % slides.length];
  const sport = tab === "Sports";

  return (
    <div className="absolute inset-x-0 top-0 z-[15]" style={{ bottom, background: PAGE_BG, fontFamily: FONT }}>
      {/* Header: logo + Cast, then the top tabs. Transparent over the hero, solid once the page scrolls. */}
      <div
        ref={headerRef}
        className="absolute inset-x-0 top-0 z-20 transition-all duration-300"
        style={{
          paddingTop: topInset,
          // scrolled: Figma's "Mobile / Header Detail Page" glass, a dark-to-clear tint over a blur of the page below
          background: scrolled ? "linear-gradient(180deg, rgba(7,14,22,0.6), rgba(118,128,150,0))" : "linear-gradient(180deg, rgba(0,0,0,0.65), rgba(0,0,0,0))",
          backdropFilter: scrolled ? "blur(20px)" : "none", WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        }}
      >
        <div ref={logoRowRef} className="relative flex items-center justify-between px-4" style={{ height: 64 }}>
          <div className="relative flex items-center" style={{ height: 32 }}>
            {/* the app logo, also while the compact header is expanded (tapping it then collapses it again) */}
            <img src={a("badges/logo app/logoapp-cropped.png")} alt="AIS PLAY" onClick={() => { if (compact) setMenuOpen(false); }} className="block transition-all duration-300"
              style={{ height: 24, width: "auto", opacity: titleOn ? 0 : 1, transform: titleOn ? "translateY(-8px)" : "none", pointerEvents: titleOn ? "none" : "auto" }} />
            <button onClick={() => { setChipsFolded(false); setMenuOpen(true); }} aria-expanded={menuOpen} aria-label={`${tab}: show sections`}
              className="absolute left-0 top-1/2 flex items-center gap-2 transition-all duration-300 whitespace-nowrap"
              style={{ opacity: titleOn ? 1 : 0, transform: `translateY(${titleOn ? "-50%" : "calc(-50% + 8px)"})`, pointerEvents: titleOn ? "auto" : "none" }}>
              <span className="w-8 h-8 flex items-center justify-center"><ChevronDown size={20} className="text-white" /></span>
              <span style={{ fontSize: 20, fontWeight: 600, color: ON_SURFACE }}>{tab}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => demo("Cast")} aria-label="Cast" className="w-8 h-8 rounded-full flex items-center justify-center"><Cast size={24} className="text-white" /></button>
          </div>
        </div>
        {/* pulled up 17px: 26px between the bottom of the logo and the top of the tab text */}
        {/* eight tabs: the row scrolls sideways */}
        <div className="home-rail flex gap-2 px-4 overflow-x-auto overflow-y-hidden" style={{
          marginTop: compact && !menuOpen ? 0 : -17, maxHeight: compact && !menuOpen ? 0 : 60,
          opacity: tabsOn ? 1 : 0, transform: tabsOn ? "translateY(0)" : "translateY(-12px)",
          transition: "opacity .3s ease, transform .3s cubic-bezier(.2,0,0,1), max-height .3s cubic-bezier(.2,0,0,1), margin-top .3s cubic-bezier(.2,0,0,1)",
          pointerEvents: tabsOn ? "auto" : "none",
        }}>
          {TABS.map(t => (
            <button key={t} onClick={() => pickTab(t)} className="relative shrink-0 flex flex-col items-center px-2 pt-3 pb-[8px]">
              <span className="whitespace-nowrap" style={{ fontSize: 16, fontWeight: t === tab ? 700 : 400, color: t === tab ? "#fff" : ON_SURFACE }}>{t}</span>
              {t === tab && <span className="absolute left-2 right-2 bottom-0 h-[3px] rounded-[1.5px] bg-white" />}
            </button>
          ))}
        </div>
        {/* docked chips: 16px under the tab row when that's expanded, 4px under the compact title otherwise */}
        {sport && chipsDocked && (
          <div className="relative overflow-hidden" style={{
            // chips: 40px row + padding; folded: a 20px subtitle line
            // folded, it's pulled up into the title row's bottom space so the subtitle sits right under "Sports"
            height: chipsFolded && !tabsOn ? 28 : (tabsOn ? 16 : 4) + 40 + 12,
            marginTop: chipsFolded && !tabsOn ? -8 : 0,
            transition: "height .3s cubic-bezier(.2,0,0,1), margin-top .3s cubic-bezier(.2,0,0,1)",
          }}>
            <div className="absolute inset-x-0 top-0 pb-3 transition-all duration-300" style={{
              paddingTop: tabsOn ? 16 : 4,
              opacity: chipsFolded && !tabsOn ? 0 : 1, transform: chipsFolded && !tabsOn ? "translateY(-12px)" : "none",
              pointerEvents: chipsFolded && !tabsOn ? "none" : "auto",
            }}><SportChips chip={chip} onPick={onChip} /></div>
            {/* subtitle under the "⌄ Sport" title, lined up with its text; tapping it brings the chips back; the title's ⌄ expands both tabs and chips */}
            <button onClick={() => setChipsFolded(false)} aria-label="Show sport filters"
              className="absolute top-0 flex items-center transition-all duration-300 whitespace-nowrap"
              style={{
                left: 56, height: 20, fontSize: 14, color: ON_VARIANT,
                opacity: chipsFolded && !tabsOn ? 1 : 0, transform: chipsFolded && !tabsOn ? "none" : "translateY(8px)",
                pointerEvents: chipsFolded && !tabsOn ? "auto" : "none",
              }}>
              {chip === "All" ? "All sports" : chip}
            </button>
          </div>
        )}
      </div>

      <div
        ref={scroller}
        className="absolute inset-0 overflow-y-auto overflow-x-hidden home-scroll"
        onScroll={e => {
          const y = e.currentTarget.scrollTop;
          setShowTabs(y > 24);
          // glass header once the hero title comes within 130px of the header's bottom edge
          const h = headerRef.current?.getBoundingClientRect(), t = titleRef.current?.getBoundingClientRect();
          setScrolled(!!h && !!t && y > 0 && t.top - h.bottom <= 130);
          const l = logoRowRef.current?.getBoundingClientRect(), p = playRowRef.current?.getBoundingClientRect();
          const c = !!l && !!p && y > 0 && p.top <= l.bottom;
          setCompact(c);
          const cr = chipsRef.current?.getBoundingClientRect();
          const docked = !!l && !!cr && y > 0 && cr.top <= l.bottom;
          if (docked && !chipsDocked) dockedAt.current = y;
          setChipsDocked(docked);
          // fold once scrolling down has carried the next rail (Sport Reel) a little way under the docked chips;
          // any upward scroll unfolds them again
          const dy = y - lastY.current;
          lastY.current = y;
          if (!docked) setChipsFolded(false);
          else if (dy > 2 && y - dockedAt.current > 48) setChipsFolded(true);
          else if (dy < -2) setChipsFolded(false);
          // the expanded header folds back up once the page moves on
          if (!c || Math.abs(y - openedAt.current) > 40) setMenuOpen(false);
        }}
      >
        {/* Hero */}
        <div
          ref={heroRef}
          className="relative w-full overflow-hidden"
          // pan-y: vertical drags scroll the page, sideways ones are the carousel's
          style={{ height: 647, touchAction: "pan-y" }}
          onPointerDown={onHeroDown} onPointerMove={onHeroMove} onPointerUp={onHeroUp} onPointerCancel={onHeroUp}
        >
          {/* artwork and its scrim fade out with a mask (not a colour), so the hero blends into any page background */}
          <div className="absolute inset-0 pointer-events-none" style={{ WebkitMaskImage: HERO_FADE, maskImage: HERO_FADE }}>
          {slides.map((sl, i) => {
            // where this slide sits relative to the one showing (−1 left, 0 showing, +1 right, wrapping round); the
            // slides slide across, following the finger while dragging. One wrapping round the far side jumps
            // without animating.
            const n = slides.length, r = ((i - slide + n + Math.floor(n / 2)) % n) - Math.floor(n / 2);
            return (
              // drop: art with its key graphics right at the top starts this much lower, fading in from the page colour
              <img key={tab + sl.title} src={sl.img} alt="" draggable={false}
                className="absolute inset-x-0 bottom-0 w-full object-cover"
                style={{
                  objectPosition: sl.pos ?? "center", top: sl.drop ?? 0, height: `calc(100% - ${sl.drop ?? 0}px)`,
                  transform: `translateX(calc(${r * 100}% + ${drag ?? 0}px))`, visibility: Math.abs(r) > 1 ? "hidden" : "visible",
                  transition: drag !== null || Math.abs(r) > 1 ? "none" : "transform .45s cubic-bezier(.2,0,0,1)",
                  ...(sl.drop ? { WebkitMaskImage: "linear-gradient(180deg, transparent, #000 48px)", maskImage: "linear-gradient(180deg, transparent, #000 48px)" } : {}),
                }} />
            );
          })}
          {/* dark scrim behind the title and buttons for contrast */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.6) 75%)" }} />
          </div>
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 py-2" style={{ gap: sport ? 20 : 26, paddingLeft: sport ? 16 : 24, paddingRight: sport ? 16 : 24 }}>
            {sport ? (
              <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center gap-2">
                  <h2 ref={titleRef} className="flex-1 text-white m-0" style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, textShadow: "0 2px 10px rgba(0,0,0,.5)" }}>{s.title}</h2>
                  <button onClick={() => demo("More")} aria-label="More" className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ border: "1px solid rgba(255,255,255,0.6)" }}>
                    <MoreVertical size={18} className="text-white" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <img src={tag(s.platform)} alt={s.platform} className="block object-contain" style={{ width: 45, height: 30, borderRadius: 6 }} />
                  {s.live && <LivePill size={1.5} />}
                  {s.time && <span className="flex items-center rounded-full px-3" style={{ height: 26, fontSize: 12, color: ON_SURFACE, border: "1px solid rgba(255,255,255,0.5)" }}>{s.time}</span>}
                </div>
              </div>
            ) : (
            <div className="flex flex-col items-center gap-2 w-full">
                <h2 ref={titleRef} className="text-white text-center m-0" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.15, textShadow: "0 2px 10px rgba(0,0,0,.5)" }}>{s.title}</h2>
                <div className="flex items-center gap-[9px]">
                  <img src={tag(s.platform)} alt={s.platform} className="block object-contain" style={{ width: 30, height: 20, borderRadius: 6 }} />
                  <span style={{ fontSize: 11, color: ON_SURFACE }}>{s.channel}</span>
                </div>
                {(s.live || s.time) && (
                  <div className="flex items-center gap-[9px]">
                    {s.live && <LivePill />}
                    {s.time && <span className="flex items-center rounded-[10px] px-[7px]" style={{ height: 20, fontSize: 11, color: ON_SURFACE, background: "rgba(255,255,255,0.12)" }}>{s.time}</span>}
                  </div>
                )}
              </div>
            )}
            <div ref={playRowRef} className="flex items-center gap-4 w-full">
              <button onClick={() => demo(s.live ? "Watch live" : "Play")} className="flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2" style={{ background: "#f0f0f0", height: 44 }}>
                <Play size={20} fill="#282828" stroke="#282828" />
                <span style={{ fontSize: 16, fontWeight: 600, color: "#282828" }}>{s.live ? "Watch Live" : "Play"}</span>
              </button>
              <button onClick={() => toggleList(s.title)} aria-label={myList.has(s.title) ? "Remove from My List" : "Add to My List"} aria-pressed={myList.has(s.title)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ border: "1.5px solid rgba(255,255,255,0.85)" }}>
                {myList.has(s.title) ? <Check size={22} className="text-white" /> : <Plus size={22} className="text-white" />}
              </button>
            </div>
            <div className="flex items-center gap-[6px] pb-1">
              {slides.map((_, i) => (
                <button key={i} aria-label={`Slide ${i + 1}`} onClick={() => { setSlide(i); setTick(t => t + 1); }}
                  className="rounded-full transition-all duration-300"
                  style={{ height: 8, width: i === slide ? 22 : 8, background: i === slide ? "#e6e6e6" : "rgba(255,255,255,0.35)" }} />
              ))}
            </div>
          </div>
        </div>

        {sport ? <SportRails demo={demo} chip={chip} onChip={onChip} chipsRef={chipsRef} chipsDocked={chipsDocked} shorts={shorts} onOpenShort={onOpenShort} onOpenChannel={onOpenChannel} onOpenStore={onOpenStore} /> : (
        <div className="flex flex-col gap-6 pt-6">
          {/* Continue Watching */}
          <Rail title="Continue Watching">
            {CONTINUE.map(c => (
              <button key={c.t} onClick={() => demo(c.t)} className="flex flex-col gap-2 text-left shrink-0" style={{ width: 200 }}>
                <div className="relative overflow-hidden rounded-[12px]" style={{ height: 112 }}>
                  <img src={c.img} alt="" className="w-full h-full object-cover" />
                  <img src={tag(c.plat)} alt={c.plat} className="absolute left-2 bottom-[14px] object-contain" style={{ width: 30, height: 20, borderRadius: 6 }} />
                  <div className="absolute inset-x-0 bottom-0 h-[6px]" style={{ background: "#4a4a4a" }}>
                    <div className="h-full" style={{ width: `${c.pct}%`, background: "#f44735" }} />
                  </div>
                </div>
                <div className="flex flex-col gap-[2px]">
                  <span className="truncate" style={{ fontSize: 16, color: ON_SURFACE }}>{c.t}</span>
                  <span style={{ fontSize: 12, color: ON_VARIANT }}>{c.left} mins</span>
                </div>
              </button>
            ))}
          </Rail>

          {/* Top 10: 135 x 202 posters over their big outlined numbers */}
          <Rail title="Top 10" gap={12}>
            {TOP10.map((img, i) => (
              <button key={img} onClick={() => demo(`#${i + 1} in Top 10`)} className="relative shrink-0 flex items-end" style={{ height: 202, width: 135 + (i === 9 ? 84 : 46) }}>
                <span className="absolute left-0 select-none" style={{
                  bottom: -4, fontSize: 130, fontWeight: 800, lineHeight: 1, letterSpacing: i === 9 ? -12 : 0,
                  color: "rgba(255,255,255,0.14)", WebkitTextStroke: "1px rgba(255,255,255,0.35)",
                }}>{i + 1}</span>
                <img src={img} alt="" className="absolute right-0 top-0 rounded-[12px] object-cover" style={{ width: 135, height: 202, boxShadow: "0 0 10px rgba(0,0,0,0.6)" }} />
              </button>
            ))}
          </Rail>

          {/* Live and Upcoming */}
          <Rail title="Live and Upcoming" gap={16}>
            {UPCOMING.map(u => (
              <button key={u.t} onClick={() => demo(u.t)} className="flex flex-col gap-1 text-left shrink-0" style={{ width: 200 }}>
                <div className="relative overflow-hidden rounded-[12px]" style={{ height: 112 }}>
                  <img src={u.img} alt="" className="w-full h-full object-cover" />
                  <span className="absolute left-3 top-3">
                    {u.live ? <LivePill /> : <span className="flex items-center rounded-full px-[6px]" style={{ height: 18, fontSize: 11, color: ON_SURFACE, background: "rgba(58,58,58,0.92)" }}>{u.badge}</span>}
                  </span>
                  {u.premium && <img src={iconCrown} alt="Premium" className="absolute left-3 bottom-2" style={{ width: 20, height: 20 }} />}
                </div>
                <span className="truncate" style={{ fontSize: 14, color: ON_SURFACE, fontWeight: 600 }}>{u.t}</span>
                <span style={{ fontSize: 11, color: ON_VARIANT }}>{u.sub}</span>
              </button>
            ))}
          </Rail>

          {/* Hot Channel Program: what's on now on TV channels (same data as the TV tab); tapping plays the channel */}
          <Rail title="Hot Channel Program" gap={16}>
            {HOT_PROGRAM.map(({ c, i }) => {
              const now = nowMinutes(), on = scheduleFor(i).find(p => p.start <= now && now < p.end);
              return (
                <button key={c.no} onClick={() => onOpenChannel(i)} className="flex flex-col gap-1 text-left shrink-0" style={{ width: 200 }}>
                  <div className="relative overflow-hidden rounded-[12px]" style={{ height: 112, background: "#3a3a3a" }}>
                    <img src={c.poster} alt="" className="w-full h-full object-cover" />
                    {c.premium && <span className="absolute left-3 bottom-2"><TVCrown c={c} size={20} /></span>}
                  </div>
                  <span className="truncate" style={{ fontSize: 14, color: ON_SURFACE, fontWeight: 600 }}>{c.program}</span>
                  <span style={{ fontSize: 11, color: ON_VARIANT }}>{on ? `${clock(on.start)}-${clock(on.end)}` : c.name}</span>
                </button>
              );
            })}
          </Rail>

          {/* New release */}
          <Rail title="New release" gap={12}>{NEW_RELEASE.map((p, k) => <PosterCard key={k} p={p} onTap={() => demo(p.t)} />)}</Rail>

          {/* My list */}
          <Rail title="My list" gap={12}>
            {MY_LIST.map(m => (
              <button key={m.t} onClick={() => demo(m.t)} aria-label={m.t} className="shrink-0 overflow-hidden rounded-[12px]" style={{ width: 200, height: 112 }}>
                <img src={m.img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </Rail>

          {/* For you: big 250 x 375 posters */}
          <Rail title="For you" gap={16}>
            {FOR_YOU.map(f => (
              <button key={f.t} onClick={() => demo(f.t)} aria-label={f.t} className="shrink-0 overflow-hidden rounded-[12px]" style={{ width: 250, height: 375 }}>
                <img src={f.img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </Rail>

          {/* Shorts over a full-width picture (opens the Clips tab at that short) */}
          <section className="relative flex flex-col gap-3 pb-5" style={{ paddingTop: 120 }}>
            {/* the picture fades out at the top and bottom with a mask (not a colour), so it blends into any background */}
            <img src={imgShortsBg} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ WebkitMaskImage: SHORTS_FADE, maskImage: SHORTS_FADE }} />
            <div className="relative flex items-center gap-1 px-4">
              <h3 className="m-0" style={{ fontSize: 18, fontWeight: 400, lineHeight: "24px", color: ON_SURFACE }}>Shorts</h3>
              <button onClick={() => onOpenShort(0)} aria-label="More Shorts" className="p-1 rounded-full"><ChevronRight size={16} className="text-white" /></button>
            </div>
            <div className="relative home-rail flex gap-3 overflow-x-auto overflow-y-hidden px-4">
              {shorts.map((sh, i) => <PosterCard key={sh.img} p={{ img: sh.img, t: sh.title, tag: i === 0 ? "New" : i === 1 ? "Top 10" : undefined }} onTap={() => onOpenShort(i)} />)}
              <span className="shrink-0" style={{ width: 4 }} />
            </div>
          </section>

          {/* AIS Play Exclusive */}
          <Rail title="AIS Play Exclusive" gap={16}>
            {EXCLUSIVE.map(e => (
              <button key={e.img} onClick={() => demo("AIS Play Exclusive")} className="relative shrink-0 overflow-hidden rounded-[12px]" style={{ width: 250, height: 375 }}>
                <img src={e.img} alt="" className="w-full h-full object-cover" />
                {e.live && <span className="absolute left-3 top-3"><LivePill /></span>}
              </button>
            ))}
          </Rail>

          {/* Featured collection: title and synopsis over a picture, then its posters */}
          <section className="relative flex flex-col justify-end" style={{ gap: 60, padding: "80px 0 30px" }}>
            <img src={imgGolfBg} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ WebkitMaskImage: GOLF_FADE, maskImage: GOLF_FADE }} />
            <div className="relative flex flex-col gap-3 px-4" style={{ width: 286 }}>
              <h3 className="m-0" style={{ fontSize: 22, fontWeight: 500, lineHeight: "28px", color: "#1c2130" }}>LPGA Golf /<br />Women's Tour</h3>
              <p className="m-0" style={{ fontSize: 12, lineHeight: "16px", letterSpacing: 0.4, color: "#2a3040", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                The best of women's golf: the LPGA Tour's Asian swing, live and on demand, from Bangkok to Hawaii.
              </p>
            </div>
            <div className="relative home-rail flex overflow-x-auto overflow-y-hidden px-4" style={{ gap: 14.4 }}>
              {GOLF.map(g => <PosterCard key={g.t} p={g} onTap={() => demo(g.t)} />)}
              <span className="shrink-0" style={{ width: 16 }} />
            </div>
          </section>

          {/* Genre rails */}
          <Rail title="Ray Macdonald" more onMore={() => demo("Ray Macdonald")} gap={12}>{RAY.map((p, k) => <PosterCard key={k} p={p} onTap={() => demo(p.t)} />)}</Rail>
          <Rail title="We think you'll love this" more onMore={() => demo("We think you'll love this")} gap={12}>{LOVE.map((p, k) => <PosterCard key={k} p={p} onTap={() => demo(p.t)} />)}</Rail>
          <Rail title="ChillZone" more onMore={() => demo("ChillZone")} gap={12}>{CHILL.map((p, k) => <PosterCard key={k} p={p} onTap={() => demo(p.t)} />)}</Rail>
          <Rail title="Because you watch Squid Game" gap={12}>{BECAUSE.map((p, k) => <PosterCard key={k} p={p} onTap={() => demo(p.t)} />)}</Rail>

          {/* Seasonal / collection: big posters with their name over the bottom */}
          <Rail title="" gap={12}>
            {SEASONAL.map(c => (
              <button key={c.t} onClick={() => demo(c.t)} className="relative shrink-0 overflow-hidden rounded-[12px] text-left" style={{ width: 250, height: 375 }}>
                <img src={c.img} alt="" className="w-full h-full object-cover" />
                <span className="absolute inset-x-0 bottom-0" style={{ height: 140, background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.75))" }} />
                <span className="absolute left-6 bottom-12 text-white" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.05, maxWidth: 160 }}>{c.t}</span>
              </button>
            ))}
          </Rail>

          {/* Store (Figma 3026:209018) */}
          <StoreRail onOpen={onOpenStore} />

          {/* Grab the Mic: karaoke, 95px squares */}
          <Rail title="Grab the Mic" gap={12}>
            {KARAOKE.map(k => (
              <button key={k.t} onClick={() => demo(k.t)} className="flex flex-col gap-2 text-left shrink-0" style={{ width: 95 }}>
                <div className="relative overflow-hidden rounded-[8px]" style={{ width: 95, height: 95 }}>
                  <img src={k.img} alt="" className="w-full h-full object-cover" />
                  {k.pr && <img src={iconCrown} alt="Premium" className="absolute left-2 bottom-2" style={{ width: 16, height: 16 }} />}
                </div>
                <div className="flex flex-col">
                  <span className="truncate" style={{ fontSize: 12, fontWeight: 700, color: ON_SURFACE }}>{k.t}</span>
                  <span className="truncate" style={{ fontSize: 10, color: ON_VARIANT }}>{k.sub}</span>
                </div>
              </button>
            ))}
          </Rail>

          {/* Quick access */}
          <section style={{ padding: "30px 16px" }}>
            <div className="flex flex-col items-center gap-6 rounded-[12px] px-4 py-5" style={{ background: "rgba(255,255,255,0.05)" }}>
              <h3 className="m-0" style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.2, letterSpacing: -0.2, color: ON_SURFACE, textShadow: "0 4px 4px rgba(0,0,0,0.4)" }}>Quick access</h3>
              <div className="flex flex-wrap gap-3 w-full">
                {QUICK.map(q => (
                  <button key={q.t} onClick={() => demo(q.t)} className={`flex items-center justify-center gap-2 rounded-full px-[14px] py-[6px] ${q.grow ? "flex-1" : "shrink-0"}`}
                    style={{ minHeight: 40, minWidth: 100, width: q.w, border: "1px solid rgba(185,185,185,0.5)" }}>
                    <img src={q.icon} alt="" width={20} height={20} />
                    <span className="whitespace-nowrap" style={{ fontSize: 14, fontWeight: 500, color: "#b9b9b9" }}>{q.t}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
        )}
      </div>
      <style>{`
        /* provider tag logos: a rounded square in the logo's own colour (channel logos stay round) */
        img[src*="badges/tag-"]{border-radius:6px !important;}
        img[src*="badges/tag-netflix"], img[src*="badges/tag-hbo"]{background:#000 !important;}
        img[src*="badges/tag-prime"]{background:#1a98ff !important;}
        img[src*="badges/tag-disney"]{background:#042437 !important;}
        img[src*="badges/tag-viu"]{background:#ffbf00 !important;}
        img[src*="badges/tag-monomax"]{background:#fff !important;}
        .home-scroll{scrollbar-width:none}.home-scroll::-webkit-scrollbar,.home-rail::-webkit-scrollbar{display:none}.home-rail{scrollbar-width:none}`}</style>
    </div>
  );
}

function SportChips({ chip, onPick }: { chip: string; onPick: (c: string) => void }) {
  return <FilterChips items={SPORT_CHIPS} chip={chip} onPick={onPick} />;
}

// filter chips (Sport tab, and the TV sub-pages' sub filters): frosted glass when selected
export function FilterChips({ items, chip, onPick }: { items: string[]; chip: string; onPick: (c: string) => void }) {
  return (
    <div className="home-rail flex gap-2 overflow-x-auto overflow-y-hidden px-4" style={{ scrollbarWidth: "none" }}>
      {items.map(c => (
        <button key={c} onClick={() => onPick(c)}
          className="shrink-0 rounded-[8px] px-3" style={{
            height: 40, fontSize: 14,
            // selected: the TV's frosted grey-blue glass; idle: its chip fill and border
            background: c === chip ? PILL : CHIP_BG, color: c === chip ? "#fff" : ON_SURFACE, fontWeight: c === chip ? 600 : 400,
            boxShadow: c === chip ? PILL_RING : "none", border: c === chip ? "none" : `1px solid ${CHIP_BORDER}`,
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", textShadow: c === chip ? "0 1px 3px rgba(0,0,0,.35)" : "none",
          }}>{c}</button>
      ))}
      <span className="shrink-0" style={{ width: 4 }} />
    </div>
  );
}

function SportRails({ demo, chip, onChip, chipsRef, chipsDocked, shorts, onOpenShort, onOpenChannel, onOpenStore }: {
  demo: (label: string) => void; chip: string; onChip: (c: string) => void;
  chipsRef: React.RefObject<HTMLDivElement>; chipsDocked: boolean;
  shorts: ShortThumb[]; onOpenShort: (i: number) => void; onOpenChannel: (i: number) => void; onOpenStore: () => void;
}) {
  const [favs, setFavs] = useState(() => new Set(LEAGUES.filter(l => l.fav).map(l => l.t)));
  const now = nowMinutes();
  return (
    <div className="flex flex-col gap-6 pt-6 pb-[60px]">
      {/* Sport filter chips, right under the hero. Once the page scrolls up to them they dock inside the header's
          glass (HomeScreen draws that copy); this one keeps its place in the page, hidden meanwhile. */}
      <div ref={chipsRef} style={{ visibility: chipsDocked ? "hidden" : "visible" }}>
        <SportChips chip={chip} onPick={onChip} />
      </div>

      {/* League & Tournament: 80px logos, a heart badge on favourites */}
      <Rail title="League & Tournament" gap={8}>
        {LEAGUES.map(l => (
          <div key={l.t} className="flex flex-col items-center gap-3 shrink-0" style={{ width: 96 }}>
            <button onClick={() => demo(l.t)} aria-label={l.t} className="relative rounded-full" style={{ width: 80, height: 80 }}>
              <span className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center" style={{ background: l.white ? "#fff" : l.bg ?? "#2a2a2a" }}>
                {l.img
                  ? <img src={l.img} alt="" className="w-full h-full" style={{ objectFit: l.fit ?? "cover", padding: l.fit === "contain" && l.white ? 8 : 0 }} />
                  : <span style={{ color: l.fg, fontSize: 20, fontWeight: 800 }}>{l.short}</span>}
              </span>
              {favs.has(l.t) && (
                <span role="button" aria-label={`Remove ${l.t} from favourites`} onClick={e => { e.stopPropagation(); setFavs(f => { const n = new Set(f); n.delete(l.t); return n; }); }}
                  className="absolute flex items-center justify-center rounded-full bg-white" style={{ left: 56, top: 56, width: 32, height: 32 }}>
                  <img src={iconHeartDark} alt="" width={24} height={24} />
                </span>
              )}
            </button>
            <span className="text-center overflow-hidden" style={{ fontSize: 12, lineHeight: "16px", letterSpacing: 0.4, color: ON_SURFACE, height: 48, width: 96 }}>{l.t}</span>
          </div>
        ))}
      </Rail>

      {/* Lastest Highlight */}
      <Rail title="Lastest Highlight" gap={12}>{LATEST.map(c => <ClipCard key={c.t} c={c} onTap={() => demo(c.t)} />)}</Rail>

      {/* TV Guide: the TV tab's sports channels, two rows that scroll together; tapping plays the channel */}
      <Rail title="TV Guide" more onMore={() => demo("TV Guide")} gap={16}>
        {Array.from({ length: Math.ceil(SPORT_TV.length / 2) }, (_, col) => SPORT_TV.slice(col * 2, col * 2 + 2)).map((pair, ci) => (
          <div key={ci} className="flex flex-col gap-4 shrink-0">
            {pair.map(({ c, i }) => {
              const sched = scheduleFor(i), k = sched.findIndex(p => p.start <= now && now < p.end), on = sched[k], next = sched[k + 1];
              const pct = on ? ((now - on.start) / (on.end - on.start)) * 100 : 0;
              return (
                // overflow hidden + fixed widths all the way down: iOS Safari lets text in a <button> grow past its
                // width otherwise, pushing the title out of the card
                <button key={c.no} onClick={() => onOpenChannel(i)} className="relative text-left rounded-[12px] shrink-0 flex flex-col justify-between p-3 overflow-hidden"
                  style={{ width: 300, minWidth: 300, maxWidth: 300, height: 94, background: "linear-gradient(180deg, rgba(161,161,161,.25), rgba(65,65,65,.25))" }}>
                  <div className="flex items-start gap-2 w-full min-w-0">
                    <ChannelLogo c={c} size={32} />
                    <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                      <span className="block w-full truncate text-white" style={{ fontSize: 14, fontWeight: 600 }}>{c.program}</span>
                      <span className="block w-full truncate text-white" style={{ fontSize: 11 }}>{on ? `Started at ${clock(on.start)}` : c.name}</span>
                    </div>
                    {c.timeshift && <History size={16} className="text-white shrink-0" />}
                    {tvStore.favs.has(i) && <Heart size={16} fill="#fff" className="text-white shrink-0" />}
                  </div>
                  <div className="h-[6px] w-full rounded-[24px] overflow-hidden" style={{ background: "rgba(255,255,255,0.4)" }}>
                    <div className="h-full rounded-[24px]" style={{ width: `${pct}%`, background: "#f44735" }} />
                  </div>
                  <div className="flex items-baseline gap-[6px] text-white w-full min-w-0">
                    <span className="shrink-0" style={{ fontSize: 10 }}>{next ? clock(next.start) : ""}</span>
                    <span className="truncate min-w-0" style={{ fontSize: 12, fontWeight: 600 }}>Next: {next?.title ?? "—"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </Rail>

      {/* UEFA Champion League, over the competition's picture (masked so it blends into any background) */}
      <section className="relative flex flex-col gap-3 pb-6" style={{ paddingTop: 60 }}>
        {/* cropped as in Figma (zoomed in on the trophy), the mask on a wrapper so it fades at the section's edges */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ WebkitMaskImage: UCL_FADE, maskImage: UCL_FADE }}>
          <img src={imgUclBg} alt="" className="absolute max-w-none" style={{ width: "223.38%", height: "181.92%", left: "-83.73%", top: "-39.16%", objectFit: "cover" }} />
        </div>
        <div className="relative flex items-center gap-1 px-4">
          <h3 className="m-0" style={{ fontSize: 18, fontWeight: 400, lineHeight: "24px", color: ON_SURFACE, textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>UEFA Champion League</h3>
          <button onClick={() => demo("UEFA Champion League")} aria-label="More UEFA Champion League" className="p-1 rounded-full"><ChevronRight size={16} className="text-white" /></button>
        </div>
        <div className="relative home-rail flex gap-3 overflow-x-auto overflow-y-hidden px-4">
          {UCL.map(c => <ClipCard key={c.t} c={c} onTap={() => demo(c.t)} />)}
          <span className="shrink-0" style={{ width: 4 }} />
        </div>
      </section>

      <Rail title="Football For You" more onMore={() => demo("Football For You")} gap={12}>{FOOTBALL_FY.map(c => <ClipCard key={c.t} c={c} onTap={() => demo(c.t)} />)}</Rail>
      <Rail title="Basketball For You" more onMore={() => demo("Basketball For You")} gap={12}>{BASKETBALL_FY.map(c => <ClipCard key={c.t} c={c} onTap={() => demo(c.t)} />)}</Rail>
      <Rail title="Motorsport For You" more onMore={() => demo("Motorsport For You")} gap={12}>{MOTORSPORT_FY.map(c => <ClipCard key={c.t} c={c} onTap={() => demo(c.t)} />)}</Rail>

      {/* Short highlights: 320 x 202 cards with their title over the picture (opens the Clips tab at that short) */}
      <Rail title="" gap={12}>
        {shorts.map((sh, i) => (
          <button key={sh.img} onClick={() => onOpenShort(i)} className="relative shrink-0 overflow-hidden rounded-[12px] text-left" style={{ width: 320, height: 202 }}>
            <img src={sh.img} alt="" className="w-full h-full object-cover" />
            <span className="absolute inset-x-0 bottom-0" style={{ height: 110, background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.75))" }} />
            <span className="absolute left-3 right-3 bottom-4 text-white truncate" style={{ fontSize: 22, lineHeight: 1.2 }}>{sh.title}</span>
          </button>
        ))}
      </Rail>

      {/* Documentary: 135 x 202 posters */}
      <Rail title="Documentary" more onMore={() => demo("Documentary")} gap={12}>
        {DOCUMENTARY.map(d => (
          <button key={d.t} onClick={() => demo(d.t)} aria-label={d.t} className="relative shrink-0 overflow-hidden rounded-[12px]" style={{ width: 135, height: 202 }}>
            <img src={d.img} alt="" className="w-full h-full object-cover" style={{ objectPosition: d.pos ?? "center" }} />
          </button>
        ))}
      </Rail>

      {/* Sport Channel: the TV tab's sports channels; tapping plays the channel */}
      <Rail title="Sport Channel" gap={16}>
        {SPORT_TV.map(({ c, i }) => (
          <button key={c.no} onClick={() => onOpenChannel(i)} aria-label={`${c.name}, channel ${c.no}`} className="relative shrink-0 rounded-full" style={{ width: 80, height: 80 }}>
            <ChannelLogo c={c} size={80} />
          </button>
        ))}
      </Rail>

      {/* Store, as on For you */}
      <StoreRail onOpen={onOpenStore} />
    </div>
  );
}

// a 16:9 sport clip (200 x 112): LIVE badge at the top left, its length at the bottom right, title up to two lines
function ClipCard({ c, onTap }: { c: Clip; onTap: () => void }) {
  return (
    <button onClick={onTap} className="flex flex-col gap-1 text-left shrink-0" style={{ width: 200 }}>
      <div className="relative overflow-hidden rounded-[12px]" style={{ height: 112, background: "#3a3a3a" }}>
        <img src={c.img} alt="" className="w-full h-full object-cover" />
        {c.live && <span className="absolute left-3 top-3"><LivePill /></span>}
        {c.d && <span className="absolute right-[22px] bottom-[10px] rounded-[14px] px-2" style={{ fontSize: 14, fontWeight: 500, color: ON_SURFACE, background: "rgba(58,58,58,0.92)" }}>{c.d}</span>}
      </div>
      <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.15, color: ON_SURFACE, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.t}</span>
    </button>
  );
}

// Store (Figma 3026:209018): a full-width PLAY banner with Explore Package over it (For you and Sports)
// Store › and Explore Package open the Store page
function StoreRail({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-1 px-4">
        <h3 className="m-0" style={{ fontSize: 18, fontWeight: 400, lineHeight: "24px", color: ON_SURFACE }}>Store</h3>
        <button onClick={onOpen} aria-label="Open Store" className="p-1 rounded-full"><ChevronRight size={20} className="text-white" /></button>
      </div>
      <div className="relative w-full overflow-hidden" style={{ height: 112, background: "#3a3a3a" }}>
        {/* the banner art, cropped as in Figma (zoomed so the PLAY logo and partner logos fill the strip) */}
        <img src={imgStoreBanner} alt="" className="absolute max-w-none" style={{ width: "106.65%", height: "200.86%", left: "-3.33%", top: "-44.17%", objectFit: "cover" }} />
        <button onClick={onOpen} className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center rounded-[10px]"
          style={{ top: 40, width: 300, maxWidth: "calc(100% - 32px)", minHeight: 48, background: "#f0f0f0", boxShadow: "0 4px 4px rgba(0,0,0,0.2)" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#282828" }}>Explore Package</span>
        </button>
      </div>
    </section>
  );
}

// a 135 x 202 poster: optional badge on top (New / Top 10 / Soon leaving) and the Netflix pill at the bottom left
function PosterCard({ p, onTap }: { p: Poster; onTap: () => void }) {
  return (
    <button onClick={onTap} aria-label={p.t} className="relative shrink-0 overflow-hidden rounded-[12px]" style={{ width: 135, height: 202, background: "#3a3a3a" }}>
      <img src={p.img} alt="" className="w-full h-full object-cover" />
      {p.tag && (
        // "Soon leaving" sits centred at the top; the others at the top left
        <span className="absolute top-[7px] whitespace-nowrap rounded-full px-2" style={{ fontSize: 12, lineHeight: "18px", fontWeight: 500, color: ON_SURFACE, background: "rgba(58,58,58,0.92)", ...(p.tag === "Soon leaving" ? { left: "50%", transform: "translateX(-50%)" } : { left: 8 }) }}>{p.tag}</span>
      )}
      {p.netflix && <img src={imgNetflix} alt="Netflix" className="absolute left-4 bottom-4 rounded-full object-cover" style={{ width: 35, height: 17 }} />}
    </button>
  );
}

function LivePill({ big, size }: { big?: boolean; size?: number }) {
  const k = size ?? (big ? 2 : 1);
  return (
    <span className="inline-flex items-center rounded-full text-white" style={{ background: LIVE, height: 18 * k, gap: 4 * k, padding: `0 ${6 * k}px`, fontSize: 11 * k, fontWeight: 600 }}>
      <span className="rounded-full bg-white" style={{ width: 6 * k, height: 6 * k }} />LIVE
    </span>
  );
}

function Rail({ title, more, onMore, gap = 12, padBottom = 0, children }: {
  title: string; more?: boolean; onMore?: () => void; gap?: number; padBottom?: number; children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      {title && <div className="flex items-center gap-1 px-4">
        <h3 className="m-0" style={{ fontSize: 18, fontWeight: 500, color: ON_SURFACE }}>{title}</h3>
        {more && <button onClick={onMore} aria-label={`More ${title}`} className="p-1 rounded-full"><ChevronRight size={16} className="text-white" /></button>}
      </div>}
      {/* overflow-y hidden: rails scroll sideways only, so an up/down swipe over one scrolls the page */}
      <div className="home-rail flex overflow-x-auto overflow-y-hidden px-4" style={{ gap, paddingBottom: padBottom, scrollPaddingLeft: 16 }}>
        {children}
        <span className="shrink-0" style={{ width: 4 }} />
      </div>
    </section>
  );
}
