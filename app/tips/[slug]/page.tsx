import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TipToc from "@/components/TipToc";
import { formatDate, getTip, getTips } from "@/lib/tips";

export const dynamicParams = false;

export function generateStaticParams() {
  return getTips().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tip = getTip(slug);
  if (!tip) return {};
  return { title: tip.title, description: tip.summary, openGraph: { title: tip.title, description: tip.summary, type: "article" } };
}

export default async function TipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tip = getTip(slug);
  if (!tip) notFound();
  const all = getTips();
  const i = all.findIndex((t) => t.slug === tip.slug);
  const next = all[i + 1] ?? all[0];

  return (
    <main className="flex justify-center">
      <div className="flex w-full max-w-[1040px] flex-col items-start gap-7 px-5 pb-20 pt-[136px] sm:px-8 sm:pt-[152px] lg:px-10 lg:pt-[168px]">
        <Link href="/tips" className="inline-flex items-center rounded-full border border-line py-2 pl-3 pr-3.5 text-[14px] font-medium text-ink no-underline transition-transform hover:-translate-x-0.5">
          ← All tips
        </Link>
        <header className="flex max-w-[800px] flex-col items-start gap-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="t-label rounded-full bg-deep px-2.5 py-[5px]">{tip.category}</span>
            <span className="t-note">{formatDate(tip.date, "long")}</span>
            {tip.read ? (
              <>
                <span className="t-note">·</span>
                <span className="t-note">{tip.read}</span>
              </>
            ) : null}
          </div>
          <h1 className="t-display text-balance text-ink">{tip.title}</h1>
          <p className="t-lead text-pretty">{tip.summary}</p>
        </header>
        <hr className="w-full border-0 border-t border-line" />
        <div className={tip.headings.length >= 3 ? "grid w-full gap-12 lg:grid-cols-[200px_minmax(0,1fr)]" : "w-full"}>
          {tip.headings.length >= 3 ? <TipToc headings={tip.headings} /> : null}
          <div className="flex min-w-0 max-w-[740px] flex-col gap-10">
            <div className="prose-tip w-full" dangerouslySetInnerHTML={{ __html: tip.html }} />
            {tip.download ? (
              <a
                href={tip.download.href}
                download
                className="group flex items-center justify-between gap-4 rounded-[20px] border border-line bg-paper px-6 py-5 text-ink no-underline transition-transform hover:-translate-y-px"
              >
                <span className="flex flex-col gap-1">
                  <span className="t-label">Download</span>
                  <span className="text-[16px] font-medium">{tip.download.label}</span>
                </span>
                <span aria-hidden className="grid h-10 w-10 flex-none place-items-center rounded-full bg-ink text-paper transition-transform group-hover:translate-y-0.5">↓</span>
              </a>
            ) : null}
          </div>
        </div>
        <div className="mt-6 flex w-full max-w-[800px] flex-col items-start gap-3.5 rounded-[24px] bg-deep p-7">
          <div className="t-label">Keep going</div>
          <p className="t-h3 text-ink">Got a question about this? Ask my portfolio chat.</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/#ask" className="rounded-full bg-ink px-5 py-3 text-[14px] font-medium text-paper no-underline transition-transform hover:-translate-y-px">
              Open the chat →
            </Link>
            {next && next.slug !== tip.slug ? (
              <Link href={"/tips/" + next.slug} className="rounded-full border border-line bg-paper px-5 py-3 text-[14px] font-medium text-ink no-underline transition-transform hover:-translate-y-px">
                Next: {next.title}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
