# Personal runtime storage

This directory documents the runtime-only `personal/` folder. The real `personal/` directory is ignored by Git and is created automatically by `server.mjs` when the application starts.

A fresh deployment does **not** need a pre-created database. Initial startup creates:

- `personal/family-home.sqlite`
- the SQLite schema
- a generic `Default` profile
- default application settings

Profiles, birthdays, family settings, favorite websites, and calendar events belong in that SQLite database rather than tracked project files.

To reset a deployment to a clean state, stop the application, back up anything wanted, remove `personal/`, and restart. The application recreates the required storage automatically.

Do not place real personal information in `personal.example/`; it is intentionally safe to keep in the public repository.