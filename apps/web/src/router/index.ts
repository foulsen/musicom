import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/modules/scale-explorer/pages/ScaleExplorerPage.vue"),
  },
  {
    path: "/chords",
    component: () => import("@/modules/chord-explorer/pages/ChordExplorerPage.vue"),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
