import { createHash } from "node:crypto";
import { z } from "zod";
import { BankingReadError } from "../../application/errors.js";
import {
  AccountSchema,
  HoldingSchema,
  PortfolioSummarySchema,
  TransactionSchema,
  maskAccountNumber,
  type Account,
  type Holding,
  type Money,
  type PortfolioSummary,
  type Transaction,
} from "../../domain/banking.js";

export const RawPortfolioSummarySchema = z
  .object({
    asOf: z.string(),
    displayCurrency: z.string(),
    netPosition: z.string(),
    loans: z.string(),
    unclearedFunds: z.string(),
    liens: z.string(),
    nonCash: z.string(),
    availableBalance: z.string(),
  })
  .strict();

export const RawAccountsSchema = z
  .object({
    accounts: z.array(
      z
        .object({
          accountNumber: z.string(),
          institution: z.string(),
          displayName: z.string(),
          type: z.enum(["equity", "savings", "checking"]),
          productName: z.string(),
          currency: z.string(),
          currentBalance: z.string(),
          availableBalance: z.string(),
          status: z.enum(["active", "closed", "unknown"]).default("unknown"),
        })
        .strict(),
    ),
  })
  .strict();

export const RawHoldingsSchema = z
  .object({
    holdings: z.array(
      z
        .object({
          accountNumber: z.string(),
          name: z.string(),
          symbol: z.string().optional(),
          quantity: z.string().optional(),
          currency: z.string(),
          marketValue: z.string(),
          availableValue: z.string().optional(),
        })
        .strict(),
    ),
  })
  .strict();

export const RawTransactionsSchema = z
  .object({
    transactions: z.array(
      z
        .object({
          accountNumber: z.string(),
          bookedAt: z.string(),
          description: z.string(),
          amount: z.string(),
          currency: z.string(),
          direction: z.enum(["credit", "debit"]),
          status: z.enum(["posted", "pending"]).default("posted"),
          runningBalance: z.string().optional(),
        })
        .strict(),
    ),
    hasMore: z.boolean().default(false),
  })
  .strict();

type RawPortfolioSummary = z.infer<typeof RawPortfolioSummarySchema>;
export type RawAccount = z.infer<typeof RawAccountsSchema>["accounts"][number];
type RawHolding = z.infer<typeof RawHoldingsSchema>["holdings"][number];
type RawTransaction = z.infer<typeof RawTransactionsSchema>["transactions"][number];

export function mapPortfolioSummary(raw: RawPortfolioSummary): PortfolioSummary {
  try {
    const currency = normalizeCurrency(raw.displayCurrency);
    return PortfolioSummarySchema.parse({
      asOf: normalizeDateTime(raw.asOf),
      displayCurrency: currency,
      netPosition: parseMoney(raw.netPosition, currency),
      loans: parseMoney(raw.loans, currency),
      unclearedFunds: parseMoney(raw.unclearedFunds, currency),
      liens: parseMoney(raw.liens, currency),
      nonCash: parseMoney(raw.nonCash, currency),
      availableBalance: parseMoney(raw.availableBalance, currency),
    });
  } catch {
    throw upstreamChanged();
  }
}

export function mapAccount(raw: RawAccount): Account {
  try {
    const maskedNumber = maskAccountNumber(raw.accountNumber);
    const currency = normalizeCurrency(raw.currency);
    return AccountSchema.parse({
      id: accountId(raw.type, maskedNumber),
      institution: raw.institution.trim(),
      displayName: raw.displayName.trim(),
      maskedNumber,
      type: raw.type,
      productName: raw.productName.trim(),
      currency,
      currentBalance: parseMoney(raw.currentBalance, currency),
      availableBalance: parseMoney(raw.availableBalance, currency),
      status: raw.status,
    });
  } catch {
    throw upstreamChanged();
  }
}

export function mapHolding(raw: RawHolding, accounts: readonly Account[]): Holding {
  try {
    const maskedNumber = maskAccountNumber(raw.accountNumber);
    const account = accounts.find(({ maskedNumber: candidate }) => candidate === maskedNumber);
    if (account === undefined) {
      throw upstreamChanged();
    }

    const currency = normalizeCurrency(raw.currency);
    return HoldingSchema.parse({
      id: stableId("holding", `${account.id}|${raw.name}|${raw.symbol ?? ""}`),
      accountId: account.id,
      name: raw.name.trim(),
      ...(raw.symbol === undefined ? {} : { symbol: raw.symbol.trim() }),
      ...(raw.quantity === undefined ? {} : { quantity: normalizeDecimal(raw.quantity) }),
      marketValue: parseMoney(raw.marketValue, currency),
      ...(raw.availableValue === undefined
        ? {}
        : { availableValue: parseMoney(raw.availableValue, currency) }),
    });
  } catch (error) {
    if (error instanceof BankingReadError) {
      throw error;
    }
    throw upstreamChanged();
  }
}

export function mapTransaction(raw: RawTransaction, accounts: readonly Account[]): Transaction {
  try {
    const maskedNumber = maskAccountNumber(raw.accountNumber);
    const account = accounts.find(({ maskedNumber: candidate }) => candidate === maskedNumber);
    if (account === undefined) {
      throw upstreamChanged();
    }

    const currency = normalizeCurrency(raw.currency);
    return TransactionSchema.parse({
      id: stableId("txn", `${account.id}|${raw.bookedAt}|${raw.description}|${raw.amount}`),
      accountId: account.id,
      bookedAt: normalizeDateTime(raw.bookedAt),
      description: raw.description.trim(),
      amount: parseMoney(raw.amount, currency, raw.direction),
      direction: raw.direction,
      status: raw.status,
      ...(raw.runningBalance === undefined
        ? {}
        : { runningBalance: parseMoney(raw.runningBalance, currency) }),
    });
  } catch (error) {
    if (error instanceof BankingReadError) {
      throw error;
    }
    throw upstreamChanged();
  }
}

export function accountId(type: RawAccount["type"], maskedNumber: string): string {
  return `acct_${type}_${maskedNumber.slice(-4)}`;
}

function parseMoney(raw: string, fallbackCurrency: string, direction?: "credit" | "debit"): Money {
  const compact = raw.trim();
  const currency = currencyFromMoneyText(compact) ?? fallbackCurrency;
  const negativeByParentheses = compact.includes("(") && compact.includes(")");
  const numeric = normalizeDecimal(compact);
  const unsigned = numeric.replace(/^-/, "");
  const shouldBeNegative = direction === "debit" || negativeByParentheses || numeric.startsWith("-");
  return { currency, value: shouldBeNegative && unsigned !== "0" ? `-${unsigned}` : unsigned };
}

function normalizeDecimal(raw: string): string {
  const cleaned = raw.replace(/[^\d.-]/g, "");
  if (!/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(cleaned)) {
    throw upstreamChanged();
  }
  return cleaned;
}

function normalizeCurrency(raw: string): string {
  const compact = raw.toUpperCase().replace(/[^A-Z$]/g, "");
  if (["JMD", "JA$", "JAS"].includes(compact)) {
    return "JMD";
  }
  if (["USD", "US$"].includes(compact)) {
    return "USD";
  }
  if (/^[A-Z]{3}$/.test(compact)) {
    return compact;
  }
  throw upstreamChanged();
}

function currencyFromMoneyText(raw: string): string | undefined {
  if (/\bUSD\b|US\$/i.test(raw)) {
    return "USD";
  }
  if (/\bJMD\b|JA\$|JA\s/i.test(raw)) {
    return "JMD";
  }
  return undefined;
}

function normalizeDateTime(raw: string): string {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00.000Z` : raw;
  const parsed = new Date(dateOnly);
  if (Number.isNaN(parsed.valueOf())) {
    throw upstreamChanged();
  }
  return parsed.toISOString();
}

function stableId(prefix: "holding" | "txn", value: string): string {
  return `${prefix}_${createHash("sha256").update(value).digest("hex").slice(0, 16)}`;
}

function upstreamChanged(): BankingReadError {
  return new BankingReadError(
    "UPSTREAM_CHANGED",
    "The banking portal returned an unexpected read-only data shape",
  );
}
