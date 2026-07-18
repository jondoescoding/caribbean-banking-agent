---
type: API reference
title: REST Endpoints
description: Complete v1 HTTP route reference.
tags: [api, rest, endpoints, read-only]
---

# REST endpoints

The server binds to `http://127.0.0.1:3000` by default and exposes only reads:

- `GET /health` returns `{ status, mode, access }`; `mode` is `fixture` or `live`, and `access` is always `read-only`.
- `GET /api/v1/portfolio` returns aggregate net position, loans, uncleared funds, liens, non-cash value, and available balance.
- `GET /api/v1/accounts` returns equity, savings, and checking accounts with stable references, masked numbers, product metadata, and balances.
- `GET /api/v1/holdings?accountId=<reference>` returns all holdings or filters them by an optional stable account reference.
- `GET /api/v1/accounts/:accountId/transactions?from=YYYY-MM-DD&to=YYYY-MM-DD&limit=25` returns bounded transaction history. `limit` defaults to 25 and cannot exceed 100.

There are no mutation, generic browser-control, or agent-protocol routes. Unknown paths return a controlled JSON 404. The service has no cross-origin policy because v1 has no browser frontend.

Call accounts before account-specific routes so the caller uses an application-issued reference rather than a raw account number. See [contracts and data flow](../architecture/contracts-and-data-flow.md).
