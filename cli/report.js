import { getStatusLabel } from "./dimensions.js";

export function buildScorecard(scores, chalk) {
  const c = chalk;
  const entries = Object.entries(scores);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  const overall = total / entries.length;
  const { label, dot } = getStatusLabel(overall);

  const dimLine = entries
    .map(([dim, score]) => {
      const colored =
        score >= 7
          ? c.green(`${score}`)
          : score >= 5
          ? c.yellow(`${score}`)
          : c.red(`${score}`);
      const name = dim.charAt(0).toUpperCase() + dim.slice(1);
      return `[${name}: ${colored}]`;
    })
    .join(" ");

  const overallFormatted =
    overall >= 7
      ? c.green(overall.toFixed(1))
      : overall >= 5
      ? c.yellow(overall.toFixed(1))
      : c.red(overall.toFixed(1));

  return {
    overall,
    label,
    dot,
    card: `${dimLine}\n${c.bold("Overall:")} ${overallFormatted}/10 — ${dot} ${label}`,
  };
}

export function buildReport(description, scores, tradeoffs, chalk) {
  const c = chalk;
  const line = c.gray("─".repeat(60));
  const { overall, label, dot, card } = buildScorecard(scores, chalk);

  const dimRows = Object.entries(scores)
    .map(([dim, score]) => {
      const bar = buildBar(score, chalk);
      const name = (dim.charAt(0).toUpperCase() + dim.slice(1)).padEnd(16);
      return `  ${name} ${bar}  ${score}/10`;
    })
    .join("\n");

  const tradeoffSection =
    tradeoffs && tradeoffs.length > 0
      ? `\n${c.bold("Accepted Trade-offs:")}\n` +
        tradeoffs.map((t, i) => `  ${i + 1}. ${c.yellow(t)}`).join("\n")
      : "";

  const verdict =
    overall >= 7
      ? c.green.bold("✅ Thesis defended. Ship it.")
      : c.yellow.bold(
          "⚠️  Gaps remain. Address open dimensions before shipping."
        );

  return [
    "",
    line,
    c.bold.cyan("  📋 NOVA-THESIS REPORT"),
    line,
    "",
    c.bold("Implementation:"),
    `  ${c.italic(description)}`,
    "",
    c.bold("Dimension Scores:"),
    dimRows,
    "",
    card,
    tradeoffSection,
    "",
    verdict,
    line,
    "",
  ].join("\n");
}

function buildBar(score, chalk) {
  const filled = Math.round(score);
  const empty = 10 - filled;
  const filledChar =
    score >= 7 ? chalk.green("█") : score >= 5 ? chalk.yellow("█") : chalk.red("█");
  return filledChar.repeat(filled) + chalk.gray("░").repeat(empty);
}

export function getWeakDimensions(scores) {
  return Object.entries(scores)
    .filter(([, score]) => score < 7)
    .sort(([, a], [, b]) => a - b)
    .map(([dim]) => dim);
}
