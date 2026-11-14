import { J, rd, wr } from "./_lib.js";
const ok = (r, e) => e.ADMIN_KEY && r.headers.get("x-admin-key") === e.ADMIN_KEY;
export async function onRequestGet({ request, env }) {
  if (!ok(request, env)) return J({ error: "unauthorised" }, 401);
  const [pending, approved, posts, stats, banner] = await Promise.all([rd(env, "gb:pending", "[]"), rd(env, "gb:approved", "[]"), rd(env, "posts", "[]"), rd(env, "stats", '{"total":0,"days":{}}'), env.GB.get("cfg:banner")]);
  return J({ pending, approved, posts, stats, banner: banner || "" });
}
export async function onRequestPost({ request, env }) {
  if (!ok(request, env)) return J({ error: "unauthorised" }, 401);
  const b = await request.json(), a = b.action;
  const pend = await rd(env, "gb:pending", "[]"), appr = await rd(env, "gb:approved", "[]");
  if (a === "approve") { const m = pend.find(x => x.id === b.id); if (m) { appr.unshift(m); await wr(env, "gb:approved", appr.slice(0, 50)); await wr(env, "gb:pending", pend.filter(x => x.id !== b.id)); } }
  else if (a === "reject") await wr(env, "gb:pending", pend.filter(x => x.id !== b.id));
  else if (a === "delete") await wr(env, "gb:approved", appr.filter(x => x.id !== b.id));
  else if (a === "savePost") {
    const p = b.post, posts = await rd(env, "posts", "[]"), i = posts.findIndex(x => x.id === p.id);
    if (i >= 0) posts[i] = p; else posts.unshift(p);
    await wr(env, "posts", posts);
  }
  else if (a === "deletePost") await wr(env, "posts", (await rd(env, "posts", "[]")).filter(x => x.id !== b.id));
  else if (a === "banner") { if (b.text) await env.GB.put("cfg:banner", String(b.text).slice(0, 200)); else await env.GB.delete("cfg:banner"); }
  else return J({ error: "unknown action" }, 400);
  return J({ ok: true });
}
