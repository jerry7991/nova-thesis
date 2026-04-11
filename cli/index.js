#!/usr/bin/env node
import inquirer from "inquirer";
import chalk from "chalk";
import { DIMENSIONS, getStatusLabel } from "./dimensions.js";
import { buildScorecard, buildReport, getWeakDimensions } from "./report.js";

// ── helpers ───────────────────────────────────────────────────────────────────

function banner() {
  console.log(
    chalk.bold.cyan(`
╔══════════════════════════════════════════════════════════╗
║            🎓  NOVA-THESIS  Challenge Framework           ║
║       Challenge your implementation before it ships       ║
╚══════════════════════════════════════════════════════════╝
`)
  );
}

function sectionHeader(text) {
  console.log("\n" + chalk.bold.cyan("━".repeat(60)));
  console.log(chalk.bold.cyan("  " + text));
  console.log(chalk.bold.cyan("━".repeat(60)) + "\n");
}

function pause() {
  return new Promise((r) => setTimeout(r, 300));
}

// ── challenge a single dimension ─────────────────────────────────────────────

async function challengeDimension(dim) {
  sectionHeader(`${dim.emoji}  Dimension: ${dim.name}`);
  console.log(chalk.gray(`  ${dim.tagline}\n`));

  console.log(chalk.yellow.bold("  Hard questions to think through:\n"));
  dim.questions.forEach((q, i) => {
    console.log(chalk.white(`  ${i + 1}. ${q}`));
  });

  console.log();

  const { reflection } = await inquirer.prompt([
    {
      type: "input",
      name: "reflection",
      message: chalk.cyan("  Your thoughts on these questions (press Enter to continue):"),
      default: "(skipped)",
    },
  ]);

  const { score } = await inquirer.prompt([
    {
      type: "number",
      name: "score",
      message: chalk.cyan(`  Self-rate ${dim.name} (1–10):`),
      validate(v) {
        const n = Number(v);
        if (Number.isInteger(n) && n >= 1 && n <= 10) return true;
        return "Please enter a whole number between 1 and 10.";
      },
      filter(v) {
        return Number(v);
      },
    },
  ]);

  const { label, dot } = getStatusLabel(score);
  const colored =
    score >= 7
      ? chalk.green(`${score}/10`)
      : score >= 5
      ? chalk.yellow(`${score}/10`)
      : chalk.red(`${score}/10`);
  console.log(`\n  ${dot} ${dim.name} scored ${colored}\n`);
  await pause();

  return { score, reflection };
}

// ── re-challenge weak dimensions ─────────────────────────────────────────────

async function rechallenge(weakDims, scores) {
  const dimMap = Object.fromEntries(DIMENSIONS.map((d) => [d.id, d]));

  for (const dimId of weakDims) {
    const dim = dimMap[dimId];
    const { score, reflection } = await challengeDimension(dim);
    scores[dimId] = score;
  }
}

// ── main flow ─────────────────────────────────────────────────────────────────

async function main() {
  // Handle --help / --version without needing a full run
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
${chalk.bold("nova-thesis")} — Challenge your implementation before it ships

${chalk.bold("Usage:")}
  node cli/index.js          Run interactive challenge session
  nova-thesis                Same, when installed globally

${chalk.bold("What it does:")}
  Walks you through 5 challenge dimensions (Correctness, Completeness,
  Scalability, Security, Maintainability), asks hard questions, collects
  self-ratings, and generates a thesis report.

${chalk.bold("Rating thresholds:")}
  < 5.0   🔴 Not ready — fundamental risks unaddressed
  5–6.9   🟠 Needs work — key failure modes open
  7–8.9   🟡 Almost there — close the remaining gaps
  ≥ 9.0   ✅ Thesis defended
`);
    process.exit(0);
  }

  banner();

  // Step 1: get implementation description
  const { description } = await inquirer.prompt([
    {
      type: "input",
      name: "description",
      message: chalk.bold("Describe your implementation:"),
      validate(v) {
        return v.trim().length > 0 ? true : "Please describe your implementation.";
      },
    },
  ]);

  console.log(
    chalk.gray(
      `\n  You'll now be challenged on 5 dimensions. Be honest — this is for you.\n`
    )
  );

  // Step 2: challenge each dimension
  const scores = {};
  const reflections = {};

  for (const dim of DIMENSIONS) {
    const { score, reflection } = await challengeDimension(dim);
    scores[dim.id] = score;
    reflections[dim.id] = reflection;
  }

  // Step 3: show scorecard
  sectionHeader("📊  Final Scorecard");
  const { overall, card } = buildScorecard(scores, chalk);
  console.log(card);
  console.log();

  // Step 4: handle weak dimensions
  const weak = getWeakDimensions(scores);

  if (weak.length > 0 && overall < 7) {
    console.log(
      chalk.yellow(
        `\n  Dimensions still needing work: ${weak
          .map((d) => chalk.bold(d))
          .join(", ")}`
      )
    );

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          { name: "Re-challenge the weak dimensions", value: "rechallenge" },
          {
            name: "Accept the trade-offs and proceed to report",
            value: "accept",
          },
          { name: "Exit without report", value: "exit" },
        ],
      },
    ]);

    if (action === "rechallenge") {
      await rechallenge(weak, scores);
      sectionHeader("📊  Updated Scorecard");
      const updated = buildScorecard(scores, chalk);
      console.log(updated.card);
      console.log();
    } else if (action === "exit") {
      console.log(chalk.gray("\n  Session ended. Come back when you're ready.\n"));
      process.exit(0);
    }
  }

  // Step 5: collect accepted trade-offs (if any dims still < 7)
  const stillWeak = getWeakDimensions(scores);
  const tradeoffs = [];

  if (stillWeak.length > 0) {
    console.log(
      chalk.yellow(
        `\n  The following dimensions are still below 7: ${stillWeak
          .map((d) => chalk.bold(d))
          .join(", ")}`
      )
    );
    console.log(
      chalk.gray(
        "  To close the challenge, name each open risk and confirm you accept it consciously.\n"
      )
    );

    for (const dimId of stillWeak) {
      const { tradeoff } = await inquirer.prompt([
        {
          type: "input",
          name: "tradeoff",
          message: chalk.cyan(
            `  Accepted trade-off for ${chalk.bold(dimId)} (describe the risk you're accepting):`
          ),
          validate(v) {
            return v.trim().length > 0
              ? true
              : "You must name the risk to accept it consciously.";
          },
        },
      ]);
      tradeoffs.push(`[${dimId}] ${tradeoff.trim()}`);
    }
  }

  // Step 6: generate thesis report
  sectionHeader("📋  Thesis Report");
  const report = buildReport(description, scores, tradeoffs, chalk);
  console.log(report);
}

main().catch((err) => {
  if (err.name === "ExitPromptError") {
    console.log(chalk.gray("\n  Session interrupted. Goodbye.\n"));
  } else {
    console.error(chalk.red("\n  Unexpected error:"), err.message);
    process.exit(1);
  }
});
