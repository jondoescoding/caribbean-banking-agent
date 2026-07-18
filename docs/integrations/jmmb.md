---
id: integrations.jmmb
title: JMMB Moneyline boundary
status: active
related:
  - architecture.system
  - architecture.tools
  - integrations.browserbase
  - security.read-only-v1
---

# JMMB Moneyline boundary

JMMB Moneyline is treated as an external legacy system, not as the application's domain model. The supplied reference captures show a portfolio summary followed by grouped investment, savings, and checking accounts with current and available balances. Those observations inform fixture shapes but personal account numbers and values are never copied into tracked files.

The adapter owns login navigation, session-expiry detection, page-specific extraction, and translation from portal labels into application schemas. No other layer knows selectors, page URLs, or JMMB-specific markup.

Live access stays disabled by default. Enabling it requires local Browserbase and JMMB credentials, an explicit current-task approval, and read-only adapter methods. If the portal presents MFA, CAPTCHA, a changed login flow, or a state-changing confirmation, the adapter stops and returns a typed intervention error.
