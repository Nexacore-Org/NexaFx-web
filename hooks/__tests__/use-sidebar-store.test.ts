import { describe, it, expect, beforeEach } from "@jest/globals";
import { useSidebarStore } from "@/hooks/use-sidebar-store";

describe("useSidebarStore", () => {
  beforeEach(() => {
    useSidebarStore.setState({ isOpen: false });
  });

  describe("open", () => {
    it("sets isOpen to true", () => {
      useSidebarStore.getState().open();
      expect(useSidebarStore.getState().isOpen).toBe(true);
    });
  });

  describe("close", () => {
    it("sets isOpen to false", () => {
      useSidebarStore.getState().open();
      useSidebarStore.getState().close();
      expect(useSidebarStore.getState().isOpen).toBe(false);
    });
  });

  describe("toggle", () => {
    it("flips isOpen from false to true", () => {
      useSidebarStore.getState().toggle();
      expect(useSidebarStore.getState().isOpen).toBe(true);
    });

    it("flips isOpen from true to false", () => {
      useSidebarStore.getState().open();
      useSidebarStore.getState().toggle();
      expect(useSidebarStore.getState().isOpen).toBe(false);
    });
  });
});