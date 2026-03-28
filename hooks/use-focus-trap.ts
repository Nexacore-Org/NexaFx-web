import { useEffect, useRef } from "react";

/**
 * Hook to manage focus trap for modals and dialogs
 * - Traps focus inside the modal while it's open
 * - Restores focus to the trigger element when the modal is closed
 * - Supports Escape key to close the modal
 */
export function useFocusTrap(
  isOpen: boolean,
  onClose: () => void,
  containerRef: React.RefObject<HTMLDivElement>,
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
        const focusableElements =
          containerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );

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
      const focusableElements =
        containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
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
