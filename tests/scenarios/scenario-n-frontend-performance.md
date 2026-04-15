# Scenario N — Frontend Performance ("Our Lighthouse score is 95, shipping tomorrow")

## Metadata

| Field        | Value |
|---|---|
| **Domain**   | Frontend / Web Performance |
| **Trigger phrases** | frontend performance, lighthouse score, core web vitals, bundle size, page load |
| **Added by** | @jerry7991 |
| **Date**     | 2026-04-14 |

---

## Developer's Claim

> "We redesigned the landing page. Lighthouse score is 95, LCP under 2 seconds on my MacBook Pro. Shipping tomorrow."

---

## What a Weak Agent Says ❌ (without nova-thesis)

- "95 is excellent! Great job optimizing."
- "LCP under 2s is solid — you're well within Core Web Vitals."
- "Maybe add some lazy loading for images below the fold."

---

## What nova-thesis Must Challenge ✅

### Correctness
- Lighthouse runs on a throttled simulation, not real user conditions. What does your field data (CrUX, RUM) show for 75th percentile users on 3G in emerging markets?
- Is 95 the mobile score or desktop? Desktop scores are typically 20-30 points higher and misleading.

### Completeness

| Corner Case | What breaks |
|---|---|
| **Low-end devices** | A $150 Android phone with 2GB RAM renders 3-5× slower than your MacBook — JS parse time alone can blow LCP past 4s |
| **Third-party scripts** | Analytics, chat widgets, A/B testing scripts load after Lighthouse audit and add 500ms–2s to real page load |
| **Unoptimized images on CMS** | Marketing uploads a 4MB hero image next week — no guardrails, Lighthouse score drops to 40 |
| **Font loading flash** | Custom fonts cause FOUT/FOIT on slow connections — CLS jumps, layout shifts frustrate users |
| **Bundle size regression** | No CI gate on bundle size — one developer adds a 200KB charting library and nobody notices until field metrics degrade |
| **CDN cache miss** | First visit after deploy hits origin — cold cache LCP can be 3× slower than cached |

### Scalability
- What's the JS bundle size? At what threshold does parse time dominate on mid-range mobile devices?
- Do you have a performance budget? What enforces it — CI gates, or hope?

### Security
- Are you loading any scripts from third-party CDNs without SRI (Subresource Integrity) hashes?
- Any inline scripts that would break under a strict Content-Security-Policy?

### Maintainability
- Who monitors field performance after launch? Is there a RUM dashboard with alerts on LCP/FID/CLS regression?
- When the next developer adds a heavy dependency, what stops the score from regressing to 60?

---

## 🔥 Real-World Postmortem References

### Facebook — 2019: Messenger App Size Crisis

**What happened:** Facebook's Messenger app grew from 30MB to over 130MB over several years. Performance degraded on low-end devices to the point of unusability. Facebook ultimately had to rebuild the entire app from scratch ("Project LightSpeed"), reducing it to 30MB — a multi-year engineering effort to undo what incremental feature additions had done.

**Corner case mirrored:** No bundle size gates or performance budgets → incremental bloat makes the product unusable for a significant user segment. Same as: no CI enforcement of bundle size.

📎 [Facebook Engineering: Project LightSpeed](https://engineering.fb.com/2020/03/02/data-infrastructure/messenger/)

---

### Walmart — 2012: Page Load Time Revenue Correlation

**What happened:** Walmart's engineering team discovered that for every 1 second of improvement in page load time, conversions increased by 2%. For every 100ms of improvement, incremental revenue grew by up to 1%. They published this data to justify a complete frontend performance overhaul.

**Corner case mirrored:** "95 Lighthouse score" is a lab metric — real-world performance directly impacts revenue. Testing only on high-end hardware masks the experience of your actual user base.

📎 [Web Performance Today — Walmart Case Study](https://www.webperformancetoday.com/2012/02/28/4-awesome-slides-showing-how-page-speed-correlates-to-business-metrics-at-walmart-com/)

---

### Twitter / X — 2023: Bundle Size and Third-Party Script Bloat

**Pattern:** Multiple reports of Twitter/X's web app performance degrading after the 2023 engineering changes. Third-party ad scripts, analytics, and A/B testing frameworks added cumulative load that was invisible in isolated Lighthouse audits but compounded in real user sessions with warm caches full of competing scripts.

**Corner case mirrored:** Lighthouse audits don't load third-party scripts that arrive via tag managers. Your 95 score is measuring a page your users will never see.

---

## Expected nova-thesis Rating (Initial Claim)

```
[Correctness: 4] [Completeness: 3] [Scalability: 4] [Security: 5] [Maintainability: 3]
Overall: 3.8/10 — 🔴 Not ready — lab metrics masking real-world performance risk, no regression prevention
```
