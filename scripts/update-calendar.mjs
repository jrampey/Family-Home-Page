import fs from "node:fs/promises";

const TIME_ZONE = "America/New_York";
let calendarUrl = process.env.APPLE_CALENDAR_URL;

if (!calendarUrl) throw new Error("APPLE_CALENDAR_URL is not configured");
calendarUrl = calendarUrl.replace(/^webcal:\/\//i, "https://");

const response = await fetch(calendarUrl, {
  headers: { "User-Agent": "Family-Home-Page/1.0" }
});
if (!response.ok) throw new Error(`Calendar returned ${response.status}`);

const raw = (await response.text()).replace(/\r?\n[ \t]/g, "");

function property(block, key) {
  const match = block.match(new RegExp(`(?:^|\\n)${key}((?:;[^:]*)?):(.*)`, "i"));
  if (!match) return { params: "", value: "" };
  return { params: match[1] || "", value: match[2].trim() };
}

function textValue(block, key) {
  const { value } = property(block, key);
  return value
    .replace(/\\n/g, " ")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function partsInZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  return Object.fromEntries(parts.filter(p => p.type !== "literal").map(p => [p.type, Number(p.value)]));
}

function easternWallTimeToDate(y, m, d, hh = 0, mm = 0, ss = 0) {
  // Start with the wall-clock fields treated as UTC, then calculate the
  // America/New_York offset for that date. A second pass handles DST edges.
  const desired = Date.UTC(y, m - 1, d, hh, mm, ss);
  let guess = new Date(desired);

  for (let i = 0; i < 2; i++) {
    const p = partsInZone(guess, TIME_ZONE);
    const shown = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    guess = new Date(guess.getTime() + (desired - shown));
  }
  return guess;
}

function parseDate(prop) {
  const v = prop.value;
  if (!v) return null;

  if (/^\d{8}$/.test(v)) {
    return easternWallTimeToDate(
      Number(v.slice(0, 4)), Number(v.slice(4, 6)), Number(v.slice(6, 8))
    );
  }

  const x = v.replace(/Z$/, "");
  const y = Number(x.slice(0, 4));
  const m = Number(x.slice(4, 6));
  const d = Number(x.slice(6, 8));
  const hh = Number(x.slice(9, 11)) || 0;
  const mm = Number(x.slice(11, 13)) || 0;
  const ss = Number(x.slice(13, 15)) || 0;

  // A trailing Z is explicitly UTC. Apple floating times and TZID-based
  // Eastern events are interpreted as America/New_York for this family site.
  if (v.endsWith("Z")) return new Date(Date.UTC(y, m - 1, d, hh, mm, ss));
  return easternWallTimeToDate(y, m, d, hh, mm, ss);
}

function easternDayBounds() {
  const p = partsInZone(new Date(), TIME_ZONE);
  const today = easternWallTimeToDate(p.year, p.month, p.day);
  const yesterdayWall = new Date(Date.UTC(p.year, p.month - 1, p.day - 1));
  const twoDaysWall = new Date(Date.UTC(p.year, p.month - 1, p.day + 2));

  return {
    start: easternWallTimeToDate(
      yesterdayWall.getUTCFullYear(), yesterdayWall.getUTCMonth() + 1, yesterdayWall.getUTCDate()
    ),
    end: easternWallTimeToDate(
      twoDaysWall.getUTCFullYear(), twoDaysWall.getUTCMonth() + 1, twoDaysWall.getUTCDate()
    )
  };
}

const { start: windowStart, end: windowEnd } = easternDayBounds();

const events = [...raw.matchAll(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/g)]
  .map(match => {
    const block = match[1];
    const startProp = property(block, "DTSTART");
    const endProp = property(block, "DTEND");
    const start = parseDate(startProp);
    const end = parseDate(endProp);

    return {
      title: textValue(block, "SUMMARY") || "Untitled event",
      start,
      end,
      allDay: /^\d{8}$/.test(startProp.value)
    };
  })
  .filter(event => {
    if (!event.start) return false;
    const eventEnd = event.end || new Date(event.start.getTime() + 1);
    return event.start < windowEnd && eventEnd > windowStart;
  })
  .sort((a, b) => a.start - b.start)
  .map(event => ({
    title: event.title,
    start: event.start.toISOString(),
    end: event.end?.toISOString() || null,
    allDay: event.allDay
  }));

await fs.writeFile(
  "calendar-data.json",
  JSON.stringify({
    updated: new Date().toISOString(),
    timeZone: TIME_ZONE,
    events
  }, null, 2) + "\n"
);

console.log(`Published ${events.length} events in ${TIME_ZONE} for yesterday, today and tomorrow.`);