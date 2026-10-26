import { useEffect, useRef, useState } from "react";
import { ChevronLeft, LoaderCircle } from "lucide-react";
import icClose from "../assets/sports-pkg/icon-close.svg";
import NumberPad from "./NumberPad";
import { PAID_AFTER_MS } from "./QrSheet";
import type { Method } from "./PaymentPage";
import { PANEL, ON_SURFACE, ON_VARIANT } from "./theme";

// ─── Enter CVV sheet (Figma "Store" file, Mobile / BottomSheet_widget 4741:182676) ─────────────────────────────────
// After Process Payment with a saved card: a handle, back + "Enter CVV" with close, the card, three CVV boxes (typed
// digits show as *, the next box outlined), the note on where the CVV is, and Confirm (once all three are in), over
// the number pad from Confirm OTP (a computer keyboard types too). Confirm then processes for the same 5 seconds as
// QR PromptPay and completes the payment; leaving before that cancels it.

const LEN = 3;

export default function CvvSheet({ bottomInset = "0px", card, onPaid, onClose }: {
  bottomInset?: string; card: Method; onPaid: () => void; onClose: () => void;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setShown(true)); }, []);
  const close = (then: () => void) => { setShown(false); setTimeout(then, 250); };
  const [cvv, setCvv] = useState("");
  const [busy, setBusy] = useState(false);
  const full = cvv.length === LEN;
  const type = (d: string) => { if (!busy) setCvv(c => (c + d).slice(0, LEN)); };
  const del = () => { if (!busy) setCvv(c => c.slice(0, -1)); };
  // Confirm: process, then the (demo) payment comes through; leaving first cancels it
  const timer = useRef<number>();
  const confirm = () => { if (!full || busy) return; setBusy(true); timer.current = window.setTimeout(() => close(onPaid), PAID_AFTER_MS); };
  const leave = () => { clearTimeout(timer.current); close(onClose); };
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) type(e.key);
      else if (e.key === "Backspace") del();
      else if (e.key === "Enter") confirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="absolute inset-0 z-[62] flex flex-col justify-end" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      <div className="absolute inset-0 transition-opacity duration-250" style={{ background: "rgba(0,0,0,0.7)", opacity: shown ? 1 : 0 }} onClick={leave} />
      <div className="relative flex flex-col transition-transform duration-300"
        style={{ transform: shown ? "translateY(0)" : "translateY(100%)", transitionTimingFunction: "cubic-bezier(.2,0,0,1)" }}>
        <div className="flex flex-col rounded-t-[12px] overflow-hidden" style={{ background: PANEL, boxShadow: "0 -2px 16px rgba(0,0,0,0.1)" }}>
          {/* handle + back / title / close */}
          <div className="flex justify-center pt-4 pb-2"><div className="rounded-full" style={{ width: 48, height: 6, background: "#dadbdc" }} /></div>
          <div className="flex items-center justify-between px-4" style={{ height: 44 }}>
            <div className="flex items-center gap-2">
              <button onClick={leave} aria-label="Back" className="w-8 h-8 rounded-full flex items-center justify-center"><ChevronLeft size={20} color="#fff" /></button>
              <h2 className="m-0 whitespace-nowrap" style={{ fontSize: 20, fontWeight: 600, color: ON_SURFACE }}>Enter CVV</h2>
            </div>
            <button onClick={leave} aria-label="Close" className="w-8 h-8 rounded-full flex items-center justify-center">
              <img src={icClose} alt="" width={20} height={20} style={{ filter: "brightness(0) invert(1)" }} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-6 px-4 pt-4">
            {/* the card */}
            <div className="w-full flex items-center gap-1 rounded-[12px] px-2" style={{ height: 80, background: "rgba(255,255,255,0.12)" }}>
              <span className="shrink-0 flex items-center justify-center rounded-[4px] mr-1"
                style={{ width: 40, height: 40, background: card.mark.bg, color: card.mark.fg ?? "#fff", fontSize: card.mark.text.length > 3 ? 10 : 12, fontWeight: 800 }}>{card.mark.text}</span>
              <span className="flex-1 min-w-0 flex flex-col">
                <span style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", letterSpacing: 0.15, color: "#fff" }}>{card.title}</span>
                {card.sub && <span className="truncate" style={{ fontSize: 12, lineHeight: "16px", letterSpacing: 0.4, color: ON_VARIANT }}>{card.sub}</span>}
              </span>
            </div>

            {/* CVV: three boxes, typed digits as *, the next one outlined */}
            <div className="w-full flex flex-col gap-2">
              <span style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", letterSpacing: 0.15, color: "#fff" }}>Enter you CVV</span>
              <div className="flex justify-center gap-2" role="group" aria-label="CVV">
                {Array.from({ length: LEN }, (_, k) => {
                  const focus = !busy && k === Math.min(cvv.length, LEN - 1);
                  return (
                    <span key={k} className="flex items-center justify-center rounded-[8px]"
                      style={{ width: 60, height: 34, background: "rgba(255,255,255,0.08)", border: `1px solid ${focus ? "#fff" : "#5a5a5a"}` }}>
                      {cvv[k] && <span style={{ fontSize: 16, fontWeight: 500, lineHeight: "16px", color: ON_SURFACE }}>*</span>}
                    </span>
                  );
                })}
              </div>
            </div>
            <p className="m-0 w-full" style={{ fontSize: 12, lineHeight: "16px", letterSpacing: 0.4, color: ON_VARIANT }}>
              The 3 digits on the back of your card. We use it to confirm this payment.
            </p>
          </div>

          <div className="p-4">
            <button onClick={confirm} disabled={!full || busy} className="w-full rounded-[10px] flex items-center justify-center gap-2 transition-opacity"
              style={{ minHeight: 48, background: "#f0f0f0", opacity: full ? 1 : 0.5, boxShadow: full ? "0 4px 4px rgba(0,0,0,0.2)" : "none" }}>
              {busy && <LoaderCircle size={20} color="#282828" className="animate-spin" />}
              <span style={{ fontSize: 16, fontWeight: 700, color: "#282828" }}>{busy ? "Processing payment…" : "Confirm"}</span>
            </button>
          </div>
        </div>
        <NumberPad bottomInset={bottomInset} onDigit={type} onDelete={del} />
      </div>
    </div>
  );
}
