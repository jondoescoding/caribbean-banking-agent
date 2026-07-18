import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { StreamableHTTPServerTransportOptions } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import helmet from "helmet";
import { z } from "zod";
import type { BankingReadService } from "../../application/banking-read-service.js";
import { AccountIdSchema, HoldingsQuerySchema, TransactionsQuerySchema } from "../../domain/banking.js";
import { toPublicError } from "../errors.js";
import { createBankingMcpServer } from "../mcp/create-mcp-server.js";

const HoldingsHttpQuerySchema = z.object({
  accountId: AccountIdSchema.optional(),
});

const TransactionsHttpQuerySchema = z.object({
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export function createApp(service: BankingReadService, mode: "fixture" | "live") {
  const app = createMcpExpressApp({ host: "127.0.0.1" });
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(express.json({ limit: "32kb", strict: true }));

  app.get("/health", (_request, response) => {
    response.json({ status: "ok", mode, access: "read-only" });
  });

  app.get("/api/v1/portfolio", async (_request, response) => {
    response.json(await service.getPortfolioSummary());
  });

  app.get("/api/v1/accounts", async (_request, response) => {
    response.json(await service.listAccounts());
  });

  app.get("/api/v1/holdings", async (request, response) => {
    const query = HoldingsQuerySchema.parse(HoldingsHttpQuerySchema.parse(request.query));
    response.json(await service.listHoldings(query));
  });

  app.get("/api/v1/accounts/:accountId/transactions", async (request, response) => {
    const accountId = AccountIdSchema.parse(request.params.accountId);
    const query = TransactionsQuerySchema.parse({
      accountId,
      ...TransactionsHttpQuerySchema.parse(request.query),
    });
    response.json(await service.listTransactions(query));
  });

  app.post("/mcp", async (request, response) => {
    const server = createBankingMcpServer(service);
    // The SDK documents `undefined` as its stateless-mode switch, but its current
    // declaration omits `undefined` when exact optional properties are enabled.
    const transportOptions = {
      sessionIdGenerator: undefined,
    } as unknown as StreamableHTTPServerTransportOptions;
    const transport = new StreamableHTTPServerTransport(transportOptions);

    try {
      await server.connect(transport as unknown as Transport);
      await transport.handleRequest(request, response, request.body);
    } catch {
      if (!response.headersSent) {
        response.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    } finally {
      response.on("close", () => {
        void transport.close();
        void server.close();
      });
    }
  });

  const methodNotAllowed = (_request: Request, response: Response) => {
    response.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed" },
      id: null,
    });
  };
  app.get("/mcp", methodNotAllowed);
  app.delete("/mcp", methodNotAllowed);

  app.use((_request, response) => {
    response.status(404).json({
      error: { code: "NOT_FOUND", message: "The requested route was not found." },
    });
  });

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    const publicError = toPublicError(error);
    response.status(publicError.status).json({
      error: { code: publicError.code, message: publicError.message },
    });
  });

  return app;
}
