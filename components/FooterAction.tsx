"use client";

import { useEffect, useRef, useState, startTransition, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

// Port of Marlowe's FooterAction: magnetic pull, a fill that spreads from where the
// cursor enters, letters that roll on hover, an icon that slides out and back in,
// and a tooltip on icon buttons.

type Kind = "primary" | "secondary" | "icon";
type Glyph = "mail" | "arrow" | "up" | "linkedin" | "github";

const FILLED: Record<string, string> = {
  linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  github: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
};

const EASE = "cubic-bezier(.16,1,.3,1)";

function GlyphIcon({ name, size }: { name: Glyph; size: number }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  let body: ReactNode;
  if (name === "mail")
    body = (
      <g {...stroke}>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M4 7.5l8 5.5 8-5.5" />
      </g>
    );
  else if (name === "arrow") body = <path {...stroke} d="M7 17L17 7M8.5 7H17v8.5" />;
  else if (name === "up") body = <path {...stroke} d="M12 19V5M6 11l6-6 6 6" />;
  else body = <path fill="currentColor" d={FILLED[name]} />;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      {body}
    </svg>
  );
}

interface Props {
  kind: Kind;
  label: string;
  glyph?: Glyph;
  iconSide?: "left" | "right";
  href?: string;
  newTab?: boolean;
  backToTop?: boolean;
  size?: "medium" | "small";
  magnet?: number;
}

// Colors per kind, from the site tokens so dark mode follows the toggle.
const SKIN: Record<Kind, { bg: string; color: string; border: string; fill: string; hoverColor: string }> = {
  primary: { bg: "var(--ink)", color: "var(--paper)", border: "transparent", fill: "var(--accent)", hoverColor: "var(--on-accent)" },
  secondary: { bg: "var(--paper)", color: "var(--ink)", border: "var(--line)", fill: "var(--ink)", hoverColor: "var(--paper)" },
  icon: { bg: "transparent", color: "var(--ink)", border: "var(--line)", fill: "var(--ink)", hoverColor: "var(--paper)" },
};

export default function FooterAction({ kind, label, glyph, iconSide = "left", href, newTab, backToTop, size = "medium", magnet = 0.25 }: Props) {
  const small = size === "small";
  const isIcon = kind === "icon";
  const skin = kind === "icon" && small ? { ...SKIN.icon, color: "var(--soft)" } : SKIN[kind];
  const rootRef = useRef<HTMLAnchorElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const m = useRef({ x: 0, y: 0, tx: 0, ty: 0, raf: 0 });

  const reduced = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  function kick() {
    const s = m.current;
    if (s.raf) return;
    const step = () => {
      s.x += (s.tx - s.x) * 0.16;
      s.y += (s.ty - s.y) * 0.16;
      if (rootRef.current) rootRef.current.style.translate = `${s.x.toFixed(2)}px ${s.y.toFixed(2)}px`;
      if (innerRef.current) innerRef.current.style.translate = `${(s.x * 0.45).toFixed(2)}px ${(s.y * 0.45).toFixed(2)}px`;
      const moving = Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) > 0.05;
      s.raf = moving ? requestAnimationFrame(step) : 0;
    };
    s.raf = requestAnimationFrame(step);
  }
  useEffect(
    () => () => {
      if (m.current.raf) cancelAnimationFrame(m.current.raf);
    },
    [],
  );

  // Place the fill circle where the cursor crossed the edge.
  function aimFill(e: ReactPointerEvent) {
    const el = rootRef.current;
    const f = fillRef.current;
    if (!el || !f) return;
    const b = el.getBoundingClientRect();
    const d = Math.hypot(b.width, b.height) * 2.1;
    f.style.width = f.style.height = `${d}px`;
    f.style.left = `${e.clientX - b.left - d / 2}px`;
    f.style.top = `${e.clientY - b.top - d / 2}px`;
  }
  function onEnter(e: ReactPointerEvent) {
    if (e.pointerType === "touch") return;
    aimFill(e);
    startTransition(() => setHover(true));
  }
  function onMove(e: ReactPointerEvent) {
    if (e.pointerType === "touch" || reduced()) return;
    const el = rootRef.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    const s = m.current;
    // Measure against the resting box, not the pulled one.
    const cx = b.left - s.x + b.width / 2;
    const cy = b.top - s.y + b.height / 2;
    const max = isIcon ? 5 : 8;
    s.tx = Math.max(-max, Math.min(max, (e.clientX - cx) * magnet));
    s.ty = Math.max(-max, Math.min(max, (e.clientY - cy) * magnet));
    kick();
  }
  function onLeave(e: ReactPointerEvent) {
    aimFill(e);
    const s = m.current;
    s.tx = 0;
    s.ty = 0;
    kick();
    startTransition(() => {
      setHover(false);
      setPress(false);
    });
  }

  const on = hover;
  const iconSize = isIcon ? (small ? 13 : 15) : small ? 13 : 16;
  const slideOut = glyph === "arrow" ? "translate(110%, -110%)" : "translateY(-110%)";
  const slideIn = glyph === "arrow" ? "translate(-110%, 110%)" : "translateY(110%)";

  const iconEl = glyph ? (
    <span style={{ position: "relative", display: "inline-flex", width: iconSize, height: iconSize, overflow: "hidden", flex: "none" }}>
      <span style={{ position: "absolute", inset: 0, display: "flex", color: skin.color, transform: on ? slideOut : "translate(0,0)", transition: `transform 550ms ${EASE}` }}>
        <GlyphIcon name={glyph} size={iconSize} />
      </span>
      <span style={{ position: "absolute", inset: 0, display: "flex", color: skin.hoverColor, transform: on ? "translate(0,0)" : slideIn, transition: `transform 550ms ${EASE} ${on ? 60 : 0}ms` }}>
        <GlyphIcon name={glyph} size={iconSize} />
      </span>
    </span>
  ) : null;

  const text = !isIcon ? (
    <span aria-hidden style={{ display: "inline-flex", whiteSpace: "pre" }}>
      {Array.from(label).map((ch, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", height: "1.15em", lineHeight: "1.15em", verticalAlign: "top" }}>
          <span style={{ display: "flex", flexDirection: "column", transform: on ? "translateY(-50%)" : "translateY(0)", transition: `transform 600ms ${EASE} ${on ? i * 14 : 0}ms` }}>
            <span style={{ height: "1.15em", color: skin.color }}>{ch}</span>
            <span style={{ height: "1.15em", color: skin.hoverColor }}>{ch}</span>
          </span>
        </span>
      ))}
    </span>
  ) : null;

  return (
    <a
      ref={rootRef}
      href={backToTop ? "#top" : href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      aria-label={label}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onClick={
        backToTop
          ? (e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });
            }
          : undefined
      }
      onPointerDown={() => startTransition(() => setPress(true))}
      onPointerUp={() => startTransition(() => setPress(false))}
      onFocus={() => startTransition(() => setHover(true))}
      onBlur={() => startTransition(() => setHover(false))}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        width: isIcon ? (small ? 32 : 40) : "max-content",
        height: isIcon ? (small ? 32 : 40) : small ? 32 : undefined,
        padding: isIcon ? 0 : small ? "0 14px 0 12px" : kind === "primary" ? "15px 22px" : "15px 20px",
        borderRadius: 999,
        background: skin.bg,
        boxShadow: `inset 0 0 0 1px ${on ? "transparent" : skin.border}${on && kind === "primary" ? ", 0 14px 28px -14px rgba(26,25,23,0.45)" : ""}`,
        color: on ? skin.hoverColor : skin.color,
        textDecoration: "none",
        cursor: "pointer",
        isolation: "isolate",
        outline: "none",
        scale: press ? "0.96" : "1",
        transition: `scale 300ms ${EASE}, box-shadow 500ms ${EASE}`,
        fontSize: small ? 12.5 : 15,
        fontWeight: 500,
        letterSpacing: "-0.01em",
        lineHeight: 1,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* fill that spreads from the entry point and drains to the exit point */}
      <span aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 999, overflow: "hidden", zIndex: -1, pointerEvents: "none" }}>
        <span
          ref={fillRef}
          style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, borderRadius: "50%", background: skin.fill, transform: `scale(${on ? 1 : 0})`, transition: `transform ${on ? 650 : 450}ms ${EASE}` }}
        />
      </span>
      <span ref={innerRef} style={{ display: "inline-flex", alignItems: "center", gap: small ? 7 : kind === "primary" ? 10 : 8 }}>
        {iconSide === "left" && iconEl}
        {text}
        {iconSide === "right" && iconEl}
      </span>
      {isIcon && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "100%",
            marginTop: 12,
            transform: `translateX(-50%) translateY(${on ? 0 : -4}px) scale(${on ? 1 : 0.96})`,
            transformOrigin: "50% 0%",
            opacity: on ? 1 : 0,
            transition: on ? `opacity 220ms ease, transform 420ms ${EASE}` : "opacity 120ms ease, transform 200ms ease",
            background: "var(--ink)",
            color: "var(--paper)",
            padding: "6px 10px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 500,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 10px 24px -12px rgba(0,0,0,0.45)",
          }}
        >
          {label}
          <svg width="10" height="5" viewBox="0 0 10 5" aria-hidden style={{ position: "absolute", left: "50%", bottom: "100%", marginBottom: -0.5, transform: "translateX(-50%)" }}>
            <path d="M0 5 L5 0 L10 5 Z" fill="var(--ink)" />
          </svg>
        </span>
      )}
    </a>
  );
}
