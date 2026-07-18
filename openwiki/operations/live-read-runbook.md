---
type: Operations runbook
title: Live Read Runbook
description: Procedure for an explicitly authorized Browserbase/JMMB read-only session.
tags: [operations, browserbase, live-session, jmmb]
---

# Live read runbook

Use this runbook only after the user explicitly approves live access in the current task.

1. Confirm `browse --version` and `node --version`, then verify the API key with `browse cloud projects list`. Project output is an access check; never copy or configure a project ID.
2. Confirm `.env.local` is ignored and contains the Browserbase key and JMMB credentials. The configured flow visits the Jamaica entry URL before personal login. Leave provider/model API keys unset so Stagehand can use Browserbase Model Gateway.
3. Build and pass fixture gates before live access. Set `JMMB_LIVE_ENABLED=true` only in the live process environment so the file remains safe by default.
4. Start the local API and call one bounded endpoint. Begin with `/api/v1/portfolio` or `/api/v1/accounts`; do not print the response body. Verify only HTTP status, schema validity, masked identifiers, and collection counts.
5. Run `browse cloud sessions list --json`, match the session created by the request, and surface the complete session URL. Browserbase Live View shows the run while active; replay, logs, and network information remain available afterward.
6. If authentication, Model Gateway quota, bot protection, MFA, CAPTCHA, or portal drift blocks the run, stop after one diagnosed retry. Returning to `/personal/login.php` after the credential POST is `AUTHENTICATION_REQUIRED`; verify credentials or additional login requirements before retrying to avoid account lockout. Do not widen domain policy, add proxies/Verified mode, bypass authentication controls, or navigate to mutation pages without new approval.
7. Return the process to fixture mode and run a secret scan. Record only sanitized status and the session replay URL; never store credentials or banking response data.

The adapter creates a separate cloud session per API operation. Reusing a Browserbase Context can preserve cookies, but its identifier is a server-side secret.
