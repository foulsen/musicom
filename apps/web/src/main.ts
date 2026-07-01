import { createApp } from "vue";

import App from "./App.vue";

import { setupPinia } from "@/app/create-pinia";
import { router } from "@/router";

import "@fontsource-variable/cascadia-code/index.css";
import "./style.css"

const app = createApp(App);

app.use(setupPinia());
app.use(router);

app.mount("#app");
