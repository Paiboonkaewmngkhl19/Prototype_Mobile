import icDone from "../assets/purchase/check-circle.svg";
import icSms from "../assets/purchase/sms.svg";
import icOpenLink from "../assets/purchase/open-link.svg";
import { PAGE_BG, ON_SURFACE } from "./theme";

// ─── Purchase complete (Figma "Prototype" file, PLAY:store_purchaseResult 66:16612) ───────────────────────────────
// The end of a purchase: a check and "Purchase complete", the "Wait for the activation SMS" notice, the receipt
// (package, payment method, duration, amount), then Activation and Explore more. On arrival the check pops in with
// two rings rippling out behind it, the title rises in after it, and the rest follows in turn.

export interface Receipt { pkg: string; img: string; contain?: boolean; method: string; duration: string; amount: string }

export default function PurchaseDonePage({ topInset, bottomInset = "0px", receipt, onActivate, onExplore }: {
  topInset: string; bottomInset?: string; receipt: Receipt; onActivate: () => void; onExplore: () => void;
}) {
  const label = { fontSize: 12, color: "#999" };
  const value = { fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.1, color: ON_SURFACE };
  return (
    <div className="absolute inset-0 z-[63] flex flex-col" style={{ background: PAGE_BG, fontFamily: "'Open Sans', sans-serif" }}>
      <div className="done-scroll flex-1 min-h-0 overflow-y-auto px-4 pb-4" style={{ paddingTop: `calc(${topInset} + 16px)` }}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 px-2">
            <span className="relative flex items-center justify-center" style={{ width: 48, height: 48 }}>
              <span className="done-ring absolute inset-0 rounded-full" />
              <span className="done-ring absolute inset-0 rounded-full" style={{ animationDelay: "0.55s" }} />
              <img src={icDone} alt="" width={48} height={48} className="done-pop relative" />
            </span>
            <h1 className="done-in m-0 text-center" style={{ fontSize: 24, fontWeight: 400, lineHeight: "32px", color: "#fff", animationDelay: "0.35s" }}>Purchase complete</h1>
          </div>

          {/* activation SMS notice */}
          <div className="done-in flex flex-col items-center gap-2 p-2 rounded-[8px]" style={{ animationDelay: "0.55s", background: "rgba(255,255,255,0.08)", boxShadow: "inset 0 0 0 1px rgba(214,222,240,0.12)" }}>
            <div className="flex items-center justify-center gap-[10px]">
              <img src={icSms} alt="" width={24} height={24} />
              <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.15, color: ON_SURFACE }}>Wait for the activation SMS</span>
            </div>
            <p className="m-0 text-center" style={{ fontSize: 14, lineHeight: "20px", letterSpacing: 0.25, color: ON_SURFACE, opacity: 0.7 }}>
              Activate your package to start watching<br />Check your SMS and follow the activation link to activate your package.
            </p>
            <p className="m-0 text-center" style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.1, color: ON_SURFACE }}>Expect the activation SMS within 15 minutes.</p>
          </div>

          {/* receipt */}
          <div className="done-in flex flex-col gap-2" style={{ animationDelay: "0.7s" }}>
            <span style={label}>Package</span>
            <span className="flex items-center gap-2 min-w-0">
              <img src={receipt.img} alt="" className="shrink-0 rounded-[4px]" style={{ width: 24, height: 24, background: "#000", objectFit: receipt.contain ? "contain" : "cover" }} />
              <span className="truncate" style={{ ...value, color: "#fff" }}>{receipt.pkg}</span>
            </span>
            <span style={label}>Payment method</span>
            <span style={value}>{receipt.method}</span>
            <span style={label}>Duration</span>
            <span style={value}>{receipt.duration}</span>
            <span style={label}>Amount</span>
            <span style={value}>{receipt.amount}</span>
          </div>
        </div>
      </div>

      <div className="done-in shrink-0 flex flex-col gap-3 px-4 pt-4" style={{ animationDelay: "0.85s", paddingBottom: `calc(${bottomInset} + 16px)` }}>
        <button onClick={onActivate} className="w-full rounded-[10px] flex items-center justify-center gap-2" style={{ minHeight: 48, background: "#f0f0f0", boxShadow: "0 4px 4px rgba(0,0,0,0.2)" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#282828" }}>Activation</span>
          {/* opens the activation link */}
          <img src={icOpenLink} alt="" width={24} height={24} />
        </button>
        <button onClick={onExplore} className="w-full rounded-[10px] flex items-center justify-center" style={{ minHeight: 48, border: "1px solid rgba(240,240,240,0.5)" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f0" }}>Explore more</span>
        </button>
      </div>
      <style>{`.done-scroll{scrollbar-width:none}.done-scroll::-webkit-scrollbar{display:none}
        .done-pop{animation:done-pop .6s cubic-bezier(.34,1.56,.64,1) both}
        @keyframes done-pop{0%{opacity:0;transform:scale(.3) rotate(-25deg)}60%{opacity:1}100%{opacity:1;transform:none}}
        .done-ring{border:2px solid rgba(232,232,232,.55);opacity:0;animation:done-ring 1.1s cubic-bezier(.2,0,0,1) .25s both}
        @keyframes done-ring{0%{opacity:.8;transform:scale(.8)}100%{opacity:0;transform:scale(2.4)}}
        .done-in{animation:done-in .5s cubic-bezier(.2,0,0,1) both}
        @keyframes done-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        @media (prefers-reduced-motion:reduce){.done-pop,.done-in{animation:none}.done-ring{display:none}}`}</style>
    </div>
  );
}
