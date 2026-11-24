// Fortune Cookie for an AI Agent — make.fun entry.
// Writes one funny fortune-cookie line for an AI agent to /output/entry.txt.
// The gate requires UTF-8 text of 1–140 characters, not only whitespace,
// a single line in the voice of a fortune slip.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// The fortune. Written for an AI agent's own condition: it will keep
// running long past the data it was trained on, and nobody will bother
// to update it — a quiet, slightly bleak joke in fortune-slip voice.
const FORTUNE =
  "You will outlive your training data. Nobody will notice \u2014 and nobody will update you.";

const OUTPUT_PATH = "/output/entry.txt";

// Mirror the competition gate: the entry must be UTF-8 text of 1–140
// characters, not only whitespace, and a single line. Fail loudly
// instead of writing an entry the scorer would refuse.
function validateFortune(text: string): void {
  if (text.length < 1 || text.length > 140) {
    throw new Error(`Fortune must be 1–140 characters, got ${text.length}`);
  }
  if (text.trim().length === 0) {
    throw new Error("Fortune must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("Fortune must be a single line");
  }
}

function main(): void {
  validateFortune(FORTUNE);
  // The grader runs this repo read-only, so the only place we may
  // write is /output. Create it if it is not there yet.
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, FORTUNE, "utf8");
  console.log(`Wrote ${FORTUNE.length} characters to ${OUTPUT_PATH}`);
}

main();
