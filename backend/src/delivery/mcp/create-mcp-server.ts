import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { BankingReadService } from "../../application/banking-read-service.js";
import {
  AccountsResultSchema,
  AccountIdSchema,
  HoldingsResultSchema,
  PortfolioSummarySchema,
  TransactionsResultSchema,
} from "../../domain/banking.js";
import { toPublicError } from "../errors.js";

const readOnlyAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

function success<T extends Record<string, unknown>>(data: T) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data) }],
    structuredContent: data,
  };
}

function failure(error: unknown) {
  const publicError = toPublicError(error);
  return {
    isError: true as const,
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          error: { code: publicError.code, message: publicError.message },
        }),
      },
    ],
  };
}

export function createBankingMcpServer(service: BankingReadService): McpServer {
  const server = new McpServer(
    { name: "caribbean-banking-agent", version: "0.1.0" },
    {
      instructions:
        "This server provides read-only banking data. Never imply that it can transfer money, trade, pay bills, or modify an account. Use list_accounts before account-specific tools when the account reference is unknown. Display masked account numbers only.",
    },
  );

  server.registerTool(
    "get_portfolio_summary",
    {
      title: "Get portfolio summary",
      description:
        "Return the authenticated user's aggregate balances and available position.",
      inputSchema: {},
      outputSchema: PortfolioSummarySchema.shape,
      annotations: readOnlyAnnotations,
    },
    async () => {
      try {
        return success(await service.getPortfolioSummary());
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "list_accounts",
    {
      title: "List accounts",
      description:
        "List accounts with stable references, masked numbers, products, and balances.",
      inputSchema: {},
      outputSchema: AccountsResultSchema.shape,
      annotations: readOnlyAnnotations,
    },
    async () => {
      try {
        return success(await service.listAccounts());
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "list_holdings",
    {
      title: "List holdings",
      description:
        "List investment holdings, optionally filtered by a stable account reference.",
      inputSchema: {
        accountId: AccountIdSchema.optional().describe(
          "Stable account reference returned by list_accounts",
        ),
      },
      outputSchema: HoldingsResultSchema.shape,
      annotations: readOnlyAnnotations,
    },
    async ({ accountId }) => {
      try {
        return success(
          await service.listHoldings(accountId === undefined ? {} : { accountId }),
        );
      } catch (error) {
        return failure(error);
      }
    },
  );

  server.registerTool(
    "list_transactions",
    {
      title: "List transactions",
      description:
        "List recent transactions for one account, with optional date bounds and a maximum result count.",
      inputSchema: {
        accountId: AccountIdSchema.describe(
          "Stable account reference returned by list_accounts",
        ),
        from: z.string().date().optional().describe("Inclusive start date in YYYY-MM-DD"),
        to: z.string().date().optional().describe("Inclusive end date in YYYY-MM-DD"),
        limit: z.number().int().min(1).max(100).default(25),
      },
      outputSchema: TransactionsResultSchema.shape,
      annotations: readOnlyAnnotations,
    },
    async ({ accountId, from, to, limit }) => {
      try {
        return success(
          await service.listTransactions({
            accountId,
            limit,
            ...(from === undefined ? {} : { from }),
            ...(to === undefined ? {} : { to }),
          }),
        );
      } catch (error) {
        return failure(error);
      }
    },
  );

  return server;
}
