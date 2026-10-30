"use client";

import { useEffect, useRef, useState, startTransition, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Floating navigation ported from the Marlowe template: sliding hover
// highlight, rolling link text, scroll progress ring, live New York clock,
// light/dark toggle and a magnetic "Say hi".

const EASE = [0.65, 0, 0.35, 1] as const;
export const THEME_KEY = "theme";

const ITEMS: { label: string; href: string; hideOnMobile?: boolean }[] = [
  { label: "Ask", href: "/#ask" },
  { label: "About", href: "/#about" },
  { label: "Experience", href: "/#experience", hideOnMobile: true },
  { label: "Tips", href: "/tips" },
];

function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1.1 1.1M17.3 17.3l1.1 1.1M5.6 18.4l1.1-1.1M17.3 6.7l1.1-1.1" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a.4.4 0 0 0-.5-.5A8.4 8.4 0 1 0 20 15.1a.4.4 0 0 0-.5-.5Z" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5c4.9 0 8.5 3.2 8.5 7.4s-3.6 7.4-8.5 7.4c-.9 0-1.8-.1-2.6-.3L5 20l.9-3.7c-1.5-1.4-2.4-3.2-2.4-5.4 0-4.2 3.6-7.4 8.5-7.4Z" />
      <path d="M8.6 11h.01M12 11h.01M15.4 11h.01" strokeWidth="2.4" />
    </svg>
  );
}

function RollText({ children, active }: { children: ReactNode; active: boolean }) {
  const t = { duration: 0.45, ease: EASE };
  return (
    <span className="relative inline-block overflow-hidden align-top" style={{ lineHeight: "1.2em" }}>
      <motion.span className="block" animate={{ y: active ? "-125%" : "0%" }} transition={t}>
        {children}
      </motion.span>
      <motion.span className="absolute left-0 block" style={{ top: "125%" }} animate={{ y: active ? "-125%" : "0%" }} transition={t} aria-hidden>
        {children}
      </motion.span>
    </span>
  );
}

function Magnetic({ children, strength = 6 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <motion.span
      ref={ref}
      className="inline-flex"
      animate={pos}
      transition={{ type: "spring", stiffness: 260, damping: 18, mass: 0.6 }}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setPos({ x: ((e.clientX - r.left) / r.width - 0.5) * strength, y: ((e.clientY - r.top) / r.height - 0.5) * strength });
      }}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
    >
      {children}
    </motion.span>
  );
}

// A hash link to a section on the page we're already on jumps straight there.
function jumpIfHere(e: MouseEvent<HTMLAnchorElement>, href: string, pathname: string) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  const [path, hash] = href.split("#");
  if ((path || "/") !== pathname) return;
  e.preventDefault();
  if (!hash) {
    window.scrollTo({ top: 0 });
    return;
  }
  document.getElementById(hash)?.scrollIntoView({ block: "start" });
  history.replaceState(null, "", "#" + hash);
}

export default function NavDock() {
  const pathname = usePathname() || "/";
  const barRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [rect, setRect] = useState<{ x: number; w: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState("");
  const [dark, setDark] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 600px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "America/New_York" });
    const update = () => startTransition(() => setTime(fmt.format(new Date())));
    update();
    const id = window.setInterval(update, 15000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        startTransition(() => setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  useEffect(() => {
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  function toggleTheme() {
    const next = !dark;
    const v = next ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", v);
    try {
      localStorage.setItem(THEME_KEY, v);
    } catch {}
    setDark(next);
  }

  function enter(key: string) {
    const el = itemRefs.current[key];
    const bar = barRef.current;
    if (!el || !bar) return;
    const b = bar.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setHoverKey(key);
    setRect({ x: r.left - b.left - 1, w: r.width });
  }

  const R = 15;
  const C = 2 * Math.PI * R;
  const item = "relative z-[1] inline-flex h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-[13px] text-[14px] font-medium tracking-[-0.01em] text-ink no-underline";
  const iconBtn = "relative z-[1] inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink";
  const divider = <span aria-hidden className="mx-1 h-4 w-px flex-none bg-line" />;
  const compact = narrow;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pb-3 pt-5 sm:px-4 sm:pt-7">
      <nav
        ref={barRef}
        aria-label="Main"
        onMouseLeave={() => setHoverKey(null)}
        className="pointer-events-auto relative inline-flex w-max items-center gap-0.5 rounded-full border border-line bg-paper p-[5px]"
        style={{
          boxShadow: "0 1px 1px rgba(0,0,0,0.03), 0 12px 32px -22px rgba(0,0,0,0.28)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <AnimatePresence>
          {hoverKey && rect && (
            <motion.span
              key="hl"
              aria-hidden
              initial={{ opacity: 0, x: rect.x, width: rect.w }}
              animate={{ opacity: 1, x: rect.x, width: rect.w }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 34, mass: 0.8, opacity: { duration: 0.25, ease: "easeOut" } }}
              className="absolute left-0 top-[5px] z-0 h-9 rounded-full bg-deep"
            />
          )}
        </AnimatePresence>

        <Link
          href="/"
          aria-label="Home"
          onClick={(e) => jumpIfHere(e, "/", pathname)}
          ref={(el) => {
            itemRefs.current.logo = el;
          }}
          onMouseEnter={() => enter("logo")}
          className="relative z-[1] grid h-[38px] w-[38px] place-items-center rounded-full"
        >
          <span className="relative grid h-[34px] w-[34px] place-items-center">
            <svg width="34" height="34" viewBox="0 0 34 34" className="absolute inset-0 -rotate-90" aria-hidden>
              <circle cx="17" cy="17" r={R} fill="none" stroke="var(--line)" strokeWidth="1.5" />
              <circle
                cx="17"
                cy="17"
                r={R}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - progress)}
                style={{ transition: "stroke-dashoffset 200ms linear" }}
              />
            </svg>
            <motion.span
              animate={{ rotate: hoverKey === "logo" ? -8 : 0, scale: hoverKey === "logo" ? 1.04 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="grid h-[26px] w-[26px] place-items-center rounded-full bg-ink font-serif text-[14px] leading-none text-paper"
            >
              A
            </motion.span>
          </span>
        </Link>

        {divider}

        {ITEMS.filter((it) => !(compact && it.hideOnMobile)).map((it, i) => {
          const key = "i" + i;
          return (
            <Link
              key={key}
              href={it.href}
              onClick={(e) => jumpIfHere(e, it.href, pathname)}
              ref={(el) => {
                itemRefs.current[key] = el;
              }}
              onMouseEnter={() => enter(key)}
              className={item}
            >
              <RollText active={hoverKey === key}>{it.label}</RollText>
            </Link>
          );
        })}

        {!compact && (
          <>
            {divider}
            <span
              ref={(el) => {
                itemRefs.current.clock = el;
              }}
              onMouseEnter={() => enter("clock")}
              title="Local time in New York"
              className={item + " cursor-default gap-[7px] !text-soft"}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              <span aria-hidden className="relative h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-accent" />
                <motion.span
                  className="absolute inset-0 rounded-full bg-accent"
                  animate={{ scale: [1, 2.6], opacity: [0.45, 0] }}
                  transition={{ duration: 2.4, ease: "easeOut", repeat: Infinity }}
                />
              </span>
              <span className="font-mono text-[12px] tracking-[0.06em]">NYC {time || "12:00"}</span>
            </span>
          </>
        )}

        {divider}

        <Magnetic>
          <button
            type="button"
            onClick={toggleTheme}
            ref={(el) => {
              itemRefs.current.theme = el;
            }}
            onMouseEnter={() => enter("theme")}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className={iconBtn}
          >
            <span className="relative h-[17px] w-[17px]">
              <motion.span
                className="absolute inset-0 grid place-items-center"
                animate={{ opacity: dark ? 0 : 1, rotate: dark ? -90 : 0, scale: dark ? 0.4 : 1 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <SunIcon />
              </motion.span>
              <motion.span
                className="absolute inset-0 grid place-items-center"
                animate={{ opacity: dark ? 1 : 0, rotate: dark ? 0 : 90, scale: dark ? 1 : 0.4 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <MoonIcon />
              </motion.span>
            </span>
          </button>
        </Magnetic>

        <Magnetic>
          <Link
            href="/#contact"
            onClick={(e) => jumpIfHere(e, "/#contact", pathname)}
            ref={(el) => {
              itemRefs.current.contact = el;
            }}
            onMouseEnter={() => enter("contact")}
            aria-label="Say hi"
            className={compact ? iconBtn : iconBtn + " !w-auto gap-[7px] pl-2.5 pr-3"}
          >
            <motion.span
              className="grid place-items-center"
              animate={{ rotate: hoverKey === "contact" ? -10 : 0, y: hoverKey === "contact" ? -1 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <ChatIcon />
            </motion.span>
            {!compact && (
              <span className="text-[14px] font-medium tracking-[-0.01em]">
                <RollText active={hoverKey === "contact"}>Say hi</RollText>
              </span>
            )}
          </Link>
        </Magnetic>
      </nav>
    </div>
  );
}
