import { Stagehand } from "@browserbasehq/stagehand";
import type { BankingReadPort } from "../../application/banking-read-port.js";
import { BankingReadError } from "../../application/errors.js";
import type { LiveAppConfig } from "../../config.js";
import type {
  AccountsResult,
  HoldingsQuery,
  HoldingsResult,
  PortfolioSummary,
  TransactionsQuery,
  TransactionsResult,
} from "../../domain/banking.js";
import {
  RawAccountsSchema,
  RawHoldingsSchema,
  RawPortfolioSummarySchema,
  RawTransactionsSchema,
  mapAccount,
  mapHolding,
  mapPortfolioSummary,
  mapTransaction,
  type RawAccount,
} from "./jmmb-mappers.js";

type StagehandSession = {
  stagehand: Stagehand;
  sessionUrl?: string;
};

export class BrowserbaseJmmbReadAdapter implements BankingReadPort {
  public constructor(private readonly config: LiveAppConfig) {}

  public async getPortfolioSummary(): Promise<PortfolioSummary> {
    return this.withReadSession(async ({ stagehand }) => {
      const raw = await stagehand.extract(
        "Extract the portfolio summary exactly as displayed. Return the as-of time, display currency, net position, loans, uncleared funds, liens, non-cash value, and available balance as strings.",
        RawPortfolioSummarySchema,
      );
      return mapPortfolioSummary(raw);
    });
  }

  public async listAccounts(): Promise<AccountsResult> {
    return this.withReadSession(async ({ stagehand }) => {
      const raw = await this.extractAccounts(stagehand);
      return { accounts: raw.map(mapAccount) };
    });
  }

  public async listHoldings(query: HoldingsQuery = {}): Promise<HoldingsResult> {
    return this.withReadSession(async ({ stagehand }) => {
      const rawAccounts = await this.extractAccounts(stagehand);
      const accounts = rawAccounts.map(mapAccount);
      const raw = await stagehand.extract(
        "Extract all investment holdings visible in portfolio details. For each holding return its account number, name, optional symbol, optional quantity, currency, market value, and optional available value as strings.",
        RawHoldingsSchema,
      );
      const mapped = raw.holdings.map((holding) => mapHolding(holding, accounts));
      return {
        holdings:
          query.accountId === undefined
            ? mapped
            : mapped.filter(({ accountId }) => accountId === query.accountId),
      };
    });
  }

  public async listTransactions(query: TransactionsQuery): Promise<TransactionsResult> {
    return this.withReadSession(async ({ stagehand }) => {
      const rawAccounts = await this.extractAccounts(stagehand);
      const accounts = rawAccounts.map(mapAccount);
      const account = accounts.find(({ id }) => id === query.accountId);
      if (account === undefined) {
        throw new BankingReadError("ACCOUNT_NOT_FOUND", "The requested account does not exist");
      }

      await stagehand.act(
        "Open the read-only transaction history for the account ending in %lastFour%. Do not open or click any control for creating, transferring, scheduling, submitting, confirming, buying, selling, or managing payees.",
        {
          variables: { lastFour: account.maskedNumber.slice(-4) },
        },
      );
      this.assertReadOnlyLocation(stagehand.context.activePage()?.url());

      const raw = await stagehand.extract(
        `Extract at most ${query.limit ?? 25} visible transactions. Return account number, booked date/time, description, amount, currency, credit or debit direction, posted or pending status, and optional running balance. Report whether more rows are available.`,
        RawTransactionsSchema,
      );

      const from = query.from;
      const to = query.to;
      const limit = query.limit ?? 25;
      const matching = raw.transactions
        .map((transaction) => mapTransaction(transaction, accounts))
        .filter(({ accountId }) => accountId === account.id)
        .filter(({ bookedAt }) => from === undefined || bookedAt.slice(0, 10) >= from)
        .filter(({ bookedAt }) => to === undefined || bookedAt.slice(0, 10) <= to)
        .slice(0, limit);

      return { transactions: matching, hasMore: raw.hasMore };
    });
  }

  private async withReadSession<T>(operation: (session: StagehandSession) => Promise<T>): Promise<T> {
    const context = this.config.browserbaseContextId;
    const stagehand = new Stagehand({
      env: "BROWSERBASE",
      apiKey: this.config.browserbaseApiKey,
      cacheDir: "../artifacts/cache/jmmb-read-actions",
      disablePino: true,
      ...(context === undefined
        ? {}
        : {
            browserbaseSessionCreateParams: {
              browserSettings: { context: { id: context, persist: true } },
            },
          }),
    });

    try {
      await stagehand.init();
      await stagehand.context.setDomainPolicy({ allowedDomains: ["moneyline.jmmb.com"] });
      const page = stagehand.context.activePage() ?? (await stagehand.context.newPage());
      await page.goto(this.config.jmmbAccountsUrl, {
        waitUntil: "domcontentloaded",
        timeoutMs: 20_000,
      });

      if (this.isLoginPage(page.url())) {
        await this.login(stagehand);
      }

      await page.goto(this.config.jmmbAccountsUrl, {
        waitUntil: "domcontentloaded",
        timeoutMs: 20_000,
      });
      if (this.isLoginPage(page.url())) {
        throw new BankingReadError(
          "AUTHENTICATION_REQUIRED",
          "The banking session needs interactive authentication",
        );
      }
      this.assertReadOnlyLocation(page.url());

      return await operation({
        stagehand,
        ...(stagehand.browserbaseSessionURL === undefined
          ? {}
          : { sessionUrl: stagehand.browserbaseSessionURL }),
      });
    } catch (error) {
      if (error instanceof BankingReadError) {
        throw error;
      }
      throw new BankingReadError(
        "UPSTREAM_UNAVAILABLE",
        "The read-only banking session could not be completed",
      );
    } finally {
      await stagehand.close().catch(() => undefined);
    }
  }

  private async login(stagehand: Stagehand): Promise<void> {
    const page = stagehand.context.activePage();
    if (page === undefined) {
      throw new BankingReadError("UPSTREAM_UNAVAILABLE", "The browser page is unavailable");
    }

    await page.goto(this.config.jmmbLoginUrl, {
      waitUntil: "domcontentloaded",
      timeoutMs: 20_000,
    });
    await stagehand.act("Type %username% into the username field", {
      page,
      variables: { username: this.config.jmmbUsername },
    });
    await stagehand.act("Type %password% into the password field", {
      page,
      variables: { password: this.config.jmmbPassword },
    });
    await stagehand.act("Click the sign-in button", { page });
    await page.waitForLoadState("domcontentloaded", 20_000);
  }

  private async extractAccounts(stagehand: Stagehand): Promise<RawAccount[]> {
    const raw = await stagehand.extract(
      "Extract every equity, savings, and checking account visible in portfolio details. For each account return account number, institution, display name, account type, product name, currency, current balance, available balance, and active/closed/unknown status as strings.",
      RawAccountsSchema,
    );
    return raw.accounts;
  }

  private isLoginPage(url: string): boolean {
    return url.includes("/personal/login") || url.endsWith("/login.php");
  }

  private assertReadOnlyLocation(url: string | undefined): void {
    if (url === undefined) {
      throw new BankingReadError("UPSTREAM_UNAVAILABLE", "The banking page is unavailable");
    }

    const parsed = new URL(url);
    if (parsed.hostname !== "moneyline.jmmb.com") {
      throw new BankingReadError("UPSTREAM_CHANGED", "The banking portal changed location");
    }

    if (/(transfer|payment|payee|trade|buy|sell|cheque|request|schedule|confirm)/i.test(parsed.pathname)) {
      throw new BankingReadError(
        "UPSTREAM_CHANGED",
        "The browser reached a page outside the approved read-only surface",
      );
    }
  }
}
