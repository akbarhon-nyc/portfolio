---
title: Write your design taste down as rules
summary: AI is great at following rules and bad at inferring taste. Turn your brand into always and never lists.
category: AI tools
date: 2026-10-30
read: 3 min read
keywords: design system tokens brand ui tailwind rules taste locked
---

AI agents generate UI that is almost right: an off-brand color here, a second icon set there. Each screen then needs a manual fix, and the fixes never stick.

## Make it checkable

Put exact tokens in CSS variables, mark settled decisions as locked, and keep a short always and never list the agent reads before it builds. Extract colors from real screenshots instead of guessing hex values.

## Starter rules

- **Always** use colors and type from the token file.
- **Never** hardcode the brand color or font in a component.
- **Never** change a locked decision without writing down why.
