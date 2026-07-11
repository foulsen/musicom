import type { UserProfile } from "@music-workspace/shared-types";
import { eq } from "drizzle-orm";

import type { Db } from "../../db/client";
import { users } from "../../db/schema";

/** Updates the display name and returns the fresh profile. */
export async function updateName(db: Db, userId: string, name: string): Promise<UserProfile> {
  const row = await db
    .update(users)
    .set({ name })
    .where(eq(users.id, userId))
    .returning({ id: users.id, name: users.name, email: users.email })
    .get();

  return row;
}
