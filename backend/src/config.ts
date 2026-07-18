import { config as loadDotEnv } from "dotenv";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const localEnvPath = fileURLToPath(new URL("../../.env.local", import.meta.url));

const OptionalNonEmptyStringSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const EnvironmentSchema = z
  .object({
    BROWSERBASE_API_KEY: OptionalNonEmptyStringSchema,
    BROWSERBASE_CONTEXT_ID: OptionalNonEmptyStringSchema,
    JMMB_USERNAME: OptionalNonEmptyStringSchema,
    JMMB_PASSWORD: OptionalNonEmptyStringSchema,
    JMMB_LOGIN_URL: z.url().default("https://moneyline.jmmb.com/personal/login.php"),
    JMMB_ACCOUNTS_URL: z.url().default("https://moneyline.jmmb.com/personal/app/accsum/"),
    JMMB_LIVE_ENABLED: z.enum(["true", "false"]).default("false"),
    PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  })
  .passthrough();

type CommonConfig = {
  port: number;
  logLevel: "debug" | "info" | "warn" | "error";
};

export type FixtureAppConfig = CommonConfig & {
  mode: "fixture";
};

export type LiveAppConfig = CommonConfig & {
  mode: "live";
  browserbaseApiKey: string;
  browserbaseContextId?: string;
  jmmbUsername: string;
  jmmbPassword: string;
  jmmbLoginUrl: string;
  jmmbAccountsUrl: string;
};

export type AppConfig = FixtureAppConfig | LiveAppConfig;

export function parseConfig(environment: NodeJS.ProcessEnv): AppConfig {
  const parsed = EnvironmentSchema.parse(environment);
  const common: CommonConfig = {
    port: parsed.PORT,
    logLevel: parsed.LOG_LEVEL,
  };

  if (parsed.JMMB_LIVE_ENABLED === "false") {
    return { ...common, mode: "fixture" };
  }

  const required = z
    .object({
      browserbaseApiKey: z.string().min(1),
      jmmbUsername: z.string().min(1),
      jmmbPassword: z.string().min(1),
    })
    .parse({
      browserbaseApiKey: parsed.BROWSERBASE_API_KEY,
      jmmbUsername: parsed.JMMB_USERNAME,
      jmmbPassword: parsed.JMMB_PASSWORD,
    });

  return {
    ...common,
    mode: "live",
    ...required,
    ...(parsed.BROWSERBASE_CONTEXT_ID === undefined
      ? {}
      : { browserbaseContextId: parsed.BROWSERBASE_CONTEXT_ID }),
    jmmbLoginUrl: parsed.JMMB_LOGIN_URL,
    jmmbAccountsUrl: parsed.JMMB_ACCOUNTS_URL,
  };
}

export function loadConfig(): AppConfig {
  loadDotEnv({ path: localEnvPath, quiet: true });
  return parseConfig(process.env);
}
