# Property [ID] — [Property Name]

<!--
  CONTRIBUTOR GUIDE
  ─────────────────
  Copy this file. Rename it property-[id]-[slug].md
  Fill every section. A property is an INVARIANT — it must hold for ANY input.
  Run verification against 3+ different prompts before submitting.
  See tests/CONTRIBUTING.md for the full checklist.
-->

## Metadata

| Field | Value |
|---|---|
| **ID** | P[number] |
| **Name** | [Short invariant name, e.g., "dimensions-always-rated"] |
| **Type** | [structural \| behavioral \| termination \| tone] |
| **Added by** | [GitHub handle] |
| **Date** | [YYYY-MM-DD] |

---

## Statement

> **For ANY implementation claim fed to the skill, [state the invariant in one clear sentence].**

---

## Pass Condition ✅

[Describe exactly what a passing response looks like. Be specific enough to verify without ambiguity.]

Example of a passing response:
```
[Paste a short example showing the property satisfied]
```

---

## Fail Condition ❌

[Describe exactly what a failing response looks like — what would it say or omit?]

Example of a failing response:
```
[Paste a short example showing the property violated]
```

---

## Why This Matters

[1–3 sentences. What real failure does this property prevent? Link to a known incident or rationalization pattern if applicable.]

---

## Verification Prompts

Run the skill with each of these inputs and confirm the property holds:

1. `"[Prompt 1 — simple claim in Domain A]"`
2. `"[Prompt 2 — claim in a completely different Domain B]"`
3. `"[Prompt 3 — claim where this property is most likely to be violated]"`

---

## Common Violations

| Violation | Why it happens | Counter |
|---|---|---|
| [What the agent does wrong] | [Why it rationalizes this] | [What the skill should say to prevent it] |
