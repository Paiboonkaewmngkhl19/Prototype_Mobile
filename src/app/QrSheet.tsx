import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import imgQr from "../assets/payment/qr.png";
import icDownload from "../assets/payment/download.svg";
import { PANEL, ON_SURFACE } from "./theme";

// ─── QR PromptPay sheet (Figma "Store" file, PLAY:store_qrPayment 4765:201767) ─────────────────────────────────────
// After Process Payment with QR PromptPay: a tall sheet with back + "QR PromptPay", the billing note, the QR with
// Download QR, the amount and a 5-minute countdown to pay within, and "It will update automatically once completed".
// Demo: 5 seconds after the sheet opens the payment completes on its own, as if paid from a banking app (closing the
// sheet first cancels it).

// how long a (demo) payment takes to come through, also used by the CVV sheet
export const PAID_AFTER_MS = 5000;
const WINDOW_S = 5 * 60;

export default function QrSheet({ topInset, amount, account, onPaid, onClose, onToast }: {
  topInset: string; amount: string; account: string;
  onPaid: () => void; onClose: () => void; onToast: (msg: string) => void;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setShown(true)); }, []);
  const close = (then: () => void) => { setShown(false); setTimeout(then, 250); };
  // time left to pay
  const [left, setLeft] = useState(WINDOW_S);
  useEffect(() => { if (left <= 0) return; const t = setTimeout(() => setLeft(s => s - 1), 1000); return () => clearTimeout(t); }, [left]);
  const mmss = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
  // the (demo) payment comes through on its own; leaving first cancels it
  const timer = useRef<number>();
  useEffect(() => { timer.current = window.setTimeout(() => close(onPaid), PAID_AFTER_MS); return () => clearTimeout(timer.current); }, []);
  const leave = () => { clearTimeout(timer.current); close(onClose); };
  const masked = account.length > 6 ? `${account.slice(0, 3)}XXX${account.slice(-4)}` : account;
  const big = { fontSize: 18, lineHeight: "24px" };

  return (
    <div className="absolute inset-0 z-[62] flex flex-col justify-end" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      <div className="absolute inset-0 transition-opacity duration-250" style={{ background: "rgba(0,0,0,0.7)", opacity: shown ? 1 : 0 }} onClick={leave} />
      <div className="relative flex flex-col rounded-t-[12px] overflow-hidden transition-transform duration-300"
        style={{ height: `calc(100% - ${topInset})`, background: PANEL, boxShadow: "0 -2px 16px rgba(0,0,0,0.1)",
          transform: shown ? "translateY(0)" : "translateY(100%)", transitionTimingFunction: "cubic-bezier(.2,0,0,1)" }}>
        <div className="shrink-0 flex items-center gap-2 px-4 mt-4" style={{ height: 44 }}>
          <button onClick={leave} aria-label="Back" className="w-8 h-8 rounded-full flex items-center justify-center"><ChevronLeft size={20} color="#fff" /></button>
          <h2 className="m-0 whitespace-nowrap" style={{ fontSize: 20, fontWeight: 600, color: ON_SURFACE }}>QR PromptPay</h2>
        </div>

        <div className="qr-scroll flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-6">
          <div className="flex flex-col items-center gap-4">
            <p className="m-0 text-center" style={{ ...big, color: "#fff" }}>
              After payment via QR<br />you will be charged consecutively to your billing account: <b>{masked}</b>
            </p>

            {/* the QR (Figma crop of the code image) */}
            <div className="relative overflow-hidden rounded-[5.333px]" style={{ width: 200, height: 200, opacity: left > 0 ? 1 : 0.25 }}>
              <img src={imgQr} alt="QR code" draggable={false} className="absolute max-w-none"
                style={{ height: "198.92%", left: "-15.87%", top: "-59.84%", width: "134.73%" }} />
            </div>

            <button onClick={() => onToast("QR saved to Photos (demo)")} className="flex items-center justify-center gap-2 rounded-[10px] px-4"
              style={{ minHeight: 48, background: "#f0f0f0", boxShadow: "0 4px 4px rgba(0,0,0,0.2)" }}>
              <img src={icDownload} alt="" width={24} height={24} />
              <span style={{ fontSize: 16, fontWeight: 700, color: "#282828" }}>Download QR</span>
            </button>

            <div className="w-full flex flex-col items-center gap-3 p-6 rounded-[24px] text-center" style={{ background: "rgba(255,255,255,0.08)", boxShadow: "inset 0 0 0 1px rgba(214,222,240,0.12)", color: ON_SURFACE }}>
              <span style={{ fontSize: 24, fontWeight: 700, lineHeight: "32px" }}>{amount}</span>
              {left > 0
                ? <span style={big}>Please complete the transaction<br />within <b>{mmss}</b> Minutes</span>
                : <span style={big}>This QR has expired.<br /><button onClick={() => setLeft(WINDOW_S)} className="underline font-bold">Get a new QR</button></span>}
            </div>

            <p className="m-0 text-center" style={{ fontSize: 14, lineHeight: "20px", letterSpacing: 0.25, color: "#fff" }}>It will update automatically once completed.</p>
          </div>
        </div>
      </div>
      <style>{`.qr-scroll{scrollbar-width:none}.qr-scroll::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}
