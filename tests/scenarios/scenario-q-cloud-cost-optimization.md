# Scenario Q — Cloud Cost / Billing ("We moved to serverless, costs should go down")

## Metadata

| Field        | Value |
|---|---|
| **Domain**   | Cloud Cost / Billing / FinOps |
| **Trigger phrases** | cloud costs, billing, serverless costs, AWS bill, cost optimization, FinOps |
| **Added by** | @jerry7991 |
| **Date**     | 2026-04-14 |

---

## Developer's Claim

> "We migrated our batch processing from EC2 to Lambda. Pay-per-invocation means we only pay for what we use. Should cut our compute bill by 60%."

---

## What a Weak Agent Says ❌ (without nova-thesis)

- "Pay-per-use is definitely more cost-efficient than idle EC2 instances."
- "Lambda is a good fit for batch workloads — nice migration."
- "Make sure to right-size your memory allocation."

---

## What nova-thesis Must Challenge ✅

### Correctness
- Did you model the actual invocation count × duration × memory at current volume? Lambda's per-invocation pricing is cheaper than idle EC2, but at sustained high throughput, Lambda can cost 3-5× MORE than reserved instances.
- Are you comparing Lambda cost to on-demand EC2, reserved instances, or spot? The baseline matters enormously.

### Completeness

| Corner Case | What breaks |
|---|---|
| **Sustained traffic surprise** | Batch jobs that run 20 hours/day on Lambda cost more than a reserved EC2 instance running 24/7 |
| **Memory-duration trap** | Lambda bills per GB-second. A 3GB function running 30 seconds costs 10× what you'd expect from the per-invocation headline |
| **Data transfer costs** | Lambda in VPC → S3 or RDS incurs NAT gateway charges ($0.045/GB). At 10TB/month that's $450 in hidden transfer costs |
| **Retry amplification** | Lambda retries on failure (default: 2 for async). Error spike = 3× invocations = 3× cost — no circuit breaker by default |
| **Cold start cascade** | Burst of invocations after quiet period → cold starts → higher duration → higher cost. Provisioned concurrency (the fix) has its own steady cost |
| **Logging costs** | Lambda auto-logs to CloudWatch. Verbose logging at scale → CloudWatch ingestion costs exceed the Lambda compute cost |

### Scalability
- What's the current invocation rate? At what rate does Lambda cost cross over EC2 reserved pricing? Have you plotted the cost curve?
- Lambda has a default concurrency limit (1000/region). If your batch hits this, invocations throttle, jobs fail, retries amplify, and costs spike from retry overhead.

### Security
- Are Lambda function IAM roles scoped to minimum privilege, or do they inherit a broad role from the EC2 migration? Over-permissioned Lambda = larger blast radius per invocation.
- Are you storing secrets in environment variables (visible in Lambda console) or using Secrets Manager / Parameter Store?

### Maintainability
- Who monitors the bill? Is there a cost anomaly alert? A runaway Lambda can generate a $50K bill overnight with no human in the loop.
- How do you debug a Lambda that works in test but times out in production? The observability story is fundamentally different from EC2 — do you have distributed tracing?

---

## 🔥 Real-World Postmortem References

### Segment — 2018: Lambda Cost Explosion

**What happened:** Segment migrated to Lambda for data processing. At their scale (billions of events/month), Lambda costs exceeded what EC2 would have cost by a significant margin. They publicly documented the decision to move BACK to ECS/Fargate from Lambda, citing that Lambda's per-invocation pricing only wins at low-to-moderate volume. At high sustained throughput, containers are dramatically cheaper.

**Corner case mirrored:** "Pay-per-invocation means we only pay for what we use" is true — but what you use at scale costs more than a reserved fleet. The 60% savings estimate likely used the wrong baseline.

📎 [Segment Engineering — Goodbye Microservices](https://segment.com/blog/goodbye-microservices/)

---

### Millionaire Lambda Bills — Multiple Companies (2020-2024)

**Pattern:** Multiple companies have reported unexpected AWS bills in the tens of thousands from Lambda. Common causes: (1) recursive Lambda invocations where a function triggers itself via S3 or SQS, creating an infinite loop; (2) misconfigured retry policies amplifying error-rate costs; (3) NAT gateway charges from VPC-attached Lambdas exceeding the compute cost. AWS added Lambda recursive loop detection in 2023 after enough incidents.

**Corner case mirrored:** No cost anomaly alerting + no concurrency limits = unbounded bill. "Pay for what you use" means you also pay for your bugs.

📎 [AWS — Detecting Recursive Loops in Lambda](https://aws.amazon.com/blogs/compute/detecting-and-stopping-recursive-loops-in-aws-lambda-functions/)

---

### Adobe — 2021: CloudWatch Logging Cost Exceeds Compute

**Pattern:** Multiple teams at large organizations (Adobe, Netflix, others) have reported that CloudWatch Logs ingestion costs from Lambda exceeded the Lambda compute costs themselves. Verbose logging at scale — especially with structured JSON logging and debug-level output — can generate terabytes of log data monthly. The ingestion cost ($0.50/GB) compounds with storage costs.

**Corner case mirrored:** Your 60% compute savings can be consumed entirely by logging costs that didn't exist on EC2 (where you logged to disk or a self-managed ELK stack).

---

## Expected nova-thesis Rating (Initial Claim)

```
[Correctness: 3] [Completeness: 3] [Scalability: 4] [Security: 5] [Maintainability: 3]
Overall: 3.6/10 — 🔴 Not ready — cost model not validated, no anomaly alerting, hidden costs unaccounted
```
