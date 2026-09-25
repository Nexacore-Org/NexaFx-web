import { pickField } from "../api/pick-field";

describe("pickField", () => {
  const dto = {
    id: "root-id",
    transaction_id: "snake-id",
    numeric: 42,
    empty: "",
    nil: null,
    data: { id: "nested-id", transactionId: "nested-camel" },
  };

  it("returns the first present key in order", () => {
    expect(pickField(dto, "transactionId", "transaction_id")).toBe("snake-id");
  });

  it("skips camelCase miss and falls through to snake_case", () => {
    expect(pickField(dto, "toCurrency", "to_currency")).toBeUndefined();
  });

  it("falls through null and undefined values", () => {
    expect(pickField(dto, "nil", "id")).toBe("root-id");
    expect(pickField(dto, "missing", "absent")).toBeUndefined();
  });

  it("treats empty strings as present values", () => {
    expect(pickField(dto, "empty", "id")).toBe("");
  });

  it("resolves dotted paths for nested objects", () => {
    expect(pickField(dto, "data.id")).toBe("nested-id");
    expect(pickField(dto, "unknown.field")).toBeUndefined();
  });

  it("reproduces the withdrawal/deposit transactionId fallback chain", () => {
    const nested = { data: { id: "tx-1" } };
    expect(
      pickField(
        nested,
        "transactionId",
        "transaction_id",
        "id",
        "data.id",
        "data.transactionId",
      ),
    ).toBe("tx-1");

    const root = { transactionId: "tx-2", data: { id: "ignored" } };
    expect(
      pickField(
        root,
        "transactionId",
        "transaction_id",
        "id",
        "data.id",
        "data.transactionId",
      ),
    ).toBe("tx-2");
  });

  it("handles null/undefined sources safely", () => {
    expect(pickField(null, "id")).toBeUndefined();
    expect(pickField(undefined, "id")).toBeUndefined();
  });
});
