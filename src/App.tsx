// @ts-nocheck
import { useState, useEffect, useRef } from "react";
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

const DEFAULT_TASKS = {
  1:  { persona:[], campaigns:makeTasks(["Téli kiárusítás kampány lezárása","Q1 performance kampány indítása","PPC ügynökség briefelése"]), other:makeTasks(["Éves KPI rendszer véglegesítése","Ügynökség kiválasztás"]), content:makeTasks(DEFAULT_CONTENT_ITEMS) },
  2:  { persona:[], campaigns:makeTasks(["Valentine's Day kampány","Q1 performance kampány optimalizálás"]), other:makeTasks(["Ügynökség szerződés","Belső grafikus felvétel"]), content:makeTasks(DEFAULT_CONTENT_ITEMS) },
  3:  { persona:makeTasks(["Kérdőív kidolgozásának megkezdése – kérdések, struktúra, jutalom"]), campaigns:makeTasks(["Q2 kampányok tervezése ügynökséggel","Webshop konverzió audit","Iskolakezdés kampány előkészítés"]), other:makeTasks(["Q1 kiértékelés","Ügynökség brief Q2-re"]), content:makeTasks(DEFAULT_CONTENT_ITEMS) },
  4:  { persona:makeTasks(["Kérdőív véglegesítése","Kérdőív kiküldése hírlevél listára – ápr. 1. hét","Emlékeztető kiküldése – ápr. 3. hét","Adatgyűjtés lezárása – ápr. 30."]), campaigns:makeTasks(["Forgalomterelő kvíz landing page","Google Shopping kampány optimalizálás","TikTok Ads tesztelés","Remarketing listák frissítése"]), other:makeTasks(["Hírlevél lista tisztítás","Lead magnet elkészítés"]), content:makeTasks(DEFAULT_CONTENT_ITEMS) },
  5:  { persona:makeTasks(["1. kérdőív adatok elemzése – persona 1","2. kérdőív összeállítása (KKV)","2. kérdőív kiküldése – máj. 2. hét"]), campaigns:makeTasks(["Gold/Silver/Bronze kategória bemutató","Összehasonlítás: Új vs Felújított vs Használt","Lead magnet forgalomterelő hirdetések"]), other:makeTasks(["KKV szegmens tartalom tervezés","Influencer kapcsolatfelvétel"]), content:makeTasks(DEFAULT_CONTENT_ITEMS) },
  6:  { persona:makeTasks(["2. kérdőív adatok elemzése – persona 2","Mindkét persona végleges dokumentum ✅","Persona prezentáció a csapatnak"]), campaigns:makeTasks(["Q2 zárókampány – nyári akciók","YouTube Shorts SEO kampány","Szeptemberi iskolakezdés kampány tervezése"]), other:makeTasks(["Q2 kiértékelés","Q3 kampány brief"]), content:makeTasks(DEFAULT_CONTENT_ITEMS) },
  7:  { persona:makeTasks(["✅ Persona kész – alkalmazás Q3 kampányokban"]), campaigns:makeTasks(["Nyári back to school előkészítő","Setup Wars sorozat indítása","Retargeting intenzifikálás"]), other:makeTasks(["Q4 tervezés megkezdése"]), content:makeTasks(DEFAULT_CONTENT_ITEMS) },
  8:  { persona:[], campaigns:makeTasks(["Iskolakezdés főkampány","Student deal forgalomterelő","ThinkPad tartósság kampány"]), other:makeTasks(["Black Friday landing page tervezés"]), content:makeTasks(DEFAULT_CONTENT_ITEMS) },
  9:  { persona:[], campaigns:makeTasks(["Iskolakezdés utóhullám kampány","KKV flotta kampány indítása"]), other:makeTasks(["Q4 kampány briefek véglegesítése"]), content:makeTasks(DEFAULT_CONTENT_ITEMS) },
  10: { persona:[], campaigns:makeTasks(["Black Friday előkampány – hype építés","Performance Max kampányok indítása","Remarketing intenzifikálás"]), other:makeTasks(["TOP 3 termék kiválasztása","Influencer anyagok gyártása"]), content:makeTasks(DEFAULT_CONTENT_ITEMS) },
  11: { persona:[], campaigns:makeTasks(["Black Friday / Cyber Monday főkampány 🔥","Email sorozat – napi ajánlatok","Urgency alapú hirdetések"]), other:makeTasks(["Napi kampány monitoring"]), content:makeTasks(DEFAULT_CONTENT_ITEMS) },
  12: { persona:[], campaigns:makeTasks(["Karácsonyi kampány – ajándék laptop","Év végi TOP 3 termék bemutató"]), other:makeTasks(["2026 éves kiértékelés","2027 stratégia tervezés"]), content:makeTasks(DEFAULT_CONTENT_ITEMS) },
};

const DEFAULT_THEMES = [
  "Esztétikai útmutatók (laptop setupok, home office)",
  "Új vs Felújított vs Használt összehasonlítás",
  "Fenntarthatóság – CO2 megtakarítás",
  "Iskolakezdés – diák és szülői célcsoport",
  "KKV / céges flotta megoldások",
  "Black Friday & év végi kampányok",
];

const DEFAULT_KPI = [
  { month:1,  name:"Január",     target:124704, actual:121200, prevYear:null, phase:"Építkezés",   quarter:1 },
  { month:2,  name:"Február",    target:109288, actual:107500, prevYear:null, phase:"Építkezés",   quarter:1 },
  { month:3,  name:"Március",    target:122285, actual:null,   prevYear:null, phase:"Építkezés",   quarter:1 },
  { month:4,  name:"Április",    target:101889, actual:null,   prevYear:null, phase:"Építkezés",   quarter:2 },
  { month:5,  name:"Május",      target:97464,  actual:null,   prevYear:null, phase:"Építkezés",   quarter:2 },
  { month:6,  name:"Június",     target:105714, actual:null,   prevYear:null, phase:"Építkezés",   quarter:2 },
  { month:7,  name:"Július",     target:121657, actual:null,   prevYear:null, phase:"Bemelegítés", quarter:3 },
  { month:8,  name:"Augusztus",  target:130606, actual:null,   prevYear:null, phase:"Bemelegítés", quarter:3 },
  { month:9,  name:"Szeptember", target:122276, actual:null,   prevYear:null, phase:"Bemelegítés", quarter:3 },
  { month:10, name:"Október",    target:149936, actual:null,   prevYear:null, phase:"Performance", quarter:4 },
  { month:11, name:"November",   target:163600, actual:null,   prevYear:null, phase:"Performance", quarter:4 },
  { month:12, name:"December",   target:130997, actual:null,   prevYear:null, phase:"Performance", quarter:4 },
];

const DEFAULT_PERSONA_STEPS = [
  { month:3, label:"Kérdőív kidolgozás", color:"#6b7280", detail:"Kérdések összeállítása, jutalom (500–1000 Ft kupon), platform kiválasztása." },
  { month:4, label:"1. kérdőív kiküldés", color:"#f59e0b", detail:"Kiküldés: ápr. 1. hét → hírlevél + Facebook + webshop pop-up. Határidő: ápr. 30." },
  { month:5, label:"Elemzés + 2. kérdőív", color:"#f97316", detail:"1. persona feldolgozása (máj. 1–2. hét). 2. kérdőív (KKV) kiküldése máj. 2. hétben." },
  { month:6, label:"✅ Persona kész!", color:"#34d399", detail:"Mindkét persona dokumentum elkészül. Csapatprezentáció. Q3 kampányok célzása frissíthető." },
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
    <div style={{background:"#0d1520",border:"1px solid #263045",borderRadius:8,padding:"10px 12px",marginBottom:6,opacity:isDone?0.45:1}}>
      {/* Top row: checkbox + label */}
      <div style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}>
        <div onClick={onToggle} style={{width:17,height:17,borderRadius:4,flexShrink:0,marginTop:2,border:`2px solid ${isDone?accent:"#3a3f50"}`,background:isDone?accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s"}}>
          {isDone&&<span style={{fontSize:10,color:"#000",fontWeight:800}}>✓</span>}
        </div>
        <div style={{flex:1,textDecoration:isDone?"line-through":"none"}}>
          <ETxt value={task.label} onSave={val=>onEdit("label",val)}/>
          <DeadlineBadge deadline={task.deadline} status={task.status}/>
        </div>
        <button onClick={onDelete} style={{background:"none",border:"none",color:"#8899bb",cursor:"pointer",fontSize:14,padding:0,flexShrink:0}}>×</button>
      </div>

      {/* Bottom row: assignee + status + deadline */}
      <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
        {/* Assignee */}
        <select value={task.assignee||""} onChange={e=>onEdit("assignee",e.target.value)}
          style={{background:member?member.color+"22":"#161b27",border:`1px solid ${member?member.color+"55":"#252b3b"}`,color:member?member.color:"#99aacc",fontSize:10,padding:"2px 6px",borderRadius:6,cursor:"pointer",outline:"none"}}>
          <option value="">Felelős...</option>
          {team.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
        </select>

        {/* Status */}
        <select value={task.status||"todo"} onChange={e=>onEdit("status",e.target.value)}
          style={{background:statusObj.color+"22",border:`1px solid ${statusObj.color}55`,color:statusObj.color,fontSize:10,padding:"2px 6px",borderRadius:6,cursor:"pointer",outline:"none"}}>
          {STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
        </select>

        {/* Deadline */}
        <input type="date" value={task.deadline||""} onChange={e=>onEdit("deadline",e.target.value)}
          style={{background:"#1a2235",border:"1px solid #2e3a50",color:"#99aacc",fontSize:10,padding:"2px 6px",borderRadius:6,outline:"none",cursor:"pointer"}}/>
      </div>
    </div>
  );
}

// ─── TASK SECTION ──────────────────────────────────────────────
function TaskSection({ title, items, accent, month, type, onToggle, onEdit, onDelete, onAdd, team }) {
  const [nw,setNw]=useState("");
  return (
    <div style={{background:"#1a2235",border:"1px solid #2e3a50",borderRadius:12,padding:"16px 18px",marginBottom:12}}>
      {title&&<div style={{fontSize:12.5,fontWeight:700,color:"#eef2fc",marginBottom:12}}>{title}</div>}
      {(items||[]).map((task,i)=>(
        <TaskItem key={task.id||i} task={task} team={team} accent={accent}
          onToggle={()=>onToggle(month,type,i)}
          onEdit={(field,val)=>onEdit(month,type,i,field,val)}
          onDelete={()=>onDelete(month,type,i)}
          onUpdate={(field,val)=>onEdit(month,type,i,field,val)}/>
      ))}
      <div style={{display:"flex",gap:6,marginTop:10}}>
        <input value={nw} onChange={e=>setNw(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&nw.trim()){onAdd(month,type,nw.trim());setNw("");}}}
          placeholder="+ Új feladat..."
          style={{flex:1,background:"#0d1520",border:"1px solid #263045",borderRadius:6,color:"#c0ccdd",fontSize:12,padding:"6px 10px",outline:"none"}}/>
        <button onClick={()=>{if(nw.trim()){onAdd(month,type,nw.trim());setNw("");}}}
          style={{background:accent+"22",border:`1px solid ${accent}44`,color:accent,fontSize:13,padding:"6px 14px",borderRadius:6,cursor:"pointer",fontWeight:800}}>+</button>
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
  const monthTasks = tasks[selMonth] || {};
  const allTasks = Object.values(monthTasks).flat();

  return (
    <div style={{background:"#1a2235",border:"1px solid #2e3a50",borderRadius:12,padding:"16px 18px",marginBottom:12}}>
      <div style={{fontSize:12.5,fontWeight:700,color:"#eef2fc",marginBottom:12}}>👥 Csapat – havi áttekintő</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {team.map(member=>{
          const myTasks = allTasks.filter(t=>t.assignee===member.id);
          const done = myTasks.filter(t=>t.status==="done").length;
          const overdue = myTasks.filter(t=>t.deadline&&daysDiff(t.deadline)<0&&t.status!=="done").length;
          const inprog = myTasks.filter(t=>t.status==="inprogress").length;
          const review = myTasks.filter(t=>t.status==="review").length;
          return (
            <div key={member.id} style={{background:"#0d1520",border:`1px solid ${member.color}33`,borderRadius:10,padding:"12px 14px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:member.color+"33",border:`2px solid ${member.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:member.color}}>
                  {member.name[0]}
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{member.name}</div>
                  <div style={{fontSize:10,color:"#99aacc"}}>{myTasks.length} feladat</div>
                </div>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {inprog>0&&<span style={{fontSize:10,background:"#08B7E422",color:"#08B7E4",padding:"2px 8px",borderRadius:10}}>🔵 {inprog} folyamatban</span>}
                {review>0&&<span style={{fontSize:10,background:"#FA8C0522",color:"#FA8C05",padding:"2px 8px",borderRadius:10}}>🟡 {review} review</span>}
                {done>0&&<span style={{fontSize:10,background:"#73AF1C22",color:"#73AF1C",padding:"2px 8px",borderRadius:10}}>✓ {done} kész</span>}
                {overdue>0&&<span style={{fontSize:10,background:"#7f1d1d",color:"#f87171",padding:"2px 8px",borderRadius:10}}>⚠ {overdue} késik</span>}
                {myTasks.length===0&&<span style={{fontSize:10,color:"#8899bb"}}>Nincs feladat</span>}
              </div>
            </div>
          );
        })}
      </div>
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
          {[{id:"tasks",label:"📋 Feladatok"},{id:"persona",label:"👤 Persona roadmap"},{id:"traffic",label:"🚀 Forgalomterelés"}].map(tab=>(
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

        <div style={{fontSize:10,color:"#3a5070",textAlign:"center",marginTop:20}}>
          Furbify Marketing Dashboard 2026 · Firebase realtime sync · Minden változás azonnal mentődik
        </div>
      </div>
    </div>
  );
}
