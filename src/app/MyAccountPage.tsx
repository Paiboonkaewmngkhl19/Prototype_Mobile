import { useState } from "react";
import imgHeaderBg from "../assets/account/screen-inox.png";
import imgAvatar from "../assets/shorts/avatar-user.png";
import icBack from "../assets/account/icon-back.svg";
import icEdit from "../assets/account/icon-edit.svg";
import icChevron from "../assets/account/chevron.svg";
import { PAGE_BG, ON_SURFACE, ON_VARIANT, GLASS_CARD, CHIP_BORDER, OUTLINE } from "./theme";

// ─── My Account (Figma "PLAY profile & settings", myAccount_notLinked 256:36034) ─────────────────────────────────
// Opened from My Account on the Profile card: back + "My Account", the account card (avatar, name with edit, account
// number, AIS Fibre, Not Linked, Link myAIS Account), Account Info (registered name, contact number and email with
// edit, Manage Billing, History Payment), Manage Subscription (My Subscription, Redeem), Settings and Delete Account.
// In the app's theme.

const FONT = "'Open Sans', sans-serif";
// Figma "Tonal Filled" button, as on the Profile page
const TONAL = { background: "rgba(255,255,255,0.16)", boxShadow: "0 4px 8px rgba(0,0,0,0.2)" };

type Row = { label: string; value?: string; edit?: boolean };
const ACCOUNT_INFO: Row[] = [
  { label: "Registered Name", value: "JohX Doe" },
  { label: "Contact Number", value: "081 XXX XXXX", edit: true },
  { label: "Email", value: "-", edit: true },
  { label: "Manage Billing" },
  { label: "History Payment" },
];
const SUBSCRIPTION: Row[] = [{ label: "My Subscription" }, { label: "Redeem" }];

export default function MyAccountPage({ topInset, bottomInset = "0px", fullScreen, onBack, onOpenStore, onToast }: {
  topInset: string; bottomInset?: string;   // bottomInset: room kept clear for the home indicator
  // on a phone: fixed to the whole screen (this height), like the Store page
  fullScreen?: string;
  onBack: () => void; onOpenStore: () => void; onToast: (msg: string) => void;
}) {
  const demo = (label: string) => onToast(`${label} (demo)`);
  const [scrolled, setScrolled] = useState(false);
  const open = (label: string) => label === "My Subscription" ? onOpenStore() : demo(label);

  return (
    <div className={fullScreen ? "fixed inset-x-0 top-0 z-[70]" : "absolute inset-0 z-[16]"}
      style={{ ...(fullScreen ? { height: fullScreen } : {}), background: PAGE_BG, fontFamily: FONT }}>
      {/* header: back + "My Account" over a dark fade, glass once the page scrolls */}
      <div className="absolute inset-x-0 top-0 z-10 transition-all duration-300" style={{
        paddingTop: topInset,
        background: scrolled ? "linear-gradient(180deg, rgba(7,14,22,0.6), rgba(118,128,150,0))" : "linear-gradient(180deg, rgba(16,16,16,0.6), rgba(118,118,118,0))",
        backdropFilter: scrolled ? "blur(20px)" : "none", WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
      }}>
        <div className="flex items-center gap-2 px-4" style={{ height: 64 }}>
          <button onClick={onBack} aria-label="Back" className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
            <img src={icBack} alt="" width={20} height={20} />
          </button>
          <h1 className="m-0" style={{ fontSize: 24, fontWeight: 600, color: ON_SURFACE }}>My Account</h1>
        </div>
      </div>

      <div className="absolute inset-0 overflow-y-auto overflow-x-hidden account-scroll" onScroll={e => setScrolled(e.currentTarget.scrollTop > 0)}>
        <div style={{ height: `calc(${topInset} + 64px)` }} />
        {/* the account card, over the "Screen: Inox" band and above a thick divider */}
        <div className="relative flex flex-col items-center px-4 pt-10 pb-5" style={{ borderBottom: `5px solid ${OUTLINE}` }}>
          <img src={imgHeaderBg} alt="" className="absolute inset-x-0 top-0 w-full object-cover pointer-events-none" style={{ height: 136 }} />
          <div className="relative w-full flex flex-col gap-4 p-4 rounded-[16px]" style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0) 45%), linear-gradient(160deg, #3a4254 0%, #2a3040 55%, #1f2533 100%)",
            boxShadow: "inset 0 0 0 1px rgba(214,222,240,0.22), inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 32px rgba(0,0,0,0.5)",
          }}>
            <span className="absolute right-2 top-2 flex items-center rounded-full px-[10px]" style={{ height: 24, fontSize: 11, fontWeight: 700, color: ON_SURFACE, background: "#6a6a6a" }}>Not Linked</span>
            <div className="flex items-center gap-2">
              <img src={imgAvatar} alt="" className="shrink-0 rounded-full object-cover" style={{ width: 80, height: 80, background: "#404045" }} />
              <div className="flex flex-1 flex-col gap-2 min-w-0">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="truncate" style={{ fontSize: 24, fontWeight: 500, color: ON_SURFACE }}>User</span>
                  <button onClick={() => demo("Edit name")} aria-label="Edit name" className="shrink-0 flex"><img src={icEdit} alt="" width={16} height={16} /></button>
                </span>
                <span className="truncate" style={{ fontSize: 14, color: ON_VARIANT }}>Account: 88X XXX XXXX</span>
                <span className="truncate" style={{ fontSize: 12, color: ON_VARIANT }}>AIS Fibre</span>
              </div>
            </div>
            <button onClick={() => demo("Link myAIS Account")} className="w-full flex items-center justify-center rounded-[10px] px-[14px]" style={{ minHeight: 40, ...TONAL }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0" }}>Link myAIS Account</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-4 pt-4" style={{ paddingBottom: `calc(${bottomInset} + 24px)` }}>
          <Section title="Account Info" rows={ACCOUNT_INFO} onRow={open} />
          <Section title="Manage Subscription" rows={SUBSCRIPTION} onRow={open} />
          {["Settings", "Delete Account"].map(t => (
            <button key={t} onClick={() => demo(t)} className="flex items-center gap-4 p-4 rounded-[16px] text-left" style={{ height: 56, background: GLASS_CARD }}>
              <span className="flex-1 truncate" style={{ fontSize: 16, fontWeight: 500, color: ON_SURFACE }}>{t}</span>
              <img src={icChevron} alt="" width={24} height={24} />
            </button>
          ))}
        </div>
      </div>
      <style>{`.account-scroll{scrollbar-width:none}.account-scroll::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}

function Section({ title, rows, onRow }: { title: string; rows: Row[]; onRow: (label: string) => void }) {
  return (
    <section className="flex flex-col gap-1">
      <span className="py-1" style={{ fontSize: 16, fontWeight: 500, color: ON_SURFACE }}>{title}</span>
      <div className="flex flex-col px-4 rounded-[16px]" style={{ background: GLASS_CARD }}>
        {rows.map((r, k) => {
          // a value with no edit (Registered Name) is read-only; everything else is tappable
          const tap = r.value === undefined || r.edit;
          const inner = (
            <>
              <span className="flex-1 truncate" style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.1, color: "#fff" }}>{r.label}</span>
              {r.value !== undefined && <span className="shrink-0" style={{ fontSize: 12, fontWeight: 500, lineHeight: "16px", letterSpacing: 0.25, color: "#fff" }}>{r.value}</span>}
              {r.edit && <span className="shrink-0 w-6 h-6 flex items-center justify-center"><img src={icEdit} alt="" width={16} height={16} /></span>}
              {r.value === undefined && <img src={icChevron} alt="" width={24} height={24} className="shrink-0" />}
            </>
          );
          const cls = "flex items-center gap-2 text-left w-full";
          const style = { height: 52, borderBottom: k < rows.length - 1 ? `1px solid ${CHIP_BORDER}` : "none" };
          return tap
            ? <button key={r.label} onClick={() => onRow(r.edit ? `Edit ${r.label}` : r.label)} className={cls} style={style}>{inner}</button>
            : <div key={r.label} className={cls} style={style}>{inner}</div>;
        })}
      </div>
    </section>
  );
}
