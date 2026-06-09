import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Only enable in production — avoids noise during local development
  enabled: process.env.NODE_ENV === "production",

  // Capture 10% of transactions for performance tracing
  tracesSampleRate: 0.1,

  // Capture 100% of replays when an error occurs; 1% otherwise
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.01,
});
