// @ts-nocheck
import { useState, useEffect, useRef, useMemo } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDW3NXUG8eZJqE3AKC6IElpiWx4ODsToXo",
  authDomain: "furbify-dashboard.firebaseapp.com",
  projectId: "furbify-dashboard",
  storageBucket: "furbify-dashboard.firebasestorage.app",
  messagingSenderId: "349300222160",
  appId: "1:349300222160:web:e2fed64b61df2ef6fc16d5"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── TEAM MEMBERS ─────────────────────────────────────────────
const DEFAULT_TEAM = [
  { id:"eniko", name:"Enikő",   color:"#73AF1C" },
  { id:"agnes", name:"Ágnes",   color:"#08B7E4" },
  { id:"agi",   name:"Ági",     color:"#FA8C05" },
];

const STATUSES = [
  { id:"todo",       label:"Tervezés",    color:"#99aacc" },
  { id:"inprogress", label:"Folyamatban", color:"#08B7E4" },
  { id:"review",     label:"Review",      color:"#FA8C05" },
  { id:"done",       label:"Kész",        color:"#73AF1C" },
];

// task object: { id, label, assignee:"", deadline:"", status:"todo" }
function makeTask(label) {
  return { id: Date.now()+"_"+Math.random().toString(36).slice(2), label, assignee:"", deadline:"", status:"todo" };
}

const DEFAULT_CONTENT_ITEMS = ["2 blog poszt","13 hírlevél","10+ kreatív anyag","~4 TikTok/Reels videó","~4 YouTube Shorts videó","~8 Facebook/Instagram poszt"];

function makeTasks(arr) { return arr.map(makeTask); }

const DEFAULT_TASKS = {"1":{"persona":[],"campaigns":[{"id":"1774451603477_w9s6qrgsk8s","label":"Téli kiárusítás kampány lezárása","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_wsgiex6kpuj","label":"Q1 performance kampány indítása","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_dt9g4zvpxvf","label":"PPC ügynökség briefelése","assignee":"","deadline":"","status":"todo"}],"other":[{"id":"1774451603477_ctylfrg4xlw","label":"Éves KPI rendszer véglegesítése","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_83lba16sw7","label":"Ügynökség kiválasztás","assignee":"","deadline":"","status":"todo"}],"content":[{"id":"1774451603477_4xql1a5nlb4","label":"2 blog poszt","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_4k7i9tnsrr6","label":"13 hírlevél","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_lqhbcixpia","label":"10+ kreatív anyag","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_rrl4t3xvmia","label":"~4 TikTok/Reels videó","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_gyx7c5tzvod","label":"~4 YouTube Shorts videó","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_4badxh72183","label":"~8 Facebook/Instagram poszt","assignee":"","deadline":"","status":"todo"}]},"2":{"persona":[],"campaigns":[{"id":"1774451603477_p3wzpyx2nlf","label":"Valentine's Day kampány","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_tqa03sae1c","label":"Q1 performance kampány optimalizálás","assignee":"","deadline":"","status":"todo"}],"other":[{"id":"1774451603477_1cnyw3chc04","label":"Ügynökség szerződés","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_9i4vgwy1xgr","label":"Belső grafikus felvétel","assignee":"","deadline":"","status":"todo"}],"content":[{"id":"1774451603477_uxbx9eptcc","label":"2 blog poszt","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_o40aeh1lwjq","label":"13 hírlevél","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_ithoz53zw4b","label":"10+ kreatív anyag","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_xae2pl21u4","label":"~4 TikTok/Reels videó","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_olosdo9csl","label":"~4 YouTube Shorts videó","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_hdx293n1vwb","label":"~8 Facebook/Instagram poszt","assignee":"","deadline":"","status":"todo"}]},"3":{"persona":[{"id":"1774451603477_ligto4z252","label":"Kérdőív kidolgozásának megkezdése – kérdések, struktúra, jutalom","assignee":"agi","deadline":"2026-06-30","status":"inprogress"}],"campaigns":[{"id":"1774451603477_usnfsqyy5bj","label":"Q2 kampányok tervezése Ágnessel","assignee":"eniko","deadline":"","status":"todo"}],"other":[],"content":[{"id":"1774451603477_0ce42snxw30b","label":"2 blog poszt","assignee":"eniko","deadline":"2026-03-31","status":"done"},{"id":"1774451603477_13z5go9nz2d","label":"13 hírlevél","assignee":"agi","deadline":"","status":"done"},{"id":"1774451603477_hrckndo0bmj","label":"2 kreatív anyag","assignee":"agnes","deadline":"","status":"todo"},{"id":"1774451603477_yshri9t797r","label":"4 TikTok/Reels videó","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_mhtbwu2lj4","label":"4 YouTube Shorts videó","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_s3pfnyq47ql","label":"8 Facebook/Instagram poszt","assignee":"member_1774478548356","deadline":"","status":"done"}]},"4":{"persona":[{"id":"1774451603477_ahfrzmb0kqi","label":"Kérdőív technikai megoldása, kérdőív összeállítása: https://docs.google.com/document/d/1UfTtwL9tc_ws7PZYXq3go0im1cdlVD_M/edit","assignee":"member_1775559513664","deadline":"2026-04-10","status":"done"},{"id":"1774451603477_4b1mq8u9ibh","label":"Kérdőív kiküldése hírlevél listára","assignee":"agi","deadline":"2026-04-15","status":"done"},{"id":"1774451603477_wsemsr187f","label":"Emlékeztető kiküldése","assignee":"agi","deadline":"2026-04-24","status":"todo"},{"id":"1775559715831_rujbwjxot6m","label":"Mi legyen a nyeremény? Egyeztetni Krisztiánnal","assignee":"eniko","deadline":"2026-04-10","status":"done"}],"campaigns":[{"id":"1775051093647_5ijqx27f04y","label":"Kitalálni a kampány témákat a Q2-re","assignee":"member_1775051096325","deadline":"2026-04-30","status":"todo"}],"other":[{"id":"1774451603477_i57xtp5ttoe","label":"Új sablon elkészítése","assignee":"eniko","deadline":"2026-04-30","status":"inprogress"}],"content":[{"id":"1774451603477_kexehrc56ur","label":"2 blog poszt","assignee":"eniko","deadline":"2026-04-30","status":"todo"},{"id":"1774451603477_avfngr6t3yo","label":"13 hírlevél","assignee":"agi","deadline":"2026-04-30","status":"todo"},{"id":"1774451603477_6ucbboums4q","label":"2 kreatív anyag","assignee":"member_1775050984759","deadline":"2026-04-30","status":"todo"},{"id":"1774451603477_2kn2r3i21iz","label":"2 TikTok/Reels videó","assignee":"agi","deadline":"2026-04-30","status":"todo"},{"id":"1774451603477_k6yhwg97ftk","label":"2 YouTube Shorts videó","assignee":"agi","deadline":"2026-04-30","status":"todo"},{"id":"1774451603477_b5ygtagj7bw","label":"6 Facebook/Instagram statikus poszt","assignee":"member_1774478548356","deadline":"2026-04-30","status":"todo"}]},"5":{"persona":[{"id":"1774451603477_1ym22w7vlfg","label":"1. kérdőív adatok elemzése – persona 1","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_ipf6tzjywq","label":"2. kérdőív összeállítása (KKV)","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_b94e1u2gvwm","label":"2. kérdőív kiküldése – máj. 2. hét","assignee":"","deadline":"","status":"todo"}],"campaigns":[{"id":"1774451603477_77wxyvknthd","label":"Gold/Silver/Bronze kategória bemutató","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_l6072x5tyta","label":"Összehasonlítás: Új vs Felújított vs Használt","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_hr2rrm4ihvc","label":"Lead magnet forgalomterelő hirdetések","assignee":"","deadline":"","status":"todo"}],"other":[{"id":"1774451603477_2ysb4nszd1a","label":"KKV szegmens tartalom tervezés","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_0m8f0ubwhz5","label":"Influencer kapcsolatfelvétel","assignee":"","deadline":"","status":"todo"}],"content":[{"id":"1774451603477_rq1ahzje0x9","label":"2 blog poszt","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_ci0pvzaah5f","label":"13 hírlevél","assignee":"agi","deadline":"","status":"todo"},{"id":"1774451603477_hlig0jca3m6","label":"10+ kreatív anyag","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_dzvyr0atebr","label":"2 TikTok/Reels videó","assignee":"agi","deadline":"","status":"todo"},{"id":"1774451603477_l3b49ktlx9f","label":"2 YouTube Shorts videó","assignee":"agi","deadline":"","status":"todo"},{"id":"1774451603477_h8l02wbtppe","label":"6 Facebook/Instagram poszt","assignee":"member_1774478548356","deadline":"","status":"todo"}]},"6":{"persona":[{"id":"1774451603477_8cpmvruoqjb","label":"2. kérdőív adatok elemzése – persona 2","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_ne2xmp040p9","label":"Mindkét persona végleges dokumentum ✅","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_58tevb8jh9p","label":"Persona prezentáció a csapatnak","assignee":"","deadline":"","status":"todo"}],"campaigns":[{"id":"1774451603477_z4hd90l1jll","label":"Q2 zárókampány – nyári akciók","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_bl3u01hxag4","label":"YouTube Shorts SEO kampány","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_qa9xz3jzthp","label":"Szeptemberi iskolakezdés kampány tervezése","assignee":"","deadline":"","status":"todo"}],"other":[{"id":"1774451603477_860ztr40jry","label":"Q2 kiértékelés","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_9m2bvwr7it","label":"Q3 kampány brief","assignee":"","deadline":"","status":"todo"}],"content":[{"id":"1774451603477_b3y5rou50y","label":"2 blog poszt","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_ctita6h01g","label":"13 hírlevél","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_0o0janxzea5a","label":"10+ kreatív anyag","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_khb7rn8ijaq","label":"~4 TikTok/Reels videó","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_c1ywznkazac","label":"~4 YouTube Shorts videó","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_qrz6gv1qwvr","label":"~8 Facebook/Instagram poszt","assignee":"","deadline":"","status":"todo"}]},"7":{"persona":[{"id":"1774451603477_98y40g2xvx","label":"✅ Persona kész – alkalmazás Q3 kampányokban","assignee":"agi","deadline":"","status":"todo"}],"campaigns":[{"id":"1774451603477_svtzsrf0rir","label":"Nyári back to school előkészítő","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_s2w7wfevhx","label":"Setup Wars sorozat indítása","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_r96uzn4d1h","label":"Retargeting intenzifikálás","assignee":"","deadline":"","status":"todo"}],"other":[{"id":"1774451603477_tfdyz8vcq2a","label":"Q4 tervezés megkezdése","assignee":"","deadline":"","status":"todo"}],"content":[{"id":"1774451603477_m0tgsqx40ok","label":"2 blog poszt","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_bckcbgq67sr","label":"13 hírlevél","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_jisnihshhmo","label":"10+ kreatív anyag","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_nfa9d1w6dc","label":"~4 TikTok/Reels videó","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_6i3r6rjfxrt","label":"~4 YouTube Shorts videó","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_d1amy7tn2ra","label":"~8 Facebook/Instagram poszt","assignee":"","deadline":"","status":"todo"}],"extra":[{"id":"1774452304118","title":"Új szekció","items":[]}]},"8":{"persona":[],"campaigns":[{"id":"1774451603477_gew0vhe4ya8","label":"Iskolakezdés főkampány","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_h06jyw4tr65","label":"Student deal forgalomterelő","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_h00b9wtqhup","label":"ThinkPad tartósság kampány","assignee":"","deadline":"","status":"todo"}],"other":[{"id":"1774451603477_qia4xw4t4n7","label":"Black Friday landing page tervezés","assignee":"","deadline":"","status":"todo"}],"content":[{"id":"1774451603477_66m1tvp1cxo","label":"2 blog poszt","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_plwsfuzeedh","label":"13 hírlevél","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_g6pgxz3b83","label":"10+ kreatív anyag","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_njrd6i826iq","label":"~4 TikTok/Reels videó","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_s89bsen3el","label":"~4 YouTube Shorts videó","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_64d1x23bwpq","label":"~8 Facebook/Instagram poszt","assignee":"","deadline":"","status":"todo"}]},"9":{"persona":[],"campaigns":[{"id":"1774451603477_j9ksjzu28o","label":"Iskolakezdés utóhullám kampány","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_cy187qf0tdk","label":"KKV flotta kampány indítása","assignee":"","deadline":"","status":"todo"}],"other":[{"id":"1774451603477_oz100lyns","label":"Q4 kampány briefek véglegesítése","assignee":"","deadline":"","status":"todo"}],"content":[{"id":"1774451603477_beikv47iz14","label":"2 blog poszt","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_phgyq5u9ya","label":"13 hírlevél","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_o2fdj78fp1n","label":"10+ kreatív anyag","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_475p6lyg15q","label":"~4 TikTok/Reels videó","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_qmxwy0odrwf","label":"~4 YouTube Shorts videó","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_wsru77oochh","label":"~8 Facebook/Instagram poszt","assignee":"","deadline":"","status":"todo"}]},"10":{"persona":[],"campaigns":[{"id":"1774451603477_q4lbe3paced","label":"Black Friday előkampány – hype építés","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_lkk28wxnim","label":"Performance Max kampányok indítása","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_j9q3qsgpay","label":"Remarketing intenzifikálás","assignee":"","deadline":"","status":"todo"}],"other":[{"id":"1774451603477_qj3rwohw9t","label":"TOP 3 termék kiválasztása","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_dv84li34okt","label":"Influencer anyagok gyártása","assignee":"","deadline":"","status":"todo"}],"content":[{"id":"1774451603477_d03tylpyb9v","label":"2 blog poszt","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_sruwcyo8jn","label":"13 hírlevél","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_ymndyz4jyh","label":"10+ kreatív anyag","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_ww5qrpo2gfp","label":"~4 TikTok/Reels videó","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_967n0y3mtm","label":"~4 YouTube Shorts videó","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_6njtotbeqjn","label":"~8 Facebook/Instagram poszt","assignee":"","deadline":"","status":"todo"}]},"11":{"persona":[],"campaigns":[{"id":"1774451603477_ea05tugirf7","label":"Black Friday / Cyber Monday főkampány 🔥","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_yrbtngeta7","label":"Email sorozat – napi ajánlatok","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_eby3t54pzi5","label":"Urgency alapú hirdetések","assignee":"","deadline":"","status":"todo"}],"other":[{"id":"1774451603477_tzwinob82nc","label":"Napi kampány monitoring","assignee":"","deadline":"","status":"todo"}],"content":[{"id":"1774451603477_6k1ve6nssat","label":"2 blog poszt","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_bh8it52joq6","label":"13 hírlevél","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_wm7worbm03r","label":"10+ kreatív anyag","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_4cxv3z4kcdu","label":"~4 TikTok/Reels videó","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_ui8hg1rp5a","label":"~4 YouTube Shorts videó","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_7e38nbf2h6","label":"~8 Facebook/Instagram poszt","assignee":"","deadline":"","status":"todo"}]},"12":{"persona":[],"campaigns":[{"id":"1774451603477_bmafmac9kj7","label":"Karácsonyi kampány – ajándék laptop","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_0v78xt9zekkg","label":"Év végi TOP 3 termék bemutató","assignee":"","deadline":"","status":"todo"}],"other":[{"id":"1774451603477_rihotepg47e","label":"2026 éves kiértékelés","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_tr6p638wasc","label":"2027 stratégia tervezés","assignee":"","deadline":"","status":"todo"}],"content":[{"id":"1774451603477_p86nsp5197d","label":"2 blog poszt","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_f4iwgo9hbeh","label":"13 hírlevél","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_r5u8539mwe8","label":"10+ kreatív anyag","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_wr2odi02lv","label":"~4 TikTok/Reels videó","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_62t9n4k5ta","label":"~4 YouTube Shorts videó","assignee":"","deadline":"","status":"todo"},{"id":"1774451603477_ezq7kg4nnx9","label":"~8 Facebook/Instagram poszt","assignee":"","deadline":"","status":"todo"}]}};

const DEFAULT_CAL_CATEGORIES = ["Edukáció","Performance","Termék fókuszú","Szezonális","Egyéb"];

const DEFAULT_CAL_CAMPAIGNS = [{"id":"c1","name":"Téli kiárusítás","category":"Szezonális","color":"#08B7E4","startMonth":1,"startDay":2,"endMonth":1,"endDay":31},{"id":"c2","name":"Valentin-nap","category":"Szezonális","color":"#08B7E4","startMonth":2,"startDay":2,"endMonth":2,"endDay":14},{"name":"Tavaszi kampány","category":"Szezonális","color":"#08B7E4","startMonth":3,"startDay":1,"endMonth":3,"endDay":30,"id":"1776756133719"},{"name":"Húsvéti kampány","category":"Szezonális","color":"#08B7E4","startMonth":3,"startDay":27,"endMonth":4,"endDay":12,"id":"1776756175548"},{"name":"Kérdőíves kampány","category":"Egyéb","color":"#a78bfa","startMonth":4,"startDay":15,"endMonth":5,"endDay":13,"id":"1776760158133"},{"name":"Új akkumulátoros noti kampány","category":"Termék fókuszú","color":"#f59e0b","startMonth":5,"startDay":1,"endMonth":5,"endDay":30,"id":"1776756306719"},{"name":"Tanévzáró tabletes kampány","category":"Szezonális","color":"#08B7E4","startMonth":6,"startDay":1,"endMonth":6,"endDay":30,"id":"1776762169333"},{"name":"Foci VB - projektoros kampány (jún.11-júl.19)","category":"Szezonális","color":"#08B7E4","startMonth":6,"startDay":1,"endMonth":7,"endDay":19,"id":"1776757054412"},{"name":"Környezetvédelmi világnap (jún. 5)","category":"Edukáció","color":"#73AF1C","startMonth":6,"startDay":1,"endMonth":6,"endDay":30,"id":"1776760791351"},{"name":"Sulikezdő kampány","category":"Szezonális","color":"#08B7E4","startMonth":8,"startDay":15,"endMonth":9,"endDay":15,"id":"1776759763146"},{"name":"Halloween","category":"Performance","color":"#E45050","startMonth":10,"startDay":15,"endMonth":10,"endDay":31,"id":"1776760057526"},{"name":"Black Friday + Cyber Monday","category":"Performance","color":"#E45050","startMonth":11,"startDay":1,"endMonth":11,"endDay":30,"id":"1776759862084"},{"name":"Karácsony + Mikulás","category":"Szezonális","color":"#08B7E4","startMonth":12,"startDay":1,"endMonth":12,"endDay":17,"id":"1776759895432"}];

const DEFAULT_THEMES = [
  "Színfalak mögött: bemutatni a tesztelési folyamatot",
  "Új vs Felújított vs Használt összehasonlítás",
  "Értékelések beépítése a kommunikációba",
  "Esztétikai útmutató: Ne csak leírva legyen a webshopban, hanem rövid videók formájában is legyenek bemutatva az egyes kategóriák, több gépen, figyelemfelkeltő módon",
  "Fenntarthatósági témák, mennyi CO2-t spórol a vásárló egy felújított termék választásával",
  "Influencer együttműködés",
];

const DEFAULT_KPI = [
  { month:1,  name:"Január",     target:124704, actual:124704, prevYear:null,   phase:"Építkezés",   quarter:1 },
  { month:2,  name:"Február",    target:109288, actual:109288, prevYear:null,   phase:"Építkezés",   quarter:1 },
  { month:3,  name:"Március",    target:121706, actual:91548,  prevYear:115910, phase:"Építkezés",   quarter:1 },
  { month:4,  name:"Április",    target:106235, actual:70683,  prevYear:96577,  phase:"Építkezés",   quarter:2 },
  { month:5,  name:"Május",      target:101142, actual:null,   prevYear:91947,  phase:"Építkezés",   quarter:2 },
  { month:6,  name:"Június",     target:109703, actual:null,   prevYear:99730,  phase:"Építkezés",   quarter:2 },
  { month:7,  name:"Július",     target:128676, actual:null,   prevYear:116978, phase:"Bemelegítés", quarter:3 },
  { month:8,  name:"Augusztus",  target:138141, actual:null,   prevYear:125583, phase:"Bemelegítés", quarter:3 },
  { month:9,  name:"Szeptember", target:137490, actual:null,   prevYear:112697, phase:"Bemelegítés", quarter:3 },
  { month:10, name:"Október",    target:178823, actual:null,   prevYear:137556, phase:"Performance", quarter:4 },
  { month:11, name:"November",   target:194228, actual:null,   prevYear:149406, phase:"Performance", quarter:4 },
  { month:12, name:"December",   target:155522, actual:null,   prevYear:119632, phase:"Performance", quarter:4 },
];

const DEFAULT_PERSONA_STEPS = [
  {month:4,label:"Kérdőív kidolgozás",color:"#6b7280",detail:"Kérdések összeállítása április 10-ig, felhasználni Krisztián doksiját, kigondolni mit kapnak a kitöltésért"},
  {month:4,label:"1. kérdőív kiküldés",color:"#f59e0b",detail:"Kiküldés: ápr. 15-ig hírlevél formájában. Kitöltési határidő:: május 13."},
  {month:5,label:"Elemzés + 2. kérdőív",color:"#f97316",detail:"Adatok részletes kidolgozása május 30-ig"},
  {month:6,label:"✅ Persona kész!",color:"#34d399",detail:"Csapatprezentáció, Q3 kampányok célzása frissíthető."},
];

const DEFAULT_QUESTIONNAIRE = [
  { label:"🎁 Jutalom", val:"500–1000 Ft kupon VAGY laptopnyeremény" },
  { label:"📤 Csatornák", val:"Hírlevél + Facebook + webshop pop-up" },
  { label:"📅 Határidő", val:"1. kérdőív: ápr. 30. | 2. (KKV): máj. 31." },
  { label:"🎯 Célcsoport", val:"1.: meglévő vásárlók (B2C) | 2.: KKV/céges (B2B)" },
  { label:"💻 Platform", val:"Typeform vagy Google Forms" },
  { label:"⏱️ Hossz", val:"Max 10–12 kérdés → kb. 3–4 perc" },
  { label:"🔔 Emlékeztető", val:"Ápr. 3. hét: e-mail + retargeting" },
  { label:"📊 Elemzés", val:"Máj. 1–2. hét: feldolgozás, dokumentum, prezentáció" },
];

const DEFAULT_TRAFFIC_CHANNELS = [
  { ch:"Google Ads (PPC)", mix:"Performance – 70%", tip:"Shopping, Search, Performance Max. Fő forgalomforrás.", color:"#4285f4" },
  { ch:"TikTok / Reels", mix:"Edukáció – 30%", tip:"Heti 1 rövid videó. Fiatal szegmens + brand awareness.", color:"#ff2d55" },
  { ch:"YouTube Shorts", mix:"SEO + Edukáció", tip:"Heti 1 videó. Keresési forgalom hosszú távon.", color:"#ff0000" },
  { ch:"Email marketing", mix:"Saját lista", tip:"13 hírlevél/hó. Cél: +5 000 új feliratkozó/év.", color:"#ea4335" },
  { ch:"Facebook / Instagram", mix:"Közösség + Retargeting", tip:"Heti 2 poszt. Remarketing lista frissítés havonta.", color:"#1877f2" },
  { ch:"Blog / Organikus SEO", mix:"Hosszú táv", tip:"2 cikk/hó. Laptop összehasonlítás, fenntarthatóság.", color:"#34d399" },
];

const PHASE = {
  "Építkezés":   { accent:"#73AF1C", dim:"#1a2e0a" },
  "Bemelegítés": { accent:"#FA8C05", dim:"#2e1a00" },
  "Performance": { accent:"#E45050", dim:"#2e0a0a" },
};
const MONTH_NAMES = ["Január","Február","Március","Április","Május","Június","Július","Augusztus","Szeptember","Október","November","December"];

// ─── FIREBASE ──────────────────────────────────────────────────
const DOCS = {
  kpi:             () => doc(db,"dashboard","kpi"),
  tasks:           () => doc(db,"dashboard","tasks_v8"),
  daily:           () => doc(db,"dashboard","daily"),
  persona:         () => doc(db,"dashboard","persona"),
  quest:           () => doc(db,"dashboard","questionnaire"),
  themes:          () => doc(db,"dashboard","themes"),
  trafficChannels: () => doc(db,"dashboard","channels"),
  team:            () => doc(db,"dashboard","team"),
  calendar:        () => doc(db,"dashboard","calendar"),
  calCategories:   () => doc(db,"dashboard","calCategories"),
};
async function fbSave(ref, data) {
  try { await setDoc(ref, { data: JSON.stringify(data) }); } catch(e) { console.error(e); }
}

// ─── HELPERS ───────────────────────────────────────────────────
function daysDiff(dateStr) {
  if (!dateStr) return null;
  const diff = Math.floor((new Date(dateStr) - new Date()) / 86400000);
  return diff;
}

function DeadlineBadge({ deadline, status }) {
  if (!deadline || status === "done") return null;
  const d = daysDiff(deadline);
  if (d === null) return null;
  if (d < 0) return <span style={{fontSize:10,background:"#7f1d1d",color:"#f87171",padding:"1px 7px",borderRadius:10,marginLeft:4,fontWeight:700}}>{Math.abs(d)} napja késik</span>;
  if (d <= 3) return <span style={{fontSize:10,background:"#78350f",color:"#fbbf24",padding:"1px 7px",borderRadius:10,marginLeft:4,fontWeight:700}}>{d === 0 ? "Ma esedékes" : `${d} nap`}</span>;
  return <span style={{fontSize:10,background:"#1e2d40",color:"#99bbcc",padding:"1px 7px",borderRadius:10,marginLeft:4}}>{new Date(deadline).toLocaleDateString("hu")}</span>;
}

// ─── EDITABLE COMPONENTS ───────────────────────────────────────
function ENum({ value, onSave, placeholder="—", color="#fff", size=20 }) {
  const [e,setE]=useState(false); const [d,setD]=useState(value!=null?String(value):""); const r=useRef();
  useEffect(()=>{if(e)r.current?.select();},[e]);
  if(e) return <input ref={r} value={d} onChange={ev=>setD(ev.target.value)}
    onBlur={()=>{setE(false);const n=parseInt(d.replace(/[\s\u00a0]/g,""));if(!isNaN(n))onSave(n);else onSave(null);}}
    onKeyDown={ev=>{if(ev.key==="Enter")r.current.blur();if(ev.key==="Escape"){setE(false);setD(value!=null?String(value):"");}}}
    style={{background:"#2a3448",border:"1px solid #34d399",borderRadius:4,color:"#fff",fontSize:size,fontWeight:800,width:140,outline:"none",padding:"0 6px"}}/>;
  return <span onClick={()=>{setE(true);setD(value!=null?String(value):"");}} title="Kattints a szerkesztéshez"
    style={{cursor:"text",color:value!=null?color:"#8899bb",borderBottom:"1px dashed #3a4555",paddingBottom:1,fontSize:size,fontWeight:800}}>
    {value!=null?value.toLocaleString("hu"):placeholder}</span>;
}

function ETxt({ value, onSave, placeholder="", multiline=false, style={} }) {
  const [e,setE]=useState(false); const [d,setD]=useState(value); const r=useRef();
  useEffect(()=>{if(e)r.current?.focus();},[e]);
  const commit=()=>{setE(false);if(d.trim())onSave(d.trim());else onSave(value);};
  if(e&&multiline) return <textarea ref={r} value={d} onChange={ev=>setD(ev.target.value)} onBlur={commit}
    style={{background:"#2a3448",border:"1px solid #34d399",borderRadius:4,color:"#eef2fc",fontSize:12,padding:"4px 8px",width:"100%",outline:"none",resize:"vertical",minHeight:50,...style}}/>;
  if(e) return <input ref={r} value={d} onChange={ev=>setD(ev.target.value)} onBlur={commit}
    onKeyDown={ev=>{if(ev.key==="Enter")r.current.blur();if(ev.key==="Escape"){setE(false);setD(value);}}}
    style={{background:"#2a3448",border:"1px solid #34d399",borderRadius:4,color:"#eef2fc",fontSize:12.5,padding:"2px 8px",width:"100%",outline:"none",...style}}/>;
  return <span onClick={()=>setE(true)} title="Kattints a szerkesztéshez"
    style={{cursor:"text",borderBottom:"1px dashed #2a3347",paddingBottom:1,fontSize:12.5,color:"#d0daf0",lineHeight:1.55,...style}}>
    {value||<span style={{color:"#8899bb",fontStyle:"italic"}}>{placeholder}</span>}</span>;
}

// ─── TASK ITEM ─────────────────────────────────────────────────
function TaskItem({ task, onToggle, onEdit, onDelete, onUpdate, team, accent }) {
  const isDone = task.status === "done";
  const member = team.find(m=>m.id===task.assignee);
  const statusObj = STATUSES.find(s=>s.id===task.status)||STATUSES[0];

  return (
    <div style={{background:"#0d1520",border:"1px solid #263045",borderRadius:10,padding:"12px 14px",marginBottom:8,opacity:isDone?0.45:1}}>
      <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8}}>
        <div onClick={onToggle} style={{width:19,height:19,borderRadius:4,flexShrink:0,marginTop:2,border:`2px solid ${isDone?accent:"#4a5568"}`,background:isDone?accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s"}}>
          {isDone&&<span style={{fontSize:11,color:"#000",fontWeight:800}}>✓</span>}
        </div>
        <div style={{flex:1,textDecoration:isDone?"line-through":"none",fontSize:13.5,color:"#d8e4f8",lineHeight:1.5}}>
          <ETxt value={task.label} onSave={val=>onEdit("label",val)} style={{fontSize:13.5,color:"#d8e4f8"}}/>
          <DeadlineBadge deadline={task.deadline} status={task.status}/>
        </div>
        <button onClick={onDelete} style={{background:"none",border:"none",color:"#8899bb",cursor:"pointer",fontSize:16,padding:0,flexShrink:0}}>×</button>
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
        <select value={task.assignee||""} onChange={e=>onEdit("assignee",e.target.value)}
          style={{background:member?member.color+"22":"#1a2235",border:`1px solid ${member?member.color+"55":"#2e3a50"}`,color:member?member.color:"#8899bb",fontSize:11,padding:"3px 8px",borderRadius:6,cursor:"pointer",outline:"none"}}>
          <option value="">Felelős...</option>
          {team.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select value={task.status||"todo"} onChange={e=>onEdit("status",e.target.value)}
          style={{background:statusObj.color+"22",border:`1px solid ${statusObj.color}55`,color:statusObj.color,fontSize:11,padding:"3px 8px",borderRadius:6,cursor:"pointer",outline:"none"}}>
          {STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <input type="date" value={task.deadline||""} onChange={e=>onEdit("deadline",e.target.value)}
          style={{background:"#1a2235",border:"1px solid #2e3a50",color:"#8899bb",fontSize:11,padding:"3px 8px",borderRadius:6,outline:"none",cursor:"pointer"}}/>
      </div>
    </div>
  );
}

// ─── TASK SECTION ──────────────────────────────────────────────
function TaskSection({ title, items, accent, month, type, onToggle, onEdit, onDelete, onAdd, team }) {
  const [nw,setNw]=useState("");
  return (
    <div style={{background:"#1a2235",border:"1px solid #2e3a50",borderRadius:12,padding:"18px 20px",marginBottom:12}}>
      {title&&<div style={{fontSize:13.5,fontWeight:700,color:"#eef2fc",marginBottom:14}}>{title}</div>}
      {(items||[]).map((task,i)=>(
        <TaskItem key={task.id||i} task={task} team={team} accent={accent}
          onToggle={()=>onToggle(month,type,i)}
          onEdit={(field,val)=>onEdit(month,type,i,field,val)}
          onDelete={()=>onDelete(month,type,i)}
          onUpdate={(field,val)=>onEdit(month,type,i,field,val)}/>
      ))}
      <div style={{display:"flex",gap:6,marginTop:12}}>
        <input value={nw} onChange={e=>setNw(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&nw.trim()){onAdd(month,type,nw.trim());setNw("");}}}
          placeholder="+ Új feladat..."
          style={{flex:1,background:"#0d1520",border:"1px solid #263045",borderRadius:6,color:"#c0ccdd",fontSize:13,padding:"8px 12px",outline:"none"}}/>
        <button onClick={()=>{if(nw.trim()){onAdd(month,type,nw.trim());setNw("");}}}
          style={{background:accent+"22",border:`1px solid ${accent}44`,color:accent,fontSize:14,padding:"8px 16px",borderRadius:6,cursor:"pointer",fontWeight:800}}>+</button>
      </div>
    </div>
  );
}

// ─── GROWTH FIELD ──────────────────────────────────────────────
// Kétirányú: beírod a %-ot → kiszámolja a célt, vagy a cél alapján mutatja a %-ot
function GrowthField({ prevYear, target, accent, onChangeTarget }) {
  const currentPct = prevYear ? ((target - prevYear) / prevYear * 100) : 0;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(currentPct.toFixed(1));
  const r = useRef();
  useEffect(() => { if (editing) r.current?.select(); }, [editing]);

  if (editing) return (
    <div style={{display:"flex",alignItems:"center",gap:4}}>
      <input ref={r} value={draft} onChange={e=>setDraft(e.target.value)}
        onBlur={()=>{
          setEditing(false);
          const pct = parseFloat(draft.replace(",","."));
          if (!isNaN(pct) && prevYear) {
            const newTarget = Math.round(prevYear * (1 + pct / 100));
            onChangeTarget(newTarget);
          }
        }}
        onKeyDown={e=>{ if(e.key==="Enter") r.current.blur(); if(e.key==="Escape") setEditing(false); }}
        style={{background:"#2a3448",border:`1px solid ${accent}`,borderRadius:4,color:"#fff",fontSize:16,fontWeight:800,width:60,outline:"none",padding:"0 4px"}}
      />
      <span style={{fontSize:12,color:accent,fontWeight:800}}>%</span>
    </div>
  );

  return (
    <div onClick={()=>{ setDraft(currentPct.toFixed(1)); setEditing(true); }}
      title="Kattints a % módosításához" style={{cursor:"text"}}>
      <div style={{fontSize:16,fontWeight:800,color:accent}}>
        {currentPct >= 0 ? "+" : ""}{currentPct.toFixed(1)}%
      </div>
      <div style={{fontSize:9,color:"#8899bb",marginTop:2}}>
        = {Math.round(prevYear*(1+currentPct/100)).toLocaleString("hu")} látogató
      </div>
    </div>
  );
}

// ─── ADS DASHBOARD COLORS & HELPERS ──────────────────────────
const AC = { blue:"#185FA5", green:"#3B6D11", amber:"#854F0B", red:"#A32D2D", purple:"#533AB7", teal:"#0F6E56" };
const PLATFORM_COLOR = { google:"#185FA5", meta:"#533AB7" };
const fmtN = (n,d=0) => n==null?"–":Number(n).toLocaleString("hu-HU",{minimumFractionDigits:d,maximumFractionDigits:d});
const pctN = n => `${fmtN(n,1)}%`;
const PERIOD_DAYS = { "Tegnap":1, "7 nap":7, "14 nap":14, "30 nap":30 };

// ─── KPI CARD ─────────────────────────────────────────────────
const AdsKPICard = ({ label, value, trend, color }) => (
  <div style={{background:"#1a2235",border:"1px solid #2e3a50",borderRadius:10,padding:"12px 14px"}}>
    <div style={{fontSize:10,color:"#8899bb",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>{label}</div>
    <div style={{fontSize:22,fontWeight:700,color:color||"#fff",lineHeight:1}}>{value}</div>
    {trend!=null&&<div style={{fontSize:11,marginTop:4,color:trend>=0?AC.green:AC.red}}>{trend>=0?"▲":"▼"} {Math.abs(trend)}% vs előző</div>}
  </div>
);

// ─── TOOLTIP ──────────────────────────────────────────────────
const AdsTip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:"#0d1117",border:"1px solid #2e3a50",borderRadius:8,padding:"8px 12px",fontSize:12}}>
      <div style={{color:"#8899bb",marginBottom:4}}>{label}</div>
      {payload.map((p,i)=><div key={i} style={{color:p.color}}>{p.name}: <b>{p.value}</b></div>)}
    </div>
  );
};

// ─── RANKING TABLE ────────────────────────────────────────────
function AdsRankingTable({ campaigns, sortBy, market }) {
  const [showAll, setShowAll] = useState(false);
  const sorted = [...campaigns].sort((a,b)=>b[sortBy]-a[sortBy]);
  const max = sorted[0]?.[sortBy]||1;
  const barColor = sortBy==="roas"?AC.green:sortBy==="clicks"?AC.blue:sortBy==="spendEur"?AC.teal:AC.amber;
  const visible = showAll ? sorted : sorted.slice(0,10);
  const fmtVal=(c)=>{
    if(sortBy==="roas") return c.conversions>0?`${fmtN(c.roas,1)}x`:`${fmtN(c.ctr,2)}% CTR`;
    if(sortBy==="clicks") return fmtN(c.clicks);
    if(sortBy==="spendEur") return `€${fmtN(c.spendEur,0)}`;
    return fmtN(c.conversions,1);
  };
  return (
    <div style={{background:"#1a2235",border:"1px solid #2e3a50",borderRadius:10,overflow:"hidden"}}>
      {visible.map((c,i)=>{
        const pctBar=Math.round((c[sortBy]/max)*100);
        const half=Math.floor((c.days||[]).length/2);
        const prev=(c.days||[]).slice(0,half);
        const curr=(c.days||[]).slice(half);
        const prevVal=prev.reduce((s,d)=>s+(d[sortBy]||0),0)/(prev.length||1);
        const currVal=curr.reduce((s,d)=>s+(d[sortBy]||0),0)/(curr.length||1);
        const delta=prevVal?+((currVal-prevVal)/prevVal*100).toFixed(1):0;
        return (
          <div key={c.id||i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderBottom:i<visible.length-1?"1px solid #1a2538":"none"}}>
            <div style={{width:18,fontSize:12,color:"#8899bb",textAlign:"center",flexShrink:0,fontWeight:600}}>{i+1}</div>
            <div style={{flex:1,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"#d8e4f8"}}>{c.name}</div>
            <div style={{width:80,flexShrink:0}}>
              <div style={{height:5,background:"#0d1520",borderRadius:3,overflow:"hidden"}}>
                <div style={{width:`${pctBar}%`,height:"100%",background:barColor,borderRadius:3,transition:"width .4s"}}/>
              </div>
            </div>
            <div style={{width:50,fontSize:13,textAlign:"right",fontWeight:700,flexShrink:0,color:"#fff"}}>{fmtVal(c)}</div>
            <div style={{width:55,fontSize:11,textAlign:"right",color:delta>=0?AC.green:AC.red,flexShrink:0}}>{delta>=0?"▲":"▼"} {Math.abs(delta)}%</div>
          </div>
        );
      })}
      {sorted.length===0&&<div style={{padding:20,textAlign:"center",fontSize:12,color:"#4a5568"}}>Nincs adat</div>}
      {sorted.length>10&&(
        <div onClick={()=>setShowAll(s=>!s)}
          style={{padding:"10px",textAlign:"center",fontSize:12,color:"#8899bb",cursor:"pointer",
            borderTop:"1px solid #1a2538",background:"#131d2e"}}>
          {showAll?`▲ Kevesebb mutatása`:`▼ Még ${sorted.length-10} kampány megjelenítése`}
        </div>
      )}
    </div>
  );
}

// ─── AI INSIGHTS ──────────────────────────────────────────────
// ─── KAMPÁNY SZINTŰ GRAFIKON ───────────────────────────────────
function CampaignChart({ campaigns }) {
  const [selCamp, setSelCamp] = useState("");
  const [metric, setMetric] = useState("clicks");

  const camp = campaigns.find(c=>c.id===selCamp) || campaigns[0];

  const chartData = camp ? camp.days.map(d=>({
    date: d.date,
    clicks: d.clicks||0,
    conversions: +(d.conversions||0).toFixed(2),
    roas: d.spendEur>0&&d.convValue>0?+(d.convValue/d.spendEur).toFixed(2):0,
    spend: +(d.spendEur||0).toFixed(2),
  })) : [];

  const metricConfig = {
    clicks:      {label:"Kattintások", color:"#08B7E4", fmt:v=>v},
    conversions: {label:"Konverziók",  color:"#f59e0b", fmt:v=>v},
    roas:        {label:"ROAS",        color:"#34d399", fmt:v=>v+"x"},
    spend:       {label:"Költés (€)",  color:"#E45050", fmt:v=>"€"+v},
  };

  const cfg = metricConfig[metric];

  return (
    <div style={{background:"#1a2235",border:"1px solid #2e3a50",borderRadius:12,padding:16,marginBottom:14}}>
      <div style={{fontSize:13,fontWeight:700,color:"#eef2fc",marginBottom:12}}>📊 Kampány szintű elemzés</div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <select value={selCamp} onChange={e=>setSelCamp(e.target.value)}
          style={{flex:1,minWidth:200,background:"#0d1520",border:"1px solid #2e3a50",color:"#eef2fc",
            fontSize:12,padding:"6px 10px",borderRadius:6,outline:"none"}}>
          {campaigns.map(c=>(
            <option key={c.id} value={c.id}>{c.name.slice(0,45)}</option>
          ))}
        </select>
        <div style={{display:"flex",gap:4}}>
          {Object.entries(metricConfig).map(([k,v])=>(
            <div key={k} onClick={()=>setMetric(k)}
              style={{padding:"5px 12px",borderRadius:6,fontSize:12,cursor:"pointer",
                border:`1px solid ${metric===k?v.color:"#2e3a50"}`,
                background:metric===k?v.color+"22":"transparent",
                color:metric===k?v.color:"#8899bb"}}>
              {v.label}
            </div>
          ))}
        </div>
      </div>
      {chartData.length>0?(
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{top:5,right:10,left:0,bottom:0}}>
            <defs>
              <linearGradient id="campGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={cfg.color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={cfg.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2538"/>
            <XAxis dataKey="date" tick={{fill:"#4a5568",fontSize:10}} tickLine={false}/>
            <YAxis tick={{fill:"#4a5568",fontSize:10}} tickLine={false} axisLine={false}
              tickFormatter={cfg.fmt}/>
            <Tooltip contentStyle={{background:"#1a2235",border:"1px solid #2e3a50",borderRadius:8,fontSize:11}}
              formatter={(v)=>[cfg.fmt(v), cfg.label]}
              labelStyle={{color:"#8899bb"}}/>
            <Area type="monotone" dataKey={metric} stroke={cfg.color} strokeWidth={2}
              fill="url(#campGrad)" dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      ):(
        <div style={{textAlign:"center",padding:40,color:"#4a5568",fontSize:12}}>Nincs elegendő adat</div>
      )}
    </div>
  );
}

function AdsAIInsights({ campaigns, platform, market, period }) {
  const [insight,setInsight] = useState(null);

  const analyze = () => {
    if(!campaigns.length){ setInsight([{type:"warn",title:"Nincs adat",text:"Nincs elegendő kampányadat az elemzéshez."}]); return; }
    const insights = [];
    const sorted  = [...campaigns].sort((a,b)=>b.roas-a.roas);
    const byConv  = [...campaigns].sort((a,b)=>b.conversions-a.conversions);
    const bySpend = [...campaigns].sort((a,b)=>b.spendEur-a.spendEur);
    const totalSpend = campaigns.reduce((s,c)=>s+c.spendEur,0);
    const totalConv  = campaigns.reduce((s,c)=>s+c.conversions,0);
    const avgRoas    = campaigns.length?+(campaigns.reduce((s,c)=>s+c.roas,0)/campaigns.length).toFixed(2):0;
    const avgCtr     = campaigns.length?+(campaigns.reduce((s,c)=>s+parseFloat(c.ctr),0)/campaigns.length).toFixed(2):0;

    if(sorted[0]?.roas>0)
      insights.push({type:"up",title:sorted[0].name.slice(0,28)+" – legjobb ROAS",
        text:"ROAS: "+sorted[0].roas.toFixed(1)+"x, "+sorted[0].conversions.toFixed(0)+" konverzió. Ez a legjobb teljesítményű kampány."});

    if(byConv[0]?.conversions>0&&byConv[0].id!==sorted[0]?.id)
      insights.push({type:"up",title:"Legtöbb konverzió",
        text:byConv[0].name.slice(0,28)+": "+byConv[0].conversions.toFixed(0)+" konverzió, €"+byConv[0].spendEur.toFixed(0)+" költéssel."});

    const highSpendLowConv=bySpend.filter(c=>c.spendEur>totalSpend*0.15&&c.conversions<totalConv*0.05);
    if(highSpendLowConv[0])
      insights.push({type:"warn",title:"Magas költés, kevés konverzió",
        text:highSpendLowConv[0].name.slice(0,28)+": €"+highSpendLowConv[0].spendEur.toFixed(0)+" költés, csak "+highSpendLowConv[0].conversions.toFixed(0)+" konverzió. Optimalizálás javasolt."});

    const lowCtr=campaigns.filter(c=>parseFloat(c.ctr)<avgCtr*0.5&&c.impressions>1000);
    if(lowCtr[0])
      insights.push({type:"down",title:"Alacsony CTR: "+lowCtr[0].name.slice(0,20),
        text:lowCtr[0].ctr+"% CTR, átlag alatt ("+avgCtr+"%). Hirdetésszöveg felülvizsgálata javasolt."});

    insights.push({type:avgRoas>=3?"up":"warn",title:"Átlagos ROAS: "+avgRoas.toFixed(1)+"x",
      text:"Összes kampány átlaga "+period+" alatt. "+(avgRoas>=4?"Kiváló teljesítmény!":avgRoas>=2.5?"Megfelelő szint.":"Optimalizálás szükséges lehet.")});

    setInsight(insights.slice(0,5));
  };

  const iconStyle=(type)=>({width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
    fontSize:12,flexShrink:0,
    background:type==="up"?"#1e3a1a":type==="down"?"#3a1a1a":"#3a2a0a",
    color:type==="up"?"#34d399":type==="down"?"#f87171":"#fbbf24"});

  return (
    <div style={{background:"#1a2235",border:"1px solid #2e3a50",borderRadius:10,padding:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <span style={{fontSize:13,fontWeight:700,color:"#eef2fc"}}>✦ Kampány elemzés</span>
        <button onClick={analyze}
          style={{fontSize:12,padding:"5px 12px",borderRadius:6,border:"1px solid #2e3a50",background:"transparent",color:"#d8e4f8",cursor:"pointer"}}>
          {insight?"↻ Frissít":"Elemzés indítása"}
        </button>
      </div>
      {!insight&&<div style={{fontSize:12,color:"#8899bb",padding:"12px 0"}}>Kattints az "Elemzés indítása" gombra — automatikusan kiértékeli a kampányokat és konkrét javaslatokat ad.</div>}
      {insight&&insight.map((ins,i)=>(
        <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderTop:i>0?"1px solid #1a2538":"none",alignItems:"flex-start"}}>
          <div style={iconStyle(ins.type)}>{ins.type==="up"?"▲":ins.type==="down"?"▼":"!"}</div>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:"#eef2fc",marginBottom:2}}>{ins.title}</div>
            <div style={{fontSize:12,color:"#8899bb"}}>{ins.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}


// ─── PERFORMANCE DASHBOARD ────────────────────────────────────
const SHEET_ID = "16XXkKGGvWvqEV4KxC2SahWYqNUgS6cN48vUE8DhFxlM";

function parseCSVLine(line) {
  const result=[]; let cur=""; let inQ=false;
  for(let i=0;i<line.length;i++){
    if(line[i]==='"'){inQ=!inQ;}
    else if(line[i]===","&&!inQ){result.push(cur.trim());cur="";}
    else cur+=line[i];
  }
  result.push(cur.trim()); return result;
}
function parseCSV2(text) {
  const lines=text.trim().split("\n");
  const headers=parseCSVLine(lines[0]);
  return lines.slice(1).map(line=>{
    const vals=parseCSVLine(line); const obj={};
    headers.forEach((h,i)=>{obj[h]=vals[i]||"";});
    return obj;
  }).filter(r=>Object.values(r).some(v=>v));
}
function parseNum2(s){
  if(!s) return 0;
  // Remove quotes, spaces, then handle European decimal comma
  let clean = String(s).replace(/['"]/g,"").replace(/\s/g,"");
  // If format is like "3.059,12" (European thousand sep + decimal comma)
  if(/\d{1,3}(\.\d{3})+,\d+/.test(clean)) {
    clean = clean.replace(/\./g,"").replace(",",".");
  } else {
    // Simple comma decimal: "2,4006" → "2.4006"
    clean = clean.replace(",",".");
  }
  return parseFloat(clean)||0;
}
async function fetchSheet2(sheetName){
  // Cache-busting: minden híváshoz egyedi timestamp
  const cacheBust = Date.now();
  const url=`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&cb=${cacheBust}`;
  const res=await fetch(url);
  if(!res.ok) throw new Error("Fetch failed: "+res.status);
  const text=await res.text();
  const json=JSON.parse(text.replace(/^[^{]+/,"").replace(/[^}]+$/,""));
  const cols=json.table.cols.map(c=>c.label||c.id);
  return (json.table.rows||[]).map(row=>{
    const obj={};
    cols.forEach((h,i)=>{
      const cell=row.c[i];
      if(!cell||cell.v==null){obj[h]="";return;}
      // Google Sheets JSON returns dates as "Date(yyyy,m,d)" where month is 0-indexed
      const v=String(cell.v);
      if(v.startsWith("Date(")){
        const parts=v.replace("Date(","").replace(")","").split(",");
        const y=parts[0]; const m=String(parseInt(parts[1])+1).padStart(2,"0"); const d=String(parseInt(parts[2])).padStart(2,"0");
        obj[h]=`${y}-${m}-${d}`;
      } else {
        obj[h]=v;
      }
    });
    return obj;
  }).filter(r=>Object.values(r).some(v=>v));
}

function buildCampaigns(adsData, platform, market, eurHuf) {
  const toEur=(val,isHuf)=>isHuf?(val/eurHuf):val;

  // Google Ads: "furbify.hu" / "furbify.sk"
  // Meta: "FURBIFY HU s.r.o." / "FURBIFY SK"
  const isHuAcc=(acc)=>{ const a=acc.trim().toLowerCase(); return a==="furbify.hu"||a.includes("furbify hu")||a.includes("furbify.hu"); };
  const isSkAcc=(acc)=>{ const a=acc.trim().toLowerCase(); return a==="furbify.sk"||a.includes("furbify sk")||a.includes("furbify.sk"); };

  const filtered = adsData.filter(r=>{
    const acc=(r["Account: Account name"]||"").trim();
    if(!acc) return true;
    if(market==="hu") return isHuAcc(acc);
    if(market==="sk") return isSkAcc(acc);
    return true;
  });

  const campDayMap={};
  filtered.forEach(r=>{
    const name=(r["Campaign: Campaign name"]||"").trim();
    if(!name) return;
    const acc=(r["Account: Account name"]||"").trim();
    const date=(r["Report: Date"]||"").trim();
    const spendRaw=parseNum2(r["Cost: Amount spend"]||"0");

    let isHuf = false;
    if(platform==="google") {
      isHuf = isHuAcc(acc);
    } else if(platform==="meta") {
      if(market==="hu") isHuf = true;
      else if(market==="all") isHuf = (isHuAcc(acc) || spendRaw > 200);
      else isHuf = false;
    }

    const key=acc+"::"+name;
    if(!campDayMap[key]) campDayMap[key]={name,account:acc,isHuf,days:{},id:key,platform};
    if(!campDayMap[key].days[date]) campDayMap[key].days[date]={date,spendEur:0,clicks:0,impressions:0,reach:0,conversions:0,convValue:0};

    campDayMap[key].days[date].spendEur    += toEur(spendRaw, isHuf);
    campDayMap[key].days[date].clicks      += parseInt(r["Performance: Clicks"]||"0")||0;
    campDayMap[key].days[date].impressions += parseInt(r["Performance: Impressions"]||"0")||0;
    campDayMap[key].days[date].reach       += parseInt(r["Performance: Reach"]||"0")||0;
    campDayMap[key].days[date].conversions += parseNum2(r["Conversions: Conversions"]||r["Conversions: Purchases"]||"0");
    // convValue is also in HUF for HU account – must convert to EUR!
    campDayMap[key].days[date].convValue   += toEur(parseNum2(r["Conversions: Value"]||"0"), isHuf);
  });

  return Object.values(campDayMap).map(c=>{
    const days=Object.values(c.days)
      .sort((a,b)=>a.date.localeCompare(b.date))
      .map(d=>({...d,
        cost:d.spendEur,
        convValue:d.convValue||0,
        ctr:d.impressions>0?+((d.clicks/d.impressions)*100).toFixed(2):0,
      }));
    const totSpend=days.reduce((s,d)=>s+d.spendEur,0);
    const totClicks=days.reduce((s,d)=>s+d.clicks,0);
    const totImpr=days.reduce((s,d)=>s+d.impressions,0);
    const totConv=days.reduce((s,d)=>s+d.conversions,0);
    const totConvValue=days.reduce((s,d)=>s+(d.convValue||0),0);
    const totCtr=totImpr>0?+((totClicks/totImpr)*100).toFixed(2):0;
    // ROAS = konverzió érték / költés (valós adat ha van, egyébként CTR)
    const roas=totConvValue>0&&totSpend>0?+(totConvValue/totSpend).toFixed(2):
               totConv>0&&totSpend>0?+(totConv*50/totSpend).toFixed(2):totCtr;
    return {
      ...c, days, status:"active",
      spendEur:totSpend, clicks:totClicks, impressions:totImpr,
      conversions:totConv, convValue:totConvValue, ctr:totCtr, roas, cost:totSpend,
    };
  }).filter(c=>c.spendEur>0||c.clicks>0)
    .sort((a,b)=>b.spendEur-a.spendEur);
}

function filterByPeriod(camps, days) {
  const today = new Date();
  const cutoff = new Date(today.getTime() - days * 86400000);
  const cutoffStr = cutoff.toISOString().slice(0,10); // YYYY-MM-DD

  return camps.map(c=>{
    const filtered = c.days.filter(d=>d.date >= cutoffStr);
    const totSpend = filtered.reduce((s,d)=>s+d.spendEur,0);
    const totClicks = filtered.reduce((s,d)=>s+d.clicks,0);
    const totImpr = filtered.reduce((s,d)=>s+d.impressions,0);
    const totConv = filtered.reduce((s,d)=>s+d.conversions,0);
    const totConvValue = filtered.reduce((s,d)=>s+(d.convValue||0),0);
    const totCtr = totImpr>0?+((totClicks/totImpr)*100).toFixed(2):0;
    const roas = totConvValue>0&&totSpend>0?+(totConvValue/totSpend).toFixed(2):
                 totConv>0&&totSpend>0?+(totConv*50/totSpend).toFixed(2):totCtr;
    return {...c, days:filtered, spendEur:totSpend, clicks:totClicks,
      impressions:totImpr, conversions:totConv, convValue:totConvValue,
      ctr:totCtr, roas, cost:totSpend};
  }).filter(c=>c.days.length>0);
}

function buildChartData2(camps, days) {
  if(!camps.length) return [];
  const today = new Date();
  const cutoff = new Date(today.getTime() - days * 86400000);
  const cutoffStr = cutoff.toISOString().slice(0,10);
  const allDates=[...new Set(camps.flatMap(c=>c.days.map(d=>d.date)))].filter(d=>d>=cutoffStr).sort();
  return allDates.map(date=>{
    let clicks=0,imp=0,conv=0,spend=0,convValue=0;
    camps.forEach(c=>{
      const d=c.days.find(x=>x.date===date);
      if(d){
        clicks+=d.clicks; imp+=d.impressions; conv+=d.conversions;
        spend+=d.spendEur||0; convValue+=d.convValue||0;
      }
    });
    const roas = convValue>0&&spend>0?+(convValue/spend).toFixed(2):
                 conv>0&&spend>0?+(conv*50/spend).toFixed(2):0;
    // Display date as MM-DD for chart labels
    return {date:date.slice(5), clicks, ctr:imp>0?+((clicks/imp)*100).toFixed(2):0, conversions:conv, roas};
  });
}

function PerformanceDashboard() {
  const [adsData,setAdsData]   = useState([]);
  const [metaData,setMetaData] = useState([]);
  const [loading,setLoading]   = useState(true);
  const [error,setError]       = useState(null);
  const [platform,setPlatform] = useState("google");
  const [market,setMarket]     = useState("hu");
  const [period,setPeriod]     = useState("7 nap");
  const [customStart,setCustomStart] = useState("");
  const [customEnd,setCustomEnd]     = useState("");
  const [showDatePicker,setShowDatePicker] = useState(false);
  const [sortBy,setSortBy]     = useState("roas");
  const [eurHuf,setEurHuf]     = useState(362);
  const [lastUpdate,setLastUpdate] = useState(null);

  useEffect(()=>{ loadData(); },[]);

  async function loadData() {
    setLoading(true); setError(null);
    try {
      const [ads, meta] = await Promise.all([
        fetchSheet2("Google Ads"),
        fetchSheet2("Meta Ads").catch(()=>[]),
      ]);
      setAdsData(ads);
      setMetaData(meta);
      setLastUpdate(new Date().toLocaleTimeString("hu"));
      try {
        const fx=await fetch("https://open.er-api.com/v6/latest/EUR");
        const fxd=await fx.json();
        if(fxd.rates?.HUF) setEurHuf(Math.round(fxd.rates.HUF));
      } catch { setEurHuf(362); }
    } catch(e) { setError("Hiba az adatok betöltésekor: "+e.message); }
    finally { setLoading(false); }
  }

  const periodDays = useMemo(()=>{
    if(period==="egyéni"&&customStart&&customEnd){
      const diff = Math.ceil((new Date(customEnd)-new Date(customStart))/86400000)+1;
      return Math.max(diff,1);
    }
    return PERIOD_DAYS[period]||7;
  },[period,customStart,customEnd]);
  const accentColor = platform==="meta"?PLATFORM_COLOR.meta:platform==="ossz"?AC.teal:PLATFORM_COLOR.google;

  // Build all campaigns from Sheets data
  const allCamps = useMemo(()=>{
    const mkt = platform==="ossz"?"all":market;
    // Recompute campaign totals from days (ensures consistency)
    const recompute = camps => camps.map(c=>{
      const totSpend = c.days.reduce((s,d)=>s+d.spendEur,0);
      const totClicks = c.days.reduce((s,d)=>s+d.clicks,0);
      const totImpr = c.days.reduce((s,d)=>s+d.impressions,0);
      const totConv = c.days.reduce((s,d)=>s+d.conversions,0);
      const totConvValue = c.days.reduce((s,d)=>s+(d.convValue||0),0);
      const totCtr = totImpr>0?+((totClicks/totImpr)*100).toFixed(2):0;
      const roas = totConvValue>0&&totSpend>0?+(totConvValue/totSpend).toFixed(2):
                   totConv>0&&totSpend>0?+(totConv*50/totSpend).toFixed(2):totCtr;
      return {...c, spendEur:totSpend, clicks:totClicks, impressions:totImpr,
        conversions:totConv, convValue:totConvValue, ctr:totCtr, roas, cost:totSpend};
    });
    if(platform==="meta") return recompute(buildCampaigns(metaData, "meta", mkt, eurHuf));
    if(platform==="ossz") {
      const g = recompute(buildCampaigns(adsData, "google", "all", eurHuf));
      const m = recompute(buildCampaigns(metaData, "meta", "all", eurHuf));
      return [...g, ...m];
    }
    return recompute(buildCampaigns(adsData, "google", mkt, eurHuf));
  },[adsData,metaData,platform,market,eurHuf]);

  const activeCamps = useMemo(()=>{
    if(period==="egyéni"&&customStart&&customEnd){
      // Full YYYY-MM-DD comparison
      return allCamps.map(c=>{
        const filtered = c.days.filter(d=>d.date>=customStart&&d.date<=customEnd);
        if(!filtered.length) return null;
        const totSpend=filtered.reduce((s,d)=>s+d.spendEur,0);
        const totClicks=filtered.reduce((s,d)=>s+d.clicks,0);
        const totImpr=filtered.reduce((s,d)=>s+d.impressions,0);
        const totConv=filtered.reduce((s,d)=>s+d.conversions,0);
        const totConvValue=filtered.reduce((s,d)=>s+(d.convValue||0),0);
        const totCtr=totImpr>0?+((totClicks/totImpr)*100).toFixed(2):0;
        const roas=totConvValue>0&&totSpend>0?+(totConvValue/totSpend).toFixed(2):
                   totConv>0&&totSpend>0?+(totConv*50/totSpend).toFixed(2):totCtr;
        return {...c,days:filtered,spendEur:totSpend,clicks:totClicks,
          impressions:totImpr,conversions:totConv,convValue:totConvValue,
          ctr:totCtr,roas,cost:totSpend};
      }).filter(Boolean);
    }
    return filterByPeriod(allCamps,periodDays);
  },[allCamps,periodDays,period,customStart,customEnd]);

  const summary = useMemo(()=>{
    const googleCamps = activeCamps.filter(c=>c.platform==="google");
    const metaCamps   = activeCamps.filter(c=>c.platform==="meta");
    const othCamps    = activeCamps.filter(c=>c.platform!=="google"&&c.platform!=="meta");

    // Google → Impressions, Meta → Reach, egyéb → Impressions
    const displayReach =
      googleCamps.reduce((s,c)=>s+c.impressions,0) +
      metaCamps.reduce((s,c)=>s+(c.days?.reduce((r,d)=>r+(d.reach||0),0)||0),0) +
      othCamps.reduce((s,c)=>s+c.impressions,0);

    const imp = activeCamps.reduce((s,c)=>s+c.impressions,0);
    const cl  = activeCamps.reduce((s,c)=>s+c.clicks,0);
    const sp  = activeCamps.reduce((s,c)=>s+c.spendEur,0);
    const cv  = activeCamps.reduce((s,c)=>s+c.conversions,0);
    const cvVal = activeCamps.reduce((s,c)=>s+(c.convValue||0),0);
    const roas = cvVal>0&&sp>0?+(cvVal/sp).toFixed(2):cv>0&&sp>0?+(cv*50/sp).toFixed(2):0;
    return {impressions:imp, reach:displayReach, clicks:cl, spendEur:sp,
      conversions:cv, convValue:cvVal, ctr:imp?+((cl/imp)*100).toFixed(2):0, roas};
  },[activeCamps]);

  const chartData = useMemo(()=>buildChartData2(allCamps,periodDays),[allCamps,periodDays]);

  const Tab=({id,label})=>(
    <div onClick={()=>setPlatform(id)} style={{padding:"10px 18px",fontSize:13,cursor:"pointer",
      borderBottom:`2px solid ${platform===id?accentColor:"transparent"}`,
      color:platform===id?"#eef2fc":"#8899bb",fontWeight:platform===id?700:400,whiteSpace:"nowrap"}}>
      {label}
    </div>
  );
  const SubTab=({id,label})=>(
    <div onClick={()=>setMarket(id)} style={{padding:"4px 14px",borderRadius:20,
      border:`1px solid ${market===id?"#d8e4f8":"#2e3a50"}`,fontSize:12,cursor:"pointer",
      background:market===id?"#263045":"transparent",color:market===id?"#d8e4f8":"#8899bb",fontWeight:market===id?600:400}}>
      {label}
    </div>
  );
  const PBtn=({label})=>(
    <div onClick={()=>setPeriod(label)} style={{padding:"5px 11px",borderRadius:6,
      border:`1px solid ${period===label?"#08B7E4":"#2e3a50"}`,
      background:period===label?"#08B7E422":"transparent",
      color:period===label?"#08B7E4":"#8899bb",fontSize:12,cursor:"pointer",whiteSpace:"nowrap"}}>
      {label}
    </div>
  );
  const SortBtn=({id,label})=>(
    <div onClick={()=>setSortBy(id)} style={{padding:"4px 12px",borderRadius:20,
      border:`1px solid ${sortBy===id?"#2e3a50":"#1a2538"}`,fontSize:12,cursor:"pointer",
      background:sortBy===id?"#263045":"transparent",color:sortBy===id?"#d8e4f8":"#8899bb",fontWeight:sortBy===id?600:400}}>
      {label}
    </div>
  );

  if(loading) return <div style={{textAlign:"center",padding:40,color:"#8899bb",fontSize:13}}>⟳ Adatok betöltése...</div>;
  if(error) return <div style={{textAlign:"center",padding:40}}><div style={{color:"#f87171",fontSize:13,marginBottom:12}}>{error}</div><button onClick={loadData} style={{background:"#73AF1C22",border:"1px solid #73AF1C55",color:"#73AF1C",fontSize:12,padding:"8px 18px",borderRadius:8,cursor:"pointer"}}>Újrapróbálás</button></div>;

  // Ads Dashboard render
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",flexWrap:"wrap",gap:10,marginBottom:4}}>
        <div style={{fontWeight:700,fontSize:15,display:"flex",alignItems:"center",gap:8,color:"#eef2fc"}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:accentColor,display:"inline-block"}}></span>
          Furbify Ads Dashboard
          <span style={{fontSize:11,color:"#8899bb",fontWeight:400}}>— {activeCamps.length} kampány · 1 EUR = {eurHuf} HUF</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          {lastUpdate&&<span style={{fontSize:11,color:"#4a5568"}}>Frissítve: {lastUpdate}</span>}
          <button onClick={loadData} style={{background:"#1a2235",border:"1px solid #2e3a50",color:"#8899bb",fontSize:11,padding:"4px 10px",borderRadius:6,cursor:"pointer"}}>🔄</button>
          <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
            {["Tegnap","7 nap","14 nap","30 nap"].map(l=><PBtn key={l} label={l}/>)}
            {/* Egyéni dátumválasztó */}
            <div style={{position:"relative"}}>
              <div onClick={()=>setShowDatePicker(s=>!s)}
                style={{padding:"5px 11px",borderRadius:6,cursor:"pointer",whiteSpace:"nowrap",
                  border:`1px solid ${period==="egyéni"?"#08B7E4":"#2e3a50"}`,
                  background:period==="egyéni"?"#08B7E422":"transparent",
                  color:period==="egyéni"?"#08B7E4":"#8899bb",fontSize:12}}>
                {period==="egyéni"&&customStart&&customEnd
                  ? `${customStart} – ${customEnd}`
                  : "📅 Egyéni"}
              </div>
              {showDatePicker&&(
                <div style={{position:"absolute",top:"110%",right:0,background:"#1a2235",border:"1px solid #2e3a50",borderRadius:10,padding:14,zIndex:100,minWidth:260,boxShadow:"0 8px 24px rgba(0,0,0,0.4)"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#eef2fc",marginBottom:10}}>Egyéni időszak</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <div>
                      <div style={{fontSize:10,color:"#8899bb",marginBottom:3}}>Kezdő dátum</div>
                      <input type="date" value={customStart} onChange={e=>setCustomStart(e.target.value)}
                        style={{width:"100%",background:"#0d1520",border:"1px solid #2e3a50",borderRadius:6,color:"#eef2fc",fontSize:12,padding:"6px 10px",outline:"none",boxSizing:"border-box"}}/>
                    </div>
                    <div>
                      <div style={{fontSize:10,color:"#8899bb",marginBottom:3}}>Záró dátum</div>
                      <input type="date" value={customEnd} onChange={e=>setCustomEnd(e.target.value)}
                        style={{width:"100%",background:"#0d1520",border:"1px solid #2e3a50",borderRadius:6,color:"#eef2fc",fontSize:12,padding:"6px 10px",outline:"none",boxSizing:"border-box"}}/>
                    </div>
                    <button onClick={()=>{
                      if(customStart&&customEnd){setPeriod("egyéni");setShowDatePicker(false);}
                    }} style={{background:"#08B7E422",border:"1px solid #08B7E455",color:"#08B7E4",fontSize:12,padding:"7px",borderRadius:6,cursor:"pointer",fontWeight:700,marginTop:4}}>
                      Alkalmaz
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PLATFORM TABS */}
      <div style={{display:"flex",gap:0,borderBottom:"1px solid #2e3a50",marginBottom:0,overflowX:"auto"}}>
        <Tab id="google" label="🔵 Google Ads"/>
        <Tab id="meta"   label="🟣 Meta"/>
        <Tab id="ossz"   label="∑ Összesített"/>
      </div>

      {/* MARKET SUBTABS */}
      {platform!=="ossz"&&(
        <div style={{display:"flex",gap:8,padding:"10px 0",borderBottom:"1px solid #1a2538",marginBottom:14}}>
          <SubTab id="sk" label="🇸🇰 furbify.sk"/>
          <SubTab id="hu" label="🇭🇺 furbify.hu"/>
        </div>
      )}
      {platform==="ossz"&&<div style={{marginBottom:14}}/>}

      {/* KPI CARDS */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
        <AdsKPICard
          label="Impressions"
          value={fmtN(summary.impressions)}
          color={accentColor}/>
        <AdsKPICard label="Kattintások"  value={fmtN(summary.clicks)}           color={AC.green}/>
        <AdsKPICard label="CTR"          value={pctN(summary.ctr)}              color={AC.purple}/>
        <AdsKPICard label="Konverziók"   value={fmtN(summary.conversions)}      color={AC.amber}/>
        <AdsKPICard label="Költés (€)"   value={`€${fmtN(summary.spendEur,0)}`} color={AC.teal}/>
      </div>

      {/* TREND CHARTS */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        <div style={{background:"#1a2235",border:"1px solid #2e3a50",borderRadius:12,padding:14}}>
          <div style={{fontSize:13,fontWeight:700,color:"#eef2fc",marginBottom:12}}>Kattintás & CTR trend</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2538"/>
              <XAxis dataKey="date" tick={{fontSize:10,fill:"#4a5568"}}/>
              <YAxis yAxisId="l" tick={{fontSize:10,fill:"#4a5568"}}/>
              <YAxis yAxisId="r" orientation="right" tick={{fontSize:10,fill:"#4a5568"}}/>
              <Tooltip content={<AdsTip/>}/>
              <Legend wrapperStyle={{fontSize:11}}/>
              <Line yAxisId="l" type="monotone" dataKey="clicks" name="Kattintás" stroke={accentColor} strokeWidth={2} dot={{r:2}}/>
              <Line yAxisId="r" type="monotone" dataKey="ctr" name="CTR %" stroke={AC.purple} strokeWidth={1.5} dot={{r:2}} strokeDasharray="4 2"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:"#1a2235",border:"1px solid #2e3a50",borderRadius:12,padding:14}}>
          <div style={{fontSize:13,fontWeight:700,color:"#eef2fc",marginBottom:12}}>Konverziók & ROAS trend</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2538"/>
              <XAxis dataKey="date" tick={{fontSize:10,fill:"#4a5568"}}/>
              <YAxis yAxisId="l" tick={{fontSize:10,fill:"#4a5568"}}/>
              <YAxis yAxisId="r" orientation="right" tick={{fontSize:10,fill:"#4a5568"}}/>
              <Tooltip content={<AdsTip/>}/>
              <Legend wrapperStyle={{fontSize:11}}/>
              <Line yAxisId="l" type="monotone" dataKey="conversions" name="Konverzió" stroke={AC.green} strokeWidth={2} dot={{r:2}}/>
              <Line yAxisId="r" type="monotone" dataKey="roas" name="ROAS" stroke={AC.amber} strokeWidth={1.5} dot={{r:2}} strokeDasharray="4 2"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RANKING + AI */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:13,fontWeight:700,color:"#8899bb"}}>Kampány ranglista</span>
            <div style={{display:"flex",gap:6}}>
              <SortBtn id="roas"        label="ROAS"/>
              <SortBtn id="clicks"      label="Kattintás"/>
              <SortBtn id="conversions" label="Konverzió"/>
              <SortBtn id="spendEur"    label="Költés"/>
            </div>
          </div>
          <AdsRankingTable campaigns={activeCamps} sortBy={sortBy} market={market}/>
        </div>
        <CampaignChart campaigns={activeCamps}/>
        <AdsAIInsights campaigns={activeCamps} platform={platform} market={market} period={period}/>
      </div>
    </div>
  );
}

const MONTH_DAYS = [31,28,31,30,31,30,31,31,30,31,30,31];
const CAL_COLORS = ["#73AF1C","#08B7E4","#FA8C05","#E45050","#a78bfa","#f97316","#34d399","#f59e0b","#ec4899","#60a5fa"];

const CAT_COLORS = {
  "Edukáció":       "#73AF1C",
  "Performance":    "#E45050",
  "Termék fókuszú": "#FA8C05",
  "Szezonális":     "#08B7E4",
  "Egyéb":          "#a78bfa",
};

function getCatColor(cat) {
  return CAT_COLORS[cat] || "#8899bb";
}

function CampaignCalendar({ campaigns, categories, onSaveCampaigns, onSaveCategories, today }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name:"", category:"Performance", color:CAT_COLORS["Performance"], startMonth:1, startDay:1, endMonth:1, endDay:15 });
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const openNew = () => {
    const defCat = categories[0]||"Egyéb";
    setForm({ name:"", category:defCat, color:getCatColor(defCat), startMonth:today.getMonth()+1, startDay:1, endMonth:today.getMonth()+1, endDay:15 });
    setEditId(null); setShowForm(true);
  };
  const openEdit = (c) => {
    setForm({...c}); setEditId(c.id); setShowForm(true);
  };
  const saveCampaign = () => {
    if(!form.name.trim()) return;
    if(editId) {
      onSaveCampaigns(campaigns.map(c=>c.id===editId?{...form,id:editId}:c));
    } else {
      onSaveCampaigns([...campaigns,{...form,id:Date.now()+""}]);
    }
    setShowForm(false);
  };

  const handleDragStart = (i) => setDragIdx(i);
  const handleDragOver = (e, i) => { e.preventDefault(); setDragOverIdx(i); };
  const handleDrop = (i) => {
    if(dragIdx===null||dragIdx===i) { setDragIdx(null); setDragOverIdx(null); return; }
    const arr = [...campaigns];
    const [moved] = arr.splice(dragIdx, 1);
    arr.splice(i, 0, moved);
    onSaveCampaigns(arr);
    setDragIdx(null); setDragOverIdx(null);
  };
  const handleDragEnd = () => { setDragIdx(null); setDragOverIdx(null); };

  const MO_NAMES_SHORT = ["Jan","Feb","Már","Ápr","Máj","Jún","Júl","Aug","Sze","Okt","Nov","Dec"];
  const MO_COLORS = ["#73AF1C","#73AF1C","#73AF1C","#73AF1C","#73AF1C","#73AF1C","#FA8C05","#FA8C05","#FA8C05","#E45050","#E45050","#E45050"];
  const currentMo = today.getMonth(); // 0-indexed

  // Convert campaign to % position across 12 months
  const toX = (month, day) => {
    const daysInMonth = MONTH_DAYS[month-1];
    return ((month-1) + (day-1)/daysInMonth) / 12 * 100;
  };

  return (
    <div>
      {/* Fejléc */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:"#eef2fc"}}>📅 Éves kampánynaptár – 2026</div>
          <div style={{fontSize:11,color:"#8899bb",marginTop:2}}>Kattints egy kampányra a szerkesztéshez · sárga vonal = ma</div>
        </div>
        <button onClick={openNew} style={{background:"#73AF1C22",border:"1px dashed #73AF1C55",color:"#73AF1C",fontSize:12,padding:"8px 18px",borderRadius:8,cursor:"pointer",fontWeight:700}}>+ Új kampány</button>
      </div>

      {/* Kategóriák – színes badge-ekkel */}
      <div style={{background:"#1a2235",border:"1px solid #2e3a50",borderRadius:12,padding:"12px 18px",marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:12,fontWeight:700,color:"#eef2fc"}}>Kategóriák</div>
          <button onClick={()=>onSaveCategories([...categories,"Új kategória"])} style={{background:"#08B7E422",border:"1px dashed #08B7E455",color:"#08B7E4",fontSize:11,padding:"3px 10px",borderRadius:6,cursor:"pointer",fontWeight:700}}>+ Új</button>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {categories.map((cat,i)=>{
            const col = getCatColor(cat);
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:6,background:col+"22",border:`1px solid ${col}55`,borderRadius:20,padding:"5px 14px"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:col,flexShrink:0}}/>
                <ETxt value={cat} onSave={val=>onSaveCategories(categories.map((c,idx)=>idx===i?val:c))} style={{fontSize:12,color:col,fontWeight:600}}/>
                <button onClick={()=>onSaveCategories(categories.filter((_,idx)=>idx!==i))} style={{background:"none",border:"none",color:col+"99",cursor:"pointer",fontSize:12,padding:0,marginLeft:2}}>×</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gantt – horizontális nézet */}
      <div style={{background:"#1a2235",border:"1px solid #2e3a50",borderRadius:12,overflow:"hidden"}}>

        {/* Hónap fejléc */}
        <div style={{display:"flex",borderBottom:"1px solid #2e3a50"}}>
          <div style={{width:170,flexShrink:0,padding:"10px 14px",fontSize:11,fontWeight:700,color:"#8899bb",borderRight:"1px solid #2e3a50"}}>Kampány</div>
          <div style={{flex:1,display:"grid",gridTemplateColumns:"repeat(12,1fr)"}}>
            {MO_NAMES_SHORT.map((mn,i)=>(
              <div key={i} style={{padding:"10px 4px",fontSize:10,color:i===currentMo?"#fbbf24":MO_COLORS[i],fontWeight:700,textAlign:"center",borderRight:i<11?"1px solid #1a2538":"none",background:i===currentMo?"#fbbf2408":"transparent"}}>
                {mn}
              </div>
            ))}
          </div>
        </div>

        {/* Kampány sorok */}
        {campaigns.length===0&&(
          <div style={{padding:"24px",textAlign:"center",fontSize:12,color:"#4a5568"}}>
            Még nincs kampány. Kattints a "+ Új kampány" gombra!
          </div>
        )}
        {campaigns.map((c,ci)=>{
          const leftPct = toX(c.startMonth, c.startDay);
          const rightPct = toX(c.endMonth, c.endDay);
          const widthPct = Math.max(rightPct - leftPct, 0.5);
          const todayPct = toX(today.getMonth()+1, today.getDate());
          const startLabel = `${MONTH_NAMES[c.startMonth-1].slice(0,3)}. ${c.startDay}.`;
          const endLabel   = `${MONTH_NAMES[c.endMonth-1].slice(0,3)}. ${c.endDay}.`;
          const isDragging = dragIdx===ci;
          const isDragOver = dragOverIdx===ci;
          return (
            <div key={c.id}
              draggable
              onDragStart={()=>handleDragStart(ci)}
              onDragOver={e=>handleDragOver(e,ci)}
              onDrop={()=>handleDrop(ci)}
              onDragEnd={handleDragEnd}
              style={{display:"flex",alignItems:"center",borderBottom:ci<campaigns.length-1?"1px solid #1a2538":"none",opacity:isDragging?0.4:1,background:isDragOver?"#263045":"transparent",transition:"background 0.1s"}}>
              {/* Bal oszlop: drag handle + név + kategória */}
              <div style={{width:170,flexShrink:0,padding:"10px 14px",borderRight:"1px solid #2e3a50",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:14,color:"#2e3a50",cursor:"grab",flexShrink:0}} title="Húzd a rendezéshez">⠿</span>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:"#d8e4f8",marginBottom:2,cursor:"pointer"}} onClick={()=>openEdit(c)}>{c.name}</div>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:getCatColor(c.category),flexShrink:0}}/>
                    <span style={{fontSize:10,color:getCatColor(c.category),fontWeight:600}}>{c.category}</span>
                  </div>
                </div>
              </div>
              {/* Gantt sáv */}
              <div style={{flex:1,position:"relative",height:44}}>
                {/* Hónap grid vonalak */}
                {Array.from({length:11},(_,i)=>(
                  <div key={i} style={{position:"absolute",top:0,bottom:0,left:`${(i+1)/12*100}%`,borderLeft:"1px solid #1a2538"}}/>
                ))}
                {/* Mai nap vonal */}
                <div style={{position:"absolute",top:0,bottom:0,left:`${todayPct}%`,borderLeft:"2px solid #fbbf2466",zIndex:2}}/>
                {/* Kampány sáv */}
                <div onClick={()=>openEdit(c)}
                  title={`${startLabel} – ${endLabel}`}
                  style={{position:"absolute",top:8,bottom:8,left:`${leftPct}%`,width:`${widthPct}%`,
                    background:c.color,borderRadius:5,cursor:"pointer",opacity:0.9,
                    display:"flex",alignItems:"center",paddingLeft:6,overflow:"hidden",zIndex:3}}>
                  {widthPct>12&&<span style={{fontSize:10,fontWeight:700,color:"#000",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {`${startLabel} – ${endLabel}`}
                  </span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Szerkesztő form */}
      {showForm&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}
          onClick={e=>{if(e.target===e.currentTarget)setShowForm(false);}}>
          <div style={{background:"#1a2235",border:"1px solid #2e3a50",borderRadius:14,padding:24,width:420,maxWidth:"90vw"}}>
            <div style={{fontSize:14,fontWeight:700,color:"#eef2fc",marginBottom:16}}>{editId?"Kampány szerkesztése":"Új kampány"}</div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:"#8899bb",marginBottom:4}}>Kampány neve</div>
              <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}
                placeholder="pl. Black Friday kampány"
                style={{width:"100%",background:"#0d1520",border:"1px solid #2e3a50",borderRadius:6,color:"#eef2fc",fontSize:13,padding:"8px 12px",outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div>
                <div style={{fontSize:11,color:"#8899bb",marginBottom:4}}>Kategória</div>
                <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value,color:getCatColor(e.target.value)}))}
                  style={{width:"100%",background:"#0d1520",border:"1px solid #2e3a50",borderRadius:6,color:"#eef2fc",fontSize:13,padding:"8px 8px",outline:"none"}}>
                  {categories.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:11,color:"#8899bb",marginBottom:4}}>Szín</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {CAL_COLORS.map(col=>(
                    <div key={col} onClick={()=>setForm(p=>({...p,color:col}))}
                      style={{width:24,height:24,borderRadius:"50%",background:col,cursor:"pointer",border:form.color===col?"3px solid #fff":"3px solid transparent"}}/>
                  ))}
                </div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:16}}>
              <div>
                <div style={{fontSize:11,color:"#8899bb",marginBottom:4}}>Kezdő hó</div>
                <select value={form.startMonth} onChange={e=>setForm(p=>({...p,startMonth:parseInt(e.target.value)}))}
                  style={{width:"100%",background:"#0d1520",border:"1px solid #2e3a50",borderRadius:6,color:"#eef2fc",fontSize:12,padding:"6px 4px",outline:"none"}}>
                  {MONTH_NAMES.map((n,i)=><option key={i+1} value={i+1}>{n.slice(0,3)}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:11,color:"#8899bb",marginBottom:4}}>Kezdő nap</div>
                <input type="number" min={1} max={31} value={form.startDay} onChange={e=>setForm(p=>({...p,startDay:parseInt(e.target.value)||1}))}
                  style={{width:"100%",background:"#0d1520",border:"1px solid #2e3a50",borderRadius:6,color:"#eef2fc",fontSize:12,padding:"6px 8px",outline:"none"}}/>
              </div>
              <div>
                <div style={{fontSize:11,color:"#8899bb",marginBottom:4}}>Záró hó</div>
                <select value={form.endMonth} onChange={e=>setForm(p=>({...p,endMonth:parseInt(e.target.value)}))}
                  style={{width:"100%",background:"#0d1520",border:"1px solid #2e3a50",borderRadius:6,color:"#eef2fc",fontSize:12,padding:"6px 4px",outline:"none"}}>
                  {MONTH_NAMES.map((n,i)=><option key={i+1} value={i+1}>{n.slice(0,3)}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:11,color:"#8899bb",marginBottom:4}}>Záró nap</div>
                <input type="number" min={1} max={31} value={form.endDay} onChange={e=>setForm(p=>({...p,endDay:parseInt(e.target.value)||1}))}
                  style={{width:"100%",background:"#0d1520",border:"1px solid #2e3a50",borderRadius:6,color:"#eef2fc",fontSize:12,padding:"6px 8px",outline:"none"}}/>
              </div>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              {editId&&<button onClick={()=>{onSaveCampaigns(campaigns.filter(c=>c.id!==editId));setShowForm(false);}}
                style={{background:"#7f1d1d",border:"none",color:"#fca5a5",fontSize:12,padding:"8px 16px",borderRadius:8,cursor:"pointer",fontWeight:700}}>Törlés</button>}
              <button onClick={()=>setShowForm(false)}
                style={{background:"#0d1520",border:"1px solid #2e3a50",color:"#8899bb",fontSize:12,padding:"8px 16px",borderRadius:8,cursor:"pointer"}}>Mégse</button>
              <button onClick={saveCampaign}
                style={{background:"#73AF1C",border:"none",color:"#000",fontSize:12,padding:"8px 20px",borderRadius:8,cursor:"pointer",fontWeight:700}}>Mentés</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SPARKLINE ─────────────────────────────────────────────────
function Sparkline({ vals, color, height=36 }) {
  if(!vals||vals.length<2) return null;
  const max=Math.max(...vals),min=Math.min(...vals),range=max-min||1,w=100;
  const pts=vals.map((v,i)=>`${(i/(vals.length-1))*w},${height-((v-min)/range)*height}`).join(" ");
  return <svg width={w} height={height} style={{display:"block",overflow:"visible"}}>
    <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    <circle cx={w} cy={height-((vals[vals.length-1]-min)/range)*height} r="3" fill={color}/>
  </svg>;
}

// ─── TEAM OVERVIEW ─────────────────────────────────────────────
function TeamOverview({ tasks, team, selMonth }) {
  const [open, setOpen] = useState(false);
  const monthTasks = tasks[selMonth] || {};
  const allTasks = Object.values(monthTasks).flat().filter(t=>t&&typeof t==="object");
  const totalOverdue = allTasks.filter(t=>t.deadline&&daysDiff(t.deadline)<0&&t.status!=="done").length;
  const totalInprog  = allTasks.filter(t=>t.status==="inprogress").length;
  const totalDone    = allTasks.filter(t=>t.status==="done").length;

  return (
    <div style={{background:"#1a2235",border:"1px solid #2e3a50",borderRadius:12,marginBottom:12,overflow:"hidden"}}>
      {/* Header – mindig látható, kattintható */}
      <div onClick={()=>setOpen(s=>!s)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",cursor:"pointer",userSelect:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:13,fontWeight:700,color:"#eef2fc"}}>👥 Csapat – havi áttekintő</span>
          {/* Mini összesítő zárt állapotban */}
          {!open&&(
            <div style={{display:"flex",gap:6}}>
              {totalInprog>0&&<span style={{fontSize:11,background:"#08B7E422",color:"#08B7E4",padding:"2px 10px",borderRadius:10}}>{totalInprog} folyamatban</span>}
              {totalOverdue>0&&<span style={{fontSize:11,background:"#7f1d1d",color:"#f87171",padding:"2px 10px",borderRadius:10}}>⚠ {totalOverdue} késik</span>}
              {totalDone>0&&<span style={{fontSize:11,background:"#73AF1C22",color:"#73AF1C",padding:"2px 10px",borderRadius:10}}>✓ {totalDone} kész</span>}
              {allTasks.length===0&&<span style={{fontSize:11,color:"#8899bb"}}>Nincs feladat ebben a hónapban</span>}
            </div>
          )}
        </div>
        <span style={{fontSize:14,color:"#8899bb",transition:"transform 0.2s",display:"inline-block",transform:open?"rotate(180deg)":"rotate(0deg)"}}>▼</span>
      </div>

      {/* Lenyíló tartalom */}
      {open&&(
        <div style={{padding:"0 18px 16px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {team.map(member=>{
              const myTasks = allTasks.filter(t=>t.assignee===member.id);
              const done    = myTasks.filter(t=>t.status==="done").length;
              const overdue = myTasks.filter(t=>t.deadline&&daysDiff(t.deadline)<0&&t.status!=="done").length;
              const inprog  = myTasks.filter(t=>t.status==="inprogress").length;
              const review  = myTasks.filter(t=>t.status==="review").length;
              const todo    = myTasks.filter(t=>t.status==="todo").length;
              return (
                <div key={member.id} style={{background:"#0d1520",border:`1px solid ${member.color}33`,borderRadius:10,padding:"14px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:member.color+"33",border:`2px solid ${member.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:member.color}}>
                      {member.name[0]}
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:"#f0f4ff"}}>{member.name}</div>
                      <div style={{fontSize:11,color:"#99aacc"}}>{myTasks.length} feladat összesen</div>
                    </div>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {todo>0   &&<span style={{fontSize:11,background:"#2a344822",color:"#8899bb",padding:"3px 10px",borderRadius:10,border:"1px solid #2e3a50"}}>📋 {todo} tervezés</span>}
                    {inprog>0 &&<span style={{fontSize:11,background:"#08B7E422",color:"#08B7E4",padding:"3px 10px",borderRadius:10}}>🔵 {inprog} folyamatban</span>}
                    {review>0 &&<span style={{fontSize:11,background:"#FA8C0522",color:"#FA8C05",padding:"3px 10px",borderRadius:10}}>🟡 {review} review</span>}
                    {done>0   &&<span style={{fontSize:11,background:"#73AF1C22",color:"#73AF1C",padding:"3px 10px",borderRadius:10}}>✓ {done} kész</span>}
                    {overdue>0&&<span style={{fontSize:11,background:"#7f1d1d",color:"#fca5a5",padding:"3px 10px",borderRadius:10,fontWeight:700}}>⚠ {overdue} késik</span>}
                    {myTasks.length===0&&<span style={{fontSize:11,color:"#8899bb"}}>Nincs feladat</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN ──────────────────────────────────────────────────────
export default function Dashboard() {
  const today = new Date();
  const [kpi,setKpi]                    = useState(DEFAULT_KPI);
  const [tasks,setTasks]                = useState(DEFAULT_TASKS);
  const [daily,setDaily]                = useState({});
  const [personaSteps,setPersonaSteps]  = useState(DEFAULT_PERSONA_STEPS);
  const [questionnaire,setQuestionnaire]= useState(DEFAULT_QUESTIONNAIRE);
  const [trafficChannels,setTrafficChannels] = useState(DEFAULT_TRAFFIC_CHANNELS);
  const [themes,setThemes]              = useState(DEFAULT_THEMES);
  const [team,setTeam]                  = useState(DEFAULT_TEAM);
  const [calCampaigns,setCalCampaigns]  = useState(DEFAULT_CAL_CAMPAIGNS);
  const [calCategories,setCalCategories]= useState(DEFAULT_CAL_CATEGORIES);
  const [selMonth,setSelMonth]          = useState(today.getMonth()+1);
  const [activeTab,setActiveTab]        = useState("tasks");
  const [showDataPanel,setShowDataPanel]= useState(false);
  const [showTeamPanel,setShowTeamPanel]= useState(false);
  const [synced,setSynced]              = useState(false);
  const [syncStatus,setSyncStatus]      = useState("⟳ Csatlakozás...");

  // Firebase listeners
  useEffect(()=>{
    const unsubs = [
      onSnapshot(DOCS.kpi(),    s=>{ if(s.exists()) setKpi(JSON.parse(s.data().data)); }),
      onSnapshot(DOCS.tasks(),  s=>{ if(s.exists()){ const d=JSON.parse(s.data().data); setTasks(d); }}),
      onSnapshot(DOCS.daily(),  s=>{ if(s.exists()) setDaily(JSON.parse(s.data().data)); }),
      onSnapshot(DOCS.persona(),s=>{ if(s.exists()) setPersonaSteps(JSON.parse(s.data().data)); }),
      onSnapshot(DOCS.quest(),  s=>{ if(s.exists()) setQuestionnaire(JSON.parse(s.data().data)); }),
      onSnapshot(DOCS.trafficChannels(),s=>{ if(s.exists()) setTrafficChannels(JSON.parse(s.data().data)); }),
      onSnapshot(DOCS.themes(), s=>{ if(s.exists()) setThemes(JSON.parse(s.data().data)); }),
      onSnapshot(DOCS.team(),   s=>{ if(s.exists()) setTeam(JSON.parse(s.data().data)); }),
      onSnapshot(DOCS.calendar(),s=>{ if(s.exists()) setCalCampaigns(JSON.parse(s.data().data)); }),
      onSnapshot(DOCS.calCategories(),s=>{ if(s.exists()) setCalCategories(JSON.parse(s.data().data)); }),
    ];
    setSynced(true); setSyncStatus("✓ Szinkronizálva");
    return ()=>unsubs.forEach(u=>u());
  },[]);

  const saveKpi      = v => { setKpi(v);            fbSave(DOCS.kpi(), v); };
  const saveTasks    = v => { setTasks(v);           fbSave(DOCS.tasks(), v); };
  const saveDaily    = v => { setDaily(v);           fbSave(DOCS.daily(), v); };
  const savePersona  = v => { setPersonaSteps(v);    fbSave(DOCS.persona(), v); };
  const saveQuest    = v => { setQuestionnaire(v);   fbSave(DOCS.quest(), v); };
  const saveChannels = v => { setTrafficChannels(v); fbSave(DOCS.trafficChannels(), v); };
  const saveThemes   = v => { setThemes(v);          fbSave(DOCS.themes(), v); };
  const saveTeam     = v => { setTeam(v);            fbSave(DOCS.team(), v); };
  const saveCalCampaigns   = v => { setCalCampaigns(v);   fbSave(DOCS.calendar(), v); };
  const saveCalCategories  = v => { setCalCategories(v);  fbSave(DOCS.calCategories(), v); };

  // KPI derived
  const m    = kpi.find(k=>k.month===selMonth)||kpi[3];
  const ph   = PHASE[m.phase]||PHASE["Építkezés"];
  const actual = m.actual, target = m.target;
  const pct  = actual!=null?Math.round((actual/target)*100):null;
  const diff = actual!=null?actual-target:null;
  const qMs  = kpi.filter(k=>k.quarter===m.quarter);
  const qTgt = qMs.reduce((s,k)=>s+k.target,0);
  const qAct = qMs.filter(k=>k.actual!=null).reduce((s,k)=>s+k.actual,0);
  const dailyVals = Object.entries(daily)
    .filter(([k])=>{ const[y,mo]=k.split("-"); return parseInt(y)===2026&&parseInt(mo)===selMonth; })
    .sort(([a],[b])=>parseInt(a.split("-")[2])-parseInt(b.split("-")[2])).map(([,v])=>v);
  const dailySum = dailyVals.reduce((s,v)=>s+v,0);
  const todayKey = `2026-${today.getMonth()+1}-${today.getDate()}`;
  const todayVal = daily[todayKey]??null;
  const yearV = kpi.filter(k=>k.actual!=null).reduce((s,k)=>s+k.actual,0);
  const yearT = kpi.reduce((s,k)=>s+k.target,0);

  // Task mutations
  const toggleTask = (mo,type,idx) => {
    const n={...tasks}; n[mo]={...n[mo]}; n[mo][type]=[...(n[mo][type]||[])];
    const cur=n[mo][type][idx].status;
    n[mo][type][idx]={...n[mo][type][idx], status: cur==="done"?"todo":"done"};
    saveTasks(n);
  };
  const editTask = (mo,type,idx,field,val) => {
    const n={...tasks}; n[mo]={...n[mo]}; n[mo][type]=[...(n[mo][type]||[])];
    n[mo][type][idx]={...n[mo][type][idx],[field]:val};
    saveTasks(n);
  };
  const deleteTask = (mo,type,idx) => {
    const n={...tasks}; n[mo]={...n[mo]}; n[mo][type]=(n[mo][type]||[]).filter((_,i)=>i!==idx);
    saveTasks(n);
  };
  const addTask = (mo,type,label) => {
    const n={...tasks};
    if(!n[mo])n[mo]={persona:[],campaigns:[],other:[],content:[]};
    n[mo]={...n[mo],[type]:[...(n[mo][type]||[]),makeTask(label)]};
    saveTasks(n);
  };
  const updateKpi  = (mo,field,val) => saveKpi(kpi.map(k=>k.month===mo?{...k,[field]:val}:k));
  const setDayVal  = (key,val) => saveDaily({...daily,[key]:val});
  const editStep   = (i,f,v) => savePersona(personaSteps.map((s,idx)=>idx===i?{...s,[f]:v}:s));
  const editQ      = (i,f,v) => saveQuest(questionnaire.map((q,idx)=>idx===i?{...q,[f]:v}:q));
  const editCh     = (i,f,v) => saveChannels(trafficChannels.map((c,idx)=>idx===i?{...c,[f]:v}:c));

  const t = tasks[selMonth]||{persona:[],campaigns:[],other:[],content:[]};

  // Team colors for member color picker
  const MEMBER_COLORS = ["#73AF1C","#08B7E4","#FA8C05","#E45050","#a78bfa","#f97316","#34d399","#f59e0b"];

  return (
    <div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",background:"#0d1520",minHeight:"100vh",color:"#dde5f4"}}>

      {/* TOP BAR */}
      <div style={{background:"#1D384C",borderBottom:"1px solid #0d1f2e",padding:"10px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <img src="/blank__4_.png" alt="Furbify"
            onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="block";}}
            style={{height:32,objectFit:"contain"}}/>
          <span style={{display:"none",fontSize:17,fontWeight:800,color:"#73AF1C"}}>furbify</span>
          <div style={{width:1,height:24,background:"#2a4a5e"}}/>
          <span style={{fontSize:10,color:"#99bbcc",fontWeight:700,letterSpacing:2}}>MARKETING · 2026</span>
          {yearV>0&&<div style={{fontSize:11,color:"#99bbcc",background:"#0f1e2d",padding:"4px 12px",borderRadius:20,border:"1px solid #2a4a5e"}}>
            Éves tény: <b style={{color:"#73AF1C"}}>{yearV.toLocaleString("hu")}</b> <span style={{color:"#7a9ab8"}}>/ {yearT.toLocaleString("hu")}</span>
          </div>}
          <div style={{fontSize:10,color:synced?"#73AF1C":"#FA8C05",background:"#0f1e2d",padding:"3px 10px",borderRadius:20,border:`1px solid ${synced?"#73AF1C44":"#FA8C0544"}`}}>
            {syncStatus}
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,background:"#0f1e2d",border:`1px solid ${ph.accent}66`,borderRadius:8,padding:"5px 14px"}}>
            <span style={{fontSize:10,color:"#99bbcc",fontWeight:600}}>Ma ({today.getDate()}/{today.getMonth()+1}):</span>
            <ENum value={todayVal} onSave={v=>setDayVal(todayKey,v)} placeholder="beírás" color={ph.accent} size={13}/>
            <span style={{fontSize:10,color:"#99bbcc"}}>látogató</span>
          </div>
          <button onClick={()=>setShowTeamPanel(s=>!s)} style={{fontSize:11,background:showTeamPanel?"#08B7E4":"#0d1f2e",border:`1px solid ${showTeamPanel?"#08B7E4":"#2a4a5e"}`,color:showTeamPanel?"#fff":"#5a7a8e",padding:"5px 14px",borderRadius:6,cursor:"pointer",fontWeight:showTeamPanel?700:400}}>
            👥 Csapat
          </button>
          <button onClick={()=>setShowDataPanel(s=>!s)} style={{fontSize:11,background:showDataPanel?"#73AF1C":"#0d1f2e",border:`1px solid ${showDataPanel?"#73AF1C":"#2a4a5e"}`,color:showDataPanel?"#fff":"#5a7a8e",padding:"5px 14px",borderRadius:6,cursor:"pointer",fontWeight:showDataPanel?700:400}}>
            📊 Adatok
          </button>
        </div>
      </div>

      {/* TEAM PANEL */}
      {showTeamPanel&&(
        <div style={{background:"#0f1e2d",borderBottom:"1px solid #1a3040",padding:"20px 32px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>👥 Csapattagok kezelése</div>
            <button onClick={()=>saveTeam([...team,{id:"member_"+Date.now(),name:"Új tag",color:"#a78bfa"}])}
              style={{background:"#08B7E422",border:"1px dashed #08B7E455",color:"#08B7E4",fontSize:11,padding:"5px 14px",borderRadius:6,cursor:"pointer",fontWeight:700}}>+ Új tag</button>
          </div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            {team.map((member,i)=>(
              <div key={member.id} style={{background:"#1a2235",border:`1px solid ${member.color}44`,borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,minWidth:200}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:member.color+"33",border:`2px solid ${member.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:member.color}}>
                  {member.name[0]}
                </div>
                <div style={{flex:1}}>
                  <ETxt value={member.name} onSave={val=>saveTeam(team.map((m,idx)=>idx===i?{...m,name:val}:m))} style={{fontSize:13,fontWeight:700,color:"#fff"}}/>
                  <div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>
                    {MEMBER_COLORS.map(c=>(
                      <div key={c} onClick={()=>saveTeam(team.map((m,idx)=>idx===i?{...m,color:c}:m))}
                        style={{width:16,height:16,borderRadius:"50%",background:c,cursor:"pointer",border:member.color===c?"2px solid #fff":"2px solid transparent"}}/>
                    ))}
                  </div>
                </div>
                <button onClick={()=>saveTeam(team.filter((_,idx)=>idx!==i))} style={{background:"none",border:"none",color:"#8899bb",cursor:"pointer",fontSize:15,padding:0}}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DATA PANEL */}
      {showDataPanel&&(
        <div style={{background:"#0f1e2d",borderBottom:"1px solid #1a3040",padding:"20px 32px"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:16}}>📊 Havi adatok kézi szerkesztése</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:20}}>
            {kpi.map(k=>{
              const ps=PHASE[k.phase]||PHASE["Építkezés"];
              const pct2=k.actual!=null?Math.round((k.actual/k.target)*100):null;
              return(
                <div key={k.month} style={{background:"#0d1520",border:`1px solid ${k.month===selMonth?ps.accent:"#1e2535"}`,borderRadius:10,padding:"12px 14px",cursor:"pointer"}} onClick={()=>setSelMonth(k.month)}>
                  <div style={{fontSize:10,fontWeight:700,color:ps.accent,marginBottom:6}}>{k.name}</div>
                  <div style={{fontSize:10,color:"#8899bb",marginBottom:3}}>Cél:</div>
                  <ENum value={k.target} onSave={v=>updateKpi(k.month,"target",v)} color={ps.accent} size={13}/>
                  <div style={{fontSize:10,color:"#8899bb",marginTop:8,marginBottom:3}}>Tény:</div>
                  <ENum value={k.actual} onSave={v=>updateKpi(k.month,"actual",v)} placeholder="nincs adat" color="#34d399" size={13}/>
                  <div style={{fontSize:10,color:"#8899bb",marginTop:8,marginBottom:3}}>2025 tény:</div>
                  <ENum value={k.prevYear} onSave={v=>updateKpi(k.month,"prevYear",v)} placeholder="beírás" color="#5a7a8e" size={13}/>
                  {pct2!=null&&(<div style={{marginTop:6,background:"#2a3448",borderRadius:3,height:3,overflow:"hidden"}}><div style={{height:"100%",background:pct2>=100?"#34d399":pct2>=85?"#fbbf24":"#f87171",width:`${Math.min(pct2,100)}%`}}/></div>)}
                </div>
              );
            })}
          </div>
          <div style={{borderTop:"1px solid #1e2535",paddingTop:16}}>
            <div style={{fontSize:12,fontWeight:700,color:"#fff",marginBottom:12}}>Napi látogatók – {MONTH_NAMES[selMonth-1]}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {Array.from({length:31},(_,i)=>{
                const day=i+1,key=`2026-${selMonth}-${day}`,val=daily[key];
                const isToday=selMonth===today.getMonth()+1&&day===today.getDate();
                return(
                  <div key={day} style={{background:val!=null?"#1a2535":"#0d1117",border:`1px solid ${isToday?ph.accent:val!=null?ph.accent+"44":"#1e2535"}`,borderRadius:6,padding:"6px 8px",minWidth:58,textAlign:"center"}}>
                    <div style={{fontSize:9,color:"#8899bb",marginBottom:2}}>{day}.</div>
                    <ENum value={val} onSave={v=>setDayVal(key,v)} placeholder="—" color={ph.accent} size={11}/>
                  </div>
                );
              })}
            </div>
            {dailyVals.length>0&&(
              <div style={{marginTop:10,fontSize:11,color:"#99aacc"}}>
                Beírt napok összege: <b style={{color:"#c0ccdd"}}>{dailySum.toLocaleString("hu")}</b>
                {actual!=null&&<span> · Havi tény: <b style={{color:"#34d399"}}>{actual.toLocaleString("hu")}</b></span>}
                <button onClick={()=>updateKpi(selMonth,"actual",dailySum)}
                  style={{marginLeft:12,background:"#34d39922",border:"1px solid #34d39944",color:"#34d399",fontSize:10,padding:"3px 10px",borderRadius:6,cursor:"pointer",fontWeight:700}}>
                  Összeg beállítása havi ténynek ↑
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{padding:"18px 32px"}}>

        {/* MONTH TABS */}
        <div style={{display:"flex",gap:3,marginBottom:18,overflowX:"auto",paddingBottom:4,paddingTop:18}}>
          {kpi.map((k,idx)=>{
            const ps=PHASE[k.phase]||PHASE["Építkezés"],isFirst=idx===0||kpi[idx-1].quarter!==k.quarter,sel=k.month===selMonth;
            return(
              <div key={k.month} style={{position:"relative",flexShrink:0}}>
                {isFirst&&<div style={{position:"absolute",top:-16,left:0,fontSize:9,fontWeight:800,color:ps.accent,letterSpacing:1}}>Q{k.quarter}</div>}
                <button onClick={()=>setSelMonth(k.month)} style={{background:sel?ps.accent:k.actual!=null?"#1a2535":"#161b27",color:sel?"#000":k.actual!=null?ps.accent:"#3a4555",border:`1px solid ${sel?ps.accent:k.actual!=null?ps.accent+"55":"#252b3b"}`,borderRadius:8,padding:"7px 11px",cursor:"pointer",fontSize:11.5,fontWeight:sel?800:500,transition:"all 0.15s",minWidth:52}}>
                  {k.name.slice(0,3)}{k.actual!=null&&!sel&&<div style={{fontSize:8,marginTop:1}}>✓</div>}
                </button>
              </div>
            );
          })}
        </div>

        {/* KPI CARDS */}
        <div style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr",gap:12,marginBottom:12}}>
          {/* Main */}
          <div style={{background:"#1a2235",border:`1px solid ${ph.accent}35`,borderRadius:14,padding:"20px 24px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
              <div style={{fontSize:11,color:"#99bbcc",fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Webshop látogatók – {m.name}</div>
              {pct!=null&&<div style={{background:pct>=100?"#064e3b":pct>=85?"#78350f":"#7f1d1d",color:pct>=100?"#34d399":pct>=85?"#fbbf24":"#f87171",fontWeight:800,fontSize:20,padding:"6px 16px",borderRadius:20}}>{pct}%</div>}
            </div>
            <div style={{fontSize:42,fontWeight:800,color:actual!=null?"#fff":"#2a3347",letterSpacing:"-2px",lineHeight:1,marginBottom:4}}>
              <ENum value={actual} onSave={v=>updateKpi(selMonth,"actual",v)} placeholder="—" color="#fff" size={42}/>
            </div>
            <div style={{fontSize:11,color:"#8899bb",marginBottom:14}}>{actual!=null?"látogató érkezett a webshopra ebben a hónapban":"Kattints a '—' jelre az adat beírásához"}</div>
            <div style={{background:"#2a3448",borderRadius:4,height:5,overflow:"hidden",marginBottom:6}}>
              <div style={{height:"100%",background:ph.accent,width:actual!=null?`${Math.min((actual/target)*100,100)}%`:"0%",transition:"width 0.6s ease"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#8899bb",marginBottom:14}}>
              <span>Havi cél: {target.toLocaleString("hu")} látogató</span>
              {diff!=null&&<span style={{color:diff>=0?"#34d399":"#f87171",fontWeight:700}}>{diff>=0?"+":""}{diff.toLocaleString("hu")} látogató</span>}
            </div>
            {/* 3 kis kártya + növekedés kalkulátor */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
              <div style={{background:"#0d1520",border:"1px solid #2e3a50",borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontSize:10,color:"#8899bb",marginBottom:4}}>Havi cél ✏️</div>
                <ENum value={target} onSave={v=>updateKpi(selMonth,"target",v)} color={ph.accent} size={16}/>
              </div>
              <div style={{background:"#0d1520",border:"1px solid #2e3a50",borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontSize:10,color:"#8899bb",marginBottom:4}}>2025 {m.name} ✏️</div>
                <ENum value={m.prevYear} onSave={v=>updateKpi(selMonth,"prevYear",v)} placeholder="beírás" color="#5a7a8e" size={16}/>
              </div>
              <div style={{background:"#0d1520",border:`1px solid ${ph.accent}33`,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontSize:10,color:"#8899bb",marginBottom:4}}>Cél növekedés ✏️</div>
                {m.prevYear!=null ? (
                  <div>
                    <GrowthField
                      prevYear={m.prevYear}
                      target={target}
                      accent={ph.accent}
                      onChangeTarget={v=>updateKpi(selMonth,"target",v)}
                    />
                  </div>
                ) : (
                  <div style={{fontSize:11,color:"#8899bb"}}>Írd be a 2025-ös adatot</div>
                )}
              </div>
            </div>
            {dailyVals.length>1&&(
              <div style={{borderTop:"1px solid #1e2535",paddingTop:12,display:"flex",alignItems:"center",gap:16}}>
                <div><div style={{fontSize:10,color:"#8899bb",marginBottom:4}}>Napi trend ({dailyVals.length} nap)</div><Sparkline vals={dailyVals} color={ph.accent}/></div>
                <div><div style={{fontSize:10,color:"#8899bb"}}>Napi átlag</div><div style={{fontSize:18,fontWeight:800,color:"#fff"}}>{Math.round(dailySum/dailyVals.length).toLocaleString("hu")}</div></div>
                <div><div style={{fontSize:10,color:"#8899bb"}}>Napi összeg</div><div style={{fontSize:18,fontWeight:800,color:ph.accent}}>{dailySum.toLocaleString("hu")}</div></div>
                {todayVal!=null&&<div><div style={{fontSize:10,color:"#8899bb"}}>Ma</div><div style={{fontSize:18,fontWeight:800,color:"#fbbf24"}}>{todayVal.toLocaleString("hu")}</div></div>}
              </div>
            )}
          </div>

          {/* Quarter */}
          <div style={{background:"#1a2235",border:"1px solid #2e3a50",borderRadius:14,padding:"24px 26px"}}>
            <div style={{fontSize:11,color:"#8899bb",fontWeight:600,marginBottom:6}}>Q{m.quarter} összesítés</div>
            <div style={{fontSize:28,fontWeight:800,color:"#fff",letterSpacing:"-1px"}}>{qTgt.toLocaleString("hu")}</div>
            <div style={{fontSize:11,color:"#8899bb",marginBottom:14}}>cél összesen</div>
            {qAct>0&&<><div style={{fontSize:20,fontWeight:800,color:"#34d399"}}>{qAct.toLocaleString("hu")}</div><div style={{fontSize:11,color:"#8899bb",marginBottom:10}}>tény · {Math.round((qAct/qTgt)*100)}%</div></>}
            <div style={{background:"#2a3448",borderRadius:3,height:5,overflow:"hidden",marginBottom:16}}><div style={{height:"100%",background:ph.accent,width:qAct&&qTgt?`${Math.min((qAct/qTgt)*100,100)}%`:"0%"}}/></div>
            {qMs.map(k=>{
              const a=k.actual,pct2=a!=null?Math.round((a/k.target)*100):null;
              return(
                <div key={k.month} onClick={()=>setSelMonth(k.month)} style={{marginBottom:10,cursor:"pointer",opacity:k.month===selMonth?1:0.6}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                    <span style={{color:k.month===selMonth?"#fff":"#4a5568",fontWeight:k.month===selMonth?700:400}}>{k.name}</span>
                    <div style={{textAlign:"right"}}>
                      {a!=null&&<span style={{fontSize:12,color:"#34d399",fontWeight:700}}>{a.toLocaleString("hu")} </span>}
                      <span style={{fontSize:11,color:"#8899bb"}}>/ {k.target.toLocaleString("hu")}</span>
                      {pct2!=null&&<span style={{fontSize:10,color:pct2>=100?"#34d399":pct2>=85?"#fbbf24":"#f87171",marginLeft:6,fontWeight:700}}>{pct2}%</span>}
                    </div>
                  </div>
                  <div style={{background:"#2a3448",borderRadius:2,height:3,overflow:"hidden"}}><div style={{height:"100%",background:pct2!=null?(pct2>=100?"#34d399":pct2>=85?"#fbbf24":"#f87171"):ph.accent+"33",width:a!=null?`${Math.min((a/k.target)*100,100)}%`:"0%"}}/></div>
                </div>
              );
            })}
          </div>

          {/* Éves */}
          <div style={{background:"#1a2235",border:"1px solid #2e3a50",borderRadius:14,padding:"20px 22px"}}>
            <div style={{fontSize:11,color:"#8899bb",fontWeight:600,marginBottom:12}}>Éves összesítés</div>
            {kpi.filter(k=>k.actual!=null).map(k=>{
              const ps=PHASE[k.phase]||PHASE["Építkezés"],p=Math.round((k.actual/k.target)*100);
              return(
                <div key={k.month} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #1e2535"}}>
                  <span style={{fontSize:11,color:"#99aacc"}}>{k.name}</span>
                  <div><span style={{fontSize:12,fontWeight:700,color:"#fff"}}>{k.actual.toLocaleString("hu")}</span><span style={{fontSize:10,color:p>=100?"#34d399":p>=85?"#fbbf24":"#f87171",marginLeft:6}}>{p}%</span></div>
                </div>
              );
            })}
            {kpi.filter(k=>k.actual!=null).length===0&&<div style={{fontSize:12,color:"#3a5070",textAlign:"center",paddingTop:20}}>Még nincs tény adat</div>}
          </div>
        </div>

        {/* TÉMÁK */}
        <div style={{background:"#1a2235",border:"1px solid #08B7E444",borderRadius:14,padding:"16px 22px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:"#eef2fc"}}>🎯 2026-os stratégiai témák</div>
            <button onClick={()=>saveThemes([...themes,"Új téma..."])} style={{background:"#08B7E422",border:"1px dashed #08B7E455",color:"#08B7E4",fontSize:11,padding:"4px 14px",borderRadius:6,cursor:"pointer",fontWeight:700}}>+ Új téma</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {themes.map((theme,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",background:"#0d1520",border:"1px solid #263045",borderRadius:8,padding:"10px 12px"}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:"#08B7E4",flexShrink:0,marginTop:5}}/>
                <div style={{flex:1}}><ETxt value={theme} onSave={val=>saveThemes(themes.map((th,idx)=>idx===i?val:th))} style={{fontSize:12.5,color:"#d0daf0",lineHeight:1.5}}/></div>
                <button onClick={()=>saveThemes(themes.filter((_,idx)=>idx!==i))} style={{background:"none",border:"none",color:"#8899bb",cursor:"pointer",fontSize:14,padding:0,flexShrink:0}}>×</button>
              </div>
            ))}
          </div>
        </div>

        {/* TABS */}
        <div style={{display:"flex",gap:2,borderBottom:"1px solid #1a3040",marginBottom:16}}>
          {[{id:"tasks",label:"📋 Feladatok"},{id:"persona",label:"👤 Persona roadmap"},{id:"calendar",label:"📅 Kampánynaptár"},{id:"performance",label:"📈 Teljesítmény"}].map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{background:"transparent",border:"none",borderBottom:activeTab===tab.id?"2px solid #73AF1C":"2px solid transparent",color:activeTab===tab.id?"#fff":"#3a5a6e",fontSize:12.5,fontWeight:activeTab===tab.id?700:400,padding:"8px 18px",cursor:"pointer",marginBottom:-1,transition:"all 0.15s"}}>{tab.label}</button>
          ))}
        </div>

        {/* FELADATOK */}
        {activeTab==="tasks"&&(
          <div>
            <TeamOverview tasks={tasks} team={team} selMonth={selMonth}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <TaskSection title="👤 Persona kutatás" items={t.persona} accent="#08B7E4" month={selMonth} type="persona" onToggle={toggleTask} onEdit={editTask} onDelete={deleteTask} onAdd={addTask} team={team}/>
              <TaskSection title="📣 Kampányok" items={t.campaigns} accent={ph.accent} month={selMonth} type="campaigns" onToggle={toggleTask} onEdit={editTask} onDelete={deleteTask} onAdd={addTask} team={team}/>
              <TaskSection title="📧 Hírlevelek" items={t.other} accent="#FA8C05" month={selMonth} type="other" onToggle={toggleTask} onEdit={editTask} onDelete={deleteTask} onAdd={addTask} team={team}/>
              <TaskSection title="🎬 Content kötelező" items={t.content} accent="#73AF1C" month={selMonth} type="content" onToggle={toggleTask} onEdit={editTask} onDelete={deleteTask} onAdd={addTask} team={team}/>
              {/* Extra szekciók */}
              {(t.extra||[]).map((sec,si)=>(
                <div key={sec.id} style={{position:"relative"}}>
                  <button onClick={()=>{
                    const n={...tasks};n[selMonth]={...n[selMonth]};
                    n[selMonth].extra=(n[selMonth].extra||[]).filter((_,idx)=>idx!==si);
                    saveTasks(n);
                  }} title="Szekció törlése" style={{position:"absolute",top:12,right:12,zIndex:10,background:"#7f1d1d",border:"none",color:"#f87171",cursor:"pointer",fontSize:11,padding:"2px 8px",borderRadius:4,fontWeight:700}}>Szekció törlése</button>
                  <TaskSection
                    title={
                      <ETxt value={sec.title} onSave={val=>{
                        const n={...tasks};n[selMonth]={...n[selMonth]};
                        n[selMonth].extra=(n[selMonth].extra||[]).map((s,idx)=>idx===si?{...s,title:val}:s);
                        saveTasks(n);
                      }} style={{fontSize:12.5,fontWeight:700,color:"#eef2fc"}}/>
                    }
                    items={sec.items||[]}
                    accent="#a78bfa"
                    month={selMonth}
                    type={`extra_${si}`}
                    onToggle={(mo,type,idx)=>{
                      const n={...tasks};n[mo]={...n[mo]};
                      const exArr=[...(n[mo].extra||[])];
                      exArr[si]={...exArr[si],items:[...exArr[si].items]};
                      const cur=exArr[si].items[idx].status;
                      exArr[si].items[idx]={...exArr[si].items[idx],status:cur==="done"?"todo":"done"};
                      n[mo].extra=exArr; saveTasks(n);
                    }}
                    onEdit={(mo,type,idx,field,val)=>{
                      const n={...tasks};n[mo]={...n[mo]};
                      const exArr=[...(n[mo].extra||[])];
                      exArr[si]={...exArr[si],items:[...exArr[si].items]};
                      exArr[si].items[idx]={...exArr[si].items[idx],[field]:val};
                      n[mo].extra=exArr; saveTasks(n);
                    }}
                    onDelete={(mo,type,idx)=>{
                      const n={...tasks};n[mo]={...n[mo]};
                      const exArr=[...(n[mo].extra||[])];
                      exArr[si]={...exArr[si],items:exArr[si].items.filter((_,i)=>i!==idx)};
                      n[mo].extra=exArr; saveTasks(n);
                    }}
                    onAdd={(mo,type,label)=>{
                      const n={...tasks};n[mo]={...n[mo]};
                      const exArr=[...(n[mo].extra||[])];
                      exArr[si]={...exArr[si],items:[...(exArr[si].items||[]),makeTask(label)]};
                      n[mo].extra=exArr; saveTasks(n);
                    }}
                    team={team}
                  />
                </div>
              ))}
            </div>
            {/* Új szekció gomb */}
            <button onClick={()=>{
              const n={...tasks};
              if(!n[selMonth])n[selMonth]={persona:[],campaigns:[],other:[],content:[],extra:[]};
              n[selMonth]={...n[selMonth],extra:[...(n[selMonth].extra||[]),{id:Date.now()+"",title:"Új szekció",items:[]}]};
              saveTasks(n);
            }} style={{marginTop:12,width:"100%",background:"#a78bfa22",border:"1px dashed #a78bfa55",color:"#a78bfa",fontSize:12,padding:"10px",borderRadius:10,cursor:"pointer",fontWeight:700}}>
              + Új feladat szekció hozzáadása
            </button>
          </div>
        )}

        {/* PERSONA */}
        {activeTab==="persona"&&(
          <div>
            <div style={{background:"#1a2235",border:"1px solid #a78bfa30",borderRadius:14,padding:24,marginBottom:14}}>
              <div style={{fontSize:15,fontWeight:800,color:"#fff",marginBottom:6}}>🎯 Cél: 2 kidolgozott persona – Q2 végéig (2026. június 30.)</div>
              <div style={{fontSize:12.5,color:"#99aacc",lineHeight:1.7,marginBottom:20}}>A pontosabb célzáshoz 2 vásárlói persona kerül kidolgozásra kérdőíves adatgyűjtés alapján.</div>
              <div style={{position:"relative",paddingLeft:30}}>
                <div style={{position:"absolute",left:8,top:10,bottom:10,width:2,background:"#1e2535"}}/>
                {personaSteps.map((step,i)=>{
                  const active=selMonth===step.month;
                  return(
                    <div key={i} style={{position:"relative",marginBottom:16}}>
                      <div style={{position:"absolute",left:-26,width:20,height:20,borderRadius:"50%",background:step.color,border:"3px solid #0d1117",top:3,zIndex:1}}/>
                      <div style={{background:active?"#1e2535":"#0d1117",border:`1px solid ${active?step.color:"#1e2535"}`,borderRadius:10,padding:"12px 16px"}}>
                        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
                          <select value={step.month} onChange={e=>editStep(i,"month",parseInt(e.target.value))}
                            style={{fontSize:10,fontWeight:800,color:step.color,background:step.color+"20",border:"none",borderRadius:10,padding:"2px 8px",cursor:"pointer",outline:"none"}}>
                            {MONTH_NAMES.map((n,idx)=><option key={idx+1} value={idx+1}>{n.toUpperCase()}</option>)}
                          </select>
                          <ETxt value={step.label} onSave={val=>editStep(i,"label",val)} style={{fontSize:13,fontWeight:700,color:active?"#fff":"#9aa3b5"}}/>
                          <input type="color" value={step.color} onChange={e=>editStep(i,"color",e.target.value)} style={{width:20,height:20,borderRadius:"50%",border:"none",cursor:"pointer",padding:0,flexShrink:0}}/>
                          <button onClick={()=>savePersona(personaSteps.filter((_,idx)=>idx!==i))} style={{marginLeft:"auto",background:"none",border:"none",color:"#8899bb",cursor:"pointer",fontSize:15,padding:0}}>×</button>
                        </div>
                        <ETxt value={step.detail} onSave={val=>editStep(i,"detail",val)} multiline={true} style={{fontSize:12,color:"#99aacc",display:"block",width:"100%"}}/>
                      </div>
                    </div>
                  );
                })}
                <button onClick={()=>savePersona([...personaSteps,{month:selMonth,label:"Új lépés",color:"#6b7280",detail:"Leírás..."}])}
                  style={{background:"#a78bfa22",border:"1px dashed #a78bfa55",color:"#a78bfa",fontSize:12,padding:"8px 16px",borderRadius:8,cursor:"pointer",fontWeight:700}}>+ Új lépés</button>
              </div>
            </div>
            <div style={{background:"#1a2235",border:"1px solid #2e3a50",borderRadius:14,padding:24}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>📝 Kérdőív tervezési sablon</div>
                <button onClick={()=>saveQuest([...questionnaire,{label:"🔹 Új mező",val:"Tartalom..."}])} style={{background:"#a78bfa22",border:"1px dashed #a78bfa55",color:"#a78bfa",fontSize:11,padding:"5px 12px",borderRadius:6,cursor:"pointer",fontWeight:700}}>+ Sor</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {questionnaire.map((q,i)=>(
                  <div key={i} style={{background:"#0d1520",border:"1px solid #263045",borderRadius:8,padding:"11px 14px",position:"relative"}}>
                    <button onClick={()=>saveQuest(questionnaire.filter((_,idx)=>idx!==i))} style={{position:"absolute",top:6,right:8,background:"none",border:"none",color:"#8899bb",cursor:"pointer",fontSize:13,padding:0}}>×</button>
                    <div style={{marginBottom:4}}><ETxt value={q.label} onSave={val=>editQ(i,"label",val)} style={{fontSize:11,color:"#6b7280",fontWeight:600}}/></div>
                    <ETxt value={q.val} onSave={val=>editQ(i,"val",val)} multiline={true} style={{fontSize:12,color:"#c0ccdd",display:"block",width:"100%"}}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FORGALOMTERELÉS */}
        {activeTab==="traffic"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>📡 Forgalomterelő csatornák</div>
              <button onClick={()=>saveChannels([...trafficChannels,{ch:"Új csatorna",mix:"Mix",tip:"Leírás...",color:"#6b7280"}])} style={{background:"#34d39922",border:"1px dashed #34d39955",color:"#34d399",fontSize:11,padding:"5px 14px",borderRadius:6,cursor:"pointer",fontWeight:700}}>+ Új csatorna</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:14}}>
              {trafficChannels.map((item,i)=>(
                <div key={i} style={{background:"#1a2235",border:"1px solid #2e3a50",borderRadius:12,padding:"14px 16px",position:"relative"}}>
                  <button onClick={()=>saveChannels(trafficChannels.filter((_,idx)=>idx!==i))} style={{position:"absolute",top:8,right:10,background:"none",border:"none",color:"#8899bb",cursor:"pointer",fontSize:15,padding:0}}>×</button>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                    <input type="color" value={item.color} onChange={e=>editCh(i,"color",e.target.value)} style={{width:14,height:14,borderRadius:"50%",border:"none",cursor:"pointer",padding:0,flexShrink:0}}/>
                    <ETxt value={item.ch} onSave={val=>editCh(i,"ch",val)} style={{fontSize:12.5,fontWeight:700,color:"#eef2fc"}}/>
                  </div>
                  <div style={{marginBottom:6}}><ETxt value={item.mix} onSave={val=>editCh(i,"mix",val)} style={{fontSize:10,color:item.color,fontWeight:700}}/></div>
                  <ETxt value={item.tip} onSave={val=>editCh(i,"tip",val)} multiline={true} style={{fontSize:11.5,color:"#99aacc",display:"block",width:"100%"}}/>
                </div>
              ))}
            </div>
            <div style={{background:"#1a2235",border:`1px solid ${ph.accent}30`,borderRadius:14,padding:"18px 22px"}}>
              <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:12}}>🎯 Kampánytervek</div>
              <TaskSection title="" items={t.campaigns} accent={ph.accent} month={selMonth} type="campaigns" onToggle={toggleTask} onEdit={editTask} onDelete={deleteTask} onAdd={addTask} team={team}/>
            </div>
          </div>
        )}

        {/* KAMPÁNYNAPTÁR */}
        {activeTab==="calendar"&&(
          <CampaignCalendar
            campaigns={calCampaigns}
            categories={calCategories}
            onSaveCampaigns={saveCalCampaigns}
            onSaveCategories={saveCalCategories}
            today={today}
          />
        )}

        {/* TELJESÍTMÉNY */}
        {activeTab==="performance"&&(
          <PerformanceDashboard/>
        )}

        <div style={{fontSize:10,color:"#3a5070",textAlign:"center",marginTop:20}}>
          Furbify Marketing Dashboard 2026 · Firebase realtime sync · Minden változás azonnal mentődik
        </div>
      </div>
    </div>
  );
}
