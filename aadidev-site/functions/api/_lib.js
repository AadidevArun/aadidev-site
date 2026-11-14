// shared helpers (underscore files are not exposed as routes)
export const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
export const rd = async (env, k, d) => { try { return JSON.parse((await env.GB.get(k)) || d); } catch { return JSON.parse(d); } };
export const wr = (env, k, v) => env.GB.put(k, JSON.stringify(v));
