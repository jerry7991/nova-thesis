# Corner Cases → Real-World Postmortems Index

A reference map: every corner case nova-thesis challenges → a real incident where skipping it cost millions.

---

## 💸 Payments / Transactions

| Corner Case | Real Incident | Cost |
|---|---|---|
| No idempotency key on retries | Double-charge bugs (every major fintech) | Customer trust, chargebacks |
| Partial failure (charge succeeds, DB fails) | Knight Capital 2012 | $440M in 45 min |
| No rollback plan | Knight Capital 2012 | Business destroyed |
| Missing circuit breaker | Robinhood March 2020 | Platform down on highest-volume day |
| Unverified Stripe webhooks | Widespread fintech fraud | Revenue loss |

---

## 🤖 AI / ML Models

| Corner Case | Real Incident | Cost |
|---|---|---|
| Distribution shift / model drift | Zillow 2021 | $500M loss, business unit shut down |
| Biased test set masks real failure rate | Amazon Rekognition 2018 | Reputational damage, ACLU lawsuits |
| No input validation | Microsoft Tay 2016 | Offline in 16 hours |
| Feedback loop amplifying bias | Meta Ads Algorithm | Ongoing regulatory pressure globally |
| No fallback when model is down | Any undefended ML API | 500s surface to users |
| No drift detection | Zillow 2021 | Model degraded silently for months |

---

## ⏰ "Ship It" / Time Pressure

| Corner Case | Real Incident | Cost |
|---|---|---|
| Untested rollback | GitLab 2017 | 6 hours of production data permanently lost |
| Fat-finger + no dry-run | AWS S3 2017 | 4-hour global S3 outage |
| Unload-tested regex | Cloudflare 2019 | 27-min worldwide outage |
| "Patch it later" on known CVE | Equifax 2017 | 147M people's data, $700M settlement |
| No feature flag | Widespread | Can't disable without full redeploy |

---

## 🗄️ Database Migrations

| Corner Case | Real Incident | Cost |
|---|---|---|
| Schema migration locks large table | GitHub 2012 (MySQL migration) | Hours of degraded writes |
| I/O saturation from table rebuild | GitHub 2012 | Cascading write degradation under prod load |
| Lock escalation under production concurrency | Stack Overflow 2016 | Full site outage from connection pool exhaustion |
| Deploy/migration ordering mismatch | PagerDuty 2014 | NullPointerExceptions on live data, alerting down |
| NOT NULL column + no default + old code writing | Braintree / PayPal pattern | Immediate payment insert failures |
| No dry run on production-sized data | Universal migration pattern | 4-second staging migration = 6-hour prod migration |
| Missing index on new column | Any large-table migration | Full table scans on every query touching the new column |
| No rollback script | Any failed migration | Stuck mid-migration with no path back to clean state |
| Accidental DROP in wrong environment | GitLab 2017 | Production data loss |
| No backup verification | GitLab 2017 | 4 of 5 backup methods were broken |

---

## 🏗️ Infrastructure Changes (Terraform / Cloud)

| Corner Case | Real Incident | Cost |
|---|---|---|
| Wrong capacity parameter under pressure | AWS S3 2017 | 4-hour global S3 outage |
| No `terraform plan` review before apply | Widespread RDS pattern | Accidental production database destroy/recreate |
| State drift causes destructive reconciliation | Cloudflare 2023 (Cloudforce One) | Deleted in-use resources, manual reconstruction required |
| RDS resize triggers reboot / forces new resource | Terraform community (universal) | Production DB offline, 20–45 min recovery window |
| Large blast radius of "one-line" change | Atlassian April 2022 | 400 customers offline up to 14 days, data unrecoverable |
| No backup before destructive infra operation | Atlassian 2022 | Permanent data loss for subset of customers |
| No confirmation gate / dry-run | AWS S3 2017 | One typo = global outage |
| Terraform state file not version-controlled | General best practice gap | State corruption = unknown infra state, manual recovery |

---

## 🌐 Microservices / APIs

| Corner Case | Real Incident | Cost |
|---|---|---|
| Cascading failure, no circuit breaker | Netflix Christmas Eve 2012 | Hours of streaming down |
| No circuit breaker — holiday traffic spike | Netflix 2012 | Directly caused creation of open-source Hystrix |
| Synchronous REST chain — latency multiplies | Uber "Death Star" 2015–2018 | Years of retrofitting, circular dependency graph |
| No distributed tracing | Uber / Universal microservice pattern | MTTR goes from minutes to hours during incidents |
| No saga / compensation for distributed txns | Any payment microservice split | Charge succeeds, order never created — no automatic rollback |
| Data consistency across service DBs | Any split with shared entities | Stale data served — wrong emails, wrong prices, wrong state |
| All services dependent on shared infra | Facebook October 2021 | Engineers locked out of building, 6-hour global outage |
| BGP / config change without staged rollout | Facebook 2021 | All services unreachable globally ($60B market cap hit) |
| No fallback for internal tooling | Facebook 2021 | Recovery tools also unreachable — can't fix the outage |
| No timeout on downstream calls | Any undefended microservice | Thread exhaustion, service death |
| Premature decomposition before tooling maturity | Amazon internal / MonolithFirst pattern | Distributed systems complexity without distributed systems ops |
| No API versioning between services | Universal microservice anti-pattern | Breaking change in one service silently breaks all dependents |

---

## 🔐 Security

| Corner Case | Real Incident | Cost |
|---|---|---|
| Known CVE not patched ("later") | Equifax 2017 | $700M settlement, regulatory action |
| No rate limiting on sensitive endpoint | Countless API breaches | Data enumeration, credential stuffing |
| Logging sensitive fields | Twitter 2018 (plaintext passwords in logs) | Forced global password reset |
| Missing SSRF protection | Capital One 2019 | 100M records, $80M fine |
| IDOR (missing auth check) | Uber 2016 | 57M records, $148M settlement |

---

## 🧵 Queueing / Background Jobs (Sidekiq, Redis, Workers, Streams)

| Corner Case | Real Incident | Cost |
|---|---|---|
| Queue broker becomes critical path for unrelated services | AWS Kinesis us-east-1 2020-11-25 | Hours of cascading outage across Cognito, CloudWatch, EventBridge, Lambda, ACM |
| Async backlog keeps degrading service long after sync path recovers | GitHub 2018-10-21 | ~24 hours of webhook / Pages / search lag after a 43-second network blip |
| Broker routing model silently wrong ("random" instead of "intelligent") | Heroku / Rap Genius 2013 | Years of head-of-line blocking inside dynos; public retraction, refunds |
| Thundering retry herd + queue overload during peak load | Robinhood 2020-03-02 & 03-09 | Trading halted for a full day twice; $57M FINRA fine + class action |
| Workers happily process jobs against a compromised DB mid-incident | GitLab 2017-02-01 | Sidekiq compounded the db1 wipe; no "pause the queue" primitive |
| No durability on broker restart (default Redis) | Universal Sidekiq anti-pattern | Silent loss of every in-flight job on Redis crash / OOM |
| Poison pill fills retry set, wedges workers | Universal background-job pattern | One bad payload starves the entire worker pool |
| At-least-once delivery without idempotent handler | Every webhook postmortem (Stripe, Shopify, GitHub) | Duplicate emails, duplicate charges, duplicate order events |
| Sidekiq dead-set silently drops at 10K cap | Default Sidekiq behavior | Failed webhooks / emails vanish with no alert |
| Enqueue-in-request-path couples sync health to async broker | Rails + Redis anti-pattern | Redis blip → Puma thread exhaustion → full site 503 |
| Unauthenticated Sidekiq Web UI | Widespread Rails app misconfig | One-click retry/kill/clear of production queues by anyone on the network |
| Deserializing untrusted job payloads (Marshal/YAML/pickle) | Redis/Celery RCE pattern | Remote code execution in worker process |

---

## Pattern: The Three Lies of "It's Fine"

Every major incident has at least one of these at its root:

1. **"It works in testing"** — test environments never match production scale, distribution, or adversarial inputs
2. **"We'll fix it later"** — later becomes never, or becomes too late
3. **"Someone else reviewed it"** — diffusion of responsibility, no one actually owned the hard questions

nova-thesis exists to ask the hard questions **before** any of these become the lead sentence of a postmortem.
