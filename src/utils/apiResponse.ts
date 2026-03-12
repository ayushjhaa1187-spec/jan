export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  statusCode: number;
}

export const success = <T>(data: T, message?: string): ApiSuccess<T> => ({
  success: true,
  data,
  ...(message ? { message } : {}),
});

export const error = (message: string, statusCode: number): ApiError => ({
  success: false,
  error: message,
  statusCode,
});
