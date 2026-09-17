import fs from 'node:fs/promises';

const now=new Date();
const eastern=new Date(now.toLocaleString('en-US',{timeZone:'America/New_York'}));
const start=new Date(eastern.getFullYear(),0,0);
const day=Math.floor((eastern-start)/86400000);
const data=JSON.parse(await fs.readFile('daily-data.json','utf8'));
const entry=data[String(day)];
if(!entry)throw new Error(`No Bible recap found for day ${day}`);

const scripture=entry.scripture||`Day ${day}`;
const source=Array.isArray(entry.summary)?entry.summary:[];
const takeaway=entry.takeaway||'God is faithful, good, and worthy of our trust.';
const first=source[0]||`Today we are reading ${scripture}.`;
const second=source[1]||'God is at work in the lives of His people.';
const third=source[2]||'God wants His people to know Him and trust Him.';

function short(text,max=190){const clean=String(text).replace(/\s+/g,' ').trim();if(clean.length<=max)return clean;const cut=clean.slice(0,max);const end=Math.max(cut.lastIndexOf('. '),cut.lastIndexOf('! '),cut.lastIndexOf('? '));return (end>70?cut.slice(0,end+1):cut.replace(/\s+\S*$/,'')+'…')}

entry.ageSummaries={
  little:{
    ageLabel:'Ages 3–5',
    title:`God’s story in ${scripture}`,
    summary:[
      `Today’s Bible story is from ${scripture}. ${short(first,135)}`,
      `The big thing to remember is this: ${takeaway}`,
      'God loves His people and we can listen to Him, trust Him, and talk to Him when we pray.'
    ],
    takeaway:`Remember: ${takeaway}`
  },
  early:{
    ageLabel:'Ages 6–8',
    title:`What happens in ${scripture}?`,
    summary:[
      `Today we’re reading ${scripture}. ${short(first,230)}`,
      short(second,230),
      `As you read, notice what the people choose to do and what God does. The big truth for today is: ${takeaway}`
    ],
    takeaway:`Big idea: ${takeaway}`
  },
  middle:{
    ageLabel:'Ages 9–11',
    title:`Understanding ${scripture}`,
    summary:[
      short(first,330),short(second,330),short(third,330),
      `Think about why the people made their choices and what happened afterward. What does this show about God’s character? ${takeaway}`
    ],
    takeaway:`Think about it: ${takeaway}`
  },
  preteen:{
    ageLabel:'Ages 12–14',
    title:`${scripture}: God’s character and our response`,
    summary:[...source.slice(0,4),`Look beyond the events themselves. Consider what this passage reveals about God’s holiness, justice, mercy, faithfulness, wisdom, or authority, and how it fits into the Bible’s larger story of redemption.`],
    takeaway:`Discuss: ${takeaway} Where might that truth challenge the way you think or act?`
  },
  teen:{
    ageLabel:'Ages 15+',
    title:`${scripture}: Read, interpret, apply`,
    summary:[...source.slice(0,4),`Separate observation from interpretation: what does the text say, what did it mean in its biblical setting, and what principle carries into life today? Consider literary and historical context and how the passage contributes to the Bible’s larger redemptive story.`],
    takeaway:`Reflect: ${takeaway} What belief, attitude, or action should this passage shape?`
  }
};

data[String(day)]=entry;
await fs.writeFile('daily-data.json',JSON.stringify(data,null,2)+'\n');
console.log(`Built five age-specific Bible recaps for Day ${day}.`);
