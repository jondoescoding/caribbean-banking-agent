import { BankingReadService } from "./application/banking-read-service.js";
import { createBankingReadPort } from "./composition/create-banking-read-port.js";
import { loadConfig } from "./config.js";
import { createApp } from "./delivery/http/create-app.js";

const config = loadConfig();
const service = new BankingReadService(createBankingReadPort(config));
const app = createApp(service, config.mode);

const server = app.listen(config.port, "127.0.0.1", () => {
  console.info(
    `Caribbean banking agent listening at http://127.0.0.1:${config.port} (${config.mode}, read-only)`,
  );
});

function shutDown(): void {
  server.close((error) => {
    if (error !== undefined) {
      console.error("Server shutdown failed.");
      process.exitCode = 1;
    }
  });
}

process.once("SIGINT", shutDown);
process.once("SIGTERM", shutDown);
