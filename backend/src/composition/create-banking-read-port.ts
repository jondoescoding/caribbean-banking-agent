import type { BankingReadPort } from "../application/banking-read-port.js";
import { BrowserbaseJmmbReadAdapter } from "../adapters/browserbase/browserbase-jmmb-read-adapter.js";
import { FixtureBankingReadAdapter } from "../adapters/fixtures/fixture-banking-read-adapter.js";
import type { AppConfig } from "../config.js";

export function createBankingReadPort(config: AppConfig): BankingReadPort {
  return config.mode === "live"
    ? new BrowserbaseJmmbReadAdapter(config)
    : new FixtureBankingReadAdapter();
}
