import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/modules/scale-explorer/pages/ScaleExplorerPage.vue"),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
