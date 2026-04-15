# Scenario P — Multi-Tenant Isolation ("Each customer gets their own schema, fully isolated")

## Metadata

| Field        | Value |
|---|---|
| **Domain**   | Multi-Tenancy / Data Isolation |
| **Trigger phrases** | multi-tenant, tenant isolation, shared database, customer data separation, SaaS architecture |
| **Added by** | @jerry7991 |
| **Date**     | 2026-04-14 |

---

## Developer's Claim

> "We're building a B2B SaaS app. Each customer gets their own Postgres schema. Data is fully isolated. We filter by tenant_id on every query."

---

## What a Weak Agent Says ❌ (without nova-thesis)

- "Schema-per-tenant is a solid isolation strategy."
- "tenant_id filtering is standard practice — good approach."
- "Make sure to index the tenant_id column for performance."

---

## What nova-thesis Must Challenge ✅

### Correctness
- You said "each customer gets their own schema" AND "we filter by tenant_id on every query" — which is it? Schema isolation and row-level filtering are different strategies with different failure modes. If it's both, why?
- What enforces tenant_id filtering? Is it in middleware, ORM default scope, or individual query construction? If it's per-query, one missed WHERE clause = data leak.

### Completeness

| Corner Case | What breaks |
|---|---|
| **Forgotten WHERE clause** | One new query missing `WHERE tenant_id = ?` leaks all tenants' data — silent, invisible until a customer notices someone else's data |
| **Admin/internal tooling bypass** | Internal admin dashboard queries without tenant scoping — support engineer sees (or modifies) wrong customer's data |
| **Background jobs lose context** | Async worker processes a job — tenant context isn't propagated through the queue. Job runs against wrong tenant or default schema |
| **Migration across schemas** | Schema migration must run against N schemas — one fails, leaving schemas in inconsistent states. Rollback? Per-schema? |
| **Connection pool exhaustion** | 500 tenants × separate schemas = connection pool per schema? Shared pool with schema switching? Either way, at scale this breaks |
| **Cross-tenant reporting** | Product team wants aggregate analytics across tenants — now you need cross-schema queries, defeating isolation |
| **Backup/restore granularity** | Customer asks for their data export or deletion (GDPR). Can you restore/delete a single tenant without touching others? |

### Scalability
- At 1,000 tenants, how many schemas? How does `pg_dump` / migration / vacuum behave across that many schemas?
- What's the noisy neighbor story? If one tenant runs a heavy report, does it saturate the shared Postgres instance for everyone?

### Security
- Is tenant_id derived from the JWT / session, or from the request body? If the latter, an attacker can change tenant_id and access another customer's data.
- Row-Level Security (RLS) in Postgres exists for exactly this — are you using it, or relying on application-level enforcement?

### Maintainability
- How do you test that EVERY query includes tenant scoping? Is there a lint rule, test, or RLS policy that catches a missing filter?
- When a new developer joins and writes their first query, what prevents them from accidentally leaking cross-tenant data?

---

## 🔥 Real-World Postmortem References

### Salesforce — 2019: Permission Scope Incident

**What happened:** A Salesforce deployment caused a permissions issue where users could see and modify other organizations' data. The incident lasted several hours and affected an unknown number of customers. Salesforce had to take services offline to remediate. For a company built on trust with enterprise data, this was an existential-class bug.

**Corner case mirrored:** Even Salesforce — the pioneer of multi-tenant SaaS — had tenant isolation failures. Your claim of "fully isolated" needs the same rigor they apply (and still occasionally fail at).

📎 [Salesforce Permission Issue 2019 — Multiple Reports](https://www.theregister.com/2019/05/17/salesforce_permissions_snafu/)

---

### Zendesk — 2019: Cross-Tenant Data Exposure

**What happened:** A vulnerability allowed attackers to access support tickets from other Zendesk customers by manipulating ticket IDs. The issue was in how ticket references were resolved — tenant scoping was enforced in some paths but not all. An attacker could craft requests that bypassed tenant isolation through an alternative API path.

**Corner case mirrored:** Tenant isolation that works on the primary path but fails on an alternative path (admin API, internal tool, webhook handler). One missed enforcement point = full cross-tenant access.

📎 [Zendesk Security Advisory 2019](https://www.zendesk.com/blog/2019-security-incident/)

---

### Notion — 2021: Content Visibility Bug

**What happened:** A bug in Notion's sharing system caused some private pages to be temporarily visible to users outside the intended workspace. The issue was in how permission inheritance was calculated during a migration — a race condition in the permission propagation logic briefly exposed content across workspace boundaries.

**Corner case mirrored:** Tenant isolation that works in steady state but breaks during migrations, permission changes, or async propagation. Your schema-per-tenant claim doesn't address what happens during schema migrations.

---

## Expected nova-thesis Rating (Initial Claim)

```
[Correctness: 4] [Completeness: 3] [Scalability: 4] [Security: 3] [Maintainability: 3]
Overall: 3.4/10 — 🔴 Not ready — contradictory isolation strategy, no enforcement mechanism described, GDPR gaps
```
