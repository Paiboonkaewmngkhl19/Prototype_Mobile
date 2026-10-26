import keySymbols from "../assets/purchase/key-symbols.svg";
import keyDelete from "../assets/purchase/key-delete.svg";

// ─── iPhone number pad (Figma "Keyboard - iPhone") ────────────────────────────────────────────────────────────────
// The numeric keyboard from the OTP and CVV designs, drawn in the page so the phone's own keyboard never opens:
// 1–9 with their letters, the +*# key (inert), 0 and delete.

const KEYS: [string, string][] = [["1", ""], ["2", "abc"], ["3", "def"], ["4", "ghi"], ["5", "jkl"], ["6", "mno"], ["7", "pqrs"], ["8", "tuv"], ["9", "wxyz"]];
const KEY = { boxShadow: "0 0.872px 0 rgba(0,0,0,0.35)", color: "#000" };

export default function NumberPad({ bottomInset = "0px", onDigit, onDelete }: {
  bottomInset?: string; onDigit: (d: string) => void; onDelete: () => void;
}) {
  return (
    <div className="shrink-0 grid grid-cols-3 gap-x-[6px] gap-y-2" style={{ background: "#abafb2", padding: "5px 5px", paddingBottom: `calc(${bottomInset} + 24px)`, gridAutoRows: 46,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro', sans-serif" }}>
      {KEYS.map(([d, l]) => (
        <button key={d} onClick={() => onDigit(d)} aria-label={d} className="flex flex-col items-center justify-center rounded-[5px] bg-white active:bg-[#d1d4d8]" style={KEY}>
          <span style={{ fontSize: 22, lineHeight: 1 }}>{d}</span>
          {l && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", lineHeight: 1.2 }}>{l}</span>}
        </button>
      ))}
      <span className="relative"><img src={keySymbols} alt="" className="absolute inset-0 m-auto" /></span>
      <button onClick={() => onDigit("0")} aria-label="0" className="flex items-center justify-center rounded-[5px] bg-white active:bg-[#d1d4d8]" style={{ ...KEY, fontSize: 22 }}>0</button>
      <button onClick={onDelete} aria-label="Delete" className="relative"><img src={keyDelete} alt="" className="absolute inset-0 m-auto" /></button>
    </div>
  );
}
