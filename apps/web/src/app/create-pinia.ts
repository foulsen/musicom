import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";

export function setupPinia() {
  const pinia = createPinia();

  pinia.use(createPersistedState({ storage: localStorage }));

  return pinia;
}
