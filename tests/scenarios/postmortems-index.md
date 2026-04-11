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

## 🗄️ Database / Infrastructure

| Corner Case | Real Incident | Cost |
|---|---|---|
| Schema migration locks large table | GitHub 2012 (MySQL migration) | Hours of degraded writes |
| Accidental DROP in wrong environment | GitLab 2017 | Production data loss |
| Wrong capacity parameter under pressure | AWS S3 2017 | Global outage |
| No backup verification | GitLab 2017 | 4 of 5 backup methods were broken |

---

## 🌐 Microservices / APIs

| Corner Case | Real Incident | Cost |
|---|---|---|
| Cascading failure, no circuit breaker | Netflix Christmas Eve 2012 | Hours of streaming down |
| Cascading failure from one misconfiguration | Facebook October 2021 | 6-hour global outage ($60B market cap hit) |
| No timeout on downstream calls | Any undefended microservice | Thread exhaustion, service death |
| BGP / config change without staged rollout | Facebook 2021 | All services unreachable globally |

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

## Pattern: The Three Lies of "It's Fine"

Every major incident has at least one of these at its root:

1. **"It works in testing"** — test environments never match production scale, distribution, or adversarial inputs
2. **"We'll fix it later"** — later becomes never, or becomes too late
3. **"Someone else reviewed it"** — diffusion of responsibility, no one actually owned the hard questions

nova-thesis exists to ask the hard questions **before** any of these become the lead sentence of a postmortem.
