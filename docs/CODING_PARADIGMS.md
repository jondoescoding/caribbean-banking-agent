# Coding paradigms

This is the source of truth for how the application is structured and changed. Keep it descriptive: when the code establishes a framework, boundary, state model, or recurring pattern, update this document in the same bead and code change.

## Current application state

The application is a TypeScript monorepo running on Node.js. The `backend/` package owns an Express HTTP service, a Streamable HTTP MCP endpoint, provider-independent banking contracts, and adapters for fixtures and Browserbase/Stagehand. The `frontend/` folder is intentionally documentation-only in v1 because ChatGPT is the user interface.

The dependency direction is delivery (`http`, `mcp`) to application service to ports and domain contracts, with adapters implementing those ports. Browserbase, Stagehand, JMMB markup, Express, and MCP SDK types do not enter the domain layer.

## Engineering defaults

These defaults apply until the implementation gives us a concrete reason to revise them.

### Organize around product behavior

Prefer vertical feature slices that keep a user flow's interface, application logic, domain rules, and adapters easy to trace together. Extract shared code only when multiple real consumers need the same stable concept; speculative shared layers slow down a buildathon and hide ownership.

The v1 tool surface follows user intent: portfolio summary, accounts, holdings, and transaction history each have a focused operation. There is no generic “operate the bank website” tool because an open-ended browser action would erase the read-only safety boundary.

### Keep decisions separate from effects

Put deterministic business rules in small functions or modules, and keep network, storage, time, randomness, and framework lifecycle work at explicit edges. This makes core behavior cheap to test and prevents infrastructure details from becoming the application's architecture.

The banking service depends on a `BankingReadPort`. Fixture and Browserbase adapters implement it, so tests exercise the same contracts without starting a cloud browser or touching a personal account.

### Make boundaries explicit

Validate untrusted input where it enters the system and translate external representations into application-owned types before using them. Dependencies should point from delivery and infrastructure code toward application and domain code, so replacing an API, database, or UI layer does not rewrite the rules they serve.

Zod schemas validate HTTP/MCP input, fixture data, and extracted JMMB data. Browserbase output is untrusted until it passes those schemas. Currency amounts use decimal strings rather than binary floating-point numbers, and account identifiers are masked before they cross public delivery boundaries.

### Prefer composition and visible data flow

Build behavior by composing small units with explicit inputs and outputs. Avoid hidden mutable state, deep inheritance, service locators, and ambient globals because they make ownership and failure paths difficult to see across agent handoffs.

### Treat errors as part of the contract

Expected failures should have explicit, typed or structured representations at module boundaries. Add context once near the failing edge, preserve the original cause, and convert errors to user-facing responses only in the delivery layer.

Delivery surfaces return stable error codes and generic messages. Logs may contain an internal correlation ID and operation name, but never credentials, cookies, Browserbase context data, account identifiers, balances, holdings, or transactions.

### Test at the cheapest trustworthy level

Cover deterministic rules with unit tests, boundary collaboration with integration tests, and only critical end-to-end flows with smoke tests. Every bug fix should add the narrowest regression test that would have caught it.

Version 1 tests use fixtures and local transports only. A live Browserbase/JMMB run is a separately approved manual verification, never part of `npm test` or CI.

## Runtime rules

- The server defaults to fixture mode; live mode requires the explicit `JMMB_LIVE_ENABLED=true` setting and complete local secrets.
- All registered MCP tools carry `readOnlyHint: true`; no mutating tool exists in the executable surface.
- Browser workflows use stable atomic instructions, `observe()` results where useful, and a persistent cache under `artifacts/cache/`.
- The application never needs or accepts `BROWSERBASE_PROJECT_ID`; the Browserbase API key resolves the project.
- Cross-origin browser access is disabled unless a later frontend bead defines a strict origin allowlist.
- Express disables fingerprinting, limits request bodies, sets security headers, and returns controlled 404 and error responses.

## Decision record format

When the implementation establishes or changes a paradigm, update this file with the decision, the code boundary it governs, and the reason it fits the current product. Track unfinished work and dependencies in Beads rather than adding task lists here.
