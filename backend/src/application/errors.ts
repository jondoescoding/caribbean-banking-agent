export type BankingReadErrorCode =
  | "ACCOUNT_NOT_FOUND"
  | "AUTHENTICATION_REQUIRED"
  | "LIVE_ACCESS_DISABLED"
  | "SESSION_EXPIRED"
  | "UPSTREAM_CHANGED"
  | "UPSTREAM_UNAVAILABLE";

export class BankingReadError extends Error {
  public constructor(
    public readonly code: BankingReadErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "BankingReadError";
  }
}
