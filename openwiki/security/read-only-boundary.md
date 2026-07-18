---
type: Security policy
title: Read-only Boundary
description: Enforced v1 restrictions across HTTP, application, and browser layers.
tags: [security, read-only, defense-in-depth]
---

# Read-only boundary

Version 1 contains only four application reads and five public GET routes including health. There is no generic browser controller, agent tool protocol, write port, mutation route, or method capable of submitting a banking change.

The Browserbase adapter constrains navigation to `moneyline.jmmb.com`, checks the active URL after navigation, and rejects mutation-related path terms. Transaction navigation includes an explicit negative instruction against creation, transfer, scheduling, submission, confirmation, trade, and payee controls. Any unfamiliar condition fails closed.

Express disables its identifying header, applies Helmet, limits JSON bodies to 32 KB, defines no permissive CORS policy, returns controlled 404/error JSON, and binds to `127.0.0.1`. Zod validates queries and all data entering or leaving the application service.

Future writes require a separate port and route family plus transaction-specific authentication, explicit user confirmation, idempotency, amount/currency limits, audit events, reconciliation, and failure recovery. They must not reuse the current browser instruction surface by simply changing prompts.
