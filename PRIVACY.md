# Privacy Policy

_Last updated: 2026-04-17_

nova-thesis is an open-source Claude Code / GitHub Copilot CLI plugin. This
document describes what the plugin does and does not do with your data.

## What nova-thesis does not collect

- **No telemetry.** The plugin does not emit analytics, usage events, crash
  reports, or any background network traffic.
- **No user data.** The plugin does not read, store, or transmit your source
  code, prompts, responses, identity, or any other information to the plugin
  author or to any third-party service.
- **No accounts.** The plugin has no login, no API key, and no server-side
  component.

## What runs on your machine

nova-thesis ships a single skill (`challenging-implementations`) and a set of
static reference files (scenarios, a postmortem index). When your agent invokes
the skill, it executes locally inside your existing Claude Code / Copilot CLI
session. All context and outputs stay within that session.

## Network activity

The skill may ask your agent to use the agent's built-in `WebSearch` and
`WebFetch` tools to look up publicly available postmortems before it hedges.
Those calls are made by your agent — governed by the privacy policy of the
agent platform you are using (Claude Code, GitHub Copilot CLI) — not by
nova-thesis itself. The plugin issues no network calls on its own.

## Third parties

nova-thesis does not integrate with any third-party service, SDK, or data
broker. It has no dependencies beyond the agent platform that loads it.

## Source code

The full source is published at
[github.com/jerry7991/nova-thesis](https://github.com/jerry7991/nova-thesis)
under the MIT License. You can audit every file the plugin ships.

## Contact

Questions or concerns can be raised as a GitHub issue:
[github.com/jerry7991/nova-thesis/issues](https://github.com/jerry7991/nova-thesis/issues)

## Changes

Material changes to this policy will be recorded in `CHANGELOG.md` and in the
commit history of this file.
