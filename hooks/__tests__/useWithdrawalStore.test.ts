import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";

beforeEach(() => {
  useWithdrawalStore.getState().reset();
});

describe("useWithdrawalStore", () => {
  describe("initial state", () => {
    it("starts with step 'select' and isOpen false", () => {
      const state = useWithdrawalStore.getState();
      expect(state.step).toBe("select");
      expect(state.isOpen).toBe(false);
      expect(state.currency).toBe("USDC");
      expect(state.amount).toBe("");
      expect(state.walletAddress).toBe("");
      expect(state.transactionId).toBeNull();
      expect(state.transactionStatus).toBeNull();
      expect(state.errorMessage).toBeNull();
    });
  });

  describe("open/close", () => {
    it("opens the modal and resets step to select", () => {
      const { open } = useWithdrawalStore.getState();
      open();
      const state = useWithdrawalStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.step).toBe("select");
    });

    it("closes the modal", () => {
      const { open, close } = useWithdrawalStore.getState();
      open();
      close();
      expect(useWithdrawalStore.getState().isOpen).toBe(false);
    });
  });

  describe("step transitions", () => {
    it("transitions through all valid steps", () => {
      const { setStep } = useWithdrawalStore.getState();
      
      setStep("form");
      expect(useWithdrawalStore.getState().step).toBe("form");

      setStep("review");
      expect(useWithdrawalStore.getState().step).toBe("review");

      setStep("processing");
      expect(useWithdrawalStore.getState().step).toBe("processing");

      setStep("success");
      expect(useWithdrawalStore.getState().step).toBe("success");
    });

    it("can transition to error from processing", () => {
      const { setStep } = useWithdrawalStore.getState();
      setStep("error");
      expect(useWithdrawalStore.getState().step).toBe("error");
    });
  });

  describe("form data", () => {
    it("sets form data partially", () => {
      const { setFormData } = useWithdrawalStore.getState();
      setFormData({ amount: "100" });
      expect(useWithdrawalStore.getState().amount).toBe("100");
      expect(useWithdrawalStore.getState().currency).toBe("USDC");
    });

    it("sets multiple form fields at once", () => {
      const { setFormData } = useWithdrawalStore.getState();
      setFormData({ amount: "50", walletAddress: "0x123" });
      const state = useWithdrawalStore.getState();
      expect(state.amount).toBe("50");
      expect(state.walletAddress).toBe("0x123");
    });
  });

  describe("transaction result", () => {
    it("sets transaction result with success", () => {
      const { setTransactionResult } = useWithdrawalStore.getState();
      setTransactionResult("tx-123", "success");
      const state = useWithdrawalStore.getState();
      expect(state.transactionId).toBe("tx-123");
      expect(state.transactionStatus).toBe("success");
      expect(state.errorMessage).toBeNull();
    });

    it("sets transaction result with error", () => {
      const { setTransactionResult } = useWithdrawalStore.getState();
      setTransactionResult(null, "failed", "Something went wrong");
      const state = useWithdrawalStore.getState();
      expect(state.transactionId).toBeNull();
      expect(state.transactionStatus).toBe("failed");
      expect(state.errorMessage).toBe("Something went wrong");
    });
  });

  describe("reset", () => {
    it("resets all state to initial values", () => {
      const store = useWithdrawalStore.getState();
      store.open();
      store.setStep("review");
      store.setFormData({ amount: "100", walletAddress: "0x123" });
      store.setTransactionResult("tx-1", "success");
      
      store.reset();
      
      const state = useWithdrawalStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.step).toBe("select");
      expect(state.amount).toBe("");
      expect(state.walletAddress).toBe("");
      expect(state.transactionId).toBeNull();
      expect(state.transactionStatus).toBeNull();
      expect(state.errorMessage).toBeNull();
    });

    it("resets correctly when modal is reopened", () => {
      const store = useWithdrawalStore.getState();
      store.open();
      store.setStep("form");
      store.setFormData({ amount: "200" });
      store.close();
      store.reset();
      store.open();
      
      const state = useWithdrawalStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.step).toBe("select");
      expect(state.amount).toBe("");
    });
  });
});
