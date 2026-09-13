# Family Home Page

A child-first family dashboard designed to help kids understand **what is coming up** and **what they can learn or do independently today**.

The project combines a simple family agenda with age-appropriate Christian Bible learning and is intended to grow into a safe home base children can use themselves on a phone, tablet, or family display.

> For detailed development context, architecture decisions, product direction, and handoff instructions for future ChatGPT/Codex sessions, read [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) before making changes.

## Product goals

Family Home Page is intentionally different from a traditional parent dashboard. Children are the primary audience for everyday UX decisions.

The page should help a child answer:

1. **What is happening today and what is coming next?**
2. **What can I learn or do by myself?**

Features should favor independence, clear language, large/simple interactions, age-appropriate content, and useful information over dashboard clutter.

## Current features

### Family calendar

The homepage presents the family's near-term Apple Calendar as three easy-to-understand sections:

- **Yesterday**
- **Today**
- **Tomorrow**

The day headings are deliberately more prominent than individual events so children can quickly understand where they are in the week and what is coming next.

Calendar events are processed in Eastern Time (`America/New_York`). The browser never needs the private calendar feed URL.

### Daily Bible Recap for kids

The Bible section follows the current day of The Bible Recap reading plan and provides:

- today's Scripture reading;
- Bible.com link;
- YouTube recap link/search;
- annual reading-plan progress;
- age-aware kid-friendly summary;
- memorable big idea/takeaway;
- **Read aloud** support using the browser's built-in speech synthesis.

Daily kid-friendly summaries are intended to take roughly **2–3 minutes** to read and emphasize the actual events in the passage: important people, conflicts, decisions, consequences, what God does, and what the passage teaches about His character.

### Child profile

A child's name and birthday can be configured locally. The birthday is used to calculate age automatically and tailor Bible content to an appropriate age band.

Current age bands are approximately:

- 3–5
- 6–8
- 9–11
- 12–14
- 15+

### Parent settings gate

Normal child-facing features require no configuration. The Settings area is treated as a parent/admin surface and is protected by a simple **grown-up math challenge** before it opens.

This is a lightweight child deterrent similar to the parent gates commonly used in children's apps. It is intentionally **not a security/authentication system**; its purpose is to prevent accidental or casual settings changes by young children.

## Architecture

The application is intentionally lightweight and currently runs as a static GitHub Pages site without an application backend or OpenAI API dependency.

### Calendar flow

```text
Apple public ICS feed
        ↓
GitHub Actions secret: APPLE_CALENDAR_URL
        ↓
scripts/update-calendar.mjs
        ↓
Sanitized calendar-data.json
        ↓
GitHub Pages frontend
```

Only a small near-term calendar window is published. Do not commit the Apple Calendar feed URL or other secret/bearer-like values.

### Bible flow

```text
The Bible Recap reading plan
        ↓
scripts/update-daily.mjs
        ↓
daily-data.json
        ↓
app.js age-aware presentation
        ↓
Kid-friendly homepage recap
```

### Automation

`.github/workflows/daily-bible-recap.yml` updates generated Bible and calendar data and commits changes when necessary.

## Important files

| File | Purpose |
| --- | --- |
| `PROJECT_CONTEXT.md` | Source-of-context handoff for future development sessions |
| `index.html` | Main interface, calendar, settings, and read-aloud controls |
| `app.js` | Daily Bible presentation and age-aware behavior |
| `daily-data.json` | Generated daily Bible recap data |
| `calendar-data.json` | Sanitized near-term calendar events |
| `scripts/update-daily.mjs` | Daily Bible data generator |
| `scripts/update-calendar.mjs` | Apple Calendar parser/recurrence processor |
| `.github/workflows/daily-bible-recap.yml` | Scheduled data refresh workflow |
| `favicon.svg` | Site icon |

## Product direction

The long-term goal is for the homepage to become a safe, simple place where children can increasingly manage appropriate parts of their day and teach themselves useful things.

Possible future areas include child-specific schedules, activity preparation, routines, chores, homeschool activities, reading/phonics, math practice, educational videos, quizzes, read-aloud learning, daily goals, and simple progress indicators.

The project should **not** become a dense school LMS or adult productivity dashboard. A useful design test is:

> Does this help a child understand their day, prepare for what is coming, learn something useful, practice a skill, participate in family life, or do something appropriate without needing an adult to guide every step?

If not, it probably does not belong on the primary child-facing homepage.

## Privacy

The site may be publicly accessible through GitHub Pages, so anything delivered to the frontend should be treated as potentially public.

Do not publish calendar feed URLs, credentials, private notes, sensitive family information, addresses, medical information, or unnecessarily long calendar histories. If the project eventually needs genuinely private family data, move those features behind authenticated infrastructure rather than placing the data in the static site.

## Continuing development

Before changing the project in a new ChatGPT/Codex conversation:

1. Read `PROJECT_CONTEXT.md`.
2. Inspect the current repository files.
3. Treat the repository as the source of truth for implementation details.
4. Preserve the child-first product vision.
5. Consider scheduled workflow impact when changing generators or generated data.
6. Keep parent configuration separate from normal child use.
