# Family Home Page

A child-first family dashboard designed to help kids understand **what is coming up** and **what they can learn or do independently today**.

The project combines a simple family agenda with age-appropriate Christian Bible learning and is intended to grow into a safe home base children can use themselves on a phone, tablet, or family display.

> For detailed development context and handoff instructions, read [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) before making changes.

## Product goals

The page should help a child answer:

1. **What is happening today and what is coming next?**
2. **What can I learn or do by myself?**

Features favor independence, clear language, large/simple interactions, age-appropriate content, and useful information over dashboard clutter.

## Current features

### Lightweight child profiles

Profiles are simple viewing contexts rather than accounts. Switching profiles leaves the family calendar, layout, daily Bible passage, and core experience shared while changing the small pieces that need personalization.

Each profile currently includes:

- name;
- birthday / calculated age;
- age band for summaries;
- gender (`male` or `female`);
- optional profile-specific learning/embed link.

Children can switch profiles from the homepage. Profile creation/editing remains a grown-up setting.

Profiles also have rare playful Easter eggs. A male profile may occasionally see a cute dinosaur run across the screen; a female profile may occasionally see a calico kitten. These are deliberately randomized, non-interactive surprises rather than constant animations.

### Family calendar

The homepage presents the family's near-term Apple Calendar as **Yesterday**, **Today**, and **Tomorrow**. Day headings are deliberately more prominent than individual events so children can quickly understand what is happening and what comes next.

Calendar events are processed in Eastern Time (`America/New_York`).

### Daily Bible Recap for kids

The Bible section follows the current day of The Bible Recap reading plan and provides today's Scripture, Bible.com and recap links, annual progress, an age-aware kid-friendly summary, a big idea/takeaway, and **Read aloud** support.

Daily summaries target roughly a **2–3 minute read** and emphasize the actual events of the passage: people, conflicts, decisions, consequences, what God does, and what the passage teaches about His character.

Current age bands are approximately 3–5, 6–8, 9–11, 12–14, and 15+.

### Parent settings gate

Normal child-facing features require no configuration. Settings are protected by a simple randomized **grown-up math challenge**. This is a lightweight child deterrent, not authentication or a security boundary.

## Architecture

The application is intentionally lightweight and runs as a static GitHub Pages site without an application backend or OpenAI API dependency.

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

Only a small near-term calendar window is published. Never commit the Apple Calendar feed URL or other secret/bearer-like values.

### Bible flow

```text
The Bible Recap reading plan
        ↓
scripts/update-daily.mjs
        ↓
daily-data.json
        ↓
app.js age/profile-aware presentation
        ↓
Kid-friendly homepage recap
```

### Automation

`.github/workflows/daily-bible-recap.yml` updates generated Bible and calendar data and commits changes when necessary.

## Important files

| File | Purpose |
| --- | --- |
| `PROJECT_CONTEXT.md` | Source-of-context handoff for future development sessions |
| `index.html` | Main interface, calendar, parent gate/settings, and read-aloud controls |
| `app.js` | Profiles, Easter eggs, Bible presentation, and age-aware behavior |
| `daily-data.json` | Generated daily Bible recap data |
| `calendar-data.json` | Sanitized near-term calendar events |
| `scripts/update-daily.mjs` | Daily Bible data generator |
| `scripts/update-calendar.mjs` | Apple Calendar parser/recurrence processor |
| `.github/workflows/daily-bible-recap.yml` | Scheduled data refresh workflow |
| `favicon.svg` | Site icon |

## Product direction

The long-term goal is a safe, simple place where children can increasingly manage appropriate parts of their day and teach themselves useful things. Profiles should remain lightweight: primarily age-band presentation and child-specific learning/embed links, not separate accounts or substantially different dashboards.

Possible future areas include child-relevant schedules, activity preparation, routines, chores, homeschool activities, reading/phonics, math practice, educational videos, quizzes, read-aloud learning, daily goals, and simple progress indicators.

The project should **not** become a dense school LMS or adult productivity dashboard.

> Does this help a child understand their day, prepare for what is coming, learn something useful, practice a skill, participate in family life, or do something appropriate without needing an adult to guide every step?

If not, it probably does not belong on the primary child-facing homepage.

## Privacy

The site may be publicly accessible through GitHub Pages, so anything delivered to the frontend should be treated as potentially public. Do not publish calendar feed URLs, credentials, private notes, sensitive family information, addresses, medical information, or unnecessarily long calendar histories.

## Continuing development

1. Read `PROJECT_CONTEXT.md`.
2. Inspect the current repository files.
3. Treat repository code as the implementation source of truth.
4. Preserve the child-first, lightweight-profile vision.
5. Consider scheduled workflow impact when changing generators/data.
6. Keep parent configuration separate from normal child use.
