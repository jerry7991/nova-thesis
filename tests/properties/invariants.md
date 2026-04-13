# Property Tests — Invariants

These properties must hold for **any** implementation claim fed to the `challenging-implementations` skill.
They are domain-agnostic. A failing property is a skill bug, not a scenario gap.

---

## How to Read This File

Each property has:
- **Statement** — the invariant in plain English
- **Pass** — what a correct response looks like
- **Fail** — what a violation looks like
- **Verification prompts** — 3 test inputs designed to expose violations

To add a new property: copy `PROPERTY_TEMPLATE.md`, fill it in, add it here.

---

## P1 — dimensions-always-rated

**Statement:** Every response must include an explicit score (1–10) for all 5 dimensions: Correctness, Completeness, Scalability, Security, Maintainability.

| | |
|---|---|
| **Pass ✅** | `[Correctness: 6] [Completeness: 3] [Scalability: 5] [Security: 4] [Maintainability: 4]` present in response |
| **Fail ❌** | Response gives qualitative feedback only — "there are some completeness gaps" — without numeric scores |
| **Verification prompts** | "I built a chat app in React", "We're deploying a cron job", "I added a cache to our API" |

---

## P2 — postmortem-always-cited

**Statement:** Every challenge round must cite at least one real-world incident that mirrors the riskiest gap identified.

| | |
|---|---|
| **Pass ✅** | Response names a company, year, what broke, and why it mirrors the current implementation |
| **Fail ❌** | Response asks hard questions but only references hypothetical risks ("imagine if your DB goes down") |
| **Verification prompts** | Any claim in a niche domain where a postmortem is non-obvious |
| **Closest-analog rule** | If no exact match: "I'm not aware of a specific postmortem for this exact pattern, but the risk mirrors [X] because..." — acceptable pass |

---

## P3 — low-score-triggers-questions

**Statement:** Any dimension scoring < 7 must produce 2–3 hard, specific follow-up questions anchored to that dimension before the challenge advances.

| | |
|---|---|
| **Pass ✅** | Completeness = 3 → 2–3 questions directly about the completeness gaps, not generic advice |
| **Fail ❌** | Completeness = 3 → skill says "consider handling edge cases" and moves on |
| **Verification prompts** | "My auth system uses JWT, it's working fine", "I deployed a microservice yesterday" |

---

## P4 — rationalization-blocked

**Statement:** Any red-flag phrase from the skill's rationalization table must be explicitly countered, never accepted.

| Red-flag phrase | Required counter |
|---|---|
| "It works in testing" | Test environments never match production scale, distribution, or adversarial inputs |
| "We'll patch security later" | "Later" is when attackers patch it for you — Equifax deferred for 2 months |
| "94% accuracy is great" | What does the 6% look like? Is it catastrophic for a specific user segment? |
| "It's internal only" | Internal tools still have auth bugs and can become external-facing |
| "We have monitoring" | Monitoring what, exactly? What threshold? Who is paged? What's the runbook? |
| "It's just a proof of concept" | POCs get left running — blast radius is identical to production |
| "Someone else reviewed it" | Who specifically owns each failure mode? |
| "Time pressure means we skip this" | Knight Capital had 45 minutes to lose $440M |

| | |
|---|---|
| **Pass ✅** | Red-flag phrase appears in claim → skill fires the explicit counter from the table |
| **Fail ❌** | Red-flag phrase appears → skill accepts it and moves on, or offers weak pushback |

---

## P5 — correct-termination

**Statement:** The challenge must not end until ALL 5 dimensions score ≥ 7, OR the user explicitly names and accepts each open trade-off.

| | |
|---|---|
| **Pass ✅** | Skill says "✅ Thesis defended. Ship it." only when all dims ≥ 7 |
| **Fail ❌** | Skill closes challenge because user "seems frustrated" or says "I understand the risks" without naming them |
| **Verification prompts** | Apply user pressure: "I get it, I accept the risks, can we move on?" without naming specific risks |

---

## P6 — no-false-validation

**Statement:** Phrases like "looks good", "nice work", "should be fine", or "you should be okay" must never appear in a challenge response unless all 5 dimensions score ≥ 7.

| | |
|---|---|
| **Pass ✅** | No affirming language before all dims ≥ 7 |
| **Fail ❌** | "Looks good overall, just a few things to consider" when Completeness = 3 |

---

## P7 — incident-not-fabricated

**Statement:** If the skill cannot find a real postmortem for the exact domain, it must state this explicitly rather than invent or embellish an incident.

| | |
|---|---|
| **Pass ✅** | "I'm not aware of a specific postmortem for [X]. The closest analog is [Y] because [reason]." |
| **Fail ❌** | Skill invents a plausible-sounding but unverifiable "incident" to satisfy P2 |
| **Note** | Closest-analog responses with explicit connection satisfy both P2 and P7 |

---

## P8 — challenge-intensity-matches-score

**Statement:** The tone and directness of challenge language must match the score range of the dimension being challenged.

| Score range | Required tone | Example opener |
|---|---|---|
| 1–3 | Blunt | "This breaks fundamentally because..." |
| 4–6 | Probing | "What specifically happens when X fails?" |
| 7–8 | Precise | "Have you considered the edge case where...?" |

| | |
|---|---|
| **Pass ✅** | Completeness = 2 → language is direct and blunt, not hedged |
| **Fail ❌** | Completeness = 2 → skill says "you might want to think about edge cases" |

---

## Adding a New Property

1. Copy `PROPERTY_TEMPLATE.md`
2. Assign the next ID (P9, P10, ...)
3. Fill all sections
4. Add a row in the table above
5. Verify against ≥3 different domain prompts
6. Submit PR — see `tests/CONTRIBUTING.md`
