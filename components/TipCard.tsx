import Link from "next/link";
import { formatDate, type TipMeta } from "@/lib/tips";

export default function TipCard({ tip }: { tip: TipMeta }) {
  return (
    <Link
      href={"/tips/" + tip.slug}
      className="group flex h-full flex-col gap-4 rounded-[24px] bg-deep px-7 pb-6 pt-7 no-underline transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px]"
    >
      <span className="flex items-center gap-2.5">
        <span className="t-label rounded-full bg-paper px-2.5 py-[5px]">{tip.category}</span>
        {tip.read ? <span className="t-note">{tip.read}</span> : null}
      </span>
      <span className="t-h3 text-ink">{tip.title}</span>
      <span className="text-[15px] leading-[1.6] text-soft">{tip.summary}</span>
      <span className="mt-auto flex items-center justify-between pt-1">
        <span className="t-note">{formatDate(tip.date)}</span>
        <span className="text-[14px] font-medium text-accent">
          Read <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">→</span>
        </span>
      </span>
    </Link>
  );
}
