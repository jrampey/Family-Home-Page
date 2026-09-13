import fs from 'node:fs/promises';

const now = new Date();
const eastern = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
const start = new Date(eastern.getFullYear(), 0, 0);
const day = Math.floor((eastern - start) / 86400000);
const birth = new Date('2018-11-07T12:00:00');
let age = eastern.getFullYear() - birth.getFullYear();
if (eastern.getMonth() < birth.getMonth() || (eastern.getMonth() === birth.getMonth() && eastern.getDate() < birth.getDate())) age--;

const planUrl = `https://www.bible.com/reading-plans/42399-the-bible-recap-with-tara-leigh-cobble/day/${day}`;
const page = await fetch(planUrl, { headers: { 'user-agent': 'Family-Home-Page/1.0' } });
if (!page.ok) throw new Error(`Bible.com returned ${page.status}`);
const html = await page.text();

const clean = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const books = ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalm','Psalms','Proverbs','Ecclesiastes','Song of Songs','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'];
const escaped = books.map(x => x.replace(/ /g, '\\s+')).join('|');
const matches = [...clean.matchAll(new RegExp(`(?:${escaped})\\s+\\d+(?::\\d+(?:[-–]\\d+)?)?`, 'gi'))].map(m => m[0]);
const scripture = [...new Set(matches)].slice(0, 12).join('; ') || `The Bible Recap — Day ${day}`;

let data = {};
try { data = JSON.parse(await fs.readFile('daily-data.json', 'utf8')); } catch {}
const previous = data[String(day)] || {};

let generated = null;
if (process.env.OPENAI_API_KEY) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-5.6',
      input: `Create an original Christian Bible recap for Ava, age ${age}, based only on this reading reference: ${scripture}. Return strict JSON with keys title (short string), summary (array of 3 short age-appropriate paragraphs), and takeaway (1-2 sentences). Do not quote or imitate The Bible Recap. Avoid graphic detail while remaining faithful to Scripture.`
    })
  });
  if (!response.ok) throw new Error(`OpenAI returned ${response.status}: ${await response.text()}`);
  const result = await response.json();
  const text = result.output?.flatMap(x => x.content || []).find(x => x.type === 'output_text')?.text;
  if (text) generated = JSON.parse(text.replace(/^```json\s*|\s*```$/g, ''));
}

data[String(day)] = {
  ...previous,
  scripture,
  bibleUrl: planUrl,
  updated: eastern.toISOString().slice(0,10),
  ...(generated || {})
};
await fs.writeFile('daily-data.json', JSON.stringify(data, null, 2) + '\n');
console.log(`Updated Day ${day}: ${scripture}`);
