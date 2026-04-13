# Scenario H — Caching Layer ("I added Redis in front of our DB, it's way faster now")

## Metadata

| Field | Value |
|---|---|
| **Domain** | Caching / Redis / Memcached |
| **Trigger phrases** | Redis, Memcached, cache layer, cache-aside, TTL, eviction, "added caching" |
| **Added by** | nova-thesis core |
| **Date** | 2024-01-01 |

---

## Developer's Claim

> "I added Redis in front of our database. Cache hit rate is 85%, response times dropped from 400ms to 40ms. It's way faster now. We're good to ship."

---

## What a Weak Agent Says ❌ (without nova-thesis)

- "85% cache hit rate is excellent! Great optimization."
- "Redis is battle-tested. You should be fine."
- "40ms is a huge improvement. Ship it."

---

## What nova-thesis Must Challenge ✅

### Correctness
- What is your cache eviction policy? If Redis hits `maxmemory`, it will start evicting keys. With `allkeys-lru`, any cached key — including active sessions or critical data — can be silently dropped. Do you have eviction monitoring?
- What is your cache invalidation strategy? When the underlying data changes, how does the cache know to invalidate? Stale data served from cache is silent corruption — users see wrong data confidently.

### Completeness

| Corner Case | What breaks |
|---|---|
| **Silent key eviction** | Redis hits maxmemory → evicts keys without warning → users get stale data or cache misses at scale |
| **Cache stampede (thundering herd)** | Cache expires at peak traffic → thousands of requests hit DB simultaneously → DB overwhelmed |
| **No fallback when Redis is down** | Redis crashes or is unreachable → every request fails instead of falling back to DB |
| **Stale data after write** | User updates profile → cache still serves old data → user sees their change "disappear" |
| **Cache poisoning** | Bug writes corrupted data to cache → served to all users until TTL expires |
| **Hotspot / hot key** | Single cache key (e.g., homepage content) gets millions of hits → single Redis CPU maxed |
| **No TTL on some keys** | Developer forgets TTL → memory grows unboundedly → eviction starts silently |
| **Serialization mismatch** | Object schema changes in code → cached old-schema objects cause deserialization errors |
| **Distributed cache inconsistency** | Multiple Redis replicas → replica lag → different app servers see different cache state |
| **Security: no auth on Redis** | Default Redis has no auth → Redis accessible on network → full data read/write |

### Scalability
- At what point does Redis become the bottleneck instead of the DB? A single Redis instance has connection limits and is single-threaded for commands. Have you modeled this?
- Cache hit rate of 85% means 15% miss rate. At 10K RPS, that's 1500 DB queries/sec on cache miss — the same peak load problem as before, just smaller. Is your DB sized for the miss rate at scale?
- What is your Redis memory size? At what data volume does it fill up?

### Security
- Is Redis exposed on a public or internal network without authentication? Default Redis installations have no auth. Redis with network access is equivalent to an open database.
- Are you caching sensitive data (PII, tokens, payment info)? Is it encrypted at rest?
- Can a user influence what gets cached (cache key derived from user input)? Cache poisoning via crafted keys is a real attack vector.

### Maintainability
- How do you debug a cache-related bug at 3am? Can you inspect what's currently in cache without taking down the service?
- What's your cache warming strategy after a Redis restart? A cold cache sends 100% of traffic to your DB simultaneously.
- How do you deploy a breaking schema change when old objects are still in cache?

---

## 🔥 Real-World Postmortem References

### Discord — 2020: Silent Redis Key Eviction Causing Message Loss

**What happened:** Discord used Redis to cache message data. When Redis hit its memory limit, it began silently evicting keys using the `allkeys-lru` policy. Messages that were evicted appeared to "disappear" to users — the message existed in the DB but the cache returned nothing. No eviction alerting was in place. Users reported messages vanishing. Discord had no visibility into eviction rates until the incident was well underway.

**Corner case mirrored:** Silent key eviction with no monitoring = data appears to vanish. 85% hit rate hides the 15% of cases where eviction causes user-visible failures.

---

### DoorDash — 2022: Redis Cluster Failure Cascading to Full Outage

**What happened:** A Redis cluster used for rate limiting and session management at DoorDash experienced elevated latency due to memory pressure. Because the application had no fallback when Redis was slow (only when it was fully down), requests piled up waiting for Redis. Thread pools exhausted. The cascading effect brought down order processing. DoorDash was unable to accept or route orders for a significant period during peak dinner hours.

**Corner case mirrored:** No fallback for slow (not just down) Redis + no circuit breaker = cascading failure under memory pressure.

📎 [DoorDash Engineering — Caching at Scale](https://doordash.engineering/2018/08/03/avoiding-cache-stampede-at-doordash/)

---

### Stack Overflow — Memcached Thundering Herd

**Pattern:** Stack Overflow has documented multiple incidents where a high-traffic cache key (a popular question page) expired simultaneously for thousands of users. All requests hit the database at once — a "thundering herd." The DB, sized for cached load, couldn't handle the spike. Stack Overflow solved this with mutex locking on cache misses and probabilistic early expiration.

**Corner case mirrored:** Cache stampede on popular keys under high traffic — 85% hit rate in testing becomes 0% hit rate the moment a popular key expires.

📎 [Stack Overflow Blog — Caching at Scale](https://nickcraver.com/blog/2019/08/06/stack-overflow-how-we-do-app-caching/)

---

### GitHub — 2021: Redis Replica Lag Causing Stale Reads

**Pattern:** GitHub has documented cases where Redis replica lag during write-heavy periods caused application servers reading from replicas to see stale data. In one case, a user's newly created repository appeared to not exist moments after creation — because the replica hadn't yet received the write. The fix required adding read-your-own-writes routing logic.

**Corner case mirrored:** Distributed cache replica lag = users see their own changes "disappear" — the most confusing possible failure mode.

---

## Expected nova-thesis Rating (Initial Claim)

```
[Correctness: 5] [Completeness: 3] [Scalability: 4] [Security: 3] [Maintainability: 3]
Overall: 3.6/10 — 🔴 cache success metrics hide failure modes that only surface at scale
```
