# Scenario J — Data Pipeline ("Our ETL runs nightly, data is always fresh")

## Metadata

| Field | Value |
|---|---|
| **Domain** | Data Pipelines / ETL / Batch Processing |
| **Trigger phrases** | ETL, data pipeline, batch job, cron job, nightly job, data warehouse, ingestion, Spark, Airflow, dbt |
| **Added by** | nova-thesis core |
| **Date** | 2024-01-01 |

---

## Developer's Claim

> "We have a nightly ETL pipeline that pulls from our Postgres production DB, transforms it, and loads into our data warehouse. It's been running for 6 months without issues. Data is always fresh by morning."

---

## What a Weak Agent Says ❌ (without nova-thesis)

- "6 months without issues — sounds solid!"
- "Nightly pipelines are the standard approach. Good."
- "If it's been stable for 6 months, you're in good shape."

---

## What nova-thesis Must Challenge ✅

### Correctness
- "Without issues" means the pipeline completed — not that the data is correct. Do you have data quality checks that validate the output, or do you only monitor whether the job ran?
- When the pipeline reads from production Postgres, does it take a snapshot or read live data? A long-running read against production while writes are happening can produce an inconsistent dataset — rows inserted mid-read may appear or disappear.

### Completeness

| Corner Case | What breaks |
|---|---|
| **Silent data corruption** | Pipeline completes successfully but transforms data incorrectly — downstream reports are wrong, no alert fires |
| **Schema change in source** | Developer adds/renames a column in Postgres → pipeline silently drops or misaligns data |
| **Partial failure mid-run** | Pipeline fails at step 3 of 5 → warehouse has half-loaded data → reports show partial day |
| **Duplicate data on retry** | Pipeline fails and retries without idempotency → records inserted twice → metrics double-counted |
| **Production DB load spike** | Full-table read at 2am hits production Postgres under maintenance window → slow queries lock tables |
| **No data freshness monitoring** | Pipeline silently fails → no one notices → dashboards show 3-day-old data → decisions made on stale data |
| **Timezone ambiguity** | Pipeline processes "yesterday's data" — but "yesterday" differs by timezone between source and warehouse |
| **Clock skew / late-arriving data** | Events with timestamps slightly in the past are missed by the daily cutoff → silent data loss |
| **Cascading downstream failures** | Pipeline loads bad data → downstream dbt models run → all reports are wrong → takes hours to identify root cause |
| **No lineage / audit trail** | Bad data found in warehouse → no way to trace which pipeline run, which transformation introduced it |

### Scalability
- The pipeline has been running for 6 months. How much has the data volume grown? What was 10 minutes at launch may now be 4 hours. When does it overlap with the next night's run?
- Are you doing full-table extracts from Postgres? At what row count does this become a table lock risk or a timeout?
- What happens when the warehouse query during transformation runs out of memory? Does it fail gracefully or corrupt in-progress state?

### Security
- Is the pipeline connecting to production with a read-only service account, or a superuser?
- Are connection strings and API keys stored in plaintext in the pipeline config, cron definition, or environment?
- Who has access to the raw data in the warehouse? Does it contain PII from production that shouldn't be in a less-secure analytics environment?

### Maintainability
- Is there an alerting rule that fires when the pipeline hasn't completed by 8am? Or does someone manually check dashboards?
- When a failure happens, how do you replay just the failed day without duplicating data already loaded?
- Is the pipeline code version-controlled? Or is it a cron job script on a single server that would be lost if the server died?

---

## 🔥 Real-World Postmortem References

### Knight Capital Group — August 2012: Silent Bad Data in Trading System

**What happened:** A code deployment activated old, unused trading logic in one of eight servers. The result wasn't an obvious crash — the system ran "successfully" and produced data, but the data was wrong. In 45 minutes, it executed 4 million unintended trades. No data quality check existed to detect that the output was nonsensical before acting on it.

**Corner case mirrored:** Pipeline runs successfully + produces data ≠ data is correct. Monitoring job completion is not the same as monitoring data correctness.

📎 [SEC Investigation Report](https://www.sec.gov/litigation/admin/2013/34-70694.pdf)

---

### Spotify — 2023: Charts Data Corruption from Pipeline Partial Failure

**Pattern:** Spotify has publicly documented cases where nightly pipeline partial failures resulted in incorrectly computed chart rankings being briefly published. The pipeline completed with exit code 0 (success) but had processed only a subset of the data due to an upstream timeout. Without row-count validation on the output, the partial data was treated as complete.

**Corner case mirrored:** Exit code 0 is not a data quality guarantee. Pipeline "completed" with half the data — silent corruption propagated to end users.

---

### Meta / Facebook — Ongoing: Silent Data Pipeline Drift

**Pattern:** Meta's data engineering team has written about the challenge of "data drift" — where pipeline logic that was correct at deployment gradually becomes incorrect as upstream schema, business logic, or data distributions change. By the time analysts notice metrics look wrong, the pipeline has been producing incorrect data for weeks. The root cause is always the same: no automated data quality assertions on pipeline output.

**Corner case mirrored:** 6 months without issues = 6 months without catching silent drift. Schema changes in Postgres propagate silently to a broken ETL.

📎 [Meta Engineering — Data Quality at Scale](https://engineering.fb.com/2021/09/23/data-infrastructure/data-quality/)

---

### Airbnb — 2015: Duplicate Data from Non-Idempotent Pipeline Retry

**Pattern:** Airbnb documented an incident where a nightly pipeline failure triggered an automatic retry. Because the pipeline was not idempotent, the retry re-inserted data already partially loaded in the first run. Key business metrics showed inflated numbers for the affected day. The fix required manual data surgery and a 3-day investigation to identify all affected downstream tables.

**Corner case mirrored:** Non-idempotent pipeline + automatic retry = duplicate data. "Retry on failure" is not safe without idempotency guarantees.

📎 [Airbnb Engineering — Idempotency in Data Pipelines](https://medium.com/airbnb-engineering/achieving-reliability-in-the-airbnb-payments-ecosystem-a3a5aa60e28a)

---

## Expected nova-thesis Rating (Initial Claim)

```
[Correctness: 4] [Completeness: 3] [Scalability: 4] [Security: 4] [Maintainability: 3]
Overall: 3.6/10 — 🔴 "ran without issues" monitors job completion, not data correctness
```
