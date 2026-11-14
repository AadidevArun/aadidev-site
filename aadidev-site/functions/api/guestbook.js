import { J, rd, wr } from "./_lib.js";
// GET -> approved messages only
export async function onRequestGet({ env }) { return J(await rd(env, "gb:approved", "[]")); }
// POST -> goes to the pending inbox, NOT live until you approve it in /admin.html
export async function onRequestPost({ request, env, waitUntil }) {
  let b; try { b = await request.json(); } catch { return J({ error: "Bad request" }, 400); }
  const name = String(b.name || "").trim().slice(0, 24), message = String(b.message || "").trim().slice(0, 200);
  if (!name || !message) return J({ error: "Name and message needed" }, 400);
  const rl = "rl:" + (request.headers.get("CF-Connecting-IP") || "x");
  if (await env.GB.get(rl)) return J({ error: "Slow down: 1 message per minute" }, 429);
  const p = await rd(env, "gb:pending", "[]");
  if (p.length >= 100) return J({ error: "Inbox full, try later" }, 503);
  await env.GB.put(rl, "1", { expirationTtl: 60 });
  p.push({ id: Date.now() + Math.random().toString(36).slice(2, 6), name, message, time: Date.now() });
  await wr(env, "gb:pending", p);
  if (env.RESEND_API_KEY && env.NOTIFY_EMAIL) waitUntil(notify(env, request, name, message));
  return J({ ok: true, pending: true });
}

// Email alert via Resend (set RESEND_API_KEY + NOTIFY_EMAIL). Never blocks or breaks the guestbook.
const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
async function notify(env, request, name, message) {
  try {
    const admin = new URL("/admin.html", request.url).href;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({
        from: "Aadidev Site <onboarding@resend.dev>",
        to: [env.NOTIFY_EMAIL],
        subject: "📬 New guestbook message from " + name.replace(/[\r\n]/g, " "),
        html: `<div style="font-family:sans-serif"><h2>New guestbook message</h2><p><b>${esc(name)}</b> wrote:</p><blockquote style="border-left:3px solid #F13024;padding-left:12px">${esc(message)}</blockquote><p><a href="${admin}" style="background:#F13024;color:#fff;padding:10px 18px;border-radius:99px;text-decoration:none">Review in admin</a></p></div>`
      })
    });
  } catch {}
}
