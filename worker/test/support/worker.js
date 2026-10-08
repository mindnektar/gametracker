import { execFileSync, spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import net from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const workerDir = join(dirname(fileURLToPath(import.meta.url)), '../..');

export const ADMIN_KEY = 'test-admin-key';

const env = { ...process.env, WRANGLER_SEND_METRICS: 'false' };

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const wrangler = (args) => execFileSync(join(workerDir, 'node_modules/.bin/wrangler'), args, {
    cwd: workerDir,
    encoding: 'utf8',
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
});

// Runs one of the scripts in scripts/ and returns its exit code and output
export const runScript = (name, args) => {
    try {
        return { code: 0, output: execFileSync('node', [join(workerDir, 'scripts', name), ...args], { cwd: workerDir, encoding: 'utf8', env, stdio: ['ignore', 'pipe', 'pipe'] }) };
    } catch (error) {
        return { code: error.status, output: `${error.stdout}${error.stderr}` };
    }
};

// An empty state directory (database and bucket) with the tables created
export const createState = async () => {
    const dir = await mkdtemp(join(tmpdir(), 'gametracker-test-'));

    wrangler(['d1', 'migrations', 'apply', 'gametracker', '--local', '--persist-to', dir]);

    return dir;
};

const freePort = () => new Promise((resolve, reject) => {
    const server = net.createServer();

    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
        const { port } = server.address();

        server.close(() => resolve(port));
    });
});

// Runs `wrangler dev` with its own state directory and waits until it answers
export const startWorker = async () => {
    const state = await createState();
    const port = await freePort();
    const inspectorPort = await freePort();
    const child = spawn(join(workerDir, 'node_modules/.bin/wrangler'), [
        'dev',
        '--ip', '127.0.0.1',
        '--port', String(port),
        '--inspector-port', String(inspectorPort),
        '--persist-to', state,
        '--show-interactive-dev-session=false',
        '--var', `ADMIN_KEY:${ADMIN_KEY}`,
        // No real API keys, so tests never call Gemini or YouTube
        '--var', 'AI_API_KEY:', '--var', 'YOU_TUBE_API_KEY:',
    ], {
        cwd: workerDir,
        env,
        // Own process group, so stopping it also stops the processes wrangler starts (workerd)
        detached: true,
    });
    let output = '';

    child.stdout.on('data', (data) => { output += data; });
    child.stderr.on('data', (data) => { output += data; });

    const baseUrl = `http://127.0.0.1:${port}`;

    // Sends a GraphQL request, by default with the admin key
    const graphql = async (query, variables = {}, { key = ADMIN_KEY } = {}) => {
        const response = await fetch(`${baseUrl}/api`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(key ? { 'X-Auth-Key': key } : {}) },
            body: JSON.stringify({ query, variables }),
        });

        return { ...(await response.json()), status: response.status, cache: response.headers.get('X-Cache') };
    };

    const stop = async () => {
        try {
            process.kill(-child.pid, 'SIGTERM');
        } catch (error) {
            // Already gone
        }

        await new Promise((resolve) => {
            if (child.exitCode !== null || child.signalCode !== null) {
                resolve();
            } else {
                child.once('exit', resolve);
            }
        });
        await rm(state, { recursive: true, force: true });

        if (process.env.SHOW_WORKER_LOGS) {
            console.log(output);
        }
    };

    for (let attempt = 0; attempt < 150; attempt += 1) {
        try {
            // eslint-disable-next-line no-await-in-loop
            const response = await fetch(`${baseUrl}/api`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: 'query ready($skip: Boolean!) { systems @skip(if: $skip) { id } }', variables: { skip: false } }),
            });

            // eslint-disable-next-line no-await-in-loop
            if (response.ok && !(await response.json()).errors) {
                return { baseUrl, state, graphql, stop, output: () => output };
            }
        } catch (error) {
            // Not listening yet
        }

        // eslint-disable-next-line no-await-in-loop
        await sleep(200);
    }

    await stop();
    throw new Error(`wrangler dev did not start:\n${output}`);
};
