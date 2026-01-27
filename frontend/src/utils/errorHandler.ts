/**
 * Extract error message from various error formats
 * Prioritizes backend error messages from API responses
 */
export const getErrorMessage = (error: any, fallbackMessage = 'An error occurred'): string => {
  // Backend error message (Axios format)
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Direct error message
  if (error?.message) {
    return error.message;
  }
  
  // Error string
  if (typeof error === 'string') {
    return error;
  }
  
  return fallbackMessage;
};
