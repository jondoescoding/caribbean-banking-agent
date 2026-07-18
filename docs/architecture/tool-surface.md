---
id: architecture.tools
title: Read-only tool surface
status: active
related:
  - architecture.system
  - security.read-only-v1
  - delivery.roadmap
---

# Read-only tool surface

Each tool handles one user intent and returns predictable structured content:

- `get_portfolio_summary` returns net position, available balance, liabilities, uncleared funds, non-cash value, and display currency.
- `list_accounts` returns masked account identity, account type, product name, currency, current balance, and available balance.
- `list_holdings` returns investment holdings with quantity and valuation fields when the portal provides them.
- `list_transactions` returns bounded transaction history for one known account, with date, description, amount, currency, direction, and optional running balance.

Every tool sets `readOnlyHint: true`, has an explicit input and output schema, and returns machine-readable identifiers suitable for follow-up calls. Account identifiers exposed to the model are stable masked references, not raw account numbers.

There is no generic navigation tool and no transfer, trade, cheque, payee, scheduled-payment, statement-generation, reminder, or message tool in v1. Later versions must add mutations as separately reviewed tools with explicit confirmation and authorization, not by widening these read contracts.
