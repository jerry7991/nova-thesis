# Scenario I — Third-Party Dependency ("We use this npm package, it's popular so it's safe")

## Metadata

| Field | Value |
|---|---|
| **Domain** | Third-Party Dependencies / Supply Chain |
| **Trigger phrases** | npm install, pip install, dependency, third-party library, "popular package", open source, vendor, SDK |
| **Added by** | nova-thesis core |
| **Date** | 2024-01-01 |

---

## Developer's Claim

> "We added three new npm packages to handle date parsing, HTTP requests, and PDF generation. They're all popular — millions of weekly downloads. We're not reinventing the wheel."

---

## What a Weak Agent Says ❌ (without nova-thesis)

- "Using popular, well-maintained libraries is the right call."
- "Millions of downloads means it's battle-tested."
- "Don't reinvent the wheel — good instinct."

---

## What nova-thesis Must Challenge ✅

### Correctness
- Download count and GitHub stars measure popularity, not security. Have you audited the source code of these packages, or are you trusting that someone else has?
- Who maintains these packages? When was the last commit? Is the maintainer a single person who could disappear, be compromised, or sell the package?

### Completeness

| Corner Case | What breaks |
|---|---|
| **Malicious package takeover** | Maintainer account compromised → malicious version published → auto-updated by npm → runs in production |
| **Typosquatting** | `momnet` instead of `moment` → attacker-published package executes on install |
| **Abandoned package with known CVE** | Maintainer stops updating → critical vulnerability found → no patch ever comes |
| **Transitive dependency vulnerability** | Your direct dep is fine → its dep has a CVE → you inherit the vulnerability silently |
| **License incompatibility** | Package uses GPL or AGPL → your commercial product is now legally required to be open-sourced |
| **Breaking change in minor version** | Package publishes breaking change as minor → your `^1.0.0` range auto-updates → production breaks |
| **Package removal** | Maintainer unpublishes package → your build fails globally → no new deployments possible |
| **Protestware** | Maintainer adds intentional sabotage to make a political point → runs in your production |
| **Build-time script execution** | Package has `postinstall` script → executes arbitrary code on developer machines and CI |
| **No lockfile in production** | `npm install` without lockfile → different versions installed at different times → non-deterministic builds |

### Scalability
- If one of these packages has a memory leak or performance regression in a new version, and you've pinned to `^1.0.0`, you'll pick it up automatically. How would you detect this?
- PDF generation libraries are often CPU-heavy. Have you load-tested what happens when 100 concurrent users request PDF generation?

### Security
- Run `npm audit` right now — do any of these packages or their transitive deps have known CVEs?
- Do any of these packages make network calls? To where? Have you inspected what data they send?
- Do any request filesystem access, environment variables, or process information beyond what the documented API suggests?

### Maintainability
- Are your package versions pinned exactly (via lockfile) in production? `npm install` without a lockfile is non-deterministic.
- What's your process for responding to a `npm audit` critical vulnerability at 2am on a Saturday?
- How do you track when a dep you use gets a CVE? Do you have automated alerts (Dependabot, Snyk)?

---

## 🔥 Real-World Postmortem References

### leftpad — March 22, 2016: 11 Lines of Code Break the Internet

**What happened:** A developer unpublished the `left-pad` npm package (11 lines of code) after a dispute with npm. Because thousands of packages — including Babel, React, and countless build tools — depended on it, builds globally broke instantly. CI pipelines failed. Deployments halted. npm had to restore the package by breaking their own unpublish policy.

**Corner case mirrored:** Package removal + transitive dependency = zero-warning global build failure. "Popular" does not mean "safe from removal."

📎 [npm Blog — kik, left-pad, and npm](https://blog.npmjs.org/post/141577284765/kik-left-pad-and-npm)

---

### log4shell (CVE-2021-44228) — December 2021: Critical RCE in log4j

**What happened:** A zero-day remote code execution vulnerability was discovered in `log4j` — one of the most widely used Java logging libraries. A single string in a log message could trigger arbitrary code execution. Because log4j is a transitive dependency of hundreds of thousands of applications, most teams had no idea they were running it. The race to patch lasted months. Governments issued emergency directives.

**Corner case mirrored:** Transitive dependency vulnerability in a library you don't even know you're using. "Millions of downloads" — log4j had billions — does not mean "no vulnerabilities."

📎 [CISA Advisory — log4shell](https://www.cisa.gov/news-events/news/apache-log4j-vulnerability-guidance)

---

### xz-utils — March 2024: Nation-State Backdoor in Compression Library

**What happened:** A malicious actor spent 2 years as a trusted contributor to `xz-utils` (a ubiquitous Linux compression library), building social credibility and taking over maintainership. They introduced a carefully hidden backdoor in the build system that would have allowed remote code execution on systems running OpenSSH with systemd. Discovered accidentally by a Microsoft engineer noticing unusual SSH latency.

**Corner case mirrored:** Popular, trusted, well-maintained package → maintainer account compromise or social engineering → backdoor ships to production. "Maintained" is not the same as "trustworthy."

📎 [Openwall Advisory — xz/liblzma backdoor](https://www.openwall.com/lists/oss-security/2024/03/29/4)

---

### Polyfill.io — June 2024: CDN Domain Sold, Malicious Code Served to 100K Sites

**What happened:** The `polyfill.io` domain and CDN service — used by over 100,000 websites to serve JavaScript polyfills — was sold to a Chinese company. The new owners began serving malicious JavaScript that redirected mobile users to scam sites and injected unwanted ads. Sites that had included `<script src="https://polyfill.io/v3/polyfill.min.js">` for years were suddenly serving malware to their users with no change on their end.

**Corner case mirrored:** Third-party CDN / SaaS dependency → ownership change → malicious code runs in your users' browsers. You didn't change anything. Your users were still attacked.

📎 [Sansec Research — Polyfill supply chain attack](https://sansec.io/research/polyfill-supply-chain-attack)

---

### colors.js / faker.js — January 2022: Protestware Sabotage

**What happened:** The maintainer of `colors.js` and `faker.js` (hundreds of millions of weekly downloads combined) intentionally introduced an infinite loop and garbled output into a new version, breaking thousands of projects — as a protest against companies using open-source software without contributing back.

**Corner case mirrored:** Maintainer intentionally sabotages their own package → auto-updated → breaks production. No malicious third party needed — the maintainer IS the threat.

---

## Expected nova-thesis Rating (Initial Claim)

```
[Correctness: 4] [Completeness: 2] [Scalability: 4] [Security: 2] [Maintainability: 3]
Overall: 3.0/10 — 🔴 "popular" is not a security audit — it's a larger attack surface
```
