---
type: API reference
title: Errors and Contracts
description: Stable public errors and schema behavior at the HTTP boundary.
tags: [api, errors, validation, zod]
---

# Errors and contracts

HTTP input failures return status `400` with `INVALID_REQUEST`. Missing application account references return `404` with `ACCOUNT_NOT_FOUND`. Browser authentication, expiry, portal drift, and availability failures return controlled `503` responses. Unexpected failures return `500` with `INTERNAL_ERROR`.

Public error bodies use `{ error: { code, message } }`. Messages are intentionally generic and never include Zod issue dumps, selectors, URLs beyond public route names, credentials, cookies, context IDs, raw account numbers, balances, holdings, or transactions.

All success responses are validated by the application service before Express serializes them. Domain schemas are the source of truth in `backend/src/domain/banking.ts`; endpoint query schemas remain in `backend/src/delivery/http/create-app.ts` because coercion from HTTP strings is a delivery concern.
