---
title: Keep retrieval out of the model
summary: Let code find the evidence and let the model read only the answer. Token cost stops growing with your notes.
category: Engineering
date: 2026-10-30
read: 4 min read
keywords: rag retrieval tokens memory grep index cost llm
---

When an AI agent needs to remember something, the easy move is to let it grep your notes or read whole files. It works at first. Then the notes grow, every lookup costs thousands of tokens, and the agent still lands on the wrong passage.

## Score first, open one file

Strip the question to keywords, score every source from a small index without opening anything, then open only the top file and return its best section. In my second brain this averages 858 tokens per question, about 15× fewer than grep, and the cost stays flat as the corpus grows.

## Try it this week

- Give every note a one-line entry in an index file.
- Split long pages into `##` sections so retrieval can return a paragraph, not a document.
- Benchmark it against grep with a hard pass line, so you notice when it regresses.
