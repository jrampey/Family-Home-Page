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

const detailedRecaps = {
  256: [
    "Daniel and his friends were taken from Judah to Babylon after their homeland was conquered. They were chosen for special training in the king's court and were given Babylonian names, food, and education. Daniel decided that even though he was far from home, he would still honor God. He asked for vegetables and water instead of the king's food. God gave Daniel, Shadrach, Meshach, and Abednego wisdom and understanding, and when the king tested them, he found them far wiser than the other young men.",
    "Then King Nebuchadnezzar had a terrifying dream, but he refused to tell his wise men what it was. He demanded that they tell him both the dream and its meaning. No one could do that on their own. Daniel asked his friends to pray, and God revealed the mystery to him. Daniel thanked and praised God before going to the king. He explained the dream of a giant statue made from different materials and told the king that earthly kingdoms would rise and fall, but God's kingdom would one day overcome them all and last forever.",
    "Later Nebuchadnezzar built an enormous golden statue and ordered everyone to bow down when the music played. Shadrach, Meshach, and Abednego refused because they would worship God alone. The king threatened to throw them into a blazing furnace. They answered that God was able to rescue them, but even if He did not, they still would not worship the statue. The furious king had them thrown into the fire, but God protected them. The king saw four figures walking in the furnace, and the three friends came out unharmed without even smelling like smoke.",
    "These chapters show what faithfulness can look like when God's people are surrounded by pressure to live differently. Daniel and his friends were respectful, wise, and courageous, but they would not compromise their worship of God. They did not always know how God would rescue them. Their confidence came from knowing who God is: wiser than the king's advisers, greater than every kingdom, and present with His people even in the fire."
  ],
  257: [
    "King Nebuchadnezzar dreamed of an enormous tree that was cut down. Daniel explained that the tree represented the king. Nebuchadnezzar had become proud of his power, so he would lose his position and live like an animal until he understood that the Most High rules over every human kingdom. The warning came true. Later, when Nebuchadnezzar finally humbled himself and honored God, his understanding and kingdom were restored.",
    "Years later King Belshazzar held a huge feast and used sacred cups that had been taken from God's temple in Jerusalem. While the guests praised false gods, a mysterious hand appeared and wrote on the wall. Daniel was called to explain it. He reminded Belshazzar that he knew what had happened to Nebuchadnezzar but had still refused to humble himself. Daniel said God had numbered Belshazzar's kingdom and that it was about to end. That very night Babylon fell and Belshazzar was killed.",
    "Daniel continued serving under a new government and became so trustworthy that jealous officials searched for a way to accuse him. They could find nothing wrong, so they targeted his faith. They convinced the king to make a law saying that no one could pray to anyone except the king for thirty days. Daniel knew about the law, but he continued praying to God as he always had. He was thrown into a den of lions, but God sent an angel and shut the lions' mouths. Daniel was lifted out unharmed.",
    "Daniel 4–6 repeats an important lesson in several different ways: kings and governments can seem incredibly powerful, but God is greater. Pride brought rulers down, while Daniel remained steady through changing kingdoms because his loyalty belonged to God. His story teaches us that faithfulness is not something we practice only when it is easy or popular."
  ],
  258: [
    "Daniel received strange and frightening visions of beasts, horns, battles, and kingdoms. These pictures represented rulers and empires that would rise and eventually fall. In the middle of all the chaos, Daniel saw the Ancient of Days—God—seated on His throne. The vision reminded Daniel that history might look out of control from a human point of view, but God never loses His authority.",
    "Daniel also saw someone described as 'one like a son of man' coming before God and receiving authority, glory, and a kingdom that would never be destroyed. This became an especially important biblical image because Jesus later called Himself the Son of Man. Human kingdoms in Daniel's visions were temporary, but this kingdom would last forever.",
    "Daniel then read Jeremiah's prophecy and realized that Jerusalem's long period of desolation was nearing its promised end. Instead of simply celebrating, Daniel prayed. He confessed the sins of Israel, admitted that God's judgment had been just, remembered God's mercy, and begged Him to restore Jerusalem. Daniel included himself with his people rather than acting as though everyone else's sin was the problem.",
    "The angel Gabriel came with another message about God's future plan. Some parts of these visions are difficult to understand, even for adults, but their main message is much clearer: evil kingdoms do not rule forever, God hears the prayers of His people, and His rescue plan continues even when history feels frightening or confusing."
  ],
  259: [
    "Daniel spent weeks mourning and praying before receiving another overwhelming vision. The heavenly messenger he saw was so powerful that Daniel lost his strength. The messenger comforted him and explained that Daniel's prayer had been heard from the very beginning. Daniel learned that struggles were happening in the spiritual realm that he could not see with his eyes.",
    "The messenger described future conflicts among kings and nations. One ruler after another would fight for power, make alliances, break promises, and eventually disappear. The details are complicated, but they showed Daniel something important: none of these future events would surprise God. God already knew the rise and fall of rulers long before Daniel could see them happen.",
    "Daniel's final vision looked beyond political struggles toward an even greater hope. A time of terrible trouble would come, but God's people would ultimately be delivered. Daniel was told about the dead awakening, with some receiving everlasting life. Those who were wise and faithful were pictured shining brightly. The book therefore ends by looking beyond Daniel's own lifetime toward God's final victory.",
    "Daniel still did not understand every detail, and God did not answer every question he had. Instead, Daniel was told to continue faithfully until the end. That is part of the lesson for us too. Faith does not mean knowing exactly how everything will happen. We can trust God because He knows the future, hears prayer, rules over history, and promises that evil and suffering will not have the final word."
  ]
};

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
  `Today we're reading ${scripture}. ${theme[0]} Start by noticing the main people, places, and problem in the passage. Pay attention to what has changed since the previous reading and why these events matter in the larger story of God's people.`,
  "Follow the key events in order. Notice the decisions people make, the reasons behind those choices, and the consequences that follow. When the passage includes conflict, commands, warnings, promises, or rescue, ask what those details show about the human heart and about God's character.",
  "Look especially for what God says, does, promises, allows, judges, or restores. The Bible's stories are not simply examples about being good; they reveal who God is and show His rescue plan unfolding across generations. Connect today's events with promises and problems that appeared earlier in the Bible.",
  "After reading, retell the major events in your own words and name the most important turning point. Then ask: What did the people learn about God? What do we learn about His faithfulness, holiness, justice, mercy, wisdom, or power? What truth from this passage should our family remember today?"
];

let data = {};
try { data = JSON.parse(await fs.readFile('daily-data.json', 'utf8')); } catch {}
const summary = detailedRecaps[day] || genericSummary;
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
