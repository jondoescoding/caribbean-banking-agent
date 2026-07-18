import type { BankingReadPort } from "../../application/banking-read-port.js";
import { BankingReadError } from "../../application/errors.js";
import type {
  AccountsResult,
  HoldingsQuery,
  HoldingsResult,
  PortfolioSummary,
  TransactionsQuery,
  TransactionsResult,
} from "../../domain/banking.js";

const portfolioSummary: PortfolioSummary = {
  asOf: "2026-07-18T12:00:00.000Z",
  displayCurrency: "JMD",
  netPosition: { currency: "JMD", value: "38425.50" },
  loans: { currency: "JMD", value: "0.00" },
  unclearedFunds: { currency: "JMD", value: "0.00" },
  liens: { currency: "JMD", value: "0.00" },
  nonCash: { currency: "JMD", value: "0.00" },
  availableBalance: { currency: "JMD", value: "36925.50" },
};

const accounts: AccountsResult = {
  accounts: [
    {
      id: "acct_equity_1001",
      institution: "Demo Investments (Jamaica)",
      displayName: "Demo Equity Account",
      maskedNumber: "****1001",
      type: "equity",
      productName: "Caribbean Equity Fund",
      currency: "JMD",
      currentBalance: { currency: "JMD", value: "8925.50" },
      availableBalance: { currency: "JMD", value: "8925.50" },
      status: "active",
    },
    {
      id: "acct_savings_2002",
      institution: "Demo Bank",
      displayName: "USD Savings",
      maskedNumber: "****2002",
      type: "savings",
      productName: "Bonus Saver",
      currency: "USD",
      currentBalance: { currency: "USD", value: "125.00" },
      availableBalance: { currency: "USD", value: "125.00" },
      status: "active",
    },
    {
      id: "acct_checking_3003",
      institution: "Demo Bank",
      displayName: "Everyday Checking",
      maskedNumber: "****3003",
      type: "checking",
      productName: "Everyday Access",
      currency: "JMD",
      currentBalance: { currency: "JMD", value: "29500.00" },
      availableBalance: { currency: "JMD", value: "28000.00" },
      status: "active",
    },
  ],
};

const holdings: HoldingsResult = {
  holdings: [
    {
      id: "holding_caribbean_equity_fund",
      accountId: "acct_equity_1001",
      name: "Caribbean Equity Fund",
      quantity: "125.0000",
      marketValue: { currency: "JMD", value: "8925.50" },
      availableValue: { currency: "JMD", value: "8925.50" },
    },
  ],
};

const transactions: TransactionsResult["transactions"] = [
  {
    id: "txn_demo_credit_1",
    accountId: "acct_checking_3003",
    bookedAt: "2026-07-17T14:15:00.000Z",
    description: "Demo payroll credit",
    amount: { currency: "JMD", value: "50000.00" },
    direction: "credit",
    status: "posted",
    runningBalance: { currency: "JMD", value: "52000.00" },
  },
  {
    id: "txn_demo_debit_1",
    accountId: "acct_checking_3003",
    bookedAt: "2026-07-18T09:30:00.000Z",
    description: "Demo utility payment",
    amount: { currency: "JMD", value: "-22500.00" },
    direction: "debit",
    status: "posted",
    runningBalance: { currency: "JMD", value: "29500.00" },
  },
];

export class FixtureBankingReadAdapter implements BankingReadPort {
  public async getPortfolioSummary(): Promise<PortfolioSummary> {
    return structuredClone(portfolioSummary);
  }

  public async listAccounts(): Promise<AccountsResult> {
    return structuredClone(accounts);
  }

  public async listHoldings(query: HoldingsQuery = {}): Promise<HoldingsResult> {
    return {
      holdings: structuredClone(
        query.accountId === undefined
          ? holdings.holdings
          : holdings.holdings.filter(({ accountId }) => accountId === query.accountId),
      ),
    };
  }

  public async listTransactions(query: TransactionsQuery): Promise<TransactionsResult> {
    const accountExists = accounts.accounts.some(({ id }) => id === query.accountId);
    if (!accountExists) {
      throw new BankingReadError("ACCOUNT_NOT_FOUND", "The requested account does not exist");
    }

    const limit = query.limit ?? 25;
    const matching = transactions
      .filter(({ accountId }) => accountId === query.accountId)
      .filter(({ bookedAt }) => query.from === undefined || bookedAt.slice(0, 10) >= query.from)
      .filter(({ bookedAt }) => query.to === undefined || bookedAt.slice(0, 10) <= query.to)
      .sort((left, right) => right.bookedAt.localeCompare(left.bookedAt));

    return {
      transactions: structuredClone(matching.slice(0, limit)),
      hasMore: matching.length > limit,
    };
  }
}
