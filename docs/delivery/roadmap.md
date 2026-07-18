---
id: delivery.roadmap
title: Capability roadmap
status: active
related:
  - product.vision
  - architecture.tools
  - security.read-only-v1
---

# Capability roadmap

Version 1 retrieves the full personal-banking picture: portfolio summary, bank and equity accounts, holdings, and transaction history. It ships as a tool-only ChatGPT MCP surface backed by a fixture mode and a separately approved Browserbase live-read mode.

Version 1.5 introduces transfers between the user's own checking and savings accounts. Version 1.7 extends internal movement to equity accounts. Version 1.9 covers external local or international recipients. Version 2 expands toward the remaining Moneyline services, including trades and scheduled financial operations.

These later versions describe product direction, not latent v1 permissions. Each mutation phase requires a new threat model, explicit confirmation and authentication design, idempotency, transaction limits, auditability, recovery behavior, and a dedicated Beads graph before implementation.
