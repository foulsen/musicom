import type { IncomingMessage, ServerResponse } from "node:http";

import { buildApp } from "../apps/api/src/app";

// Reused across warm invocations of the same instance; built once per cold start.
let appPromise: ReturnType<typeof buildApp> | undefined;

function getApp(): ReturnType<typeof buildApp> {
  appPromise ??= buildApp({ logger: false, migrate: false });
  return appPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const app = await getApp();
  await app.ready();
  app.server.emit("request", req, res);
}
