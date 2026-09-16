# Self-hosted deployment

The self-hosted version stores personal data in `family-home.sqlite`, outside the public web root/repository. The database contains profiles, birthdays, gender, per-profile theme/embed settings, general settings, and synchronized calendar events.

## Fastest deployment: Docker Compose

Requirements: Docker + Docker Compose.

```bash
git clone <your-repository-url>
cd Family-Home-Page
cp .env.example .env
# Edit .env: set ADMIN_API_KEY and APPLE_CALENDAR_URL
docker compose up -d --build
```

Open `http://SERVER-IP:3000`.

The named Docker volume `family-home-data` contains `/data/family-home.sqlite`. Back up that volume/database; it is the only state required to preserve personal data.

## Native Node deployment

Requires Node.js 22+.

```bash
npm install
cp .env.example .env
mkdir -p data
set -a; . ./.env; set +a
npm start
```

Use a reverse proxy such as Caddy/nginx for HTTPS when exposing the site outside your LAN.

## Database initialization

No manual schema step is needed. On first start the server creates the SQLite schema and a generic `Default` profile. No family names, birthdays, or calendar events are seeded in source control.

## Calendar synchronization

Keep `APPLE_CALENDAR_URL` in the server `.env`, never in source control. The existing `scripts/update-calendar.mjs` can fetch/sanitize the ICS feed. Then run:

```bash
node scripts/update-calendar.mjs
node scripts/sync-calendar-to-sqlite.mjs
```

Schedule those commands hourly with cron/systemd on the server. The second command imports the generated calendar window into SQLite. The web application should consume `/api/calendar` rather than a public JSON file.

## Browser-profile migration

Existing installations may still have profiles/settings in browser localStorage. The server exposes `POST /api/migrate-browser` so a migration UI/script can copy those records into SQLite without putting them in Git. After verifying the database, browser-local copies can be cleared.

Expected payload:

```json
{
  "profiles": [{"id":"...","name":"...","birthday":"...","gender":"...","embedUrl":"...","theme":"green"}],
  "activeProfile":"...",
  "settings":{"skylightCalendar":"...","embedUrl":"..."}
}
```

When `ADMIN_API_KEY` is configured, send it in the `x-admin-key` header for write/migration requests.

## Backup / restore

Stop the container/app briefly and copy `family-home.sqlite`, or use SQLite's online backup tooling. To move to a brand-new server: deploy the repository, copy the database into its configured `DATA_DIR`, copy the private `.env`, then start the service. No other personal-data files are required.

## Privacy

Do not commit `.env`, `data/`, SQLite database/WAL files, or generated calendar data. They are ignored by `.gitignore`. If older commits contained personal data, `.gitignore` does not erase Git history; purge/rewrite repository history separately if required.