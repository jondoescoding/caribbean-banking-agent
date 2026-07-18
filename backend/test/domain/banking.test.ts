import { describe, expect, it } from "vitest";
import {
  MoneySchema,
  TransactionsQuerySchema,
  maskAccountNumber,
} from "../../src/domain/banking.js";

describe("banking domain contracts", () => {
  it("keeps decimal amounts as strings", () => {
    expect(MoneySchema.parse({ currency: "JMD", value: "1234.56" })).toEqual({
      currency: "JMD",
      value: "1234.56",
    });

    expect(() => MoneySchema.parse({ currency: "JMD", value: 1234.56 })).toThrow();
  });

  it("masks all but the last four account-number digits", () => {
    expect(maskAccountNumber("000-123-4567")).toBe("****4567");
    expect(() => maskAccountNumber("12")).toThrow();
  });

  it("bounds transaction queries and applies a safe default limit", () => {
    expect(
      TransactionsQuerySchema.parse({ accountId: "acct_checking_demo" }),
    ).toEqual({ accountId: "acct_checking_demo", limit: 25 });

    expect(() =>
      TransactionsQuerySchema.parse({
        accountId: "acct_checking_demo",
        from: "2026-07-18",
        to: "2026-07-01",
      }),
    ).toThrow("from must be on or before to");
  });
});
