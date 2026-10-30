---
title: Overwrite your handoff, don’t append to it
summary: When you switch between Claude Code, Cursor and Codex, one short handoff section beats a long history.
category: Claude Code
date: 2026-10-30
read: 3 min read
keywords: handoff claude cursor codex agents sync context now.md
---

Chat history never leaves the tool it happened in. If you plan in Claude and build in Cursor, the second tool starts from zero unless something carries the context across.

## One baton, rewritten every session

I keep a Handoff section at the top of `docs/now.md`. Every tool overwrites it at the end of a session: what shipped, what’s in flight, and what was offered but not chosen. Overwriting matters. The next tool should read the current state, not a diary.

## What to put in it

- The branch and PR in flight.
- Decisions made only in chat, written down.
- The next step, in one sentence.
