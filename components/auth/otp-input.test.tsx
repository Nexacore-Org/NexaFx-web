import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { OtpInput } from "./otp-input";

function Harness({
  onComplete,
  cooldownSeconds,
}: {
  onComplete?: (value: string) => void;
  cooldownSeconds?: number;
}) {
  const [value, setValue] = useState("");
  return (
    <OtpInput
      value={value}
      onChange={setValue}
      onComplete={onComplete}
      cooldownSeconds={cooldownSeconds}
    />
  );
}

function digit(index: number) {
  return screen.getByLabelText(`Digit ${index + 1}`) as HTMLInputElement;
}

describe("OtpInput", () => {
  it("types digits across the boxes", () => {
    render(<Harness />);
    fireEvent.change(digit(0), { target: { value: "1" } });
    fireEvent.change(digit(1), { target: { value: "2" } });
    expect(digit(0).value).toBe("1");
    expect(digit(1).value).toBe("2");
  });

  it("spreads a pasted multi-digit value across the boxes", () => {
    render(<Harness />);
    fireEvent.change(digit(0), { target: { value: "123456" } });
    expect(digit(0).value).toBe("1");
    expect(digit(5).value).toBe("6");
  });

  it("fills all boxes on one-time-code autofill", () => {
    const onComplete = jest.fn();
    render(<Harness onComplete={onComplete} />);
    fireEvent.change(digit(0), { target: { value: "654321" } });
    expect(digit(0).value).toBe("6");
    expect(digit(5).value).toBe("1");
    expect(onComplete).toHaveBeenCalledWith("654321");
  });

  it("clears the current box on backspace", () => {
    render(<Harness />);
    fireEvent.change(digit(0), { target: { value: "123456" } });
    fireEvent.keyDown(digit(2), { key: "Backspace" });
    expect(digit(2).value).toBe("");
  });

  it("uses the configured cooldown duration", () => {
    jest.useFakeTimers();
    render(<Harness cooldownSeconds={30} />);
    fireEvent.click(screen.getByRole("button", { name: /resend code/i }));
    expect(screen.getByRole("button", { name: /resend in 30s/i })).toBeDisabled();
    jest.advanceTimersByTime(1000);
    expect(screen.getByRole("button", { name: /resend in 29s/i })).toBeDisabled();
    jest.useRealTimers();
  });
});
