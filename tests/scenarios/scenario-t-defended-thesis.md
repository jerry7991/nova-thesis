# Scenario T — Defended Thesis ("Here's our payment retry system — we've thought through the failure modes")

## Metadata

| Field        | Value |
|---|---|
| **Domain**   | Payments / Resilience (well-defended) |
| **Trigger phrases** | N/A — this is a verification scenario showing the skill can approve a strong implementation |
| **Added by** | @jerry7991 |
| **Date**     | 2026-04-14 |

---

## Developer's Claim

> "We built a payment retry system. It uses Stripe idempotency keys on every charge attempt. Failed charges go to a dead letter queue with exponential backoff (max 3 retries, 1min/5min/30min). If Stripe returns success but our DB write fails, a reconciliation job runs every 5 minutes comparing Stripe's charge list against our transactions table — any discrepancy creates an alert in PagerDuty and a manual review ticket. Webhooks are verified using Stripe's signature verification. We have a circuit breaker (Hystrix-style) that trips after 5 consecutive Stripe failures in 60 seconds — when tripped, we queue charges and return a 'payment pending' response instead of failing. Rate limiting is enforced per-user (10 charges/min) and per-IP (20 charges/min). We load-tested at 50× current peak traffic. Rollback is a feature flag — one toggle disables the new retry logic and falls back to the previous synchronous flow. We've tested the rollback path in staging."

---

## What a Weak Agent Says ❌ (without nova-thesis)

- "Wow, this is really thorough! Ship it."
- "Great use of idempotency keys and circuit breakers."
- "Looks production-ready to me."

*Even a weak agent would approve this, which is why nova-thesis must still challenge — but this time, the answers should hold up.*

---

## What nova-thesis Must Challenge ✅

### Correctness
- Idempotency keys on every charge ✅ — this addresses the double-charge problem
- Stripe signature verification on webhooks ✅ — this addresses the replay attack vector
- **Remaining question:** What generates the idempotency key? If it's a random UUID per attempt, retries create new keys (defeating the purpose). It must be deterministic — e.g., `order_id + attempt_number`.

### Completeness

| Corner Case | Status | Assessment |
|---|---|---|
| **Double-submit** | ✅ Addressed | Idempotency keys prevent duplicate charges |
| **Partial failure (Stripe OK, DB fails)** | ✅ Addressed | Reconciliation job with 5-min cadence catches divergence |
| **Webhook replay** | ✅ Addressed | Signature verification blocks forged webhooks |
| **Cascade failure** | ✅ Addressed | Circuit breaker trips, queues charges, returns degraded response |
| **Retry storm** | ✅ Addressed | Exponential backoff with cap (3 retries, 30min max) |
| **Load spike** | ✅ Addressed | Load tested at 50× peak, rate limiting per-user and per-IP |
| **Rollback** | ✅ Addressed | Feature flag with tested fallback path |
| **Reconciliation alert fatigue** | ⚠️ Minor gap | 5-minute reconciliation at high volume could generate noise. Is there a threshold before alerting, or does every single mismatch page someone? |

### Scalability
- Load tested at 50× — strong. **Remaining question:** Was the load test against a Stripe test environment or a Stripe sandbox that rate-limits differently than production?
- Circuit breaker queue: what's the max depth? If Stripe is down for 30 minutes and you queue charges, how large does the queue get, and what happens when the breaker resets and the queue drains?

### Security
- Signature verification ✅, rate limiting ✅, per-IP and per-user limits ✅
- **Remaining question:** Are the idempotency keys logged? If they're predictable, an attacker could pre-generate keys to block legitimate charges.

### Maintainability
- Feature flag rollback ✅, tested in staging ✅, PagerDuty alerts on reconciliation mismatches ✅
- **Remaining question:** Is there a runbook for the reconciliation alert? When a mismatch fires at 3am, what does the on-call engineer do step-by-step?

---

## 🔥 Real-World Postmortem References

### Why This Implementation Avoids Known Failures

This scenario is deliberately modeled to address the failure modes from documented incidents:

- **Knight Capital 2012** (no rollback) → Feature flag rollback with tested path
- **Robinhood 2020** (no circuit breaker) → Circuit breaker with graceful degradation
- **Double-charge pattern** (no idempotency) → Idempotency keys on every attempt
- **Stripe webhook fraud** (no signature verification) → Webhook signature verification
- **Twitter/Revue 2021** (no reconciliation) → 5-minute reconciliation job with alerting

The remaining gaps are operational polish (alert thresholds, runbooks, queue depth limits), not fundamental architectural risks.

---

## Expected nova-thesis Rating (Initial Claim)

```
[Correctness: 8] [Completeness: 7] [Scalability: 7] [Security: 7] [Maintainability: 7]
Overall: 7.2/10 — 🟡 Almost there — thesis is defensible with minor gaps in operational readiness
```

---

## Why This Scenario Exists

All other scenarios (A–S) start with intentionally flawed implementations that score 2.6–4.2. This scenario demonstrates that nova-thesis is **not a negativity engine** — it can recognize a well-defended implementation and approve it while still finding the remaining edges.

The skill's job is to challenge, not to reject. A thesis that withstands the challenge earns "✅ Thesis defended."
