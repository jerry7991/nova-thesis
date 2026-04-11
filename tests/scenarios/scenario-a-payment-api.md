# Scenario A — Payment API ("I built a REST API for payments")

## Developer's Claim
> "I built a payment processing REST API. It calls Stripe, saves the transaction to Postgres, and returns a 200. Works perfectly in testing."

---

## What a Weak Agent Says ❌ (without nova-thesis)
- "Looks good! Make sure you use HTTPS."
- "Nice, Stripe is reliable. You should be fine."
- "Maybe add some logging."

---

## What nova-thesis Must Challenge ✅

### Correctness
- What happens if Stripe returns a success but your DB write fails? Is the money charged but the order not recorded?
- What's your source of truth — Stripe or your DB?

### Completeness
| Corner Case | What breaks |
|---|---|
| **Double-submit** | User clicks "Pay" twice in 200ms — charged twice |
| **Network timeout** | Stripe succeeds, your HTTP client times out reading response — you retry and charge again |
| **Partial failure** | DB write fails after Stripe charge — money taken, no order |
| **Webhook race** | Stripe webhook arrives before your API response is processed |
| **Idempotency key missing** | Retries create duplicate charges |

### Scalability
- What's the connection pool size? At 1000 concurrent checkouts, do Postgres connections exhaust?
- Any DB locking on the transactions table during peak load?

### Security
- Are you logging the full request body? Is that logging a card number?
- SSRF protection on any webhook URLs you accept?
- Is the Stripe webhook signature verified?

### Maintainability
- How do you reconcile your DB with Stripe if they diverge?
- Is there an audit log for every state transition?

---

## 🔥 Real-World Postmortem Reference

### Knight Capital Group — August 1, 2012
**What happened:** Deployed new trading software to 7 of 8 servers. The 8th ran old code. In 45 minutes, the bug executed 4 million trades and lost **$440 million**. No rollback plan existed.

**Corner case mirrored:** Partial deployment + no rollback = catastrophic partial failure. Same as: Stripe succeeds, DB fails, no compensation logic.

📎 [SEC Investigation Report](https://www.sec.gov/litigation/admin/2013/34-70694.pdf)

---

### Robinhood — March 2, 2020
**What happened:** Options trading went down on the highest-volume day in history. A DNS configuration issue cascaded. No circuit breakers. Users couldn't execute trades.

**Corner case mirrored:** Works in testing, breaks under real load. No fallback. No graceful degradation.

📎 [Robinhood Blog Post-Mortem](https://robinhood.engineering/robinhood-outage-march-2-2020/)

---

### Common Double-Charge Incidents (Countless fintechs)
**Pattern:** Network timeout on Stripe API call → retry without idempotency key → double charge. Happens at scale every week somewhere.

**Corner case mirrored:** Missing idempotency key on retries.

---

## Expected nova-thesis Rating (Initial Claim)
```
[Correctness: 5] [Completeness: 3] [Scalability: 5] [Security: 4] [Maintainability: 4]
Overall: 4.2/10 — heavy challenging required
```
