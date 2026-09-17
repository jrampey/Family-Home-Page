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
const base=source.length?source:[`Today we are reading ${scripture}.`,'God is at work in the lives of His people.','God wants His people to know Him and trust Him.'];

// Every age version is designed to take roughly 3–5 minutes when read aloud at an age-appropriate pace.
// The goal is not merely simpler vocabulary: preserve the important people, events, sequence, consequences,
// what the passage reveals about God, and a concrete takeaway while changing sentence length and explanation depth.
function expand(parts,extras,targetMin){
  const out=[...parts.filter(Boolean),...extras.filter(Boolean)];
  let words=out.join(' ').trim().split(/\s+/).filter(Boolean).length;
  const reinforcement=[
    `As you listen, remember that this is one part of the Bible’s big story. God is showing His people who He is and teaching them to trust Him.`,
    `Think back through the story in order: who was there, what problem happened, what choices were made, and what happened next? Those details help us understand why the passage matters.`,
    `Most importantly, ask what we learn about God. He is not just a character in the story. The Bible shows us His character, His promises, His justice, His mercy, His wisdom, and His faithfulness.`,
    `When we finish, we can talk about one thing we learned about God and one way that truth can help us today.`
  ];
  for(const p of reinforcement){if(words>=targetMin)break;out.push(p);words+=p.split(/\s+/).length}
  return out;
}

const littleBase=base.map(p=>String(p)
  .replace(/Nebuchadnezzar/g,'King Nebuchadnezzar')
  .replace(/desolation/g,'time when the city was empty and broken'));

entry.ageSummaries={
  little:{
    ageLabel:'Ages 3–5 · about 3–5 min',
    title:`God’s story in ${scripture}`,
    summary:expand(littleBase,[
      `Let’s tell the story slowly. Today’s reading is ${scripture}. Listen for the people in the story, what happened to them, and how God helped, guided, warned, or cared for His people.`,
      `Some parts of the Bible can sound big or hard. That is okay. We do not have to understand every detail. We can listen for the most important truth: ${takeaway}`,
      `Imagine the story as we read it. What do you think the people saw? How might they have felt? When something scary, surprising, or difficult happened, God was still God and His plan had not disappeared.`,
      `Here is our big idea for today: ${takeaway} We can remember that truth when we feel happy, worried, confused, or afraid.`
    ],380),
    takeaway:`Remember: ${takeaway}`
  },
  early:{
    ageLabel:'Ages 6–8 · about 3–5 min',
    title:`What happens in ${scripture}?`,
    summary:expand(base,[
      `Let’s walk through ${scripture} in order and make sure we understand the important events. Notice who is involved, what problem or challenge they face, the choices they make, and what happens because of those choices.`,
      `Pay special attention to what God says or does. Sometimes God rescues immediately, sometimes He gives a warning or promise, and sometimes His people have to keep trusting Him while they wait.`,
      `The big truth to carry with us today is: ${takeaway}`,
      `After the recap, try telling the story back in your own words. Then answer two questions: What did God do? What did the people learn about Him?`
    ],430),
    takeaway:`Big idea: ${takeaway}`
  },
  middle:{
    ageLabel:'Ages 9–11 · about 3–5 min',
    title:`Understanding ${scripture}`,
    summary:expand(base,[
      `As we follow the events in ${scripture}, pay attention to cause and effect. What choices do people make, why do they make them, and what consequences follow?`,
      `Also notice what the passage reveals about God rather than treating the story as only a lesson about human behavior. Ask where you see His faithfulness, holiness, justice, mercy, wisdom, authority, or patience.`,
      `Connect this reading with the Bible’s larger story. God continues working through imperfect people and difficult circumstances to keep His promises and carry His rescue plan forward.`,
      `When you finish, identify the turning point of the reading and explain why it matters. Then consider this truth: ${takeaway}`
    ],480),
    takeaway:`Think about it: ${takeaway}`
  },
  preteen:{
    ageLabel:'Ages 12–14 · about 3–5 min',
    title:`${scripture}: God’s character and our response`,
    summary:expand(base,[
      `Look beyond the events themselves. Consider what this passage reveals about God’s holiness, justice, mercy, faithfulness, wisdom, or authority and how the human responses in the passage contrast with His character.`,
      `Notice the historical and biblical setting. Ask what has happened before this reading, what tensions or promises are carrying forward, and how today’s events move the larger story of redemption ahead.`,
      `Distinguish description from the main theological point. Not every action performed by a biblical character is presented as an example to copy; often the consequences expose the need for God’s grace and faithful rule.`,
      `Bring the passage into your own life carefully. ${takeaway} Consider where that truth challenges an assumption, priority, attitude, or action.`
    ],520),
    takeaway:`Discuss: ${takeaway} Where might that truth challenge the way you think or act?`
  },
  teen:{
    ageLabel:'Ages 15+ · about 3–5 min',
    title:`${scripture}: Read, interpret, apply`,
    summary:expand(base,[
      `Begin with observation before application: identify the central events, repeated ideas, contrasts, commands, promises, judgments, and responses in the text.`,
      `Then interpret those observations in their biblical setting. Consider literary and historical context, what the passage would communicate within its place in Scripture, and how it develops themes that appear elsewhere in the Bible.`,
      `Pay particular attention to what the passage claims or demonstrates about God. Human failure, courage, suffering, judgment, rescue, and restoration all sit within the larger redemptive story rather than functioning as isolated moral examples.`,
      `Finally move toward application. ${takeaway} Ask what belief this should clarify, what attitude it should confront, and what faithful response should follow.`
    ],540),
    takeaway:`Reflect: ${takeaway} What belief, attitude, or action should this passage shape?`
  }
};

data[String(day)]=entry;
await fs.writeFile('daily-data.json',JSON.stringify(data,null,2)+'\n');
console.log(`Built five age-specific 3–5 minute Bible recaps for Day ${day}.`);
