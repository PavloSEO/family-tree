import { serve } from "@hono/node-server";
import { sqlite } from "./db/connection.js";
import { app } from "./index.js";

const port = Number(process.env.PORT ?? 3000);

const server = serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Listening on http://0.0.0.0:${info.port}`);
  },
);

let shuttingDown = false;
let forceExitTimer: ReturnType<typeof setTimeout> | undefined;

function shutdown(signal: string): void {
  if (shuttingDown) {
    console.error(`Received ${signal} again, forcing exit`);
    if (forceExitTimer !== undefined) {
      clearTimeout(forceExitTimer);
      forceExitTimer = undefined;
    }
    try {
      sqlite.close();
    } catch {
      /* ignore */
    }
    process.exit(1);
  }
  shuttingDown = true;
  console.log(`Received ${signal}, closing HTTP server and SQLite…`);

  forceExitTimer = setTimeout(() => {
    forceExitTimer = undefined;
    console.error("Shutdown timeout, forcing exit");
    try {
      sqlite.close();
    } catch {
      /* ignore */
    }
    process.exit(1);
  }, 10_000);
  forceExitTimer.unref();

  server.close((closeErr) => {
    if (forceExitTimer !== undefined) {
      clearTimeout(forceExitTimer);
      forceExitTimer = undefined;
    }
    if (closeErr) {
      console.error(closeErr);
    }
    try {
      sqlite.close();
    } catch (e) {
      console.error(e);
    }
    process.exit(closeErr ? 1 : 0);
  });
}

process.on("SIGINT", () => {
  shutdown("SIGINT");
});
process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});
