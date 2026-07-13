// Automated technical-AEO audit for all Bimini / Refractive Foundations web properties.
// Fetches each public site and scores objective on-site signals that make a page eligible to be
// cited by AI answer engines (crawler access, schema, sitemap, extractable content, entity links).
// Writes aeo/data.json (with history) and a static aeo/index.html dashboard, served at
// https://gurpalvirdi.com/aeo. Run locally with `node scripts/aeo-audit.mjs` or via GitHub Action.
//
// NOTE: this measures technical AEO *readiness*, not actual LLM citations (no free API exists for
// that — track those with the manual monthly probe log / a paid monitor).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DATA_PATH = `${ROOT}/aeo/data.json`;
const HTML_PATH = `${ROOT}/aeo/index.html`;

// Sites to track. Add a domain here and it flows through everywhere.
const SITES = [
  { domain: "iclsurgery.com", label: "ICL Info (patient)" },
  { domain: "iclfit.com", label: "ICL Fit (AI sizing)" },
  { domain: "gurpalvirdi.com", label: "Gurpal Virdi, MD" },
  { domain: "refractivefoundations.com", label: "Refractive Foundations" },
  { domain: "iolreference.com", label: "IOL Reference" },
];

// AI answer-engine crawlers that must be allowed for citation.
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Google-Extended",
];

const UA =
  "Mozilla/5.0 (compatible; BiminiAEOAudit/1.0; +https://gurpalvirdi.com/aeo)";

async function get(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      redirect: "follow",
      signal: ctrl.signal,
    });
    const body = res.ok ? await res.text() : "";
    return { ok: res.ok, status: res.status, body, finalUrl: res.url };
  } catch {
    return { ok: false, status: 0, body: "", finalUrl: url };
  } finally {
    clearTimeout(t);
  }
}

// Is "/" disallowed for a given bot in a robots.txt? Returns true if explicitly blocked.
function botBlocked(robots, bot) {
  if (!robots) return false;
  const lines = robots.split(/\r?\n/).map((l) => l.trim());
  let applies = false;
  let blocked = false;
  for (const line of lines) {
    if (/^user-agent:/i.test(line)) {
      const ua = line.split(":")[1].trim();
      applies = ua === "*" || ua.toLowerCase() === bot.toLowerCase();
    } else if (applies && /^disallow:/i.test(line)) {
      const path = line.split(":")[1].trim();
      if (path === "/") blocked = true;
    } else if (applies && /^allow:\s*\/$/i.test(line)) {
      blocked = false;
    }
  }
  return blocked;
}

function textLength(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

function auditSite(site, home, robots, sitemap, llms) {
  const html = home.body || "";
  const schemaTypes = [...html.matchAll(/"@type"\s*:\s*"([^"]+)"/g)].map(
    (m) => m[1],
  );
  const sameAsCount = (html.match(/"sameAs"/g) || []).length;
  const pubmedLinks = (html.match(/pubmed\.ncbi\.nlm\.nih\.gov/g) || []).length;
  const sitemapUrls = (sitemap.body.match(/<loc>/g) || []).length;
  const blockedBots = AI_BOTS.filter((b) => botBlocked(robots.body, b));

  const checks = [
    { key: "live", label: "Site live (HTTP 200)", pass: home.ok, weight: 10 },
    {
      key: "https",
      label: "HTTPS",
      pass: home.finalUrl.startsWith("https://"),
      weight: 5,
    },
    {
      key: "title",
      label: "Title tag",
      pass: /<title>[^<]{5,}<\/title>/i.test(html),
      weight: 5,
    },
    {
      key: "description",
      label: "Meta description",
      pass: /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}/i.test(
        html,
      ),
      weight: 8,
    },
    {
      key: "canonical",
      label: "Canonical URL",
      pass: /<link[^>]+rel=["']canonical["']/i.test(html),
      weight: 4,
    },
    {
      key: "og",
      label: "Open Graph tags",
      pass: /property=["']og:/i.test(html),
      weight: 4,
    },
    {
      key: "schema",
      label: `JSON-LD schema${schemaTypes.length ? ` (${[...new Set(schemaTypes)].slice(0, 6).join(", ")})` : ""}`,
      pass: /application\/ld\+json/i.test(html),
      weight: 15,
    },
    {
      key: "sameas",
      label: `Entity sameAs links${sameAsCount ? ` (${sameAsCount})` : ""}`,
      pass: sameAsCount > 0,
      weight: 6,
    },
    {
      key: "content",
      label: "Content in raw HTML (extractable)",
      pass: textLength(html) > 800,
      weight: 10,
    },
    {
      key: "robots",
      label: "robots.txt present",
      pass: robots.ok,
      weight: 4,
    },
    {
      key: "aibots",
      label: blockedBots.length
        ? `AI crawlers allowed (BLOCKED: ${blockedBots.join(", ")})`
        : "AI crawlers allowed",
      pass: robots.ok && blockedBots.length === 0,
      weight: 15,
    },
    {
      key: "sitemap",
      label: `Sitemap present${sitemapUrls ? ` (${sitemapUrls} URLs)` : ""}`,
      pass: sitemap.ok,
      weight: 8,
    },
    {
      key: "pubmed",
      label: pubmedLinks
        ? `PubMed/authority citations (${pubmedLinks})`
        : "PubMed/authority citations",
      pass: pubmedLinks > 0,
      weight: 3,
    },
    {
      key: "llms",
      label: "llms.txt present (informational)",
      pass: llms.ok,
      weight: 3,
    },
  ];

  const max = checks.reduce((s, c) => s + c.weight, 0);
  const got = checks.reduce((s, c) => s + (c.pass ? c.weight : 0), 0);
  const score = Math.round((got / max) * 100);
  return { ...site, score, checks };
}

async function auditAll() {
  const results = [];
  for (const site of SITES) {
    const base = `https://${site.domain}`;
    const [home, robots, sitemap, llms] = await Promise.all([
      get(base + "/"),
      get(base + "/robots.txt"),
      get(base + "/sitemap.xml"),
      get(base + "/llms.txt"),
    ]);
    results.push(auditSite(site, home, robots, sitemap, llms));
  }
  return results;
}

function loadHistory() {
  try {
    return JSON.parse(readFileSync(DATA_PATH, "utf8"));
  } catch {
    return { runs: [] };
  }
}

function render(latest, history) {
  const dateStr = latest.date.slice(0, 16).replace("T", " ") + " UTC";
  const avg = Math.round(
    latest.sites.reduce((s, x) => s + x.score, 0) / latest.sites.length,
  );
  const color = (s) => (s >= 90 ? "#15803d" : s >= 70 ? "#b45309" : "#b91c1c");

  const cards = latest.sites
    .map(
      (s) => `
      <div class="card">
        <div class="card-head">
          <div>
            <div class="dom">${s.domain}</div>
            <div class="lbl">${s.label}</div>
          </div>
          <div class="score" style="color:${color(s.score)}">${s.score}<span>/100</span></div>
        </div>
        <ul class="checks">
          ${s.checks
            .map(
              (c) =>
                `<li class="${c.pass ? "ok" : "no"}"><span>${c.pass ? "✓" : "✕"}</span>${c.label}</li>`,
            )
            .join("")}
        </ul>
      </div>`,
    )
    .join("");

  const histRows = history.runs
    .slice(-14)
    .reverse()
    .map((r) => {
      const cells = SITES.map((site) => {
        const hit = r.sites.find((x) => x.domain === site.domain);
        return `<td style="color:${hit ? color(hit.score) : "#9ca3af"}">${hit ? hit.score : "—"}</td>`;
      }).join("");
      return `<tr><td class="d">${r.date.slice(0, 10)}</td>${cells}</tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>AEO Readiness Dashboard — Bimini web properties</title>
<style>
  :root{--ink:#0f172a;--muted:#64748b;--line:#e2e8f0;--bg:#f8fafc}
  *{box-sizing:border-box}body{margin:0;font:15px/1.5 -apple-system,Segoe UI,Inter,sans-serif;color:var(--ink);background:var(--bg)}
  .wrap{max-width:1000px;margin:0 auto;padding:40px 20px}
  h1{font-size:26px;margin:0 0 4px}.sub{color:var(--muted);margin:0 0 24px}
  .top{display:flex;align-items:center;gap:24px;flex-wrap:wrap;margin-bottom:28px}
  .big{font-size:44px;font-weight:700}
  .grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}
  .card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px}
  .card-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
  .dom{font-weight:700}.lbl{color:var(--muted);font-size:13px}
  .score{font-size:30px;font-weight:700}.score span{font-size:14px;color:var(--muted);font-weight:400}
  .checks{list-style:none;margin:0;padding:0;font-size:13px}
  .checks li{padding:3px 0;display:flex;gap:8px;align-items:flex-start}
  .checks li span{font-weight:700}
  .ok span{color:#15803d}.no{color:#b91c1c}.no span{color:#b91c1c}
  table{border-collapse:collapse;width:100%;margin-top:14px;font-size:13px;background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden}
  th,td{padding:8px 10px;text-align:center;border-bottom:1px solid var(--line)}
  th{background:#f1f5f9;font-size:12px}td.d{text-align:left;color:var(--muted)}
  h2{font-size:18px;margin:34px 0 6px}.note{color:var(--muted);font-size:13px}
  a{color:#2563eb}
</style></head>
<body><div class="wrap">
  <h1>AEO Readiness Dashboard</h1>
  <p class="sub">Automated technical-AEO health across Bimini / Refractive Foundations web properties. Last run: <strong>${dateStr}</strong>.</p>
  <div class="top"><div><div class="big" style="color:${color(avg)}">${avg}<span style="font-size:18px;color:var(--muted)">/100 avg</span></div></div>
  <div class="note" style="max-width:520px">Scores objective on-site signals that make pages eligible for AI-answer citation (crawler access, schema, sitemap, extractable content, entity links). Does <em>not</em> measure actual LLM citations — track those with the monthly probe log.</div></div>
  <div class="grid">${cards}</div>
  <h2>Score history</h2>
  <table><thead><tr><th class="d" style="text-align:left">Date</th>${SITES.map((s) => `<th>${s.domain.replace(".com", "")}</th>`).join("")}</tr></thead>
  <tbody>${histRows || `<tr><td class="d">${latest.date.slice(0, 10)}</td>${latest.sites.map((s) => `<td style="color:${color(s.score)}">${s.score}</td>`).join("")}</tr>`}</tbody></table>
  <p class="note" style="margin-top:20px">Generated by <code>scripts/aeo-audit.mjs</code>. Re-runs weekly via GitHub Action. Not indexed.</p>
</div></body></html>`;
}

async function main() {
  const sites = await auditAll();
  const date = new Date().toISOString();
  const snapshot = {
    date,
    sites: sites.map((s) => ({
      domain: s.domain,
      label: s.label,
      score: s.score,
      checks: s.checks,
    })),
  };

  const history = loadHistory();
  // One snapshot per calendar day (replace same-day re-runs); keep last 60.
  history.runs = history.runs.filter((r) => r.date.slice(0, 10) !== date.slice(0, 10));
  history.runs.push({
    date,
    sites: snapshot.sites.map((s) => ({ domain: s.domain, score: s.score })),
  });
  history.runs = history.runs.slice(-60);
  history.latest = snapshot;

  mkdirSync(`${ROOT}/aeo`, { recursive: true });
  writeFileSync(DATA_PATH, JSON.stringify(history, null, 2));
  writeFileSync(HTML_PATH, render(snapshot, history));

  const avg = Math.round(sites.reduce((s, x) => s + x.score, 0) / sites.length);
  console.log(`AEO audit complete — avg ${avg}/100`);
  for (const s of sites) console.log(`  ${s.score.toString().padStart(3)}  ${s.domain}`);
}

main();
