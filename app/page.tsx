import Link from "next/link";
import AskChat from "@/components/AskChat";
import LiveReaders from "@/components/LiveReaders";
import Reveal from "@/components/Reveal";
import TipCard from "@/components/TipCard";
import { education, profile } from "@/lib/content";
import { getTips, tipMeta } from "@/lib/tips";

const PRINCIPLES = [
  ["01", "Code before model", "Deterministic code handles routing, retrieval and parsing wherever it can. The LLM is the fallback."],
  ["02", "Verify before done", "Benchmarks with pass lines, test suites and CI on every PR. “It compiles” isn’t done."],
  ["03", "Write decisions down", "ADRs for the why, a superseded table for what’s dead, locked decisions for what’s settled."],
];

const TOOLS = ["Claude Code", "Cursor", "Codex", "Next.js", "TypeScript", "Supabase", "Python", "Groq", "Docker", "Tailwind CSS"];

const ROLES = [
  { mark: "AB", org: "AirBrew", role: "Founder & AI Engineer", when: "2026 – Now", now: true },
  { mark: "MC", org: "Monday Capital", role: "Blockchain Engineer Analyst", when: "2023 – 2024" },
  { mark: "TG", org: "Touro University GST", role: "Web Developer Assistant", when: "2021 – 2022" },
  { mark: "BF", org: "Earlier career", role: "Business & finance roles, Uzbekistan and Malaysia", when: "2014 – 2018" },
];

function Section({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className="flex w-full scroll-mt-4 justify-center">
      <div className={"flex w-full max-w-[1120px] flex-col items-center gap-9 border-t border-line px-5 py-[72px] sm:px-8 sm:py-24 lg:px-10 lg:py-[120px] " + className}>
        {children}
      </div>
    </section>
  );
}

function DatePill({ children }: { children: React.ReactNode }) {
  return <span className="t-note flex-none rounded-full border border-line px-3 py-1.5">{children}</span>;
}

export default function Home() {
  const tips = getTips().map(tipMeta);

  return (
    <main className="flex flex-col items-center">
      {/* ---------------- hero ---------------- */}
      <section id="ask" className="w-full max-w-[1600px] p-2 sm:p-3">
        <div className="rounded-[26px] bg-deep p-1.5 sm:rounded-[34px] sm:p-2">
          <div className="hero-card relative flex flex-col items-center gap-7 overflow-hidden rounded-[21px] bg-paper px-4 pb-7 pt-[72px] sm:rounded-[27px] sm:px-6 sm:pb-[84px] sm:pt-[88px] lg:px-8 lg:pb-14 lg:pt-24">
            <div aria-hidden className="dot-grid pointer-events-none absolute inset-0" />

            <div className="relative z-[1] flex h-[190px] w-full items-center justify-center sm:h-[220px]">
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-[740px] w-[760px] -translate-x-1/2 -translate-y-1/2"
                style={{ background: "radial-gradient(50% 50% at 50% 50%, var(--glow) 0%, transparent 70%)" }}
              />
              <Reveal y={0} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/adam-avatar.png"
                  alt="Illustrated portrait of Adam Toshkhujayev"
                  width={184}
                  height={184}
                  className="h-[156px] w-[156px] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-rotate-3 hover:scale-[1.04] sm:h-[184px] sm:w-[184px]"
                />
              </Reveal>
            </div>

            <div
              className="relative z-[1] inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-paper py-2 pl-3 pr-3.5 sm:gap-2.5 sm:pr-4"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.06), 0 6px 18px rgba(0,0,0,0.05)" }}
            >
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="text-[13px] font-medium text-ink sm:text-[14px]">Open to AI engineering roles</span>
              <span className="h-3.5 w-px bg-line" />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-soft" aria-hidden>
                <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 1 1 13 0c0 5.4-6.5 11-6.5 11Z" />
                <circle cx="12" cy="10" r="2.3" />
              </svg>
              <span className="text-[13px] text-soft sm:text-[15px]">
                {profile.location}
                <span className="hidden sm:inline">, US</span>
              </span>
            </div>

            <h1 className="t-display relative z-[1] text-balance text-center text-ink">
              Hi, I’m {profile.short}.
              <br />
              Ask my portfolio <span className="text-accent">anything.</span>
            </h1>

            <p className="t-lead relative z-[1] max-w-[720px] text-pretty text-center">{profile.intro}</p>

            <div className="relative z-[1] w-full max-w-[920px]">
              <AskChat tips={tips} />
            </div>

            <LiveReaders className="absolute bottom-6 left-6 z-[2] !hidden sm:!inline-flex" />
          </div>
        </div>
      </section>

      {/* ---------------- about ---------------- */}
      <Section id="about">
        <Reveal>
          <div className="t-label">(02) — About</div>
        </Reveal>
        <h2 className="t-h2 max-w-[820px] text-balance text-center text-ink">
          I build AI systems that stay cheap and explainable — <span className="text-soft">code first, the model only when it has to.</span>
        </h2>
        <div className="tray flex w-full flex-col gap-1.5 md:flex-row">
          {PRINCIPLES.map(([i, t, d], k) => (
            <Reveal key={i} delay={k * 0.08} y={20} className="inset-card flex flex-1 flex-col items-center gap-5 px-6 py-8 text-center">
              <span className={"grid h-10 w-10 place-items-center rounded-full font-mono text-[12px] " + (i === "03" ? "bg-accent text-on-accent" : "bg-ink text-paper")}>{i}</span>
              <span className="t-h3 text-ink">{t}</span>
              <span className="text-[15px] leading-[1.6] text-soft">{d}</span>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1} y={12} className="flex w-full flex-col items-center gap-6 pt-8">
          <div className="t-label">Daily toolbox</div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {TOOLS.map((t) => (
              <span key={t} className="rounded-full bg-deep px-[18px] py-2.5 text-[14px] font-medium text-ink">
                {t}
              </span>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* ---------------- experience ---------------- */}
      <Section id="experience">
        <Reveal>
          <div className="t-label">(03) — Experience</div>
        </Reveal>
        <h2 className="t-h2 max-w-[720px] text-balance text-center text-ink">
          From finance to <span className="text-soft">AI engineering.</span>
        </h2>
        <Reveal y={30} className="tray flex w-full max-w-[720px] flex-col gap-1.5">
          {ROLES.map((r) => (
            <div key={r.org} className="inset-card flex items-center gap-4 py-4 pl-4 pr-5">
              <span className="grid h-[46px] w-[46px] flex-none place-items-center rounded-[14px] bg-ink font-serif text-[16px] text-paper">{r.mark}</span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="t-h3 text-ink">{r.org}</span>
                  {r.now ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-deep py-[3px] pl-2 pr-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      <span className="t-note !text-accent">NOW</span>
                    </span>
                  ) : null}
                </div>
                <span className="text-[14px] leading-[1.45] text-soft">{r.role}</span>
              </div>
              <span className="hidden sm:block">
                <DatePill>{r.when}</DatePill>
              </span>
            </div>
          ))}
        </Reveal>
        <div className="t-label">Education</div>
        <div className="tray flex w-full max-w-[720px] flex-col gap-1.5">
          {education.map((e) => (
            <div key={e.degree} className="inset-card flex items-center gap-4 px-5 py-4">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[14px] font-medium text-ink">{e.degree}</span>
                <span className="text-[14px] leading-[1.45] text-soft">{e.school}</span>
              </div>
              <span className="hidden sm:block">
                <DatePill>{e.when}</DatePill>
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------------- tips ---------------- */}
      <Section id="tips" className="lg:!pt-[112px]">
        <Reveal>
          <div className="t-label">(04) — Tips</div>
        </Reveal>
        <h2 className="t-h2 max-w-[720px] text-balance text-center text-ink">
          Notes from <span className="text-soft">building with AI.</span>
        </h2>
        <Reveal y={24} className="w-full">
          <div className="grid w-full gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))" }}>
            {tips.slice(0, 3).map((t) => (
              <TipCard key={t.slug} tip={t} />
            ))}
          </div>
        </Reveal>
        <Link href="/tips" className="rounded-full border border-line px-[22px] py-3 text-[14px] font-medium text-ink no-underline transition-transform hover:-translate-y-px">
          All tips →
        </Link>
      </Section>

      {/* ---------------- contact ---------------- */}
      <Section id="contact" className="lg:!pb-[72px]">
        <Reveal>
          <div className="t-label">(05) — Contact</div>
        </Reveal>
        <h2 className="t-h2 max-w-[720px] text-balance text-center text-ink">
          Let’s talk about <span className="text-accent">AI engineering.</span>
        </h2>
        <p className="t-lead max-w-[560px] text-center">I’m open to AI engineering roles. Email is the fastest way to reach me.</p>
        <div className="flex flex-wrap justify-center gap-2.5">
          <a href={"mailto:" + profile.links.email} className="rounded-full bg-ink px-[22px] py-3 text-[14px] font-medium text-paper no-underline transition-transform hover:-translate-y-px">
            Email me
          </a>
          <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="rounded-full border border-line px-[22px] py-3 text-[14px] font-medium text-ink no-underline transition-transform hover:-translate-y-px">
            LinkedIn
          </a>
          <a href={profile.links.github} target="_blank" rel="noreferrer" className="rounded-full border border-line px-[22px] py-3 text-[14px] font-medium text-ink no-underline transition-transform hover:-translate-y-px">
            GitHub
          </a>
          {profile.links.resume ? (
            <a href={profile.links.resume} target="_blank" rel="noreferrer" className="rounded-full border border-line px-[22px] py-3 text-[14px] font-medium text-ink no-underline transition-transform hover:-translate-y-px">
              Résumé
            </a>
          ) : null}
        </div>
        <footer className="flex flex-col items-center gap-4 pt-14">
          <LiveReaders />
          <p className="t-note text-center">© 2026 {profile.name} · {profile.location}</p>
        </footer>
      </Section>
    </main>
  );
}
