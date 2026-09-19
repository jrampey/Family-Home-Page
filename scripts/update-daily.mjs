import fs from 'node:fs/promises';

const now = new Date();
const eastern = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
const start = new Date(eastern.getFullYear(), 0, 0);
const day = Math.floor((eastern - start) / 86400000);
const planUrl = `https://www.bible.com/reading-plans/42399-the-bible-recap-with-tara-leigh-cobble/day/${day}`;

const page = await fetch(planUrl, { headers: { 'user-agent': 'Family-Home-Page/1.0' } });
if (!page.ok) throw new Error(`Bible.com returned ${page.status}`);
const html = await page.text();
const clean = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

const books = ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalm','Psalms','Proverbs','Ecclesiastes','Song of Songs','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'];
const escaped = books.map(x => x.replace(/ /g, '\\s+')).join('|');
const matches = [...clean.matchAll(new RegExp(`(?:${escaped})\\s+\\d+(?::\\d+(?:[-–]\\d+)?)?`, 'gi'))].map(m => m[0]);
const scripture = [...new Set(matches)].slice(0, 12).join('; ') || `The Bible Recap — Day ${day}`;

async function fetchScriptureContents(reference) {
  const refs = reference.split(';').map(x => x.trim()).filter(Boolean);
  const chapters = [];
  for (const ref of refs) {
    const url = `https://bible-api.com/${encodeURIComponent(ref)}?translation=web&single_chapter_book_matching=indifferent`;
    const response = await fetch(url, { headers: { 'user-agent': 'Family-Home-Page/1.0' } });
    if (!response.ok) throw new Error(`Scripture API returned ${response.status} for ${ref}`);
    const payload = await response.json();
    const verses = Array.isArray(payload.verses) ? payload.verses : [];
    if (!verses.length) throw new Error(`No Scripture text returned for ${ref}`);
    chapters.push({ reference: payload.reference || ref, verses });
  }
  return chapters;
}

function sentenceText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function summarizeChapter(chapter) {
  const verses = chapter.verses;
  const count = verses.length;
  const groupSize = Math.max(3, Math.ceil(count / 5));
  const groups = [];
  for (let i = 0; i < count; i += groupSize) groups.push(verses.slice(i, i + groupSize));

  return groups.map(group => {
    const first = group[0], last = group[group.length - 1];
    const range = first.verse === last.verse ? `verse ${first.verse}` : `verses ${first.verse}–${last.verse}`;
    const text = sentenceText(group.map(v => v.text).join(' '));
    return `${chapter.reference}, ${range}: ${text}`;
  });
}

const scriptureContents = await fetchScriptureContents(scripture);
const contentSummary = scriptureContents.flatMap(summarizeChapter);

const themes = {
  Daniel: ["God remains in control while Daniel and his friends faithfully follow Him in a foreign land.", "We can choose what is right even when others choose differently because God is with us."],
  Ezra: ["God brings His people home and helps them rebuild worship around Him.", "Putting God first matters when we rebuild and begin again."],
  Nehemiah: ["God helps His people rebuild Jerusalem while Nehemiah leads with prayer, courage, and wisdom.", "Pray, work faithfully, and trust God when a job feels big."],
  Esther: ["God quietly protects His people as Esther courageously uses her position to help others.", "Courage can mean doing the right thing at exactly the right time."],
  Haggai: ["God calls His people to put Him first and encourages them as they rebuild.", "God is with us as we faithfully do the work He gives us."],
  Zechariah: ["God encourages His restored people with promises of cleansing, a coming King, and His future victory.", "God keeps His promises even when His plan is bigger than we can see."],
  Malachi: ["God calls His people back to wholehearted worship and promises a messenger who will prepare the way.", "God wants our hearts, not just outward religious habits."]
};

const key = Object.keys(themes).find(k => scripture.toLowerCase().includes(k.toLowerCase()));
const theme = themes[key] || ["This reading is part of God's big story. Pay attention to the people, their choices, the consequences, and what God reveals about Himself.", "God is faithful, wise, and worthy of our trust."];
const genericSummary = [
  `Today we're reading ${scripture}. The recap below follows the actual contents of the assigned chapters in order.`,
  ...contentSummary,
  `${theme[0]} The important thing is to connect that truth to the events we just read, rather than replacing the story with a generic lesson.`
];

let data = {};
try { data = JSON.parse(await fs.readFile('daily-data.json', 'utf8')); } catch {}
const summary = genericSummary;
data[String(day)] = {
  ...(data[String(day)] || {}),
  scripture,
  bibleUrl: planUrl,
  updated: eastern.toISOString().slice(0, 10),
  title: `What ${scripture} teaches us about God`,
  summary,
  takeaway: theme[1]
};
await fs.writeFile('daily-data.json', JSON.stringify(data, null, 2) + '\n');
console.log(`Updated Day ${day}: ${scripture} with a longer key-event kid recap.`);
