---
type: Architecture concept
title: Contracts and Data Flow
description: How untrusted portal output becomes stable API data.
tags: [contracts, zod, money, identifiers, mapping]
---

# Contracts and data flow

Every external boundary is untrusted. Express parses query strings into narrow Zod schemas; the application service validates the request again at its port boundary; Stagehand extraction must satisfy raw portal schemas; mappers normalize those raw values into domain schemas before a response can leave the service.

Money uses `{ currency, value }`, with ISO-style three-letter currency codes and base-10 decimal strings. This avoids binary floating-point errors and preserves the portal's exact displayed amount. `JA$` and related labels normalize to `JMD`; `US$` normalizes to `USD`; parentheses and debit direction normalize negative values.

Raw account numbers never leave the adapter. Public account references combine the account type with the final four digits, such as `acct_checking_3003`, while the display number is constrained to `****3003`. Holdings and transaction IDs are stable hashes of normalized source fields.

Expected upstream conditions become `BankingReadError` codes. The delivery layer maps them to generic public messages, so parsing errors, portal changes, session failures, and authentication needs never reflect credentials or extracted banking content.

See [API errors and contracts](../api/errors-and-contracts.md) and [credentials and data handling](../security/credentials-and-data-handling.md).
