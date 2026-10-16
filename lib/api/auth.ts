import { apiRequest, ApiError } from "../api-client";

/**
 * NOTE: the backend change-password contract is NOT confirmed. The app has
 * no reachable backend yet, so the request/response shapes below are
 * documented assumptions isolated in this module. The field names are the
 * ones the existing auth forms already use (`currentPassword`,
 * `newPassword`), which keeps the DTO consistent with the rest of the app.
 */

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResult {
  /**
   * Whether the backend revoked other sessions as part of the rotation.
   * When absent we assume nothing was revoked and do not claim otherwise.
   */
  otherSessionsRevoked?: boolean;
}

export class WrongPasswordError extends Error {
  constructor() {
    super("Current password is incorrect");
    this.name = "WrongPasswordError";
  }
}

/**
 * Map an ApiError onto a specific failure the form can explain to the user.
 * A 401 from this endpoint means the current password was wrong; anything
 * else is a generic failure and must not be mislabelled as a bad password.
 */
function mapChangePasswordError(err: unknown): never {
  if (err instanceof ApiError && err.status === 401) {
    throw new WrongPasswordError();
  }
  throw err;
}

export async function changePassword(
  input: ChangePasswordInput,
): Promise<ChangePasswordResult> {
  try {
    const data = await apiRequest<Partial<ChangePasswordResult>>(
      "/api/auth/change-password",
      {
        method: "POST",
        body: {
          currentPassword: input.currentPassword,
          newPassword: input.newPassword,
        },
      },
    );

    return {
      otherSessionsRevoked:
        typeof data.otherSessionsRevoked === "boolean"
          ? data.otherSessionsRevoked
          : undefined,
    };
  } catch (err) {
    mapChangePasswordError(err);
  }
}
