import { createRouter, createWebHistory } from "vue-router";

import { i18n } from "@/i18n";

const routes = [
  {
    path: "/",
    component: () => import("@/modules/scale-explorer/pages/ScaleExplorerPage.vue"),
    meta: { titleKey: "scaleExplorer.title" },
  },
  {
    path: "/chords",
    component: () => import("@/modules/chord-explorer/pages/ChordExplorerPage.vue"),
    meta: { titleKey: "chordExplorer.title" },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.afterEach((to) => {
  const titleKey = to.meta.titleKey as string | undefined;
  const pageTitle = titleKey ? i18n.global.t(titleKey) : null;

  document.title = pageTitle ? `${pageTitle} · MUSICOM` : "MUSICOM";
});
