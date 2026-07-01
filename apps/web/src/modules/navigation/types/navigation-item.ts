import type { Component } from "vue";

export interface NavigationItem {
  title: string;
  to: string;
  icon: Component;
}