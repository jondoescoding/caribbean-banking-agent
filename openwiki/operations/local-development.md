---
type: Operations guide
title: Local Development
description: Development commands, configuration, and artifact layout.
tags: [operations, npm, development, fixture]
---

# Local development

Node.js 22 or newer and npm workspaces are required. Install at the repository root with `npm install`; run the TypeScript service with `npm run dev`; build production JavaScript with `npm run build`; start compiled output with `npm start`.

The configuration loader reads the ignored root `.env.local`. `.env.example` documents supported variables without values. Blank optional values are accepted in fixture mode. The server binds to localhost and defaults to port 3000.

`artifacts/` separates logs, session metadata, captures, reports, caches, and scratch output. Runtime contents are ignored while directory READMEs remain tracked. Do not persist extracted banking data, screenshots of authenticated pages, session cookies, or response bodies.

Run `npm run check`, `npm test`, and `npm run build` before closing implementation work. Tests use the fixture adapter and local Supertest requests only.
