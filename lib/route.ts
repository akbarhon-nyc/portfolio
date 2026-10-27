import { cases } from "./content";

// Deterministic intent routing, the same idea as brain.py:
// strip the question to keywords, score every source, return the best one.
// No LLM, no API key, answers in well under a millisecond.

export type Intent =
  | { kind: "case"; id: string }
  | { kind: "about" }
  | { kind: "workflow" }
  | { kind: "contact" }
  | { kind: "fallback" };

const STOP = new Set(
  "a an the is are was do does did how what why who me show tell about your you i to of in on for and or with this that it can could would please my".split(" ")
);

const EXTRA: { intent: Intent; keywords: string[] }[] = [
  { intent: { kind: "contact" }, keywords: ["contact", "hire", "email", "reach", "resume", "cv", "linkedin", "github", "available", "interview"] },
  { intent: { kind: "workflow" }, keywords: ["work", "process", "approach", "principles", "workflow", "method", "philosophy"] },
  { intent: { kind: "about" }, keywords: ["who", "adam", "background", "bio", "yourself", "experience", "founder", "airbrew", "intro"] },
];

export function tokens(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9.\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

export interface RouteResult {
  intent: Intent;
  score: number;
  keywords: string[];
  ms: number;
}

export function route(question: string): RouteResult {
  const t0 = typeof performance !== "undefined" ? performance.now() : 0;
  const kws = tokens(question);
  let best: { intent: Intent; score: number } = { intent: { kind: "fallback" }, score: 0 };

  const score = (keywords: string[]) =>
    kws.reduce((s, k) => s + (keywords.includes(k) ? 2 : keywords.some((w) => w.startsWith(k) || k.startsWith(w)) ? 1 : 0), 0);

  for (const c of cases) {
    const s = score(c.keywords);
    if (s > best.score) best = { intent: { kind: "case", id: c.id }, score: s };
  }
  for (const e of EXTRA) {
    const s = score(e.keywords);
    if (s > best.score) best = { intent: e.intent, score: s };
  }
  const ms = typeof performance !== "undefined" ? performance.now() - t0 : 0;
  return { ...best, keywords: kws, ms };
}
