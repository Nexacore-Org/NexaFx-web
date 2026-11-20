import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("../../i18n/actions", () => ({ setLocale: vi.fn(async () => {}) }));
import LanguageSelect from "./language-select";

describe("LanguageSelect", () => {
  it("shows the saved confirmation once setLocale resolves", async () => {
    render(<LanguageSelect current="en" />);
    const select = screen.getByLabelText("label") as HTMLSelectElement;
    const next = Array.from(select.options).find((o) => o.value !== "en")!.value;
    fireEvent.change(select, { target: { value: next } });
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("saved"));
    expect(screen.getAllByText("description")).toHaveLength(1);
  });
});
