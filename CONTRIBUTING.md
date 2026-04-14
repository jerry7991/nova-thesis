# Contributing to nova-thesis

Every solution is a thesis. Help us make sure more of them survive scrutiny.

---

## What is nova-thesis?

nova-thesis is a skill framework that challenges technical implementations before they ship, using a 5-dimension review (correctness, completeness, scalability, security, maintainability) grounded in real-world postmortem evidence. It exists because weak agents say "looks good" — nova-thesis asks "have you thought about what breaks?"

---

## How to Contribute a New Scenario

Each scenario lives in the `scenarios/` directory as a Markdown file. Follow this exact format — no exceptions, no shortcuts.

### 1. Developer's Claim

State what the developer believes they've built. Be specific.

```markdown
## Developer's Claim

"I've implemented a distributed rate limiter using Redis sorted sets.
It's accurate, handles bursts, and won't bottleneck the API."
```

### 2. What a Weak Agent Says (❌)

Show the kind of shallow, uncritical validation nova-thesis replaces.

```markdown
## What a Weak Agent Says

❌ "Great implementation! Redis sorted sets are a solid choice for rate limiting.
Your sliding window approach looks correct and should perform well under load."
```

No hedge. No depth. No postmortem awareness. That's the point.

### 3. What nova-thesis Must Challenge (✅)

Cover **all 5 dimensions**. Each must include at least one probing question and a corner case that reveals non-obvious failure modes.

```markdown
## What nova-thesis Must Challenge

### ✅ Correctness
- Does ZADD + ZREMRANGEBYSCORE execute atomically? What happens during a Redis failover mid-operation?
- Is your clock source monotonic? NTP slew during a window boundary can double-count or drop requests.

### ✅ Completeness
- Does the implementation handle Redis being unavailable? Fail open or closed — either is a product decision, but it must be explicit.
- Are multi-region deployments accounted for? Clocks drift across DCs.

### ✅ Scalability
- At 100k RPS, how many round trips per request? Is Redis becoming a serialization point?
- What's the cardinality of your key space? Per-user keys at scale can exhaust Redis memory.

### ✅ Security
- Can a client manipulate timestamps to bypass rate limiting?
- Are rate limit keys namespaced to prevent cross-tenant interference?

### ✅ Maintainability
- If the window size changes, are existing keys in Redis silently wrong for their remaining TTL?
- Is this logic duplicated across services or centralised?
```

### Corner Case Table

Every scenario **must** include this table:

```markdown
| Corner Case | What Breaks |
|---|---|
| Redis failover mid-ZADD | Partial write; request counted twice or not at all |
| NTP clock jump backward | Window expands; burst allowed through |
| Key expiry race on TTL | Counter resets early; limit bypassed for that window |
| Multi-region with no replication lag tolerance | Users in different DCs have independent limits |
| Memory pressure evicts keys | Rate limit silently disappears for affected users |
```

### 4. Real-World Postmortem Reference

At least **one real incident** per scenario. No fictional examples. No paraphrasing without a source link.

```markdown
## Real-World Postmortem Reference

### Slack — Rate Limiter Failure Leading to Cascading Reconnects (2022)
**What happened:** A rate limiter misconfiguration during a network partition caused clients to be
incorrectly throttled. Mass reconnection storms followed as clients backed off and retried in sync.
**Corner case mirrored:** Redis unavailability causing fail-open/fail-closed ambiguity.
**Source:** https://slack.engineering/slacks-incident-on-2-22-22/
```

### 5. Expected nova-thesis Rating

Show the honest initial scores — do not inflate them.

```markdown
## Expected nova-thesis Rating

\```
nova-thesis score (initial):
  Correctness:     6/10  — atomicity gap under failover
  Completeness:    5/10  — Redis unavailability path undefined
  Scalability:     7/10  — works at current load, key cardinality unchecked
  Security:        7/10  — no obvious abuse vector, namespace check needed
  Maintainability: 6/10  — window-size migration is undocumented

Overall: 6.2/10 — Do not ship without addressing correctness and completeness gaps.
\```
```

---

## Standards for Postmortem References

- **Must be real.** No invented incidents, no "a company once..." vagueness.
- **Must be publicly documented.** Company engineering blogs, SEC filings, government reports, RCA posts, reputable news sources.
- **Must include a direct link** to the original source — not a summary site or a tweet.
- **The connection must be explicit.** State which corner case in your table the incident mirrors and why. "This is related" is not enough — explain the causal chain.

If you can't find a real postmortem that fits, find a different scenario angle that has one. Postmortem grounding is non-negotiable.

---

## How to Extend the Skill Itself

The core skill lives in `skills/challenging-implementations.md`.

### Adding New Rationalization Blockers to the Red Flags Table

The red flags table documents common developer deflections and the real-world evidence that rebuts them. Adding a new row requires:

1. **The rationalization** — the exact phrase or reasoning pattern you've seen developers use.
2. **The counter-evidence** — a real incident or published finding that shows this rationalization led to a failure. Must include a source link.
3. **The challenge question** — what nova-thesis should ask when it detects this pattern.

Example row format:
```markdown
| "We've never had a problem with this" | Normalisation of deviance — the absence of failure is not evidence of safety. See: Columbia Space Shuttle (2003), where foam strikes were recategorised as acceptable after going unpunished. | "How would you know if it had failed silently?" |
```

Do not add a red flag without real-world grounding. Intuition is not evidence.

### Updating Rating Guidance

If you're adjusting how scores are calculated or what thresholds mean:
- Update the rating rubric section in `skills/challenging-implementations.md`
- Ensure existing scenarios still produce consistent scores under the new guidance
- Add a comment in the PR explaining the calibration rationale

---

## PR Checklist

Before opening a pull request, confirm every item:

- [ ] Scenario follows the exact format of existing scenarios (all 5 dimensions, corner case table, postmortem reference, expected rating)
- [ ] At least one real postmortem is included with a live, working link
- [ ] Corner case table has both a "Corner Case" column and a "What breaks" column
- [ ] Expected ratings are honest — do not inflate scores to make the implementation look better
- [ ] New red flags (if any) have explicit real-world grounding with a source link
- [ ] No scenario uses fictional incidents or unnamed "a company once" references

---

## Local Setup

```bash
# Clone the repo
git clone https://github.com/jerry7991/nova-thesis.git
cd nova-thesis
```

To try the plugin locally, point Claude Code at this working tree:

```bash
claude --plugin-dir /path/to/nova-thesis
```

Or install from the marketplace for normal use:

```bash
claude plugin marketplace add jerry7991/nova-thesis
claude plugin install nova-thesis@nova-thesis
```

---

Questions? Open an issue. Bad scenarios get rejected. Good ones make the framework sharper for everyone.
