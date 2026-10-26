import { useState } from "react";
import { ScanLine, Headset, Bell, RefreshCw, User, Settings, X, LogOut, ChevronRight } from "lucide-react";
import avatarUser from "../assets/shorts/avatar-user.png";
import imgPremium from "../assets/home/store-banner.jpg";
import imgHeaderBg from "../assets/profile/header-bg.png";
import logoNetflix from "../assets/store/logo-netflix.png";
import logoHbo from "../assets/store/logo-hbo.png";
import logoHotstar from "../assets/store/logo-hotstar.png";
import logoViu from "../assets/store/logo-viu.png";
import logoIqiyi from "../assets/store/logo-iqiyi.png";
import { CHANNELS, ChannelLogo, tvStore } from "./TVScreen";
import { PAGE_BG, ON_SURFACE, ON_VARIANT, GLASS_CARD, PANEL } from "./theme";

// ─── Profile (Figma "PLAY profile & settings", Profile 80:35583) ────────────────────────────────────────────────
// The Profile tab: scan / support / notifications, the profile card (avatar, name, account, Not Linked, My Account
// and Settings), the myAIS link card, My Subscription, My List, My Favorite Channels (the TV tab's favourites; a tap
// plays the channel), Log out and the app version. In the app's theme.

const BASE = import.meta.env.BASE_URL;
const a = (p: string) => `${BASE}${p}`;
const FONT = "'Open Sans', sans-serif";
const MY_LIST = ["posters_portrait/House.jpg", "posters_portrait/John.jpg", "posters_portrait/F1.jpg", "posters_portrait/avatar.jpg", "posters_portrait/debt.jpg"].map(a);

export default function ProfilePage({ topInset, bottom, onOpenChannel, onOpenStore, onOpenAccount, onToast }: {
  topInset: string; bottom: string; onOpenChannel: (i: number) => void; onOpenStore: () => void; onOpenAccount: () => void; onToast: (msg: string) => void;
}) {
  const demo = (label: string) => onToast(`${label} (demo)`);
  const [linkCard, setLinkCard] = useState(true);
  const favs = [...tvStore.favs].filter(i => CHANNELS[i]);
  const iconBtn = "w-10 h-10 rounded-full flex items-center justify-center";
  // Figma "Tonal Filled" buttons: a filled light tint, no outline
  const tonal = { background: "rgba(255,255,255,0.16)", boxShadow: "0 4px 4px rgba(0,0,0,0.2)" };

  return (
    <div className="absolute inset-x-0 top-0 z-[15] overflow-y-auto overflow-x-hidden profile-scroll" style={{ bottom, background: PAGE_BG, fontFamily: FONT }}>
      {/* top: a gradient behind the header, then scan / support / notifications and the profile card */}
      <div className="relative flex flex-col items-center pb-5" style={{ paddingTop: topInset }}>
        {/* stacked background (Figma "Screen: Inox"): the silver-to-navy band behind the status bar and icons, 136px
            under the status bar, the profile card overlapping its lower edge */}
        <img src={imgHeaderBg} alt="" className="absolute inset-x-0 top-0 w-full object-cover pointer-events-none" style={{ height: `calc(${topInset} + 92px)` }} />
        <div className="relative flex flex-col gap-2 w-full px-4 pt-1">
          <div className="flex justify-end gap-[6px]">
            <button onClick={() => demo("Scan QR")} aria-label="Scan QR" className={iconBtn}><ScanLine size={24} color="#fff" /></button>
            <button onClick={() => demo("Support")} aria-label="Support" className={iconBtn}><Headset size={24} color="#fff" /></button>
            <button onClick={() => demo("Notifications")} aria-label="Notifications" className={iconBtn}><Bell size={24} color="#fff" /></button>
          </div>
          {/* the profile card stands out from the cards below: solid (the band doesn't show through), a lighter
              grey-blue gradient with a soft top highlight, a hairline light edge, and a deeper shadow with a faint glow */}
          <div className="flex flex-col gap-4 p-4 rounded-[16px]" style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0) 45%), linear-gradient(160deg, #3a4254 0%, #2a3040 55%, #1f2533 100%)",
            boxShadow: "inset 0 0 0 1px rgba(214,222,240,0.22), inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 32px rgba(0,0,0,0.5), 0 0 40px rgba(214,222,240,0.10)",
          }}>
            <div className="flex items-center gap-2">
              <span className="relative shrink-0 rounded-full" style={{ width: 80, height: 80 }}>
                <img src={avatarUser} alt="" className="w-full h-full rounded-full object-cover" style={{ background: "#404045" }} />
                <button onClick={() => demo("Switch profile")} aria-label="Switch profile" className="absolute right-0 bottom-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: ON_SURFACE }}>
                  <RefreshCw size={16} color="#101010" />
                </button>
              </span>
              <div className="relative flex flex-1 flex-col gap-2 min-w-0">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate" style={{ fontSize: 24, fontWeight: 500, color: ON_SURFACE }}>User</span>
                  <span className="shrink-0 flex items-center rounded-full px-[10px]" style={{ height: 24, fontSize: 11, fontWeight: 700, color: ON_SURFACE, background: "rgba(255,255,255,0.16)" }}>Not Linked</span>
                </span>
                <span className="truncate" style={{ fontSize: 14, color: ON_VARIANT }}>Account: 88X XXX XXXX</span>
                <span className="truncate" style={{ fontSize: 12, color: ON_VARIANT }}>AIS Fibre</span>
              </div>
            </div>
            <div className="flex gap-2">
              {([["My Account", User], ["Settings", Settings]] as const).map(([t, Icon]) => (
                <button key={t} onClick={() => t === "My Account" ? onOpenAccount() : demo(t)}className="flex-1 flex items-center justify-center gap-2 rounded-[10px] px-[14px]" style={{ minHeight: 40, ...tonal }}>
                  <Icon size={20} color="#f0f0f0" /><span style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0" }}>{t}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-5">
        {/* link with myAIS */}
        {linkCard && (
          <div className="mx-4 relative flex flex-col gap-4 p-4 rounded-[16px]" style={{ background: GLASS_CARD }}>
            <button onClick={() => setLinkCard(false)} aria-label="Dismiss" className="absolute right-4 top-4"><X size={20} color={ON_SURFACE} /></button>
            <div className="flex flex-col gap-2 pr-8">
              <span style={{ fontSize: 16, fontWeight: 700, lineHeight: "24px", color: ON_SURFACE }}>Link with myAIS account</span>
              <span style={{ fontSize: 12, lineHeight: "20px", color: "#8a8a8a" }}>Connect your <b>myAIS account</b> for easy account switching and a better viewing experience in AIS PLAY</span>
            </div>
            <button onClick={() => demo("Link myAIS")} className="w-full rounded-[8px]" style={{ minHeight: 40, fontSize: 16, fontWeight: 500, color: "#f0f0f0", ...tonal }}>Link Now</button>
          </div>
        )}

        {/* My Subscription (opens the Store) */}
        <section className="flex flex-col gap-2 px-4">
          <SectionTitle title="My Subscription" onMore={onOpenStore} />
          <div className="flex flex-col gap-1 overflow-hidden rounded-[12px] pb-1" style={{ background: "rgba(255,255,255,0.12)" }}>
            <div className="flex flex-col gap-3 p-3 rounded-b-[8px]" style={{ background: PANEL }}>
              <div className="flex items-start gap-2">
                <img src={imgPremium} alt="" className="rounded-[8px] object-cover shrink-0" style={{ width: 48, height: 48 }} />
                <span className="flex-1 truncate" style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", color: ON_SURFACE }}>Play Premium Plus</span>
                <span className="flex items-center rounded-[4px] px-2" style={{ height: 20, fontSize: 10, fontWeight: 500, color: "#101010", background: "#9edb07" }}>Active</span>
              </div>
              <div className="flex flex-col gap-2 rounded-[8px] p-2" style={{ background: "rgba(0,0,0,0.25)" }}>
                <div className="flex flex-wrap gap-[8px_6px]">
                  {[logoNetflix, logoHbo, logoHotstar, logoViu, logoIqiyi].map(l => <img key={l} src={l} alt="" className="rounded-[4px] object-cover" style={{ width: 32, height: 32 }} />)}
                  <span className="flex items-center justify-center rounded-[4px]" style={{ width: 32, height: 32, fontSize: 11, fontWeight: 500, color: "#000", background: "#c9c9c9" }}>+2</span>
                </div>
                <span style={{ fontSize: 14, lineHeight: "20px", color: ON_SURFACE }}>+99 Premium Channels</span>
              </div>
            </div>
            <span className="text-center" style={{ fontSize: 12, lineHeight: "16px", color: ON_SURFACE }}>Renews 22 October</span>
          </div>
        </section>

        {/* My List */}
        <section className="flex flex-col gap-2">
          <div className="px-4"><SectionTitle title="My List" onMore={() => demo("My List")} /></div>
          <div className="profile-rail flex gap-2 overflow-x-auto px-4">
            {MY_LIST.map(img => (
              <button key={img} onClick={() => demo("My List")} className="shrink-0 overflow-hidden rounded-[8px]" style={{ width: 104, height: 156 }}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            <span className="shrink-0" style={{ width: 8 }} />
          </div>
        </section>

        {/* My Favorite Channels: the TV tab's favourites */}
        <section className="flex flex-col gap-2">
          <div className="px-4"><SectionTitle title="My Favorite Channels" onMore={() => demo("My Favorite Channels")} /></div>
          <div className="profile-rail flex gap-2 overflow-x-auto px-4">
            {favs.length === 0 && <span style={{ fontSize: 14, color: ON_VARIANT }}>Tap the heart on a channel to add it here</span>}
            {favs.map(i => (
              <button key={i} onClick={() => onOpenChannel(i)} aria-label={CHANNELS[i].name} className="shrink-0 rounded-full"><ChannelLogo c={CHANNELS[i]} size={80} /></button>
            ))}
            <span className="shrink-0" style={{ width: 8 }} />
          </div>
        </section>

        {/* footer */}
        <div className="flex flex-col items-center gap-3 px-4 py-6">
          <button onClick={() => demo("Log out")} className="w-full flex items-center justify-center gap-2 rounded-[10px]" style={{ minHeight: 48, border: "1px solid rgba(240,240,240,0.5)" }}>
            <LogOut size={24} color="#f0f0f0" /><span style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f0" }}>Log out</span>
          </button>
          <span style={{ fontSize: 12, color: "#e5e5e5" }}>Version 1.0.0</span>
        </div>
      </div>
      <style>{`.profile-scroll,.profile-rail{scrollbar-width:none}.profile-scroll::-webkit-scrollbar,.profile-rail::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}

function SectionTitle({ title, onMore }: { title: string; onMore: () => void }) {
  return (
    <button onClick={onMore} className="flex items-center self-start">
      <span style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.2, letterSpacing: -0.2, color: ON_SURFACE, textShadow: "0 4px 4px rgba(0,0,0,0.4)" }}>{title}</span>
      <span className="p-1"><ChevronRight size={16} color="#fff" /></span>
    </button>
  );
}
