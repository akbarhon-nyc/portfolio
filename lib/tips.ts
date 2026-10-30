import fs from "node:fs";
import path from "node:path";
import { Marked } from "marked";
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";

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
// download: /downloads/file.pdf       (optional, shows a download card under the post)
// downloadLabel: Context window cheat sheet (PDF)
//
// Code fences accept a title and an output flag in the info string:
//   ```python title=demo.py
//   ```text output
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

export interface TipHeading {
  id: string;
  text: string;
}

export interface Tip extends TipMeta {
  html: string;
  headings: TipHeading[];
  download?: { href: string; label: string };
}

const DIR = path.join(process.cwd(), "content", "tips");

hljs.registerLanguage("python", python);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("json", json);

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const unescape = (t: string) => t.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const slugify = (t: string) =>
  t
    .toLowerCase()
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// One renderer per post, so heading ids and the table of contents stay in step.
function render(markdown: string): { html: string; headings: TipHeading[] } {
  const headings: TipHeading[] = [];
  const md = new Marked({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        if (depth === 2 || depth === 3) {
          const plain = unescape(text.replace(/<[^>]+>/g, ""));
          const id = slugify(plain);
          if (depth === 2) headings.push({ id, text: plain });
          return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-label="Link to this section">#</a>${text}</h${depth}>\n`;
        }
        return `<h${depth}>${text}</h${depth}>\n`;
      },
      code({ text, lang }) {
        const raw = lang || "";
        const language = raw.split(/\s+/)[0] || "text";
        const titleMatch = raw.match(/title="([^"]+)"|title=(\S+)/);
        const title = titleMatch ? titleMatch[1] || titleMatch[2] : "";
        const isOutput = /\boutput\b/.test(raw.replace(/title="[^"]*"/, ""));
        const body = hljs.getLanguage(language) ? hljs.highlight(text, { language }).value : esc(text);
        const label = isOutput ? "Output" : title || language;
        const copy = isOutput ? "" : `<button type="button" class="code-copy" data-copy>Copy</button>`;
        return `<figure class="code${isOutput ? " code-output" : ""}"><figcaption><span>${esc(label)}</span>${copy}</figcaption><pre><code>${body}</code></pre></figure>\n`;
      },
      table({ header, rows }) {
        const cell = (c: { tokens: unknown[]; align: string | null }, tag: string) =>
          `<${tag}${c.align ? ` style="text-align:${c.align}"` : ""}>${this.parser.parseInline(c.tokens as never)}</${tag}>`;
        const head = `<tr>${header.map((c) => cell(c, "th")).join("")}</tr>`;
        const body = rows.map((r) => `<tr>${r.map((c) => cell(c, "td")).join("")}</tr>`).join("");
        return `<div class="table-scroll"><table><thead>${head}</thead><tbody>${body}</tbody></table></div>\n`;
      },
    },
  });
  return { html: md.parse(markdown, { async: false }) as string, headings };
}

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
  const { html, headings } = render(m[2]);
  return {
    slug: file.replace(/\.md$/, ""),
    title: meta.title,
    summary: meta.summary,
    category: meta.category,
    date: meta.date,
    read: meta.read || "",
    keywords: meta.keywords || "",
    html,
    headings,
    download: meta.download ? { href: meta.download, label: meta.downloadLabel || "Download" } : undefined,
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
  const { html: _html, headings: _headings, download: _download, ...meta } = t;
  return meta;
}

export function formatDate(iso: string, style: "medium" | "long" = "medium") {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00Z" : ""));
  return d.toLocaleDateString("en-US", { year: "numeric", month: style === "long" ? "long" : "short", day: "numeric", timeZone: "UTC" });
}
