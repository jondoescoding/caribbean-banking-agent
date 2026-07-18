import { ZodError } from "zod";
import { BankingReadError } from "../application/errors.js";

export type PublicError = {
  status: number;
  code: string;
  message: string;
};

export function toPublicError(error: unknown): PublicError {
  if (error instanceof ZodError) {
    return {
      status: 400,
      code: "INVALID_REQUEST",
      message: "The request parameters are invalid.",
    };
  }

  if (error instanceof BankingReadError) {
    const status = error.code === "ACCOUNT_NOT_FOUND" ? 404 : 503;
    return {
      status,
      code: error.code,
      message:
        status === 404
          ? "The requested account was not found."
          : "Banking data is temporarily unavailable.",
    };
  }

  return {
    status: 500,
    code: "INTERNAL_ERROR",
    message: "The request could not be completed.",
  };
}
