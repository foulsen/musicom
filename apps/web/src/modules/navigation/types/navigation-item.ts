import type { Component } from "vue";

export interface NavigationItem {
  /** Chave de tradução do rótulo (ex.: "nav.scaleExplorer"). */
  titleKey: string;
  to: string;
  icon: Component;
}