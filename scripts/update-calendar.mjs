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
  throw new Error(`Apple Calendar returned ${response.status}`);
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

function parseDate(value) {
  if (!value) return null;

  // All-day event
  if (/^\d{8}$/.test(value)) {
    return new Date(
      Date.UTC(
        Number(value.slice(0, 4)),
        Number(value.slice(4, 6)) - 1,
        Number(value.slice(6, 8))
      )
    );
  }

  const utc = value.endsWith("Z");
  const v = value.replace(/Z$/, "");

  const parts = [
    Number(v.slice(0, 4)),
    Number(v.slice(4, 6)) - 1,
    Number(v.slice(6, 8)),
    Number(v.slice(9, 11)) || 0,
    Number(v.slice(11, 13)) || 0,
    Number(v.slice(13, 15)) || 0
  ];

  return utc
    ? new Date(Date.UTC(...parts))
    : new Date(...parts);
}

const events = [...raw.matchAll(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/g)]
  .map(match => {
    const block = match[1];

    const startRaw = value(block, "DTSTART");
    const endRaw = value(block, "DTEND");

    const start = parseDate(startRaw);
    const end = parseDate(endRaw);

    return {
      title: value(block, "SUMMARY") || "Untitled event",
      start: start?.toISOString() || null,
      end: end?.toISOString() || null,
      allDay: /^\d{8}$/.test(startRaw)
    };
  })
  .filter(event => event.start)
  .sort((a, b) => new Date(a.start) - new Date(b.start));

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

console.log(`Saved ${events.length} Apple Calendar events.`);