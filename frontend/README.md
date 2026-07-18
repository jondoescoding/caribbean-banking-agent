# Frontend boundary

Version 1 deliberately has no custom web interface. The backend exposes an ordinary REST API, and this folder reserves the ownership boundary for a later dashboard without coupling the current domain or Browserbase adapter to a UI framework.

When a frontend is introduced, it must consume the public backend contracts, keep secrets and Browserbase sessions server-side, avoid storing auth material in web storage, and update the relevant pages under `openwiki/`.
