import { onMounted, onUnmounted } from "vue";

const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/** True when the event target is a text field (native input or contenteditable). */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  return TYPING_TAGS.has(target.tagName) || target.isContentEditable;
}

/**
 * Registers a `window` keydown handler that's a no-op while focus is in a text field —
 * quiz shortcuts (1-4, R, Enter) shouldn't fire while the user types in a dialog input
 * that happens to be open over the page (e.g. Settings' name field).
 */
export function useTypingGuardedKeydown(handler: (event: KeyboardEvent) => void) {
  function onKeydown(event: KeyboardEvent) {
    if (isTypingTarget(event.target)) return;

    handler(event);
  }

  onMounted(() => window.addEventListener("keydown", onKeydown));
  onUnmounted(() => window.removeEventListener("keydown", onKeydown));
}
