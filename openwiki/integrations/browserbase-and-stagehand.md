---
type: Integration guide
title: Browserbase and Stagehand
description: How the backend uses cloud browsers as a private service dependency.
tags: [browserbase, stagehand, sessions, contexts, caching]
---

# Browserbase and Stagehand

Browserbase runs real Chrome sessions in the cloud. Stagehand controls those sessions with a mix of exact navigation and natural-language `act()`/`extract()` calls, letting the adapter tolerate portal markup changes without exposing a general browser operator to API clients.

Each live banking service call currently creates one Stagehand session, restricts it to `moneyline.jmmb.com`, authenticates explicitly when no persisted Context is configured, performs one bounded read, and closes the session in `finally`. A Context-backed session may try its saved cookies before falling back to login. The Browserbase dashboard retains Live View/replay observability according to the account plan.

The constructor uses `env: "BROWSERBASE"`, the API key, disabled Pino output, and a persistent cache at `artifacts/cache/jmmb-read-actions`. Stable prompts and `%variables%` keep action cache keys reusable. Exact navigation waits for `domcontentloaded`; natural-language instructions are atomic and values are passed separately from prompt text.

`BROWSERBASE_CONTEXT_ID` is optional. When present, the adapter asks Browserbase to persist the context so cookies can survive across sessions; the context ID remains server-side. No Browserbase project ID is accepted or required because the API key resolves the project.

Failures become generic application errors. The API never returns session IDs, context IDs, cookies, Stagehand traces, prompts, or raw extraction payloads. Operators use `browse cloud sessions list` and the full `https://www.browserbase.com/sessions/<session-id>` dashboard URL for diagnostics.

See the [live-read runbook](../operations/live-read-runbook.md) and [credentials handling](../security/credentials-and-data-handling.md).
