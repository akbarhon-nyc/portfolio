"use client";

import { useEffect, useState } from "react";
import type { TipHeading } from "@/lib/tips";

// Sticky "On this page" list. Highlights the section being read, and also wires up
// the Copy buttons on code blocks (the post HTML itself is static).
export default function TipToc({ headings }: { headings: TipHeading[] }) {
  const [active, setActive] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      let current = headings[0]?.id ?? "";
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= 140) current = h.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [headings]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-copy]");
      if (!btn) return;
      const code = btn.closest("figure")?.querySelector("pre")?.textContent ?? "";
      navigator.clipboard
        ?.writeText(code)
        .then(() => {
          btn.textContent = "Copied";
          window.setTimeout(() => (btn.textContent = "Copy"), 1600);
        })
        .catch(() => (btn.textContent = "Select and copy"));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <nav aria-label="On this page" className="hidden lg:sticky lg:top-[104px] lg:block lg:self-start">
      <div className="t-label mb-3">On this page</div>
      <ol className="flex flex-col border-l border-line">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={"#" + h.id}
              aria-current={active === h.id ? "true" : undefined}
              className={
                "-ml-px block border-l py-1.5 pl-3.5 text-[13.5px] leading-snug no-underline transition-colors " +
                (active === h.id ? "border-accent font-medium text-ink" : "border-transparent text-soft hover:text-ink")
              }
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
