import type { NextFunction, Request, Response } from "express";
import express from "express";
import helmet from "helmet";
import { z } from "zod";
import type { BankingReadService } from "../../application/banking-read-service.js";
import { AccountIdSchema, HoldingsQuerySchema, TransactionsQuerySchema } from "../../domain/banking.js";
import { toPublicError } from "../errors.js";

const HoldingsHttpQuerySchema = z.object({
  accountId: AccountIdSchema.optional(),
});

const TransactionsHttpQuerySchema = z.object({
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export function createApp(service: BankingReadService, mode: "fixture" | "live") {
  const app = express();
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
