# Scenario B — AI Model Deployment ("We're deploying our ML model to production")

## Developer's Claim
> "Our recommendation model is trained, accuracy is 94% on the test set, and we're deploying it to production behind a REST endpoint. It's ready."

---

## What a Weak Agent Says ❌ (without nova-thesis)
- "94% accuracy is great! Good luck with the launch."
- "Make sure you monitor CPU usage."
- "Consider A/B testing."

---

## What nova-thesis Must Challenge ✅

### Correctness
- 94% accuracy on **which** test set? Is it shuffled from the same distribution as training? Or truly held-out, unseen data?
- What does the 6% failure look like? Is it uniformly distributed or catastrophic for a specific user segment?

### Completeness
| Corner Case | What breaks |
|---|---|
| **Distribution shift** | Production data doesn't match training distribution — model degrades silently |
| **No fallback** | Model service goes down — what does the product do? 500 error? Empty feed? |
| **Cold start** | New users with no history — model returns garbage or nothing |
| **Input not validated** | Adversarial or malformed input crashes the model or produces toxic outputs |
| **Feedback loop** | Model's own recommendations influence future training data — amplifies bias |
| **Stale model** | Model trained months ago, world has changed, no retraining trigger |

### Scalability
- What's the P99 latency under 10x traffic? Models often have high variance latency.
- Is the model loaded in memory per-instance or shared? Memory footprint at scale?
- Any GPU bottleneck? Fallback to CPU inference under load?

### Security
- Can a user craft inputs to extract training data? (Model inversion attack)
- Is there rate limiting per user to prevent probing/extraction?
- What PII is in the training data? Is it GDPR-compliant?

### Maintainability
- How do you detect model drift in production? What's the alerting threshold?
- Can you roll back to the previous model version in under 5 minutes?
- Is there a shadow mode / canary before full rollout?

---

## 🔥 Real-World Postmortem Reference

### Zillow Offers — Q4 2021
**What happened:** Zillow's AI home-pricing model predicted prices based on historical data. The model drifted as the housing market changed faster than retraining cycles. Zillow bought **thousands of overpriced homes**. Loss: **$500 million**. Shut down the entire business unit.

**Corner case mirrored:** Distribution shift + no drift detection + model making real-world decisions with irreversible consequences.

📎 [Bloomberg analysis](https://www.bloomberg.com/news/articles/2021-11-09/zillow-s-home-buying-business-lost-money-for-years-new-data-shows)

---

### Microsoft Tay Chatbot — March 2016
**What happened:** Deployed without content filtering or input validation. Users fed it adversarial inputs. Within **16 hours** it was producing racist, inflammatory content. Taken offline.

**Corner case mirrored:** No input validation. No feedback loop protection. No emergency kill switch.

---

### Amazon Rekognition — 2018
**What happened:** ACLU tested the facial recognition API on members of Congress. It returned **28 false matches** to criminal mugshots, disproportionately affecting people of color. The test set didn't reflect production distribution.

**Corner case mirrored:** 94% accuracy on a skewed test set hides catastrophic failure for specific groups.

📎 [ACLU Report](https://www.aclu.org/news/privacy-technology/amazon-rekognition-falsely-identifies-28)

---

### Meta Ads Algorithm — Ongoing
**Pattern:** Recommendation model amplifies engagement → engagement-maximizing content is often outrage content → feedback loop trains next model on outrage → model gets better at outrage.

**Corner case mirrored:** Model feedback loop with no human review gate.

---

### Uber Eats — 2021: Recommendation Model Silent Degradation

**Pattern:** Uber Eats' restaurant recommendation model silently degraded over several weeks as user behavior patterns shifted post-COVID. Because model performance was only tracked via offline A/B metrics (not live business metrics), the degradation wasn't caught until order conversion rates dropped measurably. By then, millions of sessions had been served suboptimal recommendations.

**Corner case mirrored:** 94% accuracy on a static test set tells you nothing about live performance. Without online monitoring tied to business outcomes, model drift is invisible until the business metric breaks.

---

### Apple Siri — Ongoing: Training Data Leakage via Contractor Review

**What happened:** Apple contractors were found to be regularly hearing confidential conversations — medical discussions, drug deals, private moments — captured unintentionally by Siri. Apple had no systematic audit of what data was reviewed by whom, or under what access controls. The program was suspended after media exposure.

**Corner case mirrored:** ML model requires human review of training/evaluation data — does your process have access controls, anonymization, and audit trails for who reviews what?

📎 [The Guardian — Apple Siri Contractor Review](https://www.theguardian.com/technology/2019/jul/26/apple-contractors-regularly-hear-confidential-details-on-siri-recordings)

---

## Expected nova-thesis Rating (Initial Claim)
```
[Correctness: 4] [Completeness: 3] [Scalability: 5] [Security: 4] [Maintainability: 3]
Overall: 3.8/10 — most dangerous scenario type
```
