/**
 * Beneficiaries API — saved withdrawal destinations.
 *
 * NOTE: The upstream backend does not yet expose beneficiary endpoints.
 * This module implements the full UI contract and sends requests to the
 * documented paths below. The `BENEFICIARIES_ENABLED` feature flag gates
 * all reads/writes so the app degrades gracefully when the backend is not
 * ready. Remove the flag once the backend ships:
 *
 *   GET    /beneficiaries          — list
 *   POST   /beneficiaries          — create
 *   PUT    /beneficiaries/:id      — update
 *   DELETE /beneficiaries/:id      — delete
 */

import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { validateStellarAddress } from "@/lib/utils/stellar-validation";

// ---------------------------------------------------------------------------
// Feature flag
// ---------------------------------------------------------------------------

export const BENEFICIARIES_ENABLED =
  process.env.NEXT_PUBLIC_BENEFICIARIES_ENABLED === "true";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

/**
 * Reusable Stellar address validator that plugs into zod refinements.
 */
function stellarAddressRefine(val: string) {
  return validateStellarAddress(val).valid;
}

function stellarAddressMessage(val: string) {
  return validateStellarAddress(val).error ?? "Invalid Stellar address";
}

export const BeneficiarySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  address: z
    .string()
    .min(1, "Address is required")
    .refine(stellarAddressRefine, stellarAddressMessage),
  memo: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateBeneficiarySchema = BeneficiarySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateBeneficiarySchema = CreateBeneficiarySchema.partial();

export type Beneficiary = z.infer<typeof BeneficiarySchema>;
export type CreateBeneficiaryDto = z.infer<typeof CreateBeneficiarySchema>;
export type UpdateBeneficiaryDto = z.infer<typeof UpdateBeneficiarySchema>;

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function getBeneficiaries(): Promise<Beneficiary[]> {
  if (!BENEFICIARIES_ENABLED) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await apiClient<any>("/beneficiaries");
  const list: unknown[] = Array.isArray(json)
    ? json
    : (json.data ?? json.beneficiaries ?? []);

  return list
    .map((item) => {
      const parsed = BeneficiarySchema.safeParse(item);
      return parsed.success ? parsed.data : null;
    })
    .filter((b): b is Beneficiary => b !== null);
}

export async function createBeneficiary(
  data: CreateBeneficiaryDto,
): Promise<Beneficiary> {
  // Validate before sending — throws ZodError on invalid input.
  CreateBeneficiarySchema.parse(data);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await apiClient<any>("/beneficiaries", {
    method: "POST",
    body: JSON.stringify(data),
  });

  const dto = (json.data ?? json) as Record<string, unknown>;
  return BeneficiarySchema.parse(dto);
}

export async function updateBeneficiary(
  id: string,
  data: UpdateBeneficiaryDto,
): Promise<Beneficiary> {
  UpdateBeneficiarySchema.parse(data);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await apiClient<any>(`/beneficiaries/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  const dto = (json.data ?? json) as Record<string, unknown>;
  return BeneficiarySchema.parse(dto);
}

export async function deleteBeneficiary(id: string): Promise<void> {
  await apiClient(`/beneficiaries/${id}`, { method: "DELETE" });
}
