# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Mixed audience: hiring managers and recruiters who skim for fit with AI engineer roles, and engineering leads and peers who dig into the case studies and architecture. The skimmers decide in a few minutes; the technical readers stay for depth.

## Product Purpose
adam.ai is the personal portfolio of Adam (Akbarhon) Toshkhujayev, an AI engineer and solo founder of AirBrew. It exists to turn a visit into an interview or job offer. Success is a visitor who contacts Adam or requests his resume after reading.

## Positioning
A ChatGPT-style portfolio: visitors "ask" questions and get case studies back as answers. Routing is deterministic keyword scoring, the same idea as the second-brain retrieval tool in case study 01, so the site itself demonstrates the cheap, reliable, explainable AI systems Adam builds. A neighboring portfolio could copy the look of a chat, not the fact that the chat is the proof.

## Operating Context
Single-page Next.js site deployed on Vercel. All copy lives in `lib/content.ts`. Deep links open an answer directly: `/#memory`, `/#pipeline`, `/#context`, `/#design`, `/#contact`.

## Capabilities and Constraints
- Chat-style "ask a question" interface is the core mechanism and must be preserved.
- Routing is deterministic keyword scoring (`lib/route.ts`). No LLM and no API key at runtime; the site stays free to host.
- Metrics marked `todo: true` render as dashed "to measure" cards. Never present unmeasured numbers as real.
- Resume link is hidden while `profile.links.resume` is empty.
- Fonts currently in use: Inter, Instrument Serif, JetBrains Mono (not recorded as binding).

## Brand Commitments
Name: Adam (Akbarhon) Toshkhujayev. Role line: "AI Engineer · Solo founder of AirBrew". Voice in existing copy is plain, first person, and concrete about cost, reliability and explainability.

## Evidence on Hand
Four case studies (01 to 04) covering a deterministic memory system for AI agents, a free-first import pipeline, a multi-agent context layer and AirBrew's design. Experience, education, languages and courses are in `lib/content.ts`. Live product: AirBrew, in beta. Several metrics are not yet measured; do not fabricate them. No testimonials or press on hand.

## Product Principles
1. The site demonstrates the work: the interface is evidence of the engineering, not decoration around it.
2. Honest numbers only. Unmeasured stays visibly unmeasured.
3. A skimmer gets the fit in minutes; a technical reader can go deeper without leaving the chat.
4. Contact is the main action, and credibility is the path to it.
5. Cheap, deterministic and explainable beats clever.
