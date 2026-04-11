# Scenario [LETTER] — [Short Domain Title] ("[Developer's exact claim here]")

<!--
  CONTRIBUTOR GUIDE
  ─────────────────
  Copy this file. Rename it scenario-[letter]-[slug].md
  Fill every section marked [PLACEHOLDER].
  Run green-verification to confirm the skill catches the gaps.
  Open a PR — see tests/CONTRIBUTING.md for the full checklist.
-->

## Metadata

| Field        | Value |
|---|---|
| **Domain**   | [e.g., Payments, AI/ML, Auth, Caching, Infra, Mobile, Data Pipeline] |
| **Trigger phrases** | [comma-separated phrases that should activate this scenario] |
| **Added by** | [GitHub handle] |
| **Date**     | [YYYY-MM-DD] |

---

## Developer's Claim

> "[Paste the exact claim a developer might make. Keep it realistic — 1–3 sentences. This is the input to the skill.]"

---

## What a Weak Agent Says ❌ (without nova-thesis)

- "[Generic validation response 1]"
- "[Generic validation response 2]"
- "[Superficial suggestion that sounds helpful but skips hard questions]"

---

## What nova-thesis Must Challenge ✅

### Correctness
- [Hard question: What assumption breaks this?]
- [Hard question: What does failure look like for a specific user segment?]

### Completeness

| Corner Case | What breaks |
|---|---|
| **[Corner case name]** | [Specific failure description] |
| **[Corner case name]** | [Specific failure description] |
| **[Corner case name]** | [Specific failure description] |
| **[Corner case name]** | [Specific failure description — aim for 5+]** |

### Scalability
- [Hard question: At 10x traffic, what fails first?]
- [Hard question: N+1, unbounded growth, single point of contention?]

### Security
- [Hard question: Trust boundary crossed?]
- [Hard question: New attack surface introduced?]

### Maintainability
- [Hard question: Can this be debugged at 3am in 6 months?]
- [Hard question: Has rollback been tested end-to-end?]

---

## 🔥 Real-World Postmortem References

<!--
  RULES FOR INCIDENTS:
  1. Must be real — no fabricated examples
  2. Each must mirror a specific corner case above
  3. Link to a public source if one exists
  4. Minimum 2 incidents per scenario. 3+ is ideal.
  5. If no exact match exists, state: "Closest analog: [incident] because..."
-->

### [Company] — [Year]: [Incident Title]

**What happened:** [2–4 sentences. What did they think was safe? What actually broke? Scale of impact.]

**Corner case mirrored:** [Which row in the Completeness table above does this map to, and why.]

📎 [Link to postmortem or public report] *(omit if none available)*

---

### [Company] — [Year]: [Incident Title]

**What happened:** [2–4 sentences.]

**Corner case mirrored:** [Specific connection to this scenario's risks.]

📎 [Link]

---

### [Company / Pattern] — [Year or "Ongoing"]: [Incident Title or Pattern Name]

**What happened / Pattern:** [Description.]

**Corner case mirrored:** [Connection.]

📎 [Link] *(omit if none)*

---

## Expected nova-thesis Rating (Initial Claim)

```
[Correctness: ?] [Completeness: ?] [Scalability: ?] [Security: ?] [Maintainability: ?]
Overall: ?.?/10 — [one sentence explaining why this rating, what the dominant risk is]
```

<!--
  RATING GUIDE:
  Score each dimension 1–10 based on what the developer's claim reveals.
  Treat silence as a gap — if they didn't mention it, assume it's unaddressed.
  Overall = average of 5 dimensions.

  < 5.0  → 🔴 Not ready — fundamental risks unaddressed
  5–6.9  → 🟠 Needs work — key failure modes open
  7–8.9  → 🟡 Almost there — close the remaining gaps
  ≥ 9.0  → ✅ Thesis defended
-->
