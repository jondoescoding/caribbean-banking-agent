---
id: product.vision
title: Product vision and demo
status: active
related:
  - architecture.system
  - architecture.tools
  - integrations.jmmb
  - delivery.roadmap
---

# Product vision and demo

Caribbean consumers often depend on capable but dated online-banking interfaces that are difficult to use from a phone or conversational surface. This project turns one such portal into a structured, read-only agent surface so a user can ask ChatGPT for current balances, portfolio position, holdings, and transaction history.

The five-minute v1 demo is intentionally narrow: connect the app in ChatGPT, ask for a portfolio summary, inspect the separate equity, savings, and checking accounts, and ask for recent transactions. ChatGPT chooses focused MCP tools; the backend drives the authenticated portal through Browserbase and returns validated structured data.

The project enters the Future Caribbean Finance, Payments & MSME Capital track. The track emphasizes regional financial infrastructure, deterministic controls, and auditability, so the pitch is a practical access layer that can evolve toward safer financial workflows rather than an unconstrained browser agent.

Success for v1 means the read-only paths are coherent, locally testable with fixtures, deployable behind HTTPS, and ready for one explicitly approved live-read demonstration. Success does not require a custom UI or any money movement.
