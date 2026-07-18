import { describe, expect, it } from "vitest";
import { FixtureBankingReadAdapter } from "../../src/adapters/fixtures/fixture-banking-read-adapter.js";
import {
  mapAccount,
  mapPortfolioSummary,
} from "../../src/adapters/browserbase/jmmb-mappers.js";
import { isJmmbAuthenticationLocation } from "../../src/adapters/browserbase/browserbase-jmmb-read-adapter.js";
import { parseConfig } from "../../src/config.js";

describe("safe adapter boundary", () => {
  it("defaults to fixture mode without credentials", () => {
    expect(parseConfig({})).toMatchObject({ mode: "fixture", port: 3000 });
    expect(
      parseConfig({
        BROWSERBASE_API_KEY: "",
        BROWSERBASE_CONTEXT_ID: "",
        JMMB_USERNAME: "",
        JMMB_PASSWORD: "",
      }),
    ).toMatchObject({ mode: "fixture" });
  });

  it("requires all credentials before live mode can exist", () => {
    expect(() => parseConfig({ JMMB_LIVE_ENABLED: "true" })).toThrow();
  });

  it("uses the Jamaica entry point before the personal login flow", () => {
    expect(
      parseConfig({
        JMMB_LIVE_ENABLED: "true",
        BROWSERBASE_API_KEY: "test-browserbase-key",
        JMMB_USERNAME: "test-user",
        JMMB_PASSWORD: "test-password",
      }),
    ).toMatchObject({
      mode: "live",
      jmmbEntryUrl: "https://moneyline.jmmb.com/country.php?type=jm-mbk&lang=en",
      jmmbLoginUrl: "https://moneyline.jmmb.com/personal/login.php",
    });
  });

  it("recognizes both login and access-denied authentication redirects", () => {
    expect(
      isJmmbAuthenticationLocation("https://moneyline.jmmb.com/personal/login.php"),
    ).toBe(true);
    expect(
      isJmmbAuthenticationLocation(
        "https://moneyline.jmmb.com/personal/error.php?vu=NOACCESS",
      ),
    ).toBe(true);
    expect(
      isJmmbAuthenticationLocation("https://moneyline.jmmb.com/personal/error.php"),
    ).toBe(true);
    expect(
      isJmmbAuthenticationLocation("https://moneyline.jmmb.com/personal/app/accsum/"),
    ).toBe(false);
  });

  it("returns generic fixture data and filters by stable account references", async () => {
    const adapter = new FixtureBankingReadAdapter();
    const accounts = await adapter.listAccounts();
    const checking = accounts.accounts.find(({ type }) => type === "checking");
    expect(checking?.maskedNumber).toMatch(/^\*{4}\d{4}$/);

    const result = await adapter.listTransactions({
      accountId: checking?.id ?? "acct_missing",
      limit: 1,
    });
    expect(result.transactions).toHaveLength(1);
    expect(result.hasMore).toBe(true);
  });

  it("normalizes portal currency labels and masks raw account numbers", () => {
    const account = mapAccount({
      accountNumber: "000-111-9876",
      institution: "Demo Bank",
      displayName: "Checking",
      type: "checking",
      productName: "Access",
      currency: "JA$",
      currentBalance: "JA$ 1,234.50",
      availableBalance: "JA$ (10.25)",
      status: "active",
    });
    expect(account).toMatchObject({
      id: "acct_checking_9876",
      maskedNumber: "****9876",
      currency: "JMD",
      currentBalance: { currency: "JMD", value: "1234.50" },
      availableBalance: { currency: "JMD", value: "-10.25" },
    });
  });

  it("maps a portfolio summary without retaining portal labels", () => {
    expect(
      mapPortfolioSummary({
        asOf: "2026-07-18",
        displayCurrency: "JA$",
        netPosition: "JA$ 100.00",
        loans: "JA$ 0.00",
        unclearedFunds: "JA$ 0.00",
        liens: "JA$ (5.00)",
        nonCash: "JA$ 0.00",
        availableBalance: "JA$ 95.00",
      }),
    ).toMatchObject({
      displayCurrency: "JMD",
      liens: { currency: "JMD", value: "-5.00" },
    });
  });
});
