# Family Home Page — Project Context

## Purpose of this file

This file is the handoff document for future ChatGPT/Codex sessions. A brand-new conversation should read this file **before making changes**, then inspect the current repository files because the repository is the source of truth for implementation details.

The project should be continued from the existing implementation rather than rebuilt from scratch unless explicitly requested.

## Product vision

**Family Home Page** is a simple, warm, child-first family dashboard designed primarily for children to use themselves.

The long-term goal is not merely to create a parent dashboard that children happen to see. The interface should help children independently answer two everyday questions:

1. **What is coming up for me and my family?**
2. **What can I learn or do by myself today?**

The product should gradually become a safe home base where a child can check the family schedule, understand what is happening today and next, participate in family Bible time, learn independently, and build age-appropriate self-sufficiency without needing a parent to interpret the interface for them.

When considering new features, actively look for opportunities that help children:

- anticipate upcoming events and routines;
- understand today, tomorrow, and the near future;
- recognize which events apply to them;
- independently start useful learning activities;
- read, listen, watch, practice, or explore at an age-appropriate level;
- develop responsibility and confidence through simple self-service interactions;
- participate in the family's Christian faith and Bible study;
- use technology intentionally rather than simply consume entertainment.

The interface should remain useful to parents, but **children are the primary audience for UX decisions**.

## UX principles

### Child first

Assume a young child may use the page without an adult standing beside them. Prefer clear labels, obvious actions, large tap targets, simple navigation, friendly language, and strong visual hierarchy.

Avoid interfaces that require children to understand technical terms, configuration concepts, dense menus, or complicated workflows.

### Independence over complexity

A feature is especially valuable when it removes the need for a child to ask a parent something they could safely discover or do themselves.

Examples:

- Seeing that cheer, soccer, church, school, or another activity is tomorrow.
- Knowing what time an activity begins.
- Hearing a Bible summary read aloud instead of needing an adult to read it.
- Finding an age-appropriate learning activity and starting it independently.

### Near-term information first

For the calendar, the immediate mental model is **Yesterday / Today / Tomorrow**. These headings should be more visually prominent than individual events. Children should be able to glance at the page and quickly understand what is happening now and what comes next.

### Age appropriate

Content and interaction should adapt when practical to the child's age. The current Bible recap already uses age bands. Future learning features should follow the same philosophy rather than assuming one reading level fits every child.

### Calm and simple

Keep the visual design modern, warm, uncluttered, and family friendly. Do not turn the homepage into a dense enterprise dashboard. New capabilities should be progressively disclosed when possible.

### Faith-forward

The family is Christian. Bible learning is a first-class part of the product rather than a decorative widget. Biblical summaries should be faithful to the text, understandable to children, and focused on helping them know God and understand the events of Scripture.

## Current application

The site is a static GitHub Pages application in:

`jrampey/Family-Home-Page`

Default branch: `main`

The current implementation is intentionally lightweight and does not require an OpenAI API key or application backend.

Before changing behavior, inspect at minimum:

- `index.html`
- `app.js`
- `daily-data.json`
- `calendar-data.json`
- `scripts/update-daily.mjs`
- `scripts/update-calendar.mjs`
- `.github/workflows/daily-bible-recap.yml`
- `favicon.svg`

Do not assume this document contains the newest implementation details if the code differs. **Current repository code wins.**

## Current major features

### 1. Family calendar

The homepage displays a simplified agenda built from the family's Apple Calendar.

The primary presentation is:

- Yesterday
- Today
- Tomorrow

These day headings are intentionally more prominent than the event rows beneath them.

Calendar data is not fetched directly from Apple by the browser. The architecture is:

**Apple public ICS feed → GitHub Actions → `scripts/update-calendar.mjs` → sanitized `calendar-data.json` → GitHub Pages frontend**

The Apple feed URL is stored in the GitHub Actions secret:

`APPLE_CALENDAR_URL`

Never commit or expose the actual calendar URL/token.

Calendar processing uses `America/New_York` / Eastern Time.

The updater currently handles common Apple recurring-event behavior including recurring rules, exclusions, additional dates, recurrence overrides, and cancelled overrides. Inspect the current script before changing recurrence behavior.

Only a small near-term calendar window is intentionally published to the static site rather than the family's entire calendar history.

### 2. Daily Bible Recap for kids

The page determines the current day of the year and follows The Bible Recap reading plan on Bible.com.

The homepage shows:

- current reading/day;
- Bible.com reading link;
- YouTube recap search/link;
- progress through the annual reading plan;
- a kid-friendly Scripture summary;
- a short takeaway/big idea.

The summary should not merely provide a generic devotional thought. It should explain the **important events in the actual chapters** so a child understands what happened.

Target length for the daily kid-friendly recap is approximately a **2–3 minute read**.

Good summaries should cover, where relevant:

- important people;
- major events;
- the central problem or conflict;
- important decisions;
- consequences;
- what God says or does;
- what the passage reveals about God's character;
- how the reading connects to the larger biblical story.

Keep the language understandable for the selected child's age without stripping away meaningful details from Scripture.

### 3. Age-aware child profile

The child name and birthday are stored locally in the browser and used to calculate age.

Current age bands in `app.js` are approximately:

- ages 3–5;
- ages 6–8;
- ages 9–11;
- ages 12–14;
- ages 15+.

The presentation of Bible content changes based on the child's age band.

Do not hard-code product design around one specific child. The current profile may have defaults, but the architecture should increasingly support a family with multiple children.

### 4. Read-aloud Bible summary

The Kid-Friendly Summary card includes a **Read aloud** control.

It currently uses the browser's built-in Web Speech / `speechSynthesis` support, so no external speech API is required.

The experience includes:

- Read aloud;
- Reading state;
- Stop control;
- the summary and takeaway spoken aloud;
- a slightly slower speaking rate suitable for children.

This is an important example of the project's child-independence philosophy: a child who cannot comfortably read the entire recap can still use the feature independently.

### 5. Settings

The settings interface currently includes:

- child profile;
- Apple Calendar connection status;
- placeholder Skylight Calendar URL setting;
- generic embed URL setting.

Settings are primarily a parent/admin surface. Avoid making children interact with settings to use normal daily features.

## Automation

GitHub Actions workflow:

`.github/workflows/daily-bible-recap.yml`

The workflow updates the Bible recap and Apple Calendar data and commits changed generated data back to the repository.

The workflow has previously failed because of JavaScript syntax errors introduced into `scripts/update-daily.mjs`. When modifying generation scripts, be careful with large inline data structures and validate JavaScript syntax before considering the change complete.

## Bible summary generation direction

The current daily updater contains deterministic content/logic rather than relying on a live AI API call.

The desired direction is **specific, detailed, reliable daily Scripture coverage**, not vague template text.

If expanding coverage, prioritize accurate passage-specific summaries. A fallback can exist, but it should not become the normal user experience.

Do not silently fabricate Scripture details. When building or revising summaries, preserve biblical context and distinguish interpretation from events explicitly described by the text.

## Calendar direction

Calendar development should increasingly make schedules understandable to children rather than simply displaying raw calendar events.

Useful future directions include concepts such as:

- identifying which family member an event belongs to;
- child-specific views;
- visual icons for common activities;
- countdowns such as "in 2 days" or "tomorrow";
- simple morning/evening views;
- recurring routine awareness;
- helping children prepare for upcoming activities;
- eventually showing what they need to bring or do before an event.

These are product directions, not requirements to implement all at once.

## Learning direction

The larger product vision extends beyond the Bible recap. Future features should explore ways for children to **teach themselves safely and independently** from the family homepage.

Potential categories include:

- Bible learning;
- reading/phonics;
- math practice;
- handwriting or letter practice;
- age-appropriate educational videos;
- homeschool activities;
- daily or weekly learning goals;
- simple quizzes and review;
- read-aloud content;
- independent activity choices;
- progress or accomplishment indicators that encourage healthy learning habits.

The goal is not to recreate a full school LMS. The homepage should act as an approachable launch point: a child sees what is relevant today and can begin learning with minimal adult setup.

Where possible, design learning features around a loop like:

**See what I can learn → choose it myself → receive simple instruction → practice → know when I am done.**

## Family-dashboard direction

The homepage can grow into a broader child-friendly family operating surface, but additions should earn their space.

Potential future areas include:

- chores/responsibilities;
- routines;
- weather when it affects what children need to wear or bring;
- birthdays and family milestones;
- meal awareness;
- homeschool schedule;
- family announcements;
- simple preparation checklists;
- child-specific encouragement or goals.

Prefer information that changes a child's next action over passive information that merely makes the dashboard look busy.

## Privacy and security

The repository/site may be publicly accessible through GitHub Pages. Treat all generated frontend data as potentially public.

Therefore:

- Never commit private calendar feed URLs or tokens.
- Do not expose secrets from GitHub Actions.
- Minimize calendar information published to `calendar-data.json`.
- Avoid adding sensitive family information simply because it would be technically convenient.
- Think carefully before exposing addresses, private notes, medical information, school details, or long calendar histories.

If future features require genuinely private family data, consider authenticated hosting or a backend rather than pushing increasingly sensitive data into a public static site.

## Engineering principles

1. Inspect current files before editing.
2. Treat the repository as the implementation source of truth.
3. Keep the site fast and simple enough for children to use on phones and tablets.
4. Prefer progressive enhancement and graceful failure.
5. Avoid unnecessary APIs, frameworks, dependencies, and infrastructure.
6. Keep parent configuration separate from the child's everyday experience.
7. Validate automated scripts so a homepage feature does not break scheduled rebuilds.
8. Preserve Eastern Time behavior for family calendar/date logic unless intentionally changed.
9. Never expose credentials, secret URLs, or bearer-like tokens.
10. When proposing features, explicitly consider whether they help a child know **what is coming up** or **learn/do something independently**.

## Product decision filter

Before implementing a new homepage feature, ask:

> Does this make it easier for a child to understand their day, prepare for what is coming, learn something useful, practice a skill, participate in family life, or do something appropriate without needing an adult to guide every step?

If yes, it likely fits the project.

If it primarily adds adult-oriented administration, technical complexity, passive data, or visual clutter, it should probably live behind settings, be simplified, or not be added.

## Instructions for a new ChatGPT/Codex conversation

When a user starts a new conversation about this repository:

1. Read `PROJECT_CONTEXT.md` first.
2. Inspect the current repository structure and relevant files.
3. Understand existing behavior before proposing or making changes.
4. Preserve the child-first product vision.
5. Preserve working calendar/Bible automation unless the requested change requires modifying it.
6. Check scheduled workflow implications whenever changing generated data or scripts.
7. Do not require the user to re-explain decisions already documented here.
8. Continue iteratively from the current implementation.

The core idea to carry forward is:

**Family Home Page should become a safe, simple home base that children can use to understand what is coming up in their lives and increasingly teach themselves useful things.**
