/**
 * Utility to extract error message from axios error responses
 * Handles both string and array message formats from backend
 */

type ApiError = {
  response?: {
    data?: {
      message?: string | string[];
      error?: string;
    };
  };
  message?: string;
};

/**
 * Extract error message from API error response
 * @param error - The error object from catch block
 * @param fallbackMessage - Default message if no specific error found
 * @returns Formatted error message
 */
export function getErrorMessage(error: unknown, fallbackMessage = 'Có lỗi xảy ra'): string {
  const err = error as ApiError;
  const responseData = err?.response?.data;

  // Priority 1: Check response data message (array or string)
  if (responseData?.message) {
    const message = Array.isArray(responseData.message)
      ? responseData.message[0]
      : responseData.message;
    if (message) return message;
  }

  // Priority 2: Check response data error field
  if (responseData?.error) {
    return responseData.error;
  }

  // Priority 3: Check error message property
  if (err?.message) {
    return err.message;
  }

  // Fallback to provided default message
  return fallbackMessage;
}
