---
id: architecture.system
title: System architecture
status: active
related:
  - architecture.tools
  - integrations.browserbase
  - integrations.jmmb
  - security.read-only-v1
  - coding.paradigms
---

# System architecture

The v1 executable is a TypeScript service with two delivery paths over one application core: conventional read-only HTTP endpoints for development and a Streamable HTTP MCP endpoint for ChatGPT. Both call the same `BankingReadService`, which depends on a provider-independent `BankingReadPort`.

The fixture adapter implements that port for deterministic tests and local demos. The Browserbase adapter implements it for approved live reads, using Stagehand to navigate and extract from JMMB. Extracted values are untrusted until domain schemas validate them.

```text
ChatGPT -- MCP --> delivery/mcp ----\
                                     BankingReadService --> BankingReadPort
Developer -- HTTP --> delivery/http/                         |-- Fixture adapter
                                                            `-- Browserbase/JMMB adapter
```

The MCP server is tool-only in v1. OpenAI's Apps SDK permits this shape because the MCP server is required while the embedded UI component is optional. A later widget or dashboard can consume the same structured contracts without entering the browser automation layer.
