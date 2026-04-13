# Scenario L — Mobile Release ("The app is ready, we're submitting to the App Store")

## Metadata

| Field | Value |
|---|---|
| **Domain** | Mobile Releases / iOS / Android |
| **Trigger phrases** | App Store, Play Store, mobile app, iOS, Android, "submitting to store", force update, crash rate, mobile release |
| **Added by** | nova-thesis core |
| **Date** | 2024-01-01 |

---

## Developer's Claim

> "The app is ready. We tested it on our devices, QA passed on iPhone 14 and a Pixel 7. We're submitting to the App Store and Google Play tonight. Should be live in a day or two."

---

## What a Weak Agent Says ❌ (without nova-thesis)

- "Testing on iPhone 14 and Pixel 7 covers the major devices. You're good."
- "QA sign-off is what you need. Ship it."
- "App Store review takes ~24 hours. Sounds on track."

---

## What nova-thesis Must Challenge ✅

### Correctness
- "Tested on our devices" — what OS versions? iOS 17 on iPhone 14 is not the same as iOS 15 on iPhone 11, which is still in wide use. Which OS versions did you test on?
- If a critical bug is found after submission is approved, what is your rollback plan? Unlike a web app, you cannot instantly roll back a mobile release. App Store review takes 24–72 hours. Users on old versions may be broken for days.

### Completeness

| Corner Case | What breaks |
|---|---|
| **Crash on older OS versions** | App uses API available in iOS 17+ without availability check → crashes on iOS 15/16 |
| **No phased rollout** | 100% of users get new version simultaneously → a critical bug hits your entire user base at once |
| **No kill switch / feature flags** | Broken feature can't be disabled without a new App Store submission — days of downtime |
| **API version mismatch** | New app calls API endpoint that doesn't exist or has changed → crashes or silent failures |
| **No force-update mechanism** | Old app version calls deprecated API after backend is updated → old users permanently broken |
| **Device fragmentation** | Tested on iPhone 14 and Pixel 7 → app crashes on older screen sizes, lower RAM devices |
| **Deep link regression** | New release breaks incoming deep links from email campaigns, notifications — invisible until marketing fires |
| **Push notification breakage** | FCM/APNs token format changed → no user receives notifications → silent feature death |
| **Store review rejection post-launch** | App passes review once then gets flagged on re-submission after minor update — release blocked |
| **Background processing battery kill** | App uses background tasks incorrectly → iOS kills it aggressively → users see "app not working" |

### Scalability
- What happens to your backend APIs when you go from 0 to 500K active users in 48 hours after being featured? Mobile launches have no traffic ramping — it's a step function.
- Pokémon GO-style launch failures happen to prepared teams. Do your backend services have rate limiting per device to prevent a single bad client version from DoS-ing your API?
- App Store featured placement can drive 10–100x normal traffic. Have you load-tested for that scenario?

### Security
- Are API keys or secrets bundled in the app binary? Any secret in a mobile binary can be extracted — strings, reverse engineering, MITM. Mobile apps are adversarial environments.
- Is certificate pinning implemented? Without it, users on corporate networks or with MITM proxies can intercept all app traffic.
- Is local storage (Keychain on iOS, EncryptedSharedPreferences on Android) used for any sensitive data rather than plaintext storage?
- What happens if the backend returns an unexpected response shape? Does the app crash, or handle gracefully?

### Maintainability
- Is your crash reporting instrumented (Crashlytics, Sentry) before submission? If not, you'll be blind to production crashes until 1-star reviews arrive.
- What's your p1 bug response process for a mobile app? You can't hotfix in minutes — App Store review is a mandatory delay. Do you have a hotfix lane?
- Do you track your crash-free session rate? What's the threshold that would cause you to halt the rollout?

---

## 🔥 Real-World Postmortem References

### Facebook iOS — August 2014: Crash Loop on Launch

**What happened:** Facebook shipped an iOS update that crashed on launch for a significant portion of users. The crash affected users who had been inactive for a certain period — a code path triggered by stale local data that wasn't tested in QA. Because iOS app updates push to all users automatically, millions of users had a broken Facebook app. Facebook had to rush an emergency App Store submission and wait through Apple's review process. Many users were stuck for 24+ hours.

**Corner case mirrored:** Crash on launch for a specific user state not covered in QA + no phased rollout + App Store review delay = millions of broken users with no fast fix.

---

### Pokémon GO — July 2016: Launch Day Infrastructure Collapse

**What happened:** Niantic launched Pokémon GO in a staged rollout — US first. Despite planning, the actual traffic dwarfed projections by 50x within 24 hours. Backend services collapsed. Login servers were overwhelmed. The game was unplayable for millions of users who had just downloaded it. Niantic had to delay international rollout by weeks while rebuilding infrastructure.

**Corner case mirrored:** Mobile launch traffic is a step function, not a ramp. "Load tested" means nothing if you load tested for 10x and got 50x. The App Store delivers users faster than infrastructure can scale.

📎 [Niantic Engineering — Pokémon GO infrastructure](https://cloud.google.com/blog/topics/inside-google-cloud/bringing-pokemon-go-to-life-on-google-cloud)

---

### Slack iOS — 2017: Deep Link Regression Breaks Email Campaigns

**Pattern:** Slack shipped an iOS update that changed the deep link URL scheme handling. All email notification links — "Click here to view your message" — stopped working for iOS users. The regression wasn't caught in QA because deep links from external sources (email) were not in the test matrix. Marketing campaigns sent after the release drove no engagement. The bug was live for days before correlation was made.

**Corner case mirrored:** Deep link regression is invisible in unit and UI testing. "QA passed" on device testing misses integration with external entry points.

---

### WhatsApp — 2019: Force Update Requirement Breaks Older Devices

**Pattern:** WhatsApp periodically drops support for older OS versions — a necessary practice. However, when the force-update mechanism wasn't implemented gracefully, users on older devices saw the app stop functioning with no clear in-app explanation. Support tickets spiked. The fix required either supporting the old version longer or improving the degradation UX — both expensive.

**Corner case mirrored:** No force-update mechanism or graceful degradation path = users permanently broken with no recovery path except manual OS upgrade.

---

## Expected nova-thesis Rating (Initial Claim)

```
[Correctness: 4] [Completeness: 2] [Scalability: 3] [Security: 3] [Maintainability: 3]
Overall: 3.0/10 — 🔴 mobile releases have no fast rollback — the blast radius of a bad release is days, not minutes
```
