import { z } from "zod";

export const DecimalStringSchema = z
  .string()
  .regex(/^-?(?:0|[1-9]\d*)(?:\.\d{1,8})?$/, "Expected a base-10 decimal string");

export const CurrencyCodeSchema = z
  .string()
  .regex(/^[A-Z]{3}$/, "Expected an ISO-style three-letter currency code");

export const MoneySchema = z
  .object({
    currency: CurrencyCodeSchema,
    value: DecimalStringSchema,
  })
  .strict();

export const AccountIdSchema = z
  .string()
  .regex(/^acct_[a-z0-9][a-z0-9_-]*$/, "Expected a stable application account reference");

export const MaskedAccountNumberSchema = z
  .string()
  .regex(/^\*{4}\d{4}$/, "Expected an account number masked as ****1234");

export const PortfolioSummarySchema = z
  .object({
    asOf: z.string().datetime({ offset: true }),
    displayCurrency: CurrencyCodeSchema,
    netPosition: MoneySchema,
    loans: MoneySchema,
    unclearedFunds: MoneySchema,
    liens: MoneySchema,
    nonCash: MoneySchema,
    availableBalance: MoneySchema,
  })
  .strict();

export const AccountTypeSchema = z.enum(["equity", "savings", "checking"]);

export const AccountSchema = z
  .object({
    id: AccountIdSchema,
    institution: z.string().min(1).max(120),
    displayName: z.string().min(1).max(160),
    maskedNumber: MaskedAccountNumberSchema,
    type: AccountTypeSchema,
    productName: z.string().min(1).max(160),
    currency: CurrencyCodeSchema,
    currentBalance: MoneySchema,
    availableBalance: MoneySchema,
    status: z.enum(["active", "closed", "unknown"]),
  })
  .strict();

export const HoldingSchema = z
  .object({
    id: z.string().regex(/^holding_[a-z0-9][a-z0-9_-]*$/),
    accountId: AccountIdSchema,
    name: z.string().min(1).max(200),
    symbol: z.string().min(1).max(32).optional(),
    quantity: DecimalStringSchema.optional(),
    marketValue: MoneySchema,
    availableValue: MoneySchema.optional(),
  })
  .strict();

export const TransactionSchema = z
  .object({
    id: z.string().regex(/^txn_[a-z0-9][a-z0-9_-]*$/),
    accountId: AccountIdSchema,
    bookedAt: z.string().datetime({ offset: true }),
    description: z.string().min(1).max(500),
    amount: MoneySchema,
    direction: z.enum(["credit", "debit"]),
    status: z.enum(["posted", "pending"]),
    runningBalance: MoneySchema.optional(),
  })
  .strict();

export const HoldingsQuerySchema = z
  .object({
    accountId: AccountIdSchema.optional(),
  })
  .strict();

export const TransactionsQuerySchema = z
  .object({
    accountId: AccountIdSchema,
    from: z.string().date().optional(),
    to: z.string().date().optional(),
    limit: z.number().int().min(1).max(100).default(25),
  })
  .strict()
  .refine(
    ({ from, to }) => from === undefined || to === undefined || from <= to,
    { message: "from must be on or before to", path: ["from"] },
  );

export const AccountsResultSchema = z
  .object({
    accounts: z.array(AccountSchema),
  })
  .strict();

export const HoldingsResultSchema = z
  .object({
    holdings: z.array(HoldingSchema),
  })
  .strict();

export const TransactionsResultSchema = z
  .object({
    transactions: z.array(TransactionSchema),
    hasMore: z.boolean(),
  })
  .strict();

export type Money = z.infer<typeof MoneySchema>;
export type PortfolioSummary = z.infer<typeof PortfolioSummarySchema>;
export type Account = z.infer<typeof AccountSchema>;
export type Holding = z.infer<typeof HoldingSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type HoldingsQuery = z.input<typeof HoldingsQuerySchema>;
export type TransactionsQuery = z.input<typeof TransactionsQuerySchema>;
export type ParsedTransactionsQuery = z.output<typeof TransactionsQuerySchema>;
export type AccountsResult = z.infer<typeof AccountsResultSchema>;
export type HoldingsResult = z.infer<typeof HoldingsResultSchema>;
export type TransactionsResult = z.infer<typeof TransactionsResultSchema>;

export function maskAccountNumber(rawAccountNumber: string): string {
  const digits = rawAccountNumber.replace(/\D/g, "");
  if (digits.length < 4) {
    throw new BankingValidationError("Account identifiers need at least four digits");
  }

  return `****${digits.slice(-4)}`;
}

export class BankingValidationError extends Error {
  public readonly code = "BANKING_VALIDATION_FAILED";

  public constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "BankingValidationError";
  }
}
