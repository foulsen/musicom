import { createApp } from "vue";

import App from "./App.vue";

import { setupPinia } from "@/app/create-pinia";
import { router } from "@/router";
import { i18n } from "@/i18n";
import { startSync } from "@/modules/shared/application/sync";

import "@fontsource-variable/cascadia-code/index.css";
import "./style.css"

const app = createApp(App);

const pinia = setupPinia();

app.use(pinia);
app.use(router);
app.use(i18n);

app.mount("#app");

// Local-first: the app is already usable; sync runs in the background and
// degrades gracefully when the API is unreachable.
void startSync(pinia);
