---
type: Security policy
title: Credentials and Data Handling
description: Rules for Browserbase secrets, bank credentials, session state, and financial responses.
tags: [security, secrets, privacy, financial-data]
---

# Credentials and data handling

Repository-local secrets belong only in ignored `.env.local`. Tracked `.env.example` contains names and safe URLs without values. The application accepts `BROWSERBASE_API_KEY`, optional `BROWSERBASE_CONTEXT_ID`, JMMB username/password, and the explicit live-mode switch; it never accepts a Browserbase project ID.

Credentials are loaded only in the backend process. Username and password are passed to Stagehand as variables, never embedded in instruction strings. Public responses, errors, logs, artifacts, tests, screenshots, Git history, and the wiki must not contain credentials, cookies, context IDs, raw account numbers, or Browserbase keys.

Financial responses are sensitive even after credentials are removed. The adapter masks account numbers before crossing its boundary, but balances, holdings, transaction descriptions, and dates remain private. Live verification checks shapes and counts without printing or persisting bodies.

Anyone who pastes a credential into chat, an issue, or another external system should rotate it before relying on live access. Use Browserbase session replay for browser diagnostics and avoid adding screenshots or network exports to the repository.
