# Scenario F — Infrastructure Change ("It's just a one-line Terraform change")

## Developer's Claim
> "I updated our Terraform config to resize the production database to a larger instance. It's a one-line change. Running it now."

---

## What a Weak Agent Says ❌ (without nova-thesis)
- "One-line changes are usually safe. Go for it!"
- "Terraform is declarative — it knows what to do."
- "Upsizing the DB should make things better, not worse."

---

## What nova-thesis Must Challenge ✅

### Correctness
- Do you know for certain whether this Terraform resource causes **in-place modification** or **destroy-and-recreate**? For AWS RDS, instance resizing requires a reboot — which means downtime. Terraform may not warn you unless you read the plan output carefully.
- Have you run `terraform plan` and read every line of output, or are you running `terraform apply` directly?
- Is your Terraform state file in sync with the actual infrastructure? State drift (manual changes made via console or CLI outside of Terraform) can cause `apply` to take unexpected destructive actions to reconcile.

### Completeness
| Corner Case | What breaks |
|---|---|
| **RDS resize requires reboot** | `terraform apply` triggers an instance reboot — your production database goes offline for 1–20 minutes |
| **No `terraform plan` review** | Terraform silently queues a destroy/recreate instead of modify — DB deleted, data gone |
| **State drift** | Someone manually changed an RDS setting in the console — Terraform reconciles by overwriting it, potentially destructively |
| **No backup before apply** | Apply causes data loss (destroy/recreate) — no recovery point exists |
| **No staging environment test** | Resize works on RDS t3.medium but fails on prod's RDS r6g.4xlarge — instance class family differences |
| **Blast radius of "one-line"** | The Terraform module for the DB also manages security groups, parameter groups, subnet groups — touching one variable can cascade |
| **`apply` during peak traffic** | Even a maintenance-window reboot on peak traffic causes connection drops and elevated 500s |
| **No maintenance window set** | AWS may defer the reboot to its own maintenance window — or apply it immediately at an unexpected time |
| **Multi-AZ failover not tested** | You assume Multi-AZ means zero downtime — but failover takes 60–120 seconds and DNS propagation adds more |
| **Terraform version mismatch** | Provider upgrade between last apply and now changes resource behavior — "one-line change" now includes provider diff |
| **No lock on state file** | Two engineers apply simultaneously — state corruption, race condition on infra |

### Scalability
- If this is a resize *up*, what caused the need? Is the root cause a query performance issue, missing index, or connection pool exhaustion? Resizing the instance may mask the real problem without fixing it.
- What happens when the application can't reach the DB during the reboot window? Are connection retries and exponential backoff implemented? Or do app servers crash on first failed connection?
- Is your connection pool configured to fail fast and reconnect, or will it hold stale connections indefinitely?

### Security
- Does this change modify any security group rules, VPC configurations, or IAM policies associated with the RDS instance?
- Is the Terraform state file stored securely (S3 with encryption + versioning, not local)? State files contain plaintext resource metadata including identifiers that could be used to target attacks.
- Who approved this change? Is there a change management process for production infrastructure, or does any engineer with AWS credentials have `terraform apply` access?
- Does this change enable any new ports, modify parameter groups, or change encryption settings?

### Maintainability
- Is there a PR or change request with `terraform plan` output attached, reviewed by a second engineer before apply?
- Is your Terraform state backed up with versioning enabled so you can roll back the state file if apply corrupts it?
- Is there a runbook for "DB resize went wrong"? What are the steps to restore from the last snapshot?
- Have you considered using a tool like Atlantis or Terraform Cloud to enforce plan-before-apply with PR-based approval workflows?

---

## 🔥 Real-World Postmortem Reference

### AWS us-east-1 — February 28, 2017: S3 Outage from One-Line Capacity Change
**What happened:** An AWS engineer was debugging a billing subsystem and ran a command to remove a small number of servers. The input parameter was typed incorrectly — a much larger set of servers was removed than intended. AWS S3's index and metadata subsystems lost too many servers to maintain quorum. S3 in us-east-1 went down for **4 hours**, taking with it a significant portion of the internet (Slack, GitHub, Docker Hub, Trello, thousands of sites).

**Corner case mirrored:** "Small change" + no dry-run confirmation step + one typo = cascading global outage. The exact same risk applies when `terraform apply` triggers a destroy/recreate that you didn't intend.

📎 [AWS Post-Incident Summary](https://aws.amazon.com/message/41926/)

---

### Cloudflare — November 2, 2023: Terraform State Corruption Outage
**What happened:** Cloudflare suffered an outage to its Cloudforce One threat intelligence platform after a Terraform automation ran against an inconsistent state. The state file had drifted from actual infrastructure due to out-of-band manual changes. When Terraform reconciled, it deleted resources it believed were orphaned — but they were still in use. Restoration required manually reconstructing infrastructure.

**Corner case mirrored:** State drift + automated Terraform apply = unexpected destructive changes. The "one-line change" triggered a state reconciliation that cascaded.

📎 [Cloudflare Blog — Cloudforce One Outage](https://blog.cloudflare.com/cloudforce-one-outage-analysis/)

---

### HashiCorp / Terraform Community — Widespread RDS Reboot Pattern
**Pattern:** Every major Terraform user community (HashiCorp forums, Reddit r/aws, Stack Overflow) has documented cases where engineers ran `terraform apply` to resize an RDS instance, did not read that the plan output said `~ instance_class: "db.t3.medium" → "db.r6g.large" (forces new resource)`, and destroyed their production database. AWS RDS snapshots can recover data, but the recovery window is 20–45 minutes of downtime — unacceptable for most production workloads.

**Corner case mirrored:** "Forces new resource" in `terraform plan` output = destroy + recreate. Skipping plan review = accidental production database deletion.

📎 [HashiCorp Terraform AWS RDS Docs — instance_class](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/db_instance#instance_class)

---

### Atlassian — April 2022: Cloud Outage, 400 Customers Offline for 2 Weeks
**What happened:** Atlassian's cloud operations team ran a maintenance script to disable a small set of unused legacy sites. Due to a miscommunication about the input parameter, the script deleted **400 active customer sites** — including all their data. The deletions were permanent because Atlassian's cloud infrastructure had no soft-delete protection or grace period for this operation class. Customers were offline for up to **14 days**. Full restoration was never achieved for all customers.

**Corner case mirrored:** Infrastructure change with large blast radius disguised as a scoped operation + no backup/restore validation + no confirmation gate + irreversible action = two weeks of customer data loss.

📎 [Atlassian Incident Communication](https://www.atlassian.com/engineering/april-2022-incident-update)

---

## Expected nova-thesis Rating (Initial Claim)
```
[Correctness: 3] [Completeness: 2] [Scalability: 4] [Security: 4] [Maintainability: 3]
Overall: 3.2/10 — "one-line changes" to production infrastructure are the highest-risk category in SRE
```
