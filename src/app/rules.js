/*
  rules.js: Rule logic ของ AIS PLAY Mobile แปลงจาก Prototype_TV
  ------------------------------------------------------------
  - logic ล้วน ไม่แตะ DOM ไม่รับปุ่มรีโมต ไม่มี focus ไม่มี D-pad: หน้าจอ Mobile ถามไฟล์นี้แล้วค่อยวาดเอง
  - ใช้ได้ทั้ง <script src="rules.js"> (window.MobileRules) และ require('./rules.js')

  เริ่มใช้ (โหลด content.js, channels-data.js, leagues.js, packages.js ก่อน):
    var R = MobileRules.create({ catalog: MobileRules.catalogFromTv(window) });
    R.crown({k:'f1'})           // 'gold' | 'owned' | ''
    R.detailActions({k:'f1'})   // ปุ่มหน้า detail
    R.touch.player({ player:'live', gesture:'swipeUp', ... })   // ท่าทางบนจอ -> สิ่งที่ต้องทำ

  options ของ create: catalog (จำเป็น), store (getItem/setItem; ไม่ใส่ = sessionStorage หรือ memory),
                      now (ฟังก์ชันคืน ms; ใส่เวลาคงที่เพื่อเทสต์ได้)

  จุดที่ตั้งใจต่างจาก TV (ค้นคำว่า "MOBILE:" ในไฟล์นี้)
    1. แพ็กเกจรวมไม่ปลดล็อก Short drama ตามกติกาที่ TV เขียนไว้ (TV ปลดล็อก iQIYI shorts โดยไม่ตั้งใจ)
    2. สิทธิ์เช่าหมดอายุจริงเมื่อครบเวลา (TV บันทึกเวลาหมดอายุไว้แต่ไม่เคยเช็ก)
    3. สิทธิ์ดูโฆษณา Short นับใหม่ทุกวัน ตามข้อความ "No more ads today"
    4. ไม่มี Login ด้วย QR และ Home Internet เพราะทั้งคู่ผูกกับเครื่อง TV / กล่อง PLAYBOX
*/
(function(root, factory){
  if(typeof module === 'object' && module.exports) module.exports = factory();
  else root.MobileRules = factory();
})(typeof self !== 'undefined' ? self : this, function(){
  'use strict';

  // ---- ค่าคงที่จาก TV ----
  var RULES = {
    RENT_HOURS:48,
    SHORT_EPS:160, SHORT_FREE:10, SHORT_EP_PRICE:9, SHORT_RANGE:45,
    AD_START:4, AD_MAX:5, AD_SECONDS:5,
    PREVIEW_SECONDS:180,
    LOGIN_DIGITS:10, OTP_DIGITS:4, OTP_RESEND_SECONDS:60, QR_PAY_SECONDS:300,
    INTRO_SECONDS:90, CREDITS_SECONDS:30, NEXT_EPISODE_COUNTDOWN:5,
    CONTROLS_HIDE_MS:5000, SEEK_STEP_SECONDS:10, SEEK_COMMIT_MS:800
  };
  var GUIDE_APPS = ['viu', 'netflix', 'hbo', 'iqiyi', 'disney'];   // แอปที่มี Activation Guide
  var PASSES = [
    { name:'24-Hour Pass', hours:24, startDays:7, amt:199 },
    { name:'48-Hour Pass', hours:48, startDays:30, amt:299 },
    { name:'100-Hour Pass', hours:100, startDays:90, amt:399 }
  ];
  var MONTHS = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
  var MOVIE_APPS = ['netflix', 'hbo', 'disney', 'prime', 'iqiyi', 'viu', 'monomax'], SHORT_APPS = ['reelshort', 'dramabox', 'shortmax', 'iqiyi'];
  var SPORT_OF = { epl:'football', ucl:'football', bundesliga:'football', thai1:'football', nba:'basketball', motogp:'motorsports', pga:'golf', rws:'boxing' };
  var BUNDLE_TABS = [['foryou', 'bundle'], ['foryou', 'bundle', 'movies'], ['foryou', 'bundle', 'sports']];

  /*
    ตารางแปลงการควบคุม: รีโมต / focus บน TV -> touch บน Mobile
    ใช้เป็นสเปกอ้างอิง ส่วนที่มีเงื่อนไขอยู่ใน R.touch ด้านล่าง
  */
  var TV_TO_TOUCH = [
    { tv:'ลูกศรเลื่อน focus ไปการ์ดหรือปุ่ม', mobile:'ไม่มี focus: แตะเพื่อเปิด ปัดเพื่อเลื่อนรายการ' },
    { tv:'Enter / OK', mobile:'แตะ' },
    { tv:'Back / Escape', mobile:'ปุ่ม Back หรือ gesture ย้อนกลับของระบบ (R.touch.back)' },
    { tv:'focus การ์ดแล้ว Hero เปลี่ยนตาม / เล่นวิดีโอพื้นหลัง', mobile:'ไม่เปลี่ยนตาม focus: แตะการ์ดแล้วเข้า detail ทันที' },
    { tv:'focus แท็บหรือตัวกรองแล้วเลือกให้ทันที', mobile:'เลือกเมื่อแตะเท่านั้น' },
    { tv:'ปุ่ม Subscribe โผล่เมื่อ focus การ์ดแพ็กเกจ', mobile:'แสดงตลอดเวลา' },
    { tv:'Tooltip ของปุ่มไอคอนเมื่อ focus', mobile:'ไม่มี tooltip: ใช้ป้ายกำกับหรือ toast หลังแตะ' },
    { tv:'Profile panel เปิดเมื่อ focus รูปโปรไฟล์', mobile:'แตะรูปโปรไฟล์เพื่อเปิด' },
    { tv:'แป้นตัวเลขบนจอ + ปุ่มตัวเลขรีโมต', mobile:'คีย์บอร์ดตัวเลขของเครื่อง (R.login.accept, R.otp.accept)' },
    { tv:'ซ้าย / ขวาบนแถบเวลา ทีละ 10 วินาที', mobile:'แตะสองครั้งฝั่งซ้าย / ขวา หรือลากแถบเวลา' },
    { tv:'กดซ้าย / ขวาค้าง เร่ง 2x 4x 8x 16x', mobile:'กดค้างฝั่งซ้าย / ขวาของวิดีโอ' },
    { tv:'ขึ้น / ลง เปลี่ยนช่อง (ควบคุมซ่อนอยู่)', mobile:'ปัดขึ้น = ช่องถัดไป, ปัดลง = ช่องก่อนหน้า' },
    { tv:'กดเลขช่อง 3 หลัก', mobile:'ตัดออก: เลือกจาก TV Guide หรือ mini EPG' },
    { tv:'ซ้าย เปิด mini EPG', mobile:'ปัดจากขอบซ้าย หรือแตะปุ่ม' },
    { tv:'ขึ้น / ลง เปลี่ยนตอน Short', mobile:'ปัดขึ้น = ตอนถัดไป, ปัดลง = ตอนก่อนหน้า' },
    { tv:'กดปุ่มใดก็ได้ตอนควบคุมซ่อน = แค่เรียกกลับมา', mobile:'แตะแรกเรียกควบคุม แตะอีกครั้งซ่อน' },
    { tv:'กดปุ่มใดก็ได้ตอนนับถอยหลังตอนถัดไป = หยุดนับ', mobile:'แตะตรงไหนก็ได้ = หยุดนับ' }
  ];

  function memoryStore(){
    var d = {};
    return { getItem:function(k){ return k in d ? d[k] : null; }, setItem:function(k, v){ d[k] = String(v); }, removeItem:function(k){ delete d[k]; } };
  }
  function defaultStore(){
    try { if(typeof sessionStorage !== 'undefined') return sessionStorage; } catch(e){}
    return memoryStore();
  }
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }
  function money2(n){ return (Math.round(n * 107) / 100).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }); }

  /*
    catalogFromTv: รวมข้อมูลจาก global ของ TV เป็น catalog ก้อนเดียว
    packageOnly และ seriesPrice เป็นตัวแปรภายใน content.js จึงต้องคัดลอกค่ามาไว้ที่นี่ ถ้าแก้ที่ TV ต้องแก้ตามด้วย
  */
  function catalogFromTv(g){
    var until = {};
    g.MD.MY_RENTAL.forEach(function(k){ var u = g.MD.until(k); if(u) until[k] = u; });
    return {
      titles:g.MD.M, shorts:g.SHORTS, channels:g.TV.CHANNELS, programmes:g.LIVE.list,
      brands:g.Packages.OTT, packages:g.Packages.PKG, bundles:g.Packages.BUNDLES,
      continueWatching:g.MD.CONTINUE, forYou:g.MD.FOR_YOU, rentList:g.MD.RENT, myRental:g.MD.MY_RENTAL.slice(), until:until,
      packageOnly:['d9'], seriesPrice:{ house:279, got:279, loki:199 }
    };
  }

  function create(opts){
    var C = opts.catalog, S = opts.store || defaultStore(), clock = opts.now || function(){ return Date.now(); };
    var LOADED = clock(), M = C.titles, SHORTS = C.shorts, ULTIMATE = C.bundles[0];

    function get(k, d){ try { var v = S.getItem(k); return v === null || v === undefined ? d : JSON.parse(v); } catch(e){ return d; } }
    function put(k, v){ try { S.setItem(k, JSON.stringify(v)); } catch(e){} }
    function addTo(k, v){ var a = get(k, []); if(v !== undefined && v !== '' && a.indexOf(v) < 0){ a.push(v); put(k, a); } }
    function find(list, k){ for(var i = 0; i < list.length; i++) if(list[i].k === k) return list[i]; return null; }

    // ---- สิทธิ์ที่ซื้อแล้ว ----
    // MOBILE: 1 แยกสิทธิ์ที่มาจากแพ็กเกจรวม (bundleOtt) ออกจากแพ็กเกจของแอปเอง เพื่อไม่ให้แพ็กเกจรวมปลดล็อก Short
    function subscribedDirect(p){ return !!p && get('ottSubscribed', []).indexOf(p) >= 0; }
    function subscribed(p){ return subscribedDirect(p) || (!!p && get('bundleOtt', []).indexOf(p) >= 0); }
    function own(k){ addTo('mdOwned', k); }
    function subscribeTv(g){ addTo('tvSubs', g); }
    function subscribe(p){ addTo('ottSubscribed', p); }

    // ---- หนัง / ซีรีส์ ----
    function isSeries(k){ return /Season/.test((M[k] && M[k].len) || ''); }
    function seasons(k){ return isSeries(k) ? Math.min(3, parseInt(M[k].len, 10) || 1) : 0; }
    function episodeCount(k){ return M[k] && M[k].eps ? M[k].eps.length : 8; }
    function nextEpisode(k, s, e){ return e < episodeCount(k) ? { s:s, e:e + 1 } : s < seasons(k) ? { s:s + 1, e:1 } : null; }
    function offers(k){ return !!M[k] && 'pkg' in M[k]; }
    function listPrice(k){
      var f = find(C.forYou, k);
      return f ? f.price : find(C.rentList, k) ? 149 : C.seriesPrice[k] || (M[k] && M[k].price) || 0;
    }
    function buyPrice(k){ return offers(k) ? M[k].buy : listPrice(k); }
    function rentPrice(k){ return offers(k) ? M[k].rent : 0; }
    function price(k){ return buyPrice(k) || rentPrice(k); }
    function soon(k){
      var m = M[k]; if(!m || !m.soon) return null;
      var d = new Date(clock()); d.setHours(0, 0, 0, 0);
      return d.getTime() + m.soon * 864e5;
    }
    // MOBILE: 2 เช่าในแอปหมดอายุตามเวลา; รายการตัวอย่างใน catalog.myRental ไม่มีเวลาหมดอายุจึงยังใช้ได้
    function rentalActive(k){
      var r = get('mdRented', {})[k];
      return r ? r > clock() : C.myRental.indexOf(k) >= 0;
    }
    function rent(k){ var r = get('mdRented', {}); if(!r[k] || r[k] <= clock()) r[k] = clock() + RULES.RENT_HOURS * 36e5; put('mdRented', r); }
    function until(k){
      var r = get('mdRented', {})[k];
      if(r) return r > clock() ? { ms:r } : null;
      return C.until[k] && C.myRental.indexOf(k) >= 0 ? C.until[k] : null;
    }
    function cw(k){
      var p = get('mdProgress', {})[k], c = p ? { k:k, w:p.w, of:p.of, s:p.s, e:p.e } : find(C.continueWatching, k);
      if(c){ c = { k:c.k, w:c.w, of:c.of, s:c.s, e:c.e }; if(isSeries(k) && !c.s){ c.s = 1; c.e = 1; } }
      return c || undefined;
    }
    function setProgress(k, w, of, s, e){ var p = get('mdProgress', {}); p[k] = { w:w, of:of, s:s, e:e, at:clock() }; put('mdProgress', p); }
    // 'soon' ยังไม่เข้า, 'buy' ยังไม่ได้สิทธิ์, 'resume' ดูค้างไว้, 'play' ดูได้
    function state(k){
      if(soon(k)) return 'soon';
      var bought = get('mdOwned', []).indexOf(k) >= 0 || !!(M[k] && M[k].premium && subscribed(M[k].plat));
      if(!bought && C.packageOnly.indexOf(k) >= 0) return 'buy';
      if(!bought && !rentalActive(k) && (price(k) || (offers(k) && M[k].pkg))) return 'buy';
      return cw(k) ? 'resume' : 'play';
    }
    function watchedList(kidsOnly, seed){
      var p = get('mdProgress', {}), seen = {}, out = [];
      Object.keys(p).sort(function(a, b){ return (p[b].at || 0) - (p[a].at || 0); }).forEach(function(k){
        if(!kidsOnly) seen[k] = 1;
        if(M[k] && M[k].w && (!kidsOnly || M[k].kids) && p[k].w < p[k].of - 1 && (kidsOnly || state(k) !== 'buy')){ seen[k] = 1; out.push(kidsOnly ? { k:k, w:p[k].w, of:p[k].of } : cw(k)); }
      });
      seed.forEach(function(c){ if(!seen[c.k]) out.push(kidsOnly ? c : cw(c.k)); });
      return out;
    }
    function continueList(){ return watchedList(false, C.continueWatching); }
    function kidsContinue(seed){ return watchedList(true, seed || []).filter(function(c){ return state(c.k) !== 'buy'; }); }

    // ---- Short drama ----
    function unlockedOf(s){ return get('shortUnlocked' + s, {}); }
    function shortOwned(s){
      var u = unlockedOf(s), sh = SHORTS[s];
      if(u.all || get('shortOwned', []).indexOf(s) >= 0 || (sh && subscribedDirect(sh.plat))) return true;
      for(var n = RULES.SHORT_FREE + 1; n <= RULES.SHORT_EPS; n++) if(!u[n]) return false;
      return true;
    }
    function shortOpen(s, n){ return n <= RULES.SHORT_FREE || !!unlockedOf(s)[n] || shortOwned(s); }
    function shortAt(s){ return get('shortProgress', {})[s] || null; }
    function setShortAt(s, ep, sec){ var p = get('shortProgress', {}); p[s] = { ep:ep, sec:Math.floor(sec) }; put('shortProgress', p); }
    function unlockEpisode(s, n){ var u = unlockedOf(s); u[n] = 1; put('shortUnlocked' + s, u); }
    function unlockAll(s){ var u = unlockedOf(s); u.all = 1; put('shortUnlocked' + s, u); }
    function shortMonthly(s){
      var ps = C.packages[SHORTS[s].plat] || [], m = ps.filter(function(p){ return /month/i.test(p.per); });
      return (m.length ? m : ps).map(function(p){ return p.price; }).sort(function(a, b){ return a - b; })[0];
    }
    // MOBILE: 3 นับสิทธิ์โฆษณาเป็นรายวัน
    function dayKey(){ var d = new Date(clock()); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
    function adsLeft(){ var a = get('shortAds', null); return a && a.day === dayKey() ? a.left : RULES.AD_START; }
    function useAd(){ var n = adsLeft(); if(n <= 0) return false; put('shortAds', { day:dayKey(), left:n - 1 }); return true; }
    function unlockOptions(s, n){
      var sh = SHORTS[s], mo = shortMonthly(s), left = adsLeft(), o = [];
      if(mo) o.push({ id:'sub', title:'Subscribe to a package', sub:'Subscribe to unlock all content', price:mo + ' ฿/month', enabled:true, url:'all-packages.html?tab=shorts' });
      if(sh.buy) o.push({ id:'series', title:'Buy this series', sub:'Unlock all episodes', price:sh.buy + ' ฿', enabled:true, url:'package-detail.html?short=' + s + '&opt=buy' });
      o.push({ id:'ep', title:'Buy episode ' + n, sub:'Unlock one episode', price:RULES.SHORT_EP_PRICE + ' ฿', enabled:true, url:'package-detail.html?short=' + s + '&opt=ep&ep=' + n });
      o.push({ id:'ads', title:'Watch ads to unlock (' + left + '/' + RULES.AD_MAX + ')', sub:left > 0 ? 'Unlock this episode for free' : 'No more ads today', price:'Free', enabled:left > 0 });
      return o;
    }
    function episodeRanges(){
      var out = [];
      for(var a = 1; a <= RULES.SHORT_EPS; a += RULES.SHORT_RANGE) out.push({ from:a, to:Math.min(a + RULES.SHORT_RANGE - 1, RULES.SHORT_EPS) });
      return out;
    }
    // แตะตอนของ Short: ตอนที่เปิดได้เล่นเลย ตอนที่ล็อกเปิดหน้าปลดล็อก
    function shortEpisodeTap(s, n){
      if(!shortOpen(s, n)) return { act:'unlock', ep:n, options:unlockOptions(s, n) };
      var cur = (shortAt(s) || {}).ep || 1;
      return { act:'play', url:'player.html?short=' + s + '&ep=' + n + (n === cur ? '' : '&start=1') };
    }

    // ---- ช่องทีวี ----
    function byName(n){ for(var i = 0; i < C.channels.length; i++) if(C.channels[i].n === n) return C.channels[i]; return null; }
    function channelOf(info){
      var c = info.tv !== undefined ? info.tv : info.ch !== undefined ? info.ch : info.n !== undefined && 'crown' in info ? info : null;
      if(c === null || c === '') return null;
      var name = typeof c === 'string' ? c : c.n;
      return byName(name) || (typeof c === 'string' ? { n:c, crown:'' } : c);
    }
    function target(info){
      if(info && info.k && M[info.k]) return { k:info.k };
      if(info && info.s !== undefined && info.s !== '' && SHORTS[+info.s]) return { s:+info.s };
      return null;
    }

    // ---- Crown: สถานะเดียวของทุกคอนเทนต์ ('' ฟรี, 'owned' มีสิทธิ์แล้ว, 'gold' ยังไม่มีสิทธิ์) ----
    function crown(info){
      if(!info) return '';
      var c = channelOf(info);
      if(c){
        if(!c.crown) return '';
        return c.crown === 'owned' || get('tvSubs', []).indexOf(c.pkg || 'ultimate') >= 0 ? 'owned' : 'gold';
      }
      var f = target(info);
      if(f && f.s !== undefined) return SHORTS[f.s].premium ? (shortOwned(f.s) ? 'owned' : 'gold') : '';
      if(f){
        var m = M[f.k], st = state(f.k);
        return m.premium || m.ppv ? (st === 'play' || st === 'resume' ? 'owned' : 'gold') : '';
      }
      return info.ppv || info.premium ? 'gold' : '';
    }
    function showsCrown(info){ return crown(info) === 'gold'; }   // owned ไม่แสดงมงกุฎและป้าย Premium เหมือนของฟรี

    // ---- แพ็กเกจที่รวมคอนเทนต์นี้ ----
    var PLAY_ULTIMATE = { n:'PLAY ULTIMATE Monthly Package', url:'package-detail.html' }, PLAY_ALL = { n:'PLAY ALL', url:'package-detail.html?bundle=2' };
    function packageFor(info){
      if(!info) return { n:'All Packages', url:'all-packages.html' };
      var ch = channelOf(info);
      if(ch) return ch.pkg === 'sports' ? PLAY_ALL : PLAY_ULTIMATE;
      var f = target(info), plat = f && f.s !== undefined ? SHORTS[f.s].plat : f ? M[f.k].plat : '';
      if(f && f.k && M[f.k].pkg === false) return null;   // ขายเดี่ยวเท่านั้น
      if(f && f.k && M[f.k].ppv) plat = '';
      if(plat === 'ais') return PLAY_ULTIMATE;
      if(plat && C.packages[plat]) return { n:C.brands[plat].n, url:'package-detail.html?ott=' + plat + '&p=0', ott:plat };
      return { n:'All Packages', url:'all-packages.html' };
    }
    function detailUrl(info){ var f = target(info); return f.s !== undefined ? 'short-detail.html?s=' + f.s : 'movie-detail.html?k=' + f.k; }
    function playUrl(info){ var f = target(info); return f.s !== undefined ? 'player.html?short=' + f.s : 'player.html?k=' + f.k; }
    function packageUrl(info, ret){
      var c = !info.prog && channelOf(info), f = !info.prog && !c && target(info);
      var q = info.prog || c ? 'prog=' + encodeURIComponent(JSON.stringify(info.prog || { t:c.n, tv:c.n, live:1 })) : f.s !== undefined ? 's=' + f.s : 'k=' + f.k;
      return 'package-suggest.html?' + q + '&ret=' + encodeURIComponent(ret || '');
    }
    function ottCard(k, i){
      var p = C.packages[k][i];
      return { kind:'ott', ott:k, i:i, title:p.t, badge:p.badge, price:p.price, per:p.card === 'Month' ? 'Month' : '7 Days', q:p.q, screens:p.screens, url:'package-detail.html?ott=' + k + '&p=' + i };
    }
    function bundleCard(i){ var b = C.bundles[i]; return { kind:'bundle', index:i, title:b.title, badge:b.badge, amt:b.amt, per:b.per, url:b.href || '' }; }
    function suggest(o){
      var out = [], seen = {};
      function add(c){ var id = c.kind + (c.kind === 'ott' ? c.ott + c.i : c.index); if(out.length < 3 && !seen[id]){ seen[id] = 1; out.push(c); } }
      if(o.channel){
        if(o.sport){ add(bundleCard(2)); if(o.league && C.packages[o.league]) C.packages[o.league].forEach(function(p, i){ add(ottCard(o.league, i)); }); }
        else add(bundleCard(0));
      } else if(o.plat && C.packages[o.plat]){
        C.bundles.forEach(function(b, i){ if(b.tags.indexOf(o.plat) >= 0) add(bundleCard(i)); });
        C.packages[o.plat].forEach(function(p, i){ add(ottCard(o.plat, i)); });
      } else { add(bundleCard(0)); add(bundleCard(1)); add(bundleCard(2)); }
      out.forEach(function(c, i){ if(i && c.badge === 'Recommended') c.badge = ''; });   // Recommended ใบแรกใบเดียว
      return out;
    }
    // หน้า All Packages: tab = foryou | sports | movies | shorts | bundle; name, logo = ตัวกรอง (ค่าเริ่มต้น all)
    function packageList(tab, name, logo){
      name = name || 'all'; logo = logo || 'all';
      var all = C.bundles.map(function(b, i){ var c = bundleCard(i); c.tabs = BUNDLE_TABS[i] || ['foryou', 'bundle']; c.tags = b.tags; return c; });
      Object.keys(C.packages).forEach(function(k){
        var lg = C.brands[k].league, tabs = lg ? ['sports'] : [];
        if(MOVIE_APPS.indexOf(k) >= 0) tabs.push('movies');
        if(SHORT_APPS.indexOf(k) >= 0) tabs.push('shorts');
        C.packages[k].forEach(function(p, i){
          var c = ottCard(k, i);
          c.tags = [k].concat(lg ? [SPORT_OF[k]] : []);
          c.tabs = tabs.concat(i ? [] : ['foryou']);
          if(i) c.badge = '';
          all.push(c);
        });
      });
      return all.filter(function(c){ return c.tabs.indexOf(tab) >= 0 && (name === 'all' || c.tags.indexOf(name) >= 0) && (logo === 'all' || c.tags.indexOf(logo) >= 0); });
    }

    // ---- ปุ่มหลัก ----
    function mainAction(info){
      var f = target(info);
      if(crown(f) === 'gold'){
        var b = f.k && !packageFor(f) && (buyPrice(f.k) ? 'buy' : rentPrice(f.k) ? 'rent' : '');
        if(b) return { act:b, label:(b === 'buy' ? 'Buy ' + buyPrice(f.k) : 'Rent ' + rentPrice(f.k)) + ' ฿', url:'package-detail.html?k=' + f.k + '&opt=' + b };
        return { act:'package', label:'View Package', url:packageUrl(f, detailUrl(f)) };
      }
      if(f.s !== undefined){
        var ep = (shortAt(f.s) || {}).ep || 1;
        return { act:'play', label:'Play Ep.' + ep, url:'player.html?short=' + f.s + '&ep=' + ep };
      }
      var c = state(f.k) === 'resume' && cw(f.k);
      return { act:'play', label:c ? (isSeries(f.k) ? 'Resume S' + c.s + ': Ep.' + c.e : 'Resume') : 'Play', url:playUrl(f) };
    }
    function btn(id, label, style, extra){
      var b = { id:id, label:label, style:style, enabled:true };
      for(var x in (extra || {})) b[x] = extra[x];
      return b;
    }
    // ปุ่มหน้า detail ทั้งแถว: { buttons:[...], icons:[...], until, progress } (ลำดับคือลำดับบนจอ)
    function detailActions(info){
      var f = target(info);
      if(f.s !== undefined){
        var s = f.s, sh = SHORTS[s], ep = (shortAt(s) || {}).ep || 1, b = [btn('play', 'Play Ep.' + ep, 'primary', { url:'player.html?short=' + s + '&ep=' + ep })];
        if(crown(f) === 'gold'){
          b.push(btn('package', 'View Package', 'secondary', { url:packageUrl(f, detailUrl(f)) }));
          if(sh.buy) b.push(btn('buy', 'Buy ' + sh.buy + ' ฿', 'secondary', { url:'package-detail.html?short=' + s + '&opt=buy' }));
        }
        return { buttons:b, icons:(shortAt(s) ? ['startOver'] : []).concat(['myList', 'like', 'dislike']) };
      }
      var k = f.k, st = state(k), w = cw(k), out = { buttons:[], icons:[], until:until(k), progress:st === 'resume' ? { w:w.w, of:w.of, pct:Math.round(w.w / w.of * 100) } : null };
      if(st === 'soon'){
        var d = new Date(soon(k));
        out.buttons = [btn('coming', 'Coming ' + d.getDate() + ' ' + MONTHS[d.getMonth()], 'primary', { enabled:false })];
        out.icons = ['myList', 'remind', 'like', 'dislike'];
        return out;
      }
      if(crown(f) === 'gold'){
        var o = [];
        if(packageFor(f)) o.push(['package', 'View Package', packageUrl(f, detailUrl(f))]);
        if(buyPrice(k)) o.push(['buy', 'Buy ' + buyPrice(k) + ' ฿', 'package-detail.html?k=' + k + '&opt=buy']);
        if(rentPrice(k)) o.push(['rent', 'Rent ' + rentPrice(k) + ' ฿', 'package-detail.html?k=' + k + '&opt=rent']);
        out.buttons = o.map(function(x, i){ return btn(x[0], x[1], i ? 'secondary' : 'primary', { url:x[2] }); });
      } else {
        var main = mainAction(f);
        out.buttons = [btn(st === 'resume' ? 'resume' : 'play', main.label, 'primary', { url:main.url })];
      }
      out.icons = (st === 'resume' ? ['startOver'] : []).concat(['myList', 'like', 'dislike']);
      return out;
    }
    // แตะตอนของซีรีส์
    function episodeTap(k, s, e){
      if(crown({k:k}) === 'gold') return { act:'blocked', message:'Get a package or buy ' + M[k].t + ' to watch' };
      if(state(k) === 'soon') return { act:'blocked', message:M[k].t + ' isn’t out yet: Remind me to hear when it is' };
      var c = cw(k), same = c && c.s === s && c.e === e;
      return { act:'play', url:'player.html?k=' + k + '&s=' + s + '&e=' + e + (same ? '' : '&start=1') };
    }

    // ---- Live / Upcoming ----
    function start(p){
      if(p.start) return +p.start;
      if(p.in) return LOADED + p.in * 60000;
      var w = p.when || '', m = /Starts in (\d+):(\d+)/i.exec(w);
      if(m) return LOADED + (+m[1] * 60 + +m[2]) * 1000;
      m = /(Today|Tomorrow)\s+(\d{1,2}):(\d{2})\s*(AM|PM)?/i.exec(w);
      if(!m) return LOADED + 3600000;
      var d = new Date(clock()), h = +m[2];
      if(m[4] && /PM/i.test(m[4]) && h < 12) h += 12;
      if(m[4] && /AM/i.test(m[4]) && h === 12) h = 0;
      d.setHours(h, +m[3], 0, 0);
      if(/Tomorrow/i.test(m[1]) || d.getTime() <= clock()) d.setDate(d.getDate() + 1);
      return d.getTime();
    }
    function hm12(t){ var d = new Date(t), h = d.getHours(); return ((h % 12) || 12) + ':' + pad(d.getMinutes()) + (h < 12 ? ' AM' : ' PM'); }
    function label(p){
      var t = start(p), left = t - clock();
      if(left < 3600000){ var s = Math.max(0, Math.floor(left / 1000)); return 'Starts in ' + Math.floor(s / 60) + ':' + pad(s % 60); }
      var a = new Date(t), b = new Date(clock()); a.setHours(0, 0, 0, 0); b.setHours(0, 0, 0, 0);
      var dd = Math.round((a - b) / 864e5), d = new Date(t);
      return (dd === 0 ? 'Today ' : dd === 1 ? 'Tomorrow ' : d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ') + hm12(t);
    }
    function hasDetail(tv){
      var c = byName(tv), has = function(k){ return c.cats.indexOf(k) >= 0; };
      return !!c && (has('sports') || (has('movies') && !has('digital')));
    }
    // รายการที่ Live อยู่เล่นช่องทันที ไม่มีหน้า detail; Upcoming ของช่องกีฬา/หนังเปิด detail ส่วนช่องอื่นเล่นช่องเลย
    function programmeHref(p, from){
      if(!p.live && hasDetail(p.tv)){
        var o = { t:p.t, img:p.img, tv:p.tv, d:p.d || '' };
        if(p.lg) o.lg = p.lg;
        if(p.bg) o.bg = p.bg;
        o.start = start(p);
        if(p.range) o.range = p.range;
        return 'movie-detail.html?prog=' + encodeURIComponent(JSON.stringify(o));
      }
      return 'tv-guide.html?play=' + encodeURIComponent(p.tv) + '&from=' + (from || 'home') + (p.live ? '&t=' + encodeURIComponent(p.t) : '');
    }
    function programmeActions(p){
      var gold = crown({tv:p.tv}) === 'gold', pkg = { tv:p.tv, prog:p };
      if(!p.live){
        var started = clock() >= start(p);
        return { started:started, buttons:[btn('starts', label(p), 'primary', { enabled:false })].concat(gold ? [btn('package', 'View Package', 'secondary', { url:packageUrl(pkg, '') })] : []),
                 icons:gold ? ['remind'] : ['favorite', 'remind', 'like', 'dislike'] };
      }
      return { buttons:gold ? [btn('package', 'View Package', 'primary', { url:packageUrl(pkg, '') }), btn('buy', 'Buy 299 ฿', 'secondary', {})]
                            : [btn('play', 'Play', 'primary', { url:'tv-guide.html?play=' + encodeURIComponent(p.tv) + '&from=detail&t=' + encodeURIComponent(p.t) })],
               icons:['favorite', 'like', 'dislike'] };
    }
    function isFav(c){ var f = get('tvFavs', null); return f && c.n in f ? !!f[c.n] : !!c.fav; }
    function setFav(c, on){ var f = get('tvFavs', {}); f[c.n] = !!on; put('tvFavs', f); }

    // นโยบายของ Live player ตามสิทธิ์ช่อง (ts = รายการนี้มี Time Shift)
    function liveState(channel, ts){
      var gold = crown({ch:channel}) === 'gold', k = 'freePreview:' + channel.n, kept = get(k, null), left = kept === null ? RULES.PREVIEW_SECONDS : +kept;
      return { preview:gold, previewLeft:gold ? left : 0, previewOver:gold && left <= 0, timeShift:!!ts, timeShiftLocked:!!ts && gold, canPause:!!ts && !gold, canSeek:!!ts && !gold, canStartOver:!!ts && !gold, showExplorePackage:gold };
    }
    // เรียกทุก 1 วินาที นับเฉพาะตอนวิดีโอกำลังเล่น คงเวลาไว้รายช่อง ออกแล้วกลับมาไม่เริ่มใหม่
    function previewTick(channel, playing){
      var st = liveState(channel, false);
      if(!st.preview || st.previewOver || !playing) return st;
      put('freePreview:' + channel.n, st.previewLeft - 1);
      return liveState(channel, false);
    }
    function zap(currentName, dir){
      var nums = C.channels.filter(function(c){ return !c.excl; }).sort(function(a, b){ return a.no - b.no; });
      var at = nums.map(function(c){ return c.n; }).indexOf(currentName);
      if(at < 0) at = dir > 0 ? -1 : 0;
      return nums[(at + dir + nums.length) % nums.length];
    }

    // ---- การซื้อ ----
    function applyPurchase(o){
      if(o.kind === 'bundle'){
        var b = C.bundles[o.index];
        if(b.tv) subscribeTv(b.tv);
        b.tags.forEach(function(t){ if(C.packages[t] && !C.brands[t].league) addTo('bundleOtt', t); });
      } else if(o.kind === 'ott'){
        subscribe(o.ott);
        if(C.brands[o.ott].league) subscribeTv('sports');   // แพ็กเกจลีกใดก็ได้ปลดล็อกช่องกีฬาพรีเมียมทั้งหมด
      } else if(o.kind === 'title'){
        if(o.opt === 'rent') rent(o.k); else own(o.k);
      } else if(o.kind === 'short'){
        if(o.opt === 'ep') unlockEpisode(o.s, o.ep);
        else if(o.opt === 'pass') unlockAll(o.s);
        else addTo('shortOwned', o.s);
      }
      if(o.fromTitle) own(o.fromTitle);   // ซื้อผ่าน View Package ของเรื่องไหน เรื่องนั้นเป็นของผู้ชม
    }
    function vat(n){ return money2(n); }
    function titleOptions(o){
      var H = RULES.RENT_HOURS, m = o.k ? M[o.k] : null, sh = o.s !== undefined ? SHORTS[o.s] : null;
      var opt = function(x){ x.vat = money2(x.amt); return x; };
      if(sh && o.opt === 'ep') return [opt({ name:'Episode ' + o.ep, lines:['Watch episode ' + o.ep + ' as many times as you like.'], amt:RULES.SHORT_EP_PRICE })];
      if(sh && o.opt === 'buy' && sh.buy) return [opt({ name:'Full HD', lines:[], amt:sh.buy })];
      if(sh) return PASSES.map(function(p){ return opt({ name:p.name, hours:p.hours, lines:['Start anytime within ' + p.startDays + ' days.', 'Enjoy ' + p.hours + ' hours of unlimited viewing.'], amt:p.amt }); });
      if(o.opt === 'rent') return [opt({ name:H + '-Hour Pass', hours:H, lines:['Start anytime within 7 days.', 'Enjoy ' + H + ' hours of unlimited viewing.'], amt:rentPrice(o.k) })];
      if(m.ev || m.ppv) return [opt({ name:'Event Pass', lines:['Watch live at the scheduled time'], amt:buyPrice(o.k) })];
      return [opt({ name:m.q === '4k' ? '4K' : 'Full HD', lines:[], amt:buyPrice(o.k) })];
    }
    // วันหมดของแพ็กเกจ: period = '7d' | 'month' | 'year'
    function packagePeriod(period, from){
      var a = new Date(from === undefined ? clock() : from), b = new Date(a.getTime());
      if(period === '7d') b.setDate(b.getDate() + 6);
      else if(period === 'year'){ b.setFullYear(b.getFullYear() + 1); b.setDate(b.getDate() - 1); }
      else { b.setMonth(b.getMonth() + 1); b.setDate(b.getDate() - 1); }
      return { start:a.getTime(), end:b.getTime() };
    }
    function renewLabel(period){ return period === 'month' ? 'Renews monthly' : period === 'year' ? 'Renews yearly' : 'One-time'; }
    function purchaseResult(o){
      var pack = o.kind === 'ott' || o.kind === 'bundle';
      var activate = o.kind === 'ott' ? GUIDE_APPS.indexOf(o.ott) >= 0 : o.kind === 'bundle' ? !!C.bundles[o.index].services : false;
      return {
        activate:activate, guide:activate ? (o.kind === 'ott' ? o.ott : 'netflix') : null, nextButton:activate ? 'guide' : 'watch',
        lead:activate ? 'Activate your app to start watching content' : pack ? 'You’re all set. No activation needed. Sign in to watch now.' : 'You’re all set. No activation needed. Start watching now.'
      };
    }

    // ---- related ----
    function related(info, n){
      n = n || 18;
      function shared(a, b){ return (a || []).filter(function(x){ return (b || []).indexOf(x) >= 0; }).length; }
      function rank(list, me, g, plat, y){
        return list.map(function(x, i){ return { x:x, i:i, g:shared(g(x), g(me)), p:plat(x) === plat(me) ? 1 : 0, y:y(x) || 0 }; })
          .sort(function(a, b){ return b.g - a.g || b.p - a.p || b.y - a.y || a.i - b.i; }).map(function(r){ return r.x; });
      }
      if(info && info.s !== undefined && info.s !== '' && SHORTS[+info.s]){
        var me = +info.s, list = SHORTS.map(function(x, i){ return i; }).filter(function(i){ return i !== me; });
        return rank(list, me, function(i){ return SHORTS[i].gen; }, function(i){ return SHORTS[i].plat; }, function(){ return 0; }).slice(0, n).map(function(i){ return { s:i }; });
      }
      if(info && info.k && M[info.k]){
        var K = info.k, SER = isSeries(K), keys = Object.keys(M).filter(function(k){ return k !== K && !M[k].adhoc && isSeries(k) === SER; });
        return rank(keys, K, function(k){ return M[k].g; }, function(k){ return M[k].plat; }, function(k){ return M[k].y; }).slice(0, n).map(function(k){ return { k:k }; });
      }
      if(info && info.t){
        var p = C.programmes.filter(function(q){ return q.t === info.t; })[0] || info;
        return C.programmes.filter(function(q){ return q.t !== p.t && !q.hidden; }).map(function(q, i){
          return { q:q, i:i, s:(p.lg && q.lg === p.lg ? 2 : 0) + (p.sp && q.sp === p.sp ? 1 : 0) };
        }).sort(function(a, b){ return b.s - a.s || (b.q.live ? 1 : 0) - (a.q.live ? 1 : 0) || a.i - b.i; }).slice(0, n).map(function(r){ return r.q; });
      }
      return [];
    }

    // ---- ผู้เล่น VOD: จุดตัดของ Skip Intro, credits และจบเรื่อง ----
    function vodTick(c){
      var series = !!c.series, shortDrama = !!c.short;
      return {
        showSkipIntro:series && !shortDrama && !c.skipped && c.pos < RULES.INTRO_SECONDS,
        startCredits:series && !shortDrama && !!c.hasNext && !c.credits && c.pos >= c.len - RULES.CREDITS_SECONDS,
        atEnd:c.pos >= c.len ? (c.hasNext ? 'next' : 'exit') : null
      };
    }

    /*
      ---- กฎ touch (แทน D-pad) ----
      R.touch.player(ctx) รับท่าทาง คืนคำสั่งให้หน้าจอทำ
        ctx: player 'vod' | 'live' | 'short', gesture 'tap' | 'doubleTapLeft' | 'doubleTapRight' | 'longPressLeft' |
             'longPressRight' | 'swipeUp' | 'swipeDown' | 'swipeFromLeft', controlsVisible, adPlaying, creditsCounting,
             live (ผลของ R.liveState), previewOver
    */
    var touch = {
      player:function(c){
        var g = c.gesture, live = c.live || {};
        if(c.adPlaying) return { act:'ignore' };   // ระหว่างโฆษณาไม่รับทุกท่าทาง
        if(c.creditsCounting && g === 'tap') return { act:'stopCountdown' };
        if(g === 'tap') return { act:c.controlsVisible ? 'hideControls' : 'showControls' };
        if(g === 'swipeUp' || g === 'swipeDown'){
          var dir = g === 'swipeUp' ? 1 : -1;
          if(c.player === 'short') return { act:'changeEpisode', dir:dir };
          if(c.player === 'live') return { act:'changeChannel', dir:dir };
          return { act:'ignore' };
        }
        if(g === 'swipeFromLeft') return { act:c.player === 'live' ? 'openMiniEpg' : 'ignore' };
        if(/^(doubleTap|longPress)/.test(g)){
          var side = /Left$/.test(g) ? -1 : 1, hold = /^longPress/.test(g);
          if(c.player === 'live'){
            if(live.timeShiftLocked) return { act:'timeShiftLocked', message:'Time Shift is part of the package. Get it to pause and rewind' };
            if(!live.canSeek) return { act:'ignore' };
          }
          return { act:hold ? 'holdSeek' : 'seek', dir:side };
        }
        return { act:'ignore' };
      },
      // เวลาซ่อนควบคุมอัตโนมัติ (ms); null = ไม่ซ่อน เช่น หลัง preview หมด
      controlsHideAfter:function(previewOver){ return previewOver ? null : RULES.CONTROLS_HIDE_MS; },
      // ความเร็วตอนกดค้าง ตามวินาทีที่ค้าง: 2x, 4x, 8x, 16x
      holdSpeed:function(sec){ return sec < 1 ? 2 : sec < 2 ? 4 : sec < 3 ? 8 : 16; },
      // VOD: ตำแหน่งใหม่ (วินาที)
      seekVod:function(pos, delta, len){ return clamp(pos + delta, 0, len); },
      // Time Shift: behindMs = ตามหลัง live กี่ ms, windowMs = ย้อนได้ไกลสุด; เดินหน้าเกิน live ไม่ได้
      seekLive:function(behindMs, deltaSec, windowMs){ return clamp(behindMs - deltaSec * 1000, 0, windowMs); },
      showGoLive:function(behindMs, live){ return !!live.timeShift && !live.preview && behindMs > 1000; },
      // ย้อนกลับ: โฆษณา = ไม่รับ, หน้าซ้อน = ปิดก่อน, นอกนั้นออกจากหน้า
      back:function(c){ return c.adPlaying ? 'ignore' : c.modalOpen ? 'closeModal' : c.panelOpen ? 'closePanel' : 'leave'; },
      canTap:function(button){ return button.enabled !== false; }
    };

    return {
      RULES:RULES, TV_TO_TOUCH:TV_TO_TOUCH, touch:touch,
      // สิทธิ์
      state:state, crown:crown, showsCrown:showsCrown, packageFor:packageFor, subscribed:subscribed,
      // หนัง / ซีรีส์
      isSeries:isSeries, seasons:seasons, nextEpisode:nextEpisode, soon:soon, until:until, buyPrice:buyPrice, rentPrice:rentPrice, price:price,
      cw:cw, setProgress:setProgress, continueList:continueList, kidsContinue:kidsContinue, own:own, rent:rent,
      // ปุ่มและลิงก์
      mainAction:mainAction, detailActions:detailActions, episodeTap:episodeTap, detailUrl:detailUrl, playUrl:playUrl, packageUrl:packageUrl, related:related,
      // แพ็กเกจและการซื้อ
      suggest:suggest, packageList:packageList, applyPurchase:applyPurchase, titleOptions:titleOptions, vat:vat, packagePeriod:packagePeriod, renewLabel:renewLabel, purchaseResult:purchaseResult,
      // Short
      shortOpen:shortOpen, shortOwned:shortOwned, shortAt:shortAt, setShortAt:setShortAt, unlockOptions:unlockOptions, shortEpisodeTap:shortEpisodeTap, episodeRanges:episodeRanges, unlockEpisode:unlockEpisode, adsLeft:adsLeft, useAd:useAd,
      // Live
      start:start, label:label, hasDetail:hasDetail, programmeHref:programmeHref, programmeActions:programmeActions, liveState:liveState, previewTick:previewTick, zap:zap, isFav:isFav, setFav:setFav,
      // Player
      vodTick:vodTick,
      // Login / ชำระเงิน
      login:login, otp:otp
    };
  }

  // ---- กรอกเลขผ่านคีย์บอร์ดเครื่อง (ไม่มีแป้นบนจอแบบรีโมต) ----
  function digitsOnly(raw, max){ return String(raw || '').replace(/\D/g, '').slice(0, max); }
  var login = {
    methods:['mobile', 'ppv'],   // MOBILE: 4
    accept:function(raw){
      var number = digitsOnly(raw, RULES.LOGIN_DIGITS);
      return { number:number, canContinue:number.length === RULES.LOGIN_DIGITS, error:number.length === RULES.LOGIN_DIGITS ? '' : 'Enter all 10 digits of your mobile or internet number' };
    },
    safeNext:function(next){ return next && /^[\w-]+\.html$/.test(next) ? next : 'home.html'; }   // ไปได้เฉพาะหน้าของ prototype
  };
  var otp = {
    accept:function(raw){ var code = digitsOnly(raw, RULES.OTP_DIGITS); return { code:code, submit:code.length === RULES.OTP_DIGITS }; }   // ครบ 4 หลักจ่ายทันที
  };

  return { create:create, catalogFromTv:catalogFromTv, memoryStore:memoryStore, RULES:RULES, TV_TO_TOUCH:TV_TO_TOUCH, login:login, otp:otp };
});
