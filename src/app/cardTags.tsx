// The tags on a card, the same on every page: the OTT logo (AIS PLAY's own titles carry its logo) and the crown's frame.
import { CHIP_BORDER } from "./theme";

const BASE = import.meta.env.BASE_URL;
export const ottSrc = (name: string) => name === "ais" ? `${BASE}badges/logo app/logoapp-cropped.png` : `${BASE}badges/tag-${name}.png`;

// One size on every card (40 x 24), 8px in from the card's bottom left corner. x: the card starts further in (Top 10);
// inline: sits in a row with other tags, which positions it
export const OTT_TAG = { width: 40, height: 24 };
export function OttTag({ plat, x = 8, inline }: { plat: string; x?: number; inline?: boolean }) {
  return <img src={ottSrc(plat)} alt={plat} className={`${inline ? "block shrink-0" : "absolute"} object-contain`}
    style={{ ...OTT_TAG, borderRadius: 9999, ...(plat === "ais" ? { background: "#000", padding: 2 } : {}), ...(inline ? {} : { left: x, bottom: 8 }) }} />;
}

// the circular frame around a crown on a card: 24 x 24 (the crown inside it is 16 x 16), on a dark tint with the theme's hairline
export const CROWN_IN_FRAME = 16;
export function CrownFrame({ className, style, children }: { className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return <span className={`flex items-center justify-center rounded-full shrink-0 ${className ?? ""}`} style={{ width: 24, height: 24, background: "rgba(0,0,0,0.55)", border: `1px solid ${CHIP_BORDER}`, ...style }}>{children}</span>;
}
