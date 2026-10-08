export { Api } from './api';

const api = (env) => env.API.get(env.API.idFromName('api'));

// Everything except /api is served from client/public by the assets binding (see wrangler.jsonc)
export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === '/api' || url.pathname === '/api/') {
            return api(env).fetch(url.pathname === '/api/' ? new Request(new URL('/api', url), request) : request);
        }

        return new Response('Not found', { status: 404 });
    },

    async scheduled(controller, env, ctx) {
        ctx.waitUntil(api(env).backup());
    },
};
