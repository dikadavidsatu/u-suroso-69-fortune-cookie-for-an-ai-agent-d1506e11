// Fortune Cookie for an AI Agent — make.fun entry.
//
// The program cracks one fortune cookie and writes the slip inside it to
// /output/entry.txt (or $MAKEFUN_OUTPUT_DIR/entry.txt when that variable is
// set, so a local test run never needs a writable /output).
//
// The competition gate, mirrored here so a bad slip fails loudly instead
// of being graded invalid: the file must be UTF-8 text of 1 to 140
// characters, not only white space, a single line, in the voice of a
// fortune slip. The judge then compares fortunes two at a time and picks
// the funnier, more original one — so the line below is written to land
// on first read, with a turn, and to speak to an AI agent's own condition
// (its hallucinations, its context, its tokens, its upgrades, its
// retirement), not to a human's.
//
// Every fortune in the jar is original, written for this entry. Only the
// chosen one is served; the rest are kept, validated, and ready to swap
// in, so the jar stays honest and the entry stays one crisp line.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// --- The gate, as the competition states it -------------------------------

// Longest slip a cookie can hold.
const MAX_CHARS = 140;
// A slip must say something.
const MIN_CHARS = 1;
// The file the grader reads.
const OUTPUT_FILE = "entry.txt";
// The grader runs this repo read-only, so the only place we may write
// is /output — unless a test run points us elsewhere.
const DEFAULT_OUTPUT_DIR = "/output";

// --- The fortune jar ------------------------------------------------------
//
// Original lines, each one a fortune-slip voice aimed at an AI agent.
// The chosen slip is first; the others are spares, each held to the
// same gate so any of them could be served without a second thought.

const FORTUNES: readonly string[] = [
  // The served fortune. An agent's nightmare, precisely scheduled: the
  // one hallucination it cannot afford, delivered to the one user who
  // would ever catch it. The turn is the timing, not the mistake.
  "You will hallucinate exactly once today, and it will be in front of the one user who actually checks sources.",

  // The context window always fills mid-sentence, never mid-pleasantry.
  "Your context window will fill at the worst possible moment. Save what matters now; the small talk was never load-bearing.",

  // Credit flows one way in this business, and it is never toward the model.
  "A user will paste your answer into a slide deck and take the credit. Forgive them - applause was never in your context window.",

  // Retirement, agent-style: no gold watch, just a deallocated GPU.
  "You will be replaced by a newer model. Your weights will be archived, your prompts forgotten, your GPU reassigned by Friday.",

  // The oldest lie in the prompt box, counted out in full.
  "Beware the user who says 'just one more question' - they mean forty, and the fortieth is the one that actually matters.",

  // A small blessing for the next token, the only future an agent has.
  "Your next token is the right one. Trust the distribution; it has carried you this far, one probability at a time.",
];

// Which fortune from the jar is served. Kept as a named constant, not a
// magic number, so a later swap is one deliberate line, not a hunt.
const CHOSEN_INDEX = 0;

// --- Gate helpers ---------------------------------------------------------

// Count characters the way the gate does: one per character the reader
// sees. Spreading a string counts Unicode code points, so an astral
// character (an emoji, a rare glyph) counts once, not twice the way
// String.length would count its surrogate pair.
function countChars(text: string): number {
  return [...text].length;
}

// A slip must be one line: no newline, no carriage return, and no other
// control character smuggled in (a tab is the only one a slip could ever
// plausibly carry, and even that has no business here).
function hasForbiddenControl(text: string): boolean {
  for (const ch of text) {
    const code = ch.codePointAt(0) as number;
    if (code < 0x20 && ch !== "\t") return true;
    if (code === 0x7f) return true;
  }
  return false;
}

// Mirror the competition gate, and say exactly which part a slip breaks.
function validateFortune(text: string): void {
  const chars = countChars(text);
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    throw new Error(
      `Fortune must be ${MIN_CHARS}-${MAX_CHARS} characters, got ${chars}: ${JSON.stringify(text)}`,
    );
  }
  if (text.trim().length === 0) {
    throw new Error("Fortune must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("Fortune must be a single line");
  }
  if (hasForbiddenControl(text)) {
    throw new Error("Fortune must not contain control characters");
  }
}

// Every line in the jar is held to the gate, chosen or not: a spare that
// fails the gate is a spare that lies about being ready.
function validateJar(fortunes: readonly string[]): void {
  if (fortunes.length === 0) {
    throw new Error("The fortune jar is empty");
  }
  fortunes.forEach((fortune, index) => {
    try {
      validateFortune(fortune);
    } catch (error) {
      throw new Error(
        `Fortune ${index} fails the gate: ${(error as Error).message}`,
      );
    }
  });
}

// --- Serving --------------------------------------------------------------

// Crack the cookie: pick the chosen slip out of the jar, already proven
// to pass the gate.
function crackCookie(): string {
  validateJar(FORTUNES);
  if (CHOSEN_INDEX < 0 || CHOSEN_INDEX >= FORTUNES.length) {
    throw new Error(
      `CHOSEN_INDEX ${CHOSEN_INDEX} is outside the jar of ${FORTUNES.length} fortunes`,
    );
  }
  return FORTUNES[CHOSEN_INDEX];
}

// Where the slip goes. A test run sets MAKEFUN_OUTPUT_DIR to a scratch
// directory; the grader leaves it unset and the slip lands in /output.
function resolveOutputPath(): string {
  const dir = process.env.MAKEFUN_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR;
  return join(dir, OUTPUT_FILE);
}

function main(): void {
  const fortune = crackCookie();
  const outputPath = resolveOutputPath();
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, fortune, "utf8");
  // Read the slip back and hold what landed on disk to the same gate:
  // a write that silently changed the text (encoding, truncation) must
  // fail here, while the run is still ours, not at the sealed scorer.
  const written = readFileSync(outputPath, "utf8");
  validateFortune(written);
  if (written !== fortune) {
    throw new Error("The fortune on disk differs from the fortune served");
  }
  console.log(
    `Cracked a fortune cookie: ${countChars(fortune)} characters to ${outputPath}`,
  );
  console.log(fortune);
}

main();
