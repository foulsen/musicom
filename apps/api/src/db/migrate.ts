import { config } from "../config";
import { createDb } from "./client";

/** Deploy-time migration runner — applies pending migrations and exits. */
const { close } = await createDb(config.databaseUrl, config.databaseAuthToken, { migrate: true });
console.log("migrations applied");
close();
