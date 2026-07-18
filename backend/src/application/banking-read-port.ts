import type {
  AccountsResult,
  HoldingsQuery,
  HoldingsResult,
  PortfolioSummary,
  TransactionsQuery,
  TransactionsResult,
} from "../domain/banking.js";

export interface BankingReadPort {
  getPortfolioSummary(): Promise<PortfolioSummary>;
  listAccounts(): Promise<AccountsResult>;
  listHoldings(query?: HoldingsQuery): Promise<HoldingsResult>;
  listTransactions(query: TransactionsQuery): Promise<TransactionsResult>;
}
