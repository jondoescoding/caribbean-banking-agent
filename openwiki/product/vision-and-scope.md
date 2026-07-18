---
type: Product specification
title: Vision and Scope
description: The read-only REST API outcome for the Future Caribbean buildathon.
tags: [product, buildathon, banking, read-only]
---

# Vision and scope

Caribbean online banking often exposes useful financial data through interfaces that are difficult to integrate with modern applications. This project turns the authenticated JMMB Moneyline portal into a validated read-only REST API, using Browserbase as the remote browser runtime and Stagehand as the navigation and extraction layer.

Version 1 answers four needs: portfolio summary, account listing, investment holdings, and bounded transaction history. It has no custom frontend and no agent tool protocol. Consumers interact with explicit HTTP endpoints whose data shapes belong to this application rather than to the portal markup.

The buildathon demo is: start the API, show the Browserbase cloud session, call the portfolio and accounts endpoints, then use a returned masked account reference to retrieve recent transactions. Fixture mode supports development and judging without personal credentials.

Transfers, trades, payees, cheque requests, statement generation, reminders, and other writes are excluded. A later version may add them only as separate operations with transaction-specific authorization, confirmation, idempotency, audit, and reconciliation; the current read port will not be widened into a generic bank operator.
