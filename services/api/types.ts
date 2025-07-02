/**
 * API Response types
 */
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    status?: number;
  };
  status: number;
}

/**
 * User related types
 */
