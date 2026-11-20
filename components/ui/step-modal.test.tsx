import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import StepModal from "./step-modal";

const steps = [
  { id: "a", title: "A", content: <p>A</p> },
  { id: "b", title: "B", content: <p>B</p> },
];

describe("StepModal canAdvance", () => {
  it("disables Next when the step cannot advance", () => {
    render(<StepModal open title="T" steps={steps} onClose={() => {}} canAdvance={false} />);
    expect((screen.getByRole("button", { name: "Next" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("disables Finish until allowed", () => {
    render(<StepModal open title="T" steps={steps} currentStepIndex={1} onClose={() => {}} onFinish={() => {}} canAdvance={false} />);
    expect((screen.getByRole("button", { name: "Done" }) as HTMLButtonElement).disabled).toBe(true);
  });
});
