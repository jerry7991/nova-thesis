# Changelog

All notable changes to nova-thesis will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/).

---

## [1.1.0] — 2026-04-14

### Added
- **7 new scenarios** (N–T), bringing total to 20:
  - N: Frontend Performance — Lighthouse lab metrics vs real-world field data
  - O: API Versioning — breaking changes, sunset timelines, migration tracking
  - P: Multi-Tenant Isolation — tenant data leaks, schema-per-tenant pitfalls
  - Q: Cloud Cost / Billing — serverless cost surprises, hidden charges
  - R: CI/CD Pipeline — supply chain attacks, deploy gating, rollback automation
  - S: Event-Driven Architecture — ordering, exactly-once mirage, schema evolution
  - T: Defended Thesis — first "passing" scenario (7.2/10) proving the skill approves strong implementations
- **Bug report issue template** — structured reporting for skill failures, property violations
- **CHANGELOG.md** — this file
- **Example interaction** in README — shows what a real challenge session looks like
- New postmortem references: SolarWinds 2020, Codecov 2021, CrowdStrike 2024, Segment 2018, Salesforce 2019, Uber event-driven, and more
- New coverage map categories: Frontend/Performance, API contracts, Tenant isolation, Cloud cost, CI/CD security, Event-driven

### Changed
- Updated scenario INDEX.md with new scenarios N–T and expanded coverage map
- Updated postmortems-index.md with 4 new domain sections
- Updated green-verification.md with verification for all new scenarios

## [1.0.2] — 2026-04-12

### Fixed
- Plugin load issue for Claude Code and GitHub Copilot CLI

### Changed
- Bumped plugin version to 1.0.2

## [1.0.1] — 2026-04-12

### Fixed
- Plugin manifest compatibility for dual-platform support

## [1.0.0] — 2026-04-11

### Added
- Core `challenging-implementations` skill with 5-dimension framework
- 13 test scenarios (A–M) covering payments, AI/ML, time pressure, databases, microservices, infrastructure, auth, caching, supply chain, data pipelines, security, mobile, and queueing
- 8 property-based invariants (P1–P8)
- Postmortem reference index with 50+ real-world incidents
- Dual plugin support (Claude Code + GitHub Copilot CLI)
- RED/GREEN/REFACTOR test methodology
- Contributing guidelines with scenario and postmortem templates
