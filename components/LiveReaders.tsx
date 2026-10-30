"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";
import { readers } from "@/lib/config";

// Live reader count from Supabase, with no client library:
// - note_reader() adds one visit per IP per day (enforced in the database)
// - the total updates live through Realtime postgres_changes
// - "here now" counts open tabs through Realtime presence
// Names avoid words like "visit" or "counter" that ad blockers match.

function useCountUp(target: number | null) {
  const [shown, setShown] = useState<number | null>(target);
  const prev = useRef<number | null>(null);
  useEffect(() => {
    if (target == null) return;
    const from = prev.current ?? Math.max(0, target - Math.min(target, 40));
    prev.current = target;
    const c = animate(from, target, {
      duration: from === target ? 0 : 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => c.stop();
  }, [target]);
  return shown;
}

// One shared state per page, so two pills (hero + footer) make one connection.
type Listener = (s: { total: number | null; live: number | null; bump: number }) => void;
const shared = { total: null as number | null, live: null as number | null, bump: 0, started: false, listeners: new Set<Listener>() };
const emit = () => shared.listeners.forEach((l) => l({ total: shared.total, live: shared.live, bump: shared.bump }));

function start() {
  if (shared.started || typeof window === "undefined") return;
  shared.started = true;
  const base = readers.url.replace(/\/$/, "");
  const headers = { apikey: readers.anonKey, Authorization: "Bearer " + readers.anonKey, "Content-Type": "application/json" };
  const id = readers.counterId;

  const flag = "lr-seen:" + id;
  let seen = false;
  try {
    seen = sessionStorage.getItem(flag) === "1";
  } catch {}
  fetch(base + "/rest/v1/rpc/" + (seen ? "reader_count" : "note_reader"), { method: "POST", headers, body: JSON.stringify({ p_id: id }) })
    .then((r) => (r.ok ? r.json() : null))
    .then((v) => {
      if (v == null) return;
      try {
        sessionStorage.setItem(flag, "1");
      } catch {}
      const n = Number(v);
      if (!Number.isNaN(n) && (shared.total == null || n > shared.total)) {
        shared.total = n;
        emit();
      }
    })
    .catch(() => {});

  const wsUrl = base.replace(/^http/, "ws") + "/realtime/v1/websocket?apikey=" + encodeURIComponent(readers.anonKey) + "&vsn=1.0.0";
  const topic = "realtime:portfolio-" + id;
  const me = Math.random().toString(36).slice(2);
  let ws: WebSocket | null = null;
  let ref = 0;
  let heartbeat = 0;
  let retry = 0;
  let presence: Record<string, unknown> = {};
  const send = (event: string, payload: unknown, t = topic) => {
    if (ws && ws.readyState === 1) ws.send(JSON.stringify({ topic: t, event, payload, ref: String(++ref) }));
  };
  const open = () => {
    try {
      ws = new WebSocket(wsUrl);
    } catch {
      return;
    }
    ws.onopen = () => {
      retry = 0;
      send("phx_join", {
        config: {
          broadcast: { self: false },
          presence: { key: me },
          postgres_changes: [{ event: "UPDATE", schema: "public", table: "site_stats", filter: "id=eq." + id }],
        },
        access_token: readers.anonKey,
      });
      heartbeat = window.setInterval(() => send("heartbeat", {}, "phoenix"), 25000);
    };
    ws.onmessage = (e) => {
      let msg: { topic?: string; event?: string; ref?: string; payload?: any };
      try {
        msg = JSON.parse(e.data);
      } catch {
        return;
      }
      if (msg.topic !== topic) return;
      if (msg.event === "phx_reply" && msg.payload?.status === "ok" && msg.ref === "1") {
        send("presence", { type: "presence", event: "track", payload: { at: Date.now() } });
      } else if (msg.event === "postgres_changes") {
        const v = Number(msg.payload?.data?.record?.visits);
        if (!Number.isNaN(v) && (shared.total == null || v > shared.total)) {
          shared.total = v;
          shared.bump++;
          emit();
        }
      } else if (msg.event === "presence_state") {
        presence = { ...(msg.payload || {}) };
        shared.live = Math.max(1, Object.keys(presence).length);
        emit();
      } else if (msg.event === "presence_diff") {
        for (const k of Object.keys(msg.payload?.joins || {})) presence[k] = msg.payload.joins[k];
        for (const k of Object.keys(msg.payload?.leaves || {})) delete presence[k];
        shared.live = Math.max(1, Object.keys(presence).length);
        emit();
      }
    };
    ws.onclose = () => {
      window.clearInterval(heartbeat);
      ref = 0;
      retry = Math.min(retry + 1, 6);
      window.setTimeout(open, 1000 * 2 ** retry);
    };
    ws.onerror = () => ws?.close();
  };
  open();
}

export default function LiveReaders({ className = "" }: { className?: string }) {
  const [s, setS] = useState({ total: shared.total, live: shared.live, bump: shared.bump });
  const shown = useCountUp(s.total);

  useEffect(() => {
    const l: Listener = (v) => startTransition(() => setS(v));
    shared.listeners.add(l);
    start();
    l({ total: shared.total, live: shared.live, bump: shared.bump });
    return () => {
      shared.listeners.delete(l);
    };
  }, []);

  const fmt = (n: number | null) => (n == null ? "—" : n.toLocaleString("en-US"));

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={(s.total == null ? "Loading" : fmt(s.total)) + " visits" + (s.live ? ", " + s.live + " here now" : "")}
      className={
        "inline-flex w-max items-center gap-2.5 whitespace-nowrap rounded-full border border-line bg-paper py-2 pl-3 pr-3.5 font-mono text-[12px] tracking-[0.04em] text-soft " +
        className
      }
      style={{ boxShadow: "0 1px 1px rgba(0,0,0,0.03), 0 12px 32px -22px rgba(0,0,0,0.28)", fontVariantNumeric: "tabular-nums" }}
    >
      <span aria-hidden className="relative h-1.5 w-1.5 flex-none">
        <span className="absolute inset-0 rounded-full bg-accent" />
        <motion.span
          key={s.bump}
          className="absolute inset-0 rounded-full bg-accent"
          initial={{ scale: 1, opacity: 0.55 }}
          animate={{ scale: [1, 2.8], opacity: [0.55, 0] }}
          transition={{ duration: 2.4, ease: "easeOut", repeat: Infinity }}
        />
      </span>
      <span>
        <span className="text-ink">{fmt(shown)}</span> visits
      </span>
      <AnimatePresence initial={false}>
        {s.live != null ? (
          <motion.span
            key="live"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2.5"
          >
            <span aria-hidden className="h-3 w-px bg-line" />
            <span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={s.live}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block text-ink"
                >
                  {s.live}
                </motion.span>
              </AnimatePresence>{" "}
              here now
            </span>
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
