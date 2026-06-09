import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  enabled: process.env.NODE_ENV === "production",

  // Capture all server-side errors; low sample for performance to keep quota
  tracesSampleRate: 0.1,
});
