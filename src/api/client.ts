import { EchoApiRequest } from './types';

// Retrieve base URL from environment variable with safe production fallback
const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ||
  'https://bnbpmiljw9.execute-api.ap-south-1.amazonaws.com';

export class EchoApiError extends Error {
  public status?: number;
  public data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'EchoApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Dispatches a POST request to the AWS Lambda / API Gateway endpoint.
 */
export async function sendEchoRequest<T>(
  payload: EchoApiRequest,
  options: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<T> {
  const { timeoutMs = 12000, signal: externalSignal } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Link external abort signal if provided
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    let responseData: any = null;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = { message: text };
      }
    }

    if (!response.ok) {
      const errorMsg =
        responseData?.error ||
        responseData?.message ||
        `Backend request failed with status ${response.status}`;
      throw new EchoApiError(errorMsg, response.status, responseData);
    }

    // Check if body returned an application-level error
    if (responseData && typeof responseData === 'object' && responseData.error) {
      throw new EchoApiError(responseData.error, response.status, responseData);
    }

    return responseData as T;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error instanceof EchoApiError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new EchoApiError(
        'Request timed out. Please check your internet connection and try again.',
        408
      );
    }

    throw new EchoApiError(
      error.message || 'Network error occurred while contacting the server.',
      0
    );
  }
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
