// ─── The app's connection to rules.js ──────────────────────────────────────────────────────────────────────────────
// rules.js holds the product's rule logic (rights, crowns, previews, touch gestures, purchases). This file gives it the
// app's data; screens ask rules() and draw the answer. Built on first use because the channel list lives in TVScreen,
// which also uses these rules.
import "./rules.js";
import { CATALOG, ALL_SHORTS, CONTINUE_LIST, FOR_YOU_LIST, RENT_LIST, MY_RENTAL_LIST, UNTIL } from "./catalog";
import { CHANNELS, type Channel } from "./TVScreen";

const MobileRules = (self as any).MobileRules;   // rules.js registers itself as a global in the browser

export const RULES = MobileRules.RULES;
export const otpRule = MobileRules.otp;

// a channel as the rules see it. n is the channel number, which is unique; the rules
// look channels up by n
export const ruleChannel = (c: Channel) => ({
  n: c.no, no: Number(c.no), excl: c.excl, crown: c.premium ? (c.owned ? "owned" : "gold") : "",
  pkg: c.cats.includes("Sports") ? "sports" : undefined,
  cats: [c.cats.includes("Sports") && "sports", c.cats.includes("Movies & Series") && "movies", c.cats.includes("Digital TV") && "digital"].filter(Boolean),
});

// the OTT apps a package can be for, and the bundles: 0 unlocks the premium channels, 2 the premium sports channels
const BRANDS = Object.fromEntries(["netflix", "hbo", "disney", "prime", "iqiyi", "viu", "monomax", "reelshort", "dramabox", "shortmax", "wetv"].map(k => [k, {}]));
const BUNDLES = [{ tv: "ultimate", tags: [] }, { tags: [] }, { tv: "sports", tags: [] }];

let instance: any;
export function rules() {
  if (!instance) instance = MobileRules.create({
    catalog: {
      titles: CATALOG, shorts: ALL_SHORTS, channels: CHANNELS.map(ruleChannel), programmes: [],
      brands: BRANDS, packages: {}, bundles: BUNDLES,
      continueWatching: CONTINUE_LIST.map(c => ({ ...c, s: c.s ? Number(c.s) : undefined, e: c.e ? Number(c.e) : undefined })),
      forYou: FOR_YOU_LIST, rentList: RENT_LIST, myRental: MY_RENTAL_LIST, until: UNTIL,
      packageOnly: ["d9"], seriesPrice: { house: 279, got: 279, loki: 199 },
    },
  });
  return instance;
}

// what buying one of the Store's packages grants, by its name
const OTT_OF: Record<string, string[]> = {
  "Netflix Standard": ["netflix"], "HBO Max": ["hbo"], "Disney+ Hotstar": ["disney"], "Viu Premium": ["viu"], "iQIYI VIP": ["iqiyi"],
  "ReelShort VIP": ["reelshort"], "DramaBox": ["dramabox"], "Shorts Plus": ["reelshort", "dramabox"], "Clips Unlimited": ["reelshort", "dramabox"],
};
const SPORTS_PACKAGES = /MONOMAX Sports|Premier League|Football Plus|NBA League|RWS/i;
export function recordPurchase(pkg: string) {
  const r = rules();
  if (OTT_OF[pkg]) OTT_OF[pkg].forEach(ott => r.applyPurchase({ kind: "ott", ott }));
  else if (SPORTS_PACKAGES.test(pkg)) r.applyPurchase({ kind: "bundle", index: 2 });
  else if (/ULTIMATE/i.test(pkg)) r.applyPurchase({ kind: "bundle", index: 0 });
}
