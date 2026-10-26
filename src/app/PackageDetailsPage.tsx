import { useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import icCheck from "../assets/pkg-details/check-circle.svg";
import icChevron from "../assets/pkg-details/chevron.svg";
import icDolby from "../assets/sports-pkg/icon-dolby.svg";
import icPhone from "../assets/pkg-details/phone.svg";
import icTablet from "../assets/pkg-details/tablet.svg";
import icLaptop from "../assets/pkg-details/laptop.svg";
import icTv from "../assets/pkg-details/tv.svg";
import logoNetflix from "../assets/sports-pkg/logo-netflix.png";
import logoHbo from "../assets/sports-pkg/logo-hbo.jpg";
import logoHotstar from "../assets/sports-pkg/logo-hotstar.jpg";
import logoIqiyi from "../assets/pkg-details/iqiyi.png";
import logoViu from "../assets/pkg-details/viu.png";
import logoWetv from "../assets/pkg-details/wetv.png";
import lgUcl from "../assets/pkg-details/ucl.png";
import lgBundesliga from "../assets/sports-pkg/logo-bundesliga.png";
import lgMotogp from "../assets/pkg-details/motogp.png";
import lgNba from "../assets/pkg-details/nba.png";
import lgPl from "../assets/sport/lg-pl.png";
import lgFacup from "../assets/sport/lg-facup.png";
import lgRws from "../assets/sport/lg-rws.png";
import chCn from "../assets/pkg-details/cn.png";
import chCnn from "../assets/pkg-details/cnn.png";
import chEurosport from "../assets/pkg-details/eurosport.png";
import chDiscovery from "../assets/pkg-details/discovery.png";
import { CHANNELS, ChannelLogo } from "./TVScreen";
import type { Pkg } from "./PackagesPage";
import CoverageSheet, { type CoverageItem } from "./CoverageSheet";
import TermsSheet from "./TermsSheet";
import PaymentPage, { AIS_ACCOUNT, type Method } from "./PaymentPage";
import CvvSheet from "./CvvSheet";
import OtpPage from "./OtpPage";
import QrSheet from "./QrSheet";
import PurchaseDonePage from "./PurchaseDonePage";
import { PAGE_BG, ON_SURFACE, ON_VARIANT, PANEL, OUTLINE, headerGlass } from "./theme";

// ─── Package Details (Figma "Store" file, AIS PLAY: store_packageDetails 4425:145449) ───────────────────────────────
// Opened from View details on a package card: back + "Package Details" over the page (glass once it scrolls, like the
// package list), the package (Recommend, logo, name) with its price plans to pick from (a side-scrolling row, the
// picked one outlined with a check, dots under it), the streaming apps it includes (screens, 4K, Dolby), Sports and
// Premium Channels coverage, the devices it plays on and a description; a sticky bar shows the picked plan with VAT
// and Confirm. Built from the package's own tags, so every package in the list has a details page.

const FONT = "'Open Sans', sans-serif";
const CARD = { background: PANEL, boxShadow: "inset 0 0 0 1px rgba(214,222,240,0.12)" };
const VAT = 0.07;

// the streaming apps a package can carry (Figma "Included service" rows); apps without a logo file get a text badge,
// and short-drama apps stream in HD (no 4K / Dolby)
type Service = { name: string; logo?: string; text?: string; bg?: string; screens: number; contain?: boolean; hd?: boolean };
const SERVICES: Record<string, Service> = {
  "Netflix": { name: "Netflix", logo: logoNetflix, screens: 4 },
  "HBO Max": { name: "HBO Max", logo: logoHbo, screens: 4, contain: true },
  "Disney+": { name: "Disney+ Hotstar", logo: logoHotstar, screens: 4, contain: true },
  "iQIYI": { name: "iQIYI", logo: logoIqiyi, screens: 2 },
  "VIU": { name: "Viu", logo: logoViu, screens: 5 },
  "WeTV": { name: "WeTV", logo: logoWetv, screens: 2, contain: true },
  "MONOMAX": { name: "MONOMAX", text: "MX", bg: "#1b1b1b", screens: 2 },
  "ReelShort": { name: "ReelShort", text: "RS", bg: "#e5322d", screens: 1, hd: true },
  "DramaBox": { name: "DramaBox", text: "DB", bg: "#f5a623", screens: 1, hd: true },
  "ShortMax": { name: "ShortMax", text: "SM", bg: "#7b4dff", screens: 1, hd: true },
};
// league and tournament logos for Sports coverage (square tiles on white), each fitted as Figma crops it
type Logo = { src: string; fit?: "cover"; pad?: number; name?: string };
const LEAGUES: Record<string, Logo> = {
  "Champions League": { src: lgUcl, name: "UEFA Champions League" }, "Bundesliga": { src: lgBundesliga, pad: 6 }, "MotoGP": { src: lgMotogp, pad: 1 },
  "NBA": { src: lgNba, fit: "cover" }, "Premier League": { src: lgPl, fit: "cover" }, "FA Cup": { src: lgFacup, pad: 2, name: "Emirates FA Cup" },
  "RWS": { src: lgRws, fit: "cover", name: "Rajadamnern World Series" },
};
const PREMIUM: CoverageItem[] = [
  { name: "Cartoon Network", src: chCn }, { name: "CNN News", src: chCnn }, { name: "Eurosport", src: chEurosport }, { name: "Discovery", src: chDiscovery },
].map(c => ({ key: c.name, name: c.name, tile: size => <Tile src={c.src} size={size} /> }));
// the TV guide's channels (round logos) carry on each list after its own logos
const uniq = (cs: typeof CHANNELS) => cs.filter((c, k) => cs.findIndex(x => x.name === c.name) === k);
const asItem = (c: (typeof CHANNELS)[number]): CoverageItem => ({ key: `ch${c.no}`, name: c.name, tile: size => <ChannelLogo c={c} size={size} /> });
const SPORTS_CHANNELS = uniq(CHANNELS.filter(c => c.cats.includes("Sports"))).map(asItem);
const PREMIUM_CHANNELS = uniq(CHANNELS.filter(c => c.premium && !c.cats.includes("Sports"))).map(asItem);
// a coverage card shows this many logos, then a count of the rest
const SHOWN = 7;
const DEVICES = [{ t: "Phone", icon: icPhone }, { t: "Tablet", icon: icTablet }, { t: "Laptop", icon: icLaptop }, { t: "TV", icon: icTv }];

type Plan = { kind: string; price: number; per: string };
// "Month" / "Year" / "Day" for a plan, and the period it covers from today ("9 Sep 2026 - 8 Oct 2026")
const unit = (plan: Plan) => plan.per === "Daily" ? "Day" : plan.per === "Yearly" ? "Year" : "Month";
const periodOf = (plan: Plan) => {
  const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const start = new Date(), end = new Date(start);
  if (plan.per === "Yearly") end.setFullYear(end.getFullYear() + 1);
  else if (plan.per === "Monthly") end.setMonth(end.getMonth() + 1);
  if (plan.per !== "Daily") end.setDate(end.getDate() - 1);
  return plan.per === "Daily" ? fmt(start) : `${fmt(start)} - ${fmt(end)}`;
};
// the terms for a package and plan (Terms and Conditions sheet)
const termsFor = (p: Pkg, plan: Plan) => [
  `${p.t} (${plan.per} plan) costs ${baht(plan.price)} baht per ${plan.per === "Daily" ? "day" : plan.per === "Yearly" ? "year" : "month"}, excluding 7% VAT (${baht(plan.price * (1 + VAT), 2)} baht including VAT). The charge is billed to your AIS account or the payment method you choose at checkout.`,
  plan.kind === "Recurring"
    ? `The package renews automatically at the end of each ${plan.per === "Yearly" ? "year" : "month"} at the price then in effect until you cancel. You can cancel at any time from My Subscription; cancelling stops the next renewal and you keep access until the end of the period already paid for. Payments already made are not refunded, except where required by law.`
    : `This is a one-time purchase that gives access for one day from the moment of purchase. It does not renew, and the charge is not refundable once the package is active.`,
  `The package can be watched on up to ${p.screens} screen${p.screens > 1 ? "s" : ""} at the same time, on phones, tablets, laptops and TVs signed in to the same AIS PLAY account. Picture quality (up to 4K and Dolby Atmos where offered) depends on your device, network and the content itself.`,
  `Channels, apps, leagues and titles included in the package may change because of rights agreements with content partners. AIS will tell you about significant changes in advance where possible. Live events can be moved, delayed or blacked out by the rights holders.`,
  `Partner apps included in the package (such as streaming services) may need their own account activation, and are also subject to that partner's terms of use and privacy policy.`,
  `The package is for personal, non-commercial viewing in Thailand only. Recording, re-broadcasting, sharing your account outside your household or showing content in public venues is not allowed and may lead to the package being suspended without refund.`,
  `AIS may update these terms. Continuing to use the package after an update means you accept the updated terms. For help, call 1175 (AIS) or 1530 (3BB), or visit the myAIS website.`,
];
const num = (s: string) => Number(s.replace(/,/g, ""));
const baht = (n: number, dp = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
// the package's plans, from the durations it's sold in
const plansOf = (p: Pkg): Plan[] => {
  const m = num(p.price);
  return p.duration.map(d => d === "Daily" ? { kind: "One time", price: Math.max(19, Math.round(m / 25)), per: "Daily" }
    : d === "Yearly" ? { kind: "Recurring", price: m * 10, per: "Yearly" }
    : { kind: "Recurring", price: m, per: "Monthly" });
};

export default function PackageDetailsPage({ p, topInset, bottomInset = "0px", onBack, onToast }: {
  p: Pkg; topInset: string; bottomInset?: string; onBack: () => void; onToast: (msg: string) => void;
}) {
  const plans = plansOf(p);
  // open on the monthly plan when there is one
  const [pick, setPick] = useState(Math.max(0, plans.findIndex(x => x.per === "Monthly")));
  const [scrolled, setScrolled] = useState(false);
  const planRow = useRef<HTMLDivElement>(null);
  const choose = (k: number) => {
    setPick(k);
    (planRow.current?.children[k] as HTMLElement | undefined)?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  };
  const plan = plans[pick];
  const services = p.apps.map(a => SERVICES[a]).filter(Boolean);
  const [sheet, setSheet] = useState<"Sports" | "Premium Channels" | null>(null);
  // Confirm opens the Terms and Conditions; agreeing opens the payment methods, and paying completes the (demo)
  // subscription
  const [terms, setTerms] = useState(false);
  const [paying, setPaying] = useState(false);
  // after Process Payment: the AIS bill asks for an OTP first, QR PromptPay shows its QR to pay, a saved card asks for
  // its CVV; every method ends on Purchase complete (its receipt line)
  const [otp, setOtp] = useState(false);
  const [qr, setQr] = useState(false);
  const [cvvCard, setCvvCard] = useState<Method | null>(null);
  const [paidWith, setPaidWith] = useState<string | null>(null);
  const [method, setMethod] = useState("");
  const sports: CoverageItem[] = [
    ...p.league.filter(l => LEAGUES[l]).map(l => ({ key: l, name: LEAGUES[l].name ?? l, tile: (size: number) => <Tile {...LEAGUES[l]} size={size} /> })),
    ...SPORTS_CHANNELS,
  ];
  const premium = [...PREMIUM, ...PREMIUM_CHANNELS];
  const label = { fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.15, color: ON_SURFACE };
  const small = { fontSize: 12, lineHeight: "16px", letterSpacing: 0.4 };

  return (
    <div className="absolute inset-0 z-50" style={{ background: PAGE_BG, fontFamily: FONT }}>
      {/* header: back + "Package Details" */}
      <div className="absolute inset-x-0 top-0 z-10 transition-all duration-300" style={{ paddingTop: topInset, ...headerGlass(scrolled) }}>
        <div className="flex items-center gap-2 px-4" style={{ height: 64 }}>
          <button onClick={onBack} aria-label="Back" className="w-8 h-8 rounded-full flex items-center justify-center"><ChevronLeft size={24} color="#fff" /></button>
          <h1 className="m-0" style={{ fontSize: 20, fontWeight: 600, color: ON_SURFACE }}>Package Details</h1>
        </div>
      </div>

      <div className="absolute inset-0 overflow-y-auto overflow-x-hidden details-scroll" onScroll={e => setScrolled(e.currentTarget.scrollTop > 0)}>
        <div style={{ height: `calc(${topInset} + 64px)` }} />
        <div className="flex flex-col gap-4 px-4 pb-4">
          {/* the package and its plans */}
          <section className="flex flex-col gap-2 p-2 rounded-[8px] overflow-hidden" style={CARD}>
            {p.best && <span className="self-start flex items-center rounded-[14px] px-2" style={{ height: 24, fontSize: 14, fontWeight: 500, color: ON_SURFACE, background: "rgba(0,0,0,0.3)" }}>Recommend</span>}
            <div className="flex items-center gap-2">
              <img src={p.img} alt="" className="shrink-0 rounded-[8px]" style={{ width: 60, height: 60, background: "#000", objectFit: p.contain ? "contain" : "cover" }} />
              <span className="flex-1 truncate" style={{ fontSize: 18, lineHeight: "24px", color: "#fff" }}>{p.t}</span>
            </div>
            <div ref={planRow} className="details-rail flex gap-2 overflow-x-auto -mx-2 px-2" style={{ scrollSnapType: "x mandatory", scrollPaddingInline: 8 }}>
              {plans.map((x, k) => (
                <button key={x.per} onClick={() => choose(k)} aria-pressed={k === pick} className="shrink-0 flex items-start rounded-[8px] px-2 py-4 text-left transition-all duration-200"
                  style={{ width: k === pick ? 300 : 250, scrollSnapAlign: "start", background: "rgba(255,255,255,0.10)", border: `2px solid ${k === pick ? "#fff" : "transparent"}` }}>
                  <span className="flex-1 flex flex-col items-start gap-1 min-w-0">
                    <span className="flex items-center rounded-[11px] px-[6px]" style={{ fontSize: 11, fontWeight: 500, color: ON_SURFACE, background: "rgba(0,0,0,0.3)" }}>{x.kind}</span>
                    <span className="flex items-end gap-1 whitespace-nowrap" style={{ color: "#f0f0f0" }}>
                      <span style={{ fontSize: 20, fontWeight: 700, lineHeight: "24px" }}>{baht(x.price)} baht</span>
                      <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.1 }}>/ {x.per}</span>
                    </span>
                  </span>
                  {k === pick && <img src={icCheck} alt="" width={16} height={16} className="shrink-0" />}
                </button>
              ))}
            </div>
            {plans.length > 1 && (
              <div className="flex justify-center">
                <div className="flex items-center gap-[6px] p-1">
                  {plans.map((x, k) => (
                    <button key={x.per} onClick={() => choose(k)} aria-label={`${x.per} plan`} className="relative rounded-full transition-all duration-300"
                      style={{ height: 8, width: k === pick ? 24 : 8, background: "#666" }}>
                      {k === pick && <span className="absolute left-0 top-0 rounded-full" style={{ width: 8, height: 8, background: "#e6e6e6" }} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* the streaming apps it includes */}
          {services.length > 0 && (
            <section className="flex flex-col gap-1 rounded-[10px] overflow-hidden" style={CARD}>
              {services.map(s => (
                <div key={s.name} className="flex items-end gap-3 px-3 py-2" style={{ height: 56 }}>
                  {s.logo
                    ? <img src={s.logo} alt="" className="shrink-0 rounded-[16px]" style={{ width: 40, height: 40, background: "#000", objectFit: s.contain ? "contain" : "cover" }} />
                    : <span className="shrink-0 flex items-center justify-center rounded-[16px]" style={{ width: 40, height: 40, fontSize: 13, fontWeight: 800, color: "#fff", background: s.bg }}>{s.text}</span>}
                  <div className="flex-1 flex flex-col min-w-0">
                    <span className="truncate" style={{ ...label, letterSpacing: 0.1 }}>{s.name}</span>
                    <div className="flex items-center gap-2" style={{ height: 21 }}>
                      <span className="whitespace-nowrap" style={{ ...small, color: ON_VARIANT }}>{s.screens} screen{s.screens > 1 ? "s" : ""}</span>
                      <span className="flex items-center rounded-[11px] px-[6px]" style={{ fontSize: 11, fontWeight: 500, color: ON_SURFACE, border: "1px solid #5a5a5a" }}>{s.hd ? "HD" : "4K"}</span>
                      {!s.hd && <img src={icDolby} alt="Dolby Atmos" width={40} height={40} />}
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Sports and Premium Channels coverage: up to 7 logos and a count of the rest */}
          {p.league.length > 0 && <Coverage title="Sports" items={sports} onMore={() => setSheet("Sports")} />}
          {p.channels > 0 && <Coverage title="Premium Channels" items={premium} onMore={() => setSheet("Premium Channels")} note="Enjoy Premium Channels on AIS PLAY" />}

          {/* devices */}
          <section className="flex flex-col gap-2 p-3 rounded-[16px]" style={CARD}>
            <span style={label}>Available on</span>
            <div className="flex gap-4">
              {DEVICES.map(d => (
                <span key={d.t} className="flex flex-col items-center gap-2">
                  <img src={d.icon} alt="" width={24} height={24} />
                  <span style={{ ...small, color: "#c6c6c6" }}>{d.t}</span>
                </span>
              ))}
            </div>
          </section>

          <Description p={p} label={label} small={small} />
        </div>
        {/* room for the sticky bar */}
        <div style={{ height: `calc(${bottomInset} + 96px)` }} />
      </div>

      {/* sticky: the picked plan with VAT, and Confirm */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-4 px-4 pt-2"
        style={{ paddingBottom: bottomInset, background: "rgba(7,14,22,0.82)", borderTop: `1px solid ${OUTLINE}`, backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)" }}>
        <span style={{ fontSize: 18, lineHeight: "24px", color: ON_SURFACE }}>VAT included: {baht(plan.price * (1 + VAT), 2)} baht</span>
        <button onClick={() => setTerms(true)} className="w-full rounded-[10px] flex items-center justify-center"
          style={{ minHeight: 48, background: "#f0f0f0", boxShadow: "0 4px 4px rgba(0,0,0,0.2)" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#282828" }}>Confirm</span>
        </button>
      </div>
      {terms && <TermsSheet topInset={topInset} bottomInset={bottomInset} terms={termsFor(p, plan)}
        onAgree={() => { setTerms(false); setPaying(true); }} onClose={() => setTerms(false)} />}
      {paying && <PaymentPage topInset={topInset} bottomInset={bottomInset}
        order={{ title: p.t, img: p.img, contain: p.contain, recurring: plan.kind === "Recurring",
          price: `${baht(plan.price)} baht / ${plan.per === "Daily" ? "Day" : plan.per === "Yearly" ? "Year" : "Month"}`, vatIncluded: baht(plan.price * (1 + VAT), 2) }}
        onPay={m => { setMethod(m.label); if (m.id === "ais") setOtp(true); else if (m.id === "qr") setQr(true); else if (m.id.startsWith("card")) setCvvCard(m); else setPaidWith(m.label); }} onBack={() => setPaying(false)} />}
      {otp && <OtpPage topInset={topInset} bottomInset={bottomInset} account={AIS_ACCOUNT}
        amount={`${baht(plan.price * (1 + VAT), 2)} baht`} per={unit(plan)}
        onConfirm={() => { setOtp(false); setPaidWith(method); }} onClose={() => setOtp(false)} onToast={onToast} />}
      {qr && <QrSheet topInset={topInset} account={AIS_ACCOUNT} amount={`${baht(plan.price * (1 + VAT), 2)} baht`}
        onPaid={() => { setQr(false); setPaidWith(method); }} onClose={() => setQr(false)} onToast={onToast} />}
      {cvvCard && <CvvSheet bottomInset={bottomInset} card={cvvCard}
        onPaid={() => { setCvvCard(null); setPaidWith(method); }} onClose={() => setCvvCard(null)} />}
      {paidWith && <PurchaseDonePage topInset={topInset} bottomInset={bottomInset}
        receipt={{ pkg: p.t.endsWith(" Package") ? `${p.t.slice(0, -8)} ${plan.per} Package` : `${p.t} (${plan.per})`, img: p.img, contain: p.contain,
          method: paidWith, duration: periodOf(plan), amount: `${baht(plan.price)} baht / ${unit(plan)} (VAT incl. ${baht(plan.price * (1 + VAT), 2)} baht)` }}
        onActivate={() => onToast("Opening the activation link (demo)")} onExplore={onBack} />}
      {sheet && <CoverageSheet title={sheet} items={sheet === "Sports" ? sports : premium} onClose={() => setSheet(null)} />}
      <style>{`.details-scroll,.details-rail{scrollbar-width:none}.details-scroll::-webkit-scrollbar,.details-rail::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}

// a square logo on white (pad scales with the tile)
function Tile({ src, fit, pad = 0, size = 32 }: Logo & { size?: number }) {
  return <img src={src} alt="" className="shrink-0 rounded-[4px]" style={{ width: size, height: size, background: "#fff", objectFit: fit ?? "contain", padding: pad * size / 32 }} />;
}

// a coverage card: heading with a chevron (opens the full list), the first 7 logos at 32px and a count of the rest,
// an optional note
function Coverage({ title, items, note, onMore }: { title: string; items: CoverageItem[]; note?: string; onMore: () => void }) {
  const more = items.length - SHOWN;
  return (
    <section className="flex flex-col gap-2 p-3 rounded-[16px]" style={CARD}>
      <button onClick={onMore} className="flex items-center gap-2 text-left">
        <span className="flex-1" style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.15, color: ON_SURFACE }}>{title}</span>
        <span className="p-1"><img src={icChevron} alt="" width={16} height={16} /></span>
      </button>
      <div className="flex items-start justify-between">
        {items.slice(0, SHOWN).map(it => <span key={it.key} className="shrink-0">{it.tile(32)}</span>)}
        {more > 0 && <span className="flex items-center justify-center rounded-[4px]" style={{ width: 32, height: 32, fontSize: 11, fontWeight: 500, color: "#000", background: "#c9c9c9" }}>{more}+</span>}
      </div>
      {note && <span style={{ fontSize: 12, lineHeight: "16px", letterSpacing: 0.4, color: "#c6c6c6" }}>{note}</span>}
    </section>
  );
}

// the description, clamped to 6 lines with Read more
function Description({ p, label, small }: { p: Pkg; label: React.CSSProperties; small: React.CSSProperties }) {
  const [open, setOpen] = useState(false);
  const apps = p.apps.length ? ` Stream ${p.apps.join(", ")} in one subscription.` : "";
  // sports packages lead with their leagues and channels, the others with what they're for (the card's note)
  const lead = p.league.length ? `${p.t} brings you ${p.league.join(", ")} live and on demand, with +${p.channels} premium channels on AIS PLAY.`
    : `${p.t}: ${p.note ?? "movies and series"} on AIS PLAY.`;
  const text = `${lead}${apps} Watch in ${p.hd ? "HD" : "up to 4K with Dolby Atmos"} on your phone, tablet, laptop and TV, on up to ${p.screens} screen${p.screens > 1 ? "s" : ""} at once. Prices exclude 7% VAT; recurring plans renew automatically until cancelled from My Subscription.`;
  return (
    <section className="flex flex-col gap-2 p-3 rounded-[16px]" style={CARD}>
      <span style={label}>Description</span>
      <p className="m-0" style={{ ...small, color: ON_VARIANT, ...(open ? {} : { display: "-webkit-box", WebkitLineClamp: 6, WebkitBoxOrient: "vertical", overflow: "hidden" }) }}>{text}</p>
      <button onClick={() => setOpen(o => !o)} className="self-start" style={{ ...small, fontWeight: 600, color: ON_SURFACE }}>{open ? "Show less" : "Read more"}</button>
    </section>
  );
}
