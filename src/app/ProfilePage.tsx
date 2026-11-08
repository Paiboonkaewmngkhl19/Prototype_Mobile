import { ScanLine, Headset, Bell, ChevronRight } from "lucide-react";
import imgAvatar from "../assets/shorts/avatar-user.png";
import imgHeaderBg from "../assets/profile/screen-inox.png";
import iconEdit from "../assets/profile/edit.svg";
import iconRowChevron from "../assets/profile/chevron.svg";
import iconLogout from "../assets/profile/logout.svg";
import { CHANNELS, ChannelLogo, tvStore } from "./TVScreen";
import { CATALOG, RAILS } from "./catalog";
import { PAGE_BG, ON_SURFACE, ON_VARIANT, TOP_BAND_FADE, ACCOUNT_CARD, TONAL, GLASS_CARD, CHIP_BORDER } from "./theme";
import { OttTag } from "./cardTags";
import { SubscriptionCards } from "./StorePage";

// ─── Profile (Figma "Prototype" file, Profile 230:64169) ────────────────────────────────────────────────────────
// The Profile tab: scan / support / notifications, the profile card (avatar, name, account, Not Linked, and Link
// myAIS), My Subscription, the settings list, My List, My Favorite Channels (the TV tab's favourites; a tap plays the
// channel), Log out and the app version.

const BASE = import.meta.env.BASE_URL;
const a = (p: string) => `${BASE}${p}`;
const FONT = "'Open Sans', sans-serif";
const MY_LIST = RAILS.myList.slice(0, 5).map(x => ({ img: a(CATALOG[x.k].p ?? CATALOG[x.k].w ?? ""), plat: CATALOG[x.k].plat }));
const SETTINGS = ["Settings", "Redeem", "Content Preference", "Payment Method", "Purchase History"];

export default function ProfilePage({ topInset, bottom, onOpenChannel, onOpenStore, onOpenAccount, onToast }: {
  topInset: string; bottom: string; onOpenChannel: (i: number) => void; onOpenStore: () => void; onOpenAccount: () => void; onToast: (msg: string) => void;
}) {
  const demo = (label: string) => onToast(`${label} (demo)`);
  const favs = [...tvStore.favs].filter(i => CHANNELS[i]);
  const iconBtn = "w-8 h-8 rounded-full flex items-center justify-center";

  return (
    <div className="absolute inset-x-0 top-0 z-[15] overflow-y-auto overflow-x-hidden profile-scroll" style={{ bottom, background: PAGE_BG, fontFamily: FONT }}>
      <div className="relative flex flex-col gap-8">
        {/* Figma "Screen: Inox": the band behind the status bar and icons, the profile card overlapping its lower edge */}
        <img src={imgHeaderBg} alt="" className="absolute inset-x-0 top-0 w-full object-cover pointer-events-none" style={{ height: `calc(${topInset} + 92px)`, WebkitMaskImage: TOP_BAND_FADE, maskImage: TOP_BAND_FADE }} />

        {/* scan / support / notifications, then the profile card */}
        <div className="relative flex flex-col gap-1 px-4" style={{ paddingTop: topInset }}>
          <div className="flex justify-end gap-[6px]">
            <button onClick={() => demo("Scan QR")} aria-label="Scan QR" className={iconBtn}><ScanLine size={20} color="#fff" /></button>
            <button onClick={() => demo("Support")} aria-label="Support" className={iconBtn}><Headset size={20} color="#fff" /></button>
            <button onClick={() => demo("Notifications")} aria-label="Notifications" className={iconBtn}><Bell size={20} color="#fff" /></button>
          </div>
          <div className="flex flex-col gap-4 p-4 rounded-[16px]" style={ACCOUNT_CARD}>
            <div className="flex items-center gap-2">
              <span className="relative shrink-0 rounded-full" style={{ width: 80, height: 80 }}>
                <img src={imgAvatar} alt="" className="w-full h-full rounded-full object-cover" style={{ background: "#404045" }} />
                {/* the pencil opens My Account */}
                <button onClick={onOpenAccount} aria-label="My Account" className="absolute right-0 bottom-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: ON_SURFACE }}>
                  <img src={iconEdit} alt="" />
                </button>
              </span>
              <div className="relative flex flex-1 flex-col gap-2 min-w-0">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate" style={{ fontSize: 24, fontWeight: 500, color: ON_SURFACE }}>User</span>
                  <span className="shrink-0 flex items-center rounded-full px-[10px]" style={{ height: 24, fontSize: 11, fontWeight: 700, color: ON_SURFACE, background: TONAL }}>Not Linked</span>
                </span>
                <span className="truncate" style={{ fontSize: 14, color: ON_VARIANT }}>Account: 88X XXX XXXX</span>
                <span className="truncate" style={{ fontSize: 12, color: ON_VARIANT }}>AIS Fibre</span>
              </div>
            </div>
            <button onClick={() => demo("Link myAIS")} className="w-full flex items-center justify-center rounded-[10px] px-[14px]" style={{ height: 40, background: TONAL, boxShadow: "0 4px 4px rgba(0,0,0,0.2)" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0" }}>Link myAIS to Switch Account</span>
            </button>
          </div>
        </div>

        {/* My Subscription: the Store page's cards and spacing; View all opens the Store */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-4">
            <span style={TITLE}>My Subscription</span>
            <button onClick={onOpenStore} className="flex items-center gap-2">
              <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.1, color: ON_SURFACE, textShadow: TITLE.textShadow }}>View all</span>
              <span className="p-1"><ChevronRight size={16} color="#fff" /></span>
            </button>
          </div>
          <SubscriptionCards rail="profile-rail" />
        </section>

        {/* settings list */}
        <section className="px-4">
          <div className="flex flex-col px-4 rounded-[16px]" style={{ background: GLASS_CARD }}>
            {SETTINGS.map((t, i) => (
              <button key={t} onClick={() => demo(t)} className="flex items-center gap-2 text-left w-full" style={{ height: 52, borderBottom: i < SETTINGS.length - 1 ? `1px solid ${CHIP_BORDER}` : "none" }}>
                <span className="flex-1 min-w-0" style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", letterSpacing: 0.1, color: ON_SURFACE }}>{t}</span>
                <img src={iconRowChevron} alt="" className="shrink-0" />
              </button>
            ))}
          </div>
        </section>

        {/* My List */}
        <section className="flex flex-col gap-2">
          <div className="px-4"><SectionTitle title="My List" onMore={() => demo("My List")} /></div>
          <div className="profile-rail flex gap-2 overflow-x-auto px-4">
            {MY_LIST.map(({ img, plat }) => (
              <button key={img} onClick={() => demo("My List")} className="relative shrink-0 overflow-hidden rounded-[8px]" style={{ width: 104, height: 156 }}>
                <img src={img} alt="" className="w-full h-full object-cover" />
                {plat && <OttTag plat={plat} />}
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
            <img src={iconLogout} alt="" /><span style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f0" }}>Log out</span>
          </button>
          <span style={{ fontSize: 12, color: "#e5e5e5" }}>Version 1.0.0</span>
        </div>
      </div>
      <style>{`.profile-scroll,.profile-rail{scrollbar-width:none}.profile-scroll::-webkit-scrollbar,.profile-rail::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}

const TITLE: React.CSSProperties = { fontSize: 16, fontWeight: 500, lineHeight: 1.2, letterSpacing: -0.2, color: ON_SURFACE, textShadow: "0 4px 4px rgba(0,0,0,0.4)" };

function SectionTitle({ title, onMore }: { title: string; onMore: () => void }) {
  return (
    <button onClick={onMore} className="flex items-center self-start">
      <span style={TITLE}>{title}</span>
      <span className="p-1"><ChevronRight size={16} color="#fff" /></span>
    </button>
  );
}
