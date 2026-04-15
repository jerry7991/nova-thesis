# <img src="assets/nova-icon.png" alt="nova" width="36" height="36"> nova-thesis



> #### Every solution is a thesis. Defend it.


[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Plugin](https://img.shields.io/badge/Copilot-Plugin-blue?logo=githubcopilot)](./skills/challenging-implementations/SKILL.md)

**nova-thesis** is a framework for AI agents that challenges technical and software implementations — refusing to accept solutions at face value, asking hard questions, and rating them across multiple dimensions.

#### Inspired by how stars go nova: intense, revealing, transformative.

---

## What It Does

When a developer presents any implementation, nova-thesis:

1. **Challenges** it across 5 dimensions
2. **Rates** each dimension (1–10)
3. **Keeps pushing** until the solution reaches a defensible standard
4. **Stops** only when the solution genuinely holds up — or the author consciously accepts the trade-offs

---

## The 5-Dimension Framework

| Dimension | What Gets Challenged |
|---|---|
| **Correctness** | Does it actually solve the stated problem? |
| **Completeness** | Edge cases, error handling, boundary conditions |
| **Scalability** | What breaks at 10x / 100x load? |
| **Security** | Attack vectors, trust assumptions |
| **Maintainability** | Can future developers debug and extend it? |

---

## Rating System

```
[Correctness: 6] [Completeness: 4] [Scalability: 7] [Security: 5] [Maintainability: 8]
Overall: 6/10 — still challenging...
```

- **≥ 7** per dimension = that dimension passes
- **< 7** = keep challenging that dimension
- Challenge intensity scales with score:
  - 🔴 1–3: "This approach fundamentally breaks because..."
  - 🟠 4–6: "What specifically happens when X fails?"
  - 🟡 7–8: "Have you considered..."
  - ✅ 9–10: Passes

---

## Install as a Plugin

Both GitHub Copilot CLI and Claude Code read the same `.claude-plugin/plugin.json` manifest, so this repo installs cleanly into either.

### GitHub Copilot CLI
```
copilot plugin install jerry7991/nova-thesis
```

Manage the install with `copilot plugin list`, `copilot plugin update nova-thesis`, or `copilot plugin uninstall nova-thesis`.

### Claude Code
Add this repo as a marketplace, then install the plugin:
```
/plugin marketplace add jerry7991/nova-thesis
/plugin install nova-thesis@nova-thesis
```

### What you get
Once installed, the `challenging-implementations` skill is available automatically. Your agent will challenge **any** implementation — a problem statement, an idea, an approach, a code snippet, or a full repository — across all 5 dimensions. Categories aren't gated: if the dimensions apply, the challenge runs.

---

## Skills

| Skill | Trigger |
|---|---|
| [`challenging-implementations`](./skills/challenging-implementations/SKILL.md) | Any implementation — problem, idea, approach, code snippet, or full repository |

---

## What It Looks Like in Practice

Here's what happens when you present an implementation to nova-thesis:

**You say:**
> "Added Redis caching. 85% hit rate, pages load 10× faster. Ship it."

**A weak agent says:** "Great cache hit rate! Maybe add some TTL expiry."

**nova-thesis says:**

```
[Correctness: 5] [Completeness: 3] [Scalability: 5] [Security: 5] [Maintainability: 4]
Overall: 4.4/10 — 🔴 Not ready — fundamental risks unaddressed

Challenging Completeness (3/10):

1. What happens when Redis goes down? Does your app fall back to the DB,
   or does it return errors to every user?

2. What's your eviction policy? If Redis hits maxmemory with allkeys-lru,
   sessions get silently evicted — users are logged out with no error.

3. Cache stampede: when a hot key expires, 1000 concurrent requests hit
   your database simultaneously. How do you prevent this?

⚠️ Real incident: Discord, 2020. Their Redis message cache hit memory
limits silently. Redis evicted keys without warning. Users lost sessions,
messages vanished. No eviction alerting existed. Your setup has the
same blind spot.
```

The challenge continues — dimension by dimension — until all scores reach 7/10 or you explicitly accept the trade-offs.

---

## Example Coverage (20 Scenarios)

The plugin challenges **any** implementation type by applying the 5 dimensions and searching the web for matching incidents. It is not limited to the categories below — these are illustrative test scenarios that live in `tests/scenarios/`:

| Scenario | Real Postmortem |
|---|---|
| Payment API | Knight Capital — $440M in 45 minutes |
| AI Model Deployment | Zillow — $500M loss, business unit shut down |
| Ship It Under Pressure | Equifax — 147M records, $700M settlement |
| Database Migration | Atlassian 2022 — 400 customers offline 14 days |
| Microservice Design | Netflix 2012 — directly caused Hystrix to be built |
| Infra / Terraform Change | AWS S3 2017 — one typo, 4-hour global outage |
| Auth System | CircleCI 2023, LastPass 2022 — token/vault compromises |
| Caching Layer | Discord 2020 — silent Redis eviction |
| Third-Party Dependency | log4shell 2021, xz-utils 2024 — supply chain attacks |
| Data Pipeline | Meta — silent data corruption pattern |
| Security Breach | Capital One 2019 — SSRF, 100M records |
| Mobile Release | Facebook iOS 2014 — crash loop, no rollback |
| Queueing System | GitHub 2018, Robinhood 2020 — job failures |
| Frontend Performance | Facebook Messenger 2019 — app bloat forced complete rebuild |
| API Versioning | Twitter 2012 — 18-month sunset disaster |
| Multi-Tenant Isolation | Salesforce 2019 — cross-tenant data exposure |
| Cloud Cost / Billing | Segment 2018 — Lambda more expensive than EC2 at scale |
| CI/CD Pipeline | SolarWinds 2020 — 18,000 customers via build compromise |
| Event-Driven Architecture | CrowdStrike 2024 — 8.5M machines, no staged rollout |
| **Defended Thesis** | First passing scenario (7.2/10) — proves the skill approves strong work |

If your implementation doesn't fit these categories, the plugin still challenges it the same way: map the 5 dimensions, find the riskiest gap, surface a real-world incident (web search first, then recalled knowledge), and push until the thesis is defended.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) to add new scenarios + postmortem pairs.
