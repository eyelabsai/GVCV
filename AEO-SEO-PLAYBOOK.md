# AEO / SEO Playbook & Field Notes

Internal knowledge base for how we make our research + tools discoverable and citable by search
engines (Google) and AI answer engines (ChatGPT, Perplexity, Claude, Google AI Overviews/AI Mode,
Copilot, Gemini). Written from the ICL-sizing / ICL Fit / gurpalvirdi.com / iclsurgery.com work, but
**structured so it can be re-run for any colleague researcher or new site.** Done fully in-house — no
agency.

> **North star:** be the entity the web (and therefore the models) agree is the authority on a topic.
> That is earned with (1) unique first-party content, (2) a clean machine-readable identity, and
> (3) third-party corroboration — in that order of durability.

---

## 0. TL;DR — the whole strategy in six lines
1. **On-site technical SEO is table stakes**, not a differentiator. Get it right once, move on.
2. **LLMs read your *rendered visible text*, not your JSON-LD.** Put the important words on the page.
3. **Original, first-party data** (your own figures, numbers, outcomes) is the most citable thing you own.
4. **Entity graph** (ORCID + Google Scholar + Wikidata, all cross-linked via `sameAs`) is what turns a
   name into a *known researcher* the models can resolve and name.
5. **Off-site consensus** (Reddit, trade press, being mentioned on trusted domains) is ~80% of the
   remaining leverage and the hardest — it's human work, and it lags months.
6. **Measure** with Search Console + a fixed monthly LLM-citation probe, or you're flying blind.

---

## 1. What we built (this ecosystem)

### On-site (done, near-maxed across all sites)
- Full **JSON-LD entity graph** on every page: `MedicalWebPage` / `Physician` (author + reviewedBy) /
  `Organization` / `WebSite` / `FAQPage` / `ScholarlyArticle` / `SoftwareApplication`, with stable
  `@id`s and `sameAs` cross-links.
- **Answer-first content**: <40-word quick-answer blocks, question-shaped H2s, comparison tables,
  FAQ sections that mirror `FAQPage` schema.
- **Crawlability**: `robots.txt`/`robots.ts` explicitly **Allows** AI answer-engine bots (see §6),
  sitemaps on every site, canonicals, server-rendered HTML (no client-only shells).
- **Medical reviewer bylines** with names + dates (YMYL trust signal).
- **Hub-and-spoke** topical architecture centered on one clear topic ("ICL sizing & vault").

### Content moat (our real differentiator)
- 7+ peer-reviewed, PubMed-indexed papers, cited with DOI + PMID + `ScholarlyArticle` schema.
- **Published first-party figures** (e.g. the dynamic-vault charts) with plain-language explanation +
  `ImageObject` schema — un-copyable, highly citable original data.
- A named research program ("VAULT / VAULT-OCT") + a named product ("ICL Fit") so the models have
  proper nouns to attach to, like the rival named formulas (OCOS, Reinstein, KS, NK, Parkhurst).

### Entity graph (built 2026-07)
- **ORCID** per researcher, populated with works + education, wired into every site's `sameAs`.
- **Wikidata** item per researcher (label + description + `instance of human` + `occupation` +
  `ORCID iD` + `official website`), papers linked via the Author Disambiguator tool.
- **Google Scholar** public profile.
- All three IDs cross-referenced in each site's `Physician`/`Person` `sameAs` → one resolvable entity.

### Off-site (the remaining frontier — human work)
- Reddit expert answers (disclosed), trade-press byline/quote (CRSToday/EyeWorld), LinkedIn/YouTube,
  claimed medical directories. Playbook + templates in `strategy/AEO-OFFSITE-PLAYBOOK.md`.

---

## 2. What we learned — validated vs. cargo-cult

Sourced from Google's own docs (SEO Starter Guide, *How Search Works*, *Helpful Content*, the 2025-2026
*generative AI features* doc), the Princeton **GEO** paper (KDD 2024), and large correlation studies
(e.g. Ahrefs 75k-brand). Adversarially checked against practitioner consensus.

### ✅ Validated — actually moves the needle
- **Rendered visible text** is what LLMs extract — not schema. Put clinical terms/keywords in prose.
- **Original data, statistics, direct quotes, cited sources** in-content → measurably higher citation
  (GEO paper: +30-41%). This is the highest-ROI *content* tactic.
- **Off-site brand mentions + YouTube mentions** are the strongest AI-visibility correlates
  (~0.66-0.74 Spearman), dwarfing backlinks/domain-rating/content-volume (~0.19-0.22).
- **Reddit** ≈ 21% of Google AI-Overview citations. Forums/UGC punch far above their weight.
- **Organic ranking is a near-prerequisite for health topics**: ~80% of healthcare AI-Overview
  citations also rank organic top-10 → indexing + ranking still matter.
- **Entity clarity** (consistent name/description everywhere + ORCID/Scholar/Wikidata) is what earns a
  *named* mention ("who are the experts in X").
- **Author bylines / About pages / medical review** — the YMYL trust signal Google weights most.

### ❌ Cargo-cult — low or zero value (don't over-invest)
- **`<meta keywords>` tag** — *"Google Search doesn't use the keywords meta tag."* Zero Google value.
  (Harmless as a bet on non-Google crawlers reading raw HTML, but don't mistake it for real work.)
- **llms.txt** — *"Google Search ignores them"* (2026 Google doc); ~no engine consumed it as of 2026.
  Keep as cheap insurance; invest nothing.
- **Schema as a citation driver** — helps rich results, NOT LLM citation. The "structured-data ⇒
  citations r=0.63" claim was refuted. Have good schema; don't chase citations with more of it.
- **Keyword stuffing** — actively *hurts* (spam policy; ~-10% on Perplexity). Write naturally.
- **Hidden/cloaked text** — YMYL deindexing risk. Never do it.
- **E-E-A-T as a "ranking factor"** — it's not a dial; it's a bundle of signals. Build the signals
  (authorship, sources, reviews), don't "optimize E-E-A-T."

### 🔑 The "named-model" insight (why some researchers get named and others don't)
When we probed "who are the experts in ICL sizing?", every named expert had earned it via one of:
(a) a **named formula/nomogram**, (b) first-authorship on a landmark paper, (c) a **big dataset with a
number**, or (d) a **named tool with a URL**. Takeaway: give the model a *proper noun + a stat* to grab
onto, and bridge unknown entities to known ones ("trained under Dr. X, of the X nomogram").

### YMYL / medical specifics
- Trust is paramount; extra weight on health/finance/safety topics.
- Cite primary literature (PubMed/DOI), show the reviewer, state uncertainty honestly.
- Don't publish proprietary specifics (exact case counts, accuracy metrics) — keep impressive-but-general.

---

## 3. The replicable playbook — onboarding a NEW researcher / site

Run this top-to-bottom for a colleague who wants the same treatment. Order matters (durability first).

### Phase A — Identity & entity graph (do FIRST; mostly the researcher's own accounts)
- [ ] **ORCID**: register → verify email → add works by **DOI** (foolproof) → add education/employment
      → set everything visibility **Everyone**. Grab the iD (`0000-...`).
- [ ] **Google Scholar**: create profile → auto-import papers → **make public**. Grab the URL.
- [ ] **Wikidata**: `Special:NewItem` → Label + Description ("<field> researcher") + aliases → add
      statements: `instance of human`, `occupation`, `ORCID iD`, `official website`, `educated at`.
      Then **author-disambiguator.toolforge.org** to attach their papers → grab the `Q…` number.
      (An item with 0 statements gets deleted — add `instance of human` immediately.)
- [ ] Claim/complete **LinkedIn, Doximity, Healthgrades, ResearchGate** with identical name +
      one-sentence entity description.

### Phase B — On-site foundation (engineer; ~1 day per site)
- [ ] Server-rendered HTML (SSR/SSG), fast, mobile-fine.
- [ ] `robots.txt` allowing AI bots (§6) + sitemap + canonicals + unique meta descriptions.
- [ ] JSON-LD: `Physician`/`Person` node with **all** `sameAs` IDs from Phase A; `Organization`;
      `MedicalWebPage`/`WebPage`; `FAQPage`; `ScholarlyArticle` per paper (DOI + PMID identifiers).
- [ ] Answer-first copy: quick-answer blocks, question H2s, FAQ section mirroring the schema.
- [ ] One clear topic per site; hub page + spoke pages.

### Phase C — Content moat (the differentiator)
- [ ] Publish **≥1 piece of original data**: their own figure/table/number with plain explanation +
      `ImageObject` schema. This is the single most citable asset — prioritize it.
- [ ] Name the research program and/or tool (proper noun) and pair it with a memorable stat.
- [ ] Bridge to known entities in the field ("trained under…", "building on the … method").

### Phase D — Off-site authority (ongoing; the researcher, as a human)
- [ ] Aged Reddit account → disclosed, genuinely helpful answers on real threads (§ templates).
- [ ] One trade-press byline/quote on a domain the models trust.
- [ ] LinkedIn posts + YouTube explainers (with transcripts) linking back.
- [ ] Cross-links from any owned properties (labs, companies, co-authors' sites).

### Phase E — Measurement (set once, run monthly)
- [ ] Search Console + Bing Webmaster verified, sitemaps submitted, key pages indexed.
- [ ] Fixed monthly LLM-citation probe (same prompts, logged-out) scoring named/cited per engine.
- [ ] Read GSC for position-1-3 zero-click queries (AI Overviews using you).

---

## 4. Reusable technical patterns (copy/paste starting points)

**`sameAs` for a researcher `Physician`/`Person` node** (the entity-consolidation core):
```json
"sameAs": [
  "https://orcid.org/0000-0000-0000-0000",
  "https://www.wikidata.org/wiki/Q00000000",
  "https://scholar.google.com/citations?user=XXXX",
  "https://gurpalvirdi.com",
  "https://www.doximity.com/pub/...",
  "https://www.researchgate.net/profile/..."
]
```

**AI-crawler allowlist** (`robots.txt` or Next `robots.ts` — allow citation + training bots):
```
OAI-SearchBot, ChatGPT-User, GPTBot, Claude-SearchBot, Claude-User, ClaudeBot,
PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended  →  Allow: /
```
(Disallow only app/auth routes: /login, /dashboard, /profile, etc.)

**Original-figure block** (visible + `ImageObject` schema tied to the paper's DOI):
```html
<figure>
  <img src="/research/<slug>.jpg" alt="<describe the chart + the finding in one sentence>">
  <figcaption><strong>What it shows.</strong> <one-sentence plain explanation with the number.></figcaption>
</figure>
```
```json
{ "@type": "ImageObject", "contentUrl": ".../<slug>.jpg",
  "caption": "...", "description": "...", "isPartOf": { "@id": "https://doi.org/<DOI>" } }
```

**Paper node** — always include both DOI and PMID identifiers + `sameAs`:
```json
{ "@type": "ScholarlyArticle", "headline": "...", "author": [...],
  "sameAs": ["https://doi.org/<DOI>", "https://pubmed.ncbi.nlm.nih.gov/<PMID>/"],
  "identifier": [ {"@type":"PropertyValue","propertyID":"DOI","value":"<DOI>"},
                  {"@type":"PropertyValue","propertyID":"PMID","value":"<PMID>"} ] }
```

---

## 5. Do-NOT-do list (spam / trust risks)
- No hidden or cloaked text (YMYL deindexing).
- No keyword stuffing — natural prose only.
- No fabricated credentials or unverifiable claims (medical/YMYL = zero tolerance).
- No brand-new sockpuppet accounts spamming links (Reddit/forums flag + ban).
- No publishing proprietary specifics (exact N, exact accuracy) — keep general and impressive.
- Don't over-invest in meta keywords, llms.txt, or extra schema expecting citation lift.

---

## 6. Where the living docs are
Tactical/execution docs live in the **ICLResearch repo** (`ICLResearch/strategy/`), kept out of any web root:
- `AEO-OFFSITE-PLAYBOOK.md` — Reddit answer templates + trade-press pitch + article outline.
- `AEO-MEASUREMENT-CHECKLIST.md` — GSC/Bing setup + the fixed monthly probe + log table.
- earlier strategy notes (entity linking, keyword map, measurement log).

*Last updated 2026-07-19. Keep this current as engines change — the cargo-cult list especially.*
