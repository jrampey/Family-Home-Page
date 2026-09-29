import fs from 'node:fs/promises';

const now=new Date();
const eastern=new Date(now.toLocaleString('en-US',{timeZone:'America/New_York'}));
const start=new Date(eastern.getFullYear(),0,0);
const day=Math.floor((eastern-start)/86400000);
const data=JSON.parse(await fs.readFile('daily-data.json','utf8'));
const entry=data[String(day)];
if(!entry)throw new Error(`No Bible recap found for day ${day}`);

const scripture=entry.scripture||`Day ${day}`;
const source=Array.isArray(entry.summary)?entry.summary.map(String):[];
const takeaway=entry.takeaway||'God is faithful, good, and worthy of our trust.';
const refs=scripture.split(';').map(x=>x.trim()).filter(Boolean);

function words(s){return String(s||'').trim().split(/\s+/).filter(Boolean)}
function clip(text,maxWords){
  const w=words(text);
  if(w.length<=maxWords)return text;
  return w.slice(0,maxWords).join(' ').replace(/[,:;]?$/,'')+'…';
}
function chapterText(ref,index){
  const exact=source.filter(p=>p.toLowerCase().includes(ref.toLowerCase()));
  if(exact.length)return exact.join(' ');
  // update-daily writes an intro first, then chapter-content chunks in reference order.
  const content=source.filter(p=>!/today we('|’)re reading/i.test(p)&&!/important thing is to connect/i.test(p));
  if(!refs.length)return content.join(' ');
  const size=Math.max(1,Math.ceil(content.length/refs.length));
  return content.slice(index*size,(index+1)*size).join(' ');
}
function adapt(text,band){
  let s=String(text||'').replace(/\s+/g,' ').trim();
  if(band==='little')s=s.replace(/Nebuchadnezzar/g,'King Nebuchadnezzar').replace(/desolation/g,'time when the city was empty and broken');
  const limits={little:65,early:75,middle:85,preteen:95,teen:105};
  return clip(s,limits[band]);
}
function build(band,label,title){
  const chapters=refs.map((ref,i)=>({
    reference:ref,
    readTime:'about 30 sec',
    summary:adapt(chapterText(ref,i),band)
  }));
  return {ageLabel:label,title,chapters,summary:chapters.map(c=>`${c.reference} — ${c.summary}`),takeaway};
}

entry.ageSummaries={
  little:build('little','Ages 3–5 · about 30 sec per chapter',`God’s story in ${scripture}`),
  early:build('early','Ages 6–8 · about 30 sec per chapter',`What happens in ${scripture}?`),
  middle:build('middle','Ages 9–11 · about 30 sec per chapter',`Understanding ${scripture}`),
  preteen:build('preteen','Ages 12–14 · about 30 sec per chapter',`${scripture}: what happened and why it matters`),
  teen:build('teen','Ages 15+ · about 30 sec per chapter',`${scripture}: chapter-by-chapter recap`)
};

data[String(day)]=entry;
await fs.writeFile('daily-data.json',JSON.stringify(data,null,2)+'\n');
console.log(`Built five age-specific chapter-by-chapter Bible recaps for Day ${day}.`);
