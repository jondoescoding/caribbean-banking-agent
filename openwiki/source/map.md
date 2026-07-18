---
type: Source map
title: Source Map
description: File-level ownership for the REST service and repository support systems.
tags: [source-map, ownership, typescript]
---

# Source map

- `backend/src/index.ts` - process composition, localhost listener, shutdown.
- `backend/src/config.ts` - `.env.local` loading and fixture/live configuration validation.
- `backend/src/domain/banking.ts` - public banking schemas, types, and masking.
- `backend/src/application/banking-read-port.ts` - provider-independent read interface.
- `backend/src/application/banking-read-service.ts` - application validation boundary.
- `backend/src/application/errors.ts` - stable upstream/read error taxonomy.
- `backend/src/composition/create-banking-read-port.ts` - fixture/live adapter selection.
- `backend/src/delivery/http/create-app.ts` - REST routes, HTTP parsing, security middleware, 404/error behavior.
- `backend/src/delivery/errors.ts` - internal-to-public error mapping.
- `backend/src/adapters/fixtures/fixture-banking-read-adapter.ts` - deterministic safe demo data.
- `backend/src/adapters/browserbase/browserbase-jmmb-read-adapter.ts` - Stagehand lifecycle, login, navigation, domain/path guard, extraction.
- `backend/src/adapters/browserbase/jmmb-mappers.ts` - raw schemas and portal-to-domain normalization.
- `backend/test/domain/banking.test.ts` - domain validation and masking.
- `backend/test/adapters/fixture-and-mappers.test.ts` - configuration, fixture, and mapper behavior.
- `backend/test/delivery/http.test.ts` - REST integration and absence of writes.
- `openwiki/` - durable product and engineering knowledge.
- `.beads/` - durable task state and agent handoff metadata.
- `artifacts/` - ignored runtime evidence categories; never a financial-data store.
- `frontend/` - reserved presentation boundary with no v1 application code.
