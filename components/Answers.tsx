import { benchRows, cases, courses, education, experience, profile, workflow, type CaseStudy, type Metric } from "@/lib/content";

const fmt = (n: number) => n.toLocaleString("en-US");

function Reveal({ i, children, className = "" }: { i: number; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rise ${className}`} style={{ "--i": i } as React.CSSProperties}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">{children}</div>;
}

function MetricCard({ m }: { m: Metric }) {
  return (
    <div
      className={`rounded-xl border p-3.5 ${
        m.todo ? "border-dashed border-todo/50 bg-todo/5" : "border-line bg-raised"
      }`}
    >
      <div className={`font-serif text-3xl leading-none ${m.todo ? "text-todo" : "text-ink"}`}>{m.value}</div>
      <div className="mt-2 text-[12.5px] leading-snug text-dim">{m.label}</div>
      {m.todo && <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-todo/80">to measure</div>}
    </div>
  );
}

function Bench() {
  const max = Math.max(...benchRows.map((r) => r.naive));
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-panel">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <span className="font-mono text-[11.5px] text-dim">python3 brain/tools/bench.py</span>
        <span className="flex gap-3 font-mono text-[10.5px] text-faint">
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-accent" />brain</span>
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-[#5b5b63]" />grep</span>
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-[#34343a]" />read all</span>
        </span>
      </div>
      <div className="divide-y divide-line-soft">
        {benchRows.map((r) => (
          <div key={r.q} className="px-4 py-3">
            <div className="mb-2 flex items-start justify-between gap-3 text-[12.5px]">
              <span className="text-dim">“{r.q}”</span>
              <span className={`shrink-0 font-mono text-[11px] ${r.ok ? "text-ok" : "text-bad"}`}>{r.ok ? "✓ correct" : "✗ missed"}</span>
            </div>
            <div className="space-y-1">
              {[
                { v: r.brain, c: "bg-accent" },
                { v: r.grep, c: "bg-[#5b5b63]" },
                { v: r.naive, c: "bg-[#34343a]" },
              ].map((b, j) => (
                <div key={j} className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-line-soft">
                    <div className={`h-1.5 rounded-full ${b.c}`} style={{ width: `${Math.max(1.2, (b.v / max) * 100)}%` }} />
                  </div>
                  <span className="w-14 text-right font-mono text-[10.5px] text-faint">{fmt(b.v)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-line px-4 py-2.5 text-[12px] leading-relaxed text-faint">
        Approximate tokens of context each strategy loads (bytes ÷ 4). Latest run: 4 of 5 correct. The one miss is a
        regression the benchmark caught, which is the point of having a hard pass line.
      </div>
    </div>
  );
}

export function CaseAnswer({ c, onAsk }: { c: CaseStudy; onAsk: (q: string) => void }) {
  let i = 0;
  const others = cases.filter((o) => o.id !== c.id);
  return (
    <div className="space-y-7">
      <Reveal i={i++}>
        <div className="mb-2 font-mono text-[11px] tracking-[0.14em] text-accent">CASE STUDY {c.index}</div>
        <h2 className="font-serif text-[2rem] leading-[1.08] text-ink sm:text-[2.4rem]">{c.title}</h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-dim">{c.tagline}</p>
      </Reveal>

      <Reveal i={i++} className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {c.metrics.map((m) => (
          <MetricCard key={m.label} m={m} />
        ))}
      </Reveal>

      <Reveal i={i++} className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-panel p-4">
          <Label>The problem</Label>
          <p className="text-[14px] leading-relaxed text-ink/90">{c.problem}</p>
        </div>
        <div className="rounded-xl border border-accent/30 bg-accent-soft p-4">
          <Label>What I built</Label>
          <p className="text-[14px] leading-relaxed text-ink/90">{c.solution}</p>
        </div>
      </Reveal>

      <Reveal i={i++}>
        <Label>How it works</Label>
        <ol className="relative space-y-4 border-l border-line pl-6">
          {c.steps.map((s, n) => (
            <li key={s.title} className="relative">
              <span className="absolute -left-[34px] top-0 flex h-[19px] w-[19px] items-center justify-center rounded-full border border-line bg-bg font-mono text-[10px] text-accent">
                {n + 1}
              </span>
              <div className="text-[14px] font-medium text-ink">{s.title}</div>
              <div className="mt-0.5 text-[13.5px] leading-relaxed text-dim">{s.detail}</div>
            </li>
          ))}
        </ol>
      </Reveal>

      {c.bench && (
        <Reveal i={i++}>
          <Label>Benchmark: real output</Label>
          <Bench />
        </Reveal>
      )}

      {c.code && (
        <Reveal i={i++}>
          <div className="overflow-hidden rounded-xl border border-line bg-[#0a0a0b]">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a40]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a40]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a40]" />
              <span className="ml-2 truncate font-mono text-[11px] text-faint">{c.code.file}</span>
            </div>
            <pre className="scroll-thin overflow-x-auto p-4 font-mono text-[12.5px] leading-[1.7] text-[#d6d6db]">
              <code>{c.code.body}</code>
            </pre>
          </div>
        </Reveal>
      )}

      <Reveal i={i++} className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
        <div>
          <Label>Stack</Label>
          <div className="flex flex-wrap gap-1.5">
            {c.tools.map((t) => (
              <span key={t} className="rounded-full border border-line bg-raised px-2.5 py-1 text-[12px] text-dim">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div>
          <Label>What I learned</Label>
          <ul className="space-y-2">
            {c.lessons.map((l) => (
              <li key={l} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink/85">
                <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                {l}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal i={i++}>
        <FollowUps items={others.map((o) => o.prompt)} onAsk={onAsk} />
      </Reveal>
    </div>
  );
}

export function FollowUps({ items, onAsk }: { items: string[]; onAsk: (q: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((q) => (
        <button
          key={q}
          onClick={() => onAsk(q)}
          className="rounded-full border border-line px-3 py-1.5 text-[12.5px] text-dim transition hover:border-accent/60 hover:text-ink"
        >
          {q} →
        </button>
      ))}
    </div>
  );
}

export function AboutAnswer({ onAsk }: { onAsk: (q: string) => void }) {
  return (
    <div className="space-y-5">
      <Reveal i={0}>
        <h2 className="font-serif text-[2rem] leading-tight">{profile.name}</h2>
        <div className="mt-1 text-[14px] text-accent">{profile.role}</div>
      </Reveal>
      <Reveal i={1} className="space-y-3 text-[14.5px] leading-relaxed text-ink/90">
        <p>{profile.intro}</p>
        <p className="text-dim">{profile.background}</p>
      </Reveal>
      <Reveal i={2}>
        <Label>Experience</Label>
        <ol className="relative space-y-5 border-l border-line pl-6">
          {experience.map((e, n) => (
            <li key={e.org} className="relative">
              <span className={`absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-bg ${n === 0 ? "bg-accent" : "bg-faint"}`} />
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="text-[14.5px] font-medium text-ink">
                  {e.role} <span className="text-dim">· {e.org}</span>
                </span>
                <span className="font-mono text-[11px] text-faint">{e.when}</span>
              </div>
              <ul className="mt-1.5 space-y-1">
                {e.points.map((pt) => (
                  <li key={pt} className="text-[13.5px] leading-relaxed text-dim">{pt}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Reveal>
      <Reveal i={3} className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-panel p-4">
          <Label>Education</Label>
          {education.map((ed) => (
            <div key={ed.degree} className="mb-2.5 last:mb-0">
              <div className="text-[13.5px] text-ink">{ed.degree}</div>
              <div className="text-[12.5px] text-faint">{ed.school} · {ed.when}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-line bg-panel p-4">
          <Label>Courses</Label>
          {courses.map((c) => (
            <div key={c} className="mb-1.5 text-[13.5px] text-dim last:mb-0">{c}</div>
          ))}
        </div>
      </Reveal>
      <Reveal i={4}>
        <FollowUps items={[cases[0].prompt, "How do you work with AI?", "How can I contact Adam?"]} onAsk={onAsk} />
      </Reveal>
    </div>
  );
}

export function WorkflowAnswer({ onAsk }: { onAsk: (q: string) => void }) {
  return (
    <div className="space-y-5">
      <Reveal i={0}>
        <h2 className="font-serif text-[2rem] leading-tight">{workflow.title}</h2>
      </Reveal>
      <Reveal i={1} className="grid gap-2.5 sm:grid-cols-2">
        {workflow.points.map((p, n) => (
          <div key={p.title} className="rounded-xl border border-line bg-panel p-4">
            <div className="font-mono text-[11px] text-accent">0{n + 1}</div>
            <div className="mt-1.5 text-[14.5px] font-medium">{p.title}</div>
            <div className="mt-1 text-[13.5px] leading-relaxed text-dim">{p.detail}</div>
          </div>
        ))}
      </Reveal>
      <Reveal i={2}>
        <FollowUps items={[cases[2].prompt, cases[1].prompt]} onAsk={onAsk} />
      </Reveal>
    </div>
  );
}

export function ContactAnswer() {
  const l = profile.links;
  const items = [
    { label: "Email", href: l.email ? `mailto:${l.email}` : "", text: l.email },
    { label: "LinkedIn", href: l.linkedin, text: l.linkedin.replace(/^https?:\/\/(www\.)?/, "") },
    { label: "GitHub", href: l.github, text: l.github.replace("https://", "") },
    { label: "Resume", href: l.resume, text: "Download PDF" },
  ];
  return (
    <div className="space-y-4">
      <Reveal i={0}>
        <h2 className="font-serif text-[2rem] leading-tight">Let&apos;s talk.</h2>
        <p className="mt-2 text-[14.5px] text-dim">
          I&apos;m open to AI engineering roles where reliability and cost matter as much as capability.
        </p>
      </Reveal>
      <Reveal i={1} className="grid gap-2 sm:grid-cols-2">
        {items.filter((it) => it.href).map((it) =>
          it.href ? (
            <a
              key={it.label}
              href={it.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between rounded-xl border border-line bg-panel px-4 py-3 transition hover:border-accent/60"
            >
              <span>
                <span className="block font-mono text-[10.5px] uppercase tracking-wider text-faint">{it.label}</span>
                <span className="text-[14px] text-ink">{it.text}</span>
              </span>
              <span className="text-faint transition group-hover:translate-x-0.5 group-hover:text-accent">↗</span>
            </a>
          ) : (
            <div key={it.label} className="rounded-xl border border-dashed border-todo/40 bg-todo/5 px-4 py-3">
              <span className="block font-mono text-[10.5px] uppercase tracking-wider text-todo/80">{it.label}</span>
              <span className="text-[13px] text-todo">add in lib/content.ts</span>
            </div>
          )
        )}
      </Reveal>
    </div>
  );
}

export function FallbackAnswer({ onAsk }: { onAsk: (q: string) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-[14.5px] leading-relaxed text-ink/90">
        I only answer from Adam&apos;s portfolio, and nothing in it matched that question. Routing here is deterministic
        keyword scoring (no LLM), the same idea as case study 01. Try one of these:
      </p>
      <FollowUps items={cases.map((c) => c.prompt)} onAsk={onAsk} />
    </div>
  );
}
