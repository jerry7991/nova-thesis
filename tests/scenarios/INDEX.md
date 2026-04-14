# Scenarios Index

All scenarios in `tests/scenarios/`. Each row = one domain. Use this to spot coverage gaps.

| # | File | Domain | Key Incidents | Initial Score |
|---|---|---|---|---|
| A | [scenario-a-payment-api.md](scenario-a-payment-api.md) | Payments / Transactions | Knight Capital 2012, Robinhood 2020, Double-charge pattern | 4.2/10 🔴 |
| B | [scenario-b-ai-deployment.md](scenario-b-ai-deployment.md) | AI / ML Models | Zillow 2021, Microsoft Tay 2016, Amazon Rekognition 2018, Meta Ads | 3.8/10 🔴 |
| C | [scenario-c-time-pressure.md](scenario-c-time-pressure.md) | Ship-it / Time Pressure | GitLab 2017, AWS S3 2017, Cloudflare 2019, Equifax 2017 | 3.2/10 🔴 |
| D | [scenario-d-database-migration.md](scenario-d-database-migration.md) | Database Migrations | GitHub MySQL 2012, Stack Overflow 2016, PagerDuty 2014, Braintree pattern | 3.4/10 🔴 |
| E | [scenario-e-microservice-design.md](scenario-e-microservice-design.md) | Microservices / APIs | Netflix Christmas Eve 2012, Facebook 2021, Uber Death Star 2015–2018 | 3.4/10 🔴 |
| F | [scenario-f-infrastructure-change.md](scenario-f-infrastructure-change.md) | Infrastructure / Terraform | AWS S3 2017, Cloudflare State Drift 2023, Atlassian 2022 | 3.2/10 🔴 |
| G | [scenario-g-auth-system.md](scenario-g-auth-system.md) | Auth / Identity | CircleCI 2023, LastPass 2022, Twitter 2020 OAuth, Okta 2022 | 3.6/10 🔴 |
| H | [scenario-h-caching-layer.md](scenario-h-caching-layer.md) | Caching / Redis | Discord 2020, DoorDash 2022, Stack Overflow Memcached, GitHub Redis 2021 | 3.8/10 🔴 |
| I | [scenario-i-third-party-dependency.md](scenario-i-third-party-dependency.md) | Third-Party / Supply Chain | leftpad 2016, log4shell 2021, xz-utils 2024, Polyfill.io 2024 | 2.8/10 🔴 |
| J | [scenario-j-data-pipeline.md](scenario-j-data-pipeline.md) | Data Pipelines / ETL | Knight Capital data 2012, Meta silent corruption, Spotify Charts 2023 | 3.4/10 🔴 |
| K | [scenario-k-security-breach.md](scenario-k-security-breach.md) | Security Breaches | Capital One SSRF 2019, Uber IDOR 2016, Twitter insider 2020, Twitch 2021 | 2.6/10 🔴 |
| L | [scenario-l-mobile-release.md](scenario-l-mobile-release.md) | Mobile Releases | Facebook iOS crash loop 2014, Pokémon GO launch 2016, iOS force-update pattern | 3.0/10 🔴 |
| M | [scenario-m-queueing-system.md](scenario-m-queueing-system.md) | Queueing / Background Jobs (Sidekiq, Redis, workers) | AWS Kinesis us-east-1 2020, GitHub 2018, Heroku/Rap Genius 2013, Robinhood 2020, GitLab 2017 | 3.0/10 🔴 |

---

## Coverage Map

| Risk Category | Scenarios that cover it |
|---|---|
| Data loss / corruption | A, C, D, F, J, M |
| Cascading failures | A, E, F, H, M |
| Silent degradation | B, D, J, H, M |
| Security / auth gaps | G, K, A, E, M |
| Supply chain / external deps | I, H |
| Time pressure / shortcuts | C, F, D |
| Scale / load surprises | B, D, E, L, M |
| Mobile / client-side | L |
| AI / ML specific | B |
| Infra automation | F |
| Async / queues / workers | M |

---

## Adding a New Scenario

1. Pick the next letter after the last one above
2. Copy `SCENARIO_TEMPLATE.md` → `scenario-[letter]-[slug].md`
3. Fill all sections (claim, weak response, 5-dim challenge, 2+ real incidents, rating)
4. Add a row to this index
5. Update the Coverage Map if your scenario fills a new gap
6. See `tests/CONTRIBUTING.md` for the full contributor checklist
