# Game Tracker

A private list of the games I've played and still want to play, at
https://gametracker.cardboardfrenzy.com.

It runs entirely on Cloudflare's free plan: a Worker serves the app and passes API requests to a
Durable Object, the data lives in a D1 database (SQLite), and an R2 bucket holds daily backups and
cached API responses.

## How it fits together

```
client/   React app, built with webpack into client/public
worker/   Cloudflare Worker: serves client/public and the GraphQL API at /api
```

- **GraphQL API** (`worker/src`). GraphQL Yoga with the same schema the old Express server had, so
  the client didn't change. Mutations need the admin key in the `X-Auth-Key` header.
- **One Durable Object for the API** (`worker/src/api.js`). A Worker on the free plan may only use
  10 ms of CPU time per request and gets cut off if it uses more too often. A Durable Object may use
  far more, which computing the list of games (about 200 ms), the daily backup and the auto-fill
  requests need. So the Worker only passes `/api` requests on to the Durable Object.
- **D1 database** (`worker/migrations`). The tables of the old Postgres database, translated to
  SQLite. Rows come back in the order they were added, which is the order the old server returned
  them in, e.g. the genres of a game.
- **Cached responses.** Answering the list query computes over 3 MB of JSON from thousands of rows.
  So the response is stored in R2 and served from there until the data changes: every mutation
  bumps a version number in the database, and responses are stored under the version they were
  computed from (and the deployed version of the worker). The first page load after a change
  computes the response again, which takes about a second (a cached one about a third of that).
- **Daily backups.** At 03:00 UTC, the worker writes every table to `backups/<date>.json` in R2
  and keeps the last 30 days.
- **Auto-fill** (`worker/src/services`). Asks Gemini, YouTube, HowLongToBeat and Metacritic for a
  game's details when adding a game or DLC.

## Admin access

Open the app once with `?adminKey=<ADMIN_KEY>`. The browser keeps the key (in localStorage) and
removes it from the address bar.

## Development

You need Node 22 and yarn 1. Install everything once:

```bash
cd worker && yarn setup
```

Put the keys into `worker/.dev.vars` (ignored by git):

```
ADMIN_KEY=whatever-you-like
AI_API_KEY=...
YOU_TUBE_API_KEY=...
```

The local database starts empty. Create its tables and copy the real data into it:

```bash
cd worker && npx wrangler d1 migrations apply gametracker --local && yarn backup
```

```bash
cd worker && node scripts/import.js ../backups/<the file yarn backup wrote> --local
```

Then run the worker and the webpack dev server in two terminals:

```bash
cd worker && yarn dev
```

```bash
cd client && yarn dev
```

Open http://localhost:5931/?adminKey=whatever-you-like. The dev server forwards `/api` to the
worker on port 8787. The local database lives in `worker/.wrangler`, so it survives restarts.

### Tests

```bash
cd worker && yarn test
```

The tests start the worker with `wrangler dev` and an empty database, and go through the API like
the client does: adding, changing and deleting games and everything around them, the cache, and a
daily backup that is restored into another database and compared. Set `SHOW_WORKER_LOGS=1` to see
the worker's output.

## Deployment

```bash
cd worker && yarn deploy
```

This builds the client into `client/public` and uploads it together with the worker. The first time,
log in with `npx wrangler login`.

To change the database schema, add a file to `worker/migrations` and apply it before deploying:

```bash
cd worker && npx wrangler d1 migrations apply gametracker --remote
```

The keys are stored as secrets, e.g. `npx wrangler secret put ADMIN_KEY` in `worker/`.

## Backups and restoring

There are three ways back, from the most recent to the most manual:

1. **Time Travel.** D1 can restore the database to any minute of the last 7 days (30 on the paid
   plan):

   ```bash
   cd worker && npx wrangler d1 time-travel restore gametracker --timestamp=2026-10-08T12:00:00Z
   ```

2. **Daily backups in R2** (the last 30 days). Download one, write it into the database and check
   that everything arrived:

   ```bash
   cd worker && npx wrangler r2 object get gametracker/backups/2026-10-08.json --remote --file ../backups/2026-10-08.json
   ```

   ```bash
   cd worker && node scripts/import.js ../backups/2026-10-08.json --remote --replace
   ```

   ```bash
   cd worker && node scripts/verify.js ../backups/2026-10-08.json --remote
   ```

3. **Copies on this computer.** `yarn backup` in `worker/` saves the current state of the database
   in `backups/` (ignored by git), in the same format. Restore it like a daily backup.

`import.js` refuses to write into a database that already has games in it, unless `--replace` is
passed. `verify.js` compares every row and column, and the order of the rows.

## Free plan limits

The daily limits reset at midnight UTC.

- 100,000 Worker requests and 100,000 Durable Object requests per day. Loading the app is one of
  each (static files don't count).
- Durable Objects are billed for the time they are busy: 13,000 GB-s per day, which is a lot of
  page loads and auto-fills (each auto-fill takes about 20 seconds, mostly waiting).
- D1: 5 million rows read and 100,000 rows written per day, 500 MB per database. Computing the list
  reads about 7,000 rows, a cached response reads one.
- R2: 10 GB of storage. A backup is about 3 MB, so the 30 daily backups take about 100 MB.

Usage shows up under Workers & Pages → gametracker → Metrics, and Storage & Databases → D1.

## Moving from Heroku (done on 2026-10-08)

The app used to be an Express server with Postgres on Heroku (the `completed-games` app). The data
came over like this, so that nothing could get lost:

1. `worker/scripts/export-heroku.sh` dumps the Heroku database into `backups/` (with `pg_dump`,
   using Docker and the Heroku CLI), restores the dump into a throwaway local Postgres, which also
   proves that the dump is complete, and exports every table as JSON in the order of the dump.
2. `node scripts/import.js <export> --remote` writes the export into D1, and
   `node scripts/verify.js <export> --remote` compares every row and column, and their order.
3. The list of games the new API returns was compared with the one from the Heroku app, byte for
   byte.
4. For the switch, the Heroku app went into maintenance mode, so nothing could change anymore. Then
   step 1 ran once more, and `verify.js` confirmed that D1 matched that final export exactly.

The dumps and exports are in `backups/`. The old server is in the git history, up to commit
`84aef56`.
