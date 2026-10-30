# akbarhon.dev · Adam’s AI engineering portfolio

An editorial portfolio (Marlowe-style: warm paper, Fraunces serif, terracotta accent) with a chat you can ask about my work.
The chat routes questions with deterministic keyword scoring (no LLM, no API key), then “thinks” and streams the answer in.

## Edit content

| What | Where |
|---|---|
| Name, intro, links, experience, education, case studies, workflow | `lib/content.ts` |
| Tips (blog posts) | `content/tips/*.md` |
| Colors and type | `app/globals.css` (light and dark tokens at the top) |
| Live reader counter settings | `lib/config.ts` |

Metrics with `todo: true` in `lib/content.ts` show as dashed “to measure” cards. Replace the value and remove `todo` once measured.

## Add a tip

Create `content/tips/your-slug.md`:

```md
---
title: Your tip title
summary: One or two sentences for cards and the chat.
category: Claude Code
date: 2026-11-02
read: 3 min read
keywords: extra words the chat should match (optional)
---

Body in Markdown. Use ## for subheadings, lists, `code` and links.
```

Commit and push. It appears on `/tips`, on the home page (latest 3) and in the chat, which matches questions against the title, category, summary and keywords.

## Live reader counter

The “visits · here now” pills read from a small Supabase project (`adam-portfolio`).
The database counts at most one visit per IP per day (IPs are hashed with a secret salt, never stored) and pushes updates over Realtime.
Names deliberately avoid words like “visit” or “counter” in files and endpoints, because ad blockers block them.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # typecheck
npm run build    # production build
```

## Deep links

`/#memory`, `/#pipeline`, `/#context` and `/#design` open that answer in the chat. `/#about`, `/#experience`, `/#tips` and `/#contact` scroll to the section.

## Deploy

Vercel (framework: Next.js, no env vars needed). Pushing to `main` deploys akbarhon.dev.
