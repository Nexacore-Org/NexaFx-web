import { apiClient } from "@/lib/api-client";

export type KycDocumentType =
  | "id_front"
  | "id_back"
  | "selfie"
  | "proof_of_address";

export type KycIdType =
  | "national_id"
  | "passport"
  | "drivers_license"
  | "voters_card";

export interface KycStatus {
  status: "Not Started" | "Pending" | "Under Review" | "Verified" | "Rejected";
  rejectionReason?: string;
  submittedAt?: string;
  verifiedAt?: string;
}

export const getKycStatus = async (): Promise<KycStatus> => {
  const response = await apiClient.get("/kyc/status");
  return response.data;
};

export const initiateKyc = async (): Promise<{ submissionId: string }> => {
  const response = await apiClient.post("/kyc/initiate");
  return response.data;
};

export const uploadKycDocument = async (
  submissionId: string,
  type: KycDocumentType,
  file: File,
): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  formData.append("submissionId", submissionId);

  await apiClient.post("/kyc/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const submitKyc = async (submissionId: string): Promise<void> => {
  await apiClient.post("/kyc/submit", { submissionId });
};
