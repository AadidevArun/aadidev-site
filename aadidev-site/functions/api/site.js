import { J, rd, wr } from "./_lib.js";
// GET -> banner + visitor total.  POST -> counts one visit (1 KV write)
export async function onRequestGet({ env }) {
  const s = await rd(env, "stats", '{"total":0,"days":{}}');
  return J({ banner: await env.GB.get("cfg:banner"), total: s.total });
}
export async function onRequestPost({ env }) {
  try {
    const s = await rd(env, "stats", '{"total":0,"days":{}}'), d = new Date().toISOString().slice(0, 10);
    s.total++; s.days[d] = (s.days[d] || 0) + 1;
    const keep = Object.keys(s.days).sort().slice(-30); s.days = Object.fromEntries(keep.map(k => [k, s.days[k]]));
    await wr(env, "stats", s);
  } catch {}
  return J({ ok: true });
}
