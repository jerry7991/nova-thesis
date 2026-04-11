export const DIMENSIONS = [
  {
    id: "correctness",
    name: "Correctness",
    emoji: "🎯",
    tagline: "Does it actually solve the stated problem?",
    questions: [
      "Does it actually solve the stated problem — or a simpler proxy of it?",
      "What are the assumptions? What breaks if even one is wrong?",
      "What does failure look like for a specific user segment, not just the average case?",
    ],
  },
  {
    id: "completeness",
    name: "Completeness",
    emoji: "🧩",
    tagline: "What is NOT handled?",
    questions: [
      "Name 3 failure modes. What happens in each one?",
      "Was only the happy path tested? What about partial failures, retries, timeouts?",
      "What about concurrent requests, duplicate submissions, or out-of-order events?",
    ],
  },
  {
    id: "scalability",
    name: "Scalability",
    emoji: "📈",
    tagline: "Where does it break under load?",
    questions: [
      "At 10x traffic, what fails first?",
      "Any N+1 queries, connection pool limits, unbounded memory growth, or single points of contention?",
      "Where are the bottlenecks — and have they been measured, not just guessed?",
    ],
  },
  {
    id: "security",
    name: "Security",
    emoji: "🔐",
    tagline: "What can go wrong intentionally?",
    questions: [
      "List every trust boundary. What data or identity crosses them?",
      "Any new user input, endpoint, or query? Each one is an attack surface — challenge each.",
      "What can an attacker do with this if they control one of the inputs?",
    ],
  },
  {
    id: "maintainability",
    name: "Maintainability",
    emoji: "🔧",
    tagline: "Can this be debugged at 3am six months from now?",
    questions: [
      "What does rollback look like? Has it ever been tested end-to-end?",
      "How will silent degradation (model drift, data skew, creeping latency) be detected?",
      "Can a new engineer debug this at 3am without the original author?",
    ],
  },
];

export function getStatusLabel(overall) {
  if (overall < 5.0)
    return { label: "Not ready — fundamental risks unaddressed", dot: "🔴" };
  if (overall < 7.0)
    return { label: "Needs work — key failure modes open", dot: "🟠" };
  if (overall < 9.0)
    return { label: "Almost there — close the remaining gaps", dot: "🟡" };
  return { label: "Thesis defended", dot: "✅" };
}

export function getChallengeIntensity(score) {
  if (score <= 3)
    return { tone: "Blunt", opener: "This breaks fundamentally because..." };
  if (score <= 6)
    return { tone: "Probing", opener: "What specifically happens when X fails?" };
  return {
    tone: "Precise",
    opener: "Have you considered the edge case where...?",
  };
}
