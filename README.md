# adam.ai: AI engineering portfolio

A ChatGPT-style portfolio. Visitors "ask" questions and get case studies back as answers.
Routing is deterministic keyword scoring (no LLM, no API key), the same idea as the
second-brain retrieval tool in case study 01.

## Edit content
Everything the site says lives in `lib/content.ts`.
- Metrics with `todo: true` show as dashed yellow "to measure" cards. Replace the value and remove `todo` once you've measured it.
- Add your email, LinkedIn and resume URL under `profile.links`.

## Run locally
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Deep links
`/#memory`, `/#pipeline`, `/#context`, `/#design`, `/#contact` open that answer directly.

## Deploy
Import this repo on Vercel (framework: Next.js, no env vars needed).
