#!/bin/bash
# Dumps the Heroku database into backups/, restores the dump into a throwaway local Postgres 17
# (which also proves that the dump is complete) and exports every table as JSON for
# scripts/import.js. Needs Docker and a logged-in Heroku CLI. Prints the export directory.
#
#   scripts/export-heroku.sh               dump Heroku now
#   scripts/export-heroku.sh <dump file>   use an existing dump instead
set -euo pipefail

APP=${HEROKU_APP:-completed-games}
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
STAMP=$(date -u +%Y-%m-%dT%H%M%SZ)
DUMP=${1:-"$ROOT/backups/heroku-$STAMP.dump"}
EXPORT="$ROOT/backups/export-$STAMP"
CONTAINER=gametracker-export-$STAMP

mkdir -p "$ROOT/backups" "$EXPORT"

if [ -z "${1:-}" ]; then
    echo "Dumping $APP..." >&2
    DATABASE_URL=$(heroku config:get DATABASE_URL -a "$APP")
    export DATABASE_URL PGSSLMODE=require
    docker run --rm -e DATABASE_URL -e PGSSLMODE postgres:17-alpine \
        sh -c 'pg_dump "$DATABASE_URL" --format=custom --no-owner --no-privileges' > "$DUMP"
fi

echo "Restoring the dump into a local Postgres..." >&2
docker run -d --name "$CONTAINER" -e POSTGRES_USER=gametracker -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=gametracker \
    postgres:17-alpine >/dev/null
trap 'docker rm -f "$CONTAINER" >/dev/null' EXIT

for _ in $(seq 1 60); do
    docker exec "$CONTAINER" pg_isready -U gametracker -d gametracker >/dev/null 2>&1 && break
    sleep 1
done
sleep 2

# In a single transaction, Postgres appends the rows of each table in the order of the dump.
# Otherwise it may put a short row into the free space of an earlier page, changing the order.
docker exec -i "$CONTAINER" pg_restore -U gametracker -d gametracker --no-owner --no-privileges --single-transaction < "$DUMP"

# Rows are exported in Postgres' storage order, because that's the order the old server returned
# them in, e.g. the list of games or the genres of a game.
echo "Exporting tables..." >&2
TABLES="system developer compilation genre franchise game dlc genre_game_xref game_franchise_xref"
for table in $TABLES; do
    docker exec -e PGTZ=UTC "$CONTAINER" psql -U gametracker -d gametracker -At \
        -c "SELECT coalesce(json_agg(t ORDER BY t.ctid), '[]') FROM $table t" > "$EXPORT/$table.json"
    echo "  $table: $(node -p "JSON.parse(require('fs').readFileSync('$EXPORT/$table.json', 'utf8')).length") rows" >&2
done

# Make sure the export has the rows in the order of the dump: the ids in the dump's data (the first
# column, or the first two in the link tables) have to come in the same order.
echo "Checking the order of the rows..." >&2
docker exec -i "$CONTAINER" pg_restore -f - --data-only < "$DUMP" \
    | awk '/^COPY public\./ { split($2, name, "."); table = name[2]; next } /^\\\.$/ { table = ""; next }
           table != "" { split($0, column, "\t"); print table "\t" column[1] "\t" column[2] }' > "$EXPORT/.dump-order.tsv"
node - "$EXPORT" $TABLES <<'EOF'
const fs = require('fs');
const [dir, ...tables] = process.argv.slice(2);
const dumped = fs.readFileSync(`${dir}/.dump-order.tsv`, 'utf8').trim().split('\n').map((line) => line.split('\t'));

tables.forEach((table) => {
    const width = table.endsWith('_xref') ? 2 : 1;
    const exported = JSON.parse(fs.readFileSync(`${dir}/${table}.json`, 'utf8'))
        .map((row) => Object.values(row).slice(0, width).join('\t'));
    const expected = dumped.filter(([name]) => name === table).map((columns) => columns.slice(1, 1 + width).join('\t'));

    if (exported.join('\n') !== expected.join('\n')) {
        console.error(`The rows of ${table} are not in the order of the dump`);
        process.exit(1);
    }
});
EOF
rm "$EXPORT/.dump-order.tsv"

echo "$EXPORT"
