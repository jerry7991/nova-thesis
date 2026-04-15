# Scenario O — API Versioning ("We'll just add v2 alongside v1")

## Metadata

| Field        | Value |
|---|---|
| **Domain**   | API Design / Versioning |
| **Trigger phrases** | API versioning, breaking change, v2 API, backwards compatibility, deprecation |
| **Added by** | @jerry7991 |
| **Date**     | 2026-04-14 |

---

## Developer's Claim

> "We need to change the response format for our public API. Plan is to create /v2/ endpoints alongside /v1/, migrate clients over time, and sunset v1 in 6 months."

---

## What a Weak Agent Says ❌ (without nova-thesis)

- "Versioned APIs are the right approach — good plan."
- "Six months should be plenty of time for migration."
- "Just make sure to document the changes well."

---

## What nova-thesis Must Challenge ✅

### Correctness
- Are /v1 and /v2 hitting the same underlying data layer? If the data model changes for v2, how does v1 continue returning the old shape without a translation layer that drifts?
- What happens when a client sends a v1 request that triggers a webhook with v2 payload format? Which version wins at the boundary?

### Completeness

| Corner Case | What breaks |
|---|---|
| **Zombie v1 clients** | Enterprise customers on v1 ignore deprecation emails for 18 months — you can't sunset without breaking their integration |
| **Mixed-version requests** | Mobile app v1 creates a resource, web app v2 reads it — field renamed, app crashes |
| **Webhook version mismatch** | v1 client registered webhook receives v2-shaped payload after backend migrates — silent parsing failure |
| **Pagination token incompatibility** | v1 cursor tokens don't decode in v2 — clients paginating across version switch get errors or duplicate data |
| **Rate limiting shared across versions** | v1 and v2 share the same rate limit pool — heavy v1 traffic starves v2 adopters during migration |
| **SDK version lock** | Official SDKs pin to v1 — community builds v2 SDK, it diverges, you now support two incompatible client libraries |

### Scalability
- How many active v1 consumers exist today? Do you have per-client version usage telemetry to track migration progress?
- Running two API versions means double the endpoint surface — how does this affect your test matrix, CI time, and on-call load?

### Security
- Does v2 change any auth flows or permission models? If v1 and v2 coexist with different auth behaviors, can an attacker downgrade to v1 to bypass v2 restrictions?
- Are v1 endpoints still receiving security patches, or does the "sunset" plan mean they're frozen and accumulating vulnerabilities?

### Maintainability
- Who owns v1 after v2 ships? Is there a team assigned to v1 bugs, or does it become abandoned code that still runs in production?
- What's the migration playbook for each client? "Migrate over time" is not a plan — it's a wish.

---

## 🔥 Real-World Postmortem References

### Twitter — 2012-2013: API v1.0 Sunset Disaster

**What happened:** Twitter announced deprecation of API v1.0 with a migration deadline. Thousands of third-party apps couldn't migrate in time. Twitter extended the deadline multiple times over 18+ months. Many apps broke permanently. The ecosystem trust damage lasted years — developers stopped building on the platform because they couldn't trust API stability.

**Corner case mirrored:** "Sunset v1 in 6 months" ignores the reality that external consumers move on their own timeline, not yours. Forced deprecation breaks trust; extended deprecation means maintaining two versions indefinitely.

📎 [Twitter Developer Blog — API v1 Retirement](https://blog.twitter.com/developer/en_us/a/2012/changes-coming-to-twitter-api)

---

### Stripe — Ongoing: Version Pinning as Industry Standard

**What happened:** Stripe maintains every API version indefinitely. Each API key is pinned to the version active when it was created. Breaking changes are never forced — clients opt in. This requires a translation layer that converts between the latest internal representation and every historical version. Stripe has maintained this discipline for over a decade with 100+ API versions.

**Corner case mirrored:** If Stripe — with billions in engineering budget — still runs every old version, your plan to sunset v1 in 6 months is either naive or will require Stripe-level version translation infrastructure. Which one is it?

📎 [Stripe API Versioning](https://stripe.com/docs/api/versioning)

---

### Facebook — 2018: Graph API v2.x Forced Migration

**What happened:** Facebook enforced migration deadlines for Graph API versions, breaking thousands of apps that hadn't migrated. Developers received short deprecation windows. Many small businesses lost functionality. The pattern repeated across v2.0 → v2.1 → v3.0, each time with complaints about insufficient migration support and breaking changes in "non-breaking" updates.

**Corner case mirrored:** "Migration over time" without per-client tracking, automated migration tooling, and dedicated support becomes forced breakage with plausible deniability.

---

## Expected nova-thesis Rating (Initial Claim)

```
[Correctness: 5] [Completeness: 3] [Scalability: 4] [Security: 4] [Maintainability: 3]
Overall: 3.8/10 — 🔴 Not ready — no migration tracking, no version translation strategy, sunset timeline is aspirational
```
