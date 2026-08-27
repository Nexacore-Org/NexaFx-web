export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}
