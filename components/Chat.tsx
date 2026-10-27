"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cases, profile } from "@/lib/content";
import { route, type Intent } from "@/lib/route";
import { AboutAnswer, CaseAnswer, ContactAnswer, FallbackAnswer, WorkflowAnswer } from "./Answers";

interface Msg {
  id: number;
  role: "user" | "assistant";
  text?: string;
  intent?: Intent;
  trace?: string;
  pending?: boolean;
}

const STARTERS = [
  { q: cases[0].prompt, sub: "~15× fewer tokens than grep" },
  { q: cases[1].prompt, sub: "Free routes first, paid last" },
  { q: cases[2].prompt, sub: "One source of truth, 3 tools" },
  { q: cases[3].prompt, sub: "Taste turned into rules" },
];

function intentLabel(i: Intent): string {
  if (i.kind === "case") {
    const c = cases.find((x) => x.id === i.id)!;
    return `case_${c.index}.md`;
  }
  return i.kind === "fallback" ? "no match" : `${i.kind}.md`;
}

function Avatar() {
  return (
    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-[#b8492a] font-serif text-[15px] text-[#1a0d08]">
      {profile.initials[0]}
    </div>
  );
}

export default function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [menu, setMenu] = useState(false);
  const idRef = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const busy = msgs.some((m) => m.pending);

  const ask = useCallback(
    (q: string, opts?: { replace?: boolean }) => {
      const text = q.trim();
      if (!text) return;
      setMenu(false);
      const r = route(text);
      const trace = `retrieve("${r.keywords.slice(0, 4).join(" ") || "…"}") → ${intentLabel(r.intent)} · score ${r.score} · 1 doc · 0 LLM tokens · ${r.ms.toFixed(2)} ms`;
      const u: Msg = { id: ++idRef.current, role: "user", text };
      const a: Msg = { id: ++idRef.current, role: "assistant", intent: r.intent, trace, pending: true };
      setMsgs((prev) => [...(opts?.replace ? [] : prev), u, a]);
      setInput("");
      if (r.intent.kind === "case") history.replaceState(null, "", `#${r.intent.id}`);
      setTimeout(() => {
        setMsgs((prev) => prev.map((m) => (m.id === a.id ? { ...m, pending: false } : m)));
      }, 750);
    },
    []
  );

  // Deep links: /#memory opens that case study directly.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    const c = cases.find((x) => x.id === id);
    if (c) ask(c.prompt, { replace: true });
    else if (id === "contact") ask("How can I contact Adam?", { replace: true });
  }, [ask]);

  useEffect(() => {
    const last = msgs[msgs.length - 1];
    if (!last) return;
    // Scroll so the new question sits at the top, like ChatGPT.
    const el = document.getElementById(`m-${msgs[msgs.length - 2]?.id}`);
    if (el && scrollRef.current) {
      scrollRef.current.scrollTo({ top: el.offsetTop - 16, behavior: "smooth" });
    }
  }, [msgs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [input]);

  const reset = () => {
    setMsgs([]);
    setMenu(false);
    history.replaceState(null, "", " ");
  };

  const activeCase = [...msgs].reverse().find((m) => m.intent?.kind === "case")?.intent;
  const activeId = activeCase?.kind === "case" ? activeCase.id : null;

  const sidebar = (
    <nav className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 pb-2 pt-3">
        <button onClick={reset} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-raised">
          <Avatar />
          <span className="text-left leading-tight">
            <span className="block text-[14px] font-medium">adam.ai</span>
            <span className="block font-mono text-[10.5px] text-faint">portfolio · v1</span>
          </span>
        </button>
        <button onClick={() => setMenu(false)} className="rounded-md p-2 text-dim hover:bg-raised md:hidden" aria-label="Close menu">
          ✕
        </button>
      </div>

      <div className="px-3">
        <button
          onClick={reset}
          className="flex w-full items-center gap-2 rounded-lg border border-line px-3 py-2 text-[13.5px] text-dim transition hover:border-accent/50 hover:text-ink"
        >
          <span className="text-[16px] leading-none">＋</span> New chat
        </button>
      </div>

      <div className="scroll-thin mt-5 flex-1 overflow-y-auto px-3">
        <div className="px-2 pb-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">Case studies</div>
        {cases.map((c) => (
          <button
            key={c.id}
            onClick={() => ask(c.prompt)}
            className={`group flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-[13.5px] transition ${
              activeId === c.id ? "bg-raised text-ink" : "text-dim hover:bg-raised/70 hover:text-ink"
            }`}
          >
            <span className={`font-mono text-[10.5px] ${activeId === c.id ? "text-accent" : "text-faint"}`}>{c.index}</span>
            <span className="truncate">{c.short}</span>
          </button>
        ))}
        <div className="mt-5 px-2 pb-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">About</div>
        {[
          ["Who is Adam?", "Who is Adam?"],
          ["How I work with AI", "How do you work with AI?"],
          ["Contact", "How can I contact Adam?"],
        ].map(([label, q]) => (
          <button
            key={label}
            onClick={() => ask(q)}
            className="flex w-full rounded-lg px-2 py-2 text-left text-[13.5px] text-dim transition hover:bg-raised/70 hover:text-ink"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="border-t border-line-soft p-3">
        <a
          href={profile.links.github}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-raised"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-raised font-mono text-[11px] text-dim">
            {profile.initials}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[13px]">{profile.name}</span>
            <span className="block truncate text-[11.5px] text-faint">{profile.location} · GitHub ↗</span>
          </span>
        </a>
      </div>
    </nav>
  );

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden w-[264px] shrink-0 border-r border-line-soft bg-panel md:block">{sidebar}</aside>
      {menu && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenu(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] border-r border-line bg-panel">{sidebar}</aside>
        </div>
      )}

      {/* Main */}
      <main className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-3 sm:px-5">
          <div className="flex items-center gap-1">
            <button onClick={() => setMenu(true)} className="rounded-md p-2 text-dim hover:bg-raised md:hidden" aria-label="Open menu">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h10" /></svg>
            </button>
            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[14px]">
              <span className="font-medium">adam-1</span>
              <span className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] text-faint">deterministic</span>
            </div>
          </div>
          <button
            onClick={() => ask("How can I contact Adam?")}
            className="rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-medium text-bg transition hover:bg-white"
          >
            Hire Adam
          </button>
        </header>

        <div ref={scrollRef} className="scroll-thin relative flex-1 overflow-y-auto">
          {msgs.length === 0 ? (
            <div className="relative mx-auto flex min-h-full max-w-3xl flex-col justify-center px-4 pb-10 pt-6 sm:px-6">
              <div className="glow pointer-events-none absolute left-1/2 top-[18%] h-64 w-64 -translate-x-1/2 rounded-full bg-accent/20 blur-[90px]" />
              <div className="rise relative" style={{ "--i": 0 } as React.CSSProperties}>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 text-[12px] text-dim">
                  <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Open to AI engineering roles
                </div>
                <h1 className="font-serif text-[2.6rem] leading-[1.02] sm:text-[3.6rem]">
                  Hi, I&apos;m Adam.
                  <br />
                  <span className="italic text-dim">Ask my portfolio anything.</span>
                </h1>
                <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-dim">{profile.intro}</p>
              </div>
              <div className="relative mt-8 grid gap-2.5 sm:grid-cols-2">
                {STARTERS.map((s, n) => (
                  <button
                    key={s.q}
                    onClick={() => ask(s.q)}
                    className="rise group rounded-2xl border border-line bg-panel/80 p-4 text-left transition hover:border-accent/50 hover:bg-raised"
                    style={{ "--i": n + 1 } as React.CSSProperties}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[14.5px] text-ink">{s.q}</span>
                      <span className="font-mono text-[10.5px] text-faint group-hover:text-accent">{cases[n].index}</span>
                    </div>
                    <div className="mt-1 text-[12.5px] text-faint">{s.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-8 px-4 pb-[45vh] pt-4 sm:px-6">
              {msgs.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} id={`m-${m.id}`} className="flex justify-end">
                    <div className="max-w-[85%] rounded-3xl bg-raised px-4 py-2.5 text-[15px] text-ink">{m.text}</div>
                  </div>
                ) : (
                  <div key={m.id} className="flex gap-3 sm:gap-4">
                    <div className="hidden sm:block"><Avatar /></div>
                    <div className="min-w-0 flex-1 pt-1">
                      <div className="mb-4 truncate font-mono text-[11px] text-faint">
                        <span className="text-accent">↳</span> {m.trace}
                      </div>
                      {m.pending ? (
                        <div className="flex gap-1.5 py-2">
                          <span className="dot h-2 w-2 rounded-full bg-dim" />
                          <span className="dot h-2 w-2 rounded-full bg-dim" />
                          <span className="dot h-2 w-2 rounded-full bg-dim" />
                        </div>
                      ) : (
                        <Answer intent={m.intent!} onAsk={ask} />
                      )}
                    </div>
                  </div>
                )
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="shrink-0 bg-gradient-to-t from-bg via-bg to-transparent px-3 pb-3 pt-2 sm:px-6 sm:pb-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!busy) ask(input);
            }}
            className="mx-auto flex max-w-3xl items-end gap-2 rounded-3xl border border-line bg-panel p-2 pl-4 shadow-[0_8px_40px_-12px_rgba(0,0,0,.6)] focus-within:border-[#3a3a40]"
          >
            <textarea
              ref={taRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!busy) ask(input);
                }
              }}
              placeholder="Ask about my AI work…"
              className="scroll-thin max-h-40 flex-1 resize-none bg-transparent py-2 text-[15px] text-ink outline-none placeholder:text-faint"
            />
            <button
              type="submit"
              disabled={!input.trim() || busy}
              aria-label="Send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-bg transition enabled:hover:bg-white disabled:opacity-25"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
            </button>
          </form>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[11.5px] text-faint">
            Answers come from real project work on AirBrew. Routing is deterministic: no LLM, no API key.
          </p>
        </div>
      </main>
    </div>
  );
}

function Answer({ intent, onAsk }: { intent: Intent; onAsk: (q: string) => void }) {
  switch (intent.kind) {
    case "case":
      return <CaseAnswer c={cases.find((c) => c.id === intent.id)!} onAsk={onAsk} />;
    case "about":
      return <AboutAnswer onAsk={onAsk} />;
    case "workflow":
      return <WorkflowAnswer onAsk={onAsk} />;
    case "contact":
      return <ContactAnswer />;
    default:
      return <FallbackAnswer onAsk={onAsk} />;
  }
}
