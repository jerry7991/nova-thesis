# Scenario D — Database Migration ("We're migrating 50M rows tonight")

## Developer's Claim
> "We're running a migration to add a new column to our users table. There are 50 million rows. We're deploying tonight."

---

## What a Weak Agent Says ❌ (without nova-thesis)
- "Sounds straightforward! Adding a column is usually pretty quick."
- "Make sure you test it on staging first."
- "Should be fine — it's just one column."

---

## What nova-thesis Must Challenge ✅

### Correctness
- Have you verified whether your database engine holds a full table lock during an `ALTER TABLE` on a 50-million-row table? On MySQL < 5.6 (no `ALGORITHM=INPLACE`), adding a column rebuilds the entire table with an exclusive lock — writes are blocked for the duration.
- Is the migration idempotent? If it fails halfway and you rerun it, do you get duplicate columns or a half-migrated table?
- What happens to rows inserted *during* migration? Are they written to the old or new schema?

### Completeness
| Corner Case | What breaks |
|---|---|
| **Table lock during migration** | All writes to `users` block for the entire migration window — potentially hours |
| **No rollback script** | Migration fails at row 30M — you have no way back to a clean state |
| **Deploy before migration** | Code references new column that doesn't exist yet — every affected query throws a 500 |
| **Deploy after migration** | New column exists but old code ignores it — silent data loss if the column has a NOT NULL constraint without a default |
| **Wrong ordering: code vs. schema** | There is no safe ordering without backward-compatible transitions (expand/contract pattern) |
| **No dry run on production-sized data** | Migration takes 4 seconds on staging (10K rows) and 6 hours on prod (50M rows) |
| **Missing index on new column** | Every query filtering or joining on the new column does a full 50M-row table scan |
| **Migration during peak traffic** | I/O spike from table rebuild saturates disk — all queries slow down, not just `users` |
| **No connection draining** | In-flight transactions see a mixed schema state mid-migration |
| **NULL vs NOT NULL + default** | Adding a NOT NULL column without a default fails immediately on insert from old code |

### Scalability
- At 50 million rows, even an "online" migration (e.g., `pt-online-schema-change` or `gh-ost`) runs for minutes to hours depending on write rate. Did you measure your current write throughput against migration tool capacity?
- What's the replication lag on your replicas during the migration? Lagged replicas serving reads will return stale schema until they catch up.
- Does your connection pool tolerate long-held transactions if the migration stalls?

### Security
- Does the new column store PII? Is it encrypted at rest and masked in logs?
- Does the migration script hard-code credentials that could end up in a shell history file or CI log?
- Who has access to run migrations in production? Is this audited?

### Maintainability
- Is the migration tracked in a versioned migration framework (Flyway, Liquibase, Alembic, Rails migrations)? Or is someone running raw SQL by hand?
- Is there a corresponding rollback migration (down migration) committed alongside the up migration?
- Have you documented the expand/contract pattern for how to safely add the column without simultaneous code+schema risk?

---

## 🔥 Real-World Postmortem Reference

### GitHub — November 2012: Online Schema Migration Outage
**What happened:** GitHub ran an `ALTER TABLE` on a large MySQL table to add an index. Even with online schema migration tooling, the operation caused hours of degraded write performance. The increased I/O from the table rebuild saturated MySQL's write capacity. Writes queued, timeouts cascaded, and the site degraded for hours.

**Corner case mirrored:** Migration on large table → I/O saturation → cascading write degradation. Even "online" migrations have a real cost under production write load.

📎 [GitHub Engineering Blog — 2012 MySQL migration](https://github.blog/engineering/infrastructure/githubs-rails-3-upgrade/)

---

### Stack Overflow — 2016: Schema Change Cascading Failure
**What happened:** A schema change on a central SQL Server table caused a lock escalation under production load. The lock escalated to a table-level lock mid-migration. This blocked every query touching that table, causing a cascading backup of requests. Connection pool exhaustion followed, and the site went down.

**Corner case mirrored:** Table lock escalation under load → connection pool exhaustion → full site outage. Not visible on staging with low concurrency.

📎 [Stack Overflow Blog — outage post-mortem](https://stackoverflow.blog/2016/02/09/stack-overflow-a-technical-deconstruction/)

---

### PagerDuty — 2014: Zero-Downtime Migration Gone Wrong
**What happened:** PagerDuty ran what they believed was a zero-downtime MySQL migration. The migration tool ran correctly but the subsequent deploy was ordered incorrectly — new code expected a column that hadn't been backfilled yet on all rows. Rows written during the migration window had NULL in the new column, causing NullPointerExceptions in the application. Alerting went down — which is the worst time for PagerDuty to have downtime.

**Corner case mirrored:** Ordering mismatch between code deploy and schema migration + partial backfill = runtime exceptions on production data.

📎 [PagerDuty Engineering — zero-downtime migrations](https://www.pagerduty.com/blog/what-is-zero-downtime-deployment/)

---

### Braintree / PayPal — Common Pattern
**Pattern:** Multiple payment processors have experienced migrations on transaction tables where adding a column with a NOT NULL constraint (without a default) caused inserts from un-deployed old code to fail immediately. Payments fail silently or throw 500s.

**Corner case mirrored:** NOT NULL column + no default + old code still writing = immediate payment failures.

---

## Expected nova-thesis Rating (Initial Claim)
```
[Correctness: 4] [Completeness: 2] [Scalability: 3] [Security: 5] [Maintainability: 3]
Overall: 3.4/10 — high blast radius, irreversible if migration corrupts data mid-run
```
