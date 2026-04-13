# Scenario M — Queueing / Background Jobs ("We threw it on a Sidekiq queue, Redis will handle it")

<!--
  CONTRIBUTOR GUIDE
  ─────────────────
  This scenario covers asynchronous work: Sidekiq, Resque, Celery, BullMQ, RabbitMQ,
  SQS, Kafka-as-queue, custom Redis LPUSH/BRPOP loops, Kinesis streams, etc.
  It is intentionally DISTINCT from Scenario H (Caching). H is "read path, stale data".
  M is "write path, durability, ordering, backpressure, poison pills, and worker pools".
-->

## Metadata

| Field        | Value |
|---|---|
| **Domain**   | Queueing / Background Jobs / Async Workers / Streaming |
| **Trigger phrases** | Sidekiq, Resque, Celery, BullMQ, RabbitMQ, SQS, Kafka consumer, Kinesis, worker pool, background job, "move it off the request path", "fire and forget", "I'll just enqueue it", LPUSH, BRPOP, delayed job, DelayedJob, GoodJob, Oban, ActiveJob, "retries handle it", DLQ |
| **Added by** | nova-thesis core |
| **Date**     | 2026-04-13 |

---

## Developer's Claim

> "We moved the slow stuff — emails, webhooks, report generation, PDF rendering — off the request path onto a Sidekiq queue backed by Redis. Workers auto-retry on failure, Redis is fast, and we've got 20 worker processes. Latency dropped, and if something fails the retry handles it. We're good to ship."

---

## What a Weak Agent Says ❌ (without nova-thesis)

- "Sidekiq + Redis is the standard Rails async pattern. You're in good shape."
- "Auto-retry is a nice resilience feature — that covers most failures."
- "20 workers sounds like plenty. Ship it."
- "Redis is fast and battle-tested, you'll be fine."

---

## What nova-thesis Must Challenge ✅

> **MANDATE — Public-Downtime RCA:** Before any rating above 6/10 on any dimension, the agent MUST produce a full postmortem-style RCA for at least **one** real public incident rooted in queue/worker behavior. The RCA must include: **timeline (minute-by-minute if possible)**, **blast radius (users / dollars / duration)**, **root cause chain (proximate → contributing → systemic)**, **what the on-call engineer saw**, **the fix**, and **the specific control the developer's current claim is missing that would have prevented it.** Name-dropping an incident is not enough. Walk through it like a postmortem author. No RCA = no rating ≥ 6.

### Correctness
- Is your queue backend **durable or ephemeral**? Default Sidekiq on vanilla Redis is not durable — if Redis restarts without AOF/RDB properly configured (or the RDB is stale), every job in flight and queued is **gone**. Are you OK silently losing emails, webhooks, payment side effects?
- What is your retry policy? Sidekiq's default is 25 retries over ~21 days with exponential backoff. For a webhook, this might mean the receiver gets the same "order.created" event 3 weeks after the order was already refunded. Is the downstream idempotent?
- Is your job idempotent? A "retry handles it" claim collapses if the job sends an email on each run — retries become a spam incident.
- What does "fire and forget" actually mean when the enqueue itself fails? If Redis is unreachable when your web process calls `PerformLater`, does the request succeed or 500? Is the job **lost**?

### Completeness

| Corner Case | What breaks |
|---|---|
| **Redis loses data on restart** | Default `save` rules + no AOF fsync → Redis OOM or crash → entire queue wiped → silent job loss across all queues |
| **Poison pill / infinite retry** | One malformed job (bad UTF-8, missing record, type error in a deserialized arg) fails forever → fills retry queue → every worker thread eventually blocked on it |
| **Thundering retry herd** | External API (Stripe, SES, S3) has a 2-min outage → 50K jobs fail simultaneously → all retry at roughly the same backoff tick → hammer the API the moment it recovers → cause a second outage |
| **Queue backlog / head-of-line blocking** | One slow job type (PDF export: 45s) shares a queue with fast jobs (welcome email: 200ms) → single slow job saturates all 20 threads → welcome emails delayed by hours |
| **Worker OOM on large payload** | Job arg is a serialized Active Record object / entire CSV / 50MB JSON → worker heap blows up → supervisor restarts → mid-flight jobs silently re-run → duplicate side effects |
| **At-least-once without idempotency** | Network blip between worker and broker → broker re-delivers the job → email sent twice, payment captured twice, webhook fired twice |
| **Ordering assumption** | Code assumes `UserCreated` runs before `UserWelcomeEmail` → they're on separate queues with different worker counts → email job runs against a user row that doesn't exist yet → crash or silent skip |
| **Scheduled / delayed-job set explodes** | `perform_in(30.days)` used liberally → Redis ZSET grows to tens of millions of entries → ZRANGEBYSCORE slows → scheduler falls behind → all "scheduled" work late |
| **No DLQ / dead-set not monitored** | Sidekiq's dead set caps at 10K, 6 months TTL by default — once full, **new dead jobs are silently dropped**. No alert. No one notices until an auditor asks where the failed webhooks went |
| **Enqueue during web request fails** | Redis briefly unreachable → `perform_async` raises → request 500s → user sees an error on what was supposed to be an async concern |
| **Blocking the web pool on Redis** | Redis latency spikes → `perform_async` takes 2s → every web request queued behind it → Puma thread pool exhausts → full site 503s (the async system took down the sync system) |
| **Worker deploys mid-job** | Deploy rolls workers → in-flight job SIGTERM'd → Sidekiq push-back-to-queue works for most cases, but shutdown timeout exceeded → job killed mid-transaction → partial state |
| **Serialization drift** | Job args serialize an object with field `user_name`; after deploy it's `full_name` → workers running old code process jobs enqueued by new code (or vice versa) → deserialization error, infinite retries |
| **Clock skew on scheduled jobs** | Worker box drifts 90s → "run at 9:00" fires at 8:58:30 → triggers logic gated on "after 9am" → downstream thinks it's a replay attack / rejects |
| **Priority inversion** | "low" queue has no workers listening → low-priority jobs never drain → the queue that was supposed to shed load is the one accumulating it unboundedly |
| **Broker auth wide open** | Redis with `requirepass` missing, bound to 0.0.0.0 → any network-adjacent attacker can `FLUSHALL` the queue or enqueue arbitrary jobs → remote code execution via Marshal/YAML deserialization of crafted job args |

### Scalability
- What happens when your queue depth hits **1 million jobs**? At 20 workers × ~5 jobs/sec = 100 jobs/sec drained. A 1M backlog takes ~2.7 hours to clear even if enqueue rate drops to zero. At Black Friday enqueue rate, you never catch up. What's the observable signal and the load-shed plan?
- Are all 20 workers pulling from the same queue, or partitioned? If one slow job family dominates the queue, **every** worker ends up stuck on it regardless of count.
- Redis is **single-threaded for commands**. At high enqueue+dequeue rates, a single Redis instance caps around ~100K ops/sec before CPU pegs. Have you measured ops/sec under peak? What's the plan when you hit it — shard, cluster, rewrite on something else?
- Does your enqueue path do **synchronous Redis calls inside database transactions**? If Redis slows, your DB transactions hold locks longer — you've coupled async infra health to sync DB health in the worst possible direction.

### Security
- What's in the job payload? If it's a serialized Ruby/Python object, the worker will **deserialize untrusted input**. Anyone who can write to Redis can execute code in your worker. Is Redis auth on, network-isolated, and the payload schema validated?
- Are job args logged? Sidekiq Web UI shows full args by default — PII, tokens, passwords-in-payloads all sit visible to anyone with dashboard access.
- Is Sidekiq Web UI behind auth? The default mount is an unauthenticated Rack app with destructive buttons (retry/kill/clear queue) one click away.
- Can a user influence what gets enqueued (arg derived from user input)? Queue-key injection / SSRF-via-job / prototype-pollution-into-worker are real attack classes.

### Maintainability
- How do you debug "this user didn't get their email" at 3am? Can you trace: request → enqueue → which queue → which worker → retry state → dead set → success/failure? Without a correlation id threading through, you can't.
- When workers are wedged on a poison pill, what's the runbook? "Kill the pod" loses every other in-flight job.
- Have you ever **actually tested** draining a 500K backlog in staging? Most teams discover their workers don't scale linearly, their DB can't absorb the drain, or their downstream APIs rate-limit them — only during a real incident.
- What's the rollback plan when a deploy introduces a bad job class? You can't "roll back" a message that's already in the queue and will be processed by the new code in 30 seconds.

---

## 🔥 Real-World Postmortem References

<!--
  Four real, public incidents where queue/worker behavior was load-bearing.
  The agent must pick at least one and walk through it as a full RCA when challenging.
-->

### AWS Kinesis (us-east-1) — 2020-11-25: The Thread-Limit Cascade

**What happened:** AWS added capacity to the Kinesis Data Streams front-end fleet in us-east-1. Each front-end server maintains an OS thread per other front-end server for a cluster membership / sharding map. The new capacity pushed the per-host thread count past the configured OS thread limit. Front-end servers began failing health checks, which cascaded to **Cognito, CloudWatch, EventBridge, Lambda event source mappings, ACM, AutoScaling, and others** — most of the AWS services that put events on a stream or depend on event delivery. The recovery was slow because adding back capacity made it worse (more threads per host), so engineers had to carefully *remove* capacity and raise the OS limit first. Public-facing impact: hours of degradation across a huge swath of AWS-hosted companies that had no direct dependency on Kinesis.

**Corner case mirrored:** *Queue backlog / head-of-line blocking*, *broker-as-single-point-of-failure*, and *the async system took down the sync system*. Everyone assumed Kinesis was an independent plumbing layer; instead it was in the critical path of control-plane services that could not recover without it.

📎 [AWS postmortem — Summary of the Amazon Kinesis Event in Northern Virginia](https://aws.amazon.com/message/11201/)

---

### GitHub — 2018-10-21: 24 Hours of Degraded Service and the Job Queue That Couldn't Catch Up

**What happened:** A 43-second network partition between GitHub's US East Coast data center and US East Coast network hub caused Orchestrator to fail over the MySQL primary to the West Coast. When connectivity returned, the topology was split — writes had been accepted in two places. GitHub chose data integrity over availability and took ~24 hours to reconcile. During that window, the background job system (processing webhooks, notifications, Pages builds, Actions-era checks, search indexing) built up an enormous backlog that **continued to degrade user-visible functionality for hours after MySQL recovered**. Webhooks delivered to partners late or out of order; Pages sites rebuilt stale; repo search returned stale results. The sync path was fixed in hours; the async backlog was the long tail.

**Corner case mirrored:** *Queue backlog at scale*, *ordering assumption violated*, *at-least-once without downstream idempotency* (webhook consumers got replays), *no load-shed plan*. A 43-second network blip cost ~24 hours of queue drain.

📎 [GitHub Engineering — October 21 post-incident analysis](https://github.blog/2018-10-30-oct21-post-incident-analysis/)

---

### Heroku — 2013: The Random Routing Queue (Rap Genius)

**What happened:** Heroku's documentation and marketing implied the Bamboo routing stack did *intelligent* request routing — sending each incoming request to an idle dyno. In 2013, Rap Genius engineers instrumented their app and discovered routing had actually been **random** for years. Requests were queued *per-dyno* rather than globally; a slow request landing on a dyno that already had a slow request in flight sat behind it while other dynos were idle. New Relic queue-time metrics — which Heroku recommended watching — silently under-reported true wait time because they only measured one hop. Customers had been paying for dynos that were idle while their users sat in queues. Heroku publicly corrected documentation and customers demanded refunds.

**Corner case mirrored:** *Priority inversion / head-of-line blocking inside the broker*, *observability lying about true queue time*, *a "scaling" knob that doesn't actually shed load the way you think*. The whole mental model of the queue was wrong for years.

📎 [Rap Genius — Heroku's Ugly Secret](https://web.archive.org/web/20130214191020/http://rapgenius.com/James-somers-herokus-ugly-secret-lyrics) · [Heroku's response](https://blog.heroku.com/incident-19)

---

### Robinhood — 2020-03-02 & 2020-03-09: Market-Open Overload, Queues Full, Trading Halted

**What happened:** On the biggest retail trading days in years (coronavirus volatility, market-open spike), Robinhood's systems failed company-wide for a full trading day on March 2 and again on March 9. Per the NY DFS and FINRA findings, the root causes included a DNS issue compounded by **thread exhaustion and job/message processing backlogs**: market-data and order-processing queues built up faster than they could drain, downstream systems couldn't catch up, and retry storms on failed downstream calls made recovery slower. Users could not place, modify, or cancel trades on a day the S&P moved 4.6%. Robinhood paid a **$57M FINRA fine** (largest ever at the time) in part for these outages and was subject to a class-action settlement.

**Corner case mirrored:** *Thundering retry herd*, *no load-shed plan at queue saturation*, *at-least-once delivery without idempotency of order placement* (customers reported duplicate or missing orders), *worker pool sized for average not peak*. The "retries handle it" assumption inverted: retries caused the outage to persist.

📎 [FINRA AWC — Robinhood fine summary](https://www.finra.org/media-center/newsreleases/2021/finra-orders-record-financial-penalties-against-robinhood-financial-llc)

---

### GitLab.com — 2017-02-01: Sidekiq Running Against the Wrong Replica During the db1.cluster Wipe

**What happened:** GitLab's primary Postgres was falling behind on replication; an on-call engineer, exhausted, manually ran `rm -rf` on what they believed was the standby's data directory but was actually the **primary**, losing 6 hours of production data. What's less famous but relevant here: during the incident, **Sidekiq workers were still picking up jobs from Redis against the degraded/confused DB state**, running writes that compounded the inconsistency between the restored backup and the state users expected. Four of five backup/replication mechanisms were broken; the only working one was a 6-hour-old ad-hoc snapshot. The incident is a textbook case of async workers happily processing work while the foundation under them was on fire, because no one had thought about "pause the queue" as a first response.

**Corner case mirrored:** *No kill switch / no queue pause as an incident primitive*, *at-least-once processing during an incident compounds the blast radius*, *worker deploys mid-incident make things worse*. Sidekiq was doing exactly what it was built to do — and that was the problem.

📎 [GitLab.com Database incident — live doc](https://about.gitlab.com/blog/2017/02/10/postmortem-of-database-outage-of-january-31/)

---

## Expected nova-thesis Rating (Initial Claim)

```
[Correctness: 4] [Completeness: 2] [Scalability: 3] [Security: 3] [Maintainability: 3]
Overall: 3.0/10 — 🔴 "retries handle it" is the lead sentence of at least four public postmortems. Durability, idempotency, backpressure, poison pills, and observability are all unaddressed; the async layer is positioned to take down the sync layer under exactly the conditions it was meant to protect against.
```
