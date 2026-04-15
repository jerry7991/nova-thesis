---
name: Bug report
about: The skill failed to challenge correctly, missed a known failure mode, or cited a fabricated incident
title: ''
labels: bug
assignees: ''

---

**What was the implementation presented?**
Describe (or paste) the claim that was challenged.

**What did nova-thesis do wrong?**
- [ ] Missed a failure mode it should have caught
- [ ] Gave a score that was too high (false validation)
- [ ] Gave a score that was too low (overchallenging)
- [ ] Cited a fabricated or incorrect incident
- [ ] Failed to ask follow-up questions on a low-scoring dimension
- [ ] Accepted a rationalization it should have blocked
- [ ] Other (describe below)

**Expected behavior**
What should the skill have done instead? Reference a specific dimension, property (P1–P8), or scenario (A–T) if applicable.

**Which property invariant was violated?**
- [ ] P1: dimensions-always-rated
- [ ] P2: postmortem-always-cited
- [ ] P3: low-score-triggers-questions
- [ ] P4: rationalization-blocked
- [ ] P5: correct-termination
- [ ] P6: no-false-validation
- [ ] P7: incident-not-fabricated
- [ ] P8: challenge-intensity-matches-score
- [ ] Not sure / not a property violation

**Environment**
- Plugin version: [e.g., 1.0.2]
- Platform: [Claude Code / GitHub Copilot CLI]
- Model: [if known]

**Additional context**
Paste relevant output, screenshots, or the full challenge transcript if available.
