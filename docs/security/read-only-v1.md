---
id: security.read-only-v1
title: Read-only v1 safety boundary
status: active
related:
  - architecture.tools
  - integrations.browserbase
  - integrations.jmmb
  - delivery.roadmap
---

# Read-only v1 safety boundary

Read-only is enforced structurally rather than left to prompting. The domain exposes only a `BankingReadPort`; delivery registers only annotated read tools; the Browserbase adapter implements only navigation and extraction needed for those reads. The codebase contains no generic browser-command endpoint that could be repurposed to click a transfer or trade control.

Secrets stay in ignored `.env.local` storage and are loaded only in the backend process. They are never included in errors, logs, artifacts, MCP content, HTTP responses, test fixtures, screenshots, or Git history. Extracted financial data receives the same treatment: return only what the caller asked for and avoid durable storage.

Fixture mode is the default and the only automated-test mode. Live reads require `JMMB_LIVE_ENABLED=true`, complete credentials, and explicit approval for the current session. Any mutation work belongs to a later version with user authentication, confirmation semantics, idempotency, audit records, limits, and domain-specific authorization.
