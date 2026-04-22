import axios from 'axios';
import { API_URL } from './apiConfig';

export const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { error?: string; message?: string }
      | undefined;

    if (responseData?.error) {
      return responseData.error;
    }

    if (responseData?.message) {
      return responseData.message;
    }

    if (error.request && !error.response) {
      return `Cannot reach server at ${API_URL}. Start the backend and use the same LAN/Wi-Fi for Expo Go.`;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};
