# Scenario R — CI/CD Pipeline ("We've got CI/CD, deploys are automated")

## Metadata

| Field        | Value |
|---|---|
| **Domain**   | CI/CD / Deployment Pipelines |
| **Trigger phrases** | CI/CD, deployment pipeline, GitHub Actions, automated deploys, continuous deployment |
| **Added by** | @jerry7991 |
| **Date**     | 2026-04-14 |

---

## Developer's Claim

> "We set up GitHub Actions for CI/CD. Tests run on every PR, and merging to main auto-deploys to production. Fully automated, no manual steps."

---

## What a Weak Agent Says ❌ (without nova-thesis)

- "Automated CI/CD is best practice — great setup."
- "Make sure your tests have good coverage."
- "Consider adding a staging environment."

---

## What nova-thesis Must Challenge ✅

### Correctness
- "Tests run on every PR" — what KIND of tests? Unit tests pass on code that breaks in production every day. Do you have integration tests, contract tests, or smoke tests against a production-like environment?
- "Merging to main auto-deploys to production" — is there a canary or blue-green step, or does every merge go directly to 100% of traffic?

### Completeness

| Corner Case | What breaks |
|---|---|
| **Secret in the pipeline** | Hardcoded AWS keys or tokens in workflow files — anyone with repo read access can exfiltrate them via a PR that echoes secrets |
| **Supply chain via CI** | Dependency installed during CI (`npm install`) pulls a compromised package — malicious code runs in your pipeline with deploy credentials |
| **Flaky test gate** | Intermittent test failure → developer re-runs until green → merge → the real bug was masked by the flaky test, not by the code being correct |
| **No rollback automation** | Deploy goes out, metrics tank. How do you roll back? "Revert the PR and re-merge" is not a rollback plan — it takes 10+ minutes through CI |
| **Branch protection bypass** | Admin merges directly to main, skipping CI. Pipeline deploys untested code. Who audits force-merges? |
| **Deployment during incident** | Another team merges to main during an outage — auto-deploy pushes new code on top of a broken state, compounding the incident |

### Scalability
- How long does the CI pipeline take? If it's 20 minutes, developers stack PRs and merge in bursts — creating deploy queues and making it hard to isolate which merge caused a regression.
- At 50 developers merging daily, how do you handle merge conflicts in the deploy queue? What's the blast radius of a bad merge?

### Security
- Are your GitHub Actions workflow files reviewed with the same rigor as application code? A malicious workflow change in a PR can exfiltrate secrets before the PR is even approved.
- Are you using pinned action versions (`actions/checkout@v3.1.0`) or floating tags (`@v3`)? Floating tags are a supply chain vector — the action author can push malicious code to the same tag.
- What secrets does the deploy pipeline have access to? Can a compromised test step access production deploy credentials?

### Maintainability
- What happens when a deploy fails halfway? Is the deploy atomic, or can you end up with half the fleet on v1 and half on v2?
- Who gets paged when the pipeline breaks at 2am? Is there a runbook for CI infrastructure failures?

---

## 🔥 Real-World Postmortem References

### SolarWinds — 2020: Build Pipeline Compromise

**What happened:** Attackers compromised SolarWinds' CI/CD build pipeline, injecting malicious code into the Orion software update. The tainted build was signed and distributed to ~18,000 customers, including US government agencies. The attackers had access to the build system for months before detection. This is the canonical supply chain attack via CI/CD.

**Corner case mirrored:** Your CI/CD pipeline has production deploy credentials. If an attacker compromises any step in the pipeline — a dependency, a GitHub Action, a compromised maintainer account — they deploy to your production with your credentials.

📎 [CISA — SolarWinds Advisory](https://www.cisa.gov/news-events/directives/emergency-directive-21-01)

---

### Codecov — 2021: CI Secret Exfiltration

**What happened:** Attackers modified Codecov's Bash Uploader script (used in thousands of CI pipelines). The modified script exfiltrated environment variables — including CI secrets, API tokens, and credentials — from every CI run that used it. Affected companies included Twitch, HashiCorp, and hundreds of others. The compromise persisted for 2 months before detection.

**Corner case mirrored:** A third-party tool in your CI pipeline (`actions/`, `codecov/`, any orb or action) is a trust boundary. Your pipeline runs it with your secrets. "Fully automated" means fully exposed if any dependency in the chain is compromised.

📎 [Codecov Security Notice — April 2021](https://about.codecov.io/security-update/)

---

### GitHub Actions — 2022: `actions/checkout` Script Injection Pattern

**Pattern:** Multiple repositories were found vulnerable to script injection via GitHub Actions, where PR titles or branch names containing shell metacharacters could execute arbitrary code in the CI runner. The pattern exploited `${{ github.event.pull_request.title }}` being interpolated directly into `run:` steps. This gives any external contributor code execution in your CI environment.

**Corner case mirrored:** "Tests run on every PR" means untrusted code from external contributors runs in your CI environment. Without proper isolation (`pull_request_target` restrictions, sandboxed runners), your pipeline is an RCE vector.

📎 [GitHub Security Lab — Script Injection](https://securitylab.github.com/research/github-actions-preventing-pwn-requests/)

---

## Expected nova-thesis Rating (Initial Claim)

```
[Correctness: 4] [Completeness: 3] [Scalability: 5] [Security: 2] [Maintainability: 4]
Overall: 3.6/10 — 🔴 Not ready — pipeline is a high-value attack target with no supply chain hardening, no rollback plan, no deploy gating
```
