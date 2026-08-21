# AEO/SEO — LIVE STATUS (single source of truth)

**This file supersedes the scattered point-in-time notes.** If it's not here, re-verify before acting.
Detailed history lives in `AEO-SEO-PLAYBOOK.md` (strategy) and `ICLResearch/strategy/` (execution templates).

**Last updated:** 2026-08-21

---

## The one-paragraph truth (read this before asking "why no headway")

On-site SEO/AEO is **DONE and thorough** across all sites — schema, entity graph, first-party
figures, crawlability, canonical fixes. It is table stakes and it's finished; **more on-site work will
not move rankings.** The head terms ("icl surgery", "icl sizing", "icl california") are owned by
10–25-year-old authority domains (Cleveland Clinic, Duke, Mass Eye & Ear, the EVO manufacturer, and
local practices with Google Business Profiles + thousands of reviews). A <6-month-old domain **cannot**
rank or get cited for those regardless of on-site quality. **The only remaining levers are OFF-SITE
authority + TIME**, and that work is human (Reddit, trade-press byline, backlinks) and **has not been
executed**. That is why weeks pass with no movement. We diagnosed this on 2026-07-30. Nothing new is
wrong; the off-site work just hasn't been done.

---

## Per-site status

| Site | Repo / deploy | On-site AEO | GSC | Live traffic | Notes |
|---|---|---|---|---|---|
| **icl.fit** (canonical www.icl.fit) | VAULT-3.0 `frontend`, Vercel git-connected (auto-deploy) | ✅ done | ✅ verified | ~42 clicks / 5 wks (near-zero) | Apex 307→www; iclfit.com is a separate redirect-only property (ignore its 0s) |
| **iclsurgery.com** | ICLResearch `site/`, Vercel **MANUAL deploy** (`vercel --prod`) | ✅ done | ✅ verified | low | ⚠️ `git push` does NOT deploy — must run `vercel --prod` from `site/` |
| **gurpalvirdi.com** | GVCV, GitHub Pages (auto-deploy on push) | ✅ done | ✅ verified | low | Already cited in Google AI Overviews |
| **iolreference.com** | Vite/React SPA, Netlify (auto-deploy) | ✅ prerender fixed (score 62→81) | ✅ verified | low | Remaining: per-lens prose/FAQ, comparison pages |
| **refractivefoundations.com** | LIVE = WordPress; Next.js rebuild in RefractiveFoundationsWeb (NOT cut over) | partial (repo ready, not deployed) | ⚠️ NOT verified | — | Gurpal is NOT founder (Aaron Waite leads) — fix any "founder" overclaim |
| **iclworkshop.com** | — | video backlinks | ✅ verified | — | Matt's ICL vials/sizing videos embedded |

---

## DONE — stop re-doing this (on-site is finished)

- **Entity graph built & wired into every site's `sameAs`:**
  - Gurpal ORCID `0000-0003-0123-2658` · Wikidata **Q140622323** · gurpalvirdi.com
  - Matt Hirabayashi ORCID `0000-0002-0925-5494`
- **Named research program** branded everywhere: "VAULT / VAULT-OCT ICL sizing models (Hirabayashi,
  Virdi et al.), trained on 756 real ICL surgical cases" — proper noun + stat, like rival formulas.
- **Parkhurst bridge** ("trained under Greg Parkhurst, of the Parkhurst nomogram") wired in to connect
  the unknown entities to the known one.
- **7 peer-reviewed papers** cited with DOI + PMID + ScholarlyArticle schema on iclsurgery /research,
  icl.fit /publications, GVCV /research.
- **First-party figures** (dynamic-vault charts) published w/ ImageObject schema on 3 sites.
- **Canonical consolidation** on icl.fit (all refs → www.icl.fit to match live 200).
- **AI-crawler allowlists** + sitemaps on all sites. (llms.txt kept as insurance — Google ignores it.)
- **GSC + Bing verified** for all owned domains; iolreference GSC pre-existing.

## NOT done — the actual levers (human work, off-site, lag months)

These are the ONLY things that will move the needle now. Owner = Gurpal (can't be done in code):

1. **CRSToday / EyeWorld byline pitch** — DRAFTED and READY, never sent. `ICLResearch/strategy/AEO-OFFSITE-PLAYBOOK.md`.
2. **Reddit expert presence** (r/ICLsurgery, r/lasik) — disclosed, genuinely helpful answers; ~21% of
   Google AI-Overview citations come from Reddit. Templates in the off-site playbook.
3. **Backlinks** from co-author sites, practice bios, LinkedIn, YouTube video descriptions.
4. **Wikidata enrichment** — attach Gurpal's 7 papers to Q140622323 (author-disambiguator), add
   `educated at`; create a Matt Hirabayashi Wikidata item (he has none).
5. **Google Scholar profile** for Gurpal — still not created; once made, add URL to all `sameAs`.
6. **TIME** — authority for a new domain is a 6–12 month curve. Weeks is not a measurement window.

## What to measure instead of the checklist score

Stop watching the GVCV monitor's 86–97 readiness score (it's maxed and doesn't predict rankings).
Watch, monthly:
- **GSC → Performance → Queries by *impressions*** (not clicks), striking-distance = position ~5–20.
- **GSC indexed-page count** per property.
- **Fixed monthly LLM-citation probe** (logged-out, same 6 prompts) — see AEO-MEASUREMENT-CHECKLIST.

## Baseline snapshot

- **2026-08-21:** icl.fit ~42 total web-search clicks over 7/14–8/18 (≈1/day). Off-site work: not started.
- **2026-07-30:** icl.fit — 5 pages indexed, 10 not indexed; sitemap had never been submitted (action given to Gurpal).
