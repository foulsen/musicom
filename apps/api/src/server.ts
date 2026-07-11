import type { FastifyServerOptions } from "fastify";

import { buildApp } from "./app";
import { config } from "./config";

/** JSON logs in production; human-readable (pino-pretty) in dev. */
const logger: FastifyServerOptions["logger"] = config.isProduction
  ? { level: config.logLevel }
  : {
      level: config.logLevel,
      transport: {
        target: "pino-pretty",
        options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" },
      },
    };

const app = await buildApp({ logger });

app.listen({ port: config.port, host: config.host }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
