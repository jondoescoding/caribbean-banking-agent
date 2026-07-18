import type { BankingReadPort } from "./banking-read-port.js";
import {
  AccountsResultSchema,
  HoldingsQuerySchema,
  HoldingsResultSchema,
  PortfolioSummarySchema,
  TransactionsQuerySchema,
  TransactionsResultSchema,
  type AccountsResult,
  type HoldingsQuery,
  type HoldingsResult,
  type PortfolioSummary,
  type TransactionsQuery,
  type TransactionsResult,
} from "../domain/banking.js";

export class BankingReadService {
  public constructor(private readonly port: BankingReadPort) {}

  public async getPortfolioSummary(): Promise<PortfolioSummary> {
    return PortfolioSummarySchema.parse(await this.port.getPortfolioSummary());
  }

  public async listAccounts(): Promise<AccountsResult> {
    return AccountsResultSchema.parse(await this.port.listAccounts());
  }

  public async listHoldings(query: HoldingsQuery = {}): Promise<HoldingsResult> {
    const parsedQuery = HoldingsQuerySchema.parse(query);
    return HoldingsResultSchema.parse(await this.port.listHoldings(parsedQuery));
  }

  public async listTransactions(query: TransactionsQuery): Promise<TransactionsResult> {
    const parsedQuery = TransactionsQuerySchema.parse(query);
    return TransactionsResultSchema.parse(await this.port.listTransactions(parsedQuery));
  }
}
