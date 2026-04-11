# nova-thesis

> Every solution is a thesis. Defend it.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Plugin](https://img.shields.io/badge/Copilot-Plugin-blue?logo=githubcopilot)](./skills/challenging-implementations/SKILL.md)

**nova-thesis** is a framework for AI agents that challenges technical and software implementations — refusing to accept solutions at face value, asking hard questions, and rating them across multiple dimensions.

Inspired by how stars go nova: intense, revealing, transformative.

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

## Install as a Copilot / Claude Plugin

### GitHub Copilot CLI
```
copilot plugin install jerry7991/nova-thesis
```

### Claude Code (or any agent supporting skills)
Add to your agent's plugin list:
```
jerry7991/nova-thesis
```

Once installed, the `challenging-implementations` skill is available automatically. The agent will challenge implementations when presented with any technical, software, or AI solution.

---

## Skills

| Skill | Trigger |
|---|---|
| [`challenging-implementations`](./skills/challenging-implementations/SKILL.md) | Any technical, software, or AI/ML implementation presented for review |

---

## Scenarios & Postmortems

6 real-world test scenarios with corner cases mapped to actual incidents:

| Scenario | Real Postmortem |
|---|---|
| Payment API | Knight Capital — $440M in 45 minutes |
| AI Model Deployment | Zillow — $500M loss, business unit shut down |
| Ship It Under Pressure | Equifax — 147M records, $700M settlement |
| Database Migration | Atlassian 2022 — 400 customers offline 14 days |
| Microservice Design | Netflix 2012 — directly caused Hystrix to be built |
| Infra / Terraform Change | AWS S3 2017 — one typo, 4-hour global outage |

---

## CLI

Run the interactive challenge session locally:

```bash
npm install
node cli/index.js
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) to add new scenarios + postmortem pairs.
