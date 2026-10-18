# Safe Ship git audit (2026-03-18 → 2026-10-18)

Two read-only subagent audits, run on 2026-10-18 via `gh` as Danzran. The evidence is commit and PR metadata plus repo docs. Source diffs were mostly not read. Nothing below is approved portfolio copy until Daniel confirms it. Sensitive details (spend, cluster sizes, hostnames, credentials, customer data, incident and security specifics) were deliberately left out of this file.

## Where the work is
| Repo | Daniel's commits (window) | Share | What it is |
|---|---|---|---|
| Crispx-Movers | ~1,694 (2 identities) | ~23% of default branch, top human contributor | TypeScript monorepo CRM/ops platform (Express API, React, AI package, MongoDB Atlas, Cloud Run) |
| rc-call-dump | ~88 | ~79% | RingCentral call archiver: metadata, recordings, AssemblyAI transcription, indexing for search (Python/FastAPI) |
| cc-auto-compliance | ~117 | ~64% | LLM compliance scoring + sales coaching (TypeScript, Claude/Gemini agents, Slack bot) |
| Lead-Nav-Gen2-Backend | ~176 | ~73% | Lead intake/routing/billing; Daniel built the Provider Portal backend (Sep–Oct) |
| partners-dashboard-react | ~147 | ~99% | React front end for the Provider Portal (sole author) |
| MongoZen | ~10 | ~34% | Email → Zendesk/Gmail ingestion (BOL inbox). Despite the name, not a database tool |

## Claims check
- **5,000+ calls/day:** supported, and conservative. The repo docs cite ~42.7k calls/day of call metadata. Recorded and transcribed calls are estimated at thousands to ~12k a day, with ~99.8% measured recording coverage in a verified window. A Crispx-Movers doc withdrew some older call-volume figures, so prefer the archiver's numbers.
- **"AI analysis on every call":** not accurate as written. Every eligible recording is transcribed and indexed; the LLM compliance scoring runs on sales/booked-job calls. Suggested wording: "transcribed and searchable, with AI compliance review on sales calls".
- **MongoDB cost cut nearly in half:** no figure found in any repo. Related work found: batched lookups, a shared client, TTL cleanup, a Sep 2026 MongoDB/cache audit, and a hot-path audit (cache-evicting scans, duplicate auth passes). Daniel needs to confirm the number from billing.

## Biggest things (ranked by agents)
1. Call ingestion platform (rc-call-dump + Crispx call analytics). Reliability work: deferred finalize, gap sweeps, multi-credential rate-limit handling. 160k+ historical recordings made searchable.
2. AI compliance and coaching (cc-auto-compliance + Crispx compliance UI). Versioned rubrics, replay evaluation, a human feedback loop, live run progress.
3. Provider Portal, full-stack in ~5 weeks (~320 commits). Invoicing, API keys, JWT auth, sheet-to-site reconciliation that replaced Google Sheets.
4. Jobs API decomposition: a 33k-line route file split into 61 domain modules over ~18 staged PRs (some AI-assisted).
5. BOL document manager (OCR/AI parsing, review queue, reconciliation), the attendance-points engine, dev-team feedback chat, and canary rollout tooling.

## Flag for Daniel (not for the site)
The audit noticed credential and service-account files committed in some repos. Raise this with the team (rotate, then purge history). Do not publish it.
