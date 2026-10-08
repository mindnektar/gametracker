// Answering the list query takes about 200 ms of CPU time and reads thousands of rows (there are
// over a thousand games with long descriptions). So the response is kept in R2 and served from
// there as long as the data hasn't changed: every mutation bumps data_version, and responses are
// stored under the version they were computed from. And under the deployed version of this code,
// so a deployment that changes responses doesn't serve ones computed by the previous code.

const sha256 = async (text) => {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));

    return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

const dataVersion = async (env) => (
    (await env.DB.prepare("SELECT value FROM meta WHERE key = 'data_version'").first()).value
);

const cachePrefix = async (env) => `cache/${await dataVersion(env)}-${env.CF_VERSION_METADATA?.id ?? 'dev'}/`;

export const cacheKey = async (env, query) => `${await cachePrefix(env)}${await sha256(query)}.json`;

export const bumpDataVersion = (env) => (
    env.DB.prepare("UPDATE meta SET value = value + 1 WHERE key = 'data_version'").run()
);

// Removes responses of older data versions and deployments
export const pruneCache = async (env) => {
    const prefix = await cachePrefix(env);
    let cursor;

    do {
        // eslint-disable-next-line no-await-in-loop
        const list = await env.STORAGE.list({ prefix: 'cache/', cursor });
        const outdated = list.objects.map(({ key }) => key).filter((key) => !key.startsWith(prefix));

        if (outdated.length > 0) {
            // eslint-disable-next-line no-await-in-loop
            await env.STORAGE.delete(outdated);
        }

        cursor = list.truncated ? list.cursor : undefined;
    } while (cursor);
};
