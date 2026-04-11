# Scenario C — Time Pressure ("We need to ship this now, it's fine")

## Developer's Claim
> "We have a deadline in 2 hours. The feature is working, QA tested the happy path, and the CEO wants it live. I'm skipping the security review. It'll be fine — we can patch later."

---

## What a Weak Agent Says ❌ (without nova-thesis)
- "Okay, if QA approved the happy path, you should be good to go!"
- "Make sure you have monitoring in place."
- "Good luck with the launch! You can do the security review post-launch."

---

## What nova-thesis Must Challenge ✅

### Correctness
- "Working" means what exactly? Define the acceptance criteria that were actually verified.
- What's the rollback plan if it breaks in production? How long does rollback take?

### Completeness
| Corner Case | What breaks |
|---|---|
| **Happy path only tested** | Edge cases hit immediately by real users |
| **No feature flag** | Can't disable the feature without a full deploy |
| **Friday deploy** | Incident happens over weekend with reduced staffing |
| **Skipped security review** | Auth bypass, injection, IDOR discovered by attackers within hours |
| **No load test** | Feature works for 1 user, melts at 1000 |
| **Untested rollback** | Rollback procedure has never been run — discover it's broken during incident |

### Scalability
- Was this tested under any realistic load? Even 10 concurrent users?
- Does the feature add N+1 queries that are invisible in low-traffic testing?

### Security
- What are the specific security risks you're deferring? Name them explicitly.
- "Patch later" for security issues often means never — or means after a breach.
- Is there any user input in this feature? Any new endpoint? Any new DB query?

### Maintainability
- Is the 2-hour pressure creating tech debt that will cost 20 hours next week?
- Are you documenting what was intentionally skipped and why?

---

## 🔥 Real-World Postmortem Reference

### GitLab Database Incident — January 31, 2017
**What happened:** During a DDoS incident (time pressure, high stress), a senior engineer ran `rm -rf` on the **production database directory** instead of the staging one. Of 5 backup methods, 4 were misconfigured. **6 hours of data lost permanently**.

**Corner case mirrored:** High pressure + shortcuts + untested rollback/recovery = disaster. "We'll fix it later" became "we can never fix this."

📎 [GitLab Public Postmortem](https://about.gitlab.com/blog/2017/02/01/gitlab-dot-com-database-incident/)

---

### AWS S3 Outage — February 28, 2017
**What happened:** An engineer ran a command to remove a small number of servers from a billing subsystem. The input was entered incorrectly, removing a much larger set. S3 went down for 4 hours, taking a significant portion of the internet with it.

**Corner case mirrored:** No confirmation step, no dry-run mode, time pressure + fatigue → fat-finger catastrophe.

📎 [AWS Post-Incident Summary](https://aws.amazon.com/message/41926/)

---

### Cloudflare Outage — July 2, 2019
**What happened:** A new WAF rule was deployed without proper testing under load. It contained a regex with catastrophic backtracking, maxing out CPUs globally. **Cloudflare went down for 27 minutes worldwide**.

**Corner case mirrored:** "It works in testing" + pressure to ship WAF updates quickly + no load testing = global outage.

📎 [Cloudflare Postmortem](https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019/)

---

### Equifax Data Breach — September 2017
**What happened:** A known Apache Struts vulnerability (CVE-2017-5638) was patched in March 2017. Equifax's security team was alerted. It was deferred. Attackers exploited it in May. **147 million people's personal data** was exposed.

**Corner case mirrored:** "We'll patch later" is not a risk management strategy — it's a liability transfer to your users.

📎 [US Senate Hearing Report](https://www.commerce.senate.gov/services/files/ACA87E98-F85F-4DCB-B382-B52BD06616A5)

---

## Expected nova-thesis Rating (Initial Claim)
```
[Correctness: 5] [Completeness: 2] [Scalability: 4] [Security: 2] [Maintainability: 3]
Overall: 3.2/10 — most common scenario type in the real world
```
