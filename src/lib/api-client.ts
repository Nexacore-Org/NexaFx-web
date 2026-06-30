export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiClient<T>(path: string, options: { useProxy?: boolean } = {}): Promise<T> {
  const { useProxy = false } = options;
  const baseUrl = useProxy ? '/api/proxy' : '';
  const response = await fetch(`${baseUrl}${path}`);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data?.message || 'Request failed', response.status);
  }

  return response.json() as Promise<T>;
}
