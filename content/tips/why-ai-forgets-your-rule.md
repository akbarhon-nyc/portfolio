---
title: Why an AI can read 100 pages and still forget your rule
summary: A context window is a budget rebuilt on every response, not a memory. How a rule that fits still gets lost, a toy demo you can run, and the habits that keep it in view.
category: AI Engineering
date: 2026-10-30
read: 8 min read
keywords: context window tokens memory forget rule summarise summary compaction retrieval rag pin pinned instructions tokenizer tiktoken long chat limit
download: /downloads/context-window-cheat-sheet.pdf
downloadLabel: Context windows: the cheat sheet (PDF, 3 pages)
---

<aside class="callout">

**Short version.** Every answer is built from one temporary package of tokens. If your rule is not in that package, in a form the model can act on, it cannot follow it, however clearly you said it an hour ago. Fitting inside the window is necessary but not sufficient: placement, exact wording and retrieval decide whether the rule survives.

</aside>

## The failure

Alex is fixing a checkout bug with an AI coding assistant. Early in the chat he sets one invariant:

> Use TypeScript. Do not change the payment tests.

The chat then grows: API docs, an error log, a schema, a few files, follow-up questions. An hour in, he asks for one last fix. The model answers in JavaScript and rewrites a payment test.

Nothing was deleted on purpose. For that turn, the rule was not in front of the model in a usable form. That is the whole bug, and it is easy to misread as the model being careless.

A 100-page document fits comfortably in a large window. One sentence can still get lost inside it.

## The mental model: a desk rebuilt on every turn

For each response, the app assembles a package and the model reads only that package:

```text title="How one answer is built"
YOU        message + files + your latest question
            |
            v
THE APP    builds a package of tokens for this one answer:
            instructions + saved preferences or summaries (if the product has them)
            + recent messages + uploaded files + your latest question
            |   the package must fit the context window
            v
THE MODEL  reads only that package, writes one answer
            (the answer counts toward the window too)
            |
            v
THE APP    builds a new package for the next answer
```

Two consequences follow. The window is not a notebook: nothing persists in it between turns unless the app puts it back. And the answer shares the budget, so the input never gets the whole window.

### Tokens, counted properly

A token is a word, part of a word, punctuation or code. For English prose, a token is roughly four characters, so 100 tokens is about 75 words. That is a rule of thumb, and it breaks on code, other languages and unusual strings. The same sentence is a different number of tokens in different encodings:

```python title=count_tokens.py
import tiktoken

rule = "Use TypeScript. Do not change the payment tests."
for name in ("gpt2", "cl100k_base", "o200k_base"):
    enc = tiktoken.get_encoding(name)
    pieces = [enc.decode([i]) for i in enc.encode(rule)]
    print(f"{name:<12} {len(pieces):>2} tokens  {pieces}")
print("characters:", len(rule), "-> about", round(len(rule) / 4), "tokens by the 4-characters rule")
```

```text output
gpt2         11 tokens  ['Use', ' Type', 'Script', '.', ' Do', ' not', ' change', ' the', ' payment', ' tests', '.']
cl100k_base  10 tokens  ['Use', ' TypeScript', '.', ' Do', ' not', ' change', ' the', ' payment', ' tests', '.']
o200k_base   11 tokens  ['Use', ' Type', 'Script', '.', ' Do', ' not', ' change', ' the', ' payment', ' tests', '.']
characters: 48 -> about 12 tokens by the 4-characters rule
```

The estimate lands within one token here, but budgets should be set with the tokenizer your model actually uses. `tiktoken` covers OpenAI encodings; other providers publish a token-counting endpoint or their own tokenizer.

## Why “it fits” still fails

Two different failure modes get blamed on “the AI forgot”:

| Failure | What happens | Why the rule is lost |
| --- | --- | --- |
| **Eviction** | The window fills, so the app removes something | Usually the oldest messages, which is where early rules live. The rule is gone, not ignored |
| **Dilution** | Everything fits, but the pile is large | The instruction is a tiny share of the tokens, and recall of mid-context details degrades as context grows. The rule is present but easy to miss |

The second one is documented, not folklore. Liu et al. measured models answering worse when the relevant passage sat in the middle of a long input than at the start or end ([Lost in the Middle](https://arxiv.org/abs/2307.03172)). Reading a 100-page file proves the window is big. It does not prove a small, early constraint survived to the last turn.

## Four ways a product handles a full window

When the package does not fit, something has to give. These are minimal versions of the four common strategies, for teaching rather than a description of any one product:

| What the product does | What stays | What can be lost | What you can do |
| --- | --- | --- | --- |
| **Drops the oldest messages** | The newest messages | The start of the chat, where rules usually live | Repeat the rule in a recent message |
| **Replaces old messages with a summary** | The gist | The exact wording of a rule | Ask for rules to be kept word for word, or restate them |
| **Keeps instructions in a separate slot** | The pinned text, every time | Little, but pinned text still takes up window space | Put hard rules in the persistent instructions slot |
| **Searches the earlier chat and adds parts back** | The parts that match your latest question | Anything the search did not match | Mention the rule’s topic in your question |

## Run it and watch the rule fall out

A toy chat of 157 tokens against a 130-token budget. The four strategies above decide what to keep, and a fixed budget forces a choice. You need `pip install tiktoken`; the first run downloads the encoding files, so it needs a network connection.

```python title=context_demo.py
import re
import tiktoken

enc = tiktoken.get_encoding("gpt2")
count = lambda text: len(enc.encode(text))

chat = [
    ("app", "You are a coding assistant. Answer briefly and show code."),
    ("rule", "Use TypeScript. Do not change the payment tests."),
    ("docs", "POST /v1/charges creates a charge. Amounts are integers in cents. A 402 means the card was declined."),
    ("log", "TypeError: Cannot read properties of undefined (reading 'price') at calcTotal (checkout.ts:48)"),
    ("code", "export function calcTotal(cart: Cart): number { return cart.items.reduce((t, i) => t + i.price * i.qty, 0); }"),
    ("q1", "Why is the total NaN for some carts? Some items arrive without a price, so guard the multiplication."),
    ("q2", "Should the amount be sent in cents? Yes, round to an integer number of cents before charging."),
    ("latest", "Fix this last bug."),
]
BUDGET = 130  # a toy window, so the chat does not fit
total = sum(count(text) for _, text in chat)
print(f"chat: {total} tokens, budget: {BUDGET}")

def newest_that_fit(items, room):
    kept = []
    for key, text in reversed(items):
        if count(text) <= room:
            kept.insert(0, key)
            room -= count(text)
        else:
            break
    return kept

app, rule, latest = chat[0], chat[1], chat[-1]
middle = chat[2:-1]
fixed = count(app[1]) + count(latest[1])

# 1. drop the oldest
drop = [app[0]] + newest_that_fit(chat[1:-1], BUDGET - fixed) + [latest[0]]

# 2. summarise the old (the summary text never contains the rule)
summary = "Summary: Alex is fixing a checkout bug in a TypeScript app and asked two questions."
summarise = [app[0], "summary", chat[-3][0], chat[-2][0], latest[0]]

# 3. pin the rule in its own slot
pin = [app[0], rule[0]] + newest_that_fit(middle, BUDGET - fixed - count(rule[1])) + [latest[0]]

# 4. retrieve what overlaps with the latest question
words = lambda t: set(re.findall(r"[a-z0-9]+", t.lower()))
query = words(latest[1] + " payment tests TypeScript")
ranked = sorted(chat[1:-1], key=lambda m: -len(words(m[1]) & query) / len(words(m[1]) | query))
retrieve = [app[0]] + [key for key, _ in ranked[:2]] + [latest[0]]

for name, kept in [("drop oldest", drop), ("summarise", summarise), ("pin", pin), ("retrieve", retrieve)]:
    size = sum(count(summary if k == "summary" else dict(chat)[k]) for k in kept)
    print(f"{name:<12} {size:>3} tokens  rule kept: {'rule' in kept}")
```

```text output
chat: 157 tokens, budget: 130
drop oldest  121 tokens  rule kept: False
summarise     77 tokens  rule kept: False
pin          108 tokens  rule kept: True
retrieve      53 tokens  rule kept: True
```

Read the last column, not the sizes. Dropping the oldest messages removed the rule first. Summarising lost it because the summary text never contained it. Pinning kept it. Retrieval kept it only because the query mentioned the same words (`payment`, `tests`, `TypeScript`); ask something that shares no vocabulary with the rule and it misses the same way summarising does.

## Debug a forgotten rule

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| The AI ignores a rule from early in a long chat | The rule was dropped or summarised away | Restate it in a new message and keep it in the persistent instructions |
| A rule works at first, then drifts as the chat grows | A bigger pile makes recall less reliable even when everything fits | Trim pasted material and restate the rule near your question |
| The AI does not remember last week’s chat | A context window is not saved memory | Use the product’s memory feature or paste a short brief |
| A long answer is cut off | The answer counts toward the window | Shorten the input or ask for a shorter answer |
| The API returns “prompt is too long” | The input alone is larger than the window | Trim, summarise or compact the history |
| Every turn is slower or costs more | The API is stateless, so the history is sent again each turn and billed as input | Compact the history or start a new thread |

## If you are building the product

Most of the leverage is in your own app, where you control what goes into the package.

| Option | What it does | Use it when |
| --- | --- | --- |
| **Count first** | Measures tokens before you send, with a token-counting API or a tokenizer such as `tiktoken` | You need to know whether the package fits |
| **Compaction** | Replaces older turns with a summary the model writes. Recent turns can stay word for word, and you can write your own summarisation prompt | A long conversation approaches the limit and the default summary drops something later turns need |
| **Clear old tool results** | Removes the raw results of earlier tool calls by rule | An agent has called many tools and the results are no longer needed |
| **Notes outside the window** | The agent writes notes to storage and pulls them back later | A task spans more than one window |
| **Load on demand** | Keep lightweight identifiers such as file paths, and load the data when it is needed | The data is large and only some of it is relevant |

Anthropic’s write-up on [context engineering for agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) covers compaction, tool-result clearing and external notes in more depth. Two smaller habits are worth adopting early. For long documents, put the document near the top of the prompt and your question and instructions at the end. And ask the model to quote the relevant passage before it answers, which makes it anchor on the right part of a large input.

The mistake I see most is treating this as a summariser problem. It is a reliability problem: write a regression test that runs a long chat and checks the invariant at turn 40, not only at turn 2.

## Habits for long chats

<aside class="checklist">

- Put the rule in the persistent instructions slot if the product has one.
- Restate the rule in your latest message before a big change.
- Paste only the part of a file the question needs.
- Ask the model to quote the relevant part first.
- When a chat gets long, start a new one with a short brief.

</aside>

## Window, memory and training are different things

| Thing | Where it lives | How long it lasts |
| --- | --- | --- |
| **Context window** | The package built for one response | This one response |
| **Saved memory or custom instructions** | Product software around the model, added to the package | Until you delete it |
| **Training** | The model’s weights | Set in training, not changed by your chat |

“It remembered last week” and “it saw it in this chat” are different claims. Saved memory is just more text the product adds to the package, so it is subject to every limit above. Promising “memory” while shipping only a window is how teams end up with the Alex bug.

<p class="pull">If the model cannot see a rule, it cannot follow it. And a pile that fits can still bury it.</p>

A context window is not everything an AI knows or remembers forever. It is the temporary workspace that decides what it can use right now. Design for visibility, not only capacity: pin what must not change, restate it before you act, and test what survives a long conversation.

## Notes and sources

- The token counts for the rule sentence (11, 10 and 11) and the toy demo results (157 tokens, then 121, 77, 108 and 53) were re-checked with an independent GPT-2-compatible tokenizer. The strategies are minimal teaching versions, not any product’s algorithm.
- Liu et al., [Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172), 2023.
- Anthropic Engineering, [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).
- OpenAI, [tiktoken](https://github.com/openai/tiktoken), the tokenizer used in the examples.
- The idea started from a short explainer by Virex Explains. The wording, demo and write-up here are rewritten.
