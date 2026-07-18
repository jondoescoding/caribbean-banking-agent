---
type: Quickstart
title: Caribbean Banking API Quickstart
description: Install and verify the REST-only service safely in fixture mode.
tags: [quickstart, rest, fixture, verification]
---

# Quickstart

The default runtime never opens a browser or touches a bank account. From the repository root:

```powershell
npm install
npm run dev
```

The service binds to `127.0.0.1:3000`. Check `GET /health`, then inspect `GET /api/v1/portfolio`, `GET /api/v1/accounts`, and `GET /api/v1/holdings`. Use the stable masked account reference returned by the accounts endpoint with `GET /api/v1/accounts/:accountId/transactions`.

Run all local gates before changing runtime mode:

```powershell
npm run check
npm test
npm run build
```

`.env.local` is ignored. Fixture mode remains active while `JMMB_LIVE_ENABLED=false`; live reads additionally require `BROWSERBASE_API_KEY`, `JMMB_USERNAME`, and `JMMB_PASSWORD`. Do not add a Browserbase project ID. A live session requires explicit approval and follows the [live-read runbook](operations/live-read-runbook.md).

Continue with the [architecture overview](architecture/overview.md), [API endpoints](api/endpoints.md), and [read-only boundary](security/read-only-boundary.md).
