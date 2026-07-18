# Frontend boundary

Version 1 deliberately has no custom web interface: ChatGPT is the presentation surface and the backend returns structured MCP tool results. This folder reserves the ownership boundary for a later dashboard or MCP Apps widget without coupling the current domain and Browserbase adapter to a UI framework.

When a frontend is introduced, it must consume the public backend contracts, keep secrets and Browserbase sessions server-side, avoid storing auth material in web storage, and document its framework and security model in `docs/CODING_PARADIGMS.md`.
