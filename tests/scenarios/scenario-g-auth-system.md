# Scenario G — Auth System ("I built our own auth, it's working great")

## Metadata

| Field | Value |
|---|---|
| **Domain** | Auth / Identity / OAuth |
| **Trigger phrases** | JWT, OAuth, session tokens, authentication, login system, SSO, "built our own auth" |
| **Added by** | nova-thesis core |
| **Date** | 2024-01-01 |

---

## Developer's Claim

> "I built our authentication system from scratch. It uses JWT tokens stored in localStorage, expiry is 30 days, and we have a login/logout flow. It's working great in testing."

---

## What a Weak Agent Says ❌ (without nova-thesis)

- "JWTs are industry standard — looks good!"
- "30-day tokens are convenient for users."
- "localStorage is easy to work with. Nice."

---

## What nova-thesis Must Challenge ✅

### Correctness
- JWT tokens in localStorage are accessible to any JavaScript on your page — including third-party scripts, analytics, and ads. An XSS vulnerability anywhere on your site means every logged-in user's token is stolen. How are you preventing XSS?
- How do you invalidate a JWT before its 30-day expiry? If a user's token is stolen, or they change their password, or an admin revokes access — the token is still valid for up to 30 days with no server-side check.

### Completeness

| Corner Case | What breaks |
|---|---|
| **XSS → localStorage token theft** | Any injected script reads `localStorage.getItem('token')` — silent session hijack |
| **No token revocation** | Compromised token valid for 30 days — stolen credentials can't be invalidated |
| **No refresh token rotation** | Replay attack: attacker reuses a stolen refresh token indefinitely |
| **Missing PKCE on OAuth flows** | Authorization code interception attack — attacker exchanges the code |
| **Weak signing secret** | Brute-forced HS256 secret → attacker forges valid JWTs for any user |
| **No rate limiting on login** | Credential stuffing: attacker tries 100K username/password combos undetected |
| **JWT `alg: none` attack** | Some libraries accept `alg: none` — attacker crafts unsigned token with any claims |
| **No MFA on privileged accounts** | Admin account compromised via phishing — no second factor |
| **CSRF on state-changing endpoints** | If you migrate to cookies later, no CSRF protection = forged requests |
| **Token scope not enforced** | Token valid for `/api/user` also accepted by `/api/admin` — missing scope check |

### Scalability
- With 30-day JWT expiry and no revocation list, how do you handle a security incident requiring mass logout? You'd need to rotate your signing secret — instantly invalidating every active session globally.
- If you move to a token blocklist for revocation, you've re-introduced server state. Have you planned for the Redis/DB dependency this creates?

### Security
- Are you validating the `alg` field in the JWT header? Libraries that trust the `alg` claim are vulnerable to algorithm confusion attacks (RS256 → HS256 using the public key as the HMAC secret).
- Is the JWT signing secret stored in environment variables with rotation capability, or is it hardcoded?
- What's your secret length? NIST recommends ≥ 256 bits for HS256 — short secrets are brute-forceable offline from a single captured token.
- Are password hashes using bcrypt/argon2 with a per-user salt? Or MD5/SHA1?

### Maintainability
- How do you rotate the signing key without logging out every user simultaneously?
- Is there an audit log of authentication events (login, logout, failed attempts, token refresh)?
- How will you detect an ongoing credential stuffing attack? What's the alerting threshold?

---

## 🔥 Real-World Postmortem References

### CircleCI — January 2023: Secret Exfiltration via Compromised Token

**What happened:** A CircleCI employee's laptop was compromised with malware that stole session tokens — bypassing 2FA. The attacker used the tokens to gain access to CircleCI's production infrastructure and exfiltrated customer secrets (API keys, environment variables). CircleCI had to ask all customers to rotate every secret immediately.

**Corner case mirrored:** Long-lived tokens that bypass MFA + no anomaly detection on session usage = an attacker dwell time of weeks with full access.

📎 [CircleCI Security Alert — January 2023](https://circleci.com/blog/jan-4-2023-incident-report/)

---

### LastPass — August 2022: Developer Credential Compromise → Vault Theft

**What happened:** A LastPass developer's home computer was compromised. The attacker used stolen credentials to access LastPass's cloud storage. Over several months, they exfiltrated encrypted customer password vaults. The breach wasn't detected until months later. 25 million customers' vault data — though encrypted — was stolen.

**Corner case mirrored:** Compromised developer credentials + no anomaly detection + no session revocation = months of undetected access. "It's working great" right up until it isn't.

📎 [LastPass Breach Details — December 2022](https://blog.lastpass.com/2022/12/notice-of-recent-security-incident/)

---

### Twitter — June 2020: Admin Tool Compromise via Phone Phishing

**What happened:** Twitter employees were social-engineered via phone calls into providing access to internal admin tools. The attacker used these tools to take over high-profile accounts (Obama, Biden, Musk, Apple) and post Bitcoin scam tweets. Twitter had no MFA requirement on internal tools and no alerting on unusual admin actions.

**Corner case mirrored:** No MFA on privileged access + no anomaly detection on admin actions = social engineering bypasses your entire auth system.

📎 [Twitter Transparency Report — Coordinated Social Engineering](https://blog.twitter.com/en_us/topics/company/2020/an-update-on-our-security-incident)

---

### Auth0 / Okta — March 2022: LAPSUS$ Breach via Stolen Session

**What happened:** LAPSUS$ obtained valid session cookies for an Okta support engineer's account. Because the session was valid, it bypassed MFA entirely. They used this access to view ~366 Okta customer tenants. Okta's initial response minimized the impact — leading to further reputational damage when the true scope was revealed.

**Corner case mirrored:** Valid session token = full access regardless of MFA. No revocation of session on anomalous access pattern = breach goes undetected.

📎 [Okta Incident Report — March 2022](https://www.okta.com/blog/2022/03/oktas-investigation-of-the-january-2022-compromise/)

---

## Expected nova-thesis Rating (Initial Claim)

```
[Correctness: 4] [Completeness: 2] [Scalability: 4] [Security: 2] [Maintainability: 3]
Overall: 3.0/10 — 🔴 "working in testing" is the most dangerous phrase in auth
```
