---
id: operations.local-development
title: Local development and verification
status: active
related:
  - architecture.system
  - integrations.browserbase
  - security.read-only-v1
---

# Local development and verification

Use Node.js 22 or newer and npm workspaces. Install once with `npm install`, run fixture mode with `npm run dev`, and validate changes with `npm run check`, `npm test`, and `npm run build`.

The server listens on `127.0.0.1:3000` by default. `GET /health` reports process health, `/api/v1/*` exposes the read-only developer API, and `/mcp` is the Streamable HTTP MCP endpoint. No CORS policy is enabled because v1 has no browser frontend.

`.env.local` is ignored and is the only repository-local place for Browserbase and JMMB secrets. `.env.example` documents names without values. Do not add a Browserbase project ID; access is resolved from the API key.

Automated verification uses fixture data and local requests only. Browserbase access can be checked with `browse cloud projects list`; a banking session or JMMB page visit requires a separate explicit approval.
