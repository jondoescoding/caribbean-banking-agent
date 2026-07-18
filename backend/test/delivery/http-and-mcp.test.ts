import { describe, expect, it } from "vitest";
import request from "supertest";
import { FixtureBankingReadAdapter } from "../../src/adapters/fixtures/fixture-banking-read-adapter.js";
import { BankingReadService } from "../../src/application/banking-read-service.js";
import { createApp } from "../../src/delivery/http/create-app.js";

const service = new BankingReadService(new FixtureBankingReadAdapter());
const app = createApp(service, "fixture");

function parseMcpResponse(response: request.Response): Record<string, any> {
  if (response.body !== undefined && Object.keys(response.body).length > 0) {
    return response.body as Record<string, any>;
  }

  const dataLine = response.text
    .split(/\r?\n/)
    .find((line) => line.startsWith("data: "));
  if (dataLine === undefined) {
    throw new Error("MCP response did not contain a JSON or SSE data payload");
  }
  return JSON.parse(dataLine.slice("data: ".length)) as Record<string, any>;
}

describe("HTTP and MCP read-only surface", () => {
  it("reports fixture and read-only mode", async () => {
    const response = await request(app).get("/health").expect(200);
    expect(response.body).toEqual({
      status: "ok",
      mode: "fixture",
      access: "read-only",
    });
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  it("returns only masked account numbers", async () => {
    const response = await request(app).get("/api/v1/accounts").expect(200);
    for (const account of response.body.accounts as Array<{ maskedNumber: string }>) {
      expect(account.maskedNumber).toMatch(/^\*{4}\d{4}$/);
    }
  });

  it("rejects invalid transaction input without reflecting it", async () => {
    const response = await request(app)
      .get("/api/v1/accounts/not-an-account/transactions?limit=1000")
      .expect(400);
    expect(response.body).toEqual({
      error: {
        code: "INVALID_REQUEST",
        message: "The request parameters are invalid.",
      },
    });
  });

  it("does not expose mutation routes", async () => {
    await request(app).post("/api/v1/transfers").send({ amount: "1.00" }).expect(404);
    await request(app).post("/api/v1/trades").send({ symbol: "DEMO" }).expect(404);
  });

  it("advertises exactly four tools and marks all of them read-only", async () => {
    const initialize = await request(app)
      .post("/mcp")
      .set("accept", "application/json, text/event-stream")
      .send({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-06-18",
          capabilities: {},
          clientInfo: { name: "integration-test", version: "1.0.0" },
        },
      })
      .expect(200);

    expect(parseMcpResponse(initialize).result.serverInfo.name).toBe(
      "caribbean-banking-agent",
    );

    const listed = await request(app)
      .post("/mcp")
      .set("accept", "application/json, text/event-stream")
      .send({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} })
      .expect(200);

    const tools = parseMcpResponse(listed).result.tools as Array<{
      name: string;
      annotations: { readOnlyHint: boolean; destructiveHint: boolean };
    }>;
    expect(tools.map(({ name }) => name).sort()).toEqual([
      "get_portfolio_summary",
      "list_accounts",
      "list_holdings",
      "list_transactions",
    ]);
    expect(tools.every(({ annotations }) => annotations.readOnlyHint)).toBe(true);
    expect(tools.every(({ annotations }) => !annotations.destructiveHint)).toBe(true);

    const called = await request(app)
      .post("/mcp")
      .set("accept", "application/json, text/event-stream")
      .send({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: { name: "list_accounts", arguments: {} },
      })
      .expect(200);
    const result = parseMcpResponse(called).result as {
      structuredContent: { accounts: Array<{ maskedNumber: string }> };
    };
    expect(
      result.structuredContent.accounts.every(({ maskedNumber }) =>
        /^\*{4}\d{4}$/.test(maskedNumber),
      ),
    ).toBe(true);
  });
});
