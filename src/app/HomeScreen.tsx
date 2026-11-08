import { useEffect, useRef, useState } from "react";
import { Cast, Play, Plus, Check, ChevronRight, Heart, History, MoreVertical, ChevronDown, Download } from "lucide-react";
import iconHeartGrey from "../assets/home/heart.svg";
import imgDisneyBg from "../assets/movie/disney-bg.jpg";
import imgDolby from "../assets/movie/dolby.png";
import imgMovieJump1 from "../assets/movie/jump-1.png";
import imgMovieJump2 from "../assets/movie/jump-2.jpg";
import imgMovieList1 from "../assets/movie/list-1.jpg";
import imgMovieList2 from "../assets/movie/list-2.jpg";
import iconMovieMore from "../assets/movie/more.svg";
import iconMoviePlay from "../assets/movie/play.svg";
import iconCrown from "../assets/home/crown.svg";
import imgShortsBg from "../assets/home/sports-bg.png";
import imgFeaturedBg from "../assets/home/featured-bg.jpg";
import imgFeatured1 from "../assets/home/featured-1.jpg";
import imgFeatured2 from "../assets/home/featured-2.jpg";
import imgFeatured3 from "../assets/home/featured-3.jpg";
import imgChooseEntertainment from "../assets/home/choose-entertainment.jpg";
import imgChooseSport from "../assets/home/choose-sport.jpg";
import imgChooseLiveTv from "../assets/home/choose-livetv.jpg";
import imgChooseBanner from "../assets/home/choose-banner.png";
import imgTop1 from "../assets/home/top-1.svg";
import imgTop2 from "../assets/home/top-2.svg";
import imgTop3 from "../assets/home/top-3.svg";
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
import { CATALOG as C, RAILS as R, CONTINUE_LIST, FOR_YOU_LIST, RENT_LIST, MY_RENTAL_LIST, LEAVING_LIST, SPORT_LIVE_LIST, SHORT_DRAMAS } from "./catalog";
import { BAND_FADE, PAGE_BG, ON_SURFACE, ON_VARIANT, LIVE, PILL, PILL_RING, CHIP_BG, CHIP_BORDER } from "./theme";
import { rules } from "./mobileRules";

// ─── Home tab (Figma "AIS PLAY / Home / Full Page", node 695:69713) ─────────────────────────────────────────────
// The phone Home screen behind the bottom navigation's Home tab: a full-bleed hero carousel under the header and
// top tabs, then rails (Jump Right Back In, TV Guide, Hot Channel, Live and Upcoming, Top 10, Shorts, AIS Play
// Exclusive). The Figma frame is a wireframe; its slots are filled with the artwork the TV Home already uses.

const BASE = import.meta.env.BASE_URL;
const a = (path: string) => `${BASE}${path}`;
// the platform tag; AIS PLAY's own titles carry its logo
const tag = (name: string) => name === "ais" ? a("badges/logo app/logoapp-cropped.png") : a(`badges/tag-${name}.png`);
const FONT = "'Open Sans', sans-serif";
// titles and their artwork (catalog.ts, from the TV prototype): poster 2:3, wide 16:9, each falling back on the other
const poster = (k: string) => a(C[k].p ?? C[k].w ?? "");
const wide = (k: string) => a(C[k].w ?? C[k].p ?? "");
type RailEntry = string | { k: string; badge?: string };
const keyOf = (x: RailEntry) => typeof x === "string" ? x : x.k;
const stills = (rail: string, n: number) => a(`posters/sport/sportMainPage_${rail}_No${n}.webp`);

interface Slide { title: string; img: string; pos?: string; drop?: number; platform: string; channel: string; live?: boolean; time?: string; genre?: string; year?: string; dur?: string; rate?: string; q?: string }
const SLIDES: Slide[] = [
  { title: "Liverpool vs Brentford", img: a("posters_portrait/liver-ben.jpg"), pos: "center top", platform: "monomax", channel: "Channel 501: Monomax1", live: true, time: "20:00 – 22:15" },
  { title: "House of the Dragon", img: a("posters_portrait/House.jpg"), platform: "hbo", channel: "HBO Original · Season 2" },
  { title: "F1: The Movie", img: a("posters_portrait/F1.jpg"), platform: "prime", channel: "Movie · 2 hr 35 min" },
  { title: "John Wick: Chapter 4", img: a("posters_portrait/John.jpg"), platform: "netflix", channel: "Movie · 2 hr 49 min" },
  { title: "Avatar: Fire and Ash", img: a("posters_portrait/avatar.jpg"), platform: "disney", channel: "Movie · 3 hr 17 min" },
];

const CONTINUE = CONTINUE_LIST.slice(0, 6).map(c => ({ t: C[c.k].t + (c.s ? ` S${c.s}:E${c.e}` : ""), img: wide(c.k), plat: C[c.k].plat ?? "monomax", left: c.of - c.w, pct: Math.round(c.w / c.of * 100) }));


const UPCOMING = [
  { t: "Liverpool vs Brentford", sub: "Premier League", img: a("posters/upcoming/live.jpg"), live: true },
  { t: "Leipzig vs Gladbach", sub: "Bundesliga", img: a("posters/upcoming/u2.jpg"), badge: "Today 20:30", premium: true },
  { t: "Dortmund vs Hamburg", sub: "Bundesliga", img: a("posters/upcoming/u3.jpg"), badge: "Today 20:30" },
  { t: "MasterChef Thailand", sub: "Season 7", img: a("posters/upcoming/u1.jpg"), badge: "Starts in 58:12" },
  { t: "CT14 Eala vs Jovic (R1)", sub: "WTA Tour", img: a("posters/upcoming/u4.png"), badge: "Tomorrow 6:00 PM" },
];

const TOP10 = R.top10.map(x => poster(x.k));

const EXCLUSIVE: { img: string; pos?: string; live?: boolean; title?: string; price?: string; vat?: string; plat?: string }[] = [
  { img: wide("assanee"), title: C.assanee.t, price: "199 baht", vat: "(VAT Included: 212.93 baht)", plat: C.assanee.plat },
  { img: poster("missuni"), pos: "90% center" },
  { img: poster("sophomores") },
  { img: poster("bossckm") },
  { img: a("posters_portrait/ex3.jpg"), live: true },
];

// ── Home rails added in the Figma redesign (Home file, PLAY:Home_fullPageAfterWatched 1063:111194) ──
// Wireframe slots, filled with the artwork the app already has. tag: the badge on top (New / Top 10 / Leaving Soon);
// netflix: the Netflix pill at the bottom left; k: its catalog key, for its crown (rules.js); plat: an OTT app's logo tag.
type Poster = { img: string; t: string; k?: string; tag?: string; netflix?: boolean; plat?: string };

// a rail of 2:3 posters from the catalog: the Netflix pill on Netflix titles, badges and crowns by position
const posterRail = (list: RailEntry[], tags: Record<number, string> = {}): Poster[] => list.map((x, i) => {
  const k = keyOf(x);
  return { k, img: poster(k), t: C[k].t, tag: (typeof x === "object" ? x.badge : undefined) ?? tags[i], netflix: C[k].plat === "netflix" };
});
const NEW_RELEASE = posterRail(R.hot, { 1: "New" });
const NINETIES = posterRail(["spacejam", "sunrise", "fourweddings"], { 1: "Leaving Soon" });
const LOVE = posterRail(R.love, { 1: "Leaving Soon" });
const DATE_NIGHT = posterRail(R.dateNight, { 1: "New" });
// the rail is the TV prototype's, without the title it is named after
const BECAUSE_LIST = R.because.filter(x => x.k !== "hobbit");
const BECAUSE = posterRail(BECAUSE_LIST, { 2: "Leaving Soon" });
// Fresh episode, every week: posters with the latest episode under them
const FRESH = [["house", 8], ["goodpartner", 5], ["blind", 3], ["vincenzo", 12], ["peacock", 6]].map(([k, ep]) => ({ img: poster(k as string), t: C[k as string].t, ep: `Episode ${ep}` }));
const MY_LIST = R.myList.map(x => ({ img: wide(x.k), t: C[x.k].t }));
const FEATURED = [{ img: imgFeatured1, t: "Masters Tournament: Final Round" }, { img: imgFeatured2, t: "Masters Tournament: Highlights" }, { img: imgFeatured3, t: "Masters Tournament: Featured Groups" }];
// pictures without their own title art, so the collection name reads clearly over them
const SEASONAL = [["summer", "Summer Blockbusters"], ["halloween", "Halloween Night"], ["fantasy", "Fantasy Worlds"], ["action", "Action Collection"], ["racing", "Speed & Racing"]].map(([f, t]) => ({ img: a(`posters_portrait/collection/${f}.jpg`), t }));
const KARAOKE = [["First Love", "Nont Tanont", 7], ["Polaroid", "Unknown Artist", 8], ["Recently Deleted", "Atom", 9], ["Sabai Sabi", "Thongchai McIntyre", 1], ["Mae", "Loso", 2], ["Let It Be", "The Beatles", 4], ["Wanipok", "Carabao", 6]]
  .map(([t, sub, n], i) => ({ img: a(`posters/karaoke/k${n}.jpg`), t: t as string, sub: sub as string, pr: i === 0 || i === 2 }));
// the Figma icon slots hold a placeholder image, so they show the app's own icons
const QUICK = [
  { t: "Manage Subscription", sub: "4 subscriptions", icon: iconQaSubscription },
  { t: "My Rentals", sub: "8 items", icon: iconQaRental },
  { t: "FAQs", sub: "Billing, devices\nhow to watch", icon: iconQaFaqs },
  { t: "Settings", sub: "Manage your\naccount and\npreferences", icon: iconQaSetting },
];
// Choose what you like: three topics as a preview of the interests picker (crops as in Figma)
const CHOOSE: { t: string; img: string; dim: number; fontSize: number; crop: React.CSSProperties }[] = [
  { t: "Entertainment", img: imgChooseEntertainment, dim: 0.5, fontSize: 12, crop: { width: "106.32%", height: "159.47%", left: "-2.52%", top: "-39.75%" } },
  { t: "Sport", img: imgChooseSport, dim: 0.2, fontSize: 14, crop: { width: "149.9%", height: "100%", left: "-39.6%", top: "-0.32%" } },
  { t: "Live TV", img: imgChooseLiveTv, dim: 0.5, fontSize: 14, crop: { width: "100%", height: "100%", left: 0, top: 0, objectFit: "cover" } },
];
// Top 10 numerals: Figma's artwork for 1 to 3 (w: the numeral's width; at: where the poster starts; slot: the item's
// width in the rail). Figma stops at 3, so 4 to 10 are drawn as text in the same size and gradient.
const TOP_ART = [{ img: imgTop1, w: 40 }, { img: imgTop2, w: 68 }, { img: imgTop3, w: 71 }];
const HOME_TOP_AT = [{ at: 28.85, slot: 163.85 }, { at: 25.15, slot: 152 }, { at: 59.85, slot: 194.85 }];
// Hot Channel Programs: what's on now on the TV channels that have their own picture
const HOT_PROGRAM = TV_CHANNELS.map((c, i) => ({ c, i })).filter(x => x.c.logo && !x.c.short).slice(0, 8);

// card text under a 16:9 picture (Figma Mobile/label/large and Mobile/body/small)
const CARD_TITLE: React.CSSProperties = { fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.1, color: ON_SURFACE };
const CARD_SUB: React.CSSProperties = { fontSize: 11, lineHeight: "16px", letterSpacing: 0.4, color: ON_VARIANT };

// top tabs; "For you" is the Home page, "Sports" the Sport page, the rest are demos for now
const TABS = ["For you", "Sports", "Movie", "News", "Kids", "Games", "Music", "Lifestyle"];
const HERO_FADE = "linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)";
// rail backgrounds (Shorts, featured collection): faded in at the top and out at the bottom
const SHORTS_FADE = "linear-gradient(to bottom, transparent 0%, #000 30%, #000 68%, transparent 100%)";
const FEATURED_FADE = "linear-gradient(to bottom, transparent 0%, #000 16%, #000 89%, transparent 100%)";

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
  { t: "UEFA Champions League", img: lgUcl, fav: true },
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
const LATEST: Clip[] = [{ img: stills("highlight", 1), t: "Lakers vs Warriors Full Game Highlights", d: "8m" }, { img: stills("highlight", 2), t: "Pacers vs Heat Full Game Highlights", d: "9m" }, { img: stills("highlight", 3), t: "Como vs Man United Highlights", d: "6m" }, { img: stills("highlight", 4), t: "Paris Saint-Germain vs Barcelona Highlights", d: "12m" }, { img: stills("highlight", 5), t: "Man City vs AEK Athens Highlights", d: "10m" }, { img: stills("highlight", 6), t: "VfB Stuttgart vs Gladbach Highlights", d: "9m" }, { img: stills("highlight", 7), t: "Mainz vs Werder Bremen Highlights", d: "8m" }, { img: stills("highlight", 8), t: "2026 Australian GP Race Highlights", d: "14m" }, { img: stills("highlight", 9), t: "2026 Japanese GP Best Moments", d: "6m" }];
const UCL: Clip[] = [
  { img: stills("UCL", 1), t: "Bayern München vs Arsenal", live: true }, { img: stills("UCL", 2), t: "Real Madrid vs RB Leipzig", live: true },
  { img: stills("UCL", 3), t: "Inter Milan vs Shakhtar Donetsk", d: "Tomorrow 2:45 AM" }, { img: stills("UCL", 4), t: "Aston Villa vs Viking", d: "Tomorrow 2:45 AM" },
  { img: stills("UCL", 5), t: "Club Brugge vs Lens", d: "Tomorrow 3:00 PM" }, { img: stills("UCL", 6), t: "Real Betis vs Feyenoord", d: "Tomorrow 3:00 PM" },
];
const FOOTBALL_FY: Clip[] = [{ img: stills("footballForYou", 1), t: "Paris Saint-Germain vs Barcelona Highlights", d: "12m" }, { img: stills("footballForYou", 2), t: "Como vs Man United Highlights", d: "6m" }, { img: stills("footballForYou", 3), t: "Bournemouth vs AC Milan Highlights", d: "9m" }, { img: stills("footballForYou", 4), t: "Lillestrøm vs Real Sociedad Highlights", d: "10m" }, { img: stills("footballForYou", 5), t: "Arsenal vs Lille Highlights", d: "8m" }, { img: stills("footballForYou", 6), t: "Villarreal vs Napoli Highlights", d: "11m" }];
const BASKETBALL_FY: Clip[] = [{ img: stills("basketballForYou", 1), t: "Lakers vs Warriors Full Game Highlights", d: "8m" }, { img: stills("basketballForYou", 2), t: "Pacers vs Heat Full Game Highlights", d: "9m" }, { img: stills("basketballForYou", 3), t: "Pistons vs Knicks Full Game Highlights", d: "12m" }, { img: stills("basketballForYou", 4), t: "Kings vs Spurs Full Game Highlights", d: "10m" }, { img: stills("basketballForYou", 5), t: "Cavaliers vs Hawks Full Game Highlights", d: "9m" }, { img: stills("basketballForYou", 6), t: "Suns vs Thunder Full Game Highlights", d: "11m" }];
const MOTORSPORT_FY: Clip[] = [{ img: stills("motorsportsForYou", 1), t: "2026 Australian GP Race Highlights", d: "14m" }, { img: stills("motorsportsForYou", 2), t: "2026 Indonesian GP Race Highlights", d: "13m" }, { img: stills("motorsportsForYou", 3), t: "2026 Japanese GP Best Moments", d: "6m" }, { img: stills("motorsportsForYou", 4), t: "2026 Austrian GP Race Highlights", d: "15m" }, { img: stills("motorsportsForYou", 5), t: "2026 San Marino GP Race Highlights", d: "14m" }, { img: stills("motorsportsForYou", 6), t: "2026 San Marino GP Best Moments", d: "7m" }];
const SPORT_CHIPS = ["All", "Football", "Basketball", "Golf", "Tennis", "Badminton", "Motorsport"];
const DOCUMENTARY: { img: string; t: string; pos?: string }[] = [
  ...["mourinho", "beckham", "pele", "ronaldinho"].map(k => ({ img: poster(k), t: C[k].t })),
  ...[["giannis", "Giannis: The Marvelous Journey"], ["the-rise", "The Rise"], ["the-knockout", "The Knockout"], ["the-ascent", "The Ascent"], ["solo-echoes", "Solo Echoes"], ["tour-de-force", "Tour de Force"], ["match-point", "Match Point"]]
    .map(([f, t]) => ({ img: a(`posters_portrait/sport/doc-${f}.jpg`), t })),
];
// ─── Movie tab (Figma "AIS PLAY: movie_mainPage_disney", node 236:65697; empty slots filled with the app's movie art) ───
const movieSlide = (k: string, q = "HD"): Slide => ({ title: C[k].t, img: poster(k), platform: C[k].plat ?? "monomax", channel: "", genre: C[k].g?.[0], year: String(C[k].y), dur: C[k].len, rate: C[k].age, q });
const MOVIE_SLIDES: Slide[] = [movieSlide("topgun"), movieSlide("john", "4K"), movieSlide("avatar", "4K"), movieSlide("f1"), movieSlide("venom")];
const MOVIE_CHIPS = ["All", "Action", "Comedy", "Anime", "Horror"];

const MOVIE_JUMP: { t: string; img: string; crop?: React.CSSProperties; left: string; pct: number; badge?: string }[] = [
  { t: "Don't Look Up", img: imgMovieJump1, crop: { width: "106%", height: "245.26%", left: "-3%", top: "-36.65%" }, left: "55m left", pct: 44 },
  { t: "S1: Ep.5", img: imgMovieJump2, crop: { width: "103.5%", height: "277.23%", left: 0, top: "-41.94%" }, left: "72m left", pct: 44, badge: "Today 21:00PM" },
  ...CONTINUE_LIST.slice(1, 3).map(c => ({ t: C[c.k].t, img: wide(c.k), left: `${c.of - c.w}m left`, pct: Math.round(c.w / c.of * 100) })),
];
const MOVIE_FRESH = [["lastking", 8], ["vincenzo", 3], ["house", 4], ["goodpartner", 5], ["blind", 7]].map(([k, ep]) => ({ img: poster(k as string), t: C[k as string].t, ep: `Episode ${ep}` }));
const MOVIE_DISNEY = ["endgame", "loki", "encanto", "spider", "prada"].map(k => ({ img: wide(k), t: C[k].t }));
const MOVIE_MY_LIST: { img: string; t: string; netflix?: boolean; crop?: React.CSSProperties }[] = [
  { img: imgMovieList1, t: "The Shawshank Redemption", netflix: true }, { img: imgMovieList2, t: "Parasite", netflix: true, crop: { width: "109%", height: "109.4%", left: "-2.47%", top: "-4.7%" } },
  ...R.myList.slice(0, 4).map(x => ({ img: wide(x.k), t: C[x.k].t, netflix: C[x.k].plat === "netflix" })),
];
const MOVIE_RENTALS = MY_RENTAL_LIST.map(k => ({ img: wide(k), t: C[k].t, netflix: C[k].plat === "netflix" }));

const ACTORS = ["Keanu Reeves", "Tom Cruise", "Brad Pitt", "Zendaya", "Tom Hardy", "Pedro Pascal", "Johnny Depp", "Ariana Grande", "Song Joong-ki"].map((t, i) => ({ t, img: a(`posters/actors/${t.toLowerCase().replace(/ /g, "-")}.jpg`), fav: i < 2 }));
const MOVIE_SEASONAL = [["halloween", "Halloween Movies"], ["action", "Action Collection"], ["fantasy", "Fantasy Worlds"]].map(([f, t]) => ({ img: a(`posters_portrait/collection/${f}.jpg`), t }));
// every title in the shared rails once, split into films and series (Movies / Series rails)
const MOVIE_POOL = [...new Set([...R.hot, ...R.top10, ...R.because, ...R.love, ...R.dateNight].map(keyOf))].filter(k => C[k].p);
const isSeries = (k: string) => /Season/.test(C[k].len ?? "");
const MOVIE_FILMS = MOVIE_POOL.filter(k => !isSeries(k)).slice(0, 8);
const MOVIE_SERIES = MOVIE_POOL.filter(isSeries).slice(0, 8);
const MOVIE_TOP_AT = [{ at: 28.85, slot: 163.85 }, { at: 38, slot: 173 }, { at: 59.85, slot: 194.85 }];

// the TV tab's sports channels (TV Guide, Hot Channel and Sports Channels rails)
const SPORT_TV = TV_CHANNELS.map((c, i) => ({ c, i })).filter(x => x.c.cats.includes("Sports"));
const MOVIE_TV = TV_CHANNELS.map((c, i) => ({ c, i })).filter(x => x.c.cats.includes("Movies & Series"));

// ── Sport tab rails added from Figma "AIS PLAY / Home / Full Page" (230:59163), a wireframe filled with sports artwork ──
type SportPoster = { img: string; t: string; pos?: string; k?: string };
const sportTitles = (keys: string[]): SportPoster[] => keys.map(k => ({ k, img: k === "f1" ? a("posters_portrait/sport/rc-f1.webp") : poster(k), t: C[k].t }));

const SPORT_TOP10 = sportTitles(["f1", "mourinho", "rocky", "beckham", "creed", "pele", "spacejam", "blindside", "ronaldinho", "goal"]);
const BIG_SCREEN = sportTitles(["f1", "creed", "spacejam2", "longestyard", "goal2"]);
const SPORT_FOR_YOU = sportTitles(["beckham", "ronaldinho", "rocky", "secretariat"]);
const SPORT_EXCLUSIVE: SportPoster[] = [{ img: a("posters_portrait/ex3.jpg"), t: "Man City vs Arsenal" }, ...sportTitles(["mufcche", "mufcars"])];
const UNDERDOGS = sportTitles(["rocky", "creed", "blindside", "longestyard", "goal", "goal2", "secretariat"]);
const SPORT_BECAUSE = sportTitles(["creed", "longestyard", "blindside", "spacejam", "goal", "secretariat", "f1"]);
const JUMP_BACK = [
  { t: "Lakers vs Warriors Highlights", img: stills("highlight", 1), left: 5, pct: 44 }, { t: "Como vs Man United Highlights", img: stills("highlight", 3), left: 4, pct: 60 },
  { t: "2026 Australian GP Highlights", img: stills("highlight", 8), left: 10, pct: 30 }, { t: "Man City vs AEK Athens Highlights", img: stills("highlight", 5), left: 3, pct: 70 },
];
const SPORT_MY_LIST = [
  { t: "Paris Saint-Germain vs Barcelona Highlights", img: stills("footballForYou", 1) }, { t: "2026 Japanese GP Best Moments", img: stills("motorsportsForYou", 3) },
  { t: "Pistons vs Knicks Full Game Highlights", img: stills("basketballForYou", 3) },
];
// the sports items of Live and Upcoming
// the channel a programme that's on now plays on (rules.js: a live card goes straight to its channel)
const liveChannel = (t: string) => {
  const tv = SPORT_LIVE_LIST.find(m => m.t === t)?.tv, byName = TV_CHANNELS.findIndex(c => c.name === tv), byProgram = TV_CHANNELS.findIndex(c => c.program.includes(t));
  return byName >= 0 ? byName : byProgram >= 0 ? byProgram : TV_CHANNELS.findIndex(c => c.no === "61");
};
const LEAGUE_NAME: Record<string, string> = { ucl: "UEFA Champions League", nba: "NBA", nfl: "NFL", bundesliga: "Bundesliga", "": "Club Friendly" };
const SPORT_LIVE = SPORT_LIVE_LIST.map((m, i) => ({ t: m.t, sub: LEAGUE_NAME[m.lg] ?? "", img: stills("liveUpcoming", Number(m.n)), live: m.live, badge: m.when ?? undefined, premium: i === 1 }));
// where each Top 10 poster starts and how much of the rail it takes
const SPORT_TOP_AT = [{ at: 28.85, slot: 148.85 }, { at: 37.39, slot: 152 }, { at: 59.85, slot: 179.85 }];

export interface ShortThumb { img: string; title: string }

const slidesFor = (tab: string) => tab === "Sports" ? SPORT_SLIDES : tab === "Movie" ? MOVIE_SLIDES : SLIDES;

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
    const n = slidesFor(tab).length;
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
  const go = (d: number) => { const n = slidesFor(tab).length; setSlide(s => (s + d + n) % n); setTick(t => t + 1); };

  const demo = (label: string) => onToast(`${label} (demo)`);
  // the tab row shows once the page has scrolled a little; in the compact header only while it's expanded (⌄ tapped)
  const tabsOn = compact ? menuOpen : showTabs;
  // the compact "⌄ Home" title, only while collapsed
  const titleOn = compact && !menuOpen;
  const openedAt = useRef(0);
  useEffect(() => { if (menuOpen) openedAt.current = scroller.current?.scrollTop ?? 0; }, [menuOpen]);
  const pickTab = (t: string) => {
    setMenuOpen(false);
    if (t === "For you" || t === "Sports" || t === "Movie") {
      setTab(t); setChip("All"); setSlide(0); setTick(k => k + 1); scroller.current?.scrollTo({ top: 0 });
      setShowTabs(false); setScrolled(false); setCompact(false); setChipsDocked(false); setChipsFolded(false);
    } else demo(t);
  };
  const slides = slidesFor(tab);
  const s = slides[slide % slides.length];
  const sport = tab === "Sports", movie = tab === "Movie";
  const chipRowH = movie ? 44 : 40;   // the docked filter row

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
        {(sport || movie) && chipsDocked && (
          <div className="relative overflow-hidden" style={{
            // chips: 40px row + padding; folded: a 20px subtitle line
            // folded, it's pulled up into the title row's bottom space so the subtitle sits right under "Sports"
            height: chipsFolded && !tabsOn ? 28 : (tabsOn ? 16 : 4) + chipRowH + 12,
            marginTop: chipsFolded && !tabsOn ? -8 : 0,
            transition: "height .3s cubic-bezier(.2,0,0,1), margin-top .3s cubic-bezier(.2,0,0,1)",
          }}>
            <div className="absolute inset-x-0 top-0 pb-3 transition-all duration-300" style={{
              paddingTop: tabsOn ? 16 : 4,
              opacity: chipsFolded && !tabsOn ? 0 : 1, transform: chipsFolded && !tabsOn ? "translateY(-12px)" : "none",
              pointerEvents: chipsFolded && !tabsOn ? "none" : "auto",
            }}>{movie ? <MovieChips chip={chip} onPick={onChip} /> : <SportChips chip={chip} onPick={onChip} />}</div>
            {/* subtitle under the "⌄ Sport" title, lined up with its text; tapping it brings the chips back; the title's ⌄ expands both tabs and chips */}
            <button onClick={() => setChipsFolded(false)} aria-label="Show sport filters"
              className="absolute top-0 flex items-center transition-all duration-300 whitespace-nowrap"
              style={{
                left: 56, height: 20, fontSize: 14, color: ON_VARIANT,
                opacity: chipsFolded && !tabsOn ? 1 : 0, transform: chipsFolded && !tabsOn ? "none" : "translateY(8px)",
                pointerEvents: chipsFolded && !tabsOn ? "auto" : "none",
              }}>
              {chip === "All" ? (movie ? "All movies" : "All sports") : chip}
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
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 py-2" style={{ gap: movie ? 12 : sport ? 20 : 26, paddingLeft: sport || movie ? 16 : 24, paddingRight: sport || movie ? 16 : 24, paddingBottom: movie ? 12 : undefined }}>
            {movie ? (
              <div className="flex flex-col gap-2 w-full py-2">
                <div className="flex items-center gap-[10px]">
                  <h2 ref={titleRef} className="flex-1 m-0" style={{ fontSize: 22, fontWeight: 600, lineHeight: "28px", color: ON_SURFACE, textShadow: "0 2px 10px rgba(0,0,0,.5)" }}>{s.title}</h2>
                  <button onClick={() => demo("More")} aria-label="More" className="p-[6px] rounded-full flex items-center justify-center shrink-0" style={{ border: "1px solid #5a5a5a" }}><img src={iconMovieMore} alt="" /></button>
                </div>
                <div className="flex items-center gap-2 overflow-hidden" style={{ height: 32, fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.1, color: ON_SURFACE }}>
                  <img src={tag(s.platform)} alt={s.platform} className="block object-contain shrink-0" style={{ width: 48, height: 32, borderRadius: 8 }} />
                  <span className="shrink-0">{s.genre}</span><span className="shrink-0">{s.year}</span><span className="shrink-0">{s.dur}</span>
                  <span className="flex items-center gap-1 shrink-0">
                    {[s.rate, s.q].map(x => <span key={x} className="rounded-[14px] px-2 py-1" style={{ border: "1px solid #5a5a5a", lineHeight: "normal", letterSpacing: 0 }}>{x}</span>)}
                  </span>
                </div>
              </div>
            ) : sport ? (
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
                <h2 ref={titleRef} className="text-white text-center m-0" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.2, textShadow: "0 2px 10px rgba(0,0,0,.5)" }}>{s.title}</h2>
                <div className="flex items-center gap-3">
                  <img src={tag(s.platform)} alt={s.platform} className="block object-contain" style={{ width: 30, height: 20, borderRadius: 6 }} />
                  <span style={{ fontSize: 11, color: ON_SURFACE }}>{s.channel}</span>
                </div>
                {(s.live || s.time) && (
                  <div className="flex items-center gap-[9px]">
                    {s.live && <StatusPill label="LIVE" live />}
                    {s.time && <span className="flex items-center rounded-[10px] px-[7px]" style={{ height: 20, fontSize: 11, fontWeight: 500, color: ON_SURFACE, border: "0.55px solid #5a5a5a" }}>{s.time}</span>}
                  </div>
                )}
              </div>
            )}
            <div ref={playRowRef} className={`flex items-center w-full ${movie ? "gap-3" : "gap-4"}`}>
              <button onClick={() => demo(s.live ? "Watch live" : "Play")} className="flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2" style={{ background: "#f0f0f0", height: sport ? 44 : 48, boxShadow: sport ? "none" : "0 4px 4px rgba(0,0,0,0.2)" }}>
                {movie ? <img src={iconMoviePlay} alt="" /> : sport ? <Play size={20} fill="#282828" stroke="#282828" /> : <Play size={24} fill="none" stroke="#282828" strokeWidth={2} />}
                <span style={{ fontSize: 16, fontWeight: sport ? 600 : 700, color: "#282828" }}>{s.live ? "Watch Live" : "Play"}</span>
              </button>
              {!movie && <button onClick={() => toggleList(s.title)} aria-label={myList.has(s.title) ? "Remove from My List" : "Add to My List"} aria-pressed={myList.has(s.title)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ border: sport ? "1.5px solid rgba(255,255,255,0.85)" : "1px solid #5a5a5a" }}>
                {myList.has(s.title) ? <Check size={sport ? 22 : 24} className="text-white" /> : <Plus size={sport ? 22 : 24} className="text-white" />}
              </button>}
            </div>
            {/* the active dot is a 24px track with its 8px indicator at the left */}
            <div className="flex items-center gap-[6px] p-1">
              {slides.map((_, i) => (
                <button key={i} aria-label={`Slide ${i + 1}`} onClick={() => { setSlide(i); setTick(t => t + 1); }}
                  className="relative rounded-full transition-all duration-300"
                  style={{ height: 8, width: i === slide ? 24 : 8, background: "#666" }}>
                  {i === slide && <span className="absolute left-0 top-0 rounded-full" style={{ width: 8, height: 8, background: "#e6e6e6" }} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {sport ? <SportRails demo={demo} chip={chip} onChip={onChip} chipsRef={chipsRef} chipsDocked={chipsDocked} shorts={shorts} onOpenShort={onOpenShort} onOpenChannel={onOpenChannel} onOpenStore={onOpenStore} /> : movie ? <MovieRails demo={demo} chip={chip} onChip={onChip} chipsRef={chipsRef} chipsDocked={chipsDocked} onOpenChannel={onOpenChannel} /> : (
        <div className="flex flex-col gap-6 pt-6">
          {/* Continue Watching */}
          <Rail title="Continue Watching" gap={16}>
            {CONTINUE.map(c => (
              <button key={c.t} onClick={() => demo(c.t)} className="flex flex-col gap-2 text-left shrink-0" style={{ width: 200 }}>
                <div className="relative overflow-hidden rounded-[12px]" style={{ height: 112 }}>
                  <img src={c.img} alt="" className="w-full h-full object-cover" />
                  <img src={tag(c.plat)} alt={c.plat} className="absolute left-3 bottom-3 object-contain" style={{ width: 30, height: 20, borderRadius: 6 }} />
                  <div className="absolute inset-x-0 bottom-0 h-[6px]" style={{ background: "#4a4a4a" }}>
                    <div className="h-full" style={{ width: `${c.pct}%`, background: ON_VARIANT }} />
                  </div>
                </div>
                <span className="truncate" style={{ fontSize: 16, fontWeight: 500, lineHeight: "19px", color: ON_SURFACE }}>{c.t}</span>
                <span style={{ fontSize: 12, lineHeight: "14px", color: ON_VARIANT }}>{c.left} mins</span>
              </button>
            ))}
          </Rail>

          {/* Top 10: 135 x 202 posters overlapping their numerals, which sit centered on the poster's height */}
          <TopTenRail items={TOP10.map(img => ({ img, t: "Top 10" }))} width={135} height={202} gap={8} positions={HOME_TOP_AT} onTap={i => demo(`#${i + 1} in Top 10`)} />

          {/* Live and Upcoming */}
          <Rail title="Live and Upcoming" gap={16}>
            {UPCOMING.map(u => (
              <button key={u.t} onClick={() => u.live ? onOpenChannel(liveChannel(u.t)) : demo(u.t)} className="flex flex-col gap-1 text-left shrink-0" style={{ width: 200 }}>
                <div className="relative overflow-hidden rounded-[12px]" style={{ height: 112 }}>
                  <img src={u.img} alt="" className="w-full h-full object-cover" />
                  <span className="absolute left-3 top-3">
                    {u.live ? <StatusPill label="LIVE" live /> : <StatusPill label={rules().label({ when: u.badge })} />}
                  </span>
                  {u.premium && <img src={iconCrown} alt="Premium" className="absolute left-3 bottom-3" style={{ width: 20, height: 20 }} />}
                </div>
                <span className="truncate" style={CARD_TITLE}>{u.t}</span>
                <span style={CARD_SUB}>{u.sub}</span>
              </button>
            ))}
          </Rail>

          {/* Hot Channel Programs: what's on now on TV channels (same data as the TV tab); tapping plays the channel */}
          <Rail title="Hot Channel Programs" gap={16}>
            {HOT_PROGRAM.map(({ c, i }) => {
              const now = nowMinutes(), on = scheduleFor(i).find(p => p.start <= now && now < p.end);
              return (
                <button key={c.no} onClick={() => onOpenChannel(i)} className="flex flex-col gap-1 text-left shrink-0" style={{ width: 200 }}>
                  <div className="relative overflow-hidden rounded-[12px]" style={{ height: 112, background: "#3a3a3a" }}>
                    <img src={c.poster} alt="" className="w-full h-full object-cover" />
                    {c.premium && <span className="absolute left-3 bottom-3"><TVCrown c={c} size={20} /></span>}
                  </div>
                  <span className="truncate" style={CARD_TITLE}>{c.program}</span>
                  <span style={CARD_SUB}>{on ? `${clock(on.start)}-${clock(on.end)}` : c.name}</span>
                </button>
              );
            })}
          </Rail>

          {/* New Releases */}
          <Rail title="New Releases" gap={16}>{NEW_RELEASE.map((p, k) => <PosterCard key={k} p={p} onTap={() => demo(p.t)} />)}</Rail>

          {/* My list */}
          <Rail title="My List" gap={16}>
            {MY_LIST.map(m => (
              <button key={m.t} onClick={() => demo(m.t)} aria-label={m.t} className="shrink-0 overflow-hidden rounded-[12px]" style={{ width: 200, height: 112 }}>
                <img src={m.img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </Rail>

          {/* AIS PLAY Exclusive: 250 x 375 posters; a pay-per-view title carries its name, price and badges */}
          <Rail title="AIS PLAY Exclusive" gap={16} smallTitle>
            {EXCLUSIVE.map(e => (
              <button key={e.img} onClick={() => demo("AIS PLAY Exclusive")} className="relative shrink-0 overflow-hidden rounded-[20px] text-left" style={{ width: 250, height: 375 }}>
                <img src={e.img} alt="" className="w-full h-full object-cover" style={{ objectPosition: e.pos ?? "center" }} />
                {e.live && <span className="absolute left-3 top-3"><StatusPill label="LIVE" live /></span>}
                {e.title && <PriceOverlay title={e.title} price={e.price ?? ""} vat={e.vat ?? ""} plat={e.plat ?? "monomax"} premium={rules().showsCrown({ k: "assanee" })} />}
              </button>
            ))}
          </Rail>

          {/* Shorts: the short dramas, over a full-width picture (no link to the Clips tab) */}
          <section className="relative flex flex-col gap-3 pb-5" style={{ paddingTop: 120 }}>
            {/* the picture fades out at the top and bottom with a mask (not a colour), so it blends into any background */}
            <img src={imgShortsBg} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ WebkitMaskImage: SHORTS_FADE, maskImage: SHORTS_FADE }} />
            <div className="relative flex items-center gap-1 px-4">
              <h3 className="m-0" style={{ fontSize: 18, fontWeight: 400, lineHeight: "24px", color: ON_SURFACE }}>Shorts</h3>
              <button onClick={() => demo("Shorts")} aria-label="More Shorts" className="p-1 rounded-full"><ChevronRight size={16} className="text-white" /></button>
            </div>
            <div className="relative home-rail flex gap-4 overflow-x-auto overflow-y-hidden px-4">
              {SHORT_DRAMAS.map((s, i) => <PosterCard key={s.img} p={{ img: a(`posters/shorts/${s.img}`), t: s.t, plat: s.plat, tag: i === 0 ? "New" : i === 1 ? "Top 10" : undefined }} onTap={() => demo(s.t)} />)}
              <span className="shrink-0" style={{ width: 4 }} />
            </div>
          </section>

          <ChooseInterests onChoose={() => demo("Choose interests")} onPick={demo} />

          {/* Featured collection: title and synopsis over a picture, then its posters */}
          <section className="relative flex flex-col justify-end" style={{ gap: 60, padding: "80px 0 30px" }}>
            {/* cropped as in Figma, at half strength; the mask fades it at the section's edges */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.5, WebkitMaskImage: FEATURED_FADE, maskImage: FEATURED_FADE }}>
              {/* px, not %: Figma's frame is 499 wide, so percentages of the phone's width would stop short of the right edge */}
              <img src={imgFeaturedBg} alt="" className="absolute max-w-none" style={{ width: 499, height: 906.6, left: -117.5, top: -46.6 }} />
            </div>
            <div className="relative flex flex-col gap-3 px-4" style={{ width: 286 }}>
              <h3 className="m-0" style={{ fontSize: 22, fontWeight: 500, lineHeight: "28px", color: "#fff" }}>Masters Tournament /<br />Road to Augusta</h3>
              <p className="m-0" style={{ fontSize: 12, lineHeight: "16px", letterSpacing: 0.4, color: "#fff", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                Every round from Augusta National, live and on demand, as golf's best chase the green jacket.
              </p>
            </div>
            <div className="relative home-rail flex overflow-x-auto overflow-y-hidden px-4" style={{ gap: 16 }}>
              {FEATURED.map(g => <PosterCard key={g.t} p={g} onTap={() => demo(g.t)} />)}
              <span className="shrink-0" style={{ width: 16 }} />
            </div>
          </section>

          {/* Genre rails */}
          <Rail title="90's Movies" more bigMore onMore={() => demo("90's Movies")} gap={16}>{NINETIES.map((p, k) => <PosterCard key={k} p={p} onTap={() => demo(p.t)} />)}</Rail>
          <Rail title="We think you'll love this" more bigMore onMore={() => demo("We think you'll love this")} gap={16}>{LOVE.map((p, k) => <PosterCard key={k} p={p} onTap={() => demo(p.t)} />)}</Rail>

          {/* Fresh episode, every week: posters with the episode under them */}
          <Rail title="Fresh episode, every week" gap={16}>
            {FRESH.map(f => (
              <button key={f.t} onClick={() => demo(f.t)} className="flex flex-col gap-2 text-left shrink-0" style={{ width: 135 }}>
                <img src={f.img} alt="" className="w-full rounded-[12px] object-cover" style={{ height: 202 }} />
                <span className="truncate" style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.15, color: ON_SURFACE }}>{f.ep}</span>
              </button>
            ))}
          </Rail>

          <Rail title="Date Night Selected" more bigMore onMore={() => demo("Date Night Selected")} gap={16}>{DATE_NIGHT.map((p, k) => <PosterCard key={k} p={p} onTap={() => demo(p.t)} />)}</Rail>
          <Rail title="Because you watched The Hobbit" gap={16}>{BECAUSE.map((p, k) => <PosterCard key={k} p={p} onTap={() => demo(p.t)} />)}</Rail>

          {/* Seasonal / collection: big posters with their name over the bottom */}
          <Rail title="" gap={16}>
            {SEASONAL.map(c => (
              <button key={c.t} onClick={() => demo(c.t)} className="relative shrink-0 overflow-hidden rounded-[20px] text-left" style={{ width: 250, height: 375 }}>
                <img src={c.img} alt="" className="w-full h-full object-cover" />
                <span className="absolute inset-x-0 bottom-0" style={{ height: 140, background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.75))" }} />
                <span className="absolute text-white" style={{ left: 23, top: 281, width: 114, fontSize: 24, fontWeight: 400, lineHeight: "22px" }}>{c.t}</span>
              </button>
            ))}
          </Rail>

          {/* Grab the Mic: karaoke, 95px squares */}
          <Rail title="Grab the Mic" gap={16}>
            {KARAOKE.map(k => (
              <button key={k.t} onClick={() => demo(k.t)} className="flex flex-col gap-1 text-left shrink-0" style={{ width: 95 }}>
                <div className="relative overflow-hidden rounded-[11px]" style={{ width: 95, height: 95 }}>
                  <img src={k.img} alt="" className="w-full h-full object-cover" />
                  {k.pr && <img src={iconCrown} alt="Premium" className="absolute" style={{ left: 12, bottom: 12, width: 15, height: 15 }} />}
                </div>
                <span className="truncate" style={{ fontSize: 12, fontWeight: 500, lineHeight: "14px", color: ON_SURFACE }}>{k.t}</span>
                <span className="truncate" style={{ fontSize: 10, lineHeight: "12px", color: ON_VARIANT }}>{k.sub}</span>
              </button>
            ))}
          </Rail>

          {/* Choose interests, over the partner apps banner (cropped as in Figma): opens the Store */}
          <section className="px-4">
            <div className="relative overflow-hidden rounded-[12px] flex flex-col justify-end px-4 py-5" style={{ height: 136 }}>
              <img src={imgChooseBanner} alt="" className="absolute max-w-none pointer-events-none" style={{ width: "100%", height: "254.07%", left: "-0.02%", top: "-114.61%" }} />
              <ChooseButton onTap={onOpenStore} />
            </div>
          </section>

          {/* Quick access: a 2 x 2 grid of cards */}
          <section className="grid grid-cols-2 gap-6 px-4 pb-[60px]">
            {QUICK.map(q => (
              <button key={q.t} onClick={() => demo(q.t)} className="flex flex-col justify-between text-left rounded-[8px]" style={{ height: 95, padding: "8px 9px", background: "#4a4a4a" }}>
                <span className="flex items-start justify-between gap-1 w-full">
                  <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.15, color: "#f0f0f0" }}>{q.t}</span>
                  <span className="p-1 shrink-0"><ChevronRight size={16} className="text-white" /></span>
                </span>
                <span className="flex items-end justify-between gap-1 w-full">
                  <span className="whitespace-pre-line" style={{ fontSize: 12, lineHeight: "16px", letterSpacing: 0.4, color: ON_VARIANT }}>{q.sub}</span>
                  <img src={q.icon} alt="" width={24} height={24} className="shrink-0" />
                </span>
              </button>
            ))}
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
        /* the short-drama apps: their square icon, cropped to fill the tag */
        img[src*="badges/tag-reelshort"], img[src*="badges/tag-dramabox"]{object-fit:cover !important;background:#ff2a5f !important;}
        img[src*="badges/tag-shortmax"]{object-fit:cover !important;background:#000 !important;}
        img[src*="badges/tag-wetv"]{object-fit:cover !important;background:#fff !important;}
        img[src*="badges/tag-iqiyi"]{object-fit:cover !important;background:#00db59 !important;}
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

      {/* Jump Back Right In: where the viewer left off */}
      <Rail title="Jump Back Right In" gap={12}>
        {JUMP_BACK.map(c => (
          <button key={c.t} onClick={() => demo(c.t)} className="flex flex-col gap-2 text-left shrink-0" style={{ width: 200 }}>
            <div className="relative overflow-hidden rounded-[12px]" style={{ height: 112 }}>
              <img src={c.img} alt="" className="w-full h-full object-cover" />
              <span className="absolute left-3 bottom-3"><Badge label="4K" /></span>
              <div className="absolute inset-x-0 bottom-0 h-[6px]" style={{ background: "#4a4a4a" }}>
                <div className="h-full" style={{ width: `${c.pct}%`, background: ON_VARIANT }} />
              </div>
            </div>
            <span className="truncate" style={{ fontSize: 16, fontWeight: 500, lineHeight: "19px", color: ON_SURFACE }}>{c.t}</span>
            <span style={{ fontSize: 12, lineHeight: "14px", color: ON_VARIANT }}>{c.left} mins</span>
          </button>
        ))}
      </Rail>

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
                <span role="button" aria-label={`Remove ${l.t} from favorites`} onClick={e => { e.stopPropagation(); setFavs(f => { const n = new Set(f); n.delete(l.t); return n; }); }}
                  className="absolute flex items-center justify-center rounded-full bg-white" style={{ left: 56, top: 56, width: 32, height: 32 }}>
                  <img src={iconHeartDark} alt="" width={24} height={24} />
                </span>
              )}
            </button>
            <span className="text-center overflow-hidden" style={{ fontSize: 12, lineHeight: "16px", letterSpacing: 0.4, color: ON_SURFACE, height: 48, width: 96 }}>{l.t}</span>
          </div>
        ))}
      </Rail>

      {/* Latest Highlights */}
      <Rail title="Latest Highlights" gap={12}>{LATEST.map(c => <ClipCard key={c.t} c={c} onTap={() => demo(c.t)} />)}</Rail>

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

      {/* Hot Channel: channel cards with favorite, premium crown and channel number; tapping plays the channel */}
      <Rail title="Hot Channel" gap={16}>
        {SPORT_TV.map(({ c, i }) => (
          <ChannelCard key={c.no} c={c} i={i} onTap={() => onOpenChannel(i)} />
        ))}
      </Rail>

      {/* Live and Upcoming: red badge while live, dark with its start time otherwise */}
      <Rail title="Live and Upcoming" gap={16}>
        {SPORT_LIVE.map(u => (
          <button key={u.t} onClick={() => u.live ? onOpenChannel(liveChannel(u.t)) : demo(u.t)} className="flex flex-col gap-1 text-left shrink-0" style={{ width: 200 }}>
            <div className="relative overflow-hidden rounded-[12px]" style={{ height: 112 }}>
              <img src={u.img} alt="" className="w-full h-full object-cover" />
              <span className="absolute left-3 top-3"><Badge label={u.live ? "LIVE" : rules().label({ when: u.badge })} bg={u.live ? LIVE : undefined} /></span>
              {u.premium && <img src={iconCrown} alt="Premium" className="absolute left-3 bottom-3" style={{ width: 20, height: 20 }} />}
            </div>
            <span className="truncate" style={CARD_TITLE}>{u.t}</span>
            <span style={CARD_SUB}>{u.sub}</span>
          </button>
        ))}
      </Rail>

      {/* Top 10: 120 x 180 posters overlapping their numerals */}
      <TopTenRail items={SPORT_TOP10} width={120} height={180} gap={12} positions={SPORT_TOP_AT} onTap={i => demo(`#${i + 1} in Top 10`)} />

      <Rail title="Hot off the Big Screen" gap={12}>{BIG_SCREEN.map((p, k) => <SmallPoster key={p.t} p={p} badge={k === 0} onTap={() => demo(p.t)} />)}</Rail>

      {/* UEFA Champions League, over the competition's picture (masked so it blends into any background) */}
      <section className="relative flex flex-col gap-3 pb-6" style={{ paddingTop: 60 }}>
        {/* cropped as in Figma (zoomed in on the trophy), the mask on a wrapper so it fades at the section's edges */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ WebkitMaskImage: BAND_FADE, maskImage: BAND_FADE }}>
          <img src={imgUclBg} alt="" className="absolute max-w-none" style={{ width: "223.38%", height: "181.92%", left: "-83.73%", top: "-39.16%", objectFit: "cover" }} />
        </div>
        <div className="relative flex items-center gap-1 px-4">
          <h3 className="m-0" style={{ fontSize: 18, fontWeight: 400, lineHeight: "24px", color: ON_SURFACE, textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>UEFA Champions League</h3>
          <button onClick={() => demo("UEFA Champions League")} aria-label="More UEFA Champions League" className="p-1 rounded-full"><ChevronRight size={16} className="text-white" /></button>
        </div>
        <div className="relative home-rail flex gap-3 overflow-x-auto overflow-y-hidden px-4">
          {UCL.map(c => <ClipCard key={c.t} c={c} onTap={() => c.live ? onOpenChannel(liveChannel(c.t)) : demo(c.t)} />)}
          <span className="shrink-0" style={{ width: 4 }} />
        </div>
      </section>

      {/* My List: 222 x 124 cards */}
      <Rail title="My List" gap={12}>
        {SPORT_MY_LIST.map((m, k) => (
          <button key={m.t} onClick={() => demo(m.t)} aria-label={m.t} className="relative shrink-0 overflow-hidden rounded-[12px]" style={{ width: 222, height: 124.44 }}>
            <img src={m.img} alt="" className="w-full h-full object-cover" />
            {k === 0 && <span className="absolute" style={{ left: 12, bottom: 12, fontSize: 12.22, fontWeight: 500, lineHeight: 1.17, color: ON_SURFACE, textShadow: "0 1px 3px rgba(0,0,0,.6)" }}>4K</span>}
          </button>
        ))}
      </Rail>

      {/* For you: big 250 x 375 posters */}
      <Rail title="For you" gap={16} smallTitle>
        {SPORT_FOR_YOU.map((p, k) => (
          <button key={p.t} onClick={() => demo(p.t)} aria-label={p.t} className="relative shrink-0 overflow-hidden rounded-[20px]" style={{ width: 250, height: 375 }}>
            <img src={p.img} alt="" className="w-full h-full object-cover" style={{ objectPosition: p.pos ?? "center" }} />
            {k === 0 && <span className="absolute" style={{ left: 12, bottom: 12 }}><Badge label="4K" size={29.38} /></span>}
          </button>
        ))}
      </Rail>

      <Rail title="Football For You" more onMore={() => demo("Football For You")} gap={12}>{FOOTBALL_FY.map(c => <ClipCard key={c.t} c={c} onTap={() => demo(c.t)} />)}</Rail>
      <Rail title="Basketball For You" more onMore={() => demo("Basketball For You")} gap={12}>{BASKETBALL_FY.map(c => <ClipCard key={c.t} c={c} onTap={() => demo(c.t)} />)}</Rail>
      <Rail title="Motorsport For You" more onMore={() => demo("Motorsport For You")} gap={12}>{MOTORSPORT_FY.map(c => <ClipCard key={c.t} c={c} onTap={() => demo(c.t)} />)}</Rail>

      {/* Shorts: the short dramas, 104 x 156 posters (no link to the Clips tab) */}
      <Rail title="Shorts" more onMore={() => demo("Shorts")} gap={12}>
        {SHORT_DRAMAS.map(s => <SmallPoster key={s.img} p={{ img: a(`posters/shorts/${s.img}`), t: s.t }} plat={s.plat} onTap={() => demo(s.t)} />)}
      </Rail>

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

      {/* AIS PLAY Exclusive: 253 x 380 posters */}
      <Rail title="AIS PLAY Exclusive" gap={16}>
        {SPORT_EXCLUSIVE.map((p, k) => (
          <button key={p.t} onClick={() => demo(p.t)} aria-label={p.t} className="relative shrink-0 overflow-hidden rounded-[20px]" style={{ width: 253.13, height: 379.68 }}>
            <img src={p.img} alt="" className="w-full h-full object-cover" style={{ objectPosition: p.pos ?? "center" }} />
            {k === 0 && <span className="absolute" style={{ left: 12, top: 12 }}><Badge label="4K" size={25.78} /></span>}
          </button>
        ))}
      </Rail>

      <Rail title="Underdog Stories" more bigMore onMore={() => demo("Underdog Stories")} gap={12}>{UNDERDOGS.map((p, k) => <SmallPoster key={p.t} p={p} badge={k === 0} onTap={() => demo(p.t)} />)}</Rail>
      <Rail title="Because you watched Rocky" gap={12}>{SPORT_BECAUSE.map((p, k) => <SmallPoster key={p.t} p={p} badge={k === 0} onTap={() => demo(p.t)} />)}</Rail>

      {/* Documentary: 135 x 202 posters */}
      <Rail title="Documentary" more onMore={() => demo("Documentary")} gap={12}>
        {DOCUMENTARY.map(d => (
          <button key={d.t} onClick={() => demo(d.t)} aria-label={d.t} className="relative shrink-0 overflow-hidden rounded-[12px]" style={{ width: 135, height: 202 }}>
            <img src={d.img} alt="" className="w-full h-full object-cover" style={{ objectPosition: d.pos ?? "center" }} />
          </button>
        ))}
      </Rail>

      {/* Sports Channels: the TV tab's sports channels; tapping plays the channel */}
      <Rail title="Sports Channels" gap={16}>
        {SPORT_TV.map(({ c, i }) => (
          <button key={c.no} onClick={() => onOpenChannel(i)} aria-label={`${c.name}, channel ${c.no}`} className="relative shrink-0 rounded-full" style={{ width: 80, height: 80 }}>
            <ChannelLogo c={c} size={80} />
          </button>
        ))}
      </Rail>

      {/* Seasonal / collection: a 16:9 banner with its name and a View button */}
      <section className="px-4">
        <div className="relative overflow-hidden rounded-[13px] flex flex-col items-start justify-end gap-1" style={{ height: 192.94, padding: 8.57, background: "#3a3a3a" }}>
          <img src={imgFeaturedBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <span className="absolute inset-x-0 bottom-0" style={{ height: 120, background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.7))" }} />
          <span className="relative text-white" style={{ fontSize: 19.29, lineHeight: "25.7px" }}>Golf Season</span>
          <button onClick={() => demo("Golf Season")} className="relative flex items-center justify-between rounded-full" style={{ minHeight: 42.87, minWidth: 107.19, padding: "6.4px 15px", background: "#f0f0f0", boxShadow: "0 4.3px 4.3px rgba(0,0,0,0.2)" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#282828" }}>View</span>
          </button>
        </div>
      </section>

      {/* Store, as on For you */}
      <StoreRail onOpen={onOpenStore} />

      {/* Grab the Mic: karaoke, 95px squares */}
      <Rail title="Grab the Mic" gap={12}>
        {KARAOKE.map(k => (
          <button key={k.t} onClick={() => demo(k.t)} className="flex flex-col gap-1 text-left shrink-0" style={{ width: 95 }}>
            <div className="relative overflow-hidden rounded-[11px]" style={{ width: 95, height: 95 }}>
              <img src={k.img} alt="" className="w-full h-full object-cover" />
              {k.pr && <span className="absolute left-3 bottom-3"><Badge label="4K" size={10.12} /></span>}
            </div>
            <span className="truncate" style={{ fontSize: 12, fontWeight: 500, lineHeight: "14px", color: ON_SURFACE }}>{k.t}</span>
            <span className="truncate" style={{ fontSize: 10, lineHeight: "12px", color: ON_VARIANT }}>{k.sub}</span>
          </button>
        ))}
      </Rail>

      {/* Quick access: three outlined pills */}
      <section className="flex flex-col items-center gap-6" style={{ padding: "30px 16px 22px" }}>
        <h3 className="m-0" style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.2, letterSpacing: -0.2, color: ON_SURFACE, textShadow: "0 4px 4px rgba(0,0,0,0.4)" }}>Quick access</h3>
        <div className="grid grid-cols-3 gap-3 w-full">
          {[{ t: "My List", icon: <Plus size={20} className="text-white" /> }, { t: "Download", icon: <Download size={20} className="text-white" /> }, { t: "Games" }].map(q => (
            <button key={q.t} onClick={() => demo(q.t)} className={`flex items-center justify-center gap-1 rounded-full ${q.t === "Download" ? "" : "justify-self-start"}`} style={{ minHeight: 40, minWidth: 100, padding: "6px", border: "1px solid rgba(240,240,240,0.5)" }}>
              {q.icon}
              <span className="whitespace-nowrap text-white" style={{ fontSize: 14, fontWeight: 500 }}>{q.t}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

// Top 10: posters overlapping their numerals, which sit centered on the poster's height
function TopTenRail({ items, width, height, gap, positions, onTap }: {
  items: { img: string; t: string; pos?: string }[]; width: number; height: number; gap: number; positions: { at: number; slot: number }[]; onTap: (i: number) => void;
}) {
  const top = (height - 100) / 2;
  return (
    <Rail title="Top 10" gap={gap}>
      {items.map((p, i) => {
        const art = TOP_ART[i], at = positions[i]?.at ?? (i === 9 ? 124 : 59.85);
        return (
          <button key={p.img + i} onClick={() => onTap(i)} aria-label={`#${i + 1} in Top 10`} className="relative shrink-0" style={{ height, width: positions[i]?.slot ?? at + width }}>
            {art ? <img src={art.img} alt="" className="absolute left-0 max-w-none" style={{ top, width: art.w, height: 100 }} /> : <TopNumeral n={i + 1} top={top} />}
            <img src={p.img} alt="" className="absolute top-0 max-w-none rounded-[12px] object-cover" style={{ left: at, width, height, objectPosition: p.pos ?? "center" }} />
          </button>
        );
      })}
    </Rail>
  );
}

// a pay-per-view card's name, price and badges, over a dark fade at the bottom of its poster
function PriceOverlay({ title, price, vat, plat, premium = true }: { title: string; price: string; vat: string; plat: string; premium?: boolean }) {
  return (
    <>
      <span className="absolute inset-x-0 bottom-0" style={{ height: 150, background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.75))" }} />
      <span className="absolute left-4 right-4 flex flex-col gap-[3px]" style={{ bottom: 21 }}>
        <span className="truncate" style={{ fontSize: 20, fontWeight: 500, lineHeight: "23px", color: ON_SURFACE }}>{title}</span>
        <span className="flex items-baseline gap-[3px]" style={{ color: ON_SURFACE }}>
          <span style={{ fontSize: 15, fontWeight: 500, lineHeight: "18px" }}>{price}</span>
          <span className="truncate" style={{ fontSize: 10, lineHeight: "13px" }}>{vat}</span>
        </span>
        <span className="flex items-center gap-[7px]">
          {premium && <span className="flex items-center justify-center gap-[2px] rounded-full px-[5px]" style={{ height: 15, fontSize: 9, fontWeight: 500, color: "#fff", background: "#3a3a3a" }}>
            <img src={iconCrown} alt="" style={{ width: 8, height: 8 }} />Premium
          </span>}
          <img src={tag(plat)} alt={plat} className="block object-contain" style={{ width: 30, height: 20, borderRadius: 6 }} />
        </span>
      </span>
    </>
  );
}

// a channel card (Figma "Hot Channel badge"): logo, name, favorite, premium crown and channel number
function ChannelCard({ c, i, onTap }: { c: (typeof TV_CHANNELS)[number]; i: number; onTap: () => void }) {
  return (
    <button onClick={onTap} aria-label={`${c.name}, channel ${c.no}`} className="flex flex-col items-center p-2 rounded-[8px] shrink-0"
      style={{ width: 104, background: "linear-gradient(180deg, rgba(161,161,161,0.25), rgba(65,65,65,0.25))", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
      <span className="flex justify-center pt-[2px]" style={{ width: 72, height: 72 }}><ChannelLogo c={c} size={56} /></span>
      <span className="flex flex-col items-center gap-2 w-full">
        <span className="block w-full truncate text-center text-white" style={{ fontSize: 14, lineHeight: "16px" }}>{c.name}</span>
        <span className="flex items-center justify-center gap-2 w-full">
          {tvStore.favs.has(i) && <img src={iconHeartGrey} alt="Favorite" width={16} height={16} />}
          {c.premium && <TVCrown c={c} size={16} />}
          <span className="flex items-center justify-center rounded-[4px] bg-black text-white" style={{ width: 39, height: 21, fontSize: 12, fontWeight: 600 }}>{c.no}</span>
        </span>
      </span>
    </button>
  );
}

// Movie tab filter chips: solid when selected, outlined otherwise
function MovieChips({ chip, onPick }: { chip: string; onPick: (c: string) => void }) {
  return (
    <div className="home-rail flex gap-3 overflow-x-auto overflow-y-hidden px-4">
      {MOVIE_CHIPS.map(c => {
        const on = c === chip;
        return (
          <button key={c} onClick={() => onPick(c)} aria-pressed={on} className="shrink-0 rounded-[8px] px-3" style={{
            height: 44, minWidth: 48, fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.1,
            color: on ? "#101010" : ON_SURFACE, background: on ? "#e8e8e8" : "transparent", border: on ? "2.2px solid #5a5a5a" : "2px solid rgba(232,232,232,0.5)",
          }}>{c}</button>
        );
      })}
      <span className="shrink-0" style={{ width: 4 }} />
    </div>
  );
}

// a 135 x 202 poster on the Movie tab
function MoviePoster({ p, k, netflix, plat, tag: label, onTap }: { p: { img: string; t: string }; k?: string; netflix?: boolean; plat?: string; tag?: string; onTap: () => void }) {
  return (
    <button onClick={onTap} aria-label={p.t} className="relative shrink-0 overflow-hidden rounded-[12px]" style={{ width: 135, height: 202, background: "#3a3a3a" }}>
      <img src={p.img} alt="" className="w-full h-full object-cover" />
      {label && <span className="absolute left-3 top-3 rounded-[11px] px-[6px] whitespace-nowrap" style={{ fontSize: 11, fontWeight: 500, lineHeight: "16px", letterSpacing: 0.5, color: ON_SURFACE, background: "#3a3a3a" }}>{label}</span>}
      {netflix && <img src={imgNetflix} alt="Netflix" className="absolute left-3 bottom-3 rounded-full object-cover" style={{ width: 42, height: 28 }} />}
      {plat && <OttTag plat={plat} />}
      {k && <TitleCrown k={k} right={netflix} />}
    </button>
  );
}

// a 200 x 112 card on the Movie tab, with the small Netflix badge
function MovieWide({ p, onTap }: { p: { img: string; t: string; netflix?: boolean; crop?: React.CSSProperties }; onTap: () => void }) {
  return (
    <button onClick={onTap} aria-label={p.t} className="relative shrink-0 overflow-hidden rounded-[12px]" style={{ width: 200, height: 112, background: "#3a3a3a" }}>
      <img src={p.img} alt="" className={p.crop ? "absolute max-w-none" : "w-full h-full object-cover"} style={p.crop} />
      {p.netflix && <img src={imgNetflix} alt="Netflix" className="absolute left-3 bottom-3 rounded-full object-cover" style={{ width: 30, height: 20 }} />}
    </button>
  );
}

function MovieRails({ demo, chip, onChip, chipsRef, chipsDocked, onOpenChannel }: {
  demo: (label: string) => void; chip: string; onChip: (c: string) => void; chipsRef: React.RefObject<HTMLDivElement>; chipsDocked: boolean;
  onOpenChannel: (i: number) => void;
}) {
  const [favs, setFavs] = useState(() => new Set(ACTORS.filter(x => x.fav).map(x => x.t)));
  const toggleFav = (t: string) => setFavs(prev => { const n = new Set(prev); if (n.has(t)) n.delete(t); else n.add(t); return n; });
  const posters = (list: RailEntry[]) => list.map(x => { const k = keyOf(x), m = C[k]; return <MoviePoster key={k} k={k} p={{ img: poster(k), t: m.t }} netflix={m.plat === "netflix"} onTap={() => demo(m.t)} />; });
  return (
    <div className="flex flex-col gap-6 pt-6 pb-10">
      {/* Genre chips, right under the hero; they dock inside the header on scroll, like Sport's */}
      <div ref={chipsRef} style={{ visibility: chipsDocked ? "hidden" : "visible" }}><MovieChips chip={chip} onPick={onChip} /></div>

      <Rail title="Jump Right Back In" gap={16}>
        {MOVIE_JUMP.map(c => (
          <button key={c.t} onClick={() => demo(c.t)} className="flex flex-col gap-1 text-left shrink-0" style={{ width: 200 }}>
            <div className="relative overflow-hidden rounded-[12px]" style={{ height: 112, background: "#3a3a3a" }}>
              <img src={c.img} alt="" className={c.crop ? "absolute max-w-none" : "w-full h-full object-cover"} style={c.crop} />
              {c.badge && <span className="absolute left-3 top-3 rounded-[11px] px-[6px] whitespace-nowrap" style={{ fontSize: 12, fontWeight: 500, lineHeight: "16px", letterSpacing: 0.5, color: ON_SURFACE, background: "#3a3a3a" }}>{c.badge}</span>}
              <div className="absolute inset-x-0 bottom-0 h-[6px]" style={{ background: "#4a4a4a" }}><div className="h-full" style={{ width: `${c.pct}%`, background: ON_VARIANT }} /></div>
            </div>
            <span className="truncate" style={{ fontSize: 14, fontWeight: 500, lineHeight: "23px", letterSpacing: 0.15, color: ON_SURFACE }}>{c.t}</span>
            <span style={{ fontSize: 12, lineHeight: "19px", color: ON_VARIANT }}>{c.left}</span>
          </button>
        ))}
      </Rail>

      <TopTenRail items={R.top10.map(x => ({ img: poster(x.k), t: C[x.k].t }))} width={135} height={202} gap={8} positions={MOVIE_TOP_AT} onTap={i => demo(`#${i + 1} in Top 10`)} />
      <Rail title="Hot off the Big Screen" gap={16}>{posters(R.hot)}</Rail>
      <Rail title="Short" more onMore={() => demo("Short")} gap={16}>{SHORT_DRAMAS.map(s => <MoviePoster key={s.img} p={{ img: a(`posters/shorts/${s.img}`), t: s.t }} plat={s.plat} onTap={() => demo(s.t)} />)}</Rail>

      <Rail title="For You" gap={16}>
        {FOR_YOU_LIST.map((f, n) => { const m = C[f.k]; return (
          <button key={f.k} onClick={() => demo(m.t)} aria-label={m.t} className="relative shrink-0 overflow-hidden rounded-[20px] text-left" style={{ width: 250, height: 375 }}>
            <img src={poster(f.k)} alt="" className="w-full h-full object-cover" />
            {n === 0 && <PriceOverlay title={m.t} price={`${f.price} baht`} vat={`(VAT Included: ${(f.price * 1.07).toFixed(2)} baht)`} plat={m.plat ?? "monomax"} premium={rules().showsCrown({ k: f.k })} />}
          </button>
        ); })}
      </Rail>

      <Rail title="Fresh Episode, Every Week" gap={16}>
        {MOVIE_FRESH.map(f => (
          <button key={f.t} onClick={() => demo(f.t)} className="flex flex-col gap-2 text-left shrink-0" style={{ width: 135 }}>
            <img src={f.img} alt="" className="w-full rounded-[12px] object-cover" style={{ height: 202 }} />
            <span className="truncate" style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.15, color: ON_SURFACE }}>{f.ep}</span>
          </button>
        ))}
      </Rail>

      <Rail title="Because You Watched The Hobbit" gap={16}>{posters(BECAUSE_LIST)}</Rail>

      {/* Disney+ brand strip: a teal gradient behind the picture in luminosity blend */}
      <section className="relative flex flex-col gap-3 overflow-hidden" style={{ padding: "40px 0 12px" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, #0b202f, #2a646b)", WebkitMaskImage: BAND_FADE, maskImage: BAND_FADE }}>
          <div className="absolute inset-0 overflow-hidden" style={{ mixBlendMode: "luminosity" }}>
            <img src={imgDisneyBg} alt="" className="absolute max-w-none" style={{ width: "113.75%", height: "204.75%", left: 0, top: "-36.9%" }} />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(174.44deg, rgba(105,160,167,0) 53.14%, #31c6cb 96.34%)" }} />
        </div>
        <div className="relative px-4">
          <div className="flex items-center gap-2">
            <h3 className="m-0" style={{ fontSize: 18, fontWeight: 400, lineHeight: "24px", color: ON_SURFACE }}>Disney+</h3>
            <span className="flex items-center justify-center bg-white rounded-[4px] p-1" style={{ width: 33, height: 18 }}><img src={imgDolby} alt="Dolby" className="w-full" /></span>
          </div>
          <p className="m-0" style={{ fontSize: 11, lineHeight: "16px", letterSpacing: 0.4, color: ON_VARIANT, height: 32 }}>Blockbusters, originals and family favorites,<br />now in Dolby on AIS PLAY.</p>
        </div>
        <div className="relative home-rail flex gap-3 overflow-x-auto overflow-y-hidden px-4">
          {MOVIE_DISNEY.map(p => (
            <button key={p.t} onClick={() => demo(p.t)} aria-label={p.t} className="shrink-0 overflow-hidden rounded-[12px]" style={{ width: 200, height: 112, background: "#3a3a3a" }}><img src={p.img} alt="" className="w-full h-full object-cover" /></button>
          ))}
          <span className="shrink-0" style={{ width: 4 }} />
        </div>
      </section>

      <Rail title="Movies" more onMore={() => demo("Movies")} gap={16}>{posters(MOVIE_FILMS)}</Rail>
      <Rail title="Series" more onMore={() => demo("Series")} gap={16}>{posters(MOVIE_SERIES)}</Rail>
      <Rail title="My List" more onMore={() => demo("My List")} gap={16}>{MOVIE_MY_LIST.map(p => <MovieWide key={p.t} p={p} onTap={() => demo(p.t)} />)}</Rail>
      <Rail title="Rent or Buy" more onMore={() => demo("Rent or Buy")} gap={16}>{RENT_LIST.map(r => <MoviePoster key={r.k} k={r.k} p={{ img: poster(r.k), t: C[r.k].t }} tag={r.badge} netflix={C[r.k].plat === "netflix"} onTap={() => demo(C[r.k].t)} />)}</Rail>
      <Rail title="My Rental and Buy" gap={16}>{MOVIE_RENTALS.map(p => <MovieWide key={p.t} p={p} onTap={() => demo(p.t)} />)}</Rail>

      {/* Actor: 80px portraits, a heart badge on favorites (tap to toggle) */}
      <div style={{ marginBottom: -8 }}><Rail title="Actor" gap={16} padBottom={8}>
        {ACTORS.map(x => (
          <button key={x.t} onClick={() => toggleFav(x.t)} aria-label={x.t} aria-pressed={favs.has(x.t)} className="relative shrink-0 rounded-full" style={{ width: 80, height: 80 }}>
            <span className="absolute inset-0 rounded-full overflow-hidden" style={{ background: "#3a3a3a" }}><img src={x.img} alt="" className="w-full h-full object-cover" /></span>
            {favs.has(x.t) && <span className="absolute flex items-center justify-center rounded-full bg-white" style={{ left: 52, top: 56, width: 32, height: 32 }}><img src={iconHeartDark} alt="" width={24} height={24} /></span>}
          </button>
        ))}
      </Rail></div>

      <Rail title="Soon Leaving" gap={16}>{posters(LEAVING_LIST)}</Rail>

      {/* Seasonal / collection: big posters with their name over the bottom */}
      <Rail title="" gap={16}>
        {MOVIE_SEASONAL.map(c => (
          <button key={c.t} onClick={() => demo(c.t)} className="relative shrink-0 overflow-hidden rounded-[20px] text-left" style={{ width: 250, height: 375 }}>
            <img src={c.img} alt="" className="w-full h-full object-cover" />
            <span className="absolute inset-x-0 bottom-0" style={{ height: 140, background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.75))" }} />
            <span className="absolute text-white" style={{ left: 23, top: 281, width: 114, fontSize: 24, fontWeight: 400, lineHeight: "22px" }}>{c.t}</span>
          </button>
        ))}
      </Rail>

      <Rail title="Movie Channel" gap={16}>{MOVIE_TV.map(({ c, i }) => <ChannelCard key={c.no} c={c} i={i} onTap={() => onOpenChannel(i)} />)}</Rail>
    </div>
  );
}

// a small rounded badge (Figma "Badge 1"); its padding scales with the text, as in the design
function Badge({ label, size = 11, bg = "#3a3a3a" }: { label: string; size?: number; bg?: string }) {
  return <span className="inline-flex items-center justify-center rounded-full whitespace-nowrap" style={{ fontSize: size, fontWeight: 500, lineHeight: 1.17, padding: `0 ${size * 0.545}px`, color: ON_SURFACE, background: bg }}>{label}</span>;
}

// a 104 x 156 poster on the Sport tab, with an optional 4K badge at the bottom left
function SmallPoster({ p, badge, plat, onTap }: { p: SportPoster; badge?: boolean; plat?: string; onTap: () => void }) {
  return (
    <button onClick={onTap} aria-label={p.t} className="relative shrink-0 overflow-hidden rounded-[12px]" style={{ width: 104, height: 156, background: "#3a3a3a" }}>
      <img src={p.img} alt="" className="w-full h-full object-cover" style={{ objectPosition: p.pos ?? "center" }} />
      {badge && <span className="absolute" style={{ left: 12, bottom: 12 }}><Badge label="4K" size={12.22} /></span>}
      {plat && <OttTag plat={plat} />}
      {p.k && <TitleCrown k={p.k} right={badge} />}
    </button>
  );
}

// Top 10 numerals past Figma's 1 to 3: text in the same size and gradient
function TopNumeral({ n, top }: { n: number; top: number }) {
  return (
    <span className="absolute left-0 select-none" style={{
      top, height: 100, fontSize: 140, fontWeight: 700, lineHeight: "100px", letterSpacing: n === 10 ? -10 : 0,
      background: "linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))",
      WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
    }}>{n}</span>
  );
}

// a 16:9 sport clip (200 x 112): LIVE badge at the top left, its length at the bottom right, title up to two lines
function ClipCard({ c, onTap }: { c: Clip; onTap: () => void }) {
  return (
    <button onClick={onTap} className="flex flex-col gap-1 text-left shrink-0" style={{ width: 200 }}>
      <div className="relative overflow-hidden rounded-[12px]" style={{ height: 112, background: "#3a3a3a" }}>
        <img src={c.img} alt="" className="w-full h-full object-cover" />
        {c.live && <span className="absolute left-3 top-3"><LivePill /></span>}
        {c.d && <span className="absolute right-3 bottom-3 rounded-[14px] px-2" style={{ fontSize: 14, fontWeight: 500, color: "#000", background: "#fff" }}>{c.d}</span>}
      </div>
      <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.15, color: ON_SURFACE, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.t}</span>
    </button>
  );
}

// Store (Figma 3026:209018): a full-width PLAY banner with Explore Packages over it (For you and Sports)
// Store › and Explore Packages open the Store page
function StoreRail({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-1 px-4">
        <h3 className="m-0" style={{ fontSize: 18, fontWeight: 400, lineHeight: "24px", color: ON_SURFACE }}>Store</h3>
        <button onClick={onOpen} aria-label="Open Store" className="p-1 rounded-full"><ChevronRight size={20} className="text-white" /></button>
      </div>
      <div className="relative w-full overflow-hidden" style={{ height: 112 }}>
        {/* the banner art, cropped as in Figma (zoomed so the PLAY logo and partner logos fill the strip); only the picture fades */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ WebkitMaskImage: BAND_FADE, maskImage: BAND_FADE }}>
          <img src={imgStoreBanner} alt="" className="absolute max-w-none" style={{ width: "106.65%", height: "200.86%", left: "-3.33%", top: "-44.17%", objectFit: "cover" }} />
        </div>
        <button onClick={onOpen} className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center rounded-[10px]"
          style={{ top: 40, width: 300, maxWidth: "calc(100% - 32px)", minHeight: 48, background: "#f0f0f0", boxShadow: "0 4px 4px rgba(0,0,0,0.2)" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#282828" }}>Explore Packages</span>
        </button>
      </div>
    </section>
  );
}

// a 135 x 202 poster: optional badge at the top left (New / Top 10 / Leaving Soon), and the Netflix pill or the
// premium crown at the bottom left
function PosterCard({ p, onTap }: { p: Poster; onTap: () => void }) {
  return (
    <button onClick={onTap} aria-label={p.t} className="relative shrink-0 overflow-hidden rounded-[12px]" style={{ width: 135, height: 202, background: "#3a3a3a" }}>
      <img src={p.img} alt="" className="w-full h-full object-cover" />
      {p.tag && <span className="absolute whitespace-nowrap rounded-full px-[9px]" style={{ left: 12, top: 12, fontSize: 14, lineHeight: "18px", fontWeight: 500, color: ON_SURFACE, background: "#3a3a3a" }}>{p.tag}</span>}
      {p.netflix && <img src={imgNetflix} alt="Netflix" className="absolute rounded-full object-cover" style={{ left: 12, bottom: 12, width: 42, height: 21 }} />}
      {p.k && <TitleCrown k={p.k} right={p.netflix} />}
      {p.plat && <OttTag plat={p.plat} />}
    </button>
  );
}

// an OTT app's logo tag, 12px in from a poster's bottom left corner
// a title's premium crown (rules.js): only until the viewer has it; right: the bottom left corner is taken
function TitleCrown({ k, right }: { k: string; right?: boolean }) {
  if (!rules().showsCrown({ k })) return null;
  return <img src={iconCrown} alt="Premium" className="absolute" style={{ ...(right ? { right: 12 } : { left: 12 }), bottom: 12, width: 20, height: 20 }} />;
}

function OttTag({ plat }: { plat: string }) {
  return <img src={tag(plat)} alt={plat} className="absolute left-3 bottom-3" style={{ width: 42, height: 28 }} />;
}

// Choose what you like: a preview of three topics and the button that opens the interests picker
function ChooseInterests({ onChoose, onPick }: { onChoose: () => void; onPick: (label: string) => void }) {
  return (
    <section className="px-4">
      <div className="flex flex-col gap-3 rounded-[12px] px-4 py-5" style={{ background: "#1c1c1c" }}>
        <div>
          <h3 className="m-0" style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.2, letterSpacing: -0.2, color: ON_SURFACE, textShadow: "0 4px 4px rgba(0,0,0,0.4)" }}>Choose what you like</h3>
          <p className="m-0" style={{ fontSize: 12, lineHeight: "16px", letterSpacing: 0.4, color: ON_VARIANT, textShadow: "0 4px 4px rgba(0,0,0,0.4)" }}>Pick 3 or more. Your Home will show rails for the topics you choose.</p>
        </div>
        <div className="flex items-center justify-between">
          {CHOOSE.map(c => (
            <button key={c.t} onClick={() => onPick(c.t)} className="relative overflow-hidden rounded-[11px] flex items-center justify-center" style={{ width: 95, height: 95, background: "#3a3a3a" }}>
              <img src={c.img} alt="" className="absolute max-w-none" style={c.crop} />
              <span className="absolute inset-0" style={{ background: `rgba(0,0,0,${c.dim})` }} />
              <span className="relative whitespace-nowrap" style={{ fontSize: c.fontSize, fontWeight: 500, lineHeight: "18px", color: ON_SURFACE }}>{c.t}</span>
            </button>
          ))}
        </div>
        <ChooseButton onTap={onChoose} />
      </div>
    </section>
  );
}

function ChooseButton({ onTap }: { onTap: () => void }) {
  return (
    <button onClick={onTap} className="relative w-full flex items-center justify-center rounded-[99px] px-3" style={{ height: 32, background: "#f0f0f0", boxShadow: "0 4px 3px rgba(0,0,0,0.1)" }}>
      <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.15, color: "#282828" }}>Choose interests</span>
    </button>
  );
}

// a small status badge (Figma "Mobile / Badge"): red with LIVE, dark for a start time
function StatusPill({ label, live }: { label: string; live?: boolean }) {
  return (
    <span className="inline-flex items-center justify-center gap-1 rounded-full px-[6px] whitespace-nowrap" style={{ height: 13, fontSize: 11, fontWeight: 500, color: live ? "#fff" : ON_SURFACE, background: live ? LIVE : "#3a3a3a" }}>
      <span className="rounded-full bg-white shrink-0" style={{ width: 8, height: 8 }} />{label}
    </span>
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

function Rail({ title, more, bigMore, smallTitle, onMore, gap = 12, padBottom = 0, children }: {
  title: string; more?: boolean; bigMore?: boolean; smallTitle?: boolean; onMore?: () => void; gap?: number; padBottom?: number; children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      {title && <div className={`flex items-center px-4 ${bigMore ? "" : "gap-1"}`}>
        <h3 className="m-0" style={smallTitle ? { fontSize: 16, fontWeight: 500, lineHeight: 1.2, letterSpacing: -0.2, color: ON_SURFACE } : { fontSize: 18, fontWeight: 400, lineHeight: "24px", color: ON_SURFACE }}>{title}</h3>
        {more && <button onClick={onMore} aria-label={`More ${title}`} className={`${bigMore ? "p-1.5" : "p-1"} rounded-full`}><ChevronRight size={bigMore ? 20 : 16} className="text-white" /></button>}
      </div>}
      {/* overflow-y hidden: rails scroll sideways only, so an up/down swipe over one scrolls the page */}
      <div className="home-rail flex overflow-x-auto overflow-y-hidden px-4" style={{ gap, paddingBottom: padBottom, scrollPaddingLeft: 16 }}>
        {children}
        <span className="shrink-0" style={{ width: 4 }} />
      </div>
    </section>
  );
}
