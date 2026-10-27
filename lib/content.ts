// All portfolio content lives here. Edit this file to change what the site says.
// Anything marked `todo: true` renders as a dashed "fill me in" chip on the site,
// so unmeasured numbers are never presented as real.

export const profile = {
  name: "Adam (Akbarhon) Toshkhujayev",
  short: "Adam",
  initials: "AT",
  role: "AI Engineer · Solo founder of AirBrew",
  location: "New York",
  intro:
    "I build AI systems that stay cheap, reliable and explainable: retrieval that answers in milliseconds, import pipelines that try free routes before paid ones, and context layers that keep several AI agents working from the same truth.",
  background:
    "Background in software engineering and project management, including time at a YC incubator. For the past eight months I've been building AirBrew, a beverage discovery and recipe platform (\"Julienne for drinks\"), now live in beta, as a solo founder working with Claude Code, Cursor and Codex.",
  links: {
    github: "https://github.com/akbarhon-nyc",
    email: "", // TODO: add your email to show a contact button
    linkedin: "", // TODO: add your LinkedIn URL
    resume: "", // TODO: add a resume link (PDF in /public or a hosted URL)
  },
};

export interface Metric {
  value: string;
  label: string;
  todo?: boolean;
}

export interface Step {
  title: string;
  detail: string;
}

export interface CaseStudy {
  id: string;
  index: string;
  title: string;
  short: string;
  prompt: string;
  keywords: string[];
  tagline: string;
  problem: string;
  solution: string;
  steps: Step[];
  tools: string[];
  metrics: Metric[];
  code?: { file: string; body: string };
  lessons: string[];
  bench?: boolean;
}

export const cases: CaseStudy[] = [
  {
    id: "memory",
    index: "01",
    title: "Second Brain: deterministic memory for AI agents",
    short: "Second brain memory",
    prompt: "Show me the memory system",
    keywords: ["memory", "brain", "second", "retrieval", "recall", "token", "tokens", "context", "rag", "benchmark", "search", "knowledge"],
    tagline:
      "A repo-native knowledge base that AI agents query with code, not by reading files. About 15× fewer tokens than grep, answers in ~2 ms.",
    problem:
      "Every AI coding session started from zero. To recall a past decision the agent either grepped the whole knowledge folder or read files end to end. Both burned thousands of tokens, got slower as notes grew, and still surfaced the wrong passage.",
    solution:
      "A private brain/ directory inside the repo with a strict split: immutable raw sources, an AI-maintained wiki with a fixed page format, and an append-only log. A small Python tool does retrieval deterministically, so the model only sees evidence at the very end.",
    steps: [
      { title: "Structure", detail: "raw/ (immutable sources) → wiki/ (compiled truth + timeline per page) → log.md (append-only). A generated index.md lists every source." },
      { title: "Score without opening", detail: "brain.py strips the question to keywords and scores every source from index.md, without opening a single file." },
      { title: "Read one section", detail: "Opens only the top file, returns only its best ## section, and follows at most one pointer." },
      { title: "Store with zero model calls", detail: "brain.py store writes the file, updates the index and appends the log in one command." },
      { title: "Skills on top", detail: "Three Claude Code skills wrap it: brain-ingest (new sources), brain-recall (questions), brain-lint (weekly hygiene)." },
      { title: "Prove it", detail: "bench.py races the brain path against grep and full reads on real questions, at current size and with +100 filler pages." },
    ],
    tools: ["Python", "Claude Code skills", "Markdown", "CLAUDE.md routing"],
    metrics: [
      { value: "~15×", label: "fewer tokens than grep (858 vs 12,795 avg)" },
      { value: "~32×", label: "fewer tokens than reading the brain (858 vs 27,452)" },
      { value: "2.1 ms", label: "average retrieval time" },
      { value: "Flat", label: "cost at +100 pages (858 → 859 tokens)" },
    ],
    bench: true,
    code: {
      file: "brain/tools/brain.py: retrieval path",
      body: `def find(question):
    kws   = tokens(question)            # strip to keywords
    top   = score_index(kws)[0]         # rank sources from index.md, no file reads
    sect  = best_section(top.path, kws) # open ONE file, return ONE ## section
    ptr   = follow_pointer(sect, max=1) # at most one [[wikilink]] hop
    return evidence(sect, ptr)          # the model sees only this`,
    },
    lessons: [
      "Code before model: keep retrieval out of the LLM and token cost stops growing with the corpus.",
      "A benchmark with a hard pass line keeps you honest. The latest run flagged one question that regressed, and that's exactly what it's there to catch.",
      "Pages split into topical sections so retrieval can return a paragraph, not a document.",
    ],
  },
  {
    id: "pipeline",
    index: "02",
    title: "Free-first AI recipe import pipeline",
    short: "AI import pipeline",
    prompt: "How does the recipe import pipeline work?",
    keywords: ["import", "pipeline", "scraper", "scrape", "recipe", "adapter", "cache", "queue", "groq", "llm", "parser", "instagram", "tiktok", "youtube", "cost", "ingest", "failure"],
    tagline:
      "Paste any Instagram, TikTok, YouTube, Pinterest or recipe-site link and get a structured drink recipe. Free routes first, paid scraping only as a last resort.",
    problem:
      "Recipes live inside social posts and blogs. Paid scraping APIs work but charge per call, platforms block datacenter traffic, and LLM parsing is slow and costly if you run it on everything. Failures were vague, so users and analytics couldn't tell why an import broke.",
    solution:
      "An adapter-based pipeline: a router sends each URL to the cheapest adapter that can handle it, a two-tier cache stops repeat work, deterministic parsing runs before any model call, and every failure maps to one code in a shared enum.",
    steps: [
      { title: "Canonicalize + L1 cache", detail: "URLs are normalized and hashed. scraped_content caches the raw fetch by URL hash for 30 days, so a repeat import costs nothing." },
      { title: "Router, free first", detail: "Adapters register in priority order: YouTube Data API → Pinterest → self-hosted ingest service → ScrapeCreators (paid, always last)." },
      { title: "Self-hosted ingest service", detail: "A Python fetch-only service (Docker + Caddy on Hetzner) using official and embed routes, real browser TLS fingerprints, token buckets, circuit breakers and single-flight coalescing: 100 users sharing one viral reel = 1 upstream request." },
      { title: "Deterministic before AI", detail: "JSON-LD, microdata and HTML extraction run first. Only when they fail does the LLM parser run, on Groq gpt-oss-20b, validated by a zod schema." },
      { title: "L2 cache by content", detail: "parsed_recipes stores the structured result by content hash, so the same recipe reposted elsewhere isn't parsed twice." },
      { title: "18-code failure enum", detail: "Every retry decision, user-facing message and analytics event maps to one canonical code (TIMEOUT, NOT_A_DRINK, PARSE_LOW_CONFIDENCE…)." },
    ],
    tools: ["Next.js 16", "TypeScript", "Supabase (Postgres)", "Python", "Scrapling / yt-dlp", "Groq gpt-oss-20b", "zod", "Docker", "Vitest + pytest"],
    metrics: [
      { value: "18", label: "canonical failure codes" },
      { value: "2-tier", label: "cache: raw by URL, parsed by content" },
      { value: "$0", label: "per call on free adapters, paid only as fallback" },
      { value: "[$X]", label: "average cost per import, free vs paid path", todo: true },
    ],
    code: {
      file: "scraper router: order = priority",
      body: `export const router = new ScraperRouter([
  new YouTubeDapiAdapter(),      // costPerCall: 0
  new PinterestAdapter(),        // costPerCall: 0
  new SelfHostedIngestAdapter(), // costPerCall: 0  (ADR-0008)
  new ScrapeCreatorsAdapter(),   // paid. must be last, catches everything
])`,
    },
    lessons: [
      "Make cost a property of the interface (costPerCall) and routing becomes a pricing decision you can reason about.",
      "When Groq retired the Llama models, 22 hardcoded calls broke at once. I moved every call behind one AI_MODEL setting that fails loudly with a clear message instead of an opaque 404.",
      "Fetch and parse are separate jobs: many adapters, exactly one parser.",
      "Next: a pg-boss queue with Supabase Realtime progress for bulk imports (decided in ADR-0004).",
    ],
  },
  {
    id: "context",
    index: "03",
    title: "Multi-agent context system: Claude, Cursor and Codex in sync",
    short: "Multi-agent context",
    prompt: "How do you keep Claude, Cursor and Codex in sync?",
    keywords: ["agents", "agent", "cursor", "codex", "claude", "sync", "handoff", "agents.md", "claude.md", "graphify", "graph", "workflow", "adr", "multi", "context", "tools"],
    tagline:
      "A shared context layer so three AI coding tools work from one source of truth, hand off cleanly, and never rebuild understanding from scratch.",
    problem:
      "Chat history never leaves the tool it happened in. Switching between Claude Code, Cursor and Codex meant re-explaining the project, agents trusting outdated docs (an abandoned backend, an old design), and contradicting decisions already made.",
    solution:
      "A layered context system checked into the repo: rules for how to reason (AGENTS.md), tool-specific setup (CLAUDE.md), a single handoff baton (docs/now.md), decision records, a zero-cost code graph and the second brain.",
    steps: [
      { title: "AGENTS.md: the meta-layer", detail: "Names exactly 8 authoritative docs, a precedence order for conflicts (latest ADR → subsystem spec → design handoff → build plan) and a 'superseded' table so dead patterns never come back." },
      { title: "Handoff baton", detail: "docs/now.md opens with a Handoff section every tool overwrites at session end: what shipped, what's in flight, what the founder was offered but hasn't chosen." },
      { title: "Decisions as ADRs", detail: "Non-obvious choices (queue runtime, self-hosted ingest, privacy rules) become ADRs, so 'why' survives across tools and months." },
      { title: "Code graph, no API cost", detail: "graphify builds an AST knowledge graph (2,324 nodes, 4,614 edges, 174 communities across 438 files) that agents read before answering architecture questions." },
      { title: "Read by section", detail: "Large docs are never read whole: agents list ## headings and open only the section they need." },
      { title: "Start / end protocol", detail: "Pull → read handoff → work → overwrite handoff → log to brain → commit and push. Git is the shared memory between tools." },
    ],
    tools: ["AGENTS.md", "CLAUDE.md", "Cursor rules", "graphify", "ADRs", "GitHub PR flow"],
    metrics: [
      { value: "3", label: "AI tools sharing one source of truth" },
      { value: "8", label: "authoritative docs, everything else is non-binding" },
      { value: "2,324", label: "code graph nodes built at zero token cost" },
      { value: "[X min]", label: "session start-up time, before vs after", todo: true },
    ],
    code: {
      file: "AGENTS.md: source of truth precedence",
      body: `When two documents conflict, resolve in this order:
  1. The latest ADR on the topic
  2. The architecture spec for that subsystem
  3. The design handoff (user-facing behavior)
  4. The build plan (implementation order only)
If it still can't be resolved: STOP and ask the human.`,
    },
    lessons: [
      "Telling agents what's dead matters as much as telling them what's true.",
      "Overwrite the handoff, don't append to it, so the next tool reads current state rather than history.",
      "Plan in Claude, build in Cursor, and keep a single handoff document between them.",
    ],
  },
  {
    id: "design",
    index: "04",
    title: "A design system written for AI agents",
    short: "AI-driven design system",
    prompt: "Tell me about the AI design system",
    keywords: ["design", "system", "ui", "tokens", "token", "tailwind", "design.md", "brand", "color", "colors", "typography", "consistent", "locked", "figma"],
    tagline:
      "Turning taste into rules an AI can follow: exact tokens, locked decisions and always/never directives, so generated UI stays on-brand.",
    problem:
      "AI agents produced UI that was almost right: off-brand colors, mixed icon sets, new layouts that quietly contradicted earlier decisions. Every screen needed manual correction.",
    solution:
      "A machine-readable design source of truth. Exact color tokens extracted from real screenshots, a design handoff with locked decisions, Tailwind tokens as CSS variables, and a living React reference agents can check against.",
    steps: [
      { title: "Extract, don't guess", detail: "Pixel-sampled real AirBrew screenshots to pull exact color tokens instead of eyeballing hex values." },
      { title: "Tokens as variables", detail: "Colors, type and spacing live in CSS variables. Hardcoding the brand coral or the serif font in a component is a rule violation." },
      { title: "Locked decisions", detail: "15 decisions are marked (LOCKED) in the handoff: top nav only, Remix Icons only, three privacy states. Agents can't change them without a new ADR." },
      { title: "Always / never rules", detail: "Short directive lists (min font sizes, one icon family, no inline styles) that turn taste into checkable constraints." },
      { title: "Living reference", detail: "An interactive React page showing colors, typography, spacing, components and motion, so 'what does this look like' has one answer." },
      { title: "Versioned evolution", detail: "The brand moved from a dark apothecary look to an editorial magazine style. The old one is recorded as superseded so agents never revive it." },
    ],
    tools: ["DESIGN.md / design handoff", "Tailwind CSS v4", "shadcn/ui", "React", "Remix Icons"],
    metrics: [
      { value: "15", label: "locked design decisions agents must respect" },
      { value: "33", label: "sections in the design source of truth" },
      { value: "1", label: "icon family allowed (Remix only)" },
      { value: "[X%]", label: "fewer UI fix-ups per screen", todo: true },
    ],
    code: {
      file: "design rules for agents",
      body: `ALWAYS  colors, type, spacing from globals.css variables
ALWAYS  Remix Icons (ri-*), top nav only
NEVER   hardcode the brand coral or the serif font
NEVER   inline styles; text-sm minimum for body copy
NEVER   change a (LOCKED) decision without a new ADR`,
    },
    lessons: [
      "AI is great at following rules and bad at inferring taste, so write the taste down as rules.",
      "Recording superseded designs stops agents from 'helpfully' resurrecting old ones.",
    ],
  },
];

export const benchRows = [
  { q: "why did we choose supabase over convex", ok: true, brain: 198, grep: 5631, naive: 27452 },
  { q: "what fonts does the design system use", ok: true, brain: 196, grep: 9519, naive: 27452 },
  { q: "what is airbrew's business architecture", ok: true, brain: 1758, grep: 15251, naive: 27452 },
  { q: "which components need founder approval", ok: false, brain: 252, grep: 22354, naive: 27452 },
  { q: "what is the status of the supabase project", ok: true, brain: 1888, grep: 11220, naive: 27452 },
];

export const workflow = {
  title: "How I work with AI",
  points: [
    { title: "Plan in Claude, build in Cursor", detail: "Specs, architecture and decisions happen in Claude. Implementation happens in Cursor or Codex, bridged by one handoff document." },
    { title: "Code before model", detail: "Deterministic code handles routing, retrieval and parsing wherever it can. The LLM is the fallback, not the default." },
    { title: "Verify before done", detail: "Benchmarks with pass lines, Vitest and pytest suites, and CI on every PR. 'It compiles' isn't done." },
    { title: "Write decisions down", detail: "ADRs for the 'why', a superseded table for what's dead, and locked decisions for what's settled." },
  ],
};
