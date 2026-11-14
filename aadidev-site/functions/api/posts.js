import { J, rd } from "./_lib.js";
export async function onRequestGet({ env }) { return J(await rd(env, "posts", "[]")); }
