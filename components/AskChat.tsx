"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cases, education, experience, languages, courses, profile, workflow, type CaseStudy } from "@/lib/content";
import type { TipMeta } from "@/lib/tips";

/* ============================================================
   Ask Chat
   Questions (typed, starters or chips) are routed with deterministic
   keyword scoring, then the answer "thinks" and streams in.
   No LLM, no API key.
   ============================================================ */

type CaseKey = "memory" | "pipeline" | "context" | "design";
type Key = CaseKey | "about" | "workflow" | "contact" | "tips" | "tip" | "fallback";

const EASE = [0.22, 1, 0.36, 1] as const;
const smart = (s: string) => s.replace(/'/g, "’");

const SUBS: Record<CaseKey, string> = {
  memory: "~15× fewer tokens than grep",
  pipeline: "Free routes first, paid last",
  context: "One source of truth, 3 tools",
  design: "Taste turned into rules",
};

const caseByKey = (k: string) => cases.find((c) => c.id === k);

const PROMPTS: Record<Key, string> = {
  memory: caseByKey("memory")!.prompt,
  pipeline: caseByKey("pipeline")!.prompt,
  context: caseByKey("context")!.prompt,
  design: caseByKey("design")!.prompt,
  about: "Who is Adam?",
  workflow: "How do you work with AI?",
  contact: "How can I contact Adam?",
  tips: "Show me your latest tips",
  tip: "",
  fallback: "",
};

const FILES: Record<Key, string> = {
  memory: "case_01.md",
  pipeline: "case_02.md",
  context: "case_03.md",
  design: "case_04.md",
  about: "about.md",
  workflow: "workflow.md",
  contact: "contact.md",
  tips: "tips/index",
  tip: "tips/",
  fallback: "no match",
};

const CHIPS: { key: Key; label: string; idx?: string }[] = [
  ...cases.map((c) => ({ key: c.id as Key, label: c.short, idx: c.index })),
  { key: "tips", label: "Tips & notes" },
  { key: "about", label: "Who is Adam?" },
  { key: "workflow", label: "How I work with AI" },
  { key: "contact", label: "Contact" },
];

const NEXT: Record<Key, Key[]> = {
  memory: ["context", "pipeline"],
  pipeline: ["memory", "design"],
  context: ["memory", "workflow"],
  design: ["context", "contact"],
  about: ["workflow", "contact"],
  workflow: ["memory", "about"],
  contact: ["about", "memory"],
  tips: ["memory", "contact"],
  tip: ["tips", "memory"],
  fallback: ["tips", "memory"],
};

/* ---------------- routing ---------------- */

const STOP = new Set(
  "a an the is are was do does did how what why who me show tell about your you i to of in on for and or with this that it can could would please my".split(" ")
);

const SOURCES: { key: Key; keywords: string[] }[] = [
  ...cases.map((c) => ({ key: c.id as Key, keywords: c.keywords })),
  { key: "contact", keywords: ["contact", "hire", "email", "reach", "resume", "cv", "linkedin", "github", "available", "interview"] },
  { key: "workflow", keywords: ["work", "process", "approach", "principles", "workflow", "method", "philosophy"] },
  { key: "about", keywords: ["who", "adam", "background", "bio", "yourself", "experience", "founder", "airbrew", "intro"] },
  { key: "tips", keywords: ["tip", "tips", "blog", "post", "posts", "article", "articles", "advice", "notes", "guide", "guides", "latest", "writing"] },
];

function tokens(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9.\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function scoreWords(kws: string[], words: string[]) {
  return kws.reduce(
    (acc, k) => acc + (words.includes(k) ? 2 : words.some((w) => w.length > 2 && k.length > 2 && (w.startsWith(k) || k.startsWith(w))) ? 1 : 0),
    0
  );
}

interface ChatTip extends TipMeta {
  words: string[];
}

function route(question: string, tips: ChatTip[] = []) {
  const t0 = performance.now();
  const kws = tokens(question);
  let best: { key: Key; score: number; tip?: ChatTip } = { key: "fallback", score: 0 };
  for (const s of SOURCES) {
    const score = scoreWords(kws, s.keywords);
    if (score > best.score) best = { key: s.key, score };
  }
  // a specific tip has to beat the curated sources outright
  for (const tip of tips) {
    const score = scoreWords(kws, tip.words);
    if (score > best.score) best = { key: "tip", score, tip };
  }
  return { ...best, keywords: kws, ms: performance.now() - t0 };
}

/* ---------------- small UI pieces ---------------- */

function Label({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return <div className={"t-label" + (accent ? " !text-accent" : "")}>{children}</div>;
}

function Pill({ children, onClick, outline }: { children: ReactNode; onClick?: () => void; outline?: boolean }) {
  const cls =
    "inline-flex items-center gap-2 whitespace-nowrap rounded-full text-[14px] font-medium tracking-[-0.005em] text-ink " +
    (outline ? "border border-line bg-paper px-3.5 py-2" : "bg-deep px-3 py-1.5");
  if (!onClick) return <span className={cls}>{children}</span>;
  return (
    <motion.button type="button" onClick={onClick} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} className={cls + " cursor-pointer"}>
      {children}
    </motion.button>
  );
}

function Spark({ spinning }: { spinning: boolean }) {
  return (
    <motion.svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden
      className="flex-none"
      animate={spinning ? { rotate: 360, scale: [1, 0.78, 1] } : { rotate: 45, scale: 1 }}
      transition={
        spinning
          ? { rotate: { duration: 1.4, repeat: Infinity, ease: "linear" }, scale: { duration: 0.7, repeat: Infinity, ease: "easeInOut" } }
          : { duration: 0.4, ease: EASE }
      }
    >
      {[0, 45, 90, 135].map((a) => (
        <rect key={a} x="10.9" y="2" width="2.2" height="20" rx="1.1" fill="var(--accent)" transform={"rotate(" + a + " 12 12)"} />
      ))}
    </motion.svg>
  );
}

function Avatar() {
  return (
    <span className="grid h-7 w-7 flex-none place-items-center overflow-hidden rounded-full" style={{ background: "#FF5E24" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/adam-avatar.png"
        alt=""
        draggable={false}
        className="h-full w-full object-cover"
        style={{ objectPosition: "50% 18%", transform: "scale(1.35) translateY(6%)" }}
      />
    </span>
  );
}

const body = "m-0 text-[15px] leading-[1.6] tracking-[-0.005em] text-soft";
const strong = "m-0 text-[14px] font-medium leading-[1.4] text-ink";

/* ---------------- answers ---------------- */

interface Answer {
  lead: string;
  blocks: ReactNode[];
}

function caseAnswer(c: CaseStudy, followUps: ReactNode): Answer {
  return {
    lead: smart(c.tagline),
    blocks: [
      <div key="ps" className="tray flex flex-wrap gap-1.5">
        {[
          ["Problem", c.problem],
          ["Solution", c.solution],
        ].map(([l, s]) => (
          <div key={l} className="inset-card flex min-w-0 flex-[1_1_240px] flex-col gap-2.5 p-[22px]">
            <Label>{l}</Label>
            <p className={body}>{smart(s)}</p>
          </div>
        ))}
      </div>,
      <Label key="hl">How it works</Label>,
      ...c.steps.map((s, i) => (
        <div key={"s" + i} className="flex gap-4 border-b border-line pb-4">
          <span className="t-note w-6 flex-none pt-0.5">{String(i + 1).padStart(2, "0")}</span>
          <div className="flex min-w-0 flex-col gap-1">
            <p className={strong}>{smart(s.title)}</p>
            <p className={body}>{smart(s.detail)}</p>
          </div>
        </div>
      )),
      <div key="m" className="tray flex flex-wrap gap-1.5">
        {c.metrics.map((m) => (
          <div
            key={m.label}
            className={"inset-card flex min-w-0 flex-[1_1_150px] flex-col gap-2 px-[18px] py-5 " + (m.todo ? "border border-dashed border-accent" : "border border-transparent")}
          >
            <div className="font-serif text-[30px] leading-[1.05] tracking-[-0.03em] text-ink" style={{ fontVariantNumeric: "tabular-nums" }}>
              {m.value}
            </div>
            <p className="m-0 text-[13px] leading-[1.45] text-soft">{m.label}</p>
            {m.todo ? <Label accent>to measure</Label> : null}
          </div>
        ))}
      </div>,
      <div key="tl" className="flex flex-col gap-3">
        <Label>Built with</Label>
        <div className="flex flex-wrap gap-2">
          {c.tools.map((x) => (
            <Pill key={x}>{x}</Pill>
          ))}
        </div>
      </div>,
      c.code ? (
        <div key="code" className="flex flex-col gap-2.5 rounded-[20px] bg-deep px-6 py-5">
          <Label>{c.code.file}</Label>
          <pre className="m-0 overflow-x-auto whitespace-pre font-mono text-[13px] leading-[1.65] text-ink">{c.code.body}</pre>
        </div>
      ) : (
        <span key="code" />
      ),
      <div key="ls" className="flex flex-col gap-3">
        <Label>What I learned</Label>
        {c.lessons.map((l) => (
          <div key={l} className="flex items-baseline gap-3">
            <span className="h-1.5 w-1.5 flex-none -translate-y-0.5 rounded-full bg-accent" />
            <p className={body}>{smart(l)}</p>
          </div>
        ))}
      </div>,
      <div key="fu">{followUps}</div>,
    ],
  };
}

function buildAnswer(key: Key, onAsk: (k: Key) => void, tip: ChatTip | undefined, tips: ChatTip[]): Answer {
  const followUps = (
    <div className="flex flex-col gap-2.5">
      <Label>Keep asking</Label>
      <div className="flex flex-wrap gap-2">
        {NEXT[key].map((k) => (
          <Pill key={k} outline onClick={() => onAsk(k)}>
            <span className="text-accent">↳</span> {PROMPTS[k]}
          </Pill>
        ))}
      </div>
    </div>
  );
  const linkBtn = (href: string, label: string, primary = true) => (
    <Link
      href={href}
      className={
        "inline-flex items-center gap-2 rounded-full px-[18px] py-[11px] text-[14px] font-medium no-underline transition-transform hover:-translate-y-px " +
        (primary ? "bg-ink text-paper" : "border border-line bg-paper text-ink")
      }
    >
      {label}
    </Link>
  );
  const tipRow = (x: ChatTip) => (
    <Link key={x.slug} href={"/tips/" + x.slug} className="inset-card flex flex-col gap-2 px-[22px] py-[18px] no-underline transition-transform hover:-translate-y-px">
      <span className="flex flex-wrap items-center gap-2.5">
        <Label>{x.category}</Label>
        {x.read ? <span className="t-note">{x.read}</span> : null}
      </span>
      <span className="font-serif text-[20px] leading-[1.2] tracking-[-0.015em] text-ink">{x.title}</span>
      <span className="text-[14px] leading-[1.6] text-soft">{x.summary}</span>
    </Link>
  );

  const c = caseByKey(key);
  if (c) return caseAnswer(c, followUps);

  if (key === "tip" && tip) {
    return {
      lead: tip.title,
      blocks: [
        <div key="meta" className="flex flex-wrap items-center gap-2.5">
          <Pill>{tip.category}</Pill>
          {tip.read ? <span className="t-note">{tip.read}</span> : null}
        </div>,
        <p key="sum" className={body + " !text-[16px]"}>
          {tip.summary}
        </p>,
        <div key="cta" className="flex flex-wrap gap-2">
          {linkBtn("/tips/" + tip.slug, "Read the full tip →")}
          {linkBtn("/tips", "All tips", false)}
        </div>,
        <div key="fu">{followUps}</div>,
      ],
    };
  }
  if (key === "tips") {
    const list = tips.slice(0, 5);
    return {
      lead: list.length ? "Here are my latest tips on AI and the tools I use." : "My tips on AI and AI tools live on the Tips page.",
      blocks: [
        ...(list.length
          ? [
              <div key="list" className="tray flex flex-col gap-1.5">
                {list.map(tipRow)}
              </div>,
            ]
          : []),
        <div key="all">{linkBtn("/tips", "All tips →")}</div>,
        <div key="fu">{followUps}</div>,
      ],
    };
  }
  if (key === "about") {
    return {
      lead: "I’m Adam (Akbarhon) Toshkhujayev, an AI engineer in New York and the solo founder of AirBrew.",
      blocks: [
        <p key="bg" className={body + " !text-[16px]"}>
          {smart(profile.background)}
        </p>,
        <div key="roles" className="tray flex flex-col gap-1.5">
          {experience.slice(0, 3).map((r) => (
            <div key={r.org} className="inset-card flex flex-col gap-1.5 px-[22px] py-[18px]">
              <div className="flex flex-wrap justify-between gap-3">
                <p className={strong}>
                  {r.role} · {r.org}
                </p>
                <span className="t-note">{r.when}</span>
              </div>
              <p className={body + " !text-[14px]"}>{smart(r.points[0])}</p>
            </div>
          ))}
        </div>,
        <div key="edu" className="flex flex-col gap-3">
          <Label>Education</Label>
          {education.map((e) => (
            <p key={e.degree} className={body + " !text-[14px]"}>
              <span className="text-ink">{e.degree}</span> · {e.school}
            </p>
          ))}
        </div>,
        <div key="lang" className="flex flex-col gap-3">
          <Label>Languages and courses</Label>
          <div className="flex flex-wrap gap-2">
            {[...languages, ...courses].map((x) => (
              <Pill key={x}>{x}</Pill>
            ))}
          </div>
        </div>,
        <div key="fu">{followUps}</div>,
      ],
    };
  }
  if (key === "workflow") {
    return {
      lead: "Four habits I use on every project: plan and build in different tools, keep the model as the fallback, verify everything and write decisions down.",
      blocks: [
        ...workflow.points.map((p, i) => (
          <div key={p.title} className="flex flex-col gap-2 rounded-[20px] bg-deep p-[22px]">
            <span className="t-note">{String(i + 1).padStart(2, "0")}</span>
            <p className={strong}>{p.title}</p>
            <p className={body + " !text-[14px]"}>{smart(p.detail)}</p>
          </div>
        )),
        <div key="fu">{followUps}</div>,
      ],
    };
  }
  if (key === "contact") {
    const links: [string, string, string][] = [
      ["Email", profile.links.email, "mailto:" + profile.links.email],
      ["LinkedIn", profile.links.linkedin.replace(/^https?:\/\/(www\.)?/, ""), profile.links.linkedin],
      ["GitHub", profile.links.github.replace(/^https?:\/\//, ""), profile.links.github],
    ];
    return {
      lead: "Let’s talk. I’m open to AI engineering roles, and email is the fastest way to reach me.",
      blocks: [
        <div key="links" className="tray flex flex-col gap-1.5">
          {links.map(([l, v, h]) => (
            <a
              key={l}
              href={h}
              target={l === "Email" ? undefined : "_blank"}
              rel="noreferrer"
              className="inset-card flex items-center justify-between gap-3 px-[22px] py-[18px] no-underline transition-transform hover:-translate-y-px"
            >
              <span className="flex flex-col gap-1">
                <Label>{l}</Label>
                <span className={strong}>{v}</span>
              </span>
              <span className="text-[16px] text-accent">↗</span>
            </a>
          ))}
        </div>,
        <div key="fu">{followUps}</div>,
      ],
    };
  }
  return {
    lead: "I don’t have a case study for that yet.",
    blocks: [
      <p key="b" className={body}>
        Try asking about the memory system, the recipe import pipeline, keeping Claude, Cursor and Codex in sync, the AI design system or my tips.
      </p>,
      <div key="fu">{followUps}</div>,
    ],
  };
}

/* ---------------- messages ---------------- */

interface Msg {
  id: number;
  role: "user" | "assistant";
  text?: string;
  key?: Key;
  score?: number;
  keywords?: string[];
  ms?: number;
  done?: boolean;
  tip?: ChatTip;
}

function Assistant({
  msg,
  speed,
  reduced,
  tips,
  onAsk,
  onDone,
}: {
  msg: Msg;
  speed: number;
  reduced: boolean;
  tips: ChatTip[];
  onAsk: (k: Key) => void;
  onDone: (id: number) => void;
}) {
  const key = msg.key as Key;
  const live = !msg.done;
  const ans = buildAnswer(key, onAsk, msg.tip, tips);
  const file = key === "tip" ? "tips/" + (msg.tip?.slug || "") + ".md" : FILES[key];
  const kw = (msg.keywords || []).slice(0, 4).join(" ") || "…";
  const steps = [
    "Reading index.md",
    "Scoring " + (SOURCES.length + tips.length) + " sources for “" + kw + "”",
    key === "fallback" ? "No source scored above zero" : "Opening " + file + " · score " + msg.score,
  ];
  const [stage, setStage] = useState(live && !reduced ? 0 : 9);
  const [typed, setTyped] = useState(live && !reduced ? 0 : ans.lead.length);
  const [shown, setShown] = useState(live && !reduced ? 0 : ans.blocks.length);
  const [open, setOpen] = useState(false);
  const [thought, setThought] = useState(0);
  const started = useRef(Date.now());

  useEffect(() => {
    if (!live) return;
    if (reduced) {
      onDone(msg.id);
      return;
    }
    const step = 380 * speed;
    const ids = [
      window.setTimeout(() => setStage(1), step),
      window.setTimeout(() => setStage(2), step * 2),
      window.setTimeout(() => {
        setThought(Date.now() - started.current);
        setStage(3);
      }, step * 3),
    ];
    return () => ids.forEach((i) => window.clearTimeout(i));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (stage !== 3) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 3;
      setTyped(i);
      if (i >= ans.lead.length) {
        window.clearInterval(id);
        setStage(4);
      }
    }, 14 * speed);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  useEffect(() => {
    if (stage !== 4) return;
    let n = 0;
    const total = ans.blocks.length;
    const id = window.setInterval(() => {
      n += 1;
      setShown(n);
      if (n >= total) {
        window.clearInterval(id);
        setStage(9);
        onDone(msg.id);
      }
    }, 110 * speed);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const thinking = stage < 3;

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex min-h-7 items-center gap-2.5">
        <Avatar />
        {thinking ? (
          <span className="inline-flex min-w-0 items-center gap-2">
            <Spark spinning />
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={stage}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, backgroundPosition: ["120% 0%", "-120% 0%"] }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ opacity: { duration: 0.18 }, y: { duration: 0.22, ease: EASE }, backgroundPosition: { duration: 1.3, repeat: Infinity, ease: "linear" } }}
                className="overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-medium"
                style={{
                  backgroundImage: "linear-gradient(90deg, var(--soft) 0%, var(--soft) 35%, var(--ink) 50%, var(--soft) 65%, var(--soft) 100%)",
                  backgroundSize: "250% 100%",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {steps[stage]}…
              </motion.span>
            </AnimatePresence>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="inline-flex cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-[14px] text-soft"
          >
            <Spark spinning={false} />
            <span>Thought for {Math.max(0.1, (thought || 1140 * speed) / 1000).toFixed(1)}s</span>
            <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.25, ease: EASE }} className="inline-block text-[12px]">
              ›
            </motion.span>
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {open && !thinking ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="ml-[38px] overflow-hidden"
          >
            <div className="t-note flex flex-col gap-1.5 border-l border-line pl-3.5">
              {steps.map((s) => (
                <span key={s}>{s}</span>
              ))}
              <span>
                <span className="text-accent">↳</span> retrieve(“{kw}”) → {file} · 1 doc · 0 LLM tokens · {(msg.ms || 0).toFixed(2)} ms
              </span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {stage >= 3 ? (
        <div className="flex flex-col gap-7">
          <div className="font-serif text-[22px] leading-[1.22] tracking-[-0.02em] text-ink sm:text-[24px]" style={{ textWrap: "pretty" }}>
            {ans.lead.slice(0, typed)}
            {stage === 3 ? (
              <motion.span
                aria-hidden
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="ml-1.5 inline-block h-[9px] w-[9px] -translate-y-0.5 rounded-full bg-accent"
              />
            ) : null}
          </div>
          {ans.blocks.slice(0, shown).map((b, i) => (
            <motion.div
              key={i}
              initial={live && !reduced ? { opacity: 0, y: 10, filter: "blur(3px)" } : false}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              {b}
            </motion.div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- main ---------------- */

export default function AskChat({ tips: tipList, speed = 1, scrollOffset = 96 }: { tips: TipMeta[]; speed?: number; scrollOffset?: number }) {
  const tips: ChatTip[] = tipList.map((t) => ({ ...t, words: tokens([t.title, t.category, t.keywords, t.summary].join(" ")) }));
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const idRef = useRef(0);
  const busyRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollTo = useRef<number | null>(null);
  const tipsRef = useRef(tips);
  tipsRef.current = tips;

  useEffect(() => {
    setReduced(!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const ask = useCallback((text: string, forced?: Key) => {
    const q = text.trim();
    if (!q || busyRef.current) return;
    const r = route(q, forced ? [] : tipsRef.current);
    const key = forced ?? r.key;
    const uid = ++idRef.current;
    const aid = ++idRef.current;
    busyRef.current = true;
    scrollTo.current = uid;
    setBusy(true);
    setValue("");
    setMsgs((m) => [
      ...m,
      { id: uid, role: "user", text: q },
      { id: aid, role: "assistant", key, score: Math.max(r.score, forced ? 2 : 0), keywords: r.keywords, ms: r.ms, tip: forced ? undefined : r.tip },
    ]);
  }, []);

  const askKey = useCallback((k: Key) => ask(PROMPTS[k], k), [ask]);

  const onDone = useCallback((id: number) => {
    busyRef.current = false;
    setBusy(false);
    setMsgs((m) => m.map((x) => (x.id === id ? { ...x, done: true } : x)));
  }, []);

  // bring the new question to the top of the viewport, like a chat app
  useEffect(() => {
    const id = scrollTo.current;
    if (id == null) return;
    scrollTo.current = null;
    requestAnimationFrame(() => {
      const el = rootRef.current?.querySelector('[data-msg="' + id + '"]') as HTMLElement | null;
      if (!el) return;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - scrollOffset, behavior: reduced ? "auto" : "smooth" });
    });
  }, [msgs.length, reduced, scrollOffset]);

  // deep links: /#memory opens that case study
  useEffect(() => {
    const h = window.location.hash.slice(1);
    if (cases.some((c) => c.id === h)) ask(PROMPTS[h as Key], h as Key);
  }, [ask]);

  function reset() {
    busyRef.current = false;
    setBusy(false);
    setMsgs([]);
    const el = rootRef.current;
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - scrollOffset - 40, behavior: reduced ? "auto" : "smooth" });
  }

  function submit(e?: FormEvent) {
    e?.preventDefault();
    ask(value);
  }

  const lastKey = [...msgs].reverse().find((m) => m.role === "assistant")?.key;
  const canSend = value.trim().length > 0 && !busy;

  return (
    <div ref={rootRef} className="flex w-full flex-col items-center gap-5">
      {/* thread */}
      <div className="w-full rounded-[34px] bg-deep p-2">
        <div className="hero-card flex flex-col gap-10 overflow-hidden rounded-[27px] bg-paper p-5 sm:p-8">
          {msgs.length === 0 ? (
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-col items-center gap-2.5 text-center">
                <Label>Ask my portfolio</Label>
                <div className="font-serif text-[22px] leading-[1.18] tracking-[-0.02em] text-ink sm:text-[26px]">Pick a question to read the case study.</div>
              </div>
              <div className="grid w-full max-w-[600px] gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))" }}>
                {cases.map((c, i) => (
                  <motion.button
                    key={c.id}
                    type="button"
                    onClick={() => askKey(c.id as Key)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.05 * i }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.985 }}
                    className="flex cursor-pointer flex-col gap-2.5 rounded-[20px] border-none bg-deep p-5 text-left"
                  >
                    <span className="flex w-full justify-between gap-3">
                      <span className={strong}>{c.prompt}</span>
                      <span className="t-note">{c.index}</span>
                    </span>
                    <span className="text-[14px] leading-[1.6] text-soft">{SUBS[c.id as CaseKey]}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            msgs.map((m) =>
              m.role === "user" ? (
                <motion.div
                  key={m.id}
                  data-msg={m.id}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="flex justify-end"
                  style={{ scrollMarginTop: scrollOffset }}
                >
                  <div className="max-w-[80%] rounded-[22px] bg-deep px-[18px] py-3 text-[15px] font-medium leading-[1.4] text-ink">{m.text}</div>
                </motion.div>
              ) : (
                <Assistant key={m.id} msg={m} speed={speed} reduced={reduced} tips={tips} onAsk={askKey} onDone={onDone} />
              )
            )
          )}
        </div>
      </div>

      {/* composer */}
      <div className="flex w-full max-w-[720px] flex-col gap-2.5">
        <motion.form
          onSubmit={submit}
          role="search"
          aria-label="Ask my portfolio"
          onClick={() => inputRef.current?.focus()}
          animate={{ y: focused ? -1 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className={"flex cursor-text items-center gap-2 rounded-full border bg-paper py-1.5 pl-[22px] pr-1.5 " + (focused ? "border-soft" : "border-line")}
          style={{
            boxShadow: focused ? "0 1px 1px rgba(0,0,0,0.03), 0 18px 40px -24px rgba(0,0,0,0.35)" : "0 1px 1px rgba(0,0,0,0.03), 0 12px 32px -22px rgba(0,0,0,0.28)",
            transition: "border-color 220ms ease, box-shadow 320ms ease",
          }}
        >
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={busy ? "Thinking…" : "Ask about my AI work…"}
            aria-label="Ask about my AI work"
            autoComplete="off"
            enterKeyHint="send"
            className="h-10 min-w-0 flex-1 border-none bg-transparent text-[15px] text-ink outline-none placeholder:text-soft"
          />
          <motion.button
            type="submit"
            disabled={!canSend}
            aria-label="Send"
            whileHover={canSend ? { scale: 1.05 } : undefined}
            whileTap={canSend ? { scale: 0.94 } : undefined}
            animate={{ opacity: canSend || busy ? 1 : 0.3 }}
            className={"grid h-10 w-10 flex-none place-items-center rounded-full border-none bg-ink p-0 text-paper " + (canSend ? "cursor-pointer" : "cursor-default")}
          >
            {busy ? (
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }} className="block h-3.5 w-3.5 rounded-[3px] bg-paper" />
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
              </svg>
            )}
          </motion.button>
        </motion.form>
        <div className="text-center text-[12px] text-soft">Routing is deterministic: keyword scoring, no LLM, no API key.</div>
      </div>

      {/* chips */}
      <div className="flex w-full flex-col items-center gap-3.5">
        <Label>Or jump to</Label>
        <div className={"flex flex-wrap justify-center gap-2 transition-opacity duration-200 " + (busy ? "opacity-55" : "opacity-100")}>
          <motion.button
            type="button"
            onClick={reset}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="cursor-pointer rounded-full border-none bg-ink px-4 py-[9px] text-[14px] font-medium text-paper"
          >
            New chat
          </motion.button>
          {CHIPS.map((c) => {
            const active = lastKey === c.key;
            return (
              <motion.button
                key={c.key}
                type="button"
                disabled={busy}
                onClick={() => askKey(c.key)}
                whileHover={busy ? undefined : { y: -1 }}
                whileTap={busy ? undefined : { scale: 0.97 }}
                className={
                  "inline-flex items-center gap-2 rounded-full border px-4 py-[9px] text-[14px] font-medium text-ink transition-colors " +
                  (active ? "border-ink bg-deep" : "border-line bg-paper") +
                  (busy ? " cursor-default" : " cursor-pointer")
                }
              >
                {c.idx ? <span className="font-mono text-[11px] text-soft">{c.idx}</span> : null}
                {c.label}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
