import { DurableObject } from 'cloudflare:workers';
import { createYoga } from 'graphql-yoga';
import { parse } from 'graphql';
import schema from './schema';
import { backup } from './backup';
import { bumpDataVersion, cacheKey } from './cache';

const timingSafeEqual = (a, b) => {
    const encoder = new TextEncoder();
    const left = encoder.encode(a);
    const right = encoder.encode(b);

    return left.byteLength === right.byteLength && crypto.subtle.timingSafeEqual(left, right);
};

const isAdmin = (request, env) => {
    const key = request.headers.get('X-Auth-Key');

    return !!env.ADMIN_KEY && !!key && timingSafeEqual(key, env.ADMIN_KEY);
};

const yoga = createYoga({
    schema,
    graphqlEndpoint: '/api',
    // Error messages were passed through before as well, the client shows some of them
    maskedErrors: false,
    graphiql: false,
    landingPage: false,
    context: ({ request, env }) => ({ db: env.DB, env, isAdmin: isAdmin(request, env) }),
});

// Which kind of GraphQL request is this? Anything that isn't recognizably a JSON request with
// only queries counts as a change (Yoga also accepts other formats), so nothing can change the
// data without invalidating the cached responses.
const classify = (body) => {
    try {
        const payload = JSON.parse(body);
        const operations = parse(payload.query).definitions.filter(({ kind }) => kind === 'OperationDefinition');
        const hasVariables = payload.variables && Object.keys(payload.variables).length > 0;

        if (operations.length === 0 || operations.some(({ operation }) => operation !== 'query')) {
            return { kind: 'change' };
        }

        return { kind: operations.length === 1 && !hasVariables ? 'cacheable' : 'query', query: payload.query };
    } catch (error) {
        return { kind: 'change' };
    }
};

const handleApi = async (request, env, ctx) => {
    // Yoga only runs queries for GET requests, never mutations
    if (request.method !== 'POST') {
        return yoga.fetch(request, { env, ctx });
    }

    const body = await request.text();
    const forward = () => yoga.fetch(new Request(request, { body }), { env, ctx });
    const { kind, query } = classify(body);

    if (kind === 'change') {
        const response = await forward();

        // Only the admin can change anything. Done before responding, so the next page load can't
        // get a response from before the change.
        if (isAdmin(request, env)) {
            await bumpDataVersion(env);
        }

        return response;
    }

    if (kind !== 'cacheable') {
        return forward();
    }

    const key = await cacheKey(env, query);
    const cached = await env.STORAGE.get(key);

    if (cached) {
        return new Response(cached.body, {
            headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Cache': 'hit' },
        });
    }

    const response = await forward();
    const text = await response.text();

    // GraphQL results put errors first, so this checks for a clean result without parsing it
    if (response.ok && text.startsWith('{"data"')) {
        ctx.waitUntil(env.STORAGE.put(key, text, { httpMetadata: { contentType: 'application/json' } }));
    }

    return new Response(text, { status: response.status, headers: response.headers });
};

// All API requests are handled by one instance of this Durable Object. A Worker on the free plan
// may only use 10 ms of CPU time per request (and gets cut off if it uses more too often), while a
// Durable Object may use far more. Computing the list of games takes about 200 ms, and the daily
// backup and the auto-fill requests need more than 10 ms as well.
export class Api extends DurableObject {
    fetch(request) {
        return handleApi(request, this.env, this.ctx);
    }

    backup() {
        return backup(this.env);
    }
}
