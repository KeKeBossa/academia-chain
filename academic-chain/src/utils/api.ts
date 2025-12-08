/**
 * Generic fetch utilities
 * Unified fetcher wrapper with error handling and type safety
 */

import { API_CONFIG } from '../config/api';

export interface FetcherOptions {
  params?: Record<string, string | number | boolean>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

/**
 * Generic fetch wrapper with error handling
 */
export async function apiFetch<T>(
  endpoint: string,
  options: FetcherOptions = {}
): Promise<T | null> {
  try {
    const url = new URL(endpoint, API_CONFIG.BASE_URL);

    // Add query parameters
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url.toString(), fetchOptions);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Fetch error for ${endpoint}:`, error);
    return null;
  }
}

/**
 * Create endpoint-specific fetcher
 */
export function createEndpointFetcher<T>(endpoint: string) {
  return (options?: FetcherOptions) => apiFetch<T>(endpoint, options);
}
