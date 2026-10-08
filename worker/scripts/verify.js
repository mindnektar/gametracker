// Compares every row and every column of D1 with an export (or a backup), and the order of the
// rows, which is the order the API returns them in:
//
//   node scripts/verify.js <export directory or backup file> --local|--remote
//
// Exits with an error if anything differs.
import { TABLES, describe, primaryKey, query, readSource, target } from './data.js';

const [source, ...args] = process.argv.slice(2);

if (!source) {
    console.error('Usage: node scripts/verify.js <export directory or backup file> --local|--remote');
    process.exit(1);
}

const location = target(args);
const expected = readSource(source);
let problems = 0;

const report = (message) => {
    problems += 1;

    if (problems <= 50) {
        console.error(`  ${message}`);
    }
};

TABLES.forEach((table) => {
    const keyOf = (row) => primaryKey(table).map((column) => row[column]).join('|');
    const rows = query(location, `SELECT * FROM ${table} ORDER BY rowid`);
    const actualRows = new Map(rows.map((row) => [keyOf(row), row]));
    const before = problems;

    if (actualRows.size !== expected[table].length) {
        report(`${table}: ${expected[table].length} rows expected, ${actualRows.size} found`);
    }

    expected[table].forEach((expectedRow) => {
        const key = keyOf(expectedRow);
        const actualRow = actualRows.get(key);

        if (!actualRow) {
            report(`${table} ${key}: missing`);

            return;
        }

        Object.entries(expectedRow).forEach(([column, value]) => {
            if (actualRow[column] !== value) {
                report(`${table} ${key}: ${column} is ${JSON.stringify(actualRow[column])}, expected ${JSON.stringify(value)}`);
            }
        });

        Object.keys(actualRow).filter((column) => !(column in expectedRow)).forEach((column) => {
            report(`${table} ${key}: unexpected column ${column}`);
        });

        actualRows.delete(key);
    });

    actualRows.forEach((row, key) => report(`${table} ${key}: not in the source`));

    if (problems === before && rows.map(keyOf).join() !== expected[table].map(keyOf).join()) {
        report(`${table}: the rows are not in the order of the source`);
    }

    console.log(`${problems === before ? 'OK  ' : 'FAIL'} ${table}: ${expected[table].length} rows`);
});

if (problems > 0) {
    console.error(`\n${problems} differences found${problems > 50 ? ' (first 50 shown)' : ''}`);
    process.exit(1);
}

console.log(`\nEvery row and column matches, in the same order (${describe(location)}).`);
