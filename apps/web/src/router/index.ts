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
  {
    path: "/modes",
    component: () => import("@/modules/mode-explorer/pages/ModeExplorerPage.vue"),
    meta: { titleKey: "modeExplorer.title" },
  },
  {
    path: "/ear-training",
    component: () => import("@/modules/ear-training/pages/EarTrainingPage.vue"),
    meta: { titleKey: "earTraining.title" },
  },
  {
    path: "/drills",
    component: () => import("@/modules/drills/pages/DrillsPage.vue"),
    meta: { titleKey: "drills.title" },
  },
  {
    path: "/learn",
    component: () => import("@/modules/learn/pages/LearnPage.vue"),
    meta: { titleKey: "learn.title" },
  },
  {
    path: "/learn/:lessonId",
    component: () => import("@/modules/learn/pages/LessonPage.vue"),
    meta: { titleKey: "learn.title" },
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import("@/modules/navigation/pages/NotFoundPage.vue"),
    meta: { titleKey: "common.notFound.title" },
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

  // `<main>` is the scroll container (not window), so the router's own
  // `scrollBehavior` option can't reach it — reset it here instead.
  document.querySelector("main")?.scrollTo(0, 0);
});
