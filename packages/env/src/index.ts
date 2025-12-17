import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const serverSchema = {
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  API_GATEWAY_PORT: z.coerce.number().default(3000),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),
  JWT_PRIVATE_KEY: z.string().min(1),
  JWT_PUBLIC_KEY: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  AUTH_SERVICE_URL: z.string().url().optional(),
  AUTH_SERVICE_PORT: z.coerce.number().default(3001),
  RABBITMQ_URL: z.string().url().optional(),
} as const;

const clientSchema = {
  VITE_API_URL: z.string().url(),
} as const;

export const serverEnv = createEnv({
  server: serverSchema,
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    API_GATEWAY_PORT: process.env.API_GATEWAY_PORT,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,
    JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
    AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL,
    AUTH_SERVICE_PORT: process.env.AUTH_SERVICE_PORT,
    RABBITMQ_URL: process.env.RABBITMQ_URL,
  },
  emptyStringAsUndefined: true,
});

export const createClientEnv = (
  runtimeEnv: Record<string, string | number | boolean | undefined>,
) =>
  createEnv({
    clientPrefix: "VITE_",
    client: clientSchema,
    runtimeEnv,
    emptyStringAsUndefined: true,
  });
