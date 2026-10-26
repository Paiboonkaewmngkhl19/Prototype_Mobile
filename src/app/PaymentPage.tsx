import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import icRadio from "../assets/payment/radio.svg";
import icPlus from "../assets/payment/plus.svg";
import icSpinner from "../assets/payment/spinner.svg";
import icCheck from "../assets/pkg-details/check-circle.svg";
import { BG, PAGE_BG, ON_SURFACE, ON_VARIANT, OUTLINE, headerGlass } from "./theme";

// ─── Payment method page (Figma "Store" file, PLAY:store_paymentMethod 4417:143924) ───────────────────────────────
// Opened by I Agree and Confirm on the Terms and Conditions: a page with back + "Choose how to pay", the order
// (package logo, name, price, VAT included), then the ways to pay, one picked at a time — Charge to AIS Bill, QR
// PromptPay, saved Credit/Debit Cards (a side-scrolling row, with Add new card) and Mobile Banking (a 2-column grid).
// The picked one is outlined with a check; the others show an empty radio. A sticky bar notes how it's charged and
// Process Payment completes the (demo) purchase. Wireframe logo slots carry each method's brand colour and initials.

export interface Order { title: string; img: string; contain?: boolean; price: string; vatIncluded: string; recurring: boolean }

// a method's logo: brand colour + short mark
export type Mark = { text: string; bg: string; fg?: string };
export type Method = { id: string; title: string; sub?: string; mark: Mark };
// the AIS billing account the bill option charges (Confirm OTP shows it masked)
export const AIS_ACCOUNT = "8801234456";
const AIS_BILL: Method = { id: "ais", title: AIS_ACCOUNT, mark: { text: "AIS", bg: "#7ab800" } };
const PROMPTPAY: Method = { id: "qr", title: "QR PromptPay", sub: "Scan a code with a banking app", mark: { text: "QR", bg: "#113566" } };
const CARDS: Method[] = [
  { id: "card1", title: "*****1234", sub: "Master Card", mark: { text: "MC", bg: "#eb001b" } },
  { id: "card2", title: "*****5678", sub: "Visa", mark: { text: "VISA", bg: "#1a1f71" } },
  { id: "card3", title: "*****9012", sub: "JCB", mark: { text: "JCB", bg: "#0b4ea2" } },
];
// how long Process Payment loads for a mobile banking app
const BANK_LOADING_MS = 3000;
const BANKS: Method[] = [
  { id: "kbank", title: "K PLUS", mark: { text: "K", bg: "#138f2d" } },
  { id: "scb", title: "SCB EASY", mark: { text: "SCB", bg: "#4e2a84" } },
  { id: "ktb", title: "Krungthai NEXT", mark: { text: "KTB", bg: "#00a6e6" } },
  { id: "bbl", title: "Bualuang mBanking", mark: { text: "BBL", bg: "#1e4598" } },
  { id: "bay", title: "KMA Krungsri", mark: { text: "BAY", bg: "#ffd400", fg: "#4b3b2f" } },
  { id: "ttb", title: "ttb touch", mark: { text: "ttb", bg: "#0050f0" } },
  { id: "gsb", title: "MyMo GSB", mark: { text: "GSB", bg: "#eb198d" } },
  { id: "uob", title: "UOB TMRW", mark: { text: "UOB", bg: "#0b3b8c" } },
];

// how a method reads on the receipt: "Charge to AIS Bill: 8801234456", "Master Card *****1234", "K PLUS"…
const label = (m: Method) => m.id === AIS_BILL.id ? `Charge to AIS Bill: ${m.title}` : m.id.startsWith("card") ? `${m.sub} ${m.title}` : m.title;

export default function PaymentPage({ topInset, bottomInset = "0px", order, onPay, onBack }: {
  topInset: string; bottomInset?: string; order: Order; onPay: (method: Method & { label: string }) => void; onBack: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  // Charge to AIS Bill is picked to start with
  const [pick, setPick] = useState(AIS_BILL.id);
  const all = [AIS_BILL, PROMPTPAY, ...CARDS, ...BANKS];
  const picked = all.find(m => m.id === pick)!;
  // a mobile banking app: Process Payment loads for a moment (handing over to the bank app) before the payment comes
  // through; meanwhile the options are locked and the sticky bar shows the loading state, where Cancel Payment (or
  // leaving the page) stops it
  const [busy, setBusy] = useState(false);
  const timer = useRef<number>();
  useEffect(() => () => clearTimeout(timer.current), []);
  const pay = () => {
    if (busy) return;
    const m = { ...picked, label: label(picked) };
    if (!BANKS.includes(picked)) return onPay(m);
    setBusy(true);
    timer.current = window.setTimeout(() => onPay(m), BANK_LOADING_MS);
  };
  const cancel = () => { clearTimeout(timer.current); setBusy(false); };
  const back = () => { clearTimeout(timer.current); onBack(); };
  const option = (m: Method, h: number, compact?: boolean) => (
    <Option key={m.id} m={m} h={h} compact={compact} on={m.id === pick}
      onTap={e => { if (busy) return; setPick(m.id); e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" }); }} />
  );
  const heading = { fontSize: 16, fontWeight: 500, lineHeight: "24px", letterSpacing: 0.15, color: "#fff" };

  return (
    <div className="absolute inset-0 z-[61] flex flex-col" style={{ background: PAGE_BG, fontFamily: "'Open Sans', sans-serif" }}>
      <div className="relative flex-1 min-h-0">
        {/* header: back + "Choose how to pay" over the page, glass once it scrolls (as on Package Details) */}
        <div className="absolute inset-x-0 top-0 z-10 transition-all duration-300" style={{ paddingTop: topInset, ...headerGlass(scrolled) }}>
          <div className="flex items-center gap-2 px-4" style={{ height: 64 }}>
            <button onClick={back} aria-label="Back" className="w-8 h-8 rounded-full flex items-center justify-center"><ChevronLeft size={24} color="#fff" /></button>
            <h1 className="m-0 whitespace-nowrap" style={{ fontSize: 20, fontWeight: 600, color: ON_SURFACE }}>Choose how to pay</h1>
          </div>
        </div>

        <div className="pay-scroll absolute inset-0 overflow-y-auto overflow-x-hidden pb-6 transition-opacity" style={{ opacity: busy ? 0.6 : 1 }} onScroll={e => setScrolled(e.currentTarget.scrollTop > 0)}>
          <div style={{ height: `calc(${topInset} + 64px)` }} />
          {/* the order */}
          <div className="mx-4 flex flex-col items-center gap-2 px-2 py-1 rounded-[8px]" style={{ background: "rgba(255,255,255,0.08)", boxShadow: "inset 0 0 0 1px rgba(214,222,240,0.12)" }}>
            <div className="flex items-center justify-center gap-[10px] w-full min-w-0">
              <img src={order.img} alt="" className="shrink-0 rounded-[6px]" style={{ width: 32, height: 32, background: "#000", objectFit: order.contain ? "contain" : "cover" }} />
              <span className="truncate" style={{ fontSize: 18, lineHeight: "24px", color: ON_SURFACE }}>{order.title}</span>
            </div>
            <span style={{ fontSize: 24, fontWeight: 700, lineHeight: "32px", color: "#fff" }}>{order.price}</span>
            <span style={{ fontSize: 18, lineHeight: "24px", color: ON_SURFACE }}>VAT included: {order.vatIncluded} baht</span>
          </div>

          <div className="flex flex-col gap-6 mt-4">
            <section className="flex flex-col gap-2 px-4">
              <span style={heading}>Charge to AIS Bill</span>
              {option(AIS_BILL, 70)}
            </section>
            <section className="flex flex-col gap-2 px-4">
              <span style={heading}>QR PromptPay</span>
              {option(PROMPTPAY, 70)}
            </section>
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-4">
                <span style={heading}>Credit/Debit Card</span>
                {/* Figma shows Add new card disabled (50%) */}
                <button disabled className="flex items-center gap-2 rounded-[8px] px-3 py-[6px]" style={{ minHeight: 32, opacity: 0.5 }}>
                  <img src={icPlus} alt="" width={16} height={16} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#f0f0f0" }}>Add new card</span>
                </button>
              </div>
              {/* room around the cards for the picked one's outline (8px out), which the scrolling row would clip; a card
                  picked while partly off-screen scrolls fully into view, outline and all */}
              <div className="pay-scroll flex gap-2 overflow-x-auto px-4 py-[9px] -my-[4px]" style={{ scrollPaddingInline: 16 }}>
                {CARDS.map(m => <div key={m.id} className="shrink-0" style={{ width: 240 }}>{option(m, 80)}</div>)}
                <span className="shrink-0" style={{ width: 12 }} />
              </div>
            </section>
            <section className="flex flex-col gap-2 px-4">
              <span style={heading}>Mobile Banking</span>
              <div className="grid grid-cols-2 gap-2">{BANKS.map(m => option(m, 60, true))}</div>
            </section>
          </div>
        </div>
      </div>

      {/* sticky: how it's charged, and Process Payment */}
      <div className="shrink-0 flex flex-col items-center gap-2 px-4 pt-4"
        style={{ paddingBottom: bottomInset, background: "rgba(7,14,22,0.82)", borderTop: `1px solid ${OUTLINE}`, backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)" }}>
        {busy ? (
          // loading (Figma 4798:212350): a spinner, "payment is being processed." and Cancel Payment
          <div className="w-full flex flex-col items-center gap-4">
            <img src={icSpinner} alt="" width={32} height={32} className="animate-spin" style={{ animationDuration: "1.2s" }} />
            <span className="text-center" style={{ fontSize: 18, lineHeight: "24px", color: ON_SURFACE }}>payment is being processed.</span>
            <button onClick={cancel} className="w-full rounded-[10px] flex items-center justify-center" style={{ minHeight: 48, border: "1px solid rgba(240,240,240,0.5)" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f0" }}>Cancel Payment</span>
            </button>
          </div>
        ) : (
          <>
            <span className="text-center" style={{ fontSize: 14, lineHeight: "20px", letterSpacing: 0.25, color: ON_VARIANT }}>
              {order.recurring ? "You will be charged consecutively." : "You will be charged once."}
            </span>
            <button onClick={pay} className="w-full rounded-[10px] flex items-center justify-center" style={{ minHeight: 48, background: "#f0f0f0", boxShadow: "0 4px 4px rgba(0,0,0,0.2)" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#282828" }}>Process Payment</span>
            </button>
          </>
        )}
      </div>
      <style>{`.pay-scroll{scrollbar-width:none}.pay-scroll::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}

// a payment option (Figma "TV / Card"): a 12px-round card with the method's 40px logo, its name (and line under it)
// and a radio; picked, a 3px white outline 5px outside the card and a check instead of the radio
function Option({ m, h, compact, on, onTap }: { m: Method; h: number; compact?: boolean; on: boolean; onTap: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <button onClick={onTap} aria-pressed={on} className="relative w-full flex items-center gap-2 rounded-[12px] px-2 text-left transition-shadow duration-200"
      style={{ height: h, background: "rgba(255,255,255,0.12)", boxShadow: on ? `0 0 0 5px ${BG}, 0 0 0 8px #fff` : "none" }}>
      <span className="shrink-0 flex items-center justify-center rounded-[4px]"
        style={{ width: 40, height: 40, background: m.mark.bg, color: m.mark.fg ?? "#fff", fontSize: m.mark.text.length > 3 ? 10 : 12, fontWeight: 800 }}>{m.mark.text}</span>
      <span className="flex-1 min-w-0 flex flex-col">
        <span style={{ fontSize: compact ? 14 : 16, fontWeight: 500, lineHeight: compact ? "18px" : "24px", letterSpacing: 0.15, color: "#fff",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{m.title}</span>
        {m.sub && <span className="truncate" style={{ fontSize: 12, lineHeight: "16px", letterSpacing: 0.4, color: ON_VARIANT }}>{m.sub}</span>}
      </span>
      <span className="shrink-0 p-1"><img src={on ? icCheck : icRadio} alt="" width={16} height={16} /></span>
    </button>
  );
}
