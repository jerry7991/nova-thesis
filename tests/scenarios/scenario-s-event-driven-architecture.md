# Scenario S — Event-Driven Architecture ("We publish events to Kafka, consumers handle the rest")

## Metadata

| Field        | Value |
|---|---|
| **Domain**   | Event-Driven Architecture / Message Streaming |
| **Trigger phrases** | event-driven, Kafka, pub/sub, event sourcing, message bus, CQRS, async events |
| **Added by** | @jerry7991 |
| **Date**     | 2026-04-14 |

---

## Developer's Claim

> "We refactored to event-driven. Services publish domain events to Kafka, consumers process them asynchronously. Decoupled and scalable."

---

## What a Weak Agent Says ❌ (without nova-thesis)

- "Event-driven is a great pattern for decoupling services."
- "Kafka is battle-tested — good choice for event streaming."
- "Make sure your consumers are idempotent."

---

## What nova-thesis Must Challenge ✅

### Correctness
- What's your ordering guarantee? Kafka guarantees order within a partition, not across partitions. If "user created" and "user deleted" events land on different partitions, a consumer can process the delete before the create.
- What's the schema contract between producer and consumer? If a producer adds a field, do consumers fail? If a producer removes a field, do consumers crash?

### Completeness

| Corner Case | What breaks |
|---|---|
| **Out-of-order delivery** | Events across partitions arrive in arbitrary order — consumer processes "order shipped" before "order created", creating an orphan shipment |
| **Duplicate delivery** | Kafka guarantees at-least-once by default. Consumer processes the same event twice — user charged twice, email sent twice, inventory decremented twice |
| **Poison message** | One malformed event blocks the consumer — entire partition stalls. Dead letter queue? Or infinite retry loop? |
| **Schema evolution** | Producer adds a required field — all existing consumers fail to deserialize. No schema registry = uncoordinated breaking changes |
| **Consumer lag spiral** | Consumer falls behind → backpressure → lag increases → processing stale events → bad user experience → more events from retries → more lag |
| **Exactly-once mirage** | Team assumes Kafka transactions give exactly-once across services. They give exactly-once within Kafka — but the side effect (DB write, API call) still needs its own idempotency |
| **Event replay disaster** | Team replays events from the beginning for a new consumer — but events include "delete user" and "refund payment," which re-execute destructively |

### Scalability
- How many partitions per topic? At what consumer count do you hit the partition ceiling (one consumer per partition max in a consumer group)?
- What's the retention policy? 7 days of events at your write rate — how much disk? Who monitors broker storage?

### Security
- Are events encrypted at rest and in transit? Do events contain PII? If a consumer is compromised, can it read events from ALL topics?
- Who can publish to any topic? Is there ACL enforcement, or can a compromised service inject events into any topic?

### Maintainability
- How do you trace a request across 5 services processing events asynchronously? Do you have distributed tracing with correlation IDs propagated through Kafka headers?
- When an event is processed incorrectly, how do you find out? Is there monitoring on consumer lag, error rates, and processing latency per consumer group?

---

## 🔥 Real-World Postmortem References

### Uber — 2019-2020: Event-Driven Architecture Growing Pains

**What happened:** Uber's event-driven architecture grew to thousands of microservices publishing and consuming events. Without a schema registry, producer changes frequently broke consumers. Consumer lag during peak hours caused stale ride pricing and delayed driver assignments. Uber invested heavily in their Kafka infrastructure team and built custom tooling (uReplicator, Chaperone) to manage the complexity that "decoupled and scalable" introduced.

**Corner case mirrored:** "Decoupled" in theory, operationally coupled in practice. When your event bus is the backbone, every producer change is a potential breaking change for every consumer you don't know about.

📎 [Uber Engineering — Building Reliable Reprocessing](https://www.uber.com/blog/reliable-reprocessing/)

---

### CrowdStrike — 2024: Update Event Cascade

**What happened:** A content update pushed through CrowdStrike's automated update pipeline caused a worldwide outage affecting ~8.5 million Windows machines. The update was not staged or gated — it went to all endpoints simultaneously. The core issue mirrors event-driven systems: a single event (update published) cascaded to all consumers (endpoints) with no circuit breaker, no canary, and no way to halt propagation.

**Corner case mirrored:** Events published to all consumers simultaneously with no staged rollout. One bad event = all consumers affected. Your Kafka setup has the same blast radius unless you have consumer-side validation and staged processing.

📎 [CrowdStrike Preliminary Post Incident Review](https://www.crowdstrike.com/blog/falcon-content-update-preliminary-post-incident-report/)

---

### Apache Kafka — 2019: LinkedIn Partition Rebalancing Storm

**What happened:** LinkedIn (the creators of Kafka) experienced repeated consumer group rebalancing storms where adding or removing a consumer triggered a cascade of rebalances across the group. During rebalancing, no messages are processed — effectively a pause in the entire consumer group. At scale, rebalancing could take minutes, creating a gap in event processing that looked like an outage.

**Corner case mirrored:** "Consumers handle the rest" assumes consumers are always processing. Rebalancing, crashes, and lag can create windows where events pile up but nothing processes them. What does your system look like during those windows?

📎 [Confluent — Incremental Cooperative Rebalancing](https://www.confluent.io/blog/incremental-cooperative-rebalancing-in-kafka/)

---

## Expected nova-thesis Rating (Initial Claim)

```
[Correctness: 4] [Completeness: 3] [Scalability: 5] [Security: 4] [Maintainability: 3]
Overall: 3.8/10 — 🔴 Not ready — no schema contract, no ordering guarantee clarified, no idempotency strategy, no dead letter handling
```
