---
type: Architecture overview
title: Caribbean Banking API Architecture
description: Layered runtime architecture and major extension points.
tags: [architecture, express, browserbase, stagehand]
---

# Architecture overview

The backend is a small layered TypeScript service:

1. `backend/src/index.ts` loads configuration, composes the adapter and application service, creates Express, and binds only to localhost.
2. `backend/src/delivery/http/create-app.ts` owns the REST routes, HTTP validation, security middleware, 404 behavior, and public error responses.
3. `backend/src/application/banking-read-service.ts` validates application inputs and outputs around one `BankingReadPort`.
4. `backend/src/application/banking-read-port.ts` defines four read operations without browser, HTTP, or vendor types.
5. `backend/src/domain/banking.ts` owns Zod schemas for portfolio, accounts, holdings, transactions, money, and stable public identifiers.
6. `backend/src/adapters/fixtures/fixture-banking-read-adapter.ts` supplies deterministic development data.
7. `backend/src/adapters/browserbase/browserbase-jmmb-read-adapter.ts` opens Browserbase sessions and drives JMMB through Stagehand.
8. `backend/src/adapters/browserbase/jmmb-mappers.ts` validates portal extractions and converts them into application-owned data.

```text
HTTP client -> Express routes -> BankingReadService -> BankingReadPort
                                                   -> fixture adapter
                                                   -> Browserbase/JMMB adapter
```

The dependency direction points inward: delivery and adapters depend on application/domain contracts, while the domain has no knowledge of Express, Browserbase, Stagehand, or JMMB markup. A future frontend consumes the REST API and never receives browser credentials, cookies, or context identifiers.

Major extension points are new read models in the domain, new explicit REST routes, or a replacement adapter implementing the same port. Adding a write workflow requires a separate architecture review; it is not an extension of `BankingReadPort`.
