import { getAccessToken, refreshAccessToken } from "./auth";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Skip attaching the Authorization header (used by auth endpoints). */
  skipAuth?: boolean;
  /** Skip the automatic refresh-and-retry on 401. */
  skipRefresh?: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function buildUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${BASE_URL}${path}`;
}

function isJsonContentType(contentType: string | null): boolean {
  if (!contentType) return false;
  return /\bapplication\/(?:[\w.+-]+\+)?json\b/i.test(contentType);
}

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204 || res.status === 205) return undefined;

  const text = await res.text();
  if (text.length === 0) return undefined;

  if (!isJsonContentType(res.headers.get("content-type"))) {
    throw new ApiError("Unexpected non-JSON response", res.status, text);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError("Failed to parse JSON response", res.status, text);
  }
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, skipAuth, skipRefresh, headers, ...rest } = options;

  const requestHeaders = new Headers(headers);
  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(buildUrl(path), {
    ...rest,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 401 && !skipRefresh && !skipAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, skipRefresh: true });
    }
  }

  if (!res.ok) {
    let errorBody: unknown;
    try {
      errorBody = await parseBody(res);
    } catch {
      errorBody = undefined;
    }
    const message =
      (errorBody as { message?: string } | undefined)?.message ??
      `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, errorBody);
  }

  return (await parseBody(res)) as T;
}
