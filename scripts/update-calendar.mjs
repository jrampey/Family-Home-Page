import fs from "node:fs/promises";

let calendarUrl = process.env.APPLE_CALENDAR_URL;

if (!calendarUrl) {
  throw new Error("APPLE_CALENDAR_URL is not configured");
}

calendarUrl = calendarUrl.replace(/^webcal:\/\//i, "https://");

const response = await fetch(calendarUrl, {
  headers: { "User-Agent": "Family-Home-Page/1.0" }
});

if (!response.ok) {
  throw new Error(`Calendar returned ${response.status}`);
}

const raw = (await response.text()).replace(/\r?\n[ \t]/g, "");

function value(block, key) {
  const match = block.match(
    new RegExp("(?:^|\\n)" + key + "(?:;[^:]*)?:(.*)", "i")
  );

  return match
    ? match[1]
        .trim()
        .replace(/\\n/g, " ")
        .replace(/\\,/g, ",")
        .replace(/\\;/g, ";")
        .replace(/\\\\/g, "\\")
    : "";
}

function parseDate(v) {
  if (!v) return null;

  if (/^\d{8}$/.test(v)) {
    return new Date(
      Number(v.slice(0, 4)),
      Number(v.slice(4, 6)) - 1,
      Number(v.slice(6, 8))
    );
  }

  const utc = v.endsWith("Z");
  const x = v.replace(/Z$/, "");

  const parts = [
    Number(x.slice(0, 4)),
    Number(x.slice(4, 6)) - 1,
    Number(x.slice(6, 8)),
    Number(x.slice(9, 11)) || 0,
    Number(x.slice(11, 13)) || 0,
    Number(x.slice(13, 15)) || 0
  ];

  return utc
    ? new Date(Date.UTC(...parts))
    : new Date(...parts);
}

/*
 * Only publish:
 * yesterday + today + tomorrow
 */

const today = new Date();
today.setHours(0, 0, 0, 0);

const windowStart = new Date(today);
windowStart.setDate(windowStart.getDate() - 1);

const windowEnd = new Date(today);
windowEnd.setDate(windowEnd.getDate() + 2);

const events = [...raw.matchAll(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/g)]
  .map(match => {
    const block = match[1];

    const startRaw = value(block, "DTSTART");
    const endRaw = value(block, "DTEND");

    const start = parseDate(startRaw);
    const end = parseDate(endRaw);

    return {
      title: value(block, "SUMMARY") || "Untitled event",
      start,
      end,
      allDay: /^\d{8}$/.test(startRaw)
    };
  })
  .filter(event => {
    if (!event.start) return false;

    const eventEnd =
      event.end || new Date(event.start.getTime() + 1);

    return (
      event.start < windowEnd &&
      eventEnd > windowStart
    );
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
  JSON.stringify(
    {
      updated: new Date().toISOString(),
      events
    },
    null,
    2
  ) + "\n"
);

console.log(
  `Published ${events.length} events for yesterday, today and tomorrow.`
);