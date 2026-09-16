# Family Home Page — Project Context

## Purpose
This is the handoff document for future ChatGPT/Codex sessions. Read this file first, then inspect the current repository because the repository is the implementation source of truth. Continue the existing project rather than rebuilding it unless explicitly requested.

## Product vision
**Family Home Page** is a simple, warm, Christian, child-first family dashboard designed primarily for children to use themselves. It should help a child answer:

1. **What is coming up for me and my family?**
2. **What can I learn or do by myself today?**

The long-term goal is a safe home base where children can check schedules, understand what happens next, participate in Bible time, start age-appropriate learning independently, and build useful self-sufficiency without needing a parent to interpret the interface.

## Lightweight profile model
Profiles are lightweight local viewing contexts, not accounts. Each profile can contain a name, birthday/calculated age, age band, gender, theme color, and optional learning/embed link. Children can switch profiles on the homepage; add/edit/delete remains behind the grown-up settings gate.

Profile data is stored only in the browser under `family.profiles`, with `family.activeProfile` identifying the selected profile. **Do not hard-code real family names, birthdays, or other personal profile data in the repository.** A fresh browser receives one generic profile named `Default`. Existing browser profiles and settings must be preserved during upgrades.

### Profile Easter eggs
- `male` → a cute T. rex can run across the bottom of the screen.
- `female` → a calico kitten can run across the bottom of the screen.

A tiny footer trigger can play the Easter egg manually. Random appearances should remain occasional and non-blocking. Gender must not change educational difficulty, abilities, or stereotypes.

## UX principles
- Child first.
- Independence over complexity.
- Yesterday / Today / Tomorrow for near-term schedule information.
- Age-appropriate Bible/learning presentation.
- Calm, simple interface.
- Faith-forward Christian framing.
- Shared family experience with lightweight personalization.

## Current application
Repository: `jrampey/Family-Home-Page`

Default branch: `main`

Static GitHub Pages application with no required OpenAI API/application backend.

Inspect at minimum before changing behavior:
- `index.html`
- `app.js`
- `daily-data.json`
- `calendar-data.json`
- `scripts/update-daily.mjs`
- `.github/workflows/daily-bible-recap.yml`
- `README.md`
- `favicon.svg`

## Current major features

### Profiles
Profiles support add/edit/delete, persistent per-profile theme colors, age-aware summaries, optional learning/embed links, and gender-based Easter eggs. New installs use a generic `Default` profile; never seed real people in source code.

### Family calendar
The UI supports a Yesterday / Today / Tomorrow agenda. Because this repository/site can be public, personal calendar events must not be committed to the repository. `calendar-data.json` should remain free of private family event details unless the hosting/data architecture is changed to a private authenticated solution.

### Daily Bible Recap for kids
Follows the current day of The Bible Recap reading plan and shows the reading, Bible.com link, recap link/search, annual progress, kid-friendly Scripture summary, takeaway, and read-aloud support. Contiguous chapters from the same book should display compactly (for example, `Daniel 1–3`).

Current age bands are approximately 3–5, 6–8, 9–11, 12–14, and 15+.

### Parent settings gate
Settings are protected by a randomized grown-up math challenge. This is a child deterrent, not authentication/security.

## Privacy/security
Treat all committed/static frontend data as public. Never commit real family names, birthdays, addresses, medical information, private notes, calendar tokens, credentials, private event details, or unnecessary family history. Personal profile configuration belongs in browser local storage. Private synchronized data requires authenticated/private infrastructure rather than a public static JSON file.

Existing personal information may still exist in Git history even after it is removed from the current branch; history cleanup is a separate operation.

## Engineering principles
1. Inspect current files before editing.
2. Repository code wins over this document if they differ.
3. Keep the site fast and simple on phones/tablets.
4. Prefer progressive enhancement and graceful failure.
5. Avoid unnecessary APIs/frameworks/dependencies.
6. Keep parent configuration separate from child use.
7. Validate automation scripts before considering changes complete.
8. Never expose credentials or bearer-like URLs.
9. Keep profiles lightweight; do not build an account system.
10. Preserve existing browser-local profiles/settings during upgrades.
11. Do not add personal family data to repository defaults, examples, fixtures, or generated public data.

## Product decision filter
> Does this make it easier for a child to understand their day, prepare for what is coming, learn something useful, practice a skill, participate in family life, or do something appropriate without needing an adult to guide every step?

## Instructions for a new ChatGPT/Codex conversation
1. Read `PROJECT_CONTEXT.md` first.
2. Inspect current repository files.
3. Preserve existing browser-local profiles and settings.
4. Never seed real family information into repository code or data.
5. Preserve the child-first and lightweight-profile vision.
6. Check privacy and workflow implications before committing generated data.
