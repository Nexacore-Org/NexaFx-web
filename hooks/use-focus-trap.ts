import { useEffect, useRef } from "react";

/**
 * Hook to manage focus trap for modals and dialogs
 * - Traps focus inside the modal while it's open
 * - Restores focus to the trigger element when the modal is closed
 * - Supports Escape key to close the modal
 *
 * A modal must call this hook exactly once (passing a single container that
 * wraps every dialog element). Calling it once per rendered dialog attaches
 * multiple competing document-level keydown listeners, which double-handles
 * every key press while the modal is open.
 */

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function isVisibleElement(el: HTMLElement): boolean {
  const doc = el.ownerDocument;
  let node: HTMLElement | null = el;
  while (node && node.nodeType === Node.ELEMENT_NODE) {
    const style = doc.defaultView?.getComputedStyle(node);
    if (!style || style.display === "none" || style.visibility === "hidden") {
      return false;
    }
    node = node.parentElement;
  }
  return true;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const nodes = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  return Array.from(nodes).filter(isVisibleElement);
}

export function useFocusTrap(
  isOpen: boolean,
  onClose: () => void,
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Store the element that had focus before the modal opened
    triggerRef.current = document.activeElement as HTMLElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Close modal on Escape key
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      // Tab key focus trap
      if (event.key === "Tab" && containerRef.current) {
        const focusableElements = getFocusableElements(containerRef.current);

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement as HTMLElement;

        if (event.shiftKey) {
          // Shift + Tab: move focus backward
          if (activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: move focus forward
          if (activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    // Add event listener for keyboard handling
    document.addEventListener("keydown", handleKeyDown);

    // Focus the first focusable element in the modal
    if (containerRef.current) {
      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      // Restore focus to the trigger element when modal closes
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, onClose, containerRef]);
}
