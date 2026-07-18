---
type: Testing guide
title: Testing Strategy
description: The cheapest trustworthy verification mix for a banking browser service.
tags: [testing, unit, integration, smoke]
---

# Testing strategy

Unit tests cover decimal/currency/date normalization, masking, schema validation, stable identifiers, fixture filtering, configuration defaults, and mapper failure behavior. These tests are deterministic and do not start Express or a browser.

Integration tests compose `BankingReadService`, the fixture adapter, and Express through Supertest. They verify health metadata, masked account responses, invalid query handling, absent mutation routes, security headers, and controlled errors.

`npm run check` runs strict TypeScript without emitting; `npm test` runs Vitest once; `npm run build` emits NodeNext JavaScript. A local compiled-service smoke test verifies real listening behavior against fixture mode.

Live Browserbase/JMMB verification is manual, separately approved, and never part of CI. It validates one bounded API operation, confirms the session in Browserbase, and reports only sanitized schema/status facts. A successful fixture suite cannot prove the portal markup still matches, while a live run must never become a general regression test against a personal bank account.
