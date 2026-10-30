import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

// Tips are Markdown files in content/tips/. Each starts with a small
// front-matter block:
//
// ---
// title: Keep retrieval out of the model
// summary: One or two sentences shown on cards and in the chat.
// category: Engineering
// date: 2026-10-30
// read: 4 min read
// keywords: rag retrieval tokens      (optional, extra words the chat matches)
// ---

export interface TipMeta {
  slug: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  read: string;
  keywords: string;
}

export interface Tip extends TipMeta {
  html: string;
}

const DIR = path.join(process.cwd(), "content", "tips");

function parse(file: string): Tip {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) throw new Error(`content/tips/${file}: missing front matter`);
  const meta: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  for (const key of ["title", "summary", "category", "date"]) {
    if (!meta[key]) throw new Error(`content/tips/${file}: missing "${key}"`);
  }
  return {
    slug: file.replace(/\.md$/, ""),
    title: meta.title,
    summary: meta.summary,
    category: meta.category,
    date: meta.date,
    read: meta.read || "",
    keywords: meta.keywords || "",
    html: marked.parse(m[2], { async: false }) as string,
  };
}

export function getTips(): Tip[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map(parse)
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

export function getTip(slug: string): Tip | undefined {
  return getTips().find((t) => t.slug === slug);
}

export function tipMeta(t: Tip): TipMeta {
  const { html: _html, ...meta } = t;
  return meta;
}

export function formatDate(iso: string, style: "medium" | "long" = "medium") {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00Z" : ""));
  return d.toLocaleDateString("en-US", { year: "numeric", month: style === "long" ? "long" : "short", day: "numeric", timeZone: "UTC" });
}
