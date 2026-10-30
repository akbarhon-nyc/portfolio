import type { Metadata } from "next";
import TipCard from "@/components/TipCard";
import { getTips, tipMeta } from "@/lib/tips";

export const metadata: Metadata = {
  title: "Tips on AI and AI tools",
  description: "Short, practical notes on Claude Code, Cursor, retrieval and shipping AI features cheaply.",
};

export default function TipsPage() {
  const tips = getTips().map(tipMeta);
  return (
    <main className="flex justify-center">
      <div className="flex w-full max-w-[1120px] flex-col items-center gap-12 px-5 pb-[120px] pt-[136px] sm:px-8 sm:pt-[152px] lg:px-10 lg:pt-[168px]">
        <header className="flex w-full max-w-[760px] flex-col items-center gap-5 text-center">
          <div className="t-label">(Tips) — Notes from building</div>
          <h1 className="t-display text-balance text-ink">
            Tips on AI and the <span className="text-accent">tools I use.</span>
          </h1>
          <p className="t-lead text-pretty">
            Short, practical notes on Claude Code, Cursor, retrieval and shipping AI features cheaply. Each one comes from real work on AirBrew. You can also ask the chat about any of them.
          </p>
        </header>
        {tips.length ? (
          <div className="grid w-full gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))" }}>
            {tips.map((t) => (
              <TipCard key={t.slug} tip={t} />
            ))}
          </div>
        ) : (
          <p className="t-lead">New tips are on the way.</p>
        )}
      </div>
    </main>
  );
}
