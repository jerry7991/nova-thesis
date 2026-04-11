# Security Policy

## Reporting a Vulnerability

nova-thesis is a skill/plugin framework — it contains markdown files and a Node.js CLI. It does not handle credentials, user data, or network connections.

If you discover a security issue (e.g., a malicious dependency, script injection in the CLI), please **do not open a public issue**.

Instead, report it privately:
- Email: or open a [GitHub private security advisory](https://github.com/jerry7991/nova-thesis/security/advisories/new)

## Supported Versions

| Version | Supported |
|---|---|
| latest (`main`) | ✅ |

## Scope

- **In scope:** CLI code (`cli/`), dependency vulnerabilities (`package.json`)
- **Out of scope:** Content of scenario files or postmortem references (these are documentation)
