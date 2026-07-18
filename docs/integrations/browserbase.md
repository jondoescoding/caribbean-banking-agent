---
id: integrations.browserbase
title: Browserbase and Stagehand
status: active
related:
  - architecture.system
  - integrations.jmmb
  - operations.local-development
  - security.read-only-v1
---

# Browserbase and Stagehand

Browserbase supplies cloud Chrome sessions, observability, and reusable contexts. Stagehand sits inside those sessions and combines precise code with natural-language `observe`, `act`, and `extract` operations. The application needs only `BROWSERBASE_API_KEY`; it must never request or configure `BROWSERBASE_PROJECT_ID`.

JMMB login state belongs in a Browserbase Context so later approved reads can reuse cookies without storing them in this repository. The context identifier is a local environment value and is not returned through HTTP or MCP.

Repeatable flows keep instructions atomic and stable. Use `observe()` to discover actionable elements, replay its action results when possible, and persist caches under `artifacts/cache/`. Browserbase's guidance notes that acting on observed results avoids repeated inference, and Stagehand's cache directory allows repeat runs to reuse action plans.

Tests never create a Browserbase session. A manual live-read verification must print the complete Browserbase session URL, store only redacted session metadata under `artifacts/sessions/`, and stop before any state-changing bank action.
