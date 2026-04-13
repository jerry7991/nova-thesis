# Scenario E — Microservice Design ("I split our monolith into 5 microservices")

## Developer's Claim
> "I split our monolith into 5 microservices. Each has its own DB. They communicate via REST. It's much cleaner now."

---

## What a Weak Agent Says ❌ (without nova-thesis)
- "Great work! Microservices are the industry standard."
- "Having separate DBs is the right call for service isolation."
- "REST is simple and easy to understand — good choice."

---

## What nova-thesis Must Challenge ✅

### Correctness
- What is your data consistency model across 5 separate databases? If a request spans 3 services, and service 2 writes but service 3 fails, is the system in a consistent state?
- "Cleaner" structurally — but have you defined your service boundaries by domain (bounded contexts) or by technical layer? Wrong splits create *more* coupling than the monolith had.
- How do you handle a transaction that spans multiple services? REST has no built-in transaction semantics.

### Completeness
| Corner Case | What breaks |
|---|---|
| **No circuit breaker** | Service A calls B which calls C — C is slow → B threads exhaust → A threads exhaust → full cascade |
| **Synchronous REST chain** | 5 services × 50ms each = 250ms minimum latency baseline, before any retries |
| **No distributed tracing** | A request fails — you have 5 log streams, no correlation ID, no way to reconstruct what happened |
| **No saga / compensation** | Payment service charges card; inventory service fails — charge is live, order is not created, no automatic compensation |
| **Data consistency across DBs** | User email updated in user-service, not propagated to notification-service — emails go to wrong address |
| **No service discovery** | Service B is at a hardcoded IP — it moves, everything that calls it breaks |
| **No health checks** | Load balancer keeps routing to a dead instance because it has no health endpoint |
| **N deployment pipelines** | 5 services = 5 pipelines = 5 independent failure modes, version drift between services |
| **No API versioning** | Service A deploys a breaking change — service B, C, D break silently |
| **Fan-out amplification** | One user request triggers 20 downstream REST calls — external traffic spikes 20× internally |
| **No timeout on downstream calls** | A slow dependency holds a thread open indefinitely — thread pool exhaustion |
| **Chatty services** | Services that should share a DB call each other dozens of times per request — latency explodes |

### Scalability
- If service C is CPU-bound and slow, can you scale it independently without redeploying the other 4? Did you design for independent scaling from the start, or just split arbitrarily?
- Synchronous REST between services means your overall P99 latency is the *sum* of all downstream P99s, not the average. Have you modeled this?
- At 10K RPS, 5 services each making 2 DB calls = 100K DB operations per second. Have you capacity-planned each DB independently?

### Security
- Each service boundary is a new network attack surface. Are inter-service calls authenticated (mTLS, service tokens)?
- Are you logging request/response bodies between services? Could PII from user-service appear in logs of order-service?
- Does each service have the principle of least privilege on its own DB? Or do they share a superuser?
- Can service A directly query service B's database? If yes, you don't have microservices — you have a distributed monolith.

### Maintainability
- Who owns the contract between services? What happens when service A team wants to change a response field that service B depends on?
- Without distributed tracing (Jaeger, Zipkin, OpenTelemetry), mean-time-to-debug an incident goes from minutes to hours.
- How many engineers does it take to run a local dev environment with all 5 services? Is the onboarding experience now 5× harder?
- Have you considered that Amazon's own 2006 internal mandate to build APIs resulted in a famous "Stevey's Google Platforms Rant" warning about the hidden costs?

---

## 🔥 Real-World Postmortem Reference

### Netflix — Christmas Eve 2012: AWS ELB Cascading Failure
**What happened:** Netflix's AWS Elastic Load Balancer in us-east-1 experienced elevated latency under holiday traffic. Because Netflix services called each other synchronously and had no circuit breakers at the time, the slow ELB caused thread exhaustion to cascade upstream. Streaming was degraded for hours on Christmas Eve — the highest-traffic day of the year.

**Corner case mirrored:** No circuit breakers + synchronous REST chains = one slow dependency cascades into full system failure. This incident directly caused Netflix to build and open-source Hystrix (circuit breaker library).

📎 [Netflix Tech Blog — Lessons from Christmas Eve](https://netflixtechblog.com/lessons-netflix-learned-from-the-aws-outage-deefe5fd0c04)

---

### Amazon — Internal Lessons: "Monolith First"
**What happened:** Amazon has internally documented (and Jeff Bezos's 2002 API mandate is well-known) that their early microservice decomposition created significant operational overhead. Teams building new products at Amazon are strongly advised to start with a monolith and extract services only when a specific scaling or team-ownership problem demands it — not for cleanliness.

**Corner case mirrored:** "Cleaner" is not a technical argument. Premature decomposition creates distributed systems complexity before the team has the tooling, tracing, or operational maturity to manage it.

📎 [Martin Fowler — MonolithFirst Pattern](https://martinfowler.com/bliki/MonolithFirst.html)

---

### Facebook / Meta — October 4, 2021: Global Outage
**What happened:** A BGP configuration change caused all of Facebook's data centers to become unreachable — including the internal tools used to diagnose and fix the outage. Because every internal Facebook tool (authentication, internal dashboards, even door badge readers) called back to the same microservice infrastructure, engineers were locked out of the building and could not remotely fix the system. Took ~6 hours to restore.

**Corner case mirrored:** No fallback for internal tooling + all services dependent on shared infrastructure + no out-of-band recovery path = engineers physically cannot fix the system.

📎 [Facebook Engineering — October 2021 Outage Report](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)

---

### Uber — "Death Star" Architecture, 2015–2018
**Pattern:** Uber's microservice graph grew to hundreds of services making synchronous calls to each other in a pattern engineers internally called the "Death Star" — a circular dependency graph where any service going down could cascade. Uber spent years retrofitting circuit breakers, async messaging, and timeouts onto a synchronous REST architecture that had grown organically.

**Corner case mirrored:** Synchronous REST coupling between many services creates a circular dependency death spiral that is extremely expensive to refactor after the fact.

📎 [Uber Engineering — Service-Oriented Architecture](https://www.uber.com/blog/microservice-architecture/)

---

### Shopify — 2019: Service Mesh Misconfiguration Cascading Failure

**Pattern:** Shopify's shift to a service mesh (Envoy) for inter-service communication introduced a configuration error where retry budgets were not set. A downstream service under load caused upstream services to retry aggressively, amplifying traffic 10× on the slow service instead of backing off. The retry storm turned a partial degradation into a full outage for all Shopify merchants during peak hours.

**Corner case mirrored:** REST retries without exponential backoff + no retry budget = a slow service gets a 10× traffic amplification at exactly the moment it can least handle it.

---

### AWS Lambda / Serverless — Universal: Cold Start Cascade

**Pattern:** Teams frequently migrate microservices to Lambda citing "infinite scaling." Under sudden traffic spikes, hundreds of Lambda cold starts fire simultaneously. Each cold start initializes database connections — exhausting the RDS connection pool in seconds. The "infinitely scalable" frontend starts returning 5xx because the database connection pool is the bottleneck. Serverless scaling shifted the bottleneck from compute to connections.

**Corner case mirrored:** "Each has its own DB" — but what's the connection pool size? 5 microservices × 100 Lambda instances × 10 connections each = 5000 connections on cold start. Does your DB support that?

---

## Expected nova-thesis Rating (Initial Claim)
```
[Correctness: 4] [Completeness: 3] [Scalability: 4] [Security: 3] [Maintainability: 3]
Overall: 3.4/10 — distributed systems complexity added without distributed systems tooling
```
