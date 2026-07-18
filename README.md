# Caribbean Banking Agent

A read-only agent surface for Caribbean online banking, built for the [Future Caribbean Global AI Buildathon](https://futurecaribbean.com). Version 1 exposes JMMB portfolio, account, holding, and transaction data as focused MCP tools that ChatGPT can call, while Browserbase and Stagehand handle the legacy web portal behind the tool boundary.

Version 1 has no custom user interface and no money-moving capability. The `frontend/` boundary is reserved for a later dashboard; the executable product is the `backend/` MCP and HTTP service.

## Repository map

- `backend/` contains the TypeScript domain, Browserbase adapter, HTTP API, and MCP server.
- `frontend/` records the intentionally deferred UI boundary.
- `docs/` is a linked knowledge graph for product, architecture, integrations, operations, and delivery decisions.
- `artifacts/` categorizes local logs, browser session metadata, captures, reports, caches, and scratch output without cluttering source control.

## Local development

```powershell
npm install
npm run dev
```

The service defaults to fixture mode. Copy `.env.example` to `.env.local` and keep `JMMB_LIVE_ENABLED=false` until a deliberate live-read session is approved.

```powershell
npm run check
npm test
npm run build
```

See [docs/README.md](docs/README.md) for the knowledge graph and [docs/CODING_PARADIGMS.md](docs/CODING_PARADIGMS.md) for the coding model.

## Task tracking

This project uses [Beads](https://github.com/gastownhall/beads) as its durable task and agent-memory layer. The CLI is installed globally and the repository uses an embedded Dolt database under `.beads/`.

```powershell
bd prime
bd ready
bd show <id>
bd update <id> --claim
bd close <id> --reason "What changed and how it was verified"
```

Use Beads for work state and dependencies. Keep implementation and architecture knowledge in the repository docs, where it can be reviewed beside the code.
