---
type: Integration guide
title: JMMB Moneyline Portal
description: Read-only portal workflow and source-to-domain mapping.
tags: [jmmb, banking, portal, extraction]
---

# JMMB Moneyline portal

The live adapter is restricted to `moneyline.jmmb.com`. Before login it visits the Jamaica Moneyline entry URL (`country.php?type=jm-mbk&lang=en`) so JMMB establishes the correct country/product state, then opens the personal login URL. It also recognizes personal login URLs and the personal `error.php` access-denied transition as authentication redirects. The legacy login page has no useful accessibility tree, so authentication uses its inspected stable form IDs (`#txtUser`, `#txtPwd`, and `#loginbtn`) through Stagehand's deterministic locator API; natural-language extraction remains reserved for portfolio data. Credential values are never logged or included in prompts.

The portfolio page supplies aggregate position and portfolio details for equity, savings, and checking accounts. Extraction schemas request only the fields needed by the REST contracts. Mappers normalize currency/date/decimal representations, mask account numbers, and reject unexpected shapes as portal drift.

Transaction history is the only workflow that navigates beyond the summary page. It selects an account by its final four digits and explicitly forbids controls related to creating, transferring, scheduling, submitting, confirming, buying, selling, or payee management. After navigation, `assertReadOnlyLocation()` rejects another hostname or a pathname containing mutation-related terms.

The application does not generate statements, view messages, request cheques, manage reminders, transfer money, or trade securities. If the portal introduces MFA, CAPTCHA, consent, or an unfamiliar page, the adapter fails closed and requires an operator to inspect the Browserbase replay before changing code.

During the 2026-07-18 onboarding verification, Browserbase reached the inspected login form and completed its credential POST, but JMMB returned to `/personal/login.php`. The adapter now classifies that state as `AUTHENTICATION_REQUIRED`; operators must verify the current credentials or any additional login requirement before another attempt, and should avoid repeated retries that could lock the account.
