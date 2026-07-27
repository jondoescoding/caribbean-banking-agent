# Caribbean Banking API

A read-only API for Caribbean online banking, built for the [Future Caribbean Global AI Buildathon](https://futurecaribbean.com). Browserbase runs the legacy JMMB portal as a cloud-browser service, Stagehand performs repeatable navigation and extraction, and Express exposes validated portfolio, account, holding, and transaction responses.

Version 1 has no custom user interface, agent tool protocol, or money-moving capability. The executable product is an ordinary REST backend; `frontend/` reserves a later presentation boundary.

## Repository map

- `backend/` contains the TypeScript domain, Browserbase adapter, and REST API.
- `frontend/` records the intentionally deferred UI boundary.
- `openwiki/` is the repository's OKF-compatible engineering wiki.
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

Start with the [OpenWiki home](openwiki/index.md), then use the [quickstart](openwiki/quickstart.md) or [architecture overview](openwiki/architecture/overview.md).

## Independent project and responsible use

This is an independent open-source project. It is not affiliated with, endorsed by, or sponsored by JMMB, JN Group, or any financial institution.

Users are responsible for complying with applicable laws, institutional terms, privacy requirements, and security policies. Never commit banking credentials, customer information, live account data, or other sensitive financial information. Keep live access disabled unless the account owner has deliberately authorized the session and the relevant institution permits the activity.

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

## License

Licensed under the [Apache License 2.0](LICENSE).
