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
  let s=String(text||'').replace(/^.*?:\s*/,'').replace(/\s+/g,' ').trim();
  s=s
    .replace(/behold/gi,'look')
    .replace(/therefore/gi,'so')
    .replace(/amongst/gi,'among')
    .replace(/Nebuchadnezzar/g,'King Nebuchadnezzar')
    .replace(/desolation/gi,'a time when the city was empty and broken');
  const limits={little:75,early:95,middle:105,preteen:115,teen:125};
  const clipped=clip(s,limits[band]);
  if(band==='little')return `In this chapter, ${clipped.charAt(0).toLowerCase()+clipped.slice(1)}`;
  if(band==='early')return `Here’s what happens: ${clipped.charAt(0).toLowerCase()+clipped.slice(1)}`;
  return clipped;
}
function iconFor(ref,index){
  const book=ref.replace(/\s+\d.*$/,'');
  if(/Psalm/i.test(book))return '🎶';
  return ['📖','🏠','🎉','🧹','🌿','👑','🙏','✨'][index%8];
}
function chapterTitle(ref,text){
  const s=String(text||'').replace(/^.*?:\s*/,'').trim();
  const first=(s.split(/[.!?]/)[0]||'').trim();
  return first ? first.split(/\s+/).slice(0,8).join(' ') : 'What Happens Here';
}
function bigIdeaFor(band,ref){
  if(/Psalm/i.test(ref))return 'We can remember what God has done, trust Him in hard times, and praise Him with joy.';
  if(band==='little')return 'God cares for His people, and we can trust Him.';
  if(band==='early')return 'What people choose matters, and God is faithful through every part of the story.';
  if(band==='middle')return 'God works through ordinary people, difficult choices, and changing circumstances to carry out His purposes.';
  if(band==='preteen')return 'The events of this chapter show why God’s people need more than outward change—they need hearts that keep returning to Him.';
  return 'The chapter’s events point beyond human effort to God’s character, faithfulness, and purposes.';
}
function build(band,label,title){
  const chapters=refs.map((ref,i)=>{
    const raw=chapterText(ref,i);
    return {
      reference:ref,
      icon:iconFor(ref,i),
      heading:chapterTitle(ref,adapt(raw,band)),
      readTime:'about 30 sec',
      summary:adapt(raw,band),
      bigIdea:bigIdeaFor(band,ref)
    };
  });
  return {ageLabel:label,title,chapters,summary:chapters.map(c=>`${c.reference} — ${c.summary}`),takeaway,bigLesson:takeaway};
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
