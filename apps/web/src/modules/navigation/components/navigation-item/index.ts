import { cva, type VariantProps } from "class-variance-authority";

export { default as NavigationItem } from "./NavigationItem.vue";

export const navigationItemVariants = cva(
  [
    "flex w-full items-center gap-3 rounded-md border-l-2 border-transparent py-2",
    "text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  ],
  {
    variants: {
      active: {
        true: "border-brand bg-brand/10 text-foreground",
        false:
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      },
      collapsed: {
        true: "justify-center px-0",
        false: "px-3",
      },
    },
    defaultVariants: {
      active: false,
      collapsed: false,
    },
  },
);

export type NavigationItemVariants =
  VariantProps<typeof navigationItemVariants>;