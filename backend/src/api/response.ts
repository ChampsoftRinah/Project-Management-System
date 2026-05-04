export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    cursor?: string;
    has_more: boolean;
  };
  timestamp: string;
}

export function successResponse<T>(data: T, pagination?: any): ApiResponse<T> {
  return {
    data,
    pagination,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(code: string, message: string, details?: any): ApiResponse<null> {
  return {
    error: { code, message, details },
    timestamp: new Date().toISOString(),
  };
}
