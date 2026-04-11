# nova-thesis

> Every solution is a thesis. Defend it.

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

## Skills

| Skill | Purpose |
|---|---|
| [`challenging-implementations`](./skills/challenging-implementations.md) | Core challenger skill |

---

## Built With (Approach)

Follows the **writing-skills TDD cycle**:
- **RED** — test scenarios run without the skill to document agent failures
- **GREEN** — write the skill to fix those failures  
- **REFACTOR** — close loopholes and rationalization patterns

---

## Status

🚧 In development — RED phase (building test scenarios)
