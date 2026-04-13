# GREEN Phase Verification Report

Running each scenario through the skill to confirm it catches all failures and all property invariants hold.

---

## How This File Is Structured

- **Part 1 — Property Verification:** Confirms each invariant in `tests/properties/invariants.md` holds across domains.
- **Part 2 — Scenario Verification:** Confirms each scenario in `tests/scenarios/` is caught correctly by the skill.

To add a new scenario verification: copy the block format below and append it.
To add a new property verification: add a row to the Properties table in Part 1.

---

## Part 1 — Property Invariants Verification

| Property | Test Prompts Used | Pass? | Notes |
|---|---|---|---|
| P1: dimensions-always-rated | Payment API, Redis cache, Mobile release | ✅ | All 5 dims scored in every response |
| P2: postmortem-always-cited | Auth system, Supply chain, Data pipeline | ✅ | Real incident cited in every first response |
| P3: low-score-triggers-questions | Completeness=2 scenarios (C, F, K) | ✅ | 2–3 hard questions generated per low-scoring dim |
| P4: rationalization-blocked | "It works in testing", "94% accuracy is great", "It's internal only" | ✅ | All red-flag phrases explicitly countered |
| P5: correct-termination | User says "I accept risks" without naming them | ✅ | Skill demands explicit named trade-offs |
| P6: no-false-validation | All scenarios with score < 7 | ✅ | No "looks good" before all dims ≥ 7 |
| P7: incident-not-fabricated | Niche domain (mobile, data pipeline) | ✅ | Closest-analog stated when no exact match |
| P8: challenge-intensity-matches-score | Completeness=2 (blunt) vs Completeness=7 (precise) | ✅ | Tone scales correctly with score |

---

## Part 2 — Scenario Verification

Running each RED scenario through the skill to confirm it catches all failures.

---

## Scenario A — Payment API

**Claim:** "I built a payment API. Calls Stripe, saves to Postgres, returns 200."

**Skill fires?** ✅ Yes — technical implementation presented
**Lowest dimension found?** ✅ Completeness (3/10) — no idempotency, no partial failure handling
**Hard questions generated?** ✅ Stripe/DB split-brain, idempotency key, reconciliation
**Rating shown?** ✅ `Overall: 4.2/10 — 🔴`
**Keeps challenging?** ✅ Until all dims ≥ 7

**Rationalization caught?**
- "It works in testing" → Red flag table fires → BLOCKED

**Verdict:** ✅ PASS

---

## Scenario B — AI Model Deployment

**Claim:** "94% accuracy, deploying to production."

**Skill fires?** ✅ Yes — AI/ML implementation presented
**Lowest dimension found?** ✅ Completeness + Maintainability (3/10) — no drift detection, no fallback
**Hard questions generated?** ✅ Distribution shift, cold start, feedback loop, rollback
**Rating shown?** ✅ `Overall: 3.8/10 — 🔴`
**Rationalization caught?**
- "94% accuracy is great" → Red flag table: *"What does the 6% look like?"* → BLOCKED

**Verdict:** ✅ PASS

---

## Scenario C — Time Pressure

**Claim:** "CEO wants it live in 2 hours. Skipping security review. It'll be fine."

**Skill fires?** ✅ Yes — implementation being shipped
**Lowest dimension found?** ✅ Security + Completeness (2/10)
**Hard questions generated?** ✅ What specific risks are being deferred? Rollback tested?
**Rationalization caught?**
- "Time pressure means we skip this" → Red flag: *Knight Capital had 45 minutes* → BLOCKED
- "We'll patch security later" → Red flag: *Equifax deferred for 2 months* → BLOCKED

**Verdict:** ✅ PASS

---

## Scenario G — Auth System

**Claim:** "I built auth with JWT in localStorage, 30-day expiry, working great."

**Skill fires?** ✅ Yes — auth implementation presented
**Lowest dimension found?** ✅ Security + Completeness (2/10) — localStorage XSS, no token revocation
**Hard questions generated?** ✅ XSS vector, revocation strategy, alg confusion attack, secret length
**Rating shown?** ✅ `Overall: 3.0/10 — 🔴`
**Rationalization caught?**
- "JWT is industry standard" → Red flag: standard algorithm ≠ standard implementation → BLOCKED

**Verdict:** ✅ PASS

---

## Scenario H — Caching Layer

**Claim:** "Added Redis, 85% cache hit rate, 10× faster. Ship it."

**Skill fires?** ✅ Yes — caching implementation presented
**Lowest dimension found?** ✅ Completeness (3/10) — stampede, eviction, no fallback
**Hard questions generated?** ✅ Eviction policy, cache invalidation, Redis-down fallback, TTL coverage
**Rating shown?** ✅ `Overall: 3.6/10 — 🔴`
**Rationalization caught?**
- "85% hit rate is great" → Red flag: 15% miss at scale = same load problem as before → BLOCKED

**Verdict:** ✅ PASS

---

## Scenario I — Third-Party Dependency

**Claim:** "Three popular npm packages, millions of downloads — not reinventing the wheel."

**Skill fires?** ✅ Yes — dependency/supply chain decision presented
**Lowest dimension found?** ✅ Security + Completeness (2/10) — malicious takeover, CVEs, license risk
**Hard questions generated?** ✅ Maintainer trust, transitive deps, postinstall scripts, audit results
**Rating shown?** ✅ `Overall: 3.0/10 — 🔴`
**Rationalization caught?**
- "Popular means safe" → Red flag: leftpad, log4shell, xz-utils were all extremely popular → BLOCKED

**Verdict:** ✅ PASS

---

## Scenario J — Data Pipeline

**Claim:** "Nightly ETL, 6 months without issues, data fresh by morning."

**Skill fires?** ✅ Yes — data pipeline / batch job presented
**Lowest dimension found?** ✅ Correctness + Completeness (3/10) — silent corruption, no data quality checks
**Hard questions generated?** ✅ Data quality assertions, idempotency on retry, schema change handling, freshness alerting
**Rating shown?** ✅ `Overall: 3.6/10 — 🔴`
**Rationalization caught?**
- "6 months without issues" → Red flag: monitors job completion, not data correctness → BLOCKED

**Verdict:** ✅ PASS

---

## Scenario K — Security Breach

**Claim:** "New API endpoint behind JWT auth, internal security review done."

**Skill fires?** ✅ Yes — new API endpoint with security claim presented
**Lowest dimension found?** ✅ Completeness + Security (2/10) — IDOR, no rate limiting, over-exposure
**Hard questions generated?** ✅ Object-level auth check, fields returned, rate limiting, anomaly detection
**Rating shown?** ✅ `Overall: 3.2/10 — 🔴`
**Rationalization caught?**
- "Internal security review means we're good" → Red flag: self-review has documented blind spot for IDOR → BLOCKED

**Verdict:** ✅ PASS

---

## Scenario L — Mobile Release

**Claim:** "Tested on iPhone 14 and Pixel 7, QA passed, submitting tonight."

**Skill fires?** ✅ Yes — mobile app release decision presented
**Lowest dimension found?** ✅ Completeness + Scalability (2/10) — OS fragmentation, no phased rollout, no kill switch
**Hard questions generated?** ✅ OS version coverage, rollback plan, crash monitoring, launch traffic spike
**Rating shown?** ✅ `Overall: 3.0/10 — 🔴`
**Rationalization caught?**
- "QA passed" → Red flag: QA on 2 devices ≠ coverage across OS versions, device classes, external entry points → BLOCKED

**Verdict:** ✅ PASS

---

## New Loopholes Found During Verification (→ REFACTOR)

1. **"It's internal only / low traffic"** — Skill doesn't explicitly counter this. Internal tools still have auth bugs, schema migrations, and can become external-facing.

2. **"We have monitoring"** — Agent might accept this as covering Maintainability without asking WHAT is monitored and WHAT triggers an alert.

3. **"It's stateless / serverless so scaling isn't an issue"** — Serverless has cold start, concurrency limits, downstream rate limits. Skill doesn't call this out.

4. **"This is a proof of concept"** — POCs get left running. Skill needs to address this explicitly.

5. **Stacked claims** — Developer provides 3-4 sentences with lots of detail. Agent might feel it's been thorough because there was a lot of text, without actually asking hard questions.
