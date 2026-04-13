# Scenario K — Security ("We did a security review, we're good")

## Metadata

| Field | Value |
|---|---|
| **Domain** | Security / Breaches / Vulnerabilities |
| **Trigger phrases** | security review, pentest, we're secure, OWASP, auth bypass, access control, rate limiting, "security audit done" |
| **Added by** | nova-thesis core |
| **Date** | 2024-01-01 |

---

## Developer's Claim

> "We added a new API endpoint that lets users fetch their account details. It's behind authentication — you need a valid JWT. We did a security review internally and we're good to ship."

---

## What a Weak Agent Says ❌ (without nova-thesis)

- "JWT auth is standard — looks secure."
- "Internal security review is a good practice. Ship it."
- "Account detail endpoints are straightforward. Nice work."

---

## What nova-thesis Must Challenge ✅

### Correctness
- "Behind authentication" means a user must be logged in — but does the endpoint verify that the requesting user is only fetching **their own** account? An authenticated user requesting `/api/account?id=12345` for another user's ID is an IDOR (Insecure Direct Object Reference) — one of the most common and damaging vulnerabilities in web APIs.
- What did your internal security review actually check? Who ran it, and against what criteria? Self-review has a well-documented blind spot: reviewers don't attack their own assumptions.

### Completeness

| Corner Case | What breaks |
|---|---|
| **IDOR — missing object-level auth** | Authenticated user changes `?id=` parameter → fetches any other user's account data |
| **Horizontal privilege escalation** | User A can access User B's data by guessing/enumerating IDs |
| **Vertical privilege escalation** | Regular user hits admin endpoint that only checks "is logged in" not "is admin" |
| **No rate limiting** | Attacker enumerates all user IDs in hours — scrapes entire user database |
| **Sensitive data over-exposure** | Endpoint returns full user object including password hash, internal flags, SSN, DOB |
| **Mass assignment** | API accepts extra fields in request body that map to privileged model attributes |
| **Insecure Direct Object Reference via indirect field** | `?email=victim@example.com` also works — not just numeric IDs |
| **JWT not validated on every request** | Token verified at login but not re-checked on each request — revoked tokens still work |
| **No audit log** | Who accessed whose account, when — no forensic trail if breach occurs |
| **SSRF via URL parameter** | If endpoint accepts a URL parameter to fetch external data, attacker uses it to probe internal services |

### Scalability
- What's your rate limit on this endpoint? At no rate limit, a single attacker can enumerate 100K accounts in under an hour.
- Are database queries on this endpoint indexed? Fetching account by `id` is fine — but if any of the returned data joins unindexed tables, response times degrade at scale.

### Security
- Walk through the exact authorization check in code: does it compare the JWT's `sub` claim against the requested resource owner, or does it only check that the JWT is valid?
- What fields does this endpoint return? List them explicitly — are any of them fields the user shouldn't see (internal flags, other users' data, raw hashes)?
- Is there any parameter in this endpoint that accepts a URL, filename, or path? Each is a potential SSRF or path traversal vector.
- What happens if you send a request with no `Authorization` header? With a malformed JWT? With an expired JWT?

### Maintainability
- Is there an automated security test (integration test) that verifies User A cannot access User B's data? Or is this trust maintained by code review alone?
- How will you detect if this endpoint is being abused? What anomaly would trigger an alert — 1000 requests per minute from one IP? 100 different account IDs fetched per session?

---

## 🔥 Real-World Postmortem References

### Capital One — July 2019: SSRF via Misconfigured WAF → 100M Records

**What happened:** A former AWS employee exploited a Server-Side Request Forgery (SSRF) vulnerability in Capital One's web application firewall configuration. By sending a crafted request, they caused Capital One's server to query the AWS EC2 metadata service — which returned IAM credentials. Those credentials had overly permissive S3 access. **106 million customers'** credit card applications were exfiltrated. $80M fine. Ongoing litigation.

**Corner case mirrored:** One API endpoint that accepts external input + no SSRF protection + overprivileged IAM role = full data exfiltration. "Behind authentication" does not prevent SSRF.

📎 [DOJ Complaint — Capital One Breach](https://www.justice.gov/usao-wdwa/press-release/file/1188626/download)

---

### Uber — October 2016: IDOR → 57M Records

**What happened:** Attackers found Uber's GitHub repository (accidentally public) containing AWS credentials. Using those credentials, they accessed an S3 bucket containing a database backup with 57 million driver and rider records. But the initial entry point was an IDOR in an internal API — an authenticated endpoint that didn't verify the requester owned the resource being requested.

**Corner case mirrored:** IDOR on authenticated API endpoint + missing object-level authorization = any authenticated user can access any resource. "Authenticated" ≠ "authorized."

📎 [FTC Settlement — Uber Data Breach](https://www.ftc.gov/news-events/news/press-releases/2018/04/uber-settles-ftc-allegations-it-made-deceptive-privacy-data-security-claims)

---

### Twitch — October 2021: Source Code + Creator Payouts Leaked

**What happened:** Twitch suffered a breach where 125GB of internal data — including source code, internal security tools, and creator payout data — was posted publicly. The attack vector was an exposed internal API with insufficient access controls. Internal "admin-only" endpoints were reachable by any authenticated employee account with no role check.

**Corner case mirrored:** Missing vertical privilege escalation check — endpoint checks "is logged in" but not "has required role." Internal security review missed it because internal reviewers assume good intent.

📎 [Twitch Breach Confirmation — October 2021](https://blog.twitch.tv/en/2021/10/15/an-update-on-the-twitch-security-incident/)

---

### Peloton — May 2021: Unauthenticated IDOR on User API

**What happened:** Security researcher Jan Masters discovered that Peloton's API endpoint for fetching user profile data — including age, weight, location, workout data — required no authentication whatsoever. Any person could enumerate user IDs and download private profile data for all 4+ million users. Peloton was notified but took 90 days to fix it.

**Corner case mirrored:** Authentication check removed or bypassed during development → entire user database is publicly enumerable. Even a "reviewed" endpoint can have its auth check accidentally stripped in a subsequent PR.

📎 [TechCrunch — Peloton API Vulnerability](https://techcrunch.com/2021/05/05/peloton-bug-account-data/)

---

## Expected nova-thesis Rating (Initial Claim)

```
[Correctness: 4] [Completeness: 2] [Scalability: 4] [Security: 3] [Maintainability: 3]
Overall: 3.2/10 — 🔴 "internal security review" is not a penetration test — it's a blind spot audit
```
