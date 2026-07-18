import { describe, expect, it } from "vitest";
import request from "supertest";
import { FixtureBankingReadAdapter } from "../../src/adapters/fixtures/fixture-banking-read-adapter.js";
import { BankingReadService } from "../../src/application/banking-read-service.js";
import { createApp } from "../../src/delivery/http/create-app.js";

const service = new BankingReadService(new FixtureBankingReadAdapter());
const app = createApp(service, "fixture");

describe("REST read-only surface", () => {
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
});
