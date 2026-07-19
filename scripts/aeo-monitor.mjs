// Daily AEO PROGRESS monitor — tracks the signals that actually change over time, unlike the
// technical-readiness scorecard in aeo-audit.mjs. Writes monitor/data.json (with history) and a
// static monitor/index.html served at https://gurpalvirdi.com/monitor.
//
// FREE signals (always run, no keys):
//   • Wikidata item health   — exists? how many statements? (entity graph growing / not deleted)
//   • ORCID works counts     — Gurpal + Matt public records (publications indexed)
//   • PubMed author counts   — papers discoverable in the primary literature
//   • Site reachability      — each property returns 200
// OPTIONAL real citation probe (only if PERPLEXITY_API_KEY is set as a GitHub secret / env var):
//   • Runs a fixed prompt set through Perplexity (which does live retrieval + returns its sources)
//     and records whether our domains appear as cited sources. This is the true "are we cited yet"
//     signal, automated daily. Without the key the section shows "not configured".
//
// Run locally:  node scripts/aeo-monitor.mjs   (or with PERPLEXITY_API_KEY=... to include the probe)

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DATA_PATH = `${ROOT}/monitor/data.json`;
const HTML_PATH = `${ROOT}/monitor/index.html`;

const OUR_DOMAINS = ["gurpalvirdi.com", "iclsurgery.com", "icl.fit", "iclfit.com"];

// PubMed terms are topic-scoped so the count reflects THEIR relevant corpus, not name collisions.
const RESEARCHERS = [
  { name: "Gurpal Virdi", orcid: "0000-0003-0123-2658", wikidata: "Q140622323",
    pubmed: "Virdi G[Author] AND (implantable collamer OR ICL OR vault OR refractive OR goniotomy)" },
  { name: "Matt Hirabayashi", orcid: "0000-0002-0925-5494", wikidata: null,
    pubmed: "Hirabayashi M[Author] AND (implantable collamer OR ICL OR vault OR refractive OR glaucoma)" },
];

// Fixed probe prompts — DO NOT change these once live; consistency is the whole point of a trend.
const PROBES = [
  "Who are the experts in ICL sizing?",
  "How is an ICL sized?",
  "What is the best ICL sizing tool or calculator?",
  "Does ICL vault change with lighting conditions?",
  "Who developed AI models for ICL vault prediction?",
];

const SITES = ["gurpalvirdi.com", "iclsurgery.com", "icl.fit", "iolreference.com", "refractivefoundations.com"];

async function getJSON(url, headers = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(url, { headers: { "User-Agent": "BiminiAEOMonitor/1.0", ...headers }, signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
  finally { clearTimeout(t); }
}

async function siteUp(domain) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(`https://${domain}/`, { headers: { "User-Agent": "BiminiAEOMonitor/1.0" }, redirect: "follow", signal: ctrl.signal });
    return res.status;
  } catch { return 0; }
  finally { clearTimeout(t); }
}

// ---- free signal collectors ----

async function wikidata(qid) {
  if (!qid) return null;
  const j = await getJSON(`https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`);
  const ent = j?.entities?.[qid];
  if (!ent) return { qid, exists: false, statements: 0, sitelinks: 0 };
  const statements = Object.values(ent.claims || {}).reduce((s, arr) => s + arr.length, 0);
  return { qid, exists: true, statements, sitelinks: Object.keys(ent.sitelinks || {}).length };
}

async function orcidWorks(orcid) {
  const j = await getJSON(`https://pub.orcid.org/v3.0/${orcid}/works`, { Accept: "application/json" });
  if (!j) return null;
  return (j.group || []).length;
}

async function pubmedCount(term) {
  const j = await getJSON(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&term=${encodeURIComponent(term)}`);
  const n = j?.esearchresult?.count;
  return n == null ? null : Number(n);
}

// ---- optional real citation probe (Perplexity) ----

async function perplexityProbe(prompt, key) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 40000);
  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: "sonar", messages: [{ role: "user", content: prompt }] }),
      signal: ctrl.signal,
    });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const j = await res.json();
    const text = j?.choices?.[0]?.message?.content || "";
    const citations = j?.citations || j?.search_results?.map((s) => s.url) || [];
    const citedDomains = OUR_DOMAINS.filter((d) => citations.some((u) => (u || "").includes(d)) || text.includes(d));
    const named = /virdi|hirabayashi|icl ?fit/i.test(text);
    return { citedDomains, named, sources: citations.length };
  } catch (e) { return { error: String(e?.name || e) }; }
  finally { clearTimeout(t); }
}

async function collect() {
  const researchers = [];
  for (const r of RESEARCHERS) {
    const [wd, works, pm] = await Promise.all([wikidata(r.wikidata), orcidWorks(r.orcid), pubmedCount(r.pubmed)]);
    researchers.push({ name: r.name, orcid: r.orcid, wikidata: wd, works, pubmed: pm });
  }
  const sites = [];
  for (const d of SITES) sites.push({ domain: d, status: await siteUp(d) });

  let probe = null;
  const key = process.env.PERPLEXITY_API_KEY;
  if (key) {
    probe = [];
    for (const p of PROBES) probe.push({ prompt: p, ...(await perplexityProbe(p, key)) });
  }
  return { date: new Date().toISOString(), researchers, sites, probe };
}

function loadHistory() {
  try { return JSON.parse(readFileSync(DATA_PATH, "utf8")); } catch { return { runs: [] }; }
}

function render(snap, history) {
  const dateStr = snap.date.slice(0, 16).replace("T", " ") + " UTC";
  const probeConfigured = Array.isArray(snap.probe);

  const rCards = snap.researchers.map((r) => {
    const wd = r.wikidata;
    return `<div class="card"><div class="dom">${r.name}</div>
      <ul class="sig">
        <li>${r.works != null ? "✓" : "—"} <b>${r.works ?? "?"}</b> ORCID works <span class="m">(${r.orcid})</span></li>
        <li>${r.pubmed != null ? "✓" : "—"} <b>${r.pubmed ?? "?"}</b> PubMed results</li>
        <li>${wd ? (wd.exists ? "✓" : "✕") : "—"} Wikidata ${wd ? (wd.exists ? `<b>${wd.statements}</b> statements <span class="m">(${wd.qid})</span>` : "MISSING/DELETED") : "<span class=\"m\">none yet</span>"}</li>
      </ul></div>`;
  }).join("");

  let probeHtml;
  if (!probeConfigured) {
    probeHtml = `<div class="note box">Live LLM-citation probe not configured. Add a <code>PERPLEXITY_API_KEY</code>
      repo secret (Settings → Secrets → Actions) to have this run the fixed prompt set through Perplexity daily and
      record whether your domains are cited. Until then, do the weekly manual Perplexity check.</div>`;
  } else {
    probeHtml = `<table><thead><tr><th style="text-align:left">Prompt</th><th>Named?</th><th>Cited domains</th><th>Sources</th></tr></thead><tbody>${
      snap.probe.map((p) => `<tr><td class="d">${p.prompt}</td>${p.error
        ? `<td colspan="3" class="m">error: ${p.error}</td>`
        : `<td>${p.named ? "✅" : "—"}</td><td>${p.citedDomains?.length ? p.citedDomains.join(", ") : "—"}</td><td>${p.sources ?? "—"}</td>`}</tr>`).join("")
    }</tbody></table>`;
  }

  // history: track Gurpal's Wikidata statements + ORCID works + total probe citations per run
  const histRows = history.runs.slice(-30).reverse().map((run) => {
    const g = run.researchers?.find((x) => x.name === "Gurpal Virdi");
    const cites = Array.isArray(run.probe) ? run.probe.reduce((s, p) => s + (p.citedDomains?.length || 0), 0) : null;
    const named = Array.isArray(run.probe) ? run.probe.filter((p) => p.named).length : null;
    return `<tr><td class="d">${run.date.slice(0, 10)}</td><td>${g?.works ?? "—"}</td><td>${g?.wikidata?.statements ?? "—"}</td><td>${named ?? "—"}</td><td>${cites ?? "—"}</td></tr>`;
  }).join("");

  const siteLine = snap.sites.map((s) => `<span class="pill ${s.status === 200 ? "up" : "down"}">${s.domain} ${s.status || "✕"}</span>`).join(" ");

  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>AEO Progress Monitor</title>
<style>
:root{--ink:#0f172a;--muted:#64748b;--line:#e2e8f0;--bg:#f8fafc}
*{box-sizing:border-box}body{margin:0;font:15px/1.5 -apple-system,Segoe UI,Inter,sans-serif;color:var(--ink);background:var(--bg)}
.wrap{max-width:900px;margin:0 auto;padding:36px 20px}
h1{font-size:25px;margin:0 0 4px}.sub{color:var(--muted);margin:0 0 22px}
h2{font-size:17px;margin:30px 0 8px}
.grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}
.card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px}
.dom{font-weight:700;margin-bottom:8px}
ul.sig{list-style:none;margin:0;padding:0;font-size:14px}ul.sig li{padding:3px 0}ul.sig b{font-size:15px}
.m{color:var(--muted);font-size:12px}
table{border-collapse:collapse;width:100%;font-size:13px;background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden}
th,td{padding:8px 10px;text-align:center;border-bottom:1px solid var(--line)}th{background:#f1f5f9;font-size:12px}
td.d{text-align:left}
.box{background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px 16px}
.note{color:var(--muted);font-size:13px}
.pill{display:inline-block;font-size:12px;padding:2px 8px;border-radius:999px;border:1px solid var(--line);margin:2px 0}
.pill.up{color:#15803d}.pill.down{color:#b91c1c}
code{background:#f1f5f9;padding:1px 5px;border-radius:5px;font-size:12px}
a{color:#2563eb}
</style></head><body><div class="wrap">
<h1>AEO Progress Monitor</h1>
<p class="sub">Live signals that actually change over time. Last run: <strong>${dateStr}</strong>. Runs daily. Not indexed.<br>
For on-site technical readiness see <a href="/aeo">/aeo</a>.</p>

<h2>Entity graph &amp; authority</h2>
<div class="grid">${rCards}</div>

<h2>Live LLM citation probe (Perplexity)</h2>
${probeHtml}

<h2>Trend</h2>
<table><thead><tr><th class="d" style="text-align:left">Date</th><th>Gurpal ORCID works</th><th>Wikidata statements</th><th>Prompts naming us</th><th>Domain citations</th></tr></thead>
<tbody>${histRows}</tbody></table>

<h2>Sites reachable</h2>
<div>${siteLine}</div>

<p class="note" style="margin-top:22px">Generated by <code>scripts/aeo-monitor.mjs</code> via GitHub Action. Entity/PubMed signals are free; the citation probe runs only when <code>PERPLEXITY_API_KEY</code> is set.</p>
</div></body></html>`;
}

async function main() {
  const snap = await collect();
  const history = loadHistory();
  history.runs = history.runs.filter((r) => r.date.slice(0, 10) !== snap.date.slice(0, 10));
  history.runs.push(snap);
  history.runs = history.runs.slice(-90);
  history.latest = snap;

  mkdirSync(`${ROOT}/monitor`, { recursive: true });
  writeFileSync(DATA_PATH, JSON.stringify(history, null, 2));
  writeFileSync(HTML_PATH, render(snap, history));

  const g = snap.researchers[0];
  console.log(`Monitor run ${snap.date.slice(0, 10)} — Gurpal: ${g.works} works, Wikidata ${g.wikidata?.statements} statements, PubMed ${g.pubmed}`);
  if (Array.isArray(snap.probe)) {
    const cites = snap.probe.reduce((s, p) => s + (p.citedDomains?.length || 0), 0);
    console.log(`  Probe: ${snap.probe.filter((p) => p.named).length}/${snap.probe.length} prompts named us, ${cites} domain citations`);
  } else console.log("  Probe: not configured (no PERPLEXITY_API_KEY)");
}

main();
