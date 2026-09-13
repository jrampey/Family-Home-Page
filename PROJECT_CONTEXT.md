# Family Home Page — Project Context

## Purpose
This is the handoff document for future ChatGPT/Codex sessions. Read this file first, then inspect the current repository because the repository is the implementation source of truth. Continue the existing project rather than rebuilding it unless explicitly requested.

## Product vision
**Family Home Page** is a simple, warm, Christian, child-first family dashboard designed primarily for children to use themselves. It should help a child answer:

1. **What is coming up for me and my family?**
2. **What can I learn or do by myself today?**

The long-term goal is a safe home base where children can check schedules, understand what happens next, participate in Bible time, start age-appropriate learning independently, and build useful self-sufficiency without needing a parent to interpret the interface.

Favor clear labels, obvious actions, large tap targets, friendly language, strong hierarchy, read-aloud support, and low complexity. Parent/admin configuration belongs behind the grown-up settings gate.

## Lightweight profile model
Profiles are intentionally **not accounts**. Do not turn them into authentication, separate user databases, or substantially different versions of the homepage.

A profile is a lightweight viewing context. The shared family calendar, daily Bible passage, layout, and core homepage stay essentially the same. A profile primarily changes:

- child name;
- birthday and calculated age;
- age band used for Bible/learning presentation;
- gender (`male` or `female`);
- profile-specific learning/embed link(s).

Children should be able to switch profiles directly from the normal homepage. Creating, editing, or deleting profiles remains a parent action behind the grown-up math gate.

Current profile data is stored locally in the browser in `family.profiles`, with `family.activeProfile` identifying the selected profile. Legacy `family.childName` / `family.childBirthday` values are maintained for compatibility.

Current default migration/seed behavior creates an Ava profile (female) and Fox profile (male) when no profile collection exists. Do not assume those are the only profiles the architecture will ever support.

### Profile Easter eggs
The homepage has intentionally rare, playful Easter eggs tied to the selected profile's gender:

- `male` → a cute dinosaur may unexpectedly run across the bottom of the screen;
- `female` → a cute calico kitten may unexpectedly run across the bottom of the screen.

These should remain **occasional surprises**, not constant animations. They must not block taps, interrupt reading, obscure the main interface for long, or become a reward loop children feel compelled to trigger. The current implementation limits the surprise to at most once per browser session and uses a randomized chance/delay.

Gender currently exists specifically as simple profile metadata supporting this requested personalization. Avoid using it to unnecessarily change educational content, ability assumptions, colors, difficulty, or other core experiences.

## UX principles
- **Child first:** assume a young child may use the page without an adult beside them.
- **Independence over complexity:** prioritize features children can safely discover/use themselves.
- **Near-term information first:** Yesterday / Today / Tomorrow is the primary calendar mental model.
- **Age appropriate:** adapt reading/learning level using the active profile's age band.
- **Calm and simple:** do not create a dense enterprise dashboard or school LMS.
- **Faith-forward:** Bible learning is a first-class feature and should faithfully explain Scripture.
- **Shared family experience:** profiles personalize only what needs personalization; do not fragment the family dashboard.

## Current application
Repository: `jrampey/Family-Home-Page`

Default branch: `main`

Static GitHub Pages application; intentionally lightweight with no required OpenAI API/application backend.

Inspect at minimum before changing behavior:

- `index.html`
- `app.js`
- `daily-data.json`
- `calendar-data.json`
- `scripts/update-daily.mjs`
- `scripts/update-calendar.mjs`
- `.github/workflows/daily-bible-recap.yml`
- `README.md`
- `favicon.svg`

## Current major features

### Family calendar
Simplified Apple Calendar agenda showing Yesterday / Today / Tomorrow. Day headings should be more prominent than events.

Architecture:

**Apple public ICS → GitHub Actions → `scripts/update-calendar.mjs` → sanitized `calendar-data.json` → GitHub Pages frontend**

Feed URL is stored in GitHub Actions secret `APPLE_CALENDAR_URL`. Never expose it. Calendar processing uses `America/New_York` / Eastern Time. Only a small near-term window should be published.

### Daily Bible Recap for kids
Follows the current day of The Bible Recap reading plan and shows the reading, Bible.com link, YouTube recap link/search, annual progress, kid-friendly Scripture summary, and takeaway.

Daily summaries should be passage-specific and roughly a **2–3 minute read**, covering important people, major events, conflict, decisions, consequences, what God says/does, His character, and connection to the larger biblical story.

Current age bands are approximately 3–5, 6–8, 9–11, 12–14, and 15+.

### Read aloud
The Kid-Friendly Summary includes Read aloud / Stop using browser `speechSynthesis`, with a slightly slower rate appropriate for children. This is a core example of independence-oriented design.

### Parent settings gate
Settings are protected by a simple randomized grown-up math challenge before opening. This is a child deterrent, **not authentication/security**.

Parent settings currently cover profile configuration plus family integrations/placeholders such as Apple Calendar, Skylight, and embeds.

## Automation
`.github/workflows/daily-bible-recap.yml` updates Bible and Apple Calendar generated data and commits changes. Generator changes must be syntax-valid; this workflow has previously failed due to a JavaScript syntax error in the daily generator.

## Learning direction
Future features should help children teach themselves safely and independently. Potential areas include Bible learning, reading/phonics, math, handwriting, educational videos, homeschool activities, goals, quizzes/review, read-aloud content, activity choices, and simple progress indicators.

Prefer the loop:

**See what I can learn → choose it myself → receive simple instruction → practice → know when I am done.**

Profile-specific embedded links are expected to become an important way to surface age-appropriate learning resources without changing the overall homepage experience.

## Calendar direction
Useful future directions include identifying who an event belongs to, child-specific relevance, icons, countdowns, routines, preparation prompts, and simple "what do I need?" checklists. Keep the underlying family calendar shared unless there is a strong reason not to.

## Privacy/security
The repository/site may be publicly accessible through GitHub Pages. Treat frontend/generated data as potentially public.

Never expose calendar tokens, GitHub secrets, addresses, private notes, medical information, school details, or unnecessary long calendar histories. If genuinely private data becomes necessary, use authenticated infrastructure rather than placing it in the static site.

The math parent gate does not make public/static data private.

## Engineering principles
1. Inspect current files before editing.
2. Repository code wins over this document if they differ.
3. Keep the site fast and simple on phones/tablets.
4. Prefer progressive enhancement and graceful failure.
5. Avoid unnecessary APIs/frameworks/dependencies.
6. Keep parent configuration separate from child use.
7. Validate automation scripts before considering changes complete.
8. Preserve Eastern Time behavior unless intentionally changed.
9. Never expose credentials or bearer-like URLs.
10. Keep profiles lightweight; do not accidentally build an account system.
11. Ask whether a feature helps a child know what is coming or learn/do something independently.

## Product decision filter
> Does this make it easier for a child to understand their day, prepare for what is coming, learn something useful, practice a skill, participate in family life, or do something appropriate without needing an adult to guide every step?

If not, it probably should not occupy the primary child-facing homepage.

## Instructions for a new ChatGPT/Codex conversation
1. Read `PROJECT_CONTEXT.md` first.
2. Inspect current repository files.
3. Understand existing behavior before changing it.
4. Preserve the child-first and lightweight-profile vision.
5. Preserve working calendar/Bible automation unless necessary.
6. Check workflow implications when modifying generators/data.
7. Do not make the user re-explain decisions documented here.
8. Continue iteratively from the current implementation.

Core idea:

**Family Home Page should become a safe, simple home base children can use to understand what is coming up and increasingly teach themselves useful things, with lightweight profiles changing only the small pieces that genuinely need to be age- or child-specific.**
