import { useEffect, useState } from "react";
import icClose from "../assets/sports-pkg/icon-close.svg";
import NumberPad from "./NumberPad";
import { PAGE_BG, ON_SURFACE, headerGlass } from "./theme";

// ─── Confirm OTP (Figma "Prototype" file, Confirm OTP 68:19163) ─────────────────────────────────────────────────────
// After Process Payment with Charge to AIS Bill: "Confirm OTP" with close, what will be charged and to which billing
// account, four PIN boxes (the one being typed into underlined in white), where the OTP was sent with the resend
// countdown, Confirm OTP (once all four digits are in) and Resend OTP (once the countdown ends), over the iPhone number
// pad from the design. A computer keyboard types too (digits, Backspace, Enter). Any 4 digits pass (demo).

const LEN = 4, RESEND_S = 60;

export default function OtpPage({ topInset, bottomInset = "0px", amount, per, account, onConfirm, onClose, onToast }: {
  topInset: string; bottomInset?: string;
  amount: string; per: string;   // "1,068.93 baht", "Month"
  account: string;               // the AIS billing account (shown masked)
  onConfirm: () => void; onClose: () => void; onToast: (msg: string) => void;
}) {
  const [code, setCode] = useState("");
  const [wait, setWait] = useState(RESEND_S);
  useEffect(() => { if (wait <= 0) return; const t = setTimeout(() => setWait(w => w - 1), 1000); return () => clearTimeout(t); }, [wait]);
  const type = (d: string) => setCode(c => (c + d).slice(0, LEN));
  const del = () => setCode(c => c.slice(0, -1));
  const full = code.length === LEN;
  const confirm = () => { if (full) onConfirm(); };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) type(e.key);
      else if (e.key === "Backspace") del();
      else if (e.key === "Enter") confirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  const resend = () => { setCode(""); setWait(RESEND_S); onToast("A new OTP has been sent to myAIS app (demo)"); };
  // 8801234456 → 880XXX4456
  const masked = account.length > 6 ? `${account.slice(0, 3)}XXX${account.slice(-4)}` : account;
  const body = { fontSize: 18, lineHeight: "24px", color: "#fff" };

  return (
    <div className="absolute inset-0 z-[62] flex flex-col" style={{ background: PAGE_BG, fontFamily: "'Open Sans', sans-serif" }}>
      {/* header: "Confirm OTP" with close */}
      <div className="shrink-0" style={{ paddingTop: topInset, ...headerGlass(false) }}>
        <div className="flex items-center justify-between px-4" style={{ height: 64 }}>
          <h1 className="m-0 whitespace-nowrap" style={{ fontSize: 20, fontWeight: 600, color: ON_SURFACE }}>Confirm OTP</h1>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full flex items-center justify-center">
            <img src={icClose} alt="" width={20} height={20} style={{ filter: "brightness(0) invert(1)" }} />
          </button>
        </div>
      </div>

      <div className="otp-scroll flex-1 min-h-0 overflow-y-auto px-4 py-6">
        <div className="flex flex-col items-center gap-6">
          <p className="m-0 text-center" style={body}>
            You will be charged<br />
            <b>{amount}</b> /{per} consecutively<br />
            <span style={{ color: ON_SURFACE }}>to your billing account: </span><b>{masked}</b>
          </p>

          {/* the PIN boxes: filled ones show their digit, the next one is underlined in white */}
          <div className="flex gap-2 w-full" role="group" aria-label="OTP">
            {Array.from({ length: LEN }, (_, k) => {
              const focus = k === Math.min(code.length, LEN - 1);
              return (
                <div key={k} className="flex-1 flex items-center justify-center"
                  style={{ height: 96, maxWidth: 80, margin: "0 auto", background: "rgba(0,0,0,0.2)", borderBottom: `3px solid ${focus ? "#fff" : "rgba(255,255,255,0.1)"}` }}>
                  <span style={{ fontSize: 36, fontWeight: 500, lineHeight: 1.2, letterSpacing: -0.2, color: "#d9d9d9" }}>{code[k] ?? ""}</span>
                </div>
              );
            })}
          </div>

          <p className="m-0 text-center" style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", color: ON_SURFACE }}>
            OTP has been sent to myAIS app.<br />
            {wait > 0 ? <>Did not receive OTP? Resend available in {wait} seconds.</> : <>Did not receive OTP? You can resend it now.</>}
          </p>

          <div className="flex flex-col gap-4 w-full py-4">
            <button onClick={confirm} disabled={!full} className="w-full rounded-[10px] flex items-center justify-center transition-opacity"
              style={{ minHeight: 48, background: "#f0f0f0", opacity: full ? 1 : 0.5, boxShadow: full ? "0 4px 4px rgba(0,0,0,0.2)" : "none" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#282828" }}>Confirm OTP</span>
            </button>
            <button onClick={resend} disabled={wait > 0} className="w-full rounded-[10px] flex items-center justify-center transition-opacity"
              style={{ minHeight: 48, border: "1px solid rgba(240,240,240,0.5)", opacity: wait > 0 ? 0.5 : 1 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f0" }}>Resend OTP</span>
            </button>
          </div>
        </div>
      </div>

      <NumberPad bottomInset={bottomInset} onDigit={type} onDelete={del} />
      <style>{`.otp-scroll{scrollbar-width:none}.otp-scroll::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}
