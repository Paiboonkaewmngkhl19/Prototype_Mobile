// ─── Theme, shared with the TV prototype (Prototype_TV home.html :root) ──────────────────────────────────────────
// No purple accent: a dark navy page with a faint grey-blue glow, and selected things (chips, tabs, buttons) in the
// same frosted grey-blue glass the TV uses for a focused top-bar tab. Text, live and progress colours are unchanged.

export const BG = "#070e16";                                   // --bg-0: page colour
export const GLOW = "rgba(214,222,240,.12)";                   // --th-glow
// page background with the TV's faint glow from the bottom-right corner
export const PAGE_BG = `radial-gradient(900px 700px at 85% 110%, ${GLOW}, transparent 70%), ${BG}`;

export const ON_SURFACE = "#e8e8e8", ON_VARIANT = "#a8a8a8";
export const LIVE = "#ea5454", PROGRESS = "#f44735";

// --th-pill + --pill-hi: frosted grey-blue glass for the selected state, with the TV's white inner ring
export const PILL = "linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,0) 60%), linear-gradient(135deg, rgba(244,247,253,.66) 0%, rgba(220,226,240,.58) 55%, rgba(196,204,224,.52) 100%)";
export const PILL_RING = "inset 0 0 0 1.5px rgba(255,255,255,.45), inset -1px 3px 17px rgba(255,255,255,.2)";
// --chip-bg / --chip-border: an idle chip or outlined button
export const CHIP_BG = "rgba(255,255,255,.08)", CHIP_BORDER = "rgba(255,255,255,.16)";
// --glass-card / --glass-card-on: cards on the page, and the one that's on (playing / selected)
export const GLASS_CARD = "linear-gradient(180deg, rgba(161,161,161,.25), rgba(65,65,65,.25))";
export const GLASS_CARD_ON = "linear-gradient(180deg, rgba(230,230,240,.22), rgba(150,150,165,.16))";
// --th-panel: sheets and panels; --th-a/b/c: the grey-blue accent gradient for badges
export const PANEL = "linear-gradient(100deg, #3a4254 0%, #2a3040 45%, #1c2130 100%)";
export const PANEL_SOLID = "#1c2130";
export const ACCENT = "linear-gradient(115deg, #5f6982 0%, #d6def0 55%, #8e98b0 110%)";
// dividers and the nav's top line, a navy-tinted grey
export const OUTLINE = "#1f2a38";
// a page header floating over its content (Home, Store, packages): a dark fade at rest, Figma's "Mobile / Header
// Detail Page" glass (a dark-to-clear tint over a blur of the page below) once the page has scrolled
export const headerGlass = (scrolled: boolean) => ({
  background: scrolled ? "linear-gradient(180deg, rgba(7,14,22,0.6), rgba(118,128,150,0))" : "linear-gradient(180deg, rgba(0,0,0,0.65), rgba(0,0,0,0))",
  backdropFilter: scrolled ? "blur(20px)" : "none", WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
});
