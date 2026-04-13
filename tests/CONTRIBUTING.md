# Contributing to nova-thesis Tests

nova-thesis grows by adding scenarios (domain-specific challenges) and properties (universal invariants). Both follow a simple, templated process.

---

## Two Ways to Contribute

| Type | What it is | Template |
|---|---|---|
| **Scenario** | A real-world claim + 5-dimension challenge + famous incidents | `tests/scenarios/SCENARIO_TEMPLATE.md` |
| **Property** | A universal invariant that must hold for any input | `tests/properties/PROPERTY_TEMPLATE.md` |

---

## Adding a Scenario

### Step 1 — Pick a Domain

Check `tests/scenarios/INDEX.md`. If a domain has no scenario yet, add it. If it exists but you have better incidents, enrich the existing file instead of creating a new one.

### Step 2 — Copy the Template

```bash
cp tests/scenarios/SCENARIO_TEMPLATE.md tests/scenarios/scenario-[letter]-[your-domain].md
```

Use the next available letter from the index.

### Step 3 — Fill Every Section

- **Developer's Claim** — realistic 1–3 sentence claim. Should feel like something you'd actually hear.
- **Weak Agent Response** — what a helpful-but-uncritical agent says (what nova-thesis must NOT do)
- **5-Dimension Challenge** — specific hard questions per dimension. Silence = gap.
- **Incidents** — minimum 2 real incidents. Each must mirror a specific corner case. No fabricated incidents.
- **Expected Rating** — score each dimension honestly based on the claim alone.

### Step 4 — Verify the Skill Catches It

Run the claim through the skill mentally (or with an agent). Confirm:
- [ ] Skill fires (doesn't skip it)
- [ ] Lowest dimension identified correctly
- [ ] Postmortem cited
- [ ] Score matches your expected rating ± 1

### Step 5 — Update the Index

Add a row to `tests/scenarios/INDEX.md` and update the Coverage Map if your scenario fills a new category.

### Step 6 — PR Checklist

- [ ] File named `scenario-[letter]-[slug].md`
- [ ] All template placeholders replaced — no `[PLACEHOLDER]` remaining
- [ ] Minimum 2 real incidents with links (or explicit "closest analog" statement)
- [ ] Metadata table filled (domain, trigger phrases, author, date)
- [ ] INDEX.md updated
- [ ] No fabricated incidents

---

## Adding a Property

Properties are universal invariants — they must hold for **any** prompt, not just one domain. They define what "correct skill behavior" looks like.

### Step 1 — Check Existing Properties

Read `tests/properties/invariants.md`. Don't duplicate an existing property — extend or refine it instead.

### Step 2 — Copy the Template

```bash
cp tests/properties/PROPERTY_TEMPLATE.md tests/properties/property-[P-number]-[slug].md
```

Use the next available P-number.

### Step 3 — Fill Every Section

- **Statement** — one clear invariant sentence starting with "For ANY implementation claim..."
- **Pass / Fail conditions** — specific enough to verify without ambiguity
- **Verification prompts** — 3 different domain prompts where you tested the property
- **Common violations** — rationalizations that would let an agent skip this property

### Step 4 — Verify Against 3+ Domains

Test your property holds for at least 3 completely different domain prompts. A property that only holds for one domain is a scenario, not an invariant.

### Step 5 — Add to invariants.md

Add an entry to `tests/properties/invariants.md` following the existing format.

### Step 6 — PR Checklist

- [ ] File named `property-P[number]-[slug].md`
- [ ] Statement is truly domain-agnostic
- [ ] Verified against ≥3 different domain prompts
- [ ] Pass and fail conditions are unambiguous
- [ ] `invariants.md` updated

---

## Enriching Existing Scenarios

Found a better or newer incident for an existing scenario? Open a PR that:

1. Adds the incident under the `🔥 Real-World Postmortem References` section
2. Follows the same format: Company, Year, What happened, Corner case mirrored, Link
3. Optionally updates the Expected Rating if the new incident reveals a gap not previously scored

---

## Incident Quality Bar

| ✅ Acceptable | ❌ Not acceptable |
|---|---|
| Real company, real year, public record | Invented or unverifiable incident |
| Mirrors a specific corner case in the scenario | Generic "things can go wrong" reference |
| Has a link to postmortem/blog/report | Fabricated link |
| No exact match → "Closest analog: X because Y" | No explanation of why it applies |

---

## File Naming Conventions

| File type | Convention | Example |
|---|---|---|
| Scenario | `scenario-[letter]-[slug].md` | `scenario-g-auth-system.md` |
| Property | `property-P[n]-[slug].md` | `property-P9-score-monotonic.md` |
| Reference | `[topic]-reference.md` | `jwt-attacks-reference.md` |

---

## Questions?

Open an issue or start a discussion. Tag it `test-coverage` for scenarios, `invariant` for properties.
