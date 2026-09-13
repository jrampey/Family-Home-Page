import fs from "node:fs/promises";

const TIME_ZONE = "America/New_York";
let calendarUrl = process.env.APPLE_CALENDAR_URL;
if (!calendarUrl) throw new Error("APPLE_CALENDAR_URL is not configured");
calendarUrl = calendarUrl.replace(/^webcal:\/\//i, "https://");

const response = await fetch(calendarUrl, { headers: { "User-Agent": "Family-Home-Page/1.0" } });
if (!response.ok) throw new Error(`Calendar returned ${response.status}`);
const raw = (await response.text()).replace(/\r?\n[ \t]/g, "");

function property(block, key) {
  const match = block.match(new RegExp(`(?:^|\\n)${key}((?:;[^:]*)?):(.*)`, "i"));
  return match ? { params: match[1] || "", value: match[2].trim() } : { params: "", value: "" };
}
function properties(block, key) {
  return [...block.matchAll(new RegExp(`(?:^|\\n)${key}((?:;[^:]*)?):(.*)`, "gi"))]
    .map(m => ({ params: m[1] || "", value: m[2].trim() }));
}
function textValue(block, key) {
  return property(block, key).value.replace(/\\n/g," ").replace(/\\,/g,",").replace(/\\;/g,";").replace(/\\\\/g,"\\");
}
function partsInZone(date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone:TIME_ZONE, year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23" }).formatToParts(date);
  return Object.fromEntries(parts.filter(p=>p.type!=="literal").map(p=>[p.type,Number(p.value)]));
}
function easternWallTimeToDate(y,m,d,hh=0,mm=0,ss=0) {
  const desired=Date.UTC(y,m-1,d,hh,mm,ss); let guess=new Date(desired);
  for(let i=0;i<2;i++){const p=partsInZone(guess);const shown=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second);guess=new Date(guess.getTime()+(desired-shown));}
  return guess;
}
function parseDate(prop) {
  const v=prop?.value||""; if(!v)return null;
  if(/^\d{8}$/.test(v)) return easternWallTimeToDate(+v.slice(0,4),+v.slice(4,6),+v.slice(6,8));
  const x=v.replace(/Z$/,""); const y=+x.slice(0,4),m=+x.slice(4,6),d=+x.slice(6,8),hh=+x.slice(9,11)||0,mm=+x.slice(11,13)||0,ss=+x.slice(13,15)||0;
  return v.endsWith("Z")?new Date(Date.UTC(y,m-1,d,hh,mm,ss)):easternWallTimeToDate(y,m,d,hh,mm,ss);
}
function wallParts(date){const p=partsInZone(date);return {y:p.year,m:p.month,d:p.day,hh:p.hour,mm:p.minute,ss:p.second};}
function addWallDays(date,n){const p=wallParts(date),u=new Date(Date.UTC(p.y,p.m-1,p.d+n,p.hh,p.mm,p.ss));return easternWallTimeToDate(u.getUTCFullYear(),u.getUTCMonth()+1,u.getUTCDate(),u.getUTCHours(),u.getUTCMinutes(),u.getUTCSeconds());}
function addWallMonths(date,n){const p=wallParts(date),u=new Date(Date.UTC(p.y,p.m-1+n,p.d,p.hh,p.mm,p.ss));return easternWallTimeToDate(u.getUTCFullYear(),u.getUTCMonth()+1,u.getUTCDate(),u.getUTCHours(),u.getUTCMinutes(),u.getUTCSeconds());}
function dayKey(date){const p=partsInZone(date);return `${p.year}-${String(p.month).padStart(2,"0")}-${String(p.day).padStart(2,"0")}T${String(p.hour).padStart(2,"0")}:${String(p.minute).padStart(2,"0")}:${String(p.second).padStart(2,"0")}`;}
function parseRule(s){return Object.fromEntries((s||"").split(";").filter(Boolean).map(x=>{const i=x.indexOf("=");return [x.slice(0,i).toUpperCase(),x.slice(i+1)];}));}
function weekdayCode(date){return ["SU","MO","TU","WE","TH","FR","SA"][new Date(Date.UTC(partsInZone(date).year,partsInZone(date).month-1,partsInZone(date).day)).getUTCDay()];}
function easternBounds(){const p=partsInZone(new Date()),base=new Date(Date.UTC(p.year,p.month-1,p.day));const a=new Date(base);a.setUTCDate(a.getUTCDate()-1);const b=new Date(base);b.setUTCDate(b.getUTCDate()+2);return {start:easternWallTimeToDate(a.getUTCFullYear(),a.getUTCMonth()+1,a.getUTCDate()),end:easternWallTimeToDate(b.getUTCFullYear(),b.getUTCMonth()+1,b.getUTCDate())};}
const {start:windowStart,end:windowEnd}=easternBounds();

const blocks=[...raw.matchAll(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/g)].map(m=>m[1]);
const overrides=new Map();
for(const block of blocks){const rid=property(block,"RECURRENCE-ID");if(rid.value){const uid=textValue(block,"UID");const d=parseDate(rid);if(uid&&d)overrides.set(`${uid}|${dayKey(d)}`,block);}}

function excluded(block,date){
  return properties(block,"EXDATE").some(prop=>prop.value.split(",").some(v=>{const d=parseDate({...prop,value:v});return d&&dayKey(d)===dayKey(date);}));
}
function expand(block){
  const uid=textValue(block,"UID"), start=parseDate(property(block,"DTSTART")); if(!start)return [];
  const end=parseDate(property(block,"DTEND")); const duration=end?end-start:1; const allDay=/^\d{8}$/.test(property(block,"DTSTART").value);
  const rule=parseRule(property(block,"RRULE").value); const dates=[];
  if(!rule.FREQ) dates.push(start);
  else {
    const interval=Math.max(1,+rule.INTERVAL||1), count=+rule.COUNT||Infinity, until=rule.UNTIL?parseDate({value:rule.UNTIL,params:""}):null;
    let generated=0;
    if(rule.FREQ==="DAILY"){
      for(let i=0;i<4000&&generated<count;i++){const d=addWallDays(start,i*interval);if(until&&d>until)break;generated++;if(d>=windowStart&&d<windowEnd)dates.push(d);if(d>=windowEnd)break;}
    } else if(rule.FREQ==="WEEKLY"){
      const by=(rule.BYDAY||weekdayCode(start)).split(",").map(x=>x.replace(/^[-+]?\d+/,""));
      for(let i=0;i<4000;i++){const d=addWallDays(start,i);if(until&&d>until)break;const days=Math.floor((d-start)/86400000);const week=Math.floor(days/7);if(week%interval===0&&by.includes(weekdayCode(d))){generated++;if(generated>count)break;if(d>=windowStart&&d<windowEnd)dates.push(d);}if(d>=windowEnd)break;}
    } else if(rule.FREQ==="MONTHLY"){
      for(let i=0;i<600&&generated<count;i++){const d=addWallMonths(start,i*interval);if(until&&d>until)break;generated++;if(d>=windowStart&&d<windowEnd)dates.push(d);if(d>=windowEnd)break;}
    } else if(rule.FREQ==="YEARLY"){
      for(let i=0;i<100&&generated<count;i++){const d=addWallMonths(start,i*12*interval);if(until&&d>until)break;generated++;if(d>=windowStart&&d<windowEnd)dates.push(d);if(d>=windowEnd)break;}
    }
  }
  for(const rp of properties(block,"RDATE")) for(const v of rp.value.split(",")){const d=parseDate({...rp,value:v});if(d&&d>=windowStart&&d<windowEnd)dates.push(d);}
  return dates.filter(d=>!excluded(block,d)).map(d=>{
    const ov=overrides.get(`${uid}|${dayKey(d)}`); if(ov){const s=parseDate(property(ov,"DTSTART"));const e=parseDate(property(ov,"DTEND"));if(!s||property(ov,"STATUS").value.toUpperCase()==="CANCELLED")return null;return {title:textValue(ov,"SUMMARY")||textValue(block,"SUMMARY")||"Untitled event",start:s,end:e||new Date(s.getTime()+duration),allDay:/^\d{8}$/.test(property(ov,"DTSTART").value)};}
    return {title:textValue(block,"SUMMARY")||"Untitled event",start:d,end:new Date(d.getTime()+duration),allDay};
  }).filter(Boolean);
}

const events=blocks.filter(b=>!property(b,"RECURRENCE-ID").value).flatMap(expand)
  .filter(e=>{const end=e.end||new Date(e.start.getTime()+1);return e.start<windowEnd&&end>windowStart;})
  .sort((a,b)=>a.start-b.start)
  .map(e=>({title:e.title,start:e.start.toISOString(),end:e.end?.toISOString()||null,allDay:e.allDay}));

await fs.writeFile("calendar-data.json",JSON.stringify({updated:new Date().toISOString(),timeZone:TIME_ZONE,events},null,2)+"\n");
console.log(`Published ${events.length} events in ${TIME_ZONE}, including recurring events.`);