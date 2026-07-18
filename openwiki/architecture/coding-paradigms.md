---
type: Engineering conventions
title: Coding Paradigms
description: The implementation rules and recurring patterns for this application.
tags: [engineering, conventions, testing, boundaries]
---

# Coding paradigms

Organize code around user-visible behavior, but keep decisions separate from effects. Domain rules and mapping functions remain deterministic; browser, HTTP, environment, time, and framework lifecycle work stay at explicit edges. Extract shared abstractions only after multiple real consumers need them.

Use ports and composition instead of hidden infrastructure. `BankingReadService` receives a `BankingReadPort`; fixture and Browserbase adapters implement it; `createBankingReadPort()` selects the implementation from validated configuration. Avoid service locators, deep inheritance, ambient mutable state, and vendor types in application contracts.

Validate data where it crosses a trust boundary. Zod owns HTTP query parsing, Stagehand extraction shapes, and public outputs. Amounts are decimal strings, external account numbers are masked, and errors become stable codes with generic messages at delivery.

Prefer the cheapest trustworthy test. Unit-test deterministic mapping and validation, integration-test Express with the fixture adapter, and reserve live Browserbase smoke tests for explicitly approved manual runs. A live bank session never belongs in `npm test` or CI.

Keep the service REST-only in v1. Browserbase is an internal service dependency, not a general browser endpoint exposed to callers. Every route maps to one bounded banking read, and there is no generic navigation or action API.

Update this page and the affected directory index whenever code establishes or changes a framework, runtime boundary, state model, or recurring pattern.
